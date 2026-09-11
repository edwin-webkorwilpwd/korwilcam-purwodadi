import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Download, 
  Award, 
  BookOpen, 
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { formatGoogleDriveImageUrl, getGoogleDriveCandidates } from '../lib/driveHelper';

export const HeroSection: React.FC = () => {
  const { officeProfile, setActiveTab } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Normalisasi daftar foto slideshow
  const slides = useMemo(() => {
    const rawImages = officeProfile.heroSlideshowImages || [];
    const valid = rawImages
      .filter((url) => typeof url === 'string' && url.trim().length > 0)
      .map((url, idx) => {
        const trimmed = url.trim();
        const formatted = formatGoogleDriveImageUrl(trimmed);
        const candidates = getGoogleDriveCandidates(trimmed);
        return {
          id: `slide-${idx}`,
          raw: trimmed,
          src: formatted || trimmed,
          candidates
        };
      });
    return valid;
  }, [officeProfile.heroSlideshowImages]);

  const slideDuration = (officeProfile.heroSlideshowInterval || 5) * 1000;

  // Auto-advance timer untuk rotasi slide
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, slideDuration);

    return () => clearInterval(timer);
  }, [slides.length, slideDuration, isPaused]);

  // Handle previous slide
  const handlePrevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Handle next slide
  const handleNextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative overflow-hidden bg-slate-950 text-white py-16 lg:py-24 border-b border-blue-900/40 select-none"
    >
      {/* 1. Dynamic Photo Slideshow Background (Google Drive / Photos) */}
      {slides.length > 0 ? (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {slides.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-1' : 'opacity-0 z-0'
                }`}
              >
                <img
                  src={slide.src}
                  alt="Dokumentasi Korwilcam Purwodadi"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className={`w-full h-full object-cover object-center transform transition-transform duration-[7000ms] ease-out filter brightness-[0.72] contrast-[1.05] ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  onError={(e) => {
                    const target = e.currentTarget;
                    const cands = slide.candidates;
                    const nextCand = cands.find((c) => c !== target.src);
                    if (nextCand) {
                      target.src = nextCand;
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback: Deep Blue Gradient */
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 pointer-events-none" />
      )}

      {/* 2. Balanced Medium Scrim - Foto tetap terlihat jelas namun nyaman di mata, tulisan kontras */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b from-slate-950/70 via-slate-950/50 to-slate-950/75 pointer-events-none" />
      <div className="absolute inset-0 z-[2] bg-blue-950/25 mix-blend-multiply pointer-events-none" />

      {/* 3. Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/70 border border-blue-400/40 text-blue-300 text-xs sm:text-sm font-semibold tracking-wide shadow-md shadow-black/40 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi"}</span>
          </div>

          {/* Headline Utama dengan drop shadow bersih dan elegan */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {officeProfile.heroTitle && (officeProfile.heroTitle.includes('SD, TK, & PAUD') || officeProfile.heroTitle.includes('SD, TK, & KB')) ? (
              <>
                <span>Sinergi Membangun Generasi Cerdas & Berkarakter</span>
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">
                  SD, TK, & KB Kecamatan Purwodadi
                </span>
              </>
            ) : (
              (officeProfile.heroTitle || "Sinergi Membangun Generasi Cerdas & Berkarakter SD, TK, & KB Purwodadi").replace(/\bPAUD\b/gi, 'KB')
            )}
          </h1>

          {/* Sub-headline / Deskripsi */}
          <p className="text-slate-100 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto font-normal drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {(officeProfile.heroSubtitle || "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi. Kami hadir mendampingi seluruh satuan pendidikan dasar dan anak usia dini demi terciptanya proses belajar yang merdeka, aman, berkarakter, dan berprestasi.").replace(/\bPAUD\b/gi, 'KB')}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setActiveTab('schools')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-black/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Jelajahi Sekolah</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-white font-semibold text-sm hover:-translate-y-0.5 transition-all duration-200 backdrop-blur-md shadow-xl cursor-pointer"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Pusat Unduhan & Blanko</span>
            </button>
          </div>

          {/* Quick Badges under CTAs dengan background semi-transparan elegan agar terbaca jelas di atas foto terang */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white border-t border-white/15 w-full max-w-3xl">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-md border border-white/15 shadow-md">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="font-medium">Akreditasi Unggul & Transparan</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-md border border-white/15 shadow-md">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="font-medium">Dukungan Kurikulum Merdeka</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/65 backdrop-blur-md border border-white/15 shadow-md">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-medium">Pelayanan Terpadu & Terpercaya</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Slideshow Controls: Next / Prev Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrevSlide}
            aria-label="Foto Sebelumnya"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white/70 hover:text-white backdrop-blur-md border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextSlide}
            aria-label="Foto Selanjutnya"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/60 hover:bg-blue-600 text-white/70 hover:text-white backdrop-blur-md border border-white/10 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* 5. Slideshow Controls: Indicator Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              aria-label={`Pilih slide foto ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentSlideIndex
                  ? 'w-7 h-2 bg-blue-500 shadow-sm shadow-blue-500/50'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
          <span className="text-[10px] text-slate-400 ml-1 font-mono">
            {currentSlideIndex + 1}/{slides.length}
          </span>
        </div>
      )}
    </section>
  );
};
