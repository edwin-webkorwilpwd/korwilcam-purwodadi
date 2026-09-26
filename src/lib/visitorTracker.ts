/**
 * Utilitas Analisis & Pelacak Kunjungan Real-Time Website Korwilcam Purwodadi
 * Merekam seluruh data kunjungan riil langsung ke tabel Supabase "analitik website".
 * Menjamin integritas data nyata tanpa data dummy.
 */

import { getSupabaseClient } from './supabase';

export interface DailyTrendPoint {
  date: string;
  label: string;
  visitors: number;
  pageViews: number;
}

export interface TrafficSourceStat {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface DeviceStat {
  name: 'Desktop' | 'Mobile' | 'Tablet';
  percentage: number;
  count: number;
  color: string;
}

export interface CityStat {
  name: string;
  count: number;
  percentage: number;
}

export interface PageStat {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentVisit {
  id: string;
  timeFormatted: string;
  city: string;
  device: string;
  page: string;
}

export interface DurationBracket {
  label: string;
  count: number;
}

export interface BrowserStat {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

export interface DashboardAnalyticsData {
  isTableMissing: boolean;
  tableErrorMessage?: string;
  totalVisitors: number;
  uniqueVisitors: number;
  totalPageViews: number;
  avgDurationFormatted: string;
  avgDurationSeconds: number;
  bounceRateFormatted: string;
  growth: {
    totalVisitors: string;
    uniqueVisitors: string;
    totalPageViews: string;
    duration: string;
    bounceRate: string;
  };
  sparklines: {
    totalVisitors: number[];
    uniqueVisitors: number[];
    totalPageViews: number[];
    duration: number[];
    bounceRate: number[];
  };
  trendLines: DailyTrendPoint[];
  trafficSources: TrafficSourceStat[];
  deviceBreakdown: DeviceStat[];
  topCities: CityStat[];
  topPages: PageStat[];
  recentVisits: RecentVisit[];
  sessionBars: { label: string; sessions: number }[];
  durationDistribution: DurationBracket[];
  topBrowsers: BrowserStat[];
  dateRangeFormatted: string;
  lastUpdatedFormatted: string;
  detectedCity: string;
}

const VISITOR_ID_KEY = 'korwil_visitor_uuid';
const SESSION_ID_KEY = 'korwil_session_uuid';
const TAB_COUNTED_KEY = 'korwil_tab_visit_counted';
const SYNCED_TO_SUPABASE_KEY = 'korwil_tab_synced_supabase_v2';
const SESSION_PAGEVIEWS_KEY = 'korwil_session_pvs';
const DETECTED_CITY_KEY = 'korwil_visitor_city';
const SUPABASE_TABLE_NAME = 'analitik website';

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_NAMES_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/**
 * Format detik menjadi "Xm Ys" atau "Xs"
 */
export function formatDurationToMinsSecs(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = Math.round(totalSecs % 60);
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

/**
 * Deteksi tipe perangkat riil dari user-agent
 */
export function detectDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof navigator === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Deteksi peramban (browser) riil
 */
export function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Google Chrome';
  const ua = navigator.userAgent;
  if (/edg/i.test(ua)) return 'Microsoft Edge';
  if (/opr|opera/i.test(ua)) return 'Opera';
  if (/firefox|fxios/i.test(ua)) return 'Mozilla Firefox';
  if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) return 'Safari';
  if (/chrome|chromium|crios/i.test(ua)) return 'Google Chrome';
  return 'Lainnya';
}

/**
 * Deteksi sistem operasi riil
 */
export function detectOS(): string {
  if (typeof navigator === 'undefined') return 'Windows';
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Lainnya';
}

/**
 * Deteksi sumber trafik dari dokumen referrer
 */
export function detectTrafficSource(): string {
  if (typeof document === 'undefined') return 'Langsung';
  const ref = document.referrer;
  if (!ref) return 'Langsung';
  const lower = ref.toLowerCase();
  if (lower.includes('google.') || lower.includes('bing.') || lower.includes('yahoo.') || lower.includes('yandex.')) {
    return 'Organik (Google)';
  }
  if (
    lower.includes('facebook.') ||
    lower.includes('instagram.') ||
    lower.includes('twitter.') ||
    lower.includes('x.com') ||
    lower.includes('tiktok.') ||
    lower.includes('youtube.') ||
    lower.includes('whatsapp.') ||
    lower.includes('wa.me')
  ) {
    return 'Media Sosial';
  }
  if (typeof window !== 'undefined' && lower.includes(window.location.hostname)) {
    return 'Langsung';
  }
  return 'Referral';
}

/**
 * Format nama tab menjadi judul halaman resmi
 */
export function getFriendlyPageName(tabId?: string): string {
  if (!tabId) return 'Beranda';
  switch (tabId) {
    case 'home':
    case 'beranda':
      return 'Beranda';
    case 'news':
    case 'berita':
      return 'Berita';
    case 'announcements':
    case 'pengumuman':
      return 'Pengumuman';
    case 'profile':
    case 'profil':
    case 'information':
    case 'informasi':
      return 'Informasi';
    case 'gallery':
    case 'galeri':
      return 'Galeri';
    case 'achievements':
    case 'prestasi':
      return 'Prestasi';
    case 'downloads':
    case 'unduhan':
      return 'Unduhan';
    case 'contact':
    case 'kontak':
      return 'Kontak';
    case 'schools':
    case 'sekolah':
      return 'Data Sekolah';
    case 'sop':
      return 'SOP Layanan';
    default:
      if (tabId.startsWith('news-detail')) return 'Berita';
      if (tabId.startsWith('announcement-detail')) return 'Pengumuman';
      if (tabId.startsWith('gallery-detail')) return 'Galeri';
      return 'Beranda';
  }
}

/**
 * Cek apakah user saat ini sedang login dengan akun terdaftar
 */
function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const authData = localStorage.getItem('korwil_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return Boolean(parsed && parsed.username);
    }
  } catch {
    // Abaikan
  }
  return false;
}

/**
 * Dapatkan atau buat Visitor ID unik dan persisten
 */
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'visitor-server';
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

/**
 * Dapatkan atau buat Session ID unik per tab
 */
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'session-server';
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    sessionStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

/**
 * Bersihkan dan normalkan nama kota agar rapi dan akurat
 */
export function cleanAndNormalizeCity(rawCity: string, rawRegion?: string): string {
  if (!rawCity || rawCity.trim() === '') return 'Purwodadi';

  let city = rawCity.trim();
  city = city.replace(/^(Kota|Kabupaten|Kecamatan|Kab\.|Kec\.)\s+/i, '');

  city = city
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return city || 'Purwodadi';
}

/**
 * Deteksi lokasi geografis riil pengunjung menggunakan IP Geolocation
 */
export async function detectVisitorLocation(): Promise<string> {
  if (typeof window === 'undefined') return 'Purwodadi';

  const cached = sessionStorage.getItem(DETECTED_CITY_KEY);
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch('https://ipwho.is/', {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.city) {
        const cleaned = cleanAndNormalizeCity(data.city, data.region);
        sessionStorage.setItem(DETECTED_CITY_KEY, cleaned);
        return cleaned;
      }
    }
  } catch {
    // Fallback
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res2 = await fetch('https://freeipapi.com/api/json', {
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res2.ok) {
      const data2 = await res2.json();
      if (data2 && data2.cityName) {
        const cleaned = cleanAndNormalizeCity(data2.cityName, data2.regionName);
        sessionStorage.setItem(DETECTED_CITY_KEY, cleaned);
        return cleaned;
      }
    }
  } catch {
    // Abaikan
  }

  const defaultCity = 'Purwodadi';
  sessionStorage.setItem(DETECTED_CITY_KEY, defaultCity);
  return defaultCity;
}

/**
 * Inisialisasi pelacak pengunjung real-time.
 * Aturan khusus: Jika membuka 1 tab dan login akun terdaftar, HANYA dihitung 1x kunjungan per sesi tab.
 * Mencatat langsung ke tabel Supabase "analitik website".
 */
export function initVisitorTracker(currentTab: string = 'home'): void {
  if (typeof window === 'undefined') return;

  const visitorId = getOrCreateVisitorId();
  const sessionId = getOrCreateSessionId();
  const loggedIn = isUserLoggedIn();
  const isAlreadySynced = sessionStorage.getItem(SYNCED_TO_SUPABASE_KEY) === 'true';

  // 1. Rekam kunjungan baru ke Supabase jika sesi tab ini belum tersinkronisasi
  if (!isAlreadySynced) {
    detectVisitorLocation().then(async (city) => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const deviceType = detectDeviceType();
      const browser = detectBrowser();
      const os = detectOS();
      const trafficSource = detectTrafficSource();
      const landingPage = getFriendlyPageName(currentTab);

      try {
        const { error } = await supabase.from(SUPABASE_TABLE_NAME).insert([
          {
            session_id: sessionId,
            visitor_id: visitorId,
            city,
            region: 'Jawa Tengah',
            country: 'Indonesia',
            device_type: deviceType,
            browser,
            os,
            traffic_source: trafficSource,
            referrer: typeof document !== 'undefined' ? (document.referrer || '') : '',
            landing_page: landingPage,
            current_page: landingPage,
            pages_visited: [landingPage],
            page_views: 1,
            duration_seconds: 0,
            is_bounce: true,
            is_logged_in: loggedIn,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);

        if (!error) {
          sessionStorage.setItem(SYNCED_TO_SUPABASE_KEY, 'true');
          sessionStorage.setItem(TAB_COUNTED_KEY, 'true');
          sessionStorage.setItem(SESSION_PAGEVIEWS_KEY, '1');
          window.dispatchEvent(new CustomEvent('korwil_analytics_updated'));
        } else {
          console.warn('[Analytics Tracker] Gagal mencatat kunjungan ke Supabase:', error.message);
        }
      } catch (err) {
        console.warn('[Analytics Tracker] Gagal mencatat kunjungan ke Supabase:', err);
      }
    });
  }

  // 2. Timer durasi aktif (menghitung detik saat tab sedang dilihat secara aktif)
  let activeElapsedSeconds = 0;
  const timer = window.setInterval(async () => {
    if (document.visibilityState === 'visible') {
      activeElapsedSeconds += 1;

      // Sinkronkan ke Supabase setiap 15 detik
      if (activeElapsedSeconds % 15 === 0) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            await supabase
              .from(SUPABASE_TABLE_NAME)
              .update({
                duration_seconds: activeElapsedSeconds,
                is_bounce: activeElapsedSeconds < 15,
                is_logged_in: isUserLoggedIn(),
                updated_at: new Date().toISOString()
              })
              .eq('session_id', sessionId);
          } catch {
            // Abaikan
          }
        }
      }
    }
  }, 1000);

  // Simpan durasi saat tab ditutup / sebelum unload
  const handleUnload = () => {
    clearInterval(timer);
    const supabase = getSupabaseClient();
    if (supabase && activeElapsedSeconds > 0) {
      supabase
        .from(SUPABASE_TABLE_NAME)
        .update({
          duration_seconds: activeElapsedSeconds,
          is_bounce: activeElapsedSeconds < 15,
          is_logged_in: isUserLoggedIn(),
          updated_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .then(() => {});
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      handleUnload();
    }
  });
}

/**
 * Mencatat penambahan tayangan halaman (Pageview) saat berpindah menu / halaman
 */
export async function recordPageView(newTabId: string = 'home'): Promise<void> {
  if (typeof window === 'undefined') return;

  const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) return;

  let currentPvs = parseInt(sessionStorage.getItem(SESSION_PAGEVIEWS_KEY) || '1', 10);
  currentPvs += 1;
  sessionStorage.setItem(SESSION_PAGEVIEWS_KEY, currentPvs.toString());

  const friendlyName = getFriendlyPageName(newTabId);

  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase
      .from(SUPABASE_TABLE_NAME)
      .update({
        page_views: currentPvs,
        current_page: friendlyName,
        is_bounce: false,
        is_logged_in: isUserLoggedIn(),
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);

    window.dispatchEvent(new CustomEvent('korwil_analytics_updated'));
  } catch {
    // Abaikan
  }
}

/**
 * Mengambil dan mengagregasikan seluruh data statistik dari tabel Supabase "analitik website"
 */
export async function fetchWebsiteAnalyticsFromSupabase(rangeDays: number = 30): Promise<DashboardAnalyticsData> {
  const detectedCity =
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(DETECTED_CITY_KEY)) || 'Purwodadi';

  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - rangeDays);

  const formattedNow = `${now.getDate()} ${MONTH_NAMES_SHORT[now.getMonth()]} ${now.getFullYear()} ${String(
    now.getHours()
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

  const dateRangeFormatted = `${startDate.getDate()} - ${now.getDate()} ${
    MONTH_NAMES_FULL[now.getMonth()]
  } ${now.getFullYear()}`;

  const supabase = getSupabaseClient();

  if (!supabase) {
    return createEmptyWebsiteAnalytics(
      true,
      'Koneksi Supabase belum dikonfigurasi.',
      detectedCity,
      dateRangeFormatted,
      formattedNow
    );
  }

  try {
    // Query data dari tabel "analitik website" (hanya kolom yang diperlukan agar hemat egress)
    const { data: rawRows, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select('id, created_at, visitor_id, session_id, city, device_type, browser, traffic_source, landing_page, current_page, page_views, duration_seconds, is_bounce')
      .neq('session_id', 'test_session_1')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Jika tabel belum dibuat di Supabase (PGRST205 atau 42P01)
    if (error) {
      console.warn('[Supabase Analytics] Error saat query tabel:', error.message);
      return createEmptyWebsiteAnalytics(
        true,
        error.message || `Tabel "${SUPABASE_TABLE_NAME}" belum ditemukan di Supabase.`,
        detectedCity,
        dateRangeFormatted,
        formattedNow
      );
    }

    const rows = rawRows || [];

    // Jika tabel ada tapi belum ada baris kunjungan tercatat
    if (rows.length === 0) {
      return createEmptyWebsiteAnalytics(
        false,
        '',
        detectedCity,
        dateRangeFormatted,
        formattedNow
      );
    }

    // =========================================================================
    // AGREGASI DATA REAL DARI TABEL SUPABASE (100% DATA NYATA TANPA DUMMY)
    // =========================================================================
    const totalVisitors = rows.length;
    const uniqueVisitors = new Set(rows.map((r) => r.visitor_id)).size;
    const totalPageViews = rows.reduce((sum, r) => sum + (Number(r.page_views) || 1), 0);
    const totalDurationSeconds = rows.reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0);
    const avgDurationSeconds = totalVisitors > 0 ? Math.round(totalDurationSeconds / totalVisitors) : 0;
    const avgDurationFormatted = formatDurationToMinsSecs(avgDurationSeconds);

    const bounceCount = rows.filter((r) => r.is_bounce === true).length;
    const bounceRateNum = totalVisitors > 0 ? (bounceCount / totalVisitors) * 100 : 0;
    const bounceRateFormatted = `${bounceRateNum.toFixed(1).replace('.', ',')}%`;

    // Perhitungan Pertumbuhan Riil (Periode Terkini vs Sebelumnya)
    const halfPeriodTime = now.getTime() - ((now.getTime() - startDate.getTime()) / 2);
    const currHalfRows = rows.filter((r) => new Date(r.created_at).getTime() >= halfPeriodTime);
    const prevHalfRows = rows.filter((r) => new Date(r.created_at).getTime() < halfPeriodTime);

    const calcGrowth = (curr: number, prev: number): string => {
      if (prev === 0) {
        if (curr === 0) return '0%';
        return '↑ 100%';
      }
      const diff = ((curr - prev) / prev) * 100;
      if (Math.abs(diff) < 0.05) return '0%';
      if (diff > 0) return `↑ ${diff.toFixed(1).replace('.', ',')}%`;
      return `↓ ${Math.abs(diff).toFixed(1).replace('.', ',')}%`;
    };

    const currVis = currHalfRows.length;
    const prevVis = prevHalfRows.length;
    const currUniq = new Set(currHalfRows.map((r) => r.visitor_id)).size;
    const prevUniq = new Set(prevHalfRows.map((r) => r.visitor_id)).size;
    const currPV = currHalfRows.reduce((sum, r) => sum + (Number(r.page_views) || 1), 0);
    const prevPV = prevHalfRows.reduce((sum, r) => sum + (Number(r.page_views) || 1), 0);
    const currDur = currVis > 0 ? currHalfRows.reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0) / currVis : 0;
    const prevDur = prevVis > 0 ? prevHalfRows.reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0) / prevVis : 0;
    const currBounce = currVis > 0 ? (currHalfRows.filter((r) => r.is_bounce).length / currVis) * 100 : 0;
    const prevBounce = prevVis > 0 ? (prevHalfRows.filter((r) => r.is_bounce).length / prevVis) * 100 : 0;

    const growth = {
      totalVisitors: calcGrowth(currVis, prevVis),
      uniqueVisitors: calcGrowth(currUniq, prevUniq),
      totalPageViews: calcGrowth(currPV, prevPV),
      duration: calcGrowth(currDur, prevDur),
      bounceRate: calcGrowth(currBounce, prevBounce)
    };

    // 1. Tren Harian (7 hari terakhir untuk grafik tren)
    const trendMap: Record<string, { label: string; visitors: number; pageViews: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;
      trendMap[key] = {
        label: `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
        visitors: 0,
        pageViews: 0
      };
    }

    rows.forEach((r) => {
      const rowDate = r.created_at ? r.created_at.substring(0, 10) : '';
      if (trendMap[rowDate]) {
        trendMap[rowDate].visitors += 1;
        trendMap[rowDate].pageViews += Number(r.page_views) || 1;
      }
    });

    const trendLines: DailyTrendPoint[] = Object.entries(trendMap).map(([date, val]) => ({
      date,
      label: val.label,
      visitors: val.visitors,
      pageViews: val.pageViews
    }));

    // Sparklines data points riil harian
    const sparklines = {
      totalVisitors: trendLines.map((t) => t.visitors),
      uniqueVisitors: trendLines.map((t) => {
        const dateRows = rows.filter((r) => r.created_at && r.created_at.startsWith(t.date));
        return new Set(dateRows.map((r) => r.visitor_id)).size;
      }),
      totalPageViews: trendLines.map((t) => t.pageViews),
      duration: trendLines.map((t) => {
        const dateRows = rows.filter((r) => r.created_at && r.created_at.startsWith(t.date));
        const dur = dateRows.reduce((sum, r) => sum + (Number(r.duration_seconds) || 0), 0);
        return dateRows.length > 0 ? Math.round(dur / dateRows.length) : 0;
      }),
      bounceRate: trendLines.map((t) => {
        const dateRows = rows.filter((r) => r.created_at && r.created_at.startsWith(t.date));
        const bounce = dateRows.filter((r) => r.is_bounce === true).length;
        return dateRows.length > 0 ? Math.round((bounce / dateRows.length) * 100) : 0;
      })
    };

    // 2. Sumber Trafik
    const trafficCountMap: Record<string, number> = {
      'Organik (Google)': 0,
      'Langsung': 0,
      'Media Sosial': 0,
      'Referral': 0,
      'Lainnya': 0
    };
    rows.forEach((r) => {
      const src = r.traffic_source || 'Langsung';
      if (trafficCountMap[src] !== undefined) {
        trafficCountMap[src] += 1;
      } else {
        trafficCountMap['Lainnya'] += 1;
      }
    });

    const trafficColors: Record<string, string> = {
      'Organik (Google)': '#1e40af',
      'Langsung': '#2563eb',
      'Media Sosial': '#3b82f6',
      'Referral': '#60a5fa',
      'Lainnya': '#93c5fd'
    };

    const trafficSources: TrafficSourceStat[] = Object.entries(trafficCountMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalVisitors > 0 ? parseFloat(((count / totalVisitors) * 100).toFixed(1)) : 0,
      color: trafficColors[name] || '#3b82f6'
    }));

    // 3. Perangkat yang Digunakan
    const deviceCountMap = { Desktop: 0, Mobile: 0, Tablet: 0 };
    rows.forEach((r) => {
      const dev = (r.device_type || 'Desktop') as 'Desktop' | 'Mobile' | 'Tablet';
      if (deviceCountMap[dev] !== undefined) {
        deviceCountMap[dev] += 1;
      } else {
        deviceCountMap.Desktop += 1;
      }
    });

    const deviceBreakdown: DeviceStat[] = [
      {
        name: 'Desktop',
        count: deviceCountMap.Desktop,
        percentage: totalVisitors > 0 ? parseFloat(((deviceCountMap.Desktop / totalVisitors) * 100).toFixed(1)) : 0,
        color: '#2563eb'
      },
      {
        name: 'Mobile',
        count: deviceCountMap.Mobile,
        percentage: totalVisitors > 0 ? parseFloat(((deviceCountMap.Mobile / totalVisitors) * 100).toFixed(1)) : 0,
        color: '#f97316'
      },
      {
        name: 'Tablet',
        count: deviceCountMap.Tablet,
        percentage: totalVisitors > 0 ? parseFloat(((deviceCountMap.Tablet / totalVisitors) * 100).toFixed(1)) : 0,
        color: '#10b981'
      }
    ];

    // 4. Lokasi Pengunjung (Kota Teratas)
    const cityMap: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.city && r.city.trim()) {
        const c = r.city.trim();
        cityMap[c] = (cityMap[c] || 0) + 1;
      }
    });

    const topCities: CityStat[] = Object.entries(cityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalVisitors > 0 ? parseFloat(((count / totalVisitors) * 100).toFixed(1)) : 0
      }));

    // 5. Halaman Paling Banyak Dikunjungi
    const pageMap: Record<string, number> = {};
    rows.forEach((r) => {
      const p = r.landing_page || r.current_page || 'Beranda';
      pageMap[p] = (pageMap[p] || 0) + (Number(r.page_views) || 1);
    });

    const topPages: PageStat[] = Object.entries(pageMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalPageViews > 0 ? parseFloat(((count / totalPageViews) * 100).toFixed(1)) : 0
      }));

    // 6. Kunjungan Terbaru (5 baris terbaru)
    const recentVisits: RecentVisit[] = rows.slice(0, 5).map((r, idx) => {
      const dt = r.created_at ? new Date(r.created_at) : new Date();
      const timeFormatted = `${dt.getDate()} ${MONTH_NAMES_SHORT[dt.getMonth()]} ${String(dt.getHours()).padStart(
        2,
        '0'
      )}:${String(dt.getMinutes()).padStart(2, '0')}`;
      return {
        id: r.id || `visit-${idx}`,
        timeFormatted,
        city: r.city || 'Tidak diketahui',
        device: r.device_type || 'Desktop',
        page: r.current_page || r.landing_page || 'Beranda'
      };
    });

    // 7. Sesi Pengunjung (Batang Sesi Harian)
    const sessionBars = trendLines.map((t) => ({
      label: t.label,
      sessions: t.visitors
    }));

    // 8. Durasi Kunjungan (Distribusi Rentang Waktu)
    const durDistribution: Record<string, number> = {
      '< 10s': 0,
      '10-30s': 0,
      '30s-1m': 0,
      '1-3m': 0,
      '3-5m': 0,
      '> 5m': 0
    };

    rows.forEach((r) => {
      const sec = Number(r.duration_seconds) || 0;
      if (sec < 10) durDistribution['< 10s'] += 1;
      else if (sec <= 30) durDistribution['10-30s'] += 1;
      else if (sec <= 60) durDistribution['30s-1m'] += 1;
      else if (sec <= 180) durDistribution['1-3m'] += 1;
      else if (sec <= 300) durDistribution['3-5m'] += 1;
      else durDistribution['> 5m'] += 1;
    });

    const durationDistribution: DurationBracket[] = Object.entries(durDistribution).map(([label, count]) => ({
      label,
      count
    }));

    // 9. Peramban (Browser) Terpopuler
    const browserMap: Record<string, number> = {
      'Google Chrome': 0,
      'Safari': 0,
      'Mozilla Firefox': 0,
      'Microsoft Edge': 0,
      'Lainnya': 0
    };

    rows.forEach((r) => {
      const b = r.browser || 'Google Chrome';
      if (browserMap[b] !== undefined) {
        browserMap[b] += 1;
      } else {
        browserMap['Lainnya'] += 1;
      }
    });

    const browserColors: Record<string, string> = {
      'Google Chrome': '#2563eb',
      'Safari': '#38bdf8',
      'Mozilla Firefox': '#f97316',
      'Microsoft Edge': '#0284c7',
      'Lainnya': '#94a3b8'
    };

    const topBrowsers: BrowserStat[] = Object.entries(browserMap).map(([name, count]) => ({
      name,
      count,
      percentage: totalVisitors > 0 ? parseFloat(((count / totalVisitors) * 100).toFixed(1)) : 0,
      color: browserColors[name] || '#2563eb'
    }));

    return {
      isTableMissing: false,
      totalVisitors,
      uniqueVisitors,
      totalPageViews,
      avgDurationFormatted,
      avgDurationSeconds,
      bounceRateFormatted,
      growth,
      sparklines,
      trendLines,
      trafficSources,
      deviceBreakdown,
      topCities,
      topPages,
      recentVisits,
      sessionBars,
      durationDistribution,
      topBrowsers,
      dateRangeFormatted,
      lastUpdatedFormatted: formattedNow,
      detectedCity
    };
  } catch (err: any) {
    console.error('[Supabase Analytics Fetch Exception]:', err);
    return createEmptyWebsiteAnalytics(
      true,
      err.message || 'Terjadi kesalahan saat memuat data dari Supabase.',
      detectedCity,
      dateRangeFormatted,
      formattedNow
    );
  }
}

/**
 * Menghasilkan struktur analitik kosong (semua metrik 0) saat tabel Supabase kosong
 * atau baru dibuat, memastikan 100% data murni tanpa dummy data.
 */
function createEmptyWebsiteAnalytics(
  isTableMissing: boolean,
  errorMessage: string,
  detectedCity: string,
  dateRangeFormatted: string,
  lastUpdatedFormatted: string
): DashboardAnalyticsData {
  const trendLines: DailyTrendPoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    trendLines.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: `${d.getDate()} ${MONTH_NAMES_SHORT[d.getMonth()]}`,
      visitors: 0,
      pageViews: 0
    });
  }

  return {
    isTableMissing,
    tableErrorMessage: errorMessage,
    totalVisitors: 0,
    uniqueVisitors: 0,
    totalPageViews: 0,
    avgDurationFormatted: '0s',
    avgDurationSeconds: 0,
    bounceRateFormatted: '0,0%',
    growth: {
      totalVisitors: '0%',
      uniqueVisitors: '0%',
      totalPageViews: '0%',
      duration: '0%',
      bounceRate: '0%'
    },
    sparklines: {
      totalVisitors: [0, 0, 0, 0, 0, 0, 0],
      uniqueVisitors: [0, 0, 0, 0, 0, 0, 0],
      totalPageViews: [0, 0, 0, 0, 0, 0, 0],
      duration: [0, 0, 0, 0, 0, 0, 0],
      bounceRate: [0, 0, 0, 0, 0, 0, 0]
    },
    trendLines,
    trafficSources: [
      { name: 'Organik (Google)', percentage: 0, count: 0, color: '#1e40af' },
      { name: 'Langsung', percentage: 0, count: 0, color: '#2563eb' },
      { name: 'Media Sosial', percentage: 0, count: 0, color: '#3b82f6' },
      { name: 'Referral', percentage: 0, count: 0, color: '#60a5fa' },
      { name: 'Lainnya', percentage: 0, count: 0, color: '#93c5fd' }
    ],
    deviceBreakdown: [
      { name: 'Desktop', percentage: 0, count: 0, color: '#2563eb' },
      { name: 'Mobile', percentage: 0, count: 0, color: '#f97316' },
      { name: 'Tablet', percentage: 0, count: 0, color: '#10b981' }
    ],
    topCities: [],
    topPages: [],
    recentVisits: [],
    sessionBars: trendLines.map((t) => ({ label: t.label, sessions: 0 })),
    durationDistribution: [
      { label: '< 10s', count: 0 },
      { label: '10-30s', count: 0 },
      { label: '30s-1m', count: 0 },
      { label: '1-3m', count: 0 },
      { label: '3-5m', count: 0 },
      { label: '> 5m', count: 0 }
    ],
    topBrowsers: [
      { name: 'Google Chrome', percentage: 0, count: 0, color: '#2563eb' },
      { name: 'Safari', percentage: 0, count: 0, color: '#38bdf8' },
      { name: 'Mozilla Firefox', percentage: 0, count: 0, color: '#f97316' },
      { name: 'Microsoft Edge', percentage: 0, count: 0, color: '#0284c7' },
      { name: 'Lainnya', percentage: 0, count: 0, color: '#94a3b8' }
    ],
    dateRangeFormatted,
    lastUpdatedFormatted,
    detectedCity
  };
}
