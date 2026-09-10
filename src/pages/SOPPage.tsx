import React, { useState, useEffect, useMemo } from 'react';
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
  Info,
  Eye
} from 'lucide-react';
import { 
  isGoogleDriveUrl, 
  getGoogleDriveViewUrl, 
  extractGoogleDriveId,
  getGoogleDrivePreviewUrl
} from '../lib/driveHelper';

export const SOPPage: React.FC = () => {
  const { sopImageUrl, setActiveTab, showToast, officeProfile } = useApp();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [useIframeMode, setUseIframeMode] = useState(false);

  const driveId = extractGoogleDriveId(sopImageUrl);
  const isGdrive = isGoogleDriveUrl(sopImageUrl) || !!driveId;
  const driveViewUrl = isGdrive ? getGoogleDriveViewUrl(sopImageUrl) : sopImageUrl;
  const drivePreviewUrl = driveId ? getGoogleDrivePreviewUrl(sopImageUrl) : '';

  // Multi-tier fallback URLs untuk gambar Google Drive
  const candidateUrls = useMemo(() => {
    if (!sopImageUrl) return [];
    if (!driveId) return [sopImageUrl];

    return [
      `https://lh3.googleusercontent.com/d/${driveId}`,
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w2500`,
      `https://drive.google.com/uc?export=view&id=${driveId}`,
      sopImageUrl
    ].filter((v, i, a) => a.indexOf(v) === i);
  }, [sopImageUrl, driveId]);

  const [urlIndex, setUrlIndex] = useState(0);

  // Reset state jika URL SOP berubah
  useEffect(() => {
    setUrlIndex(0);
    setImageError(false);
    setUseIframeMode(false);
  }, [sopImageUrl]);

  const handleImageError = () => {
    if (urlIndex < candidateUrls.length - 1) {
      // Coba link alternatif Google Drive berikutnya
      setUrlIndex((prev) => prev + 1);
    } else if (driveId) {
      // Jika semua link gambar langsung gagal (misal file aslinya PDF atau hotlink diblokir),
      // otomatis beralih ke penampil resmi Google Drive Document Preview (Iframe)
      setUseIframeMode(true);
      setImageError(false);
    } else {
      setImageError(true);
    }
  };

  const activeSrc = candidateUrls[urlIndex] || sopImageUrl;

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
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full relative z-10">
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
            <div className="space-y-2 max-w-4xl">
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
          </div>
        </div>
      </section>

      {/* Main Content Area: Full Screen Width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-6 relative z-20">
        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-4 sm:p-6 lg:p-8 space-y-6">
          
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

          {/* SOP Image Viewer (Gambar Utuh Lebar Penuh) */}
          {sopImageUrl ? (
            <div className="space-y-4 w-full">
              <div className="relative group bg-slate-900/5 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center overflow-hidden min-h-[300px] w-full">
                {useIframeMode && drivePreviewUrl ? (
                  <iframe
                    src={drivePreviewUrl}
                    title="Bagan Alur SOP Pelayanan Korwilcam Purwodadi"
                    className="w-full h-[650px] sm:h-[800px] border-0 rounded-xl shadow-sm bg-white"
                    allow="autoplay"
                  />
                ) : imageError ? (
                  <div className="py-12 px-4 text-center max-w-md space-y-3">
                    <Info className="w-10 h-10 text-amber-500 mx-auto" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Gambar Belum Dapat Ditampilkan
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Tautan Google Drive mungkin belum diatur untuk publik atau format file tidak sesuai. Pastikan akses file di Google Drive diset menjadi <strong className="text-slate-700">"Siapa saja yang memiliki link"</strong> (Anyone with link).
                    </p>
                    {isGdrive && driveViewUrl && (
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {drivePreviewUrl && (
                          <button
                            type="button"
                            onClick={() => setUseIframeMode(true)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Buka dengan Google Viewer</span>
                          </button>
                        )}
                        <a
                          href={driveViewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                        >
                          <span>Buka Langsung di Google Drive</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <img
                      key={activeSrc}
                      src={activeSrc}
                      referrerPolicy="no-referrer"
                      alt="Bagan Alur SOP Pelayanan Korwilcam Purwodadi"
                      className="w-full h-auto object-contain rounded-xl shadow-sm transition-transform duration-200 cursor-zoom-in"
                      onClick={() => {
                        setIsLightboxOpen(true);
                        setZoomLevel(1);
                      }}
                      onError={handleImageError}
                      onLoad={() => setImageError(false)}
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
                  <span>
                    {useIframeMode 
                      ? 'Menampilkan dokumen resmi via Google Drive Viewer' 
                      : 'Gambar ditampilkan utuh sesuai dokumen bagan resmi'}
                  </span>
                </span>
                <span>
                  {!useIframeMode && 'Tip: Klik gambar untuk memperbesar tampilan'}
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
              <div className="text-[11px] text-slate-600 leading-relaxed space-y-0.5">
                {(officeProfile.workingHours || '')
                  .split(/[\n|]/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                <div className="text-[10px] text-slate-500 italic pt-0.5">Sabtu, Minggu & Libur Nasional: Tutup</div>
              </div>
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
              {/* Zoom Controls (Hanya jika mode gambar) */}
              {!useIframeMode && (
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
              )}

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
            {useIframeMode && drivePreviewUrl ? (
              <iframe
                src={drivePreviewUrl}
                title="Bagan SOP Pelayanan Penuh"
                className="w-full h-[80vh] border-0 rounded-xl shadow-2xl bg-white"
                allow="autoplay"
              />
            ) : (
              <img
                src={activeSrc}
                referrerPolicy="no-referrer"
                alt="Bagan SOP Pelayanan Penuh"
                style={{ transform: `scale(${zoomLevel})` }}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-150 select-none"
                onError={handleImageError}
              />
            )}
          </div>

          {/* Bottom Hint */}
          <div className="text-center pt-2 text-slate-400 text-xs">
            {!useIframeMode 
              ? 'Gunakan kontrol di atas untuk memperbesar diagram alur agar tulisan terbaca jelas.'
              : 'Gunakan penampil Google Drive untuk melihat dan menggulir seluruh isi dokumen.'}
          </div>
        </div>
      )}
    </div>
  );
};
