import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  User, 
  Film, 
  Play, 
  MessageCircle, 
  Building2, 
  CheckCircle2,
  Maximize,
  Minimize2
} from 'lucide-react';
import { GalleryVideoItem } from '../types';
import { getVideoDetailPath, getYouTubeEmbedUrl } from '../lib/youtubeHelper';

export const VideoDetailPage: React.FC = () => {
  const { 
    selectedVideo, 
    setSelectedVideo, 
    videos, 
    setActiveTab, 
    setGalleryActiveTab
  } = useApp();

  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'school' | 'category'>('all');

  // State & Ref Layar Penuh (Fullscreen) untuk kompatibilitas iPhone Safari & seluruh ponsel
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleToggleFullscreen = () => {
    const container = playerContainerRef.current;
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (container) {
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(() => {});
        } else if ((container as any).webkitRequestFullscreen) {
          (container as any).webkitRequestFullscreen();
        }
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitFullscreenElement && (document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Sinkronisasi status fullscreen sistem (jika user keluar lewat swipe / gesture / ESC)
  useEffect(() => {
    const onFsChange = () => {
      const isFs = !!(document.fullscreenElement || (document as any).webkitFullscreenElement);
      if (!isFs && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  // Kunci scroll halaman saat mode layar penuh aktif agar tidak bergulir di latar belakang
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const handleBackToGallery = () => {
    setSelectedVideo(null);
    setGalleryActiveTab('video');
    setActiveTab('gallery', '/galeri?tab=video');
  };

  // Scroll to top when video detail opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setIsDescExpanded(false);
    setSidebarFilter('all');
  }, [selectedVideo?.id]);

  // URL Embed YouTube Resmi Bebas Error 153 dengan Referer Domain
  const embedUrl = useMemo(() => {
    if (!selectedVideo?.youtubeId) return selectedVideo?.embedUrl || '';
    return getYouTubeEmbedUrl(selectedVideo.youtubeId, true);
  }, [selectedVideo?.youtubeId, selectedVideo?.embedUrl]);

  // URL Kanonikal resmi untuk dibagikan (WhatsApp crawler mewajibkan domain publik https://korwilcampurwodadi.web.id)
  const canonicalUrl = useMemo(() => {
    if (!selectedVideo) return 'https://korwilcampurwodadi.web.id/galeri?tab=video';
    const videoPath = getVideoDetailPath(selectedVideo);
    const queryV = selectedVideo.youtubeId ? `?v=${encodeURIComponent(selectedVideo.youtubeId)}` : '';
    return `https://korwilcampurwodadi.web.id${videoPath}${queryV}`;
  }, [selectedVideo]);

  // Update dynamic page title & metadata Open Graph untuk thumbnail WhatsApp / Sosmed
  useEffect(() => {
    if (!selectedVideo?.title) return;
    const prevTitle = document.title;
    document.title = `${selectedVideo.title} - Video Kegiatan Korwilcam Purwodadi`;

    const updateMeta = (prop: string, val: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    const updateNameMeta = (name: string, val: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    const thumb = selectedVideo.thumbnailUrl || (selectedVideo.youtubeId ? `https://img.youtube.com/vi/${selectedVideo.youtubeId}/hqdefault.jpg` : 'https://korwilcampurwodadi.web.id/logo.png');
    const desc = selectedVideo.description || `Tonton video dokumentasi kegiatan ${selectedVideo.title} di Portal Resmi Korwilcam Purwodadi.`;

    updateMeta('og:title', selectedVideo.title);
    updateMeta('og:description', desc);
    updateMeta('og:image', thumb);
    updateMeta('og:image:secure_url', thumb);
    updateMeta('og:image:type', 'image/jpeg');
    updateMeta('og:image:width', '480');
    updateMeta('og:image:height', '360');
    updateMeta('og:url', canonicalUrl);
    updateMeta('og:type', 'video.other');
    updateMeta('og:site_name', 'Korwilcam Purwodadi');

    updateNameMeta('twitter:card', 'summary_large_image');
    updateNameMeta('twitter:title', selectedVideo.title);
    updateNameMeta('twitter:description', desc);
    updateNameMeta('twitter:image', thumb);

    return () => {
      document.title = prevTitle;
    };
  }, [selectedVideo, canonicalUrl]);

  const handleShareWhatsApp = () => {
    if (!selectedVideo) return;
    const text = encodeURIComponent(`*${selectedVideo.title}*\n\nTonton video dokumentasi kegiatan resmi Korwilcam Purwodadi selengkapnya di:\n${canonicalUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Video rekomendasi sidebar (diacak/shuffled dan dibatasi maksimal 10 video)
  const relatedVideos = useMemo(() => {
    if (!selectedVideo) return [];
    const others = videos.filter((v) => v.id !== selectedVideo.id);

    let candidates = others;
    if (sidebarFilter === 'school' && selectedVideo.schoolName) {
      const matchSchool = others.filter((v) => 
        (v.schoolName || '').toLowerCase() === (selectedVideo.schoolName || '').toLowerCase()
      );
      if (matchSchool.length > 0) candidates = matchSchool;
    } else if (sidebarFilter === 'category' && selectedVideo.category) {
      const matchCat = others.filter((v) => 
        (v.category || '').toLowerCase() === (selectedVideo.category || '').toLowerCase()
      );
      if (matchCat.length > 0) candidates = matchCat;
    }

    // Algoritma Fisher-Yates untuk mengacak rekomendasi video secara merata (random shuffle)
    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tampilkan hanya 10 video saja
    return shuffled.slice(0, 10);
  }, [videos, selectedVideo?.id, selectedVideo?.schoolName, selectedVideo?.category, sidebarFilter]);

  // 6 Video rekomendasi di bawah media player (diacak secara independen, 1 baris 3 video)
  const bottomRecommendedVideos = useMemo(() => {
    if (!selectedVideo || !videos || videos.length === 0) return [];
    const others = videos.filter((v) => v.id !== selectedVideo.id);

    // Algoritma Fisher-Yates untuk mengacak 6 video pilihan di bawah player
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 6);
  }, [videos, selectedVideo?.id]);

  if (!selectedVideo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          <Film className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Video Tidak Ditemukan</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Video kegiatan yang Anda cari mungkin telah dipindahkan atau tautan yang dimasukkan keliru.
        </p>
        <button
          onClick={handleBackToGallery}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Galeri Video</span>
        </button>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-white pb-20 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-start">
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all group cursor-pointer"
            title="Kembali ke Galeri Video Kegiatan"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Galeri</span>
          </button>
        </div>
      </div>

      {/* Main YouTube-Style Watch Stage */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Kolom Kiri: Player Utama & Detail Khas YouTube */}
          <main className="lg:col-span-8 xl:col-span-8 space-y-3">
            
            {/* 1. Cinema Video Player (Mendukung Layar Penuh di Safari iPhone & Semua HP) */}
            <div 
              ref={playerContainerRef}
              className={
                isFullscreen 
                  ? "fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center w-screen h-screen p-0 m-0"
                  : "relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 group"
              }
            >
              <iframe
                src={embedUrl}
                title={selectedVideo.title}
                className={isFullscreen ? "w-full h-full border-0 max-w-full max-h-full" : "w-full h-full border-0"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />

              {/* Tombol Perbesar Layar Penuh Mengambang (Solusi untuk Safari iPhone / Shorts) */}
              {!isFullscreen ? (
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10 px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg border border-white/20 active:scale-95 cursor-pointer"
                  title="Perbesar Layar Penuh (Full Screen)"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold">Layar Penuh</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="fixed top-4 right-4 z-[10000] px-4 py-2 rounded-full bg-black/85 hover:bg-black text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-2xl border border-white/30 backdrop-blur-md active:scale-95 cursor-pointer"
                  title="Tutup Layar Penuh"
                >
                  <Minimize2 className="w-4 h-4 text-white" />
                  <span>Tutup Layar Penuh</span>
                </button>
              )}
            </div>

            {/* 2. Judul Video (Tepat di bawah player seperti YouTube) */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-snug tracking-tight pt-1">
              {selectedVideo.title}
            </h1>

            {/* 3. Baris Profil Channel/Sekolah & Tombol Aksi Pill Khas YouTube */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 pb-3 border-b border-slate-200/80">
              
              {/* Profil Saluran / Asal Sekolah */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-xs ring-2 ring-slate-100">
                  {selectedVideo.schoolName ? (
                    <Building2 className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm sm:text-base text-slate-900 truncate">
                      {selectedVideo.schoolName || selectedVideo.authorName || 'Humas Korwilcam Purwodadi'}
                    </span>
                    <span className="inline-flex items-center text-slate-400" title="Terverifikasi Resmi">
                      <CheckCircle2 className="w-3.5 h-3.5 fill-slate-500 text-white" />
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1">
                    Dokumentasi Resmi • Korwilcam Purwodadi
                  </p>
                </div>

                {/* Badge Saluran Resmi Khas YouTube (mirip tombol Langganan) */}
                <div className="hidden sm:block ml-1">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xs select-none">
                    Saluran Resmi
                  </span>
                </div>
              </div>

              {/* Tombol Aksi (Layar Penuh & WhatsApp) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Buka video dalam mode Layar Penuh"
                >
                  <Maximize className="w-4 h-4 text-slate-700" />
                  <span>Layar Penuh</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Bagikan video ke WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* 4. Kotak Deskripsi Abu-Abu Khas YouTube */}
            <div 
              onClick={() => setIsDescExpanded(!isDescExpanded)}
              className="bg-slate-100/90 hover:bg-slate-100 rounded-2xl p-4 transition-colors cursor-pointer select-text space-y-2 text-xs sm:text-sm text-slate-800 shadow-2xs mt-3"
            >
              <div className="font-bold text-slate-900 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                <span>{selectedVideo.date}</span>
                {selectedVideo.schoolName && (
                  <span className="text-blue-700 font-bold">• {selectedVideo.schoolName}</span>
                )}
                <span className="text-red-600 font-bold">• #{selectedVideo.category.replace(/\s+/g, '')}</span>
              </div>

              <p className={`whitespace-pre-line leading-relaxed text-slate-700 ${isDescExpanded ? '' : 'line-clamp-2 sm:line-clamp-3'}`}>
                {selectedVideo.description}
              </p>

              <button 
                type="button" 
                className="font-bold text-xs text-slate-900 hover:text-blue-600 transition-colors pt-1"
              >
                {isDescExpanded ? 'Tampilkan lebih sedikit' : '...lebih banyak'}
              </button>
            </div>

            {/* 5. Rekomendasi 6 Video Acak di Bawah Player (1 Baris 3 Video) */}
            {bottomRecommendedVideos.length > 0 && (
              <div className="pt-6 mt-6 border-t border-slate-200/80 space-y-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shadow-2xs">
                    <Film className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-none">
                      Pilihan Video Lainnya
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dokumentasi video kegiatan pilihan se-Kecamatan Purwodadi
                    </p>
                  </div>
                </div>

                {/* Grid 6 Video: 1 Baris Terdiri dari 3 Video */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
                  {bottomRecommendedVideos.map((vid) => (
                    <div
                      key={`bottom-${vid.id}`}
                      onClick={() => {
                        setSelectedVideo(vid);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer flex flex-col bg-slate-50/70 hover:bg-slate-100/90 rounded-2xl p-2 sm:p-2.5 transition-all duration-200 border border-slate-200/70 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                    >
                      {/* Thumbnail 16:9 */}
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-xs">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-white translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/85 text-white text-[10px] font-bold rounded">
                          Video
                        </span>
                      </div>

                      {/* Judul & Detail Informasi */}
                      <div className="flex-1 flex flex-col justify-between pt-2">
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {vid.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1 flex items-center gap-1">
                            <span className="truncate">{vid.schoolName || vid.authorName || 'Humas Korwilcam'}</span>
                            <CheckCircle2 className="w-3 h-3 fill-slate-400 text-white shrink-0" />
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                          <span>{vid.date}</span>
                          <span className="text-red-600 font-semibold truncate max-w-[100px]">{vid.category}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Kolom Kanan: Sidebar Rekomendasi Video Khas YouTube */}
          <aside className="lg:col-span-4 xl:col-span-4 space-y-3">
            {/* Filter Chips Khas YouTube (Semua, Sekolah Terkait, Kategori) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
              <button
                type="button"
                onClick={() => setSidebarFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  sidebarFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                Semua
              </button>

              {selectedVideo.schoolName && (
                <button
                  type="button"
                  onClick={() => setSidebarFilter('school')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    sidebarFilter === 'school'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Dari {selectedVideo.schoolName}
                </button>
              )}

              <button
                type="button"
                onClick={() => setSidebarFilter('category')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  sidebarFilter === 'category'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {selectedVideo.category}
              </button>
            </div>

            {/* Daftar Video Terkait dalam Format Baris Horizontal Khas YouTube */}
            <div className="space-y-3">
              {relatedVideos.map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideo(vid);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group flex gap-2.5 sm:gap-3 cursor-pointer p-1.5 -mx-1.5 rounded-xl hover:bg-slate-100/90 transition-colors"
                >
                  {/* Thumbnail 16:9 di Kiri */}
                  <div className="relative w-36 sm:w-40 aspect-video rounded-xl overflow-hidden bg-black shrink-0 shadow-xs">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-md">
                        <Play className="w-3 h-3 fill-white translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/85 text-white text-[10px] font-bold rounded">
                      Video
                    </span>
                  </div>

                  {/* Keterangan di Kanan */}
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {vid.title}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium line-clamp-1 mt-1 flex items-center gap-1">
                      <span className="truncate">{vid.schoolName || vid.authorName || 'Humas Korwilcam'}</span>
                      <CheckCircle2 className="w-3 h-3 fill-slate-400 text-white shrink-0" />
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">
                      {vid.date} • {vid.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </div>
    </article>
  );
};
