import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, User, ArrowLeft, Loader2, LogOut, ExternalLink } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, setActiveTab, isAuthenticated, currentUser, logout, showToast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Harap masukkan username dan kata sandi!', 'error');
      return;
    }
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
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

        {/* Jika pengguna sudah aktif login sebelumnya */}
        {isAuthenticated && currentUser && (
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-600">Sesi Aktif Terdeteksi:</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                currentUser.role === 'Super Admin'
                  ? 'bg-purple-100 text-purple-800'
                  : currentUser.role === 'Admin'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">
              {currentUser.name} <span className="text-xs font-normal text-slate-500">(@{currentUser.username})</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('admin-dashboard')}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Buka Panel Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-red-50 hover:border-red-300 hover:text-red-600 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                title="Keluar dari sesi ini"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ganti Akun</span>
              </button>
            </div>
          </div>
        )}

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
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                aria-label="Username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-medium placeholder:text-slate-400"
              />
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                aria-label="Kata Sandi"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-medium placeholder:text-slate-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Masuk ke Panel Pengelola</span>
                </>
              )}
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

