import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

    const { data: article } = await supabase
      .from('news')
      .select('id, image')
      .or(`id.eq.${cleanId},slug.eq.${cleanId}`)
      .limit(1)
      .maybeSingle();

    if (!article || !article.image) {
      res.statusCode = 404;
      return res.end('Image not found');
    }

    const rawImage = String(article.image).trim();

    // 1. Google Drive: redirect langsung ke Google CDN terkompresi s640 (sangat cepat & < 160KB)
    const driveMatch = rawImage.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{15,})/) || rawImage.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
    if (driveMatch && driveMatch[1]) {
      const cleanDriveId = driveMatch[1].replace(/=.*$/, '');
      res.writeHead(302, { Location: `https://lh3.googleusercontent.com/d/${cleanDriveId}=s640` });
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
