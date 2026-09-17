import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  Copy, 
  Check, 
  Share2, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  Phone, 
  MapPin, 
  Building2, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { getServiceRequirementDetailPath } from '../lib/serviceRequirementHelper';
import { ServiceRequirement } from '../types';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';

export const ServiceRequirementDetailPage: React.FC = () => {
  const { 
    selectedServiceRequirement, 
    setSelectedServiceRequirement, 
    setActiveTab, 
    officeProfile, 
    showToast, 
    serviceRequirements 
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedServiceRequirement?.id]);

  if (!selectedServiceRequirement) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Persyaratan Pelayanan Tidak Ditemukan</h2>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Jenis layanan atau persyaratan yang Anda cari mungkin telah diperbarui, diganti, atau tautan yang dimasukkan keliru.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedServiceRequirement(null);
            setActiveTab('service-requirements', '/layanan/persyaratan-pelayanan');
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Persyaratan Pelayanan</span>
        </button>
      </div>
    );
  }

  const service = selectedServiceRequirement;
  const otherServices = serviceRequirements
    .filter((s) => s.id !== service.id)
    .slice(0, 6);

  const handleCopyRequirements = () => {
    let text = `*PERSYARATAN PELAYANAN: ${service.title.toUpperCase()}*\n`;
    text += `Kantor Korwilcam Bidang Pendidikan Kecamatan Purwodadi\n\n`;
    if (service.description) {
      text += `Deskripsi: ${service.description}\n\n`;
    }
    text += `Daftar Berkas Persyaratan yang Wajib Dipenuhi:\n`;
    service.requirements.forEach((req, idx) => {
      text += `${idx + 1}. ${req}\n`;
    });
    if (service.notes) {
      text += `\nCatatan & Ketentuan:\n${service.notes}\n`;
    }
    if (service.estimatedTime) {
      text += `\nEstimasi Waktu Penyelesaian: ${service.estimatedTime}\n`;
    }
    text += `\nInformasi Resmi Korwilcam Purwodadi: ${officeProfile.whatsapp || officeProfile.phone || '-'}\n`;
    text += `Tautan Halaman: ${window.location.href}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      showToast('Seluruh butir persyaratan berhasil disalin!', 'success');
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkCopied(true);
      showToast('Tautan link halaman persyaratan berhasil disalin!', 'success');
      setTimeout(() => setLinkCopied(false), 2500);
    });
  };

  return (
    <div className="space-y-8 pb-24 bg-slate-50 min-h-screen print:bg-white print:p-0 print:space-y-4">
      {/* Hero Header Banner */}
      <section className="relative bg-gradient-to-br from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-7 pb-14 sm:pt-8 sm:pb-16 px-4 sm:px-8 lg:px-12 xl:px-16 shadow-md print:hidden overflow-hidden">
        <div className="w-full space-y-3.5 relative z-10">
          {/* Back Button & Breadcrumbs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-white/15">
            <button
              onClick={() => {
                setSelectedServiceRequirement(null);
                setActiveTab('service-requirements', '/layanan/persyaratan-pelayanan');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all active:scale-95 cursor-pointer border border-white/20 shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Persyaratan</span>
            </button>

            <nav className="flex items-center gap-2 text-xs text-blue-100/90">
              <span 
                onClick={() => {
                  setSelectedServiceRequirement(null);
                  setActiveTab('home', '/beranda');
                }}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Beranda
              </span>
              <ChevronRight className="w-3 h-3 text-blue-200" />
              <span className="text-blue-100/80">Layanan</span>
              <ChevronRight className="w-3 h-3 text-blue-200" />
              <span 
                onClick={() => {
                  setSelectedServiceRequirement(null);
                  setActiveTab('service-requirements', '/layanan/persyaratan-pelayanan');
                }}
                className="hover:text-white cursor-pointer transition-colors"
              >
                Persyaratan Pelayanan
              </span>
              <ChevronRight className="w-3 h-3 text-blue-200" />
              <span className="text-white font-bold truncate max-w-[200px] sm:max-w-[300px]">
                {service.title}
              </span>
            </nav>
          </div>

          {/* Badges & Title */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>{service.category || 'Pelayanan Umum'}</span>
              </span>

              {service.estimatedTime && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/30">
                  <Clock className="w-3.5 h-3.5 text-purple-300" />
                  <span>Estimasi: {service.estimatedTime}</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Pelayanan Resmi & Bebas Biaya</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {service.title}
            </h1>

            {service.description && (
              <p className="text-xs sm:text-sm text-slate-200 max-w-4xl leading-relaxed">
                {service.description}
              </p>
            )}
          </div>
        </div>
        <CurvedHeaderArch />
      </section>

      {/* Printable Official Header */}
      <div className="hidden print:block px-6 text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
          STANDAR PERSYARATAN PELAYANAN ADMINISTRASI
        </h2>
        <h3 className="text-sm font-semibold uppercase text-slate-800">
          KORWILCAM BIDANG PENDIDIKAN KECAMATAN PURWODADI
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          {officeProfile.address} | Telp: {officeProfile.phone}
        </p>
        <div className="mt-4 pt-3 border-t border-slate-300 text-left">
          <div className="text-xs font-bold text-slate-500 uppercase">Jenis Layanan:</div>
          <div className="text-base font-extrabold text-slate-900">{service.title}</div>
          <div className="text-xs text-slate-600 mt-0.5">Kategori: {service.category || '-'} | Waktu: {service.estimatedTime || '-'}</div>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-6 sm:-mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Requirements & Notes */}
          <div className="lg:col-span-8 space-y-6">
            
            <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Berkas & Persyaratan yang Wajib Dipenuhi
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pastikan seluruh dokumen di bawah ini telah disiapkan secara lengkap dan sah
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Total: {service.requirements.length} Butir Berkas
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {service.requirements && service.requirements.length > 0 ? (
                  service.requirements.map((req, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 hover:bg-blue-50/40 hover:border-blue-200 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 font-bold text-xs flex items-center justify-center shrink-0 transition-colors shadow-2xs mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-sm font-medium text-slate-800 leading-relaxed pt-0.5">
                        {req}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs italic">
                    Belum ada butir berkas persyaratan yang dimasukkan untuk jenis layanan ini.
                  </div>
                )}
              </div>

              {/* Notes */}
              {service.notes && (
                <div className="mt-6 bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Catatan Khusus & Ketentuan Alur</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-900/90 whitespace-pre-line leading-relaxed pl-6">
                    {service.notes}
                  </p>
                </div>
              )}
            </section>

            {/* Quick Actions Panel */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 print:hidden">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Aksi & Bantuan Layanan
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleCopyRequirements}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="Salin seluruh daftar syarat ini ke clipboard teks"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copied ? 'Berhasil Disalin' : 'Salin Persyaratan'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                  title="Salin tautan link halaman ini"
                >
                  {linkCopied ? <Check className="w-4 h-4 text-blue-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
                  <span>{linkCopied ? 'Tautan Disalin' : 'Bagikan Link'}</span>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Info & Other Services */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
            
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Lokasi & Jam Pelayanan
                </h3>
              </div>

              <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{officeProfile.address || 'Kantor Korwilcam Bidang Pendidikan Purwodadi'}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{officeProfile.workingHours || 'Senin - Jumat: 07.00 - 15.30 WIB'}</span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{officeProfile.phone || officeProfile.whatsapp || '-'}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('contact', '/kontak')}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold text-center transition-colors"
                >
                  Lihat Denah & Kontak Lengkap &rarr;
                </button>
              </div>
            </div>

            {otherServices.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Layanan Lainnya</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedServiceRequirement(null);
                      setActiveTab('service-requirements', '/layanan/persyaratan-pelayanan');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                  >
                    Lihat Semua
                  </button>
                </div>

                <div className="space-y-2.5">
                  {otherServices.map((other) => (
                    <div
                      key={other.id}
                      onClick={() => setSelectedServiceRequirement(other)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 line-clamp-2 transition-colors">
                        {other.title}
                      </div>
                      <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                        <span>{other.category || 'Pelayanan'}</span>
                        <span className="group-hover:translate-x-1 transition-transform text-blue-600 font-bold flex items-center gap-0.5">
                          Buka <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};
