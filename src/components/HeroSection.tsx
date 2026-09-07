import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  Download, 
  Award, 
  BookOpen, 
  Quote,
  MapPin,
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

      <div className="relative w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
          
          {/* Main Hero Copy (Left column: lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between py-1 space-y-6">
            
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi"}</span>
              </div>

              {/* Headline yang proporsional dan elegan */}
              <h1 className="text-2xl sm:text-3xl lg:text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-snug">
                {officeProfile.heroTitle && officeProfile.heroTitle.includes('SD, TK, & PAUD') ? (
                  <>
                    {officeProfile.heroTitle.split('SD, TK, & PAUD')[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-200">
                      SD, TK, & PAUD
                    </span>
                    {officeProfile.heroTitle.split('SD, TK, & PAUD')[1]}
                  </>
                ) : (
                  officeProfile.heroTitle || (
                    <>
                      Mewujudkan Fondasi Generasi Emas{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-300 to-indigo-200">
                        SD, TK, & PAUD
                      </span>{' '}
                      di Purwodadi
                    </>
                  )
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-2xl font-normal">
                {officeProfile.heroSubtitle || "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi. Kami hadir mendampingi seluruh satuan pendidikan dasar dan anak usia dini demi terciptanya proses belajar yang merdeka, aman, berkarakter, dan berprestasi."}
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={() => setActiveTab('schools')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Search className="w-4 h-4" />
                  <span>Cari Data Sekolah (SD/TK/PAUD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveTab('downloads')}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm backdrop-blur-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Pusat Unduhan & Blanko</span>
                </button>
              </div>
            </div>

            {/* Quick badges under CTAs */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Akreditasi Unggul & Transparan</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Dukungan Kurikulum Merdeka</span>
              </div>
            </div>

          </div>

          {/* Korwilcam Profile Highlight Card (Right column: lg:col-span-5) - Ukuran disamakan dengan tinggi blok tulisan kiri */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/98 to-slate-950 p-6 sm:p-7 border border-blue-700/40 shadow-2xl shadow-blue-950/80 backdrop-blur-2xl h-full flex flex-col justify-between">
              
              {/* Card Header Tag */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-black text-emerald-400 tracking-wider uppercase">
                    Pimpinan Korwilcam
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>Purwodadi, Grobogan</span>
                </div>
              </div>

              {/* Flex 2 Kolom: Kiri (Foto + Nama & NIP Utuh) | Kanan (Kotak Kutipan Ringkas) */}
              <div className="my-auto py-3 flex flex-col sm:flex-row items-center sm:items-stretch gap-4 sm:gap-4.5">
                
                {/* Kolom Kiri: Foto Pimpinan + Nama & NIP (Lebar & Tinggi Proporsional, NIP Tidak Terpotong) */}
                <div className="shrink-0 w-44 sm:w-48 flex flex-col items-center sm:items-start text-center sm:text-left">
                  {/* Foto Pimpinan Lebih Tinggi & Gagah */}
                  <div className="relative group w-full">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 rounded-2xl blur-sm opacity-40 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative overflow-hidden rounded-2xl ring-2 ring-blue-500/40 shadow-xl bg-slate-800 h-52 sm:h-60 w-full">
                      <img
                        src={officeProfile.korwilPhoto}
                        alt={officeProfile.korwilName}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow border border-blue-300/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    </div>
                  </div>

                  {/* Di Bawah Foto: Nama & NIP Utuh Tanpa Terpotong */}
                  <div className="mt-3.5 space-y-1 w-full">
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight tracking-tight">
                      {officeProfile.korwilName}
                    </h3>
                    <p className="text-xs font-bold text-blue-400 leading-tight">
                      Koordinator Wilayah
                    </p>
                    <div className="pt-1 w-full">
                      <span className="inline-block whitespace-nowrap text-[10px] sm:text-[11px] text-slate-300 font-mono tracking-normal px-2.5 py-1 rounded-md bg-slate-800/90 border border-slate-700/80 shadow-sm">
                        NIP. {officeProfile.korwilNip}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Kotak Kutipan Pimpinan Disesuaikan Tinggi & Kerapihannya */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="relative bg-gradient-to-br from-slate-800/80 via-slate-850 to-slate-900/90 rounded-2xl p-4 sm:p-5 border border-slate-700/70 shadow-lg h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                          <Quote className="w-3.5 h-3.5 text-blue-400" />
                          <span>Pesan & Amanah</span>
                        </span>
                        <Quote className="w-4 h-4 text-blue-400/20" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-normal">
                        "{officeProfile.korwilQuote || 'Pendidikan bukan sekadar transfer ilmu, melainkan menuntun kodrat anak agar mereka selamat dan bahagia setinggi-tingginya sebagai manusia dan anggota masyarakat.'}"
                      </p>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        onClick={() => setActiveTab('profile', '/profil/sambutan')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all group"
                      >
                        <span>Baca Sambutan Lengkap</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
