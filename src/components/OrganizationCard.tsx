import React from 'react';
import { EducationalOrganization } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  MapPin, 
  User, 
  ArrowRight 
} from 'lucide-react';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl, prefetchGoogleDriveImage } from '../lib/driveHelper';
import { FastImage } from './FastImage';

interface OrganizationCardProps {
  org: EducationalOrganization;
}

export const OrganizationCard: React.FC<OrganizationCardProps> = ({ org }) => {
  const { setSelectedOrganizationSlug } = useApp();

  // Prefetch data & gambar organisasi saat kursor mendekat / hover
  const handlePrefetch = () => {
    if (org.leader?.photo) {
      prefetchGoogleDriveImage(org.leader.photo, 600);
    }
    if (org.officials && org.officials.length > 0) {
      org.officials.slice(0, 4).forEach((off) => {
        if (off.photo) prefetchGoogleDriveImage(off.photo, 320);
      });
    }
  };

  // Validasi URL logo organisasi
  const rawLogo = org.logo?.trim() || '';
  const hasUploadedLogo = Boolean(
    rawLogo && 
    rawLogo !== '#' && 
    rawLogo !== '-' && 
    !rawLogo.toLowerCase().includes('placeholder')
  );

  const orgLogo = hasUploadedLogo 
    ? (isGoogleDriveUrl(rawLogo) ? formatGoogleDriveImageUrl(rawLogo, 180) : rawLogo)
    : '';

  const leaderName = org.leader?.name || '-';
  const officialsCount = org.officials ? org.officials.length : 0;

  // Validasi URL foto ketua organisasi
  const rawLeaderPhoto = org.leader?.photo?.trim() || '';
  const hasUploadedLeaderPhoto = Boolean(
    rawLeaderPhoto && 
    rawLeaderPhoto !== '#' && 
    rawLeaderPhoto !== '-' && 
    !rawLeaderPhoto.toLowerCase().includes('placeholder')
  );

  const leaderPhotoSrc = hasUploadedLeaderPhoto 
    ? (isGoogleDriveUrl(rawLeaderPhoto) ? formatGoogleDriveImageUrl(rawLeaderPhoto, 120) : rawLeaderPhoto)
    : '';

  // Ekstraksi akronim/singkatan untuk badge kecil di sebelah logo (misal: K3S, PAI, PGRI, KWA)
  const getAcronym = () => {
    const matchParen = org.name.match(/\(([^)]+)\)/);
    if (matchParen && matchParen[1]) {
      return matchParen[1].trim();
    }
    if (org.shortName && org.shortName.length <= 6) {
      return org.shortName;
    }
    if (org.slug === 'pramuka' || org.name.toLowerCase().includes('pramuka')) {
      return 'KWA';
    }
    return '';
  };

  const acronym = getAcronym();
  const showAcronymBadge = Boolean(acronym && acronym.toUpperCase() !== org.shortName?.toUpperCase());

  return (
    <div
      onClick={() => setSelectedOrganizationSlug(org.slug)}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="group relative bg-white rounded-2xl p-4 sm:p-4.5 border border-blue-100/90 shadow-sm hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer space-y-3"
    >
      {/* Top-Right Soft Wave Accent */}
      <svg
        className="absolute top-0 right-0 w-24 h-16 pointer-events-none select-none z-0 opacity-40"
        viewBox="0 0 120 80"
        fill="none"
      >
        <path
          d="M120 0 V60 C105 70 85 60 70 45 C50 25 30 35 0 30 V0 Z"
          fill="url(#orgTopRightWave)"
        />
        <defs>
          <linearGradient id="orgTopRightWave" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Right Curved Blue Wave */}
      <svg
        className="absolute bottom-0 right-0 w-20 h-14 pointer-events-none select-none z-0"
        viewBox="0 0 100 65"
        fill="none"
      >
        <path
          d="M100 65 L100 15 C88 15 72 25 55 40 C42 52 30 60 10 65 Z"
          fill="url(#orgBottomRightWave)"
        />
        <defs>
          <linearGradient id="orgBottomRightWave" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="space-y-2.5 relative z-10">
        {/* 1. Top Row: Logo & Badges */}
        <div className="flex items-start justify-between gap-1.5">
          {/* Left: Logo Container & Acronym Pill */}
          <div className="flex items-center gap-1.5 min-w-0">
            {/* Circular Logo Container: KOSONG jika belum ada logo yang diupload ke Supabase */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-blue-100/90 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
              {hasUploadedLogo ? (
                <FastImage 
                  src={orgLogo} 
                  alt={org.shortName || org.name} 
                  size={120}
                  containerClassName="w-full h-full rounded-full"
                  imageClassName="object-contain rounded-full"
                  fallbackIcon={<div className="w-full h-full rounded-full bg-slate-50/40" />}
                />
              ) : (
                /* Logo KOSONG sesuai instruksi user: tidak menampilkan logo dummy */
                <div className="w-full h-full rounded-full bg-slate-50/40" />
              )}
            </div>

            {/* Acronym Badge */}
            {showAcronymBadge && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200/70 shrink-0">
                {acronym}
              </span>
            )}
          </div>

          {/* Right: ShortName Pill & Officials Count */}
          <div className="flex flex-col items-end gap-1 shrink-0 max-w-[50%]">
            {org.shortName && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/70 truncate max-w-full" title={org.shortName}>
                {org.shortName}
              </span>
            )}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100">
              <Users className="w-3 h-3 text-blue-600 shrink-0" />
              <span>{officialsCount} Pengurus</span>
            </div>
          </div>
        </div>

        {/* 2. Title */}
        <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2 min-h-[2.5rem] mt-1.5" title={org.name}>
          {org.name}
        </h3>

        {/* 3. Description */}
        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed min-h-[2rem]">
          {org.description || 'Wadah koordinasi dan pembinaan organisasi di lingkungan Kecamatan Purwodadi.'}
        </p>

        {/* 4. Ketua & Sekretariat Box */}
        <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-100/90 space-y-1.5 mt-2">
          {/* Ketua Terpilih */}
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-slate-200">
              {hasUploadedLeaderPhoto ? (
                <FastImage 
                  src={leaderPhotoSrc} 
                  alt={leaderName} 
                  size={100}
                  containerClassName="w-full h-full rounded-full"
                  imageClassName="w-full h-full object-cover object-top rounded-full"
                  fallbackIcon={<User className="w-3.5 h-3.5 text-blue-600" />}
                />
              ) : (
                <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block leading-none mb-0.5">
                KETUA TERPILIH
              </span>
              <span className="font-bold text-slate-900 text-[11px] block truncate leading-tight" title={leaderName}>
                {leaderName}
              </span>
            </div>
          </div>

          {/* Sekretariat / Alamat */}
          <div className="flex items-center gap-2 text-xs pt-1 border-t border-slate-200/60">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[10.5px] text-slate-500 truncate" title={org.address || 'Sekretariat Korwilcam Purwodadi'}>
              {org.address || 'Sekretariat Korwilcam Purwodadi'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Footer: Pill Button on Left + Dots on Right */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 group-hover:bg-blue-600 group-hover:text-white text-blue-600 font-bold text-[10.5px] transition-all shadow-2xs">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-600 group-hover:bg-white text-white group-hover:text-blue-600 flex items-center justify-center shadow-xs transition-colors">
            <ArrowRight className="w-2 h-2" />
          </div>
          <span>Buka Profil & Pengurus</span>
        </div>

        {/* Decorative dots */}
        <div className="text-blue-300 font-black tracking-widest text-[10px] select-none pr-0.5">
          ••••
        </div>
      </div>
    </div>
  );
};
