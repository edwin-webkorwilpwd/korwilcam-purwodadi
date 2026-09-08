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
