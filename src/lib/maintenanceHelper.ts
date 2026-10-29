import { getSupabaseClient } from './supabase';

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
  } catch (err) {
    console.warn('Gagal menyimpan maintenance config ke LocalStorage:', err);
  }
};

/**
 * Mengambil status mode maintenance dari Supabase Cloud (tabel: navigation_settings dengan id 'maintenance')
 */
export const fetchMaintenanceFromSupabase = async (): Promise<MaintenanceConfig> => {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return getLocalMaintenanceConfig();
    }

    const { data, error } = await client
      .from('navigation_settings')
      .select('items')
      .eq('id', 'maintenance')
      .maybeSingle();

    if (error) {
      console.warn('Catatan fetch maintenance dari Supabase:', error.message);
      return getLocalMaintenanceConfig();
    }

    if (data && typeof data.items === 'object' && data.items !== null) {
      const config: MaintenanceConfig = {
        isEnabled: Boolean(data.items.isEnabled),
        title: data.items.title || DEFAULT_MAINTENANCE_CONFIG.title,
        message: data.items.message || DEFAULT_MAINTENANCE_CONFIG.message,
        subMessage: data.items.subMessage || DEFAULT_MAINTENANCE_CONFIG.subMessage,
        updatedAt: data.items.updatedAt,
        updatedBy: data.items.updatedBy
      };
      setLocalMaintenanceConfig(config);
      return config;
    }
  } catch (err) {
    console.warn('Error saat fetchMaintenanceFromSupabase:', err);
  }
  return getLocalMaintenanceConfig();
};

/**
 * Menyimpan status mode maintenance ke Supabase Cloud dan LocalStorage
 */
export const saveMaintenanceToSupabase = async (
  config: MaintenanceConfig
): Promise<boolean> => {
  setLocalMaintenanceConfig(config);

  try {
    const client = getSupabaseClient();
    if (!client) return true;

    const payload = {
      id: 'maintenance',
      items: {
        ...config,
        updatedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    };

    const { error } = await client.from('navigation_settings').upsert(payload);

    if (error) {
      console.warn('Gagal upsert maintenance settings ke Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Gagal menyimpan maintenance config ke Supabase:', err);
    return false;
  }
};
