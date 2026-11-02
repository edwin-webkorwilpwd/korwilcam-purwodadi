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
  RefreshCw,
  MoreVertical,
  Download
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
 * Komponen Wave Sparkline Halus SVG untuk 3 Hero Cards (Sesuai Desain Gambar 2)
 */
const HeroWaveSparkline: React.FC<{ 
  data: number[]; 
  color: string; 
  fillGradientId: string;
}> = ({ data, color, fillGradientId }) => {
  const width = 160;
  const height = 65;
  const safeData = data.length > 0 ? data : [12, 18, 14, 25, 20, 32, 28];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const range = max - min || 1;

  const points = safeData.map((val, idx) => {
    const x = (idx / (safeData.length - 1 || 1)) * width;
    const y = 8 + (1 - (val - min) / range) * (height - 18);
    return { x, y };
  });

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  const tension = 0.25;
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
    <div className="w-32 h-16 overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${fillGradientId})`} />
        <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

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

      {/* ==============================================================================
          ROW 1: 3 LARGE HERO CARDS (Today's Sale, Total Sales, Total Orders)
          Sesuai Struktur Gambar 2
         ============================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Today's Sale -> Total Pengunjung */}
        <div className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-[30px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Total Pengunjung</span>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {analytics.totalVisitors.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mt-2">
                <span>↑</span>
                <span>+36%</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
            </div>
            <HeroWaveSparkline data={analytics.sparklines.totalVisitors} color="#10b981" fillGradientId="heroGreen1" />
          </div>
        </div>

        {/* CARD 2: Total Sales -> Total Halaman Dilihat */}
        <div className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-[30px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Total Halaman Dilihat</span>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {analytics.totalPageViews.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 mt-2">
                <span>↓</span>
                <span>-14%</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
            </div>
            <HeroWaveSparkline data={analytics.sparklines.totalPageViews} color="#f43f5e" fillGradientId="heroRed1" />
          </div>
        </div>

        {/* CARD 3: Total Orders -> Pengunjung Unik */}
        <div className="bg-white/65 backdrop-blur-2xl border border-white/80 rounded-[30px] p-6 shadow-[0_15px_35px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold text-slate-600">Pengunjung Unik</span>
            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100/50 transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div>
              <div className="text-4xl font-extrabold text-slate-800 tracking-tight">
                {analytics.uniqueVisitors.toLocaleString('id-ID')}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500 mt-2">
                <span>↑</span>
                <span>+36%</span>
                <span className="text-slate-400 font-normal">vs bulan lalu</span>
              </div>
            </div>
            <HeroWaveSparkline data={analytics.sparklines.uniqueVisitors} color="#10b981" fillGradientId="heroGreen2" />
          </div>
        </div>
      </div>

      {/* MODAL KODE PEMBUATAN TABEL SUPABASE */}
      {isSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full border border-white/80 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">Kode SQL Tabel "analitik website" Supabase</h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsSqlModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200/60 text-slate-500 flex items-center justify-center text-sm font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              <div className="bg-blue-50/70 border border-blue-200/60 text-blue-900 p-4 rounded-2xl space-y-1">
                <p className="font-bold">Langkah Pembuatan Tabel di Supabase:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-blue-800">
                  <li>Buka browser dan login ke dashboard <strong>Supabase</strong> Anda.</li>
                  <li>Buka project Anda dan pilih menu <strong>SQL Editor</strong> di bilah navigasi kiri.</li>
                  <li>Klik <strong>New Query</strong>, tempelkan kode di bawah ini, lalu klik tombol <strong>Run</strong>.</li>
                </ol>
              </div>

              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed max-h-72 border border-slate-800">
                  {SQL_CREATE_TABLE_SCRIPT}
                </pre>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="absolute top-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsSqlModalOpen(false)}
                className="px-5 py-2.5 bg-slate-200/80 hover:bg-slate-300 font-bold text-xs rounded-xl text-slate-700 transition-colors"
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
