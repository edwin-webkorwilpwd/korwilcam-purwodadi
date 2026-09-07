import React from 'react';
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
  ExternalLink 
} from 'lucide-react';

export const ModalDetailSchool: React.FC = () => {
  const { selectedSchool, setSelectedSchool, showToast } = useApp();

  if (!selectedSchool) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${selectedSchool.name} - NPSN: ${selectedSchool.npsn}`);
    showToast('Info sekolah disalin ke clipboard!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Cover */}
        <div className="relative h-56 w-full bg-slate-900">
          <img
            src={selectedSchool.image}
            alt={selectedSchool.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Close Button */}
          <button
            onClick={() => setSelectedSchool(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Badges & Title */}
          <div className="absolute bottom-4 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-600 text-white">
                Jenjang {selectedSchool.level}
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
              <div>
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
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedSchool.name + ' Purwodadi Grobogan')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
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
    </div>
  );
};
