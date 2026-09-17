import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from '../components/HeroSection';
import { StatsCounter } from '../components/StatsCounter';
import { NewsCard } from '../components/NewsCard';
import { SchoolCard } from '../components/SchoolCard';
import { AgendaCard } from '../components/AgendaCard';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { 
  ArrowRight, 
  Sparkles, 
  Download, 
  Calendar, 
  BellRing, 
  Clock, 
  MapPin,
  Tag,
  CheckCircle2,
  XCircle,
  Building,
  User,
  Handshake,
  Headset,
  FileText
} from 'lucide-react';
import { formatIndonesianDate, compareAgendaDatesDescending } from '../services/googleSheetService';

export const HomePage: React.FC = () => {
  const { news, schools, announcements, aulaBookings, setActiveTab, setSelectedAnnouncement } = useApp();

  const latestNews = news.slice(0, 3);
  const featuredSchools = schools.filter((s) => s.featured).slice(0, 3);
  const displaySchools = featuredSchools.length >= 3 ? featuredSchools : schools.slice(0, 3);
  const homeAgenda = (aulaBookings && aulaBookings.length > 0) 
    ? [...aulaBookings].sort(compareAgendaDatesDescending).slice(0, 3) 
    : [];

  return (
    <div className="pb-10 sm:pb-12">
      {/* Hero Banner */}
      <HeroSection />

      {/* Dynamic Statistics Bar */}
      <StatsCounter />

      {/* Agenda Kegiatan & Pengumuman Stacked Section */}
      <section className="content-deferred bg-slate-100/70 pt-5 pb-6 sm:pt-6 sm:pb-7 border-y border-slate-200/60 mt-3 sm:mt-4">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 sm:space-y-7">
          
          {/* 1. Bagian Atas: Agenda Kegiatan */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#2563eb] to-[#0284c7] flex items-center justify-center text-white shadow-md shadow-blue-500/25 shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="w-1.5 h-8 bg-[#0284c7] rounded-full shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Agenda Kegiatan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Jadwal pemakaian aula dan kegiatan wilayah bulan ini
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('news', '/berita/agenda')}
                className="text-xs font-bold text-white flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Lihat Semua Agenda</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {homeAgenda.map((ag, idx) => (
                <AgendaCard key={ag.id} agenda={ag} index={idx} />
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* 2. Bagian Bawah: Pengumuman & Surat Edaran */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                  <svg 
                    className="w-6 h-6 text-white" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="12" y2="17" />
                    <path d="M18 13a2 2 0 0 0-2 2v1.5l-.5.5h5l-.5-.5V15a2 2 0 0 0-2-2z" fill="currentColor" />
                  </svg>
                </div>
                <div className="w-[2px] h-8 sm:h-9 bg-blue-500/30 rounded-full" />
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Pengumuman & Surat Edaran
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Instruksi dan edaran kedinasan resmi Korwilcam Purwodadi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('news', '/berita/pengumuman')}
                className="px-5 py-2 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Lihat Semua Pengumuman</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {announcements.slice(0, 3).map((ann, idx) => (
                <AnnouncementCard
                  key={ann.id}
                  announcement={ann}
                  index={idx}
                  onSelect={() => setSelectedAnnouncement(ann)}
                />
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Latest News Section */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16 mt-6 sm:mt-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50/90 border border-blue-200/60 px-3.5 py-1 rounded-full shadow-2xs">
              Kabar Pendidikan
            </span>
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <svg className="w-7 h-7 text-white" viewBox="0 0 28 28" fill="none">
                  <rect x="3" y="4" width="16" height="19" rx="3" fill="white" />
                  <line x1="6" y1="8" x2="15" y2="8" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="12" x2="16" y2="12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  <line x1="6" y1="16" x2="12" y2="16" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
                  <g transform="translate(13, 11)">
                    <path d="M2 5 L7 2 V12 L2 9 H0 V5 H2 Z" fill="white" stroke="#2563eb" strokeWidth="0.8" />
                    <path d="M8 4 C10 5.5 10 8.5 8 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M10 2 C13 4.5 13 9.5 10 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Warta & Liputan Terkini
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Dokumentasi kegiatan dan berita terbaru seputar SD, TK, KB di Purwodadi.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('news')}
            className="px-5 py-2.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Semua Berita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {latestNews.map((art) => (
            <NewsCard key={art.id} article={art} />
          ))}
        </div>
      </section>

      {/* Featured Schools Section */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16 mt-7 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5 sm:mb-6">
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50/90 border border-blue-200/60 px-3.5 py-1 rounded-full shadow-2xs">
              Satuan Pendidikan
            </span>
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
                  <path d="M18 10h4v12h-4v-7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v7H2V10h4" />
                  <path d="M12 2l8 5H4l8-5z" />
                  <circle cx="12" cy="10" r="1.5" />
                </svg>
              </div>
              <div className="w-[2px] h-8 sm:h-9 bg-blue-500/30 rounded-full" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Direktori Sekolah Pilihan
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  Lihat profil satuan pendidikan jenjang SD, TK, dan KB di Kecamatan Purwodadi.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('schools')}
            className="px-5 py-2.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <span>Buka Direktori Lengkap ({schools.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displaySchools.map((sch) => (
            <SchoolCard key={sch.id} school={sch} />
          ))}
        </div>
      </section>

      {/* Kartu Layanan Terbuka & Ramah (Sistem Murni: Font Vektor Tajam, Nol Gap, Nol Blur) */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16 mt-7 sm:mt-8 mb-4">
        <div className="relative w-full rounded-[24px] sm:rounded-[32px] overflow-hidden border border-blue-200/90 shadow-xl shadow-blue-500/10 bg-gradient-to-r from-white via-[#f0f7ff] to-[#e1f0fd]">
          {/* Aksen Gelombang Halus Sudut Kiri Atas & Bawah */}
          <div className="absolute top-0 left-0 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none -translate-x-6 -translate-y-6 opacity-30 sm:opacity-40">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-blue-400">
              <path fill="currentColor" d="M0,0 L120,0 C80,60 140,120 0,160 Z" />
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none -translate-x-8 translate-y-8 opacity-25 sm:opacity-35">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full text-blue-500">
              <path fill="currentColor" d="M0,80 C60,60 120,140 180,200 L0,200 Z" />
            </svg>
          </div>

          {/* Konten Grid Sistem: Sisi Kiri (Teks & Tombol Sistem) & Sisi Kanan (Ilustrasi 3D) */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Sisi Kiri: Teks & Tombol Sistem (100% Vektor, Tajam di Semua Layar) */}
            <div className="lg:col-span-7 p-6 sm:p-8 md:p-10 lg:pl-10 lg:pr-4 flex flex-col justify-center gap-3 sm:gap-4">
              {/* Badge Kategori */}
              <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 shadow-xs w-fit">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Handshake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-blue-800 tracking-tight">
                  Layanan Terbuka &amp; Ramah
                </span>
              </div>

              {/* Judul Utama (Font Sistem Tajam & Tebal) */}
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-[32px] font-black text-[#0d2a6b] tracking-tight leading-snug sm:leading-tight">
                Ada Kendala Administrasi Sekolah atau Ingin Menyampaikan Aspirasi?
              </h2>

              {/* Deskripsi */}
              <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-xl">
                Kami siap melayani kebutuhan konsultasi bapak/ibu kepala sekolah, guru, komite, dan orang tua murid secara profesional dan transparan.
              </p>

              {/* Tombol Aksi Interaktif Sistem */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 pt-1 sm:pt-2">
                <button
                  onClick={() => setActiveTab('contact')}
                  className="group inline-flex items-center gap-2 sm:gap-2.5 px-4.5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0062f5] to-[#004dc7] hover:from-[#0052d4] hover:to-[#003da6] text-white font-semibold text-xs sm:text-sm md:text-[15px] shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 cursor-pointer"
                >
                  <Headset className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white/95 group-hover:scale-110 transition-transform" />
                  <span>Sampaikan Aduan &amp; Aspirasi Online</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className="group inline-flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5.5 py-2.5 sm:py-3 rounded-full bg-white text-blue-600 hover:text-blue-700 border-2 border-blue-500 hover:border-blue-600 font-semibold text-xs sm:text-sm md:text-[15px] shadow-xs hover:bg-blue-50/80 hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all duration-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span>Profil &amp; Struktur Korwilcam</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

            {/* Sisi Kanan: Ilustrasi 3D Lengkap & Utuh (Menempel Rapi Tanpa Celah) */}
            <div className="lg:col-span-5 relative w-full flex items-end justify-center lg:justify-end self-end overflow-hidden">
              <img
                src="/layanan_terbuka_illustration.png"
                alt="Pelayanan Prima Korwilcam"
                loading="lazy"
                decoding="async"
                className="w-full max-w-[420px] lg:max-w-none h-auto object-contain object-bottom select-none pointer-events-none drop-shadow-xs"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
