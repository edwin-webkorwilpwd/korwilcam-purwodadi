import { GalleryItem } from '../types';
import { parseCSV } from './googleSheetService';
import { 
  extractGalleryMetadata, 
  embedGalleryMetadata,
  isGoogleDriveFolderUrl,
  formatGoogleDriveImageUrl
} from '../lib/driveHelper';

export const GALLERY_SPREADSHEET_ID = '1FuIEC3zukJKASRAMl6PPUlrv46w4qKa1j9M2AnBR5-A';
export const GALLERY_SHEET_GID = '0';
export const GALLERY_CSV_URL = `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/export?format=csv&gid=${GALLERY_SHEET_GID}`;
export const GALLERY_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${GALLERY_SHEET_GID}`;
export const GALLERY_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/edit?gid=${GALLERY_SHEET_GID}#gid=${GALLERY_SHEET_GID}`;

export const GALLERY_CACHE_KEY = 'korwilcam_gallery_sheet_cache_v1';
export const GALLERY_CACHE_TIMESTAMP_KEY = 'korwilcam_gallery_sheet_last_fetch';
export const GALLERY_CACHE_TTL_MS = 3 * 60 * 1000; // 3 Menit Smart Cache TTL

export const GALLERY_WEBAPP_STORAGE_KEY = 'korwilcam_gallery_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Galeri disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli tidak terbuka 
 * di bundle production, DevTools, maupun scanner otomatis.
 */
const OBFUSCATED_GALLERY_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0aLCIfCG09DGNoKQUyERoUORYeGDkDNToYbBNmUW08NTwBMgQuMxtuKWoHDi4lLyYAMRQwGCpvKFEJODs5CDkBLWNzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS secara aman hanya di memori runtime saat dipanggil
 */
export function resolveDefaultGalleryWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GALLERY_WEBAPP_URL) {
    return import.meta.env.VITE_GALLERY_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_GALLERY_ENDPOINT);
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

export const DEFAULT_GALLERY_WEBAPP_URL = resolveDefaultGalleryWebAppUrl();

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

/**
 * =========================================================================
 * KODE RESMI GOOGLE APPS SCRIPT (GAS) - DATABASE GALERI FOTO KORWILCAM
 * =========================================================================
 * Salin seluruh kode di bawah ini ke editor Google Apps Script di Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1FuIEC3zukJKASRAMl6PPUlrv46w4qKa1j9M2AnBR5-A/edit?gid=0#gid=0
 * 
 * FUNGSI:
 * 1. Simpan (Create) album foto baru dari CMS
 * 2. Edit (Update) data album foto dari CMS
 * 3. Hapus (Delete) album foto dari CMS
 * 4. Tampil / Baca (Read) galeri foto
 * 
 * STRUKTUR KOLOM SPREADSHEET (Kolom A s/d I):
 * - Kolom A (1) : id               (ID Unik Album)
 * - Kolom B (2) : title            (Judul Album Kegiatan)
 * - Kolom C (3) : category         (Kategori Kegiatan)
 * - Kolom D (4) : image            (Link Foto Sampul Utama)
 * - Kolom E (5) : description      (Deskripsi Lengkap & Metadata)
 * - Kolom F (6) : date             (Tanggal Kegiatan)
 * - Kolom G (7) : created_at       (Waktu Pembuatan ISO / Tanggal)
 * - Kolom H (8) : images           (JSON Array Daftar Link Foto)
 * - Kolom I (9) : drive_folder_url (Link Folder Google Drive)
 * =========================================================================
 */
export const OFFICIAL_GALLERY_GAS_CODE = `/**
 * GOOGLE APPS SCRIPT - DATABASE GALERI FOTO KORWILCAM PURWODADI
 * Target Sheet ID : 1FuIEC3zukJKASRAMl6PPUlrv46w4qKa1j9M2AnBR5-A
 * Target Sheet GID: 0
 */

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
    var sheet = ss.getSheets()[0];
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'error',
        message: 'Payload data tidak ditemukan.'
      });
    }

    var payload = JSON.parse(e.postData.contents);
    var action = (payload.action || 'create').toLowerCase();

    var dataRange = sheet.getDataRange();
    var values = dataRange.getValues();

    // 1. ACTION: DELETE
    if (action === 'delete') {
      var deleteId = String(payload.id || '').trim();
      if (!deleteId) {
        return createJsonResponse({ status: 'error', message: 'ID album foto tidak disertakan.' });
      }

      var deleted = false;
      for (var r = values.length - 1; r >= 1; r--) {
        var rowId = String(values[r][0] || '').trim();
        if (rowId === deleteId) {
          sheet.deleteRow(r + 1);
          deleted = true;
          break;
        }
      }

      if (deleted) {
        return createJsonResponse({
          status: 'success',
          message: 'Album foto dengan ID "' + deleteId + '" berhasil dihapus dari Spreadsheet.'
        });
      } else {
        return createJsonResponse({
          status: 'warning',
          message: 'Album foto dengan ID "' + deleteId + '" tidak ditemukan di Spreadsheet.'
        });
      }
    }

    // 2. ACTION: UPDATE / EDIT
    if (action === 'update' || action === 'edit') {
      var updateId = String(payload.id || '').trim();
      var updateTitle = String(payload.title || '').trim();
      var targetRow = -1;

      for (var r = 1; r < values.length; r++) {
        var curId = String(values[r][0] || '').trim();
        if (curId && curId === updateId) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow === -1 && updateTitle) {
        for (var r = 1; r < values.length; r++) {
          var curTitle = String(values[r][1] || '').trim();
          if (curTitle && curTitle.toLowerCase() === updateTitle.toLowerCase()) {
            targetRow = r + 1;
            break;
          }
        }
      }

      if (targetRow > 0) {
        var existing = values[targetRow - 1];

        var finalId = updateId || existing[0];
        var finalTitle = (payload.title !== undefined) ? payload.title : existing[1];
        var finalCategory = (payload.category !== undefined) ? payload.category : existing[2];
        var finalImage = (payload.image !== undefined) ? payload.image : existing[3];
        var finalDesc = (payload.description !== undefined) ? payload.description : existing[4];
        var finalDate = (payload.date !== undefined) ? payload.date : existing[5];
        var finalCreatedAt = existing[6] || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        
        var finalImages = existing[7];
        if (payload.images !== undefined) {
          finalImages = Array.isArray(payload.images) ? JSON.stringify(payload.images) : String(payload.images);
        }

        var finalDriveUrl = (payload.drive_folder_url !== undefined)
          ? payload.drive_folder_url
          : ((payload.driveFolderUrl !== undefined) ? payload.driveFolderUrl : existing[8]);

        var updatedRow = [
          finalId,
          finalTitle,
          finalCategory,
          finalImage,
          finalDesc,
          finalDate,
          finalCreatedAt,
          finalImages,
          finalDriveUrl || ''
        ];

        sheet.getRange(targetRow, 1, 1, 9).setValues([updatedRow]);

        return createJsonResponse({
          status: 'success',
          message: 'Album foto "' + finalTitle + '" berhasil diperbarui di Spreadsheet.',
          row: targetRow
        });
      }
    }

    // 3. ACTION: CREATE (SIMPAN BARU)
    var newId = String(payload.id || ('gal-' + new Date().getTime())).trim();
    var newTitle = String(payload.title || '').trim();
    var newCategory = String(payload.category || 'Kegiatan').trim();
    var newImage = String(payload.image || '').trim();
    var newDesc = String(payload.description || '').trim();
    var newDate = String(payload.date || Utilities.formatDate(new Date(), "Asia/Jakarta", "d MMMM yyyy")).trim();
    var newCreatedAt = String(payload.created_at || payload.createdAt || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")).trim();
    
    var newImagesStr = '[]';
    if (payload.images) {
      newImagesStr = Array.isArray(payload.images) ? JSON.stringify(payload.images) : String(payload.images);
    }
    var newDriveUrl = String(payload.drive_folder_url || payload.driveFolderUrl || '').trim();

    var newRow = [
      newId,
      newTitle,
      newCategory,
      newImage,
      newDesc,
      newDate,
      newCreatedAt,
      newImagesStr,
      newDriveUrl
    ];

    sheet.appendRow(newRow);
    var lastRow = sheet.getLastRow();

    var rowRange = sheet.getRange(lastRow, 1, 1, newRow.length);
    rowRange.setFontFamily('Arial');
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment('middle');

    return createJsonResponse({
      status: 'success',
      message: 'Album foto "' + newTitle + '" berhasil disimpan ke Spreadsheet!',
      id: newId,
      row: lastRow
    });

  } catch (err) {
    return createJsonResponse({
      status: 'error',
      message: err.toString()
    });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action.toLowerCase() : '';
  
  if (action === 'read' || action === 'list') {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheets()[0];
      var rows = sheet.getDataRange().getValues();
      var result = [];

      for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        if (!row[0] || !row[1]) continue;

        var images = [];
        try {
          images = JSON.parse(row[7]);
        } catch (ex) {
          images = row[7] ? [row[7]] : [];
        }

        result.push({
          id: String(row[0]),
          title: String(row[1]),
          category: String(row[2] || 'Kegiatan'),
          image: String(row[3] || ''),
          description: String(row[4] || ''),
          date: String(row[5] || ''),
          created_at: String(row[6] || ''),
          images: images,
          drive_folder_url: String(row[8] || '')
        });
      }

      return createJsonResponse({
        status: 'success',
        count: result.length,
        data: result
      });
    } catch (err) {
      return createJsonResponse({
        status: 'error',
        message: err.toString()
      });
    }
  }

  return ContentService.createTextOutput(
    'Webhook Google Apps Script Galeri Foto Korwilcam Purwodadi Aktif & Siap Menerima Data.'
  );
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}`;

let inMemoryGalleryWebAppUrl = '';

export function getGalleryWebAppUrl(): string {
  if (inMemoryGalleryWebAppUrl && inMemoryGalleryWebAppUrl.trim()) {
    return inMemoryGalleryWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(GALLERY_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryGalleryWebAppUrl = saved.trim();
      return inMemoryGalleryWebAppUrl;
    }
  } catch {}
  return resolveDefaultGalleryWebAppUrl();
}

export function setGalleryWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryGalleryWebAppUrl = clean;
  try {
    localStorage.setItem(GALLERY_WEBAPP_STORAGE_KEY, clean);
  } catch {}
}

export interface GallerySheetActionPayload {
  action?: 'create' | 'update' | 'delete';
  id?: string;
  title?: string;
  category?: string;
  image?: string;
  description?: string;
  date?: string;
  created_at?: string;
  createdAt?: string;
  images?: string[] | string;
  drive_folder_url?: string;
  driveFolderUrl?: string;
  authorName?: string;
  authorRole?: string;
  authorId?: string;
}

/**
 * Parsing 1 baris CSV Spreadsheet ke objek GalleryItem
 */
function parseGalleryRow(row: string[], index: number): GalleryItem | null {
  if (!row || row.length < 2) return null;

  const id = (row[0] || '').trim();
  const title = (row[1] || '').trim();
  if (!id || !title || id.toLowerCase() === 'id') return null;

  const category = (row[2] || 'Kegiatan').trim();
  const coverImage = (row[3] || '').trim();
  const rawDesc = (row[4] || '').trim();
  const date = (row[5] || '').trim();
  const createdAt = (row[6] || '').trim() || new Date().toISOString();
  const imagesRaw = (row[7] || '').trim();
  const driveFolderUrl = (row[8] || '').trim();

  // Parsing array images dari Kolom H
  let imagesList: string[] = [];
  if (imagesRaw) {
    if (imagesRaw.startsWith('[') && imagesRaw.endsWith(']')) {
      try {
        const parsed = JSON.parse(imagesRaw);
        if (Array.isArray(parsed)) {
          imagesList = parsed.filter(i => typeof i === 'string' && i.trim().length > 0 && i !== '#');
        }
      } catch {
        // Fallback jika formatting json ada kutip ganda CSV
        try {
          const cleaned = imagesRaw.replace(/""/g, '"');
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            imagesList = parsed.filter(i => typeof i === 'string' && i.trim().length > 0 && i !== '#');
          }
        } catch {}
      }
    }
    if (imagesList.length === 0) {
      imagesList = imagesRaw.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0 && s !== '#');
    }
  }

  // Ekstrak metadata author & images jika tertanam di deskripsi
  const { cleanDescription, driveFolderUrl: metaDriveUrl, images: metaImages, authorId, authorName, authorRole } = extractGalleryMetadata(rawDesc);

  if (imagesList.length === 0 && metaImages && metaImages.length > 0) {
    imagesList = metaImages;
  }
  if (imagesList.length === 0 && coverImage && !coverImage.includes('unsplash.com')) {
    imagesList = [coverImage];
  }

  const finalDriveUrl = driveFolderUrl || metaDriveUrl || (isGoogleDriveFolderUrl(coverImage) ? coverImage : '');
  const validCover = (coverImage && !coverImage.includes('unsplash.com')) ? coverImage : (imagesList[0] || '');

  return {
    id: id || `gal-${Date.now()}-${index}`,
    title,
    category,
    image: validCover,
    images: imagesList,
    driveFolderUrl: finalDriveUrl,
    description: cleanDescription,
    date,
    createdAt,
    authorId: authorId || 'usr-superadmin',
    authorName: authorName || 'Humas Korwilcam Purwodadi',
    authorRole: authorRole || 'Penulis'
  };
}

/**
 * Mengambil status visibilitas cache galeri
 */
export function getLocalGalleryCache(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

/**
 * Menyimpan data galeri ke local cache
 */
export function setLocalGalleryCache(items: GalleryItem[]): void {
  try {
    localStorage.setItem(GALLERY_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(GALLERY_CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch {}
}

/**
 * Mengambil seluruh album galeri langsung dari Google Spreadsheet
 */
export async function fetchGalleryFromSheet(forceRefresh = false): Promise<GalleryItem[]> {
  const cached = getLocalGalleryCache();
  const lastFetchStr = localStorage.getItem(GALLERY_CACHE_TIMESTAMP_KEY);
  const now = Date.now();

  // Gunakan cache jika masih dalam batas waktu TTL (3 menit)
  if (!forceRefresh && cached.length > 0 && lastFetchStr) {
    const lastFetch = parseInt(lastFetchStr, 10);
    if (now - lastFetch < GALLERY_CACHE_TTL_MS) {
      return cached;
    }
  }

  const urls = [
    `${GALLERY_CSV_URL}&_t=${now}`,
    `${GALLERY_GVIZ_URL}&_t=${now}`
  ];

  let rawCsv = '';

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

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

  if (!rawCsv) {
    return cached.length > 0 ? cached : [];
  }

  const rows = parseCSV(rawCsv);
  if (!rows || rows.length <= 1) {
    return cached.length > 0 ? cached : [];
  }

  const items: GalleryItem[] = [];
  // Baris pertama (index 0) adalah header
  for (let i = 1; i < rows.length; i++) {
    const item = parseGalleryRow(rows[i], i);
    if (item) {
      items.push(item);
    }
  }

  if (items.length > 0) {
    // Urutkan terbaru paling atas (descending)
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    setLocalGalleryCache(items);
    return items;
  }

  return cached;
}

/**
 * Kirim payload (Simpan, Edit, Hapus) ke Google Apps Script Webhook
 */
export async function sendGalleryActionToGAS(payload: GallerySheetActionPayload): Promise<{ success: boolean; message: string }> {
  const webAppUrl = getGalleryWebAppUrl();

  if (!webAppUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script Galeri belum terpasang di sistem.'
    };
  }

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    // Karena mode no-cors, jika fetch berhasil tanpa lempar error, anggap sukses
    return {
      success: true,
      message: 'Perubahan galeri berhasil dikirim ke Google Spreadsheet!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal mengirim ke Google Apps Script: ${err.message || 'Error Jaringan'}`
    };
  }
}
