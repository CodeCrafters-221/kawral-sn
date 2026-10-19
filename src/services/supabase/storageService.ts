import { supabase, isSupabaseConfigured } from '../../lib/supabase';

/**
 * Centralized storage service for the 3 Kawral buckets:
 *  - listing-images  (10 MB, jpeg/jpg/png/webp/gif)
 *  - avatars         (5 MB,  jpeg/jpg/png/webp)
 *  - agency-assets   (10 MB, jpeg/jpg/png/webp/gif)
 *
 * File paths use {userId}/{filename} so owner-based RLS policies
 * can match on storage.foldername(name)[1].
 */

// ─── Listing Images ────────────────────────────────────────────────────────────

/**
 * Upload an image for a listing.
 * @param userId   - owner of the listing (used as folder prefix)
 * @param listingId - listing ID (used as sub-folder)
 * @param file     - File object to upload
 * @returns public URL or null on failure
 */
export async function uploadListingImage(
  userId: string,
  listingId: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured() || !userId || !listingId || !file) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file, { upsert: false, cacheControl: '3600' });

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
  if (!isSupabaseConfigured()) return;

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
  if (!isSupabaseConfigured() || !userId || !file) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

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
  if (!isSupabaseConfigured() || !userId || !agencyId || !file) return null;

  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${agencyId}/${fileName}`;

    const { error } = await supabase.storage
      .from('agency-assets')
      .upload(filePath, file, { upsert: true, cacheControl: '3600' });

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
 * @param userId - owner of the listing
 * @param listingId - listing ID
 * @param audioFile - Blob or File object
 * @returns public URL or null on failure
 */
export async function uploadListingAudio(
  userId: string,
  listingId: string,
  audioFile: Blob | File
): Promise<string | null> {
  if (!isSupabaseConfigured() || !userId || !listingId || !audioFile) return null;

  try {
    let fileExt = 'webm';
    if (audioFile instanceof File) {
      fileExt = audioFile.name.split('.').pop() || 'webm';
    } else if (audioFile.type) {
      if (audioFile.type.includes('mp4') || audioFile.type.includes('m4a')) fileExt = 'm4a';
      else if (audioFile.type.includes('mpeg') || audioFile.type.includes('mp3')) fileExt = 'mp3';
      else if (audioFile.type.includes('wav')) fileExt = 'wav';
      else if (audioFile.type.includes('ogg')) fileExt = 'ogg';
    }

    const fileName = `voice-desc-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
      .from('listing-audios')
      .upload(filePath, audioFile, {
        upsert: true,
        cacheControl: '3600',
        contentType: audioFile.type || 'audio/webm',
      });

    if (error) {
      console.warn('uploadListingAudio error in listing-audios, attempting fallback:', error.message);
      // Fallback: try uploading to listing-images bucket which is always available
      const fallbackPath = `audios/${userId}/${listingId}/${fileName}`;
      const { error: fallbackError } = await supabase.storage
        .from('listing-images')
        .upload(fallbackPath, audioFile, {
          upsert: true,
          cacheControl: '3600',
          contentType: audioFile.type || 'audio/webm',
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
  if (!isSupabaseConfigured()) return;

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
  return data.publicUrl;
}

