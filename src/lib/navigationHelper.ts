import { getSupabaseClient } from './supabase';
import { MenuVisibilityMap } from '../config/navigationConfig';

const LOCAL_STORAGE_KEY = 'korwilcam_menu_visibility';

/**
 * Mengambil status visibilitas menu dari LocalStorage
 */
export const getLocalNavigationVisibility = (): MenuVisibilityMap => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca visibilitas menu dari LocalStorage:', err);
  }
  return {};
};

/**
 * Menyimpan status visibilitas menu ke LocalStorage
 */
export const setLocalNavigationVisibility = (visibility: MenuVisibilityMap): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visibility));
  } catch (err) {
    console.warn('Gagal menyimpan visibilitas menu ke LocalStorage:', err);
  }
};

/**
 * Mengambil status visibilitas menu dari Supabase Cloud (tabel: navigation_settings)
 */
export const fetchNavigationVisibilityFromSupabase = async (): Promise<MenuVisibilityMap> => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalNavigationVisibility();
    }

    const { data, error } = await client
      .from('navigation_settings')
      .select('items')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      // Jika tabel belum dibuat, jangan crash, cukup fallback ke LocalStorage
      console.warn('Catatan tabel navigation_settings Supabase:', error.message);
      return getLocalNavigationVisibility();
    }

    if (data && typeof data.items === 'object' && data.items !== null) {
      setLocalNavigationVisibility(data.items);
      return data.items;
    }
  } catch (err) {
    console.warn('Error saat fetchNavigationVisibilityFromSupabase:', err);
  }
  return getLocalNavigationVisibility();
};

/**
 * Menyimpan status visibilitas menu ke Supabase Cloud dan LocalStorage
 */
export const saveNavigationVisibilityToSupabase = async (
  visibility: MenuVisibilityMap
): Promise<boolean> => {
  // Simpan ke local storage terlebih dahulu agar langsung instan
  setLocalNavigationVisibility(visibility);

  try {
    const client = getSupabaseClient();
    if (!client) return true;

    const { error } = await client.from('navigation_settings').upsert({
      id: 'default',
      items: visibility,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Gagal upsert navigation_settings ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Gagal menyimpan navigation_settings ke Supabase:', err);
    return false;
  }
};
