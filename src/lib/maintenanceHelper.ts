import { 
  fetchNavigationFromSheet, 
  saveMaintenanceToSheet 
} from '../services/navigationSheetService';

export interface MaintenanceConfig {
  isEnabled: boolean;
  title: string;
  message: string;
  subMessage: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  isEnabled: false,
  title: 'Mohon Maaf 🙏',
  message: 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺',
  subMessage: 'Kami akan segera perbaiki kembali secepatnya.',
};

const STORAGE_KEY = 'korwilcam_maintenance_config';

/**
 * Mengambil status mode maintenance dari LocalStorage
 */
export const getLocalMaintenanceConfig = (): MaintenanceConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return {
          isEnabled: Boolean(parsed.isEnabled),
          title: parsed.title || DEFAULT_MAINTENANCE_CONFIG.title,
          message: parsed.message || DEFAULT_MAINTENANCE_CONFIG.message,
          subMessage: parsed.subMessage || DEFAULT_MAINTENANCE_CONFIG.subMessage,
          updatedAt: parsed.updatedAt,
          updatedBy: parsed.updatedBy
        };
      }
    }
  } catch (err) {
    console.warn('Gagal membaca maintenance config dari LocalStorage:', err);
  }
  return DEFAULT_MAINTENANCE_CONFIG;
};

/**
 * Menyimpan status mode maintenance ke LocalStorage
 */
export const setLocalMaintenanceConfig = (config: MaintenanceConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('korwilcam_maintenance_changed', { detail: config }));
    }
  } catch (err) {
    console.warn('Gagal menyimpan maintenance config ke LocalStorage:', err);
  }
};

/**
 * Mengambil status mode maintenance dari Google Spreadsheet
 */
export const fetchMaintenanceFromSupabase = async (forceRefresh = false): Promise<MaintenanceConfig> => {
  try {
    const sheetData = await fetchNavigationFromSheet(forceRefresh);
    if (sheetData.maintenanceConfig) {
      return {
        isEnabled: Boolean(sheetData.maintenanceConfig.isEnabled),
        title: sheetData.maintenanceConfig.title || DEFAULT_MAINTENANCE_CONFIG.title,
        message: sheetData.maintenanceConfig.message || DEFAULT_MAINTENANCE_CONFIG.message,
        subMessage: sheetData.maintenanceConfig.subMessage || DEFAULT_MAINTENANCE_CONFIG.subMessage,
        updatedAt: sheetData.maintenanceConfig.updatedAt,
        updatedBy: sheetData.maintenanceConfig.updatedBy
      };
    }
  } catch (e) {
    console.warn('Gagal memuat status maintenance dari Spreadsheet:', e);
  }
  return getLocalMaintenanceConfig();
};

/**
 * Menyimpan status mode maintenance ke Google Spreadsheet & LocalStorage
 */
export const saveMaintenanceToSupabase = async (
  config: MaintenanceConfig
): Promise<boolean> => {
  const result = await saveMaintenanceToSheet(config);
  return result.success;
};
