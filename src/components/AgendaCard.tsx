import React from 'react';
import { AulaAgendaBooking } from '../types';
import { formatIndonesianDate } from '../services/googleSheetService';
import { 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  MapPin 
} from 'lucide-react';

// 1. Watermark Ilustrasi Dokumen Sertifikat / Toga
const AgendaWatermarkCert: React.FC = () => (
  <svg
    viewBox="0 0 100 90"
    className="w-18 h-16 sm:w-20 sm:h-18 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft cloud backdrop */}
    <ellipse cx="60" cy="55" rx="32" ry="22" fill="#e0f2fe" opacity="0.6" />
    <ellipse cx="38" cy="62" rx="20" ry="14" fill="#bae6fd" opacity="0.4" />
    
    {/* Document sheet */}
    <rect x="42" y="24" width="44" height="52" rx="8" fill="#ffffff" stroke="#93c5fd" strokeWidth="2" />
    <rect x="42" y="24" width="44" height="52" rx="8" fill="url(#certGrad)" opacity="0.25" />
    
    {/* Document lines */}
    <line x1="50" y1="50" x2="78" y2="50" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <line x1="50" y1="58" x2="74" y2="58" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    <line x1="50" y1="66" x2="70" y2="66" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

    {/* Graduation Cap on top */}
    <polygon points="64,12 86,22 64,30 42,22" fill="#2563eb" />
    <path d="M50 25 V31 C50 35 78 35 78 31 V25" fill="#1d4ed8" />
    <path d="M64 22 L45 28 V36" stroke="#0284c7" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="45" cy="37" r="2" fill="#0284c7" />

    <defs>
      <linearGradient id="certGrad" x1="0%" y1="0%" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
    </defs>
  </svg>
);

// 2. Watermark Ilustrasi Dokumen Berkas & Diagram
const AgendaWatermarkDoc: React.FC = () => (
  <svg
    viewBox="0 0 100 90"
    className="w-18 h-16 sm:w-20 sm:h-18 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft cloud backdrop */}
    <ellipse cx="50" cy="55" rx="34" ry="24" fill="#e0f2fe" opacity="0.6" />
    
    {/* Back document */}
    <rect x="42" y="16" width="40" height="50" rx="8" fill="#93c5fd" opacity="0.5" transform="rotate(-6 42 16)" />
    
    {/* Front document */}
    <rect x="44" y="20" width="42" height="52" rx="8" fill="#ffffff" stroke="#60a5fa" strokeWidth="2" />
    <rect x="44" y="20" width="42" height="52" rx="8" fill="url(#docGrad)" opacity="0.15" />
    
    {/* Document lines */}
    <line x1="52" y1="34" x2="76" y2="34" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    <line x1="52" y1="42" x2="72" y2="42" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    <line x1="52" y1="50" x2="68" y2="50" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

    {/* Small Analytics Badge */}
    <rect x="64" y="52" width="22" height="20" rx="6" fill="#2563eb" />
    <rect x="68" y="63" width="3" height="6" rx="1" fill="#ffffff" />
    <rect x="73" y="59" width="3" height="10" rx="1" fill="#ffffff" />
    <rect x="78" y="56" width="3" height="13" rx="1" fill="#ffffff" />

    <defs>
      <linearGradient id="docGrad" x1="0%" y1="0%" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

// 3. Watermark Ilustrasi Gedung Sekolah / Aula
const AgendaWatermarkBuilding: React.FC = () => (
  <svg
    viewBox="0 0 100 90"
    className="w-18 h-16 sm:w-20 sm:h-18 pointer-events-none select-none drop-shadow-sm"
    fill="none"
  >
    {/* Soft cloud / shrubs backdrop */}
    <ellipse cx="34" cy="58" rx="16" ry="14" fill="#bae6fd" opacity="0.5" />
    <ellipse cx="80" cy="58" rx="16" ry="14" fill="#93c5fd" opacity="0.5" />
    <ellipse cx="56" cy="62" rx="34" ry="20" fill="#e0f2fe" opacity="0.6" />

    {/* Flag on roof */}
    <line x1="58" y1="12" x2="58" y2="24" stroke="#0284c7" strokeWidth="1.8" />
    <path d="M58 13 C64 11 68 15 74 13 L74 18 C68 20 64 16 58 17 Z" fill="#2563eb" />

    {/* Triangular Roof */}
    <polygon points="58,22 40,34 76,34" fill="#2563eb" />
    
    {/* Main Building Wall */}
    <rect x="42" y="34" width="32" height="34" rx="4" fill="#ffffff" stroke="#60a5fa" strokeWidth="1.8" />
    <rect x="42" y="34" width="32" height="34" rx="4" fill="url(#bldgGrad)" opacity="0.2" />

    {/* Windows & Door */}
    <rect x="46" y="40" width="6" height="7" rx="1.5" fill="#3b82f6" />
    <rect x="64" y="40" width="6" height="7" rx="1.5" fill="#3b82f6" />
    <path d="M54 68 V54 C54 52 56 50 58 50 C60 50 62 52 62 54 V68" fill="#1d4ed8" />

    <defs>
      <linearGradient id="bldgGrad" x1="0%" y1="0%" x2="1" y2="1">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>
    </defs>
  </svg>
);

export interface AgendaCardProps {
  agenda: AulaAgendaBooking;
  index?: number;
}

export const AgendaCard: React.FC<AgendaCardProps> = ({ agenda, index = 0 }) => {
  // Rotasi watermark berdasarkan urutan atau isi acara
  const WatermarkComponent = 
    index % 3 === 0 ? AgendaWatermarkCert :
    index % 3 === 1 ? AgendaWatermarkDoc : 
    AgendaWatermarkBuilding;

  const isApproved = agenda.statusPersetujuan?.toLowerCase() === 'disetujui';
  const isRejected = agenda.statusPersetujuan?.toLowerCase() === 'ditolak';

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-[22px] p-5 sm:p-6 border border-blue-100/90 shadow-md shadow-slate-200/60 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden space-y-3.5">
      {/* Top-Left Blue Wave */}
      <svg
        className="absolute top-0 left-0 w-28 h-20 pointer-events-none select-none z-0"
        viewBox="0 0 120 80"
        fill="none"
      >
        <path
          d="M0 0 H110 C85 8 60 25 38 45 C20 62 8 75 0 80 Z"
          fill="url(#agendaTopLeftWave)"
        />
        <defs>
          <linearGradient id="agendaTopLeftWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom-Left Blue Wave */}
      <svg
        className="absolute bottom-0 left-0 w-28 h-16 pointer-events-none select-none z-0"
        viewBox="0 0 120 70"
        fill="none"
      >
        <path
          d="M0 70 L0 15 C15 15 35 25 55 45 C70 58 85 68 110 70 Z"
          fill="url(#agendaBottomLeftWave)"
        />
        <defs>
          <linearGradient id="agendaBottomLeftWave" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="space-y-3 relative z-10">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Category Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <span>{agenda.kategori || 'Rapat Dinas'}</span>
          </span>

          {/* Status Persetujuan Pill */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
            isApproved
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : isRejected
              ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
              : 'bg-amber-50 text-amber-700 border border-amber-200/80'
          }`}>
            {isApproved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : isRejected ? (
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{agenda.statusPersetujuan || 'Disetujui'}</span>
          </span>
        </div>

        {/* Middle Row: Title + Watermark Illustration */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
              Keterangan / Keperluan
            </span>
            <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-blue-700 transition-colors leading-snug truncate">
              {agenda.keterangan}
            </h4>
          </div>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <WatermarkComponent />
          </div>
        </div>

        {/* Parameters Box */}
        <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-100/90 space-y-3">
          {/* Two-Column Grid: Tanggal & Jam */}
          <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/60">
            {/* Tanggal Penggunaan */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  Tanggal Penggunaan
                </span>
                <span className="font-bold text-slate-800 text-xs truncate block">
                  {formatIndonesianDate(agenda.tanggalPenggunaan)}
                </span>
              </div>
            </div>

            {/* Jam Pemakaian */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                  Jam Pemakaian
                </span>
                <span className="font-bold text-slate-800 text-xs truncate block">
                  {agenda.jamPemakaian} WIB
                </span>
              </div>
            </div>
          </div>

          {/* Nama PJ */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                Nama PJ (Penanggung Jawab)
              </span>
              <span className="font-bold text-slate-900 text-xs block truncate">
                {agenda.namaPJ}
              </span>
              {agenda.nip && agenda.nip !== '-' && agenda.nip.length > 2 && (
                <span className="text-[9px] font-mono text-slate-400 block mt-0.5">
                  NIP : {agenda.nip}
                </span>
              )}
            </div>
          </div>

          {/* Organisasi / Instansi */}
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Building className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block leading-tight">
                Organisasi / Instansi
              </span>
              <span className="font-bold text-slate-800 text-xs block truncate">
                {agenda.organisasi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Lokasi & Tanggal Dibuat */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
        <div className="flex items-center gap-1.5 font-medium text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Aula Utama Kantor Korwilcam</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>{agenda.timestamp ? agenda.timestamp.split(' ')[0] : ''}</span>
        </div>
      </div>
    </div>
  );
};
