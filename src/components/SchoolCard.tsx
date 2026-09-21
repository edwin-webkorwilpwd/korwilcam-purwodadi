import React, { useState, useMemo, useEffect } from 'react';
import { School } from '../types';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  User, 
  Star, 
  GraduationCap, 
  Users, 
  ArrowRight 
} from 'lucide-react';
import { getGoogleDriveCandidates, isGoogleDriveUrl } from '../lib/driveHelper';

// Ikon Gedung Sekolah dengan Jam & Atap
const SchoolBuildingIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6 text-blue-600" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" />
    <path d="M18 10h4v12h-4v-7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v7H2V10h4" />
    <path d="M12 2l8 5H4l8-5z" />
    <circle cx="12" cy="10" r="1.5" />
  </svg>
);

interface SchoolCardProps {
  school: School;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({ school }) => {
  const { setSelectedSchool } = useApp();
  const [candidateIndex, setCandidateIndex] = useState(0);

  const rawImage = school.image?.trim() || '';
  const candidates = useMemo(() => {
    if (!rawImage || rawImage.includes('photo-1580582932707')) return [];
    if (isGoogleDriveUrl(rawImage)) {
      return getGoogleDriveCandidates(rawImage);
    }
    return [rawImage];
  }, [rawImage]);

  useEffect(() => {
    setCandidateIndex(0);
  }, [rawImage]);

  const currentSrc = candidates[candidateIndex];
  const hasImage = Boolean(currentSrc && candidateIndex < candidates.length);

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setCandidateIndex(candidates.length);
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'SD':
        return 'bg-[#1d64ec] text-white';
      case 'TK':
        return 'bg-sky-600 text-white';
      case 'PAUD':
      case 'KB':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-[#1d64ec] text-white';
    }
  };

  return (
    <div 
      onClick={() => setSelectedSchool(school)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedSchool(school);
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-100/90 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      {/* 1. Cover Image & Badges */}
      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-slate-100">
        {hasImage ? (
          <>
            <img
              key={currentSrc}
              src={currentSrc}
              alt={school.name}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100/60 flex flex-col items-center justify-center border-b border-slate-200/60">
            <div className="w-12 h-12 rounded-xl bg-white/90 shadow-sm border border-blue-100 flex items-center justify-center text-blue-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
              <SchoolBuildingIcon className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-1">Tidak ada foto</span>
          </div>
        )}

        {/* Top-Left: Level & Status Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
          <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black tracking-wide shadow-md ${getLevelBadge(school.level)}`}>
            {school.level === 'PAUD' ? 'KB' : school.level}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/95 text-slate-800 shadow-md backdrop-blur-xs">
            {school.status}
          </span>
        </div>

        {/* Top-Right: Akreditasi Badge */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/95 text-amber-600 shadow-md backdrop-blur-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Akr. {school.akreditasi || 'A'}</span>
          </span>
        </div>

        {/* Bottom-Left: NPSN Badge with MapPin Icon */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-md text-white text-[10px] font-mono font-medium shadow-md">
            <MapPin className="w-2.5 h-2.5 text-blue-400 shrink-0" />
            <span>NPSN : {school.npsn}</span>
          </span>
        </div>
      </div>

      {/* 2. Body Content */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        {/* School Avatar + Name, Principal & Address */}
        <div className="flex items-start gap-2.5">
          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs mt-0.5">
            <SchoolBuildingIcon className="w-4.5 h-4.5 text-blue-600" />
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
              {school.name}
            </h3>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Kepsek: <span className="font-medium text-slate-700">{school.headmaster}</span></span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate text-slate-500">{school.address}</span>
            </div>
          </div>
        </div>

        {/* 3. Bottom Stats Bar & Circular Arrow Button */}
        <div className="bg-blue-50/50 rounded-xl p-2 sm:p-2.5 flex items-center justify-between border border-blue-100/60">
          {/* Left Stats: Murid & Guru */}
          <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-700">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{school.studentsCount}</span>
              <span className="text-[10px] font-normal text-slate-500">Murid</span>
            </div>

            <div className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>{school.teachersCount}</span>
              <span className="text-[10px] font-normal text-slate-500">Guru</span>
            </div>
          </div>

          {/* Right Circular Blue Arrow Button */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-all shrink-0">
            <ArrowRight className="w-3 h-3 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
