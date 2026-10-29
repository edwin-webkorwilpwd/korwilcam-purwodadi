import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react';
import { CurvedHeaderArch } from './CurvedHeaderArch';

interface PageUnavailableProps {
  title?: string;
  itemId?: string;
}

export const PageUnavailable: React.FC<PageUnavailableProps> = ({ title }) => {
  const { setActiveTab } = useApp();

  return (
    <div className="w-full flex-1 flex flex-col bg-slate-50 min-h-[70vh]">
      {/* Institutional Top Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Informasi Layanan
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Status Akses Halaman & Konten Informasi Website
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Notice Card */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex items-center justify-center relative -mt-8 sm:-mt-10 z-20">
        <div className="w-full max-w-xl bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-900/5 text-center flex flex-col items-center">
          
          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200 mb-6">
            <Lock className="w-3.5 h-3.5" />
            Akses Dinonaktifkan
          </span>

          {/* Icon Shield */}
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
            Halaman Ini Sudah Tidak Tersedia
          </h1>

          {/* Detailed Institutional Note */}
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mb-8">
            Mohon maaf, halaman atau data {title ? <strong className="text-slate-800 font-bold">"{title}"</strong> : 'ini'} saat ini sedang dinonaktifkan oleh Administrator Korwilcam Bidang Pendidikan Purwodadi untuk menjaga keamanan data dan informasi.
          </p>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <button
              onClick={() => setActiveTab('home', '/beranda')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
            <button
              onClick={() => setActiveTab('contact', '/kontak')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Layanan Kontak</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
