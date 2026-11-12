import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

const NEWS_SPREADSHEET_ID = '1GwZdBH5Mzd1Ztzf__R7gBROv8oqH-_ks7tISe3FMy1o';
const NEWS_SHEET_GID = '0';

let cachedNewsArticles: { id: string; slug: string; image: string }[] = [];
let newsCacheTimestamp = 0;
const NEWS_CACHE_DURATION = 60 * 1000;

async function fetchNewsImagesFromSpreadsheet(): Promise<{ id: string; slug: string; image: string }[]> {
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
      const res = await fetch(url, { signal: controller.signal });
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
      const slugIdx = findIdx(['slug', 'url'], 2);
      const imgIdx = findIdx(['image', 'gambar', 'foto', 'cover', 'thumbnail', 'sampul', 'image_url'], 10);

      const items: { id: string; slug: string; image: string }[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const id = (row[idIdx] || '').trim();
        const slug = (row[slugIdx] || '').trim();
        let image = (row[imgIdx] || '').trim();
        if (!image && row.length > 8) {
          image = (row[8] || '').trim();
        }
        if (image) {
          items.push({ id, slug, image });
        }
      }

      if (items.length > 0) {
        cachedNewsArticles = items;
        newsCacheTimestamp = now;
        return items;
      }
    } catch {}
  }

  return cachedNewsArticles;
}

const GALLERY_SPREADSHEET_ID = '1FuIEC3zukJKASRAMl6PPUlrv46w4qKa1j9M2AnBR5-A';
const GALLERY_SHEET_GID = '0';

let cachedGalleryAlbums: { id: string; title: string; image: string }[] = [];
let galleryCacheTimestamp = 0;

async function fetchGalleryImagesFromSpreadsheet(): Promise<{ id: string; title: string; image: string }[]> {
  const now = Date.now();
  if (cachedGalleryAlbums.length > 0 && (now - galleryCacheTimestamp < NEWS_CACHE_DURATION)) {
    return cachedGalleryAlbums;
  }

  const urls = [
    `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&gid=${GALLERY_SHEET_GID}`,
    `https://docs.google.com/spreadsheets/d/${GALLERY_SPREADSHEET_ID}/export?format=csv&gid=${GALLERY_SHEET_GID}`
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

      const items: { id: string; title: string; image: string }[] = [];
      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const id = (row[0] || '').trim();
        const title = (row[1] || '').trim();
        if (!id || !title || id.toLowerCase() === 'id') continue;

        let image = (row[3] || '').trim();
        const rawDesc = (row[4] || '').trim();
        const rawImages = (row[7] || '').trim();

        if (!image || image === '#' || image.includes('unsplash.com') || image.includes('/drive/folders')) {
          if (rawImages) {
            try {
              const parsed = JSON.parse(rawImages);
              if (Array.isArray(parsed) && parsed[0]) image = parsed[0];
            } catch {}
          }
        }
        if (!image && rawDesc) {
          const match = rawDesc.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
          if (match && match[1]) {
            try {
              const parsed = JSON.parse(match[1]);
              if (parsed?.images?.[0]) image = parsed.images[0];
            } catch {}
          }
        }

        if (image) {
          items.push({ id, title, image });
        }
      }

      if (items.length > 0) {
        cachedGalleryAlbums = items;
        galleryCacheTimestamp = now;
        return items;
      }
    } catch {}
  }

  return cachedGalleryAlbums;
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

    const rawId = (req.query?.id || req.query?.slug || '').toString().trim();
    const cleanId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    if (!cleanId) {
      res.statusCode = 400;
      return res.end('Missing or invalid image ID');
    }

    const isGallery = (req.query?.type || '').toString().toLowerCase() === 'gallery' || cleanId.startsWith('gal-');
    let rawImage = '';

    if (isGallery) {
      // 1. Ambil dari Google Spreadsheet Galeri (Database Utama)
      try {
        const sheetGalleries = await fetchGalleryImagesFromSpreadsheet();
        const cleanNorm = cleanId.toLowerCase().trim();
        const normalizeSlug = (str: string) =>
          (str || '')
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-+|-+$/g, '');

        const found = sheetGalleries.find((g) => {
          const normTitle = normalizeSlug(g.title);
          const normId = g.id.toLowerCase().trim();
          return normId === cleanNorm || normId === `gal-${cleanNorm}` || normTitle === cleanNorm || normTitle.includes(cleanNorm) || cleanNorm.includes(normTitle);
        });

        if (found && found.image) {
          rawImage = String(found.image).trim();
        }
      } catch (err) {
        console.warn('Error fetching gallery images from spreadsheet in api/image:', err);
      }

      // 2. Fallback ambil dari tabel legacy Supabase gallery berdasarkan ID
      if (!rawImage) {
        const { data: galItem } = await supabase
          .from('gallery')
          .select('*')
          .or(`id.eq.${cleanId},id.eq.gal-${cleanId}`)
          .limit(1)
          .maybeSingle();

      if (galItem) {
        if (galItem.image && galItem.image !== '#' && !galItem.image.includes('/drive/folders') && !galItem.image.includes('unsplash.com')) {
          rawImage = String(galItem.image).trim();
        } else if (Array.isArray(galItem.images) && galItem.images[0]) {
          rawImage = String(galItem.images[0]).trim();
        } else if (galItem.description) {
          const driveMetaMatch = galItem.description.match(/<!--DRIVE_META:([\s\S]*?):DRIVE_META-->/);
          if (driveMetaMatch && driveMetaMatch[1]) {
            try {
              const parsed = JSON.parse(driveMetaMatch[1]);
              if (parsed && Array.isArray(parsed.images) && parsed.images[0]) {
                rawImage = String(parsed.images[0]).trim();
              }
            } catch {}
          }
          if (!rawImage) {
            try {
              const parsed = JSON.parse(galItem.description);
              if (parsed && Array.isArray(parsed.images) && parsed.images[0]) {
                rawImage = String(parsed.images[0]).trim();
              }
            } catch {}
          }
        }
      }

      // Jika belum ketemu, cari berdasarkan slug judul galeri
      if (!rawImage) {
        const { data: allGalleries } = await supabase
          .from('gallery')
          .select('*')
          .limit(100);

        if (allGalleries && allGalleries.length > 0) {
          const matchGal = allGalleries.find((g: any) => {
            if (!g.title) return false;
            const s = g.title
              .toLowerCase()
              .trim()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              .replace(/^-+|-+$/g, '');
            return s === cleanId.toLowerCase() || cleanId.toLowerCase().includes(s) || s.includes(cleanId.toLowerCase());
          });

          if (matchGal) {
            if (matchGal.image && matchGal.image !== '#' && !matchGal.image.includes('/drive/folders') && !matchGal.image.includes('unsplash.com')) {
              rawImage = String(matchGal.image).trim();
            } else if (Array.isArray(matchGal.images) && matchGal.images[0]) {
              rawImage = String(matchGal.images[0]).trim();
            }
          }
        }
      }
    }

    // Jika bukan galeri atau belum ketemu di galeri, periksa Google Spreadsheet news
    if (!rawImage) {
      try {
        const sheetNews = await fetchNewsImagesFromSpreadsheet();
        const cleanNorm = cleanId.toLowerCase().trim();
        const found = sheetNews.find((item) => {
          const sNorm = item.slug.toLowerCase().trim();
          const iNorm = item.id.toLowerCase().trim();
          return iNorm === cleanNorm || sNorm === cleanNorm || sNorm.includes(cleanNorm) || cleanNorm.includes(sNorm);
        });
        if (found && found.image) {
          rawImage = String(found.image).trim();
        }
      } catch {}
    }

    // Jika belum ketemu di Spreadsheet, periksa tabel legacy Supabase news
    if (!rawImage) {
      const { data: article } = await supabase
        .from('news')
        .select('id, image')
        .or(`id.eq.${cleanId},slug.eq.${cleanId}`)
        .limit(1)
        .maybeSingle();

      if (article && article.image) {
        rawImage = String(article.image).trim();
      }
    }

    if (!rawImage) {
      res.statusCode = 404;
      return res.end('Image not found');
    }

    // 1. Google Drive: fetch dan sajikan langsung buffer gambar terkompresi s640 (200 OK)
    const driveMatch = rawImage.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/) || rawImage.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/) || rawImage.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
    if (driveMatch && driveMatch[1]) {
      const cleanDriveId = driveMatch[1].replace(/=.*$/, '');
      const cdnUrl = `https://lh3.googleusercontent.com/d/${cleanDriveId}=s640`;
      try {
        const driveRes = await fetch(cdnUrl, { signal: AbortSignal.timeout(3500) });
        if (driveRes.ok) {
          const arrBuf = await driveRes.arrayBuffer();
          const buf = Buffer.from(arrBuf);
          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Content-Length', buf.length);
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
          res.statusCode = 200;
          return res.end(buf);
        }
      } catch (err) {}
      res.writeHead(302, { Location: cdnUrl });
      return res.end();
    }

    // 2. Base64 Data URI: kompresi dengan sharp ke JPEG resolusi 640px (< 150KB)
    if (rawImage.startsWith('data:')) {
      const matches = rawImage.match(/^data:([^;]+);base64,(.+)$/);
      const base64Data = matches ? matches[2] : rawImage;
      const inputBuffer = Buffer.from(base64Data, 'base64');

      try {
        const compressedBuffer = await sharp(inputBuffer)
          .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', compressedBuffer.length);
        res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
        res.statusCode = 200;
        return res.end(compressedBuffer);
      } catch (sharpErr) {
        console.warn('Gagal kompresi base64 image via sharp, fallback ke buffer asli:', sharpErr);
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Content-Length', inputBuffer.length);
        res.statusCode = 200;
        return res.end(inputBuffer);
      }
    }

    // 3. Web URL Biasa (Non-Drive): fetch dan kompresi agar di bawah batas 300KB WhatsApp
    if (rawImage.startsWith('http')) {
      try {
        const response = await fetch(rawImage);
        if (response.ok) {
          const arrayBuf = await response.arrayBuffer();
          const inputBuf = Buffer.from(arrayBuf);
          const compressed = await sharp(inputBuf)
            .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80, mozjpeg: true })
            .toBuffer();

          res.setHeader('Content-Type', 'image/jpeg');
          res.setHeader('Content-Length', compressed.length);
          res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
          res.statusCode = 200;
          return res.end(compressed);
        }
      } catch (fetchErr) {
        console.warn('Gagal fetch & kompresi external image via sharp, fallback ke redirect:', fetchErr);
      }
      res.writeHead(302, { Location: rawImage });
      return res.end();
    }

    res.statusCode = 404;
    return res.end('Unsupported image format');
  } catch (err: any) {
    console.error('api/image error:', err);
    res.statusCode = 500;
    return res.end('Internal server error');
  }
}
