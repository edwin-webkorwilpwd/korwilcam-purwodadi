import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Share2, 
  Download, 
  Images, 
  Folder, 
  FolderOpen,
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  X, 
  Check, 
  ExternalLink,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { GalleryItem } from '../types';
import { getGallerySlug } from '../lib/galleryHelper';

export const GalleryDetailPage: React.FC = () => {
  const { 
    selectedGallery, 
    setSelectedGallery, 
    gallery, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Scroll to top when gallery detail opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActivePhotoIndex(0);
  }, [selectedGallery?.id]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || !selectedGallery) return;

    const photos = (selectedGallery.images && selectedGallery.images.length > 0)
      ? selectedGallery.images
      : [selectedGallery.image];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setActivePhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, selectedGallery]);

  if (!selectedGallery) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Album Galeri Tidak Ditemukan</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Album dokumentasi kegiatan yang Anda cari mungkin telah dipindahkan atau tautan yang dimasukkan keliru.
        </p>
        <button
          onClick={() => {
            setSelectedGallery(null);
            setActiveTab('gallery', '/galeri');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Galeri Kegiatan</span>
        </button>
      </div>
    );
  }

  // All photos in this gallery item
  const photos = (selectedGallery.images && selectedGallery.images.length > 0)
    ? selectedGallery.images
    : [selectedGallery.image];

  const totalPhotos = photos.length;
  const currentPhoto = photos[activePhotoIndex] || selectedGallery.image;
  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('Tautan album galeri berhasil disalin!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*DOKUMENTASI KEGIATAN KORWILCAM PURWODADI*\n\n` +
      `*${selectedGallery.title}*\n` +
      `Kategori: ${selectedGallery.category} | Tanggal: ${selectedGallery.date}\n` +
      `Jumlah Foto: ${totalPhotos} Foto Dokumentasi\n\n` +
      `Keterangan:\n${selectedGallery.description || 'Dokumentasi kegiatan pendidikan se-Kecamatan Purwodadi.'}\n\n` +
      `Lihat seluruh foto lengkapnya pada tautan resmi berikut:\n${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadPhoto = (photoUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    const cleanTitle = selectedGallery.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/--+/g, '-');
    link.download = `${cleanTitle}-foto-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Mengunduh foto ${index + 1}...`, 'info');
  };

  const handleDownloadAllPhotos = () => {
    photos.forEach((photoUrl, idx) => {
      setTimeout(() => {
        handleDownloadPhoto(photoUrl, idx);
      }, idx * 350);
    });
    showToast(`Memulai unduhan seluruh ${totalPhotos} foto dalam album...`, 'info');
  };

  // Other albums for recommendations
  const otherAlbums = gallery.filter((item) => item.id !== selectedGallery.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedGallery(null);
              setActiveTab('gallery', '/galeri');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-blue-600" />
            <span>Kembali ke Semua Album</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                copied 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="Salin Tautan Album"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-blue-600" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Bagikan ke WhatsApp"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bagikan WA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Album Header Title & Metadata */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-blue-600" />
              {selectedGallery.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 flex items-center gap-1.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {selectedGallery.date}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1.5 border border-amber-200">
              <Images className="w-3.5 h-3.5 text-amber-700" />
              <span>{totalPhotos} Foto Dokumentasi</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {selectedGallery.title}
          </h1>

          {selectedGallery.description && (
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl pt-1">
              {selectedGallery.description}
            </p>
          )}

          {totalPhotos > 1 && (
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadAllPhotos}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh Seluruh {totalPhotos} Foto (Batch)</span>
              </button>
              <span className="text-xs text-slate-400">
                Gunakan tombol panah atau klik thumbnail di bawah untuk berpindah antar foto.
              </span>
            </div>
          )}
        </div>

        {/* SECTION 1: STAGE SOROTAN UTAMA (ACTIVE PHOTO STAGE) */}
        <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-xl border border-slate-900 flex flex-col">
          {/* Main Photo Viewing Area */}
          <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[580px] bg-black flex items-center justify-center group overflow-hidden select-none">
            <img
              src={currentPhoto}
              alt={`${selectedGallery.title} - Foto ${activePhotoIndex + 1}`}
              className="w-full h-full object-contain transition-all duration-300"
            />

            {/* Photo Counter Pill */}
            <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-2 border border-white/10">
              <Images className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto {activePhotoIndex + 1} dari {totalPhotos}</span>
            </div>

            {/* Action Top Right: Fullscreen Lightbox & Download */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all hover:scale-105"
                title="Perbesar Layar Penuh (Fullscreen)"
              >
                <Maximize2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Layar Penuh</span>
              </button>

              <button
                onClick={() => handleDownloadPhoto(currentPhoto, activePhotoIndex)}
                className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all hover:scale-105"
                title="Unduh foto yang sedang ditampilkan"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Unduh Foto</span>
              </button>
            </div>

            {/* Previous Arrow Button */}
            {totalPhotos > 1 && (
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all hover:scale-110 shadow-lg"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* Next Arrow Button */}
            {totalPhotos > 1 && (
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-all hover:scale-110 shadow-lg"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip (Jika foto > 1) */}
          {totalPhotos > 1 && (
            <div className="p-4 sm:p-5 bg-slate-900 border-t border-slate-800">
              <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Pilih Foto untuk Ditampilkan:</span>
                <span>{activePhotoIndex + 1} / {totalPhotos}</span>
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative w-20 h-14 sm:w-28 sm:h-20 rounded-2xl overflow-hidden shrink-0 transition-all duration-200 ${
                      activePhotoIndex === idx
                        ? 'ring-3 ring-amber-400 scale-105 shadow-lg shadow-amber-500/20 opacity-100'
                        : 'opacity-50 hover:opacity-90 hover:scale-102'
                    }`}
                  >
                    <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/70 text-white font-mono">
                      #{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: REKOMENDASI ALBUM KEGIATAN LAINNYA */}
        {otherAlbums.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-slate-900">
                  Album Kegiatan Lainnya
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedGallery(null);
                  setActiveTab('gallery', '/galeri');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Lihat Semua Galeri</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherAlbums.map((item) => {
                const count = (item.images && item.images.length > 0) ? item.images.length : 1;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedGallery(item);
                    }}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-600 text-white">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-slate-950 flex items-center gap-1">
                          <Images className="w-3 h-3" />
                          <span>{count} Foto</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>{item.date}</span>
                        <span className="font-bold text-blue-600 flex items-center gap-1">
                          Buka Album <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX VIEWER MODAL (LAYAR PENUH) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Bar */}
          <div 
            className="px-6 py-4 flex items-center justify-between gap-4 border-b border-white/10 bg-black/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-white min-w-0">
              <span className="text-xs text-amber-400 font-mono block">
                Foto {activePhotoIndex + 1} dari {totalPhotos}
              </span>
              <h4 className="text-sm font-bold truncate max-w-xl text-slate-200">
                {selectedGallery.title}
              </h4>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleDownloadPhoto(currentPhoto, activePhotoIndex)}
                className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Unduh foto ini"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Unduh</span>
              </button>

              <button
                onClick={() => setIsLightboxOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Tutup Layar Penuh (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Stage */}
          <div 
            className="relative flex-1 flex items-center justify-center p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto}
              alt={`${selectedGallery.title} - Fullscreen ${activePhotoIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-xl select-none shadow-2xl transition-transform duration-300"
            />

            {/* Prev Arrow */}
            {totalPhotos > 1 && (
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : totalPhotos - 1))}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-transform hover:scale-110"
                title="Foto Sebelumnya"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* Next Arrow */}
            {totalPhotos > 1 && (
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : 0))}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition-transform hover:scale-110"
                title="Foto Selanjutnya"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Strip (Thumbnails) */}
          {totalPhotos > 1 && (
            <div 
              className="px-6 py-3 border-t border-white/10 bg-black/40 overflow-x-auto flex items-center justify-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative w-16 h-11 rounded-lg overflow-hidden shrink-0 transition-all ${
                    activePhotoIndex === idx 
                      ? 'ring-2 ring-amber-400 scale-105 opacity-100' 
                      : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src={photo} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
