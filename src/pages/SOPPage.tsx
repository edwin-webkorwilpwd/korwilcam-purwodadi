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
  Eye,
  MapPin,
  Calendar,
  Headphones
} from 'lucide-react';
import { 
  isGoogleDriveUrl, 
  getGoogleDriveViewUrl, 
  extractGoogleDriveId,
  getGoogleDrivePreviewUrl
} from '../lib/driveHelper';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

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
      <section className="relative bg-gradient-to-br from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-8 lg:px-12 xl:px-16 overflow-hidden shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="w-full relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2 max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                Bagan Alur & SOP Pelayanan Pendidikan
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                Pedoman resmi mekanisme alur pelayanan prima, administrasi kepegawaian, serta konsultasi pendidikan di lingkungan Kantor Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
              </p>
              <div className="w-12 h-1 bg-amber-400 rounded-full mt-2 shadow-xs" />
            </div>
          </div>
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Content Area: Full Screen Width */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-8 sm:-mt-10 relative z-20">
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

          {/* Institutional Service Details Grid - Modern Style matching Image 2 */}
          <div className="pt-6 border-t border-slate-100">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#ebf5fe] via-[#f4faff] to-[#e2f1fd] border border-blue-100/90 p-3 sm:p-5 lg:p-6 shadow-sm">
              {/* Top-Left Wave Accent */}
              <div className="absolute -top-10 -left-10 w-44 h-44 pointer-events-none opacity-40 select-none">
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M0,0 C70,10 130,60 150,130 C160,165 140,200 140,200 L0,200 Z" fill="#93c5fd" />
                </svg>
              </div>

              {/* Top-Right Dot Matrix Pattern */}
              <div className="absolute top-3 right-4 sm:top-4 sm:right-6 pointer-events-none opacity-40 select-none">
                <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="sop-dot-grid-tr" x="0" y="0" width="12" height="11" patternUnits="userSpaceOnUse">
                    <circle cx="2.5" cy="2.5" r="1.5" fill="#60a5fa" />
                  </pattern>
                  <rect width="60" height="32" fill="url(#sop-dot-grid-tr)" />
                </svg>
              </div>

              {/* Bottom-Left Dot Matrix Pattern */}
              <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 pointer-events-none opacity-40 select-none">
                <svg width="60" height="32" viewBox="0 0 60 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="sop-dot-grid-bl" x="0" y="0" width="12" height="11" patternUnits="userSpaceOnUse">
                    <circle cx="2.5" cy="2.5" r="1.5" fill="#60a5fa" />
                  </pattern>
                  <rect width="60" height="32" fill="url(#sop-dot-grid-bl)" />
                </svg>
              </div>

              {/* Bottom-Right Sweeping Flow Waves */}
              <div className="absolute -bottom-4 -right-4 w-72 sm:w-96 h-36 pointer-events-none opacity-60 select-none">
                <svg viewBox="0 0 380 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M60,140 C140,90 230,80 340,115 C365,125 375,135 380,140 Z" fill="#93c5fd" fillOpacity="0.4" />
                  <path d="M140,140 C200,100 280,95 380,125 L380,140 Z" fill="#60a5fa" fillOpacity="0.3" />
                  <path d="M0,140 C90,110 200,105 320,140 Z" fill="#38bdf8" fillOpacity="0.25" />
                </svg>
              </div>

              {/* 3 Interactive Cards Grid - Native Vector Typography & Ultra HD 3D Renders */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 relative z-10">
                {/* Card 1: Jam Layanan Kantor */}
                <div className="group relative bg-white rounded-2xl sm:rounded-[22px] overflow-hidden border border-blue-100/90 shadow-[0_4px_24px_rgba(0,102,255,0.06)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 min-h-[195px] sm:min-h-[210px] flex flex-col justify-between">
                  {/* Subtle Wave Corner */}
                  <div className="absolute -bottom-1 -right-1 w-32 h-24 pointer-events-none opacity-40 select-none">
                    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M0,100 C40,75 85,60 140,80 L140,100 Z" fill="#93c5fd" />
                      <path d="M40,100 C70,75 110,65 140,70 L140,100 Z" fill="#38bdf8" fillOpacity="0.5" />
                    </svg>
                  </div>

                  {/* 3D Illustration */}
                  <img 
                    src="/sop_3d_clock.png" 
                    alt="Ilustrasi Jam Layanan" 
                    className="absolute right-0 sm:right-1 bottom-1 sm:bottom-2 w-28 sm:w-32 md:w-36 max-h-[145px] object-contain pointer-events-none select-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Content */}
                  <div className="relative z-10 pr-24 sm:pr-28 md:pr-24 lg:pr-28">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] shadow-md shadow-blue-500/25 flex items-center justify-center text-white">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-[#0c244b] tracking-tight mt-3">
                      Jam Layanan Kantor
                    </h4>
                    <div className="text-[12px] sm:text-[12.5px] text-slate-600 font-medium leading-relaxed space-y-0.5 mt-1.5">
                      <p>Senin - Kamis: 07.30 - 14.30 WIB</p>
                      <p>Jumat: 07.30 - 13.00 WIB</p>
                    </div>
                  </div>

                  {/* Bottom Pill Badge */}
                  <div className="relative z-10 mt-3 pt-2 border-t border-slate-100/80 pr-24 sm:pr-28 md:pr-24 lg:pr-28">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50/90 border border-blue-200/70 text-[10.5px] sm:text-[11px] font-medium text-slate-700 shadow-2xs">
                      <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                      <span>Sabtu, Minggu & Libur Nasional: <strong className="text-blue-700 font-bold">Tutup</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Lokasi Pelayanan */}
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(officeProfile.address || 'Kantor Korwilcam Bidang Pendidikan Purwodadi Grobogan')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white rounded-2xl sm:rounded-[22px] overflow-hidden border border-blue-100/90 shadow-[0_4px_24px_rgba(0,102,255,0.06)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 min-h-[195px] sm:min-h-[210px] flex flex-col justify-between block cursor-pointer"
                  title="Buka Lokasi Kantor di Google Maps"
                >
                  {/* Subtle Wave Corner */}
                  <div className="absolute -bottom-1 -right-1 w-32 h-24 pointer-events-none opacity-40 select-none">
                    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M0,100 C40,75 85,60 140,80 L140,100 Z" fill="#93c5fd" />
                      <path d="M40,100 C70,75 110,65 140,70 L140,100 Z" fill="#38bdf8" fillOpacity="0.5" />
                    </svg>
                  </div>

                  {/* 3D Illustration */}
                  <img 
                    src="/sop_3d_map.png" 
                    alt="Ilustrasi Lokasi Pelayanan" 
                    className="absolute right-0 sm:right-1 bottom-1 sm:bottom-2 w-28 sm:w-32 md:w-36 max-h-[145px] object-contain pointer-events-none select-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* External Link Action Badge */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs z-20">
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Buka Maps</span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 pr-24 sm:pr-28 md:pr-24 lg:pr-28">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] shadow-md shadow-blue-500/25 flex items-center justify-center text-white">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-[#0c244b] tracking-tight mt-3">
                      Lokasi Pelayanan
                    </h4>
                    <div className="text-[12px] sm:text-[12.5px] text-slate-600 font-medium leading-relaxed space-y-1 mt-1.5">
                      <p className="font-semibold text-slate-800">Ruang Tata Usaha & Pelayanan Terpadu</p>
                      <p className="text-slate-500 text-[11.5px]">Kantor Korwilcam Bidang Pendidikan Purwodadi, Kab. Grobogan</p>
                    </div>
                  </div>

                  <div className="relative z-10 mt-3 pt-2 border-t border-slate-100/80 pr-24 sm:pr-28 md:pr-24 lg:pr-28 text-[11px] text-blue-600 font-medium flex items-center gap-1">
                    <span>Lihat di Peta & Navigasi</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </a>

                {/* Card 3: Pengaduan & Bantuan */}
                <button
                  type="button"
                  onClick={() => {
                    const waNumber = (officeProfile.whatsapp || officeProfile.phone || '082170774341').replace(/[^0-9]/g, '');
                    const cleanWa = waNumber.startsWith('0') ? '62' + waNumber.slice(1) : waNumber;
                    window.open(`https://wa.me/${cleanWa}?text=${encodeURIComponent('Halo Admin Korwilcam Purwodadi, saya ingin berkonsultasi seputar SOP Pelayanan.')}`, '_blank');
                  }}
                  className="group relative bg-white rounded-2xl sm:rounded-[22px] overflow-hidden border border-blue-100/90 shadow-[0_4px_24px_rgba(0,102,255,0.06)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.18)] transition-all duration-300 hover:-translate-y-1 p-5 sm:p-6 min-h-[195px] sm:min-h-[210px] flex flex-col justify-between text-left block w-full cursor-pointer"
                  title="Hubungi Layanan Pengaduan & Bantuan via WhatsApp"
                >
                  {/* Subtle Wave Corner */}
                  <div className="absolute -bottom-1 -right-1 w-32 h-24 pointer-events-none opacity-40 select-none">
                    <svg viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <path d="M0,100 C40,75 85,60 140,80 L140,100 Z" fill="#86efac" />
                      <path d="M40,100 C70,75 110,65 140,70 L140,100 Z" fill="#34d399" fillOpacity="0.5" />
                    </svg>
                  </div>

                  {/* 3D Illustration */}
                  <img 
                    src="/sop_3d_help.png" 
                    alt="Ilustrasi Pengaduan & Bantuan" 
                    className="absolute right-0 sm:right-1 bottom-1 sm:bottom-2 w-28 sm:w-32 md:w-36 max-h-[145px] object-contain pointer-events-none select-none drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* External Link Action Badge */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 backdrop-blur-xs z-20">
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>Chat WA</span>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 pr-24 sm:pr-28 md:pr-24 lg:pr-28">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#34d399] via-[#10b981] to-[#059669] shadow-md shadow-emerald-500/25 flex items-center justify-center text-white">
                      <Headphones className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-[15px] sm:text-[17px] font-bold text-[#0c244b] tracking-tight mt-3">
                      Pengaduan & Bantuan
                    </h4>
                    <p className="text-[12px] sm:text-[12.5px] text-slate-600 font-medium leading-relaxed mt-1.5">
                      Jika terdapat kendala atau pertanyaan seputar prosedur, sampaikan melalui formulir pengaduan online atau WhatsApp resmi.
                    </p>
                  </div>

                  <div className="relative z-10 mt-3 pt-2 border-t border-slate-100/80 pr-24 sm:pr-28 md:pr-24 lg:pr-28 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <span>Hubungi Admin Layanan</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </button>
              </div>
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
