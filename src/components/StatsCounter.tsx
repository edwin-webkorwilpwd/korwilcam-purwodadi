import React from 'react';
import { useApp } from '../context/AppContext';
import { School, Baby, Sparkles, Users } from 'lucide-react';

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

  // 3. Data PAUD Real-time dari Database
  const paudSchools = schools.filter((s) => s.level?.toUpperCase() === 'PAUD');
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
      subvalue: sdCount > 0 ? `${sdNegeri} Negeri • ${sdSwasta} Swasta` : '0 Sekolah Terdaftar',
      icon: School,
      color: "from-blue-600 to-indigo-600",
      accent: "bg-blue-50 text-blue-700",
      border: "border-blue-100",
      badge: `${sdCount} Satuan`
    },
    {
      title: "Taman Kanak-Kanak (TK)",
      value: tkCount.toString(),
      subvalue: tkCount > 0 ? `${tkNegeri} Negeri • ${tkSwasta} Swasta` : '0 Lembaga Terdaftar',
      icon: Sparkles,
      color: "from-sky-500 to-blue-600",
      accent: "bg-sky-50 text-sky-700",
      border: "border-sky-100",
      badge: `${tkCount} Lembaga`
    },
    {
      title: "Kelompok Bermain & PAUD",
      value: paudCount.toString(),
      subvalue: paudCount > 0 ? `${paudNegeri} Negeri • ${paudSwasta} Swasta` : '0 Lembaga Terdaftar',
      icon: Baby,
      color: "from-emerald-500 to-teal-600",
      accent: "bg-emerald-50 text-emerald-700",
      border: "border-emerald-100",
      badge: `${paudCount} Lembaga`
    },
    {
      title: "Guru & Siswa Terdaftar",
      value: totalCivitas.toLocaleString('id-ID'),
      subvalue: `${totalTeachers.toLocaleString('id-ID')} Guru • ${totalStudents.toLocaleString('id-ID')} Siswa`,
      icon: Users,
      color: "from-indigo-600 to-purple-600",
      accent: "bg-indigo-50 text-indigo-700",
      border: "border-indigo-100",
      badge: `${totalTeachers} Guru`
    }
  ];

  return (
    <div className="relative -mt-10 w-full px-4 sm:px-8 lg:px-12 xl:px-16 z-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab('schools')}
              className={`bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border ${item.border} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
              title="Klik untuk membuka Direktori Sekolah"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.accent} group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                    {item.badge}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">
                    0{idx + 1}
                  </span>
                </div>
              </div>
              
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5">
                <span>{item.value}</span>
                {idx === 3 && <span className="text-xs font-bold text-indigo-600">Jiwa</span>}
              </div>
              <div className="text-sm font-bold text-slate-700 mt-1 group-hover:text-blue-600 transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">
                {item.subvalue}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
