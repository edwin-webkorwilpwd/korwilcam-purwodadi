import React, { useState, useMemo, useEffect } from 'react';
import { School } from '../types';
import { useApp } from '../context/AppContext';
import { MapPin, User, Star, GraduationCap, Users, Building2 } from 'lucide-react';
import { getGoogleDriveCandidates, isGoogleDriveUrl } from '../lib/driveHelper';

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
        return 'bg-blue-600 text-white';
      case 'TK':
        return 'bg-sky-600 text-white';
      case 'PAUD':
      case 'KB':
        return 'bg-emerald-600 text-white';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  const getAkreditasiColor = (akred: string) => {
    if (akred === 'A') return 'bg-amber-50 text-amber-800 border-amber-200';
    if (akred === 'B') return 'bg-blue-50 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
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
      className="card-deferred bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
    >
      {/* Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
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
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200/80 flex flex-col items-center justify-center border-b border-slate-200/60">
            <div className="w-14 h-14 rounded-2xl bg-white/90 shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
              <Building2 className="w-7 h-7 stroke-[1.5]" />
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-2">Tidak ada foto</span>
          </div>
        )}

        {/* Level Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide shadow-md ${getLevelBadge(school.level)}`}>
            {school.level === 'PAUD' ? 'KB' : school.level}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-slate-800 shadow-md border border-white/40">
            {school.status}
          </span>
        </div>

        {/* Accreditation */}
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border shadow-md bg-white/95 ${getAkreditasiColor(school.akreditasi)}`}>
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Akreditasi {school.akreditasi}</span>
          </span>
        </div>

        {/* NPSN bottom badge */}
        <div className="absolute bottom-3 left-3 text-[11px] font-mono font-medium text-white bg-slate-900/80 px-2 py-0.5 rounded shadow-sm">
          NPSN: {school.npsn}
        </div>
      </div>

      {/* Body content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
            {school.name}
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">Kepsek: <span className="font-semibold text-slate-800">{school.headmaster}</span></span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span className="line-clamp-1 text-slate-500">{school.address}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>{school.studentsCount} Murid</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>{school.teachersCount} Guru</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
