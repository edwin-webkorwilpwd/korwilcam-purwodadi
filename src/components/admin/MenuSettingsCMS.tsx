import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  NAVIGATION_CONFIG, 
  NavigationItem, 
  NavigationSubItem,
  MenuVisibilityMap, 
  isItemActive, 
  isParentActive,
  getNavigationStats
} from '../../config/navigationConfig';
import { 
  Sliders, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  RefreshCw, 
  Save, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Layers, 
  ChevronDown, 
  ExternalLink,
  Filter,
  Info,
  Home,
  FileCheck,
  GraduationCap,
  BookOpen,
  BellRing,
  Briefcase,
  Image as ImageIcon,
  Phone
} from 'lucide-react';

interface MenuSettingsCMSProps {
  onGoToWebsite?: () => void;
}

export const MenuSettingsCMS: React.FC<MenuSettingsCMSProps> = ({ onGoToWebsite }) => {
  const { 
    menuVisibility, 
    updateMenuVisibility, 
    resetMenuVisibility, 
    showToast,
    currentUser
  } = useApp();

  const [localVisibility, setLocalVisibility] = useState<MenuVisibilityMap>(() => ({ ...menuVisibility }));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'disabled' | 'has-children'>('all');
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>(() => {
    // Default: buka semua menu yang memiliki sub menu
    const initial: Record<string, boolean> = {};
    NAVIGATION_CONFIG.forEach((item) => {
      if (item.children && item.children.length > 0) {
        initial[item.id] = true;
      }
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync dengan context jika menuVisibility dari luar (misal: realtime sync) berubah
  React.useEffect(() => {
    setLocalVisibility({ ...menuVisibility });
    setHasUnsavedChanges(false);
  }, [menuVisibility]);

  // Statistik navigasi dinamis
  const stats = useMemo(() => {
    return getNavigationStats(localVisibility);
  }, [localVisibility]);

  // Toggle satu menu atau sub-menu
  const handleToggleItem = (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const updated = {
      ...localVisibility,
      [id]: nextStatus,
    };
    setLocalVisibility(updated);
    setHasUnsavedChanges(true);
  };

  // Toggle semua sub-menu dari suatu parent
  const handleToggleAllChildren = (parent: NavigationItem, enableAll: boolean) => {
    if (!parent.children) return;
    const updated = { ...localVisibility };
    parent.children.forEach((child) => {
      updated[child.id] = enableAll;
    });
    // Pastikan parent juga aktif jika sub-menunya diaktifkan
    if (enableAll) {
      updated[parent.id] = true;
    }
    setLocalVisibility(updated);
    setHasUnsavedChanges(true);
  };

  // Aktifkan semua menu & sub-menu
  const handleEnableAll = () => {
    const updated: MenuVisibilityMap = {};
    NAVIGATION_CONFIG.forEach((item) => {
      updated[item.id] = true;
      if (item.children) {
        item.children.forEach((child) => {
          updated[child.id] = true;
        });
      }
    });
    setLocalVisibility(updated);
    setHasUnsavedChanges(true);
    showToast('Seluruh menu dan sub menu disiapkan untuk aktif.', 'info');
  };

  // Reset ke pengaturan bawaan
  const handleResetToDefault = async () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh pengaturan visibilitas menu ke kondisi bawaan (semua aktif)?')) {
      setIsSaving(true);
      try {
        const success = await resetMenuVisibility();
        if (success) {
          showToast('Pengaturan menu berhasil direset ke kondisi bawaan.', 'success');
          setHasUnsavedChanges(false);
        } else {
          showToast('Pengaturan menu direset di penyimpanan lokal.', 'info');
        }
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Simpan perubahan ke database Supabase dan LocalStorage
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const success = await updateMenuVisibility(localVisibility);
      if (success) {
        showToast('Pengaturan tampilan menu berhasil disimpan dan disinkronkan ke website!', 'success');
        setHasUnsavedChanges(false);
      } else {
        showToast('Pengaturan disimpan di penyimpanan lokal browser.', 'info');
        setHasUnsavedChanges(false);
      }
    } catch (err: any) {
      showToast(`Gagal menyimpan pengaturan: ${err.message || 'Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle ekspansi folder submenu
  const toggleExpand = (parentId: string) => {
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  // Filter daftar menu berdasarkan pencarian & filter tipe
  const filteredNavItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return NAVIGATION_CONFIG.filter((item) => {
      // Filter teks (judul, deskripsi, path, anak)
      const matchesParent =
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query);

      const matchesChildren = item.children?.some(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.path.toLowerCase().includes(query)
      );

      const textMatch = query === '' || matchesParent || matchesChildren;
      if (!textMatch) return false;

      // Filter tipe
      if (filterType === 'all') return true;
      if (filterType === 'has-children') return Boolean(item.children && item.children.length > 0);

      const parentActive = isParentActive(localVisibility, item);
      if (filterType === 'active') return parentActive;
      if (filterType === 'disabled') return !parentActive;

      return true;
    });
  }, [searchQuery, filterType, localVisibility]);

  // Helper render ikon
  const renderItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Home':
        return <Home className="w-4 h-4" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      case 'FileCheck':
        return <FileCheck className="w-4 h-4" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'BellRing':
        return <BellRing className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'ImageIcon':
        return <ImageIcon className="w-4 h-4" />;
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Card Utama */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Sliders className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Hak Akses Khusus Super Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pengaturan Tampilan Menu & Sub Menu
            </h1>
            <p className="text-blue-100 text-sm leading-relaxed">
              Atur dan kontrol penuh visibilitas setiap menu utama dan sub-menu yang akan ditampilkan di website publik.
              Jika suatu sub-menu dinonaktifkan (misalnya <strong className="text-white underline decoration-amber-400">Unduh Berkas</strong>), 
              sub-menu tersebut otomatis tidak akan muncul pada dropdown navigasi website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-md cursor-pointer disabled:opacity-50"
              title="Reset seluruh menu ke kondisi aktif bawaan"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Bawaan</span>
            </button>

            <button
              type="button"
              onClick={handleEnableAll}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 backdrop-blur-md cursor-pointer disabled:opacity-50"
              title="Aktifkan semua menu dan sub-menu"
            >
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Aktifkan Semua</span>
            </button>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving || !hasUnsavedChanges}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-amber-500/30 ring-2 ring-amber-300 animate-pulse'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-900/30'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{hasUnsavedChanges ? 'Simpan Perubahan' : 'Tersimpan'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Banner Otomasi Deteksi Sistem */}
        <div className="mt-6 pt-5 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200 block font-medium">Menu Utama Terdeteksi</span>
              <span className="text-xl font-black text-white">{stats.totalParents} Menu</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20 text-blue-100">
              {stats.activeParents} Aktif
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200 block font-medium">Sub Menu Terdeteksi</span>
              <span className="text-xl font-black text-white">{stats.totalSubmenus} Sub Menu</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20 text-blue-100">
              {stats.activeSubmenus} Aktif
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200 block font-medium">Total Navigasi</span>
              <span className="text-xl font-black text-white">{stats.totalAll} Item</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-400 text-slate-900">
              {stats.activeAll} Aktif
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-blue-200 block font-medium">Dinonaktifkan</span>
              <span className="text-xl font-black text-amber-300">{stats.disabledCount} Item</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              stats.disabledCount > 0 ? 'bg-amber-400 text-slate-900' : 'bg-white/20 text-blue-100'
            }`}>
              {stats.disabledCount > 0 ? 'Disembunyikan' : 'Semua Tampil'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Notifikasi Deteksi Dinamis & Unsaved Changes Alert */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-900 leading-relaxed">
          <strong className="font-bold">Deteksi Dinamis Terintegrasi:</strong> Menu di halaman ini membaca secara otomatis dari registry sistem navigasi website. 
          Jika sewaktu-waktu ditambahkan menu atau sub-menu baru di sistem, sistem akan langsung <strong>mendeteksi dan menampilkannya secara otomatis</strong> di panel ini 
          sehingga Super Admin dapat langsung mengontrolnya tanpa pengaturan tambahan.
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Terdapat perubahan pengaturan visibilitas menu yang belum disimpan ke Supabase Cloud.</span>
          </div>
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Sekarang'}
          </button>
        </div>
      )}

      {/* 4. Toolbar Pencarian & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu, sub-menu, atau path (misal: unduh, profil)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({stats.totalParents})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('has-children')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'has-children'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Memiliki Sub Menu
          </button>

          <button
            type="button"
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'active'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tampil ({stats.activeParents})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('disabled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'disabled'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Disembunyikan ({stats.totalParents - stats.activeParents})
          </button>
        </div>
      </div>

      {/* 5. Daftar Kartu Menu & Sub Menu */}
      <div className="space-y-4">
        {filteredNavItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Tidak ada menu yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Tidak ditemukan menu atau sub menu dengan kata kunci "{searchQuery}". Silakan coba kata kunci lain.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Hapus Filter
            </button>
          </div>
        ) : (
          filteredNavItems.map((item, idx) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isDirectActive = isItemActive(localVisibility, item.id);
            const isParentVisible = isParentActive(localVisibility, item);
            const isExpanded = expandedParents[item.id] !== false;

            // Hitung sub menu aktif
            const activeChildrenCount = item.children
              ? item.children.filter((c) => isItemActive(localVisibility, c.id)).length
              : 0;
            const totalChildrenCount = item.children?.length || 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isParentVisible
                    ? 'border-slate-200 hover:border-blue-300'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                {/* Header Menu Utama */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Badge Nomor & Ikon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                      isParentVisible
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {renderItemIcon(item.iconName)}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                          {idx + 1}. {item.label}
                        </span>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {item.path}
                        </span>

                        {hasChildren ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            activeChildrenCount > 0
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}>
                            Dropdown ({activeChildrenCount}/{totalChildrenCount} Sub Menu Aktif)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Menu Tunggal
                          </span>
                        )}

                        {isParentVisible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Tampil di Website</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Disembunyikan</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Kontrol Toggle Menu Utama */}
                  <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                        title={isExpanded ? 'Sembunyikan daftar sub-menu' : 'Buka daftar sub-menu'}
                      >
                        <span>Sub Menu ({totalChildrenCount})</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} />
                      </button>
                    )}

                    {/* Master Switch untuk Menu Utama */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                      <span className={`text-xs font-bold ${isDirectActive ? 'text-slate-800' : 'text-slate-400'}`}>
                        {isDirectActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleItem(item.id, isDirectActive)}
                        aria-label={`Toggle menu ${item.label}`}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                          isDirectActive ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isDirectActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sub Menu Container (Jika Memiliki Children dan Diperluas) */}
                {hasChildren && isExpanded && item.children && (
                  <div className="bg-slate-50/80 border-t border-slate-100 px-4 sm:px-6 py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Daftar Sub Menu dari "{item.label}":
                        </span>
                        {!isDirectActive && (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            (Menu induk nonaktif: seluruh sub menu otomatis tertutup)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleAllChildren(item, true)}
                          className="text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                        >
                          Aktifkan Semua
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          type="button"
                          onClick={() => handleToggleAllChildren(item, false)}
                          className="text-slate-500 hover:text-slate-700 font-medium hover:underline cursor-pointer"
                        >
                          Matikan Semua
                        </button>
                      </div>
                    </div>

                    {/* Sub Item Rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                      {item.children.map((child, cIdx) => {
                        const isChildActive = isItemActive(localVisibility, child.id);
                        const isChildActuallyShown = isChildActive && isDirectActive;

                        return (
                          <div
                            key={child.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                              isChildActuallyShown
                                ? 'bg-white border-slate-200 shadow-xs hover:border-blue-300'
                                : 'bg-slate-100/70 border-slate-200/80 opacity-75'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-900">
                                  {cIdx + 1}. {child.label}
                                </span>

                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                  {child.path}
                                </span>

                                {isChildActuallyShown ? (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    Aktif
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                    {isDirectActive ? 'Nonaktif' : 'Induk Mati'}
                                  </span>
                                )}
                              </div>

                              <p className="text-[11px] text-slate-500 leading-normal">
                                {child.description}
                              </p>
                            </div>

                            {/* Switch untuk Sub Menu */}
                            <div className="shrink-0 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleToggleItem(child.id, isChildActive)}
                                aria-label={`Toggle sub-menu ${child.label}`}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                                  isChildActive ? 'bg-blue-600' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isChildActive ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 6. Sticky Bottom Save Bar saat ada perubahan */}
      {hasUnsavedChanges && (
        <div className="sticky bottom-4 z-30 bg-slate-900/90 text-white backdrop-blur-md rounded-2xl p-4 px-6 shadow-2xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-white">
                Perubahan pengaturan visibilitas menu belum disimpan ke Supabase Cloud
              </p>
              <p className="text-[11px] text-slate-300">
                Klik tombol "Simpan Perubahan" agar website publik segera menampilkan susunan menu terbaru.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setLocalVisibility({ ...menuVisibility });
                setHasUnsavedChanges(false);
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Batalkan
            </button>

            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
