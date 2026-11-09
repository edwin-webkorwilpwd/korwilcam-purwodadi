import { Achievement } from '../types';

/**
 * Helper untuk pembuatan kode unik / slug dan URL detail prestasi siswa & guru
 */

/**
 * Menghasilkan slug bersih dari nama penerima dan nama ajang/kompetisi
 */
export const generateAchievementSlug = (recipientName: string, title?: string): string => {
  const parts = [recipientName, title].filter(Boolean).join(' ');
  return parts
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Mendapatkan kode unik / slug dari objek Achievement
 */
export const getAchievementSlug = (item: { id?: string; recipientName?: string; title?: string; slug?: string }): string => {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim();
  }
  const generated = generateAchievementSlug(item.recipientName || '', item.title);
  if (generated) {
    return generated;
  }
  return item.id ? item.id.toLowerCase() : 'prestasi';
};

/**
 * Mendapatkan path internal website untuk kartu prestasi
 * Contoh: /berita/prestasi/sheina-anindita-khairiniswa-mapsi
 */
export const getAchievementDetailPath = (item: { id?: string; recipientName?: string; title?: string; slug?: string }): string => {
  const slug = getAchievementSlug(item);
  return `/berita/prestasi/${encodeURIComponent(slug)}`;
};

/**
 * Mendapatkan URL lengkap yang siap dibagikan ke WhatsApp / media sosial
 */
export const getAchievementShareUrl = (item: { id?: string; recipientName?: string; title?: string; slug?: string }): string => {
  const path = getAchievementDetailPath(item);
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://korwilcampurwodadi.web.id';
  return `${origin}${path}`;
};

/**
 * Pencari prestasi berdasarkan kode unik / slug / id secara toleran dan akurat
 */
export const findAchievementBySlugOrId = (
  code: string | null | undefined, 
  list: Achievement[]
): Achievement | null => {
  if (!code || !list || list.length === 0) return null;

  const rawClean = decodeURIComponent(code).trim().toLowerCase();
  // Hilangkan trailing slash jika ada
  const cleanCode = rawClean.replace(/\/+$/, '');

  // 1. Cek langsung kecocokan ID (case-insensitive)
  let found = list.find((a) => a.id.toLowerCase() === cleanCode);
  if (found) return found;

  // 2. Cek kecocokan getAchievementSlug persis
  found = list.find((a) => getAchievementSlug(a).toLowerCase() === cleanCode);
  if (found) return found;

  // 3. Cek kecocokan hanya dari slug nama penerima
  found = list.find((a) => {
    const nameOnlySlug = (a.recipientName || '')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '');
    return nameOnlySlug === cleanCode;
  });
  if (found) return found;

  // 4. Cek jika kode berakhiran dengan a.id
  found = list.find((a) => cleanCode.endsWith(a.id.toLowerCase()));
  if (found) return found;

  // 5. Cek kecocokan a.slug jika ada
  found = list.find((a) => a.slug && a.slug.toLowerCase() === cleanCode);
  if (found) return found;

  return null;
};
