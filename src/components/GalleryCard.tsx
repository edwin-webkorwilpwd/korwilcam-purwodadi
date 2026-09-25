import React from 'react';
import { GalleryItem } from '../types';
import { getGalleryDetailPath } from '../lib/galleryHelper';
import { isGoogleDriveFolderUrl, formatGoogleDriveImageUrl, extractGalleryMetadata } from '../lib/driveHelper';
import { 
  Calendar, 
  Camera, 
  Folder, 
  ArrowRight, 
  User, 
  Images,
  ExternalLink 
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
  const meta = extractGalleryMetadata(item.description || '');
  const cleanDescription = meta.cleanDescription || item.description;
  const photoList = (item.images && item.images.length > 0) 
    ? item.images 
    : (meta.images && meta.images.length > 0 ? meta.images : (item.image ? [item.image] : []));
  const count = photoList.length || 1;
  const isDriveAlbum = Boolean(item.driveFolderUrl || meta.driveFolderUrl || isGoogleDriveFolderUrl(item.image));
  const hasValidCoverImage = Boolean(item.image && !isGoogleDriveFolderUrl(item.image) && !item.image.includes('/drive/folders'));
  const coverImage = hasValidCoverImage 
    ? formatGoogleDriveImageUrl(item.image, 600) 
    : (photoList[0] && !isGoogleDriveFolderUrl(photoList[0]) ? formatGoogleDriveImageUrl(photoList[0], 600) : '');
  const detailUrl = getGalleryDetailPath(item);
  const authorName = item.authorName || 'Super Administrator';
  const subtitle = cleanDescription || `${item.date}. ${item.title}`;

  return (
    <a
      href={detailUrl}
      onClick={(e) => onClick ? onClick(item, e) : undefined}
      className={`group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-100/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer no-underline block focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${className}`}
      title={`Buka album: ${item.title}`}
    >
      {/* 1. Cover Photo Stage */}
      <div className="relative h-40 sm:h-44 bg-slate-950 overflow-hidden">
        {coverImage ? (
          <>
            <img
              src={coverImage}
              alt={item.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
            />
            {/* Subtle Dark Vignette / Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1b56ce] via-[#163fa8] to-[#0f172a] p-3.5 flex flex-col justify-between relative group-hover:scale-105 transition-transform duration-700">
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-amber-400/15 blur-xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xs">
                <Folder className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white/20 text-white border border-white/30 backdrop-blur-md flex items-center gap-1">
                <span>Google Drive</span>
              </span>
            </div>

            <div className="relative z-10 space-y-0.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-blue-200">Album Foto Cloud</span>
              <p className="text-xs font-bold text-white line-clamp-2 leading-snug drop-shadow-xs">
                {item.title}
              </p>
            </div>
          </div>
        )}

        {/* Category Badge - Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-md flex items-center gap-1">
            <Images className="w-3 h-3" />
            <span>{item.category}</span>
          </span>
        </div>

        {/* Badge - Top Right */}
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-extrabold bg-blue-600 text-white shadow-md flex items-center gap-1 border border-white/40">
            <Camera className="w-3 h-3 text-white" />
            <span>{count} Foto</span>
          </span>
        </div>

        {/* Date Display - Bottom Left */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-white drop-shadow-md">
          <Calendar className="w-3 h-3 text-white/90" />
          <span>{item.date}</span>
        </div>
      </div>

      {/* 2. Middle Details (Title & Subtitle with Vertical Blue Bar) */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white relative z-10">
        <div className="flex items-stretch gap-2.5">
          {/* Vertical Blue Line */}
          <div className="w-1 bg-blue-600 rounded-full shrink-0 self-stretch my-0.5" />
          
          <div className="flex-1 min-w-0">
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
        {/* Organic Curved Blue Wave in Bottom Right Corner */}
        <svg
          className="absolute bottom-0 right-0 w-24 h-16 pointer-events-none select-none z-0"
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
        <div className="relative z-10 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-blue-50/90 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all border border-blue-100/80 text-[11px] font-bold flex items-center gap-1 shadow-2xs shrink-0">
          <Folder className="w-3 h-3 text-blue-600 group-hover:text-white fill-blue-600/20 shrink-0 transition-colors" />
          <span>Buka Album</span>
          <ArrowRight className="w-3 h-3 text-blue-600 group-hover:text-white group-hover:translate-x-0.5 transition-all ml-0.5 shrink-0" />
        </div>

        {/* Author Credit */}
        <div className="relative z-10 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium shrink min-w-0">
          <div className="w-4.5 h-4.5 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/60">
            <User className="w-2.5 h-2.5" />
          </div>
          <span className="truncate">{authorName}</span>
        </div>
      </div>
    </a>
  );
};
