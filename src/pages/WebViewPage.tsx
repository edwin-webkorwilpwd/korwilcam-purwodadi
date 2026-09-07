import React, { useState } from 'react';

interface WebViewPageProps {
  title: string;
  url: string;
  description?: string;
  category?: string;
  icon?: any;
  cropTop?: number;
}

export const WebViewPage: React.FC<WebViewPageProps> = ({
  title,
  url,
  cropTop = 0
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
          onLoad={() => setIsLoading(false)}
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
