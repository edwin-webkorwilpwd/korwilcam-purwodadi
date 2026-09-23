import React, { useState, useEffect } from 'react';
import { Bell, X, Check, ShieldCheck } from 'lucide-react';

export const NotificationPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Bersihkan sesi lama jika ada
    try {
      sessionStorage.removeItem('korwilcam_notif_dismissed');
    } catch {
      // ignore
    }

    // Cek apakah browser mendukung Notifications
    if (!('Notification' in window)) return;

    // 1. JIKA SUDAH MENGIZINKAN: Jangan tampilkan popup sama sekali!
    if (Notification.permission === 'granted') {
      setIsSubscribed(true);
      setIsVisible(false);
      return;
    }

    // 2. Pasang listener resmi OneSignal SDK jika status izin berubah
    if ((window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push((OneSignal: any) => {
        try {
          if (OneSignal?.Notifications?.addEventListener) {
            OneSignal.Notifications.addEventListener('permissionChange', (permission: boolean) => {
              if (permission) {
                setIsSubscribed(true);
                setIsVisible(false);
              }
            });
          }
        } catch {
          // ignore
        }
      });
    }

    // 3. JIKA BELUM MENGIZINKAN: Tampilkan popup setelah jeda 3 detik
    // Setiap kali halaman dibuka / direload, popup akan selalu muncul sampai pengguna mengizinkan
    const timer = setTimeout(() => {
      if (Notification.permission !== 'granted') {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleRequestPermission = async () => {
    setIsRequesting(true);

    // Langsung sembunyikan popup agar tidak menghalangi dialog browser / layar pengguna
    setIsVisible(false);

    try {
      if (typeof window !== 'undefined' && (window as any).OneSignalDeferred) {
        (window as any).OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            if (OneSignal?.Notifications?.requestPermission) {
              await OneSignal.Notifications.requestPermission();
            } else if ('Notification' in window) {
              await Notification.requestPermission();
            }
          } catch (err) {
            console.warn('OneSignal requestPermission warning:', err);
            if ('Notification' in window) {
              try {
                await Notification.requestPermission();
              } catch {
                // ignore
              }
            }
          }

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            setIsSubscribed(true);
          }
        });
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const res = await Notification.requestPermission();
          if (res === 'granted') {
            setIsSubscribed(true);
          }
        } catch (err) {
          console.warn('Browser Notification requestPermission error:', err);
        }
      }
    } catch (err) {
      console.warn('Gagal meminta izin notifikasi:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    // Sembunyikan popup saat pengguna mengklik 'Nanti Saja' atau tanda silang
    setIsVisible(false);
  };

  // Jika tidak visible atau perangkat sudah mengizinkan notifikasi, tidak me-render apapun
  if (!isVisible || isSubscribed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xl border border-blue-100 ring-4 ring-blue-600/10 flex flex-col gap-3.5 relative">
        {/* Tombol Tutup */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          title="Nanti saja"
          aria-label="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Konten Utama */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1b56ce] to-[#109de8] text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Pemberitahuan Resmi</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Dinas
              </span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Aktifkan notifikasi di layar HP Anda agar tidak tertinggal surat edaran dinas, info sertifikasi, dan pengumuman pendidikan penting.
            </p>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleRequestPermission}
            disabled={isRequesting}
            className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-[#1b56ce] to-[#2467ea] hover:from-[#174bb7] hover:to-[#1b56ce] text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-98 disabled:opacity-50"
          >
            {isRequesting ? (
              <span>Memproses...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Aktifkan Notifikasi</span>
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  );
};
