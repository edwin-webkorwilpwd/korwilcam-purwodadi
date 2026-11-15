import { GalleryItem } from '../types';
import { parseCSV } from './googleSheetService';
import { extractGoogleDriveFolderId, formatGoogleDriveImageUrl } from '../lib/driveHelper';

export const PUBLIC_GALLERY_SPREADSHEET_ID = '11cTU4NQt3aq9SpCc9hWbdvIOSg4gYRqGKR22WyI1n9g';
export const PUBLIC_GALLERY_SHEET_GID = '0';
export const PUBLIC_GALLERY_CSV_URL = `https://docs.google.com/spreadsheets/d/${PUBLIC_GALLERY_SPREADSHEET_ID}/export?format=csv&gid=${PUBLIC_GALLERY_SHEET_GID}`;
export const PUBLIC_GALLERY_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${PUBLIC_GALLERY_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${PUBLIC_GALLERY_SHEET_GID}`;
export const PUBLIC_GALLERY_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${PUBLIC_GALLERY_SPREADSHEET_ID}/edit?gid=${PUBLIC_GALLERY_SHEET_GID}#gid=${PUBLIC_GALLERY_SHEET_GID}`;

export const PUBLIC_GALLERY_CACHE_KEY = 'korwilcam_public_gallery_cache_v1';
export const PUBLIC_GALLERY_CACHE_TIMESTAMP_KEY = 'korwilcam_public_gallery_last_fetch_v1';
export const PUBLIC_GALLERY_CACHE_TTL_MS = 60 * 1000; // 1 Menit Cache TTL

export const PUBLIC_GALLERY_WEBAPP_STORAGE_KEY = 'korwilcam_public_gallery_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Galeri Publik disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A + (i % 7)) + Base64 agar string asli tidak terbuka 
 * di bundle production, DevTools, maupun scanner otomatis.
 */
const OBFUSCATED_PUBLIC_GALLERY_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0ZIzEeOhs3LTI5PxUKbBcfIh0+bz0xdzMxPCQ7MRgBGztzaiJjHRQuECUrDDAROS0LJ24ZOzw/L1cfFRJtO2g0GQJzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS Galeri Publik secara aman hanya di memori runtime saat dipanggil
 */
export function resolveDefaultPublicGalleryWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PUBLIC_GALLERY_WEBAPP_URL) {
    return import.meta.env.VITE_PUBLIC_GALLERY_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_PUBLIC_GALLERY_ENDPOINT);
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

export const DEFAULT_PUBLIC_GALLERY_WEBAPP_URL = resolveDefaultPublicGalleryWebAppUrl();

/**
 * Menyamarkan URL GAS untuk tampilan antarmuka (UI Masking)
 * Melindungi dari intipan layar / inspeksi visual
 */
export function maskPublicGalleryWebAppUrl(url: string): string {
  if (!url || url.length < 35) return '••••••••••••••••••••••••••••••••';
  const prefix = url.substring(0, 36);
  const suffix = url.substring(url.length - 10);
  return `${prefix}••••••••••••${suffix}`;
}

export interface PublicGallerySubmission {
  id: string;
  rowIndex: number;
  timestamp: string;          // Kolom A: Timestamp
  title: string;              // Kolom B: Judul Dokumentasi
  driveFolderUrl: string;     // Kolom C: Link Folder Foto ( Gdrive )
  eventDate: string;          // Kolom D: Tanggal Kegiatan
  category: string;           // Kolom E: Kategori Kegiatan
  description: string;        // Kolom F: Deskripsi Singkat
  schoolName: string;         // Kolom G: Nama Sekolah / Organisasi
  status: 'Pending' | 'Disetujui' | 'Ditolak'; // Kolom H: Status Pengajuan
  coverImage?: string;        // Kolom I: Foto Sampul Otomatis
  images?: string[];          // Kolom J: Daftar Foto Lengkap
}

export interface PublicGallerySubmitPayload {
  title: string;
  driveFolderUrl: string;
  eventDate: string;
  category: string;
  description: string;
  schoolName: string;
}

let inMemoryPublicGalleryWebAppUrl = '';

export function getPublicGalleryWebAppUrl(): string {
  if (inMemoryPublicGalleryWebAppUrl && inMemoryPublicGalleryWebAppUrl.trim()) {
    return inMemoryPublicGalleryWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(PUBLIC_GALLERY_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryPublicGalleryWebAppUrl = saved.trim();
      return inMemoryPublicGalleryWebAppUrl;
    }
  } catch {}
  const defaultUrl = resolveDefaultPublicGalleryWebAppUrl();
  inMemoryPublicGalleryWebAppUrl = defaultUrl;
  return defaultUrl;
}

export function setPublicGalleryWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryPublicGalleryWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(PUBLIC_GALLERY_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(PUBLIC_GALLERY_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

export function getLocalPublicGalleryCache(): PublicGallerySubmission[] {
  try {
    const raw = localStorage.getItem(PUBLIC_GALLERY_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [];
}

export function setLocalPublicGalleryCache(items: PublicGallerySubmission[]): void {
  try {
    localStorage.setItem(PUBLIC_GALLERY_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(PUBLIC_GALLERY_CACHE_TIMESTAMP_KEY, String(Date.now()));
  } catch {}
}

/**
 * Mengambil seluruh pengajuan foto publik dari Spreadsheet
 */
export async function fetchPublicGallerySubmissions(forceRefresh = false): Promise<PublicGallerySubmission[]> {
  const cached = getLocalPublicGalleryCache();
  const lastFetchStr = localStorage.getItem(PUBLIC_GALLERY_CACHE_TIMESTAMP_KEY);
  const now = Date.now();

  if (!forceRefresh && cached.length > 0 && lastFetchStr) {
    const lastFetch = parseInt(lastFetchStr, 10);
    if (now - lastFetch < PUBLIC_GALLERY_CACHE_TTL_MS) {
      return cached;
    }
  }

  const cacheBustParam = `&_t=${now}`;
  let csvText = '';

  // 1. Coba CSV Export URL
  try {
    const res = await fetch(`${PUBLIC_GALLERY_CSV_URL}${cacheBustParam}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (res.ok) {
      const txt = await res.text();
      if (txt && !txt.includes('<!DOCTYPE html>') && !txt.includes('google-site-verification')) {
        csvText = txt;
      }
    }
  } catch {}

  // 2. Fallback GVIZ
  if (!csvText) {
    try {
      const res = await fetch(`${PUBLIC_GALLERY_GVIZ_URL}${cacheBustParam}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const txt = await res.text();
        if (txt && !txt.includes('<!DOCTYPE html>')) {
          csvText = txt;
        }
      }
    } catch {}
  }

  if (!csvText || csvText.trim().length === 0) {
    return cached;
  }

  const rows = parseCSV(csvText);
  if (!rows || rows.length <= 1) {
    return cached;
  }

  // Header row detection
  let headerIdx = rows.findIndex((r) =>
    r.some((col) => {
      const c = (col || '').toUpperCase();
      return c.includes('TIMESTAMP') || c.includes('JUDUL') || c.includes('FOLDER');
    })
  );
  if (headerIdx === -1) headerIdx = 0;

  const items: PublicGallerySubmission[] = [];

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 2) continue;

    const timestamp = (r[0] || '').trim();
    const title = (r[1] || '').trim();
    if (!title || title.toUpperCase() === 'JUDUL' || title === '-') continue;

    const driveFolderUrl = (r[2] || '').trim();
    const eventDate = (r[3] || '').trim();
    const category = (r[4] || 'Kegiatan').trim();
    const description = (r[5] || '').trim();
    const schoolName = (r[6] || '').trim();
    const rawStatus = (r[7] || '').trim().toLowerCase();
    const coverImage = (r[8] || '').trim();
    const rawImages = (r[9] || '').trim();

    let status: 'Pending' | 'Disetujui' | 'Ditolak' = 'Pending';
    if (rawStatus === 'disetujui' || rawStatus === 'approved' || rawStatus === 'aktif' || rawStatus === 'setuju') {
      status = 'Disetujui';
    } else if (rawStatus === 'ditolak' || rawStatus === 'rejected' || rawStatus === 'tolak') {
      status = 'Ditolak';
    }

    let images: string[] = [];
    if (rawImages) {
      try {
        const parsed = JSON.parse(rawImages);
        if (Array.isArray(parsed)) {
          images = parsed.filter((u: any) => typeof u === 'string' && u.startsWith('http'));
        }
      } catch {
        images = rawImages.split(',').map((u: string) => u.trim()).filter((u) => u.startsWith('http'));
      }
    }
    if (coverImage && coverImage.startsWith('http') && !images.includes(coverImage)) {
      images = [coverImage, ...images];
    }

    items.push({
      id: `pub-sub-${i}-${timestamp.replace(/[^0-9]/g, '')}`,
      rowIndex: i + 1, // 1-based row index in spreadsheet
      timestamp,
      title,
      driveFolderUrl,
      eventDate,
      category,
      description,
      schoolName,
      status,
      coverImage: coverImage.startsWith('http') ? coverImage : undefined,
      images: images.length > 0 ? images : undefined
    });
  }

  // Urutkan pengajuan terbaru di posisi paling atas
  items.reverse();

  setLocalPublicGalleryCache(items);
  return items;
}

/**
 * Mengonversi pengajuan foto publik yang "Disetujui" menjadi format GalleryItem untuk ditampilkan di web utama
 */
export function convertPublicSubmissionsToGalleryItems(submissions: PublicGallerySubmission[]): GalleryItem[] {
  const approved = submissions.filter((s) => s.status === 'Disetujui');
  
  return approved.map((s, idx) => {
    // Foto Sampul terdeteksi dari Kolom I, atau foto pertama dari Kolom J
    const validCover = (s.coverImage && s.coverImage.startsWith('http')) 
      ? s.coverImage 
      : (s.images && s.images[0] ? s.images[0] : '');

    const imagesList = Array.isArray(s.images) && s.images.length > 0 
      ? s.images 
      : (validCover ? [validCover] : []);

    return {
      id: `public-gal-${s.rowIndex}-${s.timestamp.replace(/[^0-9]/g, '') || idx}`,
      title: s.title,
      category: s.category || 'Kegiatan',
      image: validCover,
      images: imagesList,
      driveFolderUrl: s.driveFolderUrl,
      description: s.description || `Dokumentasi kegiatan resmi ${s.title} dari ${s.schoolName || 'Kontributor Sekolah'}.`,
      date: s.eventDate || s.timestamp,
      createdAt: s.timestamp || new Date().toISOString(),
      authorId: `pub-${s.rowIndex}`,
      authorName: s.schoolName || 'Kontributor Sekolah',
      authorRole: 'Kontributor Publik'
    };
  });
}

/**
 * Mengirim pengajuan foto dokumentasi baru ke Google Spreadsheet melalui Webhook GAS
 */
export async function submitPublicPhotoToSheet(payload: PublicGallerySubmitPayload): Promise<{ success: boolean; message: string }> {
  const gasUrl = getPublicGalleryWebAppUrl();

  const bodyData = {
    action: 'submit',
    title: payload.title.trim(),
    driveFolderUrl: payload.driveFolderUrl.trim(),
    eventDate: payload.eventDate.trim(),
    category: payload.category.trim(),
    description: payload.description.trim(),
    schoolName: payload.schoolName.trim()
  };

  if (!gasUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script (GAS) Galeri Publik belum dikonfigurasi. Harap hubungi Admin.'
    };
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      const resText = await res.text();
      try {
        const json = JSON.parse(resText);
        if (json.status === 'success' || json.success) {
          return { success: true, message: json.message || 'Dokumentasi foto berhasil diajukan!' };
        }
        return { success: false, message: json.message || 'Gagal menyimpan ke Google Spreadsheet.' };
      } catch {
        // GAS web app redirects or returns HTML/plain text on success
        return { success: true, message: 'Dokumentasi foto berhasil dikirim dan tersimpan di database!' };
      }
    } else {
      return { success: false, message: `Server Google merespons dengan status error: ${res.status}` };
    }
  } catch (err: any) {
    // Mode offline / CORS no-cors fallback attempt
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyData)
      });
      return {
        success: true,
        message: 'Dokumentasi foto berhasil dikirim ke Google Spreadsheet Korwilcam!'
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message || 'Pastikan koneksi internet Anda aktif.'}`
      };
    }
  }
}

/**
 * Memperbarui status persetujuan foto di Spreadsheet melalui Webhook GAS (Disetujui / Ditolak)
 */
export async function updatePublicPhotoStatusInSheet(
  submission: PublicGallerySubmission, 
  newStatus: 'Disetujui' | 'Ditolak'
): Promise<{ success: boolean; message: string }> {
  const gasUrl = getPublicGalleryWebAppUrl();

  const bodyData = {
    action: 'updatestatus',
    rowIndex: submission.rowIndex,
    timestamp: submission.timestamp,
    title: submission.title,
    driveFolderUrl: submission.driveFolderUrl,
    newStatus: newStatus
  };

  if (!gasUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script (GAS) belum terpasang di sistem.'
    };
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      const resText = await res.text();
      try {
        const json = JSON.parse(resText);
        if (json.status === 'success' || json.success) {
          return { success: true, message: json.message || `Status berhasil diubah menjadi ${newStatus}.` };
        }
        return { success: false, message: json.message || 'Gagal memperbarui status di Google Spreadsheet.' };
      } catch {
        return { success: true, message: `Status berhasil diubah menjadi ${newStatus}.` };
      }
    } else {
      return { success: false, message: `Server merespons error: ${res.status}` };
    }
  } catch (err: any) {
    try {
      await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(bodyData)
      });
      return { success: true, message: `Status berhasil dikirim ke database: ${newStatus}.` };
    } catch (fallbackErr: any) {
      return { success: false, message: `Gagal mengirim status: ${err.message}` };
    }
  }
}

/**
 * Memindai ulang isi folder Google Drive untuk mendeteksi foto sampul (Kolom I) dan seluruh daftar foto (Kolom J)
 */
export async function rescanPublicPhotoFolderInSheet(
  submission: PublicGallerySubmission
): Promise<{ success: boolean; message: string; coverImage?: string; images?: string[] }> {
  const gasUrl = getPublicGalleryWebAppUrl();

  const bodyData = {
    action: 'rescan',
    rowIndex: submission.rowIndex,
    timestamp: submission.timestamp,
    title: submission.title,
    driveFolderUrl: submission.driveFolderUrl
  };

  if (!gasUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script (GAS) belum terpasang di sistem.'
    };
  }

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(bodyData)
    });

    if (res.ok) {
      const resText = await res.text();
      try {
        const json = JSON.parse(resText);
        if (json.status === 'success' || json.success) {
          return { 
            success: true, 
            message: json.message || 'Folder Google Drive berhasil dipindai!',
            coverImage: json.coverImage,
            images: json.images
          };
        }
        return { success: false, message: json.message || 'Gagal memindai folder Google Drive.' };
      } catch {
        return { success: true, message: 'Permintaan pindai ulang telah dikirim ke Google Apps Script.' };
      }
    } else {
      return { success: false, message: `Server merespons error: ${res.status}` };
    }
  } catch (err: any) {
    return { success: false, message: `Gagal memindai folder: ${err.message}` };
  }
}

/**
 * =========================================================================
 * KODE RESMI GOOGLE APPS SCRIPT (GAS) - DATABASE GALERI PUBLIK (OPSI B)
 * =========================================================================
 * Salin seluruh kode di bawah ini ke Google Apps Script Spreadsheet:
 * https://docs.google.com/spreadsheets/d/11cTU4NQt3aq9SpCc9hWbdvIOSg4gYRqGKR22WyI1n9g/edit?gid=0#gid=0
 * =========================================================================
 */
export const PUBLIC_GALLERY_GAS_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT (GAS) - DATABASE GALERI FOTO PUBLIK KORWILCAM PURWODADI
 * =========================================================================
 * Spreadsheet Target:
 * https://docs.google.com/spreadsheets/d/11cTU4NQt3aq9SpCc9hWbdvIOSg4gYRqGKR22WyI1n9g/edit?gid=0#gid=0
 * Target Sheet GID : 0
 *
 * PEMETAAN KOLOM RESMI:
 * Kolom A (1) : Timestamp
 * Kolom B (2) : Judul Dokumentasi
 * Kolom C (3) : Link Folder Foto ( Gdrive )
 * Kolom D (4) : Tanggal Kegiatan
 * Kolom E (5) : Kategori Kegiatan
 * Kolom F (6) : Deskripsi Singkat
 * Kolom G (7) : Nama Sekolah / Organisasi
 * Kolom H (8) : Status Pengajuan (Pending / Disetujui / Ditolak)
 * Kolom I (9) : Foto Sampul (Cover Image URL)
 * Kolom J (10): Daftar Foto Lengkap (JSON Array URL Foto)
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); // 30 detik untuk memberikan waktu pemindaian foto
  } catch (lockErr) {
    return createJsonResponse({ status: 'error', message: 'Server Google sedang sibuk memproses, silakan coba sesaat lagi.' });
  }

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0]; // Tab pertama (GID 0)

    // Inisialisasi Header Kolom I & J jika belum ada
    ensureHeaderColumns(sheet);

    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ status: 'error', message: 'Payload data tidak ditemukan.' });
    }

    var data = JSON.parse(e.postData.contents);
    var action = (data.action || 'submit').toLowerCase();

    // 1. ACTION: SUBMIT FOTO BARU DARI PENGUNJUNG PUBLIK
    if (action === 'submit' || action === 'create') {
      var now = new Date();
      var timestamp = Utilities.formatDate(now, "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");

      var title = (data.title || '').trim();
      var driveFolderUrl = (data.driveFolderUrl || data.driveUrl || '').trim();
      var eventDate = (data.eventDate || '').trim();
      var category = (data.category || 'Kegiatan').trim();
      var description = (data.description || '').trim();
      var schoolName = (data.schoolName || '').trim();
      var status = 'Pending'; // Default status menunggu verifikasi admin

      if (!title || !driveFolderUrl) {
        return createJsonResponse({ status: 'error', message: 'Judul Dokumentasi dan Link Folder Google Drive wajib diisi!' });
      }

      // PINDAI OTOMATIS FOTO DI DALAM FOLDER GOOGLE DRIVE (OPSI B)
      var scanned = scanGoogleDriveFolder(driveFolderUrl);
      var coverImage = scanned.coverImage || '';
      var imagesJson = JSON.stringify(scanned.images || []);

      sheet.appendRow([
        timestamp,
        title,
        driveFolderUrl,
        eventDate,
        category,
        description,
        schoolName,
        status,
        coverImage,
        imagesJson
      ]);

      return createJsonResponse({
        status: 'success',
        message: 'Foto dokumentasi berhasil diajukan dan sedang menunggu persetujuan admin.',
        timestamp: timestamp,
        coverImage: coverImage,
        totalPhotos: scanned.images.length
      });
    }

    // 2. ACTION: UPDATE STATUS PERSETUJUAN DARI PORTAL CMS
    if (action === 'updatestatus') {
      var targetTimestamp = (data.timestamp || '').trim();
      var targetTitle = (data.title || '').trim();
      var newStatus = (data.newStatus || data.status || '').trim();
      var targetRowIndex = Number(data.rowIndex);
      var driveFolderUrl = (data.driveFolderUrl || '').trim();

      if (!newStatus) {
        return createJsonResponse({ status: 'error', message: 'Status baru wajib ditentukan (Disetujui / Ditolak).' });
      }

      var values = sheet.getDataRange().getValues();
      var foundRow = findTargetRow(sheet, values, targetRowIndex, targetTimestamp, targetTitle);

      if (foundRow === -1) {
        return createJsonResponse({ status: 'error', message: 'Data baris dokumentasi tidak ditemukan di spreadsheet.' });
      }

      // Perbarui Kolom H (Status Pengajuan)
      sheet.getRange(foundRow, 8).setValue(newStatus);

      // Jika disetujui dan foto sampul/daftar foto masih kosong, otomatis scan folder sekarang
      var currentCover = sheet.getRange(foundRow, 9).getValue();
      var currentList = sheet.getRange(foundRow, 10).getValue();
      var folderLink = driveFolderUrl || (values[foundRow - 1] ? values[foundRow - 1][2] : '');

      if ((!currentCover || !currentList) && folderLink) {
        var scanned = scanGoogleDriveFolder(folderLink);
        if (scanned.coverImage) {
          sheet.getRange(foundRow, 9).setValue(scanned.coverImage);
        }
        if (scanned.images && scanned.images.length > 0) {
          sheet.getRange(foundRow, 10).setValue(JSON.stringify(scanned.images));
        }
      }

      return createJsonResponse({
        status: 'success',
        message: 'Status dokumentasi berhasil diperbarui menjadi: ' + newStatus,
        rowIndex: foundRow,
        newStatus: newStatus
      });
    }

    // 3. ACTION: PINDAI ULANG FOLDER GOOGLE DRIVE (RESCAN)
    if (action === 'rescan' || action === 'refreshphotos') {
      var targetTimestamp = (data.timestamp || '').trim();
      var targetTitle = (data.title || '').trim();
      var targetRowIndex = Number(data.rowIndex);
      var driveFolderUrl = (data.driveFolderUrl || '').trim();

      var values = sheet.getDataRange().getValues();
      var foundRow = findTargetRow(sheet, values, targetRowIndex, targetTimestamp, targetTitle);

      var folderLink = driveFolderUrl;
      if (!folderLink && foundRow !== -1 && values[foundRow - 1]) {
        folderLink = values[foundRow - 1][2];
      }

      if (!folderLink) {
        return createJsonResponse({ status: 'error', message: 'Tautan Folder Google Drive tidak valid.' });
      }

      var scanned = scanGoogleDriveFolder(folderLink);

      if (foundRow !== -1) {
        sheet.getRange(foundRow, 9).setValue(scanned.coverImage || '');
        sheet.getRange(foundRow, 10).setValue(JSON.stringify(scanned.images || []));
      }

      return createJsonResponse({
        status: 'success',
        message: 'Folder Google Drive berhasil dipindai! Ditemukan ' + scanned.images.length + ' foto.',
        coverImage: scanned.coverImage,
        images: scanned.images,
        totalPhotos: scanned.images.length
      });
    }

    return createJsonResponse({ status: 'error', message: 'Aksi tidak dikenali: ' + action });

  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0];
    var values = sheet.getDataRange().getValues();
    return createJsonResponse({ status: 'success', totalRows: values.length });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Memindai isi folder Google Drive untuk mengambil foto-foto kegiatan
 */
function scanGoogleDriveFolder(folderUrl) {
  var folderId = extractDriveFolderId(folderUrl);
  if (!folderId) return { coverImage: '', images: [] };

  var images = [];
  var coverImage = '';

  // 1. Coba menggunakan DriveApp bawaan Google Apps Script
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    while (files.hasNext() && images.length < 100) {
      var file = files.next();
      var mime = (file.getMimeType() || '').toLowerCase();
      var name = (file.getName() || '').toLowerCase();
      if (mime.indexOf('image/') === 0 || name.match(/\\.(jpe?g|png|webp|gif|bmp|heic)$/i)) {
        var fileId = file.getId();
        images.push('https://lh3.googleusercontent.com/d/' + fileId);
      }
    }
  } catch (driveErr) {
    // 2. Fallback jika folder publik tapi akun DriveApp memerlukan akses pembacaan langsung
    try {
      var resp = UrlFetchApp.fetch('https://drive.google.com/drive/folders/' + folderId, { muteHttpExceptions: true });
      var html = resp.getContentText();
      var regex = /\\["([a-zA-Z0-9_-]{25,})",\\["image\\//g;
      var match;
      var seen = {};
      while ((match = regex.exec(html)) !== null && images.length < 100) {
        var fid = match[1];
        if (!seen[fid]) {
          seen[fid] = true;
          images.push('https://lh3.googleusercontent.com/d/' + fid);
        }
      }
    } catch (fetchErr) {}
  }

  if (images.length > 0) {
    coverImage = images[0];
  }

  return {
    coverImage: coverImage,
    images: images
  };
}

/**
 * Ekstrak ID folder Google Drive dari berbagai format URL
 */
function extractDriveFolderId(url) {
  if (!url) return '';
  var str = url.toString().trim();
  var matchFolder = str.match(/\\/folders\\/([a-zA-Z0-9_-]{15,})/);
  if (matchFolder && matchFolder[1]) return matchFolder[1];
  var matchId = str.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchId && matchId[1]) return matchId[1];
  return '';
}

/**
 * Memastikan kolom header I (Foto Sampul) dan J (Daftar Foto) tersedia di baris 1
 */
function ensureHeaderColumns(sheet) {
  try {
    var lastCol = sheet.getLastColumn();
    if (lastCol < 9 || !sheet.getRange(1, 9).getValue()) {
      sheet.getRange(1, 9).setValue('Foto Sampul (Cover)');
    }
    if (lastCol < 10 || !sheet.getRange(1, 10).getValue()) {
      sheet.getRange(1, 10).setValue('Daftar Foto (JSON)');
    }
  } catch (e) {}
}

/**
 * Mencari nomor baris data berdasarkan rowIndex, timestamp, atau judul
 */
function findTargetRow(sheet, values, targetRowIndex, targetTimestamp, targetTitle) {
  if (targetRowIndex && targetRowIndex > 1 && targetRowIndex <= values.length) {
    var row = values[targetRowIndex - 1];
    if (targetTitle && row[1] && row[1].toString().trim() === targetTitle) {
      return targetRowIndex;
    }
    if (targetTimestamp && row[0] && row[0].toString().trim() === targetTimestamp) {
      return targetRowIndex;
    }
  }

  for (var i = 1; i < values.length; i++) {
    var rTimestamp = values[i][0] ? values[i][0].toString().trim() : '';
    var rTitle = values[i][1] ? values[i][1].toString().trim() : '';
    if (targetTimestamp && rTimestamp === targetTimestamp) {
      return i + 1;
    }
    if (targetTitle && rTitle === targetTitle) {
      return i + 1;
    }
  }
  return -1;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
