import { GalleryVideoItem } from '../types';
import { parseCSV } from './googleSheetService';
import { 
  extractYouTubeId, 
  getYouTubeThumbnail, 
  getYouTubeEmbedUrl, 
  generateVideoSlug 
} from '../lib/youtubeHelper';
import { FALLBACK_VIDEOS } from '../data/fallbackVideos';

export const VIDEO_SPREADSHEET_ID = '1uN-DBqXn-TkqR9iiqZLGZNBMEx91K4kbD3nmz_tu-pY';
export const VIDEO_SHEET_GID = '1627850125';
export const VIDEO_CSV_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/export?format=csv&gid=${VIDEO_SHEET_GID}`;
export const VIDEO_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${VIDEO_SHEET_GID}`;
export const VIDEO_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${VIDEO_SPREADSHEET_ID}/edit?gid=${VIDEO_SHEET_GID}#gid=${VIDEO_SHEET_GID}`;
export const VIDEO_CACHE_KEY = 'korwilcam_video_sheet_cache_v2';
export const VIDEO_CACHE_TIMESTAMP_KEY = 'korwilcam_video_sheet_last_fetch';
export const VIDEO_CACHE_TTL_MS = 3 * 60 * 1000; // 3 Menit Smart Cache TTL untuk Anti-Lag & Cegah Rate Limit Google

/**
 * Membaca cache video galeri dari localStorage untuk pemuatan instan (0ms)
 */
export function getLocalVideoCache(): GalleryVideoItem[] {
  try {
    const raw = localStorage.getItem(VIDEO_CACHE_KEY) || localStorage.getItem('korwilcam_video_sheet_cache_v1');
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

  // 1. Coba unduh dari endpoint export?format=csv
  try {
    const res = await fetch(VIDEO_CSV_URL, {
      method: 'GET',
      cache: 'no-cache'
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

  // 2. Jika gagal atau login required, coba endpoint gviz fallback
  if (!csvText) {
    try {
      const res = await fetch(VIDEO_GVIZ_URL, {
        method: 'GET',
        cache: 'no-cache'
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
    if (!title || title.toUpperCase() === 'TES' || title === '-') continue;

    // Kolom C = index 2 : Link Vidio Youtube
    const rawYoutubeUrl = (row[2] || '').trim();
    const videoId = extractYouTubeId(rawYoutubeUrl) || 'dQw4w9WgXcQ';

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
    const thumbnailUrl = getYouTubeThumbnail(videoId);
    const embedUrl = getYouTubeEmbedUrl(videoId);

    items.push({
      id,
      title,
      slug,
      youtubeUrl: rawYoutubeUrl,
      youtubeId: videoId,
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
