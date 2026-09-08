import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Folder, 
  FolderOpen, 
  Images, 
  ArrowRight
} from 'lucide-react';
import { GalleryItem } from '../types';
import { getGalleryDetailPath } from '../lib/galleryHelper';

export const GalleryPage: React.FC = () => {
  const { gallery, setSelectedGallery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

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

  const handleOpenAlbum = (item: GalleryItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedGallery(item);
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
          <span className="text-xs text-slate-500 hidden sm:inline">
            Klik folder untuk membuka halaman album dan melihat seluruh foto
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item) => {
            const photoList = (item.images && item.images.length > 0) ? item.images : [item.image];
            const count = photoList.length;
            const detailUrl = getGalleryDetailPath(item);

            return (
              <a
                key={item.id}
                href={detailUrl}
                onClick={(e) => handleOpenAlbum(item, e)}
                className="group relative cursor-pointer pt-3 block no-underline focus:outline-none"
                title={`Buka album: ${item.title}`}
              >
                {/* Visual Folder Tab Effect at Top */}
                <div className="absolute top-0 left-6 w-28 h-5 bg-amber-500 rounded-t-xl group-hover:bg-amber-600 transition-colors shadow-sm flex items-center justify-center z-10">
                  <span className="text-[10px] font-extrabold text-amber-950 uppercase tracking-wider flex items-center gap-1">
                    <Folder className="w-2.5 h-2.5" /> Album
                  </span>
                </div>

                {/* Back Stack Sheet (Folder Look) */}
                <div className="absolute inset-x-2 top-1.5 bottom-1.5 bg-amber-200/60 rounded-2xl -rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>

                {/* Main Card */}
                <div className="card-deferred relative rounded-2xl overflow-hidden bg-white border border-slate-200/90 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                  {/* Cover Photo Stage */}
                  <div className="relative h-56 bg-slate-950 overflow-hidden">
                    <img
                      src={item.image || photoList[0]}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent"></div>

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow">
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
                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Action Prompt */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-amber-500" />
                        <span>Buka Halaman Album ({count} Foto)</span>
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </div>
  );
};
