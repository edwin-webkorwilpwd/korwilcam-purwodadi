import React from 'react';
import { GalleryVideoItem } from '../types';
import { getVideoDetailPath } from '../lib/youtubeHelper';
import { 
  Calendar, 
  Play, 
  ArrowRight, 
  User, 
  Video,
  Film,
  Building2
} from 'lucide-react';

interface VideoGalleryCardProps {
  item: GalleryVideoItem;
  onClick?: (item: GalleryVideoItem, e: React.MouseEvent) => void;
  className?: string;
}

export const VideoGalleryCard: React.FC<VideoGalleryCardProps> = ({ 
  item, 
  onClick, 
  className = '' 
}) => {
  const detailUrl = getVideoDetailPath(item);
  const subtitle = item.description || `${item.date}. ${item.title}`;

  return (
    <a
      href={detailUrl}
      onClick={(e) => onClick ? onClick(item, e) : undefined}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-100/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer no-underline block focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`}
      title={`Tonton video: ${item.title}`}
    >
      {/* 1. Cover Thumbnail Stage */}
      <div className="relative h-40 sm:h-44 bg-slate-950 overflow-hidden">
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/gallery/cover-7-agustus-2026.jpg';
          }}
        />

        {/* Subtle Dark Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/20 to-black/40 pointer-events-none" />

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-all duration-300 backdrop-blur-xs ring-4 ring-white/30">
            <Play className="w-5 h-5 fill-white translate-x-0.5" />
          </div>
        </div>

        {/* Category Badge - Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-md flex items-center gap-1">
            <Film className="w-3 h-3" />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Badge Video - Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-red-600 text-white shadow-md flex items-center gap-1 border border-white/40">
            <Video className="w-3 h-3 text-white" />
            <span>Video</span>
          </span>
        </div>

        {/* Date Display - Bottom Left */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          <Calendar className="w-3 h-3 text-white/90" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* 2. Middle Details (Title & Subtitle with Vertical Accent Bar) */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white relative z-10">
        <div className="flex items-stretch gap-2.5">
          {/* Vertical Accent Line */}
          <div className="w-1 bg-blue-600 group-hover:bg-red-600 rounded-full shrink-0 self-stretch my-0.5 transition-colors" />
          
          <div className="flex-1 min-w-0">
            {item.schoolName ? (
              <span className="text-[10px] font-extrabold text-blue-600 line-clamp-1 flex items-center gap-1 mb-0.5 tracking-tight">
                <Building2 className="w-2.5 h-2.5 shrink-0" />
                <span className="truncate">{item.schoolName}</span>
              </span>
            ) : null}
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action & Author Section with Decorative Blue Wave Accent */}
      <div className="relative px-3.5 pb-3.5 sm:px-4 sm:pb-4 pt-1 flex items-center justify-between gap-2 overflow-hidden bg-white">
        {/* Organic Curved Blue Wave in Bottom Right Corner (Identik 100% dengan Kartu Galeri Foto) */}
        <svg
          className="absolute bottom-0 right-0 w-24 h-16 pointer-events-none select-none z-0"
          viewBox="0 0 130 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M130 80 L130 18 C115 18 92 32 70 54 C50 70 25 78 0 80 Z"
            fill={`url(#vid-wave-${item.id})`}
          />
          <defs>
            <linearGradient id={`vid-wave-${item.id}`} x1="130" y1="80" x2="30" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>

        {/* Action Button: Putar Video */}
        <div className="relative z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-50/90 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all border border-blue-100/80 text-[11px] font-bold flex items-center gap-1 shadow-2xs shrink-0">
          <Play className="w-3 h-3 text-blue-600 group-hover:text-white fill-current shrink-0 transition-colors" />
          <span>Putar Video</span>
          <ArrowRight className="w-3 h-3 text-blue-600 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-0.5 shrink-0" />
        </div>

        {/* Author / School Credit */}
        <div 
          className="relative z-10 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium shrink min-w-0"
          title={item.schoolName || item.authorName || 'Humas Korwilcam'}
        >
          <div className="w-4.5 h-4.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
            {item.schoolName ? <Building2 className="w-2.5 h-2.5 text-blue-600" /> : <User className="w-2.5 h-2.5" />}
          </div>
          <span className="truncate">{item.schoolName || item.authorName || 'Humas Korwilcam'}</span>
        </div>
      </div>
    </a>
  );
};
