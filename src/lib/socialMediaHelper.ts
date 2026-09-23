import { SocialMediaItem } from '../types';
import { initialSocialMedia } from '../data/initialData';
import { getSupabaseClient } from './supabase';

const STORAGE_KEY = 'korwilcam_social_media';

/**
 * Memastikan list medsos memiliki seluruh platform dasar (Instagram, YouTube, TikTok, Facebook, X)
 */
export const normalizeSocialMediaList = (items?: SocialMediaItem[] | null): SocialMediaItem[] => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return initialSocialMedia;
  }

  const existingMap = new Map<string, SocialMediaItem>();
  items.forEach((item) => {
    if (item && item.platform) {
      existingMap.set(item.platform, item);
    }
  });

  // Gabungkan dengan template bawaan agar tidak ada platform yang hilang dari formulir CMS
  return initialSocialMedia.map((defaultItem) => {
    const existing = existingMap.get(defaultItem.platform);
    if (existing) {
      return {
        ...defaultItem,
        ...existing,
        // Pastikan url tidak undefined/null
        url: existing.url !== undefined && existing.url !== null ? existing.url : defaultItem.url,
        isActive: existing.isActive !== undefined ? existing.isActive : true
      };
    }
    return defaultItem;
  });
};

/**
 * Mengambil data media sosial dari LocalStorage secara instan
 */
export const getLocalSocialMedia = (): SocialMediaItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeSocialMediaList(parsed);
      }
    }
  } catch (err) {
    console.warn('Gagal membaca media sosial dari localStorage:', err);
  }
  return initialSocialMedia;
};

/**
 * Menyimpan data media sosial ke LocalStorage
 */
export const setLocalSocialMedia = (items: SocialMediaItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Gagal menyimpan media sosial ke localStorage:', err);
  }
};

/**
 * Mengambil data media sosial dari Supabase Cloud (tabel: social_media_settings)
 */
export const fetchSocialMediaFromSupabase = async (): Promise<SocialMediaItem[]> => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalSocialMedia();
    }

    const { data, error } = await client
      .from('social_media_settings')
      .select('items')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      console.warn('Gagal query social_media_settings dari Supabase:', error.message);
      return getLocalSocialMedia();
    }

    if (data && Array.isArray(data.items) && data.items.length > 0) {
      const normalized = normalizeSocialMediaList(data.items);
      setLocalSocialMedia(normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('Error saat fetchSocialMediaFromSupabase:', err);
  }
  return getLocalSocialMedia();
};

/**
 * Menyimpan data media sosial ke Supabase Cloud dan LocalStorage
 */
export const saveSocialMediaToSupabase = async (items: SocialMediaItem[]): Promise<boolean> => {
  const normalized = normalizeSocialMediaList(items);
  setLocalSocialMedia(normalized);

  try {
    const client = getSupabaseClient();
    if (!client) return true;

    const { error } = await client.from('social_media_settings').upsert({
      id: 'default',
      items: normalized,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.warn('Gagal upsert social_media_settings ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error saat saveSocialMediaToSupabase:', err);
    return false;
  }
};
