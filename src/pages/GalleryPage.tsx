import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Folder, 
  FolderOpen, 
  Images, 
  ArrowRight,
  User
} from 'lucide-react';
import { GalleryItem } from '../types';
import { getGalleryDetailPath, sortGalleryDescending } from '../lib/galleryHelper';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const GalleryPage: React.FC = () => {
  const { gallery, setSelectedGallery, galleryCategories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const list = [{ id: 'ALL', label: 'Semua Dokumentasi' }];
    galleryCategories.forEach((cat) => {
      const label = cat === 'Upacara' ? 'Upacara & Seremonial' : cat;
      list.push({ id: cat, label });
    });
    return list;
  }, [galleryCategories]);

  const filteredGallery = useMemo(() => {
    const list = selectedCategory === 'ALL'
      ? gallery
      : gallery.filter((item) => item.category === selectedCategory);
    return sortGalleryDescending(list);
  }, [gallery, selectedCategory]);

  const handleOpenAlbum = (item: GalleryItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedGallery(item);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Galeri Kegiatan Pendidikan Purwodadi
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Dokumentasi lengkap momen penting, kegiatan pembelajaran, dan prestasi pendidikan se-Kecamatan Purwodadi dalam album folder visual.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />

          {/* Filter Categories */}
          <div className="pt-3 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-[#1b56ce] shadow-lg shadow-blue-950/20 ring-2 ring-white/50'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Gallery Grid (Bentuk Folder Album) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-8 sm:-mt-10 relative z-20">
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

                    {/* Date & Uploader */}
                    <div className="absolute bottom-3 left-4 right-4 text-white flex items-center justify-between gap-2">
                      <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3 h-3" /> {item.date}
                      </span>
                      <span className="text-[10px] text-white/90 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-1 truncate max-w-[150px]">
                        <User className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        <span className="truncate">{item.authorName || 'Super Administrator'}</span>
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
