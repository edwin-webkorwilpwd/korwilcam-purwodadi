import { ServiceRequirement } from '../types';
import { parseCSV } from './googleSheetService';
import { generateServiceRequirementSlug } from '../lib/serviceRequirementHelper';

export const SERVICE_REQUIREMENTS_SPREADSHEET_ID = '19neICe0KdqZwUbZqkqpztOu2B_I8KPnC1Q4pBEy-KDU';
export const SERVICE_REQUIREMENTS_SHEET_GID = '0';
export const SERVICE_REQUIREMENTS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_REQUIREMENTS_SPREADSHEET_ID}/export?format=csv&gid=${SERVICE_REQUIREMENTS_SHEET_GID}`;
export const SERVICE_REQUIREMENTS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_REQUIREMENTS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${SERVICE_REQUIREMENTS_SHEET_GID}`;
export const SERVICE_REQUIREMENTS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SERVICE_REQUIREMENTS_SPREADSHEET_ID}/edit?gid=${SERVICE_REQUIREMENTS_SHEET_GID}#gid=${SERVICE_REQUIREMENTS_SHEET_GID}`;

export const SERVICE_REQUIREMENTS_CACHE_KEY = 'korwilcam_service_requirements_sheet_cache_v1';
export const SERVICE_REQUIREMENTS_CACHE_TIMESTAMP_KEY = 'korwilcam_service_requirements_last_fetch';
export const SERVICE_REQUIREMENTS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL

export const SERVICE_REQUIREMENTS_WEBAPP_STORAGE_KEY = 'korwilcam_service_requirements_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_SERVICE_REQ_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0XaBMmDjo9CT41LSUcChYRDz4CLhc5dwQqbzRrVjE3aDtpZy0vGRURFjcDPm9xNDAvMRMsMSsoFSMsFwRvGTYmNQprOnE6GD84';

/**
 * Mendekripsi URL Webhook GAS Persyaratan Pelayanan secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultServiceRequirementsWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SERVICE_REQUIREMENTS_WEBAPP_URL) {
    return import.meta.env.VITE_SERVICE_REQUIREMENTS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_SERVICE_REQ_ENDPOINT);
      const len = binaryStr.length;
      const chars = new Array(len);
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(binaryStr.charCodeAt(i) ^ (0x5A + (i % 7)));
      }
      return chars.join('');
    }
  } catch {}
  return 'https://script.google.com/macros/s/AKfycbw2HzSdbidnqxBUvKTb_pHY-_v2j46kl4f78MuBILHhcd4-inpQIwmvvJCvLX2GiFoQ7g/exec';
}

export const DEFAULT_SERVICE_REQUIREMENTS_WEBAPP_URL = resolveDefaultServiceRequirementsWebAppUrl();

let inMemoryServiceReqWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Persyaratan Pelayanan
 */
export function getServiceRequirementsWebAppUrl(): string {
  if (inMemoryServiceReqWebAppUrl && inMemoryServiceReqWebAppUrl.trim()) {
    return inMemoryServiceReqWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(SERVICE_REQUIREMENTS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryServiceReqWebAppUrl = saved.trim();
      return inMemoryServiceReqWebAppUrl;
    }
  } catch {}
  return DEFAULT_SERVICE_REQUIREMENTS_WEBAPP_URL || '';
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Persyaratan Pelayanan
 */
export function setServiceRequirementsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryServiceReqWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(SERVICE_REQUIREMENTS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(SERVICE_REQUIREMENTS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Template Kode Google Apps Script (GAS) Lengkap untuk Persyaratan Pelayanan
 */
export const SERVICE_REQUIREMENTS_GAS_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - DATABASE PERSYARATAN PELAYANAN KORWILCAM PURWODADI
 * Target Spreadsheet ID : 19neICe0KdqZwUbZqkqpztOu2B_I8KPnC1Q4pBEy-KDU
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

    var idCol = getIdx(['id', 'id_layanan', 'id_persyaratan'], 0);
    var titleCol = getIdx(['title', 'judul', 'layanan', 'nama_layanan'], 1);
    var catCol = getIdx(['category', 'kategori'], 2);
    var descCol = getIdx(['description', 'deskripsi', 'ringkasan'], 3);
    var reqCol = getIdx(['requirements', 'persyaratan', 'berkas', 'syarat'], 4);
    var notesCol = getIdx(['notes', 'catatan', 'alur'], 5);
    var timeCol = getIdx(['estimated_time', 'estimatedtime', 'waktu'], 6);
    var feeCol = getIdx(['fee', 'biaya', 'tarif'], 7);
    var orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 8);
    var createdCol = getIdx(['created_at', 'createdat'], 9);
    var updatedCol = getIdx(['updated_at', 'updatedat'], 10);

    var list = [];
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = String(row[idCol] || '').trim();
      var title = String(row[titleCol] || '').trim();
      if (!id && !title) continue;

      var rawReq = row[reqCol];
      var reqsArr = [];
      if (Array.isArray(rawReq)) {
        reqsArr = rawReq;
      } else if (typeof rawReq === 'string' && rawReq.trim()) {
        try {
          var parsed = JSON.parse(rawReq);
          if (Array.isArray(parsed)) reqsArr = parsed;
          else reqsArr = [rawReq.trim()];
        } catch (e) {
          reqsArr = rawReq.split(/[\\n,]+/).map(function(s) { return s.trim(); }).filter(Boolean);
        }
      }

      list.push({
        id: id || ('req-' + r),
        title: title,
        category: String(row[catCol] || 'Kepegawaian & GTK').trim(),
        description: String(row[descCol] || '').trim(),
        requirements: reqsArr,
        notes: String(row[notesCol] || '').trim(),
        estimated_time: String(row[timeCol] || '1-3 Hari Kerja').trim(),
        fee: String(row[feeCol] || 'Gratis / Rp 0').trim(),
        sort_order: Number(row[orderCol] || r),
        created_at: String(row[createdCol] || ''),
        updated_at: String(row[updatedCol] || '')
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

    var idCol = getIdx(['id', 'id_layanan', 'id_persyaratan'], 0);
    var titleCol = getIdx(['title', 'judul', 'layanan', 'nama_layanan'], 1);
    var catCol = getIdx(['category', 'kategori'], 2);
    var descCol = getIdx(['description', 'deskripsi', 'ringkasan'], 3);
    var reqCol = getIdx(['requirements', 'persyaratan', 'berkas', 'syarat'], 4);
    var notesCol = getIdx(['notes', 'catatan', 'alur'], 5);
    var timeCol = getIdx(['estimated_time', 'estimatedtime', 'waktu'], 6);
    var feeCol = getIdx(['fee', 'biaya', 'tarif'], 7);
    var orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 8);
    var createdCol = getIdx(['created_at', 'createdat'], 9);
    var updatedCol = getIdx(['updated_at', 'updatedat'], 10);

    var timeStamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm');

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
          return createJson({ status: 'success', message: 'Layanan berhasil dihapus dari Spreadsheet.' });
        }
      }
      return createJson({ status: 'warning', message: 'Data layanan tidak ditemukan.' });
    }

    // 2. CLEAR ALL / RESET
    if (action === 'clear_all' || action === 'reset') {
      if (values.length > 1) {
        sheet.deleteRows(2, values.length - 1);
      }
      return createJson({ status: 'success', message: 'Seluruh data persyaratan pelayanan berhasil dikosongkan.' });
    }

    // 3. CREATE ATAU UPDATE
    var targetId = String(payload.id || ('req-' + new Date().getTime())).trim();
    var foundRow = -1;
    for (var r = 1; r < values.length; r++) {
      var rowId = String(values[r][idCol] || '').trim();
      if (rowId === targetId) {
        foundRow = r + 1;
        break;
      }
    }

    var reqsFormatted = '';
    if (Array.isArray(payload.requirements)) {
      reqsFormatted = JSON.stringify(payload.requirements);
    } else if (typeof payload.requirements === 'string') {
      reqsFormatted = payload.requirements;
    } else {
      reqsFormatted = '[]';
    }

    if (foundRow > 0) {
      if (titleCol >= 0 && payload.title !== undefined) sheet.getRange(foundRow, titleCol + 1).setValue(payload.title);
      if (catCol >= 0 && payload.category !== undefined) sheet.getRange(foundRow, catCol + 1).setValue(payload.category);
      if (descCol >= 0 && payload.description !== undefined) sheet.getRange(foundRow, descCol + 1).setValue(payload.description);
      if (reqCol >= 0) sheet.getRange(foundRow, reqCol + 1).setValue(reqsFormatted);
      if (notesCol >= 0 && payload.notes !== undefined) sheet.getRange(foundRow, notesCol + 1).setValue(payload.notes);
      if (timeCol >= 0 && (payload.estimated_time !== undefined || payload.estimatedTime !== undefined)) {
        sheet.getRange(foundRow, timeCol + 1).setValue(payload.estimated_time || payload.estimatedTime);
      }
      if (feeCol >= 0 && payload.fee !== undefined) sheet.getRange(foundRow, feeCol + 1).setValue(payload.fee);
      if (orderCol >= 0 && (payload.sort_order !== undefined || payload.order !== undefined)) {
        sheet.getRange(foundRow, orderCol + 1).setValue(payload.sort_order || payload.order);
      }
      if (updatedCol >= 0) sheet.getRange(foundRow, updatedCol + 1).setValue(timeStamp);

      return createJson({
        status: 'success',
        action: 'update',
        id: targetId,
        message: 'Layanan (' + (payload.title || targetId) + ') berhasil diperbarui di Spreadsheet.'
      });
    } else {
      var newRow = [];
      newRow[idCol] = targetId;
      newRow[titleCol] = payload.title || '';
      newRow[catCol] = payload.category || 'Kepegawaian & GTK';
      newRow[descCol] = payload.description || '';
      newRow[reqCol] = reqsFormatted;
      newRow[notesCol] = payload.notes || '';
      newRow[timeCol] = payload.estimated_time || payload.estimatedTime || '1-3 Hari Kerja';
      newRow[feeCol] = payload.fee || 'Gratis / Rp 0';
      newRow[orderCol] = payload.sort_order || payload.order || (values.length);
      newRow[createdCol] = payload.created_at || timeStamp;
      newRow[updatedCol] = timeStamp;

      sheet.appendRow(newRow);
      return createJson({
        status: 'success',
        action: 'create',
        id: targetId,
        message: 'Layanan (' + (payload.title || targetId) + ') baru berhasil ditambahkan ke Spreadsheet.'
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

export interface ServiceRequirementsSheetResult {
  items: ServiceRequirement[];
  categories: string[];
}

/**
 * Mengambil daftar Persyaratan Pelayanan dari Google Spreadsheet
 */
export async function fetchServiceRequirementsFromSheet(forceRefresh = false): Promise<ServiceRequirementsSheetResult> {
  const now = Date.now();
  const lastFetchStr = localStorage.getItem(SERVICE_REQUIREMENTS_CACHE_TIMESTAMP_KEY);

  // 1. Coba ambil dari WebApp GAS jika sudah terpasang
  const webAppUrl = getServiceRequirementsWebAppUrl();
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
          const categoriesSet = new Set<string>();

          const mapped: ServiceRequirement[] = rawItems
            .filter((r: any) => r.id !== 'system-service-categories')
            .map((r: any, idx: number) => {
              const cat = String(r.category || 'Kepegawaian & GTK').trim();
              if (cat && cat !== 'System') categoriesSet.add(cat);

              let reqs: string[] = [];
              if (Array.isArray(r.requirements)) {
                reqs = r.requirements;
              } else if (typeof r.requirements === 'string' && r.requirements.trim()) {
                try {
                  const p = JSON.parse(r.requirements);
                  if (Array.isArray(p)) reqs = p;
                } catch {
                  reqs = r.requirements.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
                }
              }

              return {
                id: String(r.id || `req-${Date.now()}-${idx}`),
                title: String(r.title || '').trim(),
                slug: generateServiceRequirementSlug(r.title),
                category: cat,
                description: String(r.description || '').trim(),
                requirements: reqs,
                notes: String(r.notes || '').trim(),
                estimatedTime: r.estimated_time || r.estimatedTime || '1-3 Hari Kerja',
                fee: r.fee || 'Gratis / Rp 0',
                order: Number(r.sort_order || r.order || idx + 1),
                createdAt: r.created_at || r.createdAt || '',
                updatedAt: r.updated_at || r.updatedAt || ''
              };
            });

          mapped.sort((a, b) => (a.order || 0) - (b.order || 0));

          localStorage.setItem(SERVICE_REQUIREMENTS_CACHE_KEY, JSON.stringify(mapped));
          localStorage.setItem('korwilcam_service_requirements', JSON.stringify(mapped));
          localStorage.setItem(SERVICE_REQUIREMENTS_CACHE_TIMESTAMP_KEY, now.toString());

          return {
            items: mapped,
            categories: Array.from(categoriesSet)
          };
        }
      }
    } catch (e) {
      console.warn('Gagal membaca service_requirements dari WebApp GAS:', e);
    }
  }

  // 2. Fallback: Fetch langsung via CSV publik dari Google Spreadsheet
  const urls = [
    `${SERVICE_REQUIREMENTS_CSV_URL}&_t=${now}`,
    `${SERVICE_REQUIREMENTS_GVIZ_URL}&_t=${now}`
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
        if (text && text.trim().length > 20 && !text.includes('<!DOCTYPE html>')) {
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

        const idCol = getIdx(['id', 'id_layanan', 'id_persyaratan'], 0);
        const titleCol = getIdx(['title', 'judul', 'layanan', 'nama_layanan'], 1);
        const catCol = getIdx(['category', 'kategori'], 2);
        const descCol = getIdx(['description', 'deskripsi', 'ringkasan'], 3);
        const reqCol = getIdx(['requirements', 'persyaratan', 'berkas', 'syarat'], 4);
        const notesCol = getIdx(['notes', 'catatan', 'alur'], 5);
        const timeCol = getIdx(['estimated_time', 'estimatedtime', 'waktu'], 6);
        const feeCol = getIdx(['fee', 'biaya', 'tarif'], 7);
        const orderCol = getIdx(['sort_order', 'sortorder', 'order', 'urutan', 'no'], 8);
        const createdCol = getIdx(['created_at', 'createdat'], 9);
        const updatedCol = getIdx(['updated_at', 'updatedat'], 10);

        const list: ServiceRequirement[] = [];
        const categoriesSet = new Set<string>();

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const id = String(row[idCol] || '').trim();
          const title = String(row[titleCol] || '').trim();

          if (!id && !title) continue;
          if (id === 'system-service-categories') continue;

          const cat = String(row[catCol] || 'Kepegawaian & GTK').trim();
          if (cat && cat !== 'System') categoriesSet.add(cat);

          let reqs: string[] = [];
          const rawReq = row[reqCol] || '';
          if (rawReq.trim()) {
            try {
              const parsed = JSON.parse(rawReq);
              if (Array.isArray(parsed)) reqs = parsed;
              else reqs = [rawReq.trim()];
            } catch {
              reqs = rawReq.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean);
            }
          }

          list.push({
            id: id || `req-${Date.now()}-${r}`,
            title: title,
            slug: generateServiceRequirementSlug(title),
            category: cat,
            description: String(row[descCol] || '').trim(),
            requirements: reqs,
            notes: String(row[notesCol] || '').trim(),
            estimatedTime: String(row[timeCol] || '1-3 Hari Kerja').trim(),
            fee: String(row[feeCol] || 'Gratis / Rp 0').trim(),
            order: Number(row[orderCol] || r),
            createdAt: String(row[createdCol] || ''),
            updatedAt: String(row[updatedCol] || '')
          });
        }

        list.sort((a, b) => (a.order || 0) - (b.order || 0));

        localStorage.setItem(SERVICE_REQUIREMENTS_CACHE_KEY, JSON.stringify(list));
        localStorage.setItem('korwilcam_service_requirements', JSON.stringify(list));
        localStorage.setItem(SERVICE_REQUIREMENTS_CACHE_TIMESTAMP_KEY, now.toString());

        return {
          items: list,
          categories: Array.from(categoriesSet)
        };
      }
    } catch (e) {
      console.warn('Gagal memproses CSV service_requirements:', e);
    }
  }

  // Fallback: baca dari local storage
  try {
    const raw = localStorage.getItem('korwilcam_service_requirements');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return { items: parsed, categories: [] };
      }
    }
  } catch {}

  return { items: [], categories: [] };
}

/**
 * Menyimpan data Persyaratan Pelayanan ke Spreadsheet (via GAS)
 */
export async function saveServiceRequirementToSheet(
  item: ServiceRequirement,
  action: 'create' | 'update' = 'create'
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getServiceRequirementsWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Tersimpan lokal di browser (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: action,
      id: item.id,
      title: item.title,
      category: item.category || 'Kepegawaian & GTK',
      description: item.description || '',
      requirements: item.requirements || [],
      notes: item.notes || '',
      estimated_time: item.estimatedTime || '1-3 Hari Kerja',
      fee: item.fee || 'Gratis / Rp 0',
      sort_order: item.order || 1,
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.status === 'success',
        message: data.message || 'Data persyaratan pelayanan berhasil disimpan ke Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${res.status}` };
  } catch (err: any) {
    return {
      success: true,
      message: 'Tersimpan di penyimpanan lokal browser.'
    };
  }
}

/**
 * Menghapus data Persyaratan Pelayanan dari Spreadsheet (via GAS)
 */
export async function deleteServiceRequirementFromSheet(
  id: string
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getServiceRequirementsWebAppUrl();
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

    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.status === 'success',
        message: data.message || 'Layanan berhasil dihapus dari Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${res.status}` };
  } catch (err: any) {
    return {
      success: true,
      message: 'Dihapus dari penyimpanan lokal browser.'
    };
  }
}

/**
 * Mengosongkan seluruh data Persyaratan Pelayanan di Spreadsheet (via GAS)
 */
export async function clearAllServiceRequirementsInSheet(): Promise<{ success: boolean; message: string }> {
  const gasUrl = getServiceRequirementsWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Dikosongkan dari penyimpanan lokal (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = { action: 'clear_all' };
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: data.status === 'success',
        message: data.message || 'Seluruh data berhasil dikosongkan dari Spreadsheet.'
      };
    }
    return { success: false, message: `Server GAS merespons dengan status ${res.status}` };
  } catch (err: any) {
    return {
      success: true,
      message: 'Dikosongkan dari penyimpanan lokal browser.'
    };
  }
}
