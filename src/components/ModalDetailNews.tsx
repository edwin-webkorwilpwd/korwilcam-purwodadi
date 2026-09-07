import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar, Eye, User, Share2, Tag, BookOpen, Clock } from 'lucide-react';
import { getArticleReadingStats } from '../lib/readingTime';

export const ModalDetailNews: React.FC = () => {
  const { selectedNews, setSelectedNews, showToast } = useApp();

  if (!selectedNews) return null;

  const readStats = getArticleReadingStats(selectedNews);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Tautan berita berhasil disalin ke clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white">
              {selectedNews.category}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Warta & Liputan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Salin Tautan"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setSelectedNews(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            {selectedNews.title}
          </h1>

          {/* Metadata bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{selectedNews.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-500" />
              <span>Oleh: {selectedNews.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-500" />
              <span>{selectedNews.views || 1} Kali Dilihat</span>
            </div>
            <div className="flex items-center gap-1.5 cursor-help" title={readStats.detailed}>
              <Clock className="w-4 h-4 text-purple-500" />
              <span>{readStats.text}</span>
              {readStats.isReal && (
                <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold">
                  Rata-rata riil
                </span>
              )}
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-md aspect-video">
            <img
              src={selectedNews.image}
              alt={selectedNews.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Summary Quote */}
          <div className="p-4 rounded-xl bg-blue-50/80 border-l-4 border-blue-600 text-slate-800 text-sm font-medium italic leading-relaxed">
            "{selectedNews.summary}"
          </div>

          {/* Full Content */}
          {selectedNews.content.includes('<') ? (
            <div 
              className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: selectedNews.content }}
            />
          ) : (
            <div className="space-y-4 text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              {selectedNews.content}
            </div>
          )}

          {/* Tags */}
          {selectedNews.tags && selectedNews.tags.length > 0 && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-slate-400" />
              {selectedNews.tags.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Modal Footer actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Bagikan Berita</span>
            </button>

            <button
              onClick={() => setSelectedNews(null)}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
