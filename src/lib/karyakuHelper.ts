/**
 * Helper utilitas untuk pembuatan slug, parsing rute, dan sinkronisasi URL menu "Karyaku"
 * Format URL:
 * - Katalog/Beranda: /karyaku
 * - Profil Penulis: /karyaku/:username
 * - Baca Buku (Reader): /karyaku/:username/:judulBuku
 */

export const generateKaryakuSlug = (text: string): string => {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const formatKaryakuTitle = (slug: string): string => {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export interface KaryakuRouteInfo {
  isKaryaku: boolean;
  view: 'catalog' | 'author' | 'reader';
  username?: string;
  bookTitleSlug?: string;
  readableTitle?: string;
}

export const parseKaryakuPath = (pathname: string): KaryakuRouteInfo => {
  const cleanPath = (pathname || '').split('?')[0].split('#')[0];
  const parts = cleanPath.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0].toLowerCase() !== 'karyaku') {
    return {
      isKaryaku: false,
      view: 'catalog'
    };
  }

  // 1. /karyaku
  if (parts.length === 1) {
    return {
      isKaryaku: true,
      view: 'catalog'
    };
  }

  // 2. /karyaku/:username
  const username = decodeURIComponent(parts[1]);
  if (parts.length === 2) {
    return {
      isKaryaku: true,
      view: 'author',
      username,
      readableTitle: `Karyaku - Penulis: ${username}`
    };
  }

  // 3. /karyaku/:username/:judulBuku
  const bookTitleSlug = decodeURIComponent(parts.slice(2).join('-'));
  const readableTitle = formatKaryakuTitle(bookTitleSlug);

  return {
    isKaryaku: true,
    view: 'reader',
    username,
    bookTitleSlug,
    readableTitle: `${readableTitle || 'Baca Buku'}`
  };
};

export const getKaryakuPath = (username?: string, bookTitle?: string): string => {
  if (username && bookTitle) {
    const uSlug = generateKaryakuSlug(username);
    const bSlug = generateKaryakuSlug(bookTitle);
    return `/karyaku/${encodeURIComponent(uSlug)}/${encodeURIComponent(bSlug)}`;
  }
  if (username) {
    const uSlug = generateKaryakuSlug(username);
    return `/karyaku/${encodeURIComponent(uSlug)}`;
  }
  return '/karyaku';
};
