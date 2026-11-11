import { MenuVisibilityMap } from '../config/navigationConfig';
import { 
  fetchNavigationFromSheet, 
  saveNavigationMenuToSheet,
  NAVIGATION_SPREADSHEET_ID,
  NAVIGATION_SPREADSHEET_URL
} from '../services/navigationSheetService';

export { NAVIGATION_SPREADSHEET_ID, NAVIGATION_SPREADSHEET_URL };

const LOCAL_STORAGE_KEY = 'korwilcam_menu_visibility';

export const DEFAULT_MENU_VISIBILITY: MenuVisibilityMap = {
  'services.data-request': false
};

/**
 * Mengambil status visibilitas menu dari LocalStorage
 */
export const getLocalNavigationVisibility = (): MenuVisibilityMap => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          ...DEFAULT_MENU_VISIBILITY,
          ...parsed
        };
      }
    }
  } catch (err) {
    console.warn('Gagal membaca visibilitas menu dari LocalStorage:', err);
  }
  return { ...DEFAULT_MENU_VISIBILITY };
};

/**
 * Menyimpan status visibilitas menu ke LocalStorage
 */
export const setLocalNavigationVisibility = (visibility: MenuVisibilityMap): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(visibility));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('korwilcam_menu_visibility_changed', { detail: visibility }));
    }
  } catch (err) {
    console.warn('Gagal menyimpan visibilitas menu ke LocalStorage:', err);
  }
};

/**
 * Mengambil status visibilitas menu dari Google Spreadsheet
 */
export const fetchNavigationVisibilityFromSupabase = async (forceRefresh = false): Promise<MenuVisibilityMap> => {
  try {
    const sheetData = await fetchNavigationFromSheet(forceRefresh);
    if (sheetData.menuVisibility) {
      return {
        ...DEFAULT_MENU_VISIBILITY,
        ...sheetData.menuVisibility
      };
    }
  } catch (e) {
    console.warn('Gagal memuat visibilitas menu dari Spreadsheet:', e);
  }
  return getLocalNavigationVisibility();
};

/**
 * Menyimpan status visibilitas menu ke Google Spreadsheet & LocalStorage
 */
export const saveNavigationVisibilityToSupabase = async (
  visibility: MenuVisibilityMap
): Promise<boolean> => {
  const result = await saveNavigationMenuToSheet(visibility);
  return result.success;
};
