import React, { useState, useEffect } from 'react';
import { isGoogleDriveUrl, getGoogleDriveCandidates } from '../lib/driveHelper';

// Module-level in-memory cache to track images that have successfully loaded during the session.
// This guarantees instant 0ms rendering with NO skeleton flicker on subsequent renders or tab switches!
const sessionLoadedImages = new Set<string>();

export interface FastImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  size?: number; // Target dimension in px (e.g., 180 for logo, 320 for officials, 600 for leader, 1200 for modal)
  fallbackIcon?: React.ReactNode;
  containerClassName?: string;
  imageClassName?: string;
  priority?: boolean;
  onLoaded?: () => void;
}

export const FastImage: React.FC<FastImageProps> = ({
  src,
  alt,
  size,
  fallbackIcon,
  containerClassName = '',
  imageClassName = '',
  priority = false,
  onLoaded,
  onClick,
  ...props
}) => {
  const trimmed = (src || '').trim();
  const isDrive = isGoogleDriveUrl(trimmed);
  const candidates = isDrive ? getGoogleDriveCandidates(trimmed, size) : [trimmed];

  const primaryCandidate = candidates[0] || '';
  const isAlreadyLoaded = Boolean(primaryCandidate && sessionLoadedImages.has(primaryCandidate));

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [loaded, setLoaded] = useState(isAlreadyLoaded);
  const [failed, setFailed] = useState(!trimmed);

  useEffect(() => {
    setCandidateIndex(0);
    const candidate = candidates[0] || '';
    if (candidate && sessionLoadedImages.has(candidate)) {
      setLoaded(true);
      setFailed(false);
    } else {
      setLoaded(false);
      setFailed(!trimmed);
    }
  }, [trimmed, size]);

  const currentSrc = candidates[candidateIndex] || '';

  const handleLoad = () => {
    if (currentSrc) sessionLoadedImages.add(currentSrc);
    if (primaryCandidate) sessionLoadedImages.add(primaryCandidate);
    setLoaded(true);
    setFailed(false);
    if (onLoaded) onLoaded();
  };

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setFailed(true);
      setLoaded(true);
    }
  };

  if (failed || !trimmed) {
    return (
      <div 
        className={`w-full h-full flex items-center justify-center ${containerClassName}`} 
        onClick={onClick}
      >
        {fallbackIcon || <div className="w-full h-full bg-slate-100" />}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`} onClick={onClick}>
      {/* Subtle Shimmer Skeleton while loading for the first time */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 animate-pulse z-0" />
      )}

      {/* Actual Sized CDN Image */}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-250 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imageClassName}`}
      />
    </div>
  );
};
