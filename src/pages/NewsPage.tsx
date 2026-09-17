import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NewsCard } from '../components/NewsCard';
import { AgendaCard } from '../components/AgendaCard';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { 
  FileText, 
  Search, 
  BellRing, 
  Calendar, 
  Trophy, 
  Download, 
  Clock, 
  MapPin, 
  Tag, 
  Filter,
  RefreshCw,
  Building,
  User,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileCheck2,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { NewsCategory } from '../types';
import { formatIndonesianDate, compareAgendaDatesDescending } from '../services/googleSheetService';

export const NewsPage: React.FC = () => {
  const { 
    news, 
    newsCategories,
    announcements, 
    aulaBookings, 
    loadingAulaBookings, 
    refreshAulaBookings, 
    setSelectedNews,
    setSelectedAnnouncement,
    setActiveTab 
  } = useApp();

  const getInitialSubTab = (): 'news' | 'announcements' | 'agenda' => {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/pengumuman') || path.includes('/edaran')) return 'announcements';
    if (path.includes('/agenda')) return 'agenda';
    return 'news';
  };

  const [activeSubTab, setActiveSubTab] = useState<'news' | 'announcements' | 'agenda'>(getInitialSubTab);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Agenda Filter, Search & Pagination State
  const [agendaSearch, setAgendaSearch] = useState('');
  const [agendaCategory, setAgendaCategory] = useState<string>('ALL');
  const [agendaStatus, setAgendaStatus] = useState<string>('ALL');
  const [agendaCurrentPage, setAgendaCurrentPage] = useState<number>(1);
  const AGENDA_PER_PAGE = 12;
  const agendaContainerRef = React.useRef<HTMLDivElement>(null);

  // Reset pagination ke halaman 1 setiap kali filter atau pencarian berubah
  React.useEffect(() => {
    setAgendaCurrentPage(1);
  }, [agendaSearch, agendaCategory, agendaStatus]);

  // Sync sub-tab from browser URL on mount and popstate (Back/Forward)
  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/pengumuman') || path.includes('/edaran')) {
        setActiveSubTab('announcements');
        document.title = 'Pengumuman & Surat Edaran - Korwilcam Purwodadi';
      } else if (path.includes('/agenda')) {
        setActiveSubTab('agenda');
        document.title = 'Agenda Kegiatan Wilayah - Korwilcam Purwodadi';
      } else if (path === '/berita' || path.includes('/liputan') || path.startsWith('/berita')) {
        setActiveSubTab('news');
        document.title = 'Warta & Informasi - Korwilcam Purwodadi';
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const handleSubTabChange = (tab: 'news' | 'announcements' | 'agenda') => {
    setActiveSubTab(tab);
    let path = '/berita';
    let title = 'Warta & Informasi - Korwilcam Purwodadi';

    if (tab === 'announcements') {
      path = '/berita/pengumuman';
      title = 'Pengumuman & Surat Edaran - Korwilcam Purwodadi';
    } else if (tab === 'agenda') {
      path = '/berita/agenda';
      title = 'Agenda Kegiatan Wilayah - Korwilcam Purwodadi';
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ subtab: tab, path }, '', path);
    }
    document.title = title;
  };

  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' ||
        item.category === selectedCategory ||
        (selectedCategory === 'TK/KB' && (item.category === 'TK/KB' || item.category === 'TK/PAUD')) ||
        (selectedCategory === 'TK/PAUD' && (item.category === 'TK/KB' || item.category === 'TK/PAUD'));

      return matchSearch && matchCategory;
    });
  }, [news, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const list = [
      { id: 'ALL', label: 'Semua Kategori' },
      { id: 'Kedinasan', label: 'Kedinasan' },
      { id: 'SD', label: 'Sekolah Dasar (SD)' },
      { id: 'TK/KB', label: 'TK & KB' },
      { id: 'Prestasi', label: 'Prestasi' },
    ];
    const existingIds = new Set(list.map((c) => c.id.toLowerCase()));
    newsCategories.forEach((cat) => {
      const normalizedId = cat === 'TK/PAUD' ? 'TK/KB' : cat;
      const normalizedLabel = (cat === 'TK/PAUD' || cat === 'TK/KB') ? 'TK & KB' : cat;
      if (!existingIds.has(normalizedId.toLowerCase())) {
        list.push({ id: normalizedId, label: normalizedLabel });
        existingIds.add(normalizedId.toLowerCase());
      }
    });
    return list;
  }, [newsCategories]);

  const agendaCategories = [
    { id: 'ALL', label: 'Semua Kategori' },
    { id: 'Rapat Dinas', label: 'Rapat Dinas' },
    { id: 'Pelatihan', label: 'Pelatihan' },
    { id: 'Seminar/Workshop', label: 'Seminar & Workshop' },
    { id: 'Lainnya', label: 'Lainnya' },
  ];

  const filteredAgendaBookings = useMemo(() => {
    return aulaBookings.filter((item) => {
      const q = agendaSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.namaPJ.toLowerCase().includes(q) ||
        item.organisasi.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        item.kategori.toLowerCase().includes(q) ||
        item.tanggalPenggunaan.toLowerCase().includes(q);

      const matchCategory =
        agendaCategory === 'ALL' || item.kategori.toLowerCase() === agendaCategory.toLowerCase();

      const matchStatus =
        agendaStatus === 'ALL' || item.statusPersetujuan.toLowerCase() === agendaStatus.toLowerCase();

      return matchSearch && matchCategory && matchStatus;
    }).sort(compareAgendaDatesDescending);
  }, [aulaBookings, agendaSearch, agendaCategory, agendaStatus]);

  // Kalkulasi Pagination Agenda (12 data per halaman)
  const totalAgendaPages = Math.ceil(filteredAgendaBookings.length / AGENDA_PER_PAGE) || 1;

  const paginatedAgendaBookings = useMemo(() => {
    const startIndex = (agendaCurrentPage - 1) * AGENDA_PER_PAGE;
    return filteredAgendaBookings.slice(startIndex, startIndex + AGENDA_PER_PAGE);
  }, [filteredAgendaBookings, agendaCurrentPage]);

  const handleAgendaPageChange = (page: number) => {
    if (page < 1 || page > totalAgendaPages) return;
    setAgendaCurrentPage(page);
    agendaContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getAgendaPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalAgendaPages <= maxVisible + 2) {
      for (let i = 1; i <= totalAgendaPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, agendaCurrentPage - 1);
      const end = Math.min(totalAgendaPages - 1, agendaCurrentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalAgendaPages - 1) {
        pages.push('...');
      }

      pages.push(totalAgendaPages);
    }

    return pages;
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Warta, Pengumuman & Agenda
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Ikuti perkembangan terkini seputar kebijakan pendidikan, kegiatan sekolah, surat edaran resmi, dan prestasi gemilang siswa-guru di Kecamatan Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />

          {/* Sub Navigation Tabs */}
          <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleSubTabChange('news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'news'
                  ? 'bg-white text-[#1b56ce] shadow-lg shadow-blue-950/20'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Berita & Liputan ({news.length})</span>
            </button>

            <button
              onClick={() => handleSubTabChange('announcements')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'announcements'
                  ? 'bg-white text-[#1b56ce] shadow-lg shadow-blue-950/20'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>Pengumuman & Edaran ({announcements.length})</span>
            </button>

            <button
              onClick={() => handleSubTabChange('agenda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'agenda'
                  ? 'bg-white text-[#1b56ce] shadow-lg shadow-blue-950/20'
                  : 'bg-white/15 text-white hover:bg-white/25 border border-white/20 backdrop-blur-sm'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda Kegiatan ({aulaBookings.length})</span>
            </button>
          </div>
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Content Sections */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 -mt-8 sm:-mt-10 relative z-20">
        
        {/* SUBTAB 1: NEWS */}
        <div className={activeSubTab === 'news' ? 'space-y-8 block' : 'hidden'}>
            {/* Filter and Search Bar (Desain Modern Sesuai Gambar 2) */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 lg:p-6 border border-blue-100/90 shadow-lg shadow-blue-500/5 space-y-3.5 sm:space-y-4">
              {/* Top Search Bar */}
              <div className="flex items-center bg-white rounded-2xl sm:rounded-full border border-blue-200/90 p-1.5 sm:p-2 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all gap-2">
                {/* Left Blue Icon Box */}
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                  <Search className="w-5 h-5 text-white stroke-[2.5]" />
                </div>

                {/* Input Field */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari artikel berita, topik kegiatan, atau penulis..."
                  className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-medium outline-none"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Right Cari Button */}
                <button
                  type="button"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/25 shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  <span>Cari</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Filter Categories Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  {/* Category Pill Label */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-700 font-bold text-xs border border-blue-200/70 shadow-2xs">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Kategori</span>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                          selectedCategory === cat.id
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                            : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 shadow-2xs font-semibold'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                {(searchQuery || selectedCategory !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('ALL');
                    }}
                    className="ml-auto flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1.5 px-3 rounded-full hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* News Grid */}
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Tidak Ada Berita Ditemukan
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Coba ganti kata kunci pencarian atau pilih kategori lain.
                </p>
              </div>
            )}
        </div>

        {/* SUBTAB 2: ANNOUNCEMENTS */}
        <div className={activeSubTab === 'announcements' ? 'space-y-6 block' : 'hidden'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                <svg 
                  className="w-5 h-5 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="8" y1="13" x2="16" y2="13" />
                  <line x1="8" y1="17" x2="12" y2="17" />
                  <path d="M18 13a2 2 0 0 0-2 2v1.5l-.5.5h5l-.5-.5V15a2 2 0 0 0-2-2z" fill="currentColor" />
                </svg>
              </div>
              <div className="w-[2px] h-8 bg-blue-500/30 rounded-full" />
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Daftar Surat Edaran & Instruksi Kedinasan
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Pengumuman resmi dari Koordinator Wilayah Kecamatan Purwodadi
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.length > 0 ? (
              announcements.map((ann, idx) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  index={idx}
                  onSelect={() => setSelectedAnnouncement(ann)}
                />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
                <BellRing className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">
                  Belum Ada Pengumuman
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Saat ini belum ada surat edaran atau instruksi kedinasan aktif.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SUBTAB 3: AGENDA - Rekapitulasi Penggunaan Aula Korwilcam Purwodadi */}
        <div ref={agendaContainerRef} className={activeSubTab === 'agenda' ? 'space-y-6 scroll-mt-24 block' : 'hidden'}>
            {/* Header & Controls Bar */}
            <div className="bg-gradient-to-br from-[#1b56ce] via-[#2467ea] to-[#109de8] rounded-3xl p-6 sm:p-8 text-white border border-white/20 shadow-2xl space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white border border-white/30 text-xs font-bold backdrop-blur-sm">
                      <Building className="w-3.5 h-3.5 text-blue-200" />
                      <span>Aula Korwilcam Purwodadi</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/25 text-white border border-emerald-300/40 text-xs font-semibold backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                      <span>Sinkronisasi database Korwilcam Purwodadi Real-Time</span>
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
                    Rekapitulasi Agenda Penggunaan Aula
                  </h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    Menampilkan seluruh rekap jadwal pemakaian dan peminjaman aula pertemuan Korwilcam Purwodadi yang tersinkronisasi langsung dengan database Korwilcam Purwodadi.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => refreshAulaBookings()}
                    disabled={loadingAulaBookings}
                    className="px-4 py-2.5 rounded-xl bg-white text-[#1b56ce] font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-950/20 hover:bg-blue-50 disabled:opacity-50 cursor-pointer"
                    title="Muat ulang data dari database Korwilcam Purwodadi"
                  >
                    <RefreshCw className={`w-4 h-4 text-[#1b56ce] ${loadingAulaBookings ? 'animate-spin' : ''}`} />
                    <span>{loadingAulaBookings ? 'Memuat Data...' : 'Sinkronkan Data'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('service-aula', '/layanan/peminjaman-aula')}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-black/20 cursor-pointer"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Formulir Peminjaman</span>
                  </button>
                </div>
              </div>

              {/* Search & Category Filter */}
              <div className="pt-4 border-t border-white/15 flex flex-col md:flex-row items-center gap-3">
                {/* Search Input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-blue-200 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={agendaSearch}
                    onChange={(e) => setAgendaSearch(e.target.value)}
                    placeholder="Cari nama PJ, organisasi, atau keterangan..."
                    className="w-full pl-10 pr-4 py-2 bg-white/15 border border-white/25 rounded-xl text-xs text-white placeholder-blue-200 focus:outline-none focus:border-white transition-colors backdrop-blur-sm"
                  />
                  {agendaSearch && (
                    <button 
                      onClick={() => setAgendaSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xs font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-none">
                  {agendaCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setAgendaCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        agendaCategory === cat.id
                          ? 'bg-white text-[#1b56ce] shadow-sm font-bold'
                          : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <span className="text-[11px] text-blue-100 font-medium">Status:</span>
                  {(['ALL', 'Disetujui', 'Ditolak'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAgendaStatus(st)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        agendaStatus === st
                          ? st === 'Disetujui'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : st === 'Ditolak'
                            ? 'bg-rose-500 text-white shadow-sm'
                            : 'bg-white text-[#1b56ce] shadow-sm'
                          : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                      }`}
                    >
                      {st === 'ALL' ? 'Semua' : st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Count Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 px-1 gap-1.5">
              <span>
                Menampilkan{' '}
                <strong className="text-slate-800 font-bold">
                  {filteredAgendaBookings.length === 0
                    ? 0
                    : (agendaCurrentPage - 1) * AGENDA_PER_PAGE + 1}
                  {' - '}
                  {Math.min(agendaCurrentPage * AGENDA_PER_PAGE, filteredAgendaBookings.length)}
                </strong>{' '}
                dari <strong className="text-slate-800 font-bold">{filteredAgendaBookings.length}</strong> jadwal pemakaian aula
                {agendaCategory !== 'ALL' && ` pada kategori "${agendaCategory}"`}
                {agendaSearch && ` untuk pencarian "${agendaSearch}"`}
              </span>
              <span className="text-slate-400 font-medium">
                Halaman {agendaCurrentPage} dari {totalAgendaPages} (Total database: {aulaBookings.length} agenda)
              </span>
            </div>

            {/* Agenda Cards Grid */}
            {filteredAgendaBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800">
                  Tidak Ditemukan Agenda Sesuai Filter
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Silakan ubah kata kunci pencarian atau reset filter kategori untuk melihat agenda pemakaian aula lainnya.
                </p>
                <button
                  onClick={() => {
                    setAgendaSearch('');
                    setAgendaCategory('ALL');
                    setAgendaStatus('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedAgendaBookings.map((item, idx) => (
                  <AgendaCard key={item.id} agenda={item} index={idx} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredAgendaBookings.length > 0 && totalAgendaPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200/80">
                <div className="text-xs text-slate-500 order-2 sm:order-1">
                  Menampilkan halaman <span className="font-bold text-slate-800">{agendaCurrentPage}</span> dari <span className="font-bold text-slate-800">{totalAgendaPages}</span> (12 kegiatan per halaman)
                </div>

                <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                  {/* First Page */}
                  <button
                    type="button"
                    onClick={() => handleAgendaPageChange(1)}
                    disabled={agendaCurrentPage === 1}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Prev Page */}
                  <button
                    type="button"
                    onClick={() => handleAgendaPageChange(agendaCurrentPage - 1)}
                    disabled={agendaCurrentPage === 1}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </button>

                  {/* Page Numbers */}
                  {getAgendaPageNumbers().map((p, idx) => (
                    typeof p === 'number' ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAgendaPageChange(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          agendaCurrentPage === p
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
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

                  {/* Next Page */}
                  <button
                    type="button"
                    onClick={() => handleAgendaPageChange(agendaCurrentPage + 1)}
                    disabled={agendaCurrentPage === totalAgendaPages}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-sm"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    type="button"
                    onClick={() => handleAgendaPageChange(totalAgendaPages)}
                    disabled={agendaCurrentPage === totalAgendaPages}
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    title="Halaman Terakhir"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

      </section>
    </div>
  );
};
