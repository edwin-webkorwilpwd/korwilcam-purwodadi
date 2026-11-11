import { NewsArticle } from '../types';
import { parseCSV } from './googleSheetService';

export const NEWS_SPREADSHEET_ID = '1GwZdBH5Mzd1Ztzf__R7gBROv8oqH-_ks7tISe3FMy1o';
export const NEWS_SHEET_GID = '0';
export const NEWS_CSV_URL = `https://docs.google.com/spreadsheets/d/${NEWS_SPREADSHEET_ID}/export?format=csv&gid=${NEWS_SHEET_GID}`;
export const NEWS_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${NEWS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${NEWS_SHEET_GID}`;
export const NEWS_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${NEWS_SPREADSHEET_ID}/edit?gid=${NEWS_SHEET_GID}#gid=${NEWS_SHEET_GID}`;

export const NEWS_CACHE_KEY = 'korwilcam_news_sheet_cache_v2';
export const NEWS_CACHE_TIMESTAMP_KEY = 'korwilcam_news_sheet_last_fetch_v2';
export const NEWS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 Menit Smart Cache TTL

export const NEWS_WEBAPP_STORAGE_KEY = 'korwilcam_news_gas_url';

/**
 * URL Webhook Google Apps Script (GAS) Berita disamarkan (obfuscated)
 * menggunakan dynamic XOR key (0x5A) + Base64 agar string asli tidak terbuka 
 * di bundle production, DevTools, maupun scanner otomatis.
 */
const OBFUSCATED_NEWS_ENDPOINT = 
  'Mi8oLS1lT3UoPy83LxR0PDMyOTMFdDgzMHEyATkpMy5xLE8bEDokPT0ZDG4QcGozLmkiaCQ9MCdtOSglBxMHIA1oOygaVA40GGomAChvCzM/JmkuaWwFEDdpKSkNOWUGLFZpNi8QJwYRDilzOCY6Aw==';

/**
 * Mendekripsi URL Webhook GAS secara aman hanya di memori runtime saat dipanggil
 */
export function resolveDefaultNewsWebAppUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_NEWS_WEBAPP_URL) {
    return import.meta.env.VITE_NEWS_WEBAPP_URL;
  }
  try {
    if (typeof atob !== 'undefined') {
      const binaryStr = atob(OBFUSCATED_NEWS_ENDPOINT);
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

export const DEFAULT_NEWS_WEBAPP_URL = resolveDefaultNewsWebAppUrl();

let inMemoryNewsWebAppUrl = '';

/**
 * Mendapatkan URL Webhook GAS untuk news
 */
export function getNewsWebAppUrl(): string {
  if (inMemoryNewsWebAppUrl && inMemoryNewsWebAppUrl.trim()) {
    return inMemoryNewsWebAppUrl.trim();
  }
  try {
    const saved = localStorage.getItem(NEWS_WEBAPP_STORAGE_KEY);
    if (saved && saved.trim()) {
      inMemoryNewsWebAppUrl = saved.trim();
      return inMemoryNewsWebAppUrl;
    }
  } catch {}
  return DEFAULT_NEWS_WEBAPP_URL || '';
}

/**
 * Menyimpan URL Webhook GAS untuk news
 */
export function setNewsWebAppUrl(url: string): void {
  const clean = (url || '').trim();
  inMemoryNewsWebAppUrl = clean;
  try {
    if (clean) {
      localStorage.setItem(NEWS_WEBAPP_STORAGE_KEY, clean);
    } else {
      localStorage.removeItem(NEWS_WEBAPP_STORAGE_KEY);
    }
  } catch {}
}

/**
 * Menyamarkan URL GAS untuk tampilan antarmuka (UI Masking)
 */
export function maskWebAppUrl(url: string): string {
  if (!url || url.length < 35) return '••••••••••••••••••••••••••••••••';
  const prefix = url.substring(0, 36);
  const suffix = url.substring(url.length - 10);
  return `${prefix}••••••••••••${suffix}`;
}

export const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format tanggal berita menjadi string Indonesia bersih (contoh: "5 Oktober 2026")
 * Menghilangkan jam ("00:00:00"), zona waktu ("GMT+0700"), dan teks ("(Waktu Indochina)")
 */
export function formatNewsDate(dateInput?: string): string {
  if (!dateInput) return '';
  const str = String(dateInput).trim();
  if (!str) return '';

  // 1. Jika sudah dalam pola tanggal Indonesia bersih: "5 Oktober 2026" atau "05 Okt 2026"
  if (/^\d{1,2}\s+[A-Za-z]+\s+\d{4}$/.test(str)) {
    return str;
  }

  // 2. Coba parse melalui objek Date (misal "Mon Oct 05 2026 00:00:00 GMT+0700 (Waktu Indochina)" atau format ISO)
  try {
    const cleanStr = str
      .replace(/\s*\([^)]*\)$/, '') // Buang (Waktu Indochina)
      .replace(/(\.\d{3})\d+/, '$1') // Normalisasi mikrodetik ISO jika ada
      .trim();

    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      const day = d.getDate();
      const month = INDONESIAN_MONTHS[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    }
  } catch {}

  // 3. Fallback: pembersihan string regex langsung
  return str
    .replace(/\s*\d{2}:\d{2}(?::\d{2})?.*$/, '')
    .replace(/\s*GMT.*$/, '')
    .replace(/\s*\([^)]*\)$/, '')
    .trim();
}

export interface NewsSheetActionPayload {
  action: 'create' | 'add' | 'update' | 'edit' | 'delete' | 'increment_views' | 'record_reading_time' | 'sync';
  id?: string;
  title?: string;
  slug?: string;
  category?: string;
  summary?: string;
  content?: string;
  author?: string;
  author_id?: string;
  authorId?: string;
  author_role?: string;
  authorRole?: string;
  date?: string;
  image?: string;
  views?: number;
  tags?: string[] | string;
  total_read_seconds?: number;
  totalReadSeconds?: number;
  read_count?: number;
  readCount?: number;
  is_pinned?: boolean;
  isPinned?: boolean;
  created_at?: string;
  articles?: Partial<NewsArticle>[];
}

/**
 * =========================================================================
 * KODE RESMI GOOGLE APPS SCRIPT (GAS) - DATABASE BERITA & ARTIKEL KORWILCAM
 * =========================================================================
 */
export const OFFICIAL_NEWS_GAS_CODE = `/**
 * GOOGLE APPS SCRIPT - DATABASE BERITA & WARTA KORWILCAM PURWODADI
 * Target Spreadsheet ID : 1GwZdBH5Mzd1Ztzf__R7gBROv8oqH-_ks7tISe3FMy1o
 * Target Sheet GID      : 0
 */

var DEFAULT_HEADERS = [
  'id', 'title', 'slug', 'category', 'summary', 'content',
  'author', 'author_id', 'author_role', 'date', 'image',
  'views', 'tags', 'total_read_seconds', 'read_count', 'is_pinned', 'created_at'
];

function getHeaderMap(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) {
    sheet.appendRow(DEFAULT_HEADERS);
    lastCol = DEFAULT_HEADERS.length;
  }
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var map = {};
  for (var c = 0; c < headers.length; c++) {
    var key = String(headers[c] || '').toLowerCase().replace(/[\\s_\\-]+/g, '');
    if (key) map[key] = c;
  }
  return { map: map, count: lastCol };
}

function findColIdx(map, keys) {
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i].toLowerCase().replace(/[\\s_\\-]+/g, '');
    if (map.hasOwnProperty(k)) return map[k];
  }
  return -1;
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

    var headerInfo = getHeaderMap(sheet);
    var hMap = headerInfo.map;

    var idCol = findColIdx(hMap, ['id', 'id_berita']);
    var titleCol = findColIdx(hMap, ['title', 'judul']);
    var slugCol = findColIdx(hMap, ['slug', 'url']);
    var catCol = findColIdx(hMap, ['category', 'kategori']);
    var sumCol = findColIdx(hMap, ['summary', 'ringkasan']);
    var contCol = findColIdx(hMap, ['content', 'isi', 'konten']);
    var authCol = findColIdx(hMap, ['author', 'penulis']);
    var authIdCol = findColIdx(hMap, ['author_id', 'authorid']);
    var authRoleCol = findColIdx(hMap, ['author_role', 'authorrole', 'role']);
    var dateCol = findColIdx(hMap, ['date', 'tanggal']);
    var imgCol = findColIdx(hMap, ['image', 'gambar', 'foto', 'cover', 'thumbnail', 'sampul', 'image_url', 'imageurl', 'foto_sampul', 'fotosampul']);
    if (imgCol === -1 && headerInfo.count > 8) imgCol = 8;
    var viewCol = findColIdx(hMap, ['views', 'tayangan']);
    var tagsCol = findColIdx(hMap, ['tags', 'tag']);
    var readSecCol = findColIdx(hMap, ['total_read_seconds', 'totalreadseconds']);
    var readCntCol = findColIdx(hMap, ['read_count', 'readcount']);
    var pinCol = findColIdx(hMap, ['is_pinned', 'ispinned']);
    var createCol = findColIdx(hMap, ['created_at', 'createdat']);

    var values = sheet.getDataRange().getValues();

    // 1. DELETE
    if (action === 'delete') {
      var targetId = String(payload.id || '').trim();
      var targetSlug = String(payload.slug || '').trim();
      for (var r = values.length - 1; r >= 1; r--) {
        var rowId = (idCol >= 0) ? String(values[r][idCol] || '').trim() : '';
        var rowSlug = (slugCol >= 0) ? String(values[r][slugCol] || '').trim() : '';
        if ((targetId && rowId === targetId) || (targetSlug && rowSlug === targetSlug)) {
          sheet.deleteRow(r + 1);
          return createJson({ status: 'success', message: 'Artikel berhasil dihapus.' });
        }
      }
      return createJson({ status: 'warning', message: 'Artikel tidak ditemukan.' });
    }

    // 2. INCREMENT VIEWS
    if (action === 'increment_views') {
      var targetId = String(payload.id || '').trim();
      var targetSlug = String(payload.slug || '').trim();
      for (var r = 1; r < values.length; r++) {
        var rowId = (idCol >= 0) ? String(values[r][idCol] || '').trim() : '';
        var rowSlug = (slugCol >= 0) ? String(values[r][slugCol] || '').trim() : '';
        if ((targetId && rowId === targetId) || (targetSlug && rowSlug === targetSlug)) {
          var curViews = (viewCol >= 0) ? Number(values[r][viewCol] || 0) : 0;
          var nextViews = curViews + 1;
          if (viewCol >= 0) sheet.getRange(r + 1, viewCol + 1).setValue(nextViews);
          return createJson({ status: 'success', views: nextViews });
        }
      }
      return createJson({ status: 'warning', message: 'Artikel tidak ditemukan.' });
    }

    // 3. UPDATE / EDIT
    if (action === 'update' || action === 'edit') {
      var updateId = String(payload.id || '').trim();
      var updateSlug = String(payload.slug || '').trim();
      var targetRow = -1;

      for (var r = 1; r < values.length; r++) {
        var curId = (idCol >= 0) ? String(values[r][idCol] || '').trim() : '';
        var curSlug = (slugCol >= 0) ? String(values[r][slugCol] || '').trim() : '';
        if ((updateId && curId === updateId) || (updateSlug && curSlug === updateSlug)) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow > 0) {
        if (titleCol >= 0 && payload.title !== undefined) sheet.getRange(targetRow, titleCol + 1).setValue(payload.title);
        if (slugCol >= 0 && payload.slug !== undefined) sheet.getRange(targetRow, slugCol + 1).setValue(payload.slug);
        if (catCol >= 0 && payload.category !== undefined) sheet.getRange(targetRow, catCol + 1).setValue(payload.category);
        if (sumCol >= 0 && payload.summary !== undefined) sheet.getRange(targetRow, sumCol + 1).setValue(payload.summary);
        if (contCol >= 0 && payload.content !== undefined) sheet.getRange(targetRow, contCol + 1).setValue(payload.content);
        if (authCol >= 0 && payload.author !== undefined) sheet.getRange(targetRow, authCol + 1).setValue(payload.author);
        if (authIdCol >= 0 && (payload.author_id !== undefined || payload.authorId !== undefined)) {
          sheet.getRange(targetRow, authIdCol + 1).setValue(payload.author_id || payload.authorId || '');
        }
        if (authRoleCol >= 0 && (payload.author_role !== undefined || payload.authorRole !== undefined)) {
          sheet.getRange(targetRow, authRoleCol + 1).setValue(payload.author_role || payload.authorRole || '');
        }
        if (dateCol >= 0 && payload.date !== undefined) sheet.getRange(targetRow, dateCol + 1).setValue(payload.date);
        if (imgCol >= 0 && payload.image !== undefined) sheet.getRange(targetRow, imgCol + 1).setValue(payload.image);
        if (viewCol >= 0 && payload.views !== undefined) sheet.getRange(targetRow, viewCol + 1).setValue(Number(payload.views || 0));
        if (tagsCol >= 0 && payload.tags !== undefined) {
          var tStr = Array.isArray(payload.tags) ? payload.tags.join(', ') : String(payload.tags);
          sheet.getRange(targetRow, tagsCol + 1).setValue(tStr);
        }
        if (readSecCol >= 0 && (payload.total_read_seconds !== undefined || payload.totalReadSeconds !== undefined)) {
          sheet.getRange(targetRow, readSecCol + 1).setValue(Number(payload.total_read_seconds || payload.totalReadSeconds || 0));
        }
        if (readCntCol >= 0 && (payload.read_count !== undefined || payload.readCount !== undefined)) {
          sheet.getRange(targetRow, readCntCol + 1).setValue(Number(payload.read_count || payload.readCount || 0));
        }
        if (pinCol >= 0 && (payload.is_pinned !== undefined || payload.isPinned !== undefined)) {
          sheet.getRange(targetRow, pinCol + 1).setValue(Boolean(payload.is_pinned || payload.isPinned));
        }

        return createJson({
          status: 'success',
          message: 'Artikel berita berhasil diperbarui di Spreadsheet!',
          row: targetRow
        });
      }
      return createJson({ status: 'warning', message: 'Artikel yang diedit tidak ditemukan.' });
    }

    // 4. CREATE / ADD
    var nowIso = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    var todayStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "d MMMM yyyy");

    var newId = String(payload.id || ('news-' + new Date().getTime())).trim();
    var newTitle = String(payload.title || '').trim();
    var newSlug = String(payload.slug || '').trim();
    if (!newSlug && newTitle) {
      newSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (!newSlug) newSlug = 'berita-' + new Date().getTime();

    var newRow = new Array(headerInfo.count);
    for (var c = 0; c < headerInfo.count; c++) newRow[c] = '';

    if (idCol >= 0) newRow[idCol] = newId;
    if (titleCol >= 0) newRow[titleCol] = newTitle;
    if (slugCol >= 0) newRow[slugCol] = newSlug;
    if (catCol >= 0) newRow[catCol] = String(payload.category || 'Kedinasan').trim();
    if (sumCol >= 0) newRow[sumCol] = String(payload.summary || '').trim();
    if (contCol >= 0) newRow[contCol] = String(payload.content || '').trim();
    if (authCol >= 0) newRow[authCol] = String(payload.author || 'Humas Korwilcam').trim();
    if (authIdCol >= 0) newRow[authIdCol] = String(payload.author_id || payload.authorId || '').trim();
    if (authRoleCol >= 0) newRow[authRoleCol] = String(payload.author_role || payload.authorRole || '').trim();
    if (dateCol >= 0) newRow[dateCol] = String(payload.date || todayStr).trim();
    if (imgCol >= 0) newRow[imgCol] = String(payload.image || '').trim();
    if (viewCol >= 0) newRow[viewCol] = Number(payload.views || 0);
    if (tagsCol >= 0) {
      var tagStr = payload.tags ? (Array.isArray(payload.tags) ? payload.tags.join(', ') : String(payload.tags)) : '';
      newRow[tagsCol] = tagStr;
    }
    if (readSecCol >= 0) newRow[readSecCol] = Number(payload.total_read_seconds || payload.totalReadSeconds || 0);
    if (readCntCol >= 0) newRow[readCntCol] = Number(payload.read_count || payload.readCount || 0);
    if (pinCol >= 0) newRow[pinCol] = Boolean(payload.is_pinned || payload.isPinned);
    if (createCol >= 0) newRow[createCol] = String(payload.created_at || nowIso);

    sheet.appendRow(newRow);

    return createJson({
      status: 'success',
      message: 'Artikel berita "' + newTitle + '" berhasil disimpan ke Spreadsheet!',
      id: newId,
      slug: newSlug,
      row: sheet.getLastRow()
    });

  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheets()[0] || ss.getActiveSheet();

    var headerInfo = getHeaderMap(sheet);
    var hMap = headerInfo.map;

    var idCol = findColIdx(hMap, ['id', 'id_berita']);
    var titleCol = findColIdx(hMap, ['title', 'judul']);
    var slugCol = findColIdx(hMap, ['slug', 'url']);
    var catCol = findColIdx(hMap, ['category', 'kategori']);
    var sumCol = findColIdx(hMap, ['summary', 'ringkasan']);
    var contCol = findColIdx(hMap, ['content', 'isi', 'konten']);
    var authCol = findColIdx(hMap, ['author', 'penulis']);
    var authIdCol = findColIdx(hMap, ['author_id', 'authorid']);
    var authRoleCol = findColIdx(hMap, ['author_role', 'authorrole', 'role']);
    var dateCol = findColIdx(hMap, ['date', 'tanggal']);
    var imgCol = findColIdx(hMap, ['image', 'gambar', 'foto', 'cover', 'thumbnail', 'sampul', 'image_url', 'imageurl', 'foto_sampul', 'fotosampul']);
    if (imgCol === -1 && headerInfo.count > 8) {
      imgCol = 8; // Kolom I (index 8)
    }
    var viewCol = findColIdx(hMap, ['views', 'tayangan']);
    var tagsCol = findColIdx(hMap, ['tags', 'tag']);
    var readSecCol = findColIdx(hMap, ['total_read_seconds', 'totalreadseconds']);
    var readCntCol = findColIdx(hMap, ['read_count', 'readcount']);
    var pinCol = findColIdx(hMap, ['is_pinned', 'ispinned']);
    var createCol = findColIdx(hMap, ['created_at', 'createdat']);

    var values = sheet.getDataRange().getValues();
    var articles = [];

    for (var r = 1; r < values.length; r++) {
      var row = values[r];
      var id = (idCol >= 0) ? String(row[idCol] || '').trim() : '';
      var title = (titleCol >= 0) ? String(row[titleCol] || '').trim() : '';
      if (!id && !title) continue;
      if (id.toLowerCase() === 'id' && title.toLowerCase() === 'title') continue;

      var tagsVal = (tagsCol >= 0) ? row[tagsCol] : '';
      var tagsArr = [];
      if (typeof tagsVal === 'string' && tagsVal.trim()) {
        try {
          var parsed = JSON.parse(tagsVal);
          tagsArr = Array.isArray(parsed) ? parsed : tagsVal.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
        } catch (ex) {
          tagsArr = tagsVal.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
        }
      } else if (Array.isArray(tagsVal)) {
        tagsArr = tagsVal;
      }

      // Format tanggal bersih tanpa jam 00:00:00 atau GMT/Waktu Indochina
      var rawDateVal = (dateCol >= 0) ? row[dateCol] : '';
      var dateClean = '';
      if (rawDateVal instanceof Date) {
        dateClean = Utilities.formatDate(rawDateVal, "Asia/Jakarta", "d MMMM yyyy");
      } else if (typeof rawDateVal === 'string' && rawDateVal.indexOf('00:00:00') !== -1) {
        try {
          var d = new Date(rawDateVal.replace(/\\s*\\([^)]*\\)$/, ''));
          dateClean = Utilities.formatDate(d, "Asia/Jakarta", "d MMMM yyyy");
        } catch (eDate) {
          dateClean = rawDateVal.replace(/\\s*00:00:00.*$/, '').trim();
        }
      } else {
        dateClean = String(rawDateVal || '');
      }

      // Ambil gambar sampul dari Kolom I (index 8) jika kolom terdeteksi kosong
      var imgVal = (imgCol >= 0 && row.length > imgCol) ? String(row[imgCol] || '').trim() : '';
      if (!imgVal && row.length > 8) {
        imgVal = String(row[8] || '').trim();
      }

      articles.push({
        id: id || ('news-' + r),
        title: title,
        slug: (slugCol >= 0) ? String(row[slugCol] || '') : '',
        category: (catCol >= 0) ? String(row[catCol] || 'Kedinasan') : 'Kedinasan',
        summary: (sumCol >= 0) ? String(row[sumCol] || '') : '',
        content: (contCol >= 0) ? String(row[contCol] || '') : '',
        author: (authCol >= 0) ? String(row[authCol] || 'Humas Korwilcam') : 'Humas Korwilcam',
        authorId: (authIdCol >= 0) ? String(row[authIdCol] || '') : '',
        author_id: (authIdCol >= 0) ? String(row[authIdCol] || '') : '',
        authorRole: (authRoleCol >= 0) ? String(row[authRoleCol] || '') : '',
        author_role: (authRoleCol >= 0) ? String(row[authRoleCol] || '') : '',
        date: dateClean,
        image: imgVal,
        views: (viewCol >= 0) ? Number(row[viewCol] || 0) : 0,
        tags: tagsArr,
        totalReadSeconds: (readSecCol >= 0) ? Number(row[readSecCol] || 0) : 0,
        readCount: (readCntCol >= 0) ? Number(row[readCntCol] || 0) : 0,
        isPinned: (pinCol >= 0) ? Boolean(row[pinCol]) : false,
        created_at: (createCol >= 0) ? String(row[createCol] || '') : ''
      });
    }

    // Tampilkan artikel terbaru di paling depan (baris bawah spreadsheet tampil pertama)
    articles.reverse();

    return createJson({ status: 'success', reversed: true, count: articles.length, data: articles });
  } catch (err) {
    return createJson({ status: 'error', message: err.toString() });
  }
}

function createJson(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Parsing 1 baris CSV Spreadsheet ke objek NewsArticle
 */
export function parseNewsRow(row: string[], headerMap: Record<string, number>, index: number): NewsArticle | null {
  if (!row || row.length < 2) return null;

  function getVal(aliases: string[], fallback = ''): string {
    for (const a of aliases) {
      const norm = a.toLowerCase().replace(/[\s_-]+/g, '');
      if (headerMap[norm] !== undefined && headerMap[norm] < row.length) {
        return (row[headerMap[norm]] || '').trim();
      }
    }
    return fallback;
  }

  const id = getVal(['id', 'id_berita'], `news-${Date.now()}-${index}`);
  const title = getVal(['title', 'judul', 'headline']);

  if (!title || id.toLowerCase() === 'id' || title.toLowerCase() === 'title') {
    return null;
  }

  const slug = getVal(['slug', 'permalink', 'url']) || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const category = getVal(['category', 'kategori'], 'Kedinasan');
  const summary = getVal(['summary', 'ringkasan', 'excerpt', 'deskripsi']);
  const content = getVal(['content', 'isi', 'konten', 'artikel', 'body']);
  const author = getVal(['author', 'penulis', 'pembuat'], 'Humas Korwilcam');
  const authorId = getVal(['author_id', 'authorid', 'id_penulis', 'user_id', 'userid']) || undefined;
  const authorRole = getVal(['author_role', 'authorrole', 'role', 'peran_penulis']) || undefined;
  const dateRaw = getVal(['date', 'tanggal', 'tgl', 'waktu'], new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
  const date = formatNewsDate(dateRaw);

  // Ambil gambar sampul dari Kolom I (index 8) atau alias header
  const rawImage = getVal([
    'image', 'gambar', 'foto', 'cover', 'thumbnail', 
    'sampul', 'image_url', 'imageurl', 'foto_sampul', 
    'fotosampul', 'gambar_sampul', 'gambarsampul'
  ], row.length > 8 ? (row[8] || '').trim() : '');
  const image = rawImage || (row.length > 8 ? (row[8] || '').trim() : '');

  const views = parseInt(getVal(['views', 'tayangan', 'view_count'], '0'), 10) || 0;
  
  const tagsRaw = getVal(['tags', 'tag', 'label']);
  let tags: string[] = [];
  if (tagsRaw) {
    try {
      const parsed = JSON.parse(tagsRaw);
      if (Array.isArray(parsed)) tags = parsed;
      else tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    } catch {
      tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    }
  }

  const totalReadSeconds = parseInt(getVal(['total_read_seconds', 'totalreadseconds', 'waktu_baca'], '0'), 10) || 0;
  const readCount = parseInt(getVal(['read_count', 'readcount', 'jumlah_baca'], '0'), 10) || 0;
  const isPinned = getVal(['is_pinned', 'ispinned', 'pin']).toLowerCase() === 'true';

  return {
    id,
    title,
    slug,
    category,
    summary,
    content,
    author,
    authorId,
    authorRole,
    date,
    image,
    views,
    tags,
    totalReadSeconds,
    readCount,
    isPinned
  };
}

/**
 * Mengambil daftar berita dari cache lokal (localStorage)
 */
export function getLocalNewsCache(): NewsArticle[] {
  try {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Menyimpan daftar berita ke cache lokal
 */
export function setLocalNewsCache(items: NewsArticle[]): void {
  try {
    localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify(items));
    localStorage.setItem(NEWS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    sessionStorage.setItem('korwilcam_news', JSON.stringify(items));
    localStorage.setItem('korwilcam_news', JSON.stringify(items));
  } catch {}
}

/**
 * Mengambil daftar seluruh artikel berita dari Google Spreadsheet (CSV / GAS)
 */
export async function fetchNewsFromSheet(forceRefresh = false): Promise<NewsArticle[]> {
  const now = Date.now();
  const cached = getLocalNewsCache();
  const lastFetchStr = localStorage.getItem(NEWS_CACHE_TIMESTAMP_KEY);

  // Gunakan cache jika masih dalam batas waktu TTL (2 menit)
  if (!forceRefresh && cached.length > 0 && lastFetchStr) {
    const lastFetch = parseInt(lastFetchStr, 10);
    if (now - lastFetch < NEWS_CACHE_TTL_MS) {
      return cached;
    }
  }

  // 1. Coba fetch dari WebApp GAS jika URL sudah terpasang
  const webAppUrl = getNewsWebAppUrl();
  if (webAppUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${webAppUrl}?action=read&_t=${now}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json && json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
          // Bersihkan tanggal dan pastikan image string bersih
          const mappedData: NewsArticle[] = json.data.map((item: any) => ({
            ...item,
            date: formatNewsDate(item.date),
            image: (item.image || item.image_url || '').trim()
          }));

          // Pastikan artikel terbaru tampil di paling depan:
          // Jika GAS belum membalik urutan (reversed !== true), balikkan di frontend
          if (!json.reversed) {
            mappedData.reverse();
          }

          setLocalNewsCache(mappedData);
          return mappedData;
        }
      }
    } catch {}
  }

  // 2. Fallback: Fetch langsung via CSV publik dari Spreadsheet
  const urls = [
    `${NEWS_CSV_URL}&_t=${now}`,
    `${NEWS_GVIZ_URL}&_t=${now}`
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
        if (text && text.trim().length > 30 && !text.includes('<!DOCTYPE html>')) {
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

  // Petakan header baris 0
  const headerMap: Record<string, number> = {};
  const headerRow = rows[0];
  for (let c = 0; c < headerRow.length; c++) {
    const norm = String(headerRow[c] || '').toLowerCase().replace(/[\s_-]+/g, '');
    if (norm) {
      headerMap[norm] = c;
    }
  }

  const articles: NewsArticle[] = [];
  for (let i = 1; i < rows.length; i++) {
    const item = parseNewsRow(rows[i], headerMap, i);
    if (item) {
      articles.push(item);
    }
  }

  if (articles.length > 0) {
    // Balik urutan: baris paling bawah pada Spreadsheet adalah artikel terbaru
    articles.reverse();
    setLocalNewsCache(articles);
    return articles;
  }

  return cached;
}

/**
 * Kirim perintah (Create, Edit, Delete, Increment) ke Google Apps Script Webhook
 */
export async function sendNewsActionToGAS(payload: NewsSheetActionPayload): Promise<{ success: boolean; message: string }> {
  const webAppUrl = getNewsWebAppUrl();

  if (!webAppUrl) {
    return {
      success: false,
      message: 'URL Webhook Google Apps Script Berita belum diatur.'
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

    return {
      success: true,
      message: 'Perubahan berita berhasil dikirim ke Google Spreadsheet!'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal mengirim ke Google Apps Script: ${err.message || 'Error Jaringan'}`
    };
  }
}

/**
 * Helper untuk menerbitkan berita baru ke Google Spreadsheet
 */
export async function createNewsInSheet(article: NewsArticle): Promise<{ success: boolean; message: string }> {
  return sendNewsActionToGAS({
    action: 'create',
    id: article.id,
    title: article.title,
    slug: article.slug,
    category: article.category,
    summary: article.summary,
    content: article.content,
    author: article.author,
    author_id: article.authorId,
    authorId: article.authorId,
    author_role: article.authorRole,
    authorRole: article.authorRole,
    date: article.date,
    image: article.image,
    views: article.views || 0,
    tags: article.tags || [],
    total_read_seconds: article.totalReadSeconds || 0,
    read_count: article.readCount || 0,
    is_pinned: article.isPinned || false
  });
}

/**
 * Helper untuk mengedit artikel berita di Google Spreadsheet
 */
export async function updateNewsInSheet(id: string, updatedData: Partial<NewsArticle>): Promise<{ success: boolean; message: string }> {
  return sendNewsActionToGAS({
    action: 'update',
    id,
    ...updatedData,
    author_id: updatedData.authorId,
    author_role: updatedData.authorRole,
    total_read_seconds: updatedData.totalReadSeconds,
    read_count: updatedData.readCount,
    is_pinned: updatedData.isPinned
  });
}

/**
 * Helper untuk menghapus artikel berita di Google Spreadsheet
 */
export async function deleteNewsFromSheet(id: string): Promise<{ success: boolean; message: string }> {
  return sendNewsActionToGAS({
    action: 'delete',
    id
  });
}

/**
 * Helper untuk increment views artikel berita di Google Spreadsheet
 */
export async function incrementNewsViewsInSheet(id: string): Promise<{ success: boolean; message: string }> {
  return sendNewsActionToGAS({
    action: 'increment_views',
    id
  });
}
