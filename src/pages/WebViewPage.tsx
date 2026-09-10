import React, { useState, useEffect } from 'react';

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
  // Jika URL ini sudah pernah selesai dimuat dalam sesi tab browser ini, jangan tampilkan loading lagi
  const [isLoading, setIsLoading] = useState<boolean>(() => !loadedUrlsSession.has(url));

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

  const handleIframeLoad = () => {
    loadedUrlsSession.add(url);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full flex-1 relative overflow-hidden bg-white flex flex-col">
      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3 text-slate-800">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
            Memuat {title}...
          </p>
        </div>
      )}

      {/* Embedded Iframe Container */}
      <div className="w-full h-full flex-1 relative overflow-hidden">
        <iframe
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
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        />
      </div>
    </div>
  );
};
