// Serverless Function Vercel: /api/broadcast
// Mengirimkan Web Push Notification secara aman dari sisi server
// Kunci OneSignal REST API Key tersembunyi di server dan tidak bocor ke browser pengunjung

const ipRequests = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(req: any, max = 15, windowMs = 60000): boolean {
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown')
    .toString()
    .split(',')[0]
    .trim();
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || now > entry.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

const DEFAULT_ENCODED_KEY = 'b3NfdjJfYXBwXzdmbHF3anRvaW5kZ2hicGFxbHZuN3h5cWN1bWVpYjI0MnRyZWozNXdjN3psczJ3ZDUzYmM2cHJtaHF6djRxY3I1b2t4ZGhpbzJpZXN5cnFseHl3dWhzYXhzdm9yN2l1Y3lxenBpenk=';

function getOneSignalCredentials() {
  const apiKey =
    process.env.ONESIGNAL_REST_API_KEY ||
    process.env.VITE_ONESIGNAL_REST_API_KEY ||
    (typeof Buffer !== 'undefined'
      ? Buffer.from(DEFAULT_ENCODED_KEY, 'base64').toString('utf-8')
      : '');

  const appId =
    process.env.ONESIGNAL_APP_ID ||
    process.env.VITE_ONESIGNAL_APP_ID ||
    'f9570b26-6e43-4663-85e0-82eadfdf1015';

  return { apiKey, appId };
}

export default async function handler(req: any, res: any) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        success: false,
        message: 'Method Not Allowed. Gunakan metode POST.'
      })
    );
  }

  // Rate Limiter: Maksimal 15 broadcast per menit per IP pengirim
  if (!checkRateLimit(req, 15, 60000)) {
    res.statusCode = 429;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        success: false,
        message: 'Terlalu banyak permintaan siaran broadcast. Coba lagi dalam 1 menit.'
      })
    );
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {}
    }

    const { title, message, targetUrl, imageUrl } = body || {};

    const cleanTitle = (title || '').trim();
    const cleanMessage = (message || '').trim();
    let cleanUrl = (targetUrl || '').trim();

    if (!cleanTitle || !cleanMessage) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          success: false,
          message: 'Judul dan isi pesan notifikasi wajib diisi!'
        })
      );
    }

    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const { apiKey, appId } = getOneSignalCredentials();

    if (!apiKey || !appId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          success: false,
          message: 'Konfigurasi kredensial OneSignal pada server belum lengkap.'
        })
      );
    }

    const payload: any = {
      app_id: appId,
      included_segments: ['Total Subscriptions', 'Subscribed Users'],
      headings: {
        en: cleanTitle,
        id: cleanTitle
      },
      contents: {
        en: cleanMessage,
        id: cleanMessage
      },
      url: cleanUrl || 'https://korwilcampurwodadi.web.id',
      chrome_web_icon: 'https://korwilcampurwodadi.web.id/logo.png',
      chrome_web_badge: 'https://korwilcampurwodadi.web.id/logo.png',
      firefox_icon: 'https://korwilcampurwodadi.web.id/logo.png',
      priority: 10, // Prioritas Tertinggi FCM
      ttl: 259200 // Masa aktif 3 hari jika perangkat sedang offline
    };

    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
      payload.chrome_web_image = imageUrl.trim();
      payload.big_picture = imageUrl.trim();
    }

    const oneSignalRes = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Key ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await oneSignalRes.json();

    if (!oneSignalRes.ok) {
      const errMsg =
        (data?.errors && Array.isArray(data.errors)
          ? data.errors.join(', ')
          : data?.errors) ||
        oneSignalRes.statusText ||
        'Gagal mengirim push notification ke OneSignal.';

      res.statusCode = oneSignalRes.status || 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({
          success: false,
          message: errMsg,
          details: data
        })
      );
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        success: true,
        message: 'Notifikasi berhasil disiarkan ke seluruh perangkat!',
        oneSignalId: data.id,
        recipientsCount: data.recipients || 0,
        data
      })
    );
  } catch (error: any) {
    console.error('api/broadcast error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(
      JSON.stringify({
        success: false,
        message: 'Internal Server Error saat memproses broadcast.',
        error: error?.message
      })
    );
  }
}
