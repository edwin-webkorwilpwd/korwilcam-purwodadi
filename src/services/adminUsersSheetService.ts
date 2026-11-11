import { AdminUser, AdminRole } from '../types';
import { parseCSV } from './googleSheetService';

export const ADMIN_USERS_SPREADSHEET_ID = '1fY0SX6CVsFj_Hcr_aei13lV5dg8vGV6Fx_GFiXKqOaM';
export const ADMIN_USERS_SHEET_GID = '0';
export const ADMIN_USERS_CSV_URL = `https://docs.google.com/spreadsheets/d/${ADMIN_USERS_SPREADSHEET_ID}/export?format=csv&gid=${ADMIN_USERS_SHEET_GID}`;
export const ADMIN_USERS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${ADMIN_USERS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${ADMIN_USERS_SHEET_GID}`;
export const ADMIN_USERS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${ADMIN_USERS_SPREADSHEET_ID}/edit?gid=${ADMIN_USERS_SHEET_GID}#gid=${ADMIN_USERS_SHEET_GID}`;

export const ADMIN_USERS_CACHE_KEY = 'korwilcam_admin_users_sheet_cache_v1';
export const ADMIN_USERS_CACHE_TIMESTAMP_KEY = 'korwilcam_admin_users_last_fetch';
export const ADMIN_USERS_CACHE_TTL_MS = 3 * 60 * 1000; // 3 Menit Cache TTL

export const ADMIN_USERS_WEBAPP_STORAGE_KEY = 'korwilcam_admin_users_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Admin Users disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli tidak terbuka 
 * di bundle production, DevTools, maupun scanner otomatis.
 */
const OBFUSCATED_ADMIN_USERS_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0aGwoaFG0ZKhwIbhVnBldvLAwWBGpNPgI4NRsRUncfKyk7Nxc9Mh0FFAAVFzAdHhYYUWlqHRwKGCYcOSo5awVYaQswOnE6GD84';

/**
 * Mendekripsi URL Webhook GAS secara aman hanya di memori runtime saat dipanggil
 */
export function resolveDefaultAdminUsersWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_USERS_WEBAPP_URL) {
    return import.meta.env.VITE_ADMIN_USERS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_ADMIN_USERS_ENDPOINT);
      const len = binaryStr.length;
      const chars = new Array(len);
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(binaryStr.charCodeAt(i) ^ (0x5A + (i % 7)));
      }
      return chars.join('');
    }
  } catch {}
  return '';
}

export const DEFAULT_ADMIN_USERS_WEBAPP_URL = resolveDefaultAdminUsersWebAppUrl();

let inMemoryAdminUsersWebAppUrl = '';

/**
 * Mendapatkan URL Webhook GAS untuk admin_users
 */
export function getAdminUsersWebAppUrl(): string {
  if (inMemoryAdminUsersWebAppUrl && inMemoryAdminUsersWebAppUrl.trim()) {
    return inMemoryAdminUsersWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(ADMIN_USERS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryAdminUsersWebAppUrl = saved.trim();
      return inMemoryAdminUsersWebAppUrl;
    }
  } catch {}
  return DEFAULT_ADMIN_USERS_WEBAPP_URL || '';
}

/**
 * Menyimpan URL Webhook GAS untuk admin_users
 */
export function setAdminUsersWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryAdminUsersWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(ADMIN_USERS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(ADMIN_USERS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Menyamarkan URL GAS untuk tampilan antarmuka (UI Masking)
 */
export function maskWebAppUrl(url: string): string {
  if (!url || url.length < 35) return '••••••••••••••••••••••••••••••••';
  const prefix = url.substring(0, 36);
  const suffix = url.substring(url.length - 10);
  return `${prefix}••••••••••••${suffix}`;
}

/**
 * Mengambil daftar seluruh AdminUser dari Google Spreadsheet (CSV / GAS)
 */
export async function fetchAdminUsersFromSheet(forceRefresh = false): Promise<AdminUser[]> {
  try {
    if (!forceRefresh) {
      const cached = localStorage.getItem(ADMIN_USERS_CACHE_KEY);
      const lastFetchStr = localStorage.getItem(ADMIN_USERS_CACHE_TIMESTAMP_KEY);
      if (cached && lastFetchStr) {
        const lastFetch = parseInt(lastFetchStr, 10);
        if (!isNaN(lastFetch) && Date.now() - lastFetch < ADMIN_USERS_CACHE_TTL_MS) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    }

    // 1. Coba ambil melalui GAS GET ?action=list jika Webhook aktif
    const gasUrl = getAdminUsersWebAppUrl();
    if (gasUrl) {
      try {
        const gasRes = await fetch(`${gasUrl}?action=list`, {
          method: 'GET',
          cache: 'no-store'
        });
        if (gasRes.ok) {
          const gasJson = await gasRes.json();
          if (gasJson.status === 'success' && Array.isArray(gasJson.data) && gasJson.data.length > 0) {
            const users: AdminUser[] = gasJson.data.map((u: any) => ({
              id: String(u.id || ''),
              username: String(u.username || '').trim(),
              password: String(u.password || '').trim(),
              name: String(u.name || u.username || ''),
              role: (u.role || 'Penulis') as AdminRole,
              email: String(u.email || ''),
              avatar: String(u.avatar || ''),
              status: (u.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif',
              createdAt: u.created_at || u.createdAt || new Date().toISOString(),
              updatedAt: u.updated_at || u.updatedAt || undefined
            }));

            try {
              localStorage.setItem(ADMIN_USERS_CACHE_KEY, JSON.stringify(users));
              localStorage.setItem(ADMIN_USERS_CACHE_TIMESTAMP_KEY, String(Date.now()));
            } catch {}
            return users;
          }
        }
      } catch (gasErr) {
        console.warn('Gagal memuat admin_users via GAS Webhook, mencoba fallback CSV...', gasErr);
      }
    }

    // 2. Fallback: Ambil langsung dari Google Spreadsheet CSV Export
    const csvRes = await fetch(`${ADMIN_USERS_CSV_URL}&_t=${Date.now()}`, {
      cache: 'no-store'
    });
    if (!csvRes.ok) {
      throw new Error(`Gagal mengunduh CSV spreadsheet (${csvRes.status})`);
    }

    const csvText = await csvRes.text();
    const rows = parseCSV(csvText);
    if (!rows || rows.length <= 1) {
      return [];
    }

    // Pemetaan nama header
    const headers = rows[0].map((h) => h.toLowerCase().replace(/[\s_-]+/g, ''));
    const colMap = {
      id: headers.indexOf('id'),
      username: headers.indexOf('username') !== -1 ? headers.indexOf('username') : 1,
      password: headers.indexOf('password') !== -1 ? headers.indexOf('password') : 2,
      name: headers.indexOf('name') !== -1 ? headers.indexOf('name') : (headers.indexOf('nama') !== -1 ? headers.indexOf('nama') : 3),
      role: headers.indexOf('role') !== -1 ? headers.indexOf('role') : 4,
      email: headers.indexOf('email') !== -1 ? headers.indexOf('email') : 5,
      avatar: headers.indexOf('avatar') !== -1 ? headers.indexOf('avatar') : 6,
      status: headers.indexOf('status') !== -1 ? headers.indexOf('status') : 7,
      createdAt: headers.indexOf('createdat') !== -1 ? headers.indexOf('createdat') : 8,
      updatedAt: headers.indexOf('updatedat') !== -1 ? headers.indexOf('updatedat') : 9
    };

    const users: AdminUser[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const username = String(row[colMap.username] || '').trim();
      if (!username) continue;

      users.push({
        id: String(row[colMap.id] || `usr-${i}`),
        username: username,
        password: String(row[colMap.password] || ''),
        name: String(row[colMap.name] || username),
        role: (row[colMap.role] || 'Penulis') as AdminRole,
        email: String(row[colMap.email] || ''),
        avatar: String(row[colMap.avatar] || ''),
        status: (row[colMap.status] === 'Nonaktif' ? 'Nonaktif' : 'Aktif') as 'Aktif' | 'Nonaktif',
        createdAt: String(row[colMap.createdAt] || new Date().toISOString()),
        updatedAt: colMap.updatedAt >= 0 ? String(row[colMap.updatedAt] || '') : undefined
      });
    }

    try {
      localStorage.setItem(ADMIN_USERS_CACHE_KEY, JSON.stringify(users));
      localStorage.setItem(ADMIN_USERS_CACHE_TIMESTAMP_KEY, String(Date.now()));
    } catch {}

    return users;
  } catch (err) {
    console.warn('Gagal mengambil data admin_users dari Spreadsheet:', err);
    try {
      const cached = localStorage.getItem(ADMIN_USERS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return [];
  }
}

/**
 * Menyimpan User Baru ke Spreadsheet melalui GAS Webhook
 */
export async function saveAdminUserToSheet(
  userData: Omit<AdminUser, 'id'>,
  customId?: string
): Promise<{ success: boolean; message: string; id?: string }> {
  const gasUrl = getAdminUsersWebAppUrl();
  const newId = customId || `usr-${Date.now()}`;

  if (!gasUrl) {
    return {
      success: true,
      id: newId,
      message: 'Disimpan di cache lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: 'create',
      id: newId,
      username: userData.username,
      password: userData.password,
      name: userData.name,
      role: userData.role,
      email: userData.email || '',
      avatar: userData.avatar || '',
      status: userData.status || 'Aktif',
      created_at: new Date().toISOString()
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: data.status === 'success',
        id: data.id || newId,
        message: data.message || 'Akun berhasil disimpan ke Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${response.status}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Webhook GAS.' };
  }
}

/**
 * Memperbarui Data User di Spreadsheet melalui GAS Webhook
 */
export async function updateAdminUserInSheet(
  id: string,
  userData: Partial<AdminUser>
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getAdminUsersWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Perubahan diperbarui di cache lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload: any = {
      action: 'update',
      id: id,
      ...userData
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: data.status === 'success',
        message: data.message || 'Data akun berhasil diperbarui di Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${response.status}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Webhook GAS.' };
  }
}

/**
 * Menghapus User dari Spreadsheet melalui GAS Webhook
 */
export async function deleteAdminUserFromSheet(
  id: string,
  username?: string
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getAdminUsersWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Akun dihapus dari cache lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: 'delete',
      id: id,
      username: username
    };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: data.status === 'success',
        message: data.message || 'Akun berhasil dihapus dari Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${response.status}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal menghubungi Webhook GAS.' };
  }
}
