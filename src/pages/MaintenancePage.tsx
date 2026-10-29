import React from 'react';
import { MaintenanceConfig } from '../lib/maintenanceHelper';

interface MaintenancePageProps {
  config?: MaintenanceConfig;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({ config }) => {
  const title = config?.title || 'Mohon Maaf 🙏';
  const message = config?.message || 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺';
  const subMessage = config?.subMessage || 'Kami akan segera perbaiki kembali secepatnya.';

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0c1a3b] via-[#142a5c] to-[#091530] flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 select-none relative overflow-x-hidden font-sans">
      {/* Decorative ambient background glows (Menyesuaikan Tema Biru Maintenance) */}
      <div className="absolute -top-40 -left-40 w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] bg-sky-400/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle organic background wave accents */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full object-cover" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M0 0C320 180 540 80 800 240C1060 400 1280 200 1440 320V900H0V0Z" fill="url(#wave-grad)" opacity="0.4" />
          <defs>
            <linearGradient id="wave-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ============================================================== */}
      {/* 1. DESKTOP / LAPTOP LAYOUT (Lebih Besar & Sesuai Tema Maintenance) */}
      {/* ============================================================== */}
      <div className="hidden lg:block w-[94vw] max-w-6xl xl:max-w-7xl aspect-[1024/488] relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6),0_0_45px_rgba(30,64,175,0.3)] rounded-[36px] overflow-hidden border border-white/20 bg-white animate-in fade-in zoom-in-95 duration-300">
        {/* Background Canvas: Ilustrasi Laptop & Background Gelombang Biru (Gambar 2) */}
        <img
          src="/maintenance-bg-clean.png"
          alt="Latar Belakang Pemeliharaan"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Kontainer Kartu Pesan Dinamis (Tepat berada di dalam Kartu Putih Gambar 2) */}
        <div 
          className="absolute flex flex-col items-center justify-between text-center select-text"
          style={{
            left: '14.45%',
            top: '12.5%',
            width: '43.75%',
            height: '73.15%',
            padding: '28px 24px 22px 24px'
          }}
        >
          {/* Logo Resmi Kabupaten Grobogan */}
          <div className="flex justify-center items-center h-[26%] max-h-[95px] xl:max-h-[110px]">
            <img 
              src="/logo.png" 
              alt="Logo Kabupaten Grobogan" 
              className="h-full w-auto object-contain drop-shadow-sm pointer-events-none"
            />
          </div>

          {/* Judul Utama (Kustomisasi CMS) */}
          <h1 className="text-2xl xl:text-3xl font-extrabold text-[#1e293b] tracking-tight leading-tight mt-1">
            {title}
          </h1>

          {/* Pesan Keterangan Pemeliharaan (Kustomisasi CMS) */}
          <p className="text-xs sm:text-sm xl:text-[15px] font-semibold text-[#334155] leading-relaxed max-w-sm xl:max-w-md mx-auto mt-0.5">
            {message}
          </p>

          {/* Spinner Animasi Berputar (Sesuai Gambar 2) */}
          <div className="flex items-center justify-center my-1.5 xl:my-2">
            <div className="w-9 h-9 xl:w-11 xl:h-11 border-[3.5px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          {/* Sub Pesan Penenang (Kustomisasi CMS) */}
          <p className="text-xs xl:text-sm text-slate-500 font-normal leading-tight">
            {subMessage}
          </p>

          {/* Tombol Badge Institusi (Sesuai Gambar 2) */}
          <div className="mt-1">
            <span className="inline-block px-6 py-2 rounded-full bg-[#1c3f7e] text-white text-[10px] xl:text-xs font-bold tracking-wider uppercase shadow-md shadow-blue-900/20 pointer-events-none">
              ADMIN KORWILCAM PURWODADI
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE & TABLET LAYOUT (Responsif Elegan untuk Smartphone) */}
      {/* ============================================================== */}
      <div className="lg:hidden w-full max-w-md flex flex-col items-center relative z-10 animate-in fade-in duration-300">
        {/* Ilustrasi Laptop di bagian atas */}
        <div className="w-full flex justify-center mb-4">
          <img
            src="/maintenance-illustration-crop.png"
            alt="Ilustrasi Pemeliharaan Sistem"
            className="w-72 max-w-[90%] h-auto object-contain drop-shadow-2xl rounded-2xl"
          />
        </div>

        {/* Kartu Pesan Putih Melayang */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 border border-white/20 flex flex-col items-center text-center">
          {/* Logo Grobogan */}
          <img 
            src="/logo.png" 
            alt="Logo Kabupaten Grobogan" 
            className="w-16 h-20 sm:w-18 sm:h-22 object-contain mx-auto mb-3 drop-shadow-sm"
          />

          {/* Judul Utama */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight mb-2">
            {title}
          </h1>

          {/* Pesan Keterangan */}
          <p className="text-xs sm:text-sm font-semibold text-[#334155] leading-relaxed mb-4 max-w-xs">
            {message}
          </p>

          {/* Circular Spinner */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-9 h-9 border-[3.5px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          {/* Sub Pesan */}
          <p className="text-xs text-slate-500 font-normal mb-5">
            {subMessage}
          </p>

          {/* Badge Footer */}
          <span className="inline-block px-6 py-2 rounded-full bg-[#1c3f7e] text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase shadow-md shadow-blue-900/20">
            ADMIN KORWILCAM PURWODADI
          </span>
        </div>
      </div>
    </div>
  );
};
