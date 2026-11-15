import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Camera, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Info,
  Calendar,
  School as SchoolIcon,
  Tag,
  FolderOpen,
  Folder,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { 
  getPublicGalleryWebAppUrl, 
  submitPublicPhotoToSheet,
  PublicGallerySubmitPayload 
} from '../services/publicGallerySheetService';
import { isGoogleDriveFolderUrl, extractGoogleDriveFolderId } from '../lib/driveHelper';

const PHOTO_CATEGORIES = [
  'Kegiatan',
  'Upacara',
  'Kegiatan Belajar',
  'Seni & Budaya',
  'Olahraga',
  'Pramuka',
  'Lomba & Prestasi',
  'Peringatan Hari Besar',
  'Rakor & Pelatihan',
  'Lainnya'
];

export const PhotoUploadPage: React.FC = () => {
  const { setActiveTab, setGalleryActiveTab, schools, showToast, refreshGalleryFromSheet } = useApp();

  // State Form
  const [title, setTitle] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState('Kegiatan');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<PublicGallerySubmitPayload | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Upload Foto Kegiatan Pendidikan - Korwilcam Purwodadi';
  }, []);

  // Validasi format link Google Drive Folder
  const isValidDriveFolder = useMemo(() => {
    if (!driveFolderUrl.trim()) return false;
    return isGoogleDriveFolderUrl(driveFolderUrl) || extractGoogleDriveFolderId(driveFolderUrl) !== null || driveFolderUrl.includes('drive.google.com');
  }, [driveFolderUrl]);

  // Daftar nama sekolah unik untuk auto-suggest
  const schoolSuggestions = useMemo(() => {
    if (!schools || schools.length === 0) return [];
    return Array.from(new Set(schools.map((s) => s.name).filter(Boolean))).sort();
  }, [schools]);

  const handleResetForm = () => {
    setTitle('');
    setDriveFolderUrl('');
    setEventDate('');
    setCategory('Kegiatan');
    setCustomCategory('');
    setDescription('');
    setSchoolName('');
  };

  const handleBackToGallery = () => {
    setGalleryActiveTab('photo');
    setActiveTab('gallery', '/galeri');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Wajib
    if (!title.trim()) {
      showToast('Harap isi Judul Foto Kegiatan!', 'error');
      return;
    }
    if (!driveFolderUrl.trim()) {
      showToast('Harap isi Tautan Link Folder Foto (Google Drive)!', 'error');
      return;
    }
    if (!isValidDriveFolder) {
      showToast('Tautan harus berupa link Google Drive (folder penyimpanan foto).', 'error');
      return;
    }
    if (!schoolName.trim()) {
      showToast('Harap isi Nama Satuan Pendidikan / Lembaga!', 'error');
      return;
    }

    const currentUrl = getPublicGalleryWebAppUrl();
    if (!currentUrl) {
      showToast('Sistem pengiriman foto sedang dipersiapkan oleh Pengelola. Silakan coba sesaat lagi.', 'info');
      return;
    }

    const effectiveCategory = category === 'Lainnya' ? (customCategory.trim() || 'Kegiatan') : category;

    const payload: PublicGallerySubmitPayload = {
      title: title.trim(),
      driveFolderUrl: driveFolderUrl.trim(), // Tersimpan di Kolom C Spreadsheet sesuai permintaan
      eventDate: eventDate.trim() || 'November 2026',
      category: effectiveCategory,
      description: description.trim() || `Dokumentasi foto kegiatan ${title.trim()} di lingkungan Korwilcam Purwodadi.`,
      schoolName: schoolName.trim()
    };

    setIsSubmitting(true);

    try {
      const result = await submitPublicPhotoToSheet(payload);
      if (result.success) {
        setSubmittedData(payload);
        setIsSuccess(true);
        showToast(result.message || 'Foto dokumentasi berhasil diajukan dan sedang menunggu persetujuan admin!', 'success');
        refreshGalleryFromSheet();
      } else {
        showToast(result.message || 'Gagal mengajukan dokumentasi foto.', 'error');
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
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Top navigation action: Bersih, hanya tombol kembali */}
          <div className="flex items-center justify-start mb-6">
            <button
              type="button"
              onClick={handleBackToGallery}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Galeri Foto</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm text-white">
              Unggah Foto Kegiatan Pendidikan
            </h1>
            <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
              Formulir pengusulan dan penambahan arsip foto kegiatan sekolah di lingkungan Korwilcam Bidang Pendidikan Kecamatan Purwodadi.
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
                Data Foto Berhasil Terkirim!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Terima kasih, dokumentasi foto kegiatan dari <span className="font-semibold text-slate-800">{submittedData.schoolName}</span> telah berhasil masuk ke Database Korwilcam dan menunggu persetujuan admin.
              </p>
            </div>

            {/* Ringkasan Data */}
            <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Judul Foto:</span>
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
                <span className="text-slate-500">Folder Google Drive:</span>
                <a 
                  href={submittedData.driveFolderUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline truncate max-w-xs"
                >
                  {submittedData.driveFolderUrl}
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
                + Unggah Foto Lainnya
              </button>
              <button
                type="button"
                onClick={handleBackToGallery}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Lihat di Galeri Foto →
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Pengisian Data */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kartu 1: Informasi Dokumentasi & Tautan Google Drive */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    1. Informasi Dokumentasi & Tautan Google Drive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Judul foto kegiatan, tautan folder Google Drive penyimpanan foto, dan kategori
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Kolom B: Judul Dokumentasi Foto */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Judul Foto Dokumentasi Kegiatan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Upacara Hari Pahlawan SDN 3 Kandangan"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Kolom C: Link Folder Google Drive */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tautan Link Folder Foto (Google Drive)</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={driveFolderUrl}
                    onChange={(e) => setDriveFolderUrl(e.target.value)}
                    placeholder="Contoh: https://drive.google.com/drive/folders/1wGtMzEkBeawdAtehkk..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />

                  {/* Pratinjau Folder Google Drive */}
                  {driveFolderUrl && (
                    <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Folder className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-600 text-white">
                            Google Drive
                          </span>
                          <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Tautan Folder {isValidDriveFolder ? 'Terverifikasi' : 'Terdeteksi'}</span>
                          </p>
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {driveFolderUrl}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Petunjuk Berbagi Google Drive */}
                  <div className="mt-2 p-3 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2.5 text-xs text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Penting:</strong> Pastikan opsi berbagi folder Google Drive diatur ke <strong>"Siapa saja yang memiliki link"</strong> dengan akses <strong>"Pelihat (Viewer)"</strong> agar foto dapat dimuat dan dilihat oleh publik.
                    </p>
                  </div>
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
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {PHOTO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {category === 'Lainnya' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Masukkan nama kategori kegiatan..."
                      className="w-full mt-2 px-3.5 py-2 text-xs sm:text-sm bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  )}
                </div>

                {/* Kolom D: Tanggal Kegiatan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tanggal / Waktu Pelaksanaan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Contoh: 10 November 2026 atau 10/11/2026"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
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
                    list="photo-school-suggestions"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SDN 3 Kandangan atau Kwarran Purwodadi"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <datalist id="photo-school-suggestions">
                    {schoolSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                    <option value="Kwarran Purwodadi" />
                    <option value="PGRI Cabang Purwodadi" />
                    <option value="Humas Korwilcam Purwodadi" />
                  </datalist>
                </div>

                {/* Kolom F: Deskripsi Foto */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Deskripsi Ringkas Dokumentasi Foto</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{description.length}/500 karakter</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tuliskan keterangan ringkas mengenai kegiatan yang didokumentasikan di dalam album foto ini..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition resize-none"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan ke Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Data Foto Sekarang</span>
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
