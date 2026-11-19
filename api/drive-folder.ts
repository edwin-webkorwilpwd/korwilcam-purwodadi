import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

function extractDriveFolderId(input: string): string | null {
  if (!input) return null;
  const str = input.trim();
  if (/^[a-zA-Z0-9_-]{15,}$/.test(str) && !str.includes('/') && !str.includes('=')) {
    return str;
  }
  const matchFolder = str.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (matchFolder && matchFolder[1]) return matchFolder[1];
  const matchId = str.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchId && matchId[1]) return matchId[1];
  return null;
}

function fetchUrl(targetUrl: string, headers: Record<string, string> = {}): Promise<{ statusCode: number; body: string }> {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, { headers }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, headers).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode || 200, body }));
    }).on('error', reject);
  });
}

export default async function handler(req: IncomingMessage & { query?: any }, res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  let rawParam = '';
  if (req.query) {
    rawParam = req.query.folderId || req.query.folderUrl || req.query.url || req.query.id || '';
  }
  if (!rawParam && req.url) {
    try {
      const parsed = new URL(req.url, 'http://localhost');
      rawParam = parsed.searchParams.get('folderId') || 
                 parsed.searchParams.get('folderUrl') || 
                 parsed.searchParams.get('url') || 
                 parsed.searchParams.get('id') || '';
    } catch {}
  }

  const folderId = extractDriveFolderId(String(rawParam));
  if (!folderId) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, message: 'Parameter folderId atau folderUrl tidak valid' }));
  }

  const embedUrl = `https://drive.google.com/embeddedfolderview?id=${folderId}`;
  const seenIds = new Set<string>();
  const images: string[] = [];

  try {
    const { statusCode, body } = await fetchUrl(embedUrl, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    });

    if (statusCode === 200 && body) {
      // 1. Match entry-ID
      const regexEntry = /entry-([a-zA-Z0-9_-]{20,})/g;
      let m: RegExpExecArray | null;
      while ((m = regexEntry.exec(body)) !== null) {
        const fid = m[1];
        if (!seenIds.has(fid)) {
          seenIds.add(fid);
          images.push(`https://lh3.googleusercontent.com/d/${fid}`);
        }
      }

      // 2. Match /file/d/ID
      const regexFile = /\/file\/d\/([a-zA-Z0-9_-]{20,})/g;
      while ((m = regexFile.exec(body)) !== null) {
        const fid = m[1];
        if (!seenIds.has(fid)) {
          seenIds.add(fid);
          images.push(`https://lh3.googleusercontent.com/d/${fid}`);
        }
      }

      // 3. Match data-id="ID"
      const regexDataId = /data-id="([a-zA-Z0-9_-]{25,})"/g;
      while ((m = regexDataId.exec(body)) !== null) {
        const fid = m[1];
        if (!seenIds.has(fid)) {
          seenIds.add(fid);
          images.push(`https://lh3.googleusercontent.com/d/${fid}`);
        }
      }
    }
  } catch (err: any) {
    console.warn('Gagal fetch embeddedfolderview:', err.message);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60');
  return res.end(JSON.stringify({
    success: true,
    folderId,
    totalPhotos: images.length,
    coverImage: images[0] || '',
    images
  }));
}
