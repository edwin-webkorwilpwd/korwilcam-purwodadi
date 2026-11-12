/**
 * Utilitas Analisis & Pelacak Kunjungan Website Korwilcam Purwodadi
 * STATUS: DINONAKTIFKAN (DISCONNECTED)
 * Koneksi ke tabel Supabase "analitik website" telah diputus 100% untuk menghemat egress.
 */

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

const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTH_NAMES_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function formatDurationToMinsSecs(totalSecs: number): string {
  if (totalSecs < 60) return `${totalSecs}s`;
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

export function detectDeviceType(): 'Desktop' | 'Mobile' | 'Tablet' {
  if (typeof window === 'undefined') return 'Desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return 'Tablet';
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds)/.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

export function detectBrowser(): string {
  if (typeof window === 'undefined') return 'Google Chrome';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
  if (ua.includes('Chrome') && !ua.includes('Chromium')) return 'Google Chrome';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Firefox')) return 'Mozilla Firefox';
  return 'Google Chrome';
}

export function detectOS(): string {
  if (typeof window === 'undefined') return 'Windows';
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Windows';
}

export function detectTrafficSource(): string {
  if (typeof document === 'undefined') return 'Langsung';
  const ref = document.referrer;
  if (!ref) return 'Langsung';
  try {
    const url = new URL(ref);
    const host = url.hostname.toLowerCase();
    if (host.includes('google.') || host.includes('bing.') || host.includes('yahoo.')) {
      return 'Organik (Google)';
    }
    if (host.includes('facebook.') || host.includes('instagram.') || host.includes('t.co') || host.includes('whatsapp') || host.includes('tiktok.')) {
      return 'Media Sosial';
    }
    if (host.includes(window.location.hostname)) {
      return 'Langsung';
    }
    return 'Referral';
  } catch {
    return 'Langsung';
  }
}

export function getFriendlyPageName(tabId?: string): string {
  if (!tabId || tabId === 'home') return 'Beranda';
  if (tabId === 'profil') return 'Profil Korwilcam';
  if (tabId === 'sop-pelayanan') return 'SOP Pelayanan';
  if (tabId === 'sekolah') return 'Direktori Sekolah';
  if (tabId === 'nominatif-pendidik') return 'Nominatif Pendidik';
  if (tabId === 'berita') return 'Warta & Berita';
  if (tabId === 'prestasi') return 'Prestasi';
  if (tabId === 'organisasi') return 'Organisasi';
  if (tabId === 'unduhan') return 'Unduhan Berkas';
  if (tabId === 'kontak') return 'Kontak & Aspirasi';
  if (tabId.startsWith('admin')) return 'Portal Administrator';
  return tabId;
}

export function cleanAndNormalizeCity(rawCity: string, _rawRegion?: string): string {
  return rawCity || 'Purwodadi';
}

export async function detectVisitorLocation(): Promise<string> {
  return 'Purwodadi';
}

/**
 * Inisialisasi pelacak pengunjung real-time (DINONAKTIFKAN).
 * Dinonaktifkan 100% untuk menghemat egress Supabase.
 */
export function initVisitorTracker(_currentTab: string = 'home'): void {
  // Dinonaktifkan: tidak melakukan tracking, koneksi, maupun ping ke database
  return;
}

/**
 * Mencatat penambahan tayangan halaman (Pageview) (DINONAKTIFKAN).
 * Dinonaktifkan 100% untuk menghemat egress Supabase.
 */
export async function recordPageView(_newTabId: string = 'home'): Promise<void> {
  // Dinonaktifkan: tidak melakukan tracking, koneksi, maupun ping ke database
  return;
}

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
      { name: 'Referral', percentage: 0, count: 0, color: '#60a5fa' }
    ],
    deviceBreakdown: [
      { name: 'Desktop', percentage: 0, count: 0, color: '#1e3a8a' },
      { name: 'Mobile', percentage: 0, count: 0, color: '#3b82f6' },
      { name: 'Tablet', percentage: 0, count: 0, color: '#60a5fa' }
    ],
    topCities: [{ name: 'Purwodadi', count: 0, percentage: 0 }],
    topPages: [{ name: 'Beranda', count: 0, percentage: 0 }],
    recentVisits: [],
    sessionBars: trendLines.map((tl) => ({ label: tl.label, sessions: 0 })),
    durationDistribution: [
      { label: '< 15 dtk', count: 0 },
      { label: '15-60 dtk', count: 0 },
      { label: '1-3 mnt', count: 0 },
      { label: '> 3 mnt', count: 0 }
    ],
    topBrowsers: [
      { name: 'Google Chrome', percentage: 0, count: 0, color: '#2563eb' }
    ],
    dateRangeFormatted,
    lastUpdatedFormatted,
    detectedCity
  };
}

/**
 * Mengambil dan mengagregasikan data statistik (DINONAKTIFKAN).
 * Koneksi ke tabel Supabase "analitik website" diputus 100%.
 */
export async function fetchWebsiteAnalyticsFromSupabase(_rangeDays: number = 30): Promise<DashboardAnalyticsData> {
  const detectedCity = 'Purwodadi';
  const now = new Date();
  const formattedNow = `${now.getDate()} ${MONTH_NAMES_SHORT[now.getMonth()]} ${now.getFullYear()} ${String(
    now.getHours()
  ).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
  const dateRangeFormatted = `${now.getDate()} ${MONTH_NAMES_FULL[now.getMonth()]} ${now.getFullYear()}`;

  return createEmptyWebsiteAnalytics(
    false,
    'Fungsi analitik website telah dinonaktifkan.',
    detectedCity,
    dateRangeFormatted,
    formattedNow
  );
}
