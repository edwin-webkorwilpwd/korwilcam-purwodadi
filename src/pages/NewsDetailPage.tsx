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
  FileText
} from 'lucide-react';
import { NewsCard } from '../components/NewsCard';
import { getArticleReadingStats } from '../lib/readingTime';
import { paginateArticleContent } from '../lib/articlePaginator';
import { getNewsShortUrl, getNewsShortCode } from '../lib/shortLink';

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

  // 2. Track & hitung jumlah tayangan berita: HANYA 1 KALI saat artikel dibuka per sesi
  const trackedArticleIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (!selectedNews?.id) return;
    const newsId = selectedNews.id;

    // Cegah eksekusi berulang jika ID artikel sama
    if (trackedArticleIdRef.current === newsId) return;
    trackedArticleIdRef.current = newsId;

    // Cegah penambahan berulang dalam satu sesi browser
    const sessionKey = `viewed_news_${newsId}`;
    try {
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, '1');
        incrementNewsViewsRef.current(newsId);
      }
    } catch {
      incrementNewsViewsRef.current(newsId);
    }
  }, [selectedNews?.id]);

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

  // 3 Berita Lainnya sebagai rekomendasi pembaca
  const otherNews = news
    .filter((item) => item.id !== selectedNews.id)
    .slice(0, 3);

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

      <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 sm:pt-12 space-y-8">
        
        {/* Article Header Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
              {selectedNews.category}
            </span>
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">
              Warta Resmi Korwilcam Purwodadi
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2]">
            {selectedNews.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span>{selectedNews.date}</span>
              </div>

              <div className="flex items-center gap-2 font-medium">
                <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span>Oleh: <strong className="text-slate-800">{selectedNews.author}</strong></span>
              </div>

              <div className="flex items-center gap-2 font-medium">
                <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <span>{selectedNews.views || 1} Kali Dilihat</span>
              </div>

              <div 
                className="flex items-center gap-2 font-medium text-slate-500 cursor-help"
                title={readStats.detailed}
              >
                <div className="w-7 h-7 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{readStats.text}</span>
                  {readStats.isReal && (
                    <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full font-bold">
                      Rata-rata riil
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Salin Tautan Berita"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                title="Bagikan ke WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {selectedNews.image && (
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-100">
            <img
              src={selectedNews.image}
              alt={selectedNews.title}
              decoding="async"
              fetchPriority="high"
              className="w-full max-h-[560px] object-cover"
            />
          </div>
        )}

        {/* Main Article Body Container */}
        <div ref={articleBodyRef} className="bg-white rounded-3xl p-6 sm:p-12 border border-slate-200/80 shadow-sm space-y-8 scroll-mt-28">
          
          {/* Summary Quote */}
          {selectedNews.summary && (
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/50 border-l-4 border-blue-600 text-slate-800 text-base sm:text-lg font-medium italic leading-relaxed shadow-xs">
              "{selectedNews.summary}"
            </div>
          )}

          {/* Top Pagination Mini Bar (jika artikel memiliki lebih dari 1 halaman) */}
          {paginationData.totalPages > 1 && (
            <div className="flex items-center justify-between flex-wrap gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] shadow-xs">
                  {showAllPages ? 'Semua Halaman' : `Halaman ${currentPage} dari ${paginationData.totalPages}`}
                </span>
                <span className="text-slate-600 font-medium">
                  {showAllPages 
                    ? `Total ${paginationData.totalWords} kata` 
                    : `~${activePageData?.wordCount || WORDS_PER_PAGE} kata (Halaman ${currentPage})`}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleAllPages}
                className="px-3 py-1 rounded-lg text-xs font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-100/60 transition-colors"
              >
                {showAllPages ? 'Mode Per Halaman (600 Kata)' : 'Tampilkan Semua Halaman'}
              </button>
            </div>
          )}

          {/* Article Text */}
          <div className="article-body min-h-[140px]">
            {isPaginated && activePageData ? (
              activePageData.isHtml ? (
                <div 
                  className="prose prose-slate prose-headings:font-extrabold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-img:rounded-2xl max-w-none text-base sm:text-lg"
                  dangerouslySetInnerHTML={{ __html: activePageData.content }}
                />
              ) : (
                <div className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal space-y-4">
                  {activePageData.content}
                </div>
              )
            ) : selectedNews.content.includes('<') ? (
              <div 
                className="prose prose-slate prose-headings:font-extrabold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed prose-img:rounded-2xl max-w-none text-base sm:text-lg"
                dangerouslySetInnerHTML={{ __html: selectedNews.content }}
              />
            ) : (
              <div className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal space-y-4">
                {selectedNews.content}
              </div>
            )}
          </div>

          {/* Navigasi Pagination Nomor Halaman Lengkap */}
          {paginationData.totalPages > 1 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Status Teks */}
                <div className="text-xs text-slate-500 font-medium text-center sm:text-left">
                  {showAllPages ? (
                    <span>Menampilkan <strong>seluruh artikel</strong> ({paginationData.totalWords} kata)</span>
                  ) : (
                    <span>
                      Halaman <strong className="text-blue-600 font-bold">{currentPage}</strong> dari <strong>{paginationData.totalPages}</strong> (Total {paginationData.totalWords} kata)
                    </span>
                  )}
                </div>

                {/* Kontrol Tombol Halaman */}
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

                {/* Tombol Lihat Semua */}
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
          <div className="pt-8 border-t border-slate-100 bg-slate-50/70 -mx-6 sm:-mx-12 -mb-6 sm:-mb-12 p-6 sm:p-10 rounded-b-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
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

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Tautan'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleShareFacebook}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <FacebookIcon className="w-4 h-4" />
                <span>Facebook</span>
              </button>
            </div>
          </div>

        </div>

        {/* Rekomendasi Berita Lainnya */}
        {otherNews.length > 0 && (
          <section className="space-y-6 pt-6">
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
    </article>
  );
};
