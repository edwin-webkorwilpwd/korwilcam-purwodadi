import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Target, 
  Award, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ChevronRight, 
  ZoomIn, 
  X, 
  ExternalLink,
  Sparkles,
  Quote,
  Search,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../lib/driveHelper';
import { OrganizationOfficial, EducationalOrganization } from '../types';

export const OrganizationPage: React.FC = () => {
  const { organizations, selectedOrganizationSlug, setSelectedOrganizationSlug, setActiveTab } = useApp();

  // Search query for the directory page
  const [searchQuery, setSearchQuery] = useState('');

  // Selected organization if viewing details
  const currentOrg = useMemo(() => {
    if (!organizations || organizations.length === 0 || !selectedOrganizationSlug) return null;
    return organizations.find((o) => o.slug === selectedOrganizationSlug || o.id === selectedOrganizationSlug) || null;
  }, [organizations, selectedOrganizationSlug]);

  // Selected official for photo preview modal
  const [previewOfficial, setPreviewOfficial] = useState<OrganizationOfficial | null>(null);
  const [previewLeader, setPreviewLeader] = useState<boolean>(false);

  // Filtered organizations for the directory view
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return [];
    if (!searchQuery.trim()) return organizations;
    const q = searchQuery.toLowerCase().trim();
    return organizations.filter((o) => 
      o.name.toLowerCase().includes(q) ||
      o.shortName.toLowerCase().includes(q) ||
      (o.description && o.description.toLowerCase().includes(q)) ||
      (o.leader?.name && o.leader.name.toLowerCase().includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q))
    );
  }, [organizations, searchQuery]);

  // Auto scroll to target section if hash is present
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentOrg?.id]);

  // ==========================================
  // VIEW 1: DAFTAR / DIREKTORI ORGANISASI
  // ==========================================
  if (!currentOrg) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
        
        {/* Hero Banner Header */}
        <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

          <div className="w-full relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-blue-200/80 mb-4">
              <button 
                onClick={() => setActiveTab('home', '/beranda')} 
                className="hover:text-white transition-colors"
              >
                Beranda
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
              <span className="text-white font-semibold">Organisasi Mitra & Profesi</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-4 border border-blue-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>PORTAL ORGANISASI PENDIDIKAN PURWODADI</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white max-w-5xl">
              Organisasi Mitra & Profesi Pendidikan
            </h1>

            <p className="text-sm sm:text-base text-blue-100/90 mt-4 max-w-4xl leading-relaxed">
              Wadah persatuan, koordinasi profesi pendidik, gugus kepanduan, serta forum musyawarah strategis di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi, Kabupaten Grobogan.
            </p>

            {/* Search & Statistics Bar */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Search Box */}
              <div className="relative flex-1 max-w-lg">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari organisasi (nama, singkatan, ketua)..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-blue-400/30 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Counter Badge */}
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-200">
                <span className="px-3 py-1.5 rounded-lg bg-blue-600/30 border border-blue-400/30 text-blue-200 font-mono">
                  {filteredOrganizations.length} dari {organizations.length} Organisasi
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Directory Cards Grid */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 -mt-6 relative z-20">
          {filteredOrganizations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-md border border-slate-200">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Organisasi Tidak Ditemukan</h3>
              <p className="text-sm text-slate-500 mt-1">
                Tidak ada organisasi yang cocok dengan kata kunci "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredOrganizations.map((org) => {
                const orgLogo = org.logo
                  ? (isGoogleDriveUrl(org.logo) ? formatGoogleDriveImageUrl(org.logo) : org.logo)
                  : '';
                const leaderName = org.leader?.name || 'Belum Ditentukan';
                const officialsCount = org.officials ? org.officials.length : 0;

                return (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrganizationSlug(org.slug)}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
                  >
                    <div>
                      {/* Top Row: Logo & Badges */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center shrink-0 p-2 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                          {orgLogo ? (
                            <img 
                              src={orgLogo} 
                              alt={org.shortName} 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <span className="text-base font-black text-blue-700 font-mono">
                              {org.shortName.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200/60">
                            {org.shortName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 font-mono">
                            {officialsCount} Pengurus
                          </span>
                        </div>
                      </div>

                      {/* Organization Name */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {org.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                        {org.description || 'Organisasi mitra pendidikan Kecamatan Purwodadi.'}
                      </p>

                      {/* Leader Details */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2.5 text-xs text-slate-700">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase font-bold text-slate-400">Ketua Terpilih</p>
                          <p className="font-bold text-slate-800 truncate">{leaderName}</p>
                        </div>
                      </div>

                      {/* Address / Location */}
                      {org.address && (
                        <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{org.address}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                      <span>Buka Profil & Pengurus</span>
                      <span className="w-7 h-7 rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: DETAIL PROFIL ORGANISASI TERPILIH
  // ==========================================
  const { leader, vision, missions, officials } = currentOrg;

  // Sort officials by order, then by name
  const sortedOfficials = [...(officials || [])].sort((a, b) => {
    const orderA = typeof a.order === 'number' ? a.order : 99;
    const orderB = typeof b.order === 'number' ? b.order : 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const leaderPhotoSrc = leader?.photo
    ? (isGoogleDriveUrl(leader.photo) ? formatGoogleDriveImageUrl(leader.photo) : leader.photo)
    : '';

  const orgLogoSrc = currentOrg.logo
    ? (isGoogleDriveUrl(currentOrg.logo) ? formatGoogleDriveImageUrl(currentOrg.logo) : currentOrg.logo)
    : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* Top Navigation & Organization Switcher Bar */}
      <div className="bg-slate-900 border-b border-slate-800 text-white sticky top-[64px] z-30 shadow-md">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-2.5">
          <div className="flex items-center justify-between gap-3 overflow-x-auto custom-scrollbar no-scrollbar">
            
            {/* Back to Directory Button */}
            <button
              onClick={() => setSelectedOrganizationSlug(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white text-xs font-bold transition-colors shrink-0 border border-blue-700/50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Semua Organisasi</span>
            </button>

            {/* Quick Switcher Pills */}
            <div className="flex items-center gap-2 shrink-0">
              {organizations.map((org) => {
                const isActive = org.id === currentOrg.id || org.slug === currentOrg.slug;
                return (
                  <button
                    key={org.id}
                    onClick={() => setSelectedOrganizationSlug(org.slug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    {org.logo ? (
                      <img 
                        src={isGoogleDriveUrl(org.logo) ? formatGoogleDriveImageUrl(org.logo) : org.logo} 
                        alt={org.shortName} 
                        className="w-4 h-4 object-contain rounded-full bg-white/10" 
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                    )}
                    <span>{org.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

        <div className="w-full relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-blue-200/80 mb-5">
            <button 
              onClick={() => setActiveTab('home', '/beranda')} 
              className="hover:text-white transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <button 
              onClick={() => setSelectedOrganizationSlug(null)} 
              className="hover:text-white transition-colors"
            >
              Organisasi
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />
            <span className="text-white font-semibold">{currentOrg.shortName}</span>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8">
            
            {/* Logo Badge */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-2xl bg-white p-3 shadow-2xl flex items-center justify-center shrink-0 border-2 border-blue-400/30">
              {orgLogoSrc ? (
                <img 
                  src={orgLogoSrc} 
                  alt={currentOrg.shortName} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }} 
                />
              ) : (
                <div className="w-full h-full rounded-xl bg-blue-50 flex items-center justify-center text-2xl lg:text-3xl font-black text-blue-700">
                  {currentOrg.shortName.slice(0, 3).toUpperCase()}
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="flex-1 text-center md:text-left min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mitra Strategis Pendidikan Kecamatan Purwodadi</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                {currentOrg.name}
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 mt-3 max-w-3xl leading-relaxed">
                {currentOrg.description}
              </p>

              {/* Meta Info: Address & Contact */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-5 text-xs text-blue-200/80 mt-4 pt-4 border-t border-white/10">
                {currentOrg.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{currentOrg.address}</span>
                  </div>
                )}
                {currentOrg.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{currentOrg.phone}</span>
                  </div>
                )}
                {currentOrg.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{currentOrg.email}</span>
                  </div>
                )}
              </div>

              {/* Quick Jump Anchors */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mt-5">
                <a
                  href="#sambutan"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Sambutan Ketua
                </a>
                <a
                  href="#visi-misi"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20"
                >
                  Visi & Misi
                </a>
                <a
                  href="#pengurus"
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20"
                >
                  Daftar Pengurus ({sortedOfficials.length})
                </a>
                <button
                  onClick={() => setSelectedOrganizationSlug(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-blue-200 text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Daftar Semua Organisasi</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 space-y-12">
        
        {/* SECTION 1: SAMBUTAN KETUA ORGANISASI */}
        <section id="sambutan" className="scroll-mt-28">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span>Amanat & Sambutan</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6">
              Sambutan Ketua {currentOrg.shortName}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Leader Photo Card */}
              <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center text-center">
                <div 
                  className="relative group cursor-pointer w-56 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-tr from-slate-800 to-blue-900 border-4 border-white shadow-xl"
                  onClick={() => leaderPhotoSrc && setPreviewLeader(true)}
                >
                  {leaderPhotoSrc ? (
                    <img 
                      src={leaderPhotoSrc} 
                      alt={leader?.name || 'Ketua Organisasi'} 
                      className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-4">
                      <Users className="w-16 h-16 mb-2 opacity-50" />
                      <span className="text-xs font-semibold">Foto Ketua Belum Diunggah</span>
                    </div>
                  )}

                  {leaderPhotoSrc && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold backdrop-blur-xs">
                      <ZoomIn className="w-4 h-4" />
                      <span>Perbesar Foto</span>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h3 className="font-extrabold text-base text-slate-900">
                    {leader?.name || 'Nama Ketua Belum Diatur'}
                  </h3>
                  {leader?.title && (
                    <p className="text-xs font-semibold text-blue-600 mt-0.5">
                      {leader.title}
                    </p>
                  )}
                  {leader?.period && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium font-mono border border-slate-200">
                      {leader.period}
                    </span>
                  )}
                </div>
              </div>

              {/* Leader Speech Content */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between">
                <div className="relative">
                  <Quote className="w-12 h-12 text-blue-100 absolute -top-4 -left-3 pointer-events-none -z-0" />
                  <div className="relative z-10">
                    {leader?.speechTitle && (
                      <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 text-blue-950">
                        "{leader.speechTitle}"
                      </h4>
                    )}
                    
                    <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-justify">
                      {leader?.speech || (
                        <p className="text-slate-400 italic">
                          Teks sambutan ketua organisasi belum ditambahkan oleh administrator.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signature Tagline */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Masa Bakti</p>
                    <p className="text-xs font-semibold text-slate-700">{leader?.period || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Organisasi</p>
                    <p className="text-xs font-semibold text-blue-700">{currentOrg.shortName}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: VISI DAN MISI */}
        <section id="visi-misi" className="scroll-mt-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Visi Card */}
            <div className="lg:col-span-5 xl:col-span-4 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-300 mb-2">
                  <Target className="w-4 h-4" />
                  <span>Arah & Tujuan</span>
                </div>
                <h3 className="text-xl font-black text-white mb-4">Visi Organisasi</h3>
                <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed italic bg-white/5 p-4 rounded-2xl border border-white/10">
                  "{vision || 'Visi organisasi belum diatur.'}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-blue-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Komitmen kemajuan pendidikan Purwodadi</span>
              </div>
            </div>

            {/* Misi Card */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-2">
                <Award className="w-4 h-4" />
                <span>Rencana Strategis</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">Misi Organisasi</h3>

              {missions && missions.length > 0 ? (
                <ul className="space-y-3">
                  {missions.map((misi, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="leading-relaxed">{misi}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">Misi organisasi belum diatur.</p>
              )}
            </div>

          </div>
        </section>

        {/* SECTION 3: DAFTAR PENGURUS & JABATAN */}
        <section id="pengurus" className="scroll-mt-28">
          <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span>Struktur Kepengurusan</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Susunan Pengurus {currentOrg.shortName}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Daftar jajaran pengurus aktif berdasarkan Surat Keputusan masa bakti berjalan.
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 self-start sm:self-auto font-mono">
                {sortedOfficials.length} Pengurus Terdaftar
              </div>
            </div>

            {sortedOfficials.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl p-6">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-600">Daftar pengurus belum ditambahkan.</p>
                <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan nama pengurus melalui Portal CMS Admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
                {sortedOfficials.map((official) => {
                  const photoSrc = official.photo
                    ? (isGoogleDriveUrl(official.photo) ? formatGoogleDriveImageUrl(official.photo) : official.photo)
                    : '';

                  return (
                    <div 
                      key={official.id}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center group relative"
                    >
                      {/* Photo Thumbnail with Modal Zoom */}
                      <div 
                        className="w-24 h-28 rounded-xl overflow-hidden bg-slate-200 border-2 border-white shadow-sm shrink-0 relative cursor-pointer"
                        onClick={() => photoSrc && setPreviewOfficial(official)}
                      >
                        {photoSrc ? (
                          <img 
                            src={photoSrc} 
                            alt={official.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                            <Users className="w-8 h-8 opacity-40" />
                          </div>
                        )}

                        {photoSrc && (
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ZoomIn className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      {/* Official Role & Name */}
                      <div className="mt-3 w-full">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-200 mb-1 max-w-full truncate">
                          {official.role}
                        </span>
                        
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {official.name}
                        </h4>

                        {official.division && (
                          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                            {official.division}
                          </p>
                        )}

                        {official.nip && official.nip !== '-' && (
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                            NIP: {official.nip}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedOrganizationSlug(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Semua Organisasi</span>
              </button>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Kembali ke Atas ↑
              </button>
            </div>

          </div>
        </section>

      </div>

      {/* Modal Preview Foto Ketua */}
      {previewLeader && leaderPhotoSrc && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewLeader(false)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewLeader(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="max-h-[70vh] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                src={leaderPhotoSrc} 
                alt={leader?.name || 'Ketua'} 
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-3">
              <h4 className="font-bold text-sm text-slate-900">{leader?.name}</h4>
              <p className="text-xs text-blue-600 font-medium">{leader?.title}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Preview Foto Pengurus */}
      {previewOfficial && previewOfficial.photo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewOfficial(null)}
        >
          <div 
            className="relative bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setPreviewOfficial(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="max-h-[70vh] rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
              <img 
                src={isGoogleDriveUrl(previewOfficial.photo) ? formatGoogleDriveImageUrl(previewOfficial.photo) : previewOfficial.photo} 
                alt={previewOfficial.name} 
                className="max-w-full max-h-[60vh] object-contain rounded-lg"
              />
            </div>
            <div className="mt-3">
              <h4 className="font-bold text-sm text-slate-900">{previewOfficial.name}</h4>
              <p className="text-xs text-blue-600 font-bold">{previewOfficial.role}</p>
              {previewOfficial.nip && (
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIP: {previewOfficial.nip}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
