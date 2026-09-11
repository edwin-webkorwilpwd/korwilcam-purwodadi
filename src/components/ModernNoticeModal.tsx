import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const ModernNoticeModal: React.FC = () => {
  const { 
    confirmDialogState, 
    closeConfirmDialog, 
    handleConfirmResponse,
    noticePopupState,
    closeNoticePopup 
  } = useApp();

  // Auto close progress bar for notice popup
  const [noticeProgress, setNoticeProgress] = useState(100);

  useEffect(() => {
    if (!noticePopupState) {
      setNoticeProgress(100);
      return;
    }

    const duration = noticePopupState.duration || 3000;
    const intervalTime = 50;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setNoticeProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          closeNoticePopup();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [noticePopupState, closeNoticePopup]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDialogState) {
          handleConfirmResponse(false);
        } else if (noticePopupState) {
          closeNoticePopup();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialogState, noticePopupState, handleConfirmResponse, closeNoticePopup]);

  // 1. RENDER CONFIRMATION DIALOG (MODAL INTERAKTIF)
  if (confirmDialogState) {
    const { 
      title, 
      message, 
      type = 'delete', 
      confirmText, 
      cancelText = 'Tidak, Batalkan', 
      itemName 
    } = confirmDialogState;

    const isDelete = type === 'delete' || type === 'danger';
    const isEdit = type === 'edit';
    const isSave = type === 'save';

    const defaultConfirmText = isDelete ? 'Ya, Hapus Sekarang' : isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Simpan Semua';
    const finalConfirmText = confirmText || defaultConfirmText;

    return (
      <div 
        className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={() => handleConfirmResponse(false)}
      >
        <div 
          className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.85)] p-6 sm:p-8 max-w-md w-full text-center overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow Backdrop */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-25 ${
              isDelete ? 'bg-rose-500' : isEdit ? 'bg-blue-500' : 'bg-emerald-500'
            }`} 
          />

          {/* Close Button Top Right */}
          <button
            onClick={() => handleConfirmResponse(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Animated Logo Icon */}
          <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-5">
            {/* Pulsing Ripple Effect */}
            <div 
              className={`absolute inset-0 rounded-full animate-ping opacity-30 ${
                isDelete ? 'bg-rose-500' : isEdit ? 'bg-blue-500' : 'bg-emerald-500'
              }`} 
            />
            {/* Outer Halo */}
            <div 
              className={`absolute -inset-1.5 rounded-full blur-md opacity-40 ${
                isDelete ? 'bg-rose-500' : isEdit ? 'bg-blue-500' : 'bg-emerald-500'
              }`} 
            />

            {/* Core Icon Box */}
            <div 
              className={`relative w-18 h-18 rounded-2xl flex items-center justify-center shadow-xl border ${
                isDelete
                  ? 'bg-gradient-to-br from-rose-500 to-red-700 text-white shadow-rose-600/40 border-rose-300/40'
                  : isEdit
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-blue-600/40 border-blue-300/40'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-600/40 border-emerald-300/40'
              }`}
            >
              {isDelete ? (
                <Trash2 className="w-9 h-9 animate-bounce" />
              ) : isEdit ? (
                <Edit3 className="w-9 h-9 animate-pulse" />
              ) : (
                <Save className="w-9 h-9 animate-pulse" />
              )}
            </div>
          </div>

          {/* Header & Title */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 border ${
            isDelete 
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
              : isEdit 
              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' 
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
          }`}>
            {isDelete ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Peringatan Penghapusan Data</span>
              </>
            ) : isEdit ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Konfirmasi Pembaruan Data</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Konfirmasi Penyimpanan</span>
              </>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
            {message}
          </p>

          {/* Item Target Card (if specified) */}
          {itemName && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                Target Data:
              </span>
              <p className="text-xs font-bold text-white truncate">
                {itemName}
              </p>
            </div>
          )}

          {/* Warning notice note for delete */}
          {isDelete && (
            <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-rose-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Tindakan ini permanen dan tidak dapat dibatalkan.</span>
            </div>
          )}

          {/* Action Buttons: Ya vs Tidak */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col-reverse sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => handleConfirmResponse(false)}
              className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all border border-slate-700/80 shadow-sm"
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={() => handleConfirmResponse(true)}
              className={`w-full sm:w-1/2 py-2.5 px-4 rounded-xl text-xs font-black transition-all shadow-lg flex items-center justify-center gap-2 ${
                isDelete
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-[1.02] active:scale-[0.98]'
                  : isEdit
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              <span>{finalConfirmText}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. RENDER NOTICE POPUP (POPUP NOTIFIKASI SUKSES / PERINGATAN DENGAN ANIMASI CENTANG)
  if (noticePopupState) {
    const { title, message, type = 'success' } = noticePopupState;
    const isSuccess = type === 'success';
    const isWarning = type === 'warning';
    const isError = type === 'error';

    return (
      <div 
        className="fixed inset-0 z-[110] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        onClick={closeNoticePopup}
      >
        <div 
          className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 max-w-sm w-full text-center overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Ambient Glow */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30 ${
              isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
            }`} 
          />

          {/* Close Button Top Right */}
          <button
            onClick={closeNoticePopup}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Centang Sukses / Warning Logo */}
          <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-4">
            {/* Pulsing Ripple Effect */}
            <div 
              className={`absolute inset-0 rounded-full animate-ping opacity-35 ${
                isSuccess ? 'bg-emerald-500' : isWarning ? 'bg-amber-500' : 'bg-rose-500'
              }`} 
            />

            {/* Glowing Ring */}
            <div 
              className={`absolute -inset-1.5 rounded-full blur-md opacity-50 ${
                isSuccess ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-rose-400'
              }`} 
            />

            {/* Core Animated Checkmark */}
            <div 
              className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-2 ${
                isSuccess
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-emerald-500/50 border-emerald-300 animate-in zoom-in-50 duration-300'
                  : isWarning
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/50 border-amber-300'
                  : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/50 border-rose-300'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-9 h-9 animate-bounce" />
              ) : isWarning ? (
                <AlertTriangle className="w-8 h-8 animate-pulse" />
              ) : (
                <AlertCircle className="w-8 h-8 animate-pulse" />
              )}
            </div>
          </div>

          <h3 className="text-lg font-black text-white tracking-tight">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            {message}
          </p>

          {/* Progress Bar (Auto dismiss indicator) */}
          <div className="w-full bg-slate-800/80 rounded-full h-1 mt-5 overflow-hidden">
            <div 
              className={`h-full transition-all duration-75 ${
                isSuccess ? 'bg-emerald-400' : isWarning ? 'bg-amber-400' : 'bg-rose-400'
              }`}
              style={{ width: `${noticeProgress}%` }}
            />
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={closeNoticePopup}
            className="mt-4 w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700/80"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return null;
};
