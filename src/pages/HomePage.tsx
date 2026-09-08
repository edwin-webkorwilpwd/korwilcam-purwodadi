import React from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from '../components/HeroSection';
import { StatsCounter } from '../components/StatsCounter';
import { NewsCard } from '../components/NewsCard';
import { SchoolCard } from '../components/SchoolCard';
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
  User
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
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <HeroSection />

      {/* Dynamic Statistics Bar */}
      <StatsCounter />

      {/* Agenda Kegiatan & Pengumuman Stacked Section */}
      <section className="content-deferred bg-slate-100/70 py-16 border-y border-slate-200/60">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-16">
          
          {/* 1. Bagian Atas: Agenda Kegiatan */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Agenda Kegiatan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Jadwal pemakaian aula dan kegiatan wilayah bulan ini
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('news', '/berita/agenda')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <span>Lihat Semua Agenda</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {homeAgenda.map((ag) => (
                <div
                  key={ag.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden space-y-3.5"
                >
                  {/* Top Accent line based on category */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    ag.kategori.toLowerCase() === 'rapat dinas' 
                      ? 'bg-blue-600' 
                      : ag.kategori.toLowerCase() === 'pelatihan'
                      ? 'bg-emerald-600'
                      : ag.kategori.toLowerCase() === 'seminar/workshop'
                      ? 'bg-purple-600'
                      : 'bg-amber-500'
                  }`} />

                  <div className="space-y-3">
                    {/* Top Bar: Kategori & Status Persetujuan */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                        ag.kategori.toLowerCase() === 'rapat dinas'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : ag.kategori.toLowerCase() === 'pelatihan'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ag.kategori.toLowerCase() === 'seminar/workshop'
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : 'bg-amber-50 text-amber-900 border-amber-200'
                      }`}>
                        <Tag className="w-3 h-3" />
                        <span>{ag.kategori}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        ag.statusPersetujuan.toLowerCase() === 'disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : ag.statusPersetujuan.toLowerCase() === 'ditolak'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {ag.statusPersetujuan.toLowerCase() === 'disetujui' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : ag.statusPersetujuan.toLowerCase() === 'ditolak' ? (
                          <XCircle className="w-3 h-3 text-rose-600" />
                        ) : (
                          <Clock className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{ag.statusPersetujuan}</span>
                      </span>
                    </div>

                    {/* Keterangan / Keperluan (Acara) */}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Keterangan / Keperluan
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {ag.keterangan}
                      </h4>
                    </div>

                    {/* Detail Parameters Box */}
                    <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 space-y-2.5 text-xs text-slate-700">
                      {/* 1. Tanggal Penggunaan */}
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-md bg-blue-100 text-blue-700 mt-0.5 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Tanggal Penggunaan
                          </span>
                          <span className="font-bold text-slate-900 text-xs">
                            {formatIndonesianDate(ag.tanggalPenggunaan)}
                          </span>
                        </div>
                      </div>

                      {/* 2. Jam Pemakaian */}
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-md bg-amber-100 text-amber-800 mt-0.5 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Jam Pemakaian
                          </span>
                          <span className="font-semibold text-slate-800">
                            {ag.jamPemakaian} WIB
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200/70"></div>

                      {/* 3. Nama PJ */}
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-md bg-purple-100 text-purple-700 mt-0.5 shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Nama PJ (Penanggung Jawab)
                          </span>
                          <span className="font-bold text-slate-900 block truncate">
                            {ag.namaPJ}
                          </span>
                          {ag.nip && ag.nip !== '-' && (
                            <span className="text-[9px] text-slate-400 font-mono">NIP: {ag.nip}</span>
                          )}
                        </div>
                      </div>

                      {/* 4. Organisasi / Instansi */}
                      <div className="flex items-start gap-2">
                        <div className="p-1 rounded-md bg-emerald-100 text-emerald-700 mt-0.5 shrink-0">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                            Organisasi / Instansi
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {ag.organisasi}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Lokasi */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Aula Utama Kantor Korwilcam</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {ag.timestamp ? ag.timestamp.split(' ')[0] : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200/80"></div>

          {/* 2. Bagian Bawah: Pengumuman & Surat Edaran */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Pengumuman & Surat Edaran
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Instruksi dan edaran kedinasan resmi Korwilcam Purwodadi
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('news', '/berita/pengumuman')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:shadow transition-all"
              >
                <span>Lihat Semua Pengumuman</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 3).map((ann) => (
                <div 
                  key={ann.id}
                  onClick={() => setSelectedAnnouncement(ann)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          ann.urgency === 'Mendesak'
                            ? 'bg-rose-100 text-rose-800'
                            : ann.urgency === 'Penting'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ann.urgency}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Target: {ann.target}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {ann.date}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors flex items-start justify-between gap-2">
                      <span className="line-clamp-2">{ann.title}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {ann.summary}
                    </p>
                  </div>

                  <div 
                    className="pt-3 flex items-center justify-between text-xs border-t border-slate-100 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-500 font-medium truncate max-w-[130px] sm:max-w-[170px]">
                        {ann.fileName ? ann.fileName : `Lampiran: ${ann.fileSize || 'Dokumen'}`}
                      </span>
                      {ann.fileType && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase shrink-0">
                          {ann.fileType}
                        </span>
                      )}
                    </div>

                    {ann.fileUrl && ann.fileUrl !== '#' ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = ann.fileUrl!;
                          link.download = ann.fileName || `${ann.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(ann.fileType || 'pdf').toLowerCase()}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> Unduh Berkas
                      </button>
                    ) : (
                      <button 
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="text-blue-600 font-bold hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Buka Edaran</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Latest News Section */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Kabar Pendidikan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Warta & Liputan Terkini
            </h2>
            <p className="text-sm text-slate-600">
              Dokumentasi kegiatan dan berita terhangat seputar SD, TK, PAUD di Purwodadi.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('news')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            <span>Buka Semua Berita</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((art) => (
            <NewsCard key={art.id} article={art} />
          ))}
        </div>
      </section>

      {/* Featured Schools Section */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Satuan Pendidikan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Direktori Sekolah Pilihan
            </h2>
            <p className="text-sm text-slate-600">
              Lihat profil satuan pendidikan jenjang SD, TK, dan PAUD di Kecamatan Purwodadi.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('schools')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors self-start sm:self-auto"
          >
            <span>Buka Direktori Lengkap ({schools.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displaySchools.map((sch) => (
            <SchoolCard key={sch.id} school={sch} />
          ))}
        </div>
      </section>

      {/* Banner Sinergi Pendidikan / CTA Aduan */}
      <section className="content-deferred w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Layanan Terbuka & Ramah</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-snug">
              Ada Kendala Administrasi Sekolah atau Ingin Menyampaikan Aspirasi?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Kami siap melayani kebutuhan konsultasi bapak/ibu kepala sekolah, guru, komite, dan orang tua murid secara profesional dan transparan.
            </p>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('contact')}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
              >
                Sampaikan Aduan & Aspirasi Online
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
              >
                Profil & Struktur Korwilcam
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
