import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xatvlaxseiyuvfcntmml.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vwFyPFm1dkVCbKOisqkdDQ_8CarPKuK';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function decodeBase36Id(code: string): string[] {
  const list = [code];
  try {
    const num = parseInt(code, 36);
    if (!isNaN(num) && num > 1000000000) {
      list.push(`news-${num}`);
      list.push(String(num));
    }
  } catch {}
  if (!code.startsWith('news-')) {
    list.push(`news-${code}`);
    list.push(`news-${code.padStart(2, '0')}`);
  } else {
    list.push(code.replace(/^news-/, ''));
  }
  return Array.from(new Set(list));
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

export default async function handler(req: any, res: any) {
  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'korwilcampurwodadi-grobogan.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    // Read ID or Slug from query params
    const query = req.query || {};
    const rawParam = (query.id || query.slug || '').toString().trim();

    if (!rawParam) {
      res.writeHead(302, { Location: '/' });
      return res.end();
    }

    const candidateKeys = decodeBase36Id(rawParam);
    
    // Fetch article from Supabase
    let article: any = null;

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

    // Fallback if not found: try ilike on slug
    if (!article) {
      const { data } = await supabase
        .from('news')
        .select('id, title, slug, summary, content, image, author, date')
        .ilike('slug', `%${rawParam}%`)
        .limit(1)
        .maybeSingle();
      if (data) {
        article = data;
      }
    }

    // Fallback 1: Initial static news
    if (!article) {
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
      for (const key of candidateKeys) {
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
            summary: data.summary || 'Pengumuman & Surat Edaran Resmi Korwilcam Purwodadi',
            image: '/logo.png'
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

    // Target full article URL
    const targetSlug = article.slug || article.id;
    const redirectUrl = `${origin}/berita/${encodeURIComponent(targetSlug)}`;

    // Prepare absolute image URL
    let ogImageUrl = `${origin}/logo.png`;
    if (article.image) {
      if (article.image.startsWith('data:')) {
        ogImageUrl = `${origin}/api/image?id=${encodeURIComponent(article.id)}`;
      } else if (article.image.startsWith('http')) {
        ogImageUrl = article.image;
      } else if (article.image.startsWith('/')) {
        ogImageUrl = `${origin}${article.image}`;
      }
    }

    const summaryText = article.summary || (article.content ? article.content.replace(/<[^>]*>/g, '').slice(0, 160) + '...' : 'Portal Resmi Korwilcam Purwodadi');

    // Return HTML with Open Graph tags + instant browser redirect
    const html = `<!DOCTYPE html>
<html lang="id">
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
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(article.title)}">
  <meta property="og:url" content="${redirectUrl}">

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
    <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Sedang mengalihkan ke halaman artikel resmi...</p>
    <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 13px;">Buka Berita Sekarang</a>
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
