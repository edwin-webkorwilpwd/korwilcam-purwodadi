import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ArrowRight,
  Layers,
  Filter,
  X,
  FileText,
  Users
} from 'lucide-react';
import { getServiceRequirementDetailPath } from '../lib/serviceRequirementHelper';
import { ServiceRequirement } from '../types';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const ServiceRequirementsPage: React.FC = () => {
  const { serviceRequirements, setSelectedServiceRequirement } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    serviceRequirements.forEach((r) => {
      if (r.category && r.category.trim() !== '' && r.category !== 'System') {
        set.add(r.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [serviceRequirements]);

  // Filtered requirements
  const filteredList = useMemo(() => {
    return serviceRequirements.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q)) ||
        (Array.isArray(item.requirements) &&
          item.requirements.some((req) => req.toLowerCase().includes(q)));

      const matchCategory =
        selectedCategory === 'ALL' ||
        (item.category && item.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchSearch && matchCategory;
    });
  }, [serviceRequirements, searchQuery, selectedCategory]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  const handleOpenDetail = (service: ServiceRequirement, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setSelectedServiceRequirement(service);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Hero Header */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-md">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Persyaratan Pelayanan Publik
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Pedoman resmi berkas persyaratan, standar prosedur operasional, dan alur pengajuan pelayanan administrasi bagi pendidik, tenaga kependidikan, serta masyarakat di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Content Area - Full Screen Width */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 -mt-8 sm:-mt-10 relative z-20">
        
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
              placeholder="Cari jenis pelayanan atau kata kunci syarat (contoh: cuti, mutasi, presensi, kenaikan gaji)..."
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

          {/* Category Filter Pills Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Category Pill Label */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-700 font-bold text-xs border border-blue-200/70 shadow-2xs">
                <Filter className="w-3.5 h-3.5" />
                <span>Kategori</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                    selectedCategory === 'ALL'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                      : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 shadow-2xs font-semibold'
                  }`}
                >
                  Semua ({serviceRequirements.length})
                </button>
                {categories.map((cat) => {
                  const count = serviceRequirements.filter((r) => r.category === cat).length;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                          : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 shadow-2xs font-semibold'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1.5 px-3 rounded-full hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Active summary bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>
              Menampilkan <strong className="text-slate-800">{filteredList.length}</strong> dari{' '}
              <strong className="text-slate-800">{serviceRequirements.length}</strong> jenis pelayanan
            </span>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <span className="text-blue-600 font-medium">Filter sedang aktif</span>
            )}
          </div>
        </div>

        {/* Services Requirements Cards Grid */}
        <div className="space-y-3">
          {filteredList.length > 0 ? (
            filteredList.map((service, index) => {
              const detailUrl = getServiceRequirementDetailPath(service);
              const totalReqs = Array.isArray(service.requirements) ? service.requirements.length : 0;

              return (
                <a
                  key={service.id}
                  href={detailUrl}
                  onClick={(e) => handleOpenDetail(service, e)}
                  className="relative block group bg-white rounded-2xl sm:rounded-[20px] border border-blue-100/90 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden no-underline focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {/* Decorative Corner Waves */}
                  <svg 
                    className="absolute -top-1 -left-1 w-20 sm:w-24 h-20 sm:h-24 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-300 z-0" 
                    viewBox="0 0 140 140" 
                    fill="none"
                  >
                    <path d="M0 0C35 0 70 12 95 38C120 64 135 98 140 140H0V0Z" fill={`url(#reqWaveTl-${service.id})`} />
                    <defs>
                      <linearGradient id={`reqWaveTl-${service.id}`} x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" stopOpacity="0.45" />
                        <stop offset="1" stopColor="#0284c7" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <svg 
                    className="absolute -bottom-1 -right-1 w-24 sm:w-32 h-24 sm:h-32 pointer-events-none opacity-25 group-hover:opacity-45 transition-opacity duration-300 z-0" 
                    viewBox="0 0 180 180" 
                    fill="none"
                  >
                    <path d="M180 180C135 180 90 162 55 125C20 88 0 45 0 0L180 0V180Z" fill={`url(#reqWaveBr-${service.id})`} />
                    <defs>
                      <linearGradient id={`reqWaveBr-${service.id}`} x1="180" y1="180" x2="0" y2="0" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#38bdf8" stopOpacity="0.4" />
                        <stop offset="1" stopColor="#0284c7" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Card Content */}
                  <div className="relative z-10 p-3.5 sm:p-4 md:py-3.5 md:px-5 lg:py-3.5 lg:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
                    
                    {/* Left: Badge number + Content Column */}
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                      {/* Number Squircle Badge */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white flex items-center justify-center shrink-0 font-extrabold text-sm sm:text-base shadow-xs shadow-blue-500/25 border border-white/40 group-hover:scale-105 transition-transform">
                        {index + 1}
                      </div>

                      {/* Content Column */}
                      <div className="space-y-1 sm:space-y-1.5 min-w-0 flex-1">
                        {/* Meta Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          {/* Category Badge */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-blue-50/90 text-blue-700 border border-blue-200/60">
                            <Users className="w-3 h-3 text-blue-600 shrink-0" />
                            <span>{service.category || 'Pelayanan Umum'}</span>
                          </span>

                          {/* Estimated Time Badge */}
                          {service.estimatedTime && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-purple-50/90 text-purple-700 border border-purple-200/60">
                              <Clock className="w-3 h-3 text-purple-600 shrink-0" />
                              <span>{service.estimatedTime}</span>
                            </span>
                          )}

                          {/* Requirements Count Badge */}
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-50/90 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>{totalReqs} Berkas Persyaratan</span>
                          </span>
                        </div>

                        {/* Title Row with FileText Icon */}
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                            {service.title}
                          </h2>
                        </div>

                        {/* Description Preview */}
                        {service.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed sm:pl-6">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: 3D Checklist Illustration & CTA Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-3.5 sm:gap-4 shrink-0 pt-2.5 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* 3D Checklist Clipboard Illustration */}
                      <div className="hidden sm:block shrink-0 group-hover:rotate-2 group-hover:scale-105 transition-all duration-300">
                        <svg 
                          viewBox="0 0 96 96" 
                          className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-xs" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id={`clipBoardGrad-${service.id}`} x1="18" y1="16" x2="78" y2="88" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#2563EB" />
                              <stop offset="1" stopColor="#1D4ED8" />
                            </linearGradient>
                            <linearGradient id={`sealGrad-${service.id}`} x1="56" y1="56" x2="84" y2="84" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#38BDF8" />
                              <stop offset="1" stopColor="#2563EB" />
                            </linearGradient>
                          </defs>

                          {/* Board Background */}
                          <rect x="18" y="16" width="60" height="72" rx="14" fill={`url(#clipBoardGrad-${service.id})`} />
                          
                          {/* Top Clip */}
                          <rect x="34" y="11" width="28" height="11" rx="4.5" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
                          <circle cx="48" cy="16.5" r="2.5" fill="#93C5FD" />
                          
                          {/* White Paper Sheet */}
                          <rect x="25" y="24" width="46" height="56" rx="8" fill="#FFFFFF" />
                          
                          {/* Checklist Item 1 */}
                          <circle cx="34" cy="36" r="4" fill="#10B981" />
                          <path d="M32.2 36L33.6 37.4L35.8 34.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="42" y="34" width="23" height="4" rx="2" fill="#E2E8F0" />
                          
                          {/* Checklist Item 2 */}
                          <circle cx="34" cy="48" r="4" fill="#10B981" />
                          <path d="M32.2 48L33.6 49.4L35.8 46.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="42" y="46" width="20" height="4" rx="2" fill="#E2E8F0" />
                          
                          {/* Checklist Item 3 */}
                          <circle cx="34" cy="60" r="4" fill="#3B82F6" />
                          <path d="M32.2 60L33.6 61.4L35.8 58.6" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="42" y="58" width="16" height="4" rx="2" fill="#E2E8F0" />

                          {/* Floating Seal / Badge */}
                          <circle cx="70" cy="70" r="14" fill={`url(#sealGrad-${service.id})`} stroke="#FFFFFF" strokeWidth="2.5" />
                          <path d="M65.5 70.2L68.8 73.5L75 66.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {/* Solid Royal Blue Pill CTA Button */}
                      <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 group-hover:from-blue-700 group-hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 group-hover:shadow-lg group-hover:shadow-blue-500/35 transition-all duration-200">
                        <span>Lihat Persyaratan</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>

                  </div>
                </a>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Tidak ada pelayanan yang sesuai</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Coba gunakan kata kunci pencarian lain atau klik tombol reset filter untuk melihat seluruh pelayanan.
              </p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};
