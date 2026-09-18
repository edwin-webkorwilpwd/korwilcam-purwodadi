import React from 'react';
import { useApp } from '../context/AppContext';
import { School, Baby, Sparkles, Users } from 'lucide-react';

// 1. Watermark Sekolah Dasar (Gedung Sekolah dengan Tiang Bendera)
const SchoolWatermark: React.FC = () => (
  <svg
    viewBox="0 0 110 90"
    className="w-20 h-18 sm:w-24 sm:h-20 text-sky-200/80 pointer-events-none select-none"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Tiang & Bendera */}
    <line x1="55" y1="6" x2="55" y2="20" strokeWidth="2" />
    <path d="M55 7 C63 5 69 10 75 8 L75 15 C69 17 63 12 55 14 Z" fill="currentColor" stroke="none" opacity="0.9" />
    {/* Atap Segitiga Utama */}
    <polygon points="55,18 34,32 76,32" fill="currentColor" fillOpacity="0.25" />
    {/* Sayap atap kiri & kanan */}
    <polygon points="34,32 16,39 34,39" fill="currentColor" fillOpacity="0.2" />
    <polygon points="76,32 94,39 76,39" fill="currentColor" fillOpacity="0.2" />
    {/* Bangunan Utama */}
    <rect x="34" y="32" width="42" height="46" fill="currentColor" fillOpacity="0.15" />
    <rect x="16" y="39" width="18" height="39" fill="currentColor" fillOpacity="0.12" />
    <rect x="76" y="39" width="18" height="39" fill="currentColor" fillOpacity="0.12" />
    {/* Pintu Lengkung Tengah */}
    <path d="M48 78 V62 C48 58 51.5 55 55 55 C58.5 55 62 58 62 62 V78" fill="currentColor" fillOpacity="0.4" />
    {/* Jendela Kotak */}
    <rect x="21" y="46" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <rect x="21" y="60" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <rect x="81" y="46" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <rect x="81" y="60" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <rect x="39" y="39" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    <rect x="63" y="39" width="8" height="9" rx="1.5" fill="currentColor" fillOpacity="0.4" />
    {/* Garis Tanah */}
    <line x1="10" y1="78" x2="100" y2="78" strokeWidth="2.5" />
  </svg>
);

// 2. Watermark TK (Balok Huruf A, B, C)
const ToyBlocksWatermark: React.FC = () => (
  <svg
    viewBox="0 0 100 90"
    className="w-18 h-18 sm:w-22 sm:h-20 text-sky-200/80 pointer-events-none select-none"
    fill="none"
  >
    {/* Balok A (Atas) */}
    <g transform="translate(34, 4)">
      <rect width="32" height="32" rx="7" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="800" fontFamily="sans-serif">A</text>
    </g>
    {/* Balok B (Bawah Kiri) */}
    <g transform="translate(12, 42)">
      <rect width="32" height="32" rx="7" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="800" fontFamily="sans-serif">B</text>
    </g>
    {/* Balok C (Bawah Kanan) */}
    <g transform="translate(54, 42)">
      <rect width="32" height="32" rx="7" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2" />
      <text x="16" y="23" textAnchor="middle" fill="currentColor" fontSize="18" fontWeight="800" fontFamily="sans-serif">C</text>
    </g>
  </svg>
);

// 3. Watermark KB (Perosotan / Wahana Bermain Anak)
const PlaygroundWatermark: React.FC = () => (
  <svg
    viewBox="0 0 110 90"
    className="w-20 h-18 sm:w-24 sm:h-20 text-sky-200/80 pointer-events-none select-none"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Atap Rumah Bermain */}
    <polygon points="76,8 58,26 94,26" fill="currentColor" fillOpacity="0.3" />
    {/* Tiang Rumah */}
    <line x1="62" y1="26" x2="62" y2="78" strokeWidth="2" />
    <line x1="90" y1="26" x2="90" y2="78" strokeWidth="2" />
    {/* Platform Lantai */}
    <rect x="60" y="46" width="32" height="4" fill="currentColor" fillOpacity="0.4" rx="1" />
    {/* Pagar Pengaman */}
    <rect x="62" y="33" width="28" height="13" fill="currentColor" fillOpacity="0.15" />
    <line x1="76" y1="33" x2="76" y2="46" strokeWidth="1.5" />
    {/* Seluncuran / Perosotan Melengkung */}
    <path
      d="M62 48 C46 48 40 60 28 70 C20 76 12 78 6 78"
      strokeWidth="3.5"
      stroke="currentColor"
      fill="none"
    />
    <path
      d="M62 51 C48 51 42 62 30 72 C22 78 14 80 8 80"
      strokeWidth="1.5"
      stroke="currentColor"
      fill="none"
      opacity="0.6"
    />
    {/* Tiang Penopang Seluncuran */}
    <line x1="33" y1="65" x2="33" y2="78" strokeWidth="1.8" />
    {/* Tangga Kanan */}
    <line x1="90" y1="36" x2="99" y2="36" strokeWidth="1.8" />
    <line x1="90" y1="47" x2="99" y2="47" strokeWidth="1.8" />
    <line x1="90" y1="58" x2="99" y2="58" strokeWidth="1.8" />
    <line x1="90" y1="69" x2="99" y2="69" strokeWidth="1.8" />
    <line x1="99" y1="30" x2="99" y2="78" strokeWidth="2" />
    {/* Garis Tanah */}
    <line x1="4" y1="79" x2="104" y2="79" strokeWidth="2.5" />
  </svg>
);

// 4. Watermark Guru & Siswa (Topi Toga Kelulusan & Figur Siswa)
const GraduateWatermark: React.FC = () => (
  <svg
    viewBox="0 0 100 90"
    className="w-20 h-18 sm:w-24 sm:h-20 text-sky-200/80 pointer-events-none select-none"
    fill="currentColor"
  >
    {/* Topi Toga Wisuda */}
    <polygon points="50,10 78,21 50,32 22,21" fill="currentColor" fillOpacity="0.45" />
    <path d="M34,26 V33 C34,39 66,39 66,33 V26" fill="currentColor" fillOpacity="0.3" />
    {/* Tali Rumbai Toga */}
    <path d="M50 21 L26 29 V39" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="26" cy="40" r="2.2" fill="currentColor" />

    {/* 3 Karakter Siswa */}
    {/* Siswa Tengah */}
    <circle cx="50" cy="50" r="7.5" fill="currentColor" fillOpacity="0.35" />
    <path d="M36 72 C36 64 42 60 50 60 C58 60 64 64 64 72 Z" fill="currentColor" fillOpacity="0.35" />

    {/* Siswa Kiri */}
    <circle cx="26" cy="56" r="6.5" fill="currentColor" fillOpacity="0.25" />
    <path d="M14 75 C14 69 19 65 26 65 C32 65 37 68 39 73" fill="currentColor" fillOpacity="0.25" />

    {/* Siswa Kanan */}
    <circle cx="74" cy="56" r="6.5" fill="currentColor" fillOpacity="0.25" />
    <path d="M61 73 C63 68 68 65 74 65 C81 65 86 69 86 75" fill="currentColor" fillOpacity="0.25" />
  </svg>
);

export const StatsCounter: React.FC = () => {
  const { schools, setActiveTab } = useApp();

  // 1. Data SD Real-time dari Database
  const sdSchools = schools.filter((s) => s.level?.toUpperCase() === 'SD');
  const sdCount = sdSchools.length;
  const sdNegeri = sdSchools.filter((s) => s.status === 'Negeri').length;
  const sdSwasta = sdSchools.filter((s) => s.status === 'Swasta').length;

  // 2. Data TK Real-time dari Database
  const tkSchools = schools.filter((s) => s.level?.toUpperCase() === 'TK');
  const tkCount = tkSchools.length;
  const tkNegeri = tkSchools.filter((s) => s.status === 'Negeri').length;
  const tkSwasta = tkSchools.filter((s) => s.status === 'Swasta').length;

  // 3. Data KB Real-time dari Database
  const paudSchools = schools.filter((s) => s.level?.toUpperCase() === 'PAUD' || s.level?.toUpperCase() === 'KB');
  const paudCount = paudSchools.length;
  const paudNegeri = paudSchools.filter((s) => s.status === 'Negeri').length;
  const paudSwasta = paudSchools.filter((s) => s.status === 'Swasta').length;
  
  // 4. Data Guru & Siswa Real-time dari Database
  const totalStudents = schools.reduce((acc, s) => acc + (Number(s.studentsCount) || 0), 0);
  const totalTeachers = schools.reduce((acc, s) => acc + (Number(s.teachersCount) || 0), 0);
  const totalCivitas = totalStudents + totalTeachers;

  const stats = [
    {
      title: "Satuan Sekolah Dasar (SD)",
      value: sdCount.toString(),
      subvalue: sdCount > 0 ? `${sdNegeri} Negeri • ${sdSwasta} Swasta` : '0 Lembaga Terdaftar',
      icon: School,
      unit: '',
      watermark: SchoolWatermark,
      target: 'schools',
      path: '/sekolah#sd',
      cornerWaveType: 'standard'
    },
    {
      title: "Taman Kanak-Kanak (TK)",
      value: tkCount.toString(),
      subvalue: tkCount > 0 ? `${tkNegeri} Negeri • ${tkSwasta} Swasta` : '0 Lembaga Terdaftar',
      icon: Sparkles,
      unit: '',
      watermark: ToyBlocksWatermark,
      target: 'schools',
      path: '/sekolah#tk',
      cornerWaveType: 'standard'
    },
    {
      title: "Kelompok Bermain (KB)",
      value: paudCount.toString(),
      subvalue: paudCount > 0 ? `${paudNegeri} Negeri • ${paudSwasta} Swasta` : '0 Lembaga Terdaftar',
      icon: Baby,
      unit: '',
      watermark: PlaygroundWatermark,
      target: 'schools',
      path: '/sekolah#kb',
      cornerWaveType: 'standard'
    },
    {
      title: "Guru & Siswa Terdaftar",
      value: totalCivitas.toLocaleString('id-ID'),
      subvalue: `${totalTeachers.toLocaleString('id-ID')} Guru • ${totalStudents.toLocaleString('id-ID')} Siswa`,
      icon: Users,
      unit: 'Jiwa',
      watermark: GraduateWatermark,
      target: 'nominatif',
      path: '/profil#nominatif',
      cornerWaveType: 'prominent'
    }
  ];

  return (
    <div className="relative -mt-10 sm:-mt-12 w-full px-4 sm:px-8 lg:px-12 xl:px-16 z-20">
      {/* Decorative ambient background with soft gradients & dot grids */}
      <div className="relative rounded-3xl bg-gradient-to-b from-blue-50/50 via-slate-50/20 to-transparent px-3 pt-3 pb-2 sm:px-5 sm:pt-4 sm:pb-2">
        
        {/* Dot Matrix Pattern - Top Right */}
        <div className="absolute top-2 right-4 sm:right-8 grid grid-cols-6 gap-1.5 pointer-events-none opacity-40 select-none">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>

        {/* Dot Matrix Pattern - Bottom Left */}
        <div className="absolute bottom-1.5 left-4 sm:left-8 grid grid-cols-6 gap-1.5 pointer-events-none opacity-40 select-none">
          {[...Array(24)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          ))}
        </div>

        {/* Ambient Soft Blur */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            const Watermark = item.watermark;
            const isProminent = item.cornerWaveType === 'prominent';

            return (
              <div
                key={idx}
                onClick={() => setActiveTab(item.target as any, item.path || (item.target === 'nominatif' ? '/profil#nominatif' : undefined))}
                className="group relative bg-white rounded-2xl sm:rounded-[22px] p-5 sm:p-6 border border-blue-100/90 shadow-md shadow-slate-200/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                title={`Klik untuk melihat ${item.title}`}
              >
                {/* SVG Top-Left Blue Wave */}
                {isProminent ? (
                  <svg
                    className="absolute top-0 left-0 w-36 h-28 pointer-events-none select-none z-0"
                    viewBox="0 0 145 105"
                    fill="none"
                  >
                    <path
                      d="M0 0 H140 C105 12 76 38 50 68 C28 88 12 100 0 102 Z"
                      fill="url(#prominentWaveGrad)"
                    />
                    <defs>
                      <linearGradient id="prominentWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="50%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <svg
                    className="absolute top-0 left-0 w-32 h-24 pointer-events-none select-none z-0"
                    viewBox="0 0 130 95"
                    fill="none"
                  >
                    <path
                      d="M0 0 H120 C95 8 70 30 45 55 C25 75 10 90 0 95 Z"
                      fill="url(#standardWaveGrad)"
                    />
                    <defs>
                      <linearGradient id="standardWaveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="60%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#38bdf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}

                {/* SVG Bottom-Right Subtle Light Blue Wave */}
                <svg
                  className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none select-none z-0"
                  viewBox="0 0 140 80"
                  fill="none"
                >
                  <path
                    d="M140 80 L140 22 C112 42 70 56 0 80 Z"
                    fill="url(#cardBottomWaveGrad)"
                  />
                  <defs>
                    <linearGradient id="cardBottomWaveGrad" x1="100%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#f0f9ff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Right-Side Faint Watermark Illustration */}
                <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 pointer-events-none select-none z-0 transition-transform duration-300 group-hover:scale-105">
                  <Watermark />
                </div>

                {/* Top: Icon with Soft Droplet Background */}
                <div className="relative z-10 mb-2">
                  <div className="w-13 h-13 rounded-[22px_14px_24px_16px] bg-sky-200/60 backdrop-blur-xs flex items-center justify-center p-1 shadow-xs group-hover:rotate-2 transition-transform">
                    <div className="w-11 h-11 rounded-[14px] bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1d4ed8] flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-white stroke-[2.2]" />
                    </div>
                  </div>
                </div>

                {/* Bottom: Number with Vertical Blue Bar, Title & Subtitle */}
                <div className="relative z-10 pt-2">
                  {/* Big Number with Vertical Blue Accent Line */}
                  <div className="flex items-center gap-2.5 my-1.5">
                    <div className="w-1.5 h-8 bg-[#0284c7] rounded-full shrink-0" />
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                        {item.value}
                      </span>
                      {item.unit && (
                        <span className="text-xs font-bold text-[#0284c7] ml-0.5">
                          {item.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Title */}
                  <div className="text-xs sm:text-[13px] font-bold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors mt-1.5">
                    {item.title}
                  </div>

                  {/* Card Subtitle with Small Users Icon */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-[#0284c7] shrink-0" />
                    <span className="truncate">{item.subvalue}</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
