import React from 'react';
import { GalleryItem } from '../types';
import { getGalleryDetailPath } from '../lib/galleryHelper';
import { 
  Calendar, 
  Camera, 
  Folder, 
  ArrowRight, 
  User, 
  Images 
} from 'lucide-react';

interface GalleryCardProps {
  item: GalleryItem;
  onClick?: (item: GalleryItem, e: React.MouseEvent) => void;
  className?: string;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({ 
  item, 
  onClick, 
  className = '' 
}) => {
  const photoList = (item.images && item.images.length > 0) 
    ? item.images 
    : (item.image ? [item.image] : []);
  const count = photoList.length || 1;
  const coverImage = item.image || photoList[0] || '';
  const detailUrl = getGalleryDetailPath(item);
  const authorName = item.authorName || 'Super Administrator';
  const subtitle = item.description || `${item.date}. ${item.title}`;

  return (
    <a
      href={detailUrl}
      onClick={(e) => onClick ? onClick(item, e) : undefined}
      className={`group relative bg-white rounded-3xl sm:rounded-[26px] overflow-hidden border border-blue-100/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full cursor-pointer no-underline block focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`}
      title={`Buka album: ${item.title}`}
    >
      {/* 1. Cover Photo Stage */}
      <div className="relative h-56 sm:h-60 bg-slate-950 overflow-hidden">
        <img
          src={coverImage}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
        />
        {/* Subtle Dark Vignette / Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Category Badge - Top Left */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-md flex items-center gap-1.5">
            <Images className="w-3.5 h-3.5" />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Photo Counter Badge - Top Right */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-slate-800 shadow-md flex items-center gap-1.5 border border-white/80">
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>{count} Foto</span>
          </span>
        </div>

        {/* Date Display - Bottom Left */}
        <div className="absolute bottom-3.5 left-4 z-10 flex items-center gap-1.5 text-xs font-semibold text-white drop-shadow-md">
          <Calendar className="w-3.5 h-3.5 text-white/90" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* 2. Middle Details (Title & Subtitle with Vertical Blue Bar) */}
      <div className="p-5 sm:px-6 sm:pt-5 sm:pb-3 flex-1 flex flex-col justify-between bg-white relative z-10">
        <div className="flex items-stretch gap-3">
          {/* Vertical Blue Line */}
          <div className="w-1 bg-blue-600 rounded-full shrink-0 self-stretch my-0.5" />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug line-clamp-1 sm:line-clamp-2 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Action & Author Section with Decorative Blue Wave Accent */}
      <div className="relative px-5 pb-5 sm:px-6 sm:pb-5 pt-1 flex items-center justify-between gap-3 overflow-hidden bg-white">
        {/* Organic Curved Blue Wave in Bottom Right Corner */}
        <svg
          className="absolute bottom-0 right-0 w-32 h-20 pointer-events-none select-none z-0"
          viewBox="0 0 130 80"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M130 80 L130 18 C115 18 92 32 70 54 C50 70 25 78 0 80 Z"
            fill={`url(#wave-grad-${item.id})`}
          />
          <defs>
            <linearGradient id={`wave-grad-${item.id}`} x1="130" y1="80" x2="30" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.25" />
            </linearGradient>
          </defs>
        </svg>

        {/* Action Button: Buka Halaman Album */}
        <div className="relative z-10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-50/90 text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors border border-blue-100/80 text-xs font-bold flex items-center gap-1.5 shadow-xs">
          <Folder className="w-3.5 h-3.5 text-blue-600 fill-blue-600/20 shrink-0" />
          <span className="truncate">Buka Halaman Album ({count} Foto)</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform ml-0.5 shrink-0" />
        </div>

        {/* Author Credit */}
        <div className="relative z-10 flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0 max-w-[130px] sm:max-w-[160px] truncate">
          <div className="w-5 h-5 rounded-full bg-slate-100/90 flex items-center justify-center text-slate-500 shrink-0 border border-slate-200/60">
            <User className="w-3 h-3" />
          </div>
          <span className="truncate drop-shadow-xs">{authorName}</span>
        </div>
      </div>
    </a>
  );
};
