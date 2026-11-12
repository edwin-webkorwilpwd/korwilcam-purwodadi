import { StaffProfile, StaffDivision } from '../types';
import { parseCSV } from './googleSheetService';

export const STAFF_SPREADSHEET_ID = '1svD7IC4mWh2KSJCfwkqUywu_uFkMLkKvJSKTMT-hw00';
export const STAFF_SHEET_GID = '0';
export const STAFF_CSV_URL = `https://docs.google.com/spreadsheets/d/${STAFF_SPREADSHEET_ID}/export?format=csv&gid=${STAFF_SHEET_GID}`;
export const STAFF_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${STAFF_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${STAFF_SHEET_GID}`;
export const STAFF_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${STAFF_SPREADSHEET_ID}/edit?usp=sharing`;

export const STAFF_CACHE_KEY = 'korwilcam_staff';
export const STAFF_CACHE_TIMESTAMP_KEY = 'korwilcam_staff_last_fetch';
export const STAFF_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL
export const STAFF_WEBAPP_STORAGE_KEY = 'korwilcam_staff_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Pegawai / Staf disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_STAFF_ENDPOINT =
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0ZMAQmODwzIgs5KT4dCAgQHT4LHDlZDy0DFT8FUB1oaGVrAFcuNG81NS8ObjYsMzIRJzgXP28UbRhiHgQHLmgZFRBzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Pegawai & Staf secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultStaffWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STAFF_WEBAPP_URL) {
    return import.meta.env.VITE_STAFF_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_STAFF_ENDPOINT);
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

export const DEFAULT_STAFF_WEBAPP_URL = resolveDefaultStaffWebAppUrl();

let inMemoryStaffWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Pegawai & Staf
 */
export function getStaffWebAppUrl(): string {
  if (inMemoryStaffWebAppUrl && inMemoryStaffWebAppUrl.trim()) {
    return inMemoryStaffWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_STAFF_WEBAPP_URL) {
    inMemoryStaffWebAppUrl = import.meta.env.VITE_STAFF_WEBAPP_URL.trim();
    return inMemoryStaffWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(STAFF_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryStaffWebAppUrl = saved.trim();
      return inMemoryStaffWebAppUrl;
    }
  } catch {}
  return DEFAULT_STAFF_WEBAPP_URL || resolveDefaultStaffWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Pegawai & Staf
 */
export function setStaffWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryStaffWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(STAFF_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(STAFF_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Normalisasi divisi pegawai ke format standar
 */
export function normalizeStaffDivision(rawDiv: string): StaffDivision {
  const d = (rawDiv || '').trim();
  if (d === 'Pimpinan') return 'Pimpinan Korwilcam Purwodadi';
  if (d === 'Penilik PAUD/TK' || d === 'Penilik PAUD' || d === 'Penilik KB/TK' || d === 'Penilik KB') return 'Penilik KB';
  if (d === 'Tata Usaha') return 'Staf';
  if (d === 'Pengawas SD' || d === 'Pengawas TK' || d === 'Staf' || d === 'Pimpinan Korwilcam Purwodadi') {
    return d as StaffDivision;
  }
  return 'Staf';
}

/**
 * Memetakan baris array spreadsheet menjadi objek StaffProfile
 * Header: id, name, role, nip, photo, division, created_at
 */
export function mapRowToStaff(row: any[], index: number = 0): StaffProfile | null {
  if (!row || row.length < 2) return null;
  const id = String(row[0] || `st-${Date.now()}-${index}`).trim();
  const name = String(row[1] || '').trim();
  if (!name) return null;

  const role = String(row[2] || 'Staf').trim();
  const nip = String(row[3] || '').trim();
  const rawPhoto = String(row[4] || '').trim();
  const cleanPhoto = (rawPhoto.includes('unsplash.com') || rawPhoto.includes('photo-1560250097')) ? '' : rawPhoto;
  const division = normalizeStaffDivision(String(row[5] || 'Staf'));

  return {
    id,
    name,
    role,
    nip,
    photo: cleanPhoto,
    division
  };
}

/**
 * Mengambil daftar staf/pejabat kantor dari Google Spreadsheet / GAS Web App
 */
export async function fetchStaffFromSheet(force: boolean = false): Promise<StaffProfile[]> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(STAFF_CACHE_KEY);
      const timestamp = localStorage.getItem(STAFF_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < STAFF_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getStaffWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson) ? resJson : (resJson.items || resJson.data || []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const items: StaffProfile[] = [];
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            const parsed = mapRowToStaff([
              item.id,
              item.name || item.nama,
              item.role || item.jabatan,
              item.nip,
              item.photo || item.foto,
              item.division || item.divisi
            ], i);
            if (parsed) items.push(parsed);
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(STAFF_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(STAFF_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(STAFF_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch staf dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const endpoints = [
    `${STAFF_CSV_URL}&t=${now}`,
    `${STAFF_GVIZ_URL}&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const items: StaffProfile[] = [];
          for (let i = 1; i < rows.length; i++) {
            const parsed = mapRowToStaff(rows[i], i);
            if (parsed) {
              items.push(parsed);
            }
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(STAFF_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(STAFF_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(STAFF_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch staf dari ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache yang sudah tersimpan sebelumnya
  try {
    const cached = localStorage.getItem(STAFF_CACHE_KEY) || sessionStorage.getItem(STAFF_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  return [];
}

/**
 * Menyimpan / Memperbarui staf ke Google Spreadsheet via GAS Web App
 */
export async function saveStaffToSheet(
  staffMember: StaffProfile,
  isEdit: boolean = false
): Promise<boolean> {
  const webAppUrl = getStaffWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: isEdit ? 'update' : 'create',
      id: staffMember.id,
      data: {
        id: staffMember.id,
        name: staffMember.name,
        role: staffMember.role,
        nip: staffMember.nip,
        photo: staffMember.photo,
        division: staffMember.division,
        created_at: new Date().toISOString()
      }
    };

    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    localStorage.removeItem(STAFF_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal simpan staf ke Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menghapus staf dari Google Spreadsheet via GAS Web App
 */
export async function deleteStaffFromSheet(id: string): Promise<boolean> {
  const webAppUrl = getStaffWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: 'delete',
      id
    };

    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    localStorage.removeItem(STAFF_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal hapus staf dari Spreadsheet GAS:', err);
    return false;
  }
}
