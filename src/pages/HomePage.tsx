import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from '../components/HeroSection';
import { StatsCounter } from '../components/StatsCounter';
import { SchoolCard } from '../components/SchoolCard';
import { AgendaCard } from '../components/AgendaCard';
import { AnnouncementCard } from '../components/AnnouncementCard';
import { 
  ArrowRight, 
  Calendar,
  Clock,
  ChevronRight,
  Newspaper
} from 'lucide-react';
import { formatIndonesianDate, compareAgendaDatesDescending } from '../services/googleSheetService';
import { stripHtml } from '../lib/stripHtml';

export const HomePage: React.FC = () => {
  const { news, schools, announcements, aulaBookings, setActiveTab, setSelectedAnnouncement, setSelectedNews } = useApp();

  const featuredNews = news[0];
  const sideNews = news.slice(1, 6);
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

      {/* Latest News Section (Berita Terbaru) */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16 mt-8 sm:mt-10">
        {/* Centered Header with Blue Bar */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Berita Terbaru
          </h2>
          <div className="w-16 h-1 bg-blue-600 rounded-full mx-auto mt-2" />
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
            <Newspaper className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600 text-sm">Belum ada berita yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Featured Article (Left Column) */}
            {featuredNews && (
              <div className={sideNews.length > 0 ? "lg:col-span-7" : "lg:col-span-12 max-w-3xl mx-auto w-full"}>
                <article
                  onClick={() => setSelectedNews(featuredNews)}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  <div className="relative w-full aspect-[16/10] sm:h-72 md:h-80 overflow-hidden bg-slate-100">
                    <img
                      src={featuredNews.image}
                      alt={featuredNews.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-md">
                        Terbaru
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {featuredNews.title}
                      </h3>
                      <p className="mt-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed line-clamp-3">
                        {stripHtml(featuredNews.summary)}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNews(featuredNews);
                        }}
                        className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                        <span>Baca Selengkapnya</span>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            )}

            {/* Side Articles List (Right Column - 5 items) */}
            {sideNews.length > 0 && (
              <div className="lg:col-span-5 flex flex-col gap-3 sm:gap-3.5">
                {sideNews.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => setSelectedNews(art)}
                    className="bg-white rounded-xl border border-slate-200/90 p-3 sm:p-3.5 flex items-center gap-3.5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    <div className="w-28 sm:w-36 md:w-40 h-20 sm:h-22 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={art.image}
                        alt={art.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug transition-colors">
                        {art.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{art.date}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* View All News Button */}
        {news.length > 0 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <button
              onClick={() => setActiveTab('news')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 font-bold text-xs sm:text-sm shadow-2xs hover:shadow transition-all cursor-pointer"
            >
              <span>Buka Semua Berita ({news.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
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
    </div>
  );
};
