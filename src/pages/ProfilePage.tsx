import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
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
  ChevronRight
} from 'lucide-react';

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
        if (selectedDivision === 'Penilik PAUD') {
          return s.division === 'Penilik PAUD' || s.division === 'Penilik PAUD/TK';
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
    { id: 'Penilik PAUD', label: 'Penilik PAUD' },
    { id: 'Staf', label: 'Staf' },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>Tentang Kami</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Profil Kantor Korwilcam Purwodadi
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Koordinator Wilayah Bidang Pendidikan Kecamatan Purwodadi, Dinas Pendidikan Kabupaten Grobogan.
          </p>
        </div>
      </section>

      {/* Sambutan Resmi Pimpinan */}
      <section id="sambutan" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-4 flex flex-col items-center text-center space-y-4">
            <div 
              onClick={() => setPreviewStaff({
                name: officeProfile.korwilName,
                role: 'Koordinator Wilayah Bidang Pendidikan Purwodadi',
                nip: officeProfile.korwilNip,
                photo: officeProfile.korwilPhoto,
                division: 'Pimpinan Korwilcam Purwodadi'
              })}
              className="relative cursor-pointer group/korwil"
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
                  className="w-48 h-56 sm:w-56 sm:h-64 rounded-2xl object-cover ring-4 ring-blue-600/20 group-hover/korwil:ring-blue-600 shadow-2xl shadow-blue-500/20 bg-slate-100 transition-all duration-300 group-hover/korwil:scale-[1.02]"
                />
              ) : null}
              <div className={`w-48 h-56 sm:w-56 sm:h-64 rounded-2xl ring-4 ring-blue-600/20 shadow-2xl shadow-blue-500/20 bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 gap-2 ${officeProfile.korwilPhoto && !officeProfile.korwilPhoto.includes('unsplash.com') ? 'hidden' : 'flex'}`}>
                <User className="w-20 h-20 text-slate-400 stroke-1" />
                <span className="text-xs font-bold text-slate-500">Foto Resmi Pimpinan</span>
              </div>
              <div className="absolute -bottom-3 -right-3 p-2 rounded-xl bg-blue-600 text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-slate-950/20 opacity-0 group-hover/korwil:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <div className="p-2 rounded-full bg-white/95 text-blue-600 shadow-md transform scale-90 group-hover/korwil:scale-100 transition-transform">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {officeProfile.korwilName}
              </h3>
              <p className="text-xs font-bold text-blue-600">
                Koordinator Wilayah Kecamatan Purwodadi
              </p>
              <p className="text-xs font-mono text-slate-400 mt-1">
                NIP. {officeProfile.korwilNip}
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                Sambutan Koordinator Wilayah
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {officeProfile.greetingTitle}
              </h2>
            </div>

            <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
              <p>
                {officeProfile.greetingText}
              </p>
              <p>
                Dalam era transformasi Merdeka Belajar, peran satuan pendidikan di tingkat dasar dan usia dini sangatlah fundamental. Kami terus berkomitmen mempererat sinergi antara kepala sekolah, guru, pengawas, dan orang tua agar tercipta iklim belajar yang aman, menyenangkan, serta berorientasi pada kemajuan karakter dan kompetensi anak didik.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{officeProfile.korwilName}</span>
              <span className="italic">Purwodadi, Grobogan</span>
            </div>
          </div>

        </div>
      </section>

      {/* Visi dan Misi */}
      <section id="visi-misi" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Visi */}
          <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>

            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-300">
                Visi Korwilcam
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold leading-snug">
                Visi Pendidikan Kecamatan Purwodadi
              </h3>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed font-light italic">
                "{officeProfile.vision}"
              </p>
            </div>

            <div className="pt-6 border-t border-blue-800/60 text-xs text-blue-300 font-medium">
              Landasan Pijak Pembangunan Pendidikan SD, TK, & PAUD
            </div>
          </div>

          {/* Misi */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Peta Jalan Misi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Misi Satuan Kerja
              </h3>
            </div>

            <div className="space-y-3.5">
              {officeProfile.missions.map((misi, idx) => (
                <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {misi}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Struktur Organisasi & Pengawas/Penilik */}
      <section id="struktur" className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 scroll-mt-24">
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

        <div id="pegawai" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 scroll-mt-24">
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
                  className="card-deferred bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex items-center gap-4 group cursor-pointer relative"
                  title="Klik untuk melihat foto lebih besar"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ring-2 ring-blue-100 group-hover:ring-blue-500 transition-all shrink-0 overflow-hidden relative bg-slate-100 flex items-center justify-center shadow-sm">
                    {hasValidPhoto ? (
                      <img
                        src={person.photo}
                        alt={person.name}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : null}
                    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400 ${hasValidPhoto ? 'hidden' : 'flex'}`}>
                      <User className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">ASN</span>
                    </div>
                    {/* Hover Zoom Icon overlay on photo */}
                    <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="p-1.5 rounded-full bg-white/95 text-blue-600 shadow-md transform scale-75 group-hover:scale-100 transition-transform">
                        <ZoomIn className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      person.division === 'Pimpinan Korwilcam Purwodadi' || person.division === 'Pimpinan'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : person.division === 'Pengawas SD'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : person.division === 'Pengawas TK'
                        ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                        : person.division === 'Penilik PAUD' || person.division === 'Penilik PAUD/TK'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {person.division === 'Pimpinan'
                        ? 'Pimpinan Korwilcam Purwodadi'
                        : person.division === 'Penilik PAUD/TK'
                        ? 'Penilik PAUD'
                        : person.division === 'Tata Usaha'
                        ? 'Staf'
                        : person.division}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">
                      {person.name}
                    </h4>
                    <p className="text-xs text-slate-600 font-medium truncate">
                      {person.role}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      {person.nip ? `NIP. ${person.nip}` : 'NIP. -'}
                    </p>
                  </div>
                  <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 self-center">
                    <ZoomIn className="w-4 h-4" />
                  </div>
                </div>
              );
            })
            )}
        </div>
      </section>

      {/* Wilayah Kerja & Satuan Pendidikan yang Dinaungi */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Wilayah Kerja Koordinasi
            </span>
            <h3 className="text-2xl font-extrabold text-white">
              Cakupan Pembinaan Satuan Pendidikan Purwodadi
            </h3>
            <p className="text-sm text-slate-300">
              Kantor Korwilcam Purwodadi membina 17 Desa dan Kelurahan di Kecamatan Purwodadi dengan ratusan lembaga pendidikan formal maupun nonformal.
            </p>
          </div>

          <div className="space-y-6">
            {/* Kelompok Kelurahan */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20 px-3 py-1 rounded-full border border-blue-400/30">
                  Daftar Kelurahan (4)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {['Kel. Danyang', 'Kel. Kalongan', 'Kel. Kuripan', 'Kel. Purwodadi'].map((kel, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-100 font-medium hover:border-blue-400/50 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{kel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kelompok Desa */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  Daftar Desa (13)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
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
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium hover:border-slate-600 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{desa}</span>
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
                      : previewStaff.division === 'Penilik PAUD' || previewStaff.division === 'Penilik PAUD/TK'
                      ? 'bg-amber-600/90 text-white border-amber-400/30'
                      : 'bg-emerald-600/90 text-white border-emerald-400/30'
                  }`}>
                    {previewStaff.division === 'Pimpinan'
                      ? 'Pimpinan Korwilcam Purwodadi'
                      : previewStaff.division === 'Penilik PAUD/TK'
                      ? 'Penilik PAUD'
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
