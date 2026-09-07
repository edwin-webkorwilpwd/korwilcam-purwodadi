import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { officeProfile, showToast, addComplaint } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    schoolOrOrigin: '',
    category: 'Konsultasi Layanan',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message || !formData.phone) {
      showToast('Harap lengkapi semua kolom wajib!', 'error');
      return;
    }

    addComplaint({
      name: formData.name,
      phone: formData.phone,
      schoolOrOrigin: formData.schoolOrOrigin || 'Masyarakat / Guru',
      category: formData.category,
      message: formData.message
    });

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      schoolOrOrigin: '',
      category: 'Konsultasi Layanan',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <Phone className="w-3.5 h-3.5" />
            <span>Pusat Layanan Terpadu</span>
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Kontak & Pengaduan Masyarakat
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Sampaikan konsultasi kedinasan, permohonan informasi, maupun aspirasi perbaikan layanan pendidikan di Kecamatan Purwodadi.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Kolom Kiri: Kontak & Peta */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg space-y-6">
              <h3 className="text-xl font-extrabold text-slate-900 pb-3 border-b border-slate-100">
                Informasi Kantor Resmi
              </h3>

              <div className="space-y-5 text-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Alamat Kantor</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{officeProfile.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Telepon & WhatsApp Helpdesk</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{officeProfile.phone}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-0.5">WA: {officeProfile.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Email Pelayanan</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{officeProfile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">Jam Operasional Pelayanan</h5>
                    <p className="text-xs text-slate-600 mt-0.5">{officeProfile.workingHours}</p>
                  </div>
                </div>
              </div>

              {/* Direct Maps Action */}
              <div className="pt-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(officeProfile.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <span>Buka Petunjuk Arah Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Card Whistleblowing Alert */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-6 rounded-3xl border border-blue-800/60 shadow-md space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <ShieldAlert className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Kanal Pengaduan Bebas Pungli</span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                Seluruh pengurusan rekomendasi, izin operasional, dan layanan administrasi di lingkungan Korwilcam Purwodadi <strong>TIDAK DIPUNGUT BIAYA (GRATIS)</strong>. Laporkan segala bentuk gratifikasi atau pungli.
              </p>
            </div>

          </div>

          {/* Kolom Kanan: Formulir Aspirasi & Pengaduan Online */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xl space-y-6">
              
              <div className="space-y-1 pb-4 border-b border-slate-100">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  Formulir Daring
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Kirim Aspirasi / Konsultasi Online
                </h3>
                <p className="text-xs text-slate-500">
                  Pesan Anda akan langsung tercatat dan ditindaklanjuti oleh petugas layanan Korwilcam Purwodadi.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-emerald-900">
                    Terima Kasih, Pesan Anda Telah Terkirim!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    Aspirasi / pengaduan Anda dengan kategori <strong>{formData.category}</strong> telah kami terima. Tim Korwilcam Purwodadi akan meninjau dan merespon melalui kontak yang Anda cantumkan.
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow"
                  >
                    Kirim Pesan Lainnya
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nama Lengkap <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Budi Santoso"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nomor WhatsApp / HP Aktif <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Contoh: 081234567890"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Asal Sekolah / Desa / Instansi
                      </label>
                      <input
                        type="text"
                        value={formData.schoolOrOrigin}
                        onChange={(e) => setFormData({ ...formData, schoolOrOrigin: e.target.value })}
                        placeholder="Contoh: SDN 1 Purwodadi / Wali Murid"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Kategori Pesan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      >
                        <option value="Konsultasi Layanan">Konsultasi Layanan Administrasi</option>
                        <option value="Pengaduan">Pengaduan Satuan Pendidikan</option>
                        <option value="Permohonan Informasi">Permohonan Informasi Publik</option>
                        <option value="Saran & Masukan">Saran & Masukan Mutu Pendidikan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Uraian Pesan / Pengaduan <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tuliskan secara jelas pertanyaan, kendala, atau masukan Anda..."
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all active:scale-98"
                  >
                    <Send className="w-4 h-4" />
                    <span>Kirim Aspirasi Sekarang</span>
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>
    </div>
  );
};
