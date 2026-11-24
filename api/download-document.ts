import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';
import http from 'http';
import { URL } from 'url';

/**
 * Peta MIME Types Berdasarkan Ekstensi File
 */
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  csv: 'text/csv; charset=utf-8',
  txt: 'text/plain; charset=utf-8'
};

/**
 * Ekstraksi Google Drive ID dari string URL
 */
function extractDriveId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Format /file/d/{id} atau /d/{id}
  const matchFileD = trimmed.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Format id={id}
  const matchIdParam = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // Format googleusercontent.com/d/{id}
  const matchLh3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{15,})/);
  if (matchLh3 && matchLh3[1]) return matchLh3[1];

  // Jika input adalah raw ID (panjang 15+ karakter alphanumeric)
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Handler Serverless Vercel untuk Download Dokumen Langsung dari Website
 */
export default async function handler(req: IncomingMessage & { query?: any }, res: ServerResponse) {
  // 1. Tangani Preflight OPTIONS CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Range');
    res.statusCode = 204;
    return res.end();
  }

  // 2. Ambil parameter URL, ID, dan Nama File
  let rawUrl = '';
  let rawId = '';
  let rawFilename = '';

  if (req.query) {
    rawUrl = String(req.query.url || '').trim();
    rawId = String(req.query.id || '').trim();
    rawFilename = String(req.query.filename || '').trim();
  } else if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      rawUrl = (parsed.searchParams.get('url') || '').trim();
      rawId = (parsed.searchParams.get('id') || '').trim();
      rawFilename = (parsed.searchParams.get('filename') || '').trim();
    } catch {}
  }

  const driveId = extractDriveId(rawId) || extractDriveId(rawUrl);
  let targetUrl = '';

  if (driveId) {
    // URL direct download Google Drive
    targetUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
  } else if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
    targetUrl = rawUrl;
  } else {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Parameter url atau id berkas tidak ditemukan atau tidak valid' }));
  }

  // Siapkan nama file unduhan yang bersih
  let cleanFilename = (rawFilename || 'Dokumen_Korwilcam_Purwodadi.pdf')
    .replace(/[/\\?%*:|"<>]/g, ' ')
    .trim();

  // Tentukan MIME type
  const ext = cleanFilename.split('.').pop()?.toLowerCase() || 'pdf';
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Siapkan header RFC 5987 / 6266 untuk attachment nama file
  const encodedFilename = encodeURIComponent(cleanFilename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
  const asciiFilename = cleanFilename.replace(/[^\x20-\x7E]/g, '_');

  const collectedCookies: string[] = [];

  function fetchStream(urlToFetch: string, redirects = 0) {
    if (redirects > 7) {
      res.statusCode = 502;
      return res.end('Terlalu banyak pengalihan (Too many redirects) saat mengunduh berkas');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlToFetch);
    } catch {
      res.statusCode = 400;
      return res.end('URL berkas tidak valid');
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    };

    if (collectedCookies.length > 0) {
      headers['Cookie'] = collectedCookies.join('; ');
    }

    const proxyReq = client.get(urlToFetch, { headers }, (remoteRes) => {
      // Simpan cookie dari response
      if (remoteRes.headers['set-cookie']) {
        const setCookies = Array.isArray(remoteRes.headers['set-cookie'])
          ? remoteRes.headers['set-cookie']
          : [remoteRes.headers['set-cookie']];
        for (const cookieStr of setCookies) {
          const part = cookieStr.split(';')[0];
          if (part && !collectedCookies.includes(part)) {
            collectedCookies.push(part);
          }
        }
      }

      // Tangani pengalihan 301, 302, 303, 307
      if (remoteRes.statusCode && remoteRes.statusCode >= 300 && remoteRes.statusCode < 400 && remoteRes.headers.location) {
        remoteRes.resume();
        const nextUrl = new URL(remoteRes.headers.location, urlToFetch).toString();
        return fetchStream(nextUrl, redirects + 1);
      }

      const remoteContentType = (remoteRes.headers['content-type'] || '').toLowerCase();

      // Cek apakah Google Drive membalas dengan halaman konfirmasi scan virus HTML
      if (driveId && remoteContentType.includes('text/html') && redirects < 5) {
        let bodyHtml = '';
        remoteRes.on('data', (chunk) => {
          bodyHtml += chunk.toString();
        });
        remoteRes.on('end', () => {
          // Cari token konfirmasi unduhan Google Drive
          const confirmMatch = bodyHtml.match(/confirm=([0-9a-zA-Z_-]+)/) ||
                               bodyHtml.match(/name="confirm"\s+value="([0-9a-zA-Z_-]+)"/);
          if (confirmMatch && confirmMatch[1]) {
            const confirmToken = confirmMatch[1];
            const confirmedUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download&confirm=${confirmToken}`;
            return fetchStream(confirmedUrl, redirects + 1);
          }

          // Jika ada link download langsung dalam tag a
          const linkMatch = bodyHtml.match(/href="(\/uc\?[^"]*export=download[^"]*)"/);
          if (linkMatch && linkMatch[1]) {
            const unescaped = linkMatch[1].replace(/&amp;/g, '&');
            const confirmedUrl = `https://drive.google.com${unescaped}`;
            return fetchStream(confirmedUrl, redirects + 1);
          }

          // Jika file HTML biasa atau tidak ada token, sajikan apa adanya
          deliverStream(remoteRes, remoteContentType, bodyHtml);
        });
        return;
      }

      // Sajikan file langsung sebagai attachment download
      deliverStream(remoteRes, contentType);
    });

    proxyReq.on('error', (err) => {
      console.error('Download stream error:', err);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Gagal menghubungi server penyimpanan berkas' }));
      }
    });

    res.on('close', () => {
      proxyReq.destroy();
    });
  }

  function deliverStream(remoteRes: http.IncomingMessage, determinedContentType: string, bufferedBody?: string) {
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', determinedContentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

    if (bufferedBody !== undefined) {
      return res.end(bufferedBody);
    }

    if (remoteRes.headers['content-length']) {
      res.setHeader('Content-Length', remoteRes.headers['content-length']);
    }

    if (req.method === 'HEAD') {
      remoteRes.resume();
      return res.end();
    }

    remoteRes.pipe(res);
  }

  fetchStream(targetUrl);
}
