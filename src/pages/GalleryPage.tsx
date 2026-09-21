import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Images 
} from 'lucide-react';
import { GalleryItem } from '../types';
import { sortGalleryDescending } from '../lib/galleryHelper';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { GalleryCard } from '../components/GalleryCard';

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
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Galeri Kegiatan Pendidikan Purwodadi
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Dokumentasi lengkap momen penting, kegiatan pembelajaran, dan prestasi pendidikan se-Kecamatan Purwodadi dalam album visual.
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

      {/* Gallery Cards Grid */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-5 sm:-mt-6 relative z-20">
        {filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {filteredGallery.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onClick={handleOpenAlbum}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto">
            <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              Tidak Ada Dokumentasi
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Belum ada foto atau album untuk kategori ini.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
