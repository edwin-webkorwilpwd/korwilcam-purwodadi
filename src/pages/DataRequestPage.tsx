import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  RotateCw, 
  Home 
} from 'lucide-react';
import { 
  getDataRequestSlug, 
  getDataRequestPath 
} from '../lib/dataRequestHelper';

export const DataRequestPage: React.FC = () => {
  const { 
    dataRequests, 
    setActiveTab, 
    selectedDataRequestSlug, 
    setSelectedDataRequestSlug 
  } = useApp();

  // Ambil hanya tautan yang berstatus aktif
  const activeRequests = (dataRequests || []).filter((r) => r.isActive !== false);

  // Helper pencocokan berdasarkan ID atau Slug
  const findRequestBySlugOrId = (identifier: string | null | undefined) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return activeRequests.find((r) =>
      r.id.toLowerCase() === clean ||
      (r.slug && r.slug.toLowerCase() === clean) ||
      getDataRequestSlug(r).toLowerCase() === clean ||
      r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === clean
    );
  };

  // State untuk melacak ID tautan yang sedang aktif dipilih pengunjung
  const [selectedId, setSelectedId] = useState<string>(() => {
    // 1. Cek dari context jika ada selectedDataRequestSlug
    if (selectedDataRequestSlug) {
      const match = findRequestBySlugOrId(selectedDataRequestSlug);
      if (match) return match.id;
    }
    // 2. Cek dari window.location.pathname jika ada slug di URL
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      if (path.startsWith('/layanan/permintaan-data/') || path.startsWith('/permintaan-data/')) {
        const slug = decodeURIComponent(
          path.replace(/^\/layanan\/permintaan-data\//, '').replace(/^\/permintaan-data\//, '')
        ).trim();
        const match = findRequestBySlugOrId(slug);
        if (match) return match.id;
      }
    }
    return activeRequests[0]?.id || '';
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sinkronisasi saat selectedDataRequestSlug dari AppContext berubah (misal tombol Back/Forward browser)
  useEffect(() => {
    if (selectedDataRequestSlug && activeRequests.length > 0) {
      const match = findRequestBySlugOrId(selectedDataRequestSlug);
      if (match && match.id !== selectedId) {
        setSelectedId(match.id);
        setIsLoading(true);
      }
    }
  }, [selectedDataRequestSlug, activeRequests]);

  // Jika daftar tautan berubah dan tautan terpilih sudah tidak ada, sesuaikan ke yang pertama
  useEffect(() => {
    if (activeRequests.length > 0) {
      if (!selectedId || !activeRequests.some((r) => r.id === selectedId)) {
        setSelectedId(activeRequests[0].id);
      }
    }
  }, [activeRequests, selectedId]);

  const currentRequest = activeRequests.find((r) => r.id === selectedId) || activeRequests[0];

  // Efek loading setiap kali URL aktif berubah atau di-reload
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500); // Safety fallback jika sinyal onLoad iframe terhalang CORS/kebijakan situs eksternal
    return () => clearTimeout(timer);
  }, [currentRequest?.url, iframeKey]);

  // Sinkronisasi judul halaman & ALAMAT WEBSITE (URL Browser) otomatis dengan SLUG formulir aktif
  useEffect(() => {
    if (currentRequest) {
      const slug = currentRequest.slug || getDataRequestSlug(currentRequest);
      const targetPath = `/layanan/permintaan-data/${encodeURIComponent(slug)}`;
      const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '');
      
      // Update alamat URL di address bar browser secara langsung
      if (currentPath !== targetPath.toLowerCase()) {
        window.history.replaceState({ tab: 'service-permintaan-data', path: targetPath }, '', targetPath);
      }
      document.title = `${currentRequest.title} - Formulir Permintaan Data Korwilcam Purwodadi`;
    }
  }, [currentRequest]);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  // Pilih formulir baru: perbarui state, URL browser, dan slug
  const handleSelectRequest = (req: typeof activeRequests[0]) => {
    if (req.id === selectedId) return;
    setSelectedId(req.id);
    setIsLoading(true);
    const slug = req.slug || getDataRequestSlug(req);
    setSelectedDataRequestSlug(slug);
    const targetPath = `/layanan/permintaan-data/${encodeURIComponent(slug)}`;
    window.history.pushState({ tab: 'service-permintaan-data', path: targetPath }, '', targetPath);
    document.title = `${req.title} - Formulir Permintaan Data Korwilcam Purwodadi`;
  };

  // 1. Tampilan jika belum ada link yang aktif / dikonfigurasi
  if (!activeRequests || activeRequests.length === 0 || !currentRequest) {
    return (
      <div className="flex-1 w-full min-h-[70vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100/80 shadow-sm">
            <Settings className="w-8 h-8 animate-spin text-blue-600" style={{ animationDuration: '5s' }} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Layanan Permintaan Data
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            Saat ini belum ada tautan formulir permintaan data yang dibuat oleh Admin
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => setActiveTab('home', '/beranda')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Home className="w-4 h-4" />
              Kembali ke Beranda
            </button>
            <button
              onClick={() => setActiveTab('contact', '/kontak')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              Kontak Layanan
            </button>
          </div>
        </div>
      </div>
    );
  }

  const cropTop = currentRequest.cropTop || 0;

  return (
    <div className="w-full h-full flex-1 flex flex-col relative overflow-hidden bg-white">
      {/* Top Header / Clean Bar: Tampilan Bersih dengan Tombol Refresh di Paling Kanan */}
      <header className="bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white border-b border-white/20 px-4 sm:px-6 py-2.5 shrink-0 z-20 shadow-md">
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* Sisi Kiri: Judul Formulir (Tampilan Bersih & Minimalis) */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white truncate leading-tight drop-shadow-sm">
              {currentRequest.title}
            </h1>
          </div>

          {/* Sisi Kanan: Tab Switcher (jika > 1 formulir) & Tombol Refresh di Paling Kanan Sendiri */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {/* Multi-link selector pills jika terdapat lebih dari 1 formulir */}
            {activeRequests.length > 1 && (
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/20 overflow-x-auto max-w-xs sm:max-w-md no-scrollbar backdrop-blur-sm">
                {activeRequests.map((req) => {
                  const isSelected = req.id === currentRequest.id;
                  return (
                    <button
                      key={req.id}
                      type="button"
                      onClick={() => handleSelectRequest(req)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-white text-[#1b56ce] shadow-sm font-bold'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                      title={req.title}
                    >
                      <span>{req.title.length > 22 ? `${req.title.substring(0, 20)}...` : req.title}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Tombol Refresh Berada di Sebelah Paling Kanan Sendiri */}
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold border border-white/30 transition-all shadow-sm backdrop-blur-sm"
              title="Muat Ulang Halaman Webview"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-white' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Webview Frame Container */}
      <div className="w-full h-full flex-1 relative overflow-hidden bg-white">
        {/* Loading Spinner Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/95 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 text-slate-800">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs sm:text-sm text-slate-700 font-semibold animate-pulse">
              Memuat {currentRequest.title}...
            </p>
          </div>
        )}

        {/* Embedded Iframe */}
        <iframe
          key={`${currentRequest.id}-${iframeKey}`}
          ref={iframeRef}
          src={currentRequest.url}
          title={currentRequest.title}
          onLoad={() => setIsLoading(false)}
          style={
            cropTop > 0
              ? {
                  position: 'absolute',
                  top: `-${cropTop}px`,
                  left: 0,
                  width: '100%',
                  height: `calc(100% + ${cropTop}px)`,
                  border: 'none',
                  backgroundColor: '#ffffff'
                }
              : {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#ffffff'
                }
          }
          className="w-full h-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};

export default DataRequestPage;
