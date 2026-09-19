import { createClient } from '@supabase/supabase-js';

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

    if (article.image.startsWith('data:')) {
      const matches = article.image.match(/^data:([^;]+);base64,(.+)$/);
      const mimeType = matches ? matches[1] : 'image/jpeg';
      const base64Data = matches ? matches[2] : article.image;
      const buffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
      res.statusCode = 200;
      return res.end(buffer);
    } else if (article.image.startsWith('http')) {
      res.writeHead(302, { Location: article.image });
      return res.end();
    } else {
      res.statusCode = 404;
      return res.end('Unsupported image format');
    }
  } catch (err: any) {
    console.error('api/image error:', err);
    res.statusCode = 500;
    return res.end('Internal server error');
  }
}
