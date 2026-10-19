import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  fallback?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80';

/**
 * Drop-in replacement for <img> that automatically falls back to a
 * placeholder when the source URL is empty, null, or fails to load.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallback = DEFAULT_FALLBACK,
  alt = '',
  className = '',
  onLoad,
  ...props
}) => {
  const [error, setError] = useState(false);

  // Reset when src changes
  useEffect(() => {
    setError(false);
  }, [src]);

  const resolved = (!src || src.trim() === '' || error) ? fallback : src;

  return (
    <img
      {...props}
      src={resolved}
      alt={alt}
      className={className}
      onLoad={onLoad}
      onError={() => setError(true)}
    />
  );
};
