import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Eye, 
  Clock, 
  FileText, 
  TrendingDown,
  TrendingUp,
  Share2,
  Smartphone, 
  Monitor,
  Tablet,
  MapPin, 
  Calendar, 
  ChevronDown, 
  Globe,
  Database,
  Copy,
  Check,
  Code,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  fetchWebsiteAnalyticsFromSupabase, 
  DashboardAnalyticsData,
  DailyTrendPoint
} from '../../lib/visitorTracker';

interface VisitorAnalyticsChartProps {
  onNavigateToSection?: (sectionId: string) => void;
}

const SQL_CREATE_TABLE_SCRIPT = `-- ==============================================================================
-- SKEMA PEMBUATAN TABEL: "analitik website" (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Jalankan kode ini di menu "SQL Editor" pada dashboard Supabase Anda.

CREATE TABLE IF NOT EXISTS public."analitik website" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metrik Wilayah & Geolokasi
  city TEXT NOT NULL DEFAULT 'Purwodadi',
  region TEXT DEFAULT 'Jawa Tengah',
  country TEXT NOT NULL DEFAULT 'Indonesia',
  
  -- Metrik Perangkat & Klien
  device_type TEXT NOT NULL DEFAULT 'Desktop',
  browser TEXT NOT NULL DEFAULT 'Google Chrome',
  os TEXT DEFAULT 'Windows',
  
  -- Metrik Sumber Trafik
  traffic_source TEXT NOT NULL DEFAULT 'Langsung',
  referrer TEXT DEFAULT '',
  
  -- Metrik Halaman & Aktivitas
  landing_page TEXT NOT NULL DEFAULT 'Beranda',
  current_page TEXT NOT NULL DEFAULT 'Beranda',
  pages_visited JSONB DEFAULT '["Beranda"]'::jsonb,
  page_views INTEGER NOT NULL DEFAULT 1,
  
  -- Metrik Waktu & Perilaku Kunjungan
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT TRUE,
  is_logged_in BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_analitik_created_at ON public."analitik website" (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analitik_session_id ON public."analitik website" (session_id);
CREATE INDEX IF NOT EXISTS idx_analitik_visitor_id ON public."analitik website" (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analitik_city ON public."analitik website" (city);
CREATE INDEX IF NOT EXISTS idx_analitik_device ON public."analitik website" (device_type);
CREATE INDEX IF NOT EXISTS idx_analitik_traffic ON public."analitik website" (traffic_source);
CREATE INDEX IF NOT EXISTS idx_analitik_browser ON public."analitik website" (browser);

ALTER TABLE public."analitik website" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public insert analitik website') THEN
    CREATE POLICY "Public insert analitik website" ON public."analitik website" FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public update analitik website') THEN
    CREATE POLICY "Public update analitik website" ON public."analitik website" FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public read analitik website') THEN
    CREATE POLICY "Public read analitik website" ON public."analitik website" FOR SELECT USING (true);
  END IF;
END $$;
`;

/**
 * Komponen Mini Sparkline Kurva Halus SVG untuk 5 KPI Cards
 */
const MiniSparkline: React.FC<{ 
  data: number[]; 
  color: string; 
  fillGradientId: string; 
  height?: number 
}> = ({
  data,
  color,
  fillGradientId,
  height = 42
}) => {
  const width = 220;
  const padY = 5;
  const safeData = data.length > 0 ? data : [0, 0, 0, 0, 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;

  const points = safeData.map((val, idx) => {
    const x = (idx / (safeData.length - 1 || 1)) * width;
    const y = padY + (1 - (val - min) / range) * (height - padY * 2);
    return { x, y };
  });

  if (points.length < 2) return null;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 0.22;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const areaPath = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full h-11 overflow-hidden mt-3 select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.32" />
            <stop offset="90%" stopColor={color} stopOpacity="0.03" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${fillGradientId})`} />
        <path 
          d={path} 
          fill="none" 
          stroke={color} 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </svg>
    </div>
  );
};

/**
 * Komponen Grafik Multi-Garis Tren Kunjungan (Pengunjung vs Halaman Dilihat)
 */
const MultiLineTrendChart: React.FC<{ data: DailyTrendPoint[] }> = ({ data }) => {
  const width = 450;
  const height = 180;
  const padLeft = 45;
  const padRight = 15;
  const padTop = 15;
  const padBottom = 25;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxVal = Math.max(...data.map(d => Math.max(d.visitors, d.pageViews)), 0);
  const roundedMax = maxVal === 0 ? 10 : (maxVal > 1000 ? Math.ceil(maxVal / 1000) * 1000 : Math.ceil(maxVal / 5) * 5);

  const getPoints = (key: 'visitors' | 'pageViews') => {
    return data.map((d, idx) => {
      const x = padLeft + (idx / (data.length - 1 || 1)) * chartWidth;
      const y = padTop + (1 - d[key] / roundedMax) * chartHeight;
      return { x, y, val: d[key] };
    });
  };

  const ptsVisitors = getPoints('visitors');
  const ptsPages = getPoints('pageViews');

  const makeCurvePath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let p = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    const tension = 0.2;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      p += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return p;
  };

  const pathVisitors = makeCurvePath(ptsVisitors);
  const pathPages = makeCurvePath(ptsPages);

  const areaVisitors = `${pathVisitors} L ${padLeft + chartWidth} ${padTop + chartHeight} L ${padLeft} ${padTop + chartHeight} Z`;
  const areaPages = `${pathPages} L ${padLeft + chartWidth} ${padTop + chartHeight} L ${padLeft} ${padTop + chartHeight} Z`;

  const yLabels = [roundedMax, roundedMax * 0.75, roundedMax * 0.5, roundedMax * 0.25, 0];

  return (
    <div className="w-full h-56 select-none relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradAreaVisitors" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="gradAreaPages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid Horizontal */}
        {yLabels.map((lbl, idx) => {
          const y = padTop + (idx / (yLabels.length - 1)) * chartHeight;
          return (
            <g key={idx}>
              <line 
                x1={padLeft} 
                y1={y} 
                x2={padLeft + chartWidth} 
                y2={y} 
                stroke="#f1f5f9" 
                strokeWidth="1" 
                strokeDasharray={idx === yLabels.length - 1 ? 'none' : '3 3'}
              />
              <text 
                x={padLeft - 8} 
                y={y + 3} 
                textAnchor="end" 
                fontSize="8.5" 
                fill="#94a3b8" 
                fontFamily="monospace"
              >
                {lbl.toLocaleString('id-ID')}
              </text>
            </g>
          );
        })}

        {/* Area Fills */}
        <path d={areaPages} fill="url(#gradAreaPages)" />
        <path d={areaVisitors} fill="url(#gradAreaVisitors)" />

        {/* Kurva Garis */}
        <path d={pathPages} fill="none" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" />
        <path d={pathVisitors} fill="none" stroke="#1e3a8a" strokeWidth="2.4" strokeLinecap="round" />

        {/* Titik Lingkaran Data */}
        {ptsPages.map((pt, idx) => (
          <circle key={'p-' + idx} cx={pt.x} cy={pt.y} r="3" fill="#ffffff" stroke="#60a5fa" strokeWidth="2" />
        ))}
        {ptsVisitors.map((pt, idx) => (
          <circle key={'v-' + idx} cx={pt.x} cy={pt.y} r="3" fill="#ffffff" stroke="#1e3a8a" strokeWidth="2" />
        ))}

        {/* Sumbu X (Label Tanggal) */}
        {data.map((d, idx) => {
          const x = padLeft + (idx / (data.length - 1 || 1)) * chartWidth;
          return (
            <text 
              key={'lbl-' + idx} 
              x={x} 
              y={height - 6} 
              textAnchor="middle" 
              fontSize="8.5" 
              fill="#94a3b8" 
              fontWeight="600"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export const VisitorAnalyticsChart: React.FC<VisitorAnalyticsChartProps> = () => {
  const [selectedRange, setSelectedRange] = useState<number>(30);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const data = await fetchWebsiteAnalyticsFromSupabase(selectedRange);
      setAnalytics(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('korwil_analytics_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('korwil_analytics_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedRange]);

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_CREATE_TABLE_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (isLoading || !analytics) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
        <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Menghubungkan ke tabel Supabase "analitik website"...</p>
      </div>
    );
  }

  // Perhitungan SVG Donut Chart Perangkat
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const desktopOffset = 0;
  const mobileOffset = -((analytics.deviceBreakdown[0]?.percentage / 100) * circumference);
  const tabletOffset = -(((analytics.deviceBreakdown[0]?.percentage + analytics.deviceBreakdown[1]?.percentage) / 100) * circumference);

  // Perhitungan SVG Donut Chart Sumber Trafik
  let cumulativePercent = 0;
  const trafficArcs = analytics.trafficSources.map((ts) => {
    const offset = -(cumulativePercent / 100) * circumference;
    cumulativePercent += ts.percentage;
    return {
      ...ts,
      offset,
      length: (ts.percentage / 100) * circumference
    };
  });

  // Skala Max Bar Sesi & Durasi
  const maxSession = Math.max(...analytics.sessionBars.map((b) => b.sessions), 0);
  const maxDuration = Math.max(...analytics.durationDistribution.map((d) => d.count), 0);

  return (
    <div className="space-y-5">
      {/* BANNER NOTIFIKASI AKTIVASI SUPABASE */}
      {analytics.isTableMissing && (
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Integrasi Database Supabase: Tabel</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono text-xs">analitik website</span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Dashboard telah siap merekam dan menyinkronkan seluruh kunjungan riil. Jalankan script SQL di Supabase SQL Editor untuk menghubungkan secara langsung.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={copySqlToClipboard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-blue-200 hover:border-blue-300 text-xs font-bold text-blue-800 shadow-2xs transition-all hover:bg-blue-50"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSql ? 'Tersalin!' : 'Salin Kode SQL'}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSqlModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-all"
            >
              <Code className="w-4 h-4" />
              <span>Petunjuk SQL</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. HEADER RINGKASAN KUNJUNGAN WEBSITE (DARK BLUE GRADIENT) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Ringkasan Kunjungan Website
            </h2>
            <p className="text-xs text-blue-200/80 mt-0.5 font-normal">
              Berikut adalah data statistik pengunjung dan performa website Anda dalam periode terbaru.
            </p>
          </div>
        </div>

        {/* Dropdown Rentang Waktu */}
        <div className="relative self-start sm:self-auto text-right">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-sm transition-all"
          >
            <Calendar className="w-4 h-4 text-blue-300" />
            <span>{selectedRange === 30 ? '1 - 30 September 2026' : `${selectedRange} Hari Terakhir`}</span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-300 ml-1" />
          </button>
          <div className="text-[11px] text-blue-300/70 font-normal mt-1 pr-1">
            Terakhir diperbarui: {analytics.lastUpdatedFormatted}
          </div>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setSelectedRange(days);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    selectedRange === days ? 'bg-blue-600 text-white font-bold' : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{days === 30 ? '1 - 30 September (30 Hari)' : `${days} Hari Terakhir`}</span>
                  {selectedRange === days && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. BARIS 1: 5 KARTU METRIK UTAMA (KPI CARDS - 5 KOLOM) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* KPI 1: TOTAL PENGUNJUNG */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500">Total Pengunjung</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {analytics.totalVisitors.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>{analytics.growth.totalVisitors}</span>
                <span className="text-slate-400 font-normal truncate">dari periode sebelumnya</span>
              </div>
            </div>
          </div>
          <MiniSparkline data={analytics.sparklines.totalVisitors} color="#2563eb" fillGradientId="kpiTotalVis" />
        </div>

        {/* KPI 2: PENGUNJUNG UNIK */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Eye className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500">Pengunjung Unik</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {analytics.uniqueVisitors.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>{analytics.growth.uniqueVisitors}</span>
                <span className="text-slate-400 font-normal truncate">dari periode sebelumnya</span>
              </div>
            </div>
          </div>
          <MiniSparkline data={analytics.sparklines.uniqueVisitors} color="#10b981" fillGradientId="kpiUniqVis" />
        </div>

        {/* KPI 3: TOTAL HALAMAN DILIHAT */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500">Total Halaman Dilihat</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {analytics.totalPageViews.toLocaleString('id-ID')}
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>{analytics.growth.totalPageViews}</span>
                <span className="text-slate-400 font-normal truncate">dari periode sebelumnya</span>
              </div>
            </div>
          </div>
          <MiniSparkline data={analytics.sparklines.totalPageViews} color="#8b5cf6" fillGradientId="kpiPageViews" />
        </div>

        {/* KPI 4: DURASI RATA-RATA KUNJUNGAN */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500">Durasi Rata-rata Kunjungan</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {analytics.avgDurationFormatted}
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>{analytics.growth.duration}</span>
                <span className="text-slate-400 font-normal truncate">dari periode sebelumnya</span>
              </div>
            </div>
          </div>
          <MiniSparkline data={analytics.sparklines.duration} color="#f59e0b" fillGradientId="kpiDuration" />
        </div>

        {/* KPI 5: TINGKAT PANTALAN (BOUNCE RATE) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4.5 h-4.5" />
            </div>
            <div className="space-y-0.5 flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-500">Tingkat Pantalan (Bounce Rate)</span>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {analytics.bounceRateFormatted}
              </div>
              <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                <span>{analytics.growth.bounceRate}</span>
                <span className="text-slate-400 font-normal truncate">dari periode sebelumnya</span>
              </div>
            </div>
          </div>
          <MiniSparkline data={analytics.sparklines.bounceRate} color="#f43f5e" fillGradientId="kpiBounce" />
        </div>
      </div>

      {/* 3. BARIS 2: TREN KUNJUNGAN, SUMBER TRAFIK, PERANGKAT (3 KOLOM SEIMBANG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KARTU 6: TREN KUNJUNGAN */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Tren Kunjungan</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              7 Hari Terakhir
            </span>
          </div>

          <div className="flex items-center justify-end gap-4 text-xs font-semibold pt-2 pb-1 pr-1">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]"></span>
              <span>Pengunjung</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#60a5fa]"></span>
              <span>Halaman Dilihat</span>
            </div>
          </div>

          <MultiLineTrendChart data={analytics.trendLines} />
        </div>

        {/* KARTU 7: SUMBER TRAFIK PENGUNJUNG */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Share2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Sumber Trafik Pengunjung</h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 pb-1">
            {/* SVG Donut */}
            <div className="relative w-24 h-24 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                {trafficArcs.map((arc, idx) => (
                  <circle
                    key={idx}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={arc.color}
                    strokeWidth="15"
                    strokeDasharray={`${arc.length} ${circumference}`}
                    strokeDashoffset={arc.offset}
                    className="transition-all duration-500"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {analytics.totalVisitors > 0 ? '100%' : '0'}
                </span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">
                  {analytics.totalVisitors > 0 ? 'Total Kunjungan' : 'Kunjungan'}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-1.5 text-xs flex-1 min-w-0">
              {analytics.trafficSources.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] gap-1.5">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 ml-1 font-mono shrink-0">
                    {item.percentage.toString().replace('.', ',')}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KARTU 8: PERANGKAT YANG DIGUNAKAN */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Monitor className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Perangkat yang Digunakan</h3>
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 pb-1">
            {/* SVG Donut */}
            <div className="relative w-24 h-24 sm:w-26 sm:h-26 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 select-none">
                <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#2563eb"
                  strokeWidth="15"
                  strokeDasharray={`${(analytics.deviceBreakdown[0]?.percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={desktopOffset}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="15"
                  strokeDasharray={`${(analytics.deviceBreakdown[1]?.percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={mobileOffset}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="15"
                  strokeDasharray={`${(analytics.deviceBreakdown[2]?.percentage / 100) * circumference} ${circumference}`}
                  strokeDashoffset={tabletOffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xs font-black text-slate-900 leading-tight">
                  {analytics.totalVisitors > 0 ? '100%' : '0'}
                </span>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">
                  {analytics.totalVisitors > 0 ? 'Total Pengunjung' : 'Pengunjung'}
                </span>
              </div>
            </div>

            {/* Legend with Icons & Progress Lines */}
            <div className="space-y-2 text-xs flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Monitor className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Desktop</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {analytics.deviceBreakdown[0]?.percentage.toString().replace('.', ',')}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${analytics.deviceBreakdown[0]?.percentage}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Mobile</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {analytics.deviceBreakdown[1]?.percentage.toString().replace('.', ',')}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${analytics.deviceBreakdown[1]?.percentage}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Tablet className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Tablet</span>
                  </span>
                  <span className="font-bold text-slate-900 font-mono">
                    {analytics.deviceBreakdown[2]?.percentage.toString().replace('.', ',')}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${analytics.deviceBreakdown[2]?.percentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BARIS 3: LOKASI PENGUNJUNG, HALAMAN TERBANYAK, KUNJUNGAN TERBARU (3 KOLOM SEIMBANG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KARTU 9: LOKASI PENGUNJUNG */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Lokasi Pengunjung</h3>
            </div>
            <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span>Indonesia</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </span>
          </div>

          <div className="flex items-center gap-3 pt-3">
            {/* Siluet Vektor Peta Indonesia */}
            <div className="w-5/12 h-32 flex items-center justify-center bg-blue-50/50 rounded-xl p-2 shrink-0 border border-blue-100/70">
              <svg viewBox="0 0 180 90" className="w-full h-auto select-none" fill="none">
                {/* Sumatera */}
                <path d="M 10 22 Q 22 32 42 55 L 36 63 Q 18 40 8 26 Z" fill="#93c5fd" />
                {/* Jawa (Highlighted Royal Blue) */}
                <path d="M 48 68 Q 78 66 106 69 Q 102 74 46 74 Z" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                {/* Kalimantan */}
                <path d="M 62 20 Q 88 16 94 38 Q 80 54 60 45 Z" fill="#bfdbfe" />
                {/* Sulawesi */}
                <path d="M 106 26 Q 120 20 115 39 Q 124 52 110 54 Z" fill="#bfdbfe" />
                {/* Papua */}
                <path d="M 138 32 Q 168 34 172 52 Q 155 56 135 48 Z" fill="#bfdbfe" />
              </svg>
            </div>

            {/* Kota Teratas */}
            <div className="w-7/12 space-y-1.5 min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight pb-0.5">
                Kota Teratas
              </div>
              {analytics.topCities.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Belum ada data lokasi tercatat.
                </div>
              ) : (
                analytics.topCities.slice(0, 5).map((city, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-slate-400 text-[11px] w-3.5 shrink-0">{idx + 1}.</span>
                    <span className="font-medium text-slate-700 truncate flex-1 min-w-0 text-[11.5px]">{city.name}</span>
                    <span className="font-bold text-slate-600 font-mono text-[11px] shrink-0 text-right w-10">
                      {city.count.toLocaleString('id-ID')}
                    </span>
                    <div className="w-12 bg-slate-100 h-2 rounded-full overflow-hidden shrink-0">
                      <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${Math.min(100, Math.max(8, (city.count / (analytics.topCities[0]?.count || 1)) * 100))}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* KARTU 10: HALAMAN PALING BANYAK DIKUNJUNGI */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Halaman Paling Banyak Dikunjungi</h3>
          </div>

          <div className="pt-2 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-[10.5px] uppercase border-b border-slate-100">
                  <th className="pb-2 text-left font-bold w-5">#</th>
                  <th className="pb-2 text-left font-bold">Halaman</th>
                  <th className="pb-2 text-right font-bold w-20">Jumlah Dilihat</th>
                  <th className="pb-2 text-right font-bold w-24">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {analytics.topPages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                      Belum ada data kunjungan halaman tercatat.
                    </td>
                  </tr>
                ) : (
                  analytics.topPages.slice(0, 5).map((page, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 font-medium text-slate-800">{page.name}</td>
                      <td className="py-2 text-right font-bold text-slate-600 font-mono">
                        {page.count.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold text-slate-700 font-mono text-[11px]">
                            {page.percentage.toString().replace('.', ',')}%
                          </span>
                          <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full" 
                              style={{ width: `${page.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* KARTU 11: KUNJUNGAN TERBARU */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Kunjungan Terbaru</h3>
            </div>
            <button 
              type="button" 
              onClick={() => loadData()}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Refresh</span>
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="pt-2 overflow-x-auto">
            {analytics.recentVisits.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada aktivitas kunjungan terbaru yang tercatat.
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-slate-400 text-[10.5px] uppercase border-b border-slate-100">
                    <th className="pb-2 text-left font-bold">Waktu</th>
                    <th className="pb-2 text-left font-bold">Lokasi</th>
                    <th className="pb-2 text-left font-bold">Perangkat</th>
                    <th className="pb-2 text-right font-bold">Halaman</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {analytics.recentVisits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 text-slate-500 font-medium whitespace-nowrap text-[11px]">
                        {visit.timeFormatted}
                      </td>
                      <td className="py-2 text-slate-800 font-semibold flex items-center gap-1 truncate max-w-[85px]">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{visit.city}</span>
                      </td>
                      <td className="py-2 text-slate-600 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          {visit.device === 'Mobile' ? (
                            <Smartphone className="w-3 h-3 text-orange-500 shrink-0" />
                          ) : visit.device === 'Tablet' ? (
                            <Tablet className="w-3 h-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Monitor className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                          <span>{visit.device}</span>
                        </span>
                      </td>
                      <td className="py-2 text-right font-semibold text-slate-700 truncate max-w-[80px]">
                        {visit.page}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 5. BARIS 4: SESI PENGUNJUNG, DURASI KUNJUNGAN, BROWSER TERPOPULER (3 KOLOM SEIMBANG) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* KARTU 12: SESI PENGUNJUNG */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Sesi Pengunjung</h3>
          </div>

          <div className="pt-3">
            <div className="flex items-end justify-between gap-2 h-36 w-full px-2">
              {analytics.sessionBars.map((bar, idx) => {
                const heightPercent = bar.sessions > 0 && maxSession > 0
                  ? Math.min(100, Math.max(10, Math.round((bar.sessions / maxSession) * 100)))
                  : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20 pointer-events-none">
                      {bar.sessions.toLocaleString('id-ID')} sesi
                    </div>
                    <div className="w-full bg-slate-50 rounded-t-md h-28 flex items-end">
                      <div 
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-t-md transition-all duration-300 shadow-2xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-400 truncate w-full text-center">
                      {bar.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KARTU 13: DURASI KUNJUNGAN */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Durasi Kunjungan</h3>
          </div>

          <div className="pt-3">
            <div className="flex items-end justify-between gap-2 h-36 w-full px-2">
              {analytics.durationDistribution.map((dur, idx) => {
                const heightPercent = dur.count > 0 && maxDuration > 0
                  ? Math.min(100, Math.max(10, Math.round((dur.count / maxDuration) * 100)))
                  : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                    <div className="absolute -top-7 hidden group-hover:flex bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20 pointer-events-none">
                      {dur.count.toLocaleString('id-ID')} kunjungan
                    </div>
                    <div className="w-full bg-purple-50/50 rounded-t-md h-28 flex items-end">
                      <div 
                        className="w-full bg-purple-400 hover:bg-purple-500 rounded-t-md transition-all duration-300 shadow-2xs"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 truncate w-full text-center">
                      {dur.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* KARTU 14: PERAMBAN (BROWSER) TERPOPULER */}
        <div className="w-full bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Peramban (Browser) Terpopuler</h3>
          </div>

          <div className="space-y-2.5 pt-3">
            {analytics.topBrowsers.map((b, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-slate-800 w-28 truncate shrink-0">{b.name}</span>
                <span className="font-bold text-slate-600 text-right w-12 font-mono text-[11px] shrink-0">
                  {b.percentage.toString().replace('.', ',')}%
                </span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${b.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL KODE PEMBUATAN TABEL SUPABASE */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Kode SQL Tabel "analitik website" Supabase</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSqlModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3.5 rounded-xl space-y-1">
                <p className="font-bold">Langkah Pembuatan Tabel di Supabase:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
                  <li>Buka browser dan login ke dashboard <strong>Supabase</strong> Anda.</li>
                  <li>Buka project Anda dan pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
                  <li>Klik <strong>New Query</strong>, tempelkan kode di bawah ini, lalu klik tombol <strong>Run</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed max-h-72">
                  {SQL_CREATE_TABLE_SCRIPT}
                </pre>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 font-bold text-xs rounded-xl text-slate-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
