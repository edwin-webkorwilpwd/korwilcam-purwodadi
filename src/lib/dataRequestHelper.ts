import { DataRequestLink } from '../types';

/**
 * Helper untuk pembuatan slug dan URL detail Permintaan Data (Webview)
 */

export const generateDataRequestSlug = (title: string): string => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getDataRequestSlug = (item: { title: string; slug?: string; id?: string }): string => {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim().toLowerCase();
  }
  return generateDataRequestSlug(item.title) || item.id || 'permintaan-data';
};

export const getDataRequestPath = (item: { title: string; slug?: string; id?: string }): string => {
  const slug = getDataRequestSlug(item);
  return `/layanan/permintaan-data/${encodeURIComponent(slug)}`;
};

export const getDataRequestShareUrl = (item: { title: string; slug?: string; id?: string }): string => {
  const path = getDataRequestPath(item);
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
};
