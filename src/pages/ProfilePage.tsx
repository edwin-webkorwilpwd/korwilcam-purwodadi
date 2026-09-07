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
  GraduationCap
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { officeProfile, staff } = useApp();
  const [selectedDivision, setSelectedDivision] = useState<string>('ALL');

  React.useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase().replace('#', '');
    let target = hash;
    if (!target) {
      if (path.includes('sambutan') || path.includes('visi')) target = 'sambutan';
      else if (path.includes('struktur')) target = 'struktur';
      else if (path.includes('pegawai') || path.includes('staf') || path.includes('pengawas')) target = 'pegawai';
    }

    if (target) {
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  }, []);

  const filteredStaff = selectedDivision === 'ALL'
    ? staff
    : staff.filter((s) => s.division === selectedDivision);

  const divisions = [
    { id: 'ALL', label: 'Semua Pejabat & Staf' },
    { id: 'Pimpinan', label: 'Pimpinan' },
    { id: 'Pengawas SD', label: 'Pengawas SD' },
    { id: 'Penilik PAUD/TK', label: 'Penilik PAUD/TK' },
    { id: 'Tata Usaha', label: 'Tata Usaha' },
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
            <div className="relative">
              <img
                src={officeProfile.korwilPhoto}
                alt={officeProfile.korwilName}
                className="w-48 h-56 sm:w-56 sm:h-64 rounded-2xl object-cover ring-4 ring-blue-600/20 shadow-2xl shadow-blue-500/20"
              />
              <div className="absolute -bottom-3 -right-3 p-2 rounded-xl bg-blue-600 text-white shadow-lg">
                <ShieldCheck className="w-6 h-6" />
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
          {filteredStaff.map((person) => (
            <div
              key={person.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-4 group"
            >
              <img
                src={person.photo}
                alt={person.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-blue-100 group-hover:ring-blue-500 transition-all shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {person.division}
                </span>
                <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">
                  {person.name}
                </h4>
                <p className="text-xs text-slate-600 font-medium">
                  {person.role}
                </p>
                <p className="text-[11px] font-mono text-slate-400">
                  NIP. {person.nip}
                </p>
              </div>
            </div>
          ))}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
            {[
              'Kel. Purwodadi', 'Kel. Kuripan', 'Kel. Kalongan', 'Kel. Danyang',
              'Desa Candisari', 'Desa Genuksuran', 'Desa Karanganyar', 'Desa Kedungrejo',
              'Desa Nambuhan', 'Desa Ngembak', 'Desa Nglobar', 'Desa Ngraji',
              'Desa Pulorejo', 'Desa Putat', 'Desa Warukaranganyar', 'Desa Cingkrong', 'Desa Karangpaing'
            ].map((desa, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">{desa}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
