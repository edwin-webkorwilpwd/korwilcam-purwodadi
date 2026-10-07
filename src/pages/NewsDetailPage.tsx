import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Eye, 
  User, 
  Share2, 
  Tag, 
  Check, 
  Copy, 
  MessageCircle, 
  Sparkles, 
  BookOpen, 
  Clock,
  ChevronRight,
  ChevronLeft,
  FileText,
  ZoomIn,
  X
} from 'lucide-react';
import { NewsCard } from '../components/NewsCard';
import { getArticleReadingStats } from '../lib/readingTime';
import { paginateArticleContent } from '../lib/articlePaginator';
import { getNewsShortUrl, getNewsShortCode } from '../lib/shortLink';
import { stripHtml } from '../lib/stripHtml';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import { formatGoogleDriveImageUrl } from '../lib/driveHelper';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export const NewsDetailPage: React.FC = () => {
  const { 
    selectedNews, 
    setSelectedNews, 
    news, 
    setActiveTab, 
    showToast, 
    incrementNewsViews,
    recordNewsReadingTime 
  } = useApp();
  const [copied, setCopied] = React.useState(false);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);

  // Close image zoom on Escape key
  useEffect(() => {
    if (!isImageZoomed) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsImageZoomed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageZoomed]);

  // Article Pagination State (Mode pembacaan per halaman: 600 kata per halaman)
  const [currentPage, setCurrentPage] = React.useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') || params.get('halaman') || '1', 10);
      return isNaN(p) || p < 1 ? 1 : p;
    }
    return 1;
  });
  const [showAllPages, setShowAllPages] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('page') === 'all';
    }
    return false;
  });
  const articleBodyRef = React.useRef<HTMLDivElement>(null);

  // Active reading duration tracker state & refs
  const activeReadingSecondsRef = React.useRef(0);
  const isTabVisibleRef = React.useRef(!document.hidden);
  const lastActiveTimestampRef = React.useRef(Date.now());
  const recordedSecondsRef = React.useRef(0);

  // Stable references to context functions
  const incrementNewsViewsRef = React.useRef(incrementNewsViews);
  incrementNewsViewsRef.current = incrementNewsViews;

  const recordNewsReadingTimeRef = React.useRef(recordNewsReadingTime);
  recordNewsReadingTimeRef.current = recordNewsReadingTime;

  // 1. Scroll ke paling atas HANYA SEKALI saat pertama kali membuka artikel baru
  const lastScrolledArticleIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (selectedNews?.id && lastScrolledArticleIdRef.current !== selectedNews.id) {
      lastScrolledArticleIdRef.current = selectedNews.id;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedNews?.id]);

  // 2. Track & hitung jumlah tayangan berita: bertambah setiap kali artikel dibuka atau direfresh
  const lastTrackedIdRef = React.useRef<string | null>(null);
  const currentNewsId = selectedNews?.id;

  useEffect(() => {
    if (!currentNewsId) return;

    // Hanya eksekusi 1 kali per artikel per mount / refresh / navigasi
    if (lastTrackedIdRef.current === currentNewsId) return;
    lastTrackedIdRef.current = currentNewsId;

    // Bersihkan kunci sessionStorage lama agar tidak ada lagi pemblokiran penayangan
    try {
      sessionStorage.removeItem(`viewed_news_${currentNewsId}`);
    } catch {}

    // Tambahkan tayangan langsung
    incrementNewsViewsRef.current(currentNewsId);
  }, [currentNewsId]);

  // 3. Deteksi durasi aktif membaca dan akumulasi rata-rata membaca secara riil
  useEffect(() => {
    if (!selectedNews?.id) return;
    const newsId = selectedNews.id;

    // Reset timer session for the selected news article
    activeReadingSecondsRef.current = 0;
    recordedSecondsRef.current = 0;
    lastActiveTimestampRef.current = Date.now();
    isTabVisibleRef.current = !document.hidden;

    // Flush active reading seconds to database and state
    const flushReadingTime = () => {
      const activeTotal = activeReadingSecondsRef.current;
      const alreadyRecorded = recordedSecondsRef.current;
      const delta = activeTotal - alreadyRecorded;

      // Hanya rekam jika pembaca setidaknya aktif membaca minimal 5 detik
      if (activeTotal >= 5 && delta > 0) {
        const isFirstRecord = alreadyRecorded === 0;
        recordedSecondsRef.current = activeTotal;
        recordNewsReadingTimeRef.current(newsId, delta, isFirstRecord);
      }
    };

    // Deteksi aktivitas pembaca (scroll, mouse, touch, keyboard)
    const onUserActivity = () => {
      lastActiveTimestampRef.current = Date.now();
    };

    const activityEvents = ['scroll', 'mousemove', 'keydown', 'touchstart', 'click'];
    activityEvents.forEach((evt) => window.addEventListener(evt, onUserActivity, { passive: true }));

    // Jeda timer saat pembaca berpindah tab browser / minimize
    const onVisibilityChange = () => {
      const isVisible = !document.hidden;
      isTabVisibleRef.current = isVisible;
      if (isVisible) {
        lastActiveTimestampRef.current = Date.now();
      } else {
        // Tab tidak aktif -> simpan durasi baca yang telah dicapai
        flushReadingTime();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Rekam saat halaman ditutup / berpindah
    const onPageExit = () => {
      flushReadingTime();
    };
    window.addEventListener('pagehide', onPageExit);
    window.addEventListener('beforeunload', onPageExit);

    // Interval deteksi waktu membaca aktif setiap 1 detik
    const timer = setInterval(() => {
      const now = Date.now();
      // Aktif jika tab terlihat dan ada aktivitas pembaca dalam 60 detik terakhir
      const isActive = isTabVisibleRef.current && (now - lastActiveTimestampRef.current < 60000);

      if (isActive) {
        // Batasi maksimal 15 menit per sesi baca untuk mencegah outlier tab ditinggal tidur
        if (activeReadingSecondsRef.current < 900) {
          activeReadingSecondsRef.current += 1;
        }
      }

      // Auto-flush berkala tiap 20 detik setelah pembaca melewati 10 detik
      if (activeReadingSecondsRef.current >= 10 && activeReadingSecondsRef.current - recordedSecondsRef.current >= 20) {
        flushReadingTime();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, onUserActivity));
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', onPageExit);
      window.removeEventListener('beforeunload', onPageExit);
      // Flush saat komponen unmount / tombol kembali diklik
      flushReadingTime();
    };
  }, [selectedNews?.id]);

  if (!selectedNews) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Berita tidak ditemukan</h2>
        <p className="text-slate-600 text-sm">Berita yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
        <button
          onClick={() => {
            setSelectedNews(null);
            setActiveTab('news');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Berita & Informasi</span>
        </button>
      </div>
    );
  }

  const shortUrl = selectedNews ? getNewsShortUrl(selectedNews) : '';

  const handleCopyLink = () => {
    const linkToCopy = shortUrl || window.location.href;
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    showToast('Tautan ringkas berita berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const linkToShare = shortUrl || window.location.href;
    const pageLabel = isPaginated && currentPage > 1 ? ` (Hal. ${currentPage})` : '';
    const text = encodeURIComponent(`*${selectedNews.title}*${pageLabel}\n\nBaca selengkapnya di Portal Resmi Korwilcam Purwodadi:\n${linkToShare}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    const linkToShare = shortUrl || window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkToShare)}`, '_blank');
  };

  // Berita terpopuler (berdasarkan views terbanyak, kecuali artikel yang sedang dibaca)
  const popularNews = React.useMemo(() => {
    return [...news]
      .filter((item) => item.id !== selectedNews.id)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);
  }, [news, selectedNews.id]);

  const topPopular = popularNews[0] || null;
  const remainingPopular = popularNews.slice(1);

  // Berita terbaru (berdasarkan urutan / tanggal, kecuali artikel saat ini dan hero populer)
  const latestNews = React.useMemo(() => {
    return [...news]
      .filter((item) => item.id !== selectedNews.id && item.id !== topPopular?.id)
      .slice(0, 4);
  }, [news, selectedNews.id, topPopular?.id]);

  // Berita Lainnya sebagai rekomendasi di bagian bawah halaman
  const otherNews = React.useMemo(() => {
    return [...news]
      .filter((item) => item.id !== selectedNews.id && !popularNews.some((p) => p.id === item.id))
      .slice(0, 3);
  }, [news, selectedNews.id, popularNews]);

  const handleSelectArticle = (article: (typeof news)[0]) => {
    setSelectedNews(article);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Perhitungan durasi membaca & rata-rata riil dari seluruh pembaca
  const readStats = getArticleReadingStats(selectedNews);

  // Fungsi pembantu untuk sinkronisasi query parameter ?page=... di URL address bar
  const updateUrlPageParam = React.useCallback((page: number | 'all', replace: boolean = false) => {
    if (typeof window === 'undefined') return;
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', String(page));
      if (replace) {
        window.history.replaceState({ page }, '', url.toString());
      } else {
        window.history.pushState({ page }, '', url.toString());
      }
    } catch (e) {
      console.warn('Gagal memperbarui URL page:', e);
    }
  }, []);

  // Baca URL query parameter saat berita dimuat atau berpindah
  useEffect(() => {
    if (!selectedNews?.id) return;
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page') || params.get('halaman');
    if (pageParam === 'all') {
      setShowAllPages(true);
    } else {
      const p = parseInt(pageParam || '1', 10);
      const targetP = isNaN(p) || p < 1 ? 1 : p;
      setCurrentPage(targetP);
      setShowAllPages(false);
      // Pastikan URL selalu memiliki parameter ?page=... (misal ?page=1)
      updateUrlPageParam(targetP, true);
    }
  }, [selectedNews?.id, updateUrlPageParam]);

  // Tangani navigasi tombol Back/Forward browser
  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page') || params.get('halaman');
      if (pageParam === 'all') {
        setShowAllPages(true);
      } else {
        const p = parseInt(pageParam || '1', 10);
        const targetP = isNaN(p) || p < 1 ? 1 : p;
        setCurrentPage(targetP);
        setShowAllPages(false);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const WORDS_PER_PAGE = 600;
  const paginationData = React.useMemo(() => {
    if (!selectedNews?.content) {
      return { pages: [], totalWords: 0, totalPages: 0 };
    }
    return paginateArticleContent(selectedNews.content, WORDS_PER_PAGE);
  }, [selectedNews?.content]);

  // Pastikan currentPage tidak melebihi totalPages jika URL query param di luar batas
  useEffect(() => {
    if (paginationData.totalPages > 0 && currentPage > paginationData.totalPages) {
      setCurrentPage(paginationData.totalPages);
      updateUrlPageParam(paginationData.totalPages, true);
    }
  }, [paginationData.totalPages, currentPage, updateUrlPageParam]);

  const isPaginated = paginationData.totalPages > 1 && !showAllPages;
  const activePageData = isPaginated
    ? paginationData.pages[currentPage - 1] || paginationData.pages[0]
    : null;

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > paginationData.totalPages) return;
    setCurrentPage(newPage);
    setShowAllPages(false);
    updateUrlPageParam(newPage, false);

    if (articleBodyRef.current) {
      const yOffset = -90;
      const y = articleBodyRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleToggleAllPages = () => {
    const nextShowAll = !showAllPages;
    setShowAllPages(nextShowAll);
    if (nextShowAll) {
      updateUrlPageParam('all', false);
    } else {
      updateUrlPageParam(currentPage, false);
    }

    if (articleBodyRef.current) {
      const yOffset = -90;
      const y = articleBodyRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <article className="min-h-screen bg-slate-50/60 pb-24 animate-in fade-in duration-200">
      {/* Top Breadcrumbs & Back Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedNews(null);
              setActiveTab('news');
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs sm:text-sm font-bold transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Berita</span>
          </button>

          {/* Breadcrumb path */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
            <button 
              onClick={() => {
                setSelectedNews(null);
                setActiveTab('home');
              }}
              className="hover:text-blue-600 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button 
              onClick={() => {
                setSelectedNews(null);
                setActiveTab('news');
              }}
              className="hover:text-blue-600 transition-colors"
            >
              Berita & Informasi
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-blue-700 font-semibold truncate max-w-[200px]">
              {selectedNews.category}
            </span>
          </nav>
        </div>
      </div>

      {/* 2-Column Responsive Layout Sesuai Gambar 2 Pengguna */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Kolom Kiri (8 Kolom): Naskah Berita Lengkap */}
          <main className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xs space-y-6">
              
              {/* Kategori & Label Portal */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-xs">
                  {selectedNews.category}
                </span>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Warta Resmi Korwilcam Purwodadi
                </span>
              </div>

              {/* Judul Utama Artikel (Headline) */}
              <h1 className="text-2xl sm:text-3xl md:text-[34px] font-black text-slate-900 tracking-tight leading-snug">
                {selectedNews.title}
              </h1>

              {/* Baris Informasi Metadata (Tanggal, Penulis, Tayangan, Durasi Baca) */}
              <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>{selectedNews.date}</span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    Oleh: <strong className="text-slate-800">{selectedNews.author}</strong>
                    {selectedNews.authorRole && (
                      <span className="ml-1 text-slate-400 font-normal">({selectedNews.authorRole})</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-medium">
                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                  <span>{selectedNews.views || 1} Kali Dilihat</span>
                </div>

                <div 
                  className="flex items-center gap-1.5 font-medium text-slate-500 cursor-help"
                  title={readStats.detailed}
                >
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>{readStats.text}</span>
                </div>
              </div>

              {/* Foto Sampul Berita (Proporsional di dalam kolom naskah sesuai Gambar 2) */}
              {selectedNews.image && (
                <div 
                  onClick={() => setIsImageZoomed(true)}
                  className="group relative rounded-2xl overflow-hidden shadow-xs border border-slate-200 bg-slate-100 cursor-pointer"
                  title="Klik untuk memperbesar gambar sampul"
                >
                  <img
                    src={formatGoogleDriveImageUrl(selectedNews.image, 1600)}
                    alt={selectedNews.title}
                    decoding="async"
                    fetchPriority="high"
                    className="w-full max-h-[440px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                    }}
                  />
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 group-hover:bg-black/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all shadow-md select-none">
                    <ZoomIn className="w-3 h-3 text-amber-300" />
                    <span>Perbesar foto</span>
                  </div>
                </div>
              )}

              {/* Isi Teks Naskah Berita */}
              <div ref={articleBodyRef} className="article-body min-h-[140px] pt-1">
                {isPaginated && activePageData ? (
                  activePageData.isHtml ? (
                    <div 
                      className="prose prose-slate max-w-none text-slate-800 leading-relaxed sm:text-[16.5px]"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(activePageData.content) }}
                    />
                  ) : (
                    <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed sm:text-[16.5px]">
                      {activePageData.content.split(/\n+/).filter(Boolean).map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  )
                ) : selectedNews.content.includes('<') ? (
                  <div 
                    className="prose prose-slate max-w-none text-slate-800 leading-relaxed sm:text-[16.5px]"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedNews.content) }}
                  />
                ) : (
                  <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed sm:text-[16.5px]">
                    {selectedNews.content.split(/\n+/).filter(Boolean).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigasi Pagination Nomor Halaman Lengkap */}
              {paginationData.totalPages > 1 && (
                <div className="pt-6 border-t border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                      {showAllPages ? (
                        <span>Menampilkan <strong>seluruh artikel</strong> ({paginationData.totalWords} kata)</span>
                      ) : (
                        <span>
                          Halaman <strong className="text-blue-600 font-bold">{currentPage}</strong> dari <strong>{paginationData.totalPages}</strong> (Total {paginationData.totalWords} kata)
                        </span>
                      )}
                    </div>

                    {!showAllPages && (
                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-35 disabled:cursor-not-allowed bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Sebelumnya</span>
                        </button>

                        {paginationData.pages.map((p) => (
                          <button
                            type="button"
                            key={p.pageNumber}
                            onClick={() => handlePageChange(p.pageNumber)}
                            className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all ${
                              currentPage === p.pageNumber
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                            }`}
                            title={`Halaman ${p.pageNumber}`}
                          >
                            {p.pageNumber}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= paginationData.totalPages}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all disabled:opacity-35 disabled:cursor-not-allowed bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs"
                        >
                          <span className="hidden sm:inline">Selanjutnya</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleToggleAllPages}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors shrink-0"
                    >
                      {showAllPages ? 'Mode Halaman' : 'Lihat Semua'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedNews.tags && selectedNews.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-500 mr-1">Topik Terkait:</span>
                  {selectedNews.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Social Sharing Footer Box */}
              <div className="pt-6 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-9 -mb-6 sm:-mb-9 p-6 sm:p-9 rounded-b-2xl sm:rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Bagikan Berita Ini</h4>
                  <p className="text-xs text-slate-500">Bantu sebarkan kabar pendidikan bermanfaat ke rekan pendidik & masyarakat.</p>
                  {shortUrl && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-medium text-slate-400">Tautan Ringkas:</span>
                      <span className="text-xs font-mono font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100 select-all">
                        {shortUrl}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyLink}
                    className="w-10 h-10 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                    title={copied ? 'Tautan berhasil disalin!' : 'Salin Tautan Berita'}
                    aria-label="Salin Tautan Berita"
                  >
                    {copied ? <Check className="w-4.5 h-4.5 text-emerald-600" /> : <Copy className="w-4.5 h-4.5 text-slate-700" />}
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                    title="Bagikan ke WhatsApp"
                    aria-label="Bagikan ke WhatsApp"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                  </button>

                  <button
                    onClick={handleShareFacebook}
                    className="w-10 h-10 rounded-xl bg-blue-700 hover:bg-blue-800 text-white flex items-center justify-center transition-all shadow-xs hover:scale-105 active:scale-95"
                    title="Bagikan ke Facebook"
                    aria-label="Bagikan ke Facebook"
                  >
                    <FacebookIcon className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          </main>

          {/* Kolom Kanan (4 Kolom): Sidebar Berita Populer & Rekomendasi (Sticky Sesuai Gambar 2) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            
            {/* Widget: BERITA POPULER (Sesuai Gambar 2 Pengguna) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-amber-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase">
                    BERITA POPULER
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Trending
                </span>
              </div>

              {/* Item #1 Hero Populer (Thumbnail Besar + Overlay Teks) */}
              {topPopular && (
                <div
                  onClick={() => handleSelectArticle(topPopular)}
                  className="group cursor-pointer mb-4 pb-4 border-b border-slate-100"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-2.5 shadow-xs">
                    <img
                      src={formatGoogleDriveImageUrl(topPopular.image, 600) || topPopular.image || '/gallery/cover-7-agustus-2026.jpg'}
                      alt={topPopular.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white font-black text-[11px] shadow-md flex items-center gap-1">
                      <span>#1 POPULER</span>
                    </span>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-amber-200 transition-colors">
                        {topPopular.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-white/80">
                        <span>{topPopular.date}</span>
                        <span>•</span>
                        <span>{topPopular.views || 1} Kali Dilihat</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* List Berita Populer #2 s/d #5 (Thumbnail di Kiri, Judul di Kanan) */}
              <div className="space-y-3.5">
                {remainingPopular.map((art, idx) => (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    className="group flex items-start gap-3 cursor-pointer p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    <div className="relative w-20 h-16 sm:w-22 sm:h-17 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                      <img
                        src={formatGoogleDriveImageUrl(art.image, 300) || art.image || '/gallery/cover-7-agustus-2026.jpg'}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                        }}
                      />
                      <span className="absolute top-1 left-1 w-4 h-4 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-black flex items-center justify-center">
                        {idx + 2}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {art.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span>{art.date}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-semibold">{art.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: BERITA TERBARU */}
            {latestNews.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b-2 border-blue-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-wider uppercase">
                      BERITA TERBARU
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedNews(null);
                      setActiveTab('news');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                  >
                    <span>Semua</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {latestNews.map((art) => (
                    <div
                      key={art.id}
                      onClick={() => handleSelectArticle(art)}
                      className="group flex items-start gap-3 cursor-pointer p-1.5 -mx-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div className="w-18 h-15 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                        <img
                          src={formatGoogleDriveImageUrl(art.image, 300) || art.image || '/gallery/cover-7-agustus-2026.jpg'}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {art.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{art.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Widget: Call To Action Informasi Satuan Pendidikan */}
            <div className="p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs space-y-3">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider inline-block">
                Portal Korwilcam Purwodadi
              </span>
              <h4 className="font-extrabold text-sm sm:text-base leading-snug">
                Punya Liputan & Kabar Prestasi Sekolah?
              </h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Kirimkan dokumentasi kegiatan satuan pendidikan untuk dimuat dalam kanal warta resmi Korwilcam Purwodadi.
              </p>
              <a
                href="https://wa.me/6285161717170"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs inline-block text-center"
              >
                Hubungi Redaksi Layanan
              </a>
            </div>

          </aside>

        </div>

        {/* Rekomendasi Berita Lainnya Grid di Bagian Bawah */}
        {otherNews.length > 0 && (
          <section className="space-y-6 pt-6 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Warta & Berita Lainnya
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Informasi dan kabar pendidikan terkini seputar Korwilcam Purwodadi
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedNews(null);
                  setActiveTab('news');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>Lihat Semua</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherNews.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Lightbox / Modal Perbesar Foto Sampul */}
      {isImageZoomed && selectedNews.image && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setIsImageZoomed(false)}
        >
          {/* Top Bar Lightbox */}
          <div 
            className="w-full flex items-center justify-between gap-4 text-white z-10 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 pr-4">
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                Foto Sampul Berita
              </span>
              <h4 className="text-sm sm:text-base font-bold truncate text-slate-100">
                {selectedNews.title}
              </h4>
            </div>

            <button
              type="button"
              onClick={() => setIsImageZoomed(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Enlarged Image */}
          <div 
            className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
            onClick={() => setIsImageZoomed(false)}
          >
            <img
              src={formatGoogleDriveImageUrl(selectedNews.image, 2400) || selectedNews.image}
              alt={selectedNews.title}
              className="max-w-full max-h-[82vh] object-contain rounded-xl sm:rounded-2xl shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Hint */}
          <div 
            className="text-center text-xs text-white/60 py-1"
            onClick={(e) => e.stopPropagation()}
          >
            Klik di mana saja atau tekan <kbd className="px-1.5 py-0.5 rounded bg-white/20 font-mono text-[10px] text-white">Esc</kbd> untuk menutup
          </div>
        </div>
      )}
    </article>
  );
};
