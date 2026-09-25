import React from 'react';
import { ArrowUpRight, Share2, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatExternalUrl, TikTokIcon, FacebookIcon, InstagramIcon, YoutubeIcon, XIcon, WhatsAppIcon } from '../components/SocialIcons';
import { SocialMediaItem } from '../types';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const SocialMediaPage: React.FC = () => {
  const { socialMedia, setActiveTab } = useApp();

  // KONDISI KRUSIAL DARI USER:
  // "ketika akun / link sos med tidak terisi, maka juga tidak akan muncul didalam website.
  // jadi intinya kondisional. ketika akun website disetting dan terisi, maka akan muncul tampilan diwebsite,
  // ketika tidak isi, maka tidak akan tampil."
  const visibleSocialMedia = (socialMedia || []).filter(
    (item) => item.isActive !== false && item.url && item.url.trim() !== ''
  );

  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform duration-200">
            <InstagramIcon className="w-7 h-7" />
          </div>
        );
      case 'youtube':
        return (
          <div className="w-14 h-14 rounded-2xl bg-[#FF0000] flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform duration-200">
            <YoutubeIcon className="w-7 h-7" />
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-200">
            <TikTokIcon className="w-7 h-7" />
          </div>
        );
      case 'facebook':
        return (
          <div className="w-14 h-14 rounded-2xl bg-[#1877F2] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
            <FacebookIcon className="w-7 h-7" />
          </div>
        );
      case 'whatsapp':
        return (
          <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
            <WhatsAppIcon className="w-7 h-7" />
          </div>
        );
      case 'x':
      default:
        return (
          <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-200">
            <XIcon className="w-6 h-6" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 1. HERO CURVED HEADER DENGAN GRADASI BIRU STANDAR WEBSITE */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Media Sosial Resmi Korwilcam Purwodadi
          </h1>

          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Ikuti kami di platform media sosial resmi untuk mendapatkan informasi, berita, dan perkembangan terbaru seputar dunia pendidikan di Kecamatan Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>

        {/* Curved Header Arch */}
        <CurvedHeaderArch />
      </section>

      {/* 2. GRID KARTU MEDIA SOSIAL */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full -mt-5 sm:-mt-6 relative z-20">
        {visibleSocialMedia.length > 0 ? (
          <div
            className={`grid gap-4 lg:gap-5 justify-center ${
              visibleSocialMedia.length === 1
                ? 'max-w-xs mx-auto grid-cols-1'
                : visibleSocialMedia.length === 2
                ? 'max-w-xl mx-auto grid-cols-1 sm:grid-cols-2'
                : visibleSocialMedia.length === 3
                ? 'max-w-4xl mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                : visibleSocialMedia.length === 4
                ? 'max-w-5xl mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                : visibleSocialMedia.length === 5
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6'
            }`}
          >
            {visibleSocialMedia.map((item: SocialMediaItem) => (
              <div
                key={item.id || item.platform}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group"
              >
                {/* Logo Ikon Platform */}
                <div className="pt-1">
                  {renderPlatformIcon(item.platform)}
                </div>

                {/* Nama Akun / Handle */}
                <h3 className="font-extrabold text-slate-900 text-sm mt-4 tracking-tight truncate max-w-full px-1">
                  {item.username || item.name}
                </h3>

                {/* Jumlah Pengikut / Stat */}
                {item.followers && (
                  <span className="text-xs font-semibold text-slate-600 mt-0.5">
                    {item.followers}
                  </span>
                )}

                {/* Deskripsi Singkat */}
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5 mb-5 flex-1 line-clamp-3 min-h-[36px]">
                  {item.description}
                </p>

                {/* Tombol Tautan Eksternal */}
                <a
                  href={formatExternalUrl(item.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-[#1b56ce] hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
                >
                  <span className="truncate">{item.buttonLabel || `Ikuti di ${item.name}`}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          /* Placeholder bila seluruh akun belum disetting link-nya */
          <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center space-y-4 my-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
              <Share2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-800">
                Media Sosial Sedang Disiapkan
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tautan akun media sosial resmi Korwilcam Purwodadi saat ini sedang dalam proses pembaruan. Silakan kunjungi kembali dalam waktu dekat.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('contact', '/kontak')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Hubungi Kami via Kontak</span>
            </button>
          </div>
        )}

        {/* 3. BANNER INFORMASI PENTING */}
        <div className="mt-8 max-w-5xl mx-auto bg-gradient-to-r from-[#1b56ce] via-[#205fd9] to-[#1288dd] border border-white/20 text-white rounded-2xl p-4 sm:p-5 shadow-md flex items-start gap-3.5">
          <div className="shrink-0 mt-0.5">
            <div className="w-6 h-6 rounded-full bg-white/20 border border-amber-300 flex items-center justify-center text-amber-300 text-xs font-black shadow-xs">
              i
            </div>
          </div>
          <div className="space-y-0.5 min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-wider">
              Informasi Penting
            </h4>
            <p className="text-xs text-blue-50 leading-relaxed">
              Semua akun di atas adalah media sosial resmi kami. Mohon berhati-hati terhadap akun palsu yang mengatasnamakan Korwilcam Purwodadi.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
