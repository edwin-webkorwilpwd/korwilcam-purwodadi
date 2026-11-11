import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Trophy, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Info,
  Calendar,
  School as SchoolIcon,
  User,
  GraduationCap,
  Medal,
  Award,
  Link2,
  MessageSquare
} from 'lucide-react';
import { 
  getPrestasiWebAppUrl, 
  submitAchievementToSheet,
  AchievementSubmitPayload 
} from '../services/achievementSheetService';

const JENJANG_OPTIONS = [
  'Kecamatan',
  'Kabupaten',
  'Provinsi',
  'Nasional',
  'Internasional'
];

const PERINGKAT_OPTIONS = [
  'Juara 1',
  'Juara 2',
  'Juara 3',
  'Juara Harapan 1',
  'Juara Harapan 2',
  'Juara Harapan 3',
  'Juara Favorit',
  'Medali Emas',
  'Medali Perak',
  'Medali Perunggu'
];

export const AchievementUploadPage: React.FC = () => {
  const { setActiveTab, schools, showToast, refreshAchievements } = useApp();

  // State Form
  const [title, setTitle] = useState('');
  const [level, setLevel] = useState('Kecamatan');
  const [rank, setRank] = useState('Juara 1');
  const [customRank, setCustomRank] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [recipientName, setRecipientName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [mentorName, setMentorName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<AchievementSubmitPayload | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = 'Upload Data Prestasi Siswa & Guru - Korwilcam Purwodadi';
  }, []);

  // Daftar nama sekolah unik untuk auto-suggest
  const schoolSuggestions = useMemo(() => {
    if (!schools || schools.length === 0) return [];
    return Array.from(new Set(schools.map((s) => s.name).filter(Boolean))).sort();
  }, [schools]);

  const handleResetForm = () => {
    setTitle('');
    setLevel('Kecamatan');
    setRank('Juara 1');
    setCustomRank('');
    setYear(new Date().getFullYear());
    setRecipientName('');
    setSchoolName('');
    setMentorName('');
    setEventDate('');
    setPhotoUrl('');
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Wajib
    if (!title.trim()) {
      showToast('Harap isi Nama Perlombaan!', 'error');
      return;
    }
    if (!recipientName.trim()) {
      showToast('Harap isi Nama Lengkap Siswa / Guru!', 'error');
      return;
    }
    if (!schoolName.trim()) {
      showToast('Harap isi Asal Sekolah!', 'error');
      return;
    }

    const currentUrl = getPrestasiWebAppUrl();
    if (!currentUrl) {
      showToast('Sistem pengiriman data sedang dipersiapkan oleh Pengelola. Silakan coba kembali sesaat lagi.', 'info');
      return;
    }

    const effectiveRank = rank === 'Lainnya' ? (customRank.trim() || 'Peserta') : rank;

    const payload: AchievementSubmitPayload = {
      title: title.trim(),
      level: level.trim(),
      rank: effectiveRank,
      year: Number(year) || new Date().getFullYear(),
      recipientName: recipientName.trim(),
      schoolName: schoolName.trim(),
      mentorName: mentorName.trim(),
      eventDate: eventDate.trim(),
      photoUrl: photoUrl.trim(),
      description: description.trim()
    };

    setIsSubmitting(true);

    try {
      const result = await submitAchievementToSheet(payload);
      if (result.success) {
        setSubmittedData(payload);
        setIsSuccess(true);
        showToast(result.message, 'success');
        refreshAchievements?.();
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
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none transform -translate-x-1/4 translate-y-1/4" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Top navigation action: Bersih, hanya tombol kembali */}
          <div className="flex items-center justify-start mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('achievements', '/berita/prestasi')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-semibold backdrop-blur-md transition-all shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Prestasi</span>
            </button>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm text-white">
              Unggah Data Prestasi Siswa & Guru
            </h1>
            <p className="max-w-2xl mx-auto text-blue-100 text-xs sm:text-sm leading-relaxed">
              Data yang diunggah melalui formulir ini akan otomatis tersimpan langsung ke arsip resmi dan tayang di etalase prestasi Korwilcam Purwodadi.
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
                Data Prestasi Berhasil Terkirim!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Terima kasih, data prestasi perwakilan dari <span className="font-semibold text-slate-800">{submittedData.schoolName}</span> telah berhasil masuk ke sistem database.
              </p>
            </div>

            {/* Ringkasan Data */}
            <div className="max-w-xl mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm space-y-2.5">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Nama Siswa / Guru:</span>
                <span className="font-bold text-slate-900">{submittedData.recipientName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Ajang Perlombaan:</span>
                <span className="font-bold text-slate-900 text-right">{submittedData.title}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Peringkat / Tingkat:</span>
                <span className="font-bold text-blue-600">{submittedData.rank} ({submittedData.level})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Asal Satuan Pendidikan:</span>
                <span className="font-bold text-slate-900">{submittedData.schoolName}</span>
              </div>
              {submittedData.mentorName && (
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Guru Pembimbing:</span>
                  <span className="font-semibold text-slate-800">{submittedData.mentorName}</span>
                </div>
              )}
              {submittedData.eventDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal Pelaksanaan:</span>
                  <span className="font-semibold text-slate-800">{submittedData.eventDate}</span>
                </div>
              )}
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
                + Unggah Data Prestasi Lainnya
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('achievements', '/berita/prestasi')}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Lihat di Daftar Prestasi →
              </button>
            </div>
          </div>
        ) : (
          /* Formulir Pengisian Data */
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kartu 1: Informasi Perlombaan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Trophy className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    1. Informasi Perlombaan & Kejuaraan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Keterangan lomba, jenjang tingkat, dan capaian peringkat
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lomba */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Nama Perlombaan / Kejuaraan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: MAPSI Ke-26 Cabang Khitobah Putri SD"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Jenjang Lomba */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Medal className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jenjang Perlombaan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {JENJANG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Peringkat / Juara */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Peringkat / Juara</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    {PERINGKAT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                    <option value="Lainnya">Lainnya (Ketik Manual)...</option>
                  </select>
                  {rank === 'Lainnya' && (
                    <input
                      type="text"
                      value={customRank}
                      onChange={(e) => setCustomRank(e.target.value)}
                      placeholder="Masukkan peringkat/juara (misal: Juara Umum)"
                      className="w-full mt-2 px-3.5 py-2 text-xs sm:text-sm bg-white border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  )}
                </div>

                {/* Tahun Perlombaan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tahun Perlombaan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="2015"
                    max="2035"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Tanggal Pelaksanaan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tanggal Pelaksanaan</span>
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Contoh: 10 November 2026"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Kartu 2: Data Peraih Prestasi & Sekolah */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    2. Data Peraih Prestasi & Sekolah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nama peserta didik/guru, asal lembaga, dan pendamping
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap Siswa */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nama Lengkap Siswa / Guru</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                {/* Asal Sekolah */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <SchoolIcon className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Asal Satuan Pendidikan</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="school-suggestions"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Pilih atau ketik asal sekolah..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <datalist id="school-suggestions">
                    {schoolSuggestions.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                {/* Nama Guru Pembimbing */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Nama Guru Pembimbing / Pelatih</span>
                  </label>
                  <input
                    type="text"
                    value={mentorName}
                    onChange={(e) => setMentorName(e.target.value)}
                    placeholder="Contoh: Siti Nurhaliza, S.Pd.I"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Kartu 3: Dokumentasi Foto & Pesan Kesan */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    3. Dokumentasi Foto & Pesan Kesan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tautan berkas Google Drive dan ucapan kesan
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Link Foto Google Drive */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tautan Link Foto Google Drive</span>
                  </label>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-[11px] text-blue-800 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Petunjuk Tautan Google Drive:</span>
                    </div>
                    <p className="text-blue-700 leading-relaxed">
                      Unggah foto piagam/dokumentasi ke Google Drive Anda, lalu klik kanan file &gt; <strong>Bagikan (Share)</strong> &gt; ubah Akses Umum menjadi <strong>"Siapa saja yang memiliki link" (Anyone with the link)</strong> agar foto otomatis muncul di website.
                    </p>
                  </div>
                </div>

                {/* Ucapan Pesan & Kesan Siswa */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ucapan Pesan & Kesan Siswa</span>
                    </span>
                    <span className="text-[10px] text-slate-400">{description.length}/500 karakter</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Contoh: Sangat bersyukur dan bangga bisa membawa nama baik sekolah. Terima kasih kepada Bapak/Ibu guru dan orang tua atas doa dan bimbingannya."
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
                    <span>Menyimpan Data...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Data Prestasi Sekarang</span>
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
