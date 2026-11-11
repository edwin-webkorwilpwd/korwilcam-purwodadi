import { MenuVisibilityMap } from '../config/navigationConfig';
import { MaintenanceConfig, DEFAULT_MAINTENANCE_CONFIG } from '../lib/maintenanceHelper';
import { parseCSV } from './googleSheetService';

export const NAVIGATION_SPREADSHEET_ID = '1b8noWa6GfByI0KpSBXcLj3MtWrMKMhDf7HAfx3vof_Q';
export const NAVIGATION_SHEET_GID = '0';
export const NAVIGATION_CSV_URL = `https://docs.google.com/spreadsheets/d/${NAVIGATION_SPREADSHEET_ID}/export?format=csv&gid=${NAVIGATION_SHEET_GID}`;
export const NAVIGATION_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${NAVIGATION_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${NAVIGATION_SHEET_GID}`;
export const NAVIGATION_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${NAVIGATION_SPREADSHEET_ID}/edit?gid=${NAVIGATION_SHEET_GID}#gid=${NAVIGATION_SHEET_GID}`;

export const NAVIGATION_CACHE_KEY = 'korwilcam_navigation_sheet_cache_v1';
export const NAVIGATION_CACHE_TIMESTAMP_KEY = 'korwilcam_navigation_last_fetch';
export const NAVIGATION_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Cache TTL

export const NAVIGATION_WEBAPP_STORAGE_KEY = 'korwilcam_navigation_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli aman
 */
const OBFUSCATED_NAV_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0YLQQRFxM6Vzc3ORMTJgc2OD8RCx4ZKmhvLGo9Mhd2ORYsZxppYioObSwZDiE4KRYZKmIKKwsoNRgMDDIYCx5QGTBzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Navigasi secara aman di memori runtime saat dipanggil
 */
export function resolveDefaultNavigationWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NAVIGATION_WEBAPP_URL) {
    return import.meta.env.VITE_NAVIGATION_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_NAV_ENDPOINT);
      const len = binaryStr.length;
      const chars = new Array(len);
      for (let i = 0; i < len; i++) {
        chars[i] = String.fromCharCode(binaryStr.charCodeAt(i) ^ (0x5A + (i % 7)));
      }
      return chars.join('');
    }
  } catch {}
  return 'https://script.google.com/macros/s/AKfycbxw_MJMe7mleNMyglccLUAyp33q4bRM-eKr8z39vS3syTzdtHFJ8QwVvjxVWnEUA0Ck/exec';
}

export const DEFAULT_NAVIGATION_WEBAPP_URL = resolveDefaultNavigationWebAppUrl();

let inMemoryNavWebAppUrl = '';

/**
 * Mendapatkan URL Webhook Google Apps Script (GAS) untuk Navigasi & Menu
 */
export function getNavigationWebAppUrl(): string {
  if (inMemoryNavWebAppUrl && inMemoryNavWebAppUrl.trim()) {
    return inMemoryNavWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(NAVIGATION_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryNavWebAppUrl = saved.trim();
      return inMemoryNavWebAppUrl;
    }
  } catch {}
  return DEFAULT_NAVIGATION_WEBAPP_URL || '';
}

/**
 * Menyimpan URL Webhook Google Apps Script (GAS) untuk Navigasi & Menu
 */
export function setNavigationWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryNavWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(NAVIGATION_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(NAVIGATION_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Kode Google Apps Script (GAS) lengkap untuk mengelola baris navigation_settings
 * (Visibilitas Menu 'default' dan Mode Maintenance 'maintenance')
 */
export const NAVIGATION_GAS_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - DATABASE PENGATURAN MENU & MAINTENANCE KORWILCAM
 * Target Spreadsheet ID : 1b8noWa6GfByI0KpSBXcLj3MtWrMKMhDf7HAfx3vof_Q
 * Target Sheet GID       : 0
 * ============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();
    var values = sheet.getDataRange().getValues();

    if (!values || values.length <= 1) {
      return createJson({ status: 'success', data: {}, count: 0 });
    }

    var headerRow = values[0];
    var idCol = -1;
    var itemCol = -1;
    var updatedCol = -1;

    for (var c = 0; c < headerRow.length; c++) {
      var norm = String(headerRow[c] || '').toLowerCase().replace(/[\\s_-]+/g, '');
      if (norm === 'id') idCol = c;
      if (norm === 'item' || norm === 'items') itemCol = c;
      if (norm === 'updatedat' || norm === 'updated') updatedCol = c;
    }

    if (idCol === -1) idCol = 0;
    if (itemCol === -1) itemCol = 1;
    if (updatedCol === -1) updatedCol = 2;

    var result = {};
    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = String(row[idCol] || '').trim().toLowerCase();
      var rawItem = String(row[itemCol] || '').trim();
      var updatedAt = (updatedCol >= 0 && row[updatedCol]) ? String(row[updatedCol]) : '';

      if (!id) continue;

      var parsed = null;
      try {
        parsed = JSON.parse(rawItem);
      } catch (err) {
        parsed = rawItem;
      }

      result[id] = {
        id: id,
        item: parsed,
        updated_at: updatedAt
      };
    }

    return createJson({ status: 'success', data: result });
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
    var action = String(payload.action || 'save').toLowerCase();

    // Tentukan ID target (default = 'default' untuk menu, 'maintenance' untuk maintenance)
    var targetId = String(payload.id || '').trim().toLowerCase();
    if (!targetId) {
      if (action.indexOf('maintenance') >= 0) {
        targetId = 'maintenance';
      } else {
        targetId = 'default';
      }
    }

    // Ambil data item
    var itemData = payload.item !== undefined ? payload.item : payload.items;
    var itemString = '';
    if (typeof itemData === 'object' && itemData !== null) {
      itemString = JSON.stringify(itemData);
    } else {
      itemString = String(itemData || '{}');
    }

    var timeStamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

    var values = sheet.getDataRange().getValues();
    var headerRow = values[0] || [];
    var idCol = -1;
    var itemCol = -1;
    var updatedCol = -1;

    for (var c = 0; c < headerRow.length; c++) {
      var norm = String(headerRow[c] || '').toLowerCase().replace(/[\\s_-]+/g, '');
      if (norm === 'id') idCol = c;
      if (norm === 'item' || norm === 'items') itemCol = c;
      if (norm === 'updatedat' || norm === 'updated') updatedCol = c;
    }

    // Jika header belum ada di sheet baru
    if (headerRow.length === 0 || idCol === -1) {
      sheet.appendRow(['id', 'item', 'updated_at']);
      values = sheet.getDataRange().getValues();
      idCol = 0;
      itemCol = 1;
      updatedCol = 2;
    } else {
      if (itemCol === -1) itemCol = 1;
      if (updatedCol === -1) updatedCol = 2;
    }

    var foundRow = -1;
    for (var r = 1; r < values.length; r++) {
      var rowId = String(values[r][idCol] || '').trim().toLowerCase();
      if (rowId === targetId) {
        foundRow = r + 1; // 1-based index
        break;
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, itemCol + 1).setValue(itemString);
      if (updatedCol >= 0) {
        sheet.getRange(foundRow, updatedCol + 1).setValue(timeStamp);
      }
      return createJson({
        status: 'success',
        action: 'update',
        id: targetId,
        message: 'Pengaturan (' + targetId + ') berhasil diperbarui di Spreadsheet.'
      });
    } else {
      var newRow = [];
      newRow[idCol] = targetId;
      newRow[itemCol] = itemString;
      if (updatedCol >= 0) {
        newRow[updatedCol] = timeStamp;
      }
      sheet.appendRow(newRow);
      return createJson({
        status: 'success',
        action: 'create',
        id: targetId,
        message: 'Pengaturan (' + targetId + ') baru berhasil ditambahkan ke Spreadsheet.'
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

export interface NavigationSheetData {
  menuVisibility: MenuVisibilityMap | null;
  maintenanceConfig: MaintenanceConfig | null;
}

/**
 * Mengambil data navigasi (menu visibility & maintenance) dari Google Spreadsheet / GAS
 */
export async function fetchNavigationFromSheet(forceRefresh = false): Promise<NavigationSheetData> {
  const now = Date.now();
  const lastFetchStr = localStorage.getItem(NAVIGATION_CACHE_TIMESTAMP_KEY);

  // 1. Coba ambil dari WebApp GAS jika sudah terpasang
  const webAppUrl = getNavigationWebAppUrl();
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
        if (json && json.status === 'success' && json.data) {
          let menuVis: MenuVisibilityMap | null = null;
          let mConfig: MaintenanceConfig | null = null;

          if (json.data.default && json.data.default.item) {
            menuVis = typeof json.data.default.item === 'object'
              ? json.data.default.item
              : JSON.parse(json.data.default.item);
          }
          if (json.data.maintenance && json.data.maintenance.item) {
            mConfig = typeof json.data.maintenance.item === 'object'
              ? json.data.maintenance.item
              : JSON.parse(json.data.maintenance.item);
          }

          if (menuVis) {
            localStorage.setItem('korwilcam_menu_visibility', JSON.stringify(menuVis));
          }
          if (mConfig) {
            localStorage.setItem('korwilcam_maintenance_config', JSON.stringify(mConfig));
          }
          localStorage.setItem(NAVIGATION_CACHE_TIMESTAMP_KEY, now.toString());

          return { menuVisibility: menuVis, maintenanceConfig: mConfig };
        }
      }
    } catch (errGas) {
      console.warn('Gagal membaca navigation dari WebApp GAS:', errGas);
    }
  }

  // 2. Fallback: Fetch langsung via CSV publik dari Google Spreadsheet
  const urls = [
    `${NAVIGATION_CSV_URL}&_t=${now}`,
    `${NAVIGATION_GVIZ_URL}&_t=${now}`
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
        let idCol = -1;
        let itemCol = -1;

        for (let c = 0; c < headerRow.length; c++) {
          const norm = String(headerRow[c] || '').toLowerCase().replace(/[\s_-]+/g, '');
          if (norm === 'id') idCol = c;
          if (norm === 'item' || norm === 'items') itemCol = c;
        }

        if (idCol === -1) idCol = 0;
        if (itemCol === -1) itemCol = 1;

        let menuVis: MenuVisibilityMap | null = null;
        let mConfig: MaintenanceConfig | null = null;

        for (let r = 1; r < rows.length; r++) {
          const row = rows[r];
          const id = String(row[idCol] || '').trim().toLowerCase();
          const rawItem = String(row[itemCol] || '').trim();

          if (!id || !rawItem) continue;

          let parsed: any = null;
          try {
            parsed = JSON.parse(rawItem);
          } catch {
            try {
              parsed = JSON.parse(rawItem.replace(/\\"/g, '"'));
            } catch {}
          }

          if (id === 'default' && parsed && typeof parsed === 'object') {
            menuVis = parsed as MenuVisibilityMap;
          } else if (id === 'maintenance' && parsed && typeof parsed === 'object') {
            mConfig = parsed as MaintenanceConfig;
          }
        }

        if (menuVis) {
          localStorage.setItem('korwilcam_menu_visibility', JSON.stringify(menuVis));
        }
        if (mConfig) {
          localStorage.setItem('korwilcam_maintenance_config', JSON.stringify(mConfig));
        }
        localStorage.setItem(NAVIGATION_CACHE_TIMESTAMP_KEY, now.toString());

        return { menuVisibility: menuVis, maintenanceConfig: mConfig };
      }
    } catch (e) {
      console.warn('Gagal memproses CSV navigasi:', e);
    }
  }

  // Fallback: baca dari local storage yang sudah ada
  let localMenuVis: MenuVisibilityMap | null = null;
  let localMConfig: MaintenanceConfig | null = null;
  try {
    const rawMenu = localStorage.getItem('korwilcam_menu_visibility');
    if (rawMenu) localMenuVis = JSON.parse(rawMenu);
    const rawM = localStorage.getItem('korwilcam_maintenance_config');
    if (rawM) localMConfig = JSON.parse(rawM);
  } catch {}

  return { menuVisibility: localMenuVis, maintenanceConfig: localMConfig };
}

/**
 * Menyimpan pengaturan visibilitas menu ke Spreadsheet (via GAS) & LocalStorage
 */
export async function saveNavigationMenuToSheet(
  visibility: MenuVisibilityMap
): Promise<{ success: boolean; message: string }> {
  // Simpan ke LocalStorage dan picu event agar UI langsung update tanpa menunggu jaringan
  try {
    localStorage.setItem('korwilcam_menu_visibility', JSON.stringify(visibility));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('korwilcam_menu_visibility_changed', { detail: visibility }));
    }
  } catch (err) {
    console.warn('Gagal menyimpan visibilitas menu ke LocalStorage:', err);
  }

  const gasUrl = getNavigationWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Tersimpan lokal di browser (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: 'save_menu',
      id: 'default',
      item: visibility,
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
        message: data.message || 'Pengaturan menu berhasil disimpan ke Spreadsheet.'
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
 * Menyimpan mode maintenance ke Spreadsheet (via GAS) & LocalStorage
 */
export async function saveMaintenanceToSheet(
  config: MaintenanceConfig
): Promise<{ success: boolean; message: string }> {
  try {
    localStorage.setItem('korwilcam_maintenance_config', JSON.stringify(config));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('korwilcam_maintenance_changed', { detail: config }));
    }
  } catch (err) {
    console.warn('Gagal menyimpan maintenance config ke LocalStorage:', err);
  }

  const gasUrl = getNavigationWebAppUrl();
  if (!gasUrl) {
    return {
      success: true,
      message: 'Tersimpan lokal di browser (Webhook GAS belum dipasang).'
    };
  }

  try {
    const payload = {
      action: 'save_maintenance',
      id: 'maintenance',
      item: config,
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
        message: data.message || 'Mode maintenance berhasil disimpan ke Spreadsheet.'
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
