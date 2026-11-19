import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function decodeBase36Id(code: string): string[] {
  const safeCode = code.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!safeCode) return [];
  const list = [safeCode];
  try {
    const num = parseInt(safeCode, 36);
    if (!isNaN(num) && num > 1000000000) {
      list.push(`news-${num}`);
      list.push(String(num));
    }
  } catch {}
  if (!safeCode.startsWith('news-')) {
    list.push(`news-${safeCode}`);
    list.push(`news-${safeCode.padStart(2, '0')}`);
  } else {
    list.push(safeCode.replace(/^news-/, ''));
  }
  return Array.from(new Set(list));
}

function decodeAnnouncementKeys(param: string): string[] {
  const clean = param
    .replace(/^pengumuman\//, '')
    .replace(/^\/pengumuman\//, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .trim();
  if (!clean) return [];
  const list = [clean];
  if (!clean.startsWith('ann-')) {
    list.push(`ann-${clean}`);
    list.push(`ann-${clean.padStart(2, '0')}`);
  } else {
    list.push(clean.replace(/^ann-/, ''));
  }
  return Array.from(new Set(list));
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuote = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !insideQuote) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.some(val => val.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some(val => val.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface SheetNewsArticle {
  id: string;
  title: string;
  slug: string;
  category?: string;
  summary?: string;
  content?: string;
  author?: string;
  date?: string;
  image?: string;
}

const NEWS_SPREADSHEET_ID = '1GwZdBH5Mzd1Ztzf__R7gBROv8oqH-_ks7tISe3FMy1o';
const NEWS_SHEET_GID = '0';

let cachedNewsArticles: SheetNewsArticle[] = [];
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 60 * 1000; // 60 detik cache dalam memori serverless

async function fetchNewsFromSpreadsheet(): Promise<SheetNewsArticle[]> {
  const now = Date.now();
  if (cachedNewsArticles.length > 0 && (now - newsCacheTimestamp < NEWS_CACHE_DURATION)) {
    return cachedNewsArticles;
  }

  const urls = [
    `https://docs.google.com/spreadsheets/d/${NEWS_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${NEWS_SHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${NEWS_SPREADSHEET_ID}/export?format=csv&gid=${NEWS_SHEET_GID}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'text/csv, text/plain; q=0.9, */*; q=0.8' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const csv = await res.text();
      if (!csv || csv.includes('<!DOCTYPE html>') || csv.length < 50) continue;

      const rows = parseCSV(csv);
      if (!rows || rows.length <= 1) continue;

      const headerRow = rows[0];
      const headerMap: Record<string, number> = {};
      for (let i = 0; i < headerRow.length; i++) {
        const key = String(headerRow[i] || '').toLowerCase().replace(/[\s_-]+/g, '');
        if (key) headerMap[key] = i;
      }

      const findIdx = (aliases: string[], fallback: number) => {
        for (const a of aliases) {
          const norm = a.toLowerCase().replace(/[\s_-]+/g, '');
          if (headerMap.hasOwnProperty(norm)) return headerMap[norm];
        }
        return fallback;
      };

      const idIdx = findIdx(['id', 'id_berita'], 0);
      const titleIdx = findIdx(['title', 'judul'], 1);
      const slugIdx = findIdx(['slug', 'url'], 2);
      const catIdx = findIdx(['category', 'kategori'], 3);
      const sumIdx = findIdx(['summary', 'ringkasan'], 4);
      const contIdx = findIdx(['content', 'isi', 'konten'], 5);
      const authIdx = findIdx(['author', 'penulis'], 6);
      const dateIdx = findIdx(['date', 'tanggal'], 9);
      const imgIdx = findIdx(['image', 'gambar', 'foto', 'cover', 'thumbnail', 'sampul', 'image_url'], 10);

      const articles: SheetNewsArticle[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const id = (row[idIdx] || '').trim();
        const title = (row[titleIdx] || '').trim();
        if (!id && !title) continue;
        if (id.toLowerCase() === 'id' && title.toLowerCase() === 'title') continue;

        let rawImg = (row[imgIdx] || '').trim();
        if (!rawImg && row.length > 8) {
          rawImg = (row[8] || '').trim();
        }

        const fallbackSlug = title
          ? title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-+|-+$/g, '')
          : `news-${r}`;

        articles.push({
          id: id || `news-${r}`,
          title: title,
          slug: (row[slugIdx] || '').trim() || fallbackSlug,
          category: (row[catIdx] || '').trim(),
          summary: (row[sumIdx] || '').trim(),
          content: (row[contIdx] || '').trim(),
          author: (row[authIdx] || '').trim(),
          date: (row[dateIdx] || '').trim(),
          image: rawImg
        });
      }

      if (articles.length > 0) {
        cachedNewsArticles = articles;
        newsCacheTimestamp = now;
        return articles;
      }
    } catch (e) {
      // lanjut ke url berikutnya jika timeout / error
    }
  }

  return cachedNewsArticles;
}

interface SheetGalleryAlbum {
  id: string;
  title: string;
  category?: string;
  image?: string;
  description?: string;
  date?: string;
  createdAt?: string;
  images?: string[];
  driveFolderUrl?: string;
}

const GALLERY_SPREADSHEET_ID = '1FuIEC3zukJKASRAMl6PPUlrv46w4qKa1j9M2AnBR5-A';
const GALLERY_SHEET_GID = '0';
const PUBLIC_GALLERY_SPREADSHEET_ID = '11cTU4NQt3aq9SpCc9hWbdvIOSg4gYRqGKR22WyI1n9g';
const PUBLIC_GALLERY_SHEET_GID = '0';

let cachedGalleryAlbums: SheetGalleryAlbum[] = [];
let galleryCacheTimestamp = 0;
const GALLERY_CACHE_DURATION = 60 * 1000; // 60 detik cache di memory serverless

async function fetchGalleriesFromSpreadsheet(): Promise<SheetGalleryAlbum[]> {
  const now = Date.now();
  if (cachedGalleryAlbums.length > 0 && (now - galleryCacheTimestamp < GALLERY_CACHE_DURATION)) {
    return cachedGalleryAlbums;
  }

  const allAlbums: SheetGalleryAlbum[] = [];

  // 1. Fetch Galeri Internal / CMS
  const urls = [
    `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${GALLERY_SHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/export?format=csv&gid=${GALLERY_SHEET_GID}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'text/csv, text/plain; q=0.9, */*; q=0.8' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const csv = await res.text();
      if (!csv || csv.includes('<!DOCTYPE html>') || csv.length < 50) continue;

      const rows = parseCSV(csv);
      if (!rows || rows.length <= 1) continue;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const id = (row[0] || '').trim();
        const title = (row[1] || '').trim();
        if (!id || !title || id.toLowerCase() === 'id') continue;

        const category = (row[2] || 'Kegiatan').trim();
        const coverImage = (row[3] || '').trim();
        const rawDesc = (row[4] || '').trim();
        const date = (row[5] || '').trim();
        const createdAt = (row[6] || '').trim();
        const imagesRaw = (row[7] || '').trim();
        const driveFolderUrl = (row[8] || '').trim();

        let imagesList: string[] = [];
        if (imagesRaw) {
          if (imagesRaw.startsWith('[') && imagesRaw.endsWith(']')) {
            try {
              const parsed = JSON.parse(imagesRaw);
              if (Array.isArray(parsed)) {
                imagesList = parsed.filter(i => typeof i === 'string' && i.trim().length > 0 && i !== '#');
              }
            } catch {
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

        let cleanDescription = rawDesc;
        const driveMetaMatch = rawDesc.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
        if (driveMetaMatch && driveMetaMatch[1]) {
          try {
            cleanDescription = rawDesc.replace(/<!--DRIVE_META:[\s\S]*?:DRIVE_META-->/g, '').trim();
            const parsedMeta = JSON.parse(driveMetaMatch[1]);
            if (parsedMeta && Array.isArray(parsedMeta.images) && parsedMeta.images.length > 0 && imagesList.length === 0) {
              imagesList = parsedMeta.images;
            }
          } catch {}
        }

        const validCover = (coverImage && !coverImage.includes('unsplash.com')) ? coverImage : (imagesList[0] || '');

        allAlbums.push({
          id,
          title,
          category,
          image: validCover,
          description: cleanDescription,
          date,
          createdAt,
          images: imagesList,
          driveFolderUrl
        });
      }

      if (allAlbums.length > 0) break;
    } catch (e) {
      // lanjut ke url berikutnya jika timeout / error
    }
  }

  // 2. Fetch Galeri Publik (Upload untuk Publik)
  const pubUrls = [
    `https://docs.google.com/spreadsheets/d/${PUBLIC_GALLERY_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${PUBLIC_GALLERY_SHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${PUBLIC_GALLERY_SPREADSHEET_ID}/export?format=csv&gid=${PUBLIC_GALLERY_SHEET_GID}`
  ];

  for (const url of pubUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'text/csv, text/plain; q=0.9, */*; q=0.8' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const csv = await res.text();
      if (!csv || csv.includes('<!DOCTYPE html>') || csv.length < 50) continue;

      const rows = parseCSV(csv);
      if (!rows || rows.length <= 1) continue;

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length < 2) continue;

        const timestamp = (row[0] || '').trim();
        const title = (row[1] || '').trim();
        if (!title || title.toUpperCase() === 'JUDUL' || title === '-') continue;

        const driveFolderUrl = (row[2] || '').trim();
        const eventDate = (row[3] || '').trim();
        const category = (row[4] || 'Kegiatan').trim();
        const description = (row[5] || '').trim();
        const schoolName = (row[6] || '').trim();
        const rawStatus = (row[7] || '').trim().toLowerCase();
        const coverImage = (row[8] || '').trim();
        const rawImages = (row[9] || '').trim();

        // Hanya sertakan yang statusnya Disetujui (atau tanpa status)
        if (rawStatus && rawStatus !== 'disetujui' && rawStatus !== 'approved' && rawStatus !== 'aktif' && rawStatus !== 'setuju') {
          continue;
        }

        let imagesList: string[] = [];
        if (rawImages) {
          try {
            const parsed = JSON.parse(rawImages);
            if (Array.isArray(parsed)) {
              imagesList = parsed.filter(u => typeof u === 'string' && u.startsWith('http'));
            }
          } catch {
            imagesList = rawImages.split(',').map(u => u.trim()).filter(u => u.startsWith('http'));
          }
        }

        let validCover = coverImage && coverImage.startsWith('http') ? coverImage : (imagesList[0] || '');
        if (validCover && !imagesList.includes(validCover)) {
          imagesList = [validCover, ...imagesList];
        }

        allAlbums.push({
          id: `public-gal-${r}-${timestamp.replace(/[^0-9]/g, '')}`,
          title,
          category,
          image: validCover,
          description: description || `Dokumentasi foto kegiatan ${title} dari ${schoolName || 'Kontributor Publik'}.`,
          date: eventDate || timestamp,
          createdAt: timestamp,
          images: imagesList,
          driveFolderUrl
        });
      }

      break;
    } catch (e) {}
  }

  if (allAlbums.length > 0) {
    cachedGalleryAlbums = allAlbums;
    galleryCacheTimestamp = now;
  }

  return cachedGalleryAlbums;
}

interface SheetAchievement {
  id: string;
  slug: string;
  title: string;
  recipientName: string;
  schoolName: string;
  rank: string;
  level: string;
  year: number | string;
  mentorName?: string;
  eventDate?: string;
  photoUrl?: string;
  description?: string;
}

const PRESTASI_SPREADSHEET_ID = '1-p4oGqZW4G1QEU0F3DDVcn7mO9mx03iltdNp_KumA9Q';
const PRESTASI_SHEET_GID = '723592882';

let cachedPrestasiItems: SheetAchievement[] = [];
let prestasiCacheTimestamp = 0;
const PRESTASI_CACHE_DURATION = 60 * 1000;

async function fetchAchievementsFromSpreadsheet(): Promise<SheetAchievement[]> {
  const now = Date.now();
  if (cachedPrestasiItems.length > 0 && now - prestasiCacheTimestamp < PRESTASI_CACHE_DURATION) {
    return cachedPrestasiItems;
  }

  const urls = [
    `https://docs.google.com/spreadsheets/d/${PRESTASI_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${PRESTASI_SHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${PRESTASI_SPREADSHEET_ID}/export?format=csv&gid=${PRESTASI_SHEET_GID}`
  ];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;
      const csv = await res.text();
      if (!csv || csv.includes('<!DOCTYPE html>') || csv.length < 50) continue;

      const rows = parseCSV(csv);
      if (!rows || rows.length <= 1) continue;

      let headerRowIdx = rows.findIndex((row) =>
        row.some((col) => col && (
          col.trim().toUpperCase().includes('NAMA') || 
          col.trim().toUpperCase().includes('LOMBA') ||
          col.trim().toUpperCase().includes('TIMESTAMP')
        ))
      );
      if (headerRowIdx === -1) headerRowIdx = 0;

      const items: SheetAchievement[] = [];
      for (let r = headerRowIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        if (!row || row.length === 0) continue;

        const title = (row[1] || '').trim();
        const level = (row[2] || '').trim();
        const rank = (row[3] || '').trim();
        const year = (row[4] || '').trim();
        const recipientName = (row[5] || '').trim();
        const schoolName = (row[6] || '').trim();
        const mentorName = (row[7] || '').trim();
        const eventDate = (row[8] || '').trim();
        const photoUrl = (row[9] || '').trim();
        const description = (row[10] || '').trim();

        if (!recipientName || !title) continue;
        if (title.toLowerCase() === 'tes' && recipientName.toLowerCase() === 'tes') continue;
        if (recipientName.toLowerCase().includes('nama lengkap')) continue;

        const slugParts = [recipientName, title].filter(Boolean).join(' ');
        const slug = slugParts
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');

        items.push({
          id: `prestasi-sheet-${r}`,
          slug,
          title,
          recipientName,
          schoolName,
          rank,
          level,
          year: parseInt(year, 10) || 2026,
          mentorName,
          eventDate,
          photoUrl,
          description
        });
      }

      if (items.length > 0) {
        cachedPrestasiItems = items;
        prestasiCacheTimestamp = now;
        return items;
      }
    } catch (e) {}
  }

  return cachedPrestasiItems;
}

interface KaryakuBook {
  id: string;
  title: string;
  author: string;
  category?: string;
  year?: number;
  cover?: string;
  description?: string;
  driveFileId?: string;
  cleanFileId?: string;
  totalPages?: number;
  rating?: number;
  readCount?: number;
  uploadedBy?: string;
}

const DEFAULT_KARYAKU_BOOKS: KaryakuBook[] = [
  {
    id: "BK-002",
    title: "Introvert Yang Berubah",
    author: "Edwin Tito Nur Kuncoro, S.Pd",
    category: "Novel & Cerpen",
    year: 2026,
    cover: "https://drive.google.com/file/d/1DsrSanEmkme4-DQtMR6lXLDd1cgZQZL2/view?usp=drive_link",
    description: "Cerita fiksi tentang orang introvert yang berubah menjadi Extrovert",
    uploadedBy: "edwintitonk"
  },
  {
    id: "BK-003",
    title: "Gadget Tepat, Anak Seht",
    author: "Narto, S.Pd.,M.Pd",
    category: "Pendidikan & Parenting",
    year: 2026,
    cover: "https://drive.google.com/file/d/1ONReXVpMNPwKCk7xptB2BR9ho6t-B6ad/view?usp=drive_link",
    description: "Panduan untuk orang tua dalam membimbing anak menggunakan gadget secara bijak",
    uploadedBy: "narto1967"
  },
  {
    id: "BK-004",
    title: "Asal Usul Bleduk Kuwu",
    author: "Narto, S.Pd.,M.Pd",
    category: "Cerita Rakyat",
    year: 2026,
    cover: "https://drive.google.com/file/d/1tmq2BLwdTFIWF9-8TfGHGH0ZHLZka2HY/view?usp=drive_link",
    description: "Cerita rakyat asal usul Bleduk Kuwu Kabupaten Grobogan",
    uploadedBy: "narto1967"
  }
];

let cachedKaryakuBooks: KaryakuBook[] = [...DEFAULT_KARYAKU_BOOKS];
let karyakuCacheTimestamp = 0;
const KARYAKU_CACHE_DURATION = 60 * 1000;
const KARYAKU_GAS_URL = 'https://script.google.com/macros/s/AKfycbyuxqcidVzOP_Om8gMr2LvHOhm7czDOPYgEOV-Xv0JIYpcsB0nrVYHFKf5VWlSMvkyk3w/exec';

function extractKaryakuBooksFromHtml(html: string): KaryakuBook[] {
  if (!html) return [];

  const directMatch = html.match(/<script id=["']initial-books-data["'][^>]*>([\s\S]*?)<\/script>/i);
  if (directMatch && directMatch[1].trim()) {
    try {
      const parsed = JSON.parse(directMatch[1].trim());
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }

  const token = 'initial-books-data';
  const idx = html.indexOf(token);
  if (idx === -1) return [];

  const hexStart = html.indexOf('\\x5b', idx);
  if (hexStart === -1) return [];

  const hexEndScript = html.indexOf('\\x3c\\\/script\\x3e', hexStart);
  const raw = html.slice(hexStart, hexEndScript !== -1 ? hexEndScript : hexStart + 100000);

  let str = raw
    .replace(/\\x([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\u([0-9A-Fa-f]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

  str = str.replace(/\\\\"/g, '"').replace(/\\"/g, '"').replace(/\\\//g, '/');

  let depth = 0;
  let inString = false;
  let escape = false;
  let jsonEnd = -1;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === '\\') {
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (c === '[') depth++;
      else if (c === ']') {
        depth--;
        if (depth === 0) {
          jsonEnd = i;
          break;
        }
      }
    }
  }

  if (jsonEnd !== -1) {
    try {
      const parsed = JSON.parse(str.slice(0, jsonEnd + 1));
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }

  return [];
}

async function fetchKaryakuBooks(): Promise<KaryakuBook[]> {
  const now = Date.now();
  if (cachedKaryakuBooks.length > 0 && (now - karyakuCacheTimestamp < KARYAKU_CACHE_DURATION)) {
    return cachedKaryakuBooks;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(KARYAKU_GAS_URL, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const html = await res.text();
      const books = extractKaryakuBooksFromHtml(html);
      if (books && books.length > 0) {
        cachedKaryakuBooks = books;
        karyakuCacheTimestamp = now;
        return books;
      }
    }
  } catch (err) {
    console.error('Error fetching Karyaku books:', err);
  }

  return cachedKaryakuBooks;
}

const ipRequests = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(req: any, max = 60, windowMs = 60000): boolean {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').toString().split(',')[0].trim();
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

export default async function handler(req: any, res: any) {
  try {
    if (!checkRateLimit(req, 120, 60000)) {
      res.statusCode = 429;
      res.setHeader('Retry-After', '60');
      return res.end('Too Many Requests');
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'korwilcampurwodadi.web.id';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;
    const currentUrl = `${origin}${req.url || ''}`;

    // Read ID or Slug from query params
    const query = req.query || {};
    const inputParam = (query.id || query.slug || '').toString().trim();
    // Whitelist safe slug / path characters only
    const rawParam = inputParam.replace(/[^a-zA-Z0-9_\/-]/g, '');

    if (!rawParam) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }

    const isExplicitAnnouncement = 
      query.type === 'announcement' ||
      rawParam.startsWith('pengumuman/') ||
      rawParam.startsWith('ann-') ||
      rawParam.includes('pengumuman');

    const isExplicitVideo = 
      query.type === 'video' ||
      rawParam.startsWith('galeri/video/') ||
      rawParam.startsWith('video/') ||
      rawParam.includes('/video/');

    const isExplicitGallery = 
      query.type === 'gallery' ||
      (!isExplicitVideo && (
        rawParam.startsWith('galeri/') ||
        rawParam.startsWith('gallery/') ||
        rawParam.startsWith('g/') ||
        rawParam.startsWith('gal-') ||
        rawParam.includes('/galeri/')
      ));

    const isExplicitAchievement =
      query.type === 'achievement' ||
      rawParam.startsWith('prestasi/') ||
      rawParam.startsWith('berita/prestasi/') ||
      rawParam.includes('/prestasi/') ||
      rawParam.startsWith('pres-') ||
      rawParam.startsWith('prestasi-');

    const isExplicitKaryaku =
      query.type === 'karyaku' ||
      rawParam.startsWith('karyaku/') ||
      rawParam === 'karyaku';

    // IF VIDEO REQUEST -> Kembalikan Open Graph khusus video kegiatan lengkap dengan thumbnail YouTube
    if (isExplicitVideo) {
      const cleanSlug = rawParam
        .replace(/^galeri\/video\//, '')
        .replace(/^video\//, '')
        .replace(/^\//, '')
        .toLowerCase()
        .trim();

      let videoTitle = '';
      let videoDesc = '';
      let youtubeId = (query.v || '').toString().trim();
      let driveFileId = (query.drive || '').toString().trim();
      let videoSchool = '';

      // 1. Data fallback video
      const fallbackVideos = [
        {
          title: 'Upacara Peringatan Hari Pahlawan 10 November 2026 di Korwilcam Purwodadi',
          slug: 'upacara-peringatan-hari-pahlawan-10-november-2026-korwilcam-purwodadi',
          youtubeId: 'dQw4w9WgXcQ',
          schoolName: 'Korwilcam Purwodadi',
          description: 'Dokumentasi video lengkap upacara peringatan Hari Pahlawan 10 November 2026 bersama jajaran Korwilcam, Kepala SD, dan perwakilan siswa se-Kecamatan Purwodadi.'
        },
        {
          title: 'Ranting Korwil & TK Dalam Kegiatan Turnamen Voli HUT PGRI Cabang Purwodadi',
          slug: 'turnamen-voli-hut-pgri-cabang-purwodadi-2026-pgri-cabang-purwodadi',
          youtubeId: 'dQw4w9WgXcQ',
          schoolName: 'PGRI Cabang Purwodadi',
          description: 'Keseruan dan sportivitas guru-guru Korwilcam Purwodadi dalam turnamen bola voli memperingati HUT PGRI dan Hari Guru Nasional tingkat Kecamatan Purwodadi.'
        },
        {
          title: 'Semarak Lomba MAPSI SD Tingkat Kecamatan Purwodadi Cabang Seni Tilawatil Quran',
          slug: 'semarak-lomba-mapsi-sd-purwodadi-seni-tilawatil-quran-sd-negeri-5-ngraji',
          youtubeId: 'dQw4w9WgXcQ',
          schoolName: 'SD Negeri 5 Ngraji',
          description: 'Penampilan memukau para qori-qoriah cilik perwakilan sekolah dasar se-Kecamatan Purwodadi dalam ajang bergengsi MAPSI SD cabang Tilawatil Quran.'
        }
      ];

      const matchFallback = fallbackVideos.find(v => 
        v.slug === cleanSlug || cleanSlug.includes(v.slug) || v.slug.includes(cleanSlug)
      );
      if (matchFallback) {
        videoTitle = matchFallback.title;
        videoDesc = matchFallback.description;
        videoSchool = matchFallback.schoolName;
        if (!youtubeId && !driveFileId) youtubeId = matchFallback.youtubeId;
      }

      // 2. Coba fetch Google Spreadsheet untuk data mutakhir
      try {
        const sheetRes = await fetch(
          'https://docs.google.com/spreadsheets/d/1uN-DBqXn-TkqR9iiqZLGZNBMEx91K4kbD3nmz_tu-pY/export?format=csv&gid=1627850125',
          { signal: AbortSignal.timeout(2500) }
        );
        if (sheetRes.ok) {
          const csv = await sheetRes.text();
          if (csv && !csv.includes('<!DOCTYPE html>')) {
            const rows = parseCSV(csv);
            for (const r of rows) {
              const rTitle = (r[1] || '').trim();
              const rUrl = (r[2] || '').trim();
              const rDesc = (r[5] || '').trim();
              const rSchool = (r[6] || '').trim();
              if (!rTitle || rTitle.toUpperCase() === 'JUDUL' || rTitle.toUpperCase() === 'JUDUL VIDIO' || rTitle.toUpperCase() === 'JUDUL VIDEO') continue;

              const rSlug = (rSchool ? `${rTitle} ${rSchool}` : rTitle)
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/--+/g, '-')
                .replace(/^-+|-+$/g, '');

              if (rSlug === cleanSlug || cleanSlug.includes(rSlug) || rSlug.includes(cleanSlug)) {
                videoTitle = rTitle;
                videoDesc = rDesc || `Dokumentasi video kegiatan ${rTitle} di lingkungan Korwilcam Purwodadi.`;
                videoSchool = rSchool;
                const m = rUrl.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/i);
                if (m && m[1]) {
                  youtubeId = m[1];
                  driveFileId = '';
                } else {
                  const mDrive = rUrl.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/i) || rUrl.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
                  if (mDrive && mDrive[1]) {
                    driveFileId = mDrive[1];
                    youtubeId = '';
                  }
                }
                break;
              }
            }
          }
        }
      } catch (e) {
        // Abaikan jika timeout, fallback ke judul turunan slug
      }

      if (!videoTitle) {
        videoTitle = cleanSlug
          .split('-')
          .filter(Boolean)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
      }

      if (!videoDesc) {
        videoDesc = `Tonton video dokumentasi kegiatan resmi ${videoTitle} di Portal Resmi Korwilcam Purwodadi.`;
      }

      let ogImageUrl = `${origin}/logo.png`;
      if (driveFileId) {
        ogImageUrl = `https://lh3.googleusercontent.com/d/${driveFileId}=s640`;
      } else if (youtubeId) {
        ogImageUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      }

      const redirectUrl = `${origin}/galeri/video/${encodeURIComponent(cleanSlug)}`;

      const html = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(videoTitle)} - Video Korwilcam Purwodadi</title>
  <meta name="description" content="${escapeHtml(videoDesc)}">

  <!-- Open Graph / Facebook / WhatsApp (Spesial Thumbnail Video YouTube) -->
  <meta property="og:type" content="video.other">
  <meta property="og:site_name" content="Portal Resmi Korwilcam Purwodadi">
  <meta property="og:title" content="${escapeHtml(videoTitle)}">
  <meta property="og:description" content="${escapeHtml(videoDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="480">
  <meta property="og:image:height" content="360">
  <meta property="og:image:alt" content="${escapeHtml(videoTitle)}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <link rel="image_src" href="${escapeHtml(ogImageUrl)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(videoTitle)}">
  <meta name="twitter:description" content="${escapeHtml(videoDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Instant Redirect for Humans -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
  <div style="max-width: 500px; text-align: center; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
    <h2 style="font-size: 18px; margin-bottom: 12px; color: #0f172a;">${escapeHtml(videoTitle)}</h2>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Sedang mengalihkan ke video kegiatan resmi...</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background: #dc2626; color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">Tonton Sekarang</a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.statusCode = 200;
      return res.end(html);
    }


    // IF GALLERY REQUEST -> Kembalikan Open Graph khusus album foto kegiatan dengan gambar sampul terkompresi < 300KB
    if (isExplicitGallery) {
      const cleanSlug = rawParam
        .replace(/^galeri\//, '')
        .replace(/^gallery\//, '')
        .replace(/^g\//, '')
        .replace(/^\//, '')
        .toLowerCase()
        .trim();

      const normalizeSlug = (str: string) =>
        (str || '')
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');

      let galleryItem: any = null;

      // 1. Fetch dari Google Spreadsheet Galeri (Database Aktif Utama & Galeri Publik)
      try {
        const sheetGalleries = await fetchGalleriesFromSpreadsheet();
        if (sheetGalleries && sheetGalleries.length > 0) {
          // A. Exact match by id or slug
          galleryItem = sheetGalleries.find((g) => {
            if (!g) return false;
            const normTitle = normalizeSlug(g.title);
            if (normTitle && normTitle === cleanSlug) return true;
            if (g.id && (g.id.toLowerCase() === cleanSlug || g.id.toLowerCase() === `gal-${cleanSlug}` || g.id.toLowerCase() === `public-gal-${cleanSlug}`)) return true;
            return false;
          });

          // B. Substring match (Hanya jika awal atau akhir sama persis)
          if (!galleryItem) {
            galleryItem = sheetGalleries.find((g) => {
              if (!g || !g.title) return false;
              const normTitle = normalizeSlug(g.title);
              if (normTitle.length < 5 || cleanSlug.length < 5) return false;
              return cleanSlug === normTitle || cleanSlug.startsWith(normTitle) || normTitle.startsWith(cleanSlug);
            });
          }

          // C. Word token match (Perbandingan rasio kata akurat agar tidak tertukar album)
          if (!galleryItem) {
            const slugWords = cleanSlug.split('-').filter(w => w.length > 2);
            if (slugWords.length >= 2) {
              let bestItem: any = null;
              let bestScore = 0;
              for (const g of sheetGalleries) {
                if (!g || !g.title) continue;
                const normTitle = normalizeSlug(g.title);
                const titleWords = normTitle.split('-').filter(w => w.length > 2);
                const matchCount = slugWords.filter(w => titleWords.includes(w)).length;
                const score = matchCount / Math.max(slugWords.length, titleWords.length);
                if (matchCount >= 2 && score >= 0.7 && score > bestScore) {
                  bestScore = score;
                  bestItem = g;
                }
              }
              galleryItem = bestItem;
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching gallery from spreadsheet in api/share:', err);
      }

      // 2. Fallback to Supabase 'gallery' table
      if (!galleryItem) {
        try {
          let dbGalleries: any[] | null = null;

          const { data: directItem } = await supabase
            .from('gallery')
            .select('*')
            .or(`id.eq.${cleanSlug},id.eq.gal-${cleanSlug}`)
            .limit(1)
            .maybeSingle();

          if (directItem) {
            galleryItem = directItem;
          } else {
            const { data: allGal } = await supabase
              .from('gallery')
              .select('*')
              .limit(200);

            if (allGal && allGal.length > 0) {
              dbGalleries = allGal;
            }
          }

          if (!galleryItem && dbGalleries && dbGalleries.length > 0) {
            galleryItem = dbGalleries.find((g: any) => {
              if (!g) return false;
              if (g.id === cleanSlug || g.id === `gal-${cleanSlug}`) return true;
              if (g.slug && normalizeSlug(g.slug) === cleanSlug) return true;
              if (g.title) {
                const s = normalizeSlug(g.title);
                if (s === cleanSlug) return true;
              }
              return false;
            });

            if (!galleryItem) {
              const slugWords = cleanSlug.split('-').filter(w => w.length > 2);
              if (slugWords.length >= 2) {
                let bestItem: any = null;
                let bestScore = 0;
                for (const g of dbGalleries) {
                  if (!g || !g.title) continue;
                  const s = normalizeSlug(g.title);
                  const titleWords = s.split('-').filter(w => w.length > 2);
                  const matchCount = slugWords.filter(w => titleWords.includes(w)).length;
                  const score = matchCount / Math.max(slugWords.length, titleWords.length);
                  if (matchCount >= 2 && score >= 0.7 && score > bestScore) {
                    bestScore = score;
                    bestItem = g;
                  }
                }
                galleryItem = bestItem;
              }
            }
          }
        } catch (err) {
          console.warn('Error fetching gallery for og:image from Supabase:', err);
        }
      }

      // 3. Fallback static initial gallery if not in db or sheet
      if (!galleryItem) {
        const fallbackGalleries = [
          {
            id: "gal-1791163139973",
            title: "Apel Pagi 5 Oktober 2026",
            category: "Apel Pagi",
            date: "5 Oktober 2026",
            image: "https://lh3.googleusercontent.com/d/1_ysw9n4ehJVgpkq8unzfmrJdRijOqscq",
            description: "Dokumentasi kegiatan Apel Pagi seluruh pegawai Korwilcam Purwodadi tanggal 5 Oktober 2026."
          },
          {
            id: "gal-1789350781225",
            title: "14 Agustus 2026. Apel Pagi Pegawai Korwilcam Purwodadi",
            category: "Upacara",
            date: "14 September 2026",
            image: "/gallery/apel-14-agustus-2026-1.jpg",
            description: "Dokumentasi pelaksanaan Apel Pagi pegawai Korwilcam Purwodadi tanggal 14 Agustus 2026."
          },
          {
            id: "gal-1788839526109",
            title: "7 Agustus 2026. Apel Pagi Pegawai Korwilcam Purwodadi",
            category: "Upacara",
            date: "8 September 2026",
            image: "/gallery/apel-7-agustus-2026-1.jpg",
            description: "Dokumentasi pelaksanaan Apel Pagi pegawai Korwilcam Purwodadi tanggal 7 Agustus 2026."
          }
        ];
        galleryItem = fallbackGalleries.find((g) => {
          const s = normalizeSlug(g.title);
          return s === cleanSlug || g.id === cleanSlug;
        });
      }

      // 4. Determine title & description
      const galleryTitle = galleryItem?.title || cleanSlug
        .split('-')
        .filter(Boolean)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      let cleanDesc = '';
      if (galleryItem?.description) {
        const driveMetaMatch = galleryItem.description.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
        if (driveMetaMatch && driveMetaMatch[1]) {
          try {
            cleanDesc = galleryItem.description.replace(/<!--DRIVE_META:[\s\S]*?:DRIVE_META-->/g, '').trim();
          } catch {}
        }
        if (!cleanDesc) {
          try {
            const parsed = JSON.parse(galleryItem.description);
            cleanDesc = parsed.cleanDescription || parsed.description || galleryItem.description;
          } catch {
            cleanDesc = galleryItem.description;
          }
        }
      }
      const galleryDesc = cleanDesc || `Dokumentasi foto kegiatan ${galleryTitle} di lingkungan Korwilcam Purwodadi.`;

      // 5. Determine Cover Image & Apply Compression
      let rawCover = (query.img || query.cover || query.image || '').toString().trim();

      if (!rawCover && galleryItem) {
        let parsedImages: string[] = [];
        if (Array.isArray(galleryItem.images)) {
          parsedImages = galleryItem.images;
        } else if (typeof galleryItem.images === 'string' && galleryItem.images.trim().startsWith('[')) {
          try {
            const arr = JSON.parse(galleryItem.images);
            if (Array.isArray(arr)) parsedImages = arr;
          } catch {}
        }

        if (galleryItem.description) {
          const driveMetaMatch = galleryItem.description.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
          if (driveMetaMatch && driveMetaMatch[1]) {
            try {
              const parsed = JSON.parse(driveMetaMatch[1]);
              if (parsed && Array.isArray(parsed.images) && parsed.images.length > 0) {
                if (parsedImages.length === 0) parsedImages = parsed.images;
              }
            } catch {}
          }
        }

        const filterValid = (img: any) =>
          typeof img === 'string' &&
          img.trim().length > 0 &&
          img !== '#' &&
          !img.includes('unsplash.com') &&
          !img.includes('/drive/folders');

        if (filterValid(galleryItem.image)) {
          rawCover = String(galleryItem.image).trim();
        } else if (parsedImages.some(filterValid)) {
          rawCover = String(parsedImages.find(filterValid)).trim();
        }
      }

      let ogImageUrl = `${origin}/logo.png`;
      let ogWidth = 640;
      let ogHeight = 420;

      if (rawCover) {
        // A. Google Drive Image: Kompresi instan via Google CDN =s640 (ukuran ~80-140KB, di bawah batas 300KB WhatsApp)
        const matchLh3 = rawCover.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
        const matchFileD = rawCover.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/);
        const matchIdParam = rawCover.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
        const cleanDriveId = (matchLh3 && matchLh3[1]) || (matchFileD && matchFileD[1]) || (matchIdParam && matchIdParam[1]);

        if (cleanDriveId) {
          const safeId = cleanDriveId.replace(/=.*$/, '');
          ogImageUrl = `https://lh3.googleusercontent.com/d/${safeId}=s640`;
          ogWidth = 640;
          ogHeight = 420;
        } else if (rawCover.startsWith('data:')) {
          // B. Base64: Salurkan ke api/image agar dikompresi oleh sharp menjadi JPEG < 150KB
          const idParam = galleryItem?.id ? encodeURIComponent(galleryItem.id) : encodeURIComponent(cleanSlug);
          ogImageUrl = `${origin}/api/image?id=${idParam}&type=gallery`;
          ogWidth = 640;
          ogHeight = 420;
        } else if (rawCover.startsWith('http')) {
          // C. Direct HTTP URL
          ogImageUrl = rawCover;
          ogWidth = 640;
          ogHeight = 420;
        } else if (rawCover.startsWith('/')) {
          ogImageUrl = `${origin}${rawCover}`;
          ogWidth = 640;
          ogHeight = 420;
        }
      }

      const redirectUrl = `${origin}/galeri/${encodeURIComponent(cleanSlug)}`;

      const html = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(galleryTitle)} - Galeri Korwilcam Purwodadi</title>
  <meta name="description" content="${escapeHtml(galleryDesc)}">

  <!-- Open Graph / Facebook / WhatsApp (Gambar Sampul Terkompresi < 300KB untuk WA Preview) -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Portal Resmi Korwilcam Purwodadi">
  <meta property="og:title" content="${escapeHtml(galleryTitle)}">
  <meta property="og:description" content="${escapeHtml(galleryDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${ogWidth}">
  <meta property="og:image:height" content="${ogHeight}">
  <meta property="og:image:alt" content="${escapeHtml(galleryTitle)}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <link rel="image_src" href="${escapeHtml(ogImageUrl)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(galleryTitle)}">
  <meta name="twitter:description" content="${escapeHtml(galleryDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Instant Redirect for Humans -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
  <div style="max-width: 500px; text-align: center; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
    <h2 style="font-size: 18px; margin-bottom: 12px; color: #0f172a;">${escapeHtml(galleryTitle)}</h2>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Sedang mengalihkan ke dokumentasi foto kegiatan...</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">Buka Album Sekarang</a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.statusCode = 200;
      return res.end(html);
    }


    // IF ACHIEVEMENT REQUEST -> Kembalikan Open Graph foto siswa 1:1 persegi teroptimasi non-HD
    if (isExplicitAchievement) {
      const cleanSlug = rawParam
        .replace(/^(?:berita\/)?prestasi\//, '')
        .replace(/^\//, '')
        .toLowerCase()
        .trim();

      let ach: SheetAchievement | null = null;

      try {
        const sheetList = await fetchAchievementsFromSpreadsheet();
        if (sheetList && sheetList.length > 0) {
          ach = sheetList.find((a) => {
            const s = a.slug.toLowerCase().trim();
            const i = a.id.toLowerCase().trim();
            const r = a.recipientName.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return s === cleanSlug || i === cleanSlug || cleanSlug.includes(s) || s.includes(cleanSlug) || r === cleanSlug;
          }) || null;
        }
      } catch {}

      if (!ach) {
        const fallbackList: SheetAchievement[] = [
          {
            id: 'prestasi-fallback-adam-naufal',
            title: 'Lomba FTBI Cabang Ndagel Ijen',
            recipientName: 'Adam Naufal Ezio',
            rank: 'Juara 2',
            level: 'Kabupaten',
            schoolName: 'SDN 6 Kuripan',
            year: 2026,
            mentorName: 'Tina Yoga Septriani, S.Pd',
            eventDate: '23 September 2026',
            photoUrl: 'https://drive.google.com/file/d/19i39etKo0GQq_-JJPEPcvKCbsPJ15qDD/view?usp=drive_link',
            slug: 'adam-naufal-ezio-lomba-ftbi-cabang-ndagel-ijen',
            description: 'Juara 2 Lomba Komedi Tunggal (Ndagel Ijen) pada Festival Tunas Bahasa Ibu (FTBI) Jenjang SD Tingkat Kabupaten Grobogan Tahun 2026.'
          },
          {
            id: 'prestasi-fallback-shakila',
            title: 'LOMBA KARAWITAN DISPORA DI AULA DINKES',
            recipientName: 'SHAKILA ALIFA HIBATILLAH',
            rank: 'Harapan 2',
            level: 'Kabupaten',
            schoolName: 'SD NEGERI 2 GEMBAK',
            year: 2026,
            eventDate: '23 Oktober 2026',
            photoUrl: 'https://drive.google.com/file/d/1_9vA0j6y0hM0iC_Nq3vJ7rD1gZt5bX2/view?usp=drive_link',
            slug: 'shakila-alifa-hibatillah-lomba-karawitan-dispora-di-aula-dinkes',
            description: 'Penghargaan Harapan 2 Lomba Karawitan Dispora di Aula Dinkes tingkat Kabupaten Grobogan.'
          },
          {
            id: 'prestasi-fallback-devira',
            title: 'LOMBA KARAWITAN DISPORA DI AULA DINKES',
            recipientName: 'DEVIRA AISAH',
            rank: 'Harapan 2',
            level: 'Kabupaten',
            schoolName: 'SDN 2 NGEMBAK',
            year: 2026,
            eventDate: '23 Oktober 2026',
            photoUrl: 'https://drive.google.com/file/d/1_9vA0j6y0hM0iC_Nq3vJ7rD1gZt5bX2/view?usp=drive_link',
            slug: 'devira-aisah-lomba-karawitan-dispora-di-aula-dinkes',
            description: 'Penghargaan Harapan 2 Lomba Karawitan Dispora di Aula Dinkes tingkat Kabupaten Grobogan.'
          }
        ];

        ach = fallbackList.find(a => 
          a.slug === cleanSlug || cleanSlug.includes(a.slug) || a.slug.includes(cleanSlug) ||
          cleanSlug.includes(a.recipientName.toLowerCase().replace(/\s+/g, '-'))
        ) || null;
      }

      const achRecipient = ach?.recipientName || 'Siswa Berprestasi';
      const achRank = ach?.rank || 'Juara';
      const achTitle = ach ? `🏆 ${achRecipient} - ${achRank} (${ach.schoolName})` : 'Prestasi Siswa Korwilcam Purwodadi';
      const achDesc = ach 
        ? `${ach.rank} Tingkat ${ach.level} • Ajang: ${ach.title} (${ach.year}) • Asal: ${ach.schoolName}. ${ach.description || ''}`
        : 'Dokumentasi prestasi membanggakan siswa & guru di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.';

      // Extract Drive ID untuk thumbnail 1:1 persegi (Square) ukuran 400x400 non-HD (~30KB)
      let ogImageUrl = `${origin}/assets/logo.png`;
      let ogWidth = 400;
      let ogHeight = 400;

      const rawPhoto = (ach?.photoUrl || '').trim();
      const mDrive = rawPhoto.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/i) || 
                     rawPhoto.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i) ||
                     rawPhoto.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/i);

      if (mDrive && mDrive[1]) {
        // Parameter =w400-h400-c memotong dan mengompres foto siswa menjadi 1:1 persegi (Square) ukuran 400x400 non-HD (~30KB)
        ogImageUrl = `https://lh3.googleusercontent.com/d/${mDrive[1]}=w400-h400-c`;
      } else if (rawPhoto.startsWith('http')) {
        ogImageUrl = rawPhoto;
      } else if (rawPhoto.startsWith('data:')) {
        ogImageUrl = `${origin}/api/image?id=${encodeURIComponent(cleanSlug)}&type=achievement`;
      }

      const redirectUrl = `${origin}/berita/prestasi/${encodeURIComponent(cleanSlug)}`;

      const html = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(achTitle)} - Portal Resmi Korwilcam Purwodadi</title>
  <meta name="description" content="${escapeHtml(achDesc)}">

  <!-- Open Graph / Facebook / WhatsApp (Foto Siswa 1:1 Persegi, Resolusi Teroptimasi Non-HD Cepat) -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Portal Resmi Korwilcam Purwodadi">
  <meta property="og:title" content="${escapeHtml(achTitle)}">
  <meta property="og:description" content="${escapeHtml(achDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${ogWidth}">
  <meta property="og:image:height" content="${ogHeight}">
  <meta property="og:image:alt" content="Foto Prestasi ${escapeHtml(achRecipient)}">
  <meta property="og:url" content="${escapeHtml(redirectUrl)}">
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <link rel="image_src" href="${escapeHtml(ogImageUrl)}">

  <!-- Twitter Card (Summary 1:1 Persegi) -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(achTitle)}">
  <meta name="twitter:description" content="${escapeHtml(achDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Instant Redirect for Humans -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
  <div style="max-width: 500px; text-align: center; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
    <div style="width: 120px; height: 120px; margin: 0 auto 16px; border-radius: 16px; overflow: hidden; background: #f1f5f9; border: 2px solid #e2e8f0;">
      <img src="${escapeHtml(ogImageUrl)}" alt="${escapeHtml(achRecipient)}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'">
    </div>
    <h2 style="font-size: 18px; margin-bottom: 8px; color: #0f172a;">${escapeHtml(achTitle)}</h2>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">${escapeHtml(achDesc)}</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">Lihat Detail Prestasi</a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.statusCode = 200;
      return res.end(html);
    }

    // IF KARYAKU REQUEST -> Kembalikan Open Graph khusus buku atau penulis di menu Karyaku (Pustaka Digital)
    if (isExplicitKaryaku) {
      const cleanParam = rawParam
        .replace(/^karyaku\//, '')
        .replace(/^\//, '')
        .trim();

      const allBooks = await fetchKaryakuBooks();

      const slugify = (t: string) =>
        (t || '')
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');

      let karyakuTitle = 'Pustaka Digital Karyaku - Korwilcam Purwodadi';
      let karyakuDesc = 'Koleksi buku digital, karya tulis siswa dan guru di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi. Baca Flipbook 3D interaktif secara online.';
      let redirectUrl = `${origin}/karyaku`;
      let ogImageUrl = `${origin}/logo.png`;
      let ogWidth = 600;
      let ogHeight = 600;

      if (cleanParam) {
        const parts = cleanParam.split('/').filter(Boolean);
        if (parts.length === 1) {
          const authorUser = decodeURIComponent(parts[0]);
          const authorReadable = authorUser.charAt(0).toUpperCase() + authorUser.slice(1);
          karyakuTitle = `Koleksi Buku: ${authorReadable} - Karyaku Korwilcam Purwodadi`;
          karyakuDesc = `Jelajahi seluruh karya buku dan tulisan digital oleh ${authorReadable} di Pustaka Digital Korwilcam Purwodadi.`;
          redirectUrl = `${origin}/karyaku/${encodeURIComponent(authorUser)}`;

          // Cari buku pertama oleh penulis ini untuk gambar sampul
          const targetAuthorSlug = slugify(authorUser);
          const authorBook = allBooks.find(b => {
            const bUser = slugify(b.uploadedBy || '');
            const bAuth = slugify(b.author || '');
            return bUser === targetAuthorSlug || bAuth.includes(targetAuthorSlug) || targetAuthorSlug.includes(bUser);
          });

          if (authorBook && authorBook.cover) {
            const mDrive = authorBook.cover.match(/\/d\/([a-zA-Z0-9_-]+)/) || authorBook.cover.match(/id=([a-zA-Z0-9_-]+)/);
            if (mDrive) {
              ogImageUrl = `https://lh3.googleusercontent.com/d/${mDrive[1]}=s500`;
            } else if (authorBook.cover.startsWith('http')) {
              ogImageUrl = authorBook.cover;
            }
          }
        } else if (parts.length >= 2) {
          const authorUser = decodeURIComponent(parts[0]);
          const bookSlug = decodeURIComponent(parts.slice(1).join('-'));
          const formattedBookTitle = bookSlug
            .split('-')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const targetBookSlug = slugify(bookSlug);
          const targetAuthorSlug = slugify(authorUser);

          // Cari buku yang cocok berdasarkan slug judul dan penulis
          const matchedBook = allBooks.find(b => {
            const bTitleSlug = slugify(b.title || '');
            const bUserSlug = slugify(b.uploadedBy || '');
            const bAuthorSlug = slugify(b.author || '');

            const titleMatches = bTitleSlug === targetBookSlug || bTitleSlug.includes(targetBookSlug) || targetBookSlug.includes(bTitleSlug);
            if (!titleMatches) return false;

            if (targetAuthorSlug) {
              return bUserSlug === targetAuthorSlug || bAuthorSlug.includes(targetAuthorSlug) || targetAuthorSlug.includes(bUserSlug);
            }
            return true;
          }) || allBooks.find(b => {
            const bTitleSlug = slugify(b.title || '');
            return bTitleSlug === targetBookSlug || bTitleSlug.includes(targetBookSlug) || targetBookSlug.includes(bTitleSlug);
          });

          if (matchedBook) {
            const bookRealTitle = matchedBook.title || formattedBookTitle;
            const bookRealAuthor = matchedBook.author || authorUser;
            karyakuTitle = `${bookRealTitle} - Karyaku Penulis: ${bookRealAuthor}`;
            karyakuDesc = matchedBook.description
              ? `${matchedBook.description}. Baca selengkapnya dalam format 3D Flipbook interaktif di Pustaka Digital Korwilcam Purwodadi.`
              : `Baca buku digital "${bookRealTitle}" karya ${bookRealAuthor} dalam format 3D Flipbook interaktif di Pustaka Digital Korwilcam Purwodadi.`;

            if (matchedBook.cover) {
              const mDrive = matchedBook.cover.match(/\/d\/([a-zA-Z0-9_-]+)/) || matchedBook.cover.match(/id=([a-zA-Z0-9_-]+)/);
              if (mDrive) {
                // Resolusi s500 (~300KB) agar cepat terunduh oleh bot WhatsApp dan tampil jernih
                ogImageUrl = `https://lh3.googleusercontent.com/d/${mDrive[1]}=s500`;
              } else if (matchedBook.cover.startsWith('http')) {
                ogImageUrl = matchedBook.cover;
              }
            }
          } else {
            karyakuTitle = `${formattedBookTitle} - Karyaku Penulis: ${authorUser}`;
            karyakuDesc = `Baca buku digital "${formattedBookTitle}" karya ${authorUser} dalam format 3D Flipbook interaktif di Pustaka Digital Korwilcam Purwodadi.`;
          }

          redirectUrl = `${origin}/karyaku/${encodeURIComponent(authorUser)}/${encodeURIComponent(bookSlug)}`;
        }
      }

      const html = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(karyakuTitle)}</title>
  <meta name="description" content="${escapeHtml(karyakuDesc)}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="book">
  <meta property="og:site_name" content="Karyaku - Korwilcam Purwodadi">
  <meta property="og:title" content="${escapeHtml(karyakuTitle)}">
  <meta property="og:description" content="${escapeHtml(karyakuDesc)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${ogWidth}">
  <meta property="og:image:height" content="${ogHeight}">
  <meta property="og:image:alt" content="${escapeHtml(karyakuTitle)}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <link rel="image_src" href="${escapeHtml(ogImageUrl)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(karyakuTitle)}">
  <meta name="twitter:description" content="${escapeHtml(karyakuDesc)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Instant Redirect for Humans -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
  <div style="max-width: 500px; text-align: center; background: #1e293b; padding: 32px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); border: 1px solid #334155;">
    <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 8px; color: #38bdf8;">${escapeHtml(karyakuTitle)}</h2>
    <p style="font-size: 14px; color: #94a3b8; margin-bottom: 24px; line-height: 1.5;">${escapeHtml(karyakuDesc)}</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 12px 24px; background: #0284c7; color: white; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);">Buka Buku Sekarang</a>
  </div>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      res.statusCode = 200;
      return res.end(html);
    }

    let article: any = null;

    // IF ANNOUNCEMENT REQUEST -> Search announcements table first
    if (isExplicitAnnouncement) {
      const annKeys = decodeAnnouncementKeys(rawParam);
      for (const key of annKeys) {
        const { data } = await supabase
          .from('announcements')
          .select('id, title, summary, date, urgency, target')
          .or(`id.eq.${key}`)
          .limit(1)
          .maybeSingle();

        if (data) {
          const annSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          article = {
            id: data.id,
            title: data.title,
            slug: `pengumuman/${annSlug}`,
            annSlug: annSlug,
            summary: data.summary || 'Pengumuman & Surat Edaran Resmi Korwilcam Purwodadi',
            isAnnouncement: true
          };
          break;
        }
      }

      // Fuzzy title match if not found by id
      if (!article) {
        const cleanSlug = rawParam.replace(/^pengumuman\//, '').replace(/^\/pengumuman\//, '');
        const { data: allAnn } = await supabase.from('announcements').select('*').limit(30);
        if (allAnn && allAnn.length > 0) {
          const found = allAnn.find((a: any) => {
            const s = a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            return s === cleanSlug || a.id === cleanSlug || cleanSlug.includes(s);
          });
          if (found) {
            const annSlug = found.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            article = {
              id: found.id,
              title: found.title,
              slug: `pengumuman/${annSlug}`,
              annSlug: annSlug,
              summary: found.summary || 'Pengumuman & Surat Edaran Resmi Korwilcam Purwodadi',
              isAnnouncement: true
            };
          }
        }
      }
    }

    // IF NOT ANNOUNCEMENT OR NOT FOUND YET -> Check Google Spreadsheet news first
    if (!article) {
      const candidateKeys = decodeBase36Id(rawParam);
      const cleanNewsSlug = rawParam
        .replace(/^berita\//, '')
        .replace(/^\/berita\//, '')
        .replace(/^\//, '')
        .toLowerCase()
        .trim();

      const normalizeSlug = (str: string) =>
        (str || '')
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');

      try {
        const sheetNews = await fetchNewsFromSpreadsheet();
        if (sheetNews && sheetNews.length > 0) {
          // 1. Exact match on slug, id, or candidate keys
          const matched = sheetNews.find((item) => {
            const itemSlugNorm = normalizeSlug(item.slug);
            const itemTitleNorm = normalizeSlug(item.title);
            const itemIdNorm = item.id.toLowerCase().trim();

            if (item.slug && (item.slug === rawParam || item.slug.toLowerCase() === cleanNewsSlug || itemSlugNorm === cleanNewsSlug)) return true;
            if (item.id && (item.id === rawParam || item.id.toLowerCase() === cleanNewsSlug || itemIdNorm === cleanNewsSlug)) return true;
            if (candidateKeys.includes(item.id) || candidateKeys.includes(item.slug)) return true;
            if (itemTitleNorm && (itemTitleNorm === cleanNewsSlug || itemTitleNorm === rawParam)) return true;
            return false;
          });

          if (matched) {
            article = matched;
          } else {
            // 2. Fuzzy substring match on slug / title
            const fuzzyMatch = sheetNews.find((item) => {
              const itemSlugNorm = normalizeSlug(item.slug);
              const itemTitleNorm = normalizeSlug(item.title);
              if (!cleanNewsSlug) return false;
              if (itemSlugNorm && (itemSlugNorm.includes(cleanNewsSlug) || cleanNewsSlug.includes(itemSlugNorm))) return true;
              if (itemTitleNorm && (itemTitleNorm.includes(cleanNewsSlug) || cleanNewsSlug.includes(itemTitleNorm))) return true;
              return false;
            });
            if (fuzzyMatch) {
              article = fuzzyMatch;
            }
          }
        }
      } catch (sheetErr) {
        console.warn('Error fetching news from spreadsheet in api/share:', sheetErr);
      }

      // If still not found in Spreadsheet, check legacy Supabase news table
      if (!article) {
        for (const key of candidateKeys) {
          const { data } = await supabase
            .from('news')
            .select('id, title, slug, summary, content, image, author, date')
            .or(`id.eq.${key},slug.eq.${key}`)
            .limit(1)
            .maybeSingle();

          if (data) {
            article = data;
            break;
          }
        }
      }

      // Fallback if not found: try ilike on slug
      if (!article) {
        const safeSlugParam = rawParam.replace(/[%_\\]/g, '\\$&');
        const { data } = await supabase
          .from('news')
          .select('id, title, slug, summary, content, image, author, date')
          .ilike('slug', `%${safeSlugParam}%`)
          .limit(1)
          .maybeSingle();
        if (data) {
          article = data;
        }
      }
    }

    // Fallback 1: Initial static news
    if (!article) {
      const candidateKeys = decodeBase36Id(rawParam);
      const fallbackNews = [
        {
          id: 'news-01',
          title: 'Rakor Pemantapan Persiapan Asesmen Nasional (ANBK) Jenjang SD se-Kecamatan Purwodadi',
          slug: 'rakor-pemantapan-anbk-sd-purwodadi',
          summary: 'Korwilcam Purwodadi menyelenggarakan rapat koordinasi bersama seluruh Kepala SD Negeri dan Swasta guna memastikan kesiapan sarana chromebook, jaringan internet, dan proktor.',
          image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000'
        },
        {
          id: 'news-02',
          title: 'Semarak Gebyar PAUD & Peringatan Hari Anak Nasional: Mengasah Kreativitas Sejak Dini',
          slug: 'gebyar-paud-hari-anak-nasional-purwodadi',
          summary: 'Ratusan peserta didik dari jenjang PAUD dan TK se-Kecamatan Purwodadi antusias mengikuti lomba mewarnai, gerak lagu ceria, dan parade busana adat nusantara.',
          image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=1000'
        },
        {
          id: 'news-03',
          title: 'Membanggakan! Kontingen Siswa SD Purwodadi Raih Juara Umum FLS2N Tingkat Kabupaten',
          slug: 'siswa-sd-purwodadi-juara-umum-fls2n',
          summary: 'Prestasi gemilang diraih siswa-siswi SD perwakilan Kecamatan Purwodadi yang sukses menyabet 4 medali emas pada cabang Menyanyi Solo, Tari Kreasi, Kriya Anyam, dan Gambar Bercerita.',
          image: 'https://images.unsplash.com/photo-1569783721739-16a7f5024443?auto=format&fit=crop&q=80&w=1000'
        }
      ];
      article = fallbackNews.find((n) =>
        candidateKeys.includes(n.id) ||
        candidateKeys.includes(n.slug) ||
        n.slug.includes(rawParam)
      );
    }

    // Fallback 2: Announcements table in Supabase
    if (!article) {
      const annKeys = decodeAnnouncementKeys(rawParam);
      for (const key of annKeys) {
        const { data } = await supabase
          .from('announcements')
          .select('id, title, summary')
          .or(`id.eq.${key}`)
          .limit(1)
          .maybeSingle();

        if (data) {
          const annSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          article = {
            id: data.id,
            title: data.title,
            slug: `pengumuman/${annSlug}`,
            annSlug: annSlug,
            summary: data.summary || 'Pengumuman & Surat Edaran Resmi Korwilcam Purwodadi',
            isAnnouncement: true
          };
          break;
        }
      }
    }

    // If still not found, fallback to news page
    if (!article) {
      res.writeHead(302, { Location: '/berita' });
      return res.end();
    }

    const isAnnouncement = !!article.isAnnouncement;

    // Target human redirect URL
    const targetSlug = String(article.slug || article.id || '')
      .replace(/^berita\//, '')
      .replace(/^\/berita\//, '')
      .replace(/^\//, '');
    const redirectUrl = isAnnouncement
      ? `${origin}/berita/${encodeURIComponent(targetSlug)}`
      : `${origin}/berita/${encodeURIComponent(targetSlug)}`;

    // Prepare absolute image URL & dimensions (Optimasi Khusus WhatsApp < 300KB agar gambar sampul tajam dan tidak pecah)
    let ogImageUrl = `${origin}/logo.png`;
    let ogWidth = 640;
    let ogHeight = 360;

    if (isAnnouncement) {
      // DYNAMIC OFFICIAL ANNOUNCEMENT LETTER IMAGE (SURAT RESMI DOKUMEN)
      ogImageUrl = `${origin}/api/announcement-image?id=${encodeURIComponent(article.id)}`;
      ogWidth = 1200;
      ogHeight = 1420;
    } else if (article.image) {
      const cleanImg = String(article.image).trim();
      if (cleanImg.startsWith('data:')) {
        // Base64 gambar: kompresi dinamis via api/image menjadi JPEG 640px (< 150KB)
        ogImageUrl = `${origin}/api/image?id=${encodeURIComponent(article.id)}`;
        ogWidth = 640;
        ogHeight = 360;
      } else if (cleanImg.startsWith('http')) {
        // Deteksi Google Drive URL
        const driveMatch = cleanImg.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/) || cleanImg.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
        if (driveMatch && driveMatch[1]) {
          const cleanDriveId = driveMatch[1].replace(/=.*$/, '');
          // Gunakan Google CDN =s640: otomatis mengompresi gambar ke JPEG ~120-150KB (di bawah batas 300KB WhatsApp)
          // Menghindari file raksasa 1.5MB yang membuat crawler WhatsApp men-downgrade gambar menjadi pecah/buram!
          ogImageUrl = `https://lh3.googleusercontent.com/d/${cleanDriveId}=s640`;
          ogWidth = 640;
          ogHeight = 360;
        } else if (cleanImg.includes('unsplash.com')) {
          const baseUnsplash = cleanImg.split('?')[0];
          ogImageUrl = `${baseUnsplash}?auto=format&fit=crop&q=80&w=640`;
          ogWidth = 640;
          ogHeight = 360;
        } else {
          // Link eksternal non-Drive: gunakan langsung URL eksternal
          ogImageUrl = cleanImg;
          ogWidth = 640;
          ogHeight = 360;
        }
      } else if (cleanImg.startsWith('/')) {
        ogImageUrl = `${origin}${cleanImg}`;
        ogWidth = 640;
        ogHeight = 360;
      }
    }

    const summaryText = article.summary || (article.content ? article.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : 'Portal Resmi Korwilcam Purwodadi');

    // Return HTML with Open Graph tags + instant browser redirect
    const html = `<!DOCTYPE html>
<html lang="id" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(article.title)} - Korwilcam Purwodadi</title>
  <meta name="description" content="${escapeHtml(summaryText)}">

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Portal Resmi Korwilcam Purwodadi">
  <meta property="og:title" content="${escapeHtml(article.title)}">
  <meta property="og:description" content="${escapeHtml(summaryText)}">
  <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:secure_url" content="${escapeHtml(ogImageUrl)}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${ogWidth}">
  <meta property="og:image:height" content="${ogHeight}">
  <meta property="og:image:alt" content="${escapeHtml(article.title)}">
  <meta property="og:url" content="${escapeHtml(currentUrl)}">
  <link rel="canonical" href="${escapeHtml(redirectUrl)}">
  <link rel="image_src" href="${escapeHtml(ogImageUrl)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(article.title)}">
  <meta name="twitter:description" content="${escapeHtml(summaryText)}">
  <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">

  <!-- Instant Redirect for Humans -->
  <meta http-equiv="refresh" content="0;url=${redirectUrl}">
  <script>
    window.location.replace(${JSON.stringify(redirectUrl)});
  </script>
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px;">
  <div style="max-width: 500px; text-align: center; background: white; padding: 32px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
    <h2 style="font-size: 18px; margin-bottom: 12px; color: #0f172a;">${escapeHtml(article.title)}</h2>
    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Sedang mengalihkan ke halaman ${isAnnouncement ? 'pengumuman resmi' : 'berita resmi'}...</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">Buka Sekarang</a>
  </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.statusCode = 200;
    return res.end(html);
  } catch (err: any) {
    console.error('api/share error:', err);
    res.writeHead(302, { Location: '/berita' });
    return res.end();
  }
}
