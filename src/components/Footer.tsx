import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  ChevronRight, 
  Lock 
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { officeProfile, setActiveTab, isAuthenticated } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-5 pb-3.5 border-t-2 border-blue-600">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 pb-3.5 border-b border-slate-800/80">
          
          {/* Kolom 1: Profil Instansi */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 sm:h-9 w-auto flex items-center justify-center shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Logo Kabupaten Grobogan" 
                  className="h-8 sm:h-9 w-auto object-contain drop-shadow-md"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-xs sm:text-sm leading-tight">
                  KORWILCAM PURWODADI
                </h4>
                <p className="text-[10px] text-blue-400 font-semibold leading-tight">
                  Dinas Pendidikan Kab. Grobogan
                </p>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Unit koordinasi pembinaan & mutu pendidikan jenjang SD, TK, dan PAUD di Kecamatan Purwodadi.
            </p>

            <div className="pt-0.5 space-y-1 text-[10px] text-slate-300">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-tight">{officeProfile.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-blue-400 shrink-0" />
                <span>{officeProfile.phone} / WA: {officeProfile.whatsapp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{officeProfile.email}</span>
              </div>
            </div>
          </div>

          {/* Kolom 2: Navigasi Halaman 2 Sisi: Kiri & Kanan */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Navigasi Halaman
            </h4>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
              {/* Sisi Kiri */}
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Beranda Utama</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('profile')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Visi, Misi & Struktur</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('schools')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Direktori Sekolah</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('news')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Warta & Informasi</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('downloads')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Unduh Berkas</span>
                  </button>
                </li>
              </ul>

              {/* Sisi Kanan */}
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => setActiveTab('service-aula')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Peminjaman Aula</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('service-cuti')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Surat Cuti Online</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('service-survey')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Survey Pelayanan</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('gallery')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Galeri Kegiatan</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveTab('contact')}
                    className="hover:text-blue-400 transition-colors flex items-center gap-1 text-left group w-full"
                  >
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0" />
                    <span className="truncate">Kontak & Aduan</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Kolom 3: Tautan Portal Resmi Terkait */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Portal Terkait
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a 
                  href="https://kwarran04pwd.blogspot.com/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center justify-between group py-0.5"
                >
                  <span className="leading-snug">Kwarran 04 Purwodadi</span>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 ml-1" />
                </a>
              </li>
              <li>
                <a 
                  href="https://disdik.grobogan.go.id/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-blue-400 transition-colors flex items-center justify-between group py-0.5"
                >
                  <span className="leading-snug">Disdik Kab. Grobogan</span>
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400 shrink-0 ml-1" />
                </a>
              </li>
            </ul>
          </div>

          {/* Kolom 4: Jam Pelayanan Kantor */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-bold text-[11px] sm:text-xs tracking-wider uppercase mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Jam Pelayanan
            </h4>
            <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="font-semibold text-white">Senin - Kamis</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">07.30 - 16.00 WIB</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-blue-400 shrink-0" />
                  <span className="font-semibold text-white">Jumat</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">07.30 - 15.00 WIB</span>
              </div>
              <p className="text-[10px] text-amber-400/90 pt-1 border-t border-slate-800 leading-tight">
                *Sabtu, Minggu & Libur Nasional tutup.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright & attribution */}
        <div className="pt-2.5 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 gap-1.5">
          <div className="flex items-center gap-1 flex-wrap">
            <p>© 2026 Kantor Korwilcam Bidang Pendidikan Purwodadi. Seluruh hak cipta dilindungi.</p>
            {/* Tombol Rahasia Login Admin (Tersamar sebagai Ikon Gembok Keamanan Web) */}
            <button
              type="button"
              onClick={() => setActiveTab(isAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="text-slate-600 hover:text-slate-400 transition-colors p-0.5 rounded cursor-pointer opacity-30 hover:opacity-100 inline-flex items-center"
              title="Akses Petugas"
              aria-label="Akses Petugas"
            >
              <Lock className="w-2.5 h-2.5" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Website ini dikembangkan oleh Tim IT Korwilcam Purwodadi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
