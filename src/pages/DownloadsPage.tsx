import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Download, 
  Search, 
  Filter, 
  FileText, 
  FileSpreadsheet, 
  ChevronRight, 
  HardDriveDownload, 
  Clock,
  Calendar,
  RotateCcw,
  ArrowRight,
  X
} from 'lucide-react';
import { getDocumentDetailPath } from '../lib/documentHelper';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const DownloadsPage: React.FC = () => {
  const { documents, setSelectedDocument, documentCategories } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'ALL' || doc.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [documents, searchQuery, selectedCategory]);

  const categories = useMemo(() => {
    const list = [{ id: 'ALL', label: 'Semua Dokumen' }];
    documentCategories.forEach((cat) => {
      let label = cat;
      if (cat === 'Kurikulum') label = 'Kurikulum Merdeka';
      else if (cat === 'Blanko GTK') label = 'Blanko Administrasi GTK';
      else if (cat === 'Juknis Lomba') label = 'Juknis Lomba & O2SN';
      list.push({ id: cat, label });
    });
    return list;
  }, [documentCategories]);

  const renderFileBadge = (fileType: string) => {
    const typeUpper = (fileType || '').toUpperCase();
    if (typeUpper.includes('PDF')) {
      return (
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-rose-50 to-red-100/70 border border-rose-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 32 38" className="w-6 h-7.5 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34 0 0 1.34 0 3V35C0 36.66 1.34 38 3 38H29C30.66 38 32 36.66 32 35V10L22 0H3Z" fill="#EF4444" />
            <path d="M22 0V10H32L22 0Z" fill="#DC2626" />
            <text x="16" y="25" fill="white" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.3">PDF</text>
          </svg>
        </div>
      );
    }
    if (typeUpper.includes('XLS')) {
      return (
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100/70 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 32 38" className="w-6 h-7.5 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34 0 0 1.34 0 3V35C0 36.66 1.34 38 3 38H29C30.66 38 32 36.66 32 35V10L22 0H3Z" fill="#10B981" />
            <path d="M22 0V10H32L22 0Z" fill="#059669" />
            <text x="16" y="25" fill="white" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">XLS</text>
          </svg>
        </div>
      );
    }
    if (typeUpper.includes('DOC')) {
      return (
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100/70 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 32 38" className="w-6 h-7.5 drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34 0 0 1.34 0 3V35C0 36.66 1.34 38 3 38H29C30.66 38 32 36.66 32 35V10L22 0H3Z" fill="#2563EB" />
            <path d="M22 0V10H32L22 0Z" fill="#1D4ED8" />
            <rect x="7" y="16" width="18" height="2" rx="1" fill="white" />
            <rect x="7" y="21" width="18" height="2" rx="1" fill="white" />
            <rect x="7" y="26" width="13" height="2" rx="1" fill="white" />
            <rect x="7" y="31" width="9" height="2" rx="1" fill="white" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-50 to-sky-100/70 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
        <FileText className="w-6 h-6 text-blue-600" />
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Pusat Unduhan Dokumen & Formulir
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Unduh modul ajar Kurikulum Merdeka, format blanko SKP, juknis perlombaan, dan format permohonan mutasi siswa resmi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Main Container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6 -mt-8 sm:-mt-10 relative z-20">
        
        {/* Filter and Search Box (Desain Modern Sesuai Gambar 2) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 lg:p-6 border border-blue-100/90 shadow-lg shadow-blue-500/5 space-y-3.5 sm:space-y-4">
          {/* Top Search Bar */}
          <div className="flex items-center bg-white rounded-2xl sm:rounded-full border border-blue-200/90 p-1.5 sm:p-2 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 transition-all gap-2">
            {/* Left Blue Icon Box */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
              <Search className="w-5 h-5 text-white stroke-[2.5]" />
            </div>

            {/* Input Field */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokumen, modul, juknis, atau nomor surat..."
              className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-2.5 bg-transparent text-slate-800 placeholder:text-slate-400 text-xs sm:text-sm font-medium outline-none"
            />

            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Right Cari Button */}
            <button
              type="button"
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/25 shrink-0 transition-all cursor-pointer active:scale-95"
            >
              <span>Cari</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Categories Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Filter Label Pill */}
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50/80 text-blue-700 font-bold text-xs border border-blue-200/70 shadow-2xs">
                <Filter className="w-3.5 h-3.5" />
                <span>Kategori</span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                        : 'bg-blue-50/80 hover:bg-blue-100/80 text-blue-700 border border-blue-200/60 shadow-2xs font-semibold'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Button */}
            {(searchQuery || selectedCategory !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors py-1.5 px-3 rounded-full hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-200"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-3">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="relative bg-white rounded-2xl sm:rounded-[22px] p-3.5 sm:p-4 md:py-3.5 md:px-5 border border-blue-100/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Top-Left Corner Diagonal Stripes Accent */}
                <svg 
                  className="absolute top-0 left-0 w-12 sm:w-14 h-12 sm:h-14 pointer-events-none z-0" 
                  viewBox="0 0 56 56" 
                  fill="none"
                >
                  <path d="M-6 24 L24 -6 L34 -6 L-6 34 Z" fill="#38BDF8" opacity="0.65" />
                  <path d="M-6 40 L40 -6 L48 -6 L-6 48 Z" fill="#2563EB" opacity="0.9" />
                </svg>

                {/* Bottom-Right Corner Wave Accent */}
                <svg 
                  className="absolute bottom-0 right-0 w-28 sm:w-40 h-14 sm:h-18 pointer-events-none z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300" 
                  viewBox="0 0 160 70" 
                  fill="none"
                >
                  <path d="M160 70 L60 70 C85 50 120 35 160 12 Z" fill={`url(#docWave1-${doc.id})`} />
                  <path d="M160 70 L95 70 C115 55 135 45 160 32 Z" fill={`url(#docWave2-${doc.id})`} />
                  <defs>
                    <linearGradient id={`docWave1-${doc.id}`} x1="60" y1="70" x2="160" y2="12" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#38BDF8" stopOpacity="0.45" />
                      <stop offset="1" stopColor="#0284C7" stopOpacity="0.1" />
                    </linearGradient>
                    <linearGradient id={`docWave2-${doc.id}`} x1="95" y1="70" x2="160" y2="32" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#2563EB" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#38BDF8" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Left Section: File Badge + Content */}
                <div className="relative z-10 flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
                  <a
                    href={getDocumentDetailPath(doc)}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDocument(doc);
                    }}
                    className="shrink-0 cursor-pointer block"
                    title="Buka rincian dokumen"
                  >
                    {renderFileBadge(doc.fileType)}
                  </a>

                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Meta Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {/* Category Pill */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wide bg-blue-600 text-white shadow-xs">
                        {doc.category}
                      </span>

                      {/* Official Circular Badge */}
                      {doc.id.startsWith('doc-ann-') && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Surat Edaran Resmi
                        </span>
                      )}

                      {/* File Format & Size */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5">
                        <span>{doc.fileType}</span>
                        <span className="text-blue-300">•</span>
                        <span>{doc.fileSize}</span>
                      </span>

                      {/* Date Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-slate-500 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{doc.date}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <a
                      href={getDocumentDetailPath(doc)}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedDocument(doc);
                      }}
                      className="block font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors cursor-pointer leading-snug"
                    >
                      {doc.title}
                    </a>

                    {/* Description Preview */}
                    {doc.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 sm:line-clamp-2 leading-relaxed max-w-3xl">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Section: Download Count, CTA Button, & Dot Matrix */}
                <div className="relative z-10 flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Download Count */}
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1.5">
                    <HardDriveDownload className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.downloadCount} kali diunduh</span>
                  </span>

                  {/* CTA Button */}
                  <a
                    href={getDocumentDetailPath(doc)}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDocument(doc);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 transition-all"
                  >
                    <span>Buka Berkas</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                  {/* Decorative Dot Matrix on Far Right */}
                  <div className="hidden lg:grid grid-cols-3 gap-1 opacity-35 shrink-0 pointer-events-none select-none pl-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <Download className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                Dokumen Tidak Ditemukan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Silakan cari dengan kata kunci lain atau pilih kategori Semua.
              </p>
            </div>
          )}
        </div>

      </section>
    </div>
  );
};
