import { DocumentDownload } from '../types';
import { parseCSV } from './googleSheetService';

export const DOCUMENTS_SPREADSHEET_ID = '1DaGJzs1hzVlqmdzkil_ABZTyoWGVN8m-lWNda83C1AU';
export const DOCUMENTS_SHEET_GID = '0';
export const DOCUMENTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${DOCUMENTS_SPREADSHEET_ID}/export?format=csv&gid=${DOCUMENTS_SHEET_GID}`;
export const DOCUMENTS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${DOCUMENTS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${DOCUMENTS_SHEET_GID}`;
export const DOCUMENTS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DOCUMENTS_SPREADSHEET_ID}/edit?gid=${DOCUMENTS_SHEET_GID}#gid=${DOCUMENTS_SHEET_GID}`;

export const DOCUMENTS_CACHE_KEY = 'korwilcam_documents';
export const DOCUMENTS_CACHE_TIMESTAMP_KEY = 'korwilcam_documents_last_fetch';
export const DOCUMENTS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL
export const DOCUMENTS_WEBAPP_STORAGE_KEY = 'korwilcam_documents_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Dokumen & Unduhan disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_DOCUMENTS_ENDPOINT =
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0aNBVxMwRnPz0TKAomPTQLdj8EEikCDgMQODUXGDI8MGVtNStsYhZtKGoFPBQrEG0KETIWAw4QCxkxAT8fHz5SAjFzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Dokumen & Unduhan secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultDocumentsWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DOCUMENTS_WEBAPP_URL) {
    return import.meta.env.VITE_DOCUMENTS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_DOCUMENTS_ENDPOINT);
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

export const DEFAULT_DOCUMENTS_WEBAPP_URL = resolveDefaultDocumentsWebAppUrl();

let inMemoryDocumentsWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Dokumen & Layanan Unduhan
 */
export function getDocumentsWebAppUrl(): string {
  if (inMemoryDocumentsWebAppUrl && inMemoryDocumentsWebAppUrl.trim()) {
    return inMemoryDocumentsWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DOCUMENTS_WEBAPP_URL) {
    inMemoryDocumentsWebAppUrl = import.meta.env.VITE_DOCUMENTS_WEBAPP_URL.trim();
    return inMemoryDocumentsWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(DOCUMENTS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryDocumentsWebAppUrl = saved.trim();
      return inMemoryDocumentsWebAppUrl;
    }
  } catch {}
  return DEFAULT_DOCUMENTS_WEBAPP_URL || resolveDefaultDocumentsWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Dokumen & Layanan Unduhan
 */
export function setDocumentsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryDocumentsWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(DOCUMENTS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(DOCUMENTS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Memetakan baris array spreadsheet menjadi objek DocumentDownload
 * Header: id, title, category, file_type, file_size, download_count, date, description, download_url, created_at
 */
export function mapRowToDocument(row: any[], index: number = 0): DocumentDownload | null {
  if (!row || row.length < 2) return null;
  const id = String(row[0] || `doc-${Date.now()}-${index}`).trim();
  if (id === 'sop-main' || id === 'system-document-categories') {
    return null;
  }

  const title = String(row[1] || '').trim();
  if (!title) return null;

  const category = String(row[2] || 'Surat Edaran').trim();
  const rawFileType = String(row[3] || 'PDF').trim().toUpperCase();
  const fileType: 'PDF' | 'DOCX' | 'XLSX' = 
    (rawFileType === 'DOCX' || rawFileType === 'DOC' ? 'DOCX' : 
     rawFileType === 'XLSX' || rawFileType === 'XLS' ? 'XLSX' : 'PDF');

  const fileSize = String(row[4] || '1 MB').trim();
  const downloadCount = Number(row[5]) || 0;
  const date = String(row[6] || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })).trim();
  const description = String(row[7] || `Berkas dokumen resmi: ${title}`).trim();
  const downloadUrl = String(row[8] || '#').trim();

  return {
    id,
    title,
    category,
    fileType,
    fileSize,
    downloadCount,
    date,
    description,
    downloadUrl: downloadUrl || '#'
  };
}

/**
 * Mengambil daftar dokumen & berkas unduhan dari Google Spreadsheet / GAS Web App
 */
export async function fetchDocumentsFromSheet(force: boolean = false): Promise<DocumentDownload[]> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(DOCUMENTS_CACHE_KEY);
      const timestamp = localStorage.getItem(DOCUMENTS_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < DOCUMENTS_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getDocumentsWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson) ? resJson : (resJson.items || resJson.data || []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const items: DocumentDownload[] = [];
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            const parsed = mapRowToDocument([
              item.id,
              item.title,
              item.category,
              item.file_type || item.fileType,
              item.file_size || item.fileSize,
              item.download_count || item.downloadCount,
              item.date,
              item.description,
              item.download_url || item.downloadUrl
            ], i);
            if (parsed) items.push(parsed);
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(DOCUMENTS_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch dokumen dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const endpoints = [
    `${DOCUMENTS_CSV_URL}&t=${now}`,
    `${DOCUMENTS_GVIZ_URL}&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const items: DocumentDownload[] = [];
          for (let i = 1; i < rows.length; i++) {
            const parsed = mapRowToDocument(rows[i], i);
            if (parsed) {
              items.push(parsed);
            }
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(items));
              sessionStorage.setItem(DOCUMENTS_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(DOCUMENTS_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return items;
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch dokumen dari ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache yang sudah tersimpan sebelumnya
  try {
    const cached = localStorage.getItem(DOCUMENTS_CACHE_KEY) || sessionStorage.getItem(DOCUMENTS_CACHE_KEY);
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
 * Menyimpan / Memperbarui dokumen ke Google Spreadsheet via GAS Web App
 */
export async function saveDocumentToSheet(
  doc: DocumentDownload,
  isEdit: boolean = false
): Promise<boolean> {
  const webAppUrl = getDocumentsWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: isEdit ? 'update' : 'create',
      id: doc.id,
      data: {
        id: doc.id,
        title: doc.title,
        category: doc.category,
        file_type: doc.fileType,
        file_size: doc.fileSize,
        download_count: doc.downloadCount || 0,
        date: doc.date,
        description: doc.description,
        download_url: doc.downloadUrl,
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

    localStorage.removeItem(DOCUMENTS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal simpan dokumen ke Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menghapus dokumen dari Google Spreadsheet via GAS Web App
 */
export async function deleteDocumentFromSheet(id: string): Promise<boolean> {
  const webAppUrl = getDocumentsWebAppUrl();
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

    localStorage.removeItem(DOCUMENTS_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal hapus dokumen dari Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menambah hitungan unduh dokumen (downloadCount) ke Google Spreadsheet via GAS Web App
 */
export async function incrementDocumentDownloadCountInSheet(id: string): Promise<boolean> {
  const webAppUrl = getDocumentsWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: 'incrementDownloadCount',
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

    return true;
  } catch (err) {
    console.warn('Gagal increment download count ke Spreadsheet GAS:', err);
    return false;
  }
}
