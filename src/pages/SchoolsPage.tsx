import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SchoolCard } from '../components/SchoolCard';
import { 
  GraduationCap, 
  Search, 
  Filter, 
  RotateCcw, 
  School as SchoolIcon, 
  Sparkles, 
  Baby, 
  CheckCircle2, 
  Building2 
} from 'lucide-react';
import { SchoolLevel, SchoolStatus } from '../types';

export const SchoolsPage: React.FC = () => {
  const { schools } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedAkreditasi, setSelectedAkreditasi] = useState<string>('ALL');

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
      const matchLevel = selectedLevel === 'ALL' || school.level === selectedLevel;

      // Status match
      const matchStatus = selectedStatus === 'ALL' || school.status === selectedStatus;

      // Akreditasi match
      const matchAkreditasi = selectedAkreditasi === 'ALL' || school.akreditasi === selectedAkreditasi;

      return matchSearch && matchLevel && matchStatus && matchAkreditasi;
    });
  }, [schools, searchQuery, selectedLevel, selectedStatus, selectedAkreditasi]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('ALL');
    setSelectedStatus('ALL');
    setSelectedAkreditasi('ALL');
  };

  const countSD = schools.filter((s) => s.level === 'SD').length;
  const countTK = schools.filter((s) => s.level === 'TK').length;
  const countPAUD = schools.filter((s) => s.level === 'PAUD').length;

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Pangkalan Data Satuan Pendidikan</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Direktori Sekolah SD, TK & PAUD
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Temukan data resmi, NPSN, akreditasi, nama kepala sekolah, dan kontak satuan pendidikan di bawah naungan Korwilcam Purwodadi.
          </p>

          {/* Quick Count Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-blue-900/60 border border-blue-700/50 text-blue-200 font-semibold">
              SD: {countSD} Sekolah
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-sky-900/60 border border-sky-700/50 text-sky-200 font-semibold">
              TK: {countTK} Lembaga
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-emerald-900/60 border border-emerald-700/50 text-emerald-200 font-semibold">
              PAUD: {countPAUD} Lembaga
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        
        {/* Filter and Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6">
          
          {/* Top Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama sekolah, nomor NPSN, nama kepala sekolah, atau kelurahan..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 absolute right-4 top-1/2 -translate-y-1/2"
              >
                Hapus
              </button>
            )}
          </div>

          {/* Filter Categories */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2 border-t border-slate-100">
            
            {/* Level Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Jenjang:
              </span>
              {[
                { id: 'ALL', label: 'Semua Jenjang' },
                { id: 'SD', label: 'SD' },
                { id: 'TK', label: 'TK' },
                { id: 'PAUD', label: 'PAUD' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedLevel === lvl.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            {/* Sub Filters: Status & Akreditasi */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              </div>

              {/* Akreditasi Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Akreditasi:</span>
                <select
                  value={selectedAkreditasi}
                  onChange={(e) => setSelectedAkreditasi(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="ALL">Semua Akreditasi</option>
                  <option value="A">Akreditasi A</option>
                  <option value="B">Akreditasi B</option>
                </select>
              </div>

              {/* Reset button */}
              {(searchQuery || selectedLevel !== 'ALL' || selectedStatus !== 'ALL' || selectedAkreditasi !== 'ALL') && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-2">
          <span>
            Menemukan <strong className="text-blue-700">{filteredSchools.length}</strong> sekolah di Purwodadi
          </span>
          <span className="text-slate-400">
            Total pangkalan data: {schools.length} sekolah
          </span>
        </div>

        {/* School Grid */}
        {filteredSchools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSchools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
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
