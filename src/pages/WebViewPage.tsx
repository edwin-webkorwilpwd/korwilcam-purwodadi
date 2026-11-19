import React, { useState, useEffect, useRef, useCallback } from 'react';
import { parseKaryakuPath } from '../lib/karyakuHelper';

interface WebViewPageProps {
  title: string;
  url: string;
  description?: string;
  category?: string;
  icon?: any;
  cropTop?: number;
}

// Menyimpan daftar URL yang sudah selesai dimuat dalam sesi tab browser saat ini
const loadedUrlsSession = new Set<string>();

export const WebViewPage: React.FC<WebViewPageProps> = ({
  title,
  url,
  cropTop = 0
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isKaryaku = url.includes('pustakapwd.blogspot.com') || title.toLowerCase().includes('karyaku');
  const pollTimerRef = useRef<any>(null);

  // Jika URL ini sudah pernah selesai dimuat dalam sesi tab browser ini, jangan tampilkan loading lagi
  const [isLoading, setIsLoading] = useState<boolean>(() => !loadedUrlsSession.has(url));

  // Fungsi untuk mengirim sinyal navigasi ke iframe Karyaku dengan polling adaptif
  const syncKaryakuView = useCallback(() => {
    if (!isKaryaku || typeof window === 'undefined') return;
    if (!window.location.pathname.startsWith('/karyaku')) return;

    const routeInfo = parseKaryakuPath(window.location.pathname);

    // Hentikan interval sinkronisasi sebelumnya jika sedang berjalan
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (routeInfo.view === 'reader' && (routeInfo.bookTitleSlug || routeInfo.username)) {
      let attempts = 0;
      const maxAttempts = 40; // 40 x 300ms = 12 detik batas tunggu data buku dari Google Sheet

      const sendReaderMessage = () => {
        attempts++;
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'KARYAKU_OPEN_READER',
            username: routeInfo.username,
            bookTitle: routeInfo.bookTitleSlug
          }, '*');
        }

        if (attempts >= maxAttempts) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setIsLoading(false);
        }
      };

      sendReaderMessage();
      pollTimerRef.current = setInterval(sendReaderMessage, 300);
    } else if (routeInfo.view === 'author' && routeInfo.username) {
      let attempts = 0;
      const maxAttempts = 40;

      const sendAuthorMessage = () => {
        attempts++;
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'KARYAKU_OPEN_AUTHOR',
            username: routeInfo.username
          }, '*');
        }

        if (attempts >= maxAttempts) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setIsLoading(false);
        }
      };

      sendAuthorMessage();
      pollTimerRef.current = setInterval(sendAuthorMessage, 300);
    } else if (routeInfo.view === 'catalog') {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'KARYAKU_OPEN_CATALOG'
        }, '*');
      }
    }
  }, [isKaryaku]);

  useEffect(() => {
    if (loadedUrlsSession.has(url)) {
      setIsLoading(false);
      return;
    }

    // Safety fallback timer: jika koneksi eksternal lambat atau sinyal onLoad tertahan skrip pihak ketiga,
    // tetap hilangkan spinner setelah beberapa detik agar tampilan langsung bisa diakses pengguna
    const timer = setTimeout(() => {
      loadedUrlsSession.add(url);
      setIsLoading(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [url]);

  // Dengarkan pesan konfirmasi (ACK) dari e-reader iframe Karyaku
  useEffect(() => {
    if (!isKaryaku) return;

    const handleKaryakuResponse = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'KARYAKU_NAVIGATE') {
        const routeInfo = parseKaryakuPath(window.location.pathname);
        // Jika reader atau author berhasil dibuka di dalam iframe, segera stop interval polling
        if (
          (event.data.view === 'reader' && routeInfo.view === 'reader') ||
          (event.data.view === 'author' && routeInfo.view === 'author') ||
          (event.data.view === 'catalog' && routeInfo.view === 'catalog')
        ) {
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current);
            pollTimerRef.current = null;
          }
          setIsLoading(false);
        }
      }
    };

    window.addEventListener('message', handleKaryakuResponse);
    return () => {
      window.removeEventListener('message', handleKaryakuResponse);
    };
  }, [isKaryaku]);

  // Dengarkan event navigasi URL (popstate, hashchange, dan karyaku-route-change)
  useEffect(() => {
    if (!isKaryaku) return;

    const handleNavigationChange = () => {
      syncKaryakuView();
    };

    window.addEventListener('popstate', handleNavigationChange);
    window.addEventListener('hashchange', handleNavigationChange);
    window.addEventListener('karyaku-route-change', handleNavigationChange);

    return () => {
      window.removeEventListener('popstate', handleNavigationChange);
      window.removeEventListener('hashchange', handleNavigationChange);
      window.removeEventListener('karyaku-route-change', handleNavigationChange);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [isKaryaku, syncKaryakuView]);

  const handleIframeLoad = () => {
    loadedUrlsSession.add(url);

    // Jalankan sinkronisasi segera setelah iframe selesai dimuat
    if (isKaryaku) {
      syncKaryakuView();
      // Pastikan loading spinner selesai setelah maksimal 2.5 detik jika tidak ada ACK
      setTimeout(() => {
        setIsLoading(false);
      }, 2500);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex-1 relative overflow-hidden bg-white flex flex-col">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3 text-slate-800">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-slate-700 font-semibold">
            Memuat {title}...
          </p>
        </div>
      )}

      {/* Embedded Iframe Container */}
      <div className="w-full h-full flex-1 relative overflow-hidden bg-white">
        <iframe
          ref={iframeRef}
          src={url}
          title={title}
          onLoad={handleIframeLoad}
          style={
            cropTop > 0
               ? {
                  position: 'absolute',
                  top: `-${cropTop}px`,
                  left: 0,
                  width: '100%',
                  height: `calc(100% + ${cropTop}px)`,
                  border: 'none',
                  backgroundColor: '#ffffff'
                }
              : {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#ffffff'
                }
          }
          className="w-full h-full border-0 bg-white"
          allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
};
