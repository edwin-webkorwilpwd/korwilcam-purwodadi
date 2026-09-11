import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Download, 
  Award, 
  BookOpen, 
  ShieldCheck
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { officeProfile, setActiveTab } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white py-16 lg:py-24 border-b border-blue-900/40">
      {/* Background Decorative Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 text-center">
        <div className="flex flex-col items-center space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs sm:text-sm font-semibold tracking-wide shadow-inner shadow-blue-500/10">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi"}</span>
          </div>

          {/* Headline yang proporsional dan elegan */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-4xl">
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
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            {(officeProfile.heroSubtitle || "Pusat informasi kedinasan, agenda kegiatan wilayah, direktori sekolah, regulasi kurikulum, dan sarana aspirasi terpadu bagi seluruh insan pendidik di Kecamatan Purwodadi, Kabupaten Grobogan.").replace(/\bPAUD\b/gi, 'KB')}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={() => setActiveTab('schools')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              <span>Jelajahi Sekolah</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={() => setActiveTab('downloads')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm hover:-translate-y-0.5 transition-all duration-200"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Pusat Unduhan & Blanko</span>
            </button>
          </div>

          {/* Quick badges under CTAs */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs sm:text-sm text-slate-400 border-t border-slate-800/80 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Akreditasi Unggul & Transparan</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Dukungan Kurikulum Merdeka</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Pelayanan Terpadu & Terpercaya</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
