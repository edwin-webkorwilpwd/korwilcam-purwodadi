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
