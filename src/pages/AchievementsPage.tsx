import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  Medal, 
  Award, 
  Search, 
  Filter, 
  Calendar, 
  GraduationCap, 
  Building2, 
  User, 
  Sparkles, 
  X, 
  Share2, 
  ExternalLink, 
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  Link2,
  Check
} from 'lucide-react';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl, getGoogleDriveViewUrl } from '../lib/driveHelper';
import { 
  getAchievementSlug, 
  getAchievementShareUrl, 
  findAchievementBySlugOrId 
} from '../lib/achievementHelper';
import { Achievement, AchievementCategory, AchievementLevel } from '../types';

export const AchievementsPage: React.FC = () => {
  const { 
    achievements, 
    selectedAchievementSlug, 
    setSelectedAchievementSlug, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | AchievementCategory>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | AchievementLevel>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedField, setSelectedField] = useState<string>('ALL');

  // Modal Detail State
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [copied, setCopied] = useState(false);

  // Sinkronisasi modal detail saat selectedAchievementSlug berubah (dari URL address bar atau klik kartu)
  useEffect(() => {
    if (selectedAchievementSlug) {
      const match = findAchievementBySlugOrId(selectedAchievementSlug, achievements);
      if (match) {
        setSelectedAchievement(match);
      }
    } else {
      setSelectedAchievement(null);
    }
  }, [selectedAchievementSlug, achievements]);

  const handleCardClick = (item: Achievement) => {
    const slug = getAchievementSlug(item);
    setSelectedAchievement(item);
    setSelectedAchievementSlug(slug);
  };

  const handleCloseModal = () => {
    setSelectedAchievement(null);
    setSelectedAchievementSlug(null);
  };

  // Keyboard shortcut ESC untuk menutup modal detail secara cepat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedAchievement) {
        handleCloseModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAchievement]);

  // Extract unique years
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(achievements.map((a) => a.year))).sort((a, b) => b - a);
    return years;
  }, [achievements]);

  // Extract unique fields
  const availableFields = useMemo(() => {
    const fields = Array.from(new Set(achievements.map((a) => a.field).filter(Boolean))).sort();
    return fields;
  }, [achievements]);

  // Statistical counters
  const stats = useMemo(() => {
    const total = achievements.length;
    const gold = achievements.filter((a) => /juara 1|emas|gold|1st/i.test(a.rank)).length;
    const silver = achievements.filter((a) => /juara 2|perak|silver|2nd/i.test(a.rank)).length;
    const bronze = achievements.filter((a) => /juara 3|perunggu|bronze|3rd/i.test(a.rank)).length;
    const national = achievements.filter((a) => a.level === 'Nasional' || a.level === 'Internasional').length;
    const provincial = achievements.filter((a) => a.level === 'Provinsi').length;

    return { total, gold, silver, bronze, national, provincial };
  }, [achievements]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return achievements.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.mentorName && item.mentorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.field && item.field.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchLevel = selectedLevel === 'ALL' || item.level === selectedLevel;
      const matchYear = selectedYear === 'ALL' || String(item.year) === selectedYear;
      const matchField = selectedField === 'ALL' || item.field === selectedField;

      return matchSearch && matchCategory && matchLevel && matchYear && matchField;
    });
  }, [achievements, searchQuery, selectedCategory, selectedLevel, selectedYear, selectedField]);

  // Pagination State - 15 kartu per halaman
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Reset pagination ke halaman 1 setiap kali filter atau kata kunci pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLevel, selectedYear, selectedField]);

  const totalPages = Math.max(1, Math.ceil(filteredAchievements.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedAchievements = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAchievements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAchievements, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    cardsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  // Helper for rank badge styling
  const getRankBadge = (rank: string) => {
    const r = rank.toLowerCase();
    if (r.includes('juara 1') || r.includes('emas') || r.includes('1st')) {
      return {
        bg: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 border-amber-300 shadow-amber-200/50',
        icon: <Trophy className="w-3.5 h-3.5 text-slate-900 shrink-0" />,
        label: rank
      };
    }
    if (r.includes('juara 2') || r.includes('perak') || r.includes('2nd')) {
      return {
        bg: 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 border-slate-300 shadow-slate-200/50',
        icon: <Medal className="w-3.5 h-3.5 text-slate-750 shrink-0" />,
        label: rank
      };
    }
    if (r.includes('juara 3') || r.includes('perunggu') || r.includes('3rd')) {
      return {
        bg: 'bg-gradient-to-r from-amber-700 to-orange-700 text-white border-amber-600 shadow-amber-700/30',
        icon: <Medal className="w-3.5 h-3.5 text-amber-100 shrink-0" />,
        label: rank
      };
    }
    return {
      bg: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-blue-500/20',
      icon: <Award className="w-3.5 h-3.5 text-white shrink-0" />,
      label: rank
    };
  };

  // Helper for level badge
  const getLevelBadge = (level: AchievementLevel) => {
    switch (level) {
      case 'Internasional':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Nasional':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Provinsi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Kabupaten':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Kecamatan':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleShareWhatsApp = (item: Achievement) => {
    const shareUrl = getAchievementShareUrl(item);
    const text = `🏆 *DETAIL PRESTASI ${item.category.toUpperCase()} KORWILCAM PURWODADI* 🏆\n\n` +
      `*Nama:* ${item.recipientName}\n` +
      `*Ajang / Kompetisi:* ${item.title}\n` +
      `*Peringkat:* ${item.rank}\n` +
      `*Tingkat:* ${item.level}\n` +
      `*Satuan Pendidikan:* ${item.schoolName}\n` +
      `*Tahun:* ${item.year}\n` +
      (item.mentorName ? `*Guru Pembimbing / Pelatih:* ${item.mentorName}\n` : '') +
      `\nBuka dan lihat detail selengkapnya melalui tautan resmi:\n${shareUrl}`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = (item: Achievement) => {
    const shareUrl = getAchievementShareUrl(item);
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Tautan unik prestasi berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Gagal menyalin tautan!', 'error');
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedLevel('ALL');
    setSelectedYear('ALL');
    setSelectedField('ALL');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 pb-20 bg-slate-50 min-h-screen">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm text-white font-['Plus_Jakarta_Sans',sans-serif]">
            Prestasi Siswa & Guru
          </h1>
          <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
            Etalase kebanggaan, dedikasi, dan torehan prestasi gemilang putra-putri serta tenaga pendidik di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />

          {/* Stats Bar Counters (Hanya tampil jika ada data prestasi di database) */}
          {stats.total > 0 && (
            <div className="pt-4 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 text-left">
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-100 font-medium">Total Prestasi</span>
                  <Award className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1">{stats.total}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-yellow-200 font-medium">Juara 1 / Emas</span>
                  <Trophy className="w-4 h-4 text-yellow-300" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1 text-yellow-300">{stats.gold}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-medium">Juara 2 / Perak</span>
                  <Medal className="w-4 h-4 text-slate-200" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1 text-slate-200">{stats.silver}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-orange-200 font-medium">Juara 3 / Perunggu</span>
                  <Medal className="w-4 h-4 text-orange-300" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1 text-orange-300">{stats.bronze}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-pink-200 font-medium">Tk. Nasional</span>
                  <Sparkles className="w-4 h-4 text-pink-300" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1 text-pink-200">{stats.national}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 text-white transition hover:bg-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-200 font-medium">Tk. Provinsi</span>
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                </div>
                <p className="text-xl sm:text-2xl font-black mt-1 text-cyan-200">{stats.provincial}</p>
              </div>
            </div>
          )}
        </div>

        <CurvedHeaderArch fillColor="text-slate-50" />
      </section>

      {/* Main Content Area - Full width edge-to-edge with balanced padding */}
      <main className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 space-y-6 -mt-8 sm:-mt-10 relative z-20">
        {/* Jika belum ada data prestasi sama sekali di database */}
        {achievements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-12 sm:p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800">Belum Ada Data Prestasi</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Data prestasi siswa dan guru di lingkungan Korwilcam Bidang Pendidikan Purwodadi belum ditambahkan ke database.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Filter Card */}
            <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-5 space-y-4">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama juara, sekolah, ajang kompetisi, atau pembimbing..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Pills & Selects */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">
                    Kategori:
                  </span>
                  {(['ALL', 'Siswa', 'Guru'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-600/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat === 'ALL' ? 'Semua Kategori' : cat === 'Siswa' ? 'Prestasi Siswa' : 'Guru & Tendik'}
                    </button>
                  ))}
                </div>

                {/* Dropdowns: Level, Field, Year */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Tingkat Dropdown */}
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value as any)}
                    aria-label="Filter Tingkat Prestasi"
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="ALL">Semua Tingkat</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Nasional">Tingkat Nasional</option>
                    <option value="Provinsi">Tingkat Provinsi</option>
                    <option value="Kabupaten">Tingkat Kabupaten</option>
                    <option value="Kecamatan">Tingkat Kecamatan</option>
                  </select>

                  {/* Bidang Dropdown */}
                  {availableFields.length > 0 && (
                    <select
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      aria-label="Filter Bidang Kompetisi"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs max-w-[160px] truncate"
                    >
                      <option value="ALL">Semua Bidang</option>
                      {availableFields.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Tahun Dropdown */}
                  {availableYears.length > 0 && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      aria-label="Filter Tahun Prestasi"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    >
                      <option value="ALL">Semua Tahun</option>
                      {availableYears.map((yr) => (
                        <option key={yr} value={String(yr)}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Reset filter button if any active */}
                  {(searchQuery || selectedCategory !== 'ALL' || selectedLevel !== 'ALL' || selectedYear !== 'ALL' || selectedField !== 'ALL') && (
                    <button
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                      title="Reset Semua Filter"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Counter Results Notice */}
            <div ref={cardsContainerRef} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-slate-500 px-1 gap-2">
              <p>
                Menampilkan{' '}
                <span className="font-bold text-slate-800">
                  {filteredAchievements.length === 0
                    ? 0
                    : `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredAchievements.length)}`}
                </span>{' '}
                dari <span className="font-bold text-slate-800">{filteredAchievements.length}</span> data prestasi
                {selectedCategory !== 'ALL' && ` (${selectedCategory})`}
                {selectedLevel !== 'ALL' && ` • Tingkat ${selectedLevel}`}
                {selectedYear !== 'ALL' && ` • Tahun ${selectedYear}`}
              </p>
              {totalPages > 1 && (
                <span className="text-xs text-slate-500 font-medium">
                  Halaman <strong className="text-blue-600 font-bold">{currentPage}</strong> dari{' '}
                  <strong className="text-slate-800 font-bold">{totalPages}</strong> (15 kartu / halaman)
                </span>
              )}
            </div>

            {/* Cards Grid */}
            {paginatedAchievements.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {paginatedAchievements.map((item) => {
                    const rankInfo = getRankBadge(item.rank);
                    const photo = item.photoUrl ? formatGoogleDriveImageUrl(item.photoUrl, 600) : '';

                    return (
                      <article
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                        className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1"
                      >
                        {/* Image & Badges Container */}
                        <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                          {photo ? (
                            <img
                              src={photo}
                              alt={`${item.recipientName} - ${item.title}`}
                              loading="lazy"
                              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                              <Trophy className="w-12 h-12 text-slate-300 mb-1" />
                              <span className="text-xs font-medium">Foto Prestasi</span>
                            </div>
                          )}

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                          {/* Rank Badge on Top Left */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-md backdrop-blur-xs ${rankInfo.bg}`}>
                              {rankInfo.icon}
                              <span>{rankInfo.label}</span>
                            </div>
                          </div>

                          {/* Category & Year on Top Right */}
                          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs ${
                              item.category === 'Guru' 
                                ? 'bg-indigo-600/90 text-white border border-indigo-400/40' 
                                : 'bg-emerald-600/90 text-white border border-emerald-400/40'
                            }`}>
                              {item.category}
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-black/60 text-white backdrop-blur-md border border-white/20">
                              {item.year}
                            </span>
                          </div>

                          {/* Level Pill on Bottom Left of Image */}
                          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                            <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border ${getLevelBadge(item.level)}`}>
                              Tk. {item.level}
                            </span>
                            {item.eventDate && (
                              <span className="text-xs text-slate-200 drop-shadow-xs flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-blue-300" />
                                {item.eventDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Body Content */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            {/* Field / Bidang Lomba */}
                            {item.field && (
                              <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                                {item.field}
                              </p>
                            )}

                            {/* Recipient Name */}
                            <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {item.recipientName}
                            </h2>

                            {/* Competition Title */}
                            <p className="text-sm font-medium text-slate-700 line-clamp-2 leading-snug">
                              {item.title}
                            </p>

                            {/* School & Mentor Info */}
                            <div className="space-y-1 pt-1 text-xs text-slate-500">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate font-medium text-slate-600">{item.schoolName}</span>
                              </div>
                              {item.mentorName && (
                                <div className="flex items-center gap-2">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">Pembimbing: {item.mentorName}</span>
                                </div>
                              )}
                            </div>

                            {/* Snippet Description */}
                            {item.description && (
                              <p className="text-xs text-slate-500 line-clamp-2 pt-1 border-t border-slate-100">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Card Footer Action */}
                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                            <span>Lihat Detail Prestasi</span>
                            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Pagination Controls (15 kartu per halaman) */}
                {totalPages > 1 && (
                  <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80">
                    <div className="text-xs text-slate-500 order-2 sm:order-1 text-center sm:text-left">
                      Menampilkan halaman <span className="font-bold text-slate-800">{currentPage}</span> dari{' '}
                      <span className="font-bold text-slate-800">{totalPages}</span> (15 kartu per halaman)
                    </div>

                    <div className="flex items-center gap-1.5 order-1 sm:order-2 flex-wrap justify-center">
                      {/* First Page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                        title="Halaman Pertama"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>

                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Sebelumnya</span>
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs">
                              ...
                            </span>
                          );
                        }
                        return (
                          <button
                            key={`page-${p}`}
                            onClick={() => handlePageChange(Number(p))}
                            className={`min-w-[36px] h-9 px-3 rounded-xl text-xs font-bold transition-all ${
                              currentPage === p
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600/20'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <span className="hidden sm:inline">Selanjutnya</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Last Page */}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
                        title="Halaman Terakhir"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Filter Results Empty State */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">Tidak ada data prestasi yang cocok</h3>
                  <p className="text-sm text-slate-500">
                    Coba ubah kata kunci pencarian atau sesuaikan opsi filter kategori dan tingkat lomba.
                  </p>
                </div>
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Semua Filter</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Detail Prestasi */}
      {selectedAchievement && (
        <div 
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-300" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
                    Detail Prestasi {selectedAchievement.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {selectedAchievement.recipientName}
                  </h3>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                aria-label="Tutup modal detail prestasi"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
              {/* Photo Display */}
              {selectedAchievement.photoUrl && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-80 flex items-center justify-center">
                  <img
                    src={formatGoogleDriveImageUrl(selectedAchievement.photoUrl, 1000)}
                    alt={selectedAchievement.recipientName}
                    className="w-full h-auto max-h-80 object-contain"
                  />
                  {isGoogleDriveUrl(selectedAchievement.photoUrl) && (
                    <a
                      href={getGoogleDriveViewUrl(selectedAchievement.photoUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-black/85 text-white text-xs font-medium backdrop-blur-xs transition shadow-md"
                    >
                      <span>Buka Foto Asli</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}

              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const rankBadge = getRankBadge(selectedAchievement.rank);
                  return (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${rankBadge.bg}`}>
                      {rankBadge.icon}
                      <span>{rankBadge.label}</span>
                    </span>
                  );
                })()}

                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getLevelBadge(selectedAchievement.level)}`}>
                  Tingkat {selectedAchievement.level}
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Tahun {selectedAchievement.year}
                </span>

                {selectedAchievement.field && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {selectedAchievement.field}
                  </span>
                )}
              </div>

              {/* Data Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-400 block">Nama Ajang / Kompetisi</span>
                  <span className="font-bold text-slate-800 text-base">{selectedAchievement.title}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Penerima Penghargaan</span>
                  <span className="font-bold text-slate-800 text-base">{selectedAchievement.recipientName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Satuan Pendidikan / Asal Sekolah</span>
                  <span className="font-semibold text-slate-700">{selectedAchievement.schoolName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Guru Pembimbing / Pelatih</span>
                  <span className="font-semibold text-slate-700">{selectedAchievement.mentorName || '-'}</span>
                </div>
                {selectedAchievement.eventDate && (
                  <div>
                    <span className="text-xs text-slate-400 block">Waktu Pelaksanaan</span>
                    <span className="font-medium text-slate-700">{selectedAchievement.eventDate}</span>
                  </div>
                )}
                {selectedAchievement.certificateUrl && (
                  <div>
                    <span className="text-xs text-slate-400 block">Piagam / Sertifikat</span>
                    <a
                      href={getGoogleDriveViewUrl(selectedAchievement.certificateUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold underline text-xs mt-0.5"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Lihat Piagam di Database</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedAchievement.description && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Catatan & Deskripsi Prestasi
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-600 bg-white p-4 rounded-xl border border-slate-200">
                    {selectedAchievement.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleShareWhatsApp(selectedAchievement)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Bagikan ke WhatsApp</span>
                </button>

                <button
                  onClick={() => handleCopyLink(selectedAchievement)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer active:scale-95"
                  title="Salin tautan unik kartu prestasi ini"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4 text-blue-600" />}
                  <span>{copied ? 'Tautan Disalin!' : 'Salin Tautan'}</span>
                </button>
              </div>

              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
