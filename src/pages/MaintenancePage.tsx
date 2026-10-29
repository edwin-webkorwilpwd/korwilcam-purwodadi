import React from 'react';
import { MaintenanceConfig } from '../lib/maintenanceHelper';
import { useApp } from '../context/AppContext';
import { Lock } from 'lucide-react';

interface MaintenancePageProps {
  config?: MaintenanceConfig;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ config }) => {
  const { setActiveTab } = useApp();

  const title = config?.title || 'Mohon Maaf 🙏';
  const message = config?.message || 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺';
  const subMessage = config?.subMessage || 'Kami akan segera perbaiki kembali secepatnya.';

  return (
    <div className="min-h-screen w-full bg-[#182f6e] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Center Card (Persis Gambar 2 & Gambar 3) */}
      <div className="w-full max-w-xl bg-[#253f86]/90 border border-white/15 rounded-3xl sm:rounded-[36px] p-6 sm:p-10 shadow-2xl shadow-blue-950/70 text-center flex flex-col items-center backdrop-blur-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* 1. Ilustrasi Laptop Maintenance (Gambar 3) */}
        <div className="w-full flex justify-center mb-3">
          <img 
            src="/maintenance-illustration.png" 
            alt="Ilustrasi Pemeliharaan Sistem" 
            className="w-56 sm:w-72 max-w-full h-auto object-contain drop-shadow-md"
            loading="eager"
          />
        </div>

        {/* 2. Logo Resmi Kabupaten Grobogan (Gambar 2) */}
        <div className="mb-4">
          <img 
            src="/logo.png" 
            alt="Logo Kabupaten Grobogan" 
            className="w-16 h-20 sm:w-20 sm:h-24 object-contain mx-auto drop-shadow-md"
            loading="eager"
          />
        </div>

        {/* 3. Judul Utama (Gambar 2: "Mohon Maaf 🙏") */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2.5 drop-shadow-sm">
          {title}
        </h1>

        {/* 4. Deskripsi Pemeliharaan (Gambar 2: "Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺") */}
        <p className="text-sm sm:text-base text-blue-100 font-medium max-w-md mx-auto leading-relaxed mb-6">
          {message}
        </p>

        {/* 5. Circular Animated Spinner (Gambar 2) */}
        <div className="flex items-center justify-center my-2 mb-6">
          <div className="w-10 h-10 border-[3.5px] border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>

        {/* 6. Sub Pesan Penenang (Gambar 2: "Kami akan segera perbaiki kembali secepatnya.") */}
        <p className="text-xs sm:text-sm text-blue-200/90 font-normal mb-8 leading-relaxed">
          {subMessage}
        </p>

        {/* 7. Footer Institusi (Gambar 2: "ADMIN KORWILCAM PURWODADI") */}
        <div className="pt-3 border-t border-white/10 w-full">
          <span className="text-[11px] sm:text-xs font-bold text-blue-200/90 tracking-widest uppercase">
            ADMIN KORWILCAM PURWODADI
          </span>
        </div>
      </div>

      {/* Discreet Secret Admin Access Button at bottom-right corner for Super Admin */}
      <button
        type="button"
        onClick={() => setActiveTab('admin-login', '/angmin/lugin')}
        className="fixed bottom-3 right-3 p-2.5 rounded-full bg-white/5 hover:bg-white/20 text-white/25 hover:text-white/80 transition-all text-xs flex items-center gap-1.5 backdrop-blur-sm cursor-pointer z-50 border border-white/10"
        title="Akses Masuk Panel Admin"
      >
        <Lock className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
