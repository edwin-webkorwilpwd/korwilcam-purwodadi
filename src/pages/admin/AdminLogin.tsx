import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  ArrowLeft, 
  Loader2, 
  LogOut, 
  ExternalLink,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { getGoogleDriveCandidates } from '../../lib/driveHelper';

const BACKGROUND_DRIVE_URL = 'https://drive.google.com/file/d/1lmJrDPTE_RVGmfmzI-dpZQ1H3k0Qd7Rz/view?usp=drive_link';

export const AdminLogin: React.FC = () => {
  const { login, setActiveTab, isAuthenticated, currentUser, logout, showToast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);

  const bgCandidates = useMemo(() => {
    return getGoogleDriveCandidates(BACKGROUND_DRIVE_URL);
  }, []);

  const currentBgSrc = bgCandidates[candidateIndex] || bgCandidates[0];

  const handleBgError = () => {
    if (candidateIndex + 1 < bgCandidates.length) {
      setCandidateIndex((prev) => prev + 1);
    }
  };

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
    <div className="relative min-h-screen w-full flex flex-col justify-between py-5 px-4 sm:px-8 md:px-12 lg:px-16 overflow-x-hidden bg-slate-950 font-sans select-none">
      
      {/* Background Image with Fallback */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          key={currentBgSrc}
          src={currentBgSrc}
          alt="Latar Belakang Bledug Kuwu Grobogan"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          onError={handleBgError}
          className="w-full h-full object-cover object-center filter brightness-100 contrast-[1.02] transition-all duration-700"
        />
        {/* Soft, light gradient overlay so the background is much brighter, natural & vivid */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/20 to-slate-950/35" />
        
        {/* Soft radial vignette to subtly frame the login card */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.3)_100%)]" />
      </div>

      {/* Top Header Bar - Full Screen Width */}
      <header className="relative z-10 w-full flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('home', '/beranda')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-semibold backdrop-blur-md border border-white/10 hover:border-blue-400 transition-all duration-200 shadow-xl group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Website Publik</span>
        </button>

        <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-[11px] font-semibold text-emerald-300 shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Sistem Informasi Terenkripsi</span>
        </div>
      </header>

      {/* Center Content / Form Card */}
      <main className="relative z-10 w-full max-w-md mx-auto my-8 space-y-4">
        
        {/* Sesi Aktif Terdeteksi Banner (Jika Petugas sudah login sebelumnya) */}
        {isAuthenticated && currentUser && (
          <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-blue-500/40 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-300">Sesi Aktif Terdeteksi:</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                currentUser.role === 'Super Admin'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : currentUser.role === 'Admin'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {currentUser.role}
              </span>
            </div>
            <div className="text-sm font-bold text-white">
              {currentUser.name} <span className="text-xs font-normal text-slate-400">(@{currentUser.username})</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('admin-dashboard')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <span>Buka Panel Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-rose-500/20 hover:border-rose-400/40 text-slate-300 hover:text-rose-300 border border-white/10 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                title="Keluar dari sesi ini"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Ganti Akun</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Login Glass Card */}
        <div className="bg-slate-900/85 sm:bg-slate-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/15 space-y-6">
          
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl animate-pulse" />
              <img 
                src="/logo.png" 
                alt="Logo Kabupaten Grobogan" 
                className="h-16 sm:h-20 w-auto object-contain drop-shadow-2xl relative z-10"
              />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                KORWILCAM PURWODADI
              </h1>
              <p className="text-xs text-blue-300/90 font-medium">
                Dinas Pendidikan Kabupaten Grobogan
              </p>
            </div>

            <div className="pt-1 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600/20 text-blue-300 text-xs font-bold border border-blue-400/30 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Masuk ke Panel Pengelola</span>
              </span>
            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-300">
                Username Petugas
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  aria-label="Username Petugas"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-300">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-label="Kata Sandi"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-950/60 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all duration-300 active:scale-[0.98] cursor-pointer"
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

      </main>

      {/* Bottom Footer Info - Full Screen Width */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-xs text-slate-400 pt-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-200 bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>Latar: Objek Wisata Bledug Kuwu • Grobogan, Jawa Tengah</span>
        </div>
        <p className="text-[11px] text-slate-300/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          Sistem Keamanan & Otentikasi Petugas Korwilcam Purwodadi © 2026
        </p>
      </footer>

    </div>
  );
};

