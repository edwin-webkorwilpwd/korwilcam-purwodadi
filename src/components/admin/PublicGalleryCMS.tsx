import React, { useState, useMemo } from 'react';
import { 
  Images, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Search, 
  RefreshCw, 
  Filter, 
  School as SchoolIcon, 
  Calendar, 
  FolderOpen, 
  Folder, 
  FileSpreadsheet, 
  Key, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  PublicGallerySubmission, 
  PUBLIC_GALLERY_SPREADSHEET_URL, 
  getPublicGalleryWebAppUrl, 
  setPublicGalleryWebAppUrl, 
  maskPublicGalleryWebAppUrl,
  resolveDefaultPublicGalleryWebAppUrl,
  PUBLIC_GALLERY_GAS_CODE,
  rescanPublicPhotoFolderInSheet
} from '../../services/publicGallerySheetService';

export const PublicGalleryCMS: React.FC = () => {
  const { 
    publicGallerySubmissions, 
    refreshPublicGalleryFromSheet, 
    updatePublicGalleryStatus,
    showToast,
    currentUser 
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'Super Admin' || currentUser?.role?.toLowerCase().includes('super');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Disetujui' | 'Ditolak'>('Pending');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [scanningId, setScanningId] = useState<string | null>(null);

  // Modal Webhook GAS State
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [gasUrlInput, setGasUrlInput] = useState(() => getPublicGalleryWebAppUrl());
  const [isCopiedGas, setIsCopiedGas] = useState(false);
  const [showPlainGasUrl, setShowPlainGasUrl] = useState(false);

  const publicGasUrl = getPublicGalleryWebAppUrl();

  // Hitung jumlah data per status
  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    publicGallerySubmissions.forEach((s) => {
      if (s.status === 'Disetujui') approved++;
      else if (s.status === 'Ditolak') rejected++;
      else pending++;
    });
    return { pending, approved, rejected, total: publicGallerySubmissions.length };
  }, [publicGallerySubmissions]);

  // Filter data sesuai pencarian & status
  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publicGallerySubmissions.filter((item) => {
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      if (!matchStatus) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.schoolName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [publicGallerySubmissions, searchQuery, statusFilter]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPublicGalleryFromSheet(true);
      showToast('Data galeri publik berhasil diperbarui dari Spreadsheet!', 'success');
    } catch {
      showToast('Gagal memuat data terbaru dari Spreadsheet.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (item: PublicGallerySubmission, newStatus: 'Pending' | 'Disetujui' | 'Ditolak') => {
    setUpdatingId(item.id);
    try {
      const success = await updatePublicGalleryStatus(item, newStatus);
      if (success) {
        showToast(
          newStatus === 'Disetujui' 
            ? `Dokumentasi "${item.title}" disetujui dan kini tampil di website!`
            : newStatus === 'Ditolak'
            ? `Dokumentasi "${item.title}" ditolak.`
            : `Dokumentasi "${item.title}" dikembalikan ke status Perlu Disetujui.`,
          'success'
        );
      } else {
        showToast('Gagal mengubah status di Spreadsheet.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRescanFolder = async (item: PublicGallerySubmission) => {
    setScanningId(item.id);
    try {
      const res = await rescanPublicPhotoFolderInSheet(item);
      if (res.success) {
        showToast(res.message || 'Folder Google Drive berhasil dipindai!', 'success');
        await refreshPublicGalleryFromSheet(true);
      } else {
        showToast(res.message || 'Gagal memindai folder Google Drive.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Terjadi kesalahan sistem saat memindai folder.', 'error');
    } finally {
      setScanningId(null);
    }
  };

  const handleSaveGasUrl = () => {
    setPublicGalleryWebAppUrl(gasUrlInput.trim());
    showToast('Tautan Webhook GAS Galeri Publik berhasil disimpan!', 'success');
    setIsGasModalOpen(false);
  };

  const handleCopyGasCode = () => {
    navigator.clipboard.writeText(PUBLIC_GALLERY_GAS_CODE);
    setIsCopiedGas(true);
    showToast('Kode Google Apps Script berhasil disalin ke clipboard!', 'success');
    setTimeout(() => setIsCopiedGas(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner & Action Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
              Moderasi Konten Publik
            </span>
            <span className="text-xs font-bold text-slate-400">
              • {isSuperAdmin ? 'Khusus Super Admin & Admin' : 'Akses Admin'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Images className="w-6 h-6 text-blue-600" />
            <span>Galeri Publik</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Kelola persetujuan kiriman foto dokumentasi kegiatan yang diajukan oleh sekolah dan guru. Foto yang <strong>Disetujui</strong> akan langsung tayang pada halaman galeri website utama.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Tombol Buka Spreadsheet (Hanya untuk Super Admin) */}
          {isSuperAdmin && (
            <a
              href={PUBLIC_GALLERY_SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Buka Database Spreadsheet Google"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Database Spreadsheet</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}

          {/* Tombol Konfigurasi GAS (Hanya untuk Super Admin) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsGasModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all shadow-xs cursor-pointer border border-indigo-200/60"
              title="Atur Webhook Google Apps Script"
            >
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Koneksi GAS</span>
            </button>
          )}

          {/* Tombol Segarkan Data */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Segarkan Data'}</span>
          </button>
        </div>
      </div>

      {/* BANNER STATUS WEBHOOK GAS (HANYA UNTUK SUPER ADMIN) */}
      {isSuperAdmin && (
        <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
          publicGasUrl 
            ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950 shadow-xs' 
            : 'bg-amber-50 border-amber-200 text-amber-950 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`p-2.5 rounded-2xl shrink-0 ${
                publicGasUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {publicGasUrl ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {publicGasUrl ? 'Webhook Google Apps Script (GAS) Aktif & Disamarkan' : 'Webhook Google Apps Script Belum Dipasang'}
                  </span>
                  {publicGasUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-200/90 text-emerald-900 border border-emerald-300">
                      Terenkripsi XOR+Base64
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                  {publicGasUrl 
                    ? 'Pengajuan foto baru dari pengunjung publik serta persetujuan/penolakan dari admin otomatis tersinkron langsung ke Google Spreadsheet.' 
                    : 'Silakan hubungkan Webhook GAS agar pengajuan foto dokumentasi dari pengunjung dapat tersimpan di spreadsheet.'}
                </p>
                {publicGasUrl && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-mono text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="select-all font-semibold">
                      {showPlainGasUrl ? publicGasUrl : maskPublicGalleryWebAppUrl(publicGasUrl)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPlainGasUrl(!showPlainGasUrl)}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 underline font-sans ml-1 font-bold cursor-pointer"
                    >
                      {showPlainGasUrl ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsGasModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
            >
              Kelola Webhook GAS
            </button>
          </div>
        </div>
      )}

      {/* 2. Ringkasan Status & Tab Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tab Perlu Disetujui (Pending) */}
        <button
          type="button"
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === 'Pending'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-slate-500'}`}>
              Perlu Disetujui
            </span>
            <Clock className={`w-4 h-4 ${statusFilter === 'Pending' ? 'text-white' : 'text-amber-500'}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {counts.pending}
          </p>
          <span className={`text-[10px] font-semibold mt-1 block ${statusFilter === 'Pending' ? 'text-amber-100' : 'text-slate-400'}`}>
            Menunggu tindakan
          </span>
        </button>

        {/* Tab Disetujui (Approved) */}
        <button
          type="button"
          onClick={() => setStatusFilter('Disetujui')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === 'Disetujui'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${statusFilter === 'Disetujui' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Disetujui (Tayang)
            </span>
            <CheckCircle2 className={`w-4 h-4 ${statusFilter === 'Disetujui' ? 'text-white' : 'text-emerald-600'}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {counts.approved}
          </p>
          <span className={`text-[10px] font-semibold mt-1 block ${statusFilter === 'Disetujui' ? 'text-emerald-100' : 'text-slate-400'}`}>
            Tampil di Galeri Web
          </span>
        </button>

        {/* Tab Ditolak (Rejected) */}
        <button
          type="button"
          onClick={() => setStatusFilter('Ditolak')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === 'Ditolak'
              ? 'bg-rose-600 text-white border-rose-700 shadow-md shadow-rose-600/20'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-rose-300 hover:bg-rose-50/40'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${statusFilter === 'Ditolak' ? 'text-rose-100' : 'text-slate-500'}`}>
              Ditolak
            </span>
            <XCircle className={`w-4 h-4 ${statusFilter === 'Ditolak' ? 'text-white' : 'text-rose-500'}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {counts.rejected}
          </p>
          <span className={`text-[10px] font-semibold mt-1 block ${statusFilter === 'Ditolak' ? 'text-rose-100' : 'text-slate-400'}`}>
            Tidak tampil di web
          </span>
        </button>

        {/* Tab Semua Data */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-3xl border text-left transition-all cursor-pointer relative overflow-hidden ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-950 shadow-md'
              : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-bold ${statusFilter === 'ALL' ? 'text-slate-200' : 'text-slate-500'}`}>
              Semua Kiriman
            </span>
            <Filter className={`w-4 h-4 ${statusFilter === 'ALL' ? 'text-white' : 'text-slate-400'}`} />
          </div>
          <p className="text-2xl sm:text-3xl font-black tracking-tight">
            {counts.total}
          </p>
          <span className={`text-[10px] font-semibold mt-1 block ${statusFilter === 'ALL' ? 'text-slate-300' : 'text-slate-400'}`}>
            Total riwayat
          </span>
        </button>
      </div>

      {/* 3. Bar Pencarian */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari berdasarkan judul kegiatan, nama sekolah, kategori..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4. Daftar Kartu Pengajuan Foto */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Images className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tidak ada data foto untuk kategori ini
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {statusFilter === 'Pending'
              ? 'Saat ini tidak ada foto baru yang perlu disetujui. Semua kiriman telah diproses.'
              : 'Tidak ditemukan data pengajuan foto yang sesuai dengan filter pencarian Anda.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubmissions.map((item) => {
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Status Badge & Waktu Kirim */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.status === 'Ditolak'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {item.status === 'Disetujui' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      {item.status === 'Ditolak' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                      {item.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{item.status === 'Pending' ? 'Perlu Disetujui' : item.status}</span>
                    </span>

                    <span className="text-[11px] text-slate-400 font-medium truncate">
                      {item.timestamp}
                    </span>
                  </div>

                  {/* Foto Sampul Terdeteksi (Opsi B) */}
                  {item.coverImage ? (
                    <div className="relative h-36 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-2xs group">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold font-mono">
                        {item.images?.length || 1} Foto Terdeteksi
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 text-slate-500">
                        <Images className="w-4 h-4 text-slate-400" />
                        <span>Foto belum dipindai</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRescanFolder(item)}
                        disabled={scanningId === item.id}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${scanningId === item.id ? 'animate-spin' : ''}`} />
                        <span>{scanningId === item.id ? 'Memindai...' : 'Pindai Foto'}</span>
                      </button>
                    </div>
                  )}

                  {/* Judul Kegiatan */}
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-extrabold uppercase">
                        {item.category}
                      </span>
                      {item.eventDate && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{item.eventDate}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Asal Sekolah / Pengirim */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                      <SchoolIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{item.schoolName || 'Tidak disebutkan'}</span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Tombol Buka Link Google Drive & Pindai Ulang */}
                  <div className="flex items-center gap-2">
                    {item.driveFolderUrl && (
                      <a
                        href={item.driveFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200/60 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span className="truncate">Folder Drive</span>
                        <ExternalLink className="w-3 h-3 ml-auto text-blue-400" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRescanFolder(item)}
                      disabled={scanningId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer disabled:opacity-50 shrink-0"
                      title="Pindai ulang foto di dalam folder Google Drive"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${scanningId === item.id ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
                      <span>{scanningId === item.id ? 'Memindai...' : 'Pindai Foto'}</span>
                    </button>
                  </div>
                </div>

                {/* Tombol Aksi Moderasi (Setujui / Tolak / Kembalikan ke Pending) */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  {item.status !== 'Disetujui' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item, 'Disetujui')}
                      disabled={isUpdating}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                      title="Setujui agar tampil di website utama"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isUpdating ? 'Menyimpan...' : 'Setujui'}</span>
                    </button>
                  )}

                  {item.status !== 'Ditolak' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item, 'Ditolak')}
                      disabled={isUpdating}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                      title="Tolak kiriman foto"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isUpdating ? 'Menyimpan...' : 'Tolak'}</span>
                    </button>
                  )}

                  {item.status !== 'Pending' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(item, 'Pending')}
                      disabled={isUpdating}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shrink-0"
                      title="Kembalikan status ke Perlu Disetujui"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline text-[11px]">Pending</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Modal Konfigurasi Google Apps Script (GAS) - Khusus Super Admin */}
      {isGasModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Koneksi Google Apps Script (GAS)
                  </h3>
                  <p className="text-xs text-slate-500">Database Galeri Publik Korwilcam</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGasModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Input URL Webhook GAS */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    URL Web App Google Apps Script (GAS)
                  </label>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Terenkripsi XOR+Base64
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPlainGasUrl ? "text" : "password"}
                    value={gasUrlInput}
                    onChange={(e) => setGasUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full px-4 py-3 pr-24 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPlainGasUrl(!showPlainGasUrl)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition-colors"
                  >
                    {showPlainGasUrl ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-slate-400">
                    Tersimpan aman &amp; disamarkan di memori aplikasi.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const def = resolveDefaultPublicGalleryWebAppUrl();
                      setGasUrlInput(def);
                      setPublicGalleryWebAppUrl(def);
                      showToast('URL Webhook di-reset ke URL terenkripsi bawaan!', 'success');
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                  >
                    Reset ke URL Terenkripsi Bawaan
                  </button>
                </div>
              </div>

              {/* Salin Kode GAS */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Kode Resmi Google Apps Script (GAS)</span>
                  <button
                    type="button"
                    onClick={handleCopyGasCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition-all cursor-pointer"
                  >
                    {isCopiedGas ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedGas ? 'Tersalin!' : 'Salin Kode GAS'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tempelkan kode ini di <strong>Ekstensi &gt; Apps Script</strong> pada Spreadsheet target:
                </p>
                <div className="p-2 rounded bg-slate-950 font-mono text-[10px] text-indigo-300 truncate">
                  {PUBLIC_GALLERY_SPREADSHEET_URL}
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsGasModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGasUrl}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                Simpan Tautan GAS
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
