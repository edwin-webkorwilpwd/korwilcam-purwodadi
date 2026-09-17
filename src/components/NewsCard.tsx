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

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { setSelectedNews } = useApp();
  const readStats = getArticleReadingStats(article);

  return (
    <article 
      onClick={() => setSelectedNews(article)}
      className="group relative bg-white rounded-3xl sm:rounded-[28px] overflow-hidden border border-blue-100/90 shadow-md shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. Cover Image with Category Badge, Bottom Curve & Blue Leaf Wave */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* Top-Left Category Badge (Graduation Cap + Text in Blue Pill) */}
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1d64ec] text-white shadow-md shadow-blue-900/30 backdrop-blur-xs">
            <GraduationCap className="w-3.5 h-3.5 text-white" />
            <span>{article.category === 'TK/PAUD' ? 'TK/KB' : article.category}</span>
          </span>
        </div>

        {/* Bottom Smooth White Wave Transition */}
        <svg 
          className="absolute bottom-0 left-0 right-0 w-full h-9 sm:h-11 pointer-events-none select-none z-10" 
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
          className="absolute bottom-0 right-0 w-28 sm:w-32 h-20 sm:h-24 pointer-events-none select-none z-20" 
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
          <g transform="translate(68, 30) scale(0.95) rotate(-15)">
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
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata Row: Tanggal | Dilihat | Detik/Menit Baca */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 font-medium">
            {/* Tanggal */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{article.date}</span>
            </div>

            <span className="text-slate-300 font-light">|</span>

            {/* Dilihat */}
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{article.views} dilihat</span>
            </div>

            <span className="text-slate-300 font-light">|</span>

            {/* Durasi Baca */}
            <div className="flex items-center gap-1.5 text-slate-500 font-medium" title={readStats.detailed}>
              <Clock className="w-4 h-4 text-purple-500 shrink-0" />
              <span>{readStats.text}</span>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-black text-slate-900 text-lg sm:text-xl leading-snug group-hover:text-blue-600 transition-colors line-clamp-2"
          >
            {article.title}
          </h3>

          {/* Excerpt / Summary */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
            {stripHtml(article.summary)}
          </p>
        </div>

        {/* Footer: Author Avatar & "Baca Selengkapnya ->" Pill Button */}
        <div 
          className="pt-3 flex items-center justify-between gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Author */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 shadow-2xs">
              <User className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 truncate max-w-[130px] sm:max-w-[180px]">
              {article.author || 'Humas Korwilcam Purwodadi'}
            </span>
          </div>

          {/* Pill CTA Button */}
          <button
            onClick={() => setSelectedNews(article)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <span>Baca Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
