/**
 * Optimizes external image URLs (Pexels, Unsplash) by appending
 * CDN resizing and compression query parameters adapted to the target display width.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  width = 600,
  quality = 75
): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith('http')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    // Pexels CDN: raw photos are 2 MB – 6 MB without resize params
    if (host === 'images.pexels.com') {
      parsed.searchParams.set('auto', 'compress');
      parsed.searchParams.set('cs', 'tinysrgb');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('dpr', '1');
      return parsed.toString();
    }

    // Unsplash CDN: adjust width & quality to target container
    if (host === 'images.unsplash.com') {
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', 'crop');
      parsed.searchParams.set('w', String(width));
      parsed.searchParams.set('q', String(quality));
      return parsed.toString();
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}
