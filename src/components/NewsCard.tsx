import React from 'react';
import { NewsArticle } from '../types';
import { useApp } from '../context/AppContext';
import { Calendar, Eye, ArrowRight, User, Clock } from 'lucide-react';
import { getArticleReadingStats } from '../lib/readingTime';

interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const { setSelectedNews } = useApp();
  const readStats = getArticleReadingStats(article);

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'Kedinasan':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Prestasi':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SD':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'TK/PAUD':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <article className="card-deferred bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedNews(article)}>
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shadow-sm ${getCategoryBadge(article.category)}`}>
            {article.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2.5">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.date}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.views} dilihat</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500 font-medium" title={readStats.detailed}>
              <Clock className="w-3.5 h-3.5 text-purple-500" />
              <span>{readStats.text}</span>
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => setSelectedNews(article)}
            className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer"
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {article.summary}
          </p>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <User className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate max-w-[120px]">{article.author}</span>
          </div>

          <button
            onClick={() => setSelectedNews(article)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
