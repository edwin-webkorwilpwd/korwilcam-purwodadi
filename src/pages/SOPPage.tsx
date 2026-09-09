import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileCheck2, 
  Maximize2, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  X, 
  Clock, 
  Building2, 
  HelpCircle, 
  CheckCircle2,
  Share2,
  Info
} from 'lucide-react';
import { isGoogleDriveUrl, getGoogleDriveViewUrl } from '../lib/driveHelper';

export const SOPPage: React.FC = () => {
  const { sopImageUrl, setActiveTab, showToast } = useApp();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageError, setImageError] = useState(false);

  const isGdrive = isGoogleDriveUrl(sopImageUrl);
  const driveViewUrl = isGdrive ? getGoogleDriveViewUrl(sopImageUrl) : sopImageUrl;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tautan laman SOP Pelayanan berhasil disalin!', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-300 mb-3">
            <button 
              onClick={() => setActiveTab('home', '/beranda')} 
              className="hover:text-white transition-colors"
            >
              Beranda
            </button>
            <span>/</span>
            <span className="text-white font-bold">SOP Pelayanan</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
                <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Standar Operasional Prosedur (SOP)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Bagan Alur & SOP Pelayanan Pendidikan
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Pedoman resmi mekanisme alur pelayanan prima, administrasi kepegawaian, serta konsultasi pendidikan di lingkungan Kantor Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
              </p>
            </div>

            {/* Quick Action Button */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all"
                title="Bagikan tautan SOP ini"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-300" />
                <span>Bagikan</span>
              </button>

              {sopImageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setIsLightboxOpen(true);
                    setZoomLevel(1);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Lihat Ukuran Penuh</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Action Bar & Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  Diagram Alur Prosedur Pelayanan
                </h2>
                <p className="text-xs text-slate-500">
                  Pastikan membaca alur tahapan secara seksama sebelum mengajukan berkas ke kantor
                </p>
              </div>
            </div>
          </div>

          {/* SOP Image Viewer (Gambar Utuh) */}
          {sopImageUrl ? (
            <div className="space-y-4">
              <div className="relative group bg-slate-900/5 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center overflow-hidden min-h-[300px]">
                {imageError ? (
                  <div className="py-12 px-4 text-center max-w-md space-y-3">
                    <Info className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Gambar Belum Dapat Ditampilkan
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tautan Google Drive mungkin belum diatur untuk publik atau format file tidak sesuai. Pastikan akses file di Google Drive diset menjadi <strong className="text-slate-700">"Siapa saja yang memiliki link"</strong> (Anyone with link).
                    </p>
                    {isGdrive && driveViewUrl && (
                      <a
                        href={driveViewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors mt-2"
                      >
                        <span>Buka Langsung di Google Drive</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ) : (
                  <>
                    <img
                      src={sopImageUrl}
                      alt="Bagan Alur SOP Pelayanan Korwilcam Purwodadi"
                      className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-sm transition-transform duration-200 cursor-zoom-in"
                      onClick={() => {
                        setIsLightboxOpen(true);
                        setZoomLevel(1);
                      }}
                      onError={() => setImageError(true)}
                    />
                    
                    {/* Hover Overlay Helper */}
                    <div 
                      onClick={() => {
                        setIsLightboxOpen(true);
                        setZoomLevel(1);
                      }}
                      className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl"
                    >
                      <div className="px-4 py-2 rounded-full bg-slate-900/80 text-white text-xs font-bold backdrop-blur-sm flex items-center gap-2 shadow-lg">
                        <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Klik untuk Memperbesar Gambar Penuh</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gambar ditampilkan utuh sesuai dokumen bagan resmi</span>
                </span>
                <span>
                  Tip: Klik gambar untuk membaca teks kecil dengan jelas
                </span>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="py-16 px-4 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                <FileCheck2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Bagan Alur SOP Sedang Diperbarui
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Administrator sedang mengunggah bagan alur Standar Operasional Prosedur Pelayanan terbaru. Silakan hubungi meja pelayanan kantor untuk informasi layanan lebih lanjut.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('contact', '/kontak')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Hubungi Kontak Layanan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('downloads', '/layanan/unduh-berkas')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                >
                  Layanan Unduh Berkas
                </button>
              </div>
            </div>
          )}

          {/* Institutional Service Details Grid */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Jam Layanan Kantor</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Senin - Kamis: 07.30 - 15.30 WIB<br />
                Jumat: 07.30 - 14.00 WIB<br />
                Sabtu, Minggu & Libur Nasional: Tutup
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Lokasi Pelayanan</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Ruang Tata Usaha & Pelayanan Terpadu<br />
                Kantor Korwilcam Bidang Pendidikan Purwodadi, Kab. Grobogan
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-slate-900">Pengaduan & Bantuan</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Jika terdapat kendala atau pertanyaan seputar prosedur, sampaikan melalui formulir pengaduan online atau WhatsApp resmi.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Lightbox Modal (Zoom & Fullscreen) */}
      {isLightboxOpen && sopImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Top Control Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-400" />
              <span className="text-xs sm:text-sm font-bold truncate">
                Pratinjau Bagan Alur SOP Pelayanan
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1 border border-white/15">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={zoomLevel <= 0.5}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono px-2 font-bold min-w-[3rem] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={zoomLevel >= 3}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white disabled:opacity-40 transition-colors"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors ml-1"
                  title="Reset Ukuran (100%)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors border border-white/20"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Image Container */}
          <div className="flex-1 w-full max-w-6xl flex items-center justify-center overflow-auto p-2">
            <img
              src={sopImageUrl}
              alt="Bagan SOP Pelayanan Penuh"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-150 select-none"
            />
          </div>

          {/* Bottom Hint */}
          <div className="text-center pt-2 text-slate-400 text-xs">
            Gunakan kontrol di atas untuk memperbesar diagram alur agar tulisan terbaca jelas.
          </div>
        </div>
      )}
    </div>
  );
};
