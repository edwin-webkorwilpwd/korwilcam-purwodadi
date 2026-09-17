import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Images, 
  ArrowRight 
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

      {/* Gallery Section with Header Matching Gambar 2 */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-8 sm:-mt-10 relative z-20">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-blue-50/80 shadow-xs mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Blue Squircle Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0">
                <Images className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Galeri Foto
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-1 mb-1" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Dokumentasi kegiatan dan momen penting di lingkungan sekolah.
                </p>
              </div>
            </div>

            {/* Top Right Action / Count Badge */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-4 py-2 rounded-full text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200/80'
                }`}
              >
                <Images className="w-3.5 h-3.5" />
                <span>Lihat Semua ({filteredGallery.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredGallery.map((item) => (
            <GalleryCard
              key={item.id}
              item={item}
              onClick={handleOpenAlbum}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
