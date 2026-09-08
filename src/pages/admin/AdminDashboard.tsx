import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Home,
  Building2,
  GraduationCap, 
  FileText, 
  Download, 
  Image as ImageIcon,
  Phone,
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  RotateCcw,
  Save,
  Calendar,
  BellRing,
  User,
  MapPin,
  Clock,
  Sparkles,
  Inbox,
  AlertCircle,
  FileSpreadsheet,
  UploadCloud,
  FolderUp,
  FileUp,
  Database,
  RefreshCw,
  Copy,
  Check,
  X,
  Layers,
  ArrowUpRight,
  Camera,
  Folder,
  FolderOpen,
  Images,
  Star,
  Paperclip,
  Eye,
  Crown,
  Shield,
  PenTool,
  Key,
  Users,
  Lock
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  setCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { 
  School, 
  NewsArticle, 
  SchoolLevel, 
  SchoolStatus, 
  Accreditation, 
  NewsCategory, 
  StaffProfile, 
  AgendaEvent, 
  GalleryItem, 
  DocumentDownload, 
  Announcement, 
  ComplaintMessage,
  AdminUser,
  AdminRole 
} from '../../types';
import { RichTextEditor } from '../../components/RichTextEditor';
import { getArticleReadingStats } from '../../lib/readingTime';
import { getGoogleMapsUrl, normalizeToGoogleMapsUrl } from '../../lib/coordinates';

export const AdminDashboard: React.FC = () => {
  const { 
    schools, 
    news, 
    announcements, 
    documents, 
    agenda,
    gallery,
    staff,
    complaints,
    officeProfile,
    updateOfficeProfile,
    addSchool,
    updateSchool,
    deleteSchool,
    addNews,
    updateNews,
    deleteNews,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addDocument,
    updateDocument,
    deleteDocument,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    addStaff,
    updateStaff,
    deleteStaff,
    deleteComplaint,
    updateComplaintStatus,
    resetToDefaultData,
    logout,
    setActiveTab,
    showToast,
    isSupabaseActive,
    syncStatus,
    exportAllToSupabase,
    refreshFromSupabase,
    currentUser,
    adminUsers,
    addAdminUser,
    updateAdminUser,
    deleteAdminUser
  } = useApp();

  type AdminSection = 
    | 'overview' 
    | 'home-cms' 
    | 'profile-cms' 
    | 'schools-cms' 
    | 'news-cms' 
    | 'downloads-cms' 
    | 'gallery-cms' 
    | 'contact-cms'
    | 'users-cms';

  const [currentSection, setCurrentSection] = useState<AdminSection>('overview');
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  // Supabase Modal & Connection State
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().supabaseUrl);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().supabaseAnonKey);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopiedSql, setHasCopiedSql] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    setTestResult(null);
    const res = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setTestResult(res);
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      showToast('Harap masukkan URL dan Anon Key Supabase!', 'error');
      return;
    }
    await setCustomSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setIsTestingSupabase(true);
    const res = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setTestResult(res);
    if (res.success) {
      showToast('Koneksi Supabase tersimpan permanen & aktif otomatis untuk semua pengunjung!', 'success');
      await refreshFromSupabase();
    } else {
      showToast('Kredensial disimpan, namun koneksi belum terverifikasi.', 'info');
    }
  };

  const handleClearSupabaseConfig = () => {
    if (window.confirm('Hapus konfigurasi Supabase dan kembali ke mode LocalStorage offline?')) {
      clearCustomSupabaseConfig();
      setSupabaseUrlInput('');
      setSupabaseKeyInput('');
      setTestResult(null);
      showToast('Konfigurasi Supabase dihapus. Beralih ke penyimpanan lokal.', 'info');
    }
  };

  const handleExportToSupabase = async () => {
    setIsExporting(true);
    await exportAllToSupabase();
    setIsExporting(false);
  };

  const handleCopySchemaSql = () => {
    setHasCopiedSql(true);
    showToast('File skema "supabase_schema.sql" sudah tersedia di root proyek!', 'info');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // --- 1. HOME CMS STATE ---
  const [homeForm, setHomeForm] = useState({
    tagline: officeProfile.tagline,
    heroBadge: officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi",
    heroTitle: officeProfile.heroTitle || "Mewujudkan Fondasi Generasi Emas SD, TK, & PAUD di Purwodadi",
    heroSubtitle: officeProfile.heroSubtitle || "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi...",
    korwilQuote: officeProfile.korwilQuote || "Pendidikan bukan sekadar transfer ilmu, melainkan menuntun kodrat anak..."
  });

  const handleSaveHomeCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeProfile(homeForm);
  };

  // Helper to compress image and convert to lightweight Base64 string for database storage
  const compressImage = (file: File, maxWidth = 800, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Refs for file inputs
  const korwilPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const staffPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleKorwilPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses foto pimpinan...', 'info');
      const dataUrl = await compressImage(file, 800, 0.85);
      setProfileForm((prev) => ({ ...prev, korwilPhoto: dataUrl }));
      showToast('Foto pimpinan berhasil dipilih & siap disimpan ke database!', 'success');
    } catch (err) {
      showToast('Gagal memproses foto!', 'error');
    }
  };

  const handleStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses pas foto pegawai...', 'info');
      const dataUrl = await compressImage(file, 800, 0.85);
      setStaffForm((prev) => ({ ...prev, photo: dataUrl }));
      showToast('Pas foto pegawai berhasil dipilih & siap disimpan ke database!', 'success');
    } catch (err) {
      showToast('Gagal memproses pas foto pegawai!', 'error');
    }
  };

  // --- 2. PROFILE CMS STATE ---
  const [profileForm, setProfileForm] = useState({
    korwilName: officeProfile.korwilName,
    korwilNip: officeProfile.korwilNip,
    korwilPhoto: officeProfile.korwilPhoto,
    greetingTitle: officeProfile.greetingTitle,
    greetingText: officeProfile.greetingText,
    vision: officeProfile.vision,
    missions: [...officeProfile.missions]
  });

  const [newMissionText, setNewMissionText] = useState('');

  const handleSaveProfileCMS = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeProfile(profileForm);
  };

  const handleAddMission = () => {
    if (!newMissionText.trim()) return;
    setProfileForm({
      ...profileForm,
      missions: [...profileForm.missions, newMissionText.trim()]
    });
    setNewMissionText('');
  };

  const handleRemoveMission = (index: number) => {
    setProfileForm({
      ...profileForm,
      missions: profileForm.missions.filter((_, idx) => idx !== index)
    });
  };

  // STAFF STATE
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    role: '',
    nip: '',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
    division: 'Pengawas SD' as 'Pimpinan' | 'Pengawas SD' | 'Penilik PAUD/TK' | 'Tata Usaha'
  });

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) {
      showToast('Nama dan Jabatan wajib diisi!', 'error');
      return;
    }

    if (editingStaffId) {
      updateStaff(editingStaffId, staffForm);
      setEditingStaffId(null);
    } else {
      addStaff(staffForm);
    }

    setStaffForm({
      name: '',
      role: '',
      nip: '',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
      division: 'Pengawas SD'
    });
  };

  // SCHOOL PHOTO UPLOAD
  const schoolPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleSchoolPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses foto sekolah...', 'info');
      const dataUrl = await compressImage(file, 1200, 0.82);
      setSchoolForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('Foto sekolah berhasil dipilih & siap disimpan ke database!', 'success');
    } catch (err) {
      showToast('Gagal memproses foto sekolah!', 'error');
    }
  };

  // --- 3. SCHOOLS CMS STATE ---
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    level: 'SD' as SchoolLevel,
    status: 'Negeri' as SchoolStatus,
    npsn: '',
    akreditasi: 'A' as Accreditation,
    headmaster: '',
    address: '',
    desa: 'Purwodadi',
    studentsCount: 250,
    teachersCount: 15,
    phone: '(0292) 421000',
    email: '',
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
    coordinates: '',
    titikKoordinat: ''
  });

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.npsn) {
      showToast('Nama sekolah dan NPSN wajib diisi!', 'error');
      return;
    }

    const rawLink = schoolForm.coordinates || schoolForm.titikKoordinat || '';
    const normalizedMapsUrl = normalizeToGoogleMapsUrl(rawLink);
    const preparedSchoolData = {
      ...schoolForm,
      coordinates: normalizedMapsUrl,
      titikKoordinat: normalizedMapsUrl
    };

    if (editingSchoolId) {
      updateSchool(editingSchoolId, preparedSchoolData);
      setEditingSchoolId(null);
    } else {
      addSchool(preparedSchoolData);
    }

    setSchoolForm({
      name: '',
      level: 'SD',
      status: 'Negeri',
      npsn: '',
      akreditasi: 'A',
      headmaster: '',
      address: '',
      desa: 'Purwodadi',
      studentsCount: 250,
      teachersCount: 15,
      phone: '(0292) 421000',
      email: '',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800',
      coordinates: '',
      titikKoordinat: ''
    });
  };

  // --- 4. NEWS & INFORMASI CMS STATE ---
  const [newsSubTab, setNewsSubTab] = useState<'news' | 'announcements'>('news');

  // News form
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const activeAuthorName = currentUser?.name || 'Humas Korwilcam Purwodadi';
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Kedinasan' as NewsCategory,
    summary: '',
    content: '',
    author: activeAuthorName,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
    tags: 'Pendidikan, Purwodadi',
    views: 0
  });

  // Otomatis sinkronkan nama penulis berita dengan akun login aktif (kolom name di admin_users)
  React.useEffect(() => {
    if (!editingNewsId && currentUser?.name) {
      setNewsForm((prev) => ({ ...prev, author: currentUser.name }));
    }
  }, [currentUser?.name, editingNewsId]);

  // NEWS COVER PHOTO UPLOAD
  const newsPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleNewsPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses gambar sampul berita...', 'info');
      const dataUrl = await compressImage(file, 1200, 0.82);
      setNewsForm((prev) => ({ ...prev, image: dataUrl }));
      showToast('Gambar sampul berita berhasil dipilih & siap disimpan ke database!', 'success');
    } catch (err) {
      showToast('Gagal memproses gambar sampul berita!', 'error');
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      showToast('Judul dan isi berita wajib diisi!', 'error');
      return;
    }

    const tagsArray = newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedViews = isSuperAdmin
      ? Math.max(0, Number(newsForm.views) || 0)
      : (editingNewsId ? (news.find((n) => n.id === editingNewsId)?.views || 0) : 0);

    if (editingNewsId) {
      updateNews(editingNewsId, {
        title: newsForm.title,
        category: newsForm.category,
        summary: newsForm.summary || newsForm.content.slice(0, 150) + '...',
        content: newsForm.content,
        author: newsForm.author,
        image: newsForm.image,
        tags: tagsArray,
        views: parsedViews
      });
      setEditingNewsId(null);
    } else {
      addNews({
        title: newsForm.title,
        slug: newsForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category: newsForm.category,
        summary: newsForm.summary || newsForm.content.slice(0, 150) + '...',
        content: newsForm.content,
        author: newsForm.author,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: newsForm.image,
        views: parsedViews,
        tags: tagsArray
      });
    }

    setNewsForm({
      title: '',
      category: 'Kedinasan',
      summary: '',
      content: '',
      author: activeAuthorName,
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
      tags: 'Pendidikan, Purwodadi',
      views: 0
    });
  };

  // Announcement form & File Upload State
  const annFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedAnnFile, setUploadedAnnFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [isDraggingAnn, setIsDraggingAnn] = useState(false);

  const [editingAnnId, setEditingAnnId] = useState<string | null>(null);
  const [annForm, setAnnForm] = useState({
    title: '',
    urgency: 'Penting' as 'Penting' | 'Biasa' | 'Mendesak',
    target: 'Semua Satuan' as 'Semua Satuan' | 'SD' | 'TK/PAUD',
    fileSize: '',
    fileUrl: '',
    fileName: '',
    fileType: '',
    summary: ''
  });

  const processSelectedAnnFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      showToast('Ukuran file lampiran melebihi batas maksimal 25 MB!', 'error');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedAnnFile({
        name: file.name,
        size: formattedSize,
        type: ext,
        dataUrl: dataUrl
      });

      setAnnForm((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : fileNameWithoutExt,
        fileSize: formattedSize,
        fileUrl: dataUrl,
        fileName: file.name,
        fileType: ext
      }));

      showToast(`Berkas lampiran "${file.name}" (${formattedSize}) siap diunggah & disimpan ke database Supabase!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAnnFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processSelectedAnnFile(file);
  };

  const handleAnnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAnn(true);
  };

  const handleAnnDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAnn(false);
  };

  const handleAnnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAnn(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processSelectedAnnFile(file);
  };

  const handleRemoveAnnFile = () => {
    setUploadedAnnFile(null);
    if (annFileInputRef.current) annFileInputRef.current.value = '';
    setAnnForm((prev) => ({
      ...prev,
      fileSize: '',
      fileUrl: '',
      fileName: '',
      fileType: ''
    }));
    showToast('Berkas lampiran pengumuman dilepas.', 'info');
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.summary) {
      showToast('Judul dan ringkasan pengumuman wajib diisi!', 'error');
      return;
    }

    if (editingAnnId) {
      updateAnnouncement(editingAnnId, annForm);
      setEditingAnnId(null);
    } else {
      addAnnouncement({
        ...annForm,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
    }

    // Reset form
    setUploadedAnnFile(null);
    if (annFileInputRef.current) annFileInputRef.current.value = '';
    setAnnForm({
      title: '',
      urgency: 'Penting',
      target: 'Semua Satuan',
      fileSize: '',
      fileUrl: '',
      fileName: '',
      fileType: '',
      summary: ''
    });
  };

  // --- 5. DOWNLOADS CMS STATE ---
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size: string;
    type: 'PDF' | 'DOCX' | 'XLSX';
    dataUrl: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docForm, setDocForm] = useState({
    title: '',
    category: 'Kurikulum' as 'Kurikulum' | 'Surat Edaran' | 'Blanko GTK' | 'Juknis Lomba',
    fileType: 'PDF' as 'PDF' | 'DOCX' | 'XLSX',
    fileSize: '1.5 MB',
    description: '',
    downloadUrl: '#'
  });

  const processSelectedFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      showToast('Ukuran file melebihi batas maksimal 25 MB!', 'error');
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 
      ? `${sizeInMB.toFixed(1)} MB` 
      : `${Math.round(file.size / 1024)} KB`;

    const ext = file.name.split('.').pop()?.toUpperCase() || '';
    let detectedType: 'PDF' | 'DOCX' | 'XLSX' = 'PDF';
    if (ext === 'DOC' || ext === 'DOCX') detectedType = 'DOCX';
    else if (ext === 'XLS' || ext === 'XLSX') detectedType = 'XLSX';

    const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: formattedSize,
        type: detectedType,
        dataUrl: dataUrl
      });

      setDocForm((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : fileNameWithoutExt,
        fileType: detectedType,
        fileSize: formattedSize,
        downloadUrl: dataUrl
      }));

      showToast(`Berkas "${file.name}" (${formattedSize}) siap diunggah!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setDocForm((prev) => ({
      ...prev,
      downloadUrl: '#'
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    showToast('File lampiran unduhan dihapus.', 'info');
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.description) {
      showToast('Judul dan deskripsi dokumen wajib diisi!', 'error');
      return;
    }

    if (editingDocId) {
      updateDocument(editingDocId, docForm);
      setEditingDocId(null);
    } else {
      addDocument({
        ...docForm,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
    }

    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setDocForm({
      title: '',
      category: 'Kurikulum',
      fileType: 'PDF',
      fileSize: '1.5 MB',
      description: '',
      downloadUrl: '#'
    });
  };

  // --- 6. GALLERY CMS STATE ---
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Kegiatan Belajar' as 'Kegiatan Belajar' | 'Lomba & Prestasi' | 'Rakor & Pelatihan' | 'Upacara',
    image: '',
    images: [] as string[],
    description: ''
  });

  const galleryMultiPhotoInputRef = useRef<HTMLInputElement | null>(null);

  const handleGalleryMultiUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast(`Memproses ${files.length} foto untuk album...`, 'info');
    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await compressImage(files[i], 1200, 0.82);
        newPhotos.push(dataUrl);
      } catch (err) {
        console.error('Failed to compress gallery photo:', err);
      }
    }

    if (newPhotos.length > 0) {
      setGalleryForm((prev) => {
        const updatedImages = [...prev.images, ...newPhotos];
        return {
          ...prev,
          images: updatedImages,
          image: prev.image || updatedImages[0]
        };
      });
      showToast(`${newPhotos.length} foto berhasil ditambahkan ke folder album!`, 'success');
    }
    e.target.value = '';
  };

  const handleRemoveGalleryPhoto = (index: number) => {
    setGalleryForm((prev) => {
      const updatedImages = prev.images.filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages[0] || ''
      };
    });
  };

  const handleSetCoverPhoto = (photoUrl: string) => {
    setGalleryForm((prev) => ({
      ...prev,
      image: photoUrl
    }));
    showToast('Foto sampul folder album berhasil diatur.', 'info');
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title) {
      showToast('Judul album kegiatan wajib diisi!', 'error');
      return;
    }
    if (galleryForm.images.length === 0 && !galleryForm.image) {
      showToast('Harap upload minimal 1 foto ke dalam folder album!', 'error');
      return;
    }

    const primaryCover = galleryForm.image || galleryForm.images[0];
    const imagesList = galleryForm.images.length > 0 ? galleryForm.images : [primaryCover];

    if (editingGalleryId) {
      updateGalleryItem(editingGalleryId, {
        title: galleryForm.title,
        category: galleryForm.category,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description
      });
      setEditingGalleryId(null);
    } else {
      addGalleryItem({
        title: galleryForm.title,
        category: galleryForm.category,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
    }

    setGalleryForm({
      title: '',
      category: 'Kegiatan Belajar',
      image: '',
      images: [],
      description: ''
    });
  };

  // --- 7. CONTACT & COMPLAINTS CMS STATE ---
  const [contactSubTab, setContactSubTab] = useState<'info' | 'inbox'>('inbox');
  const [contactForm, setContactForm] = useState({
    address: officeProfile.address,
    phone: officeProfile.phone,
    whatsapp: officeProfile.whatsapp,
    email: officeProfile.email,
    workingHours: officeProfile.workingHours
  });

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateOfficeProfile(contactForm);
  };

  const newComplaintsCount = complaints.filter((c) => c.status === 'Baru').length;

  // --- 8. USERS CMS STATE (Super Admin Only) ---
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    username: string;
    password: string;
    role: AdminRole;
    email: string;
    status: 'Aktif' | 'Nonaktif';
  }>({
    name: '',
    username: '',
    password: '',
    role: 'Admin',
    email: '',
    status: 'Aktif'
  });

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      username: '',
      password: '',
      role: 'Admin',
      email: '',
      status: 'Aktif'
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role,
      email: user.email || '',
      status: user.status
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name.trim() || !userForm.username.trim()) {
      showToast('Nama lengkap dan username wajib diisi!', 'error');
      return;
    }

    if (!editingUserId && !userForm.password.trim()) {
      showToast('Kata sandi wajib diisi untuk akun baru!', 'error');
      return;
    }

    if (editingUserId) {
      await updateAdminUser(editingUserId, {
        name: userForm.name.trim(),
        username: userForm.username.trim().toLowerCase(),
        ...(userForm.password.trim() ? { password: userForm.password.trim() } : {}),
        role: userForm.role,
        email: userForm.email.trim(),
        status: userForm.status
      });
    } else {
      await addAdminUser({
        name: userForm.name.trim(),
        username: userForm.username.trim().toLowerCase(),
        password: userForm.password.trim(),
        role: userForm.role,
        email: userForm.email.trim(),
        status: userForm.status
      });
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    if (window.confirm(`Yakin ingin menghapus akun pengelola "${user.username}" (${user.name})?`)) {
      await deleteAdminUser(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Bar */}
      {/* Header Bar */}
      <header className="bg-slate-900 text-white py-3 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-auto flex items-center justify-center shrink-0">
            <img 
              src="/logo.png" 
              alt="Logo Kabupaten Grobogan" 
              className="h-10 w-auto object-contain drop-shadow"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
                PANEL CMS KORWILCAM PURWODADI
              </h1>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                Online
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
              Pengelolaan Menyeluruh Seluruh Menu & Konten Tampilan Website
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isSuperAdmin ? (
            <button
              type="button"
              onClick={() => setShowSupabaseModal(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm cursor-pointer ${
                isSupabaseActive
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
              }`}
              title="Pengaturan & Sinkronisasi Database Cloud (Akses Khusus Super Admin)"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseActive 
                  ? (syncStatus === 'syncing' ? 'bg-blue-400 animate-spin' : 'bg-emerald-400 animate-pulse') 
                  : 'bg-amber-400'
              }`} />
              <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="hidden sm:inline">
                {isSupabaseActive
                  ? (syncStatus === 'syncing' ? 'Menyimpan ke Cloud...' : 'Auto-Save Cloud: AKTIF')
                  : 'Supabase Offline (Klik Hubungkan)'}
              </span>
              <span className="sm:hidden">
                {isSupabaseActive ? 'Cloud Aktif' : 'Offline'}
              </span>
            </button>
          ) : (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm cursor-not-allowed select-none ${
                isSupabaseActive
                  ? 'bg-emerald-500/10 text-emerald-400/90 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700'
              }`}
              title="Status Auto-Save Cloud: AKTIF (Terkunci: Pengaturan database hanya dapat diakses oleh Super Admin)"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseActive 
                  ? (syncStatus === 'syncing' ? 'bg-blue-400 animate-spin' : 'bg-emerald-400') 
                  : 'bg-slate-500'
              }`} />
              <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="hidden sm:inline">
                {isSupabaseActive
                  ? (syncStatus === 'syncing' ? 'Menyimpan ke Cloud...' : 'Auto-Save Cloud: AKTIF')
                  : 'Auto-Save Cloud: Nonaktif'}
              </span>
              <span className="sm:hidden">
                {isSupabaseActive ? 'Cloud Aktif' : 'Offline'}
              </span>
              <Lock className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
            </div>
          )}

          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Lihat Website</span>
            <span className="sm:hidden">Web</span>
          </button>

          {/* Active User Profile & Role Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
              currentUser?.role === 'Super Admin'
                ? 'bg-purple-600 text-white'
                : currentUser?.role === 'Admin'
                ? 'bg-blue-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}>
              {currentUser?.role === 'Super Admin' ? (
                <Crown className="w-3.5 h-3.5" />
              ) : currentUser?.role === 'Admin' ? (
                <Shield className="w-3.5 h-3.5" />
              ) : (
                <PenTool className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="hidden md:flex flex-col text-left leading-tight">
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {currentUser?.name || 'Administrator'}
              </span>
              <span className={`text-[9px] font-extrabold uppercase mt-0.5 ${
                currentUser?.role === 'Super Admin'
                  ? 'text-purple-300'
                  : currentUser?.role === 'Admin'
                  ? 'text-blue-300'
                  : 'text-emerald-300'
              }`}>
                {currentUser?.role || 'Admin'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Sidebar Nav: Matched 1-to-1 with Public Menus */}
        <aside className="w-full lg:w-72 xl:w-80 bg-white border-r border-slate-200 p-3.5 space-y-1 shrink-0 select-none">
          
          <div className="px-2.5 pt-1 pb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Menu Pengelolaan Web
            </span>
          </div>

          {/* Overview */}
          <button
            type="button"
            onClick={() => setCurrentSection('overview')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'overview'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'overview' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'overview' ? 'text-white' : 'text-slate-800'
                }`}>
                  Ringkasan Dashboard
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'overview' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Statistik & Status Sistem
                </span>
              </div>
            </div>
          </button>

          <div className="pt-3 pb-1 px-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-t border-slate-100 pt-2.5">
              Kelola Halaman Publik:
            </span>
          </div>

          {/* 1. Beranda */}
          <button
            type="button"
            onClick={() => setCurrentSection('home-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'home-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'home-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Home className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'home-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Beranda
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'home-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Hero, Banner & Sambutan
                </span>
              </div>
            </div>
          </button>

          {/* 2. Profil */}
          <button
            type="button"
            onClick={() => setCurrentSection('profile-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'profile-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'profile-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'profile-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Profil Instansi
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'profile-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Visi-Misi & Jajaran Pejabat
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'profile-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {staff.length} Staf
            </span>
          </button>

          {/* 3. Direktori Sekolah */}
          <button
            type="button"
            onClick={() => setCurrentSection('schools-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'schools-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'schools-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'schools-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Direktori Sekolah
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'schools-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Pangkalan Data SD, TK, PAUD
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'schools-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {schools.length}
            </span>
          </button>

          {/* 4. Warta & Informasi */}
          <button
            type="button"
            onClick={() => setCurrentSection('news-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'news-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'news-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'news-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Warta & Informasi
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'news-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Berita & Surat Edaran
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'news-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {news.length + announcements.length}
            </span>
          </button>

          {/* 5. Layanan Unduhan */}
          <button
            type="button"
            onClick={() => setCurrentSection('downloads-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'downloads-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'downloads-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Download className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'downloads-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Layanan Unduhan
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'downloads-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Modul Kurikulum & Blanko
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'downloads-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {documents.length}
            </span>
          </button>

          {/* 6. Galeri */}
          <button
            type="button"
            onClick={() => setCurrentSection('gallery-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'gallery-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'gallery-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'gallery-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Galeri Kegiatan
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'gallery-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Folder Album & Dokumentasi
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'gallery-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {gallery.length} Album
            </span>
          </button>

          {/* 7. Kontak & Aduan */}
          <button
            type="button"
            onClick={() => setCurrentSection('contact-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'contact-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'contact-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
              }`}>
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'contact-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Kontak & Pengaduan
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'contact-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  Info Kantor & Kotak Masuk
                </span>
              </div>
            </div>
            {newComplaintsCount > 0 && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                currentSection === 'contact-cms' ? 'bg-white/20 text-white' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {newComplaintsCount} Baru
              </span>
            )}
          </button>

          {/* 8. Pengaturan Akun & Hak Akses (Khusus Super Admin) */}
          {currentUser?.role === 'Super Admin' && (
            <>
              <div className="pt-3 pb-1 px-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 block border-t border-slate-100 pt-2.5">
                  Hak Akses Khusus:
                </span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentSection('users-cms')}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                  currentSection === 'users-cms'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'users-cms' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-600'
                  }`}>
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'users-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Kelola Akun Pengelola
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'users-cms' ? 'text-purple-100' : 'text-slate-400'
                    }`}>
                      Super Admin, Admin, Penulis
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'users-cms' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                }`}>
                  {adminUsers.length} Akun
                </span>
              </button>
            </>
          )}

          {/* Factory reset button (Khusus Super Admin) */}
          {currentUser?.role === 'Super Admin' && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Yakin ingin mereset seluruh data kembali ke data bawaan awal pabrik?')) {
                    resetToDefaultData();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-[11px] font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/80 transition-colors border border-rose-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seluruh Data ke Awal</span>
              </button>
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {currentUser?.role === 'Penulis' && currentSection !== 'overview' && currentSection !== 'news-cms' ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto my-12 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Hak Akses Terbatas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akun Anda memiliki role <strong className="text-emerald-700">Penulis</strong>. Wewenang akun Penulis difokuskan untuk menulis, menyunting, dan menerbitkan artikel pada menu <strong>Warta & Informasi</strong>.
              </p>
              <button
                onClick={() => setCurrentSection('news-cms')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all"
              >
                Buka Menu Warta & Informasi
              </button>
            </div>
          ) : (
            <>
              {/* TAB 0: OVERVIEW */}
              {currentSection === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Ringkasan Pengelolaan Website
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Seluruh menu di panel ini sinkron dengan halaman depan website Korwilcam Purwodadi.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div 
                  onClick={() => setCurrentSection('news-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Warta Berita</span>
                  <div className="text-3xl font-extrabold text-blue-600">{news.length}</div>
                  <span className="text-[11px] text-slate-400">Artikel aktif</span>
                </div>

                <div 
                  onClick={() => setCurrentSection('schools-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Satuan Sekolah</span>
                  <div className="text-3xl font-extrabold text-indigo-600">{schools.length}</div>
                  <span className="text-[11px] text-slate-400">SD, TK, & PAUD</span>
                </div>

                <div 
                  onClick={() => setCurrentSection('downloads-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Berkas Unduhan</span>
                  <div className="text-3xl font-extrabold text-emerald-600">{documents.length}</div>
                  <span className="text-[11px] text-slate-400">Modul & blanko</span>
                </div>

                <div 
                  onClick={() => setCurrentSection('contact-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Aspirasi & Aduan</span>
                  <div className="text-3xl font-extrabold text-rose-600">{complaints.length}</div>
                  <span className="text-[11px] text-slate-400">{newComplaintsCount} pesan baru</span>
                </div>
              </div>

              {/* Supabase Status Banner Card */}
              <div className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                isSupabaseActive 
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200' 
                  : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-blue-200'
              }`}>
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isSupabaseActive ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  }`}>
                    <Database className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {isSupabaseActive ? 'Database Supabase Cloud Aktif' : 'Sinkronisasi Database Cloud (Supabase)'}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSupabaseActive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isSupabaseActive ? 'Terkoneksi' : 'Mode Offline (LocalStorage)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isSupabaseActive 
                        ? 'Data sekolah, warta, dokumen, dan pesan aspirasi tersimpan aman di cloud PostgreSQL Supabase.'
                        : 'Web saat ini berjalan dengan penyimpanan browser. Hubungkan ke Supabase agar data tersimpan permanen di cloud.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isSuperAdmin ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowSupabaseModal(true)}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <span>Pengaturan Database</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                      {isSupabaseActive && (
                        <button
                          type="button"
                          disabled={isExporting}
                          onClick={handleExportToSupabase}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
                          <span>{isExporting ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="px-3 py-2 rounded-xl bg-white/70 text-slate-500 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 select-none cursor-not-allowed" title="Pengaturan database hanya dapat diakses oleh Super Admin">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Pengaturan Database Terkunci</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Matrix */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm">
                  Pilih Menu yang Ingin Diubah Sesuai Tampilan Web Depan:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: 'home-cms', title: 'Halaman Beranda', desc: 'Ubah teks headline, subtitle hero, foto, dan kutipan sambutan', icon: Home, color: 'text-blue-600 bg-blue-50' },
                    { id: 'profile-cms', title: 'Halaman Profil', desc: 'Ubah visi misi, sambutan korwil, dan daftar pengawas/penilik', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
                    { id: 'schools-cms', title: 'Direktori Sekolah', desc: 'Tambah/edit data SD, TK, PAUD, NPSN, akreditasi, dan kepsek', icon: GraduationCap, color: 'text-sky-600 bg-sky-50' },
                    { id: 'news-cms', title: 'Warta & Informasi', desc: 'Kelola artikel berita, surat edaran penting, dan agenda kegiatan', icon: FileText, color: 'text-amber-600 bg-amber-50' },
                    { id: 'downloads-cms', title: 'Layanan Unduhan', desc: 'Kelola modul ajar Kurikulum Merdeka, blanko SKP, dan formulir', icon: Download, color: 'text-emerald-600 bg-emerald-50' },
                    { id: 'gallery-cms', title: 'Galeri Kegiatan', desc: 'Upload foto dokumentasi kegiatan belajar, lomba, dan upacara', icon: ImageIcon, color: 'text-purple-600 bg-purple-50' },
                    { id: 'contact-cms', title: 'Kontak & Pengaduan', desc: 'Ubah alamat, telepon, WhatsApp, dan cek kotak masuk aspirasi', icon: Phone, color: 'text-rose-600 bg-rose-50' }
                  ].map((menu, i) => {
                    const Icon = menu.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => setCurrentSection(menu.id as AdminSection)}
                        className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex items-start gap-3"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${menu.color} group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors">
                            {menu.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {menu.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: KELOLA BERANDA */}
          {currentSection === 'home-cms' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Tampilan Halaman Beranda
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ubah banner hero, teks sambutan, judul headline, dan semboyan utama di halaman beranda depan.
                </p>
              </div>

              <form onSubmit={handleSaveHomeCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Badge Atas Hero Banner</label>
                  <input
                    type="text"
                    value={homeForm.heroBadge}
                    onChange={(e) => setHomeForm({ ...homeForm, heroBadge: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Judul Headline Utama (Hero H1)</label>
                  <input
                    type="text"
                    value={homeForm.heroTitle}
                    onChange={(e) => setHomeForm({ ...homeForm, heroTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Subtitle / Paragraf Sambutan Hero</label>
                  <textarea
                    rows={3}
                    value={homeForm.heroSubtitle}
                    onChange={(e) => setHomeForm({ ...homeForm, heroSubtitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Kutipan Inspirasi Pimpinan di Card Kanan</label>
                  <textarea
                    rows={2}
                    value={homeForm.korwilQuote}
                    onChange={(e) => setHomeForm({ ...homeForm, korwilQuote: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Tagline / Semboyan Instansi</label>
                  <input
                    type="text"
                    value={homeForm.tagline}
                    onChange={(e) => setHomeForm({ ...homeForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Tampilan Beranda</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: KELOLA PROFIL */}
          {currentSection === 'profile-cms' && (
            <div className="space-y-8 max-w-5xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Halaman Profil, Visi-Misi & Pejabat
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur sambutan resmi pimpinan, rumusan visi & misi, serta daftar pengawas SD dan penilik PAUD/TK.
                </p>
              </div>

              {/* Sambutan & Visi Misi Form */}
              <form onSubmit={handleSaveProfileCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <h3 className="font-bold text-sm text-slate-900 border-b pb-2">
                  Profil & Sambutan Resmi Koordinator Wilayah
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Pimpinan Korwilcam</label>
                    <input
                      type="text"
                      value={profileForm.korwilName}
                      onChange={(e) => setProfileForm({ ...profileForm, korwilName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIP Pimpinan Korwilcam</label>
                    <input
                      type="text"
                      value={profileForm.korwilNip}
                      onChange={(e) => setProfileForm({ ...profileForm, korwilNip: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Foto Resmi Pimpinan */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Foto Resmi Pimpinan Korwilcam</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Disimpan ke Database Supabase
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Avatar */}
                    <div className="relative group shrink-0">
                      <img
                        src={profileForm.korwilPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600'}
                        alt="Foto Pimpinan"
                        className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl border-2 border-white shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => korwilPhotoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ubah</span>
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs text-slate-600">
                        Pilih foto resmi pimpinan langsung dari komputer / laptop Anda (JPG, PNG, WebP).
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => korwilPhotoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Pilih & Upload Foto Pimpinan</span>
                        </button>
                        {profileForm.korwilPhoto && profileForm.korwilPhoto.startsWith('data:') && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Foto siap disimpan ke database
                          </span>
                        )}
                      </div>
                      <input
                        ref={korwilPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleKorwilPhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Judul Sambutan Pimpinan</label>
                  <input
                    type="text"
                    value={profileForm.greetingTitle}
                    onChange={(e) => setProfileForm({ ...profileForm, greetingTitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Isi Sambutan Resmi Pimpinan</label>
                  <textarea
                    rows={4}
                    value={profileForm.greetingText}
                    onChange={(e) => setProfileForm({ ...profileForm, greetingText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none leading-relaxed"
                  ></textarea>
                </div>

                <h3 className="font-bold text-sm text-slate-900 border-b pb-2 pt-4">
                  Rumusan Visi & Misi Pendidikan Purwodadi
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Visi Instansi</label>
                  <textarea
                    rows={2}
                    value={profileForm.vision}
                    onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-medium"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Daftar Butir Misi</label>
                  <div className="space-y-2">
                    {profileForm.missions.map((misi, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-blue-600 shrink-0">0{idx + 1}.</span>
                        <span className="flex-1 text-slate-700">{misi}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMission(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50"
                          title="Hapus butir misi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={newMissionText}
                      onChange={(e) => setNewMissionText(e.target.value)}
                      placeholder="Tulis butir misi baru..."
                      className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddMission}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-700 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Misi</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Sambutan & Visi-Misi</span>
                </button>
              </form>

              {/* Jajaran Pejabat / Pengawas / Penilik CRUD */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900">
                      Kelola Pejabat, Pengawas SD & Penilik PAUD/TK
                    </h3>
                    <p className="text-xs text-slate-500">
                      Daftar nama ini ditampilkan di bagian Struktur Organisasi halaman Profil.
                    </p>
                  </div>
                </div>

                {/* Form Staff */}
                <form onSubmit={handleSaveStaff} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                      <input
                        type="text"
                        required
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        placeholder="Contoh: Drs. Sutrisno, M.Pd."
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Jabatan / Peran *</label>
                      <input
                        type="text"
                        required
                        value={staffForm.role}
                        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                        placeholder="Contoh: Pengawas SD Madya"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Divisi</label>
                      <select
                        value={staffForm.division}
                        onChange={(e) => setStaffForm({ ...staffForm, division: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value="Pimpinan">Pimpinan</option>
                        <option value="Pengawas SD">Pengawas SD</option>
                        <option value="Penilik PAUD/TK">Penilik PAUD/TK</option>
                        <option value="Tata Usaha">Tata Usaha</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nomor Induk Pegawai (NIP)</label>
                    <input
                      type="text"
                      value={staffForm.nip}
                      onChange={(e) => setStaffForm({ ...staffForm, nip: e.target.value })}
                      placeholder="19700101..."
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Upload Pas Foto Pegawai */}
                  <div className="space-y-2 p-4 rounded-xl bg-white border border-slate-200">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pas Foto Pegawai / Staf *</span>
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Disimpan ke Database Supabase
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                      {/* Preview Avatar */}
                      <div className="relative group shrink-0">
                        <img
                          src={staffForm.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600'}
                          alt="Foto Pegawai"
                          className="w-16 h-20 object-cover rounded-xl border-2 border-slate-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => staffPhotoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Ganti</span>
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <p className="text-xs text-slate-500">
                          Upload pas foto resmi pegawai langsung dari komputer / laptop Anda (format JPG, PNG).
                        </p>
                        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            onClick={() => staffPhotoInputRef.current?.click()}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Pilih Foto Pegawai dari Komputer</span>
                          </button>
                          {staffForm.photo && staffForm.photo.startsWith('data:') && (
                            <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Foto pegawai siap disimpan
                            </span>
                          )}
                        </div>
                        <input
                          ref={staffPhotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleStaffPhotoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{editingStaffId ? 'Simpan Perubahan' : 'Tambah Pejabat/Staf'}</span>
                    </button>
                    {editingStaffId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStaffId(null);
                          setStaffForm({
                            name: '',
                            role: '',
                            nip: '',
                            photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
                            division: 'Pengawas SD'
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>

                {/* Table staff */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Foto & Nama</th>
                        <th className="p-3">Jabatan</th>
                        <th className="p-3">Divisi</th>
                        <th className="p-3">NIP</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staff.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={st.photo} alt={st.name} className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-bold text-slate-900">{st.name}</span>
                          </td>
                          <td className="p-3">{st.role}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                              {st.division}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{st.nip}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingStaffId(st.id);
                                  setStaffForm({
                                    name: st.name,
                                    role: st.role,
                                    nip: st.nip,
                                    photo: st.photo,
                                    division: st.division
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus ${st.name}?`)) {
                                    deleteStaff(st.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: KELOLA SEKOLAH */}
          {currentSection === 'schools-cms' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Direktori Sekolah (SD / TK / PAUD)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pangkalan data sekolah yang tampil di menu Direktori Sekolah publik.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveSchool} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Sekolah *</label>
                    <input
                      type="text"
                      required
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      placeholder="Contoh: SD Negeri 1 Purwodadi"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Jenjang</label>
                    <select
                      value={schoolForm.level}
                      onChange={(e) => setSchoolForm({ ...schoolForm, level: e.target.value as SchoolLevel })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    >
                      <option value="SD">Sekolah Dasar (SD)</option>
                      <option value="TK">Taman Kanak-Kanak (TK)</option>
                      <option value="PAUD">PAUD / KB / SPS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={schoolForm.status}
                      onChange={(e) => setSchoolForm({ ...schoolForm, status: e.target.value as SchoolStatus })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Negeri">Negeri</option>
                      <option value="Swasta">Swasta</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NPSN *</label>
                    <input
                      type="text"
                      required
                      value={schoolForm.npsn}
                      onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Akreditasi</label>
                    <select
                      value={schoolForm.akreditasi}
                      onChange={(e) => setSchoolForm({ ...schoolForm, akreditasi: e.target.value as Accreditation })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="A">Nilai A</option>
                      <option value="B">Nilai B</option>
                      <option value="C">Nilai C</option>
                      <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Desa / Kelurahan</label>
                    <input
                      type="text"
                      value={schoolForm.desa}
                      onChange={(e) => setSchoolForm({ ...schoolForm, desa: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kepala Sekolah</label>
                    <input
                      type="text"
                      value={schoolForm.headmaster}
                      onChange={(e) => setSchoolForm({ ...schoolForm, headmaster: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Lengkap</label>
                    <input
                      type="text"
                      value={schoolForm.address}
                      onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>Link Titik Google Maps</span>
                      </span>
                      <span className="text-[10px] text-blue-600 font-semibold">Tautan / URL Maps</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: https://maps.app.goo.gl/... atau https://www.google.com/maps?q=-7.086389,110.916111"
                      value={schoolForm.coordinates || schoolForm.titikKoordinat || ''}
                      onChange={(e) => setSchoolForm({ ...schoolForm, coordinates: e.target.value, titikKoordinat: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-400">
                      Tempelkan link lokasi dari Google Maps (misal: tautan bagikan <i>maps.app.goo.gl</i> atau koordinat).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Jumlah Siswa</label>
                    <input
                      type="number"
                      value={schoolForm.studentsCount}
                      onChange={(e) => setSchoolForm({ ...schoolForm, studentsCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Jumlah Guru</label>
                    <input
                      type="number"
                      value={schoolForm.teachersCount}
                      onChange={(e) => setSchoolForm({ ...schoolForm, teachersCount: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Telepon / Kontak</label>
                    <input
                      type="text"
                      value={schoolForm.phone}
                      onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload Foto Profil / Gedung Sekolah */}
                <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Foto Profil / Gedung Sekolah *</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Disimpan ke Database Supabase
                    </span>
                  </label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Preview Image */}
                    <div className="relative group shrink-0">
                      <img
                        src={schoolForm.image || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=800'}
                        alt="Foto Sekolah"
                        className="w-36 h-24 sm:w-44 sm:h-28 object-cover rounded-xl border-2 border-white shadow-md bg-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => schoolPhotoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Ganti Foto</span>
                      </button>
                    </div>

                    {/* Controls */}
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <p className="text-xs text-slate-600">
                        Upload foto gerbang depan, papan nama, atau gedung sekolah langsung dari file dokumen komputer Anda (JPG, PNG, WebP).
                      </p>
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => schoolPhotoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Pilih Foto Sekolah dari Dokumen</span>
                        </button>
                        {schoolForm.image && schoolForm.image.startsWith('data:') && (
                          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Foto sekolah siap disimpan ke database
                          </span>
                        )}
                      </div>
                      <input
                        ref={schoolPhotoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSchoolPhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingSchoolId ? 'Simpan Perubahan Sekolah' : 'Tambah Sekolah Baru'}</span>
                  </button>
                  {editingSchoolId && (
                    <button
                      type="button"
                      onClick={() => setEditingSchoolId(null)}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
                  Daftar Sekolah ({schools.length} Satuan)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Nama Satuan</th>
                        <th className="p-3">Jenjang</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">NPSN</th>
                        <th className="p-3">Akreditasi</th>
                        <th className="p-3">Kepala Sekolah</th>
                        <th className="p-3">Link Google Maps</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schools.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              {item.level}
                            </span>
                          </td>
                          <td className="p-3">{item.status}</td>
                          <td className="p-3 font-mono font-bold">{item.npsn}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Nilai {item.akreditasi}
                            </span>
                          </td>
                          <td className="p-3">{item.headmaster}</td>
                          <td className="p-3">
                            {(() => {
                              const mapsUrl = getGoogleMapsUrl(item);
                              return (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-semibold transition-colors group shadow-2xs"
                                  title={mapsUrl}
                                >
                                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate max-w-[120px]">Buka Link Maps</span>
                                  <ExternalLink className="w-3 h-3 text-blue-500 group-hover:scale-110 transition-transform" />
                                </a>
                              );
                            })()}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingSchoolId(item.id);
                                  setSchoolForm({
                                    ...item,
                                    coordinates: item.coordinates || item.titikKoordinat || '',
                                    titikKoordinat: item.titikKoordinat || item.coordinates || ''
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Hapus ${item.name}?`)) {
                                    deleteSchool(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KELOLA WARTA & INFORMASI */}
          {currentSection === 'news-cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Warta & Pengumuman
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Konten ini langsung ditampilkan pada menu Warta & Informasi web publik. (Data Agenda penggunaan aula dikelola otomatis langsung dari database spreadsheet).
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setNewsSubTab('news')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    newsSubTab === 'news' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Berita & Liputan ({news.length})</span>
                </button>

                <button
                  onClick={() => setNewsSubTab('announcements')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    newsSubTab === 'announcements' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                  <span>Pengumuman & Surat Edaran ({announcements.length})</span>
                </button>
              </div>

              {/* Subtab 1: News */}
              {newsSubTab === 'news' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveNews} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Judul Berita *</label>
                        <input
                          type="text"
                          required
                          value={newsForm.title}
                          onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Kategori</label>
                        <select
                          value={newsForm.category}
                          onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as NewsCategory })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="Kedinasan">Kedinasan</option>
                          <option value="SD">Sekolah Dasar (SD)</option>
                          <option value="TK/PAUD">TK & PAUD</option>
                          <option value="Prestasi">Prestasi</option>
                        </select>
                      </div>
                    </div>

                    {/* Upload Gambar Sampul Berita */}
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-blue-600" />
                          <span>Gambar Sampul / Banner Berita *</span>
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Disimpan ke Database Supabase
                        </span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Preview Image */}
                        <div className="relative group shrink-0">
                          <img
                            src={newsForm.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000'}
                            alt="Sampul Berita"
                            className="w-36 h-24 sm:w-44 sm:h-28 object-cover rounded-xl border-2 border-white shadow-md bg-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => newsPhotoInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Ganti Sampul</span>
                          </button>
                        </div>

                        {/* Controls */}
                        <div className="flex-1 space-y-2 text-center sm:text-left">
                          <p className="text-xs text-slate-600">
                            Upload foto dokumentasi atau banner berita langsung dari file komputer Anda (JPG, PNG, WebP).
                          </p>
                          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                            <button
                              type="button"
                              onClick={() => newsPhotoInputRef.current?.click()}
                              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Pilih Gambar Sampul dari Komputer</span>
                            </button>
                            {newsForm.image && newsForm.image.startsWith('data:') && (
                              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Gambar sampul siap disimpan ke database
                              </span>
                            )}
                          </div>
                          <input
                            ref={newsPhotoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleNewsPhotoUpload}
                            className="hidden"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Penulis / Humas</label>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            <span>Otomatis Akun Login</span>
                          </span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={editingNewsId ? (newsForm.author || activeAuthorName) : activeAuthorName}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-not-allowed select-none shadow-inner"
                          title="Penulis otomatis mendeteksi nama dari akun login di database dan tidak dapat diubah"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Ringkasan Singkat Berita</label>
                        <input
                          type="text"
                          value={newsForm.summary}
                          onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                          placeholder="Ringkasan 1-2 kalimat untuk pratinjau kartu berita..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Jumlah Tayangan (Views)</span>
                          </span>
                          {isSuperAdmin ? (
                            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              Sinkron ke Web
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              <span>Terkunci (Super Admin)</span>
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            readOnly={!isSuperAdmin}
                            disabled={!isSuperAdmin}
                            value={newsForm.views}
                            onChange={(e) => {
                              if (isSuperAdmin) {
                                setNewsForm({ ...newsForm, views: Math.max(0, parseInt(e.target.value) || 0) });
                              }
                            }}
                            placeholder="0"
                            className={`w-full pl-3.5 pr-20 py-2 rounded-xl border border-slate-200 text-xs font-bold ${
                              isSuperAdmin
                                ? 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
                                : 'bg-slate-100 text-slate-600 cursor-not-allowed select-none shadow-inner'
                            }`}
                            title={isSuperAdmin ? 'Atur jumlah tayangan manual' : 'Jumlah tayangan dikunci dan hanya dapat diedit oleh Super Admin'}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                            tayangan
                          </div>
                        </div>
                        <p className={`text-[10px] ${isSuperAdmin ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isSuperAdmin
                            ? 'Bisa diatur manual untuk memancing pembaca & akan bertambah otomatis saat dibaca.'
                            : 'Jumlah tayangan bertambah otomatis saat dibaca pengunjung (Hanya Super Admin yang dapat mengubah manual).'}
                        </p>
                      </div>
                    </div>

                    {/* Rich Text Document Editor Canvas (Sesuai Gambar 2 Pengguna) */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-900 font-extrabold text-sm">
                          <span>Lembar Kerja Naskah Berita Lengkap *</span>
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          Editor Dokumen Pengolah Kata (WYSIWYG)
                        </span>
                      </label>
                      <RichTextEditor
                        value={newsForm.content}
                        onChange={(content) => setNewsForm((prev) => ({ ...prev, content }))}
                        placeholder="Mulai menulis berita & liputan di lembar dokumen ini... Gunakan bilah alat di atas untuk mengatur judul bab, huruf tebal/miring, warna teks, kutipan, dan menyisipkan foto dokumentasi."
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingNewsId ? 'Simpan Perubahan' : 'Terbitkan Berita'}</span>
                      </button>
                      {editingNewsId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNewsId(null);
                            setNewsForm({
                              title: '',
                              category: 'Kedinasan',
                              summary: '',
                              content: '',
                              author: activeAuthorName,
                              image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
                              tags: 'Pendidikan, Purwodadi',
                              views: 0
                            });
                          }}
                          className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </form>

                  {/* List news */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
                      Daftar Berita ({news.length} Artikel)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {news.map((item) => (
                        <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                          <div className="flex items-center gap-3 min-w-0">
                            <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                <span>{item.date}</span>
                                <span>•</span>
                                <span>{item.category}</span>
                                <span>•</span>
                                <span>{item.author}</span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                  <Eye className="w-3 h-3" />
                                  {item.views || 0} tayangan
                                </span>
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-purple-600 font-semibold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100" title={getArticleReadingStats(item).detailed}>
                                  <Clock className="w-3 h-3" />
                                  {getArticleReadingStats(item).text}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setEditingNewsId(item.id);
                                setNewsForm({
                                  title: item.title,
                                  category: item.category,
                                  summary: item.summary,
                                  content: item.content,
                                  author: item.author,
                                  image: item.image,
                                  tags: item.tags.join(', '),
                                  views: item.views || 0
                                });
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus ${item.title}?`)) {
                                  deleteNews(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Subtab 2: Announcements */}
              {newsSubTab === 'announcements' && (
                <div className="space-y-6">
                  <form onSubmit={handleSaveAnnouncement} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Judul Pengumuman / Edaran *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Surat Edaran Penyesuaian Jam Belajar Madrasah & Sekolah..."
                        value={annForm.title}
                        onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Urgensi</label>
                        <select
                          value={annForm.urgency}
                          onChange={(e) => setAnnForm({ ...annForm, urgency: e.target.value as any })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="Mendesak">Mendesak</option>
                          <option value="Penting">Penting</option>
                          <option value="Biasa">Biasa</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Sasaran</label>
                        <select
                          value={annForm.target}
                          onChange={(e) => setAnnForm({ ...annForm, target: e.target.value as any })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="Semua Satuan">Semua Satuan</option>
                          <option value="SD">Khusus SD</option>
                          <option value="TK/PAUD">Khusus TK/PAUD</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Ukuran / Info Lampiran</label>
                        <input
                          type="text"
                          placeholder="Terisi otomatis saat file dipilih"
                          value={annForm.fileSize}
                          onChange={(e) => setAnnForm({ ...annForm, fileSize: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* File Upload Dropzone / Preview for Announcement */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <FolderUp className="w-3.5 h-3.5 text-blue-600" />
                          <span>Upload File Lampiran Pengumuman (Tersimpan ke Database Supabase)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Format: PDF, Word, Excel, PPT, ZIP, dll. (Maks 25 MB)</span>
                      </label>

                      {!uploadedAnnFile && (!editingAnnId || !annForm.fileUrl || annForm.fileUrl === '#') ? (
                        <div
                          onDragOver={handleAnnDragOver}
                          onDragLeave={handleAnnDragLeave}
                          onDrop={handleAnnDrop}
                          onClick={() => annFileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer group ${
                            isDraggingAnn 
                              ? 'border-blue-500 bg-blue-50 scale-[0.99]' 
                              : 'border-blue-200/80 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70'
                          }`}
                        >
                          <input
                            ref={annFileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,application/*"
                            onChange={handleAnnFileUpload}
                            className="hidden"
                          />
                          <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-slate-800">
                            Klik untuk memilih file lampiran atau seret (drag & drop) file ke sini
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Mendukung semua format berkas: PDF, DOCX, XLSX, PPTX, arsip ZIP, gambar, dll.
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Paperclip className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                  {uploadedAnnFile?.name || annForm.fileName || `${annForm.title}.${(annForm.fileType || 'pdf').toLowerCase()}`}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Berkas Siap Diunduh Pengunjung</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Format: <strong className="text-slate-800">{uploadedAnnFile?.type || annForm.fileType || 'BERKAS'}</strong> • Ukuran: <strong className="text-slate-800">{uploadedAnnFile?.size || annForm.fileSize || 'Otomatis'}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            {(uploadedAnnFile?.dataUrl || annForm.fileUrl) && (
                              <button
                                type="button"
                                onClick={() => {
                                  const url = uploadedAnnFile?.dataUrl || annForm.fileUrl;
                                  if (!url || url === '#') return;
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = uploadedAnnFile?.name || annForm.fileName || 'lampiran_pengumuman';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-bold transition-colors flex items-center gap-1"
                                title="Uji coba download berkas"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Uji Download</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => annFileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-all"
                            >
                              Ganti Berkas
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveAnnFile}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                              title="Hapus Lampiran Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <input
                              ref={annFileInputRef}
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.png,.jpg,.jpeg,application/*"
                              onChange={handleAnnFileUpload}
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Ringkasan Surat Edaran *</label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Uraikan intisari pengumuman atau surat edaran ini secara jelas..."
                        value={annForm.summary}
                        onChange={(e) => setAnnForm({ ...annForm, summary: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      ></textarea>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingAnnId ? 'Simpan Perubahan Pengumuman' : 'Terbitkan Pengumuman & Berkas'}</span>
                        </button>
                        {editingAnnId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAnnId(null);
                              setUploadedAnnFile(null);
                              if (annFileInputRef.current) annFileInputRef.current.value = '';
                              setAnnForm({
                                title: '',
                                urgency: 'Penting',
                                target: 'Semua Satuan',
                                fileSize: '',
                                fileUrl: '',
                                fileName: '',
                                fileType: '',
                                summary: ''
                              });
                            }}
                            className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 transition-colors"
                          >
                            Batal
                          </button>
                        )}
                      </div>

                      {isSupabaseActive ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Otomatis Tersimpan ke Supabase Cloud (Tanpa Perlu Ekspor)</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                          <span>Penyimpanan Lokal Aktif</span>
                        </div>
                      )}
                    </div>
                  </form>

                  {/* List announcements */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                        Daftar Pengumuman Aktif ({announcements.length} Berkas)
                      </h3>
                    </div>

                    {announcements.map((ann) => (
                      <div key={ann.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {ann.urgency}
                            </span>
                            <span className="text-xs font-mono text-slate-400">{ann.date} • Sasaran: {ann.target}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">{ann.title}</h4>
                          <p className="text-xs text-slate-600 line-clamp-2">{ann.summary}</p>
                          
                          {/* Attached File Preview / Download */}
                          {ann.fileUrl && ann.fileUrl !== '#' ? (
                            <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <Paperclip className="w-3 h-3 text-emerald-600" />
                                <span>{ann.fileName || 'Berkas Lampiran'}</span>
                                {ann.fileType && <span className="uppercase text-emerald-600">[{ann.fileType}]</span>}
                                {ann.fileSize && <span>({ann.fileSize})</span>}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = ann.fileUrl!;
                                  link.download = ann.fileName || `${ann.title.replace(/[/\\?%*:|"<>]/g, '_')}.${(ann.fileType || 'pdf').toLowerCase()}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                              >
                                <Download className="w-3 h-3" /> Unduh Berkas
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 italic pt-1">
                              Tanpa lampiran file digital
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingAnnId(ann.id);
                              setAnnForm({
                                title: ann.title,
                                urgency: ann.urgency,
                                target: ann.target,
                                fileSize: ann.fileSize || '',
                                fileUrl: ann.fileUrl || '',
                                fileName: ann.fileName || '',
                                fileType: ann.fileType || '',
                                summary: ann.summary
                              });
                              if (ann.fileUrl && ann.fileUrl !== '#') {
                                setUploadedAnnFile({
                                  name: ann.fileName || `${ann.title}.${(ann.fileType || 'pdf').toLowerCase()}`,
                                  size: ann.fileSize || 'Lampiran Terunggah',
                                  type: ann.fileType || 'FILE',
                                  dataUrl: ann.fileUrl
                                });
                              } else {
                                setUploadedAnnFile(null);
                              }
                            }}
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit Pengumuman"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus pengumuman "${ann.title}"?`)) {
                                deleteAnnouncement(ann.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Hapus Pengumuman"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: KELOLA UNDUHAN */}
          {currentSection === 'downloads-cms' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Layanan & Unduhan Berkas
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Pusat arsip modul ajar Kurikulum Merdeka, blanko SKP, dan formulir resmi dinas.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveDocument} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                
                {/* File Upload Dropzone / Preview */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FolderUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Berkas yang Akan Didownload Pengunjung *</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Maksimal 25 MB (PDF, DOCX, XLSX)</span>
                  </label>

                  {!uploadedFile && (!editingDocId || docForm.downloadUrl === '#') ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer group ${
                        isDragging 
                          ? 'border-blue-500 bg-blue-50 scale-[0.99]' 
                          : 'border-blue-200/80 hover:border-blue-500 bg-blue-50/40 hover:bg-blue-50/70'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Klik untuk Pilih Berkas atau Tarik (Drag & Drop) File ke Sini
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Format otomatis terdeteksi: <strong>.PDF</strong>, <strong>.DOCX</strong>, <strong>.XLSX</strong>
                      </p>
                      <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm group-hover:bg-blue-700 transition-colors">
                        <FolderUp className="w-4 h-4" />
                        <span>Pilih Berkas dari Komputer / Laptop</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                          {docForm.fileType === 'XLSX' ? (
                            <FileSpreadsheet className="w-6 h-6" />
                          ) : (
                            <FileText className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0 text-left space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                              {uploadedFile?.name || `${docForm.title}.${docForm.fileType.toLowerCase()}`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Berkas Siap Diunduh</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Format: <strong className="text-slate-800">{docForm.fileType}</strong> • Ukuran: <strong className="text-slate-800">{docForm.fileSize}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-sm transition-all"
                        >
                          Ganti Berkas
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hapus Berkas Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama / Judul Dokumen *</label>
                    <input
                      type="text"
                      required
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      placeholder="Contoh: Modul Ajar Kurikulum Merdeka..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kategori Berkas</label>
                    <select
                      value={docForm.category}
                      onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Kurikulum">Kurikulum Merdeka</option>
                      <option value="Surat Edaran">Surat Edaran</option>
                      <option value="Blanko GTK">Blanko Administrasi GTK</option>
                      <option value="Juknis Lomba">Juknis Lomba</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Format File</label>
                    <select
                      value={docForm.fileType}
                      onChange={(e) => setDocForm({ ...docForm, fileType: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="PDF">PDF (Portable Document Format)</option>
                      <option value="DOCX">DOCX (Microsoft Word)</option>
                      <option value="XLSX">XLSX (Microsoft Excel)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Ukuran File</label>
                    <input
                      type="text"
                      value={docForm.fileSize}
                      onChange={(e) => setDocForm({ ...docForm, fileSize: e.target.value })}
                      placeholder="Contoh: 1.5 MB"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Deskripsi Pemakaian Dokumen *</label>
                  <textarea
                    rows={2}
                    required
                    value={docForm.description}
                    onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                    placeholder="Jelaskan petunjuk penggunaan berkas ini bagi guru atau sekolah..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingDocId ? 'Simpan Perubahan Dokumen' : 'Tambahkan Dokumen ke Layanan Unduhan'}</span>
                    </button>
                    {editingDocId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingDocId(null);
                          setUploadedFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                          setDocForm({
                            title: '',
                            category: 'Kurikulum',
                            fileType: 'PDF',
                            fileSize: '1.5 MB',
                            description: '',
                            downloadUrl: '#'
                          });
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-300 transition-colors"
                      >
                        Batal
                      </button>
                    )}
                  </div>

                  {isSupabaseActive ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Otomatis Tersimpan ke Supabase Cloud (Tanpa Perlu Ekspor)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                      <span>Penyimpanan Lokal Aktif</span>
                    </div>
                  )}
                </div>
              </form>

              {/* Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                    Daftar Dokumen Aktif ({documents.length} Berkas)
                  </h3>
                </div>

                {documents.map((doc) => (
                  <div key={doc.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {doc.category} • {doc.fileType} ({doc.fileSize})
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{doc.title}</h4>
                      <p className="text-xs text-slate-500">{doc.description}</p>
                      {doc.downloadUrl && doc.downloadUrl !== '#' && (
                        <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>File unduhan terlampir siap didownload</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingDocId(doc.id);
                          setDocForm({
                            title: doc.title,
                            category: doc.category,
                            fileType: doc.fileType,
                            fileSize: doc.fileSize,
                            description: doc.description,
                            downloadUrl: doc.downloadUrl
                          });
                          if (doc.downloadUrl && doc.downloadUrl !== '#') {
                            setUploadedFile({
                              name: `${doc.title}.${doc.fileType.toLowerCase()}`,
                              size: doc.fileSize,
                              type: doc.fileType,
                              dataUrl: doc.downloadUrl
                            });
                          } else {
                            setUploadedFile(null);
                          }
                        }}
                        className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Dokumen"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus dokumen "${doc.title}"?`)) {
                            deleteDocument(doc.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: KELOLA GALERI */}
          {currentSection === 'gallery-cms' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Galeri Foto Kegiatan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Upload dan kelola foto kegiatan pembelajaran, lomba, dan upacara se-Purwodadi.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveGallery} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Judul Foto Dokumentasi *</label>
                    <input
                      type="text"
                      required
                      value={galleryForm.title}
                      onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Kategori Dokumentasi</label>
                    <select
                      value={galleryForm.category}
                      onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    >
                      <option value="Kegiatan Belajar">Kegiatan Belajar</option>
                      <option value="Lomba & Prestasi">Lomba & Prestasi</option>
                      <option value="Rakor & Pelatihan">Rakor & Pelatihan</option>
                      <option value="Upacara">Upacara</option>
                    </select>
                  </div>
                </div>

                {/* Upload Multi-Foto Folder Album Kegiatan */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-amber-500" />
                        <span>Koleksi Foto Album Kegiatan (Bisa Upload Lebih dari 1 Foto) *</span>
                      </label>
                      <p className="text-[11px] text-slate-500">
                        Pilih foto-foto dari komputer Anda. Semua foto ini akan dikelompokkan dalam 1 folder judul kegiatan.
                      </p>
                    </div>

                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0 self-start sm:self-auto">
                      {galleryForm.images.length} Foto Siap Disimpan
                    </span>
                  </div>

                  {/* Upload Button & Trigger */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => galleryMultiPhotoInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Pilih & Upload Foto dari Komputer</span>
                    </button>
                    <span className="text-xs text-slate-400">
                      *Mendukung upload banyak file foto sekaligus (JPG, PNG, WebP)
                    </span>
                    <input
                      ref={galleryMultiPhotoInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryMultiUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded Photos Grid */}
                  {galleryForm.images.length > 0 ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Daftar Foto dalam Album ini (Klik ikon bintang untuk memilih Sampul Utama):</span>
                        <span className="font-semibold text-slate-700">{galleryForm.images.length} Foto Terpilih</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {galleryForm.images.map((photo, pIdx) => {
                          const isPrimaryCover = (galleryForm.image === photo) || (!galleryForm.image && pIdx === 0);
                          return (
                            <div 
                              key={pIdx}
                              className={`relative group rounded-xl overflow-hidden border-2 shadow-sm aspect-square bg-slate-900 ${
                                isPrimaryCover ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-slate-200'
                              }`}
                            >
                              <img src={photo} alt={`Foto ${pIdx + 1}`} className="w-full h-full object-cover" />
                              
                              {/* Primary Cover Badge */}
                              {isPrimaryCover && (
                                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-white shadow flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-white" /> Sampul
                                </span>
                              )}

                              {/* Action Overlay */}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 p-1">
                                {!isPrimaryCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetCoverPhoto(photo)}
                                    className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold transition-colors"
                                    title="Jadikan Foto Sampul Utama"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryPhoto(pIdx)}
                                  className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                                  title="Hapus foto ini dari album"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400 text-xs">
                      Belum ada foto yang dipilih. Klik tombol di atas untuk memilih foto dari laptop/komputer Anda.
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Keterangan / Deskripsi Album Foto</label>
                  <input
                    type="text"
                    value={galleryForm.description}
                    onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                    placeholder="Deskripsi singkat momen kegiatan yang didokumentasikan..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingGalleryId ? 'Simpan Perubahan Album' : 'Terbitkan Album Galeri'}</span>
                  </button>
                  {editingGalleryId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingGalleryId(null);
                        setGalleryForm({
                          title: '',
                          category: 'Kegiatan Belajar',
                          image: '',
                          images: [],
                          description: ''
                        });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {gallery.map((item) => {
                  const totalPhotos = (item.images && item.images.length > 0) ? item.images.length : (item.image ? 1 : 0);
                  return (
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                      <div className="relative h-44 bg-slate-900">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                        
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                          {item.category}
                        </span>

                        {/* Folder badge with count */}
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                          <Folder className="w-3 h-3" />
                          <span>{totalPhotos} Foto</span>
                        </span>
                      </div>
                      <div className="p-3.5 space-y-2">
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400 font-mono">{item.date}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => {
                                setEditingGalleryId(item.id);
                                setGalleryForm({
                                  title: item.title,
                                  category: item.category,
                                  image: item.image,
                                  images: (item.images && item.images.length > 0) ? [...item.images] : [item.image],
                                  description: item.description
                                });
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                              title="Edit Album"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus album "${item.title}"?`)) {
                                  deleteGalleryItem(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                              title="Hapus Album"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: KELOLA KONTAK & ADUAN */}
          {currentSection === 'contact-cms' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Kontak & Kotak Masuk Pengaduan
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Atur kontak resmi kantor dan pantau pesan/aspirasi yang dikirim pengunjung melalui form kontak depan.
                </p>
              </div>

              {/* Sub tabs */}
              <div className="flex gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setContactSubTab('inbox')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    contactSubTab === 'inbox' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>Kotak Masuk Aduan ({complaints.length})</span>
                  {newComplaintsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px]">
                      {newComplaintsCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setContactSubTab('info')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    contactSubTab === 'info' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Pengaturan Info Kontak Kantor</span>
                </button>
              </div>

              {/* Subtab 1: Kotak Masuk Pengaduan */}
              {contactSubTab === 'inbox' && (
                <div className="space-y-4">
                  {complaints.length > 0 ? (
                    complaints.map((comp) => (
                      <div
                        key={comp.id}
                        className={`bg-white rounded-2xl p-5 border shadow-sm space-y-3 transition-all ${
                          comp.status === 'Baru' ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              comp.status === 'Baru'
                                ? 'bg-rose-100 text-rose-800'
                                : comp.status === 'Dibaca'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              Status: {comp.status}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700">
                              {comp.category}
                            </span>
                          </div>

                          <span className="text-xs font-mono text-slate-400">
                            {comp.date}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                            <span>Pengirim: <strong className="text-slate-900">{comp.name}</strong></span>
                            <span>•</span>
                            <span>Asal: <strong className="text-slate-900">{comp.schoolOrOrigin}</strong></span>
                            <span>•</span>
                            <span>Kontak: <strong className="text-emerald-700 font-mono">{comp.phone}</strong></span>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed mt-2">
                            "{comp.message}"
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold">Tandai Status:</span>
                            <button
                              onClick={() => updateComplaintStatus(comp.id, 'Dibaca')}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px]"
                            >
                              Telah Dibaca
                            </button>
                            <button
                              onClick={() => updateComplaintStatus(comp.id, 'Selesai')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px]"
                            >
                              Selesai Ditindaklanjuti
                            </button>
                          </div>

                          <button
                            onClick={() => {
                              if (window.confirm('Hapus pesan pengaduan ini?')) {
                                deleteComplaint(comp.id);
                              }
                            }}
                            className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Pesan</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                      <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <h4 className="font-bold text-slate-800">Belum Ada Pesan Masuk</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Pesan atau aspirasi yang dikirim pengunjung dari form halaman kontak akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 2: Info Kontak Kantor */}
              {contactSubTab === 'info' && (
                <form onSubmit={handleSaveContact} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 max-w-3xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Alamat Kantor Lengkap</label>
                    <input
                      type="text"
                      value={contactForm.address}
                      onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Nomor Telepon Kantor</label>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">WhatsApp Helpdesk</label>
                      <input
                        type="text"
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Email Pelayanan</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Jam Operasional Pelayanan</label>
                      <input
                        type="text"
                        value={contactForm.workingHours}
                        onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Simpan Info Kontak Kantor</span>
                  </button>
                </form>
              )}

            </div>
          )}

          {/* TAB 8: USERS CMS (Super Admin Only) */}
          {currentSection === 'users-cms' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Kelola Akun Pengelola Website
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                      Khusus Super Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur hak akses akun pengelola portal Korwilcam Purwodadi dengan 3 tingkatan wewenang: Super Admin, Admin, dan Penulis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAddUser}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-98 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Akun Pengelola</span>
                </button>
              </div>

              {/* 3 Role Level Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl border border-purple-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                        <Crown className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Super Admin</h4>
                        <span className="text-[10px] text-purple-700 font-medium">Akses Penuh Tanpa Batas</span>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      {adminUsers.filter((u) => u.role === 'Super Admin').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Wewenang tertinggi: mengelola seluruh konten, direktori sekolah, profil kantor, manajemen user &amp; password, serta reset database.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Admin</h4>
                        <span className="text-[10px] text-blue-700 font-medium">Pengelolaan Konten</span>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {adminUsers.filter((u) => u.role === 'Admin').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Wewenang operasional CMS: kelola data sekolah, berita, pengumuman, agenda, arsip dokumen, galeri foto, dan kontak aduan.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Penulis</h4>
                        <span className="text-[10px] text-emerald-700 font-medium">Warta & Liputan Berita</span>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {adminUsers.filter((u) => u.role === 'Penulis').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Wewenang redaksi: menulis artikel baru, menyunting berita kegiatan sekolah/kedinasan, dan memperbarui warta informasi publik.
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>Daftar Akun Pengelola ({adminUsers.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Tersinkronisasi ke tabel Supabase <code>admin_users</code>
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 select-none">
                      <tr>
                        <th className="py-3 px-4">Nama Lengkap & Email</th>
                        <th className="py-3 px-4">Username Akun</th>
                        <th className="py-3 px-4">Role Akses</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adminUsers.map((u) => {
                        const isCurrent = u.id === currentUser?.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                  u.role === 'Super Admin'
                                    ? 'bg-purple-100 text-purple-700'
                                    : u.role === 'Admin'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-slate-900 truncate">
                                      {u.name}
                                    </span>
                                    {isCurrent && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 border border-blue-200">
                                        Anda
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[11px] text-slate-400 block truncate">
                                    {u.email || 'Belum ada email'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                              @{u.username}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                u.role === 'Super Admin'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : u.role === 'Admin'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {u.role === 'Super Admin' && <Crown className="w-3 h-3 text-purple-600" />}
                                {u.role === 'Admin' && <Shield className="w-3 h-3 text-blue-600" />}
                                {u.role === 'Penulis' && <PenTool className="w-3 h-3 text-emerald-600" />}
                                <span>{u.role}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'Aktif'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Aktif' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <span>{u.status || 'Aktif'}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUser(u)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit Akun & Password"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={isCurrent}
                                  onClick={() => handleDeleteUser(u)}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isCurrent
                                      ? 'opacity-25 cursor-not-allowed text-slate-400'
                                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                  }`}
                                  title={isCurrent ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Akun'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

            </>
          )}

        </main>
      </div>

      {/* MODAL: PENGATURAN & SINKRONISASI DATABASE SUPABASE */}
      {showSupabaseModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    Pengaturan Database Cloud (Supabase)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Sinkronisasi data PostgreSQL, autentikasi, dan penyimpanan cloud
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">

              {/* Auto-Save Highlight Alert */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 shadow-xs flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                      Auto-Save Database Real-Time Aktif
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      Otomatis
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Setiap berkas dokumen, surat edaran pengumuman, berita, sekolah, galeri, dan data yang Anda input atau edit di panel admin ini <strong>langsung tersimpan otomatis ke database Supabase Cloud</strong> tanpa harus melakukan ekspor manual.
                  </p>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isSupabaseActive 
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isSupabaseActive ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                  }`}>
                    {isSupabaseActive ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">
                      Status: {isSupabaseActive ? 'Terhubung ke Database Supabase Cloud' : 'Mode Offline (Penyimpanan Browser)'}
                    </h4>
                    <p className="text-[11px] opacity-80">
                      {isSupabaseActive 
                        ? 'Setiap penambahan atau pembaruan data langsung disinkronkan ke cloud.' 
                        : 'Data saat ini tersimpan sementara di LocalStorage browser ini.'}
                    </p>
                  </div>
                </div>

                {isSupabaseActive && (
                  <button
                    type="button"
                    onClick={handleClearSupabaseConfig}
                    className="text-[11px] font-bold text-rose-600 hover:underline shrink-0"
                  >
                    Putuskan Koneksi
                  </button>
                )}
              </div>

              {/* Step 1: Masukkan Kredensial */}
              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                    <span>Kredensial API Supabase</span>
                  </h3>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Buka Supabase Dashboard</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl text-xs text-blue-900 leading-relaxed flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Mode Auto-Load Publik Aktif:</strong> Kredensial yang Anda simpan di sini otomatis dicatat ke file konfigurasi proyek (<code>.env</code> &amp; <code>supabaseConfig.ts</code>). Setiap pengunjung website dari mana pun (HP, laptop, atau tablet) akan langsung memuat data database Supabase Anda secara otomatis tanpa perlu impor/ekspor manual.
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Project URL (VITE_SUPABASE_URL)</label>
                    <input
                      type="url"
                      required
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Anon Public Key (VITE_SUPABASE_ANON_KEY)</label>
                    <input
                      type="text"
                      required
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-xl text-xs font-medium ${
                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {testResult.message}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan & Hubungkan</span>
                  </button>

                  <button
                    type="button"
                    disabled={isTestingSupabase}
                    onClick={handleTestConnection}
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isTestingSupabase ? 'Menguji...' : 'Tes Koneksi'}</span>
                  </button>
                </div>
              </form>

              {/* Step 2: Schema Script */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Buat Tabel Database (SQL Schema)</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kami telah menyiapkan skrip SQL lengkap untuk membuat 9 tabel (sekolah, berita, agenda, dokumen, galeri, aduan, dll.) beserta hak akses RLS di file:
                </p>
                <div className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs flex items-center justify-between">
                  <span>supabase_schema.sql</span>
                  <button
                    type="button"
                    onClick={handleCopySchemaSql}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-blue-300 font-sans flex items-center gap-1"
                  >
                    {hasCopiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{hasCopiedSql ? 'Tersalin' : 'Info Skrip'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Cukup buka <strong>Supabase Dashboard &gt; SQL Editor</strong>, salin isi file <code>supabase_schema.sql</code> lalu klik <strong>Run</strong>.
                </p>
              </div>

              {/* Step 3: Migrasi Data Awal (Opsional) */}
              <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-500 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Migrasi Data Awal / Seed Database (Hanya 1x Awal Setup - Opsional)</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Gunakan tombol di bawah ini <strong>hanya saat pertama kali setup</strong> jika database Anda masih kosong dan ingin menyalin 10 sekolah contoh, 8 berita bawaan, dan dokumen standar ke Supabase. Untuk penginputan dokumen atau pengumuman baru sehari-hari, data <strong>sudah otomatis tersimpan</strong> tanpa perlu menekan tombol ini.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportToSupabase}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                    <span>{isExporting ? 'Sedang Menyalin Data...' : 'Salin Semua Data Bawaan ke Supabase'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const success = await refreshFromSupabase();
                      if (success) {
                        showToast('Berhasil memuat data terbaru dari Supabase!', 'success');
                      } else {
                        showToast('Gagal menarik data dari Supabase.', 'error');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tarik Data Terbaru dari Supabase</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors"
              >
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT AKUN PENGELOLA (Super Admin Only) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingUserId ? 'Edit Data Akun Pengelola' : 'Tambah Akun Pengelola Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Atur nama, username, password, dan wewenang akun
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Pengelola</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  placeholder="Misal: Ahmad Fauzi, S.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Username Login</label>
                  <input
                    type="text"
                    required
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value.replace(/\s+/g, '') })}
                    placeholder="Misal: fauzi_admin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {editingUserId ? 'Ubah Kata Sandi (Opsional)' : 'Kata Sandi (Password)'}
                  </label>
                  <input
                    type="password"
                    required={!editingUserId}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={editingUserId ? 'Kosongkan jika tetap' : 'Minimal 6 karakter...'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Role & Wewenang</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value as AdminRole })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none"
                  >
                    <option value="Super Admin">Super Admin (Akses Penuh)</option>
                    <option value="Admin">Admin (Kelola Konten & Data)</option>
                    <option value="Penulis">Penulis (Hanya Warta & Berita)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Status Akun</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif (Diblokir)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Email (Opsional)</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="fauzi@korwilcampurwodadi.sch.id"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-purple-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingUserId ? 'Simpan Perubahan' : 'Buat Akun Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
