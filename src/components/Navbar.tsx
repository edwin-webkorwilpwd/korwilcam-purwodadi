import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Phone, 
  Mail, 
  Clock, 
  Menu, 
  X, 
  ShieldCheck, 
  BellRing, 
  Building2, 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  ChevronDown,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Download,
  CalendarCheck,
  FileCheck,
  ClipboardCheck
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, officeProfile, news, setSelectedNews, isAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  // Hover grace period timer refs to prevent accidental dropdown closing
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    setServicesDropdownOpen(true);
  };

  const handleServicesLeave = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 400);
  };

  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    setProfileDropdownOpen(true);
  };

  const handleProfileLeave = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 400);
  };

  // Top 3 Berita & Informasi Terbaru
  const topThreeNews = useMemo(() => {
    return news.slice(0, 3);
  }, [news]);

  const [currentTickerIndex, setCurrentTickerIndex] = useState(0);
  const [isTickerHovered, setIsTickerHovered] = useState(false);

  // Auto rotate ticker setiap 4.5 detik
  useEffect(() => {
    if (topThreeNews.length <= 1 || isTickerHovered) return;
    const timer = setInterval(() => {
      setCurrentTickerIndex((prev) => (prev + 1) % topThreeNews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [topThreeNews.length, isTickerHovered]);

  // Clean up timeouts on unmount and click outside detection
  const navbarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  const handleNextTicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (topThreeNews.length > 0) {
      setCurrentTickerIndex((prev) => (prev + 1) % topThreeNews.length);
    }
  };

  const handlePrevTicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (topThreeNews.length > 0) {
      setCurrentTickerIndex((prev) => (prev - 1 + topThreeNews.length) % topThreeNews.length);
    }
  };

  const handleTickerClick = () => {
    const currentItem = topThreeNews[currentTickerIndex];
    if (currentItem) {
      setSelectedNews(currentItem);
    }
  };

  const handleNavClick = (tab: string, path?: string) => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    setActiveTab(tab, path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
  };

  const currentNews = topThreeNews[currentTickerIndex];

  return (
    <header ref={navbarRef} className="sticky top-0 z-40 w-full shadow-lg bg-slate-950">
      {/* Top Notification & Contact Bar */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 border-b border-white/10 select-none">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 flex flex-col md:flex-row justify-between items-center gap-2">
          
          {/* Announcement ticker: 3 Berita & Informasi Terbaru */}
          <div 
            className="flex items-center gap-2.5 overflow-hidden w-full md:w-auto min-w-0"
            onMouseEnter={() => setIsTickerHovered(true)}
            onMouseLeave={() => setIsTickerHovered(false)}
          >
            {/* Badge Info Terkini */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-bold shrink-0 uppercase text-[10px] tracking-wider shadow-sm">
              <BellRing className="w-3 h-3 animate-pulse" />
              <span>Info Terkini</span>
            </span>

            {/* Counter: 1/3, 2/3, 3/3 */}
            {topThreeNews.length > 0 && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px] shrink-0 border border-slate-700/60 font-semibold">
                {currentTickerIndex + 1}/{topThreeNews.length}
              </span>
            )}

            {/* Navigasi Prev/Next */}
            {topThreeNews.length > 1 && (
              <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTicker}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Berita sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTicker}
                  className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Berita selanjutnya"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Judul Berita Interaktif & Dapat Diklik */}
            <div className="min-w-0 flex-1 flex items-center gap-2">
              {currentNews ? (
                <button
                  type="button"
                  key={currentNews.id}
                  onClick={handleTickerClick}
                  className="text-left truncate text-slate-300 hover:text-blue-300 font-medium text-xs transition-all flex items-center gap-2 group max-w-full"
                  title={`Klik untuk membaca selengkapnya: "${currentNews.title}"`}
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 shrink-0 hidden md:inline-block">
                    {currentNews.category}
                  </span>
                  <span className="truncate group-hover:underline">
                    {currentNews.title}
                  </span>
                  <span className="hidden xl:inline-flex items-center text-[10px] font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Baca <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </button>
              ) : (
                <p className="truncate text-slate-400">
                  Selamat datang di Portal Resmi Kantor Korwilcam Purwodadi
                </p>
              )}
            </div>
          </div>

          {/* Quick info contacts */}
          <div className="hidden lg:flex items-center gap-5 text-slate-300 shrink-0">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{officeProfile.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{officeProfile.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Senin - Jumat: 07.30 - 16.00 WIB</span>
            </div>
            {/* Tombol Akses Petugas Tersembunyi (Ikon Gembok Mikro Samar) */}
            <button
              onClick={() => handleNavClick(isAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="text-slate-600 hover:text-slate-300 transition-colors p-1 rounded opacity-30 hover:opacity-100"
              title="Akses Petugas"
              aria-label="Akses Petugas"
            >
              <Lock className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar - Compact Blue Gradient Box */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white border-b border-blue-700/40 shadow-xl">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between h-16 sm:h-18 py-1.5 gap-3 xl:gap-6">
            
            {/* Logo and Brand */}
            <div 
              onClick={() => handleNavClick('home', '/beranda')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0"
            >
              <div className="h-10 sm:h-11 w-auto flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/logo.png" 
                  alt="Logo Kabupaten Grobogan" 
                  className="h-10 sm:h-11 w-auto object-contain drop-shadow-md"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight group-hover:text-blue-200 transition-colors whitespace-nowrap">
                  KORWILCAM PURWODADI
                </span>
                <span className="text-[10px] text-blue-200/80 font-medium leading-tight whitespace-nowrap mt-0.5">
                  Dinas Pendidikan Kabupaten Grobogan
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-medium text-xs xl:text-[13px] text-slate-200 shrink-0">
              <button
                onClick={() => handleNavClick('home', '/beranda')}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'home' 
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                    : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Beranda
              </button>

              {/* Profil Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'profile' 
                      ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                      : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>Profil</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-blue-300' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full pt-2 w-60 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseEnter={handleProfileEnter}
                    onMouseMove={handleProfileEnter}
                    onMouseLeave={handleProfileLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 left-0 right-0 h-5 bg-transparent" />

                    <div className="relative bg-slate-900 rounded-xl shadow-2xl border border-blue-800/60 p-1.5 space-y-1">
                      <button
                        onClick={() => handleNavClick('profile', '/profil/sambutan')}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Sambutan & Visi Misi</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', '/profil/struktur')}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Struktur Organisasi</span>
                      </button>
                      <button
                        onClick={() => handleNavClick('profile', '/profil/pegawai')}
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-200 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-2.5 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Pengawas SD & Penilik PAUD</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('schools', '/direktori-sekolah')}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all relative whitespace-nowrap ${
                  activeTab === 'schools' 
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                    : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Direktori Sekolah</span>
                <span className="hidden xl:inline-block ml-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  SD/TK/PAUD
                </span>
              </button>

              <button
                onClick={() => handleNavClick('news', '/berita')}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'news' 
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                    : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Berita & Informasi
              </button>

              {/* Layanan Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <button
                  type="button"
                  onClick={() => setServicesDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'downloads' || activeTab.startsWith('service-')
                      ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                      : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>Layanan</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-blue-300' : ''}`} />
                </button>

                {servicesDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full pt-2 w-80 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                    onMouseEnter={handleServicesEnter}
                    onMouseMove={handleServicesEnter}
                    onMouseLeave={handleServicesLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 left-0 right-0 h-5 bg-transparent" />

                    <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-blue-800/60 p-2 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-300/80">
                        Pusat Layanan Terpadu Korwilcam
                      </div>

                      {/* 1. Unduh Berkas */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group ${
                          activeTab === 'downloads' 
                            ? 'bg-blue-600/30 border border-blue-500/40 text-white' 
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          activeTab === 'downloads' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'
                        }`}>
                          <Download className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                            Unduh Berkas
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">
                            Modul ajar, surat edaran, dan format blanko GTK
                          </div>
                        </div>
                      </button>

                      {/* 2. Peminjaman Aula */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group ${
                          activeTab === 'service-aula' 
                            ? 'bg-amber-500/20 border border-amber-500/40 text-white' 
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          activeTab === 'service-aula' 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-white'
                        }`}>
                          <CalendarCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors">
                            Peminjaman Aula Korwilcam Purwodadi
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">
                            Jadwal & formulir peminjaman aula pertemuan
                          </div>
                        </div>
                      </button>

                      {/* 3. Surat Cuti */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group ${
                          activeTab === 'service-cuti' 
                            ? 'bg-emerald-500/20 border border-emerald-500/40 text-white' 
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          activeTab === 'service-cuti' 
                            ? 'bg-emerald-600 text-white shadow-sm' 
                            : 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
                        }`}>
                          <FileCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                            Surat Cuti
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">
                            Pelayanan administrasi pengajuan cuti pendidik
                          </div>
                        </div>
                      </button>

                      {/* 4. Survey Pelayanan */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 group ${
                          activeTab === 'service-survey' 
                            ? 'bg-purple-500/20 border border-purple-500/40 text-white' 
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          activeTab === 'service-survey' 
                            ? 'bg-purple-600 text-white shadow-sm' 
                            : 'bg-purple-500/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white'
                        }`}>
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-white group-hover:text-purple-300 transition-colors">
                            Survey Pelayanan
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal leading-tight">
                            Indeks kepuasan pelayanan terpadu masyarakat
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('gallery', '/galeri')}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'gallery' 
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                    : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Galeri
              </button>

              <button
                onClick={() => handleNavClick('contact', '/kontak')}
                className={`px-2.5 xl:px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'contact' 
                    ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/30' 
                    : 'text-blue-100/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Kontak & Aduan
              </button>
            </nav>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-white hover:bg-white/10 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-blue-800/50 px-4 pt-2 pb-6 space-y-1.5 shadow-2xl animate-in fade-in slide-in-from-top-4 text-slate-200">
          <button
            onClick={() => handleNavClick('home', '/beranda')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Beranda</span>
          </button>

          <button
            onClick={() => handleNavClick('profile', '/profil/sambutan')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'profile' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Profil & Struktur Organisasi</span>
          </button>

          <button
            onClick={() => handleNavClick('schools', '/direktori-sekolah')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
              activeTab === 'schools' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>Direktori Sekolah</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200">
              SD / TK / PAUD
            </span>
          </button>

          <button
            onClick={() => handleNavClick('news', '/berita')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'news' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Berita, Pengumuman & Prestasi</span>
          </button>

          {/* Menu Layanan Terpadu Mobile */}
          <div className="space-y-1 py-1.5 px-1 bg-slate-950/60 rounded-xl border border-blue-900/40">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-300">
              Layanan Terpadu
            </div>

            <button
              onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'downloads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>

            <button
              onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'service-aula' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Peminjaman Aula Korwilcam</span>
            </button>

            <button
              onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'service-cuti' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Surat Cuti</span>
            </button>

            <button
              onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'service-survey' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Survey Pelayanan</span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick('gallery', '/galeri')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'gallery' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-400" />
            <span>Galeri Kegiatan</span>
          </button>

          <button
            onClick={() => handleNavClick('contact', '/kontak')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'contact' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <Phone className="w-4 h-4 text-blue-400" />
            <span>Kontak & Layanan Pengaduan</span>
          </button>

        </div>
      )}
    </header>
  );
};
