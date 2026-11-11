import { Achievement, AchievementField, AchievementLevel } from '../types';
import { parseCSV } from './googleSheetService';
import { FALLBACK_ACHIEVEMENTS } from '../data/fallbackAchievements';

export const PRESTASI_SPREADSHEET_ID = '1-p4oGqZW4G1QEU0F3DDVcn7mO9mx03iltdNp_KumA9Q';
export const PRESTASI_SHEET_GID = '723592882';
export const PRESTASI_CSV_URL = `https://docs.google.com/spreadsheets/d/${PRESTASI_SPREADSHEET_ID}/export?format=csv&gid=${PRESTASI_SHEET_GID}`;
export const PRESTASI_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${PRESTASI_SPREADSHEET_ID}/edit?gid=${PRESTASI_SHEET_GID}#gid=${PRESTASI_SHEET_GID}`;
export const PRESTASI_CACHE_KEY = 'korwilcam_achievements_sheet_cache_v2';
export const PRESTASI_CACHE_TIMESTAMP_KEY = 'korwilcam_achievements_sheet_last_fetch';
export const PRESTASI_CACHE_TTL_MS = 3 * 60 * 1000; // 3 Menit Smart Cache TTL Anti-Lag

export const PRESTASI_WEBAPP_STORAGE_KEY = 'korwilcam_prestasi_gas_url';
export const DEFAULT_PRESTASI_WEBAPP_URL = 
  (import.meta.env.VITE_PRESTASI_WEBAPP_URL as string) || 
  'https://script.google.com/macros/s/AKfycbzcDK-zSTbtYYw-at5zZGaLzv2IpLGTBjkNtRPQ11QOg5ClaTNmm5ip3GcFQvOxq0wSwg/exec';

export interface AchievementSubmitPayload {
  title: string;          // Kolom B: Nama Lomba
  level: string;          // Kolom C: Jenjang Lomba
  rank: string;           // Kolom D: Peringkat / Juara
  year: number | string;  // Kolom E: Tahun Perlombaan
  recipientName: string;  // Kolom F: Nama Lengkap Siswa
  schoolName: string;     // Kolom G: Asal Sekolah
  mentorName?: string;    // Kolom H: Nama Guru Pembimbing
  eventDate?: string;     // Kolom I: Tanggal Pelaksanaan
  photoUrl?: string;      // Kolom J: Link Foto Google Drive
  description?: string;   // Kolom K: Ucapan Pesan & Kesan Siswa
}

let inMemoryPrestasiWebAppUrl = '';

export function getPrestasiWebAppUrl(): string {
  if (inMemoryPrestasiWebAppUrl && inMemoryPrestasiWebAppUrl.trim()) {
    return inMemoryPrestasiWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(PRESTASI_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryPrestasiWebAppUrl = saved.trim();
      return inMemoryPrestasiWebAppUrl;
    }
  } catch {}
  return DEFAULT_PRESTASI_WEBAPP_URL;
}

export function setPrestasiWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryPrestasiWebAppUrl = clean;
  try {
    localStorage.setItem(PRESTASI_WEBAPP_STORAGE_KEY, clean);
  } catch {}
}

export const PRESTASI_GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * WEBHOOK GOOGLE APPS SCRIPT (GAS) - UPLOAD DATA PRESTASI KORWILCAM PURWODADI
 * =========================================================================
 * 
 * Spreadsheet Target:
 * https://docs.google.com/spreadsheets/d/1-p4oGqZW4G1QEU0F3DDVcn7mO9mx03iltdNp_KumA9Q/edit?gid=723592882#gid=723592882
 * Target GID: 723592882
 * 
 * PEMETAAN KOLOM:
 * Kolom A (1) : Timestamp (Waktu Unggah Otomatis)
 * Kolom B (2) : Nama Lomba
 * Kolom C (3) : Jenjang Lomba
 * Kolom D (4) : Peringkat / Juara
 * Kolom E (5) : Tahun Perlombaan
 * Kolom F (6) : Nama Lengkap Siswa
 * Kolom G (7) : Asal Sekolah
 * Kolom H (8) : Nama Guru Pembimbing
 * Kolom I (9) : Tanggal Pelaksanaan
 * Kolom J (10): Link Foto Google Drive
 * Kolom K (11): Ucapan Pesan & Kesan Siswa
 */

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const TARGET_GID = 723592882;
    
    // Cari sheet berdasarkan GID 723592882 agar tepat sasaran
    let sheet = ss.getSheets().find(s => s.getSheetId() === TARGET_GID);
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }
    
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'error', message: 'Payload tidak ditemukan' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // Format Waktu WIB (Asia/Jakarta)
    const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "dd/MM/yyyy HH:mm:ss");
    
    // Susun baris baru sesuai urutan kolom A sampai K
    const newRow = [
      timestamp,                                               // Kolom A: Timestamp
      data.title || '',                                        // Kolom B: Nama Lomba
      data.level || '',                                        // Kolom C: Jenjang Lomba
      data.rank || '',                                         // Kolom D: Peringkat / Juara
      data.year || new Date().getFullYear(),                   // Kolom E: Tahun Perlombaan
      data.recipientName || '',                                // Kolom F: Nama Lengkap Siswa
      data.schoolName || '',                                   // Kolom G: Asal Sekolah
      data.mentorName || '',                                   // Kolom H: Nama Guru Pembimbing
      data.eventDate || '',                                    // Kolom I: Tanggal Pelaksanaan
      data.photoUrl || '',                                     // Kolom J: Link Foto Google Drive
      data.description || ''                                   // Kolom K: Ucapan Pesan & Kesan Siswa
    ];
    
    sheet.appendRow(newRow);
    
    const lastRowIndex = sheet.getLastRow();
    
    // Rapikan formatting font dan alignment baris baru
    const rowRange = sheet.getRange(lastRowIndex, 1, 1, newRow.length);
    rowRange.setFontFamily('Arial');
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment('middle');
    
    return ContentService.createTextOutput(
      JSON.stringify({
        status: 'success',
        message: 'Data prestasi berhasil disimpan ke Google Spreadsheet!',
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
    'Webhook Google Apps Script Prestasi Korwilcam Purwodadi Aktif & Siap Menerima Data.'
  );
}`;

/**
 * Kirim data prestasi langsung ke Google Spreadsheet via GAS Web App
 */
export async function submitAchievementToSheet(payload: AchievementSubmitPayload): Promise<{ success: boolean; message: string }> {
  const webAppUrl = getPrestasiWebAppUrl();

  if (!webAppUrl) {
    return {
      success: false,
      message: 'URL Google Apps Script Web App belum dikonfigurasi. Harap masukkan URL Web App terlebih dahulu.'
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

    // Reset timestamp cache agar saat user kembali ke daftar prestasi, data baru langsung ditarik
    try {
      localStorage.removeItem(PRESTASI_CACHE_TIMESTAMP_KEY);
    } catch {}

    return {
      success: true,
      message: 'Data prestasi berhasil terkirim dan disimpan ke Google Spreadsheet!'
    };
  } catch (err: any) {
    console.error('Gagal mengirim data prestasi ke Spreadsheet:', err);
    return {
      success: false,
      message: `Terjadi kendala saat mengirim data: ${err?.message || err}`
    };
  }
}

/**
 * Deteksi otomatis Bidang Kompetisi berdasarkan nama perlombaan
 */
export function inferAchievementField(title: string): AchievementField {
  const t = (title || '').toLowerCase();
  if (
    t.includes('mapsi') ||
    t.includes("qur'an") ||
    t.includes('quran') ||
    t.includes('azan') ||
    t.includes('adzan') ||
    t.includes('iqamah') ||
    t.includes('iqomah') ||
    t.includes('khat') ||
    t.includes('khot') ||
    t.includes('khitobah') ||
    t.includes('pai') ||
    t.includes('btq') ||
    t.includes('hifdzil') ||
    t.includes('tilawatil') ||
    t.includes('tilāwatil') ||
    t.includes('ḥifẓil') ||
    t.includes('kaligrafi') ||
    t.includes('cerita islami') ||
    t.includes('sholat') ||
    t.includes('wudhu') ||
    t.includes('mocopat') ||
    t.includes('macapat islami')
  ) {
    return 'Keagamaan / MAPSI';
  }
  if (
    t.includes('ftbi') ||
    t.includes('bahasa') ||
    t.includes('literasi') ||
    t.includes('mendongeng') ||
    t.includes('geguritan') ||
    t.includes('sesorah') ||
    t.includes('aksara') ||
    t.includes('cerkak') ||
    t.includes('pidato') ||
    t.includes('puisi') ||
    t.includes('menulis') ||
    t.includes('ndagel') ||
    t.includes('maca')
  ) {
    return 'Literasi / FTBI';
  }
  if (
    t.includes('fls2n') ||
    t.includes('fls3n') ||
    t.includes('tari') ||
    t.includes('menyanyi') ||
    t.includes('vokal') ||
    t.includes('pantomim') ||
    t.includes('gambar') ||
    t.includes('seni') ||
    t.includes('kriya') ||
    t.includes('musik') ||
    t.includes('lukis') ||
    t.includes('batik') ||
    t.includes('karawitan') ||
    t.includes('mewarnai') ||
    t.includes('story telling')
  ) {
    return 'Seni & Budaya / FLS2N';
  }
  if (
    t.includes('o2sn') ||
    t.includes('02sn') ||
    t.includes('olahraga') ||
    t.includes('renang') ||
    t.includes('silat') ||
    t.includes('karate') ||
    t.includes('atletik') ||
    t.includes('bulu tangkis') ||
    t.includes('badminton') ||
    t.includes('senam') ||
    t.includes('catur') ||
    t.includes('voli') ||
    t.includes('sepak bola') ||
    t.includes('taekwondo') ||
    t.includes('lari') ||
    t.includes('tenis')
  ) {
    return 'Olahraga / O2SN';
  }
  if (
    t.includes('osn') ||
    t.includes('matematika') ||
    t.includes('ipa') ||
    t.includes('sains') ||
    t.includes('stem') ||
    t.includes('robotik')
  ) {
    return 'Sains / OSN';
  }
  if (
    t.includes('gtk') ||
    t.includes('guru') ||
    t.includes('inovasi') ||
    t.includes('tendik') ||
    t.includes('kepala sekolah')
  ) {
    return 'Inovasi GTK';
  }
  return 'Lainnya';
}

/**
 * Normalisasi jenjang lomba ke tipe resmi
 */
export function normalizeAchievementLevel(val: string): AchievementLevel {
  const v = (val || '').trim().toLowerCase();
  if (v.includes('internasional')) return 'Internasional';
  if (v.includes('nasional')) return 'Nasional';
  if (v.includes('provinsi')) return 'Provinsi';
  if (v.includes('kabupaten')) return 'Kabupaten';
  return 'Kecamatan';
}

/**
 * Generate slug yang rapi untuk URL detail prestasi
 */
export function generateAchievementSlug(name: string, title?: string): string {
  const parts = [name, title].filter(Boolean).join(' ');
  return parts
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ambil data dari cache lokal (localStorage) jika tersedia
 */
export function getLocalAchievementsCache(): Achievement[] {
  try {
    const saved = localStorage.getItem(PRESTASI_CACHE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Gagal membaca cache prestasi:', e);
  }
  return FALLBACK_ACHIEVEMENTS;
}

/**
 * Tarik data live langsung dari Google Spreadsheet
 * Dilengkapi Smart TTL Cache (3 menit) untuk menjamin kecepatan 0ms bagi ribuan pengunjung
 */
export async function fetchAchievementsFromSheet(forceRefresh = false): Promise<Achievement[]> {
  if (!forceRefresh) {
    try {
      const lastFetchStr = localStorage.getItem(PRESTASI_CACHE_TIMESTAMP_KEY);
      const cached = getLocalAchievementsCache();
      if (lastFetchStr && cached && cached.length > 0) {
        const lastFetch = Number(lastFetchStr);
        if (!isNaN(lastFetch) && Date.now() - lastFetch < PRESTASI_CACHE_TTL_MS) {
          return cached;
        }
      }
    } catch {}
  }

  try {
    const res = await fetch(PRESTASI_CSV_URL, {
      method: 'GET',
      cache: 'no-cache',
    });

    if (!res.ok) {
      throw new Error(`Gagal mengunduh spreadsheet prestasi (Status ${res.status})`);
    }

    const csvText = await res.text();
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Data spreadsheet prestasi kosong');
    }

    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      throw new Error('Baris CSV spreadsheet prestasi tidak terbaca');
    }

    // Deteksi baris header (mencari baris yang mengandung 'NAMA' atau 'LOMBA' atau 'TIMESTAMP')
    let headerRowIdx = rows.findIndex((row) =>
      row.some((col) => col && (
        col.trim().toUpperCase().includes('NAMA') || 
        col.trim().toUpperCase().includes('LOMBA') ||
        col.trim().toUpperCase().includes('TIMESTAMP')
      ))
    );

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const items: Achievement[] = [];

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      // Pemetaan kolom sesuai struktur spreadsheet:
      // Kolom A (0): Timestamp
      // Kolom B (1): Nama Perlombaan
      // Kolom C (2): Jenjang Perlombaan (Kecamatan, Kabupaten, Provinsi, Nasional, etc.)
      // Kolom D (3): Peringkat (Juara 1, Juara 2, Juara 3, Harapan 1, etc.)
      // Kolom E (4): Tahun Perlombaan
      // Kolom F (5): Nama Siswa
      // Kolom G (6): Asal Sekolah
      // Kolom H (7): Guru Pembimbing
      // Kolom I (8): Waktu Pelaksanaan Lomba
      // Kolom J (9): Foto Siswa (Link Google Drive)
      // Kolom K (10): Ucapan Pesan & Kesan Oleh Siswa

      const timestamp = (row[0] || '').trim();
      const title = (row[1] || '').trim();
      const jenjang = (row[2] || '').trim();
      const rank = (row[3] || '').trim();
      const yearStr = (row[4] || '').trim();
      const recipientName = (row[5] || '').trim();
      const schoolName = (row[6] || '').trim();
      const mentorName = (row[7] || '').trim();
      const eventDate = (row[8] || '').trim();
      const photoUrl = (row[9] || '').trim();
      const description = (row[10] || '').trim();

      // Lewati baris uji coba / baris kosong
      if (
        !recipientName || 
        !title ||
        (title.toLowerCase() === 'tes' && recipientName.toLowerCase() === 'tes') ||
        recipientName.toLowerCase().includes('nama lengkap')
      ) {
        continue;
      }

      const year = parseInt(yearStr, 10) || 2026;
      const level = normalizeAchievementLevel(jenjang);
      const field = inferAchievementField(title);
      const id = `prestasi-sheet-${i}`;
      const slug = generateAchievementSlug(recipientName, title);

      items.push({
        id,
        slug,
        title,
        category: 'Siswa',
        field,
        rank,
        level,
        recipientName,
        schoolName,
        year,
        eventDate,
        mentorName,
        photoUrl,
        description,
        createdAt: timestamp ? new Date().toISOString() : undefined,
        authorName: 'Form Guru & Siswa',
        authorRole: 'Google Form'
      });
    }

    if (items.length > 0) {
      try {
        localStorage.setItem(PRESTASI_CACHE_KEY, JSON.stringify(items));
        localStorage.setItem(PRESTASI_CACHE_TIMESTAMP_KEY, String(Date.now()));
      } catch (e) {
        console.warn('Gagal menyimpan cache prestasi:', e);
      }
      return items;
    }

    return getLocalAchievementsCache();
  } catch (err) {
    console.warn('Gagal fetch live prestasi dari Google Spreadsheet, menggunakan cache fallback:', err);
    return getLocalAchievementsCache();
  }
}
