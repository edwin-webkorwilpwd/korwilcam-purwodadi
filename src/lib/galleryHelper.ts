/**
 * Helper untuk pembuatan slug dan URL detail galeri
 */

export const generateGallerySlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getGallerySlug = (item: { title: string; slug?: string }): string => {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim();
  }
  return generateGallerySlug(item.title) || 'galeri';
};

export const getGalleryDetailPath = (item: { title: string; slug?: string; id?: string }): string => {
  const slug = getGallerySlug(item);
  return `/galeri/${encodeURIComponent(slug)}`;
};

/**
 * Mengubah string tanggal Indonesia (contoh: "14 September 2026", "8 September 2026")
 * atau format ISO menjadi numeric timestamp untuk pengurutan akurat.
 */
export const parseGalleryDateToTime = (dateStr?: string, createdAt?: string, id?: string): number => {
  // 1. Prioritaskan createdAt (ISO format dari Supabase Cloud: 2026-09-14T...)
  if (createdAt) {
    const t = new Date(createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  // 2. Parse string tanggal Indonesia (contoh: "14 September 2026" / "8 September 2026")
  if (dateStr) {
    const months: Record<string, number> = {
      januari: 0, februari: 1, maret: 2, april: 3, mei: 4, juni: 5,
      juli: 6, agustus: 7, september: 8, oktober: 9, november: 10, desember: 11
    };
    const parts = dateStr.trim().split(/[\s-]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const monthName = parts[1].toLowerCase();
      const month = months[monthName];
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && month !== undefined && !isNaN(year)) {
        return new Date(year, month, day).getTime();
      }
    }
    const standardParsed = Date.parse(dateStr);
    if (!isNaN(standardParsed) && standardParsed > 0) return standardParsed;
  }

  // 3. Fallback: ambil angka timestamp dari ID (misal: "gal-1789350781225")
  if (id) {
    const match = id.match(/\d{10,}/);
    if (match) {
      const idTime = parseInt(match[0], 10);
      if (!isNaN(idTime) && idTime > 0) return idTime;
    }
  }

  return 0;
};

/**
 * Membandingkan dua album galeri secara descending (foto/album terbaru selalu paling atas)
 */
export const compareGalleryItemsDescending = (a: any, b: any): number => {
  const timeA = parseGalleryDateToTime(a.date, a.createdAt || a.created_at, a.id);
  const timeB = parseGalleryDateToTime(b.date, b.createdAt || b.created_at, b.id);
  if (timeA !== timeB) {
    return timeB - timeA;
  }
  return (b.title || '').localeCompare(a.title || '');
};

/**
 * Mengurutkan array album galeri secara descending (terbaru paling atas, lama paling bawah)
 */
export const sortGalleryDescending = <T extends { date?: string; createdAt?: string; created_at?: string; id?: string; title?: string }>(items: T[]): T[] => {
  return [...items].sort(compareGalleryItemsDescending);
};
