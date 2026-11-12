import { parseCSV } from './googleSheetService';
import { formatGoogleDriveImageUrl } from '../lib/driveHelper';

export const SOP_SPREADSHEET_ID = '1As4lWaYwd2oaypZnqeuVUhlGdROVN_aARLuDvU15YEU';
export const SOP_SHEET_GID = '0';
export const SOP_CSV_URL = `https://docs.google.com/spreadsheets/d/${SOP_SPREADSHEET_ID}/export?format=csv&gid=${SOP_SHEET_GID}`;
export const SOP_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SOP_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SOP_SHEET_GID}`;
export const SOP_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SOP_SPREADSHEET_ID}/edit?usp=sharing`;

export const SOP_STORAGE_KEY = 'korwilcam_sop_image_url';
export const SOP_CACHE_TIMESTAMP_KEY = 'korwilcam_sop_last_fetch';
export const SOP_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL
export const SOP_WEBAPP_STORAGE_KEY = 'korwilcam_sop_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) SOP Pelayanan disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_SOP_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0YMx4ZLC8WDh5oGywwNgscMRczDDcGGDYMExQOWRUyKxImHhkeIi0+Oys5bxMpLxo4AjwTMj8XOBoJEDI5czgxBTAWDHE6GD84';

/**
 * Mendekripsi URL Webhook GAS SOP Pelayanan secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultSopWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOP_WEBAPP_URL) {
    return import.meta.env.VITE_SOP_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_SOP_ENDPOINT);
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

export const DEFAULT_SOP_WEBAPP_URL = resolveDefaultSopWebAppUrl();

let inMemorySopWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk SOP Pelayanan
 */
export function getSopWebAppUrl(): string {
  if (inMemorySopWebAppUrl && inMemorySopWebAppUrl.trim()) {
    return inMemorySopWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOP_WEBAPP_URL) {
    inMemorySopWebAppUrl = import.meta.env.VITE_SOP_WEBAPP_URL.trim();
    return inMemorySopWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(SOP_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemorySopWebAppUrl = saved.trim();
      return inMemorySopWebAppUrl;
    }
  } catch {}
  return DEFAULT_SOP_WEBAPP_URL || resolveDefaultSopWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk SOP Pelayanan
 */
export function setSopWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemorySopWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(SOP_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(SOP_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Interface data SOP Pelayanan
 */
export interface SopData {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  updatedAt: string;
}

/**
 * Mengambil tautan bagan SOP Pelayanan dari Google Spreadsheet / GAS Web App
 */
export async function fetchSopFromSheet(force: boolean = false): Promise<string> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(SOP_STORAGE_KEY);
      const timestamp = localStorage.getItem(SOP_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < SOP_CACHE_TTL_MS) {
        return cached;
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getSopWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawUrl = resJson?.data?.image_url || resJson?.imageUrl || (Array.isArray(resJson?.data) ? resJson.data[0]?.image_url : '');
        if (rawUrl) {
          const formatted = formatGoogleDriveImageUrl(rawUrl);
          try {
            localStorage.setItem(SOP_STORAGE_KEY, formatted);
            localStorage.setItem(SOP_CACHE_TIMESTAMP_KEY, String(now));
          } catch {}
          return formatted;
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch SOP dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const endpoints = [
    `${SOP_CSV_URL}&t=${now}`,
    `${SOP_GVIZ_URL}&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const header = rows[0].map(h => h.trim().toLowerCase());
          const imageColIdx = header.indexOf('image_url') !== -1 
            ? header.indexOf('image_url') 
            : 2;

          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length <= imageColIdx) continue;
            const rawUrl = (row[imageColIdx] || '').trim();
            if (rawUrl) {
              const formatted = formatGoogleDriveImageUrl(rawUrl);
              try {
                localStorage.setItem(SOP_STORAGE_KEY, formatted);
                localStorage.setItem(SOP_CACHE_TIMESTAMP_KEY, String(now));
              } catch {}
              return formatted;
            }
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch SOP dari ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache yang sudah tersimpan
  return localStorage.getItem(SOP_STORAGE_KEY) || '';
}

/**
 * Menyimpan / Memperbarui tautan bagan SOP Pelayanan ke Google Spreadsheet via GAS Web App
 */
export async function saveSopToSheet(
  imageUrl: string,
  title: string = 'Bagan Alur SOP Pelayanan',
  description: string = 'Standar Operasional Prosedur Pelayanan Pendidikan Korwilcam Purwodadi'
): Promise<boolean> {
  const formatted = formatGoogleDriveImageUrl(imageUrl);
  try {
    if (formatted) {
      localStorage.setItem(SOP_STORAGE_KEY, formatted);
    } else {
      localStorage.removeItem(SOP_STORAGE_KEY);
    }
    localStorage.removeItem(SOP_CACHE_TIMESTAMP_KEY);
  } catch {}

  const webAppUrl = getSopWebAppUrl();
  if (!webAppUrl) {
    // Jika belum ada Web App URL, tersimpan di local cache
    return true;
  }

  try {
    const payload = {
      action: 'save',
      id: 'main',
      data: {
        id: 'main',
        title,
        image_url: formatted,
        description,
        updated_at: new Date().toISOString()
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

    return true;
  } catch (err) {
    console.warn('Gagal kirim SOP ke GAS Web App:', err);
    return false;
  }
}

/**
 * Menghapus tautan bagan SOP Pelayanan dari Google Spreadsheet via GAS Web App
 */
export async function deleteSopFromSheet(): Promise<boolean> {
  try {
    localStorage.removeItem(SOP_STORAGE_KEY);
    localStorage.removeItem(SOP_CACHE_TIMESTAMP_KEY);
  } catch {}

  const webAppUrl = getSopWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: 'delete',
      id: 'main'
    };

    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return true;
  } catch (err) {
    console.warn('Gagal hapus SOP dari GAS Web App:', err);
    return false;
  }
}
