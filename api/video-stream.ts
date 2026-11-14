import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

export default async function handler(req: IncomingMessage & { query?: any }, res: ServerResponse) {
  // 1. Tangani preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    res.statusCode = 204;
    return res.end();
  }

  // 2. Ambil parameter id file Google Drive
  let fileId = '';
  if (req.query && req.query.id) {
    fileId = String(req.query.id).trim();
  } else if (req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      fileId = (parsed.searchParams.get('id') || '').trim();
    } catch {}
  }

  // Bersihkan ID dari karakter tidak aman
  fileId = fileId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (!fileId || fileId.length < 15) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Parameter id file Google Drive tidak valid' }));
  }

  const range = req.headers['range'] || '';
  const driveUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download`;

  function streamFromUrl(targetUrl: string, redirectCount = 0) {
    if (redirectCount > 5) {
      res.statusCode = 502;
      return res.end('Too many redirects');
    }

    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*'
    };

    if (range) {
      headers['Range'] = range;
    }

    const proxyReq = https.get(targetUrl, { headers }, (googleRes) => {
      // Tangani pengalihan 301, 302, 303, 307
      if (googleRes.statusCode && googleRes.statusCode >= 300 && googleRes.statusCode < 400 && googleRes.headers.location) {
        googleRes.resume(); // Buang data redirect
        return streamFromUrl(googleRes.headers.location, redirectCount + 1);
      }

      const statusCode = googleRes.statusCode || 200;

      // Set header respons media video
      res.statusCode = statusCode;
      res.setHeader('Content-Type', googleRes.headers['content-type'] || 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
      res.setHeader('Cache-Control', 'public, max-age=7200, stale-while-revalidate=86400');

      if (googleRes.headers['content-length']) {
        res.setHeader('Content-Length', googleRes.headers['content-length']);
      }
      if (googleRes.headers['content-range']) {
        res.setHeader('Content-Range', googleRes.headers['content-range']);
      }

      // Jika hanya request HEAD
      if (req.method === 'HEAD') {
        googleRes.resume();
        return res.end();
      }

      // Alirkan data stream video langsung ke browser
      googleRes.pipe(res);

      res.on('close', () => {
        googleRes.destroy();
        proxyReq.destroy();
      });
    });

    proxyReq.on('error', (err) => {
      console.error('Error streaming Google Drive video:', err);
      if (!res.headersSent) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Gagal menghubungkan ke server Google Drive' }));
      }
    });

    res.on('close', () => {
      proxyReq.destroy();
    });
  }

  streamFromUrl(driveUrl);
}
