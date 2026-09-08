/**
 * Utility untuk membuat Short Link (tautan ringkas) dan menyelesaikan kandidat ID berita
 */

export const getNewsShortCode = (article: { id?: string; slug?: string } | null | undefined): string => {
  if (!article) return '';
  const id = article.id || '';
  if (id.startsWith('news-')) {
    const raw = id.replace(/^news-/, '');
    const num = Number(raw);
    if (!isNaN(num) && num > 1000000000) {
      // Ubah angka timestamp ke base36 (misal: 1788418392332 -> "mtl64v7w")
      return num.toString(36);
    }
    return raw; // misal: "01", "02"
  }
  return id || article.slug || '';
};

export const getNewsShortUrl = (article: { id?: string; slug?: string; title?: string } | null | undefined): string => {
  if (!article) return '';
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://korwilcampurwodadi-grobogan.vercel.app';

  const shortCode = getNewsShortCode(article);
  return `${origin}/b/${encodeURIComponent(shortCode)}`;
};

export const resolveNewsCandidates = (code: string): string[] => {
  if (!code) return [];
  const decoded = decodeURIComponent(code).trim();
  const list: string[] = [decoded];

  // Coba decode base36 ke timestamp
  try {
    const num = parseInt(decoded, 36);
    if (!isNaN(num) && num > 1000000000) {
      list.push(`news-${num}`);
      list.push(String(num));
    }
  } catch {}

  // Tambahkan variasi dengan/tanpa prefix "news-"
  if (!decoded.startsWith('news-')) {
    list.push(`news-${decoded}`);
    list.push(`news-${decoded.padStart(2, '0')}`);
  } else {
    list.push(decoded.replace(/^news-/, ''));
  }

  return Array.from(new Set(list));
};

export const getAnnouncementShortCode = (announcement: { id?: string; title?: string } | null | undefined): string => {
  if (!announcement) return '';
  const id = announcement.id || '';
  if (id.startsWith('ann-')) {
    return id.replace(/^ann-/, '');
  }
  return id;
};

export const getAnnouncementShortUrl = (announcement: { id?: string; title?: string } | null | undefined): string => {
  if (!announcement) return '';
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://korwilcampurwodadi-grobogan.vercel.app';
  const shortCode = getAnnouncementShortCode(announcement);
  return `${origin}/p/${encodeURIComponent(shortCode)}`;
};

export const resolveAnnouncementCandidates = (code: string): string[] => {
  if (!code) return [];
  const decoded = decodeURIComponent(code).trim();
  const list: string[] = [decoded];
  if (!decoded.startsWith('ann-')) {
    list.push(`ann-${decoded}`);
    list.push(`ann-${decoded.padStart(2, '0')}`);
  } else {
    list.push(decoded.replace(/^ann-/, ''));
  }
  return Array.from(new Set(list));
};
