import React from 'react';

interface CurvedHeaderArchProps {
  fillColor?: string;
  className?: string;
}

/**
 * Komponen pembatas lengkungan estetis untuk bagian bawah header biru (persis gambar referensi).
 * Menggunakan SVG quadratic bezier curve yang melengkung halus ke atas di bagian tengah.
 */
export const CurvedHeaderArch: React.FC<CurvedHeaderArchProps> = ({
  fillColor = 'text-slate-50',
  className = '',
}) => {
  return (
    <div className={`absolute left-0 right-0 bottom-0 overflow-hidden leading-none pointer-events-none z-10 ${className}`}>
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        className={`relative block w-full h-6 sm:h-9 md:h-11 fill-current ${fillColor}`}
      >
        <path d="M0,70 L0,45 Q720,0 1440,45 L1440,70 Z" />
      </svg>
    </div>
  );
};
