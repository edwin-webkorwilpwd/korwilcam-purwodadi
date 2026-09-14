import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardList, 
  Search, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Copy, 
  Check, 
  Printer, 
  MessageSquare, 
  HelpCircle,
  FolderOpen,
  Sparkles,
  Layers
} from 'lucide-react';

export const ServiceRequirementsPage: React.FC = () => {
  const { serviceRequirements, officeProfile, showToast, setActiveTab } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>(() => {
    // Default: Buka item pertama agar pengunjung langsung melihat isi persyaratan
    if (serviceRequirements.length > 0) {
      return { [serviceRequirements[0].id]: true };
    }
    return {};
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    serviceRequirements.forEach((r) => {
      if (r.category && r.category.trim() !== '') {
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

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    filteredList.forEach((r) => {
      allExpanded[r.id] = true;
    });
    setExpandedIds(allExpanded);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  const copyRequirementsText = (title: string, reqs: string[], notes?: string, id?: string) => {
    let text = `*PERSYARATAN PELAYANAN: ${title.toUpperCase()}*\n`;
    text += `Kantor Korwilcam Bidang Pendidikan Kecamatan Purwodadi\n\n`;
    text += `Daftar Berkas Persyaratan:\n`;
    reqs.forEach((r, idx) => {
      text += `${idx + 1}. ${r}\n`;
    });
    if (notes) {
      text += `\nCatatan Tambahan:\n${notes}\n`;
    }
    text += `\nInformasi lebih lanjut hubungi WhatsApp Resmi: ${officeProfile.whatsapp || officeProfile.phone || '-'}`;

    navigator.clipboard.writeText(text).then(() => {
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      }
      showToast('Daftar persyaratan berhasil disalin ke clipboard!', 'success');
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
  };

  return (
    <div className="space-y-8 pb-24 print:p-0 print:space-y-4">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40 print:hidden relative overflow-hidden">
        {/* Background glow circle */}
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
              <div className="text-2xl font-bold text-purple-400">Transparan</div>
              <div className="text-xs text-purple-300/80 font-medium mt-0.5">Sesuai Regulasi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Full Screen Width */}
      <main className="w-full px-3 sm:px-6 lg:px-8 xl:px-10 space-y-6">
        
        {/* Printable Official Header (Only shown during printing) */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            STANDAR PERSYARATAN PELAYANAN ADMINISTRASI
          </h2>
          <h3 className="text-sm font-semibold uppercase">
            KORWILCAM BIDANG PENDIDIKAN KECAMATAN PURWODADI
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {officeProfile.address} | Telp: {officeProfile.phone} | Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 print:hidden space-y-4">
          <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari jenis pelayanan atau kata kunci syarat (contoh: pangkat, cuti, legalisir, ijazah)..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800"
              />
            </div>

            {/* Expand / Collapse All Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                title="Buka semua rincian persyaratan"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Buka Semua</span>
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                title="Tutup semua rincian persyaratan"
              >
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Tutup Semua</span>
              </button>
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

        {/* Services Requirements List (Interactive Accordion Cards) */}
        <div className="space-y-4">
          {filteredList.length > 0 ? (
            filteredList.map((service, index) => {
              const isExpanded = Boolean(expandedIds[service.id]);
              const isCopied = copiedId === service.id;

              return (
                <div
                  key={service.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                    isExpanded 
                      ? 'border-blue-300 ring-2 ring-blue-500/10 shadow-md' 
                      : 'border-slate-200/80 hover:border-slate-300 hover:shadow'
                  }`}
                >
                  {/* Clickable Header Area */}
                  <div
                    onClick={() => toggleExpand(service.id)}
                    className="p-4 sm:p-5 cursor-pointer select-none flex items-start justify-between gap-4 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Number Icon / Badge */}
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                        isExpanded 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                      }`}>
                        {index + 1}
                      </div>

                      {/* Service Title & Metadata */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {service.category || 'Pelayanan Umum'}
                          </span>
                          {service.estimatedTime && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                              <Clock className="w-3 h-3" />
                              <span>{service.estimatedTime}</span>
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base sm:text-lg font-bold leading-snug transition-colors ${
                          isExpanded ? 'text-blue-900' : 'text-slate-900'
                        }`}>
                          {service.title}
                        </h3>

                        {service.description && (
                          <p className="text-xs sm:text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Expand Indicator & Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <span className="hidden sm:inline-block text-xs font-semibold text-slate-400">
                        {isExpanded ? 'Tutup' : 'Lihat Syarat'}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                        isExpanded ? 'bg-blue-100 text-blue-700 rotate-180' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body: Requirements Details */}
                  {isExpanded && (
                    <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-5 animate-in fade-in duration-150">
                      
                      {/* Requirements Checklist Card */}
                      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Berkas & Persyaratan yang Wajib Dipenuhi:</span>
                          </h4>
                          <span className="text-xs font-semibold text-slate-400">
                            {service.requirements.length} Butir Berkas
                          </span>
                        </div>

                        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                          {service.requirements && service.requirements.length > 0 ? (
                            service.requirements.map((req, reqIdx) => (
                              <li 
                                key={reqIdx} 
                                className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-50/40 hover:border-blue-100 transition-colors"
                              >
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <span className="leading-relaxed font-medium text-slate-800">
                                  {req}
                                </span>
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400 italic py-2">
                              Belum ada rincian persyaratan yang ditambahkan untuk layanan ini.
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Additional Notes Box */}
                      {service.notes && (
                        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm text-amber-900 flex items-start gap-3 shadow-xs">
                          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="font-bold text-amber-950 block">Catatan & Ketentuan Alur:</span>
                            <p className="leading-relaxed text-amber-900/90 whitespace-pre-line">
                              {service.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Service Specs & Action Buttons */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        {/* Time and Fee Specs */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          {service.estimatedTime && (
                            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-purple-600" />
                              <span>Waktu: <strong>{service.estimatedTime}</strong></span>
                            </div>
                          )}
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-2 shrink-0 print:hidden">
                          {/* Copy Button */}
                          <button
                            type="button"
                            onClick={() => copyRequirementsText(service.title, service.requirements, service.notes, service.id)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors"
                            title="Salin butir persyaratan ke clipboard"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Salin Syarat</span>
                              </>
                            )}
                          </button>

                          {/* Print Single Service */}
                          <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl shadow-2xs transition-colors"
                            title="Cetak persyaratan ini"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span className="hidden sm:inline">Cetak</span>
                          </button>

                          {/* Contact via WhatsApp */}
                          {officeProfile.whatsapp && (
                            <a
                              href={`https://wa.me/${officeProfile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Halo Admin Korwilcam Purwodadi, saya ingin berkonsultasi mengenai persyaratan pelayanan: ${service.title}`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
                              title="Tanya petugas layanan via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Konsultasi</span>
                            </a>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ClipboardList className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  {serviceRequirements.length === 0 ? 'Belum Ada Data Persyaratan Pelayanan' : 'Tidak Ditemukan Jenis Pelayanan'}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  {serviceRequirements.length === 0
                    ? 'Saat ini belum ada data persyaratan pelayanan yang diinputkan ke database. Informasi akan langsung tampil setelah data diunggah melalui Portal CMS atau Supabase.'
                    : searchQuery 
                    ? `Tidak ada persyaratan pelayanan yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                    : 'Belum ada data persyaratan pelayanan pada kategori yang dipilih.'}
                </p>
              </div>
              {(searchQuery || selectedCategory !== 'ALL') && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Pencarian & Filter</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Help & Consultation Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md print:hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pusat Pengaduan & Informasi GTK</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold">
              Ada Berkas yang Kurang Jelas?
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Tim pelayanan Korwilcam Bidang Pendidikan Kecamatan Purwodadi siap membantu konsultasi berkas administrasi dan kepegawaian Anda di hari dan jam kerja.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {officeProfile.whatsapp && (
              <a
                href={`https://wa.me/${officeProfile.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo Petugas Pelayanan Korwilcam Purwodadi, saya ingin menanyakan informasi persyaratan pelayanan.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Petugas</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('contact', '/kontak')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Kirim Aduan Online</span>
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};
