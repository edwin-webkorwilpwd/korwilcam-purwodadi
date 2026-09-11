import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Users, 
  GraduationCap, 
  Star, 
  Building2, 
  Share2, 
  ExternalLink,
  ZoomIn,
  Maximize2
} from 'lucide-react';
import { getGoogleMapsUrl } from '../lib/coordinates';
import { getGoogleDriveCandidates, isGoogleDriveUrl } from '../lib/driveHelper';

export const ModalDetailSchool: React.FC = () => {
  const { selectedSchool, setSelectedSchool, showToast } = useApp();
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const rawImage = selectedSchool?.image?.trim() || '';
  const candidates = useMemo(() => {
    if (!rawImage || rawImage.includes('photo-1580582932707')) return [];
    if (isGoogleDriveUrl(rawImage)) {
      return getGoogleDriveCandidates(rawImage);
    }
    return [rawImage];
  }, [rawImage]);

  useEffect(() => {
    setCandidateIndex(0);
    setIsImageZoomed(false);
  }, [rawImage, selectedSchool]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isImageZoomed) {
          setIsImageZoomed(false);
        } else {
          setSelectedSchool(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isImageZoomed, setSelectedSchool]);

  if (!selectedSchool) return null;

  const currentSrc = candidates[candidateIndex];
  const hasImage = Boolean(currentSrc && candidateIndex < candidates.length);

  const handleImageError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setCandidateIndex(candidates.length);
    }
  };

  const handleCopy = () => {
    const directUrl = `${window.location.origin}/sekolah?npsn=${selectedSchool.npsn}`;
    navigator.clipboard.writeText(`${selectedSchool.name} (NPSN: ${selectedSchool.npsn})\n${directUrl}`);
    showToast('Tautan & info sekolah disalin ke clipboard!', 'success');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedSchool(null)}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Cover */}
        {hasImage ? (
          <div 
            onClick={() => setIsImageZoomed(true)}
            className="relative h-56 w-full bg-slate-900 overflow-hidden cursor-pointer group"
            title="Klik untuk melihat foto ukuran penuh"
          >
            <img
              key={currentSrc}
              src={currentSrc}
              alt={selectedSchool.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            {/* Hover Zoom Hint */}
            <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg border border-white/20">
              <ZoomIn className="w-3.5 h-3.5 text-blue-400" />
              <span>Klik untuk perbesar</span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSchool(null);
              }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors z-20"
              title="Tutup detail"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badges & Title */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-600 text-white">
                  Jenjang {selectedSchool.level === 'PAUD' ? 'KB' : selectedSchool.level}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/90 text-slate-800">
                  {selectedSchool.status}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  Akreditasi {selectedSchool.akreditasi}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {selectedSchool.name}
              </h2>
            </div>
          </div>
        ) : (
          <div className="relative bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 p-6 sm:p-8 overflow-hidden border-b border-blue-900/30">
            <div className="absolute -right-6 -bottom-6 text-white/[0.05] pointer-events-none">
              <Building2 className="w-44 h-44 stroke-[1]" />
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSelectedSchool(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Badges & Title */}
            <div className="relative z-10 pt-2">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-600 text-white">
                  Jenjang {selectedSchool.level === 'PAUD' ? 'KB' : selectedSchool.level}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/90 text-slate-800">
                  {selectedSchool.status}
                </span>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-400 text-slate-950">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  Akreditasi {selectedSchool.akreditasi}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
                {selectedSchool.name}
              </h2>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Key Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">NPSN</span>
              <span className="text-sm font-bold text-slate-900 font-mono">{selectedSchool.npsn}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Akreditasi</span>
              <span className="text-sm font-bold text-amber-600">Nilai {selectedSchool.akreditasi}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Peserta Didik</span>
              <span className="text-sm font-bold text-blue-600">{selectedSchool.studentsCount} Siswa</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Tenaga Guru</span>
              <span className="text-sm font-bold text-emerald-600">{selectedSchool.teachersCount} Guru</span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3.5 text-sm">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Informasi Satuan Pendidikan
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Kepala Sekolah</div>
                  <div className="font-semibold text-slate-900">{selectedSchool.headmaster}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Desa / Kelurahan</div>
                  <div className="font-semibold text-slate-900">{selectedSchool.desa}, Kec. Purwodadi</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Nomor Telepon</div>
                  <div className="font-semibold text-slate-900">{selectedSchool.phone}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Email Resmi</div>
                  <div className="font-semibold text-slate-900 truncate">{selectedSchool.email}</div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs font-bold text-blue-900 block">Alamat Lengkap:</span>
                <p className="text-xs text-slate-700 mt-0.5">{selectedSchool.address}, Kecamatan Purwodadi, Kabupaten Grobogan, Jawa Tengah.</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Salin Info</span>
              </button>
              <a
                href={getGoogleMapsUrl(selectedSchool)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm group"
                title="Buka titik lokasi sekolah di Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                <span>Buka Google Maps</span>
              </a>
            </div>

            <button
              onClick={() => setSelectedSchool(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>

      {/* Lightbox / Full Image Preview Modal */}
      {isImageZoomed && hasImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsImageZoomed(false)}
        >
          {/* Close Button (X) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsImageZoomed(false);
            }}
            className="fixed top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all z-[80] border border-white/20 shadow-2xl group hover:scale-105"
            title="Tutup pratinjau foto"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>

          {/* Image Container */}
          <div 
            className="relative max-w-5xl max-h-[92vh] w-auto h-auto flex flex-col items-center justify-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentSrc}
              alt={selectedSchool.name}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="max-w-full max-h-[82vh] object-contain rounded-2xl shadow-2xl border border-white/15 bg-black/40"
            />

            {/* Bottom Caption Info */}
            <div className="mt-3 px-5 py-2.5 rounded-2xl bg-black/70 backdrop-blur-md border border-white/15 text-center flex flex-wrap items-center justify-center gap-2 sm:gap-3 shadow-xl">
              <span className="text-sm font-bold text-white tracking-wide">
                {selectedSchool.name}
              </span>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span className="text-xs text-slate-300 font-mono">
                NPSN: {selectedSchool.npsn}
              </span>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                Akreditasi {selectedSchool.akreditasi}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
