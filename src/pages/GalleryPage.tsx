import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Images,
  Video,
  Camera,
  RefreshCw,
  Film,
  Sparkles,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { GalleryItem, GalleryVideoItem } from '../types';
import { sortGalleryDescending } from '../lib/galleryHelper';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { GalleryCard } from '../components/GalleryCard';
import { VideoGalleryCard } from '../components/VideoGalleryCard';

// Fungsi pengacakan Fisher-Yates untuk mengacak urutan video agar tidak urut
const shuffleVideos = (videoList: GalleryVideoItem[]): GalleryVideoItem[] => {
  const arr = [...videoList];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const GalleryPage: React.FC = () => {
  const { 
    gallery, 
    setSelectedGallery, 
    galleryCategories,
    videos,
    setSelectedVideo,
    refreshVideosFromSheet,
    isVideosLoading,
    galleryActiveTab,
    setGalleryActiveTab
  } = useApp();

  // State tab utama galeri: bersumber dari AppContext (sinkron saat kembali dari detail video)
  const activeGalleryType = galleryActiveTab;

  const [selectedPhotoCategory, setSelectedPhotoCategory] = useState<string>('ALL');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');
  
  // State Pagination Video (12 video per halaman: 4 kolom x 3 baris)
  const [videoCurrentPage, setVideoCurrentPage] = useState<number>(1);
  const VIDEOS_PER_PAGE = 12;
  const videoSectionRef = useRef<HTMLDivElement>(null);

  // State daftar video yang diacak (randomized) per sesi kunjungan pengunjung
  const [shuffledVideos, setShuffledVideos] = useState<GalleryVideoItem[]>([]);

  // Mengacak video saat data video pertama kali dimuat atau diperbarui
  useEffect(() => {
    if (videos && videos.length > 0) {
      setShuffledVideos(shuffleVideos(videos));
    }
  }, [videos]);

  // Reset pagination ke halaman 1 jika kata kunci pencarian video berubah
  useEffect(() => {
    setVideoCurrentPage(1);
  }, [videoSearchQuery]);

  // Sinkronisasi query param & acak ulang ketika pengunjung memilih tab video
  const handleSwitchTab = (tab: 'photo' | 'video') => {
    setGalleryActiveTab(tab);
    if (tab === 'video' && videos && videos.length > 0) {
      setShuffledVideos(shuffleVideos(videos));
    }
  };

  // Segarkan data dan acak ulang kartu video
  const handleRefreshVideos = () => {
    refreshVideosFromSheet();
    if (videos && videos.length > 0) {
      setShuffledVideos(shuffleVideos(videos));
    }
  };

  // Kategori Foto
  const photoCategories = useMemo(() => {
    const list = [{ id: 'ALL', label: 'Semua Dokumentasi' }];
    galleryCategories.forEach((cat) => {
      const label = cat === 'Upacara' ? 'Upacara & Seremonial' : cat;
      list.push({ id: cat, label });
    });
    return list;
  }, [galleryCategories]);

  // Filtered Foto
  const filteredGallery = useMemo(() => {
    const list = selectedPhotoCategory === 'ALL'
      ? gallery
      : gallery.filter((item) => item.category === selectedPhotoCategory);
    return sortGalleryDescending(list);
  }, [gallery, selectedPhotoCategory]);

  // Filtered Video berdasarkan Judul dan Nama SD (Sekolah) menggunakan urutan acak (shuffledVideos)
  const filteredVideos = useMemo(() => {
    const baseList = shuffledVideos.length > 0 ? shuffledVideos : videos;
    const q = videoSearchQuery.trim().toLowerCase();
    if (!q) {
      return baseList;
    }
    return baseList.filter((v) => {
      const matchTitle = (v.title || '').toLowerCase().includes(q);
      const matchSchool = (v.schoolName || '').toLowerCase().includes(q);
      const matchDesc = (v.description || '').toLowerCase().includes(q);
      const matchCategory = (v.category || '').toLowerCase().includes(q);
      return matchTitle || matchSchool || matchDesc || matchCategory;
    });
  }, [videos, shuffledVideos, videoSearchQuery]);

  // Total Halaman Video
  const totalVideoPages = Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE) || 1;

  // Daftar Video yang Ditampilkan pada Halaman Aktif (Maks 15 video)
  const paginatedVideos = useMemo(() => {
    const startIndex = (videoCurrentPage - 1) * VIDEOS_PER_PAGE;
    return filteredVideos.slice(startIndex, startIndex + VIDEOS_PER_PAGE);
  }, [filteredVideos, videoCurrentPage, VIDEOS_PER_PAGE]);

  // Navigasi Pindah Halaman Video
  const handleVideoPageChange = (page: number) => {
    if (page < 1 || page > totalVideoPages || page === videoCurrentPage) return;
    setVideoCurrentPage(page);
    if (videoSectionRef.current) {
      videoSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  // Generator Angka Halaman Video
  const getVideoPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalVideoPages <= 7) {
      for (let i = 1; i <= totalVideoPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (videoCurrentPage > 3) pages.push('...');
      const start = Math.max(2, videoCurrentPage - 1);
      const end = Math.min(totalVideoPages - 1, videoCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (videoCurrentPage < totalVideoPages - 2) pages.push('...');
      pages.push(totalVideoPages);
    }
    return pages;
  };

  const handleOpenAlbum = (item: GalleryItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedGallery(item);
  };

  const handleOpenVideo = (item: GalleryVideoItem, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedVideo(item);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-5 pb-10 sm:pt-6 sm:pb-12 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 sm:space-y-3 relative z-10">
          
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            {activeGalleryType === 'photo' 
              ? 'Galeri Kegiatan Pendidikan Purwodadi' 
              : 'Galeri Video Kegiatan Pendidikan Purwodadi'}
          </h1>
          
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto shadow-xs" />

          {/* Toggle Tab Utama: Foto Dokumentasi vs Video Kegiatan */}
          <div className="pt-0.5 sm:pt-1 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-black/25 backdrop-blur-md border border-white/20 shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchTab('photo')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeGalleryType === 'photo'
                    ? 'bg-white text-blue-700 shadow-md scale-102 ring-2 ring-white/50'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Foto Kegiatan</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeGalleryType === 'photo' ? 'bg-blue-100 text-blue-700' : 'bg-white/20 text-white'
                }`}>
                  {gallery.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchTab('video')}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  activeGalleryType === 'video'
                    ? 'bg-red-600 text-white shadow-md scale-102 ring-2 ring-red-400/50'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video Kegiatan</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  activeGalleryType === 'video' ? 'bg-white text-red-600' : 'bg-white/20 text-white'
                }`}>
                  {videos.length}
                </span>
              </button>
            </div>
          </div>

          {/* Sub-Kategori Filter & Aksi Tambahan */}
          <div className="pt-1 sm:pt-1.5 flex flex-wrap items-center justify-center gap-2">
            {activeGalleryType === 'photo' ? (
              photoCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedPhotoCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedPhotoCategory === cat.id
                      ? 'bg-white text-[#1b56ce] shadow-md ring-2 ring-white/50'
                      : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm'
                  }`}
                >
                  {cat.label}
                </button>
              ))
            ) : (
              <div className="w-full max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2.5 px-2">
                {/* Search Bar Input: Cari Judul Video dan Nama SD */}
                <div className="relative flex-1 w-full flex items-center bg-white rounded-full border border-white/70 shadow-lg shadow-blue-950/20 p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-white transition-all">
                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0 ml-0.5">
                    <Search className="w-4 h-4 text-white stroke-[2.5]" />
                  </div>
                  <input
                    type="text"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    placeholder="Cari video berdasarkan judul atau nama SD..."
                    className="flex-1 min-w-0 px-3 py-1 sm:py-1.5 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-semibold outline-none"
                  />
                  {videoSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setVideoSearchQuery('')}
                      className="p-1 mr-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
                      title="Hapus kata kunci pencarian"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Tombol Segarkan Data Video dari Database Korwil & Acak Ulang */}
                <button
                  type="button"
                  onClick={handleRefreshVideos}
                  disabled={isVideosLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-full text-xs font-bold bg-white text-red-600 hover:bg-red-50 hover:text-red-700 shadow-md border border-white/60 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  title="Segarkan data video dari Database Korwil & acak ulang"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVideosLoading ? 'animate-spin' : ''}`} />
                  <span>Segarkan Data</span>
                </button>
              </div>
            )}
          </div>

        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Grid: Menampilkan Foto atau Video */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-5 sm:-mt-6 relative z-20">
        {activeGalleryType === 'photo' ? (
          /* 1. Grid Foto Kegiatan */
          filteredGallery.length > 0 ? (
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
                Tidak Ada Dokumentasi Foto
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Belum ada album foto untuk kategori ini.
              </p>
            </div>
          )
        ) : (
          /* 2. Grid Video Kegiatan (Layout 4 Kolom agar Kartu & Thumbnail Tampil Lebih Besar & Terlihat Jelas) */
          filteredVideos.length > 0 ? (
            <div ref={videoSectionRef} className="space-y-8 scroll-mt-24">
              {/* Grid Video per Halaman (4 Kolom di Layar Lebar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {paginatedVideos.map((item) => (
                  <VideoGalleryCard
                    key={item.id}
                    item={item}
                    onClick={handleOpenVideo}
                  />
                ))}
              </div>

              {/* Komponen Pagination Video (12 video per halaman) */}
              {filteredVideos.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Info Jumlah Video & Halaman Aktif */}
                  <div className="text-xs sm:text-sm text-slate-500 order-2 sm:order-1 font-medium">
                    Menampilkan <span className="font-bold text-slate-800">{(videoCurrentPage - 1) * VIDEOS_PER_PAGE + 1} - {Math.min(videoCurrentPage * VIDEOS_PER_PAGE, filteredVideos.length)}</span> dari <span className="font-bold text-slate-800">{filteredVideos.length}</span> video kegiatan (halaman <span className="font-bold text-red-600">{videoCurrentPage}</span>/{totalVideoPages})
                  </div>

                  {/* Tombol Kontrol Pagination */}
                  <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                    {/* Halaman Pertama */}
                    <button
                      type="button"
                      onClick={() => handleVideoPageChange(1)}
                      disabled={videoCurrentPage === 1}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                      title="Halaman Pertama"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Halaman Sebelumnya */}
                    <button
                      type="button"
                      onClick={() => handleVideoPageChange(videoCurrentPage - 1)}
                      disabled={videoCurrentPage === 1}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                    </button>

                    {/* Tombol Nomor Halaman */}
                    {getVideoPageNumbers().map((p, idx) => (
                      typeof p === 'number' ? (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleVideoPageChange(p)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            videoCurrentPage === p
                              ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-extrabold scale-105'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={idx} className="w-6 text-center text-slate-400 font-bold text-xs select-none">
                          {p}
                        </span>
                      )
                    ))}

                    {/* Halaman Selanjutnya */}
                    <button
                      type="button"
                      onClick={() => handleVideoPageChange(videoCurrentPage + 1)}
                      disabled={videoCurrentPage === totalVideoPages}
                      className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                      title="Halaman Selanjutnya"
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Halaman Terakhir */}
                    <button
                      type="button"
                      onClick={() => handleVideoPageChange(totalVideoPages)}
                      disabled={videoCurrentPage === totalVideoPages}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs cursor-pointer"
                      title="Halaman Terakhir"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-10 sm:p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-3">
              <Film className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-slate-800">
                {videoSearchQuery ? 'Video Tidak Ditemukan' : 'Belum Ada Video Kegiatan'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {videoSearchQuery
                  ? `Tidak ada video kegiatan yang cocok dengan pencarian "${videoSearchQuery}". Silakan coba kata kunci judul atau nama sekolah lain.`
                  : 'Daftar video kegiatan akan otomatis muncul dari Database Korwil setelah data diisikan.'}
              </p>
              {videoSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setVideoSearchQuery('')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Hapus Pencarian</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={refreshVideosFromSheet}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Segarkan Data Sekarang</span>
                </button>
              )}
            </div>
          )
        )}
      </section>
    </div>
  );
};
