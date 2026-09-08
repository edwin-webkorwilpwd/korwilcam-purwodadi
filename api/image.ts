import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default async function handler(req: any, res: any) {
  try {
    const id = (req.query?.id || req.query?.slug || '').toString().trim();
    if (!id) {
      res.statusCode = 400;
      return res.end('Missing image ID');
    }

    const { data: article } = await supabase
      .from('news')
      .select('id, image')
      .or(`id.eq.${id},slug.eq.${id}`)
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
