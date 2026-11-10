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
  Building2
} from 'lucide-react';
import { GalleryVideoItem } from '../types';
import { getVideoDetailPath, getYouTubeEmbedUrl } from '../lib/youtubeHelper';
import { VideoGalleryCard } from '../components/VideoGalleryCard';

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

  const handleBackToGallery = () => {
    setSelectedVideo(null);
    setGalleryActiveTab('video');
    setActiveTab('gallery', '/galeri?tab=video');
  };

  // Scroll to top when video detail opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
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

  // Video terkait lainnya (kecuali video yang sedang ditonton)
  const relatedVideos = useMemo(() => {
    if (!selectedVideo) return [];
    return videos
      .filter((v) => v.id !== selectedVideo.id)
      .slice(0, 4);
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
    <article className="min-h-screen bg-slate-50/60 pb-24 animate-in fade-in duration-200">
      {/* Top Breadcrumbs & Back Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={handleBackToGallery}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-bold transition-all group"
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
            <span className="text-red-600 font-semibold truncate max-w-[200px]">
              {selectedVideo.category}
            </span>
          </nav>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Kolom Kiri (8 Kolom): Cinema Media Player & Detail Video */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* 1. Cinema 16:9 Video Player Container */}
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-800 ring-1 ring-slate-900/10">
              <iframe
                src={embedUrl}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            {/* 2. Video Metadata Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-5">
              
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-600 text-white shadow-xs flex items-center gap-1.5">
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>Video Kegiatan</span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedVideo.category}
                </span>
                {selectedVideo.schoolName && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{selectedVideo.schoolName}</span>
                  </span>
                )}
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase ml-auto hidden sm:inline">
                  Saluran Dokumentasi YouTube
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                {selectedVideo.title}
              </h1>

              {/* Metadata Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedVideo.date}</span>
                  </div>

                  {selectedVideo.schoolName && (
                    <div className="flex items-center gap-1.5 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        Asal Sekolah: <strong className="text-slate-800">{selectedVideo.schoolName}</strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      Penyelenggara / Pengunggah: <strong className="text-slate-800">{selectedVideo.authorName || 'Humas Korwilcam Purwodadi'}</strong>
                    </span>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                    title={copied ? 'Tautan berhasil disalin!' : 'Salin Tautan Video'}
                    aria-label="Salin Tautan Video"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-700" />}
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                    title="Bagikan ke WhatsApp"
                    aria-label="Bagikan ke WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="w-9 h-9 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
                    title="Bagikan ke Facebook"
                    aria-label="Bagikan ke Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </button>

                  <a
                    href={selectedVideo.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition-all border border-red-200 shadow-2xs hover:scale-105 active:scale-95"
                    title="Buka langsung di aplikasi YouTube"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Video Description */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Keterangan Kegiatan
                </h3>
                <p className="text-slate-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                  {selectedVideo.description}
                </p>
              </div>

            </div>
          </main>

          {/* Kolom Kanan (4 Kolom): Sidebar Rekomendasi Video Lainnya */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3.5 border-b-2 border-red-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-500" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase">
                    VIDEO LAINNYA
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Dokumentasi
                </span>
              </div>

              {/* Daftar Video Terkait */}
              <div className="space-y-3.5">
                {relatedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setSelectedVideo(vid);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group flex items-start gap-3 cursor-pointer p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative w-24 h-16 sm:w-26 sm:h-17 rounded-lg overflow-hidden bg-slate-900 shrink-0 shadow-xs">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-md">
                          <Play className="w-2.5 h-2.5 fill-white translate-x-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                        {vid.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mt-0.5">
                        {vid.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {vid.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </article>
  );
};
