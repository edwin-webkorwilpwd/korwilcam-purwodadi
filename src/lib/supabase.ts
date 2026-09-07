import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabaseConfig';

// Read from Vite environment variables, bundled config, or local storage configuration
export const getSupabaseConfig = () => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const fileUrl = (SUPABASE_CONFIG?.url || '').trim();
  const fileKey = (SUPABASE_CONFIG?.anonKey || '').trim();
  const localUrl = (typeof window !== 'undefined' ? localStorage.getItem('korwilcam_supabase_url') || '' : '').trim();
  const localKey = (typeof window !== 'undefined' ? localStorage.getItem('korwilcam_supabase_key') || '' : '').trim();

  // Priority: 1. Environment variables -> 2. Bundled config file -> 3. LocalStorage
  let supabaseUrl = envUrl || fileUrl || localUrl || '';
  const supabaseAnonKey = envKey || fileKey || localKey || '';

  if (supabaseUrl && !supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    supabaseUrl = `https://${supabaseUrl}`;
  }
  supabaseUrl = supabaseUrl.replace(/\/+$/, '');

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    (supabaseUrl.startsWith('https://') || supabaseUrl.startsWith('http://'))
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured
  };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;

  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return clientInstance;
};

// Kirim konfigurasi ke dev server lokal untuk disimpan ke .env dan src/config/supabaseConfig.ts
export const saveConfigToServer = async (url: string, anonKey: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/save-supabase-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, anonKey })
    });
    return res.ok;
  } catch {
    return false;
  }
};

// Otomatis sinkronkan kredensial dari browser admin ke file proyek jika file proyek masih kosong
export const syncLocalConfigToServer = async () => {
  if (typeof window === 'undefined') return;
  const localUrl = (localStorage.getItem('korwilcam_supabase_url') || '').trim();
  const localKey = (localStorage.getItem('korwilcam_supabase_key') || '').trim();
  const fileUrl = (SUPABASE_CONFIG?.url || '').trim();
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();

  if (localUrl && localKey && (!fileUrl || !envUrl)) {
    await saveConfigToServer(localUrl, localKey);
  }
};

// Reset instance when keys change
export const setCustomSupabaseConfig = async (url: string, key: string) => {
  let cleanUrl = url.trim();
  if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }
  cleanUrl = cleanUrl.replace(/\/+$/, '');

  localStorage.setItem('korwilcam_supabase_url', cleanUrl);
  localStorage.setItem('korwilcam_supabase_key', key.trim());
  clientInstance = null;

  // Simpan permanen ke .env & supabaseConfig.ts di server proyek
  await saveConfigToServer(cleanUrl, key.trim());
};

export const clearCustomSupabaseConfig = async () => {
  localStorage.removeItem('korwilcam_supabase_url');
  localStorage.removeItem('korwilcam_supabase_key');
  clientInstance = null;
  await saveConfigToServer('', '');
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      message: 'URL Supabase atau Anon Key belum dikonfigurasi.' 
    };
  }

  try {
    // Attempt a light ping by querying the schools or office_profile table
    const { error } = await client.from('schools').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, but client connected
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Terkoneksi ke Supabase! Namun tabel database belum dibuat (silakan jalankan script SQL Schema).'
        };
      }
      return { 
        success: false, 
        message: `Gagal koneksi ke Supabase: ${error.message}` 
      };
    }

    return { 
      success: true, 
      message: 'Berhasil terhubung ke database Supabase!' 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: `Terjadi kendala jaringan/koneksi: ${err.message || err}` 
    };
  }
};
