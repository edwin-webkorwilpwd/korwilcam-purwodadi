import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Download, 
  Clock, 
  HardDriveDownload, 
  FileText, 
  FileSpreadsheet, 
  Check, 
  Copy, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle, 
  FileCheck,
  Info
} from 'lucide-react';
import { triggerDocumentDownload } from '../lib/documentHelper';

export const DocumentDetailPage: React.FC = () => {
  const { 
    selectedDocument, 
    setSelectedDocument, 
    setActiveTab, 
    showToast,
    incrementDocumentDownloadCount 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Scroll ke paling atas saat halaman detail berkas dibuka
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDocument?.id]);

  if (!selectedDocument) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Dokumen Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Berkas atau formulir yang Anda cari mungkin telah dipindahkan, diperbarui, atau tautan yang dimasukkan keliru.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDocument(null);
            setActiveTab('downloads', '/layanan/unduh-berkas');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pusat Unduhan</span>
        </button>
      </div>
    );
  }

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    showToast(`Memulai proses pengunduhan: ${selectedDocument.title}`, 'success');
    try {
      triggerDocumentDownload(selectedDocument);
      await incrementDocumentDownloadCount(selectedDocument.id);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      showToast('Tautan alamat berkas berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getFileIcon = (fileType: string, className = "w-10 h-10") => {
    switch (fileType) {
      case 'PDF':
        return <FileText className={`${className} text-rose-500`} />;
      case 'XLSX':
        return <FileSpreadsheet className={`${className} text-emerald-500`} />;
      default:
        return <FileText className={`${className} text-blue-500`} />;
    }
  };

  return (
    <div className="space-y-8 pb-20 bg-slate-50 min-h-screen">
      {/* Top Banner Header */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-12 px-4 sm:px-8 lg:px-12 xl:px-16 border-b border-blue-900/40">
        <div className="w-full space-y-5">
          
          {/* Back Button & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            <button
              onClick={() => {
                setSelectedDocument(null);
                setActiveTab('downloads', '/layanan/unduh-berkas');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Pusat Unduhan</span>
            </button>

            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <span 
                onClick={() => {
                  setSelectedDocument(null);
                  setActiveTab('home', '/beranda');
                }}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Beranda
              </span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span 
                onClick={() => {
                  setSelectedDocument(null);
                  setActiveTab('downloads', '/layanan/unduh-berkas');
                }}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Unduh Berkas
              </span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
              <span className="text-blue-300 font-bold truncate max-w-[200px] sm:max-w-xs">
                {selectedDocument.category}
              </span>
            </nav>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-blue-500 text-white shadow-sm">
              {selectedDocument.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/15 text-slate-200 border border-white/10">
              {selectedDocument.fileType} • {selectedDocument.fileSize}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Rilis: {selectedDocument.date}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 ml-auto sm:ml-0">
              <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedDocument.downloadCount} kali diunduh</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-snug tracking-tight">
            {selectedDocument.title}
          </h1>
        </div>
      </section>

      {/* Main Content Body: Berkas Unduhan & Deskripsi Saja (Full Screen Width) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
        
        {/* 1. KOTAK BERKAS UNDUHAN */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-blue-200/80 shadow-xl shadow-blue-900/5 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            {/* Info Berkas */}
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm shrink-0">
                {getFileIcon(selectedDocument.fileType, "w-12 h-12")}
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Berkas Terverifikasi & Resmi</span>
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  {selectedDocument.title}
                </h3>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3 pt-1 font-mono">
                  <span>Format: <strong className="text-slate-700">{selectedDocument.fileType}</strong></span>
                  <span>•</span>
                  <span>Ukuran: <strong className="text-slate-700">{selectedDocument.fileSize}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600">Siap Diunduh</strong></span>
                </p>
              </div>
            </div>

            {/* Tombol Unduh Berkas Utama */}
            <div className="flex items-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              <button
                type="button"
                onClick={handleDownloadClick}
                disabled={isDownloading}
                className="w-full md:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all disabled:opacity-75 disabled:pointer-events-none cursor-pointer"
              >
                <Download className={`w-5 h-5 ${isDownloading ? 'animate-bounce' : ''}`} />
                <span>{isDownloading ? 'Mengunduh Berkas...' : 'Unduh Berkas Sekarang'}</span>
              </button>
            </div>

          </div>

          {/* Quick Notice under button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Format dokumen kompatibel dengan PC, laptop, dan perangkat mobile</span>
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan Dokumen'}</span>
            </button>
          </div>

        </div>

        {/* 2. KOTAK DESKRIPSI & KETERANGAN DOKUMEN SAJA */}
        <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-bold text-base pb-3 border-b border-slate-100">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Deskripsi & Keterangan Dokumen</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {selectedDocument.description || 'Tidak ada deskripsi tambahan untuk berkas ini. Silakan unduh dokumen untuk melihat isi dan format selengkapnya.'}
          </p>
        </div>

      </section>
    </div>
  );
};
