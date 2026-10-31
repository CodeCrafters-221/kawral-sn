import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { isUUID } from '../../utils/uuid';

/**
 * Centralized storage service for the Kawral buckets:
 *  - listing-images  (10 MB, jpeg/jpg/png/webp)
 *  - avatars         (5 MB,  jpeg/jpg/png/webp)
 *  - agency-assets   (10 MB, jpeg/jpg/png/webp)
 *  - listing-audios  (10 MB, webm/mp4/m4a/mp3/ogg/wav)
 *
 * File paths use {userId}/{filename} so owner-based RLS policies
 * can match on storage.foldername(name)[1].
 */

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_AUDIO_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_IMAGE_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);

/**
 * Compresse et redimensionne une image côté client (via HTMLCanvasElement)
 * avant son envoi vers Supabase Storage afin d'éviter les fichiers de plusieurs Mo.
 */
async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82
): Promise<File> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file;
  }
  // Si l'image est déjà très légère (< 120 Ko) et au format WebP/JPEG, on évite une recompression inutile
  if (file.size < 120 * 1024 && (file.type === 'image/webp' || file.type === 'image/jpeg')) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(file);
          return;
        }

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = 'image/webp';
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              resolve(file);
              return;
            }
            const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
            const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
            const compressedFile = new File([blob], `${baseName}.${ext}`, {
              type: blob.type || targetMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          targetMime,
          quality
        );
      } catch {
        resolve(file);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Valide un fichier image (taille, MIME type et extension) et retourne
 * l'extension et le contentType sûrs (bloque SVG, HTML et scripts).
 */
function validateImageFile(
  file: File,
  maxBytes: number
): { ext: string; contentType: string } | null {
  if (!file || file.size <= 0 || file.size > maxBytes) {
    console.warn('validateImageFile: invalid file size', file?.size);
    return null;
  }

  const mime = (file.type || '').toLowerCase().trim();
  const rawExt = (file.name.split('.').pop() || '').toLowerCase().trim();

  if (mime && ALLOWED_IMAGE_MIME_TO_EXT[mime]) {
    return {
      ext: ALLOWED_IMAGE_MIME_TO_EXT[mime],
      contentType: mime === 'image/jpg' ? 'image/jpeg' : mime,
    };
  }

  if (!mime && ALLOWED_IMAGE_EXTENSIONS.has(rawExt)) {
    const normalizedExt = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const contentType =
      normalizedExt === 'png'
        ? 'image/png'
        : normalizedExt === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
    return { ext: normalizedExt, contentType };
  }

  console.warn('validateImageFile: rejected MIME/extension', { mime, rawExt });
  return null;
}

/**
 * Valide un fichier audio (taille, MIME type et extension).
 */
function validateAudioFile(
  audioFile: Blob | File
): { ext: string; contentType: string } | null {
  if (!audioFile || audioFile.size <= 0 || audioFile.size > MAX_AUDIO_SIZE_BYTES) {
    console.warn('validateAudioFile: invalid audio size', audioFile?.size);
    return null;
  }

  const mime = (audioFile.type || '').toLowerCase().trim();
  if (mime.includes('mp4') || mime.includes('m4a')) {
    return { ext: 'm4a', contentType: 'audio/mp4' };
  }
  if (mime.includes('mpeg') || mime.includes('mp3')) {
    return { ext: 'mp3', contentType: 'audio/mpeg' };
  }
  if (mime.includes('wav')) {
    return { ext: 'wav', contentType: 'audio/wav' };
  }
  if (mime.includes('ogg')) {
    return { ext: 'ogg', contentType: 'audio/ogg' };
  }
  if (mime.includes('webm') || !mime) {
    return { ext: 'webm', contentType: 'audio/webm' };
  }

  console.warn('validateAudioFile: rejected audio MIME', mime);
  return null;
}

// ─── Listing Images ────────────────────────────────────────────────────────────

/**
 * Upload an image for a listing.
 * @param userId    - owner of the listing (used as folder prefix)
 * @param listingId - listing ID (used as sub-folder)
 * @param file      - File object to upload
 * @returns public URL or null on failure
 */
export async function uploadListingImage(
  userId: string,
  listingId: string,
  file: File
): Promise<string | null> {
  if (
    !isSupabaseConfigured() ||
    !isUUID(userId) ||
    !isUUID(listingId) ||
    !file
  ) {
    return null;
  }

  const optimizedFile = await compressImageFile(file, 1280, 0.82);
  const validated = validateImageFile(optimizedFile, MAX_IMAGE_SIZE_BYTES);
  if (!validated) return null;

  try {
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${validated.ext}`;
    const filePath = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, optimizedFile, {
        upsert: false,
        cacheControl: '31536000',
        contentType: validated.contentType,
      });

    if (error) {
      console.warn('uploadListingImage error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('listing-images').getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error('uploadListingImage exception:', err);
    return null;
  }
}

/**
 * Delete all images for a listing from storage.
 * @param userId    - owner folder prefix
 * @param listingId - listing sub-folder
 */
export async function deleteListingImages(
  userId: string,
  listingId: string
): Promise<void> {
  if (!isSupabaseConfigured() || !isUUID(userId) || !isUUID(listingId)) return;

  try {
    const { data: files, error: listError } = await supabase.storage
      .from('listing-images')
      .list(`${userId}/${listingId}`);

    if (listError || !files?.length) return;

    const paths = files.map((f) => `${userId}/${listingId}/${f.name}`);
    const { error } = await supabase.storage.from('listing-images').remove(paths);
    if (error) console.warn('deleteListingImages error:', error.message);
  } catch (err) {
    console.error('deleteListingImages exception:', err);
  }
}

// ─── Avatars ───────────────────────────────────────────────────────────────────

/**
 * Upload a user avatar.
 * @param userId - owner ID (used as folder prefix)
 * @param file   - File object to upload
 * @returns public URL or null on failure
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured() || !isUUID(userId) || !file) return null;

  const optimizedFile = await compressImageFile(file, 512, 0.82);
  const validated = validateImageFile(optimizedFile, MAX_AVATAR_SIZE_BYTES);
  if (!validated) return null;

  try {
    const fileName = `${userId}-${Date.now()}.${validated.ext}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, optimizedFile, {
        upsert: true,
        cacheControl: '31536000',
        contentType: validated.contentType,
      });

    if (error) {
      console.warn('uploadAvatar error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error('uploadAvatar exception:', err);
    return null;
  }
}

// ─── Agency Assets ─────────────────────────────────────────────────────────────

/**
 * Upload an agency asset (logo, banner, etc.).
 * @param userId   - agency owner ID (folder prefix)
 * @param agencyId - agency ID (sub-folder)
 * @param file     - File object to upload
 * @param type     - 'logo' | 'banner' | 'other'
 * @returns public URL or null on failure
 */
export async function uploadAgencyAsset(
  userId: string,
  agencyId: string,
  file: File,
  type: 'logo' | 'banner' | 'other' = 'other'
): Promise<string | null> {
  if (
    !isSupabaseConfigured() ||
    !isUUID(userId) ||
    !isUUID(agencyId) ||
    !file
  ) {
    return null;
  }

  const optimizedFile = await compressImageFile(file, 1280, 0.82);
  const validated = validateImageFile(optimizedFile, MAX_IMAGE_SIZE_BYTES);
  if (!validated) return null;

  const safeType =
    type === 'logo' || type === 'banner' ? type : 'other';

  try {
    const fileName = `${safeType}-${Date.now()}.${validated.ext}`;
    const filePath = `${userId}/${agencyId}/${fileName}`;

    const { error } = await supabase.storage
      .from('agency-assets')
      .upload(filePath, optimizedFile, {
        upsert: true,
        cacheControl: '31536000',
        contentType: validated.contentType,
      });

    if (error) {
      console.warn('uploadAgencyAsset error:', error.message);
      return null;
    }

    const { data } = supabase.storage.from('agency-assets').getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error('uploadAgencyAsset exception:', err);
    return null;
  }
}

// ─── Listing Audios ────────────────────────────────────────────────────────────

/**
 * Upload an audio description for a listing.
 * @param userId    - owner of the listing
 * @param listingId - listing ID
 * @param audioFile - Blob or File object
 * @returns public URL or null on failure
 */
export async function uploadListingAudio(
  userId: string,
  listingId: string,
  audioFile: Blob | File
): Promise<string | null> {
  if (
    !isSupabaseConfigured() ||
    !isUUID(userId) ||
    !isUUID(listingId) ||
    !audioFile
  ) {
    return null;
  }

  const validated = validateAudioFile(audioFile);
  if (!validated) return null;

  try {
    const fileName = `voice-desc-${Date.now()}.${validated.ext}`;
    const filePath = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
      .from('listing-audios')
      .upload(filePath, audioFile, {
        upsert: true,
        cacheControl: '3600',
        contentType: validated.contentType,
      });

    if (error) {
      console.warn('uploadListingAudio error in listing-audios, attempting fallback:', error.message);
      const fallbackPath = `audios/${userId}/${listingId}/${fileName}`;
      const { error: fallbackError } = await supabase.storage
        .from('listing-images')
        .upload(fallbackPath, audioFile, {
          upsert: true,
          cacheControl: '3600',
          contentType: validated.contentType,
        });
      if (!fallbackError) {
        const { data: fallbackData } = supabase.storage
          .from('listing-images')
          .getPublicUrl(fallbackPath);
        return fallbackData?.publicUrl ?? null;
      }
      return null;
    }

    const { data } = supabase.storage.from('listing-audios').getPublicUrl(filePath);
    return data?.publicUrl ?? null;
  } catch (err) {
    console.error('uploadListingAudio exception:', err);
    return null;
  }
}

/**
 * Delete audio description for a listing from storage.
 */
export async function deleteListingAudio(
  userId: string,
  listingId: string
): Promise<void> {
  if (!isSupabaseConfigured() || !isUUID(userId) || !isUUID(listingId)) return;

  try {
    const { data: files, error: listError } = await supabase.storage
      .from('listing-audios')
      .list(`${userId}/${listingId}`);

    if (listError || !files?.length) return;

    const paths = files.map((f) => `${userId}/${listingId}/${f.name}`);
    const { error } = await supabase.storage.from('listing-audios').remove(paths);
    if (error) console.warn('deleteListingAudio error:', error.message);
  } catch (err) {
    console.error('deleteListingAudio exception:', err);
  }
}

/**
 * Returns the public URL for a file without making an API request.
 */
export function getPublicUrl(
  bucket: 'listing-images' | 'avatars' | 'agency-assets' | 'listing-audios',
  filePath: string
): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl ?? '';
}
