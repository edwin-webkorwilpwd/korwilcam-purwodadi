import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  Power, 
  Eye, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  ShieldCheck,
  X
} from 'lucide-react';
import { MaintenancePage } from '../../pages/MaintenancePage';

export const MaintenanceCMS: React.FC = () => {
  const { 
    maintenanceConfig, 
    updateMaintenanceConfig, 
    showToast,
    currentUser 
  } = useApp();

  const [formConfig, setFormConfig] = useState({
    title: maintenanceConfig?.title || 'Mohon Maaf 🙏',
    message: maintenanceConfig?.message || 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺',
    subMessage: maintenanceConfig?.subMessage || 'Kami akan segera perbaiki kembali secepatnya.'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingToggleState, setPendingToggleState] = useState<boolean>(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const isCurrentActive = Boolean(maintenanceConfig?.isEnabled);

  const handleRequestToggle = (targetState: boolean) => {
    setPendingToggleState(targetState);
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    setIsSaving(true);
    setShowConfirmModal(false);
    try {
      const success = await updateMaintenanceConfig({
        isEnabled: pendingToggleState,
        ...formConfig,
        updatedBy: currentUser?.name || 'Super Admin'
      });
      if (success) {
        showToast(
          pendingToggleState
            ? 'Mode Maintenance berhasil DIAKTIFKAN! Seluruh akses website publik telah ditutup.'
            : 'Mode Maintenance berhasil DINONAKTIFKAN! Website kini kembali aktif dan dapat diakses publik.',
          pendingToggleState ? 'info' : 'success'
        );
      } else {
        showToast('Gagal memperbarui status maintenance ke cloud.', 'error');
      }
    } catch (e: any) {
      showToast(`Terjadi kesalahan: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveText = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const success = await updateMaintenanceConfig({
        title: formConfig.title.trim() || 'Mohon Maaf 🙏',
        message: formConfig.message.trim() || 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺',
        subMessage: formConfig.subMessage.trim() || 'Kami akan segera perbaiki kembali secepatnya.',
        updatedBy: currentUser?.name || 'Super Admin'
      });
      if (success) {
        showToast('Teks pesan maintenance berhasil disimpan ke Supabase Cloud!', 'success');
      } else {
        showToast('Gagal menyimpan teks pesan maintenance.', 'error');
      }
    } catch (e: any) {
      showToast(`Terjadi kesalahan: ${e.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setFormConfig({
      title: 'Mohon Maaf 🙏',
      message: 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺',
      subMessage: 'Kami akan segera perbaiki kembali secepatnya.'
    });
    showToast('Teks dikembalikan ke format default.', 'info');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* 1. Header Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Mode Maintenance Website
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Super Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Saklar darurat untuk menutup sementara akses publik saat pembenahan atau perbaikan isi website berlangsung.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFullPreview(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shrink-0"
        >
          <Eye className="w-4 h-4 text-blue-600" />
          <span>Pratinjau Layar Penuh</span>
        </button>
      </div>

      {/* 2. Main Master Switch Card */}
      <div className={`rounded-3xl p-6 sm:p-8 border shadow-lg transition-all duration-300 ${
        isCurrentActive 
          ? 'bg-gradient-to-br from-amber-50 via-rose-50/40 to-amber-100/60 border-amber-300 shadow-amber-500/10'
          : 'bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-blue-50/40 border-emerald-200 shadow-emerald-500/10'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
              {isCurrentActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs animate-pulse shadow-md shadow-rose-600/30">
                  <AlertTriangle className="w-4 h-4" />
                  MODE MAINTENANCE SEDANG AKTIF
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-600/30">
                  <CheckCircle2 className="w-4 h-4" />
                  MODE NORMAL (WEBSITE DAPAT DIAKSES PUBLIK)
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              {isCurrentActive 
                ? 'Website Ditutup Untuk Publik (Halaman Maintenance Ditampilkan)' 
                : 'Website Aktif Normal (Seluruh Menu & Isi Halaman Berfungsi)'}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isCurrentActive ? (
                <span className="text-rose-900 font-medium">
                  Saat ini seluruh pengunjung umum yang membuka tautan website Korwilcam Purwodadi 
                  akan dialihkan ke 1 halaman penuh pemeliharaan sistem (Maintenance). Semua data dan menu publik tertutup rapi.
                </span>
              ) : (
                <span>
                  Ketika Anda mengaktifkan saklar ini, semua menu dan isi website akan disembunyikan total 
                  dan digantikan oleh 1 halaman penuh maintenance resmi sesuai dengan panduan visual Anda.
                </span>
              )}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Super Admin tetap dapat login dan mengakses Panel CMS secara penuh saat mode ini aktif.</span>
            </div>
          </div>

          {/* Big Toggle Switch Button */}
          <div className="flex flex-col items-center gap-2 self-stretch sm:self-auto sm:shrink-0 justify-center bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-xs font-bold text-slate-700">
              Saklar Mode Maintenance:
            </span>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRequestToggle(!isCurrentActive)}
              className={`relative inline-flex h-11 w-24 items-center rounded-full transition-colors duration-300 focus:outline-hidden cursor-pointer shadow-inner ${
                isCurrentActive ? 'bg-rose-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isCurrentActive}
              title={isCurrentActive ? "Nonaktifkan Mode Maintenance" : "Aktifkan Mode Maintenance"}
            >
              <span
                className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
                  isCurrentActive ? 'translate-x-14 text-rose-600' : 'translate-x-1.5 text-slate-400'
                }`}
              >
                <Power className="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>
            <span className={`text-[11px] font-black uppercase tracking-wider ${
              isCurrentActive ? 'text-rose-600' : 'text-slate-500'
            }`}>
              {isCurrentActive ? 'STATUS: AKTIF' : 'STATUS: NONAKTIF'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Form Pengaturan Teks Pesan Maintenance & Live Mini Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Edit Teks */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kustomisasi Pesan Halaman Maintenance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sesuaikan kalimat permohonan maaf dan informasi pemeliharaan yang tampil di layar pengunjung.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              title="Reset ke Teks Bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          </div>

          <form onSubmit={handleSaveText} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Judul Utama (Headline)
              </label>
              <input
                type="text"
                value={formConfig.title}
                onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                placeholder="Mohon Maaf 🙏"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pesan Utama Pemeliharaan
              </label>
              <textarea
                rows={3}
                value={formConfig.message}
                onChange={(e) => setFormConfig({ ...formConfig, message: e.target.value })}
                placeholder="Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800 resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Sub-Pesan / Keterangan Lanjutan
              </label>
              <input
                type="text"
                value={formConfig.subMessage}
                onChange={(e) => setFormConfig({ ...formConfig, subMessage: e.target.value })}
                placeholder="Kami akan segera perbaiki kembali secepatnya."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-800"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pesan ke Cloud</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Mini Preview */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-600" />
              Pratinjau Tampilan Pengunjung
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live Render</span>
          </div>

          {/* Mini Preview Container */}
          <div className="flex-1 bg-gradient-to-br from-[#0c1a3b] via-[#142a5c] to-[#091530] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-slate-800 relative overflow-hidden select-none border border-slate-700 shadow-inner">
            <div className="w-full bg-white/95 backdrop-blur-xs border border-white/20 rounded-2xl p-4 flex flex-col items-center shadow-2xl">
              <img 
                src="/maintenance-illustration-crop.png" 
                alt="Ilustrasi Maintenance" 
                className="w-40 h-auto object-contain mx-auto mb-2"
              />
              <img 
                src="/logo.png" 
                alt="Logo Grobogan" 
                className="w-10 h-12 object-contain mx-auto mb-2"
              />
              <div className="text-sm font-extrabold text-slate-900 mb-1">
                {formConfig.title || 'Mohon Maaf 🙏'}
              </div>
              <div className="text-[11px] text-slate-600 font-semibold leading-tight mb-2 max-w-xs">
                {formConfig.message || 'Sistem kami sedang dalam proses pemeliharaan berkala. SABAR 🥺'}
              </div>
              <div className="my-1.5">
                <div className="w-6 h-6 border-[2.5px] border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <div className="text-[10px] text-slate-500 mb-2.5">
                {formConfig.subMessage || 'Kami akan segera perbaiki kembali secepatnya.'}
              </div>
              <div className="text-[9px] font-bold text-white bg-[#1c3f7e] px-4 py-1 rounded-full tracking-wider uppercase shadow-xs">
                ADMIN KORWILCAM PURWODADI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Confirmation Modal Switch */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center ${
              pendingToggleState ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {pendingToggleState ? (
                <AlertTriangle className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">
                {pendingToggleState 
                  ? 'Aktifkan Mode Maintenance?' 
                  : 'Nonaktifkan Mode Maintenance?'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {pendingToggleState ? (
                  <span>
                    Setelah diaktifkan, <strong>seluruh halaman website publik akan langsung ditutup</strong> dan 
                    pengunjung akan melihat 1 halaman penuh pemeliharaan sistem.
                  </span>
                ) : (
                  <span>
                    Setelah dinonaktifkan, <strong>website akan kembali dibuka untuk publik</strong> dan seluruh 
                    konten dapat diakses kembali secara normal.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmToggle}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md cursor-pointer ${
                  pendingToggleState 
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {pendingToggleState ? 'Ya, Aktifkan Maintenance' : 'Ya, Buka Website Kembali'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Fullscreen Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 z-50 bg-[#0c1a3b] overflow-y-auto">
          <div className="fixed top-4 right-4 z-50">
            <button
              type="button"
              onClick={() => setShowFullPreview(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md border border-white/20 cursor-pointer shadow-lg"
            >
              <X className="w-4 h-4" />
              <span>Tutup Pratinjau</span>
            </button>
          </div>
          <MaintenancePage 
            config={{
              isEnabled: true,
              title: formConfig.title,
              message: formConfig.message,
              subMessage: formConfig.subMessage
            }}
          />
        </div>
      )}
    </div>
  );
};
