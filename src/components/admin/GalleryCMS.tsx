import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  getGalleryWebAppUrl, 
  setGalleryWebAppUrl, 
  maskWebAppUrl,
  GALLERY_SPREADSHEET_URL 
} from '../../services/gallerySheetService';
import { GalleryItem } from '../../types';
import { sortGalleryDescending } from '../../lib/galleryHelper';
import { 
  parseGoogleDriveImageLinks, 
  formatGoogleDriveImageUrl, 
  isGoogleDriveUrl, 
  isGoogleDriveFolderUrl, 
  getGoogleDriveFolderViewUrl 
} from '../../lib/driveHelper';
import { AdminPagination } from './AdminPagination';
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Plus, 
  Check, 
  X, 
  Loader2, 
  User, 
  Lock, 
  Images, 
  Trash2, 
  Image as ImageIcon, 
  Star, 
  Save, 
  Folder, 
  Edit3 
} from 'lucide-react';

interface GalleryCMSProps {
  onGoToWebsite?: () => void;
}

// Komponen memoized untuk thumbnail foto agar tidak re-render saat mengetik judul/deskripsi
const PhotoThumbnailCard: React.FC<{
  photoUrl: string;
  idx: number;
  isCover: boolean;
  onSetCover: (url: string) => void;
  onRemove: (idx: number) => void;
}> = React.memo(({ photoUrl, idx, isCover, onSetCover, onRemove }) => {
  return (
    <div
      className={`group relative bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
        isCover ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200'
      }`}
    >
      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
        <img
          src={photoUrl}
          alt={`Foto ${idx + 1}`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLElement).style.opacity = '0.3';
          }}
        />
        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white font-mono shadow-xs">
          #{idx + 1}
        </div>
        {isCover && (
          <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 fill-slate-950" />
            <span>Sampul</span>
          </div>
        )}
      </div>

      <div className="p-2 flex items-center justify-between gap-1 bg-white">
        <button
          type="button"
          onClick={() => onSetCover(photoUrl)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
            isCover 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600'
          }`}
          title="Jadikan sebagai foto sampul utama album"
        >
          <Star className={`w-3 h-3 ${isCover ? 'fill-amber-600 text-amber-600' : ''}`} />
          <span>{isCover ? 'Sampul Aktif' : 'Jadikan Sampul'}</span>
        </button>

        <button
          type="button"
          onClick={() => onRemove(idx)}
          className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
          title="Hapus foto ini dari album"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

interface GalleryFormState {
  title: string;
  category: string;
  driveFolderUrl: string;
  coverImage: string;
  images: string[];
  description: string;
  authorId: string;
  authorName: string;
  authorRole: string;
}

export const GalleryCMS: React.FC<GalleryCMSProps> = () => {
  const {
    currentUser,
    gallery,
    galleryCategories,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    addGalleryCategory,
    refreshGalleryFromSheet,
    isGalleryLoading,
    showToast,
    showConfirmDialog,
    showNoticePopup
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const activeAuthorName = currentUser?.name || 'Humas Korwilcam Purwodadi';
  const activeUserRole = currentUser?.role || 'Penulis';

  // --- GAS WEBHOOK STATE ---
  const [galleryGasUrl, setGalleryGasUrlState] = useState<string>(() => getGalleryWebAppUrl());
  const [isEditingGasUrl, setIsEditingGasUrl] = useState<boolean>(false);
  const [tempGasUrl, setTempGasUrl] = useState<string>(() => getGalleryWebAppUrl());
  const [showPlainGasUrl, setShowPlainGasUrl] = useState<boolean>(false);

  // --- FORM STATE ---
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryFilterTab, setGalleryFilterTab] = useState<'all' | 'mine'>('mine');
  const [galleryForm, setGalleryForm] = useState<GalleryFormState>({
    title: '',
    category: 'Kegiatan Belajar',
    driveFolderUrl: '',
    coverImage: '',
    images: [],
    description: '',
    authorId: currentUser?.id || '',
    authorName: activeAuthorName,
    authorRole: activeUserRole
  });

  const [galleryBatchInput, setGalleryBatchInput] = useState<string>('');
  const [isGalleryBatchMode, setIsGalleryBatchMode] = useState<boolean>(true);
  const [singleGalleryPhotoInput, setSingleGalleryPhotoInput] = useState<string>('');

  // Kategori Baru State
  const [isAddingGalleryCategory, setIsAddingGalleryCategory] = useState<boolean>(false);
  const [newGalleryCategoryInput, setNewGalleryCategoryInput] = useState<string>('');
  const [isSavingGalleryCategory, setIsSavingGalleryCategory] = useState<boolean>(false);

  // Pagination Galeri CMS
  const [galleryCurrentPage, setGalleryCurrentPage] = useState(1);
  const galleryItemsPerPage = 10;

  // Helper cek kepemilikan album
  const isGalleryItemOwner = useCallback((item: GalleryItem) => {
    if (!currentUser) return false;
    if (item.authorId && currentUser.id && item.authorId === currentUser.id) return true;

    const authorNameClean = (item.authorName || '').trim().toLowerCase();
    const currentNameClean = (currentUser.name || '').trim().toLowerCase();
    const activeNameClean = (activeAuthorName || '').trim().toLowerCase();
    const currentUsernameClean = (currentUser.username || '').trim().toLowerCase();

    if (authorNameClean && (
      authorNameClean === currentNameClean || 
      authorNameClean === activeNameClean ||
      authorNameClean === currentUsernameClean
    )) {
      return true;
    }

    if (isSuperAdmin && (
      authorNameClean === 'super administrator' ||
      authorNameClean === 'super admin' ||
      authorNameClean === 'administrator'
    )) {
      return true;
    }

    return false;
  }, [currentUser, activeAuthorName, isSuperAdmin]);

  // Sinkronkan nama pembuat album jika berganti akun
  useEffect(() => {
    if (!editingGalleryId && currentUser) {
      setGalleryForm((prev) => ({
        ...prev,
        authorId: currentUser.id || '',
        authorName: currentUser.name || activeAuthorName,
        authorRole: currentUser.role || activeUserRole
      }));
    }
  }, [currentUser, editingGalleryId, activeAuthorName, activeUserRole]);

  // Default tab filter
  useEffect(() => {
    if (isSuperAdmin) {
      setGalleryFilterTab('all');
    } else {
      setGalleryFilterTab('mine');
    }
  }, [isSuperAdmin]);

  // Filter daftar galeri yang tampil
  const displayedGallery = useMemo(() => {
    if (!currentUser) return [];
    if (isSuperAdmin) {
      if (galleryFilterTab === 'mine') {
        return sortGalleryDescending(gallery.filter((g) => isGalleryItemOwner(g)));
      }
      return sortGalleryDescending(gallery);
    }
    return sortGalleryDescending(gallery.filter((g) => isGalleryItemOwner(g)));
  }, [gallery, currentUser, galleryFilterTab, isSuperAdmin, isGalleryItemOwner]);

  const totalGalleryPages = Math.max(1, Math.ceil(displayedGallery.length / galleryItemsPerPage));
  const paginatedGallery = useMemo(() => {
    const start = (galleryCurrentPage - 1) * galleryItemsPerPage;
    return displayedGallery.slice(start, start + galleryItemsPerPage);
  }, [displayedGallery, galleryCurrentPage, galleryItemsPerPage]);

  useEffect(() => {
    if (galleryCurrentPage > totalGalleryPages) {
      setGalleryCurrentPage(totalGalleryPages);
    }
  }, [galleryCurrentPage, totalGalleryPages]);

  useEffect(() => {
    setGalleryCurrentPage(1);
  }, [galleryFilterTab]);

  // Handler Kategori Baru
  const handleSaveGalleryCategory = async () => {
    const trimmed = newGalleryCategoryInput.trim();
    if (!trimmed) {
      showToast('Nama kategori galeri tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingGalleryCategory(true);
    try {
      await addGalleryCategory(trimmed);
      setGalleryForm((prev) => ({ ...prev, category: trimmed }));
      setIsAddingGalleryCategory(false);
      setNewGalleryCategoryInput('');
    } catch (err) {
      console.error('Error adding gallery category:', err);
    } finally {
      setIsSavingGalleryCategory(false);
    }
  };

  // Handler Tambah Batch Foto
  const handleAddBatchGalleryPhotos = useCallback(() => {
    const trimmed = galleryBatchInput.trim();
    if (!trimmed) {
      showToast('Silakan tempelkan link foto database terlebih dahulu!', 'error');
      return;
    }
    const extracted = parseGoogleDriveImageLinks(trimmed);
    if (extracted.length === 0) {
      showToast('Tidak ada link foto database yang valid terdeteksi dari teks yang ditempelkan.', 'error');
      return;
    }

    setGalleryForm((prev) => {
      const combined = [...prev.images];
      extracted.forEach((url) => {
        if (!combined.includes(url)) combined.push(url);
      });
      const newCover = prev.coverImage || combined[0] || '';
      return {
        ...prev,
        images: combined,
        coverImage: newCover
      };
    });

    setGalleryBatchInput('');
    showToast(`Berhasil menambahkan ${extracted.length} foto ke daftar dokumentasi!`, 'success');
  }, [galleryBatchInput, showToast]);

  // Handler Tambah Satuan Foto
  const handleAddSingleGalleryPhoto = useCallback(() => {
    const trimmed = singleGalleryPhotoInput.trim();
    if (!trimmed) {
      showToast('Masukkan link foto database terlebih dahulu!', 'error');
      return;
    }
    const extracted = parseGoogleDriveImageLinks(trimmed);
    const photoUrl = extracted[0] || (isGoogleDriveUrl(trimmed) ? formatGoogleDriveImageUrl(trimmed) : trimmed);
    if (!photoUrl) {
      showToast('Format link foto tidak valid!', 'error');
      return;
    }

    setGalleryForm((prev) => {
      const combined = prev.images.includes(photoUrl) ? prev.images : [...prev.images, photoUrl];
      const newCover = prev.coverImage || combined[0] || '';
      return {
        ...prev,
        images: combined,
        coverImage: newCover
      };
    });

    setSingleGalleryPhotoInput('');
    showToast('Foto berhasil ditambahkan!', 'success');
  }, [singleGalleryPhotoInput, showToast]);

  const handleRemoveGalleryPhoto = useCallback((indexToRemove: number) => {
    setGalleryForm((prev) => {
      const targetPhoto = prev.images[indexToRemove];
      const filtered = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newCover = prev.coverImage;
      if (newCover === targetPhoto) {
        newCover = filtered[0] || '';
      }
      return {
        ...prev,
        images: filtered,
        coverImage: newCover
      };
    });
  }, []);

  const handleSetGalleryCover = useCallback((photoUrl: string) => {
    setGalleryForm((prev) => ({
      ...prev,
      coverImage: photoUrl
    }));
    showToast('Foto sampul utama berhasil dipilih!', 'info');
  }, [showToast]);

  // Handler Simpan Album
  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = galleryForm.title.trim();
    if (!trimmedTitle) {
      showToast('Judul album kegiatan wajib diisi!', 'error');
      return;
    }

    let imagesList = [...galleryForm.images];
    const trimmedCover = galleryForm.coverImage.trim();
    const formattedCover = trimmedCover ? (isGoogleDriveUrl(trimmedCover) ? formatGoogleDriveImageUrl(trimmedCover) : trimmedCover) : '';

    if (formattedCover && !imagesList.includes(formattedCover) && !isGoogleDriveFolderUrl(formattedCover)) {
      imagesList = [formattedCover, ...imagesList];
    }
    if (imagesList.length === 0 && formattedCover) {
      imagesList = [formattedCover];
    }

    if (imagesList.length === 0) {
      showToast('Tambahkan minimal 1 tautan foto pada daftar foto dokumentasi!', 'error');
      return;
    }

    const primaryCover = formattedCover || imagesList[0] || '';
    const trimmedDriveUrl = galleryForm.driveFolderUrl?.trim() || '';

    if (editingGalleryId) {
      const existingItem = gallery.find((g) => g.id === editingGalleryId);
      if (existingItem && !isGalleryItemOwner(existingItem) && !isSuperAdmin) {
        showToast('Anda tidak memiliki izin untuk mengedit album yang diunggah oleh akun lain!', 'error');
        return;
      }

      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Album Galeri',
        message: `Apakah Anda yakin ingin menyimpan perubahan pada album galeri ini (${imagesList.length} foto)?`,
        type: 'edit',
        itemName: trimmedTitle,
        confirmText: 'Ya, Perbarui',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateGalleryItem(editingGalleryId, {
        title: trimmedTitle,
        category: galleryForm.category,
        driveFolderUrl: trimmedDriveUrl,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description.trim(),
        authorId: existingItem?.authorId || currentUser?.id,
        authorName: existingItem?.authorName || galleryForm.authorName || activeAuthorName,
        authorRole: existingItem?.authorRole || galleryForm.authorRole || activeUserRole
      });
      setEditingGalleryId(null);
      showNoticePopup({
        title: 'Galeri Diperbarui!',
        message: `Album kegiatan "${trimmedTitle}" berhasil diperbarui dengan ${imagesList.length} foto dokumentasi.`,
        type: 'success'
      });
    } else {
      await addGalleryItem({
        title: trimmedTitle,
        category: galleryForm.category,
        driveFolderUrl: trimmedDriveUrl,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description.trim(),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        authorId: currentUser?.id,
        authorName: currentUser?.name || galleryForm.authorName || activeAuthorName,
        authorRole: currentUser?.role || galleryForm.authorRole || activeUserRole
      });
      showNoticePopup({
        title: 'Album Galeri Dibuat!',
        message: `Album kegiatan "${trimmedTitle}" berhasil disimpan dengan ${imagesList.length} foto dan tayang di website.`,
        type: 'success'
      });
    }

    setGalleryForm({
      title: '',
      category: 'Kegiatan Belajar',
      driveFolderUrl: '',
      coverImage: '',
      images: [],
      description: '',
      authorId: currentUser?.id || '',
      authorName: activeAuthorName,
      authorRole: activeUserRole
    });
    setGalleryBatchInput('');
    setSingleGalleryPhotoInput('');
  };

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Kelola Galeri Foto Kegiatan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload dan kelola foto kegiatan pembelajaran, lomba, dan upacara se-Purwodadi.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={isGalleryLoading}
            onClick={() => refreshGalleryFromSheet()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            title="Muat ulang dan sinkronkan data galeri"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGalleryLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isGalleryLoading ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
          </button>
          {isSuperAdmin && (
            <a
              href={GALLERY_SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-200 transition-all shadow-xs"
              title="Buka lembar kerja Google Spreadsheet database galeri foto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Spreadsheet</span>
            </a>
          )}
        </div>
      </div>

      {/* BANNER STATUS WEBHOOK GAS GALERI (KHUSUS SUPER ADMIN) */}
      {isSuperAdmin && (
        <div className={`p-4 rounded-2xl border transition-all ${
          galleryGasUrl 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2.5">
              <div className={`p-2 rounded-xl shrink-0 ${
                galleryGasUrl ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {galleryGasUrl ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <span>{galleryGasUrl ? 'Webhook Google Apps Script (GAS) Aktif & Disamarkan' : 'Webhook Google Apps Script Belum Dipasang'}</span>
                  {galleryGasUrl && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-200/80 text-emerald-800 border border-emerald-300">
                      Terenkripsi XOR+Base64
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {galleryGasUrl 
                    ? 'Setiap penambahan, pengeditan, atau penghapusan album dari portal CMS akan otomatis tersimpan langsung ke Google Spreadsheet.' 
                    : 'Silakan terapkan Google Apps Script di Spreadsheet dan tempelkan link Web App di bawah agar CMS bisa menyimpan, mengedit, dan menghapus foto secara otomatis.'}
                </p>
                {galleryGasUrl && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono opacity-90">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="select-all">{showPlainGasUrl ? galleryGasUrl : maskWebAppUrl(galleryGasUrl)}</span>
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
              onClick={() => setIsEditingGasUrl(!isEditingGasUrl)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-all shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
            >
              {isEditingGasUrl ? 'Tutup Pengaturan' : (galleryGasUrl ? 'Ganti URL GAS' : 'Pasang URL Web App GAS')}
            </button>
          </div>

          {isEditingGasUrl && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-col sm:flex-row gap-2">
              <input
                type={showPlainGasUrl ? 'text' : 'password'}
                value={tempGasUrl}
                onChange={(e) => setTempGasUrl(e.target.value)}
                placeholder="Tempel URL Web App Google Apps Script (https://script.google.com/macros/s/.../exec)"
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPlainGasUrl(!showPlainGasUrl)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold shrink-0 cursor-pointer"
                title={showPlainGasUrl ? 'Samarkan Teks' : 'Tampilkan Teks'}
              >
                {showPlainGasUrl ? 'Mask' : 'Unhide'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const clean = tempGasUrl.trim();
                  setGalleryWebAppUrl(clean);
                  setGalleryGasUrlState(clean);
                  setIsEditingGasUrl(false);
                  showToast(clean ? 'URL Webhook Google Apps Script Galeri berhasil disimpan!' : 'URL Webhook dikosongkan.', 'success');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 cursor-pointer"
              >
                Simpan URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* FORM GALERI FOTO */}
      <form onSubmit={handleSaveGallery} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Judul Foto Dokumentasi *</label>
            <input
              type="text"
              required
              value={galleryForm.title}
              onChange={(e) => setGalleryForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Masukkan judul album dokumentasi kegiatan..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Kategori Dokumentasi</label>
              {!isAddingGalleryCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGalleryCategory(true);
                    setNewGalleryCategoryInput('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                  title="Tambah Kategori Galeri Baru (+)"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kategori</span>
                </button>
              )}
            </div>

            {!isAddingGalleryCategory ? (
              <div className="flex items-center gap-1.5">
                <select
                  value={galleryForm.category}
                  onChange={(e) => setGalleryForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
                >
                  {galleryCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingGalleryCategory(true);
                    setNewGalleryCategoryInput('');
                  }}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all hover:scale-105 shrink-0 flex items-center justify-center cursor-pointer"
                  title="Tambah Kategori Galeri Baru (+)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newGalleryCategoryInput}
                    onChange={(e) => setNewGalleryCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveGalleryCategory();
                      } else if (e.key === 'Escape') {
                        setIsAddingGalleryCategory(false);
                      }
                    }}
                    placeholder="Ketik nama kategori galeri baru..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-semibold focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    disabled={isSavingGalleryCategory}
                    onClick={handleSaveGalleryCategory}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-1 text-xs font-bold disabled:opacity-50 cursor-pointer"
                    title="Simpan Kategori Baru ke Database (V)"
                  >
                    {isSavingGalleryCategory ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>V</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingGalleryCategory(false);
                      setNewGalleryCategoryInput('');
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shrink-0 flex items-center justify-center cursor-pointer"
                    title="Batal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  Ketik nama kategori lalu klik tombol <b>V</b> (atau tekan Enter).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* IDENTITAS PENGUNGGAH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Pengunggah / Pembuat Album</span>
              </label>
              <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                <Lock className="w-2.5 h-2.5 text-slate-500" />
                <span>Otomatis Akun Login</span>
              </span>
            </div>
            <input
              type="text"
              readOnly
              disabled
              value={editingGalleryId ? (galleryForm.authorName || activeAuthorName) : (currentUser?.name || activeAuthorName)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-not-allowed select-none shadow-xs"
              title="Nama akun yang sedang login otomatis terdeteksi sebagai pembuat/pengunggah dokumentasi foto"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Role Akun Login</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                <span>Role Terverifikasi</span>
              </span>
            </div>
            <input
              type="text"
              readOnly
              disabled
              value={editingGalleryId ? (galleryForm.authorRole || activeUserRole) : (currentUser?.role || activeUserRole)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-blue-700 cursor-not-allowed select-none shadow-xs"
              title="Tingkatan wewenang akun yang login (Super Admin / Admin / Penulis)"
            />
          </div>
        </div>

        {/* DAFTAR FOTO DOKUMENTASI KEGIATAN */}
        <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Images className="w-4 h-4 text-blue-600" />
                  <span>Daftar Foto Dokumentasi Kegiatan (Database) *</span>
                </label>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  galleryForm.images.length > 0 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {galleryForm.images.length} Foto Siap Tayang
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Seluruh foto yang ditambahkan di sini akan tampil berurutan pada <strong>Slide Show</strong> halaman detail galeri.
              </p>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsGalleryBatchMode(!isGalleryBatchMode)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                {isGalleryBatchMode ? '← Mode Input Satuan' : '📋 Tempel Banyak Link Sekaligus'}
              </button>

              {galleryForm.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Hapus semua foto dari daftar dokumentasi album ini?')) {
                      setGalleryForm((prev) => ({ ...prev, images: [], coverImage: '' }));
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                  title="Kosongkan Semua Foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Mode Batch */}
          {isGalleryBatchMode ? (
            <div className="space-y-3 p-4 bg-white rounded-2xl border border-blue-200 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Tempel Daftar Link Foto Database:</span>
                </label>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  Satu link per baris atau dipisah koma/spasi
                </span>
              </div>

              <textarea
                rows={4}
                value={galleryBatchInput}
                onChange={(e) => setGalleryBatchInput(e.target.value)}
                placeholder="Contoh:&#10;https://drive.google.com/file/d/1ABC123.../view&#10;https://drive.google.com/file/d/2XYZ789.../view&#10;https://lh3.googleusercontent.com/d/3DEF456..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-slate-500">
                  💡 <strong>Tips Cepat Database:</strong> Buka folder penyimpanan database &gt; Tekan <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">Ctrl + A</kbd> (pilih semua) &gt; Klik kanan <strong>Salin tautan (Copy link)</strong> &gt; Tempel di sini.
                </p>
                <button
                  type="button"
                  onClick={handleAddBatchGalleryPhotos}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all hover:scale-102 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ekstrak & Tambahkan Semua Foto</span>
                </button>
              </div>
            </div>
          ) : (
            /* Mode Satuan */
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={singleGalleryPhotoInput}
                  onChange={(e) => setSingleGalleryPhotoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSingleGalleryPhoto();
                    }
                  }}
                  placeholder="Tempel link foto database (Contoh: https://drive.google.com/file/d/1.../view)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSingleGalleryPhoto}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all hover:scale-102 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Foto</span>
              </button>
            </div>
          )}

          {/* Thumbnail List */}
          {galleryForm.images.length > 0 ? (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Foto Dokumentasi Terdaftar ({galleryForm.images.length} foto):</span>
                <span className="text-[11px] text-slate-400">Klik "Jadikan Sampul" untuk memilih sampul utama album</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-300">
                {galleryForm.images.map((photoUrl, idx) => {
                  const isCover = galleryForm.coverImage === photoUrl || (!galleryForm.coverImage && idx === 0);
                  return (
                    <PhotoThumbnailCard
                      key={`${photoUrl}-${idx}`}
                      photoUrl={photoUrl}
                      idx={idx}
                      isCover={isCover}
                      onSetCover={handleSetGalleryCover}
                      onRemove={handleRemoveGalleryPhoto}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-1">
              <Images className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Belum Ada Foto Terdaftar di Slide Show</p>
              <p className="text-[11px] text-slate-400">
                Tempel link foto database di atas agar seluruh foto kegiatan tampil di slide show pengunjung.
              </p>
            </div>
          )}
        </div>

        {/* INPUT LINK FOTO SAMPUL / COVER (OPSIONAL) */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Link Foto Sampul Album (Opsional Override)</span>
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Foto sampul utama secara default diambil dari foto pertama pada daftar di atas atau dengan mengklik tombol "Jadikan Sampul".
            </p>
          </div>

          <input
            type="url"
            value={galleryForm.coverImage}
            onChange={(e) => setGalleryForm((prev) => ({ ...prev, coverImage: e.target.value }))}
            placeholder="Contoh: https://drive.google.com/file/d/1aBcDe.../view?usp=sharing atau link gambar langsung"
            className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />

          {galleryForm.coverImage.trim() && (
            <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
              <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                <img
                  src={formatGoogleDriveImageUrl(galleryForm.coverImage, 200)}
                  alt="Preview Sampul"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs min-w-0">
                <span className="font-bold text-slate-800 block truncate">Preview Foto Sampul Utama Terpilih</span>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Foto sampul berhasil terdeteksi
                </span>
              </div>
            </div>
          )}
        </div>

        {/* DESKRIPSI */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Keterangan / Deskripsi Album Foto</label>
          <input
            type="text"
            value={galleryForm.description}
            onChange={(e) => setGalleryForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Deskripsi singkat momen kegiatan yang didokumentasikan..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
          >
            <Save className="w-4 h-4" />
            <span>{editingGalleryId ? 'Simpan Perubahan Album' : 'Terbitkan Album Galeri'}</span>
          </button>
          {editingGalleryId && (
            <button
              type="button"
              onClick={() => {
                setEditingGalleryId(null);
                setGalleryForm({
                  title: '',
                  category: 'Kegiatan Belajar',
                  driveFolderUrl: '',
                  coverImage: '',
                  images: [],
                  description: '',
                  authorId: currentUser?.id || '',
                  authorName: activeAuthorName,
                  authorRole: activeUserRole
                });
                setGalleryBatchInput('');
                setSingleGalleryPhotoInput('');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Batal
            </button>
          )}
        </div>
      </form>

      {/* SECTION HEADER & OWNERSHIP FILTER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-amber-500" />
            <span>
              {isSuperAdmin
                ? (galleryFilterTab === 'all'
                    ? `Seluruh Koleksi Album Galeri (${gallery.length} Album)`
                    : `Koleksi Album Unggahan Saya (${gallery.filter((g) => isGalleryItemOwner(g)).length} Album)`)
                : `Koleksi Album Unggahan Saya (${gallery.filter((g) => isGalleryItemOwner(g)).length} Album)`}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperAdmin
              ? (galleryFilterTab === 'all'
                  ? 'Menampilkan seluruh album foto yang diunggah oleh semua akun pengelola website dan organisasi.'
                  : `Menampilkan album foto dokumentasi yang diunggah dan dapat dikelola oleh akun ${currentUser?.name} (${currentUser?.role}).`)
              : `Menampilkan album foto dokumentasi yang diunggah dan dapat dikelola oleh akun ${currentUser?.name} (${currentUser?.role}).`}
          </p>
        </div>

        {isSuperAdmin && (
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setGalleryFilterTab('mine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                galleryFilterTab === 'mine'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Unggahan Saya ({gallery.filter((g) => isGalleryItemOwner(g)).length})
            </button>
            <button
              type="button"
              onClick={() => setGalleryFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                galleryFilterTab === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Semua Album ({gallery.length})
            </button>
          </div>
        )}
      </div>

      {/* GALLERY GRID / EMPTY STATE */}
      {displayedGallery.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {paginatedGallery.map((item) => {
              const isDrive = Boolean(item.driveFolderUrl || isGoogleDriveFolderUrl(item.image));
              const hasCover = Boolean(item.image && !isGoogleDriveFolderUrl(item.image) && !item.image.includes('/drive/folders'));
              const coverSrc = hasCover ? formatGoogleDriveImageUrl(item.image, 500) : '';
              const folderUrl = item.driveFolderUrl || (isGoogleDriveFolderUrl(item.image) ? item.image : '');
              const canManageItem = isGalleryItemOwner(item) || isSuperAdmin;

              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group hover:shadow-md transition-shadow">
                  <div className="relative h-44 bg-slate-900">
                    {coverSrc ? (
                      <>
                        <img src={coverSrc} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1b56ce] via-[#163fa8] to-[#0f172a] p-4 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                            <Folder className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white/20 text-white">
                            Database Cloud
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-extrabold uppercase text-blue-200">Cloud Album</span>
                          <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">
                            {item.title}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-xs">
                      {item.category}
                    </span>

                    {isDrive ? (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1 border border-white/30">
                        <Folder className="w-3 h-3 text-amber-300 fill-amber-300/20" />
                        <span>Folder Database</span>
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        <span>{item.images?.length || 1} Foto</span>
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description || 'Tidak ada deskripsi'}</p>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                      <User className="w-2.5 h-2.5 text-purple-600" />
                      <span>Oleh: <strong>{item.authorName || 'Super Administrator'}</strong>{item.authorRole ? ` (${item.authorRole})` : ''}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 font-mono">{item.date}</span>
                      
                      <div className="flex items-center gap-1.5">
                        {folderUrl && (
                          <a
                            href={getGoogleDriveFolderViewUrl(folderUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Buka Folder di Database"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {canManageItem ? (
                          <>
                            <button
                              onClick={() => {
                                const itemFolder = item.driveFolderUrl || (isGoogleDriveFolderUrl(item.image) ? item.image : '');
                                const itemCover = item.image && !isGoogleDriveFolderUrl(item.image) && !item.image.includes('/drive/folders') ? item.image : '';
                                const itemImages = (item.images && item.images.length > 0)
                                  ? item.images.filter((img) => !isGoogleDriveFolderUrl(img) && !img.includes('/drive/folders'))
                                  : (itemCover ? [itemCover] : []);

                                setEditingGalleryId(item.id);
                                setGalleryForm({
                                  title: item.title,
                                  category: item.category,
                                  driveFolderUrl: itemFolder,
                                  coverImage: itemCover,
                                  images: itemImages,
                                  description: item.description || '',
                                  authorId: item.authorId || '',
                                  authorName: item.authorName || activeAuthorName,
                                  authorRole: item.authorRole || activeUserRole
                                });
                                setGalleryBatchInput('');
                                setSingleGalleryPhotoInput('');
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer transition-colors"
                              title={isSuperAdmin ? "Edit Album" : "Edit Album Saya"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (!isGalleryItemOwner(item) && !isSuperAdmin) {
                                  showNoticePopup({
                                    title: 'Akses Ditolak!',
                                    message: 'Anda tidak memiliki hak akses untuk menghapus album yang diunggah oleh akun atau role lain.',
                                    type: 'warning'
                                  });
                                  return;
                                }

                                const confirmed = await showConfirmDialog({
                                  title: 'Hapus Album Galeri Ini?',
                                  message: `Apakah Anda yakin ingin menghapus album galeri "${item.title}"?`,
                                  type: 'delete',
                                  itemName: item.title,
                                  confirmText: 'Ya, Hapus Album',
                                  cancelText: 'Tidak, Batalkan'
                                });
                                if (!confirmed) return;
                                deleteGalleryItem(item.id);
                                showNoticePopup({
                                  title: 'Album Galeri Dihapus!',
                                  message: `Album "${item.title}" telah berhasil dihapus.`,
                                  type: 'success'
                                });
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                              title="Hapus Album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200" title="Hanya akun pengunggah atau Super Administrator yang dapat mengedit/menghapus">
                            <Lock className="w-2.5 h-2.5 text-slate-400" />
                            <span>Hanya Pemilik</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <AdminPagination
            currentPage={galleryCurrentPage}
            totalItems={displayedGallery.length}
            itemsPerPage={galleryItemsPerPage}
            itemLabel="album kegiatan"
            onPageChange={setGalleryCurrentPage}
          />
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Folder className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Belum Ada Album yang Diunggah oleh Akun Anda
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Anda sedang login sebagai <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.role}). Foto atau album yang diunggah oleh role/akun lain tidak ditampilkan di panel Anda agar privasi pengelolaan terjaga. Silakan gunakan formulir di atas untuk mengunggah foto dokumentasi kegiatan baru.
          </p>
        </div>
      )}
    </div>
  );
};
