import { GalleryVideoItem } from '../types';
import { parseCSV } from './googleSheetService';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  getYouTubeEmbedUrl, 
  detectVideoSource,
  getVideoThumbnail,
  getVideoEmbedUrl,
  generateVideoSlug 
} from '../lib/youtubeHelper';
import { FALLBACK_VIDEOS } from '../data/fallbackVideos';

export const VIDEO_SPREADSHEET_ID = '1uN-DBqXn-TkqR9iiqZLGZNBMEx91K4kbD3nmz_tu-pY';
export const VIDEO_SHEET_GID = '1627850125';
export const VIDEO_CSV_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/export?format=csv&gid=${VIDEO_SHEET_GID}`;
export const VIDEO_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${VIDEO_SHEET_GID}`;
export const VIDEO_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/edit?gid=${VIDEO_SHEET_GID}#gid=${VIDEO_SHEET_GID}`;
export const VIDEO_CACHE_KEY = 'korwilcam_video_sheet_cache_v3';
export const VIDEO_CACHE_TIMESTAMP_KEY = 'korwilcam_video_sheet_last_fetch_v3';
export const VIDEO_CACHE_TTL_MS = 30 * 1000; // 30 Detik Smart Cache TTL untuk kecepatan maksimal sekaligus data selalu mutakhir

export const VIDEO_WEBAPP_STORAGE_KEY = 'korwilcam_video_gas_url';
export const DEFAULT_VIDEO_WEBAPP_URL = 
  (import.meta.env.VITE_VIDEO_WEBAPP_URL as string) || 
  'https://script.google.com/macros/s/AKfycbzP8RnPezs-Vr5X9pd0KGWdIk8qs-T6zqg7KDWWiE1CqFkJg6-NRcK4zZWooxgz4Nah/exec';

export interface VideoSubmitPayload {
  title: string;        // Kolom B: Judul Vidio
  youtubeUrl: string;   // Kolom C: Link Vidio (YouTube atau Google Drive)
  eventDate: string;    // Kolom D: Tanggal Kegiatan
  category: string;     // Kolom E: Kategori Kegiatan
  description: string;  // Kolom F: Deskripsi Vidio
  schoolName: string;   // Kolom G: Nama Sekolah / Organisasi
}

let inMemoryVideoWebAppUrl = '';

export function getVideoWebAppUrl(): string {
  if (inMemoryVideoWebAppUrl && inMemoryVideoWebAppUrl.trim()) {
    return inMemoryVideoWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(VIDEO_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryVideoWebAppUrl = saved.trim();
      return inMemoryVideoWebAppUrl;
    }
  } catch {}
  return DEFAULT_VIDEO_WEBAPP_URL;
}

export function setVideoWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryVideoWebAppUrl = clean;
  try {
    localStorage.setItem(VIDEO_WEBAPP_STORAGE_KEY, clean);
  } catch {}
}

export const VIDEO_GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * WEBHOOK GOOGLE APPS SCRIPT (GAS) - UPLOAD DATA VIDIO KORWILCAM PURWODADI
 * =========================================================================
 * Spreadsheet Target:
 * https://docs.google.com/spreadsheets/d/1uN-DBqXn-TkqR9iiqZLGZNBMEx91K4kbD3nmz_tu-pY/edit?usp=sharing
 * Target Sheet GID : 1627850125
 *
 * PEMETAAN KOLOM:
 * Kolom A (1) : Timestamp (Otomatis)
 * Kolom B (2) : Judul Vidio
 * Kolom C (3) : Link Vidio (YouTube atau Google Drive)
 * Kolom D (4) : Tanggal Kegiatan
 * Kolom E (5) : Kategori Kegiatan
 * Kolom F (6) : Deskripsi Vidio
 * Kolom G (7) : Nama Sekolah / Organisasi
 */

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const TARGET_GID = 1627850125;
    
    // Cari tab sheet berdasarkan GID 1627850125 agar tepat sasaran
    let sheet = ss.getSheets().find(function(s) {
      return s.getSheetId() === TARGET_GID;
    });
    
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }
    
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Payload data tidak ditemukan' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // Format Waktu WIB (Asia/Jakarta)
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    
    // Susun baris baru sesuai urutan kolom A sampai G
    const newRow = [
      timestamp,                    // Kolom A: Timestamp
      data.title || '',             // Kolom B: Judul Vidio
      data.youtubeUrl || '',        // Kolom C: Link Vidio (YouTube / Google Drive)
      data.eventDate || '',         // Kolom D: Tanggal Kegiatan
      data.category || 'Kegiatan',  // Kolom E: Kategori Kegiatan
      data.description || '',       // Kolom F: Deskripsi Vidio
      data.schoolName || ''         // Kolom G: Nama Sekolah / Organisasi
    ];
    
    sheet.appendRow(newRow);
    
    const lastRowIndex = sheet.getLastRow();
    
    // Rapikan formatting font dan perataan baris baru
    const rowRange = sheet.getRange(lastRowIndex, 1, 1, newRow.length);
    rowRange.setFontFamily('Arial');
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment('middle');
    
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Data video berhasil disimpan ke Database Korwilcam!',
        row: lastRowIndex
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'error',
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    'Webhook Google Apps Script Galeri Video Korwilcam Purwodadi Aktif & Siap Menerima Data.'
  );
}`;

/**
 * Kirim data video langsung ke Google Spreadsheet via GAS Web App
 */
export async function submitVideoToSheet(payload: VideoSubmitPayload): Promise<{ success: boolean; message: string }> {
  const webAppUrl = getVideoWebAppUrl();

  if (!webAppUrl) {
    return {
      success: false,
      message: 'Sistem pengiriman video sedang dipersiapkan oleh Pengelola.'
    };
  }

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      mode: 'no-cors'
    });

    // Reset timestamp cache agar saat user kembali ke daftar video, data baru langsung ditarik
    try {
      localStorage.removeItem(VIDEO_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Data video berhasil terkirim dan disimpan ke Database Korwilcam!'
    };
  } catch (err: any) {
    console.error('Gagal mengirim data video ke Spreadsheet:', err);
    return {
      success: false,
      message: `Terjadi kendala saat mengirim data: ${err?.message || err}`
    };
  }
}

/**
 * Membaca cache video galeri dari localStorage untuk pemuatan instan (0ms)
 */
export function getLocalVideoCache(): GalleryVideoItem[] {
  try {
    const raw = localStorage.getItem(VIDEO_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: GalleryVideoItem) => ({
          ...item,
          slug: generateVideoSlug(item.title, item.id, item.schoolName)
        }));
      }
    }
  } catch (e) {
    console.warn('Gagal membaca cache Video Galeri:', e);
  }
  return FALLBACK_VIDEOS;
}

/**
 * Menyimpan data video galeri terbaru ke localStorage
 */
export function saveLocalVideoCache(items: GalleryVideoItem[]): void {
  try {
    if (Array.isArray(items) && items.length > 0) {
      localStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.warn('Gagal menyimpan cache Video Galeri:', e);
  }
}

/**
 * Mengambil data video dari Google Spreadsheet dan mengonversinya menjadi daftar GalleryVideoItem
 * Mendukung Smart TTL Caching (3 menit) untuk mencegah lag dan lonjakan request saat diakses banyak pengunjung sekaligus
 */
export async function fetchVideosFromSheet(forceRefresh = false): Promise<GalleryVideoItem[]> {
  // Jika bukan paksa refresh, gunakan cache lokal instan jika masih dalam TTL 3 menit
  if (!forceRefresh) {
    try {
      const lastFetchStr = localStorage.getItem(VIDEO_CACHE_TIMESTAMP_KEY);
      const cached = getLocalVideoCache();
      if (lastFetchStr && cached && cached.length > 0) {
        const lastFetch = Number(lastFetchStr);
        if (!isNaN(lastFetch) && Date.now() - lastFetch < VIDEO_CACHE_TTL_MS) {
          return cached;
        }
      }
    } catch {}
  }

  let csvText = '';
  let lastError: Error | null = null;
  const cacheBustParam = `&_t=${Date.now()}`;

  // 1. Coba unduh dari endpoint export?format=csv dengan bypass cache
  try {
    const res = await fetch(`${VIDEO_CSV_URL}${cacheBustParam}`, {
      method: 'GET',
      cache: 'no-store'
    });
    if (res.ok) {
      const txt = await res.text();
      // Pastikan bukan halaman HTML login Google
      if (txt && !txt.includes('<!DOCTYPE html>') && !txt.includes('google-site-verification')) {
        csvText = txt;
      }
    }
  } catch (err: any) {
    lastError = err;
  }

  // 2. Jika gagal atau login required, coba endpoint gviz fallback dengan bypass cache
  if (!csvText) {
    try {
      const res = await fetch(`${VIDEO_GVIZ_URL}${cacheBustParam}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const txt = await res.text();
        if (txt && !txt.includes('<!DOCTYPE html>')) {
          csvText = txt;
        }
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  // Jika tetap tidak mendapatkan teks CSV (misal spreadsheet masih mode private / dibatasi)
  if (!csvText || csvText.trim().length === 0) {
    const cached = getLocalVideoCache();
    if (cached && cached.length > 0) {
      console.warn('Menggunakan cache lokal video kegiatan karena akses spreadsheet belum publik:', lastError);
      return cached;
    }
    return FALLBACK_VIDEOS;
  }

  const rows = parseCSV(csvText);
  if (!rows || rows.length === 0) {
    return getLocalVideoCache();
  }

  // Cari baris header (mencari baris yang mengandung 'JUDUL' atau 'YOUTUBE' atau 'LINK')
  let headerRowIdx = rows.findIndex((row) =>
    row.some((col) => {
      const c = (col || '').trim().toUpperCase();
      return c.includes('JUDUL') || c.includes('YOUTUBE') || c.includes('LINK') || c.includes('VIDIO') || c.includes('VIDEO');
    })
  );

  if (headerRowIdx === -1) {
    headerRowIdx = 0;
  }

  const items: GalleryVideoItem[] = [];

  for (let i = headerRowIdx + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    // Kolom B = index 1 : Judul Vidio
    const title = (row[1] || '').trim();
    if (!title || title.toUpperCase() === 'JUDUL' || title.toUpperCase() === 'JUDUL VIDIO' || title.toUpperCase() === 'JUDUL VIDEO' || title === '-') continue;

    // Kolom C = index 2 : Link Vidio (YouTube atau Google Drive)
    const rawVideoUrl = (row[2] || '').trim();
    const videoInfo = detectVideoSource(rawVideoUrl);

    let videoSource: 'youtube' | 'drive' = 'youtube';
    let videoId = 'dQw4w9WgXcQ';
    let thumbnailUrl = '/gallery/cover-7-agustus-2026.jpg';
    let embedUrl = '';

    if (videoInfo) {
      videoSource = videoInfo.type;
      videoId = videoInfo.id;
      thumbnailUrl = videoInfo.thumbnailUrl;
      embedUrl = videoInfo.embedUrl;
    } else {
      // Fallback jika tidak terdeteksi spesifik
      const fallbackYt = extractYouTubeId(rawVideoUrl);
      if (fallbackYt) {
        videoSource = 'youtube';
        videoId = fallbackYt;
        thumbnailUrl = getYouTubeThumbnail(videoId);
        embedUrl = getYouTubeEmbedUrl(videoId);
      } else {
        videoId = 'dQw4w9WgXcQ';
        thumbnailUrl = getYouTubeThumbnail(videoId);
        embedUrl = getYouTubeEmbedUrl(videoId);
      }
    }

    // Kolom D = index 3 : Tanggal Kegiatan
    const rawDate = (row[3] || '').trim();
    const date = rawDate || 'November 2026';

    // Kolom E = index 4 : Kegiatan (Kategori)
    const rawCategory = (row[4] || '').trim();
    const category = rawCategory || 'Kegiatan';

    // Kolom F = index 5 : Deskripsi
    const rawDesc = (row[5] || '').trim();
    const description = rawDesc || `Dokumentasi video kegiatan ${title} di lingkungan Korwilcam Purwodadi.`;

    // Kolom G = index 6 : Nama Sekolah
    const rawSchool = (row[6] || '').trim();
    const schoolName = rawSchool || '';
    const authorName = rawSchool || 'Humas Korwilcam Purwodadi';

    const id = `video-${i + 1}`;
    const slug = generateVideoSlug(title, id, schoolName);

    items.push({
      id,
      title,
      slug,
      youtubeUrl: rawVideoUrl,
      youtubeId: videoId,
      videoSource,
      driveFileId: videoSource === 'drive' ? videoId : undefined,
      date,
      category,
      description,
      schoolName,
      thumbnailUrl,
      embedUrl,
      authorName
    });
  }

  if (items.length > 0) {
    saveLocalVideoCache(items);
    try {
      localStorage.setItem(VIDEO_CACHE_TIMESTAMP_KEY, String(Date.now()));
    } catch {}
    return items;
  }

  return getLocalVideoCache();
}
