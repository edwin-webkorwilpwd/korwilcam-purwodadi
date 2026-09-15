import { ServiceRequirement } from '../types';

/**
 * Helper untuk pembuatan slug dan URL detail Persyaratan Pelayanan
 */

export const generateServiceRequirementSlug = (title: string): string => {
  return (title || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getServiceRequirementSlug = (item: { title: string; slug?: string; id?: string }): string => {
  if (item.slug && item.slug.trim()) {
    return item.slug.trim();
  }
  return generateServiceRequirementSlug(item.title) || item.id || 'layanan';
};

export const getServiceRequirementDetailPath = (item: { title: string; slug?: string; id?: string }): string => {
  const slug = getServiceRequirementSlug(item);
  return `/layanan/persyaratan-pelayanan/${encodeURIComponent(slug)}`;
};
