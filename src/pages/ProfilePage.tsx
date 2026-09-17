import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Target, 
  Award, 
  Users, 
  MapPin, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck,
  GraduationCap,
  User,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Building,
  Home,
  ArrowRight,
  Crown
} from 'lucide-react';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

// 1. Bottom-Left Corner Ribbon Accent (Dark Blue Geometric Cut matching Gambar 2)
const CardCornerRibbon: React.FC = () => (
  <svg 
    className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-0 select-none" 
    viewBox="0 0 100 100" 
    fill="none"
  >
    <polygon points="0,100 100,100 0,0" fill="#0d3b9e" opacity="0.95" />
    <polygon points="0,100 60,100 0,40" fill="#092a72" opacity="0.45" />
  </svg>
);

// 2. Far-Right Background Watermark (Education Book & Rising Ribbon Vector matching Gambar 2)
const CardEducationWatermark: React.FC = () => (
  <div className="absolute right-0 bottom-0 top-0 w-64 sm:w-80 lg:w-96 pointer-events-none select-none z-0 overflow-hidden">
    <svg viewBox="0 0 400 360" fill="none" className="w-full h-full object-cover">
      {/* Flowing blue ribbon curves on the right */}
      <path d="M400 0 C320 60 300 180 340 280 C360 330 380 350 400 360 L400 0 Z" fill="url(#blueRibbonGrad)" opacity="0.14" />
      <path d="M400 40 C340 100 320 220 360 300 C380 340 390 355 400 360 L400 40 Z" fill="url(#blueRibbonGrad2)" opacity="0.2" />
      
      {/* Open Book & Rising Figures (Symbol of Education) */}
      <g transform="translate(230, 150)" stroke="url(#eduGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Left Book Page */}
        <path d="M10 135 C-45 115 -85 75 -95 15 C-45 30 0 75 10 135 Z" fill="#eff6ff" fillOpacity="0.45" stroke="#93c5fd" strokeWidth="2.5" />
        {/* Right Book Page */}
        <path d="M10 135 C65 115 105 75 115 15 C65 30 20 75 10 135 Z" fill="#eff6ff" fillOpacity="0.45" stroke="#93c5fd" strokeWidth="2.5" />
        {/* Center Spine */}
        <path d="M10 135 V25" stroke="#60a5fa" strokeWidth="3" />
        {/* Rising Figure / Youth */}
        <circle cx="10" cy="-22" r="9" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" opacity="0.85" />
        <path d="M-12 -2 C-5 -12 25 -12 32 -2 C25 15 -5 15 -12 -2 Z" fill="#bae6fd" opacity="0.6" />
        <path d="M-15 0 C-3 10 23 10 35 0" stroke="#3b82f6" strokeWidth="2.5" />
      </g>

      <defs>
        <linearGradient id="blueRibbonGrad" x1="400" y1="0" x2="300" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="blueRibbonGrad2" x1="400" y1="40" x2="320" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
        <linearGradient id="eduGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const ProfilePage: React.FC = () => {
  const { officeProfile, staff } = useApp();
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');
  const [previewStaff, setPreviewStaff] = useState<{
    id?: string;
    name: string;
    role: string;
    nip?: string;
    photo?: string;
    division?: string;
  } | null>(null);

  React.useEffect(() => {
    const scrollToTarget = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase().replace('#', '');
      let target = hash;
      if (!target) {
        if (path.includes('sambutan') || path.includes('visi')) target = 'sambutan';
        else if (path.includes('struktur') || path.includes('pegawai') || path.includes('pengawas')) target = 'struktur';
      }

      if (target) {
        setTimeout(() => {
          const el = document.getElementById(target);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 120);
      }
    };

    scrollToTarget();
    window.addEventListener('hashchange', scrollToTarget);
    return () => window.removeEventListener('hashchange', scrollToTarget);
  }, []);

  const divisionOrder: Record<string, number> = {
    'Pimpinan Korwilcam Purwodadi': 1,
    'Pimpinan': 1,
    'Pengawas SD': 2,
    'Pengawas TK': 3,
    'Penilik KB': 4,
    'Penilik KB/TK': 4,
    'Penilik PAUD': 4,
    'Penilik PAUD/TK': 4,
    'Staf': 5,
    'Tata Usaha': 5
  };

  const sortedStaff = [...staff].sort((a, b) => {
    const orderA = divisionOrder[a.division] || 99;
    const orderB = divisionOrder[b.division] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredStaff = selectedDivision === 'ALL'
    ? sortedStaff
    : sortedStaff.filter((s) => {
        if (selectedDivision === 'Pimpinan Korwilcam Purwodadi') {
          return s.division === 'Pimpinan Korwilcam Purwodadi' || s.division === 'Pimpinan';
        }
        if (selectedDivision === 'Penilik KB' || selectedDivision === 'Penilik PAUD') {
          return s.division === 'Penilik KB' || s.division === 'Penilik KB/TK' || s.division === 'Penilik PAUD' || s.division === 'Penilik PAUD/TK';
        }
        if (selectedDivision === 'Staf') {
          return s.division === 'Staf' || s.division === 'Tata Usaha';
        }
        return s.division === selectedDivision;
      });

  const handleNextStaff = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!previewStaff || filteredStaff.length <= 1) return;
    const currentIndex = filteredStaff.findIndex(s => (s.id && s.id === previewStaff.id) || s.name === previewStaff.name);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % filteredStaff.length;
      setPreviewStaff(filteredStaff[nextIndex]);
    }
  };

  const handlePrevStaff = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!previewStaff || filteredStaff.length <= 1) return;
    const currentIndex = filteredStaff.findIndex(s => (s.id && s.id === previewStaff.id) || s.name === previewStaff.name);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + filteredStaff.length) % filteredStaff.length;
      setPreviewStaff(filteredStaff[prevIndex]);
    }
  };

  React.useEffect(() => {
    if (previewStaff) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [previewStaff]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewStaff) return;
      if (e.key === 'Escape') {
        setPreviewStaff(null);
      } else if (e.key === 'ArrowRight') {
        if (filteredStaff.length > 1) {
          const currentIndex = filteredStaff.findIndex(s => (s.id && s.id === previewStaff.id) || s.name === previewStaff.name);
          if (currentIndex !== -1) {
            const nextIndex = (currentIndex + 1) % filteredStaff.length;
            setPreviewStaff(filteredStaff[nextIndex]);
          }
        }
      } else if (e.key === 'ArrowLeft') {
        if (filteredStaff.length > 1) {
          const currentIndex = filteredStaff.findIndex(s => (s.id && s.id === previewStaff.id) || s.name === previewStaff.name);
          if (currentIndex !== -1) {
            const prevIndex = (currentIndex - 1 + filteredStaff.length) % filteredStaff.length;
            setPreviewStaff(filteredStaff[prevIndex]);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewStaff, filteredStaff]);

  const divisions = [
    { id: 'ALL', label: 'Semua Pejabat & Staf' },
    { id: 'Pimpinan Korwilcam Purwodadi', label: 'Pimpinan' },
    { id: 'Pengawas SD', label: 'Pengawas SD' },
    { id: 'Pengawas TK', label: 'Pengawas TK' },
    { id: 'Penilik KB', label: 'Penilik KB' },
    { id: 'Staf', label: 'Staf' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Profil Kantor Korwilcam Purwodadi
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Koordinator Wilayah Bidang Pendidikan Kecamatan Purwodadi, Dinas Pendidikan Kabupaten Grobogan.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Sambutan Resmi Pimpinan (Desain Modern Sesuai Gambar 2) */}
      <section id="sambutan" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 scroll-mt-24 -mt-8 sm:-mt-10 relative z-20">
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-blue-100/90 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col lg:flex-row items-stretch p-4 sm:p-6 lg:p-7 gap-6 lg:gap-8">
          
          {/* Bottom-left dark blue ribbon & Right education watermark */}
          <CardCornerRibbon />
          <CardEducationWatermark />

          {/* Kolom Kiri: Kartu Profil Pod Biru Mewah */}
          <div className="w-full lg:w-[320px] bg-gradient-to-b from-[#1b56ce] via-[#1d5ee6] to-[#1546b8] rounded-[26px] p-5 sm:p-6 text-white flex flex-col items-center justify-between text-center relative overflow-hidden shadow-lg shrink-0 z-10">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            {/* Bingkai Foto Resmi Pimpinan dengan Border Putih Tebal */}
            <div 
              onClick={() => setPreviewStaff({
                name: officeProfile.korwilName,
                role: 'Koordinator Wilayah Bidang Pendidikan Purwodadi',
                nip: officeProfile.korwilNip,
                photo: officeProfile.korwilPhoto,
                division: 'Pimpinan Korwilcam Purwodadi'
              })}
              className="relative cursor-pointer group/korwil mt-1"
              title="Klik untuk melihat foto pimpinan lebih besar"
            >
              {officeProfile.korwilPhoto && !officeProfile.korwilPhoto.includes('unsplash.com') ? (
                <img
                  src={officeProfile.korwilPhoto}
                  alt={officeProfile.korwilName}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                  }}
                  className="w-48 h-56 sm:w-52 sm:h-60 rounded-2xl object-cover border-4 border-white shadow-xl bg-slate-100 transition-all duration-300 group-hover/korwil:scale-[1.02]"
                />
              ) : null}
              <div className={`w-48 h-56 sm:w-52 sm:h-60 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 ${officeProfile.korwilPhoto && !officeProfile.korwilPhoto.includes('unsplash.com') ? 'hidden' : 'flex'}`}>
                <User className="w-20 h-20 text-slate-400 stroke-1" />
                <span className="text-xs font-bold text-slate-500">Foto Resmi Pimpinan</span>
              </div>
              <div className="absolute inset-0 rounded-2xl bg-slate-950/20 opacity-0 group-hover/korwil:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="p-2 rounded-full bg-white/95 text-blue-600 shadow-md transform scale-90 group-hover/korwil:scale-100 transition-transform">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Nama, Jabatan, & Badge Pill NIP Putih */}
            <div className="mt-3.5 mb-1 w-full flex flex-col items-center">
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
                {officeProfile.korwilName}
              </h3>
              <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                Koordinator Wilayah Kecamatan Purwodadi
              </p>
              <span className="bg-white text-blue-700 font-bold text-[11px] sm:text-xs px-4 py-1 rounded-full mt-2.5 shadow-sm inline-block tracking-wide">
                NIP. {officeProfile.korwilNip}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Teks Sambutan & Kutipan */}
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-3 lg:pr-3 relative z-10">
            <div>
              {/* Baris Atas: Pill Badge Kiri & Quote Kanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-600 border border-blue-200/70 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs w-fit">
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  <span>Sambutan Koordinator Wilayah</span>
                </div>

                <div className="flex items-start gap-2 max-w-xs self-start sm:self-auto text-left">
                  <span className="text-2xl sm:text-3xl font-serif text-blue-600 leading-none shrink-0 font-black">
                    “
                  </span>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 italic leading-snug">
                      Bersama Maju Mewujudkan Pendidikan yang Berkualitas
                    </p>
                    <div className="w-full h-0.5 bg-blue-400/30 rounded-full mt-1.5" />
                  </div>
                </div>
              </div>

              {/* Judul Sambutan & Garis Aksen */}
              <div className="mt-4 mb-3">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {officeProfile.greetingTitle}
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-2.5" />
              </div>

              {/* Paragraf Sambutan */}
              <div className="text-slate-600 text-xs sm:text-sm leading-relaxed space-y-3.5 my-3">
                <p>{officeProfile.greetingText}</p>
                <p>
                  Dalam era transformasi Merdeka Belajar, peran satuan pendidikan di tingkat dasar dan usia dini sangatlah fundamental. Kami terus berkomitmen mempererat sinergi antara kepala sekolah, guru, pengawas, dan orang tua agar tercipta iklim belajar yang aman, menyenangkan, serta berorientasi pada kemajuan karakter dan kompetensi anak didik.
                </p>
              </div>
            </div>

            {/* Footer Sambutan */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {officeProfile.korwilName}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Koordinator Wilayah Kecamatan Purwodadi
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-blue-600 font-semibold italic text-xs sm:text-sm tracking-wide self-end sm:self-auto">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Purwodadi, Grobogan</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Visi dan Misi (Desain Modern Senada Gambar 2) */}
      <section id="visi-misi" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        <div className="bg-white rounded-3xl sm:rounded-[32px] border border-blue-100/90 shadow-xl shadow-blue-500/5 relative overflow-hidden flex flex-col lg:flex-row items-stretch p-4 sm:p-6 lg:p-7 gap-6 lg:gap-8">
          
          {/* Bottom-left dark blue ribbon & Right education watermark */}
          <CardCornerRibbon />
          <CardEducationWatermark />

          {/* Kolom Kiri: Pod Biru Visi Korwilcam */}
          <div className="w-full lg:w-[320px] bg-gradient-to-b from-[#1b56ce] via-[#1d5ee6] to-[#1546b8] rounded-[26px] p-5 sm:p-6 text-white flex flex-col justify-between relative overflow-hidden shadow-lg shrink-0 z-10">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div>
              {/* Ikon Target Visi */}
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 flex items-center justify-center text-white shadow-xs mb-3.5">
                <Target className="w-6 h-6" />
              </div>

              <span className="bg-white/20 text-white border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest inline-block mb-2.5">
                Visi Korwilcam Purwodadi
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-white leading-snug tracking-tight">
                Visi Pendidikan Kecamatan Purwodadi
              </h3>

              {/* Kotak Naskah Visi */}
              <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-white">
                <p className="text-xs sm:text-sm leading-relaxed text-blue-50 font-medium italic">
                  "{officeProfile.vision}"
                </p>
              </div>
            </div>

            {/* Badge Pill Putih Bawah */}
            <div className="mt-6">
              <span className="bg-white text-blue-700 font-bold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-sm inline-block tracking-wide">
                Landasan Mutu Pendidikan SD, TK, & KB
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Peta Jalan Misi Satuan Kerja */}
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-3 lg:pr-3 relative z-10">
            <div>
              {/* Baris Atas: Pill Badge Kiri & Slogan Misi Kanan */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-600 border border-blue-200/70 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider shadow-2xs w-fit">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>Peta Jalan Misi Korwilcam</span>
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
                  Misi Satuan Kerja Korwilcam Purwodadi
                </h2>
                <div className="w-12 h-1 bg-blue-600 rounded-full mt-2.5 mb-4" />
              </div>

              {/* Daftar Butir Misi */}
              <div className="space-y-3 relative z-10">
                {officeProfile.missions.map((misi, idx) => (
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
            </div>

            {/* Footer Misi */}
            <div className="pt-5 mt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-blue-600 rounded-full shrink-0" />
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Dinas Pendidikan Kabupaten Grobogan
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Koordinator Wilayah Bidang Pendidikan Purwodadi
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-blue-600 font-semibold italic text-xs sm:text-sm tracking-wide self-end sm:self-auto">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Purwodadi, Grobogan</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Struktur Organisasi & Pengawas/Penilik */}
      <section id="struktur" className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            Struktur Organisasi
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Jajaran Pimpinan, Pengawas & Penilik
          </h2>
          <p className="text-sm text-slate-600">
            Aparatur sipil negara yang bertugas melakukan pembinaan, pemantauan, dan evaluasi mutu pendidikan di wilayah Purwodadi.
          </p>

          {/* Filter Tab */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {divisions.map((div) => (
              <button
                key={div.id}
                onClick={() => setSelectedDivision(div.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedDivision === div.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>
        </div>

        <div id="pegawai" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4.5 sm:gap-5.5 lg:gap-6 scroll-mt-24">
          {filteredStaff.length === 0 ? (
            <div className="col-span-full py-12 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">Belum Ada Data Pejabat / Staf</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                {selectedDivision === 'ALL'
                  ? 'Data jajaran pengawas, penilik, dan staf kantor belum ditambahkan di database.'
                  : `Belum ada data staf pada kategori "${selectedDivision}". Silakan pilih kategori lain atau kembali ke Semua.`}
              </p>
            </div>
          ) : (
            filteredStaff.map((person) => {
              const hasValidPhoto = Boolean(
                person.photo && 
                !person.photo.includes('unsplash.com') && 
                !person.photo.includes('photo-1560250097') && 
                person.photo.trim().length > 0
              );
              return (
                <div
                  key={person.id}
                  onClick={() => setPreviewStaff(person)}
                  className="card-deferred bg-white rounded-[24px] border-2 border-blue-100/90 shadow-sm hover:shadow-xl hover:border-[#0062f5] hover:-translate-y-1.5 transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden"
                  title="Klik untuk melihat foto & profil lebih besar"
                >
                  {/* Bagian Atas: Foto Full Setengah Kartu (Dual-Layer Uncropped Composition) */}
                  <div className="relative w-full h-56 sm:h-60 md:h-64 bg-slate-900 overflow-hidden shrink-0">
                    {hasValidPhoto ? (
                      <>
                        {/* Layer 1: Ambient Backdrop Blur (Menutupi Sisi Kiri & Kanan Tanpa Celah) */}
                        <img
                          src={person.photo}
                          alt=""
                          aria-hidden="true"
                          className="photo-ambient-bg absolute inset-0 w-full h-full object-cover blur-xl scale-125 opacity-80 pointer-events-none select-none"
                        />
                        {/* Layer 2: Foto Utuh Pejabat 100% Tidak Terpotong (Wajah, Peci/Jilbab, Dagu & Seragam Utuh) */}
                        <img
                          src={person.photo}
                          alt={person.name}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const ambient = parent.querySelector('.photo-ambient-bg') as HTMLElement;
                              if (ambient) ambient.style.display = 'none';
                              const fallback = parent.querySelector('.photo-fallback') as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                          className="relative z-10 w-full h-full object-contain object-bottom drop-shadow-md transition-transform duration-500 group-hover:scale-105"
                        />
                      </>
                    ) : null}
                    <div className={`photo-fallback w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-100 text-blue-600 ${hasValidPhoto ? 'hidden' : 'flex'}`}>
                      <User className="w-16 h-16 sm:w-20 sm:h-20 text-blue-500/80" />
                      <span className="text-xs font-extrabold text-blue-600 mt-1 uppercase tracking-wider">ASN</span>
                    </div>

                    {/* Efek Vignette Lembut di Bawah Foto */}
                    <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/30 to-transparent z-10 pointer-events-none" />

                    {/* Badge Kategori / Jabatan Pojok Kanan Atas Foto */}
                    <div className="absolute top-3 right-3 z-20">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0062f5] text-white text-[10.5px] sm:text-[11.5px] font-bold shadow-md shadow-black/20 tracking-tight backdrop-blur-xs">
                        {person.division === 'Pimpinan Korwilcam Purwodadi' || person.division === 'Pimpinan' ? (
                          <>
                            <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
                            <span>Pimpinan</span>
                          </>
                        ) : person.division === 'Pengawas SD' ? (
                          <span>Pengawas SD</span>
                        ) : person.division === 'Pengawas TK' ? (
                          <span>Pengawas TK</span>
                        ) : person.division === 'Penilik KB' || person.division === 'Penilik KB/TK' || person.division === 'Penilik PAUD' || person.division === 'Penilik PAUD/TK' ? (
                          <span>Penilik KB</span>
                        ) : (
                          <span>Staf</span>
                        )}
                      </span>
                    </div>

                    {/* Ikon Zoom Hover di Tengah Foto */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-20">
                      <div className="p-2.5 rounded-full bg-white/95 text-[#0062f5] shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Bagian Bawah: Informasi Detail (Nama, NIP, & Pill Jabatan) */}
                  <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3 bg-white">
                    {/* Nama & NIP (Rata Kiri, Bold Navy Bersih Sesuai Gambar 2) */}
                    <div className="text-left space-y-1">
                      <h4 className="font-black text-[#0a2540] text-xs sm:text-[14px] leading-snug group-hover:text-[#0062f5] transition-colors uppercase tracking-tight line-clamp-2 min-h-[36px] flex items-center">
                        {person.name}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {person.nip ? `NIP. ${person.nip}` : 'NIP. -'}
                      </p>
                    </div>

                    {/* Wadah Pill Jabatan Bagian Bawah (Sesuai Desain Gambar 2) */}
                    <div className="w-full bg-[#eef5ff] border border-blue-200/70 rounded-full px-3 py-2 flex items-center gap-2.5 group-hover:bg-[#e0edff] group-hover:border-blue-300 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-[#0062f5] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-[10.5px] sm:text-[11.5px] font-extrabold text-[#0062f5] uppercase tracking-tight line-clamp-1 flex-1 leading-none text-left">
                        {person.role}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Wilayah Kerja & Satuan Pendidikan yang Dinaungi (Desain Gambar 2 - Kompak & Modern) */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="bg-white rounded-3xl sm:rounded-[28px] p-5 sm:p-7 border border-blue-100/90 shadow-xl shadow-blue-500/5 relative overflow-hidden space-y-4 sm:space-y-5">
          
          {/* Top-Left Corner Blue Curved Accent Ribbon */}
          <svg className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-0 select-none" viewBox="0 0 100 100" fill="none">
            <path d="M0 0 L36 0 C36 32 24 58 0 74 Z" fill="url(#topLeftWaveGrad)" />
            <path d="M0 0 L18 0 C18 42 8 72 0 88 Z" fill="#2563eb" opacity="0.9" />
            <defs>
              <linearGradient id="topLeftWaveGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Top-Right Decorative Map & School Building Illustration Vector */}
          <div className="absolute top-0 right-0 h-36 sm:h-44 w-64 sm:w-80 lg:w-96 pointer-events-none select-none z-0 overflow-hidden">
            <svg viewBox="0 0 380 200" fill="none" className="w-full h-full object-cover">
              <path d="M120 0 C180 80 260 120 380 130 L380 0 Z" fill="url(#mapSkyGrad)" opacity="0.45" />
              <path d="M220 0 C270 50 330 75 380 80 L380 0 Z" fill="url(#mapSkyGrad2)" opacity="0.6" />

              {/* School / Government Office Building Silhouette */}
              <g transform="translate(260, 20)" opacity="0.45">
                <line x1="50" y1="0" x2="50" y2="25" stroke="#0284c7" strokeWidth="1.8" />
                <polygon points="50,0 66,5 50,11" fill="#38bdf8" />
                <polygon points="50,25 15,48 85,48" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                <rect x="22" y="48" width="56" height="52" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" rx="3" />
                <rect x="30" y="55" width="10" height="12" fill="#ffffff" stroke="#0284c7" strokeWidth="1" rx="1.5" />
                <rect x="60" y="55" width="10" height="12" fill="#ffffff" stroke="#0284c7" strokeWidth="1" rx="1.5" />
                <rect x="44" y="74" width="12" height="26" fill="#0284c7" rx="1.5" />
                <rect x="0" y="56" width="22" height="44" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.2" rx="2" />
                <rect x="78" y="56" width="22" height="44" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.2" rx="2" />
              </g>

              {/* Folded Map 3D Graphic */}
              <g transform="translate(160, 50)" opacity="0.95">
                <polygon points="12,110 55,122 98,112 142,125 130,132 88,122 45,130 0,118" fill="#93c5fd" opacity="0.3" />
                <polygon points="10,25 55,42 45,115 0,98" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="55,42 98,28 88,102 45,115" fill="#f0f9ff" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
                <polygon points="98,28 142,45 132,120 88,102" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" strokeLinejoin="round" />
                <path d="M15 60 Q35 75 52 82 T92 65 T135 85" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.75" />
                <path d="M25 80 Q60 55 90 90 T130 55" stroke="#93c5fd" strokeWidth="2" strokeDasharray="3 3" fill="none" opacity="0.8" />
              </g>

              {/* Prominent Large Location Pin 3D */}
              <g transform="translate(235, 30)">
                <ellipse cx="22" cy="72" rx="14" ry="5" fill="#1e3a8a" opacity="0.25" />
                <path d="M22 68 C22 68 0 42 0 22 C0 9.8 9.8 0 22 0 C34.2 0 44 9.8 44 22 C44 42 22 68 22 68 Z" fill="url(#pinGrad)" filter="drop-shadow(0px 6px 8px rgba(37,99,235,0.35))" />
                <circle cx="22" cy="22" r="9" fill="#ffffff" />
              </g>

              <defs>
                <linearGradient id="mapSkyGrad" x1="120" y1="0" x2="380" y2="130" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
                </linearGradient>
                <linearGradient id="mapSkyGrad2" x1="220" y1="0" x2="380" y2="80" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                <linearGradient id="pinGrad" x1="0" y1="0" x2="44" y2="68" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="40%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Header Info Area */}
          <div className="max-w-2xl relative z-10">
            <span className="text-[11px] font-extrabold text-white uppercase tracking-wider bg-blue-900 px-3 py-1 rounded-full shadow-xs inline-flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-sky-400" />
              <span>Wilayah Kerja Koordinasi</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2.5">
              Cakupan Pembinaan Satuan Pendidikan Purwodadi
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed max-w-xl">
              Kantor Korwilcam Purwodadi membina 17 Desa dan Kelurahan di Kecamatan Purwodadi dengan ratusan lembaga pendidikan formal maupun nonformal.
            </p>
          </div>

          {/* Daftar Kelurahan & Desa */}
          <div className="space-y-4 pt-1 relative z-10">
            {/* 1. Kelompok Kelurahan */}
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-900 border border-blue-200/70 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <Building className="w-3 h-3 text-white" />
                  </div>
                  <span>Daftar Kelurahan (4)</span>
                </div>
                <span className="text-blue-500 font-black text-sm tracking-tighter">/</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {['Kel. Danyang', 'Kel. Kalongan', 'Kel. Kuripan', 'Kel. Purwodadi'].map((kel, i) => (
                  <div 
                    key={i} 
                    className="group/item relative bg-white hover:bg-blue-50/50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-blue-100 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-2 overflow-hidden border-l-[3.5px] border-l-blue-600"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-50 group-hover/item:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
                        <MapPin className="w-3.5 h-3.5 fill-blue-600/20" />
                      </div>
                      <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                        {kel}
                      </span>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-blue-50/80 group-hover/item:bg-blue-600 group-hover/item:text-white flex items-center justify-center text-blue-600 shrink-0 text-xs transition-colors shadow-2xs">
                      <ArrowRight className="w-3 h-3 group-hover/item:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Kelompok Desa */}
            <div>
              <div className="flex items-center gap-2 mb-2.5 mt-4">
                <div className="inline-flex items-center gap-2 bg-blue-50/90 text-blue-900 border border-blue-200/70 rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wider shadow-2xs">
                  <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                    <Home className="w-3 h-3 text-white" />
                  </div>
                  <span>Daftar Desa (13)</span>
                </div>
                <span className="text-blue-500 font-black text-sm tracking-tighter">/</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
                {[
                  'Desa Candisari',
                  'Desa Cingkrong',
                  'Desa Genuksuran',
                  'Desa Kandangan',
                  'Desa Karanganyar',
                  'Desa Kedungrejo',
                  'Desa Nambuhan',
                  'Desa Ngembak',
                  'Desa Nglobar',
                  'Desa Ngraji',
                  'Desa Pulorejo',
                  'Desa Putat',
                  'Desa Warukaranganyar'
                ].map((desa, i) => (
                  <div 
                    key={i} 
                    className="group/item relative bg-white hover:bg-blue-50/50 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 border border-blue-100 shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-1.5 overflow-hidden border-l-[3.5px] border-l-blue-600"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-blue-50 group-hover/item:bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors">
                        <MapPin className="w-3 h-3 fill-blue-600/20" />
                      </div>
                      <span className="font-bold text-[11px] sm:text-xs text-slate-800 truncate">
                        {desa}
                      </span>
                    </div>

                    <div className="w-5 h-5 rounded-full bg-blue-50/80 group-hover/item:bg-blue-600 group-hover/item:text-white flex items-center justify-center text-blue-600 shrink-0 text-[10px] transition-colors shadow-2xs">
                      <ArrowRight className="w-2.5 h-2.5 group-hover/item:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Popup Modal Foto Profil Staf Lebih Besar */}
      {previewStaff && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewStaff(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Foto profil ${previewStaff.name}`}
        >
          {/* Tombol Navigasi Sebelumnya (Desktop) */}
          {filteredStaff.length > 1 && (
            <button
              type="button"
              onClick={handlePrevStaff}
              className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all hover:scale-110 shadow-2xl border border-white/20 z-20"
              title="Foto Sebelumnya (Panah Kiri / Arrow Left)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Tombol Navigasi Selanjutnya (Desktop) */}
          {filteredStaff.length > 1 && (
            <button
              type="button"
              onClick={handleNextStaff}
              className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md items-center justify-center transition-all hover:scale-110 shadow-2xl border border-white/20 z-20"
              title="Foto Selanjutnya (Panah Kanan / Arrow Right)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Tombol Tutup Melayang di Pojok Layar */}
          <button
            type="button"
            onClick={() => setPreviewStaff(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:rotate-90 z-30 border border-white/20 shadow-2xl"
            title="Tutup (Tekan ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Kartu Popup */}
          <div 
            className="relative max-w-md w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Wadah Tampilan Foto */}
            <div className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center min-h-[300px] sm:min-h-[380px] max-h-[60vh] overflow-hidden p-3">
              {previewStaff.photo && 
               !previewStaff.photo.includes('unsplash.com') && 
               !previewStaff.photo.includes('photo-1560250097') && 
               previewStaff.photo.trim().length > 0 ? (
                <img
                  src={previewStaff.photo}
                  alt={previewStaff.name}
                  className="w-auto h-auto max-w-full max-h-[56vh] object-contain rounded-xl shadow-2xl select-none"
                />
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-28 h-28 rounded-3xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400">
                    <User className="w-16 h-16" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400">Pas Foto Belum Tersedia</p>
                </div>
              )}

              {/* Badge Divisi di Pojok Kiri Foto */}
              {previewStaff.division && (
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border ${
                    previewStaff.division === 'Pimpinan Korwilcam Purwodadi' || previewStaff.division === 'Pimpinan'
                      ? 'bg-purple-600/90 text-white border-purple-400/30'
                      : previewStaff.division === 'Pengawas SD'
                      ? 'bg-blue-600/90 text-white border-blue-400/30'
                      : previewStaff.division === 'Pengawas TK'
                      ? 'bg-cyan-600/90 text-white border-cyan-400/30'
                      : previewStaff.division === 'Penilik KB' || previewStaff.division === 'Penilik KB/TK' || previewStaff.division === 'Penilik PAUD' || previewStaff.division === 'Penilik PAUD/TK'
                      ? 'bg-amber-600/90 text-white border-amber-400/30'
                      : 'bg-emerald-600/90 text-white border-emerald-400/30'
                  }`}>
                    {previewStaff.division === 'Pimpinan'
                      ? 'Pimpinan Korwilcam Purwodadi'
                      : previewStaff.division === 'Penilik PAUD/TK' || previewStaff.division === 'Penilik PAUD' || previewStaff.division === 'Penilik KB/TK'
                      ? 'Penilik KB'
                      : previewStaff.division === 'Tata Usaha'
                      ? 'Staf'
                      : previewStaff.division}
                  </span>
                </div>
              )}

              {/* Tombol Tutup Pojok Atas Kartu */}
              <button
                type="button"
                onClick={() => setPreviewStaff(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-800 text-white backdrop-blur-sm transition-colors border border-white/10"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Keterangan Detail Staf */}
            <div className="p-5 sm:p-6 bg-white space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight">
                  {previewStaff.name}
                </h3>
                <p className="text-sm font-bold text-blue-600">
                  {previewStaff.role}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>{previewStaff.nip ? `NIP. ${previewStaff.nip}` : 'NIP. -'}</span>
                </div>

                {/* Navigasi Mobile (Jika Layar Kecil) */}
                {filteredStaff.length > 1 && (
                  <div className="flex md:hidden items-center gap-1">
                    <button
                      type="button"
                      onClick={handlePrevStaff}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Sebelumnya"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStaff}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="Selanjutnya"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewStaff(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
