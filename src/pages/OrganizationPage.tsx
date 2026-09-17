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
  UserCheck,
  Calendar
} from 'lucide-react';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../lib/driveHelper';
import { OrganizationOfficial, EducationalOrganization } from '../types';
import { 
  TikTokIcon, 
  FacebookIcon, 
  InstagramIcon, 
  YoutubeIcon, 
  WebsiteIcon, 
  formatExternalUrl 
} from '../components/SocialIcons';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { OrganizationCard } from '../components/OrganizationCard';

// 1. Bottom-Left Corner Ribbon Accent (Dark Blue Geometric Cut matching Gambar 2)
const OrgCardCornerRibbon: React.FC = () => (
  <svg 
    className="absolute bottom-0 left-0 w-24 h-24 sm:w-28 sm:h-28 pointer-events-none z-0 select-none" 
    viewBox="0 0 100 100" 
    fill="none"
  >
    <polygon points="0,100 100,100 0,0" fill="#0d3b9e" opacity="0.95" />
    <polygon points="0,100 60,100 0,40" fill="#092a72" opacity="0.45" />
  </svg>
);

// 2. Far-Right Background Watermark (Education Book & Rising Ribbon Vector matching Gambar 2)
const OrgCardEducationWatermark: React.FC = () => (
  <div className="absolute right-0 top-0 w-64 sm:w-80 lg:w-96 h-48 sm:h-56 pointer-events-none select-none z-0 overflow-hidden">
    <svg viewBox="0 0 400 240" fill="none" className="w-full h-full object-cover">
      {/* Flowing blue ribbon curves on the right */}
      <path d="M400 0 C300 30 260 120 320 200 C350 225 380 235 400 240 L400 0 Z" fill="url(#orgRibbonGrad)" opacity="0.12" />
      <path d="M400 20 C320 60 290 140 340 210 C365 230 385 235 400 240 L400 20 Z" fill="url(#orgRibbonGrad2)" opacity="0.18" />
      
      {/* Open Book & Rising Figures (Symbol of Education) */}
      <g transform="translate(240, 90)" stroke="url(#orgEduGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left Book Page */}
        <path d="M10 85 C-35 70 -65 40 -75 5 C-35 15 0 45 10 85 Z" fill="#eff6ff" fillOpacity="0.5" stroke="#93c5fd" strokeWidth="2" />
        {/* Right Book Page */}
        <path d="M10 85 C55 70 85 40 95 5 C55 15 20 45 10 85 Z" fill="#eff6ff" fillOpacity="0.5" stroke="#93c5fd" strokeWidth="2" />
        {/* Center Spine */}
        <path d="M10 85 V15" stroke="#60a5fa" strokeWidth="2.5" />
        {/* Rising Figure / Youth */}
        <circle cx="10" cy="-15" r="7" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1.5" opacity="0.9" />
        <path d="M-6 -2 C0 -8 20 -8 26 -2 C20 8 0 8 -6 -2 Z" fill="#bae6fd" opacity="0.6" />
        <path d="M-8 0 C0 8 20 8 28 0" stroke="#3b82f6" strokeWidth="2" />
      </g>

      {/* Script Text "Bersama Maju Pendidikan" */}
      <text x="320" y="32" fill="#2563eb" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.2">Bersama</text>
      <text x="320" y="47" fill="#2563eb" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.2">Maju</text>
      <text x="320" y="62" fill="#2563eb" fontSize="13" fontWeight="900" fontStyle="italic" fontFamily="sans-serif" letterSpacing="0.2">Pendidikan</text>

      <defs>
        <linearGradient id="orgRibbonGrad" x1="400" y1="0" x2="260" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="orgRibbonGrad2" x1="400" y1="20" x2="290" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="orgEduGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// 3. Illustrated Silhouette Avatar matching Gambar 2 when leader photo is not uploaded
const LeaderAvatarPlaceholder: React.FC = () => (
  <svg viewBox="0 0 200 240" className="w-full h-full object-cover" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Soft sky-blue gradient background */}
    <rect width="200" height="240" fill="url(#avatarBgGrad)" />
    
    {/* Head / Face */}
    <path d="M100 45 C82 45 70 60 70 82 C70 108 84 122 100 122 C116 122 130 108 130 82 C130 60 118 45 100 45 Z" fill="#BAE6FD" />
    
    {/* Hair */}
    <path d="M70 78 C66 58 76 38 100 38 C124 38 134 58 130 78 C128 58 122 48 100 48 C78 48 72 58 70 78 Z" fill="#0284C7" />
    <path d="M68 80 C66 66 74 42 94 38 C110 34 128 40 134 58 C136 65 136 76 132 82 C130 65 120 52 100 52 C78 52 70 66 68 80 Z" fill="#0369A1" />

    {/* Neck */}
    <path d="M88 114 V138 H112 V114 Z" fill="#7DD3FC" />

    {/* White Shirt Collar */}
    <path d="M80 136 L100 160 L120 136 L110 136 L100 146 L90 136 Z" fill="#FFFFFF" />
    <path d="M82 136 L100 158 L92 136 Z" fill="#E2E8F0" />
    <path d="M118 136 L100 158 L108 136 Z" fill="#E2E8F0" />

    {/* Dark Blue Tie */}
    <path d="M96 148 L104 148 L106 182 L100 192 L94 182 Z" fill="#0F172A" />

    {/* Suit Shoulders */}
    <path d="M35 240 C38 192 60 152 86 138 L100 160 L114 138 C140 152 162 192 165 240 Z" fill="#1E293B" />
    
    {/* Lapels */}
    <path d="M86 138 L70 195 L95 178 L86 138 Z" fill="#0F172A" />
    <path d="M114 138 L130 195 L105 178 L114 138 Z" fill="#0F172A" />

    <defs>
      <linearGradient id="avatarBgGrad" x1="0" y1="0" x2="200" y2="240" gradientUnits="userSpaceOnUse">
        <stop stopColor="#60A5FA" />
        <stop offset="100%" stopColor="#2563EB" />
      </linearGradient>
    </defs>
  </svg>
);

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

  // Social Media Links (hanya yang tautannya diisi dan tidak kosong) - diletakkan di top-level hooks
  const socialLinks = useMemo(() => {
    if (!currentOrg?.socialMedia) return [];
    const sm = currentOrg.socialMedia;
    const items: Array<{
      key: string;
      name: string;
      url: string;
      icon: React.ComponentType<{ className?: string }>;
      colorClass: string;
    }> = [];

    if (sm.website && sm.website.trim()) {
      items.push({
        key: 'website',
        name: 'Website Official',
        url: formatExternalUrl(sm.website),
        icon: WebsiteIcon,
        colorClass: 'bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-blue-300/50'
      });
    }
    if (sm.tiktok && sm.tiktok.trim()) {
      items.push({
        key: 'tiktok',
        name: 'TikTok',
        url: formatExternalUrl(sm.tiktok),
        icon: TikTokIcon,
        colorClass: 'bg-slate-900/80 hover:bg-black text-white border-slate-700 hover:border-slate-500'
      });
    }
    if (sm.facebook && sm.facebook.trim()) {
      items.push({
        key: 'facebook',
        name: 'Facebook',
        url: formatExternalUrl(sm.facebook),
        icon: FacebookIcon,
        colorClass: 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-100 border-blue-400/40 hover:border-blue-400'
      });
    }
    if (sm.instagram && sm.instagram.trim()) {
      items.push({
        key: 'instagram',
        name: 'Instagram',
        url: formatExternalUrl(sm.instagram),
        icon: InstagramIcon,
        colorClass: 'bg-gradient-to-r from-pink-500/25 via-purple-500/25 to-amber-500/25 hover:from-pink-500/35 hover:via-purple-500/35 hover:to-amber-500/35 text-pink-100 border-pink-400/30 hover:border-pink-400/60'
      });
    }
    if (sm.youtube && sm.youtube.trim()) {
      items.push({
        key: 'youtube',
        name: 'YouTube',
        url: formatExternalUrl(sm.youtube),
        icon: YoutubeIcon,
        colorClass: 'bg-red-600/30 hover:bg-red-600/50 text-red-100 border-red-400/40 hover:border-red-400'
      });
    }

    return items;
  }, [currentOrg?.socialMedia]);

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
        <section className="relative bg-gradient-to-br from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 overflow-hidden shadow-md">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

          <div className="w-full relative z-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white max-w-5xl">
              Organisasi Mitra & Profesi Pendidikan
            </h1>

            <p className="text-xs sm:text-sm text-blue-100/90 mt-2 max-w-4xl leading-relaxed">
              Wadah persatuan, koordinasi profesi pendidik, gugus kepanduan, serta forum musyawarah strategis di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi, Kabupaten Grobogan.
            </p>
            <div className="w-12 h-1 bg-amber-400 rounded-full mt-2.5 shadow-xs" />

            {/* Search & Statistics Bar */}
            <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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
          <CurvedHeaderArch />
        </section>

        {/* Directory Cards Grid */}
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 -mt-8 sm:-mt-10 relative z-20">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-7">
              {filteredOrganizations.map((org) => (
                <OrganizationCard key={org.id} org={org} />
              ))}
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

      {/* Hero Header Section */}
      <section className="relative bg-gradient-to-br from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-8 pb-14 sm:pt-10 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 overflow-hidden shadow-md">
        {/* Background decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        <div className="w-full relative z-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-blue-100/90 mb-5">
            <button 
              onClick={() => setActiveTab('home', '/beranda')} 
              className="hover:text-white transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
            <button 
              onClick={() => setSelectedOrganizationSlug(null)} 
              className="hover:text-white transition-colors"
            >
              Organisasi
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-blue-200" />
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

              {/* Akun Media Sosial & Website Resmi (Hanya tampil jika ada minimal 1 akun yang diisi) */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3.5 pt-3.5 border-t border-white/10">
                  <span className="text-[11px] font-bold text-blue-200/70 mr-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400 shrink-0" />
                    <span>Kanal Resmi:</span>
                  </span>
                  {socialLinks.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <a
                        key={item.key}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs border ${item.colorClass} hover:scale-[1.03] active:scale-[0.98]`}
                        title={`Buka ${item.name} resmi ${currentOrg.shortName}`}
                      >
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.name}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      </a>
                    );
                  })}
                </div>
              )}

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
        <CurvedHeaderArch />
      </section>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 pt-2 pb-10 space-y-8 -mt-6 sm:-mt-8 relative z-20">
        
        {/* SECTION 1: SAMBUTAN KETUA ORGANISASI */}
        <section id="sambutan" className="scroll-mt-28">
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xl shadow-blue-500/5 border border-blue-100/90 relative overflow-hidden">
            {/* Corner Ribbon and Watermark */}
            <OrgCardCornerRibbon />
            <OrgCardEducationWatermark />

            <div className="relative z-10">
              {/* Header Pill & Title */}
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider shadow-xs mb-2.5">
                <Users className="w-3.5 h-3.5 text-white" />
                <span>Amanat & Sambutan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                Sambutan Ketua {currentOrg.shortName}
              </h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full mt-2 mb-6" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Leader Photo Card */}
                <div className="lg:col-span-4 xl:col-span-3 flex flex-col items-center text-center">
                  <div 
                    className="relative group cursor-pointer w-52 sm:w-60 aspect-[3/4] rounded-[24px] overflow-hidden bg-gradient-to-tr from-sky-400 to-blue-600 p-0.5 shadow-lg"
                    onClick={() => leaderPhotoSrc && setPreviewLeader(true)}
                  >
                    <div className="w-full h-full rounded-[22px] overflow-hidden relative">
                      {leaderPhotoSrc ? (
                        <img 
                          src={leaderPhotoSrc} 
                          alt={leader?.name || 'Ketua Organisasi'} 
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          <LeaderAvatarPlaceholder />
                          <div className="absolute bottom-2.5 inset-x-2.5 bg-blue-600 text-white rounded-xl py-1.5 px-2.5 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold shadow-md">
                            <Users className="w-3.5 h-3.5 shrink-0" />
                            <span>Foto Ketua Belum Diunggah</span>
                          </div>
                        </div>
                      )}

                      {leaderPhotoSrc && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-bold backdrop-blur-xs">
                          <ZoomIn className="w-4 h-4" />
                          <span>Perbesar Foto</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3.5 text-center">
                    <h3 className="font-extrabold text-sm sm:text-base text-blue-900 leading-snug">
                      {leader?.name && leader.name !== 'Nama Ketua Belum Diatur' 
                        ? leader.name 
                        : `Ketua ${currentOrg.shortName} Kecamatan Purwodadi`}
                    </h3>
                    {leader?.period && (
                      <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200/70 shadow-2xs">
                        Periode {leader.period.replace(/^Periode\s*/i, '')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Leader Speech Content */}
                <div className="lg:col-span-8 xl:col-span-9 flex flex-col justify-between h-full">
                  <div className="relative">
                    {/* Speech Title with Quote styling */}
                    <div className="flex items-start gap-2 mb-4 border-l-4 border-blue-600 pl-3.5 py-0.5">
                      <span className="text-2xl sm:text-3xl font-serif text-blue-500 leading-none shrink-0 font-black">
                        “
                      </span>
                      <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 text-blue-950 leading-snug">
                        "{leader?.speechTitle || 'Kepemimpinan Efektif Menuju Tata Kelola Sekolah Unggul dan Berkarakter'}"
                      </h4>
                      <span className="text-2xl sm:text-3xl font-serif text-blue-500 leading-none shrink-0 font-black">
                        ”
                      </span>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line text-justify">
                      {leader?.speech || (
                        <p className="text-slate-400 italic">
                          Teks sambutan ketua organisasi belum ditambahkan oleh administrator.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Info Row */}
                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Masa Bakti</p>
                        <p className="text-xs font-semibold text-slate-800">{leader?.period || '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Organisasi</p>
                        <p className="text-xs font-bold text-blue-700">{currentOrg.shortName}</p>
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                        <Building2 className="w-4.5 h-4.5" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: VISI DAN MISI */}
        <section id="visi-misi" className="scroll-mt-28">
          <div className="bg-white rounded-3xl sm:rounded-[32px] p-6 sm:p-8 lg:p-10 shadow-xl shadow-blue-500/5 border border-blue-100/90 relative overflow-hidden flex flex-col lg:flex-row items-stretch gap-6 lg:gap-8">
            
            {/* Corner Ribbon and Watermark */}
            <OrgCardCornerRibbon />
            <OrgCardEducationWatermark />

            {/* Kolom Kiri: Pod Biru Visi Organisasi */}
            <div className="w-full lg:w-[320px] bg-gradient-to-b from-[#1b56ce] via-[#1d5ee6] to-[#1546b8] rounded-[26px] p-5 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg shrink-0 z-10">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div>
                {/* Ikon Target Visi */}
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-xs mb-3.5">
                  <Target className="w-6 h-6" />
                </div>

                <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block mb-2.5">
                  Visi {currentOrg.shortName}
                </span>

                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                  Visi Organisasi {currentOrg.shortName}
                </h3>

                {/* Kotak Naskah Visi */}
                <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white">
                  <p className="text-xs sm:text-sm leading-relaxed text-blue-50 font-medium italic">
                    "{vision || 'Visi organisasi belum diatur.'}"
                  </p>
                </div>
              </div>

              {/* Badge Pill Putih Bawah */}
              <div className="mt-6">
                <span className="bg-white text-blue-700 font-bold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-sm inline-block tracking-wide">
                  Landasan Mutu & Program {currentOrg.shortName}
                </span>
              </div>
            </div>

            {/* Kolom Kanan: Peta Jalan Misi Organisasi */}
            <div className="flex-1 flex flex-col justify-between py-2 sm:py-3 lg:pr-3 relative z-10">
              <div>
                {/* Baris Atas: Pill Badge Kiri & Quote Slogan Kanan */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-600 border border-blue-200/70 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs w-fit">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Peta Jalan Misi Organisasi</span>
                  </div>

                  <div className="flex items-start gap-2 max-w-xs self-start sm:self-auto text-left">
                    <span className="text-2xl sm:text-3xl font-serif text-blue-600 leading-none shrink-0 font-black">
                      “
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-700 italic leading-snug">
                        Terarah, Terukur, & Berkelanjutan
                      </p>
                      <div className="w-full h-0.5 bg-blue-400/30 rounded-full mt-1.5" />
                    </div>
                  </div>
                </div>

                {/* Judul Misi & Garis Aksen */}
                <div className="mt-4 mb-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    Misi {currentOrg.name}
                  </h2>
                  <div className="w-12 h-1 bg-blue-600 rounded-full mt-2.5 mb-4" />
                </div>

                {/* Daftar Butir Misi */}
                {missions && missions.length > 0 ? (
                  <div className="space-y-3 relative z-10">
                    {missions.map((misi, idx) => (
                      <div 
                        key={idx} 
                        className="group/misi flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-blue-50/40 hover:bg-blue-50/80 border border-blue-100/70 hover:border-blue-200 transition-all duration-200 shadow-2xs"
                      >
                        <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover/misi:scale-105 transition-transform">
                          0{idx + 1}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-0.5">
                          {misi}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-400 italic">Misi organisasi belum diatur.</p>
                )}
              </div>

              {/* Bottom Info Row */}
              <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Masa Bakti</p>
                    <p className="text-xs font-semibold text-slate-800">{leader?.period || '-'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Organisasi</p>
                    <p className="text-xs font-bold text-blue-700">{currentOrg.shortName}</p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Building2 className="w-4.5 h-4.5" />
                  </div>
                </div>
              </div>

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
