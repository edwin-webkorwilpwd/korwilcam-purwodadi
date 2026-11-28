import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { 
  GraduationCap, 
  Phone, 
  Menu, 
  X, 
  ShieldCheck, 
  BookOpen,
  FileCheck,
  Image as ImageIcon, 
  ChevronDown,
  Share2,
  Briefcase,
  Home
} from 'lucide-react';
import { getDataRequestSlug, getDataRequestPath } from '../lib/dataRequestHelper';
import { NAVIGATION_CONFIG, isItemActive, isParentActive } from '../config/navigationConfig';

export const Navbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    news, 
    schools,
    announcements,
    aulaBookings,
    setSelectedAnnouncement,
    isAuthenticated,
    organizations,
    selectedOrganizationSlug,
    setSelectedOrganizationSlug,
    setSelectedServiceRequirement,
    dataRequests,
    menuVisibility
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  // Dynamic menu visibility checks based on Central Navigation Registry
  const profileConfig = useMemo(() => NAVIGATION_CONFIG.find(i => i.id === 'profile'), []);
  const newsConfig = useMemo(() => NAVIGATION_CONFIG.find(i => i.id === 'news'), []);
  const servicesConfig = useMemo(() => NAVIGATION_CONFIG.find(i => i.id === 'services'), []);
  const contactConfig = useMemo(() => NAVIGATION_CONFIG.find(i => i.id === 'contact'), []);

  const isHomeVisible = isItemActive(menuVisibility, 'home');
  const isProfileVisible = profileConfig ? isParentActive(menuVisibility, profileConfig) : true;
  const isSopVisible = isItemActive(menuVisibility, 'sop-pelayanan');
  const isSchoolsVisible = isItemActive(menuVisibility, 'schools');
  const isKaryakuVisible = isItemActive(menuVisibility, 'karyaku');
  const isNewsVisible = newsConfig ? isParentActive(menuVisibility, newsConfig) : true;
  const isServicesVisible = servicesConfig ? isParentActive(menuVisibility, servicesConfig) : true;
  const isGalleryVisible = isItemActive(menuVisibility, 'gallery');
  const isContactVisible = contactConfig ? isParentActive(menuVisibility, contactConfig) : true;


  const toggleMobileSection = (section: string) => {
    setMobileOpenSection((prev) => (prev === section ? null : section));
  };

  // Kunci scroll halaman belakang saat sidebar mobile sedang terbuka
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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

  // Ref tracking if the dropdown was opened via deliberate touch tap (so mouseleave won't close it)
  const isTouchOpenRef = useRef<boolean>(false);
  const lastToggleTimeRef = useRef<number>(0);

  const clearAllTimeouts = () => {
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
  };

  const closeAllDropdowns = () => {
    clearAllTimeouts();
    isTouchOpenRef.current = false;
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(false);
  };

  const toggleDropdown = (
    menu: 'profile' | 'services' | 'news' | 'contact',
    e?: React.SyntheticEvent
  ) => {
    if (e) {
      e.stopPropagation();
    }
    const now = Date.now();
    // Debounce duplicate events within 350ms (e.g. touchEnd followed by click)
    if (now - lastToggleTimeRef.current < 350) {
      return;
    }
    lastToggleTimeRef.current = now;

    // Menandai menu dibuka oleh tap layar sentuh agar tidak tertutup otomatis oleh phantom mouseleave
    isTouchOpenRef.current = true;
    clearAllTimeouts();

    if (menu === 'profile') {
      const next = !profileDropdownOpen;
      setProfileDropdownOpen(next);
      setServicesDropdownOpen(false);
      setNewsDropdownOpen(false);
      setContactDropdownOpen(false);
      if (next) {
        try {
          import('../pages/OrganizationPage');
          import('../pages/NominativePage');
        } catch {}
      }
    } else if (menu === 'services') {
      const next = !servicesDropdownOpen;
      setServicesDropdownOpen(next);
      setProfileDropdownOpen(false);
      setNewsDropdownOpen(false);
      setContactDropdownOpen(false);
      if (next && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('preload-webviews'));
      }
    } else if (menu === 'news') {
      const next = !newsDropdownOpen;
      setNewsDropdownOpen(next);
      setProfileDropdownOpen(false);
      setServicesDropdownOpen(false);
      setContactDropdownOpen(false);
      if (next) {
        try {
          import('../pages/NewsPage');
        } catch {}
      }
    } else if (menu === 'contact') {
      const next = !contactDropdownOpen;
      setContactDropdownOpen(next);
      setProfileDropdownOpen(false);
      setServicesDropdownOpen(false);
      setNewsDropdownOpen(false);
      if (next) {
        try {
          import('../pages/ContactPage');
          import('../pages/SocialMediaPage');
        } catch {}
      }
    }
  };

  const handleHeaderLeave = () => {
    // Jika dropdown dibuka oleh sentuhan jari di tablet, jangan tutup karena mouse leave
    if (isTouchOpenRef.current) return;
    closeAllDropdowns();
  };

  const handleServicesEnter = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    setProfileDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(false);
    setServicesDropdownOpen(true);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('preload-webviews'));
    }
  };

  const handleServicesLeave = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    servicesTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 250);
  };

  const handleProfileEnter = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    setServicesDropdownOpen(false);
    setNewsDropdownOpen(false);
    setContactDropdownOpen(false);
    setProfileDropdownOpen(true);
    try {
      import('../pages/OrganizationPage');
      import('../pages/NominativePage');
    } catch {}
  };

  const handleProfileLeave = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    profileTimeoutRef.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 250);
  };

  const handleNewsEnter = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    setProfileDropdownOpen(false);
    setServicesDropdownOpen(false);
    setContactDropdownOpen(false);
    setNewsDropdownOpen(true);
    try {
      import('../pages/NewsPage');
    } catch {}
  };

  const handleNewsLeave = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    newsTimeoutRef.current = setTimeout(() => {
      setNewsDropdownOpen(false);
    }, 250);
  };

  const handleContactEnter = () => {
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
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
    if (isTouchOpenRef.current) return;
    clearAllTimeouts();
    contactTimeoutRef.current = setTimeout(() => {
      setContactDropdownOpen(false);
    }, 250);
  };

  const handleDirectHover = () => {
    if (!isTouchOpenRef.current) {
      closeAllDropdowns();
    }
  };

  // Clean up timeouts on unmount and click outside detection
  const navbarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      clearAllTimeouts();
    };
  }, []);

  const handleNavClick = (tab: string, path?: string) => {
    closeAllDropdowns();
    setActiveTab(tab, path);
    setMobileMenuOpen(false);
    setMobileOpenSection(null);

    // Immediate event dispatching for sub-tab and hash synchronization
    if (path && path.includes('#')) {
      window.dispatchEvent(new Event('hashchange'));
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nav-subtab-change', { detail: { path } }));
    }
  };

  return (
    <header ref={navbarRef} onMouseLeave={handleHeaderLeave} className="sticky top-0 z-40 w-full shadow-sm bg-transparent">
      {/* Main Navbar - Putih Kaca (Frosted White Glass) */}
      <div className="bg-white/85 backdrop-blur-md text-slate-800 border-b border-slate-200/70 shadow-sm">
        <div className="w-full px-2 sm:px-3">
          <div className="flex items-center justify-between h-12 sm:h-[50px] py-1 gap-2 xl:gap-4">
            
            {/* Logo and Brand */}
            <div 
              onClick={() => handleNavClick('home', '/beranda')}
              onMouseEnter={handleDirectHover}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none shrink-0"
            >
              <div className="h-8 sm:h-9 w-auto flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                <img 
                  src="/logo.png" 
                  alt="Logo Kabupaten Grobogan" 
                  className="h-8 sm:h-9 w-auto object-contain drop-shadow-sm"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xs sm:text-[14px] tracking-tight text-[#0f295c] leading-tight group-hover:text-[#1b56ce] transition-colors whitespace-nowrap">
                  KORWILCAM PURWODADI
                </span>
                <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium leading-tight whitespace-nowrap">
                  Dinas Pendidikan Kabupaten Grobogan
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 font-semibold text-[14px] xl:text-[15.5px] text-slate-700 shrink-0">
              {isHomeVisible && (
                <button
                  onClick={() => handleNavClick('home', '/beranda')}
                  onMouseEnter={handleDirectHover}
                  className={`px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'home' 
                      ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                      : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                  }`}
                >
                  Beranda
                </button>
              )}

              {/* Profil Dropdown */}
              {isProfileVisible && (
                <div 
                  className="relative group"
                  onMouseEnter={handleProfileEnter}
                  onMouseLeave={handleProfileLeave}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('profile', e)}
                    onTouchEnd={(e) => toggleDropdown('profile', e)}
                    aria-expanded={profileDropdownOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      profileDropdownOpen || activeTab === 'profile' || activeTab === 'nominatif' || activeTab === 'organization' || activeTab === 'purna-tugas'
                        ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                        : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                    }`}
                  >
                    <span>Profil</span>
                    <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                      profileDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <div className={`absolute left-0 top-full pt-1.5 z-50 transition-all duration-150 ease-out ${
                    profileDropdownOpen
                      ? 'opacity-100 visible pointer-events-auto translate-y-0'
                      : 'opacity-0 invisible pointer-events-none -translate-y-1'
                  }`}>
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-white/95 rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 backdrop-blur-md">
                      {isItemActive(menuVisibility, 'profile.welcome') && (
                        <button
                          onClick={() => handleNavClick('profile', '/profil#sambutan')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash !== '#struktur')
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Sambutan & Visi Misi</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'profile.structure') && (
                        <button
                          onClick={() => handleNavClick('profile', '/profil#struktur')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash === '#struktur')
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Struktur Organisasi</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'profile.nominative') && (
                        <button
                          onClick={() => handleNavClick('nominatif', '/profil#nominatif')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'nominatif'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Nominatif</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'profile.organization') && (
                        <button
                          onClick={() => {
                            setSelectedOrganizationSlug(null);
                            handleNavClick('organization', '/profil#organisasi');
                          }}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'organization'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Organisasi</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'profile.purna-tugas') && (
                        <button
                          onClick={() => handleNavClick('purna-tugas', '/profil#purna-tugas')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'purna-tugas'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Purna Tugas</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isSopVisible && (
                <button
                  onClick={() => handleNavClick('sop-pelayanan', '/sop-pelayanan')}
                  onMouseEnter={handleDirectHover}
                  className={`px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'sop-pelayanan' 
                      ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                      : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                  }`}
                >
                  SOP
                </button>
              )}

              {isSchoolsVisible && (
                <button
                  onClick={() => handleNavClick('schools', '/sekolah')}
                  onMouseEnter={handleDirectHover}
                  className={`px-2.5 xl:px-3.5 py-1 rounded-full transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === 'schools' 
                      ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                      : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                  }`}
                >
                  <span>Sekolah</span>
                </button>
              )}

              {isKaryakuVisible && (
                <button
                  onClick={() => handleNavClick('karyaku', '/karyaku')}
                  onMouseEnter={handleDirectHover}
                  className={`px-2.5 xl:px-3.5 py-1 rounded-full transition-all relative whitespace-nowrap cursor-pointer ${
                    activeTab === 'karyaku' 
                      ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                      : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                  }`}
                >
                  <span>Karyaku</span>
                </button>
              )}

              {/* Berita Dropdown */}
              {isNewsVisible && (
                <div 
                  className="relative group"
                  onMouseEnter={handleNewsEnter}
                  onMouseLeave={handleNewsLeave}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('news', e)}
                    onTouchEnd={(e) => toggleDropdown('news', e)}
                    aria-expanded={newsDropdownOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      newsDropdownOpen || activeTab === 'news' || activeTab === 'achievements'
                        ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                        : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                    }`}
                  >
                    <span>Berita</span>
                    <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                      newsDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <div className={`absolute left-0 top-full pt-1.5 z-50 transition-all duration-150 ease-out ${
                    newsDropdownOpen
                      ? 'opacity-100 visible pointer-events-auto translate-y-0'
                      : 'opacity-0 invisible pointer-events-none -translate-y-1'
                  }`}>
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="bg-white/95 rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 backdrop-blur-md">
                      {isItemActive(menuVisibility, 'news.latest') && (
                        <button
                          onClick={() => handleNavClick('news', '/berita')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'news' && (typeof window === 'undefined' || (!window.location.pathname.includes('/pengumuman') && !window.location.pathname.includes('/agenda') && !window.location.pathname.includes('/prestasi')))
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Berita Terkini</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'news.announcements') && (
                        <button
                          onClick={() => handleNavClick('news', '/berita/pengumuman')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/pengumuman')
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Pengumuman & Edaran</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'news.agenda') && (
                        <button
                          onClick={() => handleNavClick('news', '/berita/agenda')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/agenda')
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Agenda Kegiatan</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'news.achievements') && (
                        <button
                          onClick={() => handleNavClick('achievements', '/berita/prestasi')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'achievements'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Prestasi Siswa & Guru</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Layanan Dropdown */}
              {isServicesVisible && (
                <div 
                  className="relative group"
                  onMouseEnter={handleServicesEnter}
                  onMouseLeave={handleServicesLeave}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('services', e)}
                    onTouchEnd={(e) => toggleDropdown('services', e)}
                    aria-expanded={servicesDropdownOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      servicesDropdownOpen || activeTab === 'downloads' || activeTab.startsWith('service-')
                        ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                        : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                    }`}
                  >
                    <span>Layanan</span>
                    <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                      servicesDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <div className={`absolute left-0 top-full pt-1.5 max-w-[calc(100vw-24px)] z-50 transition-all duration-150 ease-out ${
                    servicesDropdownOpen
                      ? 'opacity-100 visible pointer-events-auto translate-y-0'
                      : 'opacity-0 invisible pointer-events-none -translate-y-1'
                  }`}>
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-white/95 rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 backdrop-blur-md">
                      {/* 1. Persyaratan Pelayanan */}
                      {isItemActive(menuVisibility, 'services.requirements') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-requirements', '/layanan/persyaratan-pelayanan')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'service-requirements' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Persyaratan Pelayanan</span>
                        </button>
                      )}

                      {/* 1. Unduh Berkas */}
                      {isItemActive(menuVisibility, 'services.downloads') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'downloads' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Unduh Berkas</span>
                        </button>
                      )}

                      {/* 2. Peminjaman Aula */}
                      {isItemActive(menuVisibility, 'services.aula') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'service-aula' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Peminjaman Aula</span>
                        </button>
                      )}

                      {/* 3. Surat Cuti */}
                      {isItemActive(menuVisibility, 'services.cuti') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'service-cuti' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Surat Cuti</span>
                        </button>
                      )}

                      {/* 4. Survey Pelayanan */}
                      {isItemActive(menuVisibility, 'services.survey') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'service-survey' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Survey Pelayanan</span>
                        </button>
                      )}

                      {/* 5. Permintaan Data */}
                      {isItemActive(menuVisibility, 'services.data-request') && (
                        <button
                          type="button"
                          onClick={() => handleNavClick('service-permintaan-data', dataRequestPath)}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer ${
                            activeTab === 'service-permintaan-data' 
                              ? 'bg-blue-50 text-[#1b56ce] font-bold' 
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <span>Permintaan Data</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {isGalleryVisible && (
                <button
                  onClick={() => handleNavClick('gallery', '/galeri')}
                  onMouseEnter={handleDirectHover}
                  className={`px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'gallery' 
                      ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                      : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                  }`}
                >
                  Galeri
                </button>
              )}

              {/* Kontak Dropdown (Kontak & Pengaduan, Sos Med) */}
              {isContactVisible && (
                <div 
                  className="relative group"
                  onMouseEnter={handleContactEnter}
                  onMouseLeave={handleContactLeave}
                >
                  <button
                    type="button"
                    onClick={(e) => toggleDropdown('contact', e)}
                    onTouchEnd={(e) => toggleDropdown('contact', e)}
                    aria-expanded={contactDropdownOpen}
                    aria-haspopup="true"
                    className={`flex items-center gap-1 px-2.5 xl:px-3.5 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                      contactDropdownOpen || activeTab === 'contact' || activeTab === 'social-media'
                        ? 'bg-gradient-to-r from-[#1b56ce] to-[#2467ea] text-white font-bold shadow-md shadow-blue-600/25' 
                        : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80'
                    }`}
                  >
                    <span>Kontak</span>
                    <ChevronDown className={`w-3.5 h-3.5 xl:w-4 xl:h-4 transition-transform duration-200 ${
                      contactDropdownOpen ? 'rotate-180' : ''
                    }`} />
                  </button>

                  <div className={`absolute right-0 top-full pt-1.5 z-50 transition-all duration-150 ease-out ${
                    contactDropdownOpen
                      ? 'opacity-100 visible pointer-events-auto translate-y-0'
                      : 'opacity-0 invisible pointer-events-none -translate-y-1'
                  }`}>
                    {/* Invisible hover bridge to eliminate gap */}
                    <div className="absolute -top-3 inset-x-0 h-5 bg-transparent" />

                    <div className="relative bg-white/95 rounded-xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 backdrop-blur-md min-w-[190px]">
                      {isItemActive(menuVisibility, 'contact.office') && (
                        <button
                          onClick={() => handleNavClick('contact', '/kontak')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2.5 cursor-pointer ${
                            activeTab === 'contact'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <Phone className="w-4 h-4 text-[#1b56ce]" />
                          <span>Kontak & Pengaduan</span>
                        </button>
                      )}

                      {isItemActive(menuVisibility, 'contact.social') && (
                        <button
                          onClick={() => handleNavClick('social-media', '/media-sosial')}
                          className={`w-full text-left px-3.5 py-2 text-[14px] rounded-lg transition-colors font-semibold whitespace-nowrap flex items-center gap-2.5 cursor-pointer ${
                            activeTab === 'social-media'
                              ? 'bg-blue-50 text-[#1b56ce] font-bold'
                              : 'text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/70'
                          }`}
                        >
                          <Share2 className="w-4 h-4 text-[#1b56ce]" />
                          <span>Sos Med</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg text-slate-700 hover:text-[#1b56ce] hover:bg-blue-50/80 focus:outline-none transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay & Sidebar (Sesuai Desain Gambar 2: Off-canvas White Sidebar dari Kanan) */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          {/* 1. Backdrop Gelap Semi-Transparan */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 animate-in fade-in"
            aria-hidden="true"
          />

          {/* 2. White Sidebar Panel (Slide-in dari Kanan) */}
          <div className="fixed top-0 bottom-0 right-0 z-50 w-[300px] sm:w-[340px] max-w-[85vw] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-right">
            {/* Header Sidebar: Judul "Menu Navigasi" & Tombol Tutup (X) */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                Menu Navigasi
              </h2>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 -mr-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
                aria-label="Tutup menu navigasi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Beranda (Pill Button dengan Icon Home) */}
              {isHomeVisible && (
                <button
                  type="button"
                  onClick={() => handleNavClick('home', '/beranda')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'home'
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200/80 shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-sky-700'
                  }`}
                >
                  <Home className={`w-4 h-4 ${activeTab === 'home' ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>Beranda</span>
                </button>
              )}

              {/* 1. PROFIL INSTANSI */}
              {isProfileVisible && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1 select-none">
                    PROFIL INSTANSI
                  </div>
                  <div className="space-y-0.5">
                    {isItemActive(menuVisibility, 'profile.welcome') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('profile', '/profil#sambutan')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash !== '#struktur')
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Sambutan & Visi Misi
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'profile.structure') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('profile', '/profil#struktur')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'profile' && (typeof window !== 'undefined' && window.location.hash === '#struktur')
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Struktur Organisasi
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'profile.nominative') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('nominatif', '/profil#nominatif')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'nominatif'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Nominatif Guru & Tendik
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'profile.organization') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrganizationSlug(null);
                          handleNavClick('organization', '/profil#organisasi');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'organization'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Organisasi Mitra & Profesi
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'profile.purna-tugas') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('purna-tugas', '/profil#purna-tugas')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'purna-tugas'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Purna Tugas
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 2. BERITA */}
              {isNewsVisible && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1 select-none">
                    BERITA
                  </div>
                  <div className="space-y-0.5">
                    {isItemActive(menuVisibility, 'news.latest') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('news', '/berita')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'news' && (typeof window === 'undefined' || (!window.location.pathname.includes('/pengumuman') && !window.location.pathname.includes('/agenda') && !window.location.pathname.includes('/prestasi')))
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Berita Terkini
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'news.announcements') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('news', '/berita/pengumuman')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/pengumuman')
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Pengumuman & Edaran
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'news.agenda') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('news', '/berita/agenda')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'news' && typeof window !== 'undefined' && window.location.pathname.includes('/agenda')
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Agenda Kegiatan
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'news.achievements') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('achievements', '/berita/prestasi')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'achievements'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Prestasi Siswa & Guru
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 3. LAYANAN TERPADU */}
              {isServicesVisible && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1 select-none">
                    LAYANAN TERPADU
                  </div>
                  <div className="space-y-0.5">
                    {isItemActive(menuVisibility, 'services.requirements') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-requirements', '/layanan/persyaratan-pelayanan')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'service-requirements'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Persyaratan Pelayanan
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'services.downloads') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('downloads', '/layanan/unduh-berkas')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'downloads'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Unduh Berkas & Dokumen
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'services.aula') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-aula', '/layanan/peminjaman-aula')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'service-aula'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Peminjaman Aula
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'services.cuti') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-cuti', '/layanan/surat-cuti')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'service-cuti'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Surat Cuti ASN
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'services.survey') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-survey', '/layanan/survey-pelayanan')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'service-survey'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Survey Pelayanan
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'services.data-request') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('service-permintaan-data', dataRequestPath)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'service-permintaan-data'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Permintaan Data
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 4. PENDIDIKAN & KEGIATAN */}
              {(isSopVisible || isSchoolsVisible || isKaryakuVisible || isGalleryVisible) && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1 select-none">
                    PENDIDIKAN & KEGIATAN
                  </div>
                  <div className="space-y-0.5">
                    {isSopVisible && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('sop-pelayanan', '/sop-pelayanan')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'sop-pelayanan'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        SOP Pelayanan
                      </button>
                    )}
                    {isSchoolsVisible && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('schools', '/sekolah')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'schools'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Data Sekolah
                      </button>
                    )}
                    {isKaryakuVisible && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('karyaku', '/karyaku')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'karyaku'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Karyaku
                      </button>
                    )}
                    {isGalleryVisible && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('gallery', '/galeri')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'gallery'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Galeri Kegiatan
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 5. KONTAK & MEDIA */}
              {isContactVisible && (
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1 pb-1 select-none">
                    KONTAK & MEDIA
                  </div>
                  <div className="space-y-0.5">
                    {isItemActive(menuVisibility, 'contact.office') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('contact', '/kontak')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'contact'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Kontak & Pengaduan
                      </button>
                    )}
                    {isItemActive(menuVisibility, 'contact.social') && (
                      <button
                        type="button"
                        onClick={() => handleNavClick('social-media', '/media-sosial')}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors cursor-pointer ${
                          activeTab === 'social-media'
                            ? 'bg-sky-50 text-sky-800 font-bold'
                            : 'text-sky-700 hover:text-sky-900 hover:bg-slate-50'
                        }`}
                      >
                        Media Sosial Resmi
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
