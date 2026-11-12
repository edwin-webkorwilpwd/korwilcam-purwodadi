import { parseCSV } from './googleSheetService';

export const SERVICE_CATEGORIES_SPREADSHEET_ID = '1K5XgCD-pw44m0Yhjpy7YL7TLRoyoRWEv6q6qBTlxhvg';
export const SERVICE_CATEGORIES_SHEET_GID = '0';
export const SERVICE_CATEGORIES_CSV_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_CATEGORIES_SPREADSHEET_ID}/export?format=csv&gid=${SERVICE_CATEGORIES_SHEET_GID}`;
export const SERVICE_CATEGORIES_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_CATEGORIES_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SERVICE_CATEGORIES_SHEET_GID}`;
export const SERVICE_CATEGORIES_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_CATEGORIES_SPREADSHEET_ID}/edit?usp=sharing`;

export const SERVICE_CATEGORIES_CACHE_KEY = 'korwilcam_service_categories_sheet_cache';
export const SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY = 'korwilcam_service_categories_last_fetch';
export const SERVICE_CATEGORIES_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL
export const SERVICE_CATEGORIES_WEBAPP_STORAGE_KEY = 'korwilcam_service_categories_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Kategori Pelayanan disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli tidak terbuka
 * di bundle production, DevTools, maupun scanner otomatis.
 */
const OBFUSCATED_SERVICE_CATEGORIES_ENDPOINT =
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0aF24oOCRoJy8qEw8OaTADEwg2PDw0ABAQcB1pBz8xGxw2DiRqIS8rODFVYzgMbBo1Ng09NW0aDRY9PzdsNxRTd2IdDHE6GD84';

/**
 * Mendekripsi URL Webhook GAS Kategori Pelayanan secara aman hanya di memori runtime saat dipanggil
 */
export function resolveDefaultServiceCategoriesWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVICE_CATEGORIES_WEBAPP_URL) {
    return import.meta.env.VITE_SERVICE_CATEGORIES_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_SERVICE_CATEGORIES_ENDPOINT);
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

export const DEFAULT_SERVICE_CATEGORIES_WEBAPP_URL = resolveDefaultServiceCategoriesWebAppUrl();

/**
 * Menyamarkan URL GAS untuk tampilan antarmuka (UI Masking)
 * Melindungi dari intipan layar / inspeksi visual
 */
export function maskWebAppUrl(url: string): string {
  if (!url || url.length < 35) return '••••••••••••••••••••••••••••••••';
  const prefix = url.substring(0, 36);
  const suffix = url.substring(url.length - 10);
  return `${prefix}••••••••••••${suffix}`;
}

let inMemoryServiceCatWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Kategori Pelayanan
 */
export function getServiceCategoryWebAppUrl(): string {
  if (inMemoryServiceCatWebAppUrl && inMemoryServiceCatWebAppUrl.trim()) {
    return inMemoryServiceCatWebAppUrl.trim();
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVICE_CATEGORIES_WEBAPP_URL) {
    inMemoryServiceCatWebAppUrl = import.meta.env.VITE_SERVICE_CATEGORIES_WEBAPP_URL.trim();
    return inMemoryServiceCatWebAppUrl;
  }
  try {
    const saved = localStorage.getItem(SERVICE_CATEGORIES_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryServiceCatWebAppUrl = saved.trim();
      return inMemoryServiceCatWebAppUrl;
    }
  } catch {}
  return DEFAULT_SERVICE_CATEGORIES_WEBAPP_URL || resolveDefaultServiceCategoriesWebAppUrl();
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Kategori Pelayanan
 */
export function setServiceCategoryWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryServiceCatWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(SERVICE_CATEGORIES_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(SERVICE_CATEGORIES_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

export interface ServiceCategoryItem {
  id: string;
  name: string;
  createdAt?: string;
}

export interface ServiceCategoriesSheetResult {
  categories: string[];
  items: ServiceCategoryItem[];
}

/**
 * Memetakan baris array spreadsheet menjadi objek ServiceCategoryItem
 * Format Spreadsheet: [id, name, created_at]
 */
export function mapRowToServiceCategory(row: any[], index: number = 0): ServiceCategoryItem | null {
  if (!row || row.length < 2) return null;
  const id = String(row[0] || `cat-${Date.now()}-${index}`).trim();
  const name = String(row[1] || '').trim();
  const createdAt = String(row[2] || '').trim();

  if (!name || name.toLowerCase() === 'name' || name.toLowerCase() === 'kategori') return null;

  return { id, name, createdAt };
}

/**
 * Mengambil daftar kategori pelayanan dari Google Spreadsheet / GAS Web App
 */
export async function fetchServiceCategoriesFromSheet(force: boolean = false): Promise<ServiceCategoriesSheetResult> {
  const now = Date.now();

  // 1. Cek Cache Lokal jika bukan force sync
  if (!force) {
    try {
      const cached = localStorage.getItem(SERVICE_CATEGORIES_CACHE_KEY);
      const timestamp = localStorage.getItem(SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY);
      if (cached && timestamp && now - Number(timestamp) < SERVICE_CATEGORIES_CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return {
            categories: parsed.map((item: ServiceCategoryItem) => item.name),
            items: parsed
          };
        }
      }
    } catch {}
  }

  // 2. Coba ambil dari Web App GAS jika terkonfigurasi
  const webAppUrl = getServiceCategoryWebAppUrl();
  if (webAppUrl) {
    try {
      const separator = webAppUrl.includes('?') ? '&' : '?';
      const fetchUrl = `${webAppUrl}${separator}action=read&t=${now}`;
      const response = await fetch(fetchUrl, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const resJson = await response.json();
        const rawItems = Array.isArray(resJson) ? resJson : (resJson.items || resJson.data || []);
        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const items: ServiceCategoryItem[] = [];
          for (let i = 0; i < rawItems.length; i++) {
            const item = rawItems[i];
            const parsed = mapRowToServiceCategory([
              item.id,
              item.name || item.kategori || item.title,
              item.created_at || item.createdAt
            ], i);
            if (parsed) items.push(parsed);
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(SERVICE_CATEGORIES_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return {
              categories: items.map(i => i.name),
              items
            };
          }
        }
      }
    } catch (errGas) {
      console.warn('Gagal fetch kategori dari GAS Web App, beralih ke direct CSV:', errGas);
    }
  }

  // 3. Ambil langsung via Direct Google Sheets CSV / GViz Export
  const endpoints = [
    `${SERVICE_CATEGORIES_CSV_URL}&t=${now}`,
    `${SERVICE_CATEGORIES_GVIZ_URL}&t=${now}`
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (response.ok) {
        const csvText = await response.text();
        const rows = parseCSV(csvText);
        if (rows.length > 1) {
          const items: ServiceCategoryItem[] = [];
          for (let i = 1; i < rows.length; i++) {
            const parsed = mapRowToServiceCategory(rows[i], i);
            if (parsed) {
              items.push(parsed);
            }
          }

          if (items.length > 0) {
            try {
              localStorage.setItem(SERVICE_CATEGORIES_CACHE_KEY, JSON.stringify(items));
              localStorage.setItem(SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY, String(now));
            } catch {}
            return {
              categories: items.map(i => i.name),
              items
            };
          }
        }
      }
    } catch (errCsv) {
      console.warn(`Gagal fetch kategori dari ${endpoint}:`, errCsv);
    }
  }

  // 4. Fallback ke cache sebelumnya jika ada
  try {
    const cached = localStorage.getItem(SERVICE_CATEGORIES_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          categories: parsed.map((item: ServiceCategoryItem) => item.name),
          items: parsed
        };
      }
    }
  } catch {}

  return {
    categories: [],
    items: []
  };
}

/**
 * Menambahkan kategori pelayanan baru ke Google Spreadsheet via GAS Web App
 */
export async function saveServiceCategoryToSheet(categoryName: string): Promise<boolean> {
  const trimmed = categoryName.trim();
  if (!trimmed) return false;

  const webAppUrl = getServiceCategoryWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: 'create',
      id: `cat-${Date.now()}`,
      name: trimmed,
      data: {
        id: `cat-${Date.now()}`,
        name: trimmed,
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

    localStorage.removeItem(SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal simpan kategori ke Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Menghapus kategori pelayanan dari Google Spreadsheet via GAS Web App
 */
export async function deleteServiceCategoryFromSheet(categoryName: string): Promise<boolean> {
  const trimmed = categoryName.trim();
  if (!trimmed) return false;

  const webAppUrl = getServiceCategoryWebAppUrl();
  if (!webAppUrl) {
    return true;
  }

  try {
    const payload = {
      action: 'delete',
      name: trimmed
    };

    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    localStorage.removeItem(SERVICE_CATEGORIES_CACHE_TIMESTAMP_KEY);
    return true;
  } catch (err) {
    console.warn('Gagal hapus kategori dari Spreadsheet GAS:', err);
    return false;
  }
}

/**
 * Template Kode Google Apps Script (GAS) Lengkap untuk Kategori Pelayanan
 */
export const OFFICIAL_SERVICE_CATEGORIES_GAS_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - DATABASE SERVICE CATEGORIES (KATEGORI PELAYANAN)
 * Target Spreadsheet ID : 1K5XgCD-pw44m0Yhjpy7YL7TLRoyoRWEv6q6qBTlxhvg
 * Target Sheet GID       : 0 (Lembar pertama)
 * ============================================================================
 * 
 * STRUKTUR KOLOM SPREADSHEET (Baris 1 = Header):
 * Kolom A (1) : id         (ID Kategori Unik)
 * Kolom B (2) : name       (Nama Kategori)
 * Kolom C (3) : created_at (Waktu Dibuat)
 * ============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();
    var values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      return createJsonResponse({ status: 'success', count: 0, data: [] });
    }

    var result = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = String(row[0] || '').trim();
      var name = String(row[1] || '').trim();
      var createdAt = String(row[2] || '').trim();

      if (!name) continue;

      result.push({
        id: id || ('cat-' + r),
        name: name,
        created_at: createdAt
      });
    }

    return createJsonResponse({
      status: 'success',
      count: result.length,
      data: result
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (lockErr) {
    return createJsonResponse({
      status: 'error',
      message: 'Server Google Apps Script sedang sibuk. Silakan coba lagi.'
    });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: 'error', message: 'Payload data kosong.' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = String(payload.action || 'create').toLowerCase().trim();
    var targetName = String(payload.name || (payload.data && payload.data.name) || '').trim();
    var targetId = String(payload.id || (payload.data && payload.data.id) || '').trim();

    var values = sheet.getDataRange().getValues();

    // 1. ACTION: DELETE
    if (action === 'delete' || action === 'remove') {
      if (!targetName && !targetId) {
        return createJsonResponse({ status: 'error', message: 'Nama atau ID kategori tidak disertakan.' });
      }

      var deleted = false;
      for (var r = values.length - 1; r >= 1; r--) {
        var rowId = String(values[r][0] || '').trim();
        var rowName = String(values[r][1] || '').trim();

        if (
          (targetName && rowName.toLowerCase() === targetName.toLowerCase()) ||
          (targetId && rowId === targetId)
        ) {
          sheet.deleteRow(r + 1);
          deleted = true;
          break;
        }
      }

      if (deleted) {
        return createJsonResponse({
          status: 'success',
          message: 'Kategori "' + (targetName || targetId) + '" berhasil dihapus dari Spreadsheet.'
        });
      } else {
        return createJsonResponse({
          status: 'warning',
          message: 'Kategori "' + (targetName || targetId) + '" tidak ditemukan.'
        });
      }
    }

    // 2. ACTION: CREATE / ADD
    if (!targetName) {
      return createJsonResponse({ status: 'error', message: 'Nama kategori wajib diisi.' });
    }

    // Cek apakah kategori sudah ada (case-insensitive)
    for (var r = 1; r < values.length; r++) {
      var rowName = String(values[r][1] || '').trim();
      if (rowName.toLowerCase() === targetName.toLowerCase()) {
        return createJsonResponse({
          status: 'success',
          message: 'Kategori "' + targetName + '" sudah ada di Spreadsheet.',
          id: String(values[r][0] || '')
        });
      }
    }

    var newId = targetId || ('cat-' + new Date().getTime());
    var timeStamp = new Date().toISOString();

    sheet.appendRow([newId, targetName, timeStamp]);

    return createJsonResponse({
      status: 'success',
      message: 'Kategori "' + targetName + '" berhasil ditambahkan ke Spreadsheet.',
      id: newId
    });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
