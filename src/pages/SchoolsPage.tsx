import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolCard } from '../components/SchoolCard';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  School as SchoolIcon, 
  Sparkles, 
  Baby, 
  CheckCircle2, 
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  ChevronDown,
  X
} from 'lucide-react';
import { SchoolLevel, SchoolStatus } from '../types';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const SchoolsPage: React.FC = () => {
  const { schools } = useApp();

  const getLevelFromHash = (): string => {
    if (typeof window === 'undefined') return 'ALL';
    const hash = window.location.hash.toLowerCase().replace(/^#/, '');
    if (hash === 'sd') return 'SD';
    if (hash === 'tk') return 'TK';
    if (hash === 'kb' || hash === 'paud') return 'KB';
    return 'ALL';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>(getLevelFromHash);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle explicit level selection and update browser URL hash
  const handleSelectLevel = (lvlId: string) => {
    setSelectedLevel(lvlId);

    const basePath = window.location.pathname.startsWith('/direktori-sekolah')
      ? '/direktori-sekolah'
      : '/sekolah';
    const search = window.location.search || '';

    let targetUrl: string;
    let newTitle: string;

    if (lvlId === 'ALL') {
      targetUrl = `${basePath}${search}`;
      newTitle = 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi';
    } else {
      const hash = lvlId.toLowerCase();
      targetUrl = `${basePath}${search}#${hash}`;
      if (lvlId === 'SD') {
        newTitle = 'Daftar Sekolah Jenjang SD - Korwilcam Purwodadi';
      } else if (lvlId === 'TK') {
        newTitle = 'Daftar Lembaga Jenjang TK - Korwilcam Purwodadi';
      } else {
        newTitle = 'Daftar Lembaga Jenjang KB - Korwilcam Purwodadi';
      }
    }

    const currentUrl = window.location.pathname + (window.location.search || '') + (window.location.hash || '');
    if (currentUrl !== targetUrl) {
      window.history.pushState({ level: lvlId, path: targetUrl }, '', targetUrl);
    }
    document.title = newTitle;
  };

  // Sync sub-filter from URL hash on browser Back / Forward or external hash changes
  useEffect(() => {
    const handleHashSync = () => {
      const level = getLevelFromHash();
      setSelectedLevel(level);
      if (level === 'SD') {
        document.title = 'Daftar Sekolah Jenjang SD - Korwilcam Purwodadi';
      } else if (level === 'TK') {
        document.title = 'Daftar Lembaga Jenjang TK - Korwilcam Purwodadi';
      } else if (level === 'KB') {
        document.title = 'Daftar Lembaga Jenjang KB - Korwilcam Purwodadi';
      } else {
        document.title = 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi';
      }
    };

    window.addEventListener('hashchange', handleHashSync);
    window.addEventListener('popstate', handleHashSync);
    window.addEventListener('nav-subtab-change', handleHashSync);

    return () => {
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('popstate', handleHashSync);
      window.removeEventListener('nav-subtab-change', handleHashSync);
    };
  }, []);

  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      // Search match
      const query = searchQuery.toLowerCase();
      const matchSearch =
        school.name.toLowerCase().includes(query) ||
        school.npsn.toLowerCase().includes(query) ||
        school.desa.toLowerCase().includes(query) ||
        school.headmaster.toLowerCase().includes(query);

      // Level match
      const matchLevel =
        selectedLevel === 'ALL' ||
        school.level === selectedLevel ||
        (selectedLevel === 'KB' && (school.level === 'KB' || school.level === 'PAUD')) ||
        (selectedLevel === 'PAUD' && (school.level === 'KB' || school.level === 'PAUD'));

      // Status match
      const matchStatus = selectedStatus === 'ALL' || school.status === selectedStatus;

      // Akreditasi match
      const matchAkreditasi = selectedAkreditasi === 'ALL' || school.akreditasi === selectedAkreditasi;

      return matchSearch && matchLevel && matchStatus && matchAkreditasi;
    });
  }, [schools, searchQuery, selectedLevel, selectedStatus, selectedAkreditasi]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel, selectedStatus, selectedAkreditasi]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredSchools.length / itemsPerPage));
  const currentSchools = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchools.slice(start, start + itemsPerPage);
  }, [filteredSchools, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedAkreditasi('ALL');
    setCurrentPage(1);
    handleSelectLevel('ALL');
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Daftar Sekolah SD, TK & KB
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Temukan data resmi, NPSN, akreditasi, nama kepala sekolah, dan kontak satuan pendidikan di bawah naungan Korwilcam Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 -mt-8 sm:-mt-10 relative z-20">
        
        {/* Filter and Search Box */}
        <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl p-3 sm:p-4 border border-blue-100/90 shadow-md shadow-blue-500/5 space-y-2.5 sm:space-y-3">
          
          {/* Top Search Bar */}
          <div className="flex items-center bg-white rounded-full border border-blue-200/90 p-1 sm:p-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all gap-1.5 sm:gap-2">
            {/* Left Blue Icon Box */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama sekolah, nomor NPSN, nama kepala sekolah, atau kelurahan..."
              className="flex-1 min-w-0 px-2 sm:px-3 py-1 sm:py-1.5 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-medium outline-none"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Right Cari Button */}
            <button
              type="button"
              className="px-3.5 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shrink-0 transition-all cursor-pointer active:scale-95"
            >
              <span>Cari</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Filter Categories Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Label Pill */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/80 text-blue-700 font-bold text-[11px] border border-blue-200/70 shadow-2xs">
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </div>

              {/* Level Tabs */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { id: 'ALL', label: 'Semua Jenjang' },
                  { id: 'SD', label: 'SD' },
                  { id: 'TK', label: 'TK' },
                  { id: 'KB', label: 'KB' },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-all cursor-pointer ${
                      selectedLevel === lvl.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                        : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 shadow-2xs font-semibold'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Status Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-semibold bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/70 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
                <ChevronDown className="w-3 h-3 text-blue-500 absolute right-2 pointer-events-none" />
              </div>

              {/* Akreditasi Selector */}
              <div className="relative inline-flex items-center">
                <select
                  value={selectedAkreditasi}
                  onChange={(e) => setSelectedAkreditasi(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-semibold bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/70 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">Semua Akreditasi</option>
                  <option value="A">Akreditasi A</option>
                  <option value="B">Akreditasi B</option>
                </select>
                <ChevronDown className="w-3 h-3 text-blue-500 absolute right-2 pointer-events-none" />
              </div>
            </div>

            {/* Reset button */}
            {(searchQuery || selectedLevel !== 'ALL' || selectedStatus !== 'ALL' || selectedAkreditasi !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1 px-2.5 rounded-full hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200"
              >
                <RotateCcw className="w-3 h-3 text-blue-600" />
                <span>Reset</span>
              </button>
            )}

          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-semibold text-slate-600 px-2">
          <span>
            Menemukan <strong className="text-blue-700">{filteredSchools.length}</strong> sekolah di Purwodadi
            {filteredSchools.length > itemsPerPage && (
              <span className="text-slate-400 font-normal ml-1.5">
                (Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(filteredSchools.length, currentPage * itemsPerPage)})
              </span>
            )}
          </span>
          <span className="text-slate-400">
            Total pangkalan data: {schools.length} sekolah
          </span>
        </div>

        {/* School Grid */}
        {filteredSchools.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {currentSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500">
                  Menampilkan{' '}
                  <strong className="text-slate-800">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  -{' '}
                  <strong className="text-slate-800">
                    {Math.min(filteredSchools.length, currentPage * itemsPerPage)}
                  </strong>{' '}
                  dari <strong className="text-slate-800">{filteredSchools.length}</strong> sekolah (Halaman{' '}
                  <strong className="text-slate-800">{currentPage}</strong> dari{' '}
                  <strong className="text-slate-800">{totalPages}</strong>)
                </div>

                <div className="flex items-center gap-1.5">
                  {/* First Page */}
                  <button
                    onClick={() => {
                      setCurrentPage(1);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Previous Page */}
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page indicators */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = Math.min(currentPage - 2 + i, totalPages - (4 - i));
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 380, behavior: 'smooth' });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Page */}
                  <button
                    onClick={() => {
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Last Page */}
                  <button
                    onClick={() => {
                      setCurrentPage(totalPages);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Halaman Terakhir"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Tidak Ada Sekolah yang Cocok
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Tidak ditemukan sekolah dengan kata kunci atau filter yang Anda pilih. Silakan gunakan kata kunci lain atau klik tombol reset.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:bg-blue-500"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

      </section>
    </div>
  );
};
