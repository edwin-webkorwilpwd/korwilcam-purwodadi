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
  Clock 
} from 'lucide-react';
import { getDocumentDetailPath } from '../lib/documentHelper';

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

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="w-8 h-8 text-rose-500" />;
      case 'XLSX':
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      default:
        return <FileText className="w-8 h-8 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <Download className="w-3.5 h-3.5" />
            <span>Pusat Arsip Digital</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Pusat Unduhan Dokumen & Formulir
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Unduh modul ajar Kurikulum Merdeka, format blanko SKP, juknis perlombaan, dan format permohonan mutasi siswa resmi.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8">
        
        {/* Filter and Search Box */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama dokumen, modul, juknis, atau nomor surat..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Kategori Berkas:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Document List */}
        <div className="space-y-4">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4">
                  <a
                    href={getDocumentDetailPath(doc)}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDocument(doc);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 group-hover:bg-blue-50/70 group-hover:border-blue-200 transition-all cursor-pointer block"
                    title="Buka rincian dokumen"
                  >
                    {getFileIcon(doc.fileType)}
                  </a>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                        {doc.fileType} • {doc.fileSize}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {doc.date}
                      </span>
                    </div>

                    <a
                      href={getDocumentDetailPath(doc)}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedDocument(doc);
                      }}
                      className="block font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors cursor-pointer hover:underline"
                    >
                      {doc.title}
                    </a>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <HardDriveDownload className="w-3.5 h-3.5 text-slate-400" />
                    {doc.downloadCount} kali diunduh
                  </span>

                  <a
                    href={getDocumentDetailPath(doc)}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedDocument(doc);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold border border-blue-200 hover:border-blue-600 transition-all active:scale-95 shadow-sm"
                  >
                    <span>Buka Berkas</span>
                    <ChevronRight className="w-4 h-4" />
                  </a>
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
