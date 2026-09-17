import React from 'react';
import { Announcement } from '../types';
import { 
  Megaphone, 
  Calendar, 
  Download, 
  ExternalLink, 
  ChevronRight 
} from 'lucide-react';

// 1. Ilustrasi Dokumen dengan Checkmark Melingkar
const IllustrationDocCheck: React.FC = () => (
  <svg
    viewBox="0 0 80 80"
    className="w-16 h-16 sm:w-20 sm:h-20 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft sky-blue glow backdrop */}
    <ellipse cx="40" cy="46" rx="34" ry="26" fill="#e0f2fe" opacity="0.7" />

    {/* Back tilted paper sheet */}
    <rect 
      x="16" 
      y="14" 
      width="36" 
      height="48" 
      rx="6" 
      fill="#bfdbfe" 
      opacity="0.65" 
      transform="rotate(-8 16 14)" 
    />

    {/* Front white paper sheet */}
    <rect 
      x="20" 
      y="16" 
      width="38" 
      height="50" 
      rx="7" 
      fill="#ffffff" 
      stroke="#93c5fd" 
      strokeWidth="1.8" 
    />
    <rect 
      x="20" 
      y="16" 
      width="38" 
      height="50" 
      rx="7" 
      fill="url(#doc1Grad)" 
      opacity="0.12" 
    />

    {/* Document lines */}
    <line x1="28" y1="28" x2="48" y2="28" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    <line x1="28" y1="35" x2="51" y2="35" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    <line x1="28" y1="42" x2="45" y2="42" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    <line x1="28" y1="49" x2="41" y2="49" stroke="#bfdbfe" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />

    {/* Circular Checkmark Badge */}
    <circle cx="53" cy="56" r="12" fill="#2563eb" />
    <circle cx="53" cy="56" r="11" fill="url(#badgeGrad1)" />
    <path 
      d="M48 56.5 L51.5 60 L58 53" 
      stroke="#ffffff" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    <defs>
      <linearGradient id="doc1Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="badgeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Ilustrasi Dokumen BOSP dengan Badge Shield
const IllustrationBospShield: React.FC = () => (
  <svg
    viewBox="0 0 80 80"
    className="w-16 h-16 sm:w-20 sm:h-20 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft sky-blue glow backdrop */}
    <ellipse cx="40" cy="46" rx="34" ry="26" fill="#e0f2fe" opacity="0.7" />

    {/* Front white paper sheet */}
    <rect 
      x="18" 
      y="15" 
      width="40" 
      height="52" 
      rx="7" 
      fill="#ffffff" 
      stroke="#93c5fd" 
      strokeWidth="1.8" 
    />
    <rect 
      x="18" 
      y="15" 
      width="40" 
      height="52" 
      rx="7" 
      fill="url(#doc2Grad)" 
      opacity="0.12" 
    />

    {/* BOSP text label */}
    <text 
      x="37" 
      y="37" 
      textAnchor="middle" 
      fill="#2563eb" 
      fontSize="11.5" 
      fontWeight="900" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      letterSpacing="0.8"
    >
      BOSP
    </text>

    {/* Document lines below text */}
    <line x1="26" y1="46" x2="48" y2="46" stroke="#60a5fa" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />
    <line x1="26" y1="53" x2="43" y2="53" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" opacity="0.8" />

    {/* Shield Checkmark Badge */}
    <path 
      d="M44 48 C44 48 54 44 54 44 C54 44 64 48 64 48 C64 57 59 65 54 69 C49 65 44 57 44 48 Z" 
      fill="url(#shieldGrad)" 
      stroke="#ffffff" 
      strokeWidth="1.5" 
    />
    <path 
      d="M49 56 L53 60 L59 53" 
      stroke="#ffffff" 
      strokeWidth="2.4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    <defs>
      <linearGradient id="doc2Grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Ilustrasi Amplop Surat Biru dengan Dokumen & Checkmark
const IllustrationMailCheck: React.FC = () => (
  <svg
    viewBox="0 0 80 80"
    className="w-16 h-16 sm:w-20 sm:h-20 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft sky-blue glow backdrop */}
    <ellipse cx="40" cy="46" rx="34" ry="26" fill="#e0f2fe" opacity="0.7" />

    {/* Peeking White Letter */}
    <rect 
      x="24" 
      y="14" 
      width="32" 
      height="38" 
      rx="5" 
      fill="#ffffff" 
      stroke="#93c5fd" 
      strokeWidth="1.5" 
    />
    <line x1="29" y1="22" x2="46" y2="22" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <line x1="29" y1="28" x2="50" y2="28" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <line x1="29" y1="34" x2="43" y2="34" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

    {/* Blue Envelope Body */}
    <path 
      d="M16 32 L40 48 L64 32 V60 C64 63.5 61.5 66 58 66 H22 C18.5 66 16 63.5 16 60 Z" 
      fill="url(#mailGrad)" 
    />
    
    {/* Upper Flap */}
    <path 
      d="M16 32 L40 48 L64 32" 
      fill="#1d4ed8" 
      opacity="0.85" 
    />
    
    {/* Lower Pocket Creases */}
    <path 
      d="M16 65 L36 45 M64 65 L44 45" 
      stroke="#1e40af" 
      strokeWidth="1.6" 
      opacity="0.4" 
    />

    {/* Circular Checkmark Badge */}
    <circle cx="54" cy="56" r="11" fill="url(#mailBadgeGrad)" stroke="#ffffff" strokeWidth="1.8" />
    <path 
      d="M49.5 56.5 L52.5 59.5 L58.5 53.5" 
      stroke="#ffffff" 
      strokeWidth="2.4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    <defs>
      <linearGradient id="mailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
      <linearGradient id="mailBadgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#0284c7" />
      </linearGradient>
    </defs>
  </svg>
);

export interface AnnouncementCardProps {
  announcement: Announcement;
  index?: number;
  onSelect?: () => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  index = 0,
  onSelect 
}) => {
  // Rotasi ilustrasi sesuai urutan card
  const IllustrationComponent = 
    index % 3 === 0 ? IllustrationDocCheck :
    index % 3 === 1 ? IllustrationBospShield : 
    IllustrationMailCheck;

  // Nama file dan ukuran lampiran
  const fileName = announcement.fileName || announcement.title;
  const fileSize = announcement.fileSize || '2.4 MB';
  const hasFile = Boolean(announcement.fileUrl && announcement.fileUrl !== '#');

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasFile) {
      const link = document.createElement('a');
      link.href = announcement.fileUrl!;
      link.download = announcement.fileName || `${announcement.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(announcement.fileType || 'pdf').toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (onSelect) {
        onSelect();
      }
    }
  };

  return (
    <div 
      onClick={() => onSelect && onSelect()}
      className="group relative bg-white rounded-3xl sm:rounded-[26px] p-5 sm:p-6 border border-blue-100/90 shadow-md shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer space-y-4"
    >
      {/* Top-Right Soft Wave Accent */}
      <svg
        className="absolute top-0 right-0 w-32 h-24 pointer-events-none select-none z-0 opacity-40"
        viewBox="0 0 120 90"
        fill="none"
      >
        <path
          d="M120 0 V65 C105 75 85 65 70 50 C50 30 30 40 0 35 V0 Z"
          fill="url(#annTopRightWave)"
        />
        <defs>
          <linearGradient id="annTopRightWave" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Left Curved Blue Wave */}
      <svg
        className="absolute bottom-0 left-0 w-24 h-16 pointer-events-none select-none z-0"
        viewBox="0 0 100 65"
        fill="none"
      >
        <path
          d="M0 65 L0 20 C12 20 28 28 45 42 C58 52 70 60 90 65 Z"
          fill="url(#annBottomLeftWave)"
        />
        <defs>
          <linearGradient id="annBottomLeftWave" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>

      {/* 1. Top Badges & Date Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
        <div className="flex items-center gap-2">
          {/* Urgency Pill with Megaphone */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50/90 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            <span>{announcement.urgency || 'Penting'}</span>
          </span>

          {/* Target Pill */}
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50/60 text-blue-600 border border-blue-100">
            Target: {announcement.target || 'Semua Satuan'}
          </span>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{announcement.date}</span>
        </div>
      </div>

      {/* 2. Middle Row: Graphic Illustration + Title & Summary */}
      <div className="flex items-start gap-4 py-1 relative z-10">
        {/* Left 3D Vector Illustration */}
        <div className="shrink-0 transition-transform duration-300 group-hover:scale-105 mt-0.5">
          <IllustrationComponent />
        </div>

        {/* Right Title & Description */}
        <div className="min-w-0 flex-1">
          <h4 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
            {announcement.title}
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {announcement.summary}
          </p>
        </div>
      </div>

      {/* 3. Bottom Row: File Attachment Info + Action Button */}
      <div 
        className="pt-3.5 mt-auto flex items-center justify-between gap-3 border-t border-slate-100 relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Attachment Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#ef4444] text-white flex flex-col items-center justify-center font-black text-[9px] shadow-xs shadow-rose-500/20 shrink-0 select-none">
            <span>PDF</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate max-w-[120px] sm:max-w-[170px]" title={fileName}>
              {fileName}
            </p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5">
              PDF • {fileSize}
            </p>
          </div>
        </div>

        {/* Right Action Button */}
        {hasFile ? (
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Berkas</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        ) : (
          <button
            onClick={() => onSelect && onSelect()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 transition-all shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Edaran</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
