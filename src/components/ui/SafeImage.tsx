import React, { useState, useEffect, useRef } from 'react';
import { optimizeImageUrl } from '../../utils/imageOptimizer';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallback?: string;
  /** Target width in px for CDN optimization (default: 600 for cards, use 1200 for hero/detail) */
  optimizeWidth?: number;
  /** Target quality (1-100) for CDN optimization (default: 75) */
  optimizeQuality?: number;
}

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=75';

/**
 * Drop-in replacement for <img> that:
 * - Optimizes external CDN URLs (Pexels, Unsplash) to the target width
 * - Displays a smooth shimmer skeleton while the image is downloading
 * - Automatically falls back to a placeholder when the source URL is empty or fails to load
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallback = DEFAULT_FALLBACK,
  alt = '',
  className = '',
  optimizeWidth = 600,
  optimizeQuality = 75,
  onLoad,
  ...props
}) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const rawResolved = !src || src.trim() === '' || error ? fallback : src;
  const resolved = optimizeImageUrl(rawResolved, optimizeWidth, optimizeQuality);

  // Reset states when resolved URL changes, unless already complete in browser cache
  useEffect(() => {
    setError(false);
    const imgEl = imgRef.current;
    if (imgEl && imgEl.complete && imgEl.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [resolved]);

  return (
    <>
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-slate-200/80 animate-pulse pointer-events-none"
        />
      )}
      <img
        {...props}
        ref={imgRef}
        src={resolved}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </>
  );
};
