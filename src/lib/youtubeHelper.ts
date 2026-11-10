/**
 * Helper utilitas untuk mengekstrak ID, membuat thumbnail, dan embed player YouTube
 */

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

export function getYouTubeThumbnail(videoId: string, quality: 'maxres' | 'hq' | 'mq' = 'hq'): string {
  if (!videoId) return '/gallery/cover-7-agustus-2026.jpg';
  // hqdefault.jpg (480x360) selalu dijamin tersedia untuk seluruh video YouTube
  if (quality === 'maxres') {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  if (!videoId) return '';
  const autoParam = autoplay ? '1' : '0';
  const originParam = typeof window !== 'undefined' && window.location.origin 
    ? `&origin=${encodeURIComponent(window.location.origin)}` 
    : '';
  // Gunakan domain resmi youtube-nocookie.com + parameter origin & enablejsapi agar bebas dari Error 153
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${autoParam}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1${originParam}`;
}

export function generateVideoSlug(title: string, id?: string): string {
  const cleanTitle = (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (cleanTitle) return cleanTitle;
  return id ? `video-${id}` : 'video-kegiatan';
}

export function getVideoDetailPath(item: { slug?: string; title: string; id?: string }): string {
  const slug = item.slug || generateVideoSlug(item.title, item.id);
  return `/galeri/video/${encodeURIComponent(slug)}`;
}
