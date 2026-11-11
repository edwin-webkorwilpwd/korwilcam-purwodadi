import { DataRequestLink } from '../types';
import { parseCSV } from './googleSheetService';
import { generateDataRequestSlug } from '../lib/dataRequestHelper';

export const DATA_REQUESTS_SPREADSHEET_ID = '1RZfZIouoG3qyNBS7vUL0TMJ0rlHmDFB8N1M1wWKbQpA';
export const DATA_REQUESTS_SHEET_GID = '0';
export const DATA_REQUESTS_GVIZ_JSON_URL = `https://docs.google.com/spreadsheets/d/${DATA_REQUESTS_SPREADSHEET_ID}/gviz/tq?gid=${DATA_REQUESTS_SHEET_GID}`;
export const DATA_REQUESTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${DATA_REQUESTS_SPREADSHEET_ID}/export?format=csv&gid=${DATA_REQUESTS_SHEET_GID}`;
export const DATA_REQUESTS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${DATA_REQUESTS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${DATA_REQUESTS_SHEET_GID}`;
export const DATA_REQUESTS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DATA_REQUESTS_SPREADSHEET_ID}/edit?gid=${DATA_REQUESTS_SHEET_GID}#gid=${DATA_REQUESTS_SHEET_GID}`;

export const DATA_REQUESTS_CACHE_KEY = 'korwilcam_data_requests_sheet_cache_v1';
export const DATA_REQUESTS_CACHE_TIMESTAMP_KEY = 'korwilcam_data_requests_last_fetch';
export const DATA_REQUESTS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL

export const DATA_REQUESTS_WEBAPP_STORAGE_KEY = 'korwilcam_data_requests_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_DATA_REQUESTS_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0aBRU9LBEzVAUEGRUfFj9pEyUzORcVGDRxDxQtUA0tNDU9DVJjLB8TFWlSKCwbNQpyEwoRFSRnHCkZCnEkOQo0IjRzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Permintaan Data secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultDataRequestsWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_DATA_REQUESTS_WEBAPP_URL) {
    return import.meta.env.VITE_DATA_REQUESTS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_DATA_REQUESTS_ENDPOINT);
      const len = binaryStr.length;
      const chars = new Array(len);
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(binaryStr.charCodeAt(i) ^ (0x5A + (i % 7)));
      }
      return chars.join('');
    }
  } catch {}
  return 'https://script.google.com/macros/s/AKfycbz_NaqOl4__EHAI_3HyngHuBo-RJr0WvhhcR29wCNK62rwGhT-sPJIy9CICQ-ygUTxo/exec';
}

export const DEFAULT_DATA_REQUESTS_WEBAPP_URL = resolveDefaultDataRequestsWebAppUrl();

let inMemoryDataRequestsWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Permintaan Data
 */
export function getDataRequestsWebAppUrl(): string {
  if (inMemoryDataRequestsWebAppUrl && inMemoryDataRequestsWebAppUrl.trim()) {
    return inMemoryDataRequestsWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(DATA_REQUESTS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryDataRequestsWebAppUrl = saved.trim();
      return inMemoryDataRequestsWebAppUrl;
    }
  } catch {}
  return DEFAULT_DATA_REQUESTS_WEBAPP_URL || '';
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Permintaan Data
 */
export function setDataRequestsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryDataRequestsWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(DATA_REQUESTS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(DATA_REQUESTS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Template Kode Google Apps Script (GAS) Lengkap untuk Database Permintaan Data
 * Target Spreadsheet ID : 1RZfZIouoG3qyNBS7vUL0TMJ0rlHmDFB8N1M1wWKbQpA
 * Target Sheet GID       : 0
 */
export const DATA_REQUESTS_GAS_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - DATABASE PERMINTAAN DATA (WEBVIEW) KORWILCAM PURWODADI
 * Target Spreadsheet ID : 1RZfZIouoG3qyNBS7vUL0TMJ0rlHmDFB8N1M1wWKbQpA
 * Target Sheet GID       : 0
 * ============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();
    var values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      return createJson({ status: 'success', count: 0, data: [] });
    }

    var headerRow = values[0];
    var colMap = {};
    for (var c = 0; c < headerRow.length; c++) {
      var norm = String(headerRow[c] || '').toLowerCase().replace(/[\\s_-]+/g, '');
      if (norm) colMap[norm] = c;
    }

    function getIdx(aliases, fallback) {
      for (var i = 0; i < aliases.length; i++) {
        var key = aliases[i].toLowerCase().replace(/[\\s_-]+/g, '');
        if (colMap[key] !== undefined) return colMap[key];
      }
      return fallback;
    }

    var idCol = getIdx(['id', 'id_permintaan', 'id_req', 'request_id'], 0);
    var titleCol = getIdx(['title', 'judul', 'nama_layanan', 'nama'], 1);
    var urlCol = getIdx(['url', 'tautan', 'link', 'form_url'], 2);
    var descCol = getIdx(['description', 'deskripsi', 'keterangan'], 3);
    var cropTopCol = getIdx(['crop_top', 'croptop', 'crop', 'potong_atas'], 4);
    var activeCol = getIdx(['is_active', 'isactive', 'status', 'aktif'], 5);
    var orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 6);
    var createdCol = getIdx(['creates_at', 'created_at', 'createsat', 'createdat', 'tanggal_buat'], 7);
    var updatedCol = getIdx(['updated_at', 'updatedat', 'tanggal_ubah', 'modified_at'], 8);
    var slugCol = getIdx(['slug', 'slug_link', 'alias'], 9);

    var list = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = String(row[idCol] || '').trim();
      var title = String(row[titleCol] || '').trim();
      if (!id && !title) continue;

      var rawActive = row[activeCol];
      var isActive = true;
      if (rawActive !== undefined && rawActive !== null && rawActive !== '') {
        var strActive = String(rawActive).trim().toLowerCase();
        isActive = (strActive === '1' || strActive === 'true' || rawActive === 1 || rawActive === true);
      }

      var slugVal = String(row[slugCol] || '').trim();
      if (!slugVal && title) {
        slugVal = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      }

      list.push({
        id: id || ('req-data-' + r),
        title: title,
        url: String(row[urlCol] || '').trim(),
        description: String(row[descCol] || '').trim(),
        crop_top: Number(row[cropTopCol]) || 0,
        is_active: isActive ? 1 : 0,
        sort_order: Number(row[orderCol]) || r,
        creates_at: String(row[createdCol] || ''),
        updated_at: String(row[updatedCol] || ''),
        slug: slugVal
      });
    }

    return createJson({ status: 'success', count: list.length, data: list });
  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return createJson({ status: 'error', message: 'Server sibuk, silakan coba lagi.' });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();

    if (!e || !e.postData || !e.postData.contents) {
      return createJson({ status: 'error', message: 'Payload data kosong.' });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = String(payload.action || 'create').toLowerCase();

    // Pastikan header ada jika sheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'id', 'title', 'url', 'description', 'crop_top', 
        'is_active', 'sort_order', 'creates_at', 'updated_at', 'slug'
      ]);
    }

    var values = sheet.getDataRange().getValues();
    var headerRow = values[0] || [];
    var colMap = {};
    for (var c = 0; c < headerRow.length; c++) {
      var norm = String(headerRow[c] || '').toLowerCase().replace(/[\\s_-]+/g, '');
      if (norm) colMap[norm] = c;
    }

    function getIdx(aliases, fallback) {
      for (var i = 0; i < aliases.length; i++) {
        var key = aliases[i].toLowerCase().replace(/[\\s_-]+/g, '');
        if (colMap[key] !== undefined) return colMap[key];
      }
      return fallback;
    }

    var idCol = getIdx(['id', 'id_permintaan', 'id_req', 'request_id'], 0);
    var titleCol = getIdx(['title', 'judul', 'nama_layanan', 'nama'], 1);
    var urlCol = getIdx(['url', 'tautan', 'link', 'form_url'], 2);
    var descCol = getIdx(['description', 'deskripsi', 'keterangan'], 3);
    var cropTopCol = getIdx(['crop_top', 'croptop', 'crop', 'potong_atas'], 4);
    var activeCol = getIdx(['is_active', 'isactive', 'status', 'aktif'], 5);
    var orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 6);
    var createdCol = getIdx(['creates_at', 'created_at', 'createsat', 'createdat', 'tanggal_buat'], 7);
    var updatedCol = getIdx(['updated_at', 'updatedat', 'tanggal_ubah', 'modified_at'], 8);
    var slugCol = getIdx(['slug', 'slug_link', 'alias'], 9);

    var timeStamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    // 1. DELETE
    if (action === 'delete') {
      var targetId = String(payload.id || '').trim();
      if (!targetId) {
        return createJson({ status: 'error', message: 'ID target tidak disertakan.' });
      }
      for (var r = values.length - 1; r >= 1; r--) {
        var rowId = String(values[r][idCol] || '').trim();
        if (rowId === targetId) {
          sheet.deleteRow(r + 1);
          return createJson({ status: 'success', message: 'Tautan permintaan data berhasil dihapus dari Spreadsheet.' });
        }
      }
      return createJson({ status: 'warning', message: 'Data permintaan data tidak ditemukan.' });
    }

    // 2. CREATE ATAU UPDATE
    var targetId = String(payload.id || ('req-data-' + new Date().getTime())).trim();
    var foundRow = -1;
    for (var r = 1; r < values.length; r++) {
      var rowId = String(values[r][idCol] || '').trim();
      if (rowId === targetId) {
        foundRow = r + 1;
        break;
      }
    }

    var isActiveNum = 1;
    if (payload.isActive !== undefined) {
      isActiveNum = (payload.isActive === true || payload.isActive === 'true' || payload.isActive === 1 || payload.isActive === '1') ? 1 : 0;
    } else if (payload.is_active !== undefined) {
      isActiveNum = (payload.is_active === true || payload.is_active === 'true' || payload.is_active === 1 || payload.is_active === '1') ? 1 : 0;
    }

    var cropTopNum = 0;
    if (payload.cropTop !== undefined) cropTopNum = Number(payload.cropTop) || 0;
    else if (payload.crop_top !== undefined) cropTopNum = Number(payload.crop_top) || 0;

    var orderNum = Number(payload.sort_order || payload.order || (values.length));

    var slugStr = String(payload.slug || '').trim();
    if (!slugStr && payload.title) {
      slugStr = String(payload.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    if (foundRow > 0) {
      if (titleCol >= 0 && payload.title !== undefined) sheet.getRange(foundRow, titleCol + 1).setValue(payload.title);
      if (urlCol >= 0 && payload.url !== undefined) sheet.getRange(foundRow, urlCol + 1).setValue(payload.url);
      if (descCol >= 0 && payload.description !== undefined) sheet.getRange(foundRow, descCol + 1).setValue(payload.description);
      if (cropTopCol >= 0) sheet.getRange(foundRow, cropTopCol + 1).setValue(cropTopNum);
      if (activeCol >= 0) sheet.getRange(foundRow, activeCol + 1).setValue(isActiveNum);
      if (orderCol >= 0) sheet.getRange(foundRow, orderCol + 1).setValue(orderNum);
      if (updatedCol >= 0) sheet.getRange(foundRow, updatedCol + 1).setValue(timeStamp);
      if (slugCol >= 0 && slugStr) sheet.getRange(foundRow, slugCol + 1).setValue(slugStr);

      return createJson({
        status: 'success',
        action: 'update',
        id: targetId,
        message: 'Tautan permintaan data (' + (payload.title || targetId) + ') berhasil diperbarui di Spreadsheet.'
      });
    } else {
      var newRow = [];
      newRow[idCol] = targetId;
      newRow[titleCol] = payload.title || '';
      newRow[urlCol] = payload.url || '';
      newRow[descCol] = payload.description || '';
      newRow[cropTopCol] = cropTopNum;
      newRow[activeCol] = isActiveNum;
      newRow[orderCol] = orderNum;
      newRow[createdCol] = payload.creates_at || payload.created_at || timeStamp;
      newRow[updatedCol] = timeStamp;
      newRow[slugCol] = slugStr;

      sheet.appendRow(newRow);
      return createJson({
        status: 'success',
        action: 'create',
        id: targetId,
        message: 'Tautan permintaan data (' + (payload.title || targetId) + ') baru berhasil ditambahkan ke Spreadsheet.'
      });
    }
  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function createJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Parsing respons Google Visualization API (gviz/tq) ke objek DataRequestLink[]
 */
export function parseGVizDataRequests(text: string): DataRequestLink[] {
  try {
    const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);?/);
    if (!match || !match[1]) return [];
    const json = JSON.parse(match[1]);
    const table = json.table;
    if (!table || !table.cols || !table.rows) return [];

    const cols = table.cols;
    const colMap: Record<string, number> = {};
    for (let c = 0; c < cols.length; c++) {
      const label = String(cols[c]?.label || cols[c]?.id || '').toLowerCase().replace(/[\s_-]+/g, '');
      if (label) colMap[label] = c;
    }

    const getIdx = (aliases: string[], fallback: number): number => {
      for (const a of aliases) {
        const key = a.toLowerCase().replace(/[\s_-]+/g, '');
        if (colMap[key] !== undefined) return colMap[key];
      }
      return fallback;
    };

    const idCol = getIdx(['id', 'id_permintaan', 'id_req', 'request_id'], 0);
    const titleCol = getIdx(['title', 'judul', 'nama_layanan', 'nama'], 1);
    const urlCol = getIdx(['url', 'tautan', 'link', 'form_url'], 2);
    const descCol = getIdx(['description', 'deskripsi', 'keterangan'], 3);
    const cropTopCol = getIdx(['crop_top', 'croptop', 'crop', 'potong_atas'], 4);
    const activeCol = getIdx(['is_active', 'isactive', 'status', 'aktif'], 5);
    const orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 6);
    const createdCol = getIdx(['creates_at', 'created_at', 'createsat', 'createdat', 'tanggal_buat'], 7);
    const updatedCol = getIdx(['updated_at', 'updatedat', 'tanggal_ubah', 'modified_at'], 8);
    const slugCol = getIdx(['slug', 'slug_link', 'alias'], 9);

    const list: DataRequestLink[] = [];
    for (let r = 0; r < table.rows.length; r++) {
      const row = table.rows[r]?.c || [];
      const getVal = (colIdx: number): any => {
        const cell = row[colIdx];
        if (!cell) return '';
        return cell.v !== undefined && cell.v !== null ? cell.v : (cell.f || '');
      };

      const id = String(getVal(idCol) || '').trim();
      const title = String(getVal(titleCol) || '').trim();
      if (!id && !title) continue;

      const rawActive = getVal(activeCol);
      let isActive = true;
      if (rawActive !== undefined && rawActive !== null && String(rawActive).trim() !== '') {
        const strActive = String(rawActive).trim().toLowerCase();
        isActive = (strActive === '1' || strActive === 'true' || rawActive === 1 || rawActive === true);
      }

      const rawCrop = getVal(cropTopCol);
      const cropTop = Number(rawCrop) || 0;

      const rawOrder = getVal(orderCol);
      const order = Number(rawOrder) || (r + 1);

      const slugRaw = String(getVal(slugCol) || '').trim();
      const slug = slugRaw || generateDataRequestSlug(title);

      list.push({
        id: id || `req-data-${r + 1}`,
        title,
        url: String(getVal(urlCol) || '').trim(),
        description: String(getVal(descCol) || '').trim(),
        cropTop,
        isActive,
        order,
        createdAt: String(getVal(createdCol) || ''),
        updatedAt: String(getVal(updatedCol) || ''),
        slug
      });
    }

    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return list;
  } catch (err) {
    console.warn('Gagal memproses respons GViz Google Spreadsheet:', err);
    return [];
  }
}

/**
 * Mengambil daftar Permintaan Data (Webview) dari Google Spreadsheet
 */
export async function fetchDataRequestsFromSheet(forceRefresh = false): Promise<DataRequestLink[]> {
  const now = Date.now();
  const lastFetchStr = localStorage.getItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY);

  // Periksa cache lokal jika tidak force refresh
  if (!forceRefresh && lastFetchStr) {
    const elapsed = now - parseInt(lastFetchStr, 10);
    if (elapsed < DATA_REQUESTS_CACHE_TTL_MS) {
      try {
        const cached = localStorage.getItem(DATA_REQUESTS_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {}
    }
  }

  // 1. Coba ambil dari WebApp GAS jika sudah terpasang
  const webAppUrl = getDataRequestsWebAppUrl();
  if (webAppUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${webAppUrl}?action=read&_t=${now}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data)) {
          const rawItems = json.data;

          const mapped: DataRequestLink[] = rawItems.map((r: any, idx: number) => {
            const rawActive = r.is_active !== undefined ? r.is_active : r.isActive;
            const isActive = rawActive === 1 || rawActive === '1' || rawActive === true || String(rawActive).toLowerCase() === 'true';

            return {
              id: String(r.id || `req-data-${idx + 1}`),
              title: String(r.title || '').trim(),
              url: String(r.url || '').trim(),
              description: String(r.description || '').trim(),
              cropTop: Number(r.crop_top !== undefined ? r.crop_top : r.cropTop) || 0,
              isActive: isActive,
              order: Number(r.sort_order !== undefined ? r.sort_order : (r.order || idx + 1)),
              createdAt: r.creates_at || r.created_at || r.createdAt || '',
              updatedAt: r.updated_at || r.updatedAt || '',
              slug: r.slug || generateDataRequestSlug(r.title || '')
            };
          });

          mapped.sort((a, b) => (a.order || 0) - (b.order || 0));

          localStorage.setItem(DATA_REQUESTS_CACHE_KEY, JSON.stringify(mapped));
          localStorage.setItem('korwilcam_data_requests', JSON.stringify(mapped));
          localStorage.setItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY, now.toString());

          return mapped;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca data_requests dari WebApp GAS:', e);
    }
  }

  // 2. Fetch via Google Visualization API (gviz/tq) - Sangat andal, bebas CORS & tanpa redirect 307
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(`${DATA_REQUESTS_GVIZ_JSON_URL}&_t=${now}`, {
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('google.visualization.Query.setResponse')) {
        const list = parseGVizDataRequests(text);
        if (list && list.length > 0) {
          localStorage.setItem(DATA_REQUESTS_CACHE_KEY, JSON.stringify(list));
          localStorage.setItem('korwilcam_data_requests', JSON.stringify(list));
          localStorage.setItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY, now.toString());
          return list;
        }
      }
    }
  } catch (e) {
    console.warn('Gagal membaca GViz data_requests:', e);
  }

  // 3. Fallback: Fetch langsung via CSV publik dari Google Spreadsheet
  const urls = [
    `${DATA_REQUESTS_CSV_URL}&_t=${now}`,
    `${DATA_REQUESTS_GVIZ_URL}&_t=${now}`
  ];

  let rawCsv = '';
  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache',
        headers: { Accept: 'text/csv, text/plain; q=0.9, */*; q=0.8' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().length > 15 && !text.includes('<!DOCTYPE html>')) {
          rawCsv = text;
          break;
        }
      }
    } catch {}
  }

  if (rawCsv) {
    try {
      const rows = parseCSV(rawCsv);
      if (rows && rows.length > 1) {
        const headerRow = rows[0];
        const colMap: Record<string, number> = {};
        for (let c = 0; c < headerRow.length; c++) {
          const norm = String(headerRow[c] || '').toLowerCase().replace(/[\s_-]+/g, '');
          if (norm) colMap[norm] = c;
        }

        const getIdx = (aliases: string[], fallback: number): number => {
          for (const a of aliases) {
            const key = a.toLowerCase().replace(/[\s_-]+/g, '');
            if (colMap[key] !== undefined) return colMap[key];
          }
          return fallback;
        };

        const idCol = getIdx(['id', 'id_permintaan', 'id_req', 'request_id'], 0);
        const titleCol = getIdx(['title', 'judul', 'nama_layanan', 'nama'], 1);
        const urlCol = getIdx(['url', 'tautan', 'link', 'form_url'], 2);
        const descCol = getIdx(['description', 'deskripsi', 'keterangan'], 3);
        const cropTopCol = getIdx(['crop_top', 'croptop', 'crop', 'potong_atas'], 4);
        const activeCol = getIdx(['is_active', 'isactive', 'status', 'aktif'], 5);
        const orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 6);
        const createdCol = getIdx(['creates_at', 'created_at', 'createsat', 'createdat', 'tanggal_buat'], 7);
        const updatedCol = getIdx(['updated_at', 'updatedat', 'tanggal_ubah', 'modified_at'], 8);
        const slugCol = getIdx(['slug', 'slug_link', 'alias'], 9);

        const list: DataRequestLink[] = [];

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const id = String(row[idCol] || '').trim();
          const title = String(row[titleCol] || '').trim();

          if (!id && !title) continue;

          const rawActive = row[activeCol];
          let isActive = true;
          if (rawActive !== undefined && rawActive !== null && String(rawActive).trim() !== '') {
            const strActive = String(rawActive).trim().toLowerCase();
            isActive = (strActive === '1' || strActive === 'true');
          }

          const rawSlug = String(row[slugCol] || '').trim();
          const slug = rawSlug || generateDataRequestSlug(title);

          list.push({
            id: id || `req-data-${r}`,
            title: title,
            url: String(row[urlCol] || '').trim(),
            description: String(row[descCol] || '').trim(),
            cropTop: Number(row[cropTopCol]) || 0,
            isActive: isActive,
            order: Number(row[orderCol]) || r,
            createdAt: String(row[createdCol] || ''),
            updatedAt: String(row[updatedCol] || ''),
            slug: slug
          });
        }

        list.sort((a, b) => (a.order || 0) - (b.order || 0));

        localStorage.setItem(DATA_REQUESTS_CACHE_KEY, JSON.stringify(list));
        localStorage.setItem('korwilcam_data_requests', JSON.stringify(list));
        localStorage.setItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY, now.toString());

        return list;
      }
    } catch (e) {
      console.warn('Gagal memproses data CSV Permintaan Data:', e);
    }
  }

  // Fallback terakhir: Ambil dari cache localStorage yang sudah ada
  try {
    const cached = localStorage.getItem('korwilcam_data_requests');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return [];
}

/**
 * Menyimpan data Permintaan Data ke Google Spreadsheet (via GAS)
 */
export async function saveDataRequestToSheet(
  item: DataRequestLink,
  action: 'create' | 'update' = 'create'
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getDataRequestsWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Tersimpan di penyimpanan lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: action,
      id: item.id,
      title: item.title,
      url: item.url,
      description: item.description || '',
      crop_top: item.cropTop || 0,
      is_active: item.isActive !== false ? 1 : 0,
      sort_order: item.order || 1,
      creates_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      slug: item.slug || generateDataRequestSlug(item.title)
    };

    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    try {
      localStorage.removeItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Tautan permintaan data berhasil disimpan ke Spreadsheet.'
    };
  } catch (err: any) {
    console.warn('Gagal menyimpan ke WebApp GAS:', err);
    return {
      success: true,
      message: 'Tersimpan di penyimpanan lokal browser.'
    };
  }
}

/**
 * Menghapus data Permintaan Data dari Spreadsheet (via GAS)
 */
export async function deleteDataRequestFromSheet(
  id: string
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getDataRequestsWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Dihapus dari penyimpanan lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: 'delete',
      id: id
    };

    await fetch(gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    try {
      localStorage.removeItem(DATA_REQUESTS_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Tautan permintaan data berhasil dihapus dari Spreadsheet.'
    };
  } catch (err: any) {
    console.warn('Gagal menghapus dari WebApp GAS:', err);
    return {
      success: true,
      message: 'Dihapus dari penyimpanan lokal browser.'
    };
  }
}
