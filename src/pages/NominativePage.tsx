import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Search, 
  RotateCcw, 
  Building2, 
  Briefcase, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

// Helper matching status filter reliably
const matchesStatus = (teacherStatus: string = '', filter: string): boolean => {
  if (!filter || filter === 'ALL') return true;
  const s = teacherStatus.trim().toUpperCase();
  const f = filter.trim().toUpperCase();

  if (f === 'PNS') {
    return s === 'PNS' || (s.includes('PNS') && !s.includes('NON'));
  }
  if (f === 'PPPK') {
    return (s === 'PPPK' || s === 'P3K' || (s.includes('PPPK') && !s.includes('PARUH')));
  }
  if (f === 'PPPK PARUH WAKTU') {
    return s.includes('PARUH');
  }
  if (f === 'HONORER') {
    return s.includes('HONOR') || s === 'GTT' || s === 'PTT' || s === 'GTY' || s.includes('NON ASN') || s.includes('NON-ASN') || s.includes('SUKARELA');
  }
  return s === f;
};

export const NominativePage: React.FC = () => {
  const { teachers, syncStatus } = useApp();
  const isInitialLoading = teachers.length === 0 && syncStatus === 'syncing';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedInstansi, setSelectedInstansi] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Extract unique instansi for dropdown filter
  const uniqueInstansi = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (t.instansi && t.instansi.trim() !== '') {
        set.add(t.instansi.trim());
      }
    });
    return Array.from(set).sort();
  }, [teachers]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        (teacher.nama && teacher.nama.toLowerCase().includes(q)) ||
        (teacher.nip && teacher.nip.toLowerCase().includes(q)) ||
        (teacher.instansi && teacher.instansi.toLowerCase().includes(q));

      const matchStatus = matchesStatus(teacher.statusPegawai, selectedStatus);

      const matchInstansi =
        selectedInstansi === 'ALL' ||
        teacher.instansi.toLowerCase() === selectedInstansi.toLowerCase();

      return matchSearch && matchStatus && matchInstansi;
    });
  }, [teachers, searchQuery, selectedStatus, selectedInstansi]);

  // Reset to page 1 on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus, selectedInstansi]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / itemsPerPage));
  const currentTeachers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTeachers.slice(start, start + itemsPerPage);
  }, [filteredTeachers, currentPage, itemsPerPage]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedInstansi('ALL');
    setCurrentPage(1);
  };

  // Stats
  const countTotal = teachers.length;
  const countPNS = teachers.filter((t) => {
    const s = t.statusPegawai?.toUpperCase() || '';
    return s === 'PNS' || (s.includes('PNS') && !s.includes('NON'));
  }).length;
  const countPPPK = teachers.filter((t) => {
    const s = t.statusPegawai?.toUpperCase() || '';
    return (s === 'PPPK' || s === 'P3K' || (s.includes('PPPK') && !s.includes('PARUH')));
  }).length;
  const countPPPKParuhWaktu = teachers.filter((t) => {
    const s = t.statusPegawai?.toUpperCase() || '';
    return s.includes('PARUH');
  }).length;
  const countHonorer = teachers.filter((t) => {
    const s = t.statusPegawai?.toUpperCase() || '';
    return s.includes('HONOR') || s === 'GTT' || s === 'PTT' || s === 'GTY' || s.includes('NON ASN');
  }).length;
  const countInstansi = uniqueInstansi.length;

  return (
    <div className="space-y-6 pb-20 print:p-0 print:space-y-4">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/20 shadow-md print:hidden">
        <div className="w-full max-w-6xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-white text-xs font-semibold border border-white/30 backdrop-blur-sm">
            <Users className="w-3.5 h-3.5" />
            <span>Pangkalan Data Tenaga Pendidik</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-sm">
            Daftar Nominatif Guru
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Pangkalan data dan daftar nominatif resmi seluruh guru dan pendidik di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi, Kabupaten Grobogan.
          </p>

          {/* Quick Statistics */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-4xl mx-auto">
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 text-center shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center min-h-[32px]">
                {isInitialLoading ? (
                  <span className="inline-block animate-pulse bg-white/30 h-7 w-12 rounded"></span>
                ) : (
                  countTotal
                )}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-0.5">Total Guru</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 text-center shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center min-h-[32px]">
                {isInitialLoading ? (
                  <span className="inline-block animate-pulse bg-white/30 h-7 w-12 rounded"></span>
                ) : (
                  countPNS
                )}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-0.5">Guru PNS</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 text-center shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center min-h-[32px]">
                {isInitialLoading ? (
                  <span className="inline-block animate-pulse bg-white/30 h-7 w-12 rounded"></span>
                ) : (
                  countPPPK
                )}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-0.5">Guru PPPK</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 text-center shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center min-h-[32px]">
                {isInitialLoading ? (
                  <span className="inline-block animate-pulse bg-white/30 h-7 w-12 rounded"></span>
                ) : (
                  countPPPKParuhWaktu
                )}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-0.5">PPPK Paruh Waktu</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-xl p-3.5 text-center shadow-md">
              <div className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center min-h-[32px]">
                {isInitialLoading ? (
                  <span className="inline-block animate-pulse bg-white/30 h-7 w-12 rounded"></span>
                ) : (
                  countHonorer
                )}
              </div>
              <div className="text-xs text-blue-100 font-medium mt-0.5">Honorer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Full Screen Width */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 space-y-5">
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 print:hidden">
          <div className="flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama guru, NIP, atau nama instansi..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Pegawai */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <Briefcase className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PNS">PNS</option>
                  <option value="PPPK">PPPK</option>
                  <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                  <option value="Honorer">Honorer</option>
                </select>
              </div>

              {/* Instansi Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 max-w-[260px]">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <select
                  value={selectedInstansi}
                  onChange={(e) => setSelectedInstansi(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-slate-700 font-medium focus:outline-none cursor-pointer truncate w-full"
                >
                  <option value="ALL">Semua Instansi {isInitialLoading ? '' : `(${countInstansi})`}</option>
                  {uniqueInstansi.map((ins) => (
                    <option key={ins} value={ins}>
                      {ins}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Filter Button */}
              {(searchQuery || selectedStatus !== 'ALL' || selectedInstansi !== 'ALL') && (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filter summary */}
          <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100 text-xs text-slate-500">
            <span>
              {isInitialLoading ? (
                <span className="text-blue-600 font-medium animate-pulse">
                  Menghubungkan data nominatif guru dari database...
                </span>
              ) : (
                <>
                  Menampilkan <strong className="text-slate-800">{filteredTeachers.length}</strong> dari{' '}
                  <strong className="text-slate-800">{teachers.length}</strong> guru
                </>
              )}
            </span>
            {filteredTeachers.length !== teachers.length && !isInitialLoading && (
              <span className="text-blue-600 font-medium">Filter sedang aktif</span>
            )}
          </div>
        </div>

        {/* Printable Header (Visible only in Print Mode) */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            DAFTAR NOMINATIF GURU DAN TENAGA KEPENDIDIKAN
          </h2>
          <h3 className="text-sm font-semibold uppercase">
            KORWILCAM BIDANG PENDIDIKAN KECAMATAN PURWODADI
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Nominative Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden w-full">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold text-center">
                  <th className="py-3.5 px-4 w-16 text-center">No</th>
                  <th className="py-3.5 px-6 w-1/4 min-w-[220px] text-center">Nama Lengkap</th>
                  <th className="py-3.5 px-6 w-52 text-center">NIP</th>
                  <th className="py-3.5 px-6 w-44 text-center whitespace-nowrap">Status Pegawai</th>
                  <th className="py-3.5 px-6 text-center">Instansi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {isInitialLoading ? (
                  [...Array(10)].map((_, i) => (
                    <tr key={`loading-row-${i}`} className="animate-pulse">
                      <td className="py-4 px-4 text-center">
                        <div className="h-4 w-6 bg-slate-200 rounded mx-auto"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-44 bg-slate-200 rounded"></div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="h-4 w-32 bg-slate-100 rounded mx-auto"></div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="h-5 w-20 bg-slate-200 rounded-full mx-auto"></div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="h-4 w-40 bg-slate-100 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : currentTeachers.length > 0 ? (
                  currentTeachers.map((teacher, index) => {
                    const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                    const statusUpper = teacher.statusPegawai?.toUpperCase() || '';
                    
                    let statusBadgeClass = "bg-slate-100 text-slate-700 border-slate-200";
                    if (statusUpper === 'PNS' || (statusUpper.includes('PNS') && !statusUpper.includes('NON'))) {
                      statusBadgeClass = "bg-blue-50 text-blue-700 border-blue-200";
                    } else if (statusUpper.includes('PARUH')) {
                      statusBadgeClass = "bg-teal-50 text-teal-700 border-teal-200";
                    } else if (statusUpper.includes('PPPK') || statusUpper.includes('P3K')) {
                      statusBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                    } else if (statusUpper.includes('HONOR') || statusUpper === 'GTT' || statusUpper === 'PTT' || statusUpper === 'GTY' || statusUpper.includes('NON ASN')) {
                      statusBadgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                    }

                    return (
                      <tr 
                        key={teacher.id || `teach-${index}`}
                        className="hover:bg-blue-50/40 transition-colors"
                      >
                        {/* No */}
                        <td className="py-3.5 px-4 text-center text-slate-500 font-medium">
                          {teacher.no || rowNumber}
                        </td>

                        {/* Nama */}
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{teacher.nama}</span>
                          </div>
                        </td>

                        {/* NIP */}
                        <td className="py-3.5 px-6 font-mono text-xs sm:text-sm text-slate-600 text-center">
                          {teacher.nip && teacher.nip !== '-' && teacher.nip.trim() !== '' ? (
                            <span className="font-medium text-slate-800">{teacher.nip}</span>
                          ) : (
                            <span className="text-slate-400 italic">-</span>
                          )}
                        </td>

                        {/* Status Pegawai */}
                        <td className="py-3.5 px-6 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadgeClass}`}>
                            {teacher.statusPegawai || 'PNS'}
                          </span>
                        </td>

                        {/* Instansi */}
                        <td className="py-3.5 px-6 text-slate-700">
                          <div className="flex items-center gap-1.5 font-medium">
                            <Building2 className="w-4 h-4 text-slate-400 shrink-0 print:hidden" />
                            <span>{teacher.instansi}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Users className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                        <p className="text-base font-semibold text-slate-600">
                          {teachers.length === 0
                            ? 'Belum ada data guru yang terdaftar.'
                            : 'Tidak ada data guru yang sesuai dengan kriteria pencarian.'}
                        </p>
                        {teachers.length > 0 && (
                          <button
                            onClick={resetFilters}
                            className="text-xs text-blue-600 hover:underline font-semibold"
                          >
                            Reset Filter & Pencarian
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 print:hidden">
              <div className="text-xs text-slate-500">
                Menampilkan{' '}
                <strong className="text-slate-800">
                  {filteredTeachers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-800">
                  {Math.min(filteredTeachers.length, currentPage * itemsPerPage)}
                </strong>{' '}
                dari <strong className="text-slate-800">{filteredTeachers.length}</strong> guru (Halaman{' '}
                <strong className="text-slate-800">{currentPage}</strong> dari{' '}
                <strong className="text-slate-800">{totalPages}</strong>)
              </div>
              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Halaman Pertama"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {/* Simple page indicators */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages - (4 - i));
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-sm'
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
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Halaman Terakhir"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
