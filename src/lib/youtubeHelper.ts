/**
 * Helper utilitas untuk mengekstrak ID, membuat thumbnail, dan embed player
 * Mendukung video dari YouTube maupun Google Drive
 */

export type VideoSourceType = 'youtube' | 'drive';

export interface DetectedVideoInfo {
  type: VideoSourceType;
  id: string;
  embedUrl: string;
  thumbnailUrl: string;
}

export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Format youtu.be/VIDEO_ID
  const matchShort = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (matchShort && matchShort[1]) return matchShort[1];

  // 2. Format youtube.com/watch?v=VIDEO_ID
  const matchWatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (matchWatch && matchWatch[1]) return matchWatch[1];

  // 3. Format youtube.com/embed/VIDEO_ID
  const matchEmbed = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (matchEmbed && matchEmbed[1]) return matchEmbed[1];

  // 4. Format youtube.com/shorts/VIDEO_ID
  const matchShorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (matchShorts && matchShorts[1]) return matchShorts[1];

  // 5. Format youtube.com/live/VIDEO_ID
  const matchLive = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i);
  if (matchLive && matchLive[1]) return matchLive[1];

  // 6. Fallback: string 11 karakter murni jika pengguna hanya memasukkan video ID
  const matchDirectId = trimmed.match(/^([a-zA-Z0-9_-]{11})$/);
  if (matchDirectId && matchDirectId[1]) return matchDirectId[1];

  return null;
}

export function extractGoogleDriveVideoId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('/')) {
    return null;
  }

  // 1. Format /file/d/{id} atau /d/{id}
  const matchFileD = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/i);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // 2. Format googleusercontent.com/d/{id}
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/i);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // 3. Format id={id} atau open?id={id} atau uc?id={id}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // 4. Fallback string panjang Google Drive ID (biasanya 25-45 karakter)
  const matchDirectDriveId = trimmed.match(/^([a-zA-Z0-9_-]{20,})$/);
  if (matchDirectDriveId && matchDirectDriveId[1]) return matchDirectDriveId[1];

  return null;
}

export function getYouTubeThumbnail(videoId: string, quality: 'maxres' | 'hq' | 'mq' = 'hq'): string {
  if (!videoId) return '/gallery/cover-7-agustus-2026.jpg';
  // hqdefault.jpg (480x360) selalu dijamin tersedia untuk seluruh video YouTube
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getGoogleDriveThumbnail(fileId: string): string {
  if (!fileId) return '/gallery/cover-7-agustus-2026.jpg';
  return `https://lh3.googleusercontent.com/d/${fileId}=s640`;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  if (!videoId) return '';
  const autoParam = autoplay ? '1' : '0';
  const originParam = typeof window !== 'undefined' && window.location.origin 
    ? `&origin=${encodeURIComponent(window.location.origin)}` 
    : '';
  // Gunakan domain resmi youtube-nocookie.com + parameter origin & enablejsapi agar bebas dari Error 153, serta fs=1 untuk memastikan tombol fullscreen selalu aktif
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoParam}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&fs=1${originParam}`;
}

export function getGoogleDriveEmbedUrl(fileId: string): string {
  if (!fileId) return '';
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function detectVideoSource(url: string | null | undefined): DetectedVideoInfo | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Cek YouTube terlebih dahulu
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      id: ytId,
      embedUrl: getYouTubeEmbedUrl(ytId),
      thumbnailUrl: getYouTubeThumbnail(ytId)
    };
  }

  // 2. Cek Google Drive
  const driveId = extractGoogleDriveVideoId(trimmed);
  if (driveId) {
    return {
      type: 'drive',
      id: driveId,
      embedUrl: getGoogleDriveEmbedUrl(driveId),
      thumbnailUrl: getGoogleDriveThumbnail(driveId)
    };
  }

  return null;
}

export function getVideoThumbnail(source: VideoSourceType | string, id: string): string {
  if (source === 'drive') {
    return getGoogleDriveThumbnail(id);
  }
  return getYouTubeThumbnail(id);
}

export function getVideoEmbedUrl(source: VideoSourceType | string, id: string, autoplay = true): string {
  if (source === 'drive') {
    return getGoogleDriveEmbedUrl(id);
  }
  return getYouTubeEmbedUrl(id, autoplay);
}

export function generateVideoSlug(title: string, id?: string, schoolName?: string): string {
  const combined = schoolName && schoolName.trim()
    ? `${title} ${schoolName.trim()}`
    : title;

  const cleanSlug = (combined || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (cleanSlug) return cleanSlug;
  return id ? `video-${id}` : 'video-kegiatan';
}

export function getVideoDetailPath(item: { slug?: string; title: string; id?: string; schoolName?: string }): string {
  const slug = item.slug || generateVideoSlug(item.title, item.id, item.schoolName);
  return `/galeri/video/${encodeURIComponent(slug)}`;
}
