import { Announcement } from '../types';
import { parseCSV } from './googleSheetService';

export const ANNOUNCEMENTS_SPREADSHEET_ID = '12bExEQeJiCy1KrOwFn75gk3Qij5nOeri65scdc_znIQ';
export const ANNOUNCEMENTS_SHEET_GID = '0';
export const ANNOUNCEMENTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${ANNOUNCEMENTS_SPREADSHEET_ID}/export?format=csv&gid=${ANNOUNCEMENTS_SHEET_GID}`;
export const ANNOUNCEMENTS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${ANNOUNCEMENTS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${ANNOUNCEMENTS_SHEET_GID}`;
export const ANNOUNCEMENTS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${ANNOUNCEMENTS_SPREADSHEET_ID}/edit?gid=${ANNOUNCEMENTS_SHEET_GID}#gid=${ANNOUNCEMENTS_SHEET_GID}`;

export const ANNOUNCEMENTS_CACHE_KEY = 'korwilcam_announcements';
export const ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY = 'korwilcam_announcements_last_fetch';
export const ANNOUNCEMENTS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL
export const ANNOUNCEMENTS_WEBAPP_STORAGE_KEY = 'korwilcam_announcements_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Pengumuman & Edaran disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_ANNOUNCEMENTS_ENDPOINT =
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0YaAolDA0dWA4ubjMIHQ4JECQcbTgoFm8dFQ86JwN2FyooEFkPPBY/EDEFKBYvDRQOMggNPmoGCQsCYzE0LQciaStzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Pengumuman & Edaran secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultAnnouncementsWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANNOUNCEMENTS_WEBAPP_URL) {
    return import.meta.env.VITE_ANNOUNCEMENTS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_ANNOUNCEMENTS_ENDPOINT);
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

export const DEFAULT_ANNOUNCEMENTS_WEBAPP_URL = resolveDefaultAnnouncementsWebAppUrl();

let inMemoryAnnouncementsWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Pengumuman & Surat Edaran
 */
export function getAnnouncementsWebAppUrl(): string {
  if (inMemoryAnnouncementsWebAppUrl && inMemoryAnnouncementsWebAppUrl.trim()) {
    return inMemoryAnnouncementsWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ANNOUNCEMENTS_WEBAPP_URL) {
    inMemoryAnnouncementsWebAppUrl = import.meta.env.VITE_ANNOUNCEMENTS_WEBAPP_URL.trim();
    return inMemoryAnnouncementsWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(ANNOUNCEMENTS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryAnnouncementsWebAppUrl = saved.trim();
      return inMemoryAnnouncementsWebAppUrl;
    }
  } catch {}
  return DEFAULT_ANNOUNCEMENTS_WEBAPP_URL || resolveDefaultAnnouncementsWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Pengumuman & Surat Edaran
 */
export function setAnnouncementsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryAnnouncementsWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(ANNOUNCEMENTS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(ANNOUNCEMENTS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Memadatkan info lampiran, wewenang, dan relasi ke string format pipa (|)
 */
export function packAnnouncementFileSize(ann: Announcement): string {
  return [
    ann.fileSize || '',
    ann.fileName || '',
    ann.fileType || '',
    ann.fileUrl || '',
    ann.serviceRequirementId || '',
    ann.serviceRequirementTitle || '',
    ann.sourceDocumentId || '',
    ann.author || '',
    ann.authorId || '',
    ann.authorRole || ''
  ].join('|');
}

/**
 * Memetakan baris array spreadsheet menjadi objek Announcement
 */
export function mapRowToAnnouncement(row: any[], index: number = 0): Announcement | null {
  if (!row || row.length < 2) return null;
  const id = String(row[0] || `ann-${Date.now()}-${index}`).trim();
  const title = String(row[1] || '').trim();
  if (!title) return null;

  const date = String(row[2] || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })).trim();
  const urgency = (String(row[3] || 'Biasa').trim() as 'Mendesak' | 'Penting' | 'Biasa');
  const target = (String(row[4] || 'Semua Satuan').trim() as 'Semua Satuan' | 'SD' | 'TK/KB' | 'TK/PAUD');
  const rawFileSize = String(row[5] || '').trim();
  const summary = String(row[6] || title).trim();

  let fileSize = rawFileSize;
  let fileName = '';
  let fileType: any = 'PDF';
  let fileUrl = '#';
  let serviceRequirementId = '';
  let serviceRequirementTitle = '';
  let sourceDocumentId = '';
  let author = 'Humas Korwilcam Purwodadi';
  let authorId = '';
  let authorRole = 'Admin';

  if (rawFileSize && rawFileSize.includes('|')) {
    const parts = rawFileSize.split('|');
    fileSize = parts[0] || '';
    fileName = parts[1] || '';
    fileType = parts[2] || 'PDF';
    fileUrl = parts[3] || '#';
    serviceRequirementId = parts[4] || '';
    serviceRequirementTitle = parts[5] || '';
    sourceDocumentId = parts[6] || '';
    if (parts.length > 7 && parts[7]) author = parts[7];
    if (parts.length > 8 && parts[8]) authorId = parts[8];
    if (parts.length > 9 && parts[9]) authorRole = parts[9];
  }

  return {
    id,
    title,
    date,
    urgency,
    target,
    fileSize: fileSize || '1 MB',
    fileUrl: fileUrl || '#',
    fileName: fileName || 'lampiran.pdf',
    fileType: fileType || 'PDF',
    summary,
    serviceRequirementId: serviceRequirementId || undefined,
    serviceRequirementTitle: serviceRequirementTitle || undefined,
    sourceDocumentId: sourceDocumentId || undefined,
    author: author || 'Humas Korwilcam Purwodadi',
    authorId: authorId || undefined,
    authorRole: authorRole || 'Admin'
  };
}

/**
 * Mengambil daftar pengumuman & edaran dari Google Spreadsheet / GAS Web App
 */
export async function fetchAnnouncementsFromSheet(force: boolean = false): Promise<Announcement[]> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
      const timestamp = localStorage.getItem(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < ANNOUNCEMENTS_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getAnnouncementsWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson) ? resJson : (resJson.items || resJson.data || []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const items: Announcement[] = [];
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            const parsed = mapRowToAnnouncement([
              item.id,
              item.title,
              item.date,
              item.urgency,
              item.target,
              item.file_size || item.fileSize,
              item.summary
            ], i);
            if (parsed) items.push(parsed);
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch pengumuman dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const endpoints = [
    `${ANNOUNCEMENTS_CSV_URL}&t=${now}`,
    `${ANNOUNCEMENTS_GVIZ_URL}&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const items: Announcement[] = [];
          for (let i = 1; i < rows.length; i++) {
            const parsed = mapRowToAnnouncement(rows[i], i);
            if (parsed) {
              items.push(parsed);
            }
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch pengumuman dari ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache yang sudah tersimpan sebelumnya
  try {
    const cached = localStorage.getItem(ANNOUNCEMENTS_CACHE_KEY) || sessionStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
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
 * Menyimpan / Memperbarui pengumuman ke Google Spreadsheet via GAS Web App
 */
export async function saveAnnouncementToSheet(
  ann: Announcement,
  isEdit: boolean = false
): Promise<boolean> {
  const webAppUrl = getAnnouncementsWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const packedFileSize = packAnnouncementFileSize(ann);
    const payload = {
      action: isEdit ? 'update' : 'create',
      id: ann.id,
      data: {
        id: ann.id,
        title: ann.title,
        date: ann.date,
        urgency: ann.urgency,
        target: ann.target,
        file_size: packedFileSize,
        summary: ann.summary,
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

    localStorage.removeItem(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal simpan pengumuman ke Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menghapus pengumuman dari Google Spreadsheet via GAS Web App
 */
export async function deleteAnnouncementFromSheet(id: string): Promise<boolean> {
  const webAppUrl = getAnnouncementsWebAppUrl();
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

    localStorage.removeItem(ANNOUNCEMENTS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal hapus pengumuman dari Spreadsheet GAS:', err);
    return false;
  }
}
