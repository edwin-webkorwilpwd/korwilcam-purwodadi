import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { getServiceRequirementDetailPath } from '../lib/serviceRequirementHelper';
import { ServiceRequirement } from '../types';

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
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-6xl mx-auto text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-300 text-xs font-semibold border border-blue-400/25">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Pusat Informasi Standar Pelayanan Terpadu</span>
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Persyaratan Pelayanan Publik
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Pedoman resmi berkas persyaratan, standar prosedur operasional, dan alur pengajuan pelayanan administrasi bagi pendidik, tenaga kependidikan, serta masyarakat di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
          </p>

          {/* Quick Highlight Cards */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto">
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-white">{serviceRequirements.length}</div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">Jenis Layanan</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-blue-900/40 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
              <div className="text-xs text-blue-300/80 font-medium mt-0.5">Bidang Kategori</div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur border border-purple-900/40 rounded-xl p-3 text-center shadow-sm">
              <div className="text-2xl font-bold text-purple-400">100% Bebas Biaya</div>
              <div className="text-xs text-purple-300/80 font-medium mt-0.5">Pelayanan Resmi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Full Screen Width */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
        
        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis pelayanan atau kata kunci syarat (contoh: cuti, mutasi, presensi, kenaikan gaji)..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Kategori:</span>
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                selectedCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}

            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="ml-auto inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Active summary bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
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
        <div className="space-y-4">
          {filteredList.length > 0 ? (
            filteredList.map((service, index) => {
              const detailUrl = getServiceRequirementDetailPath(service);
              const totalReqs = Array.isArray(service.requirements) ? service.requirements.length : 0;

              return (
                <a
                  key={service.id}
                  href={detailUrl}
                  onClick={(e) => handleOpenDetail(service, e)}
                  className="block group bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 overflow-hidden no-underline focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
                    
                    {/* Left: Badge number + Title + Description */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Number Icon / Badge */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200/70 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 flex items-center justify-center shrink-0 font-extrabold text-sm sm:text-base transition-all shadow-xs">
                        {index + 1}
                      </div>

                      {/* Content */}
                      <div className="space-y-2 min-w-0 flex-1">
                        {/* Meta Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {service.category || 'Pelayanan Umum'}
                          </span>

                          {service.estimatedTime && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock className="w-3 h-3 text-purple-600" />
                              <span>{service.estimatedTime}</span>
                            </span>
                          )}

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>{totalReqs} Berkas Persyaratan</span>
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                          {service.title}
                        </h2>

                        {/* Description Preview */}
                        {service.description && (
                          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: CTA Button */}
                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                      <span className="text-xs font-semibold text-slate-400 md:hidden">
                        {totalReqs} butir persyaratan
                      </span>
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white font-bold text-xs transition-all shadow-xs">
                        <span>Lihat Persyaratan</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
