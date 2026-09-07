import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Image as ImageIcon, 
  Calendar, 
  X, 
  Folder, 
  FolderOpen, 
  Images, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const { gallery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  
  // Active album for popup
  const [activeAlbum, setActiveAlbum] = useState<GalleryItem | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);

  const categories = [
    { id: 'ALL', label: 'Semua Dokumentasi' },
    { id: 'Kegiatan Belajar', label: 'Kegiatan Belajar' },
    { id: 'Lomba & Prestasi', label: 'Lomba & Prestasi' },
    { id: 'Rakor & Pelatihan', label: 'Rakor & Pelatihan' },
    { id: 'Upacara', label: 'Upacara & Seremonial' },
  ];

  const filteredGallery = selectedCategory === 'ALL'
    ? gallery
    : gallery.filter((item) => item.category === selectedCategory);

  // Keyboard navigation for album modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeAlbum) return;
      const photos = (activeAlbum.images && activeAlbum.images.length > 0) 
        ? activeAlbum.images 
        : [activeAlbum.image];

      if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'Escape') {
        setActiveAlbum(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeAlbum]);

  const handleOpenAlbum = (item: GalleryItem) => {
    setActiveAlbum(item);
    setCurrentPhotoIndex(0);
  };

  const activePhotos = activeAlbum 
    ? ((activeAlbum.images && activeAlbum.images.length > 0) ? activeAlbum.images : [activeAlbum.image])
    : [];

  const handleDownloadPhoto = (photoUrl: string, title: string, index: number) => {
    const link = document.createElement('a');
    link.href = photoUrl;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-foto-${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Folder Dokumentasi Visual</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Galeri Kegiatan Pendidikan Purwodadi
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Dokumentasi lengkap momen penting, kegiatan pembelajaran, dan prestasi pendidikan se-Kecamatan Purwodadi dalam album folder visual.
          </p>

          {/* Filter Categories */}
          <div className="pt-6 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/30'
                    : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid (Bentuk Folder Album) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              Daftar Folder Album Kegiatan ({filteredGallery.length} Album)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Klik folder untuk melihat seluruh foto dokumentasi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item) => {
            const photoList = (item.images && item.images.length > 0) ? item.images : [item.image];
            const count = photoList.length;

            return (
              <div
                key={item.id}
                onClick={() => handleOpenAlbum(item)}
                className="group relative cursor-pointer pt-3"
              >
                {/* Visual Folder Tab Effect at Top */}
                <div className="absolute top-0 left-6 w-28 h-5 bg-amber-500 rounded-t-xl group-hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center">
                  <span className="text-[10px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                    <Folder className="w-2.5 h-2.5" /> Album
                  </span>
                </div>

                {/* Back Stack Sheet (Folder Look) */}
                <div className="absolute inset-x-2 top-1.5 bottom-1.5 bg-amber-200/60 rounded-2xl -rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>

                {/* Main Card */}
                <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                  {/* Cover Photo Stage */}
                  <div className="relative h-56 bg-slate-950 overflow-hidden">
                    <img
                      src={item.image || photoList[0]}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-blue-600/90 text-white shadow backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>

                    {/* Multi-Photo Counter Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5 border border-amber-300">
                        <Images className="w-3.5 h-3.5 text-slate-950" />
                        <span>{count} Foto</span>
                      </span>
                    </div>

                    {/* Date */}
                    <div className="absolute bottom-3 left-4 text-white">
                      <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                    </div>
                  </div>

                  {/* Folder Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Action Prompt */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-amber-500" />
                        <span>Buka Album ({count} Foto)</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* POPUP / MODAL ALBUM VIEWER LENGKAP */}
      {activeAlbum && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setActiveAlbum(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[94vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                    <Folder className="w-3 h-3" /> Folder Album
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                    {activeAlbum.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {activeAlbum.date}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-2xl">
                  {activeAlbum.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveAlbum(null)}
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Stage: Large Active Photo */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[440px] max-h-[58vh] overflow-hidden group">
              <img
                src={activePhotos[currentPhotoIndex] || activeAlbum.image}
                alt={`${activeAlbum.title} - Foto ${currentPhotoIndex + 1}`}
                className="w-full h-full max-h-[58vh] object-contain select-none transition-all duration-300"
              />

              {/* Counter Pill */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                <Images className="w-3.5 h-3.5 text-amber-400" />
                <span>Foto {currentPhotoIndex + 1} dari {activePhotos.length}</span>
              </div>

              {/* Download Photo Button */}
              <button
                onClick={() => handleDownloadPhoto(activePhotos[currentPhotoIndex] || activeAlbum.image, activeAlbum.title, currentPhotoIndex)}
                className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-colors"
                title="Unduh foto ini"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Unduh Foto</span>
              </button>

              {/* Navigation Arrow: Previous */}
              {activePhotos.length > 1 && (
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : activePhotos.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg border border-white/10 hover:scale-105"
                  title="Foto Sebelumnya (Panah Kiri)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Navigation Arrow: Next */}
              {activePhotos.length > 1 && (
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => (prev < activePhotos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg border border-white/10 hover:scale-105"
                  title="Foto Selanjutnya (Panah Kanan)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Strip: Thumbnail Carousel & Description */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3">
              {/* Description */}
              {activeAlbum.description && (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
                  {activeAlbum.description}
                </p>
              )}

              {/* Thumbnail Strip (Hanya jika foto > 1) */}
              {activePhotos.length > 1 && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-700">
                    {activePhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPhotoIndex(idx)}
                        className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden shrink-0 transition-all ${
                          currentPhotoIndex === idx
                            ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/20 opacity-100'
                            : 'opacity-50 hover:opacity-90'
                        }`}
                      >
                        <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                        {currentPhotoIndex === idx && (
                          <div className="absolute inset-0 bg-amber-500/10 border-2 border-amber-400 rounded-xl"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
