import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  Calendar, 
  Tag, 
  Check, 
  Copy, 
  Download, 
  Printer, 
  Share2, 
  Building, 
  ChevronRight, 
  FileText,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

export const AnnouncementDetailPage: React.FC = () => {
  const { 
    selectedAnnouncement, 
    setSelectedAnnouncement, 
    announcements, 
    officeProfile,
    setActiveTab, 
    showToast 
  } = useApp();

  const [copied, setCopied] = useState(false);

  // Scroll ke paling atas HANYA SEKALI saat pertama kali membuka surat edaran / pengumuman baru
  const lastScrolledAnnouncementIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    if (selectedAnnouncement?.id && lastScrolledAnnouncementIdRef.current !== selectedAnnouncement.id) {
      lastScrolledAnnouncementIdRef.current = selectedAnnouncement.id;
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedAnnouncement?.id]);

  if (!selectedAnnouncement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pengumuman Tidak Ditemukan</h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto">
          Surat edaran atau pengumuman yang Anda cari mungkin telah dipindahkan atau tautan yang dimasukkan keliru.
        </p>
        <button
          onClick={() => {
            setSelectedAnnouncement(null);
            setActiveTab('news', '/berita/pengumuman');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Pengumuman</span>
        </button>
      </div>
    );
  }

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    showToast('Tautan pengumuman berhasil disalin! Siap disebarkan.', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*PENGUMUMAN RESMI KORWILCAM PURWODADI*\n\n` +
      `*${selectedAnnouncement.title}*\n` +
      `Sasaran: ${selectedAnnouncement.target} | Tingkat: ${selectedAnnouncement.urgency}\n\n` +
      `Ringkasan:\n${selectedAnnouncement.summary}\n\n` +
      `Baca isi lengkap & unduh dokumen resminya pada tautan berikut:\n${currentUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = () => {
    if (selectedAnnouncement.fileUrl && selectedAnnouncement.fileUrl !== '#') {
      const link = document.createElement('a');
      link.href = selectedAnnouncement.fileUrl;
      link.download = selectedAnnouncement.fileName || `${selectedAnnouncement.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(selectedAnnouncement.fileType || 'pdf').toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Sedang mengunduh berkas lampiran resmi...', 'info');
    } else {
      showToast('Pengumuman ini tidak menyertakan berkas lampiran fisik terpisah.', 'info');
    }
  };

  // Other announcements recommendation
  const otherAnnouncements = announcements
    .filter((a) => a.id !== selectedAnnouncement.id)
    .slice(0, 3);

  return (
    <article className="min-h-screen bg-slate-50/70 pb-24 animate-in fade-in duration-200 print:bg-white print:pb-0">
      {/* Top Breadcrumbs & Action Bar (Hidden when printing) */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 shadow-xs print:hidden">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb & Back */}
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto py-1">
            <button
              onClick={() => {
                setSelectedAnnouncement(null);
                setActiveTab('news', '/berita/pengumuman');
              }}
              className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Daftar Pengumuman</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="text-slate-400 shrink-0">Warta & Informasi</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-md">
              {selectedAnnouncement.title}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
              title="Salin tautan untuk disebarkan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              title="Bagikan ke WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Kirim ke WA</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors"
              title="Cetak Surat Edaran"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Body */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-8 max-w-5xl mx-auto space-y-8">
        
        {/* Paper Container (Formal Letterhead) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-lg space-y-8 print:border-none print:shadow-none print:p-0">
          
          {/* Official Letterhead (Kop Surat) */}
          <div className="border-b-4 border-double border-slate-900 pb-5 text-center relative">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-700">
                Pemerintah Kabupaten Grobogan
              </span>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-900">
                Dinas Pendidikan
              </h2>
              <h1 className="text-base sm:text-xl font-black uppercase tracking-tight text-blue-950">
                Koordinator Wilayah Kecamatan Bidang Pendidikan
              </h1>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-blue-900">
                Kecamatan Purwodadi
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 max-w-xl mx-auto pt-1 leading-relaxed">
                {officeProfile.address || 'Jl. Gajah Mada No. 12, Purwodadi, Kabupaten Grobogan, Jawa Tengah 58111'}
                <br />
                Pos-el: {officeProfile.email || 'korwilcampurwodadi.pendidikan@gmail.com'} • Kontak: {officeProfile.phone || '085161717170'}
              </p>
            </div>
          </div>

          {/* Letter Meta & Header Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                selectedAnnouncement.urgency === 'Mendesak'
                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                  : selectedAnnouncement.urgency === 'Penting'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                <Tag className="w-3.5 h-3.5" />
                <span>Tingkat: {selectedAnnouncement.urgency}</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                <Building className="w-3.5 h-3.5" />
                <span>Sasaran: {selectedAnnouncement.target}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Diterbitkan: <strong className="text-slate-800">{selectedAnnouncement.date}</strong></span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 block">
              Perihal / Judul Surat Edaran
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-950 leading-tight">
              {selectedAnnouncement.title}
            </h2>
          </div>

          {/* Document Content / Body */}
          <div className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed space-y-4 pt-2">
            <div className="bg-slate-50/90 rounded-2xl p-5 sm:p-6 border border-slate-200/80 font-sans whitespace-pre-line text-slate-800 leading-relaxed shadow-inner">
              {selectedAnnouncement.summary}
            </div>
          </div>

          {/* Download Attachment Callout Card */}
          {selectedAnnouncement.fileUrl && selectedAnnouncement.fileUrl !== '#' ? (
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50/40 rounded-2xl p-5 sm:p-6 border border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:border print:border-slate-300">
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                      {selectedAnnouncement.fileName || 'Berkas Dokumen Lampiran Resmi'}
                    </span>
                    {selectedAnnouncement.fileType && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">
                        {selectedAnnouncement.fileType}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">
                    Ukuran Berkas: <strong className="text-slate-800">{selectedAnnouncement.fileSize || 'Tersedia'}</strong> • Dokumen sah resmi Korwilcam Purwodadi
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadFile}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 hover:shadow-lg transition-all shrink-0 print:hidden"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Lampiran Resmi</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Surat edaran ini merupakan pemberitahuan langsung tanpa lampiran dokumen fisik terpisah.</span>
            </div>
          )}

          {/* Sign-off / Signature Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-slate-700">
            <div className="space-y-1 max-w-sm">
              <span className="font-bold text-slate-900 block">Catatan Informasi:</span>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pengumuman resmi ini diterbitkan melalui Portal Resmi Korwilcam Purwodadi untuk disosialisasikan kepada seluruh Kepala Sekolah, Guru, dan Tenaga Kependidikan terkait.
              </p>
            </div>

            <div className="text-right space-y-1 sm:min-w-[220px]">
              <p>Purwodadi, {selectedAnnouncement.date}</p>
              <p className="font-bold text-slate-900">Koordinator Wilayah Kecamatan</p>
              <p className="font-bold text-slate-900">Bidang Pendidikan Purwodadi</p>
              <div className="h-14"></div>
              <p className="font-black text-slate-950 underline text-sm">
                {officeProfile.korwilName || 'Supriyanto, S.Pd., M.Pd.'}
              </p>
              <p className="text-[11px] text-slate-600 font-mono">
                NIP. {officeProfile.korwilNip || '19720415 199603 1 003'}
              </p>
            </div>
          </div>

        </div>

        {/* Share Section (Social Links & Share to WhatsApp) (Hidden when printing) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>Sebarkan Informasi Pengumuman Ini</span>
              </h3>
              <p className="text-xs text-slate-500">
                Tautan resmi ini dapat disebarkan ke grup WhatsApp Kepala Sekolah, Guru, atau GTK.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-600 font-mono focus:outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
            </button>
          </div>
        </div>

        {/* Other Announcements Recommendation (Hidden when printing) */}
        {otherAnnouncements.length > 0 && (
          <div className="space-y-4 pt-4 print:hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">
                Surat Edaran & Pengumuman Lainnya
              </h3>
              <button
                onClick={() => {
                  setSelectedAnnouncement(null);
                  setActiveTab('news', '/berita/pengumuman');
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>Lihat Semua Pengumuman</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherAnnouncements.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedAnnouncement(item)}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                        {item.target}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {item.summary}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-bold">
                    <span>Buka Edaran</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </article>
  );
};
