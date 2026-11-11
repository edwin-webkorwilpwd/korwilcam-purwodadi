import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Video, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Info,
  Calendar,
  School as SchoolIcon,
  Tag,
  Link2,
  MessageSquare,
  Play
} from 'lucide-react';
import { 
  getVideoWebAppUrl, 
  submitVideoToSheet,
  VideoSubmitPayload 
} from '../services/videoSheetService';
import { extractYouTubeId, getYouTubeThumbnail } from '../lib/youtubeHelper';

const VIDEO_CATEGORIES = [
  'Kegiatan',
  'Upacara',
  'Kegiatan Belajar',
  'Seni & Budaya',
  'Olahraga',
  'Estafet Tunas Kelapa',
  'Pramuka',
  'Lomba & Prestasi',
  'Peringatan Hari Besar',
  'Rapat & Sosialisasi',
  'Lainnya'
];

export const VideoUploadPage: React.FC = () => {
  const { setActiveTab, setGalleryActiveTab, schools, showToast, refreshVideosFromSheet } = useApp();

  // State Form
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('Kegiatan');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<VideoSubmitPayload | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Upload Video Kegiatan Pendidikan - Korwilcam Purwodadi';
  }, []);

  // Ekstrak ID dan thumbnail YouTube jika link valid
  const detectedYoutubeId = useMemo(() => {
    if (!youtubeUrl.trim()) return null;
    return extractYouTubeId(youtubeUrl.trim());
  }, [youtubeUrl]);

  const youtubeThumbnail = useMemo(() => {
    if (!detectedYoutubeId) return null;
    return getYouTubeThumbnail(detectedYoutubeId);
  }, [detectedYoutubeId]);

  // Daftar nama sekolah unik untuk auto-suggest
  const schoolSuggestions = useMemo(() => {
    if (!schools || schools.length === 0) return [];
    return Array.from(new Set(schools.map((s) => s.name).filter(Boolean))).sort();
  }, [schools]);

  const handleResetForm = () => {
    setTitle('');
    setYoutubeUrl('');
    setEventDate('');
    setCategory('Kegiatan');
    setCustomCategory('');
    setDescription('');
    setSchoolName('');
  };

  const handleBackToGallery = () => {
    setGalleryActiveTab('video');
    setActiveTab('gallery', '/galeri');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Wajib
    if (!title.trim()) {
      showToast('Harap isi Judul Video!', 'error');
      return;
    }
    if (!youtubeUrl.trim()) {
      showToast('Harap isi Link Video YouTube!', 'error');
      return;
    }
    if (!detectedYoutubeId) {
      showToast('Format tautan YouTube tidak valid. Harap periksa kembali tautan Anda.', 'error');
      return;
    }
    if (!schoolName.trim()) {
      showToast('Harap isi Nama Sekolah / Organisasi!', 'error');
      return;
    }

    const currentUrl = getVideoWebAppUrl();
    if (!currentUrl) {
      showToast('Sistem pengiriman video sedang dipersiapkan oleh Pengelola. Silakan coba sesaat lagi.', 'info');
      return;
    }

    const effectiveCategory = category === 'Lainnya' ? (customCategory.trim() || 'Kegiatan') : category;

    const payload: VideoSubmitPayload = {
      title: title.trim(),
      youtubeUrl: youtubeUrl.trim(),
      eventDate: eventDate.trim() || 'November 2026',
      category: effectiveCategory,
      description: description.trim() || `Dokumentasi video kegiatan ${title.trim()} di lingkungan Korwilcam Purwodadi.`,
      schoolName: schoolName.trim()
    };

    setIsSubmitting(true);

    try {
      const result = await submitVideoToSheet(payload);
      if (result.success) {
        setSubmittedData(payload);
        setIsSuccess(true);
        showToast(result.message, 'success');
        refreshVideosFromSheet();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      showToast(`Gagal mengirim: ${err?.message || err}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-8 sm:pb-16 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-500/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Top navigation action: Bersih, hanya tombol kembali */}
          <div className="flex items-center justify-start mb-6">
            <button
              type="button"
              onClick={handleBackToGallery}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Galeri Video</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm text-white">
              Unggah Video Kegiatan Pendidikan
            </h1>
            <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
              Formulir pengusulan dan penambahan arsip video kegiatan sekolah di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">

        {/* Tampilan Berhasil Kirim (Success Screen) */}
        {isSuccess && submittedData ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Data Video Berhasil Terkirim!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Terima kasih, video kegiatan dari <span className="font-semibold text-slate-800">{submittedData.schoolName}</span> telah berhasil masuk ke Database Korwilcam.
              </p>
            </div>

            {/* Ringkasan Data */}
            <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Judul Video:</span>
                <span className="font-bold text-slate-900 text-right">{submittedData.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Kategori:</span>
                <span className="font-bold text-blue-600">{submittedData.category}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Asal Satuan / Lembaga:</span>
                <span className="font-bold text-slate-900">{submittedData.schoolName}</span>
              </div>
              {submittedData.eventDate && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Tanggal Kegiatan:</span>
                  <span className="font-semibold text-slate-800">{submittedData.eventDate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Tautan YouTube:</span>
                <a 
                  href={submittedData.youtubeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-red-600 hover:underline truncate max-w-xs"
                >
                  {submittedData.youtubeUrl}
                </a>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setIsSuccess(false);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                + Unggah Video Lainnya
              </button>
              <button
                type="button"
                onClick={handleBackToGallery}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer"
              >
                Lihat di Galeri Video →
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Pengisian Data */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kartu 1: Informasi Video & YouTube */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    1. Informasi Video & Tautan YouTube
                  </h3>
                  <p className="text-xs text-slate-500">
                    Judul video, tautan YouTube, dan kategori
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kolom B: Judul Vidio */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Judul Video Kegiatan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Upacara Hari Pahlawan SDN 3 Kandangan"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                </div>

                {/* Kolom C: Link Vidio Youtube */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-red-600" />
                    <span>Tautan Link Video YouTube</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="Contoh: https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />

                  {/* Pratinjau Thumbnail YouTube Otomatis */}
                  {youtubeThumbnail && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                        <img 
                          src={youtubeThumbnail} 
                          alt="Thumbnail Pratinjau" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tautan YouTube Terverifikasi</span>
                        </p>
                        <p className="text-xs text-slate-600 truncate mt-0.5">
                          ID Video: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200 text-slate-700">{detectedYoutubeId}</code>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Kolom E: Kategori Kegiatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kategori Kegiatan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  >
                    {VIDEO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {category === 'Lainnya' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori kegiatan..."
                      className="w-full mt-2 px-3.5 py-2 text-xs sm:text-sm bg-white border border-red-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    />
                  )}
                </div>

                {/* Kolom D: Tanggal Kegiatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tanggal / Waktu Pelaksanaan</span>
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Contoh: 10 November 2026 atau 10/11/2026"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Kartu 2: Asal Sekolah / Lembaga & Deskripsi */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <SchoolIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    2. Asal Sekolah / Lembaga & Deskripsi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Instansi pelaksana dan penjelasan ringkas kegiatan
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Kolom G: Nama Sekolah / Organisasi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <SchoolIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nama Sekolah / Organisasi / Lembaga</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="video-school-suggestions"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SDN 3 Kandangan atau Kwarran Purwodadi"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition"
                  />
                  <datalist id="video-school-suggestions">
                    {schoolSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                    <option value="Kwarran Purwodadi" />
                    <option value="PGRI Cabang Purwodadi" />
                    <option value="Humas Korwilcam Purwodadi" />
                  </datalist>
                </div>

                {/* Kolom F: Deskripsi Vidio */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Deskripsi Ringkas Video Kegiatan</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{description.length}/500 karakter</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan keterangan ringkas mengenai kegiatan yang didokumentasikan di dalam video ini..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs sm:text-sm font-semibold transition cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bersihkan Formulir</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Data Video Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
