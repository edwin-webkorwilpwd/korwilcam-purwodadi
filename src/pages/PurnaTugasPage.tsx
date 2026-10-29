import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Calendar, 
  Building2, 
  Briefcase, 
  Award, 
  GraduationCap, 
  Search, 
  Share2, 
  ArrowLeft, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Copy, 
  FileText, 
  MapPin, 
  RotateCcw, 
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw
} from 'lucide-react';
import { CurvedHeaderArch } from '../components/CurvedHeaderArch';
import { formatGoogleDriveImageUrl } from '../lib/driveHelper';
import { PurnaTugasPegawai } from '../types';
import { 
  fetchPurnaTugasFromSheet, 
  getLocalPurnaTugasCache,
  PURNA_TUGAS_SPREADSHEET_URL 
} from '../services/purnaTugasService';

export const PurnaTugasPage: React.FC = () => {
  const { 
    selectedPurnaTugasNip, 
    setSelectedPurnaTugasNip, 
    showToast 
  } = useApp();

  const [pegawaiList, setPegawaiList] = useState<PurnaTugasPegawai[]>(() => getLocalPurnaTugasCache());
  const [isLoading, setIsLoading] = useState<boolean>(pegawaiList.length === 0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGolongan, setSelectedGolongan] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const [copiedNip, setCopiedNip] = useState(false);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});

  // Ambil data terbaru dari Google Spreadsheet secara live
  const loadData = async (showLoadingSpinner: boolean = false) => {
    if (showLoadingSpinner) setIsRefreshing(true);
    try {
      const liveData = await fetchPurnaTugasFromSheet();
      if (liveData && liveData.length > 0) {
        setPegawaiList(liveData);
      }
    } catch (e) {
      console.warn('Error fetching live Purna Tugas:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, []);

  // Pegawai terpilih untuk tampilan detail
  const currentPegawai = useMemo(() => {
    if (!selectedPurnaTugasNip) return null;
    const cleanTarget = selectedPurnaTugasNip.replace(/\s+/g, '').toLowerCase();
    return (
      pegawaiList.find((p) => p.nip.replace(/\s+/g, '').toLowerCase() === cleanTarget) ||
      pegawaiList.find((p) => p.nip === selectedPurnaTugasNip) ||
      null
    );
  }, [selectedPurnaTugasNip, pegawaiList]);

  // Update judul halaman saat detail dibuka
  useEffect(() => {
    if (currentPegawai) {
      document.title = `${currentPegawai.nama} - Purna Tugas Korwilcam Purwodadi`;
    }
  }, [currentPegawai]);

  // Opsi filter golongan unik
  const uniqueGolongan = useMemo(() => {
    const set = new Set<string>();
    pegawaiList.forEach((p) => {
      if (p.golongan && p.golongan !== '-') set.add(p.golongan.trim());
    });
    return Array.from(set).sort();
  }, [pegawaiList]);

  // Filter daftar kartu
  const filteredPegawai = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return pegawaiList.filter((p) => {
      const matchSearch =
        !q ||
        p.nama.toLowerCase().includes(q) ||
        p.nip.toLowerCase().includes(q) ||
        p.instansiSubUnit.toLowerCase().includes(q) ||
        p.jabatan.toLowerCase().includes(q);

      const matchGol =
        selectedGolongan === 'ALL' ||
        p.golongan.toLowerCase() === selectedGolongan.toLowerCase();

      return matchSearch && matchGol;
    });
  }, [pegawaiList, searchQuery, selectedGolongan]);

  // Reset ke halaman 1 saat pencarian atau filter golongan berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGolongan]);

  // Kalkulasi Pagination (Tepat 10 kartu per halaman)
  const totalPages = Math.max(1, Math.ceil(filteredPegawai.length / itemsPerPage));
  const paginatedPegawai = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPegawai.slice(start, start + itemsPerPage);
  }, [filteredPegawai, currentPage, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (typeof window !== 'undefined') {
      const el = document.getElementById('purna-tugas-grid');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 350, behavior: 'smooth' });
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('Tautan profil pegawai berhasil disalin ke clipboard!', 'success');
    }
  };

  const handleCopyNip = (nip: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(nip);
      setCopiedNip(true);
      showToast('NIP berhasil disalin!', 'success');
      setTimeout(() => setCopiedNip(false), 2000);
    }
  };

  // Helper untuk mengecek apakah link foto valid & bukan placeholder
  const hasValidPhoto = (link?: string): boolean => {
    if (!link || typeof link !== 'string') return false;
    const trimmed = link.trim();
    if (!trimmed || trimmed === '-' || trimmed === '#') return false;
    return true;
  };

  // ==========================================
  // VIEW 1: TAMPILAN DETAIL PEGAWAI PURNA TUGAS
  // ==========================================
  if (selectedPurnaTugasNip && currentPegawai) {
    const hasPhoto = hasValidPhoto(currentPegawai.linkFoto) && !imgErrorMap[currentPegawai.nip];

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
        {/* Hero Curved Header */}
        <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-6 pb-12 sm:pt-7 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
          <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

          <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs sm:text-sm text-blue-100">
              <nav className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedPurnaTugasNip(null)}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Daftar Purna Tugas</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-blue-300/60" />
                <span className="text-white font-medium truncate max-w-[200px] sm:max-w-md">
                  {currentPegawai.nama}
                </span>
              </nav>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-sm transition-all border border-white/20 active:scale-95"
                  title="Salin tautan profil ini"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Bagikan</span>
                </button>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold tracking-wide uppercase">
                <Award className="w-3.5 h-3.5" />
                Purna Tugas / Purna Bakti
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {currentPegawai.nama}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
                {currentPegawai.jabatan} • {currentPegawai.instansiSubUnit}
              </p>
            </div>
          </div>

          <CurvedHeaderArch />
        </section>

        {/* Detail Konten Profil */}
        <section className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 -mt-6 sm:-mt-8 relative z-20 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Kolom Kiri: Foto & Ringkasan Cepat */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm text-center">
                {/* Foto Pegawai */}
                <div className="w-48 h-60 sm:w-56 sm:h-72 mx-auto rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shadow-md flex items-center justify-center relative">
                  {hasPhoto ? (
                    <img
                      src={formatGoogleDriveImageUrl(currentPegawai.linkFoto, 600)}
                      alt={currentPegawai.nama}
                      className="w-full h-full object-cover object-top"
                      onError={() => {
                        setImgErrorMap((prev) => ({ ...prev, [currentPegawai.nip]: true }));
                      }}
                    />
                  ) : (
                    // Bersih tanpa dummy foto
                    <div className="flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                      <div className="w-20 h-20 rounded-full bg-slate-200/60 flex items-center justify-center mb-3 text-slate-400">
                        <User className="w-10 h-10 stroke-[1.5]" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">Foto Tidak Tersedia</span>
                      <span className="text-[11px] text-slate-400/80 mt-0.5">Belum ada foto yang diunggah</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {currentPegawai.nama}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {currentPegawai.pangkat} ({currentPegawai.golongan})
                  </p>
                </div>

                {/* Badge NIP Interaktif */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Nomor Induk Pegawai (NIP)
                  </span>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs font-bold">
                    <span>{currentPegawai.nip}</span>
                    <button
                      onClick={() => handleCopyNip(currentPegawai.nip)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Salin NIP"
                    >
                      {copiedNip ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tombol Kembali */}
                <div className="mt-6 pt-2">
                  <button
                    onClick={() => setSelectedPurnaTugasNip(null)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar</span>
                  </button>
                </div>
              </div>

              {/* Box Info BUP / Purna */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Batas Usia Pensiun (BUP)</span>
                </div>
                <div className="space-y-1.5 text-xs text-amber-900/90">
                  <div className="flex justify-between items-center py-1 border-b border-amber-200/50">
                    <span className="text-amber-800/80">TMT Pensiun:</span>
                    <span className="font-bold text-amber-950">{currentPegawai.batasUsiaPensiun || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-amber-800/80">Usia Pensiun:</span>
                    <span className="font-bold text-amber-950">{currentPegawai.usiaPensiun || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Seluruh Data Kolom B sampai Z */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">

              {/* 1. Informasi Identitas Pribadi */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base">Identitas & Informasi Pribadi</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Nama Lengkap</span>
                    <span className="font-bold text-slate-800">{currentPegawai.nama}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">NIP</span>
                    <span className="font-bold text-slate-800 font-mono">{currentPegawai.nip}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Tempat Lahir</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.tempatLahir || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Tanggal Lahir</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.tanggalLahir || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.jenisKelamin || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Agama</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.agama || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Pangkat, Jabatan & Unit Kerja */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base">Pangkat, Jabatan & Instansi Terakhir</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Pangkat Terakhir</span>
                    <span className="font-bold text-slate-800">{currentPegawai.pangkat || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Golongan Ruang</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs inline-block">
                      {currentPegawai.golongan || '-'}
                    </span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Jabatan Terakhir</span>
                    <span className="font-bold text-slate-800">{currentPegawai.jabatan || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Instansi Sub Unit / Unit Kerja</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.instansiSubUnit || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Jenis Jabatan</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.jenisJabatan || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Rumpun Jabatan</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.rumpunJabatan || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">TMT CPNS</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.tmtCpns || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 3. Masa Kerja */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base">Riwayat Masa Kerja (MK)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">Masa Kerja Golongan</span>
                    <span className="font-extrabold text-slate-800 text-sm">{currentPegawai.mkGol || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">Masa Kerja PNS</span>
                    <span className="font-extrabold text-slate-800 text-sm">{currentPegawai.mkPns || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-1">Masa Kerja Pensiun</span>
                    <span className="font-extrabold text-slate-800 text-sm">{currentPegawai.mkPens || '-'}</span>
                  </div>
                </div>
              </div>

              {/* 4. Riwayat Pendidikan */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base">Riwayat Pendidikan</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Jenjang Pendidikan</span>
                    <span className="font-bold text-slate-800">{currentPegawai.jenjangPendidikan || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Jurusan / Program Studi</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.jurusanPendidikan || '-'}</span>
                  </div>

                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[11px] text-slate-400 font-semibold block mb-0.5">Nama Sekolah / Universitas / Almamater</span>
                    <span className="font-semibold text-slate-800">{currentPegawai.namaSekolah || '-'}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: KATALOG / GRID KARTU PURNA TUGAS
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      {/* 1. Hero Curved Header */}
      <section className="relative bg-gradient-to-r from-[#1b56ce] via-[#2467ea] to-[#109de8] text-white pt-5 pb-12 sm:pt-6 sm:pb-14 px-4 sm:px-6 lg:px-8 shadow-md overflow-hidden">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-2.5 relative z-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm">
            Pegawai & Guru Purna Tugas
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Apresiasi dan penghormatan atas dedikasi dan pengabdian para pendidik serta tenaga kependidikan Korwilcam Bidang Pendidikan Purwodadi.
          </p>
          <div className="w-12 h-1 bg-amber-400 rounded-full mx-auto mt-2 shadow-xs" />
        </div>

        <CurvedHeaderArch />
      </section>

      {/* 2. Konten Kartu & Pencarian */}
      <section className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 space-y-6 -mt-6 sm:-mt-8 relative z-20">
        
        {/* Toolbar: Search, Filter, Sync Status */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-3.5 w-full">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Input Pencarian */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan nama, NIP, atau instansi..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filter Golongan */}
            <div className="flex items-center gap-2">
              <select
                value={selectedGolongan}
                onChange={(e) => setSelectedGolongan(e.target.value)}
                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua Golongan</option>
                {uniqueGolongan.map((gol) => (
                  <option key={gol} value={gol}>
                    Golongan {gol}
                  </option>
                ))}
              </select>

              {/* Tombol Refresh Live Data */}
              <button
                onClick={() => loadData(true)}
                disabled={isRefreshing}
                className="px-3 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Muat ulang data terbaru dari database Korwil Purwodadi"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Baris Keterangan Hasil */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">
                Menampilkan{' '}
                <strong className="text-slate-900">
                  {filteredPegawai.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
                </strong>{' '}
                -{' '}
                <strong className="text-slate-900">
                  {Math.min(filteredPegawai.length, currentPage * itemsPerPage)}
                </strong>{' '}
                dari <strong className="text-slate-900">{filteredPegawai.length}</strong> Pegawai
                {totalPages > 1 && (
                  <span className="text-slate-500 font-normal">
                    {' '}(Halaman <strong className="text-slate-800">{currentPage}</strong> dari{' '}
                    <strong className="text-slate-800">{totalPages}</strong>)
                  </span>
                )}
              </span>
              {(searchQuery || selectedGolongan !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedGolongan('ALL');
                  }}
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-400">
              Sinkronisasi data langsung dari database Korwil Purwodadi
            </div>
          </div>
        </div>

        {/* Grid Kartu Pegawai Purna Tugas (Tepat 5 Kartu per Baris di Layar Lebar) */}
        {isLoading ? (
          <div className="text-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-sm text-slate-500">Memuat data pegawai purna tugas dari database Korwil Purwodadi...</p>
          </div>
        ) : filteredPegawai.length > 0 ? (
          <>
            <div id="purna-tugas-grid" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6 xl:gap-7 w-full scroll-mt-24">
              {paginatedPegawai.map((pegawai) => {
                const hasPhoto = hasValidPhoto(pegawai.linkFoto) && !imgErrorMap[pegawai.nip];

                return (
                  <div
                    key={pegawai.nip || pegawai.no}
                    onClick={() => setSelectedPurnaTugasNip(pegawai.nip)}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300/80 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer hover:-translate-y-1"
                  >
                    {/* Foto Pegawai */}
                    <div className="relative w-full aspect-[4/5] bg-slate-100 overflow-hidden border-b border-slate-100">
                      {hasPhoto ? (
                        <img
                          src={formatGoogleDriveImageUrl(pegawai.linkFoto, 400)}
                          alt={pegawai.nama}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          onError={() => {
                            setImgErrorMap((prev) => ({ ...prev, [pegawai.nip]: true }));
                          }}
                        />
                      ) : (
                        // Bersih tanpa dummy foto
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 p-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-200/60 flex items-center justify-center mb-2 text-slate-400 group-hover:scale-105 transition-transform">
                            <User className="w-8 h-8 stroke-[1.5]" />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-400">Foto Belum Tersedia</span>
                        </div>
                      )}

                      {/* Badge Golongan Mengambang */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-[11px] font-extrabold text-blue-700 shadow-sm border border-white/50">
                          {pegawai.golongan || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Isi Kartu */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        {/* Nama (Kolom B) */}
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {pegawai.nama}
                        </h3>

                        {/* NIP (Kolom C) */}
                        <p className="text-xs text-slate-500 font-mono font-medium">
                          NIP. {pegawai.nip}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {/* Pangkat (Kolom Q) & Golongan (Kolom P) */}
                        <div className="flex items-start gap-1.5">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">
                            <span className="font-semibold text-slate-700">{pegawai.pangkat}</span>
                            {pegawai.golongan && pegawai.golongan !== '-' && (
                              <span className="text-slate-500"> ({pegawai.golongan})</span>
                            )}
                          </span>
                        </div>

                        {/* Tanggal Lahir (Kolom L) */}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="text-slate-600 text-[11px] sm:text-xs">
                            Tgl. Lahir: <strong className="text-slate-700">{pegawai.tanggalLahir || '-'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Footer Kartu Interaktif */}
                      <div className="pt-2">
                        <div className="w-full py-2 px-3 rounded-xl bg-blue-50/80 group-hover:bg-blue-600 text-blue-700 group-hover:text-white text-xs font-bold transition-all flex items-center justify-between">
                          <span>Lihat Detail Pegawai</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kontrol Pagination (10 Kartu per Halaman) */}
            {totalPages > 1 && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 w-full">
                <div className="text-xs sm:text-sm text-slate-600 font-medium">
                  Menampilkan{' '}
                  <strong className="text-slate-900">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </strong>{' '}
                  -{' '}
                  <strong className="text-slate-900">
                    {Math.min(filteredPegawai.length, currentPage * itemsPerPage)}
                  </strong>{' '}
                  dari <strong className="text-slate-900">{filteredPegawai.length}</strong> pegawai purna tugas
                </div>

                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  {/* Tombol Halaman Pertama */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-2xs"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>

                  {/* Tombol Sebelumnya */}
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-2xs"
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Nomor-nomor Halaman */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`min-w-9 h-9 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-600/20'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  {/* Tombol Selanjutnya */}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-2xs"
                    title="Halaman Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Tombol Halaman Terakhir */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-35 disabled:cursor-not-allowed transition-all shadow-2xs"
                    title="Halaman Terakhir"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center max-w-md mx-auto space-y-3">
            <User className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">Pegawai Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500">
              Tidak ada data pegawai purna tugas yang cocok dengan pencarian "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGolongan('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Tampilkan Semua Pegawai
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
