import React from 'react';
import { NewsArticle } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Eye, 
  ArrowRight, 
  User, 
  Clock, 
  GraduationCap 
} from 'lucide-react';
import { getArticleReadingStats } from '../lib/readingTime';
import { stripHtml } from '../lib/stripHtml';
import { formatGoogleDriveImageUrl } from '../lib/driveHelper';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { setSelectedNews } = useApp();
  const readStats = getArticleReadingStats(article);

  return (
    <article 
      onClick={() => setSelectedNews(article)}
      className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-100/90 shadow-sm shadow-slate-200/50 hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. Cover Image with Category Badge, Bottom Curve & Blue Leaf Wave */}
      <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={formatGoogleDriveImageUrl(article.image, 600)}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000';
          }}
        />

        {/* Top-Left Category Badge (Graduation Cap + Text in Blue Pill) */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#1d64ec] text-white shadow-md shadow-blue-900/30 backdrop-blur-xs">
            <GraduationCap className="w-3 h-3 text-white" />
            <span>{article.category === 'TK/PAUD' ? 'TK/KB' : article.category}</span>
          </span>
        </div>

        {/* Bottom Smooth White Wave Transition */}
        <svg 
          className="absolute bottom-0 left-0 right-0 w-full h-7 sm:h-8 pointer-events-none select-none z-10" 
          viewBox="0 0 400 45" 
          preserveAspectRatio="none"
          fill="none"
        >
          <path 
            d="M0 45 L0 16 Q120 0 240 20 Q320 32 400 12 L400 45 Z" 
            fill="#ffffff" 
          />
        </svg>

        {/* Bottom-Right Blue Wave with 4-Leaf Botanical Motif */}
        <svg 
          className="absolute bottom-0 right-0 w-20 sm:w-24 h-14 sm:h-16 pointer-events-none select-none z-20" 
          viewBox="0 0 120 90" 
          fill="none"
        >
          {/* Blue wave coming from bottom-right */}
          <path 
            d="M120 90 L0 90 C36 86 66 72 82 50 C96 28 108 12 120 0 Z" 
            fill="url(#blueWaveLeafGrad)" 
          />
          <defs>
            <linearGradient id="blueWaveLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          
          {/* 4 White Leaves Botanical Motif */}
          <g transform="translate(68, 30) scale(0.8) rotate(-15)">
            {/* Central stem */}
            <path d="M10 52 C18 40 25 26 29 8" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            {/* Leaf 1 (bottom left) */}
            <path d="M12 42 C5 39 3 32 8 27 C14 30 15 37 12 42 Z" fill="white" />
            {/* Leaf 2 (middle right) */}
            <path d="M19 35 C27 33 30 26 27 21 C21 23 19 29 19 35 Z" fill="white" />
            {/* Leaf 3 (upper left) */}
            <path d="M21 23 C15 20 14 13 20 10 C24 13 24 19 21 23 Z" fill="white" />
            {/* Leaf 4 (terminal tip) */}
            <path d="M28 9 C29 3 34 1 36 3 C37 7 33 11 28 9 Z" fill="white" />
          </g>
        </svg>
      </div>

      {/* 2. Card Content & Metadata */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Metadata Row: Tanggal | Dilihat | Detik/Menit Baca */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] text-slate-500 font-medium">
            {/* Tanggal */}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-500 shrink-0" />
              <span>{article.date}</span>
            </div>

            <span className="text-slate-300 font-light">|</span>

            {/* Dilihat */}
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-500 shrink-0" />
              <span>{article.views}</span>
            </div>

            <span className="text-slate-300 font-light">|</span>

            {/* Durasi Baca */}
            <div className="flex items-center gap-1 text-slate-500 font-medium" title={readStats.detailed}>
              <Clock className="w-3 h-3 text-purple-500 shrink-0" />
              <span>{readStats.text}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-bold text-slate-900 text-xs sm:text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2"
          >
            {article.title}
          </h3>

          {/* Excerpt / Summary */}
          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2">
            {stripHtml(article.summary)}
          </p>
        </div>

        {/* Footer: Author Avatar & "Baca ->" Pill Button */}
        <div 
          className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Author */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
              <User className="w-3 h-3 text-blue-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-700 truncate max-w-[85px] sm:max-w-[120px]">
              {article.author || 'Humas Korwilcam'}
            </span>
          </div>

          {/* Pill CTA Button */}
          <button
            onClick={() => setSelectedNews(article)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-[11px] shadow-sm hover:shadow-md active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Baca</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};
