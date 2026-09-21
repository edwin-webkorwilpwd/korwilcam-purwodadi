/**
 * activityLogger.ts
 * Utilitas untuk merekam Log Aktivitas pengguna ke Google Spreadsheet
 * menggunakan Google Apps Script Web App (tanpa membebani Supabase).
 */

import { getSupabaseClient } from './supabase';

export const SPREADSHEET_VIEW_URL = 'https://docs.google.com/spreadsheets/d/1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM/edit?pli=1&gid=0#gid=0';
const STORAGE_KEY_WEBAPP_URL = 'antigravity_activity_log_url';

// Default URL dari environment jika dikonfigurasi
const DEFAULT_WEBAPP_URL = (import.meta.env.VITE_ACTIVITY_LOG_WEBAPP_URL as string) || '';

// Cache memori agar URL selalu tersedia lintas komponen tanpa jeda baca storage
let inMemoryWebAppUrl: string = '';

/**
 * Mengambil URL Google Apps Script Web App yang tersimpan (Memori -> LocalStorage -> Env)
 */
export const getActivityLogUrl = (): string => {
  if (inMemoryWebAppUrl && inMemoryWebAppUrl.trim()) {
    return inMemoryWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WEBAPP_URL);
    if (saved && saved.trim()) {
      inMemoryWebAppUrl = saved.trim();
      return inMemoryWebAppUrl;
    }
  } catch {}
  return DEFAULT_WEBAPP_URL;
};

/**
 * Menyimpan URL Google Apps Script Web App ke penyimpanan lokal & cache memori
 */
export const setActivityLogUrl = (url: string): void => {
  const clean = (url || '').trim();
  inMemoryWebAppUrl = clean;
  try {
    localStorage.setItem(STORAGE_KEY_WEBAPP_URL, clean);
  } catch {}
};

/**
 * Mengambil URL Web App dari tabel 'activity_log_settings' di Supabase Cloud.
 * Ini memastikan URL langsung aktif di browser atau komputer baru manapun.
 */
export const fetchActivityLogUrlFromSupabase = async (): Promise<string> => {
  try {
    const client = getSupabaseClient();
    if (!client) return getActivityLogUrl();

    const { data, error } = await client
      .from('activity_log_settings')
      .select('webapp_url')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data && data.webapp_url) {
      const fetchedUrl = data.webapp_url.trim();
      setActivityLogUrl(fetchedUrl);
      return fetchedUrl;
    }
  } catch (err) {
    console.warn('Gagal memuat activity_log_settings dari Supabase:', err);
  }
  return getActivityLogUrl();
};

/**
 * Menyimpan URL Web App ke tabel 'activity_log_settings' di Supabase Cloud
 * agar menjadi default permanen untuk seluruh admin di browser manapun.
 */
export const saveActivityLogUrlToSupabase = async (
  url: string
): Promise<{ success: boolean; message: string }> => {
  const cleanUrl = (url || '').trim();
  setActivityLogUrl(cleanUrl);

  try {
    const client = getSupabaseClient();
    if (!client) {
      return {
        success: true,
        message: 'URL tersimpan di penyimpanan lokal browser (Supabase belum terkonfigurasi).'
      };
    }

    const { error } = await client
      .from('activity_log_settings')
      .upsert(
        {
          id: 'default',
          webapp_url: cleanUrl,
          spreadsheet_url: SPREADSHEET_VIEW_URL,
          is_active: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Supabase upsert activity_log_settings error:', error);
      return {
        success: false,
        message: `Gagal menyimpan ke tabel Supabase: ${error.message}`
      };
    }

    return {
      success: true,
      message: 'URL Web App berhasil disimpan permanen ke tabel activity_log_settings di Supabase!'
    };
  } catch (err: any) {
    console.error('saveActivityLogUrlToSupabase exception:', err);
    return {
      success: false,
      message: `Terjadi kendala saat menyimpan: ${err.message || err}`
    };
  }
};

/**
 * Mendapatkan deskripsi ringkas perangkat & peramban pengguna
 */
export const getClientDeviceInfo = (): string => {
  if (typeof navigator === 'undefined') return 'Server/Unknown';
  
  const ua = navigator.userAgent || '';
  let browser = 'Browser';
  let os = 'Unknown OS';

  // Deteksi OS
  if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Deteksi Browser
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  return `${browser} on ${os}`;
};

/**
 * Format waktu saat ini dalam WIB (UTC+7)
 */
export const getWIBTimestamp = (): string => {
  const now = new Date();
  // Gunakan Intl untuk waktu zona WIB (Asia/Jakarta)
  try {
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return `${formatter.format(now).replace(/\./g, ':')} WIB`;
  } catch {
    return `${now.toLocaleString('id-ID')} WIB`;
  }
};

export interface ActivityLogPayload {
  user?: string;
  username?: string;
  role?: string;
  action: 'LOGIN' | 'LOGOUT' | 'TAMBAH DATA' | 'UBAH DATA' | 'HAPUS DATA' | 'RESET DATA';
  module: string;
  description: string;
  status?: 'BERHASIL' | 'GAGAL';
  timestamp?: string;
  device?: string;
}

/**
 * Mengirim catatan log aktivitas ke Google Spreadsheet melalui Google Apps Script Web App
 */
export const logActivity = async (payload: ActivityLogPayload): Promise<boolean> => {
  let webAppUrl = getActivityLogUrl();
  
  // Jika URL belum ada di cache memori/localStorage, coba tarik otomatis dari Supabase
  if (!webAppUrl) {
    try {
      webAppUrl = await fetchActivityLogUrlFromSupabase();
    } catch {}
  }
  
  const fullEntry = {
    timestamp: payload.timestamp || getWIBTimestamp(),
    user: payload.user || 'Sistem',
    username: payload.username || '-',
    role: payload.role || '-',
    action: payload.action,
    module: payload.module,
    description: payload.description,
    status: payload.status || 'BERHASIL',
    device: payload.device || getClientDeviceInfo()
  };

  // Selalu tampilkan di console untuk kemudahan pengawasan lokal
  console.log(`[ActivityLog] ${fullEntry.action} [${fullEntry.module}]: ${fullEntry.description}`, fullEntry);

  if (!webAppUrl) {
    // Belum dikonfigurasi URL-nya, lewati tanpa error
    return false;
  }

  try {
    // Kirim menggunakan fetch dengan method POST
    // Google Apps Script redirect response ditangani baik dengan mode no-cors
    await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(fullEntry),
      mode: 'no-cors'
    });
    return true;
  } catch (err) {
    console.warn('[ActivityLog] Gagal mengirim log ke Google Spreadsheet:', err);
    return false;
  }
};

/**
 * Uji kirim log aktivitas untuk memvalidasi apakah Google Apps Script Web App aktif
 */
export const testActivityLogWebhook = async (customUrl?: string): Promise<{ success: boolean; message: string }> => {
  const targetUrl = customUrl ? customUrl.trim() : getActivityLogUrl();
  if (!targetUrl) {
    return {
      success: false,
      message: 'URL Google Apps Script Web App belum diisi.'
    };
  }

  if (!targetUrl.startsWith('https://script.google.com/macros/s/')) {
    return {
      success: false,
      message: 'Format URL tidak valid. URL harus diawali dengan https://script.google.com/macros/s/ dan berakhiran /exec'
    };
  }

  try {
    const testEntry = {
      timestamp: getWIBTimestamp(),
      user: 'Uji Coba Sistem',
      username: 'test_admin',
      role: 'Super Admin',
      action: 'LOGIN' as const,
      module: 'Pemeriksaan Sistem',
      description: 'Pengujian koneksi webhook Google Apps Script dari Admin Dashboard',
      status: 'BERHASIL' as const,
      device: getClientDeviceInfo()
    };

    await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(testEntry),
      mode: 'no-cors'
    });

    return {
      success: true,
      message: 'Pengujian terkirim! Silakan periksa file Google Spreadsheet Anda, baris baru log pengujian seharusnya sudah muncul.'
    };
  } catch (err) {
    return {
      success: false,
      message: `Gagal mengirim pengujian: ${err instanceof Error ? err.message : String(err)}`
    };
  }
};

/**
 * Kode Google Apps Script lengkap yang siap disalin oleh pengguna
 * untuk ditempelkan di menu Ekstensi > Apps Script pada Google Spreadsheet.
 */
export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT: LOG AKTIVITAS WEBSITE KORWILCAM PURWODADI
 * ============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka file Google Spreadsheet Anda:
 *    https://docs.google.com/spreadsheets/d/1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM/edit
 * 2. Klik menu "Ekstensi" (Extensions) > pilih "Apps Script".
 * 3. Hapus semua kode default di dalam editor (Code.gs), lalu tempelkan seluruh kode ini.
 * 4. Klik ikon Disket (Simpan proyek).
 * 5. Pada dropdown fungsi di atas, pilih fungsi "setupSheet", lalu klik tombol "Jalankan" (Run).
 *    (Beri izin akses jika Google meminta konfirmasi otoritas pertama kali).
 * 6. Klik tombol biru "Terapkan" (Deploy) di kanan atas > pilih "Penerapan baru" (New deployment).
 *    - Pilih jenis: "Aplikasi web" (Web app)
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Siapa yang memiliki akses: "Siapa saja" (Anyone)
 * 7. Klik "Terapkan" (Deploy) > Salin URL Aplikasi Web (berakhiran /exec).
 * 8. Tempelkan URL tersebut ke kolom "URL Google Apps Script Web App" di Admin Dashboard Website.
 * ============================================================================
 */

const SHEET_NAME = 'Log Aktivitas';

/**
 * 1. Menyiapkan Sheet dan Judul Kolom Otomatis
 * Jalankan fungsi ini 1x pertama kali untuk membuat lembar kerja dan judul kolom dengan format rapi.
 */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  const headers = [
    'No',
    'Waktu (WIB)',
    'Nama Pengguna',
    'Username / Akun',
    'Peran (Role)',
    'Jenis Aktivitas',
    'Modul / Fitur',
    'Keterangan Detail',
    'Status',
    'Perangkat / Browser'
  ];
  
  // Set Header Style
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#059669'); // Hijau Emerald Elegan
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);
  
  // Atur Lebar Kolom yang Ideal
  sheet.setColumnWidth(1, 55);   // No
  sheet.setColumnWidth(2, 175);  // Waktu (WIB)
  sheet.setColumnWidth(3, 190);  // Nama Pengguna
  sheet.setColumnWidth(4, 150);  // Username / Akun
  sheet.setColumnWidth(5, 130);  // Peran (Role)
  sheet.setColumnWidth(6, 140);  // Jenis Aktivitas
  sheet.setColumnWidth(7, 165);  // Modul / Fitur
  sheet.setColumnWidth(8, 400);  // Keterangan Detail
  sheet.setColumnWidth(9, 110);  // Status
  sheet.setColumnWidth(10, 210); // Perangkat / Browser
  
  Logger.log('Inisialisasi Sheet "' + SHEET_NAME + '" berhasil dibuat dengan format rapi!');
}

/**
 * 2. Menerima data Log Aktivitas dari Website secara Real-Time via HTTP POST
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }
    
    // Parse data JSON yang dikirimkan dari website
    const data = JSON.parse(e.postData.contents);
    const lastRow = Math.max(1, sheet.getLastRow());
    const nextNo = lastRow > 1 ? lastRow : 1; // Nomor urut otomatis
    
    // Susun baris log
    const row = [
      nextNo,
      data.timestamp || new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) + ' WIB',
      data.user || 'Sistem',
      data.username || '-',
      data.role || '-',
      data.action || 'AKTIVITAS',
      data.module || 'Sistem',
      data.description || '-',
      data.status || 'BERHASIL',
      data.device || '-'
    ];
    
    sheet.appendRow(row);
    
    // Format sel baris terakhir agar rapi
    const newRowIndex = sheet.getLastRow();
    const rowRange = sheet.getRange(newRowIndex, 1, 1, row.length);
    rowRange.setFontFamily('Arial');
    rowRange.setFontSize(10);
    rowRange.setVerticalAlignment('middle');
    
    // Pewarnaan status (Hijau jika BERHASIL, Merah jika GAGAL)
    const statusCell = sheet.getRange(newRowIndex, 9);
    if (data.status === 'GAGAL') {
      statusCell.setFontColor('#DC2626');
      statusCell.setFontWeight('bold');
    } else {
      statusCell.setFontColor('#059669');
      statusCell.setFontWeight('bold');
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'success', row: newRowIndex })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 3. Endpoint Verifikasi GET
 */
function doGet(e) {
  return ContentService.createTextOutput('Webhook Log Aktivitas Korwilcam Purwodadi Siap & Aktif.');
}`;

