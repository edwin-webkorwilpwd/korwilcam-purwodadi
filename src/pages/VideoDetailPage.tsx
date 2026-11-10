import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Share2, 
  Copy, 
  Check, 
  User, 
  Film, 
  ChevronRight, 
  ExternalLink, 
  Play, 
  Sparkles,
  MessageCircle,
  Video as VideoIcon,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { GalleryVideoItem } from '../types';
import { getVideoDetailPath, getYouTubeEmbedUrl } from '../lib/youtubeHelper';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const VideoDetailPage: React.FC = () => {
  const { 
    selectedVideo, 
    setSelectedVideo, 
    videos, 
    setActiveTab, 
    showToast,
    setGalleryActiveTab
  } = useApp();

  const [copied, setCopied] = useState<boolean>(false);
  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'school' | 'category'>('all');

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

  // Update dynamic page title
  useEffect(() => {
    if (!selectedVideo?.title) return;
    const prevTitle = document.title;
    document.title = `${selectedVideo.title} - Video Kegiatan Korwilcam Purwodadi`;
    return () => {
      document.title = prevTitle;
    };
  }, [selectedVideo?.title]);

  // URL Kanonikal resmi untuk dibagikan
  const siteOrigin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://korwilcampurwodadi.web.id';

  const canonicalUrl = selectedVideo 
    ? `${siteOrigin}${getVideoDetailPath(selectedVideo)}`
    : (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    showToast('Tautan video berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    if (!selectedVideo) return;
    const text = encodeURIComponent(`*${selectedVideo.title}*\n\nTonton video dokumentasi kegiatan resmi Korwilcam Purwodadi selengkapnya di:\n${canonicalUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`, '_blank');
  };

  // Video rekomendasi sidebar (disaring berdasarkan filter chip khas YouTube)
  const relatedVideos = useMemo(() => {
    if (!selectedVideo) return [];
    const others = videos.filter((v) => v.id !== selectedVideo.id);

    if (sidebarFilter === 'school' && selectedVideo.schoolName) {
      const matchSchool = others.filter((v) => 
        (v.schoolName || '').toLowerCase() === (selectedVideo.schoolName || '').toLowerCase()
      );
      return matchSchool.length > 0 ? matchSchool : others;
    }

    if (sidebarFilter === 'category' && selectedVideo.category) {
      const matchCat = others.filter((v) => 
        (v.category || '').toLowerCase() === (selectedVideo.category || '').toLowerCase()
      );
      return matchCat.length > 0 ? matchCat : others;
    }

    return others;
  }, [videos, selectedVideo?.id, selectedVideo?.schoolName, selectedVideo?.category, sidebarFilter]);

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
      {/* Top Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition-all group cursor-pointer"
            title="Kembali ke Galeri Video Kegiatan"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Galeri</span>
          </button>

          {/* Breadcrumb Path */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
            <button 
              onClick={() => {
                setSelectedVideo(null);
                setActiveTab('home');
              }}
              className="hover:text-blue-600 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button 
              onClick={handleBackToGallery}
              className="hover:text-blue-600 transition-colors"
              title="Kembali ke Galeri Video Kegiatan"
            >
              Galeri
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-800 font-semibold truncate max-w-[200px]">
              {selectedVideo.category}
            </span>
          </nav>
        </div>
      </div>

      {/* Main YouTube-Style Watch Stage */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Kolom Kiri: Player Utama & Detail Khas YouTube */}
          <main className="lg:col-span-8 xl:col-span-8 space-y-3">
            
            {/* 1. Cinema 16:9 Video Player */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10">
              <iframe
                src={embedUrl}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
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

              {/* Tombol Aksi Pill Khas YouTube (Bagikan, Salin Link, Buka YouTube) */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Tombol Bagikan WhatsApp */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Bagikan video ke WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
                  <span>Bagikan</span>
                </button>

                {/* Tombol Salin Tautan */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Salin Tautan Video"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
                </button>

                {/* Tombol Bagikan Facebook */}
                <button
                  type="button"
                  onClick={handleShareFacebook}
                  className="p-2 sm:px-3 sm:py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                  title="Bagikan ke Facebook"
                >
                  <FacebookIcon className="w-4 h-4 text-blue-600" />
                  <span className="hidden sm:inline">Facebook</span>
                </button>

                {/* Tombol Buka di YouTube */}
                <a
                  href={selectedVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all active:scale-95 border border-red-200/70 shadow-2xs"
                  title="Buka langsung di aplikasi YouTube"
                >
                  <span>Buka di YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
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
