import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  User, 
  Film, 
  MessageCircle, 
  Building2, 
  CheckCircle2,
  Maximize,
  Minimize2,
  Play,
  Pause
} from 'lucide-react';
import { GalleryVideoItem } from '../types';
import { getVideoDetailPath, getYouTubeEmbedUrl, getGoogleDriveEmbedUrl } from '../lib/youtubeHelper';

export const VideoDetailPage: React.FC = () => {
  const { 
    selectedVideo, 
    setSelectedVideo, 
    videos, 
    setActiveTab, 
    setGalleryActiveTab
  } = useApp();

  const [isDescExpanded, setIsDescExpanded] = useState<boolean>(false);

  // State & Ref Layar Penuh (Fullscreen) untuk kompatibilitas iPhone Safari & seluruh ponsel
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // State Pemutar Video Native untuk Google Drive & Orientasi Vertikal / Horizontal
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [useIframeFallback, setUseIframeFallback] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Deteksi Video Google Drive vs YouTube
  const isDriveVideo = useMemo(() => {
    if (!selectedVideo) return false;
    return (
      selectedVideo.videoSource === 'drive' ||
      !!selectedVideo.driveFileId ||
      (selectedVideo.embedUrl && selectedVideo.embedUrl.includes('drive.google.com')) ||
      (selectedVideo.youtubeId && selectedVideo.youtubeId.length > 15)
    );
  }, [selectedVideo]);

  const driveFileId = useMemo(() => {
    if (!selectedVideo) return '';
    return selectedVideo.driveFileId || (selectedVideo.youtubeId && selectedVideo.youtubeId.length > 15 ? selectedVideo.youtubeId : '');
  }, [selectedVideo]);

  // URL Stream Langsung Google Drive untuk pemutar video HTML5 (Melalui endpoint serverless bebas hambatan CORS & CORP)
  const driveStreamUrl = useMemo(() => {
    if (!driveFileId) return '';
    return `/api/video-stream?id=${encodeURIComponent(driveFileId)}`;
  }, [driveFileId]);

  // URL Poster / Sampul video beresolusi tinggi
  const posterUrl = useMemo(() => {
    if (!selectedVideo) return '/gallery/cover-7-agustus-2026.jpg';
    if (isDriveVideo && driveFileId) {
      return `https://lh3.googleusercontent.com/d/${driveFileId}=s1200`;
    }
    return selectedVideo.thumbnailUrl || (selectedVideo.youtubeId ? `https://img.youtube.com/vi/${selectedVideo.youtubeId}/maxresdefault.jpg` : '/gallery/cover-7-agustus-2026.jpg');
  }, [selectedVideo, isDriveVideo, driveFileId]);

  // Deteksi otomatis orientasi vertikal (Shorts / Portrait 9:16) vs horizontal
  useEffect(() => {
    if (!selectedVideo) return;
    setIsPlaying(false);
    setHasStarted(false);
    setCurrentTime(0);
    setDuration(0);
    setUseIframeFallback(false);
    setIsVertical(false);

    // Deteksi jika link adalah YouTube Shorts
    if (selectedVideo.youtubeUrl?.includes('/shorts/') || selectedVideo.embedUrl?.includes('/shorts/')) {
      setIsVertical(true);
    }

    // Deteksi orientasi dari gambar thumbnail/poster
    const checkUrl = posterUrl || selectedVideo.thumbnailUrl;
    if (checkUrl) {
      const img = new Image();
      img.onload = () => {
        if (img.naturalHeight > img.naturalWidth * 1.05) {
          setIsVertical(true);
        }
      };
      img.src = checkUrl;
    }
  }, [selectedVideo?.id, posterUrl]);

  const handleStartPlay = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handleTogglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

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
  }, [selectedVideo?.id]);

  // URL Embed Resmi: Mendukung Pemutar YouTube Bebas Error 153 & Pemutar Google Drive
  const embedUrl = useMemo(() => {
    if (!selectedVideo) return '';
    if (selectedVideo.videoSource === 'drive' || selectedVideo.driveFileId) {
      const driveId = selectedVideo.driveFileId || selectedVideo.youtubeId;
      return getGoogleDriveEmbedUrl(driveId);
    }
    if (selectedVideo.embedUrl && selectedVideo.embedUrl.includes('drive.google.com')) {
      return selectedVideo.embedUrl;
    }
    if (selectedVideo.youtubeId && selectedVideo.youtubeId.length > 15) {
      return getGoogleDriveEmbedUrl(selectedVideo.youtubeId);
    }
    if (selectedVideo.youtubeId) {
      return getYouTubeEmbedUrl(selectedVideo.youtubeId, true);
    }
    return selectedVideo.embedUrl || '';
  }, [selectedVideo]);

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

    const isDrive = selectedVideo.videoSource === 'drive' || !!selectedVideo.driveFileId || (selectedVideo.youtubeId && selectedVideo.youtubeId.length > 15);
    const thumb = selectedVideo.thumbnailUrl || (
      isDrive
        ? `https://lh3.googleusercontent.com/d/${selectedVideo.driveFileId || selectedVideo.youtubeId}=s640`
        : selectedVideo.youtubeId
        ? `https://img.youtube.com/vi/${selectedVideo.youtubeId}/hqdefault.jpg`
        : 'https://korwilcampurwodadi.web.id/logo.png'
    );
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
    if (!selectedVideo || !videos || videos.length === 0) return [];
    const others = videos.filter((v) => v.id !== selectedVideo.id);

    // Algoritma Fisher-Yates untuk mengacak rekomendasi video secara merata (random shuffle)
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Tampilkan hanya 10 video saja
    return shuffled.slice(0, 10);
  }, [videos, selectedVideo?.id]);

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
            
            {/* 1. Cinema Video Player (Mendukung Layar Penuh di Safari iPhone & Semua HP, Responsif Vertikal / Horizontal) */}
            <div 
              ref={playerContainerRef}
              className={
                isFullscreen 
                  ? "fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center w-screen h-screen p-0 m-0"
                  : isVertical
                  ? "relative aspect-[4/5] sm:aspect-video w-full max-h-[75vh] sm:max-h-[600px] rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 group"
                  : "relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-lg border border-black/10 group"
              }
            >
              {isDriveVideo && !useIframeFallback ? (
                /* Pemutar Video Native Khas YouTube Khusus Google Drive (Tampilan 100% Bersih Bebas 3 Tombol Tengah di HP) */
                <div 
                  className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden select-none"
                  onClick={handleTogglePlay}
                  onMouseMove={resetControlsTimeout}
                  onTouchStart={resetControlsTimeout}
                >
                  <video
                    ref={videoRef}
                    src={driveStreamUrl}
                    poster={posterUrl}
                    controls={false}
                    playsInline
                    preload="metadata"
                    className="clean-media-player w-full h-full object-contain bg-black cursor-pointer"
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                        setDuration(videoRef.current.duration || 0);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration || 0);
                      }
                    }}
                    onPlay={() => {
                      setIsPlaying(true);
                      setHasStarted(true);
                      resetControlsTimeout();
                    }}
                    onPause={() => {
                      setIsPlaying(false);
                      setShowControls(true);
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      setHasStarted(false);
                      setCurrentTime(0);
                      setShowControls(true);
                    }}
                    onError={() => {
                      console.warn('Gagal memuat video stream langsung, beralih ke pemutar Google Drive.');
                      if (hasStarted) {
                        setUseIframeFallback(true);
                      }
                    }}
                  >
                    <source src={driveStreamUrl} type="video/mp4" />
                  </video>

                  {/* 1. Tampilan Poster & Tombol Putar Awal Khas YouTube (Hanya Tampil Sebelum Pertama Kali Diputar) */}
                  {!hasStarted && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartPlay();
                      }}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer group/overlay bg-black/40 hover:bg-black/25 transition-all"
                      title="Klik untuk memutar video"
                    >
                      {/* Latar Belakang Poster Blur untuk Mempercantik Ruang Samping */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-35 pointer-events-none scale-110"
                        style={{ backgroundImage: `url(${posterUrl})` }}
                      />

                      {/* Poster Gambar Utama yang Tajam di Tengah */}
                      <img 
                        src={posterUrl} 
                        alt={selectedVideo.title}
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                        }}
                      />

                      {/* Header Video Overlay Khas YouTube (Judul & Badge di Atas) */}
                      <div className="absolute top-0 inset-x-0 p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-white pointer-events-none z-20">
                        <div className="flex items-center gap-2 min-w-0 pr-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-600 text-white shrink-0 shadow-xs">
                            {isVertical ? 'Shorts / Vertikal' : 'Video'}
                          </span>
                          <p className="text-xs sm:text-sm font-semibold truncate drop-shadow-md">
                            {selectedVideo.title}
                          </p>
                        </div>
                      </div>

                      {/* Tombol Play Besar Ikonik Merah Khas YouTube di Tengah (Hanya Tampil Sebelum Video Dimulai) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartPlay();
                        }}
                        className="relative z-20 w-16 h-12 sm:w-20 sm:h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover/overlay:scale-110 active:scale-95 cursor-pointer border border-white/20"
                        title="Putar Video"
                      >
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white translate-x-0.5" />
                      </button>

                      {/* Info Kategori & Sekolah di Pojok Bawah */}
                      <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-2 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/75 text-white/95 backdrop-blur-md shadow-xs">
                          {selectedVideo.category || 'Kegiatan'}
                        </span>
                        {selectedVideo.schoolName && (
                          <span className="text-[11px] text-white/90 font-medium drop-shadow-md hidden xs:inline">
                            {selectedVideo.schoolName}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 
                    2. BAGIAN TENGAH LAYAR DIJAGA 100% BERSIH DARI 3 TOMBOL (Play, Mundur 10s, Maju 10s).
                    TIDAK ADA TOMBOL DI TENGAH LAYAR HP, SEHINGGA KEGIATAN & WAJAH SISWA TERLIHAT JELAS TANPA TERHALANG.
                  */}

                  {/* 3. Panel Kontrol Bawah (Play/Pause, Durasi Waktu, Garis Geser Progres & Layar Penuh) */}
                  {hasStarted && (
                    <div 
                      className={`absolute bottom-0 inset-x-0 z-20 px-3 sm:px-4 pb-2.5 pt-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-1.5 transition-opacity duration-300 select-none ${
                        showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Baris Scrubber Garis Progres Interaktif */}
                      <div 
                        className="relative w-full h-4 flex items-center cursor-pointer group/seek"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (videoRef.current && duration > 0) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                            videoRef.current.currentTime = pos * duration;
                            setCurrentTime(pos * duration);
                            resetControlsTimeout();
                          }
                        }}
                      >
                        <div className="w-full h-1 group-hover/seek:h-1.5 bg-white/30 rounded-full overflow-hidden transition-all">
                          <div 
                            className="h-full bg-red-600 rounded-full transition-all duration-75"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        {/* Bulatan Penunjuk Posisi (Thumb) */}
                        <div 
                          className="absolute w-3 h-3 bg-red-600 rounded-full shadow-md -translate-x-1/2 pointer-events-none transition-transform group-hover/seek:scale-125"
                          style={{ left: `${progressPercent}%` }}
                        />
                      </div>

                      {/* Baris Tombol Kontrol Bawah */}
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                          {/* Tombol Play / Pause di Sudut Kiri Bawah */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlay();
                              resetControlsTimeout();
                            }}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
                            title={isPlaying ? "Jeda Video" : "Putar Video"}
                          >
                            {isPlaying ? (
                              <Pause className="w-4 h-4 fill-white text-white" />
                            ) : (
                              <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                            )}
                          </button>

                          {/* Indikator Waktu Menit:Detik (Contoh: 0:09 / 0:46) */}
                          <span className="text-xs font-semibold text-white/95 select-none tracking-tight">
                            {formatTime(currentTime)} / {formatTime(duration)}
                          </span>
                        </div>

                        {/* Tombol Layar Penuh di Sudut Kanan Bawah */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFullscreen();
                          }}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition cursor-pointer"
                          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="w-4 h-4 text-white" />
                          ) : (
                            <Maximize className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Pemutar Iframe YouTube atau Fallback Google Drive (Dengan pemangkasan bilah atas Google Drive jika mode iframe) */
                <iframe
                  src={embedUrl}
                  title={selectedVideo.title}
                  className={
                    isFullscreen 
                      ? "w-full h-full border-0 max-w-full max-h-full" 
                      : isDriveVideo
                      ? "w-full h-[calc(100%+48px)] -mt-12 border-0"
                      : "w-full h-full border-0"
                  }
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              )}

              {/* Tombol Tutup Layar Penuh (Hanya Muncul Saat Pengunjung Berada di Mode Layar Penuh) */}
              {isFullscreen && (
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

          {/* Kolom Kanan: Sidebar Rekomendasi Video Khas YouTube (Sejajar dengan Puncak Media Player) */}
          <aside className="lg:col-span-4 xl:col-span-4 lg:-mt-1.5">
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
