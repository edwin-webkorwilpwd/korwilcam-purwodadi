import { TeacherNominative } from '../types';
import { parseCSV } from './googleSheetService';

export const DEFAULT_TEACHERS_SPREADSHEET_ID = '1BxNl81GjIKUAZU8l-1q6x68kbIFZZHHLNF7KciG6FGw';
export const DEFAULT_TEACHERS_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1BxNl81GjIKUAZU8l-1q6x68kbIFZZHHLNF7KciG6FGw/edit?usp=sharing';
export const DEFAULT_TEACHERS_CSV_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHERS_SPREADSHEET_ID}/export?format=csv&gid=0`;
export const DEFAULT_TEACHERS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_TEACHERS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;

export const TEACHERS_SPREADSHEET_STORAGE_KEY = 'korwilcam_teachers_sheet_url';
export const TEACHERS_WEBAPP_STORAGE_KEY = 'korwilcam_teachers_gas_url';
export const TEACHERS_CACHE_KEY = 'korwilcam_teachers_sheet_cache_v1';
export const TEACHERS_CACHE_TIMESTAMP_KEY = 'korwilcam_teachers_last_fetch';
export const TEACHERS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL

/**
 * URL Webhook Google Apps Script (GAS) Nominatif Guru disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_TEACHERS_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0YNBMFbzUTNXcNPSskGhMCKQUVKBA0IHYyZTM0DiwJcRkLN1ANDxI5LWtXHxoWBRsnTRgNaCsHLQ8DOjUUKi8RHGw0KnE6GD84';

/**
 * Mendekripsi URL Webhook GAS Nominatif Guru secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultTeachersWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEACHERS_WEBAPP_URL) {
    return import.meta.env.VITE_TEACHERS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_TEACHERS_ENDPOINT);
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

export const DEFAULT_TEACHERS_WEBAPP_URL = resolveDefaultTeachersWebAppUrl();

let inMemoryTeachersWebAppUrl = '';
let inMemoryTeachersSheetUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Nominatif Guru
 */
export function getTeachersWebAppUrl(): string {
  if (inMemoryTeachersWebAppUrl && inMemoryTeachersWebAppUrl.trim()) {
    return inMemoryTeachersWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TEACHERS_WEBAPP_URL) {
    inMemoryTeachersWebAppUrl = import.meta.env.VITE_TEACHERS_WEBAPP_URL.trim();
    return inMemoryTeachersWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(TEACHERS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryTeachersWebAppUrl = saved.trim();
      return inMemoryTeachersWebAppUrl;
    }
  } catch {}
  return DEFAULT_TEACHERS_WEBAPP_URL || resolveDefaultTeachersWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Nominatif Guru
 */
export function setTeachersWebAppUrl(url: string): void {
  const trimmed = (url || '').trim();
  inMemoryTeachersWebAppUrl = trimmed;
  try {
    if (trimmed) {
      localStorage.setItem(TEACHERS_WEBAPP_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(TEACHERS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Mendapatkan URL Spreadsheet Google untuk Nominatif Guru
 */
export function getTeachersSheetUrl(): string {
  if (inMemoryTeachersSheetUrl && inMemoryTeachersSheetUrl.trim()) {
    return inMemoryTeachersSheetUrl.trim();
  }
  try {
    const saved = localStorage.getItem(TEACHERS_SPREADSHEET_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryTeachersSheetUrl = saved.trim();
      return inMemoryTeachersSheetUrl;
    }
  } catch {}
  return DEFAULT_TEACHERS_SPREADSHEET_URL;
}

/**
 * Menyimpan URL Spreadsheet Google untuk Nominatif Guru
 */
export function setTeachersSheetUrl(url: string): void {
  const trimmed = (url || '').trim();
  inMemoryTeachersSheetUrl = trimmed;
  try {
    if (trimmed) {
      localStorage.setItem(TEACHERS_SPREADSHEET_STORAGE_KEY, trimmed);
    } else {
      localStorage.removeItem(TEACHERS_SPREADSHEET_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Ekstraksi Spreadsheet ID dari link Google Sheets
 */
export function extractSpreadsheetId(url: string): string {
  if (!url) return DEFAULT_TEACHERS_SPREADSHEET_ID;
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : DEFAULT_TEACHERS_SPREADSHEET_ID;
}

/**
 * Mengambil data nominatif guru dari Google Spreadsheet / GAS Web App
 */
export async function fetchTeachersFromSheet(force: boolean = false): Promise<TeacherNominative[]> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(TEACHERS_CACHE_KEY);
      const timestamp = localStorage.getItem(TEACHERS_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < TEACHERS_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getTeachersWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson) ? resJson : (resJson.items || resJson.data || []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const teachers: TeacherNominative[] = rawItems.map((t: any, idx: number) => ({
            id: String(t.id || `guru-${idx + 1}`),
            no: parseInt(t.no, 10) || idx + 1,
            nama: String(t.nama || '').trim(),
            nip: String(t.nip || '-').trim(),
            statusPegawai: String(t.statusPegawai || t.status_pegawai || 'PNS').trim(),
            instansi: String(t.instansi || '').trim()
          })).filter(t => t.nama);

          if (teachers.length > 0) {
            try {
              localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(teachers));
              localStorage.setItem(TEACHERS_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return teachers;
          }
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch guru dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const sheetUrl = getTeachersSheetUrl();
  const spreadsheetId = extractSpreadsheetId(sheetUrl);

  const endpoints = [
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=0&t=${now}`,
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&gid=0&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const teachers: TeacherNominative[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 3) continue;

            const nama = (row[2] || '').trim();
            if (!nama) continue;

            const id = (row[0] || `guru-${i}`).trim();
            const no = parseInt(row[1], 10) || i;
            const nip = (row[3] || '-').trim();
            const statusPegawai = (row[4] || 'PNS').trim();
            const instansi = (row[5] || '').trim();

            teachers.push({
              id,
              no,
              nama,
              nip,
              statusPegawai,
              instansi
            });
          }

          if (teachers.length > 0) {
            try {
              localStorage.setItem(TEACHERS_CACHE_KEY, JSON.stringify(teachers));
              localStorage.setItem(TEACHERS_CACHE_TIMESTAMP_KEY, String(now));
              localStorage.setItem('korwilcam_teachers', JSON.stringify(teachers));
            } catch {}
            return teachers;
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch guru dari endpoint ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache yang tersimpan sebelumnya
  try {
    const cached = localStorage.getItem(TEACHERS_CACHE_KEY) || localStorage.getItem('korwilcam_teachers');
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
 * Menyimpan / Memperbarui data guru ke Google Spreadsheet melalui Web App GAS
 */
export async function saveTeacherToSheet(
  teacher: TeacherNominative,
  isEdit: boolean = false
): Promise<boolean> {
  const webAppUrl = getTeachersWebAppUrl();
  if (!webAppUrl) {
    // Jika belum ada Web App URL, simpan sementara di local cache
    return true;
  }

  try {
    const payload = {
      action: isEdit ? 'update' : 'create',
      id: teacher.id,
      data: {
        id: teacher.id,
        no: teacher.no,
        nama: teacher.nama,
        nip: teacher.nip || '-',
        statusPegawai: teacher.statusPegawai || 'PNS',
        instansi: teacher.instansi || ''
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

    // Reset timestamp cache agar data terbaru segera diambil
    localStorage.removeItem(TEACHERS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal simpan guru ke Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menghapus data guru dari Google Spreadsheet melalui Web App GAS
 */
export async function deleteTeacherFromSheet(id: string): Promise<boolean> {
  const webAppUrl = getTeachersWebAppUrl();
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

    localStorage.removeItem(TEACHERS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal hapus guru dari Spreadsheet GAS:', err);
    return false;
  }
}
