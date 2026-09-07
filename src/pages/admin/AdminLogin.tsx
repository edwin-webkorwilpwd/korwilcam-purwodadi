import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setActiveTab } = useApp();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setActiveTab('admin-dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-100">
      <div className="max-w-md w-full space-y-6">
        
        {/* Top return button */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Publik</span>
        </button>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200/80 space-y-6">
          
          <div className="text-center space-y-2">
            <div className="h-20 w-auto flex items-center justify-center mx-auto">
              <img 
                src="/logo.png" 
                alt="Logo Kabupaten Grobogan" 
                className="h-20 w-auto object-contain drop-shadow-xl"
              />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Panel Pengelola Web
            </h2>
            <p className="text-xs text-slate-500">
              Masuk untuk mengelola berita, data sekolah, pengumuman, dan dokumen Korwilcam Purwodadi.
            </p>
          </div>

          {/* Quick Demo Credentials Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-blue-800">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Akun Uji Coba Admin (Default):</span>
            </div>
            <div className="flex justify-between font-mono text-[11px] pt-1 text-slate-700">
              <span>Username: <strong className="text-blue-700">admin</strong></span>
              <span>Password: <strong className="text-blue-700">admin123</strong></span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Username / Akun
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk ke Dashboard Admin</span>
            </button>
          </form>

        </div>

        <p className="text-center text-[11px] text-slate-400">
          Sistem Keamanan Portal Korwilcam Purwodadi © 2026
        </p>

      </div>
    </div>
  );
};
