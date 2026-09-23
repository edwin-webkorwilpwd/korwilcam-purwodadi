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
  BookOpen,
  FileCheck,
  Image as ImageIcon, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Share2
} from 'lucide-react';
import { getDataRequestSlug, getDataRequestPath } from '../lib/dataRequestHelper';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    officeProfile, 
    news, 
    schools,
    announcements,
    aulaBookings,
    setSelectedNews, 
    setSelectedAnnouncement,
    isAuthenticated,
    organizations,
    selectedOrganizationSlug,
    setSelectedOrganizationSlug,
    setSelectedServiceRequirement,
    dataRequests
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  // Path langsung ke formulir permintaan data aktif pertama dengan slug
  const firstActiveDataReq = (dataRequests || []).find((r) => r.isActive !== false);
  const dataRequestPath = firstActiveDataReq
    ? getDataRequestPath(firstActiveDataReq)
    : '/layanan/permintaan-data';

  // Hover grace period timer refs to prevent accidental dropdown closing
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const newsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contactTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeAllDropdowns = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    if (newsTimeoutRef.current) {
      clearTimeout(newsTimeoutRef.current);
      newsTimeoutRef.current = null;
    }
    if (contactTimeoutRef.current) {
      clearTimeout(contactTimeoutRef.current);
      contactTimeoutRef.current = null;
    }
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(false);
  };

  const handleHeaderLeave = () => {
    handleProfileLeave();
    handleServicesLeave();
    handleNewsLeave();
    handleContactLeave();
  };

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    if (newsTimeoutRef.current) {
      clearTimeout(newsTimeoutRef.current);
      newsTimeoutRef.current = null;
    }
    setProfileDropdownOpen(false);
    setNewsDropdownOpen(false);
    setServicesDropdownOpen(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('preload-webviews'));
    }
  };

  const handleServicesLeave = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 250);
  };

  const handleProfileEnter = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    if (newsTimeoutRef.current) {
      clearTimeout(newsTimeoutRef.current);
      newsTimeoutRef.current = null;
    }
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setProfileDropdownOpen(true);
    try {
      import('../pages/OrganizationPage');
      import('../pages/NominativePage');
    } catch {}
  };

  const handleProfileLeave = () => {
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 250);
  };

  const handleNewsEnter = () => {
    if (newsTimeoutRef.current) {
      clearTimeout(newsTimeoutRef.current);
      newsTimeoutRef.current = null;
    }
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(true);
    try {
      import('../pages/NewsPage');
    } catch {}
  };

  const handleNewsLeave = () => {
    if (newsTimeoutRef.current) clearTimeout(newsTimeoutRef.current);
    newsTimeoutRef.current = setTimeout(() => {
      setNewsDropdownOpen(false);
    }, 250);
  };

  const handleContactEnter = () => {
    if (contactTimeoutRef.current) {
      clearTimeout(contactTimeoutRef.current);
      contactTimeoutRef.current = null;
    }
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
      profileTimeoutRef.current = null;
    }
    if (servicesTimeoutRef.current) {
      clearTimeout(servicesTimeoutRef.current);
      servicesTimeoutRef.current = null;
    }
    if (newsTimeoutRef.current) {
      clearTimeout(newsTimeoutRef.current);
      newsTimeoutRef.current = null;
    }
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(true);
    try {
      import('../pages/ContactPage');
      import('../pages/SocialMediaPage');
    } catch {}
  };

  const handleContactLeave = () => {
    if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
    contactTimeoutRef.current = setTimeout(() => {
      setContactDropdownOpen(false);
    }, 250);
  };

  // Top 3 Berita & Informasi Terbaru
  const topThreeNews = useMemo(() => {
    return (news || []).slice(0, 3);
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
        setNewsDropdownOpen(false);
        setContactDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
      if (newsTimeoutRef.current) clearTimeout(newsTimeoutRef.current);
      if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
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
    if (newsTimeoutRef.current) clearTimeout(newsTimeoutRef.current);
    if (contactTimeoutRef.current) clearTimeout(contactTimeoutRef.current);
    setActiveTab(tab, path);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(false);

    // Immediate event dispatching for sub-tab and hash synchronization
    if (path && path.includes('#')) {
      window.dispatchEvent(new Event('hashchange'));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nav-subtab-change', { detail: { path } }));
    }
  };

  const currentNews = topThreeNews[currentTickerIndex];

  return (
    <header ref={navbarRef} onMouseLeave={handleHeaderLeave} className="sticky top-0 z-40 w-full shadow-lg bg-[#163fa8]">
      {/* Top Notification & Contact Bar */}
      <div className="bg-[#143794] text-blue-100 text-[11px] py-1.5 border-b border-white/15 select-none">
        <div className="w-full px-2 sm:px-3 flex flex-col md:flex-row justify-between items-center gap-2">
          
          {/* Announcement ticker: 3 Berita & Informasi Terbaru */}
          <div 
            className="flex items-center gap-2.5 overflow-hidden w-full md:w-auto min-w-0"
            onMouseEnter={() => setIsTickerHovered(true)}
            onMouseLeave={() => setIsTickerHovered(false)}
          >
            {/* Badge Info Terkini */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#163fa8] font-bold shrink-0 uppercase text-[10px] tracking-wider shadow-sm">
              <BellRing className="w-3 h-3 animate-pulse text-[#163fa8]" />
              <span>Info Terkini</span>
            </span>

            {/* Counter: 1/3, 2/3, 3/3 */}
            {topThreeNews.length > 0 && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white/15 text-white font-mono text-[10px] shrink-0 border border-white/20 font-semibold">
                {currentTickerIndex + 1}/{topThreeNews.length}
              </span>
            )}

            {/* Navigasi Prev/Next */}
            {topThreeNews.length > 1 && (
              <div className="hidden sm:flex items-center gap-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevTicker}
                  className="p-0.5 rounded hover:bg-white/15 text-blue-200 hover:text-white transition-colors"
                  title="Berita sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextTicker}
                  className="p-0.5 rounded hover:bg-white/15 text-blue-200 hover:text-white transition-colors"
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
                  className="text-left truncate text-blue-100 hover:text-white font-medium text-xs transition-all flex items-center gap-2 group max-w-full"
                  title={`Klik untuk membaca selengkapnya: "${currentNews.title}"`}
                >
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30 shrink-0 hidden md:inline-block">
                    {currentNews.category}
                  </span>
                  <span className="truncate group-hover:underline">
                    {currentNews.title}
                  </span>
                  <span className="hidden xl:inline-flex items-center text-[10px] font-semibold text-blue-200 group-hover:translate-x-0.5 transition-transform shrink-0">
                    Baca <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </button>
              ) : (
                <p className="truncate text-blue-200">
                  Selamat datang di Portal Resmi Kantor Korwilcam Purwodadi
                </p>
              )}
            </div>
          </div>

          {/* Quick info contacts */}
          <div className="hidden lg:flex items-center gap-5 text-blue-100 shrink-0">
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3.5 h-3.5 text-sky-300" />
              <span>{officeProfile.phone}</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Mail className="w-3.5 h-3.5 text-sky-300" />
              <span>{officeProfile.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-200" title={officeProfile.workingHours}>
              <Clock className="w-3.5 h-3.5 text-sky-300 shrink-0" />
              <span className="truncate max-w-[360px] 2xl:max-w-none">{officeProfile.workingHours || 'Senin - Kamis: 07.30 - 14.30 WIB | Jumat: 07.30 - 13.00 WIB'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar - Vibrant Cendikia Blue Gradient */}
      <div className="bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white border-b border-white/20 shadow-xl">
        <div className="w-full px-2 sm:px-3">
          <div className="flex items-center justify-between h-12 sm:h-[50px] py-1 gap-2 xl:gap-4">
            
            {/* Logo and Brand */}
            <div 
              onClick={() => handleNavClick('home', '/beranda')}
              onMouseEnter={closeAllDropdowns}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="h-8 sm:h-9 w-auto flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/logo.png" 
                  alt="Logo Kabupaten Grobogan" 
                  className="h-8 sm:h-9 w-auto object-contain drop-shadow-md"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xs sm:text-[14px] tracking-tight text-white leading-tight group-hover:text-blue-100 transition-colors whitespace-nowrap">
                  KORWILCAM PURWODADI
                </span>
                <span className="text-[9px] sm:text-[10px] text-blue-100 font-medium leading-tight whitespace-nowrap">
                  Dinas Pendidikan Kabupaten Grobogan
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 font-semibold text-[14px] xl:text-[15.5px] text-white shrink-0">
              <button
                onClick={() => handleNavClick('home', '/beranda')}
                onMouseEnter={closeAllDropdowns}
                className={`px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'home' 
                    ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/15'
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
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'profile' || activeTab === 'nominatif' || activeTab === 'organization'
                      ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <span>Profil</span>
                  <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                    onMouseEnter={handleProfileEnter}
                    onMouseLeave={handleProfileLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-[#163fa8] rounded-xl shadow-2xl border border-white/20 p-1.5 space-y-1 backdrop-blur-md">
                      <button
                        onClick={() => handleNavClick('profile', '/profil#sambutan')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash !== '#struktur')
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Sambutan & Visi Misi</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('profile', '/profil#struktur')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash === '#struktur')
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Struktur Organisasi</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('nominatif', '/profil#nominatif')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'nominatif'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Nominatif</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedOrganizationSlug(null);
                          handleNavClick('organization', '/profil#organisasi');
                        }}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'organization'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Organisasi</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('sop-pelayanan', '/sop-pelayanan')}
                onMouseEnter={closeAllDropdowns}
                className={`px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'sop-pelayanan' 
                    ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                SOP Pelayanan
              </button>

              <button
                onClick={() => handleNavClick('schools', '/sekolah')}
                onMouseEnter={closeAllDropdowns}
                className={`px-2 xl:px-3 py-1 rounded-lg transition-all relative whitespace-nowrap ${
                  activeTab === 'schools' 
                    ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                <span>Sekolah</span>
              </button>

              {/* Berita Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleNewsEnter}
                onMouseLeave={handleNewsLeave}
              >
                <button
                  type="button"
                  onClick={() => setNewsDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'news' 
                      ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <span>Berita</span>
                  <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${newsDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {newsDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                    onMouseEnter={handleNewsEnter}
                    onMouseLeave={handleNewsLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="bg-[#163fa8] rounded-xl shadow-2xl border border-white/20 p-1.5 space-y-1 backdrop-blur-md">
                      <button
                        onClick={() => handleNavClick('news', '/berita')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'news' && (typeof window === 'undefined' || (!window.location.pathname.includes('/pengumuman') && !window.location.pathname.includes('/agenda')))
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Berita Terkini</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('news', '/berita/pengumuman')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/pengumuman')
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Pengumuman & Edaran</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('news', '/berita/agenda')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/agenda')
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Agenda Kegiatan</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Layanan Dropdown */}
              <div 
                className="relative"
                onMouseEnter={handleServicesEnter}
                onMouseLeave={handleServicesLeave}
              >
                <button
                  type="button"
                  onClick={() => setServicesDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'downloads' || activeTab.startsWith('service-')
                      ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <span>Layanan</span>
                  <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${servicesDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {servicesDropdownOpen && (
                  <div 
                    className="absolute left-0 top-full pt-1.5 max-w-[calc(100vw-24px)] z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                    onMouseEnter={handleServicesEnter}
                    onMouseLeave={handleServicesLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-[#163fa8] rounded-xl shadow-2xl border border-white/20 p-1.5 space-y-1 backdrop-blur-md">
                      {/* 0. Persyaratan Pelayanan */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-requirements', '/layanan/persyaratan-pelayanan')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'service-requirements' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Persyaratan Pelayanan</span>
                      </button>

                      {/* 1. Unduh Berkas */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'downloads' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Unduh Berkas</span>
                      </button>

                      {/* 2. Peminjaman Aula */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'service-aula' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Peminjaman Aula</span>
                      </button>

                      {/* 3. Surat Cuti */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'service-cuti' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Surat Cuti</span>
                      </button>

                      {/* 4. Survey Pelayanan */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'service-survey' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Survey Pelayanan</span>
                      </button>

                      {/* 5. Permintaan Data */}
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-permintaan-data', dataRequestPath)}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap ${
                          activeTab === 'service-permintaan-data' 
                            ? 'bg-white/20 text-white font-bold' 
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <span>Permintaan Data</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNavClick('gallery', '/galeri')}
                onMouseEnter={closeAllDropdowns}
                className={`px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'gallery' 
                    ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                    : 'text-white/90 hover:text-white hover:bg-white/15'
                }`}
              >
                Galeri
              </button>

              {/* Kontak Dropdown (Kontak & Pengaduan, Sos Med) */}
              <div 
                className="relative"
                onMouseEnter={handleContactEnter}
                onMouseLeave={handleContactLeave}
              >
                <button
                  type="button"
                  onClick={() => setContactDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-2 xl:px-3 py-1 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === 'contact' || activeTab === 'social-media'
                      ? 'bg-white text-[#1b56ce] font-bold shadow-md shadow-blue-900/20' 
                      : 'text-white/90 hover:text-white hover:bg-white/15'
                  }`}
                >
                  <span>Kontak</span>
                  <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${contactDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {contactDropdownOpen && (
                  <div 
                    className="absolute right-0 top-full pt-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-100"
                    onMouseEnter={handleContactEnter}
                    onMouseLeave={handleContactLeave}
                  >
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-[#163fa8] rounded-xl shadow-2xl border border-white/20 p-1.5 space-y-1 backdrop-blur-md min-w-[190px]">
                      <button
                        onClick={() => handleNavClick('contact', '/kontak')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2.5 ${
                          activeTab === 'contact'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <Phone className="w-4 h-4 text-blue-300" />
                        <span>Kontak & Pengaduan</span>
                      </button>

                      <button
                        onClick={() => handleNavClick('social-media', '/media-sosial')}
                        className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2.5 ${
                          activeTab === 'social-media'
                            ? 'bg-white/20 text-white font-bold'
                            : 'text-white hover:bg-white/15'
                        }`}
                      >
                        <Share2 className="w-4 h-4 text-blue-300" />
                        <span>Sos Med</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1 rounded-lg text-white hover:bg-white/10 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gradient-to-b from-[#1b56ce] to-[#163fa8] border-b border-white/20 px-4 pt-2 pb-6 space-y-1.5 shadow-2xl animate-in fade-in slide-in-from-top-4 text-white">
          <button
            onClick={() => handleNavClick('home', '/beranda')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'home' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Beranda</span>
          </button>

          {/* Menu Profil dengan Submenu di Mobile */}
          <div className="space-y-1 py-1.5 px-1 bg-white/10 rounded-xl border border-white/20">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
              Profil Instansi
            </div>

            <button
              onClick={() => handleNavClick('profile', '/profil#sambutan')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash !== '#struktur')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Sambutan & Visi Misi</span>
            </button>

            <button
              onClick={() => handleNavClick('profile', '/profil#struktur')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash !== '#struktur')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Struktur Organisasi</span>
            </button>

            <button
              onClick={() => handleNavClick('nominatif', '/profil#nominatif')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'nominatif' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Nominatif Guru</span>
            </button>

            <button
              onClick={() => {
                setSelectedOrganizationSlug(null);
                handleNavClick('organization', '/profil#organisasi');
              }}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'organization' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Organisasi Mitra & Profesi</span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick('sop-pelayanan', '/sop-pelayanan')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'sop-pelayanan' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <FileCheck className="w-4 h-4 text-blue-400" />
            <span>SOP Pelayanan</span>
          </button>

          {/* Menu Sekolah Mobile */}
          <button
            onClick={() => handleNavClick('schools', '/sekolah')}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
              activeTab === 'schools' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Sekolah</span>
          </button>

          {/* Menu Berita Mobile */}
          <div className="space-y-1 py-1.5 px-1 bg-white/10 rounded-xl border border-white/20">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
              Berita
            </div>

            <button
              onClick={() => handleNavClick('news', '/berita')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'news' && (typeof window === 'undefined' || (!window.location.pathname.includes('/pengumuman') && !window.location.pathname.includes('/agenda')))
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Berita Terkini</span>
            </button>

            <button
              onClick={() => handleNavClick('news', '/berita/pengumuman')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/pengumuman')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Pengumuman & Edaran</span>
            </button>

            <button
              onClick={() => handleNavClick('news', '/berita/agenda')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/agenda')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <span>Agenda Kegiatan</span>
            </button>
          </div>

          {/* Menu Layanan Terpadu Mobile */}
          <div className="space-y-1 py-1.5 px-1 bg-white/10 rounded-xl border border-white/20">
            <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
              Layanan Terpadu
            </div>

            <button
              onClick={() => handleNavClick('service-requirements', '/layanan/persyaratan-pelayanan')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'service-requirements' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Persyaratan Pelayanan</span>
            </button>

            <button
              onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'downloads' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Unduh Berkas</span>
            </button>

            <button
              onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'service-aula' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Peminjaman Aula</span>
            </button>

            <button
              onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'service-cuti' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Surat Cuti</span>
            </button>

            <button
              onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'service-survey' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Survey Pelayanan</span>
            </button>

            <button
              onClick={() => handleNavClick('service-permintaan-data', dataRequestPath)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold ${
                activeTab === 'service-permintaan-data' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
              }`}
            >
              <span>Permintaan Data</span>
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

          {/* Kontak & Media Sosial */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">
              Kontak & Media Sosial
            </div>
            <button
              onClick={() => handleNavClick('contact', '/kontak')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'contact' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Phone className="w-4 h-4 text-blue-400" />
              <span>Kontak & Pengaduan</span>
            </button>

            <button
              onClick={() => handleNavClick('social-media', '/media-sosial')}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'social-media' ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Sos Med</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
