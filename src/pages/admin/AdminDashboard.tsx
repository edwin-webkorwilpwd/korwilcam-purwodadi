import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  FileDown,
  Database,
  RefreshCw,
  Copy,
  Check,
  X,
  Layers,
  ArrowUpRight,
  Camera,
  Link2,
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
  Lock,
  Loader2,
  FileCheck2,
  Maximize2,
  Target,
  Award,
  Quote,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  Sliders,
  Search,
  ClipboardList,
  UserCheck,
  Share2,
  Radio,
  Send,
  Smartphone,
  Trophy,
  Medal,
  HelpCircle
} from 'lucide-react';
import { 
  isGoogleDriveUrl, 
  formatGoogleDriveImageUrl, 
  getGoogleDriveViewUrl,
  extractGoogleDriveFolderId,
  isGoogleDriveFolderUrl,
  getGoogleDriveFolderViewUrl,
  getGoogleDriveEmbeddedFolderUrl,
  parseGoogleDriveImageLinks
} from '../../lib/driveHelper';
import { 
  getSupabaseConfig, 
  setCustomSupabaseConfig, 
  clearCustomSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { 
  SPREADSHEET_VIEW_URL, 
  getActivityLogUrl, 
  setActivityLogUrl, 
  testActivityLogWebhook, 
  GOOGLE_APPS_SCRIPT_CODE 
} from '../../lib/activityLogger';
import { stripHtml, generateSummary } from '../../lib/stripHtml';
import { 
  School, 
  NewsArticle, 
  SchoolLevel, 
  SchoolStatus, 
  Accreditation, 
  NewsCategory, 
  StaffProfile, 
  StaffDivision,
  AgendaEvent, 
  GalleryItem, 
  DocumentDownload, 
  Announcement, 
  ComplaintMessage, 
  AdminUser, 
  AdminRole,
  EducationalOrganization,
  OrganizationLeader,
  OrganizationOfficial,
  TeacherNominative,
  ServiceRequirement,
  DataRequestLink,
  SocialMediaItem,
  BroadcastNotification,
  Achievement,
  AchievementCategory,
  AchievementLevel,
  AchievementField
} from '../../types';
import { RichTextEditor } from '../../components/RichTextEditor';
import { 
  TikTokIcon, 
  FacebookIcon, 
  InstagramIcon, 
  YoutubeIcon, 
  XIcon,
  WhatsAppIcon,
  WebsiteIcon, 
  formatExternalUrl 
} from '../../components/SocialIcons';
import { getArticleReadingStats } from '../../lib/readingTime';
import { getGoogleMapsUrl, normalizeToGoogleMapsUrl } from '../../lib/coordinates';
import { sortGalleryDescending } from '../../lib/galleryHelper';
import { generateDataRequestSlug, getDataRequestSlug, getDataRequestPath, getDataRequestShareUrl } from '../../lib/dataRequestHelper';

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
    newsCategories,
    addNewsCategory,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    addDocument,
    updateDocument,
    deleteDocument,
    documentCategories,
    addDocumentCategory,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    galleryCategories,
    addGalleryCategory,
    addStaff,
    updateStaff,
    deleteStaff,
    deleteComplaint,
    updateComplaintStatus,
    sopImageUrl,
    updateSOPImageUrl,
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
    deleteAdminUser,
    organizations,
    setSelectedOrganizationSlug,
    addOrganization,
    updateOrganization,
    deleteOrganization,
    addOrganizationOfficial,
    updateOrganizationOfficial,
    deleteOrganizationOfficial,
    teachers,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    batchAddTeachers,
    clearAllTeachers,
    serviceRequirements,
    serviceRequirementCategories,
    addServiceRequirement,
    updateServiceRequirement,
    deleteServiceRequirement,
    resetServiceRequirements,
    addServiceRequirementCategory,
    deleteServiceRequirementCategory,
    dataRequests,
    addDataRequest,
    updateDataRequest,
    deleteDataRequest,
    toggleDataRequestActive,
    showConfirmDialog,
    showNoticePopup,
    activityLogUrl,
    updateActivityLogUrl,
    socialMedia,
    saveSocialMediaSettings,
    resetSocialMediaDefaults,
    broadcastHistory,
    sendBroadcastNotification,
    deleteBroadcastNotification,
    achievements,
    addAchievement,
    updateAchievement,
    deleteAchievement
  } = useApp();

  type AdminSection = 
    | 'overview' 
    | 'home-cms' 
    | 'profile-cms' 
    | 'sop-cms' 
    | 'schools-cms' 
    | 'nominatif-cms' 
    | 'news-cms' 
    | 'achievements-cms'
    | 'organization-cms' 
    | 'service-requirements-cms'
    | 'downloads-cms' 
    | 'data-request-cms'
    | 'gallery-cms' 
    | 'contact-cms' 
    | 'social-media-cms'
    | 'broadcast-cms'
    | 'users-cms'
    | 'activity-log-cms';

  const [currentSection, setCurrentSection] = useState<AdminSection>(() => 
    currentUser?.role === 'Penulis' ? 'news-cms' : 'overview'
  );
  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const isAdmin = currentUser?.role === 'Admin';
  const isAdminOrSuperAdmin = isSuperAdmin || isAdmin;
  const isWriter = currentUser?.role === 'Penulis';
  const activeAuthorName = currentUser?.name || 'Humas Korwilcam Purwodadi';
  const activeUserRole = (currentUser?.role || 'Admin') as string;

  // Hak akses khusus Organisasi:
  // Super Admin & Admin dapat mengakses semua organisasi.
  // Akun non-admin (misal Penulis) hanya bisa mengakses menu Organisasi jika akunnya (username) ditunjuk pada setidaknya satu organisasi.
  const isUserAssignedToAnyOrg = useMemo(() => {
    if (!currentUser?.username) return false;
    const curUser = currentUser.username.trim().toLowerCase();
    return organizations.some(
      (o) => o.assignedUsername && o.assignedUsername.trim().toLowerCase() === curUser
    );
  }, [currentUser?.username, organizations]);

  const canAccessOrganizationCms = isAdminOrSuperAdmin || isUserAssignedToAnyOrg;

  const displayedOrganizations = useMemo(() => {
    if (isAdminOrSuperAdmin) return organizations;
    if (!currentUser?.username) return [];
    const curUser = currentUser.username.trim().toLowerCase();
    return organizations.filter(
      (o) => o.assignedUsername && o.assignedUsername.trim().toLowerCase() === curUser
    );
  }, [isAdminOrSuperAdmin, currentUser?.username, organizations]);

  // Guard: Pastikan role Penulis hanya berada di menu yang diizinkan (news-cms, gallery-cms, organization-cms jika ditugaskan)
  useEffect(() => {
    if (isWriter) {
      const allowedSections: AdminSection[] = ['news-cms', 'gallery-cms', 'achievements-cms'];
      if (canAccessOrganizationCms) {
        allowedSections.push('organization-cms');
      }
      if (!allowedSections.includes(currentSection)) {
        setCurrentSection('news-cms');
      }
    } else if (currentSection === 'organization-cms' && !canAccessOrganizationCms) {
      setCurrentSection('overview');
    } else if ((currentSection === 'social-media-cms' || currentSection === 'broadcast-cms') && !isAdminOrSuperAdmin) {
      setCurrentSection('overview');
    } else if ((currentSection === 'users-cms' || currentSection === 'activity-log-cms') && !isSuperAdmin) {
      setCurrentSection('overview');
    }
  }, [isWriter, currentSection, canAccessOrganizationCms, isAdminOrSuperAdmin, isSuperAdmin]);

  // ==========================================================
  // STATE & HANDLER MEDIA SOSIAL RESMI CMS
  // ==========================================================
  const [editingSocialMedia, setEditingSocialMedia] = useState<SocialMediaItem[]>([]);
  const [isSavingSocialMedia, setIsSavingSocialMedia] = useState<boolean>(false);

  useEffect(() => {
    if (socialMedia && Array.isArray(socialMedia) && socialMedia.length > 0) {
      setEditingSocialMedia(JSON.parse(JSON.stringify(socialMedia)));
    }
  }, [socialMedia]);

  const handleSocialMediaChange = (platform: string, field: keyof SocialMediaItem, value: any) => {
    setEditingSocialMedia((prev) =>
      prev.map((item) => (item.platform === platform ? { ...item, [field]: value } : item))
    );
  };

  const handleSaveSocialMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSocialMedia(true);
    try {
      await saveSocialMediaSettings(editingSocialMedia);
    } finally {
      setIsSavingSocialMedia(false);
    }
  };

  const handleResetSocialMedia = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Reset Media Sosial',
      message: 'Apakah Anda yakin ingin mereset seluruh akun dan link media sosial ke pengaturan awal?',
      type: 'warning',
      confirmText: 'Ya, Reset',
      cancelText: 'Batal'
    });
    if (confirmed) {
      await resetSocialMediaDefaults();
    }
  };

  // ==========================================================
  // STATE & HANDLER BROADCAST NOTIFIKASI PWA (ONESIGNAL)
  // ==========================================================
  const [broadcastTitle, setBroadcastTitle] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastTargetType, setBroadcastTargetType] = useState<'home' | 'news' | 'announcement' | 'contact' | 'custom'>('home');
  const [broadcastSelectedNewsId, setBroadcastSelectedNewsId] = useState<string>('');
  const [broadcastSelectedAnnId, setBroadcastSelectedAnnId] = useState<string>('');
  const [broadcastCustomUrl, setBroadcastCustomUrl] = useState<string>('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState<boolean>(false);
  const [broadcastSearchQuery, setBroadcastSearchQuery] = useState<string>('');

  const getComputedBroadcastUrl = (): string => {
    if (broadcastTargetType === 'news' && broadcastSelectedNewsId) {
      const found = news.find((n) => n.id === broadcastSelectedNewsId);
      if (found) return `https://korwilcampurwodadi.web.id/berita/${found.slug || found.id}`;
    }
    if (broadcastTargetType === 'announcement' && broadcastSelectedAnnId) {
      return `https://korwilcampurwodadi.web.id/pengumuman/${broadcastSelectedAnnId}`;
    }
    if (broadcastTargetType === 'contact') {
      return 'https://korwilcampurwodadi.web.id/kontak';
    }
    if (broadcastTargetType === 'custom' && broadcastCustomUrl.trim()) {
      return broadcastCustomUrl.trim();
    }
    return 'https://korwilcampurwodadi.web.id';
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      showToast('Judul dan isi pesan notifikasi wajib diisi!', 'error');
      return;
    }

    const finalUrl = getComputedBroadcastUrl();

    const confirmed = await showConfirmDialog({
      title: 'Kirim Broadcast Notifikasi?',
      message: `Pemberitahuan akan langsung disiarkan ke seluruh perangkat HP dan komputer yang mengaktifkan notifikasi website.\n\nJudul: "${broadcastTitle}"\nPesan: "${broadcastMessage}"\nTautan: ${finalUrl}`,
      confirmText: 'Ya, Kirim Sekarang',
      cancelText: 'Batal',
      type: 'save'
    });

    if (!confirmed) return;

    setIsSendingBroadcast(true);
    const result = await sendBroadcastNotification({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      targetUrl: finalUrl
    });
    setIsSendingBroadcast(false);

    if (result.success) {
      showNoticePopup({
        title: 'Broadcast Terkirim!',
        message: result.message,
        type: 'success'
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastCustomUrl('');
    } else {
      showNoticePopup({
        title: 'Pengiriman Gagal',
        message: result.message,
        type: 'error'
      });
    }
  };

  const handleResendBroadcast = (item: BroadcastNotification) => {
    setBroadcastTitle(item.title);
    setBroadcastMessage(item.message);
    setBroadcastTargetType('custom');
    setBroadcastCustomUrl(item.targetUrl || '');
    showToast('Data notifikasi dimuat ke formulir!', 'info');
  };

  const handleDeleteBroadcast = async (id: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Riwayat Notifikasi?',
      message: 'Riwayat broadcast ini akan dihapus dari daftar.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'delete'
    });
    if (confirmed) {
      await deleteBroadcastNotification(id);
    }
  };

  // ==========================================================
  // STATE & HANDLER PRESTASI SISWA & GURU CMS
  // ==========================================================
  const [achievementSearch, setAchievementSearch] = useState('');
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState<'ALL' | AchievementCategory>('ALL');
  const [achievementLevelFilter, setAchievementLevelFilter] = useState<'ALL' | AchievementLevel>('ALL');
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);

  const [achievementFilterTab, setAchievementFilterTab] = useState<'all' | 'mine'>('all');

  // Helper cek kepemilikan data prestasi berdasarkan akun/role login aktif
  const isAchievementItemOwner = (item: Achievement) => {
    if (!currentUser) return false;

    // Cocokkan authorId jika tersedia
    if (item.authorId && currentUser.id && item.authorId === currentUser.id) {
      return true;
    }

    // Jika authorId milik Super Admin tetapi yang login bukan Super Admin / Admin
    if (item.authorId === 'usr-superadmin' && !isAdminOrSuperAdmin) {
      return false;
    }

    // Cek kecocokan nama pembuat (case-insensitive)
    if (item.authorName && activeAuthorName && item.authorName.trim().toLowerCase() === activeAuthorName.trim().toLowerCase()) {
      return true;
    }

    // Cek kecocokan nama currentUser
    if (item.authorName && currentUser.name && item.authorName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) {
      return true;
    }

    // Cek kecocokan username
    if (item.authorName && currentUser.username && item.authorName.trim().toLowerCase() === currentUser.username.trim().toLowerCase()) {
      return true;
    }

    // Hanya Admin / Super Admin yang boleh mencocokkan berdasarkan sesama role admin
    if (isAdminOrSuperAdmin && item.authorRole && activeUserRole && item.authorRole.trim().toLowerCase() === activeUserRole.trim().toLowerCase()) {
      return true;
    }

    // Jika dibuat oleh Super Administrator dan user login bukan Super Admin / Admin
    const isSuperAdminAuthor = ['super administrator', 'super admin'].some((adm) =>
      (item.authorName || '').toLowerCase().includes(adm)
    );
    if (isSuperAdminAuthor && !isAdminOrSuperAdmin) {
      return false;
    }

    return false;
  };

  // Daftar data prestasi yang dapat diakses:
  // Super Admin & Admin dapat melihat seluruh data prestasi (atau filter ke prestasi miliknya)
  // Role non-admin (misal: Penulis): HANYA dapat melihat data prestasi yang dibuat oleh akun dirinya sendiri
  const displayedAchievements = useMemo(() => {
    if (isAdminOrSuperAdmin) {
      if (achievementFilterTab === 'mine') {
        return achievements.filter((item) => isAchievementItemOwner(item));
      }
      return achievements;
    }
    // Penulis / Role lain: HANYA menampilkan data prestasi yang dibuat akun login dirinya sendiri
    return achievements.filter((item) => isAchievementItemOwner(item));
  }, [achievements, isAdminOrSuperAdmin, achievementFilterTab, currentUser, activeAuthorName, activeUserRole]);

  const initialAchievementFormData = {
    title: '',
    category: 'Siswa' as AchievementCategory,
    field: 'Sains / OSN',
    rank: 'Juara 1',
    level: 'Kabupaten' as AchievementLevel,
    recipientName: '',
    schoolName: '',
    year: new Date().getFullYear(),
    eventDate: '',
    mentorName: '',
    photoUrl: '',
    certificateUrl: '',
    description: '',
    authorId: currentUser?.id || '',
    authorName: currentUser?.name || activeAuthorName,
    authorRole: (currentUser?.role || activeUserRole) as string
  };

  const [achievementForm, setAchievementForm] = useState(initialAchievementFormData);
  const [isSavingAchievement, setIsSavingAchievement] = useState(false);

  const openNewAchievementModal = () => {
    setEditingAchievementId(null);
    setAchievementForm({
      ...initialAchievementFormData,
      schoolName: schools[0]?.name || '',
      authorId: currentUser?.id || '',
      authorName: currentUser?.name || activeAuthorName,
      authorRole: (currentUser?.role || activeUserRole) as string
    });
    setIsAchievementModalOpen(true);
  };

  const openEditAchievementModal = (item: Achievement) => {
    if (!isAdminOrSuperAdmin && !isAchievementItemOwner(item)) {
      showNoticePopup({
        title: 'Akses Ditolak!',
        message: 'Anda tidak memiliki izin untuk mengubah data prestasi yang ditambahkan oleh akun/role lain.',
        type: 'warning'
      });
      return;
    }

    setEditingAchievementId(item.id);
    setAchievementForm({
      title: item.title,
      category: item.category,
      field: item.field || 'Lainnya',
      rank: item.rank,
      level: item.level,
      recipientName: item.recipientName,
      schoolName: item.schoolName,
      year: item.year,
      eventDate: item.eventDate || '',
      mentorName: item.mentorName || '',
      photoUrl: item.photoUrl || '',
      certificateUrl: item.certificateUrl || '',
      description: item.description || '',
      authorId: item.authorId || currentUser?.id || '',
      authorName: item.authorName || currentUser?.name || activeAuthorName,
      authorRole: (item.authorRole || currentUser?.role || activeUserRole) as string
    });
    setIsAchievementModalOpen(true);
  };

  const handleSaveAchievement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementForm.title.trim()) {
      showToast('Judul kompetisi / ajang wajib diisi!', 'error');
      return;
    }
    if (!achievementForm.recipientName.trim()) {
      showToast('Nama peraih prestasi wajib diisi!', 'error');
      return;
    }
    if (!achievementForm.schoolName.trim()) {
      showToast('Asal sekolah wajib diisi!', 'error');
      return;
    }

    if (editingAchievementId) {
      const existing = achievements.find((a) => a.id === editingAchievementId);
      if (existing && !isAdminOrSuperAdmin && !isAchievementItemOwner(existing)) {
        showNoticePopup({
          title: 'Akses Ditolak!',
          message: 'Anda tidak memiliki izin untuk mengubah data prestasi milik pengguna/role lain.',
          type: 'warning'
        });
        return;
      }
    }

    setIsSavingAchievement(true);
    try {
      if (editingAchievementId) {
        const existing = achievements.find((a) => a.id === editingAchievementId);
        await updateAchievement(editingAchievementId, {
          ...achievementForm,
          authorId: existing?.authorId || currentUser?.id || '',
          authorName: existing?.authorName || currentUser?.name || activeAuthorName,
          authorRole: existing?.authorRole || currentUser?.role || activeUserRole
        });
      } else {
        await addAchievement({
          ...achievementForm,
          authorId: currentUser?.id || '',
          authorName: currentUser?.name || activeAuthorName,
          authorRole: currentUser?.role || activeUserRole
        });
      }
      setIsAchievementModalOpen(false);
      setEditingAchievementId(null);
    } catch (err: any) {
      showToast(`Gagal menyimpan prestasi: ${err.message || err}`, 'error');
    } finally {
      setIsSavingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (item: Achievement) => {
    if (!isAdminOrSuperAdmin && !isAchievementItemOwner(item)) {
      showNoticePopup({
        title: 'Akses Ditolak!',
        message: 'Anda tidak memiliki izin untuk menghapus data prestasi yang ditambahkan oleh akun/role lain.',
        type: 'warning'
      });
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Hapus Data Prestasi',
      message: `Apakah Anda yakin ingin menghapus data prestasi "${item.title}" atas nama ${item.recipientName}? Tindakan ini tidak dapat dibatalkan.`,
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal'
    });
    if (confirmed) {
      await deleteAchievement(item.id);
    }
  };

  const filteredAchievementsCms = useMemo(() => {
    return displayedAchievements.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(achievementSearch.toLowerCase()) ||
        item.recipientName.toLowerCase().includes(achievementSearch.toLowerCase()) ||
        item.schoolName.toLowerCase().includes(achievementSearch.toLowerCase()) ||
        (item.mentorName && item.mentorName.toLowerCase().includes(achievementSearch.toLowerCase()));

      const matchCategory = achievementCategoryFilter === 'ALL' || item.category === achievementCategoryFilter;
      const matchLevel = achievementLevelFilter === 'ALL' || item.level === achievementLevelFilter;

      return matchSearch && matchCategory && matchLevel;
    });
  }, [displayedAchievements, achievementSearch, achievementCategoryFilter, achievementLevelFilter]);

  // ==========================================================
  // STATE & HANDLER PERMINTAAN DATA (WEBVIEW) CMS
  // ==========================================================
  const [editingDataRequestId, setEditingDataRequestId] = useState<string | null>(null);
  const [dataReqTitle, setDataReqTitle] = useState<string>('');
  const [dataReqSlug, setDataReqSlug] = useState<string>('');
  const [dataReqUrl, setDataReqUrl] = useState<string>('');
  const [dataReqDesc, setDataReqDesc] = useState<string>('');
  const [dataReqCropTop, setDataReqCropTop] = useState<number>(0);
  const [dataReqIsActive, setDataReqIsActive] = useState<boolean>(true);
  const [dataReqPreviewKey, setDataReqPreviewKey] = useState<number>(0);
  const [isSavingDataReq, setIsSavingDataReq] = useState<boolean>(false);
  const [copiedDataReqId, setCopiedDataReqId] = useState<string | null>(null);

  const handleEditDataRequest = (req: DataRequestLink) => {
    setEditingDataRequestId(req.id);
    setDataReqTitle(req.title);
    setDataReqSlug(req.slug || generateDataRequestSlug(req.title));
    setDataReqUrl(req.url);
    setDataReqDesc(req.description || '');
    setDataReqCropTop(req.cropTop || 0);
    setDataReqIsActive(req.isActive !== false);
    const formEl = document.getElementById('data-request-form-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCancelEditDataRequest = () => {
    setEditingDataRequestId(null);
    setDataReqTitle('');
    setDataReqSlug('');
    setDataReqUrl('');
    setDataReqDesc('');
    setDataReqCropTop(0);
    setDataReqIsActive(true);
  };

  const handleCopyDataRequestShareLink = async (req: DataRequestLink) => {
    const shareUrl = getDataRequestShareUrl(req);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedDataReqId(req.id);
      showToast('Link formulir berhasil disalin!', 'success');
      setTimeout(() => setCopiedDataReqId(null), 2500);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedDataReqId(req.id);
      showToast('Link formulir berhasil disalin!', 'success');
      setTimeout(() => setCopiedDataReqId(null), 2500);
    }
  };

  const handleSaveDataRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = dataReqTitle.trim();
    const trimmedUrl = dataReqUrl.trim();
    const cleanSlug = dataReqSlug.trim() ? generateDataRequestSlug(dataReqSlug) : generateDataRequestSlug(trimmedTitle);

    if (!trimmedTitle) {
      showNoticePopup({
        title: 'Judul Diperlukan',
        message: 'Harap masukkan judul atau nama formulir permintaan data!',
        type: 'warning'
      });
      return;
    }

    if (!trimmedUrl) {
      showNoticePopup({
        title: 'URL Diperlukan',
        message: 'Harap masukkan tautan URL (Google Form, Spreadsheet, atau Web)!',
        type: 'warning'
      });
      return;
    }

    setIsSavingDataReq(true);
    try {
      if (editingDataRequestId) {
        await updateDataRequest(editingDataRequestId, {
          title: trimmedTitle,
          slug: cleanSlug,
          url: trimmedUrl,
          description: dataReqDesc.trim(),
          cropTop: Number(dataReqCropTop) || 0,
          isActive: dataReqIsActive
        });
      } else {
        await addDataRequest({
          title: trimmedTitle,
          slug: cleanSlug,
          url: trimmedUrl,
          description: dataReqDesc.trim(),
          cropTop: Number(dataReqCropTop) || 0,
          isActive: dataReqIsActive,
          order: dataRequests.length + 1
        });
      }
      handleCancelEditDataRequest();
    } finally {
      setIsSavingDataReq(false);
    }
  };

  const handleDeleteDataRequest = async (req: DataRequestLink) => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Tautan Permintaan Data',
      message: `Apakah Anda yakin ingin menghapus tautan "${req.title}"? Pengunjung tidak akan dapat mengakses formulir ini lagi.`,
      type: 'delete',
      confirmText: 'Ya, Hapus Tautan',
      cancelText: 'Batal'
    });

    if (confirmed) {
      await deleteDataRequest(req.id);
      if (editingDataRequestId === req.id) {
        handleCancelEditDataRequest();
      }
    }
  };

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
      await refreshFromSupabase(true);
    } else {
      showToast('Kredensial disimpan, namun koneksi belum terverifikasi.', 'info');
    }
  };

  const handleClearSupabaseConfig = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Konfigurasi Supabase?',
      message: 'Apakah Anda yakin ingin menghapus konfigurasi Supabase dan kembali ke mode penyimpanan offline LocalStorage?',
      type: 'delete',
      confirmText: 'Ya, Hapus Konfigurasi',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    clearCustomSupabaseConfig();
    setSupabaseUrlInput('');
    setSupabaseKeyInput('');
    setTestResult(null);
    showNoticePopup({
      title: 'Konfigurasi Dihapus!',
      message: 'Koneksi Supabase telah dihapus. Sistem beralih ke penyimpanan lokal offline.',
      type: 'warning'
    });
  };

  const handleExportToSupabase = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Konfirmasi Ekspor Data ke Supabase Cloud',
      message: 'Tindakan ini akan menyalin seluruh data lokal ke database Supabase Cloud. Seluruh data di website publik akan otomatis tersinkronisasi.',
      type: 'save',
      confirmText: 'Ya, Ekspor Sekarang',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    setIsExporting(true);
    const ok = await exportAllToSupabase();
    setIsExporting(false);
    if (ok) {
      showNoticePopup({
        title: 'Ekspor Data Berhasil!',
        message: 'Seluruh data berhasil diunggah dan disinkronkan ke database Supabase Cloud.',
        type: 'success'
      });
    }
  };

  const handleCopySchemaSql = () => {
    setHasCopiedSql(true);
    showToast('File skema "supabase_schema.sql" sudah tersedia di root proyek!', 'info');
    setTimeout(() => setHasCopiedSql(false), 3000);
  };

  // --- ACTIVITY LOG (GOOGLE SPREADSHEET + SUPABASE SYNC) STATE ---
  const [activityLogUrlInput, setActivityLogUrlInput] = useState<string>(() => activityLogUrl || getActivityLogUrl());
  const [isSavingActivityLogUrl, setIsSavingActivityLogUrl] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookTestResult, setWebhookTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasCopiedGasCode, setHasCopiedGasCode] = useState(false);

  // Sinkronkan input form saat URL ditarik dari Supabase Cloud (multi-browser sync)
  useEffect(() => {
    if (activityLogUrl) {
      setActivityLogUrlInput(activityLogUrl);
    }
  }, [activityLogUrl]);

  const handleSaveActivityLogUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingActivityLogUrl(true);
    const result = await updateActivityLogUrl(activityLogUrlInput);
    setIsSavingActivityLogUrl(false);

    if (result.success) {
      showNoticePopup({
        title: 'URL Webhook Disimpan ke Supabase!',
        message: 'URL Google Apps Script Web App berhasil disimpan permanen ke tabel activity_log_settings Supabase Cloud. Seluruh admin di browser dan perangkat manapun kini otomatis terhubung!',
        type: 'success'
      });
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);
    setWebhookTestResult(null);
    const result = await testActivityLogWebhook(activityLogUrlInput);
    setIsTestingWebhook(false);
    setWebhookTestResult(result);
    if (result.success) {
      showToast('Pengujian webhook berhasil! Baris pengujian telah terkirim ke Google Spreadsheet.', 'success');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleCopyGasCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setHasCopiedGasCode(true);
      showToast('Kode Google Apps Script berhasil disalin ke clipboard!', 'success');
      setTimeout(() => setHasCopiedGasCode(false), 3000);
    }
  };

  // --- 1. HOME CMS STATE ---
  const [homeForm, setHomeForm] = useState({
    tagline: officeProfile.tagline,
    heroBadge: officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi",
    heroTitle: officeProfile.heroTitle || "Mewujudkan Fondasi Generasi Emas SD, TK, & KB di Purwodadi",
    heroSubtitle: officeProfile.heroSubtitle || "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi...",
    korwilQuote: officeProfile.korwilQuote || "Pendidikan bukan sekadar transfer ilmu, melainkan menuntun kodrat anak...",
    heroDriveFolderUrl: officeProfile.heroDriveFolderUrl || '',
    heroSlideshowImages: officeProfile.heroSlideshowImages || [],
    heroSlideshowInterval: officeProfile.heroSlideshowInterval || 5
  });

  const [newSlideUrl, setNewSlideUrl] = useState('');
  const [batchSlideText, setBatchSlideText] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);

  const handleAddSlide = () => {
    if (!newSlideUrl.trim()) {
      showToast('Masukkan link foto terlebih dahulu!', 'error');
      return;
    }
    const trimmed = newSlideUrl.trim();
    setHomeForm((prev) => ({
      ...prev,
      heroSlideshowImages: [...(prev.heroSlideshowImages || []), trimmed]
    }));
    setNewSlideUrl('');
    showToast('Foto berhasil ditambahkan ke daftar slide show!', 'success');
  };

  const handleAddBatchSlides = () => {
    if (!batchSlideText.trim()) {
      showToast('Tempel tautan foto terlebih dahulu!', 'error');
      return;
    }
    const extracted = parseGoogleDriveImageLinks(batchSlideText);
    if (extracted.length === 0) {
      showToast('Tidak ada tautan foto valid yang terdeteksi dalam teks.', 'error');
      return;
    }
    setHomeForm((prev) => {
      const current = prev.heroSlideshowImages || [];
      const newImages = [...current];
      for (const link of extracted) {
        if (!newImages.includes(link)) {
          newImages.push(link);
        }
      }
      return { ...prev, heroSlideshowImages: newImages };
    });
    setBatchSlideText('');
    setIsBatchMode(false);
    showToast(`${extracted.length} foto berhasil ditambahkan ke slide show!`, 'success');
  };

  const handleRemoveSlide = (indexToRemove: number) => {
    setHomeForm((prev) => ({
      ...prev,
      heroSlideshowImages: (prev.heroSlideshowImages || []).filter((_, idx) => idx !== indexToRemove)
    }));
    showToast('Foto dihapus dari slide show.', 'info');
  };

  const handleMoveSlide = (index: number, direction: 'left' | 'right') => {
    setHomeForm((prev) => {
      const current = [...(prev.heroSlideshowImages || [])];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return prev;
      const temp = current[index];
      current[index] = current[targetIndex];
      current[targetIndex] = temp;
      return { ...prev, heroSlideshowImages: current };
    });
  };

  const handleSaveHomeCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await showConfirmDialog({
      title: 'Simpan Pengaturan Beranda & Slide Show?',
      message: 'Apakah Anda yakin ingin menyimpan perubahan teks hero, semboyan, link folder Google Drive, dan foto slide show ke database Supabase?',
      type: 'save',
      confirmText: 'Ya, Simpan Perubahan',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    await updateOfficeProfile(homeForm);
    showNoticePopup({
      title: 'Beranda & Slide Show Disimpan!',
      message: 'Pengaturan tampilan beranda dan slide show foto Google Drive berhasil disimpan dan disinkronkan ke Supabase.',
      type: 'success'
    });
  };

  // Helper to compress image and convert to lightweight Base64 string for database storage
  const compressImage = (file: File, maxDimension = 800, quality = 0.82): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Scale proportionally so neither width nor height exceeds maxDimension
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
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
  const quickStaffPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const quickUploadStaffIdRef = useRef<string | null>(null);
  const [quickUploadStaffId, setQuickUploadStaffId] = useState<string | null>(null);

  const handleKorwilPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses foto resmi pimpinan...', 'info');
      // Kompresi optimal ~40-60KB agar instan & tidak memberatkan database
      const dataUrl = await compressImage(file, 600, 0.80);
      setProfileForm((prev) => ({ ...prev, korwilPhoto: dataUrl }));
      // Otomatis simpan langsung ke Supabase Cloud
      await updateOfficeProfile({ korwilPhoto: dataUrl });
      showToast('Foto resmi pimpinan berhasil diunggah & otomatis tersimpan ke Database Supabase!', 'success');
    } catch (err) {
      showToast('Gagal memproses foto pimpinan!', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Memproses pas foto pegawai...', 'info');
      // Kompresi pas foto ~30-45KB agar cepat dimuat oleh semua pengunjung web
      const dataUrl = await compressImage(file, 500, 0.78);
      setStaffForm((prev) => ({ ...prev, photo: dataUrl }));
      
      // Jika sedang edit pegawai yang sudah ada, langsung simpan foto ke Supabase Cloud seketika
      if (editingStaffId) {
        await updateStaff(editingStaffId, { photo: dataUrl });
        showToast('Pas foto pegawai berhasil diperbarui dan disimpan ke Supabase Cloud!', 'success');
      } else {
        showToast('Pas foto pegawai berhasil diproses & siap disimpan bersama data pegawai!', 'success');
      }
    } catch (err) {
      showToast('Gagal memproses pas foto pegawai!', 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  const handleQuickStaffPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = quickUploadStaffIdRef.current || quickUploadStaffId;
    if (!file || !targetId) return;

    try {
      showToast('Memproses pas foto pegawai...', 'info');
      const dataUrl = await compressImage(file, 500, 0.78);
      await updateStaff(targetId, { photo: dataUrl });
      showToast('Pas foto pegawai berhasil diunggah dan disimpan langsung ke Supabase Cloud!', 'success');
    } catch (err) {
      showToast('Gagal mengunggah pas foto pegawai!', 'error');
    } finally {
      quickUploadStaffIdRef.current = null;
      setQuickUploadStaffId(null);
      if (e.target) e.target.value = '';
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

  // Sinkronkan form saat data officeProfile selesai dimuat dari Supabase
  React.useEffect(() => {
    setProfileForm({
      korwilName: officeProfile.korwilName,
      korwilNip: officeProfile.korwilNip,
      korwilPhoto: officeProfile.korwilPhoto,
      greetingTitle: officeProfile.greetingTitle,
      greetingText: officeProfile.greetingText,
      vision: officeProfile.vision,
      missions: [...officeProfile.missions]
    });
  }, [officeProfile]);

  // Sinkronkan homeForm saat officeProfile selesai dimuat dari Supabase
  React.useEffect(() => {
    setHomeForm({
      tagline: officeProfile.tagline,
      heroBadge: officeProfile.heroBadge || "Portal Resmi Pendidikan Kecamatan Purwodadi",
      heroTitle: officeProfile.heroTitle || "Mewujudkan Fondasi Generasi Emas SD, TK, & KB di Purwodadi",
      heroSubtitle: officeProfile.heroSubtitle || "Selamat datang di pusat informasi dan layanan terpadu Kantor Korwilcam Purwodadi...",
      korwilQuote: officeProfile.korwilQuote || "Pendidikan bukan sekadar transfer ilmu, melainkan menuntun kodrat anak...",
      heroDriveFolderUrl: officeProfile.heroDriveFolderUrl || '',
      heroSlideshowImages: officeProfile.heroSlideshowImages || [],
      heroSlideshowInterval: officeProfile.heroSlideshowInterval || 5
    });
  }, [officeProfile]);

  // --- SOP CMS STATE ---
  const [sopInputUrl, setSopInputUrl] = useState(sopImageUrl || '');
  const [isSavingSop, setIsSavingSop] = useState(false);
  const [sopPreviewError, setSopPreviewError] = useState(false);

  React.useEffect(() => {
    setSopInputUrl(sopImageUrl || '');
  }, [sopImageUrl]);

  const handleSaveSopCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await showConfirmDialog({
      title: 'Simpan Gambar Bagan SOP Pelayanan?',
      message: 'Apakah Anda yakin ingin memperbarui bagan alur SOP Pelayanan?',
      type: 'save',
      confirmText: 'Ya, Simpan SOP',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    setIsSavingSop(true);
    try {
      await updateSOPImageUrl(sopInputUrl.trim());
      showNoticePopup({
        title: 'Bagan SOP Tersimpan!',
        message: 'Tautan bagan SOP Pelayanan berhasil diperbarui dan aktif di website.',
        type: 'success'
      });
    } finally {
      setIsSavingSop(false);
    }
  };

  const handleClearSop = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Bagan SOP Pelayanan?',
      message: 'Apakah Anda yakin ingin menghapus tautan gambar bagan SOP Pelayanan?',
      type: 'delete',
      confirmText: 'Ya, Hapus Bagan',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    setIsSavingSop(true);
    try {
      await updateSOPImageUrl('');
      setSopInputUrl('');
      showNoticePopup({
        title: 'Bagan SOP Dihapus!',
        message: 'Tautan bagan SOP Pelayanan berhasil dihapus.',
        type: 'warning'
      });
    } finally {
      setIsSavingSop(false);
    }
  };

  const [newMissionText, setNewMissionText] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingStaff, setIsSavingStaff] = useState(false);
  const [isSyncingStaff, setIsSyncingStaff] = useState(false);

  const handleSaveProfileCMS = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await showConfirmDialog({
      title: 'Simpan Profil & Visi Misi Kantor?',
      message: 'Apakah Anda yakin ingin menyimpan perubahan visi, misi, dan profil kantor Korwilcam Purwodadi?',
      type: 'save',
      confirmText: 'Ya, Simpan Profil',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;

    setIsSavingProfile(true);
    try {
      await updateOfficeProfile(profileForm);
      showNoticePopup({
        title: 'Profil Berhasil Disimpan!',
        message: 'Pengaturan visi, misi, dan profil kantor berhasil diperbarui.',
        type: 'success'
      });
    } finally {
      setIsSavingProfile(false);
    }
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
    photo: '',
    division: 'Pengawas SD' as StaffDivision
  });

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.role) {
      showToast('Nama dan Jabatan wajib diisi!', 'error');
      return;
    }

    if (editingStaffId) {
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Data Pejabat/Staf',
        message: `Simpan pembaruan data untuk "${staffForm.name}"?`,
        type: 'edit',
        itemName: `${staffForm.name} (${staffForm.role})`,
        confirmText: 'Ya, Perbarui Data',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;
    }

    setIsSavingStaff(true);
    try {
      if (editingStaffId) {
        await updateStaff(editingStaffId, staffForm);
        setEditingStaffId(null);
        showNoticePopup({
          title: 'Data Staf Diperbarui!',
          message: `Data "${staffForm.name}" telah berhasil diperbarui.`,
          type: 'success'
        });
      } else {
        await addStaff(staffForm);
        showNoticePopup({
          title: 'Staf Baru Ditambahkan!',
          message: `Data "${staffForm.name}" berhasil ditambahkan ke struktur organisasi.`,
          type: 'success'
        });
      }

      setStaffForm({
        name: '',
        role: '',
        nip: '',
        photo: '',
        division: 'Pengawas SD'
      });
    } finally {
      setIsSavingStaff(false);
    }
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
      setSchoolDriveInput('');
      showToast('Foto sekolah berhasil dipilih & siap disimpan ke database!', 'success');
    } catch (err) {
      showToast('Gagal memproses foto sekolah!', 'error');
    }
  };

  // --- 3. SCHOOLS CMS STATE ---
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);
  const [schoolDriveInput, setSchoolDriveInput] = useState('');
  const [schoolCurrentPage, setSchoolCurrentPage] = useState(1);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const schoolItemsPerPage = 10;
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
    image: '',
    coordinates: '',
    titikKoordinat: ''
  });

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.npsn) {
      showToast('Nama sekolah dan NPSN wajib diisi!', 'error');
      return;
    }

    const rawLink = schoolForm.coordinates || schoolForm.titikKoordinat || '';
    const normalizedMapsUrl = normalizeToGoogleMapsUrl(rawLink);
    const finalImage = schoolForm.image && isGoogleDriveUrl(schoolForm.image)
      ? formatGoogleDriveImageUrl(schoolForm.image)
      : (schoolForm.image || '');

    const preparedSchoolData = {
      ...schoolForm,
      image: finalImage,
      coordinates: normalizedMapsUrl,
      titikKoordinat: normalizedMapsUrl
    };

    if (editingSchoolId) {
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Data Sekolah',
        message: `Simpan pembaruan data untuk sekolah "${schoolForm.name}"?`,
        type: 'edit',
        itemName: `${schoolForm.name} (NPSN: ${schoolForm.npsn})`,
        confirmText: 'Ya, Perbarui Sekolah',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateSchool(editingSchoolId, preparedSchoolData);
      setEditingSchoolId(null);
      showNoticePopup({
        title: 'Data Sekolah Diperbarui!',
        message: `Data sekolah "${schoolForm.name}" telah berhasil diperbarui.`,
        type: 'success'
      });
    } else {
      await addSchool(preparedSchoolData);
      showNoticePopup({
        title: 'Sekolah Ditambahkan!',
        message: `Sekolah "${schoolForm.name}" berhasil didaftarkan ke sistem direktori.`,
        type: 'success'
      });
    }

    setSchoolDriveInput('');
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
      image: '',
      coordinates: '',
      titikKoordinat: ''
    });
  };

  // --- 3.5. NOMINATIF GURU CMS STATE ---
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teacherSearchInput, setTeacherSearchInput] = useState('');
  const [teacherFilterStatus, setTeacherFilterStatus] = useState('ALL');
  const [teacherFilterInstansi, setTeacherFilterInstansi] = useState('ALL');
  const [teacherCurrentPage, setTeacherCurrentPage] = useState(1);
  const teacherItemsPerPage = 10;
  const [teacherForm, setTeacherForm] = useState({
    no: 0,
    nama: '',
    nip: '',
    statusPegawai: 'PNS',
    instansi: ''
  });

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.nama.trim()) {
      showToast('Nama guru wajib diisi!', 'error');
      return;
    }
    if (!teacherForm.instansi.trim()) {
      showToast('Instansi sekolah tempat bertugas wajib diisi!', 'error');
      return;
    }

    const calculatedNo = Number(teacherForm.no) || (teachers.length > 0 ? Math.max(...teachers.map((t) => t.no || 0)) + 1 : 1);
    const preparedData = {
      no: calculatedNo,
      nama: teacherForm.nama.trim(),
      nip: teacherForm.nip.trim() || '-',
      statusPegawai: teacherForm.statusPegawai,
      instansi: teacherForm.instansi.trim()
    };

    if (editingTeacherId) {
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Data Guru',
        message: `Simpan pembaruan data untuk guru "${teacherForm.nama}"?`,
        type: 'edit',
        itemName: `${teacherForm.nama} (${teacherForm.statusPegawai})`,
        confirmText: 'Ya, Simpan Perubahan',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateTeacher(editingTeacherId, preparedData);
      setEditingTeacherId(null);
      showNoticePopup({
        title: 'Data Guru Diperbarui!',
        message: `Data nominatif guru "${teacherForm.nama}" telah berhasil diperbarui dan disinkronkan ke Supabase.`,
        type: 'success'
      });
    } else {
      await addTeacher(preparedData);
      showNoticePopup({
        title: 'Data Guru Ditambahkan!',
        message: `Guru "${teacherForm.nama}" berhasil ditambahkan ke daftar nominatif Supabase.`,
        type: 'success'
      });
    }

    setTeacherForm({
      no: 0,
      nama: '',
      nip: '',
      statusPegawai: 'PNS',
      instansi: ''
    });
  };

  // --- PAGINATION & FILTER LOGIC: SEKOLAH CMS ---
  const filteredSchools = useMemo(() => {
    const q = schoolSearchQuery.toLowerCase().trim();
    if (!q) return schools;
    return schools.filter((s) =>
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.npsn && s.npsn.toLowerCase().includes(q)) ||
      (s.headmaster && s.headmaster.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      (s.level && s.level.toLowerCase().includes(q)) ||
      (s.status && s.status.toLowerCase().includes(q))
    );
  }, [schools, schoolSearchQuery]);

  const totalSchoolPages = Math.max(1, Math.ceil(filteredSchools.length / schoolItemsPerPage));
  const paginatedSchools = useMemo(() => {
    const start = (schoolCurrentPage - 1) * schoolItemsPerPage;
    return filteredSchools.slice(start, start + schoolItemsPerPage);
  }, [filteredSchools, schoolCurrentPage, schoolItemsPerPage]);

  useEffect(() => {
    if (schoolCurrentPage > totalSchoolPages) {
      setSchoolCurrentPage(totalSchoolPages);
    }
  }, [schoolCurrentPage, totalSchoolPages]);

  // --- PAGINATION & FILTER LOGIC: NOMINATIF GURU CMS ---
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = teacherSearchInput.toLowerCase().trim();
      const matchQ =
        !q ||
        (t.nama && t.nama.toLowerCase().includes(q)) ||
        (t.nip && t.nip.toLowerCase().includes(q)) ||
        (t.instansi && t.instansi.toLowerCase().includes(q));
      const matchStatus = (() => {
        if (!teacherFilterStatus || teacherFilterStatus === 'ALL') return true;
        const s = t.statusPegawai?.toUpperCase().trim() || '';
        const f = teacherFilterStatus.toUpperCase().trim();
        if (f === 'PNS') return s === 'PNS' || (s.includes('PNS') && !s.includes('NON'));
        if (f === 'PPPK') return (s === 'PPPK' || s === 'P3K' || (s.includes('PPPK') && !s.includes('PARUH')));
        if (f === 'PPPK PARUH WAKTU') return s.includes('PARUH');
        if (f === 'GURU TK') return s === 'GURU TK' || s.includes('TK');
        if (f === 'GURU KB') return s === 'GURU KB' || s.includes('KB');
        if (f === 'HONORER') return s.includes('HONOR') || s === 'GTT' || s === 'PTT' || s === 'GTY' || s.includes('NON ASN') || s.includes('NON-ASN');
        return s === f;
      })();
      const matchInstansi =
        teacherFilterInstansi === 'ALL' ||
        t.instansi?.toLowerCase() === teacherFilterInstansi.toLowerCase();
      return matchQ && matchStatus && matchInstansi;
    });
  }, [teachers, teacherSearchInput, teacherFilterStatus, teacherFilterInstansi]);

  const totalTeacherPages = Math.max(1, Math.ceil(filteredTeachers.length / teacherItemsPerPage));
  const paginatedTeachers = useMemo(() => {
    const start = (teacherCurrentPage - 1) * teacherItemsPerPage;
    return filteredTeachers.slice(start, start + teacherItemsPerPage);
  }, [filteredTeachers, teacherCurrentPage, teacherItemsPerPage]);

  useEffect(() => {
    if (teacherCurrentPage > totalTeacherPages) {
      setTeacherCurrentPage(totalTeacherPages);
    }
  }, [teacherCurrentPage, totalTeacherPages]);

  const handleEditTeacher = (t: TeacherNominative) => {
    setEditingTeacherId(t.id);
    setTeacherForm({
      no: t.no || 0,
      nama: t.nama || '',
      nip: t.nip && t.nip !== '-' ? t.nip : '',
      statusPegawai: t.statusPegawai || 'PNS',
      instansi: t.instansi || ''
    });
  };

  const handleCancelEditTeacher = () => {
    setEditingTeacherId(null);
    setTeacherForm({
      no: 0,
      nama: '',
      nip: '',
      statusPegawai: 'PNS',
      instansi: ''
    });
  };

  const handleDeleteTeacher = async (t: TeacherNominative) => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Data Guru?',
      message: `Apakah Anda yakin ingin menghapus data guru "${t.nama}" (${t.statusPegawai} - ${t.instansi}) dari daftar nominatif Supabase?`,
      type: 'delete',
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Tidak, Batalkan',
      itemName: t.nama
    });
    if (!confirmed) return;

    await deleteTeacher(t.id);
    if (editingTeacherId === t.id) {
      handleCancelEditTeacher();
    }
  };

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDownloadCsvTemplate = () => {
    const csvContent = "no,nama,nip,status_pegawai,instansi\n1,SUGITO S.Pd M.Pd,196805121991031008,PNS,SDN 1 Purwodadi\n2,AGUS PRASETYO S.Pd,198811042022211006,PPPK,SDN 4 Purwodadi\n3,SITI AISYAH S.Pd.I,-,Guru TK,TK NEGERI PEMBINA\n4,NURUL HIDAYAH S.Pd,-,Guru KB,KB TUNAS BANGSA";
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_daftar_guru.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Template file CSV berhasil diunduh!', 'success');
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || !text.trim()) {
          showToast('File CSV kosong!', 'error');
          return;
        }

        const lines = text.split(/\r\n|\n/).filter((line) => line.trim() !== '');
        if (lines.length <= 1) {
          showToast('File CSV tidak memiliki baris data!', 'error');
          return;
        }

        // Delimiter auto-detect
        const firstLine = lines[0];
        const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

        // Parse headers
        const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
        
        const idxNo = headers.findIndex((h) => h === 'no' || h === 'nomor');
        const idxNama = headers.findIndex((h) => h === 'nama' || h === 'nama lengkap' || h === 'nama_lengkap' || h === 'guru');
        const idxNip = headers.findIndex((h) => h === 'nip');
        const idxStatus = headers.findIndex((h) => h === 'status_pegawai' || h === 'status pegawai' || h === 'status' || h === 'statuspegawai');
        const idxInstansi = headers.findIndex((h) => h === 'instansi' || h === 'sekolah' || h === 'unit kerja' || h === 'tempat tugas');

        if (idxNama === -1 || idxInstansi === -1) {
          showToast('File CSV wajib memiliki kolom "Nama" dan "Instansi"!', 'error');
          return;
        }

        const parsedRows: Omit<TeacherNominative, 'id'>[] = [];
        let autoNo = 1;

        for (let i = 1; i < lines.length; i++) {
          const rawRow = lines[i].split(delimiter).map((col) => col.trim().replace(/^["']|["']$/g, ''));
          if (rawRow.length === 0 || rawRow.every((c) => c === '')) continue;

          const nama = rawRow[idxNama] || '';
          const instansi = rawRow[idxInstansi] || '';
          if (!nama && !instansi) continue;

          let noVal = idxNo !== -1 ? parseInt(rawRow[idxNo], 10) : autoNo;
          if (isNaN(noVal) || noVal <= 0) noVal = autoNo;
          autoNo = Math.max(autoNo, noVal) + 1;

          const nipVal = idxNip !== -1 && rawRow[idxNip] ? rawRow[idxNip] : '-';
          const statusVal = idxStatus !== -1 && rawRow[idxStatus] ? rawRow[idxStatus] : 'PNS';

          parsedRows.push({
            no: noVal,
            nama,
            nip: nipVal,
            statusPegawai: statusVal,
            instansi
          });
        }

        if (parsedRows.length === 0) {
          showToast('Tidak ada data valid yang ditemukan pada file CSV!', 'error');
          return;
        }

        await batchAddTeachers(parsedRows);
        showNoticePopup({
          title: 'Import CSV Berhasil!',
          message: `Sebanyak ${parsedRows.length} data guru berhasil diimpor dan disinkronkan ke Supabase!`,
          type: 'success'
        });
      } catch (err: any) {
        console.error('Error importing CSV:', err);
        showToast(`Gagal membaca file CSV: ${err.message || err}`, 'error');
      } finally {
        if (csvFileInputRef.current) {
          csvFileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleClearAllTeachers = async () => {
    if (teachers.length === 0) {
      showToast('Daftar guru sudah dalam keadaan kosong.', 'info');
      return;
    }
    const confirmed = await showConfirmDialog({
      title: 'Kosongkan Seluruh Data Guru?',
      message: `Apakah Anda yakin ingin menghapus seluruh ${teachers.length} data guru dari sistem dan database Supabase? Tindakan ini akan mengosongkan tabel daftar_guru.`,
      type: 'danger',
      confirmText: 'Ya, Kosongkan Semua',
      cancelText: 'Batal'
    });
    if (!confirmed) return;

    await clearAllTeachers();
    handleCancelEditTeacher();
  };

  // --- 4.8. SERVICE REQUIREMENTS CMS STATE ---
  const DEFAULT_REQ_CATEGORIES = [
    'Kepegawaian & GTK',
    'Kesiswaan & Kurikulum',
    'Kelembagaan & Legalitas',
    'Umum & Tata Usaha'
  ];

  const [reqSearchQuery, setReqSearchQuery] = useState('');
  const [reqCategoryFilter, setReqCategoryFilter] = useState('Semua');
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [reqFormInputMode, setReqFormInputMode] = useState<'list' | 'text'>('list');

  const [customReqCategories, setCustomReqCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('custom_service_categories');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isAddingReqCategory, setIsAddingReqCategory] = useState(false);
  const [newReqCategoryInput, setNewReqCategoryInput] = useState('');

  const allReqCategories = useMemo(() => {
    const set = new Set<string>(
      serviceRequirementCategories && serviceRequirementCategories.length > 0
        ? serviceRequirementCategories
        : DEFAULT_REQ_CATEGORIES
    );
    serviceRequirements.forEach((item) => {
      if (item.category && item.category.trim() && item.category !== 'System') {
        set.add(item.category.trim());
      }
    });
    customReqCategories.forEach((cat) => {
      if (cat && cat.trim() && cat !== 'System') {
        set.add(cat.trim());
      }
    });
    return Array.from(set);
  }, [serviceRequirements, serviceRequirementCategories, customReqCategories]);

  const handleSaveNewCategory = async () => {
    const trimmed = newReqCategoryInput.trim();
    if (!trimmed) {
      showToast('Nama kategori tidak boleh kosong!', 'error');
      return;
    }
    const existing = allReqCategories.find((c) => c.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setReqForm((prev) => ({ ...prev, category: existing }));
      setIsAddingReqCategory(false);
      setNewReqCategoryInput('');
      showToast(`Kategori "${existing}" dipilih.`, 'info');
      return;
    }

    // Simpan ke Supabase Cloud via AppContext (tersinkronisasi untuk seluruh admin)
    await addServiceRequirementCategory(trimmed);

    const updated = [...customReqCategories, trimmed];
    setCustomReqCategories(updated);
    try {
      localStorage.setItem('custom_service_categories', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setReqForm((prev) => ({ ...prev, category: trimmed }));
    setIsAddingReqCategory(false);
    setNewReqCategoryInput('');
  };

  const handleCancelNewCategory = () => {
    setIsAddingReqCategory(false);
    setNewReqCategoryInput('');
  };

  const [reqForm, setReqForm] = useState({
    title: '',
    category: 'Kepegawaian & GTK',
    description: '',
    requirements: [''] as string[],
    requirementsText: '',
    notes: '',
    estimatedTime: '1 - 3 Hari Kerja',
    fee: '',
    order: 1
  });

  const handleOpenAddReqModal = () => {
    setEditingReqId(null);
    setIsAddingReqCategory(false);
    setNewReqCategoryInput('');
    setReqForm({
      title: '',
      category: allReqCategories[0] || 'Kepegawaian & GTK',
      description: '',
      requirements: [''],
      requirementsText: '',
      notes: '',
      estimatedTime: '1 - 3 Hari Kerja',
      fee: '',
      order: serviceRequirements.length + 1
    });
    setReqFormInputMode('list');
    setIsReqModalOpen(true);
  };

  const handleOpenEditReqModal = (item: ServiceRequirement) => {
    setEditingReqId(item.id);
    setIsAddingReqCategory(false);
    setNewReqCategoryInput('');
    const reqList = Array.isArray(item.requirements) && item.requirements.length > 0 ? [...item.requirements] : [''];
    setReqForm({
      title: item.title,
      category: item.category || 'Kepegawaian & GTK',
      description: item.description || '',
      requirements: reqList,
      requirementsText: reqList.filter(Boolean).join('\n'),
      notes: item.notes || '',
      estimatedTime: item.estimatedTime || '1 - 3 Hari Kerja',
      fee: item.fee || '',
      order: item.order || 1
    });
    setReqFormInputMode('list');
    setIsReqModalOpen(true);
  };

  const handleReqItemChange = (index: number, val: string) => {
    setReqForm((prev) => {
      const updated = [...prev.requirements];
      updated[index] = val;
      return { ...prev, requirements: updated, requirementsText: updated.filter(Boolean).join('\n') };
    });
  };

  const handleAddReqItem = () => {
    setReqForm((prev) => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const handleRemoveReqItem = (index: number) => {
    setReqForm((prev) => {
      const updated = prev.requirements.filter((_, i) => i !== index);
      const safeUpdated = updated.length > 0 ? updated : [''];
      return { ...prev, requirements: safeUpdated, requirementsText: safeUpdated.filter(Boolean).join('\n') };
    });
  };

  const handleSaveReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqForm.title.trim()) {
      showToast('Judul jenis pelayanan wajib diisi!', 'error');
      return;
    }

    let finalReqs: string[] = [];
    if (reqFormInputMode === 'text') {
      finalReqs = reqForm.requirementsText
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•\d+.]\s*/, ''))
        .filter(Boolean);
    } else {
      finalReqs = reqForm.requirements.map((s) => s.trim()).filter(Boolean);
    }

    if (finalReqs.length === 0) {
      showToast('Harap masukkan minimal 1 butir persyaratan!', 'error');
      return;
    }

    if (editingReqId) {
      await updateServiceRequirement(editingReqId, {
        title: reqForm.title.trim(),
        category: reqForm.category.trim(),
        description: reqForm.description.trim(),
        requirements: finalReqs,
        notes: reqForm.notes.trim(),
        estimatedTime: reqForm.estimatedTime.trim(),
        fee: reqForm.fee.trim(),
        order: Number(reqForm.order) || 1
      });
    } else {
      await addServiceRequirement({
        title: reqForm.title.trim(),
        category: reqForm.category.trim(),
        description: reqForm.description.trim(),
        requirements: finalReqs,
        notes: reqForm.notes.trim(),
        estimatedTime: reqForm.estimatedTime.trim(),
        fee: reqForm.fee.trim(),
        order: Number(reqForm.order) || 1
      });
    }

    setIsReqModalOpen(false);
  };

  const handleDeleteReq = async (item: ServiceRequirement) => {
    const confirmed = await showConfirmDialog({
      title: 'Hapus Persyaratan Pelayanan?',
      message: `Apakah Anda yakin ingin menghapus "${item.title}" dari daftar persyaratan pelayanan?`,
      type: 'danger',
      confirmText: 'Ya, Hapus Layanan',
      cancelText: 'Batal'
    });
    if (!confirmed) return;
    await deleteServiceRequirement(item.id);
  };

  const handleResetDefaultReqs = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Kosongkan Seluruh Persyaratan?',
      message: 'Apakah Anda yakin ingin mengosongkan seluruh daftar persyaratan pelayanan?',
      type: 'danger',
      confirmText: 'Ya, Kosongkan',
      cancelText: 'Batal'
    });
    if (!confirmed) return;
    await resetServiceRequirements();
  };

  // --- 4. NEWS & INFORMASI CMS STATE ---
  const [newsSubTab, setNewsSubTab] = useState<'news' | 'announcements'>('news');
  const [newsFilterTab, setNewsFilterTab] = useState<'all' | 'mine'>('all');

  // News form
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Kedinasan' as NewsCategory,
    summary: '',
    content: '',
    author: activeAuthorName,
    authorId: currentUser?.id || '',
    authorRole: activeUserRole as string,
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
    tags: 'Pendidikan, Purwodadi',
    views: 0
  });

  // Helper cek kepemilikan artikel berita berdasarkan akun/role login
  const isNewsItemOwner = (item: NewsArticle) => {
    if (!currentUser) return false;

    // Cocokkan authorId jika tersedia
    if (item.authorId && currentUser.id && item.authorId === currentUser.id) {
      return true;
    }

    // Jika authorId milik Super Admin tetapi yang login bukan Super Admin / Admin
    if (item.authorId === 'usr-superadmin' && !isAdminOrSuperAdmin) {
      return false;
    }

    // Cek kecocokan nama author (case-insensitive)
    if (item.author && activeAuthorName && item.author.trim().toLowerCase() === activeAuthorName.trim().toLowerCase()) {
      return true;
    }

    // Hanya Admin / Super Admin yang boleh mencocokkan berdasarkan sesama role admin
    if (isAdminOrSuperAdmin && item.authorRole && activeUserRole && item.authorRole.trim().toLowerCase() === activeUserRole.trim().toLowerCase()) {
      return true;
    }

    // Jika dibuat oleh Super Administrator dan user login bukan Super Admin / Admin
    const isSuperAdminAuthor = ['super administrator', 'super admin'].some((adm) =>
      item.author?.toLowerCase().includes(adm)
    );
    if (isSuperAdminAuthor && !isAdminOrSuperAdmin) {
      return false;
    }

    return false;
  };

  // Daftar berita yang ditampilkan:
  // Super Admin & Admin dapat melihat seluruh berita (atau filter ke berita miliknya)
  // Penulis HANYA dapat melihat berita yang ditulis oleh dirinya sendiri
  const displayedNews = useMemo(() => {
    if (isAdminOrSuperAdmin) {
      if (newsFilterTab === 'mine') {
        return news.filter((item) => isNewsItemOwner(item));
      }
      return news;
    }
    // Penulis: HANYA menampilkan berita yang dibuat akun login
    return news.filter((item) => isNewsItemOwner(item));
  }, [news, isAdminOrSuperAdmin, newsFilterTab, currentUser, activeAuthorName, activeUserRole]);

  // State untuk tambah kategori berita baru
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryInput, setNewCategoryInput] = useState<string>('');
  const [isSavingCategory, setIsSavingCategory] = useState<boolean>(false);

  const handleSaveCategory = async () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) {
      showToast('Nama kategori tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingCategory(true);
    try {
      const ok = await addNewsCategory(trimmed);
      setNewsForm((prev) => ({ ...prev, category: trimmed }));
      setIsAddingCategory(false);
      setNewCategoryInput('');
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Otomatis sinkronkan nama dan role penulis berita dengan akun login aktif
  React.useEffect(() => {
    if (!editingNewsId && currentUser) {
      setNewsForm((prev) => ({
        ...prev,
        author: currentUser.name || activeAuthorName,
        authorId: currentUser.id || '',
        authorRole: currentUser.role || activeUserRole
      }));
    }
  }, [currentUser, editingNewsId, activeAuthorName, activeUserRole]);

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title || !newsForm.content) {
      showToast('Judul dan isi berita wajib diisi!', 'error');
      return;
    }

    const tagsArray = newsForm.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const parsedViews = isAdminOrSuperAdmin
      ? Math.max(0, Number(newsForm.views) || 0)
      : (editingNewsId ? (news.find((n) => n.id === editingNewsId)?.views || 0) : 0);

    if (editingNewsId) {
      const existingNews = news.find((n) => n.id === editingNewsId);
      if (existingNews && !isAdminOrSuperAdmin && !isNewsItemOwner(existingNews)) {
        showNoticePopup({
          title: 'Akses Ditolak!',
          message: 'Anda tidak memiliki izin untuk mengubah artikel berita milik pengguna/role lain.',
          type: 'warning'
        });
        return;
      }

      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Berita',
        message: 'Apakah Anda yakin ingin menyimpan perubahan pada artikel berita ini?',
        type: 'edit',
        itemName: newsForm.title,
        confirmText: 'Ya, Perbarui Berita',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      const cleanSummary = newsForm.summary && newsForm.summary.trim()
        ? stripHtml(newsForm.summary)
        : generateSummary(newsForm.content, 180);

      const cleanSlug = newsForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `berita-${editingNewsId}`;

      const finalImage = newsForm.image && isGoogleDriveUrl(newsForm.image)
        ? formatGoogleDriveImageUrl(newsForm.image)
        : (newsForm.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000');

      await updateNews(editingNewsId, {
        title: newsForm.title.trim(),
        slug: cleanSlug,
        category: newsForm.category,
        summary: cleanSummary,
        content: newsForm.content,
        author: newsForm.author,
        authorId: newsForm.authorId || currentUser?.id || '',
        authorRole: newsForm.authorRole || activeUserRole,
        image: finalImage,
        tags: tagsArray,
        views: parsedViews
      });
      setEditingNewsId(null);
      showNoticePopup({
        title: 'Berita Diperbarui!',
        message: `Artikel berita "${newsForm.title}" berhasil diperbarui.`,
        type: 'success'
      });
    } else {
      const cleanSummary = newsForm.summary && newsForm.summary.trim()
        ? stripHtml(newsForm.summary)
        : generateSummary(newsForm.content, 180);

      const cleanSlug = newsForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `berita-${Date.now()}`;

      const finalImage = newsForm.image && isGoogleDriveUrl(newsForm.image)
        ? formatGoogleDriveImageUrl(newsForm.image)
        : (newsForm.image || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000');

      await addNews({
        title: newsForm.title.trim(),
        slug: cleanSlug,
        category: newsForm.category,
        summary: cleanSummary,
        content: newsForm.content,
        author: newsForm.author || activeAuthorName,
        authorId: currentUser?.id || '',
        authorRole: activeUserRole,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        image: finalImage,
        views: parsedViews,
        tags: tagsArray
      });
      showNoticePopup({
        title: 'Berita Diterbitkan!',
        message: `Artikel berita "${newsForm.title}" berhasil disimpan dan tayang di website.`,
        type: 'success'
      });
    }

    setNewsForm({
      title: '',
      category: 'Kedinasan',
      summary: '',
      content: '',
      author: activeAuthorName,
      authorId: currentUser?.id || '',
      authorRole: activeUserRole,
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
  const [annFileMode, setAnnFileMode] = useState<'upload' | 'existing'>('upload');
  const [annForm, setAnnForm] = useState({
    title: '',
    urgency: 'Penting' as 'Penting' | 'Biasa' | 'Mendesak',
    target: 'Semua Satuan' as 'Semua Satuan' | 'SD' | 'TK/PAUD' | 'TK/KB',
    fileSize: '',
    fileUrl: '',
    fileName: '',
    fileType: '',
    summary: '',
    serviceRequirementId: '',
    serviceRequirementTitle: '',
    sourceDocumentId: '',
    author: activeAuthorName,
    authorId: currentUser?.id || '',
    authorRole: activeUserRole as string
  });

  const [annFilterTab, setAnnFilterTab] = useState<'all' | 'mine'>('all');

  // Helper cek kepemilikan surat edaran / pengumuman berdasarkan akun/role login
  const isAnnouncementItemOwner = (item: Announcement) => {
    if (!currentUser) return false;

    // Cocokkan authorId jika tersedia
    if (item.authorId && currentUser.id && item.authorId === currentUser.id) {
      return true;
    }

    // Jika authorId milik Super Admin tetapi yang login bukan Super Admin / Admin
    if (item.authorId === 'usr-superadmin' && !isAdminOrSuperAdmin) {
      return false;
    }

    // Cek kecocokan nama author (case-insensitive)
    if (item.author && activeAuthorName && item.author.trim().toLowerCase() === activeAuthorName.trim().toLowerCase()) {
      return true;
    }

    // Cek kecocokan username
    if (item.author && currentUser.username && item.author.trim().toLowerCase() === currentUser.username.trim().toLowerCase()) {
      return true;
    }

    // Hanya Admin / Super Admin yang boleh mencocokkan berdasarkan sesama role admin
    if (isAdminOrSuperAdmin && item.authorRole && activeUserRole && item.authorRole.trim().toLowerCase() === activeUserRole.trim().toLowerCase()) {
      return true;
    }

    // Jika dibuat oleh Super Administrator dan user login bukan Super Admin / Admin
    const isSuperAdminAuthor = ['super administrator', 'super admin'].some((adm) =>
      item.author?.toLowerCase().includes(adm)
    );
    if (isSuperAdminAuthor && !isAdminOrSuperAdmin) {
      return false;
    }

    return false;
  };

  // Otomatis sinkronkan nama dan role pembuat pengumuman dengan akun login aktif
  React.useEffect(() => {
    if (!editingAnnId && currentUser) {
      setAnnForm((prev) => ({
        ...prev,
        author: currentUser.name || activeAuthorName,
        authorId: currentUser.id || '',
        authorRole: currentUser.role || activeUserRole
      }));
    }
  }, [currentUser, editingAnnId, activeAuthorName, activeUserRole]);

  // Pengumuman yang ditampilkan:
  // Super Admin & Admin dapat melihat seluruh pengumuman (atau filter ke pengumuman miliknya)
  // Penulis HANYA dapat melihat pengumuman yang dibuat oleh akun dirinya sendiri
  const displayedAnnouncements = useMemo(() => {
    if (isAdminOrSuperAdmin) {
      if (annFilterTab === 'mine') {
        return announcements.filter((item) => isAnnouncementItemOwner(item));
      }
      return announcements;
    }
    // Penulis: HANYA menampilkan pengumuman yang dibuat akun login
    return announcements.filter((item) => isAnnouncementItemOwner(item));
  }, [announcements, isAdminOrSuperAdmin, annFilterTab, currentUser, activeAuthorName, activeUserRole]);

  // Daftar berkas master dari Layanan Unduhan yang siap ditautkan ke pengumuman (bebas file ganda)
  const availableUnduhanDocs = useMemo(() => {
    const seenUrls = new Set<string>();
    const seenTitles = new Set<string>();
    return documents.filter((doc) => {
      // Hanya tampilkan dokumen master asli (bukan dokumen otomatis dari pengumuman dan bukan dokumen sistem/SOP)
      if (doc.id.startsWith('doc-ann-') || doc.id === 'sop-main' || doc.id === 'system-document-categories') {
        return false;
      }
      const normTitle = doc.title.trim().toLowerCase();
      const normUrl = doc.downloadUrl && doc.downloadUrl !== '#' && !doc.downloadUrl.startsWith('#') ? doc.downloadUrl.trim() : '';
      if (normUrl && seenUrls.has(normUrl)) return false;
      if (seenTitles.has(normTitle)) return false;
      if (normUrl) seenUrls.add(normUrl);
      seenTitles.add(normTitle);
      return true;
    });
  }, [documents]);

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
        fileType: ext,
        sourceDocumentId: ''
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
      fileType: '',
      sourceDocumentId: ''
    }));
    showToast('Berkas lampiran pengumuman dilepas.', 'info');
  };

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAnnSummary = stripHtml(annForm.summary);
    if (!annForm.title || !cleanAnnSummary) {
      showToast('Judul dan ringkasan pengumuman wajib diisi!', 'error');
      return;
    }

    if (editingAnnId) {
      const existingAnn = announcements.find((a) => a.id === editingAnnId);
      if (isWriter && existingAnn && !isAnnouncementItemOwner(existingAnn)) {
        showNoticePopup({
          title: 'Akses Ditolak!',
          message: 'Anda hanya memiliki izin untuk mengedit pengumuman yang Anda buat sendiri.',
          type: 'warning'
        });
        return;
      }

      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Pengumuman',
        message: 'Apakah Anda yakin ingin menyimpan perubahan pada pengumuman ini?',
        type: 'edit',
        itemName: annForm.title,
        confirmText: 'Ya, Perbarui',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateAnnouncement(editingAnnId, {
        ...annForm,
        summary: cleanAnnSummary,
        author: annForm.author || activeAuthorName,
        authorId: annForm.authorId || currentUser?.id || '',
        authorRole: annForm.authorRole || activeUserRole
      });
      setEditingAnnId(null);
      const hasFile = !!(annForm.fileUrl && annForm.fileUrl !== '#');
      const isFromUnduhan = Boolean(annForm.sourceDocumentId);
      showNoticePopup({
        title: 'Pengumuman Diperbarui!',
        message: hasFile
          ? (isFromUnduhan
              ? `Pengumuman "${annForm.title}" berhasil diperbarui dengan menautkan berkas "${annForm.fileName}". Berkas ini tidak digandakan ke menu Unduh Berkas.`
              : `Pengumuman "${annForm.title}" berhasil diperbarui dan lampiran berkas otomatis disinkronkan ke menu Layanan Unduhan (Unduh Berkas di website).`)
          : `Pengumuman "${annForm.title}" berhasil diperbarui.`,
        type: 'success'
      });
    } else {
      await addAnnouncement({
        ...annForm,
        summary: cleanAnnSummary,
        author: currentUser?.name || activeAuthorName,
        authorId: currentUser?.id || '',
        authorRole: currentUser?.role || activeUserRole,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
      const hasFile = !!(annForm.fileUrl && annForm.fileUrl !== '#');
      const isFromUnduhan = Boolean(annForm.sourceDocumentId);
      showNoticePopup({
        title: 'Pengumuman Diterbitkan!',
        message: hasFile
          ? (isFromUnduhan
              ? `Pengumuman "${annForm.title}" berhasil diterbitkan dengan berkas dari Layanan Unduhan "${annForm.fileName}". Bebas dari file ganda.`
              : `Pengumuman "${annForm.title}" berhasil diterbitkan dan lampiran berkas otomatis disinkronkan ke menu Layanan Unduhan (Unduh Berkas di website).`)
          : `Pengumuman "${annForm.title}" berhasil diterbitkan dan tayang di website.`,
        type: 'success'
      });
    }

    // Reset form
    setUploadedAnnFile(null);
    setAnnFileMode('upload');
    if (annFileInputRef.current) annFileInputRef.current.value = '';
    setAnnForm({
      title: '',
      urgency: 'Penting',
      target: 'Semua Satuan',
      fileSize: '',
      fileUrl: '',
      fileName: '',
      fileType: '',
      summary: '',
      serviceRequirementId: '',
      serviceRequirementTitle: '',
      sourceDocumentId: '',
      author: currentUser?.name || activeAuthorName,
      authorId: currentUser?.id || '',
      authorRole: currentUser?.role || activeUserRole
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
    category: 'Kurikulum' as string,
    fileType: 'PDF' as 'PDF' | 'DOCX' | 'XLSX',
    fileSize: '1.5 MB',
    description: '',
    downloadUrl: '#'
  });

  // State untuk tambah kategori berkas unduhan baru
  const [isAddingDocCategory, setIsAddingDocCategory] = useState<boolean>(false);
  const [newDocCategoryInput, setNewDocCategoryInput] = useState<string>('');
  const [isSavingDocCategory, setIsSavingDocCategory] = useState<boolean>(false);

  const handleSaveDocCategory = async () => {
    const trimmed = newDocCategoryInput.trim();
    if (!trimmed) {
      showToast('Nama kategori berkas tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingDocCategory(true);
    try {
      await addDocumentCategory(trimmed);
      setDocForm((prev) => ({ ...prev, category: trimmed }));
      setIsAddingDocCategory(false);
      setNewDocCategoryInput('');
    } catch (err) {
      console.error('Error adding doc category:', err);
    } finally {
      setIsSavingDocCategory(false);
    }
  };

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

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title || !docForm.description) {
      showToast('Judul dan deskripsi dokumen wajib diisi!', 'error');
      return;
    }

    if (editingDocId) {
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Dokumen',
        message: 'Apakah Anda yakin ingin menyimpan perubahan pada berkas unduhan ini?',
        type: 'edit',
        itemName: docForm.title,
        confirmText: 'Ya, Perbarui',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateDocument(editingDocId, docForm);
      setEditingDocId(null);
      showNoticePopup({
        title: 'Dokumen Diperbarui!',
        message: `Berkas "${docForm.title}" berhasil diperbarui.`,
        type: 'success'
      });
    } else {
      await addDocument({
        ...docForm,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
      });
      showNoticePopup({
        title: 'Dokumen Ditambahkan!',
        message: `Berkas "${docForm.title}" berhasil diunggah ke pusat unduhan.`,
        type: 'success'
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
  const [galleryFilterTab, setGalleryFilterTab] = useState<'all' | 'mine'>('all');
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    category: 'Kegiatan Belajar' as string,
    driveFolderUrl: '',
    coverImage: '',
    images: [] as string[],
    description: '',
    authorId: currentUser?.id || '',
    authorName: activeAuthorName as string,
    authorRole: activeUserRole as string
  });
  const [showDriveEmbedPreview, setShowDriveEmbedPreview] = useState<boolean>(false);
  const [galleryBatchInput, setGalleryBatchInput] = useState<string>('');
  const [isGalleryBatchMode, setIsGalleryBatchMode] = useState<boolean>(true);
  const [singleGalleryPhotoInput, setSingleGalleryPhotoInput] = useState<string>('');

  // Helper cek kepemilikan album galeri berdasarkan akun/role login
  const isGalleryItemOwner = (item: GalleryItem) => {
    if (!currentUser) return false;
    if (item.authorId && currentUser.id && item.authorId === currentUser.id) return true;
    if (item.authorName && currentUser.name && item.authorName.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    if (item.authorRole && currentUser.role && item.authorRole === currentUser.role) return true;
    return false;
  };

  // Otomatis sinkronkan nama & role pembuat album dengan akun login aktif
  React.useEffect(() => {
    if (!editingGalleryId && currentUser) {
      setGalleryForm((prev) => ({
        ...prev,
        authorId: currentUser.id || '',
        authorName: currentUser.name || activeAuthorName,
        authorRole: currentUser.role || activeUserRole
      }));
    }
  }, [currentUser, editingGalleryId, activeAuthorName, activeUserRole]);

  // Filter daftar galeri yang tampil di CMS:
  // Super Admin & Admin dapat melihat seluruh album (atau filter ke unggahan miliknya)
  // Penulis HANYA dapat melihat album dokumentasi yang diunggah oleh dirinya sendiri
  const displayedGallery = useMemo(() => {
    if (!currentUser) return [];
    if (isAdminOrSuperAdmin) {
      if (galleryFilterTab === 'mine') {
        return sortGalleryDescending(gallery.filter((g) => isGalleryItemOwner(g)));
      }
      return sortGalleryDescending(gallery);
    }
    return sortGalleryDescending(gallery.filter((g) => isGalleryItemOwner(g)));
  }, [gallery, currentUser, galleryFilterTab, isAdminOrSuperAdmin]);

  // State untuk tambah kategori galeri baru
  const [isAddingGalleryCategory, setIsAddingGalleryCategory] = useState<boolean>(false);
  const [newGalleryCategoryInput, setNewGalleryCategoryInput] = useState<string>('');
  const [isSavingGalleryCategory, setIsSavingGalleryCategory] = useState<boolean>(false);

  const handleSaveGalleryCategory = async () => {
    const trimmed = newGalleryCategoryInput.trim();
    if (!trimmed) {
      showToast('Nama kategori galeri tidak boleh kosong!', 'error');
      return;
    }
    setIsSavingGalleryCategory(true);
    try {
      await addGalleryCategory(trimmed);
      setGalleryForm((prev) => ({ ...prev, category: trimmed }));
      setIsAddingGalleryCategory(false);
      setNewGalleryCategoryInput('');
    } catch (err) {
      console.error('Error adding gallery category:', err);
    } finally {
      setIsSavingGalleryCategory(false);
    }
  };

  // Handlers Foto Dokumentasi Galeri Google Drive
  const handleAddBatchGalleryPhotos = () => {
    const trimmed = galleryBatchInput.trim();
    if (!trimmed) {
      showToast('Silakan tempelkan link foto Google Drive terlebih dahulu!', 'error');
      return;
    }
    const extracted = parseGoogleDriveImageLinks(trimmed);
    if (extracted.length === 0) {
      showToast('Tidak ada link foto Google Drive yang valid terdeteksi dari teks yang ditempelkan.', 'error');
      return;
    }

    setGalleryForm((prev) => {
      const combined = [...prev.images];
      extracted.forEach((url) => {
        if (!combined.includes(url)) combined.push(url);
      });
      const newCover = prev.coverImage || combined[0] || '';
      return {
        ...prev,
        images: combined,
        coverImage: newCover
      };
    });

    setGalleryBatchInput('');
    showToast(`Berhasil menambahkan ${extracted.length} foto ke daftar dokumentasi!`, 'success');
  };

  const handleAddSingleGalleryPhoto = () => {
    const trimmed = singleGalleryPhotoInput.trim();
    if (!trimmed) {
      showToast('Masukkan link foto Google Drive terlebih dahulu!', 'error');
      return;
    }
    const extracted = parseGoogleDriveImageLinks(trimmed);
    const photoUrl = extracted[0] || (isGoogleDriveUrl(trimmed) ? formatGoogleDriveImageUrl(trimmed) : trimmed);
    if (!photoUrl) {
      showToast('Format link foto tidak valid!', 'error');
      return;
    }

    setGalleryForm((prev) => {
      const combined = prev.images.includes(photoUrl) ? prev.images : [...prev.images, photoUrl];
      const newCover = prev.coverImage || combined[0] || '';
      return {
        ...prev,
        images: combined,
        coverImage: newCover
      };
    });

    setSingleGalleryPhotoInput('');
    showToast('Foto berhasil ditambahkan!', 'success');
  };

  const handleRemoveGalleryPhoto = (indexToRemove: number) => {
    setGalleryForm((prev) => {
      const targetPhoto = prev.images[indexToRemove];
      const filtered = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newCover = prev.coverImage;
      if (newCover === targetPhoto) {
        newCover = filtered[0] || '';
      }
      return {
        ...prev,
        images: filtered,
        coverImage: newCover
      };
    });
  };

  const handleSetGalleryCover = (photoUrl: string) => {
    setGalleryForm((prev) => ({
      ...prev,
      coverImage: photoUrl
    }));
    showToast('Foto sampul utama berhasil dipilih!', 'info');
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = galleryForm.title.trim();
    if (!trimmedTitle) {
      showToast('Judul album kegiatan wajib diisi!', 'error');
      return;
    }

    // Siapkan daftar foto yang akan disimpan
    let imagesList = [...galleryForm.images];
    const trimmedCover = galleryForm.coverImage.trim();
    const formattedCover = trimmedCover ? (isGoogleDriveUrl(trimmedCover) ? formatGoogleDriveImageUrl(trimmedCover) : trimmedCover) : '';

    if (formattedCover && !imagesList.includes(formattedCover) && !isGoogleDriveFolderUrl(formattedCover)) {
      imagesList = [formattedCover, ...imagesList];
    }
    if (imagesList.length === 0 && formattedCover) {
      imagesList = [formattedCover];
    }

    if (imagesList.length === 0) {
      showToast('Tambahkan minimal 1 tautan foto pada daftar foto dokumentasi!', 'error');
      return;
    }

    const primaryCover = formattedCover || imagesList[0] || '';
    const trimmedDriveUrl = galleryForm.driveFolderUrl?.trim() || '';

    if (editingGalleryId) {
      const existingItem = gallery.find((g) => g.id === editingGalleryId);
      if (existingItem && !isGalleryItemOwner(existingItem) && !isAdminOrSuperAdmin) {
        showToast('Anda tidak memiliki izin untuk mengedit album yang diunggah oleh akun/role lain!', 'error');
        return;
      }

      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Album Galeri',
        message: `Apakah Anda yakin ingin menyimpan perubahan pada album galeri ini (${imagesList.length} foto)?`,
        type: 'edit',
        itemName: trimmedTitle,
        confirmText: 'Ya, Perbarui',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateGalleryItem(editingGalleryId, {
        title: trimmedTitle,
        category: galleryForm.category,
        driveFolderUrl: trimmedDriveUrl,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description.trim(),
        authorId: existingItem?.authorId || currentUser?.id,
        authorName: galleryForm.authorName || activeAuthorName,
        authorRole: galleryForm.authorRole || activeUserRole
      });
      setEditingGalleryId(null);
      showNoticePopup({
        title: 'Galeri Diperbarui!',
        message: `Album kegiatan "${trimmedTitle}" berhasil diperbarui dengan ${imagesList.length} foto dokumentasi.`,
        type: 'success'
      });
    } else {
      await addGalleryItem({
        title: trimmedTitle,
        category: galleryForm.category,
        driveFolderUrl: trimmedDriveUrl,
        image: primaryCover,
        images: imagesList,
        description: galleryForm.description.trim(),
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        authorId: currentUser?.id,
        authorName: currentUser?.name || galleryForm.authorName || activeAuthorName,
        authorRole: currentUser?.role || galleryForm.authorRole || activeUserRole
      });
      showNoticePopup({
        title: 'Album Galeri Dibuat!',
        message: `Album kegiatan "${trimmedTitle}" berhasil disimpan dengan ${imagesList.length} foto dan tayang di website.`,
        type: 'success'
      });
    }

    setGalleryForm({
      title: '',
      category: 'Kegiatan Belajar',
      driveFolderUrl: '',
      coverImage: '',
      images: [],
      description: '',
      authorId: currentUser?.id || '',
      authorName: activeAuthorName,
      authorRole: activeUserRole
    });
    setGalleryBatchInput('');
    setSingleGalleryPhotoInput('');
    setShowDriveEmbedPreview(false);
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

  React.useEffect(() => {
    setContactForm({
      address: officeProfile.address,
      phone: officeProfile.phone,
      whatsapp: officeProfile.whatsapp,
      email: officeProfile.email,
      workingHours: officeProfile.workingHours
    });
  }, [officeProfile]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    const confirmed = await showConfirmDialog({
      title: 'Simpan Kontak & Jam Operasional Kantor?',
      message: 'Apakah Anda yakin ingin memperbarui informasi alamat, kontak telepon, WhatsApp, dan jam operasional kantor?',
      type: 'save',
      confirmText: 'Ya, Simpan Kontak',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;
    await updateOfficeProfile(contactForm);
    showNoticePopup({
      title: 'Kontak Diperbarui!',
      message: 'Informasi alamat dan kontak kantor berhasil disimpan.',
      type: 'success'
    });
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
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Akun Pengelola',
        message: `Simpan pembaruan data untuk akun pengelola "${userForm.username}"?`,
        type: 'edit',
        itemName: `${userForm.name} (@${userForm.username})`,
        confirmText: 'Ya, Perbarui Akun',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;

      await updateAdminUser(editingUserId, {
        name: userForm.name.trim(),
        username: userForm.username.trim().toLowerCase(),
        ...(userForm.password.trim() ? { password: userForm.password.trim() } : {}),
        role: userForm.role,
        email: userForm.email.trim(),
        status: userForm.status
      });

      showNoticePopup({
        title: 'Akun Diperbarui!',
        message: `Data akun pengelola "${userForm.username}" berhasil diperbarui.`,
        type: 'success'
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

      showNoticePopup({
        title: 'Akun Ditambahkan!',
        message: `Akun pengelola "${userForm.username}" berhasil dibuat.`,
        type: 'success'
      });
    }
    setShowUserModal(false);
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.id === currentUser?.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    const confirmed = await showConfirmDialog({
      title: 'Hapus Akun Pengelola Ini?',
      message: `Apakah Anda yakin ingin menghapus akun pengelola "${user.username}" (${user.name})? Pengguna ini tidak akan bisa login lagi.`,
      type: 'delete',
      itemName: `${user.name} (@${user.username})`,
      confirmText: 'Ya, Hapus Akun',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;

    await deleteAdminUser(user.id);
    showNoticePopup({
      title: 'Akun Dihapus!',
      message: `Akun pengelola "${user.username}" telah berhasil dihapus.`,
      type: 'success'
    });
  };

  // --- ORGANISASI CMS STATE ---
  const [selectedOrgIdForEdit, setSelectedOrgIdForEdit] = useState<string | null>(null);
  const [activeOrgSubTab, setActiveOrgSubTab] = useState<'sambutan' | 'pengurus' | 'visi-misi' | 'identitas'>('sambutan');
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [newOrgMissionText, setNewOrgMissionText] = useState('');
  const [orgForm, setOrgForm] = useState<EducationalOrganization | null>(null);

  // Organization CMS Pagination (6 item per halaman) & Search
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [orgCurrentPage, setOrgCurrentPage] = useState<number>(1);
  const orgItemsPerPage = 6;

  const filteredOrganizations = useMemo(() => {
    if (!orgSearchQuery.trim()) return displayedOrganizations;
    const q = orgSearchQuery.toLowerCase().trim();
    return displayedOrganizations.filter(
      (org) =>
        org.name.toLowerCase().includes(q) ||
        org.shortName.toLowerCase().includes(q) ||
        (org.description && org.description.toLowerCase().includes(q)) ||
        (org.leader?.name && org.leader.name.toLowerCase().includes(q)) ||
        (org.assignedUsername && org.assignedUsername.toLowerCase().includes(q))
    );
  }, [displayedOrganizations, orgSearchQuery]);

  const totalOrgPages = Math.max(1, Math.ceil(filteredOrganizations.length / orgItemsPerPage));

  useEffect(() => {
    if (orgCurrentPage > totalOrgPages) {
      setOrgCurrentPage(totalOrgPages);
    }
  }, [totalOrgPages, orgCurrentPage]);

  const paginatedOrganizations = useMemo(() => {
    const startIndex = (orgCurrentPage - 1) * orgItemsPerPage;
    return filteredOrganizations.slice(startIndex, startIndex + orgItemsPerPage);
  }, [filteredOrganizations, orgCurrentPage, orgItemsPerPage]);

  // New Organization Modal State
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    shortName: '',
    slug: '',
    description: '',
    assignedUsername: ''
  });

  // Official Modal State (Tambah/Edit Pengurus)
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [editingOfficialId, setEditingOfficialId] = useState<string | null>(null);
  const [officialForm, setOfficialForm] = useState<{
    name: string;
    role: string;
    nip: string;
    photo: string;
    division: string;
    order: number;
  }>({
    name: '',
    role: '',
    nip: '',
    photo: '',
    division: 'Pengurus Harian',
    order: 1
  });

  // Google Drive & Upload Refs for Organization
  const orgLogoInputRef = useRef<HTMLInputElement | null>(null);
  const orgLeaderPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const officialPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [orgLogoDriveInput, setOrgLogoDriveInput] = useState('');
  const [orgLeaderDriveInput, setOrgLeaderDriveInput] = useState('');
  const [officialPhotoDriveInput, setOfficialPhotoDriveInput] = useState('');

  // Sync orgForm when selectedOrgIdForEdit changes or organizations updates
  useEffect(() => {
    if (selectedOrgIdForEdit) {
      const found = organizations.find((o) => o.id === selectedOrgIdForEdit);
      if (found) {
        setOrgForm({ 
          ...found, 
          leader: { ...found.leader }, 
          missions: [...found.missions], 
          officials: [...(found.officials || [])],
          socialMedia: { ...(found.socialMedia || {}) }
        });
        setOrgLogoDriveInput(isGoogleDriveUrl(found.logo || '') ? found.logo || '' : '');
        setOrgLeaderDriveInput(isGoogleDriveUrl(found.leader?.photo || '') ? found.leader.photo || '' : '');
      }
    } else {
      setOrgForm(null);
    }
  }, [selectedOrgIdForEdit, organizations]);

  // Guard jika organisasi yang diedit bukan wewenang user non-admin
  useEffect(() => {
    if (!isAdminOrSuperAdmin && selectedOrgIdForEdit) {
      const org = organizations.find((o) => o.id === selectedOrgIdForEdit);
      if (!org || org.assignedUsername?.trim().toLowerCase() !== currentUser?.username?.trim().toLowerCase()) {
        setSelectedOrgIdForEdit(null);
      }
    }
  }, [isAdminOrSuperAdmin, selectedOrgIdForEdit, organizations, currentUser?.username]);

  const handleSelectOrgToEdit = (orgId: string) => {
    if (!isAdminOrSuperAdmin) {
      const org = organizations.find((o) => o.id === orgId);
      if (!org || org.assignedUsername?.trim().toLowerCase() !== currentUser?.username?.trim().toLowerCase()) {
        showToast('Anda tidak memiliki wewenang untuk mengelola organisasi ini.', 'error');
        return;
      }
    }
    setSelectedOrgIdForEdit(orgId);
    setActiveOrgSubTab('sambutan');
  };

  const handleSaveOrgCMS = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedOrgIdForEdit || !orgForm) return;

    if (!isAdminOrSuperAdmin && orgForm.assignedUsername?.trim().toLowerCase() !== currentUser?.username?.trim().toLowerCase()) {
      showToast('Anda tidak memiliki hak untuk menyimpan perubahan pada organisasi ini.', 'error');
      return;
    }

    if (!orgForm.name.trim() || !orgForm.shortName.trim()) {
      showToast('Nama organisasi dan singkatan wajib diisi!', 'error');
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Simpan Seluruh Perubahan Organisasi?',
      message: `Simpan seluruh data profil, sambutan ketua, visi-misi, dan ${orgForm.officials?.length || 0} susunan pengurus "${orgForm.name}" ke database?`,
      type: 'save',
      itemName: `${orgForm.name} (${orgForm.shortName})`,
      confirmText: 'Ya, Simpan Seluruhnya',
      cancelText: 'Tidak, Batal'
    });
    if (!confirmed) return;

    setIsSavingOrg(true);
    try {
      await updateOrganization(selectedOrgIdForEdit, orgForm);
      showNoticePopup({
        title: 'Perubahan Berhasil Disimpan!',
        message: `Seluruh data ${orgForm.name} berhasil disimpan dan disinkronkan ke website publik.`,
        type: 'success'
      });
    } catch (err) {
      showToast('Gagal menyimpan perubahan organisasi.', 'error');
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgForm) return;
    try {
      showToast('Memproses logo organisasi...', 'info');
      const dataUrl = await compressImage(file, 600, 0.85);
      setOrgForm(prev => prev ? { ...prev, logo: dataUrl } : null);
      setOrgLogoDriveInput('');
      showToast('Logo organisasi berhasil dipilih!', 'success');
    } catch {
      showToast('Gagal memproses logo organisasi.', 'error');
    }
  };

  const handleLeaderPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orgForm) return;
    try {
      showToast('Memproses foto ketua organisasi...', 'info');
      const dataUrl = await compressImage(file, 800, 0.82);
      setOrgForm(prev => prev ? {
        ...prev,
        leader: { ...prev.leader, photo: dataUrl }
      } : null);
      setOrgLeaderDriveInput('');
      showToast('Foto ketua berhasil dipilih!', 'success');
    } catch {
      showToast('Gagal memproses foto ketua.', 'error');
    }
  };

  const handleOfficialPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showToast('Memproses foto pengurus...', 'info');
      const dataUrl = await compressImage(file, 600, 0.82);
      setOfficialForm(prev => ({ ...prev, photo: dataUrl }));
      setOfficialPhotoDriveInput('');
      showToast('Foto pengurus berhasil dipilih!', 'success');
    } catch {
      showToast('Gagal memproses foto pengurus.', 'error');
    }
  };

  const handleAddOrgMission = () => {
    if (!newOrgMissionText.trim() || !orgForm) return;
    setOrgForm({
      ...orgForm,
      missions: [...orgForm.missions, newOrgMissionText.trim()]
    });
    setNewOrgMissionText('');
  };

  const handleRemoveOrgMission = (idx: number) => {
    if (!orgForm) return;
    setOrgForm({
      ...orgForm,
      missions: orgForm.missions.filter((_, i) => i !== idx)
    });
  };

  const handleOpenAddOfficial = () => {
    setEditingOfficialId(null);
    setOfficialForm({
      name: '',
      role: '',
      nip: '',
      photo: '',
      division: 'Pengurus Harian',
      order: (orgForm?.officials?.length || 0) + 1
    });
    setOfficialPhotoDriveInput('');
    setShowOfficialModal(true);
  };

  const handleOpenEditOfficial = (official: OrganizationOfficial) => {
    setEditingOfficialId(official.id);
    setOfficialForm({
      name: official.name,
      role: official.role,
      nip: official.nip || '',
      photo: official.photo || '',
      division: official.division || 'Pengurus Harian',
      order: typeof official.order === 'number' ? official.order : 1
    });
    setOfficialPhotoDriveInput(isGoogleDriveUrl(official.photo || '') ? official.photo || '' : '');
    setShowOfficialModal(true);
  };

  const handleSaveOfficialForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialForm.name.trim() || !officialForm.role.trim() || !orgForm || !selectedOrgIdForEdit) {
      showToast('Nama dan jabatan pengurus wajib diisi!', 'error');
      return;
    }

    if (editingOfficialId) {
      const confirmed = await showConfirmDialog({
        title: 'Konfirmasi Perubahan Pengurus',
        message: `Simpan pembaruan data untuk pengurus "${officialForm.name}"?`,
        type: 'edit',
        itemName: `${officialForm.name} - ${officialForm.role}`,
        confirmText: 'Ya, Perbarui Pengurus',
        cancelText: 'Tidak, Batalkan'
      });
      if (!confirmed) return;
    }

    const updatedOfficialList = [...(orgForm.officials || [])];
    if (editingOfficialId) {
      const idx = updatedOfficialList.findIndex(o => o.id === editingOfficialId);
      if (idx !== -1) {
        updatedOfficialList[idx] = {
          ...updatedOfficialList[idx],
          name: officialForm.name.trim(),
          role: officialForm.role.trim(),
          nip: officialForm.nip.trim(),
          photo: officialForm.photo,
          division: officialForm.division.trim(),
          order: Number(officialForm.order) || 1
        };
      }
    } else {
      updatedOfficialList.push({
        id: `off-${Date.now()}`,
        name: officialForm.name.trim(),
        role: officialForm.role.trim(),
        nip: officialForm.nip.trim(),
        photo: officialForm.photo,
        division: officialForm.division.trim(),
        order: Number(officialForm.order) || (updatedOfficialList.length + 1)
      });
    }

    setOrgForm({ ...orgForm, officials: updatedOfficialList });
    setShowOfficialModal(false);
    showNoticePopup({
      title: editingOfficialId ? 'Pengurus Diperbarui!' : 'Pengurus Ditambahkan!',
      message: `Data "${officialForm.name}" tersimpan dalam daftar pengurus. Klik "Simpan Seluruh Perubahan" untuk mempublikasikan.`,
      type: 'success'
    });
  };

  const handleDeleteOfficialItem = async (offId: string) => {
    if (!orgForm) return;
    const targetOfficial = orgForm.officials?.find(o => o.id === offId);
    const officialName = targetOfficial?.name || 'Pengurus ini';

    const confirmed = await showConfirmDialog({
      title: 'Hapus Pengurus Dari Daftar?',
      message: `Apakah Anda yakin ingin menghapus "${officialName}" dari daftar susunan pengurus ${orgForm.shortName}?`,
      type: 'delete',
      itemName: targetOfficial ? `${targetOfficial.name} (${targetOfficial.role})` : officialName,
      confirmText: 'Ya, Hapus Pengurus',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;

    const filtered = orgForm.officials.filter(o => o.id !== offId);
    setOrgForm({ ...orgForm, officials: filtered });
    showNoticePopup({
      title: 'Pengurus Dihapus!',
      message: `"${officialName}" telah dihapus dari daftar susunan pengurus.`,
      type: 'warning'
    });
  };

  const handleCreateNewOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgForm.name.trim() || !newOrgForm.shortName.trim()) {
      showToast('Nama organisasi dan singkatan wajib diisi!', 'error');
      return;
    }
    const cleanSlug = (newOrgForm.slug.trim() || newOrgForm.shortName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
    const createdOrg: EducationalOrganization = {
      id: `org-${Date.now()}`,
      slug: cleanSlug,
      name: newOrgForm.name.trim(),
      shortName: newOrgForm.shortName.trim(),
      description: newOrgForm.description.trim() || `Organisasi ${newOrgForm.name.trim()} Kecamatan Purwodadi`,
      logo: '',
      leader: {
        name: '',
        title: `Ketua ${newOrgForm.shortName.trim()}`,
        period: '',
        photo: '',
        speechTitle: '',
        speech: ''
      },
      vision: '',
      missions: [],
      officials: [],
      assignedUsername: newOrgForm.assignedUsername?.trim() || undefined,
      socialMedia: {
        website: '',
        tiktok: '',
        facebook: '',
        instagram: '',
        youtube: ''
      }
    };

    await addOrganization(createdOrg);
    setShowNewOrgModal(false);
    setNewOrgForm({ name: '', shortName: '', slug: '', description: '', assignedUsername: '' });
    setSelectedOrgIdForEdit(createdOrg.id);
    setActiveOrgSubTab('identitas');
    showNoticePopup({
      title: 'Organisasi Ditambahkan!',
      message: `Organisasi "${createdOrg.name}" berhasil dibuat. Silakan lengkapi data profil dan pengurusnya.`,
      type: 'success'
    });
  };

  const handleDeleteOrg = async (orgId: string, orgName: string) => {
    if (!isAdminOrSuperAdmin) {
      showToast('Hanya Super Admin dan Admin yang berhak menghapus organisasi!', 'error');
      return;
    }
    if (organizations.length <= 1) {
      showToast('Minimal harus ada 1 organisasi terdaftar di sistem!', 'error');
      return;
    }
    const confirmed = await showConfirmDialog({
      title: 'Hapus Organisasi Ini?',
      message: `Apakah Anda yakin ingin menghapus organisasi "${orgName}" beserta seluruh data sambutan, visi-misi, dan susunan pengurusnya? Tindakan ini permanen.`,
      type: 'delete',
      itemName: orgName,
      confirmText: 'Ya, Hapus Organisasi',
      cancelText: 'Tidak, Batalkan'
    });
    if (!confirmed) return;

    await deleteOrganization(orgId);
    if (selectedOrgIdForEdit === orgId) {
      setSelectedOrgIdForEdit(null);
    }
    showNoticePopup({
      title: 'Organisasi Dihapus!',
      message: `Organisasi "${orgName}" telah berhasil dihapus dari database.`,
      type: 'success'
    });
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
          
          {!isWriter && (
            <>
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
            </>
          )}

          <div className="pt-2 pb-1 px-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-t border-slate-100 pt-2">
              {isWriter ? 'Menu Akses Penulis:' : 'Kelola Halaman Publik:'}
            </span>
          </div>

          {/* Menu Khusus Super Admin & Admin */}
          {isAdminOrSuperAdmin && (
            <>
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

              {/* 2.5 SOP Pelayanan */}
              <button
                type="button"
                onClick={() => setCurrentSection('sop-cms')}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                  currentSection === 'sop-cms'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'sop-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'sop-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      SOP Pelayanan
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'sop-cms' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      Bagan Alur Google Drive
                    </span>
                  </div>
                </div>
                {sopImageUrl ? (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    currentSection === 'sop-cms' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  }`}>
                    Aktif
                  </span>
                ) : (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ml-1.5 ${
                    currentSection === 'sop-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    Kosong
                  </span>
                )}
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
                      Pangkalan Data SD, TK, KB
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'schools-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {schools.length}
                </span>
              </button>

              {/* 3.5. Nominatif Guru (Supabase) */}
              <button
                type="button"
                onClick={() => setCurrentSection('nominatif-cms')}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                  currentSection === 'nominatif-cms'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'nominatif-cms' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'nominatif-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Nominatif Guru
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'nominatif-cms' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      Daftar Pendidik Supabase
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'nominatif-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {teachers.length}
                </span>
              </button>
            </>
          )}

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
                  {isWriter ? 'Berita & Pengumuman Saya' : 'Berita & Surat Edaran'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'news-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {isWriter ? (displayedNews.length + displayedAnnouncements.length) : (news.length + announcements.length)}
            </span>
          </button>

          {/* 4.2. Kelola Prestasi Siswa & Guru */}
          <button
            type="button"
            onClick={() => setCurrentSection('achievements-cms')}
            className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
              currentSection === 'achievements-cms'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                currentSection === 'achievements-cms' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
              }`}>
                <Trophy className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0 text-left">
                <span className={`text-xs font-bold truncate leading-tight ${
                  currentSection === 'achievements-cms' ? 'text-white' : 'text-slate-800'
                }`}>
                  Kelola Prestasi
                </span>
                <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                  currentSection === 'achievements-cms' ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  {isAdminOrSuperAdmin ? 'Prestasi Siswa & Guru' : 'Prestasi Saya'}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
              currentSection === 'achievements-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {isAdminOrSuperAdmin ? achievements.length : displayedAchievements.length}
            </span>
          </button>

          {/* 4.5. Organisasi (Khusus Admin/Super Admin atau Akun yang Ditunjuk) */}
          {canAccessOrganizationCms && (
            <button
              type="button"
              onClick={() => setCurrentSection('organization-cms')}
              className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                currentSection === 'organization-cms'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  currentSection === 'organization-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className={`text-xs font-bold truncate leading-tight ${
                    currentSection === 'organization-cms' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Organisasi
                  </span>
                  <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                    currentSection === 'organization-cms' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {isAdminOrSuperAdmin ? 'PGRI, K3S, IGTKI, dsb.' : 'Kelola Organisasi'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                currentSection === 'organization-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {displayedOrganizations.length}
              </span>
            </button>
          )}

          {/* 4.8 & 5. Menu Khusus Super Admin & Admin */}
          {isAdminOrSuperAdmin && (
            <>
              {/* 4.8. Persyaratan Pelayanan */}
              <button
                type="button"
                onClick={() => {
                  setCurrentSection('service-requirements-cms');
                  setReqCategoryFilter('Semua');
                  setReqSearchQuery('');
                }}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                  currentSection === 'service-requirements-cms'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'service-requirements-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'service-requirements-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Persyaratan Pelayanan
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'service-requirements-cms' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      Standar Berkas & Layanan
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'service-requirements-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {serviceRequirements.length}
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

              {/* 5.5. Permintaan Data (Webview) */}
              <button
                type="button"
                onClick={() => setCurrentSection('data-request-cms')}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                  currentSection === 'data-request-cms'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'data-request-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                  }`}>
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'data-request-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Permintaan Data
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'data-request-cms' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      Form & Tautan Webview
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'data-request-cms' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {dataRequests.length}
                </span>
              </button>
            </>
          )}

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
              {isAdminOrSuperAdmin ? `${gallery.length} Album` : `${gallery.filter(isGalleryItemOwner).length} Album`}
            </span>
          </button>

          {/* 7. Kontak & Aduan (Khusus Super Admin & Admin) */}
          {isAdminOrSuperAdmin && (
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
          )}

          {/* 7.5. Media Sosial Resmi (Khusus Super Admin & Admin) */}
          {isAdminOrSuperAdmin && (
            <button
              type="button"
              onClick={() => setCurrentSection('social-media-cms')}
              className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                currentSection === 'social-media-cms'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  currentSection === 'social-media-cms' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className={`text-xs font-bold truncate leading-tight ${
                    currentSection === 'social-media-cms' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Media Sosial Resmi
                  </span>
                  <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                    currentSection === 'social-media-cms' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    Link & Akun Medsos
                  </span>
                </div>
              </div>
            </button>
          )}

          {/* 7.6. Broadcast Notifikasi (PWA OneSignal) */}
          {isAdminOrSuperAdmin && (
            <button
              type="button"
              onClick={() => setCurrentSection('broadcast-cms')}
              className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all ${
                currentSection === 'broadcast-cms'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  currentSection === 'broadcast-cms' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-600'
                }`}>
                  <Radio className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0 text-left">
                  <span className={`text-xs font-bold truncate leading-tight ${
                    currentSection === 'broadcast-cms' ? 'text-white' : 'text-slate-800'
                  }`}>
                    Broadcast Notifikasi
                  </span>
                  <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                    currentSection === 'broadcast-cms' ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    Kirim Notif ke HP PWA
                  </span>
                </div>
              </div>
            </button>
          )}

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

              {/* Menu Log Aktivitas (Google Spreadsheet) - Khusus Super Admin */}
              <button
                type="button"
                onClick={() => setCurrentSection('activity-log-cms')}
                className={`w-full text-left flex items-center justify-between p-2 rounded-xl transition-all mt-1 ${
                  currentSection === 'activity-log-cms'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    currentSection === 'activity-log-cms' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0 text-left">
                    <span className={`text-xs font-bold truncate leading-tight ${
                      currentSection === 'activity-log-cms' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Log Aktivitas
                    </span>
                    <span className={`text-[10px] truncate leading-tight mt-0.5 ${
                      currentSection === 'activity-log-cms' ? 'text-emerald-100' : 'text-slate-400'
                    }`}>
                      Google Spreadsheet
                    </span>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                  currentSection === 'activity-log-cms' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Live
                </span>
              </button>
            </>
          )}

          {/* Factory reset button (Khusus Super Admin) */}
          {currentUser?.role === 'Super Admin' && (
            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  const confirmed = await showConfirmDialog({
                    title: 'Reset Seluruh Data ke Setelan Pabrik?',
                    message: 'Apakah Anda yakin ingin mereset seluruh data website kembali ke data bawaan awal pabrik? Seluruh perubahan lokal akan dikembalikan.',
                    type: 'danger',
                    confirmText: 'Ya, Reset Semua Data',
                    cancelText: 'Tidak, Batalkan'
                  });
                  if (!confirmed) return;
                  resetToDefaultData();
                  showNoticePopup({
                    title: 'Reset Berhasil!',
                    message: 'Seluruh data telah berhasil dikembalikan ke pengaturan awal pabrik.',
                    type: 'warning'
                  });
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
          {currentUser?.role === 'Penulis' && currentSection !== 'overview' && currentSection !== 'news-cms' && currentSection !== 'gallery-cms' && currentSection !== 'achievements-cms' && !(currentSection === 'organization-cms' && canAccessOrganizationCms) ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 max-w-lg mx-auto my-12 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Hak Akses Terbatas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Akun Anda memiliki role <strong className="text-emerald-700">Penulis</strong>. Wewenang akun Penulis difokuskan untuk menulis dan mengelola pada menu <strong>Warta & Informasi</strong>, <strong>Kelola Prestasi</strong>, <strong>Galeri Kegiatan</strong>{canAccessOrganizationCms ? ', serta Organisasi yang ditugaskan kepada Anda' : ''}.
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => setCurrentSection('news-cms')}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md hover:bg-blue-700 transition-all"
                >
                  Buka Menu Warta & Informasi
                </button>
                <button
                  onClick={() => setCurrentSection('achievements-cms')}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs shadow-md hover:bg-amber-700 transition-all"
                >
                  Buka Menu Prestasi
                </button>
                <button
                  onClick={() => setCurrentSection('gallery-cms')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs shadow-md hover:bg-slate-900 transition-all"
                >
                  Buka Menu Galeri Kegiatan
                </button>
                {canAccessOrganizationCms && (
                  <button
                    onClick={() => setCurrentSection('organization-cms')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 transition-all"
                  >
                    Buka Menu Organisasi
                  </button>
                )}
              </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div 
                  onClick={() => setCurrentSection('news-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Warta Berita</span>
                  <div className="text-3xl font-extrabold text-blue-600">{news.length}</div>
                  <span className="text-[11px] text-slate-400">Artikel aktif</span>
                </div>

                <div 
                  onClick={() => setCurrentSection('achievements-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Prestasi</span>
                  <div className="text-3xl font-extrabold text-amber-500">{achievements.length}</div>
                  <span className="text-[11px] text-slate-400">Siswa & Guru</span>
                </div>

                <div 
                  onClick={() => setCurrentSection('schools-cms')}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                >
                  <span className="text-xs font-bold text-slate-500 uppercase">Satuan Sekolah</span>
                  <div className="text-3xl font-extrabold text-indigo-600">{schools.length}</div>
                  <span className="text-[11px] text-slate-400">SD, TK, & KB</span>
                </div>

                {canAccessOrganizationCms && (
                  <div 
                    onClick={() => setCurrentSection('organization-cms')}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all"
                  >
                    <span className="text-xs font-bold text-slate-500 uppercase">Organisasi</span>
                    <div className="text-3xl font-extrabold text-amber-600">{displayedOrganizations.length}</div>
                    <span className="text-[11px] text-slate-400">Mitra & Profesi</span>
                  </div>
                )}

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
                          onClick={async () => {
                            setIsExporting(true);
                            const success = await refreshFromSupabase(true);
                            setIsExporting(false);
                            if (success) {
                              showToast('Data terbaru dari database Supabase Cloud berhasil dimuat!', 'success');
                            } else {
                              showToast('Gagal menarik data dari Supabase.', 'error');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                          title="Tarik dan perbarui data tampilan web langsung dari database Supabase Cloud"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isExporting ? 'animate-spin' : ''}`} />
                          <span>{isExporting ? 'Memuat...' : 'Muat dari Supabase'}</span>
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
                    { id: 'home-cms', title: 'Halaman Beranda', desc: 'Ubah teks headline, subtitle hero, badge, dan semboyan instansi', icon: Home, color: 'text-blue-600 bg-blue-50' },
                    { id: 'profile-cms', title: 'Halaman Profil', desc: 'Ubah visi misi, sambutan korwil, dan daftar pengawas/penilik', icon: Building2, color: 'text-indigo-600 bg-indigo-50' },
                    { id: 'sop-cms', title: 'SOP Pelayanan', desc: 'Atur tautan alur bagan SOP pelayanan via file Google Drive', icon: FileCheck2, color: 'text-teal-600 bg-teal-50' },
                    { id: 'schools-cms', title: 'Direktori Sekolah', desc: 'Tambah/edit data SD, TK, KB, NPSN, akreditasi, dan kepsek', icon: GraduationCap, color: 'text-sky-600 bg-sky-50' },
                    { id: 'nominatif-cms', title: 'Nominatif Guru', desc: 'Kelola data nominatif seluruh guru PNS, PPPK, Guru TK & Guru KB di Supabase', icon: Users, color: 'text-emerald-600 bg-emerald-50' },
                    { id: 'news-cms', title: 'Warta & Informasi', desc: 'Kelola artikel berita, surat edaran penting, dan agenda kegiatan', icon: FileText, color: 'text-amber-600 bg-amber-50' },
                    ...(canAccessOrganizationCms ? [{ id: 'organization-cms', title: 'Organisasi', desc: 'Atur sambutan ketua, daftar pengurus, dan visi misi organisasi mitra (PGRI, K3S, IGTKI, dsb.)', icon: Users, color: 'text-amber-600 bg-amber-50' }] : []),
                    { id: 'service-requirements-cms', title: 'Persyaratan Pelayanan', desc: 'Atur standar berkas persyaratan pelayanan pendidikan dan kepegawaian', icon: ClipboardList, color: 'text-blue-600 bg-blue-50' },
                    { id: 'downloads-cms', title: 'Layanan Unduhan', desc: 'Kelola modul ajar Kurikulum Merdeka, blanko SKP, dan formulir', icon: Download, color: 'text-emerald-600 bg-emerald-50' },
                    { id: 'data-request-cms', title: 'Permintaan Data', desc: 'Kelola formulir dan tautan webview permintaan data kedinasan', icon: Database, color: 'text-blue-600 bg-blue-50' },
                    { id: 'gallery-cms', title: 'Galeri Kegiatan', desc: 'Upload foto dokumentasi kegiatan belajar, lomba, dan upacara', icon: ImageIcon, color: 'text-purple-600 bg-purple-50' },
                    { id: 'contact-cms', title: 'Kontak & Pengaduan', desc: 'Ubah alamat, telepon, WhatsApp, dan cek kotak masuk aspirasi', icon: Phone, color: 'text-rose-600 bg-rose-50' },
                    ...(isAdminOrSuperAdmin ? [{ id: 'social-media-cms', title: 'Media Sosial Resmi', desc: 'Atur tautan akun medsos, status aktif, dan statistik pengikut untuk halaman publik', icon: Share2, color: 'text-blue-600 bg-blue-50' }] : []),
                    ...(isAdminOrSuperAdmin ? [{ id: 'broadcast-cms', title: 'Broadcast Notifikasi', desc: 'Siarkan notifikasi langsung ke layar HP & komputer pengguna yang menginstal aplikasi web', icon: Radio, color: 'text-amber-600 bg-amber-50' }] : [])
                  ].map((menu, i) => {
                    const Icon = menu.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => {
                          if (menu.id === 'service-requirements-cms') {
                            setReqCategoryFilter('Semua');
                            setReqSearchQuery('');
                          }
                          setCurrentSection(menu.id as AdminSection);
                        }}
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
                  <label className="text-xs font-bold text-slate-700">Tagline / Semboyan Instansi</label>
                  <input
                    type="text"
                    value={homeForm.tagline}
                    onChange={(e) => setHomeForm({ ...homeForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* SECTION: Latar Belakang Slide Show Foto (Google Drive) */}
                <div className="pt-5 border-t border-slate-200/80 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                        <Images className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                          <span>Latar Belakang Slide Show Foto (Google Drive)</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                            {homeForm.heroSlideshowImages?.length || 0} Foto Aktif
                          </span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          Background biru di beranda depan akan menampilkan perputaran foto dokumentasi secara otomatis.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1. Input Link Folder Google Drive */}
                  <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Folder className="w-4 h-4 text-blue-600" />
                        <span>Link Folder Gambar Google Drive</span>
                      </label>
                      {homeForm.heroDriveFolderUrl && (
                        <a
                          href={homeForm.heroDriveFolderUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 hover:underline"
                        >
                          <span>Buka Folder di Google Drive</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Masukkan tautan folder Google Drive tempat foto-foto kegiatan disimpan. Pastikan akses sharing diatur ke <b>&quot;Siapa saja yang memiliki link (Anyone with the link)&quot;</b>.
                    </p>
                    <div className="relative">
                      <input
                        type="url"
                        value={homeForm.heroDriveFolderUrl}
                        onChange={(e) => setHomeForm({ ...homeForm, heroDriveFolderUrl: e.target.value })}
                        placeholder="Contoh: https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9?usp=sharing"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-blue-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm font-mono"
                      />
                      <Folder className="w-4 h-4 text-blue-500 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* 2. Pengelola Foto Slide Show */}
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Daftar Foto yang Ditampilkan pada Slide Show</h4>
                        <p className="text-[11px] text-slate-500">
                          Tambahkan link foto dari Google Drive untuk ditampilkan bergantian pada latar belakang beranda.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsBatchMode(!isBatchMode)}
                        className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-[11px] font-semibold transition-all cursor-pointer"
                      >
                        {isBatchMode ? '← Mode Input Satuan' : '📋 Tempel Banyak Link Sekaligus'}
                      </button>
                    </div>

                    {/* Form Tambah Foto */}
                    {isBatchMode ? (
                      <div className="space-y-2.5 p-3.5 bg-white rounded-xl border border-slate-200 shadow-inner">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Tempel Beberapa Link Foto Google Drive Sekaligus (Satu link per baris):
                        </label>
                        <textarea
                          rows={4}
                          value={batchSlideText}
                          onChange={(e) => setBatchSlideText(e.target.value)}
                          placeholder="https://drive.google.com/file/d/1ABC.../view&#10;https://drive.google.com/file/d/2XYZ.../view"
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">Sistem otomatis mendeteksi ID file dari link Google Drive.</span>
                          <button
                            type="button"
                            onClick={handleAddBatchSlides}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Ekstrak & Tambahkan Semua</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={newSlideUrl}
                            onChange={(e) => setNewSlideUrl(e.target.value)}
                            placeholder="Tempel link foto Google Drive (Contoh: https://drive.google.com/file/d/1.../view)"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSlide}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Foto</span>
                        </button>
                      </div>
                    )}

                    {/* Galeri Thumbnail Foto Slide Show */}
                    {homeForm.heroSlideshowImages && homeForm.heroSlideshowImages.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                        {homeForm.heroSlideshowImages.map((imgUrl, idx) => {
                          const displaySrc = formatGoogleDriveImageUrl(imgUrl) || imgUrl;
                          return (
                            <div
                              key={idx}
                              className="group/slide relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                            >
                              {/* Thumbnail Container */}
                              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                                <img
                                  src={displaySrc}
                                  alt={`Slide ${idx + 1}`}
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  className="w-full h-full object-cover group-hover/slide:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.style.opacity = '0.3';
                                  }}
                                />
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white shadow">
                                  Slide #{idx + 1}
                                </div>
                              </div>

                              {/* Action Bar */}
                              <div className="p-2 bg-white flex items-center justify-between border-t border-slate-100">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => handleMoveSlide(idx, 'left')}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
                                    title="Geser Mundur"
                                  >
                                    <ChevronLeft className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === (homeForm.heroSlideshowImages?.length || 0) - 1}
                                    onClick={() => handleMoveSlide(idx, 'right')}
                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
                                    title="Geser Maju"
                                  >
                                    <ChevronRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlide(idx)}
                                  className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 text-[10px] transition-colors cursor-pointer"
                                  title="Hapus foto dari slide show"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 text-center bg-white rounded-xl border border-dashed border-slate-300">
                        <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 font-medium">Belum ada foto slide show yang aktif.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Tambahkan foto di atas agar latar belakang beranda berputar otomatis.</p>
                      </div>
                    )}

                    {/* Setting Durasi Pergantian Slide */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-slate-500" />
                        <label className="text-xs font-bold text-slate-700">Durasi Pergantian Slide Otomatis:</label>
                      </div>
                      <select
                        value={homeForm.heroSlideshowInterval || 5}
                        onChange={(e) => setHomeForm({ ...homeForm, heroSlideshowInterval: Number(e.target.value) })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      >
                        <option value={3}>3 Detik (Cepat)</option>
                        <option value={5}>5 Detik (Standar / Ideal)</option>
                        <option value={7}>7 Detik (Santai)</option>
                        <option value={10}>10 Detik (Lambat)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
                  Atur sambutan resmi pimpinan, rumusan visi & misi, serta daftar pengawas SD dan penilik KB/TK.
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
                    <div className="relative group shrink-0 w-20 h-24 sm:w-24 sm:h-28 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                      {profileForm.korwilPhoto && !profileForm.korwilPhoto.includes('unsplash.com') ? (
                        <img
                          src={profileForm.korwilPhoto}
                          alt="Foto Pimpinan"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                          <User className="w-8 h-8 text-slate-400" />
                          <span className="text-[9px] font-bold mt-1 text-slate-500">Pimpinan</span>
                        </div>
                      )}
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
                  disabled={isSavingProfile}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isSavingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Database Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Perubahan Sambutan & Visi-Misi ke Database</span>
                    </>
                  )}
                </button>
              </form>

              {/* Jajaran Pejabat / Pengawas / Penilik CRUD */}
              <div id="staff-form-container" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>Kelola Pejabat, Pengawas SD & Penilik KB/TK</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Semua data pejabat, pengawas, dan staf kantor beserta pas foto otomatis tersimpan di Supabase Cloud dan tampil real-time di halaman profil publik.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <Database className="w-3.5 h-3.5" />
                      <span>Supabase Cloud ({staff.length} Pegawai)</span>
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSyncingStaff(true);
                        try {
                          await refreshFromSupabase(true);
                          showToast('Data staf & foto berhasil dimuat ulang langsung dari Supabase Cloud!', 'success');
                        } finally {
                          setIsSyncingStaff(false);
                        }
                      }}
                      disabled={isSyncingStaff}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-50"
                      title="Tarik ulang data staf terbaru langsung dari database Supabase"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingStaff ? 'animate-spin text-blue-600' : ''}`} />
                      <span>{isSyncingStaff ? 'Menyinkronkan...' : 'Refresh Supabase'}</span>
                    </button>
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
                        <option value="Pimpinan Korwilcam Purwodadi">Pimpinan Korwilcam Purwodadi</option>
                        <option value="Pengawas SD">Pengawas SD</option>
                        <option value="Pengawas TK">Pengawas TK</option>
                        <option value="Penilik KB">Penilik KB</option>
                        <option value="Staf">Staf</option>
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
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Otomatis Disimpan ke Database Supabase
                      </span>
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3.5">
                      {/* Preview Avatar */}
                      <div className="relative group shrink-0 w-16 h-20 rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center">
                        {staffForm.photo && !staffForm.photo.includes('unsplash.com') ? (
                          <img
                            src={staffForm.photo}
                            alt="Foto Pegawai"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 gap-0.5">
                            <User className="w-6 h-6 text-slate-400" />
                            <span className="text-[8px] font-semibold text-slate-400">Pas Foto</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => staffPhotoInputRef.current?.click()}
                          className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Ganti</span>
                        </button>
                      </div>

                      {/* Controls */}
                      <div className="flex-1 space-y-1.5 text-center sm:text-left">
                        <p className="text-xs text-slate-500">
                          Upload pas foto resmi pegawai langsung dari komputer / laptop Anda (format JPG, PNG). Foto akan dikompresi otomatis agar ringan dan cepat diakses publik.
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
                              <CheckCircle2 className="w-3 h-3" /> Foto pegawai siap disimpan ke Supabase
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
                        <input
                          ref={quickStaffPhotoInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleQuickStaffPhotoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingStaff}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-2 disabled:opacity-60 transition-all"
                    >
                      {isSavingStaff ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Menyimpan ke Supabase Cloud...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>{editingStaffId ? 'Simpan Perubahan ke Supabase' : 'Tambah Pejabat/Staf & Simpan ke Supabase'}</span>
                        </>
                      )}
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
                            photo: '',
                            division: 'Pengawas SD'
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
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
                        <th className="p-3">Status Cloud</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staff.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-400">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-xs text-slate-600">Belum ada data pejabat atau pegawai tersimpan di database.</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Gunakan formulir di atas untuk menambahkan pejabat/staf baru beserta pas foto resmi.</p>
                          </td>
                        </tr>
                      ) : (
                        staff.map((st) => (
                          <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-100 flex items-center justify-center relative">
                                {st.photo && !st.photo.includes('unsplash.com') ? (
                                  <img
                                    src={st.photo}
                                    alt={st.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const sibling = e.currentTarget.nextElementSibling;
                                      if (sibling) (sibling as HTMLElement).classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 ${st.photo && !st.photo.includes('unsplash.com') ? 'hidden' : 'flex'}`}>
                                  <User className="w-4 h-4 text-slate-400" />
                                </div>
                              </div>
                              <span className="font-bold text-slate-900">{st.name}</span>
                            </td>
                            <td className="p-3">{st.role}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                st.division === 'Pimpinan Korwilcam Purwodadi' || st.division === 'Pimpinan'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : st.division === 'Pengawas SD'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : st.division === 'Pengawas TK'
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                  : st.division === 'Penilik KB' || st.division === 'Penilik KB/TK' || st.division === 'Penilik PAUD' || st.division === 'Penilik PAUD/TK'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {st.division === 'Penilik PAUD' || st.division === 'Penilik PAUD/TK' || st.division === 'Penilik KB/TK' ? 'Penilik KB' : st.division}
                              </span>
                            </td>
                            <td className="p-3 font-mono">{st.nip || '-'}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Tersimpan di Cloud</span>
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    quickUploadStaffIdRef.current = st.id;
                                    setQuickUploadStaffId(st.id);
                                    quickStaffPhotoInputRef.current?.click();
                                  }}
                                  className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1 font-bold text-[11px]"
                                  title={`Upload / Ganti pas foto untuk ${st.name} langsung ke Supabase`}
                                >
                                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Foto</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingStaffId(st.id);
                                    setStaffForm({
                                      name: st.name,
                                      role: st.role,
                                      nip: st.nip || '',
                                      photo: st.photo,
                                      division: (
                                        st.division === 'Pimpinan' ? 'Pimpinan Korwilcam Purwodadi' :
                                        (st.division === 'Penilik PAUD/TK' || st.division === 'Penilik PAUD' || st.division === 'Penilik KB/TK') ? 'Penilik KB' :
                                        st.division === 'Tata Usaha' ? 'Staf' :
                                        (st.division as StaffDivision)
                                      )
                                    });
                                    document.getElementById('staff-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                  title="Edit data staf"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const confirmed = await showConfirmDialog({
                                      title: 'Hapus Data Pejabat / Staf?',
                                      message: `Apakah Anda yakin ingin menghapus data "${st.name}" (${st.role}) dari struktur organisasi?`,
                                      type: 'delete',
                                      itemName: `${st.name} - ${st.role}`,
                                      confirmText: 'Ya, Hapus Staf',
                                      cancelText: 'Tidak, Batalkan'
                                    });
                                    if (!confirmed) return;
                                    await deleteStaff(st.id);
                                    showNoticePopup({
                                      title: 'Data Staf Dihapus!',
                                      message: `Data "${st.name}" telah berhasil dihapus.`,
                                      type: 'success'
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                  title="Hapus data staf"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2.5: KELOLA SOP PELAYANAN */}
          {currentSection === 'sop-cms' && (
            <div className="space-y-6 max-w-5xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <FileCheck2 className="w-6 h-6 text-blue-600" />
                    <span>Kelola SOP Pelayanan & Bagan Alur</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Simpan tautan bagan gambar Standar Operasional Prosedur (SOP) Pelayanan. Mendukung tautan gambar langsung dan file dari Google Drive.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('sop-pelayanan', '/sop-pelayanan')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    title="Buka halaman SOP Pelayanan di website publik"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lihat di Web Depan</span>
                  </button>
                </div>
              </div>

              {/* Panduan Google Drive Card */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-2xl p-5 border border-blue-200/80 shadow-sm space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                      Panduan Menggunakan Tautan Gambar dari Google Drive:
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem kami sudah dilengkapi <strong>fitur auto-converter cerdas</strong>. Anda cukup menyalin tautan berbagi (*share link*) dari Google Drive, dan sistem otomatis mengubahnya menjadi tampilan gambar bagan utuh beresolusi tinggi di website.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-slate-600 border-t border-blue-100">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                    <span>Upload foto/diagram bagan SOP ke <strong>Google Drive</strong> Anda.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    <span>Klik <strong>Bagikan (Share)</strong>, ubah Akses Umum menjadi <strong className="text-blue-700">"Siapa saja yang memiliki link"</strong> (Viewer).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                    <span>Salin link tersebut (*Copy link*), lalu tempelkan pada kolom formulir di bawah ini.</span>
                  </div>
                </div>
              </div>

              {/* Form Simpan Tautan SOP */}
              <form onSubmit={handleSaveSopCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tautan Gambar Bagan SOP (Google Drive / Web URL) *</span>
                    </label>
                    {sopInputUrl && isGoogleDriveUrl(sopInputUrl) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Tautan Google Drive Terdeteksi</span>
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type="url"
                      required
                      value={sopInputUrl}
                      onChange={(e) => {
                        setSopInputUrl(e.target.value);
                        setSopPreviewError(false);
                      }}
                      placeholder="Contoh: https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9/view?usp=sharing"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none transition-all pr-10"
                    />
                    {sopInputUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSopInputUrl('');
                          setSopPreviewError(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                        title="Kosongkan input"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2 pt-1">
                    <span>
                      {sopInputUrl && isGoogleDriveUrl(sopInputUrl)
                        ? 'URL Google Drive otomatis dikonversi ke gambar beresolusi tinggi.'
                        : 'Mendukung format tautan Google Drive, link file gambar langsung (JPG, PNG, WebP), maupun Base64.'}
                    </span>
                    {isGoogleDriveUrl(sopInputUrl) && (
                      <a
                        href={getGoogleDriveViewUrl(sopInputUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>Uji Buka File Asli</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isSavingSop || !sopInputUrl.trim()}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingSop ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSavingSop ? 'Menyimpan...' : 'Simpan SOP Pelayanan ke Database'}</span>
                    </button>

                    {sopImageUrl && (
                      <button
                        type="button"
                        disabled={isSavingSop}
                        onClick={handleClearSop}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                        title="Hapus tautan SOP yang tersimpan"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Hapus SOP</span>
                      </button>
                    )}
                  </div>

                  {sopImageUrl && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tersinkron di Supabase Cloud</span>
                    </span>
                  )}
                </div>
              </form>

              {/* TAMPILAN PREVIEW GAMBAR (Di bawah Form) */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span>Tampilan Preview Gambar SOP (Pratinjau Langsung)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pratinjau ini merepresentasikan tampilan gambar utuh yang akan dilihat oleh masyarakat di halaman depan website.
                    </p>
                  </div>

                  {sopInputUrl && (
                    <span className="text-[11px] font-semibold text-slate-500 self-start sm:self-auto bg-slate-100 px-2.5 py-1 rounded-lg">
                      Mode: Gambar Utuh (Object Contain)
                    </span>
                  )}
                </div>

                {/* Container Gambar Pratinjau */}
                {sopInputUrl ? (
                  <div className="space-y-3">
                    <div className="relative bg-slate-950/5 rounded-2xl border-2 border-dashed border-slate-300/80 p-3 sm:p-6 flex items-center justify-center min-h-[350px] overflow-hidden group">
                      {sopPreviewError ? (
                        <div className="py-10 px-4 text-center max-w-md space-y-3">
                          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
                          <h4 className="text-sm font-bold text-slate-800">
                            Pratinjau Gambar Tidak Dapat Dimuat
                          </h4>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Pastikan tautan dapat diakses publik. Jika menggunakan Google Drive, periksa menu <strong>Bagikan &gt; Akses Umum &gt; Siapa saja yang memiliki link (Anyone with the link)</strong>.
                          </p>
                          {isGoogleDriveUrl(sopInputUrl) && (
                            <a
                              href={getGoogleDriveViewUrl(sopInputUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                            >
                              <span>Buka File di Google Drive</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <img
                          src={formatGoogleDriveImageUrl(sopInputUrl)}
                          referrerPolicy="no-referrer"
                          alt="Pratinjau Bagan SOP Pelayanan"
                          className="max-h-[550px] w-auto max-w-full object-contain rounded-xl shadow-md transition-all"
                          onError={() => setSopPreviewError(true)}
                          onLoad={() => setSopPreviewError(false)}
                        />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 px-1">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Gambar utuh berhasil dimuat dengan resolusi tinggi</span>
                      </span>
                      <span>
                        Format Embed: <code className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{formatGoogleDriveImageUrl(sopInputUrl).substring(0, 45)}...</code>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-4 text-center max-w-md mx-auto space-y-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                        Belum Ada Link Gambar SOP
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Masukkan tautan Google Drive atau URL gambar bagan SOP Anda pada formulir di atas untuk melihat pratinjau langsung di sini.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: KELOLA SEKOLAH */}
          {currentSection === 'schools-cms' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Kelola Direktori Sekolah (SD / TK / KB)
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
                      <option value="KB">KB (Kelompok Bermain)</option>
                      <option value="PAUD">KB (Kelompok Bermain - DB)</option>
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

                {/* Upload Foto Profil / Gedung Sekolah & Google Drive Link */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Foto Profil / Gedung Sekolah</span>
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Disimpan ke Kolom "image" Supabase
                    </span>
                  </label>

                  <div className="flex flex-col md:flex-row items-start gap-5">
                    {/* Preview Image */}
                    <div className="relative group shrink-0 mx-auto md:mx-0">
                      {schoolForm.image && !schoolForm.image.includes('photo-1580582932707') ? (
                        <div className="relative">
                          <img
                            src={isGoogleDriveUrl(schoolForm.image) ? formatGoogleDriveImageUrl(schoolForm.image) : schoolForm.image}
                            alt="Foto Sekolah"
                            referrerPolicy="no-referrer"
                            className="w-40 h-28 sm:w-48 sm:h-32 object-cover rounded-xl border-2 border-white shadow-md bg-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => schoolPhotoInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold gap-1"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Ganti Berkas</span>
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => schoolPhotoInputRef.current?.click()}
                          className="w-40 h-28 sm:w-48 sm:h-32 rounded-xl border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 cursor-pointer flex flex-col items-center justify-center text-slate-400 gap-1.5 shadow-sm transition-colors"
                        >
                          <Building2 className="w-8 h-8 text-slate-400" />
                          <span className="text-[11px] font-medium text-slate-500">Belum ada foto</span>
                        </div>
                      )}
                    </div>

                    {/* Inputs & Controls */}
                    <div className="flex-1 w-full space-y-3.5">
                      {/* Form Link Google Drive */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-blue-800">
                            <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                            Link Foto Google Drive:
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (Opsional jika tidak upload file)
                          </span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={schoolDriveInput || (isGoogleDriveUrl(schoolForm.image) ? schoolForm.image : '')}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSchoolDriveInput(val);
                              if (val.trim()) {
                                setSchoolForm((prev) => ({ ...prev, image: val.trim() }));
                              } else if (isGoogleDriveUrl(schoolForm.image)) {
                                setSchoolForm((prev) => ({ ...prev, image: '' }));
                              }
                            }}
                            placeholder="Contoh: https://drive.google.com/file/d/.../view?usp=sharing"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                          />
                          {(schoolDriveInput || (isGoogleDriveUrl(schoolForm.image) && schoolForm.image)) && (
                            <button
                              type="button"
                              onClick={() => {
                                setSchoolDriveInput('');
                                setSchoolForm((prev) => ({ ...prev, image: '' }));
                              }}
                              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs font-semibold"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal">
                          💡 <em>Tips:</em> Bagikan file gambar dari Google Drive, lalu pastikan opsi berbagi disetel ke <strong>"Siapa saja yang memiliki link (Anyone with the link)"</strong>.
                        </p>
                      </div>

                      {/* Divider */}
                      <div className="relative flex items-center justify-center">
                        <div className="border-t border-slate-200 w-full"></div>
                        <span className="bg-slate-50 px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                          atau upload langsung dari komputer
                        </span>
                        <div className="border-t border-slate-200 w-full"></div>
                      </div>

                      {/* Upload Dokumen & Tombol Hapus */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => schoolPhotoInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                          <span>Pilih Foto dari Dokumen Komputer</span>
                        </button>

                        {schoolForm.image && (
                          <button
                            type="button"
                            onClick={() => {
                              setSchoolForm((prev) => ({ ...prev, image: '' }));
                              setSchoolDriveInput('');
                            }}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Foto</span>
                          </button>
                        )}
                      </div>

                      {/* Status Information */}
                      {schoolForm.image && (
                        <div className="pt-1">
                          {isGoogleDriveUrl(schoolForm.image) ? (
                            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1.5 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200/80 inline-flex">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> 
                              Link Google Drive terhubung & otomatis dikonversi ke gambar kartu
                            </span>
                          ) : schoolForm.image.startsWith('data:') ? (
                            <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 bg-emerald-50/80 px-2.5 py-1 rounded-lg border border-emerald-200/80 inline-flex">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 
                              Berkas foto dokumen siap diupload ke database
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-flex">
                              <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" /> 
                              Foto sekolah aktif
                            </span>
                          )}
                        </div>
                      )}

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
                      onClick={() => {
                        setEditingSchoolId(null);
                        setSchoolDriveInput('');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      Daftar Sekolah ({filteredSchools.length} Satuan)
                    </span>
                    {schoolSearchQuery && (
                      <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
                        Hasil Filter (Total: {schools.length})
                      </span>
                    )}
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => {
                        setSchoolSearchQuery(e.target.value);
                        setSchoolCurrentPage(1);
                      }}
                      placeholder="Cari nama sekolah, NPSN, kepala sekolah..."
                      className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                    />
                    {schoolSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSchoolSearchQuery('');
                          setSchoolCurrentPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title="Hapus pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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
                      {paginatedSchools.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Building2 className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                              <p className="font-semibold text-slate-600 text-sm">
                                {schools.length === 0
                                  ? 'Belum ada data sekolah terdaftar.'
                                  : 'Tidak ada sekolah yang sesuai dengan pencarian.'}
                              </p>
                              {schoolSearchQuery && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSchoolSearchQuery('');
                                    setSchoolCurrentPage(1);
                                  }}
                                  className="text-xs text-blue-600 hover:underline font-semibold"
                                >
                                  Reset Pencarian
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedSchools.map((item) => (
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
                                    setSchoolDriveInput(item.image && isGoogleDriveUrl(item.image) ? item.image : '');
                                  }}
                                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const confirmed = await showConfirmDialog({
                                      title: 'Hapus Data Sekolah?',
                                      message: `Apakah Anda yakin ingin menghapus data "${item.name}" dari direktori sekolah?`,
                                      type: 'delete',
                                      itemName: item.name,
                                      confirmText: 'Ya, Hapus Sekolah',
                                      cancelText: 'Tidak, Batalkan'
                                    });
                                    if (!confirmed) return;
                                    deleteSchool(item.id);
                                    showNoticePopup({
                                      title: 'Data Sekolah Dihapus!',
                                      message: `Data sekolah "${item.name}" telah berhasil dihapus.`,
                                      type: 'success'
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* School Pagination Controls */}
                {totalSchoolPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-xs text-slate-500">
                      Menampilkan{' '}
                      <strong className="text-slate-800">
                        {filteredSchools.length > 0 ? (schoolCurrentPage - 1) * schoolItemsPerPage + 1 : 0}
                      </strong>{' '}
                      -{' '}
                      <strong className="text-slate-800">
                        {Math.min(filteredSchools.length, schoolCurrentPage * schoolItemsPerPage)}
                      </strong>{' '}
                      dari <strong className="text-slate-800">{filteredSchools.length}</strong> sekolah (Halaman{' '}
                      <strong className="text-slate-800">{schoolCurrentPage}</strong> dari{' '}
                      <strong className="text-slate-800">{totalSchoolPages}</strong>)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setSchoolCurrentPage(1)}
                        disabled={schoolCurrentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Pertama"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSchoolCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={schoolCurrentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalSchoolPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalSchoolPages > 5 && schoolCurrentPage > 3) {
                            pageNum = Math.min(schoolCurrentPage - 2 + i, totalSchoolPages - (4 - i));
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setSchoolCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                schoolCurrentPage === pageNum
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setSchoolCurrentPage((p) => Math.min(totalSchoolPages, p + 1))}
                        disabled={schoolCurrentPage === totalSchoolPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSchoolCurrentPage(totalSchoolPages)}
                        disabled={schoolCurrentPage === totalSchoolPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Terakhir"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3.5: KELOLA NOMINATIF GURU (SUPABASE) */}
          {currentSection === 'nominatif-cms' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Users className="w-6 h-6 text-emerald-600" />
                    <span>Kelola Daftar Nominatif Guru</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pangkalan data nominatif seluruh guru di wilayah Korwilcam Purwodadi yang tersimpan di tabel Supabase <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-600 font-mono text-[11px]">daftar_guru</code>.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Total {teachers.length} Guru</span>
                  </div>
                  {isSupabaseActive && (
                    <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-semibold">
                      Cloud Sync Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Form Tambah / Edit Guru */}
              <form onSubmit={handleSaveTeacher} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      {editingTeacherId ? '✎' : '+'}
                    </div>
                    <span>{editingTeacherId ? 'Edit Data Nominatif Guru' : 'Tambah Data Guru Baru ke Supabase'}</span>
                  </div>
                  {editingTeacherId && (
                    <span className="text-[11px] bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-md font-semibold">
                      Mode Edit Aktif
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* No Urut */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">No. Urut</label>
                    <input
                      type="number"
                      min="1"
                      value={teacherForm.no || ''}
                      onChange={(e) => setTeacherForm({ ...teacherForm, no: parseInt(e.target.value, 10) || 0 })}
                      placeholder="Auto"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Nama Lengkap */}
                  <div className="sm:col-span-5 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      required
                      value={teacherForm.nama}
                      onChange={(e) => setTeacherForm({ ...teacherForm, nama: e.target.value })}
                      placeholder="Contoh: SUGITO, S.Pd., M.Pd."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* NIP */}
                  <div className="sm:col-span-5 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">NIP (Nomor Induk Pegawai)</label>
                    <input
                      type="text"
                      value={teacherForm.nip}
                      onChange={(e) => setTeacherForm({ ...teacherForm, nip: e.target.value })}
                      placeholder="Contoh: 196805121991031008 atau '-' jika belum ada"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Status Pegawai */}
                  <div className="sm:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Status Pegawai *</label>
                    <select
                      value={teacherForm.statusPegawai}
                      onChange={(e) => setTeacherForm({ ...teacherForm, statusPegawai: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                    >
                      <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                      <option value="PPPK">PPPK</option>
                      <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                      <option value="Guru TK">Guru TK</option>
                      <option value="Guru KB">Guru KB</option>
                    </select>
                  </div>

                  {/* Instansi */}
                  <div className="sm:col-span-8 space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Instansi / Sekolah Tempat Tugas *</label>
                    <input
                      type="text"
                      required
                      list="schools-datalist"
                      value={teacherForm.instansi}
                      onChange={(e) => setTeacherForm({ ...teacherForm, instansi: e.target.value })}
                      placeholder="Contoh: SDN 1 Purwodadi"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                    />
                    <datalist id="schools-datalist">
                      {schools.map((s) => (
                        <option key={s.id} value={s.name} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingTeacherId ? 'Simpan Perubahan Guru' : 'Simpan Data Guru ke Supabase'}</span>
                  </button>
                  {editingTeacherId && (
                    <button
                      type="button"
                      onClick={handleCancelEditTeacher}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Table List & Filter */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-4 sm:p-6">
                {/* Hidden File Input for CSV */}
                <input
                  type="file"
                  ref={csvFileInputRef}
                  accept=".csv"
                  onChange={handleImportCsv}
                  className="hidden"
                />

                {/* Top Action Toolbar: CSV Tools & Search */}
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      Daftar Guru Terdaftar ({filteredTeachers.length})
                    </span>
                    {filteredTeachers.length !== teachers.length && (
                      <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                        Hasil Filter (Total: {teachers.length})
                      </span>
                    )}
                    {teachers.length === 0 && (
                      <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">
                        Tabel Kosong
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Button Unduh Format CSV */}
                    <button
                      type="button"
                      onClick={handleDownloadCsvTemplate}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Unduh contoh template kolom CSV (No, Nama, NIP, Status Pegawai, Instansi)"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Format CSV</span>
                    </button>

                    {/* Button Import CSV */}
                    <button
                      type="button"
                      onClick={() => csvFileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="Upload file CSV untuk menginput banyak data sekaligus ke Supabase"
                    >
                      <UploadCloud className="w-4 h-4 text-emerald-600" />
                      <span>Import File CSV</span>
                    </button>

                    {/* Button Kosongkan Semua (Hanya muncul jika ada data) */}
                    {teachers.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllTeachers}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Hapus seluruh data guru dari database"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Kosongkan</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={teacherSearchInput}
                      onChange={(e) => {
                        setTeacherSearchInput(e.target.value);
                        setTeacherCurrentPage(1);
                      }}
                      placeholder="Cari guru berdasarkan nama, NIP, atau instansi..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                    />
                    {teacherSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setTeacherSearchInput('');
                          setTeacherCurrentPage(1);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        title="Hapus pencarian"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-2">
                    <select
                      value={teacherFilterStatus}
                      onChange={(e) => {
                        setTeacherFilterStatus(e.target.value);
                        setTeacherCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">Semua Status</option>
                      <option value="PNS">PNS</option>
                      <option value="PPPK">PPPK</option>
                      <option value="PPPK Paruh Waktu">PPPK Paruh Waktu</option>
                      <option value="Guru TK">Guru TK</option>
                      <option value="Guru KB">Guru KB</option>
                    </select>

                    <select
                      value={teacherFilterInstansi}
                      onChange={(e) => {
                        setTeacherFilterInstansi(e.target.value);
                        setTeacherCurrentPage(1);
                      }}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none max-w-[180px] truncate"
                    >
                      <option value="ALL">Semua Instansi</option>
                      {Array.from(new Set(teachers.map((t) => t.instansi).filter(Boolean))).sort().map((ins) => (
                        <option key={ins} value={ins}>
                          {ins}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr className="text-center">
                        <th className="py-3 px-3.5 w-14 text-center">No</th>
                        <th className="py-3 px-4 text-center">Nama Lengkap</th>
                        <th className="py-3 px-4 text-center">NIP</th>
                        <th className="py-3 px-4 text-center">Status Pegawai</th>
                        <th className="py-3 px-4 text-center">Instansi</th>
                        <th className="py-3 px-4 text-center w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Users className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                              <p className="font-semibold text-slate-600 text-sm">
                                {teachers.length === 0
                                  ? 'Belum ada data guru di database.'
                                  : 'Tidak ada guru yang sesuai dengan pencarian / filter.'}
                              </p>
                              <p className="text-xs text-slate-400 max-w-sm">
                                {teachers.length === 0
                                  ? 'Tabel Supabase saat ini kosong. Anda dapat menginput manual di form atas atau klik tombol "Import File CSV".'
                                  : 'Silakan ubah kata kunci atau pilih Semua Status / Instansi.'}
                              </p>
                              {(teacherSearchInput || teacherFilterStatus !== 'ALL' || teacherFilterInstansi !== 'ALL') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTeacherSearchInput('');
                                    setTeacherFilterStatus('ALL');
                                    setTeacherFilterInstansi('ALL');
                                    setTeacherCurrentPage(1);
                                  }}
                                  className="text-xs text-emerald-600 hover:underline font-semibold mt-1"
                                >
                                  Reset Filter & Pencarian
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedTeachers.map((t, idx) => {
                          const statusUpper = t.statusPegawai?.toUpperCase() || '';
                          let badgeBg = 'bg-slate-100 text-slate-700';
                          if (statusUpper === 'PNS' || (statusUpper.includes('PNS') && !statusUpper.includes('NON'))) {
                            badgeBg = 'bg-blue-100 text-blue-700';
                          } else if (statusUpper.includes('PARUH')) {
                            badgeBg = 'bg-teal-100 text-teal-700';
                          } else if (statusUpper.includes('PPPK') || statusUpper.includes('P3K')) {
                            badgeBg = 'bg-emerald-100 text-emerald-700';
                          } else if (statusUpper.includes('TK')) {
                            badgeBg = 'bg-purple-100 text-purple-700';
                          } else if (statusUpper.includes('KB')) {
                            badgeBg = 'bg-indigo-100 text-indigo-700';
                          } else if (statusUpper.includes('HONOR') || statusUpper === 'GTT' || statusUpper === 'PTT' || statusUpper === 'GTY' || statusUpper.includes('NON ASN')) {
                            badgeBg = 'bg-amber-100 text-amber-800';
                          }

                          return (
                            <tr key={t.id || idx} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3.5 text-center font-bold text-slate-500">
                                {t.no || (teacherCurrentPage - 1) * teacherItemsPerPage + idx + 1}
                              </td>
                              <td className="py-2.5 px-4 font-semibold text-slate-900">
                                {t.nama}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-slate-600 text-center">
                                {t.nip && t.nip !== '-' ? t.nip : <span className="text-slate-400 italic">-</span>}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${badgeBg}`}>
                                  {t.statusPegawai}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-slate-700 font-medium">
                                {t.instansi}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditTeacher(t)}
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                    title="Edit data guru"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTeacher(t)}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                    title="Hapus data guru"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Teacher Pagination Controls */}
                {totalTeacherPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 pt-2 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      Menampilkan{' '}
                      <strong className="text-slate-800">
                        {filteredTeachers.length > 0 ? (teacherCurrentPage - 1) * teacherItemsPerPage + 1 : 0}
                      </strong>{' '}
                      -{' '}
                      <strong className="text-slate-800">
                        {Math.min(filteredTeachers.length, teacherCurrentPage * teacherItemsPerPage)}
                      </strong>{' '}
                      dari <strong className="text-slate-800">{filteredTeachers.length}</strong> guru (Halaman{' '}
                      <strong className="text-slate-800">{teacherCurrentPage}</strong> dari{' '}
                      <strong className="text-slate-800">{totalTeacherPages}</strong>)
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setTeacherCurrentPage(1)}
                        disabled={teacherCurrentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Pertama"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTeacherCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={teacherCurrentPage === 1}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalTeacherPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (totalTeacherPages > 5 && teacherCurrentPage > 3) {
                            pageNum = Math.min(teacherCurrentPage - 2 + i, totalTeacherPages - (4 - i));
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setTeacherCurrentPage(pageNum)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                                teacherCurrentPage === pageNum
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setTeacherCurrentPage((p) => Math.min(totalTeacherPages, p + 1))}
                        disabled={teacherCurrentPage === totalTeacherPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setTeacherCurrentPage(totalTeacherPages)}
                        disabled={teacherCurrentPage === totalTeacherPages}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        title="Halaman Terakhir"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
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
                  <span>Berita & Liputan ({isWriter ? displayedNews.length : news.length})</span>
                </button>

                <button
                  onClick={() => setNewsSubTab('announcements')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    newsSubTab === 'announcements' ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 border hover:bg-slate-50'
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                  <span>Pengumuman & Surat Edaran ({isWriter ? displayedAnnouncements.length : announcements.length})</span>
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
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Kategori</label>
                          {!isAddingCategory && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingCategory(true);
                                setNewCategoryInput('');
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                              title="Tambah Kategori Baru (+)"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Tambah Kategori</span>
                            </button>
                          )}
                        </div>

                        {!isAddingCategory ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              value={newsForm.category}
                              onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            >
                              {newsCategories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat === 'SD' ? 'Sekolah Dasar (SD)' : (cat === 'TK/PAUD' || cat === 'TK/KB') ? 'TK & KB' : cat}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => {
                                setIsAddingCategory(true);
                                setNewCategoryInput('');
                              }}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all hover:scale-105 shrink-0 flex items-center justify-center"
                              title="Tambah Kategori Baru (+)"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                autoFocus
                                value={newCategoryInput}
                                onChange={(e) => setNewCategoryInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveCategory();
                                  } else if (e.key === 'Escape') {
                                    setIsAddingCategory(false);
                                  }
                                }}
                                placeholder="Ketik nama kategori baru..."
                                className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-semibold focus:outline-none shadow-sm"
                              />
                              <button
                                type="button"
                                disabled={isSavingCategory}
                                onClick={handleSaveCategory}
                                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                                title="Simpan Kategori Baru ke Database (V)"
                              >
                                {isSavingCategory ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 stroke-[3]" />
                                    <span>V</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingCategory(false);
                                  setNewCategoryInput('');
                                }}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shrink-0 flex items-center justify-center"
                                title="Batal"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Ketik nama kategori lalu klik tombol <b>V</b> (atau tekan Enter). Kategori akan langsung tersimpan di Supabase Cloud.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gambar Sampul / Banner Berita dengan Google Drive */}
                    <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <span>Gambar Sampul / Banner Berita *</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Google Drive CDN (Bebas Kuota Supabase 0 MB)</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Preview Image */}
                        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center gap-1.5">
                          <div className="relative group w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-white shadow-md bg-slate-200">
                            <img
                              src={formatGoogleDriveImageUrl(newsForm.image, 600) || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000'}
                              alt="Sampul Berita"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000';
                              }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-medium">
                              Pratinjau Sampul
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 text-center">
                            Foto sampul di halaman berita
                          </span>
                        </div>

                        {/* Controls & Google Drive Input */}
                        <div className="md:col-span-8 lg:col-span-9 space-y-2.5">
                          {/* Input Link Google Drive */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>Tempel Link Foto Google Drive:</span>
                              </label>
                              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                                Rekomendasi (0 MB Supabase)
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={newsForm.image && !newsForm.image.startsWith('data:') ? newsForm.image : ''}
                                onChange={(e) => {
                                  const val = e.target.value.trim();
                                  if (!val) {
                                    setNewsForm((prev) => ({ ...prev, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000' }));
                                  } else {
                                    const formatted = formatGoogleDriveImageUrl(val);
                                    setNewsForm((prev) => ({ ...prev, image: formatted }));
                                  }
                                }}
                                placeholder="Contoh: https://drive.google.com/file/d/1abc.../view?usp=sharing"
                                className="w-full px-3.5 py-2 pl-9 pr-16 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-xs text-slate-800 transition-all font-mono"
                              />
                              <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                              {newsForm.image && newsForm.image !== 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000' && (
                                <button
                                  type="button"
                                  onClick={() => setNewsForm((prev) => ({ ...prev, image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000' }))}
                                  className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2 py-1 rounded-lg transition-colors"
                                  title="Reset ke Gambar Bawaan"
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Tips Box */}
                          <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/70 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <p className="text-[10.5px]">
                              <b>Tips Google Drive:</b> Buka Google Drive &gt; Klik kanan file foto &gt; <b>Bagikan (Share)</b> &gt; Ubah Akses umum menjadi <b>"Siapa saja yang memiliki link"</b> &gt; Salin link lalu tempelkan di atas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Penulis / Humas</label>
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <Lock className="w-2.5 h-2.5 text-slate-500" />
                            <span>Otomatis Akun</span>
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
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Role Pengunggah</label>
                          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Terverifikasi</span>
                          </span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={editingNewsId ? (newsForm.authorRole || activeUserRole) : activeUserRole}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 cursor-not-allowed select-none shadow-inner"
                          title="Role wewenang akun terverifikasi otomatis"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Ringkasan Singkat Berita</label>
                          {newsForm.content && (
                            <button
                              type="button"
                              onClick={() => {
                                const generated = generateSummary(newsForm.content, 180);
                                setNewsForm({ ...newsForm, summary: generated });
                              }}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold hover:underline flex items-center gap-1"
                              title="Ekstrak ringkasan teks bersih otomatis dari isi berita"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>Buat Otomatis dari Konten</span>
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={2}
                          value={newsForm.summary}
                          onChange={(e) => setNewsForm({ ...newsForm, summary: stripHtml(e.target.value) })}
                          placeholder="Ringkasan 1-2 kalimat (otomatis dibuat dari isi jika dikosongkan, bebas tag HTML)..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none resize-none leading-relaxed"
                        />
                        <p className="text-[10px] text-slate-400">
                          Tip: Boleh dikosongkan, sistem akan otomatis mengambil kutipan teks bersih dari konten artikel tanpa tag HTML.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Jumlah Tayangan (Views)</span>
                          </span>
                          {isAdminOrSuperAdmin ? (
                            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                              Sinkron ke Web
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              <Lock className="w-2.5 h-2.5 text-slate-500" />
                              <span>Terkunci (Admin / Super Admin)</span>
                            </span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            readOnly={!isAdminOrSuperAdmin}
                            disabled={!isAdminOrSuperAdmin}
                            value={newsForm.views}
                            onChange={(e) => {
                              if (isAdminOrSuperAdmin) {
                                setNewsForm({ ...newsForm, views: Math.max(0, parseInt(e.target.value) || 0) });
                              }
                            }}
                            placeholder="0"
                            className={`w-full pl-3.5 pr-20 py-2 rounded-xl border border-slate-200 text-xs font-bold ${
                              isAdminOrSuperAdmin
                                ? 'bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none'
                                : 'bg-slate-100 text-slate-600 cursor-not-allowed select-none shadow-inner'
                            }`}
                            title={isAdminOrSuperAdmin ? 'Atur jumlah tayangan manual' : 'Jumlah tayangan dikunci dan hanya dapat diedit oleh Administrator / Super Admin'}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
                            tayangan
                          </div>
                        </div>
                        <p className={`text-[10px] ${isAdminOrSuperAdmin ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isAdminOrSuperAdmin
                            ? 'Bisa diatur manual untuk memancing pembaca & akan bertambah otomatis saat dibaca.'
                            : 'Jumlah tayangan bertambah otomatis saat dibaca pengunjung (Hanya Admin / Super Admin yang dapat mengubah manual).'}
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
                              authorId: currentUser?.id || '',
                              authorRole: activeUserRole,
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
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-800">
                          {isAdminOrSuperAdmin
                            ? (newsFilterTab === 'mine' ? `Daftar Berita Saya (${displayedNews.length} Artikel)` : `Semua Artikel Berita (${displayedNews.length} Artikel)`)
                            : `Daftar Berita Saya (${displayedNews.length} Artikel)`}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isAdminOrSuperAdmin
                            ? 'Sebagai Admin / Super Admin, Anda dapat mengelola seluruh artikel berita atau artikel yang Anda terbitkan sendiri.'
                            : `Menampilkan artikel berita resmi yang dibuat dan dikelola oleh ${currentUser?.name || 'akun Anda'}.`}
                        </p>
                      </div>

                      {/* Filter Tab Khusus Super Admin & Admin */}
                      {isAdminOrSuperAdmin && (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setNewsFilterTab('mine')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              newsFilterTab === 'mine'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Artikel Saya ({news.filter((item) => isNewsItemOwner(item)).length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setNewsFilterTab('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              newsFilterTab === 'all'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Semua Berita ({news.length})
                          </button>
                        </div>
                      )}
                    </div>

                    {displayedNews.length === 0 ? (
                      <div className="p-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                          <FileText className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">
                          Belum Ada Berita yang Anda Tulis
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Anda belum menulis artikel berita. Silakan lengkapi formulir di atas untuk menerbitkan artikel berita pertama Anda.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {displayedNews.map((item) => {
                          const canManageItem = isAdminOrSuperAdmin || isNewsItemOwner(item);

                          return (
                            <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <img 
                                  src={formatGoogleDriveImageUrl(item.image, 200)} 
                                  alt={item.title} 
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 bg-slate-100" 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000';
                                  }}
                                />
                                <div className="min-w-0">
                                  <h4 className="font-bold text-slate-900 text-xs truncate">{item.title}</h4>
                                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span>{item.date}</span>
                                    <span>•</span>
                                    <span>{item.category}</span>
                                    <span>•</span>
                                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
                                      <User className="w-3 h-3 text-slate-500" />
                                      <span>{item.author} {item.authorRole ? `(${item.authorRole})` : ''}</span>
                                    </span>
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
                                {canManageItem ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingNewsId(item.id);
                                        setNewsForm({
                                          title: item.title,
                                          category: item.category,
                                          summary: stripHtml(item.summary) || generateSummary(item.content, 180),
                                          content: item.content,
                                          author: item.author,
                                          authorId: item.authorId || '',
                                          authorRole: item.authorRole || activeUserRole,
                                          image: item.image,
                                          tags: (item.tags || []).join(', '),
                                          views: item.views || 0
                                        });
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                      title="Edit Berita Saya"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        const confirmed = await showConfirmDialog({
                                          title: 'Hapus Berita Ini?',
                                          message: `Apakah Anda yakin ingin menghapus artikel berita "${item.title}"?`,
                                          type: 'delete',
                                          itemName: item.title,
                                          confirmText: 'Ya, Hapus Berita',
                                          cancelText: 'Tidak, Batalkan'
                                        });
                                        if (!confirmed) return;
                                        deleteNews(item.id);
                                        showNoticePopup({
                                          title: 'Berita Dihapus!',
                                          message: `Artikel "${item.title}" telah berhasil dihapus.`,
                                          type: 'success'
                                        });
                                      }}
                                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                                      title="Hapus Berita"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1 font-medium select-none" title="Dibuat oleh akun/role lain">
                                    <Lock className="w-3 h-3 text-slate-400" />
                                    <span>Terkunci</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                          <option value="TK/KB">Khusus TK/KB</option>
                          <option value="TK/PAUD">Khusus TK/KB (Legacy DB)</option>
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

                    {/* File Attachment Section: 2 Cara (Upload Baru / Pilih dari Layanan Unduhan) */}
                    <div className="space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FolderUp className="w-4 h-4 text-blue-600" />
                          <span>Lampiran Berkas Pengumuman (Opsional)</span>
                        </label>
                        
                        {/* 2 Metode Tambah Berkas */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setAnnFileMode('upload')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs ${
                              annFileMode === 'upload'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>1. Upload Berkas Baru</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnnFileMode('existing')}
                            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 text-xs ${
                              annFileMode === 'existing'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            <span>2. Pilih dari Layanan Unduhan ({availableUnduhanDocs.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* Jika Berkas SUDAH Dipilih (baik dari upload maupun dari Layanan Unduhan) */}
                      {uploadedAnnFile || (editingAnnId && annForm.fileUrl && annForm.fileUrl !== '#') ? (
                        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm ${
                          annForm.sourceDocumentId 
                            ? 'bg-indigo-50/80 border-indigo-200' 
                            : 'bg-blue-50/80 border-blue-200'
                        }`}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm ${
                              annForm.sourceDocumentId ? 'bg-indigo-600' : 'bg-blue-600'
                            }`}>
                              {annForm.sourceDocumentId ? <FolderOpen className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                                  {uploadedAnnFile?.name || annForm.fileName || `${annForm.title}.${(annForm.fileType || 'pdf').toLowerCase()}`}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Berkas Siap Digunakan</span>
                                </span>
                                {annForm.sourceDocumentId ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                                    <FolderOpen className="w-2.5 h-2.5 text-indigo-600" />
                                    <span>Dari Layanan Unduhan (Bebas Duplikat)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                                    <RefreshCw className="w-2.5 h-2.5 text-blue-600" />
                                    <span>Otomatis Masuk Layanan Unduhan</span>
                                  </span>
                                )}
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
                                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
                                title="Uji coba download berkas"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Uji Download</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (annForm.sourceDocumentId) {
                                  setAnnFileMode('existing');
                                } else {
                                  setAnnFileMode('upload');
                                  annFileInputRef.current?.click();
                                }
                              }}
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
                      ) : (
                        /* Jika BELUM Ada Berkas Dipilih: Tampilkan Form Sesuai Mode */
                        <div>
                          {annFileMode === 'upload' ? (
                            /* Mode 1: Upload Berkas Baru */
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
                                [Cara 1] Klik untuk memilih file lampiran baru atau seret (drag & drop) file ke sini
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                Mendukung format: PDF, DOCX, XLSX, PPTX, ZIP, dll. (Maks 25 MB). Berkas baru ini akan otomatis masuk ke Layanan Unduhan.
                              </p>
                            </div>
                          ) : (
                            /* Mode 2: Pilih dari Layanan Unduhan (Mencegah Duplikasi) */
                            <div className="p-4 rounded-2xl bg-indigo-50/50 border-2 border-dashed border-indigo-200 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                                  <span>[Cara 2] Pilih Judul Berkas dari Menu Layanan Unduhan</span>
                                </span>
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/90 px-2 py-0.5 rounded-full border border-indigo-200">
                                  Bebas File Ganda
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 leading-relaxed">
                                Pilih judul file yang sudah pernah diunggah ke menu <strong>Layanan Unduhan</strong>. File terpilih akan langsung ditautkan ke pengumuman ini sehingga tidak ada file ganda yang diunggah ulang ke menu Unduh Berkas.
                              </p>
                              <select
                                value={annForm.sourceDocumentId || ''}
                                onChange={(e) => {
                                  const selectedDocId = e.target.value;
                                  if (!selectedDocId) {
                                    handleRemoveAnnFile();
                                    return;
                                  }
                                  const doc = availableUnduhanDocs.find((d) => d.id === selectedDocId) || documents.find((d) => d.id === selectedDocId);
                                  if (doc) {
                                    setUploadedAnnFile({
                                      name: doc.title,
                                      size: doc.fileSize || '1 MB',
                                      type: (doc.fileType as any) || 'PDF',
                                      dataUrl: doc.downloadUrl
                                    });
                                    setAnnForm((prev) => ({
                                      ...prev,
                                      title: prev.title.trim() ? prev.title : doc.title,
                                      sourceDocumentId: doc.id,
                                      fileName: doc.title,
                                      fileSize: doc.fileSize || '1 MB',
                                      fileType: doc.fileType || 'PDF',
                                      fileUrl: doc.downloadUrl
                                    }));
                                    showToast(`Berkas "${doc.title}" dari Layanan Unduhan berhasil ditautkan ke pengumuman! (Bebas file ganda)`, 'success');
                                  }
                                }}
                                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:outline-none shadow-xs"
                              >
                                <option value="">-- Pilih Judul Berkas dari Layanan Unduhan ({availableUnduhanDocs.length} Berkas Tersedia) --</option>
                                {availableUnduhanDocs.map((doc) => (
                                  <option key={doc.id} value={doc.id}>
                                    {doc.title} [{doc.fileType || 'PDF'} • {doc.fileSize || 'Tersedia'}] - Kategori: {doc.category || 'Dokumen'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notice Sinkronisasi Otomatis / Bebas Duplikasi */}
                    {annForm.sourceDocumentId ? (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-[11px] text-indigo-900 leading-relaxed">
                        <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-indigo-950">Berkas Terhubung ke Layanan Unduhan (Bebas Duplikasi):</strong>
                          <p className="text-indigo-800/90 mt-0.5">
                            Pengumuman ini menautkan berkas <strong className="font-semibold text-indigo-950">"{annForm.fileName || 'Layanan Unduhan'}"</strong> yang sudah ada di menu Unduh Berkas. Sistem <strong className="underline font-bold">tidak akan</strong> menduplikat atau membuat file ganda ke menu Layanan Unduhan.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-900 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold text-blue-950">Sinkronisasi Otomatis ke Layanan Unduhan:</strong>
                          <p className="text-blue-800/90 mt-0.5">
                            Setiap file/berkas baru yang Anda lampirkan pada pengumuman ini akan otomatis masuk ke menu <strong className="font-semibold">Layanan Unduhan</strong> di CMS serta tayang di website publik pada sub menu <strong className="font-semibold">Unduh Berkas</strong>. Nama file di Layanan Unduhan akan otomatis menggunakan <strong className="font-semibold">Judul Pengumuman / Edaran</strong> yang Anda isikan di atas.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lampiran Persyaratan Pelayanan (Data dari tabel service_requirements) */}
                    <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-blue-600" />
                          <span>Lampiran Persyaratan Pelayanan (Opsional)</span>
                        </label>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                          Tabel service_requirements
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Pilih judul dari data tabel Persyaratan Pelayanan jika pengumuman ini berkaitan dengan suatu layanan/administrasi. Ketika judul lampiran ini diklik oleh pengunjung pada pengumuman website, sistem akan langsung mengarahkan pengunjung ke halaman detail persyaratan pelayanan tersebut.
                      </p>
                      <div className="flex items-center gap-2">
                        <select
                          value={annForm.serviceRequirementId || ''}
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            const found = serviceRequirements.find((s) => s.id === selectedId);
                            setAnnForm({
                              ...annForm,
                              serviceRequirementId: selectedId,
                              serviceRequirementTitle: found ? found.title : ''
                            });
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          <option value="">-- Tanpa Tautan Persyaratan Pelayanan --</option>
                          {serviceRequirements.map((req) => (
                            <option key={req.id} value={req.id}>
                              {req.title} {req.category ? `(${req.category})` : ''}
                            </option>
                          ))}
                        </select>
                        {annForm.serviceRequirementId && (
                          <button
                            type="button"
                            onClick={() =>
                              setAnnForm({
                                ...annForm,
                                serviceRequirementId: '',
                                serviceRequirementTitle: ''
                              })
                            }
                            className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors shrink-0"
                            title="Lepas tautan persyaratan"
                          >
                            Lepas
                          </button>
                        )}
                      </div>

                      {annForm.serviceRequirementTitle && (
                        <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                            <span className="text-[11px] text-indigo-950 font-medium truncate">
                              Terhubung ke: <strong className="font-bold text-indigo-900">{annForm.serviceRequirementTitle}</strong>
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-200/80 text-indigo-800 shrink-0">
                            Terdirect ke Detail Persyaratan
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info Penulis / Pembuat Pengumuman & Role Pengunggah Otomatis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Penulis / Pembuat Pengumuman</label>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" /> Otomatis Akun
                          </span>
                        </div>
                        <input
                          type="text"
                          disabled
                          value={annForm.author || activeAuthorName}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700 cursor-not-allowed select-none"
                          title="Penulis otomatis mendeteksi nama dari akun login di database dan tidak dapat diubah"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Role Pengunggah</label>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                          </span>
                        </div>
                        <input
                          type="text"
                          disabled
                          value={annForm.authorRole || activeUserRole}
                          className="w-full px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200 text-xs font-bold text-slate-700 cursor-not-allowed select-none"
                          title="Role pengunggah otomatis disesuaikan dengan akun login"
                        />
                      </div>
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
                              setAnnFileMode('upload');
                              if (annFileInputRef.current) annFileInputRef.current.value = '';
                              setAnnForm({
                                title: '',
                                urgency: 'Penting',
                                target: 'Semua Satuan',
                                fileSize: '',
                                fileUrl: '',
                                fileName: '',
                                fileType: '',
                                summary: '',
                                serviceRequirementId: '',
                                serviceRequirementTitle: '',
                                sourceDocumentId: '',
                                author: currentUser?.name || activeAuthorName,
                                authorId: currentUser?.id || '',
                                authorRole: currentUser?.role || activeUserRole
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                          {isWriter
                            ? `Daftar Pengumuman Saya (${displayedAnnouncements.length} Berkas)`
                            : `Daftar Pengumuman Aktif (${displayedAnnouncements.length} Berkas)`}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isWriter
                            ? 'Menampilkan daftar pengumuman dan surat edaran yang diterbitkan oleh akun Anda.'
                            : 'Kelola, tinjau, dan hapus pengumuman resmi yang tayang di website publik.'}
                        </p>
                      </div>

                      {/* Filter Tab: Semua vs Milik Saya (Khusus Admin / Super Admin) */}
                      {isAdminOrSuperAdmin && (
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setAnnFilterTab('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              annFilterTab === 'all'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Semua ({announcements.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAnnFilterTab('mine')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              annFilterTab === 'mine'
                                ? 'bg-white text-blue-600 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Pengumuman Saya ({announcements.filter(isAnnouncementItemOwner).length})
                          </button>
                        </div>
                      )}
                    </div>

                    {displayedAnnouncements.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                        <BellRing className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs font-semibold text-slate-500">
                          {isWriter
                            ? 'Anda belum pernah membuat pengumuman atau surat edaran.'
                            : 'Belum ada data pengumuman yang sesuai dengan filter.'}
                        </p>
                        {isWriter && (
                          <p className="text-[11px] text-slate-400">
                            Gunakan formulir di atas untuk menerbitkan pengumuman resmi pertama Anda.
                          </p>
                        )}
                      </div>
                    ) : (
                      displayedAnnouncements.map((ann) => (
                        <div key={ann.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {ann.urgency}
                              </span>
                              <span className="text-xs font-mono text-slate-400">{ann.date} • Sasaran: {ann.target}</span>

                              {/* Author Badge */}
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <User className="w-2.5 h-2.5 text-blue-600" />
                                <span>{ann.author || 'Humas Korwilcam Purwodadi'}</span>
                              </span>
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
                                {ann.sourceDocumentId ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <FolderOpen className="w-3 h-3 text-indigo-500" />
                                    <span>Dari Layanan Unduhan</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                                    <span>Sinkron Unduhan</span>
                                  </span>
                                )}
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

                            {/* Linked Service Requirement Badge */}
                            {ann.serviceRequirementTitle && (
                              <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                                  <FileCheck2 className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>Lampiran Persyaratan: <strong className="font-extrabold">{ann.serviceRequirementTitle}</strong></span>
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => {
                                if (isWriter && !isAnnouncementItemOwner(ann)) {
                                  showNoticePopup({
                                    title: 'Akses Ditolak!',
                                    message: 'Anda hanya memiliki izin untuk mengedit pengumuman yang Anda buat sendiri.',
                                    type: 'warning'
                                  });
                                  return;
                                }
                                const matchedDoc = ann.sourceDocumentId
                                  ? availableUnduhanDocs.find((d) => d.id === ann.sourceDocumentId)
                                  : availableUnduhanDocs.find(
                                      (d) =>
                                        (d.downloadUrl && d.downloadUrl !== '#' && d.downloadUrl === ann.fileUrl) ||
                                        (ann.fileName && d.title.trim().toLowerCase() === ann.fileName.trim().toLowerCase() && d.fileSize === ann.fileSize)
                                    );
                                const resolvedSourceDocId = ann.sourceDocumentId || matchedDoc?.id || '';
                                setEditingAnnId(ann.id);
                                setAnnFileMode(resolvedSourceDocId ? 'existing' : 'upload');
                                setAnnForm({
                                  title: ann.title,
                                  urgency: ann.urgency,
                                  target: ann.target,
                                  fileSize: ann.fileSize || '',
                                  fileUrl: ann.fileUrl || '',
                                  fileName: ann.fileName || '',
                                  fileType: ann.fileType || '',
                                  summary: ann.summary,
                                  serviceRequirementId: ann.serviceRequirementId || '',
                                  serviceRequirementTitle: ann.serviceRequirementTitle || '',
                                  sourceDocumentId: resolvedSourceDocId,
                                  author: ann.author || activeAuthorName,
                                  authorId: ann.authorId || currentUser?.id || '',
                                  authorRole: ann.authorRole || activeUserRole
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
                              onClick={async () => {
                                if (isWriter && !isAnnouncementItemOwner(ann)) {
                                  showNoticePopup({
                                    title: 'Akses Ditolak!',
                                    message: 'Anda hanya memiliki izin untuk menghapus pengumuman yang Anda buat sendiri.',
                                    type: 'warning'
                                  });
                                  return;
                                }
                                const confirmed = await showConfirmDialog({
                                  title: 'Hapus Pengumuman Ini?',
                                  message: `Apakah Anda yakin ingin menghapus pengumuman "${ann.title}"?`,
                                  type: 'delete',
                                  itemName: ann.title,
                                  confirmText: 'Ya, Hapus Pengumuman',
                                  cancelText: 'Tidak, Batalkan'
                                });
                                if (!confirmed) return;
                                deleteAnnouncement(ann.id);
                                showNoticePopup({
                                  title: 'Pengumuman Dihapus!',
                                  message: `Pengumuman "${ann.title}" telah berhasil dihapus.`,
                                  type: 'success'
                                });
                              }}
                              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                              title="Hapus Pengumuman"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4.2: KELOLA PRESTASI SISWA & GURU */}
          {currentSection === 'achievements-cms' && (
            <div className="space-y-6">
              {/* Header Title & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Kelola Prestasi Siswa & Guru
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {isAdminOrSuperAdmin 
                      ? 'Manajemen data kejuaraan, medali, dan penghargaan putra-putri serta pendidik Korwilcam Purwodadi.'
                      : `Manajemen data prestasi yang dibuat dan dikelola oleh akun ${currentUser?.name || 'Anda'} (${currentUser?.role || activeUserRole}).`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openNewAchievementModal}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Prestasi Baru</span>
                  </button>
                </div>
              </div>

              {/* Informational Callout regarding Google Drive Storage */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-start gap-3.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="space-y-1 text-xs sm:text-sm text-slate-700">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Penyimpanan Foto Google Drive (Aman & Hemat Kuota Database)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      Zero Storage Cost
                    </span>
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Foto siswa, guru, dan piagam disimpan langsung di <strong>Google Drive</strong> Anda tanpa memakan kapasitas database Supabase. Cukup salin tautan file sharing Google Drive (pastikan akses disetel <em>Siapa saja yang memiliki link dapat melihat</em>), sistem otomatis mengonversinya menjadi foto berkecepatan tinggi di website publik.
                  </p>
                </div>
              </div>

              {/* Filter Tab Kepemilikan (Semua Prestasi vs Prestasi Saya) jika Admin/Super Admin */}
              {isAdminOrSuperAdmin ? (
                <div className="flex border-b border-slate-200 gap-6">
                  <button
                    type="button"
                    onClick={() => setAchievementFilterTab('all')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                      achievementFilterTab === 'all'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Semua Prestasi ({achievements.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAchievementFilterTab('mine')}
                    className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition ${
                      achievementFilterTab === 'mine'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Prestasi Saya ({achievements.filter((a) => isAchievementItemOwner(a)).length})</span>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-800 flex items-center gap-2.5">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Menampilkan daftar prestasi yang diinput dan dikelola oleh akun Anda (<strong>{currentUser?.name || activeAuthorName}</strong>).
                  </span>
                </div>
              )}

              {/* Stats Counters Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Total Prestasi</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-slate-800">{displayedAchievements.length}</span>
                    <Trophy className="w-5 h-5 text-amber-500" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Prestasi Siswa</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-emerald-600">
                      {displayedAchievements.filter((a) => a.category === 'Siswa').length}
                    </span>
                    <GraduationCap className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Prestasi Guru</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-indigo-600">
                      {displayedAchievements.filter((a) => a.category === 'Guru').length}
                    </span>
                    <User className="w-5 h-5 text-indigo-500" />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-500">Tk. Nasional & Provinsi</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-black text-rose-600">
                      {displayedAchievements.filter((a) => a.level === 'Nasional' || a.level === 'Provinsi' || a.level === 'Internasional').length}
                    </span>
                    <Medal className="w-5 h-5 text-rose-500" />
                  </div>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={achievementSearch}
                      onChange={(e) => setAchievementSearch(e.target.value)}
                      placeholder="Cari prestasi, siswa/guru, sekolah, pembimbing..."
                      className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                    {achievementSearch && (
                      <button
                        onClick={() => setAchievementSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filter Pills & Select */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Category Filter */}
                    <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                      {(['ALL', 'Siswa', 'Guru'] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setAchievementCategoryFilter(cat)}
                          className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                            achievementCategoryFilter === cat
                              ? 'bg-white text-blue-600 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {cat === 'ALL' ? 'Semua' : cat}
                        </button>
                      ))}
                    </div>

                    {/* Level Filter */}
                    <select
                      value={achievementLevelFilter}
                      onChange={(e) => setAchievementLevelFilter(e.target.value as any)}
                      aria-label="Filter Tingkat Lomba"
                      className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    >
                      <option value="ALL">Semua Tingkat</option>
                      <option value="Internasional">Internasional</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Kabupaten">Kabupaten</option>
                      <option value="Kecamatan">Kecamatan</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                  <span>
                    Ditemukan <strong className="text-slate-800">{filteredAchievementsCms.length}</strong> data prestasi
                  </span>
                  {(achievementSearch || achievementCategoryFilter !== 'ALL' || achievementLevelFilter !== 'ALL') && (
                    <button
                      onClick={() => {
                        setAchievementSearch('');
                        setAchievementCategoryFilter('ALL');
                        setAchievementLevelFilter('ALL');
                      }}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Achievements Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {filteredAchievementsCms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3.5">Foto</th>
                          <th className="px-4 py-3.5">Peraih & Sekolah</th>
                          <th className="px-4 py-3.5">Ajang & Bidang</th>
                          <th className="px-4 py-3.5">Peringkat & Tingkat</th>
                          <th className="px-4 py-3.5">Tahun / Waktu</th>
                          {isAdminOrSuperAdmin && <th className="px-4 py-3.5">Diinput Oleh</th>}
                          <th className="px-4 py-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAchievementsCms.map((item) => {
                          const photo = item.photoUrl ? formatGoogleDriveImageUrl(item.photoUrl, 200) : '';

                          return (
                            <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                              {/* Foto Thumbnail */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative group">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={item.recipientName}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                      <Trophy className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Peraih & Sekolah */}
                              <td className="px-4 py-3.5">
                                <div className="font-bold text-slate-900 line-clamp-1">{item.recipientName}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{item.schoolName}</span>
                                </div>
                                {item.mentorName && (
                                  <div className="text-[11px] text-slate-400 mt-0.5">
                                    Pembimbing: {item.mentorName}
                                  </div>
                                )}
                              </td>

                              {/* Ajang & Bidang */}
                              <td className="px-4 py-3.5 max-w-xs">
                                <div className="font-semibold text-slate-800 line-clamp-2 leading-snug">
                                  {item.title}
                                </div>
                                {item.field && (
                                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                                    {item.field}
                                  </span>
                                )}
                              </td>

                              {/* Peringkat & Tingkat */}
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                    {item.rank}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                    Tingkat {item.level}
                                  </span>
                                </div>
                              </td>

                              {/* Tahun / Waktu */}
                              <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                                <div className="font-bold text-slate-800">{item.year}</div>
                                {item.eventDate && (
                                  <div className="text-[11px] text-slate-400 mt-0.5">{item.eventDate}</div>
                                )}
                              </td>

                              {/* Kolom Diinput Oleh (Khusus Admin / Super Admin) */}
                              {isAdminOrSuperAdmin && (
                                <td className="px-4 py-3.5 whitespace-nowrap text-xs">
                                  <div className="font-semibold text-slate-800">
                                    {item.authorName || 'Super Admin'}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {item.authorRole || 'Admin'}
                                  </div>
                                </td>
                              )}

                              {/* Aksi */}
                              <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {item.photoUrl && (
                                    <a
                                      href={getGoogleDriveViewUrl(item.photoUrl)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                                      title="Buka Foto di Google Drive"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  {(isAdminOrSuperAdmin || isAchievementItemOwner(item)) && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => openEditAchievementModal(item)}
                                        className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                                        title="Edit Prestasi"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteAchievement(item)}
                                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                                        title="Hapus Prestasi"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-700">Belum ada data prestasi</h4>
                      <p className="text-xs text-slate-400">
                        {achievementSearch ? 'Tidak ada hasil yang sesuai dengan kata kunci pencarian.' : 'Klik tombol di bawah untuk mencatat prestasi baru.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewAchievementModal}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Prestasi Sekarang</span>
                    </button>
                  </div>
                )}
              </div>

              {/* MODAL FORM TAMBAH / EDIT PRESTASI */}
              {isAchievementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                  <div 
                    className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Modal Header */}
                    <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold">
                            {editingAchievementId ? 'Edit Data Prestasi' : 'Tambah Prestasi Baru'}
                          </h3>
                          <p className="text-xs text-blue-100">
                            Lengkapi informasi penghargaan dan sertakan link Google Drive foto.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAchievementModalOpen(false)}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Form Scrollable Body */}
                    <form onSubmit={handleSaveAchievement} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
                      {/* Info Akun Pembuat / Pengelola */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">
                              {editingAchievementId ? 'Penulis / Pembuat Terdaftar' : 'Akun Penginput Prestasi'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {achievementForm.authorName || currentUser?.name || 'Administrator'} • <span className="font-medium text-blue-600">{achievementForm.authorRole || currentUser?.role || 'Admin'}</span>
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                          {isAdminOrSuperAdmin ? 'Hak Akses Admin' : 'Hak Milik Akun'}
                        </span>
                      </div>

                      {/* Judul Kompetisi */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Nama Ajang / Kompetisi <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={achievementForm.title}
                          onChange={(e) => setAchievementForm({ ...achievementForm, title: e.target.value })}
                          placeholder="Misal: Festival dan Lomba Seni Siswa Nasional (FLS2N)"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>

                      {/* Kategori, Bidang Lomba, Tingkat */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Kategori <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={achievementForm.category}
                            onChange={(e) => setAchievementForm({ ...achievementForm, category: e.target.value as AchievementCategory })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                          >
                            <option value="Siswa">Siswa</option>
                            <option value="Guru">Guru & Tendik</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Bidang Lomba
                          </label>
                          <select
                            value={achievementForm.field}
                            onChange={(e) => setAchievementForm({ ...achievementForm, field: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                          >
                            <option value="Sains / OSN">Sains / OSN</option>
                            <option value="Olahraga / O2SN">Olahraga / O2SN</option>
                            <option value="Seni & Budaya / FLS2N">Seni & Budaya / FLS2N</option>
                            <option value="Keagamaan / MAPSI">Keagamaan / MAPSI</option>
                            <option value="Literasi / FTBI">Literasi / FTBI</option>
                            <option value="Inovasi GTK">Inovasi GTK</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tingkat <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={achievementForm.level}
                            onChange={(e) => setAchievementForm({ ...achievementForm, level: e.target.value as AchievementLevel })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                          >
                            <option value="Kecamatan">Kecamatan</option>
                            <option value="Kabupaten">Kabupaten</option>
                            <option value="Provinsi">Provinsi</option>
                            <option value="Nasional">Nasional</option>
                            <option value="Internasional">Internasional</option>
                          </select>
                        </div>
                      </div>

                      {/* Peringkat & Tahun */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Peringkat / Kejuaraan <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={achievementForm.rank}
                            onChange={(e) => setAchievementForm({ ...achievementForm, rank: e.target.value })}
                            placeholder="Misal: Juara 1, Juara 2, Juara Harapan 1, Medali Emas"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Tahun Prestasi <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            value={achievementForm.year}
                            onChange={(e) => setAchievementForm({ ...achievementForm, year: parseInt(e.target.value, 10) || new Date().getFullYear() })}
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Nama Peraih & Asal Sekolah */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Nama Lengkap Peraih <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={achievementForm.recipientName}
                            onChange={(e) => setAchievementForm({ ...achievementForm, recipientName: e.target.value })}
                            placeholder="Nama siswa atau guru"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Asal Satuan Pendidikan / Sekolah <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            list="school-suggestions"
                            value={achievementForm.schoolName}
                            onChange={(e) => setAchievementForm({ ...achievementForm, schoolName: e.target.value })}
                            placeholder="Ketik atau pilih dari daftar sekolah"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <datalist id="school-suggestions">
                            {schools.map((s) => (
                              <option key={s.id} value={s.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>

                      {/* Pembimbing & Tanggal Pelaksanaan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Nama Guru Pembimbing / Pelatih
                          </label>
                          <input
                            type="text"
                            value={achievementForm.mentorName}
                            onChange={(e) => setAchievementForm({ ...achievementForm, mentorName: e.target.value })}
                            placeholder="Opsional (misal: Dra. Endang Purwanti)"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Waktu / Bulan Pelaksanaan
                          </label>
                          <input
                            type="text"
                            value={achievementForm.eventDate}
                            onChange={(e) => setAchievementForm({ ...achievementForm, eventDate: e.target.value })}
                            placeholder="Misal: Maret 2026 atau 15-18 Agustus 2025"
                            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>

                      {/* Link Foto Google Drive */}
                      <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2">
                        <label className="block font-bold text-slate-800">
                          Link Foto Google Drive (Siswa / Guru / Piala)
                        </label>
                        <input
                          type="url"
                          value={achievementForm.photoUrl}
                          onChange={(e) => setAchievementForm({ ...achievementForm, photoUrl: e.target.value })}
                          placeholder="https://drive.google.com/file/d/1A2B3C.../view?usp=sharing"
                          className="w-full px-3.5 py-2 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-mono"
                        />
                        <p className="text-[11px] text-slate-500">
                          Pastikan link Google Drive disetel <em>Siapa saja yang memiliki link dapat melihat</em>. Tidak perlu unggah gambar ke Supabase.
                        </p>

                        {/* Live Image Preview */}
                        {achievementForm.photoUrl && (
                          <div className="pt-2 flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden border border-slate-300 shrink-0">
                              <img
                                src={formatGoogleDriveImageUrl(achievementForm.photoUrl, 200)}
                                alt="Pratinjau Foto"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                            </div>
                            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Pratinjau foto langsung terhubung</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Link Piagam Google Drive */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Link Piagam / Sertifikat (Google Drive)
                        </label>
                        <input
                          type="url"
                          value={achievementForm.certificateUrl}
                          onChange={(e) => setAchievementForm({ ...achievementForm, certificateUrl: e.target.value })}
                          placeholder="https://drive.google.com/file/d/... (Opsional)"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-mono"
                        />
                      </div>

                      {/* Catatan / Cerita Singkat */}
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Catatan / Deskripsi Singkat Prestasi
                        </label>
                        <textarea
                          rows={3}
                          value={achievementForm.description}
                          onChange={(e) => setAchievementForm({ ...achievementForm, description: e.target.value })}
                          placeholder="Tuliskan kisah perjuangan singkat, nomor cabang perlombaan, atau kutipan apresiasi..."
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed"
                        />
                      </div>

                      {/* Modal Footer Buttons */}
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsAchievementModalOpen(false)}
                          className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingAchievement}
                          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                        >
                          {isSavingAchievement ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>{editingAchievementId ? 'Simpan Perubahan' : 'Simpan Prestasi'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4.5: KELOLA ORGANISASI */}
          {currentSection === 'organization-cms' && (
            <div className="space-y-8">
              {!selectedOrgIdForEdit || !orgForm ? (
                /* VIEW A: DAFTAR ORGANISASI */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        Kelola Organisasi Mitra & Profesi
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAdminOrSuperAdmin 
                          ? 'Pilih organisasi di bawah ini untuk mengelola sambutan ketua, susunan pengurus beserta jabatannya, visi-misi, serta akun penanggung jawab pengelola.'
                          : `Organisasi mitra yang dapat dikelola oleh akun Anda (@${currentUser?.username || ''}).`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                      {displayedOrganizations.length > 3 && (
                        <div className="relative min-w-[200px] sm:w-64">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={orgSearchQuery}
                            onChange={(e) => {
                              setOrgSearchQuery(e.target.value);
                              setOrgCurrentPage(1);
                            }}
                            placeholder="Cari nama, ketua, pengelola..."
                            className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-xs"
                          />
                          {orgSearchQuery && (
                            <button
                              type="button"
                              onClick={() => {
                                setOrgSearchQuery('');
                                setOrgCurrentPage(1);
                              }}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Hapus pencarian"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}

                      {isAdminOrSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => setShowNewOrgModal(true)}
                          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Organisasi Baru</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Grid of Organization Cards */}
                  {displayedOrganizations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
                        <Users className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Belum Ada Organisasi yang Ditugaskan</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Akun Anda (<strong className="text-slate-700">@{currentUser?.username}</strong>) belum ditugaskan untuk mengelola organisasi manapun. Silakan hubungi Super Admin atau Admin untuk mendapatkan penugasan organisasi.
                      </p>
                    </div>
                  ) : filteredOrganizations.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto border border-slate-200">
                        <Search className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Organisasi Tidak Ditemukan</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Tidak ada organisasi yang cocok dengan kata kunci &quot;<strong className="text-slate-700">{orgSearchQuery}</strong>&quot;.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setOrgSearchQuery('');
                          setOrgCurrentPage(1);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors"
                      >
                        Reset Pencarian
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {paginatedOrganizations.map((org) => {
                          const logoSrc = org.logo
                            ? (isGoogleDriveUrl(org.logo) ? formatGoogleDriveImageUrl(org.logo) : org.logo)
                            : '';
                          const leaderPhoto = org.leader?.photo
                            ? (isGoogleDriveUrl(org.leader.photo) ? formatGoogleDriveImageUrl(org.leader.photo) : org.leader.photo)
                            : '';

                          return (
                            <div
                              key={org.id}
                              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between group"
                            >
                              <div>
                                {/* Card Top: Logo & Actions */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 p-2 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                    {logoSrc ? (
                                      <img src={logoSrc} alt={org.shortName} className="w-full h-full object-contain" />
                                    ) : (
                                      <span className="text-sm font-black text-blue-700">
                                        {org.shortName.slice(0, 3).toUpperCase()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedOrganizationSlug(org.slug);
                                        setActiveTab('organization', `/organisasi/${org.slug}`);
                                      }}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                      title="Lihat Halaman Publik"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </button>
                                    {isAdminOrSuperAdmin && organizations.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteOrg(org.id, org.shortName)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Hapus Organisasi"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Org Info */}
                                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-700 transition-colors">
                                  {org.name}
                                </h3>
                                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                                  {org.shortName}
                                </span>
                                <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                  {org.description || 'Belum ada deskripsi singkat organisasi.'}
                                </p>

                                {/* Leader Snippet */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                    {leaderPhoto ? (
                                      <img src={leaderPhoto} alt="Ketua" className="w-full h-full object-cover object-top" />
                                    ) : (
                                      <User className="w-4 h-4 text-slate-400" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ketua Terpilih</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {org.leader?.name || 'Belum Ditentukan'}
                                    </p>
                                  </div>
                                </div>

                                {/* Akun Pengelola */}
                                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pengelola:</span>
                                  </div>
                                  {org.assignedUsername ? (
                                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60 truncate max-w-[140px]" title={`Dikelola oleh @${org.assignedUsername}`}>
                                      @{org.assignedUsername}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                      Semua Admin
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Footer Stats & Button */}
                              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-blue-500" />
                                  <span>{org.officials?.length || 0} Pengurus</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleSelectOrgToEdit(org.id)}
                                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Kelola Organisasi</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Organization Pagination Controls */}
                      {totalOrgPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs mt-6">
                          <div className="text-xs text-slate-500">
                            Menampilkan{' '}
                            <strong className="text-slate-800">
                              {filteredOrganizations.length > 0 ? (orgCurrentPage - 1) * orgItemsPerPage + 1 : 0}
                            </strong>{' '}
                            -{' '}
                            <strong className="text-slate-800">
                              {Math.min(filteredOrganizations.length, orgCurrentPage * orgItemsPerPage)}
                            </strong>{' '}
                            dari <strong className="text-slate-800">{filteredOrganizations.length}</strong> organisasi (Halaman{' '}
                            <strong className="text-slate-800">{orgCurrentPage}</strong> dari{' '}
                            <strong className="text-slate-800">{totalOrgPages}</strong>)
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setOrgCurrentPage(1)}
                              disabled={orgCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="Halaman Pertama"
                            >
                              <ChevronsLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrgCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={orgCurrentPage === 1}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="Halaman Sebelumnya"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(5, totalOrgPages) }, (_, i) => {
                                let pageNum = i + 1;
                                if (totalOrgPages > 5 && orgCurrentPage > 3) {
                                  pageNum = Math.min(orgCurrentPage - 2 + i, totalOrgPages - (4 - i));
                                }
                                return (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={() => setOrgCurrentPage(pageNum)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                                      orgCurrentPage === pageNum
                                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => setOrgCurrentPage((p) => Math.min(totalOrgPages, p + 1))}
                              disabled={orgCurrentPage === totalOrgPages}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="Halaman Selanjutnya"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrgCurrentPage(totalOrgPages)}
                              disabled={orgCurrentPage === totalOrgPages}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                              title="Halaman Terakhir"
                            >
                              <ChevronsRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* VIEW B: PENGATURAN ORGANISASI TERPILIH */
                <div className="space-y-6">
                  {/* Top Navigation & Action Header */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedOrgIdForEdit(null)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1"
                        title="Kembali ke Daftar Organisasi"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-xs hidden sm:inline">Daftar Organisasi</span>
                      </button>

                      <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 p-1.5 flex items-center justify-center shrink-0">
                          {orgForm.logo ? (
                            <img 
                              src={isGoogleDriveUrl(orgForm.logo) ? formatGoogleDriveImageUrl(orgForm.logo) : orgForm.logo} 
                              alt={orgForm.shortName} 
                              className="w-full h-full object-contain" 
                            />
                          ) : (
                            <span className="text-xs font-black text-blue-600">
                              {orgForm.shortName.slice(0, 3).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
                              Pengaturan {orgForm.shortName}
                            </h2>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Aktif
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate max-w-md">
                            {orgForm.name}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrganizationSlug(orgForm.slug);
                          setActiveTab('organization', `/organisasi/${orgForm.slug}`);
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        <span className="hidden sm:inline">Lihat di Web</span>
                      </button>

                      <button
                        type="button"
                        disabled={isSavingOrg}
                        onClick={() => handleSaveOrgCMS()}
                        className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                      >
                        {isSavingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSavingOrg ? 'Menyimpan...' : 'Simpan Seluruh Perubahan'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Penugasan Akun Pengelola Organisasi */}
                  <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 rounded-2xl border border-blue-200/80 p-4 sm:p-5 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                          <UserCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-extrabold text-slate-900">
                              Akun Pengelola Organisasi
                            </h3>
                            {orgForm.assignedUsername ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                @{orgForm.assignedUsername}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                                Semua Admin
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 max-w-xl">
                            Pilih akun yang berhak membuka menu Organisasi dan mengelola data serta struktur pengurus <strong className="text-slate-800">{orgForm.shortName}</strong>.
                          </p>
                        </div>
                      </div>

                      {isAdminOrSuperAdmin ? (
                        <div className="w-full md:w-80 shrink-0">
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Pilih Akun Penanggung Jawab:
                          </label>
                          <select
                            value={orgForm.assignedUsername || ''}
                            onChange={(e) => setOrgForm({ ...orgForm, assignedUsername: e.target.value || undefined })}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          >
                            <option value="">Semua Admin (Tidak dibatasi akun khusus)</option>
                            {adminUsers.map((u) => (
                              <option key={u.id} value={u.username}>
                                @{u.username} — {u.name} ({u.role})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="px-3.5 py-2 rounded-xl bg-white/90 border border-blue-200 text-xs text-blue-900 font-medium shrink-0 self-start md:self-auto">
                          Dikelola oleh akun Anda (<strong className="font-bold">@{currentUser?.username}</strong>)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sub-Tab Selector */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => setActiveOrgSubTab('sambutan')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeOrgSubTab === 'sambutan'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>1. Sambutan Ketua Organisasi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveOrgSubTab('pengurus')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeOrgSubTab === 'pengurus'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>2. Daftar Pengurus ({orgForm.officials?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveOrgSubTab('visi-misi')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeOrgSubTab === 'visi-misi'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>3. Visi & Misi</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveOrgSubTab('identitas')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeOrgSubTab === 'identitas'
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>4. Profil, Kontak & Media Sosial</span>
                    </button>
                  </div>

                  {/* SUBTAB 1: SAMBUTAN KETUA */}
                  {activeOrgSubTab === 'sambutan' && (
                    <form onSubmit={handleSaveOrgCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span>Profil & Naskah Sambutan Ketua {orgForm.shortName}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Teks dan foto ketua ini akan tampil secara terhormat pada bagian teratas profil organisasi di website.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap & Gelar Ketua</label>
                          <input
                            type="text"
                            value={orgForm.leader?.name || ''}
                            onChange={(e) => setOrgForm({
                              ...orgForm,
                              leader: { ...orgForm.leader, name: e.target.value }
                            })}
                            placeholder="Contoh: SUHARTO, S.Pd., M.Pd."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Jabatan Resmi</label>
                          <input
                            type="text"
                            value={orgForm.leader?.title || ''}
                            onChange={(e) => setOrgForm({
                              ...orgForm,
                              leader: { ...orgForm.leader, title: e.target.value }
                            })}
                            placeholder={`Contoh: Ketua ${orgForm.shortName}`}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Masa Bakti / Periode Kepengurusan</label>
                          <input
                            type="text"
                            value={orgForm.leader?.period || ''}
                            onChange={(e) => setOrgForm({
                              ...orgForm,
                              leader: { ...orgForm.leader, period: e.target.value }
                            })}
                            placeholder="Contoh: Masa Bakti 2024 - 2029"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Judul Sambutan / Headline</label>
                          <input
                            type="text"
                            value={orgForm.leader?.speechTitle || ''}
                            onChange={(e) => setOrgForm({
                              ...orgForm,
                              leader: { ...orgForm.leader, speechTitle: e.target.value }
                            })}
                            placeholder="Contoh: Tingkatkan Soliditas dan Profesionalisme Guru Menuju Generasi Emas"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Photo Ketua Uploader */}
                      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                            <span>Foto Resmi Ketua Organisasi</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Pilih File Atau Tautan Drive
                          </span>
                        </label>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                          <div className="w-20 h-24 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center">
                            {orgForm.leader?.photo ? (
                              <img
                                src={isGoogleDriveUrl(orgForm.leader.photo) ? formatGoogleDriveImageUrl(orgForm.leader.photo) : orgForm.leader.photo}
                                alt="Foto Ketua"
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <User className="w-8 h-8 text-slate-400" />
                            )}
                          </div>

                          <div className="space-y-2.5 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                ref={orgLeaderPhotoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLeaderPhotoUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => orgLeaderPhotoInputRef.current?.click()}
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Pilih Foto dari Galeri / Komputer</span>
                              </button>
                              {orgForm.leader?.photo && (
                                <button
                                  type="button"
                                  onClick={() => setOrgForm({
                                    ...orgForm,
                                    leader: { ...orgForm.leader, photo: '' }
                                  })}
                                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
                                >
                                  Hapus Foto
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                placeholder="Atau tempelkan tautan Google Drive / URL foto ketua..."
                                value={orgLeaderDriveInput}
                                onChange={(e) => {
                                  setOrgLeaderDriveInput(e.target.value);
                                  const formatted = formatGoogleDriveImageUrl(e.target.value.trim());
                                  setOrgForm({
                                    ...orgForm,
                                    leader: { ...orgForm.leader, photo: formatted }
                                  });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Teks Sambutan Lengkap */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>Naskah Lengkap Sambutan Ketua</span>
                          <span className="text-[10px] text-slate-400">Mendukung paragraf baru (Enter)</span>
                        </label>
                        <textarea
                          rows={10}
                          value={orgForm.leader?.speech || ''}
                          onChange={(e) => setOrgForm({
                            ...orgForm,
                            leader: { ...orgForm.leader, speech: e.target.value }
                          })}
                          placeholder="Ketikkan naskah sambutan resmi ketua organisasi..."
                          className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-normal"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingOrg}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Sambutan Ketua</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SUBTAB 2: DAFTAR PENGURUS */}
                  {activeOrgSubTab === 'pengurus' && (
                    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>Daftar Pengurus & Jabatan {orgForm.shortName}</span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Kelola susunan pengurus organisasi, foto, jabatan resmi, divisi, dan urutan tampilan.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleOpenAddOfficial}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Tambah Pengurus</span>
                        </button>
                      </div>

                      {/* Officials List Table */}
                      {orgForm.officials && orgForm.officials.length > 0 ? (
                        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                                <th className="py-3 px-4 w-12 text-center">Urutan</th>
                                <th className="py-3 px-4 w-16 text-center">Foto</th>
                                <th className="py-3 px-4">Nama Pengurus</th>
                                <th className="py-3 px-4">Jabatan</th>
                                <th className="py-3 px-4">Bidang / Divisi</th>
                                <th className="py-3 px-4">NIP / Identitas</th>
                                <th className="py-3 px-4 text-right w-24">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {[...orgForm.officials]
                                .sort((a, b) => (Number(a.order) || 99) - (Number(b.order) || 99))
                                .map((off, idx) => {
                                  const photoSrc = off.photo
                                    ? (isGoogleDriveUrl(off.photo) ? formatGoogleDriveImageUrl(off.photo) : off.photo)
                                    : '';

                                  return (
                                    <tr key={off.id} className="hover:bg-blue-50/40 transition-colors">
                                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                                        {off.order || idx + 1}
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden mx-auto border border-slate-200 flex items-center justify-center">
                                          {photoSrc ? (
                                            <img src={photoSrc} alt={off.name} className="w-full h-full object-cover object-top" />
                                          ) : (
                                            <User className="w-4 h-4 text-slate-400" />
                                          )}
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 font-bold text-slate-900">
                                        {off.name}
                                      </td>
                                      <td className="py-3 px-4">
                                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold border border-blue-200/80">
                                          {off.role}
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-slate-600">
                                        {off.division || '-'}
                                      </td>
                                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                                        {off.nip || '-'}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleOpenEditOfficial(off)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                            title="Edit Data Pengurus"
                                          >
                                            <Edit3 className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteOfficialItem(off.id)}
                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                            title="Hapus Pengurus"
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
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                          <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                          <p className="font-semibold text-xs text-slate-600">Belum ada pengurus yang ditambahkan.</p>
                          <p className="text-[11px] mt-0.5">Klik tombol "+ Tambah Pengurus" di atas untuk menambahkan pengurus baru.</p>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          disabled={isSavingOrg}
                          onClick={() => handleSaveOrgCMS()}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Daftar Pengurus</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* SUBTAB 3: VISI DAN MISI */}
                  {activeOrgSubTab === 'visi-misi' && (
                    <form onSubmit={handleSaveOrgCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span>Rumusan Visi dan Misi {orgForm.shortName}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tentukan cita-cita besar dan langkah-langkah misi strategis pelaksanaan organisasi.
                        </p>
                      </div>

                      {/* Visi */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Rumusan Visi Organisasi</label>
                        <textarea
                          rows={3}
                          value={orgForm.vision || ''}
                          onChange={(e) => setOrgForm({ ...orgForm, vision: e.target.value })}
                          placeholder="Ketikkan rumusan visi organisasi..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Misi List Repeater */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-700 block">
                          Poin-Poin Misi Organisasi ({orgForm.missions?.length || 0})
                        </label>

                        {orgForm.missions && orgForm.missions.length > 0 ? (
                          <div className="space-y-2">
                            {orgForm.missions.map((m, idx) => (
                              <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={m}
                                  onChange={(e) => {
                                    const updated = [...orgForm.missions];
                                    updated[idx] = e.target.value;
                                    setOrgForm({ ...orgForm, missions: updated });
                                  }}
                                  className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOrgMission(idx)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                  title="Hapus Poin Misi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 italic">Belum ada poin misi.</p>
                        )}

                        {/* Add Misi Input */}
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            type="text"
                            value={newOrgMissionText}
                            onChange={(e) => setNewOrgMissionText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOrgMission();
                              }
                            }}
                            placeholder="Ketik poin misi baru lalu tekan enter atau klik tambah..."
                            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleAddOrgMission}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 shrink-0"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Misi</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingOrg}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Visi & Misi</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* SUBTAB 4: IDENTITAS & PROFIL */}
                  {activeOrgSubTab === 'identitas' && (
                    <form onSubmit={handleSaveOrgCMS} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>Identitas, Logo & Kontak {orgForm.shortName}</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Atur nama resmi organisasi, lambang/logo, tautan URL slug, alamat sekretariat, dan kontak resmi.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nama Lengkap Organisasi</label>
                          <input
                            type="text"
                            required
                            value={orgForm.name}
                            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nama Singkat / Singkatan</label>
                          <input
                            type="text"
                            required
                            value={orgForm.shortName}
                            onChange={(e) => setOrgForm({ ...orgForm, shortName: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Slug URL Website (/organisasi/:slug)</label>
                          <input
                            type="text"
                            required
                            value={orgForm.slug}
                            onChange={(e) => setOrgForm({
                              ...orgForm,
                              slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
                            })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Alamat Sekretariat</label>
                          <input
                            type="text"
                            value={orgForm.address || ''}
                            onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                            placeholder="Contoh: Gedung Guru PGRI Cabang Purwodadi"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp</label>
                          <input
                            type="text"
                            value={orgForm.phone || ''}
                            onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                            placeholder="0812-xxxx-xxxx"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Alamat Email Resmi</label>
                          <input
                            type="email"
                            value={orgForm.email || ''}
                            onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                            placeholder="organisasi@gmail.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Logo Uploader */}
                      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5 text-blue-600" />
                            <span>Logo Lambang Organisasi</span>
                          </span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            Pilih File Atau Tautan Drive
                          </span>
                        </label>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-2 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                            {orgForm.logo ? (
                              <img
                                src={isGoogleDriveUrl(orgForm.logo) ? formatGoogleDriveImageUrl(orgForm.logo) : orgForm.logo}
                                alt="Logo"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Building2 className="w-8 h-8 text-slate-400" />
                            )}
                          </div>

                          <div className="space-y-2.5 flex-1 w-full">
                            <div className="flex flex-wrap items-center gap-2">
                              <input
                                ref={orgLogoInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                              <button
                                type="button"
                                onClick={() => orgLogoInputRef.current?.click()}
                                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                              >
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>Pilih Logo dari Komputer / HP</span>
                              </button>
                              {orgForm.logo && (
                                <button
                                  type="button"
                                  onClick={() => setOrgForm({ ...orgForm, logo: '' })}
                                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors"
                                >
                                  Hapus Logo
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="url"
                                placeholder="Atau masukkan tautan Google Drive / URL logo..."
                                value={orgLogoDriveInput}
                                onChange={(e) => {
                                  setOrgLogoDriveInput(e.target.value);
                                  const formatted = formatGoogleDriveImageUrl(e.target.value.trim());
                                  setOrgForm({ ...orgForm, logo: formatted });
                                }}
                                className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Akun Media Sosial & Website Resmi */}
                      <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/20 border border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-3">
                          <div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-blue-600" />
                              <span>Akun Media Sosial & Website Resmi</span>
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Tautkan kanal publik organisasi. Kosongkan jika belum memiliki akun, dan otomatis tidak akan tampil di website publik.
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto border border-blue-200">
                            Tampil Kondisional
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                          
                          {/* Website Official */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                  <WebsiteIcon className="w-3.5 h-3.5" />
                                </span>
                                <span>Website Official / Portal</span>
                              </label>
                              {orgForm.socialMedia?.website && (
                                <a 
                                  href={formatExternalUrl(orgForm.socialMedia.website)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>Tes Tautan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <input
                              type="url"
                              value={orgForm.socialMedia?.website || ''}
                              onChange={(e) => setOrgForm({
                                ...orgForm,
                                socialMedia: {
                                  ...orgForm.socialMedia,
                                  website: e.target.value
                                }
                              })}
                              placeholder="Contoh: https://pgri-purwodadi.or.id"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* TikTok */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                                  <TikTokIcon className="w-3 h-3" />
                                </span>
                                <span>TikTok</span>
                              </label>
                              {orgForm.socialMedia?.tiktok && (
                                <a 
                                  href={formatExternalUrl(orgForm.socialMedia.tiktok)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>Tes Tautan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <input
                              type="url"
                              value={orgForm.socialMedia?.tiktok || ''}
                              onChange={(e) => setOrgForm({
                                ...orgForm,
                                socialMedia: {
                                  ...orgForm.socialMedia,
                                  tiktok: e.target.value
                                }
                              })}
                              placeholder="Contoh: https://www.tiktok.com/@pgripurwodadi"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* Facebook */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0">
                                  <FacebookIcon className="w-3.5 h-3.5" />
                                </span>
                                <span>Facebook (Halaman / Profil)</span>
                              </label>
                              {orgForm.socialMedia?.facebook && (
                                <a 
                                  href={formatExternalUrl(orgForm.socialMedia.facebook)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>Tes Tautan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <input
                              type="url"
                              value={orgForm.socialMedia?.facebook || ''}
                              onChange={(e) => setOrgForm({
                                ...orgForm,
                                socialMedia: {
                                  ...orgForm.socialMedia,
                                  facebook: e.target.value
                                }
                              })}
                              placeholder="Contoh: https://www.facebook.com/pgripurwodadi"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* Instagram */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shrink-0">
                                  <InstagramIcon className="w-3.5 h-3.5" />
                                </span>
                                <span>Instagram</span>
                              </label>
                              {orgForm.socialMedia?.instagram && (
                                <a 
                                  href={formatExternalUrl(orgForm.socialMedia.instagram)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>Tes Tautan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <input
                              type="url"
                              value={orgForm.socialMedia?.instagram || ''}
                              onChange={(e) => setOrgForm({
                                ...orgForm,
                                socialMedia: {
                                  ...orgForm.socialMedia,
                                  instagram: e.target.value
                                }
                              })}
                              placeholder="Contoh: https://www.instagram.com/pgripurwodadi"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* YouTube */}
                          <div className="space-y-1.5 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center shrink-0">
                                  <YoutubeIcon className="w-3.5 h-3.5" />
                                </span>
                                <span>Kanal YouTube</span>
                              </label>
                              {orgForm.socialMedia?.youtube && (
                                <a 
                                  href={formatExternalUrl(orgForm.socialMedia.youtube)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                >
                                  <span>Tes Tautan</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                            <input
                              type="url"
                              value={orgForm.socialMedia?.youtube || ''}
                              onChange={(e) => setOrgForm({
                                ...orgForm,
                                socialMedia: {
                                  ...orgForm.socialMedia,
                                  youtube: e.target.value
                                }
                              })}
                              placeholder="Contoh: https://www.youtube.com/@pgripurwodadi"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                        </div>
                      </div>

                      {/* Akun Pengelola Organisasi (Tabel admin_users) */}
                      {isAdminOrSuperAdmin && (
                        <div className="space-y-2 p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-blue-600" />
                            <label className="text-xs font-bold text-slate-800">
                              Akun Pengelola Organisasi (Tabel admin_users)
                            </label>
                          </div>
                          <select
                            value={orgForm.assignedUsername || ''}
                            onChange={(e) => setOrgForm({ ...orgForm, assignedUsername: e.target.value || undefined })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          >
                            <option value="">Semua Admin (Tidak dibatasi akun khusus)</option>
                            {adminUsers.map((u) => (
                              <option key={u.id} value={u.username}>
                                @{u.username} — {u.name} ({u.role})
                              </option>
                            ))}
                          </select>
                          <p className="text-[11px] text-slate-500">
                            Akun yang dipilih akan memiliki hak akses untuk membuka menu Organisasi di CMS dan mengelola data {orgForm.shortName}.
                          </p>
                        </div>
                      )}

                      {/* Deskripsi Singkat */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Deskripsi Singkat Profil Organisasi</label>
                        <textarea
                          rows={3}
                          value={orgForm.description}
                          onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingOrg}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>Simpan Identitas Organisasi</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              )}
            </div>
          )}

          {/* TAB 4.8: KELOLA PERSYARATAN PELAYANAN */}
          {currentSection === 'service-requirements-cms' && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200/60 mb-2">
                    <ClipboardList className="w-3.5 h-3.5" />
                    <span>Standar Pelayanan Publik Korwilcam</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Kelola Persyaratan Pelayanan
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur daftar jenis pelayanan dan berkas persyaratan yang harus dipenuhi oleh pemohon (Guru, Sekolah, Siswa, dan Masyarakat Umum).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {serviceRequirements.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetDefaultReqs}
                      className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5"
                      title="Kosongkan seluruh data persyaratan pelayanan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleOpenAddReqModal}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pelayanan</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  {/* Search Input */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={reqSearchQuery}
                      onChange={(e) => setReqSearchQuery(e.target.value)}
                      placeholder="Cari jenis pelayanan atau kata kunci berkas..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                    />
                    {reqSearchQuery && (
                      <button
                        onClick={() => setReqSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Quick Counter */}
                  <div className="text-xs text-slate-500 font-medium px-2 shrink-0">
                    Menampilkan <span className="font-bold text-slate-800">{
                      serviceRequirements.filter(item => {
                        const q = reqSearchQuery.toLowerCase();
                        const cat = item.category || 'Kepegawaian & GTK';
                        const reqs = Array.isArray(item.requirements) ? item.requirements : [];
                        const matchesQuery = !q || 
                          item.title.toLowerCase().includes(q) ||
                          cat.toLowerCase().includes(q) ||
                          reqs.some(r => r.toLowerCase().includes(q));
                        const matchesCat = reqCategoryFilter === 'Semua' || cat === reqCategoryFilter;
                        return matchesQuery && matchesCat;
                      }).length
                    }</span> dari <span className="font-bold text-slate-800">{serviceRequirements.length}</span> layanan
                  </div>
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-semibold mr-1 shrink-0">Kategori:</span>
                  {['Semua', ...allReqCategories].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setReqCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all ${
                        reqCategoryFilter === cat
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Cards / Table */}
              {serviceRequirements
                .filter(item => {
                  const q = reqSearchQuery.toLowerCase();
                  const cat = item.category || 'Kepegawaian & GTK';
                  const reqs = Array.isArray(item.requirements) ? item.requirements : [];
                  const matchesQuery = !q || 
                    item.title.toLowerCase().includes(q) ||
                    cat.toLowerCase().includes(q) ||
                    reqs.some(r => r.toLowerCase().includes(q));
                  const matchesCat = reqCategoryFilter === 'Semua' || cat === reqCategoryFilter;
                  return matchesQuery && matchesCat;
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .length === 0 ? (
                <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 shadow-sm space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5 max-w-lg mx-auto">
                    <h3 className="font-bold text-slate-900 text-base">
                      {reqSearchQuery || reqCategoryFilter !== 'Semua' 
                        ? 'Tidak Ditemukan Hasil Pencarian' 
                        : 'Belum Ada Data Persyaratan Pelayanan'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {reqSearchQuery || reqCategoryFilter !== 'Semua'
                        ? 'Tidak ditemukan pelayanan yang sesuai dengan kata kunci atau filter pencarian Anda.'
                        : 'Belum ada data jenis pelayanan yang tersimpan. Klik tombol Tambah Pelayanan Baru di bawah untuk mulai menambahkan.'}
                    </p>
                  </div>

                  {reqSearchQuery || reqCategoryFilter !== 'Semua' ? (
                    <button
                      onClick={() => {
                        setReqSearchQuery('');
                        setReqCategoryFilter('Semua');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                    >
                      Reset Filter
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleOpenAddReqModal}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Pelayanan Baru</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {serviceRequirements
                    .filter(item => {
                      const q = reqSearchQuery.toLowerCase();
                      const cat = item.category || 'Kepegawaian & GTK';
                      const reqs = Array.isArray(item.requirements) ? item.requirements : [];
                      const matchesQuery = !q || 
                        item.title.toLowerCase().includes(q) ||
                        cat.toLowerCase().includes(q) ||
                        reqs.some(r => r.toLowerCase().includes(q));
                      const matchesCat = reqCategoryFilter === 'Semua' || cat === reqCategoryFilter;
                      return matchesQuery && matchesCat;
                    })
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                #{item.order || 1}
                              </span>
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                {item.category}
                              </span>
                              {item.estimatedTime && (
                                <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{item.estimatedTime}</span>
                                </span>
                              )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h3>
                            {item.description && (
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                            <button
                              type="button"
                              onClick={() => handleOpenEditReqModal(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                              title="Edit pelayanan dan persyaratan"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReq(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                              title="Hapus pelayanan ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>

                        {/* Checklist Preview Box */}
                        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                              <span>Berkas Persyaratan ({item.requirements?.length || 0} butir):</span>
                            </span>
                          </div>
                          <ul className="space-y-1.5 pl-1">
                            {item.requirements?.slice(0, 5).map((req, idx) => (
                              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="flex-1">{req}</span>
                              </li>
                            ))}
                            {(item.requirements?.length || 0) > 5 && (
                              <li className="text-[11px] text-blue-600 font-semibold italic pl-6 pt-0.5">
                                + {(item.requirements?.length || 0) - 5} berkas persyaratan lainnya...
                              </li>
                            )}
                          </ul>

                          {item.notes && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-amber-800 bg-amber-50/80 px-2.5 py-1.5 rounded-lg flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                              <span><strong>Catatan:</strong> {item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Modal Tambah / Edit Pelayanan */}
              {isReqModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                  <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    
                    {/* Modal Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <ClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">
                            {editingReqId ? 'Edit Jenis Pelayanan' : 'Tambah Jenis Pelayanan Baru'}
                          </h3>
                          <p className="text-[11px] text-slate-500">
                            Kelola judul layanan, deskripsi, dan rincian berkas persyaratan.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReqModalOpen(false)}
                        className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Modal Body (Scrollable) */}
                    <form onSubmit={handleSaveReq} className="flex-1 overflow-y-auto p-6 space-y-5">
                      
                      {/* Judul Pelayanan */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Judul Jenis Pelayanan *
                        </label>
                        <input
                          type="text"
                          required
                          value={reqForm.title}
                          onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })}
                          placeholder="Contoh: Pengusulan Kenaikan Pangkat (KP) Guru & Tendik"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Kategori & Nomor Urut */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-700">
                              Kategori Pelayanan *
                            </label>
                            {!isAddingReqCategory && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingReqCategory(true);
                                  setNewReqCategoryInput('');
                                }}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Tambah Kategori</span>
                              </button>
                            )}
                          </div>

                          {!isAddingReqCategory ? (
                            <div className="flex items-center gap-1.5">
                              <select
                                value={reqForm.category}
                                onChange={(e) => setReqForm({ ...reqForm, category: e.target.value })}
                                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                              >
                                {allReqCategories.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingReqCategory(true);
                                  setNewReqCategoryInput('');
                                }}
                                title="Tambah Kategori Baru (+)"
                                className="h-[38px] px-2.5 sm:px-3 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border border-blue-200 rounded-xl flex items-center justify-center gap-1 text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline text-xs">Tambah</span>
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  autoFocus
                                  value={newReqCategoryInput}
                                  onChange={(e) => setNewReqCategoryInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveNewCategory();
                                    } else if (e.key === 'Escape') {
                                      e.preventDefault();
                                      handleCancelNewCategory();
                                    }
                                  }}
                                  placeholder="Ketik nama kategori baru..."
                                  className="flex-1 px-3.5 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleSaveNewCategory}
                                  title="Simpan Kategori Baru"
                                  className="h-[38px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-sm shrink-0 transition-all active:scale-95"
                                >
                                  <Check className="w-4 h-4 stroke-[2.5]" />
                                  <span>Simpan</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelNewCategory}
                                  title="Batal"
                                  className="h-[38px] w-9 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 italic">
                                Ketik nama kategori baru, lalu klik tombol centang (Simpan) atau tekan tombol Enter.
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">
                            Nomor Urut
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={reqForm.order}
                            onChange={(e) => setReqForm({ ...reqForm, order: parseInt(e.target.value, 10) || 1 })}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Estimasi Waktu Penyelesaian */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>Estimasi Waktu Penyelesaian</span>
                        </label>
                        <input
                          type="text"
                          value={reqForm.estimatedTime}
                          onChange={(e) => setReqForm({ ...reqForm, estimatedTime: e.target.value })}
                          placeholder="Contoh: 1 - 3 Hari Kerja, atau Langsung Selesai"
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                        />
                      </div>

                      {/* Deskripsi Singkat */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Deskripsi / Ringkasan Layanan
                        </label>
                        <textarea
                          rows={2}
                          value={reqForm.description}
                          onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                          placeholder="Penjelasan singkat mengenai peruntukan atau tujuan dari layanan ini..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* PERSYARATAN BERKAS (Manual & Paste) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <span>Daftar Berkas Persyaratan *</span>
                            </label>
                            <span className="text-[11px] text-slate-500">
                              Tambahkan satu per satu secara manual atau salin tempel (paste) banyak baris sekaligus.
                            </span>
                          </div>

                          {/* Mode Switcher */}
                          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 self-start">
                            <button
                              type="button"
                              onClick={() => {
                                setReqFormInputMode('list');
                                if (reqForm.requirementsText) {
                                  const lines = reqForm.requirementsText
                                    .split('\n')
                                    .map((s) => s.trim().replace(/^[-*•\d+.]\s*/, ''))
                                    .filter(Boolean);
                                  if (lines.length > 0) {
                                    setReqForm((prev) => ({ ...prev, requirements: lines }));
                                  }
                                }
                              }}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                reqFormInputMode === 'list'
                                  ? 'bg-white text-blue-700 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Per Baris (Daftar)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReqFormInputMode('text');
                                const joined = reqForm.requirements.filter(Boolean).join('\n');
                                setReqForm((prev) => ({ ...prev, requirementsText: joined }));
                              }}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                                reqFormInputMode === 'text'
                                  ? 'bg-white text-blue-700 shadow-sm'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Paste Multi-Baris
                            </button>
                          </div>
                        </div>

                        {/* Input Mode 1: List with Add/Remove */}
                        {reqFormInputMode === 'list' ? (
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {reqForm.requirements.map((req, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                  {idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={req}
                                  onChange={(e) => handleReqItemChange(idx, e.target.value)}
                                  placeholder={`Contoh: Fotokopi SK Terakhir legalisir basah...`}
                                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                                />
                                {reqForm.requirements.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveReqItem(idx)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Hapus butir ini"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={handleAddReqItem}
                              className="w-full py-2 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 hover:bg-blue-50/70 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Tambah Butir Persyaratan Baru</span>
                            </button>
                          </div>
                        ) : (
                          /* Input Mode 2: Multi-line Text Area for easy pasting */
                          <div className="space-y-1.5">
                            <textarea
                              rows={5}
                              value={reqForm.requirementsText}
                              onChange={(e) => setReqForm({ ...reqForm, requirementsText: e.target.value })}
                              placeholder={`Contoh Paste:\nSurat Pengantar dari Kepala Sekolah\nFotokopi SK Pangkat Terakhir\nFotokopi SKP 2 Tahun Terakhir\nPakta Integritas bermaterai 10.000`}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-mono leading-relaxed"
                            />
                            <p className="text-[10px] text-slate-400">
                              * Tip: Tempelkan (paste) daftar dari dokumen Word/PDF. Setiap baris baru otomatis diubah menjadi 1 butir checklist.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Catatan Tambahan */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Catatan Khusus / Informasi Tambahan (Opsional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={reqForm.notes}
                          onChange={(e) => setReqForm({ ...reqForm, notes: e.target.value })}
                          placeholder="Contoh: Berkas dibuat rangkap 2 (1 asli, 1 legalisir), dimasukkan map snelhecter warna merah..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Modal Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setIsReqModalOpen(false)}
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>{editingReqId ? 'Simpan Perubahan' : 'Simpan Layanan Baru'}</span>
                        </button>
                      </div>
                    </form>
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Kategori Berkas</label>
                      {!isAddingDocCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingDocCategory(true);
                            setNewDocCategoryInput('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                          title="Tambah Kategori Berkas Baru (+)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Kategori</span>
                        </button>
                      )}
                    </div>

                    {!isAddingDocCategory ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={docForm.category}
                          onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          {documentCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat === 'Kurikulum' ? 'Kurikulum Merdeka' :
                               cat === 'Blanko GTK' ? 'Blanko Administrasi GTK' :
                               cat === 'Juknis Lomba' ? 'Juknis Lomba & O2SN' : cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingDocCategory(true);
                            setNewDocCategoryInput('');
                          }}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all hover:scale-105 shrink-0 flex items-center justify-center"
                          title="Tambah Kategori Berkas Baru (+)"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={newDocCategoryInput}
                            onChange={(e) => setNewDocCategoryInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveDocCategory();
                              } else if (e.key === 'Escape') {
                                setIsAddingDocCategory(false);
                              }
                            }}
                            placeholder="Ketik nama kategori berkas baru..."
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-semibold focus:outline-none shadow-sm"
                          />
                          <button
                            type="button"
                            disabled={isSavingDocCategory}
                            onClick={handleSaveDocCategory}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                            title="Simpan Kategori Baru ke Database (V)"
                          >
                            {isSavingDocCategory ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>V</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingDocCategory(false);
                              setNewDocCategoryInput('');
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shrink-0 flex items-center justify-center"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Ketik nama kategori lalu klik tombol <b>V</b> (atau tekan Enter). Kategori akan langsung tersimpan di Supabase Cloud.
                        </p>
                      </div>
                    )}
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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {doc.category} • {doc.fileType} ({doc.fileSize})
                        </span>
                        {doc.id.startsWith('doc-ann-') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Dari Pengumuman / Edaran</span>
                          </span>
                        )}
                      </div>
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
                        onClick={async () => {
                          const confirmed = await showConfirmDialog({
                            title: 'Hapus Dokumen Unduhan?',
                            message: `Apakah Anda yakin ingin menghapus berkas dokumen "${doc.title}"?`,
                            type: 'delete',
                            itemName: doc.title,
                            confirmText: 'Ya, Hapus Dokumen',
                            cancelText: 'Tidak, Batalkan'
                          });
                          if (!confirmed) return;
                          deleteDocument(doc.id);
                          showNoticePopup({
                            title: 'Dokumen Dihapus!',
                            message: `Dokumen "${doc.title}" telah berhasil dihapus.`,
                            type: 'success'
                          });
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

          {/* TAB 5.5: KELOLA PERMINTAAN DATA (WEBVIEW) */}
          {currentSection === 'data-request-cms' && (
            <div className="space-y-8 max-w-5xl">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                    <Database className="w-6 h-6 text-blue-600" />
                    Kelola Layanan Permintaan Data (Webview)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur formulir online (Google Form, Spreadsheet, dsb.) yang ditampilkan sebagai Webview di website publik.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('service-permintaan-data', '/layanan/permintaan-data')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-all shadow-sm"
                  >
                    <span>Lihat Halaman Publik</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 1. Form Isian Tautan */}
              <div id="data-request-form-card" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {editingDataRequestId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        {editingDataRequestId ? 'Edit Tautan Formulir Permintaan Data' : 'Tambah Tautan Formulir Baru'}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Isi form di bawah ini lalu periksa langsung live preview webview-nya.
                      </p>
                    </div>
                  </div>
                  {editingDataRequestId && (
                    <button
                      type="button"
                      onClick={handleCancelEditDataRequest}
                      className="px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveDataRequest} className="space-y-4">
                  {/* Judul Formulir */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Judul Layanan / Formulir Permintaan Data <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dataReqTitle}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setDataReqTitle(newTitle);
                        if (!editingDataRequestId || !dataReqSlug) {
                          setDataReqSlug(generateDataRequestSlug(newTitle));
                        }
                      }}
                      placeholder="Contoh: Formulir Permintaan Data Pendidikan Korwilcam Purwodadi"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  {/* Slug URL Link Share */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kustomisasi Slug URL Link Share (Otomatis Dibuat)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl select-none font-mono">
                        /layanan/permintaan-data/
                      </span>
                      <input
                        type="text"
                        value={dataReqSlug}
                        onChange={(e) => setDataReqSlug(generateDataRequestSlug(e.target.value))}
                        placeholder={generateDataRequestSlug(dataReqTitle) || 'slug-link-otomatis'}
                        className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      🔗 <strong className="text-slate-700">Link Share:</strong> Saat formulir dibagikan, link akan langsung menuju form ini:{' '}
                      <span className="text-blue-600 font-mono font-semibold">
                        /layanan/permintaan-data/{dataReqSlug || generateDataRequestSlug(dataReqTitle) || 'slug-link'}
                      </span>
                    </p>
                  </div>

                  {/* URL Tautan Webview */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      URL Link / Webview Formulir <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={dataReqUrl}
                      onChange={(e) => setDataReqUrl(e.target.value)}
                      placeholder="Contoh: https://docs.google.com/forms/d/e/.../viewform?embedded=true atau link situs"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      💡 Tip: Masukkan link formulir online Anda (misal Google Form, Spreadsheet publik, atau website pelayanan terpadu).
                    </p>
                  </div>

                  {/* Keterangan Singkat */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Keterangan / Petunjuk Pengisian (Opsional)
                    </label>
                    <textarea
                      value={dataReqDesc}
                      onChange={(e) => setDataReqDesc(e.target.value)}
                      placeholder="Tuliskan petunjuk singkat atau peruntukan layanan data ini untuk pengunjung..."
                      rows={2}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>

                  {/* Opsi Tambahan: Potong Atas & Status Aktif */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Potong Header Atas / Crop Top (px)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={300}
                        value={dataReqCropTop}
                        onChange={(e) => setDataReqCropTop(Number(e.target.value) || 0)}
                        className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Opsional. Nilai pixel pemangkasan bagian atas (misal 50px untuk memotong header blog/logo). Default: 0.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Status Publikasi
                      </label>
                      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={dataReqIsActive}
                          onChange={(e) => setDataReqIsActive(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                          {dataReqIsActive ? 'Tampilkan di Website Publik (Aktif)' : 'Sembunyikan dari Website Publik (Nonaktif)'}
                        </span>
                      </label>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Hanya tautan berstatus aktif yang akan ditampilkan di halaman publik website.
                      </p>
                    </div>
                  </div>

                  {/* Tombol Aksi Form */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={isSavingDataReq}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSavingDataReq ? 'Menyimpan...' : (editingDataRequestId ? 'Perbarui Tautan' : 'Simpan & Tambahkan Tautan')}
                    </button>
                    {editingDataRequestId && (
                      <button
                        type="button"
                        onClick={handleCancelEditDataRequest}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* 2. Live Preview Webview (Tepat di Bawah Form Isian) */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
                {/* Mockup Browser Toolbar */}
                <div className="bg-slate-900 text-slate-300 px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Window control dots */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    </div>
                    <span className="text-xs font-bold text-white tracking-wide shrink-0">
                      Live Preview Webview
                    </span>
                    {/* Address Bar */}
                    <div className="bg-slate-800 text-slate-300 text-[11px] px-3 py-1 rounded-lg font-mono truncate max-w-xs sm:max-w-md border border-slate-700/60 hidden sm:block">
                      {dataReqUrl.trim() || 'https://... (masukkan link di atas)'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setDataReqPreviewKey((prev) => prev + 1)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                      title="Muat ulang preview"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Refresh Preview</span>
                    </button>
                    {dataReqUrl.trim() && (
                      <a
                        href={dataReqUrl.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                        title="Tes buka di tab baru"
                      >
                        <span>Tes di Tab Baru</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Iframe Preview Container */}
                <div className="w-full h-[520px] relative bg-slate-100 overflow-hidden">
                  {dataReqUrl.trim() ? (
                    <div className="w-full h-full relative overflow-hidden bg-white">
                      <iframe
                        key={dataReqPreviewKey}
                        src={dataReqUrl.trim()}
                        title="Live Preview Webview Permintaan Data"
                        style={
                          dataReqCropTop > 0
                            ? {
                                position: 'absolute',
                                top: `-${dataReqCropTop}px`,
                                left: 0,
                                width: '100%',
                                height: `calc(100% + ${dataReqCropTop}px)`,
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
                        allow="accelerometer; autoplay; clipboard-read; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50">
                      <div className="w-14 h-14 rounded-2xl bg-slate-200/60 text-slate-500 flex items-center justify-center mb-3">
                        <Database className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700 mb-1">
                        Preview Belum Tersedia
                      </h4>
                      <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                        Ketikkan atau tempelkan URL formulir permintaan data pada form isian di atas untuk melihat tampilan live webview secara langsung di kotak ini.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>
                    📌 Status Crop Top: <strong className="text-slate-700">{dataReqCropTop}px</strong>
                  </span>
                  <span>
                    Tampilan ini mensimulasikan webview yang akan dilihat oleh pengunjung website.
                  </span>
                </div>
              </div>

              {/* 3. Daftar Tautan Tersimpan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Daftar Tautan Permintaan Data Tersimpan ({dataRequests.length})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Kelola status aktif, edit URL, atau hapus formulir yang tidak digunakan lagi.
                    </p>
                  </div>
                </div>

                {dataRequests.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Belum ada tautan permintaan data yang tersimpan. Gunakan form di atas untuk menambahkan tautan pertama.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dataRequests.map((req, idx) => (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          editingDataRequestId === req.id
                            ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">
                              {idx + 1}. {req.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                req.isActive !== false
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {req.isActive !== false ? 'Aktif' : 'Nonaktif'}
                            </span>
                            {req.cropTop && req.cropTop > 0 ? (
                              <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded">
                                Crop Top: {req.cropTop}px
                              </span>
                            ) : null}
                          </div>

                          {/* Link Share Publik & Slug */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="text-slate-400 font-medium text-[10px]">Slug Link:</span>
                            <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded">
                              /layanan/permintaan-data/{getDataRequestSlug(req)}
                            </span>
                          </div>

                          <a
                            href={req.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-mono text-slate-500 hover:text-blue-600 hover:underline block truncate max-w-xl"
                            title="Tautan Sumber Webview Asli"
                          >
                            Tautan Asli: {req.url}
                          </a>
                          {req.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {req.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Tombol Salin Link Share */}
                          <button
                            type="button"
                            onClick={() => handleCopyDataRequestShareLink(req)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              copiedDataReqId === req.id
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                            }`}
                            title="Salin tautan langsung formulir ini untuk dibagikan"
                          >
                            {copiedDataReqId === req.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-white" />
                                <span>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-600" />
                                <span>Salin Link</span>
                              </>
                            )}
                          </button>

                          {/* Buka Halaman Publik */}
                          <a
                            href={getDataRequestPath(req)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Buka halaman formulir publik di tab baru"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            type="button"
                            onClick={() => toggleDataRequestActive(req.id)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              req.isActive !== false
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={req.isActive !== false ? 'Nonaktifkan Tautan' : 'Aktifkan Tautan'}
                          >
                            {req.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEditDataRequest(req)}
                            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit & Tampilkan di Form"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDataRequest(req)}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Hapus Tautan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700">Kategori Dokumentasi</label>
                      {!isAddingGalleryCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingGalleryCategory(true);
                            setNewGalleryCategoryInput('');
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition-colors"
                          title="Tambah Kategori Galeri Baru (+)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Tambah Kategori</span>
                        </button>
                      )}
                    </div>

                    {!isAddingGalleryCategory ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          value={galleryForm.category}
                          onChange={(e) => setGalleryForm({ ...galleryForm, category: e.target.value as any })}
                          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        >
                          {galleryCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingGalleryCategory(true);
                            setNewGalleryCategoryInput('');
                          }}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 transition-all hover:scale-105 shrink-0 flex items-center justify-center"
                          title="Tambah Kategori Galeri Baru (+)"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={newGalleryCategoryInput}
                            onChange={(e) => setNewGalleryCategoryInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveGalleryCategory();
                              } else if (e.key === 'Escape') {
                                setIsAddingGalleryCategory(false);
                              }
                            }}
                            placeholder="Ketik nama kategori galeri baru..."
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white border-2 border-blue-500 text-xs font-semibold focus:outline-none shadow-sm"
                          />
                          <button
                            type="button"
                            disabled={isSavingGalleryCategory}
                            onClick={handleSaveGalleryCategory}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-105 shrink-0 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                            title="Simpan Kategori Baru ke Database (V)"
                          >
                            {isSavingGalleryCategory ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>V</span>
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingGalleryCategory(false);
                              setNewGalleryCategoryInput('');
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all shrink-0 flex items-center justify-center"
                            title="Batal"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Ketik nama kategori lalu klik tombol <b>V</b> (atau tekan Enter). Kategori akan langsung tersimpan di Supabase Cloud.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Identitas Akun Login Pengunggah (Otomatis Mendeteksi Nama & Role) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        <span>Nama Pengunggah / Pembuat Album</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        <Lock className="w-2.5 h-2.5 text-slate-500" />
                        <span>Otomatis Akun Login</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={editingGalleryId ? (galleryForm.authorName || activeAuthorName) : (currentUser?.name || activeAuthorName)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 cursor-not-allowed select-none shadow-xs"
                      title="Nama akun yang sedang login otomatis terdeteksi sebagai pembuat/pengunggah dokumentasi foto"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Role Akun Login</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Role Terverifikasi</span>
                      </span>
                    </div>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={editingGalleryId ? (galleryForm.authorRole || activeUserRole) : (currentUser?.role || activeUserRole)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-blue-700 cursor-not-allowed select-none shadow-xs"
                      title="Tingkatan wewenang akun yang login (Super Admin / Admin / Penulis)"
                    />
                  </div>
                </div>

                {/* PENGELOLA FOTO DOKUMENTASI KEGIATAN (GOOGLE DRIVE MULTI-PHOTO) */}
                <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Images className="w-4 h-4 text-blue-600" />
                          <span>Daftar Foto Dokumentasi Kegiatan (Google Drive) *</span>
                        </label>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          galleryForm.images.length > 0 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {galleryForm.images.length} Foto Siap Tayang
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Seluruh foto yang ditambahkan di sini akan tampil berurutan pada <strong>Slide Show</strong> halaman detail galeri.
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsGalleryBatchMode(!isGalleryBatchMode)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                      >
                        {isGalleryBatchMode ? '← Mode Input Satuan' : '📋 Tempel Banyak Link Sekaligus'}
                      </button>

                      {galleryForm.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm('Hapus semua foto dari daftar dokumentasi album ini?')) {
                              setGalleryForm((prev) => ({ ...prev, images: [], coverImage: '' }));
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-[11px] font-bold transition-colors"
                          title="Kosongkan Semua Foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mode Batch: Tempel Banyak Sekaligus */}
                  {isGalleryBatchMode ? (
                    <div className="space-y-3 p-4 bg-white rounded-2xl border border-blue-200 shadow-inner">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Tempel Daftar Link Foto Google Drive:</span>
                        </label>
                        <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                          Satu link per baris atau dipisah koma/spasi
                        </span>
                      </div>

                      <textarea
                        rows={4}
                        value={galleryBatchInput}
                        onChange={(e) => setGalleryBatchInput(e.target.value)}
                        placeholder="Contoh:&#10;https://drive.google.com/file/d/1ABC123.../view&#10;https://drive.google.com/file/d/2XYZ789.../view&#10;https://lh3.googleusercontent.com/d/3DEF456..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                        <p className="text-[11px] text-slate-500">
                          💡 <strong>Tips Cepat dari Drive:</strong> Buka folder Google Drive &gt; Tekan <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[10px]">Ctrl + A</kbd> (pilih semua) &gt; Klik kanan <strong>Salin tautan (Copy link)</strong> &gt; Tempel di sini.
                        </p>
                        <button
                          type="button"
                          onClick={handleAddBatchGalleryPhotos}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition-all hover:scale-102"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Ekstrak & Tambahkan Semua Foto</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Mode Satuan */
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={singleGalleryPhotoInput}
                          onChange={(e) => setSingleGalleryPhotoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSingleGalleryPhoto();
                            }
                          }}
                          placeholder="Tempel link foto Google Drive (Contoh: https://drive.google.com/file/d/1.../view)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none shadow-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSingleGalleryPhoto}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 shrink-0 transition-all hover:scale-102"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah Foto</span>
                      </button>
                    </div>
                  )}

                  {/* Thumbnail List of Added Photos */}
                  {galleryForm.images.length > 0 ? (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold">Foto Dokumentasi Terdaftar ({galleryForm.images.length} foto):</span>
                        <span className="text-[11px] text-slate-400">Klik "Jadikan Sampul" untuk memilih sampul utama album</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-300">
                        {galleryForm.images.map((photoUrl, idx) => {
                          const isCover = galleryForm.coverImage === photoUrl || (!galleryForm.coverImage && idx === 0);
                          return (
                            <div
                              key={idx}
                              className={`group relative bg-white rounded-xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col ${
                                isCover ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200'
                              }`}
                            >
                              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                                <img
                                  src={photoUrl}
                                  alt={`Foto ${idx + 1}`}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.opacity = '0.3';
                                  }}
                                />
                                <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-bold text-white font-mono shadow-xs">
                                  #{idx + 1}
                                </div>
                                {isCover && (
                                  <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                                    <Star className="w-3 h-3 fill-slate-950" />
                                    <span>Sampul</span>
                                  </div>
                                )}
                              </div>

                              <div className="p-2 flex items-center justify-between gap-1 bg-white">
                                <button
                                  type="button"
                                  onClick={() => handleSetGalleryCover(photoUrl)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                    isCover 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-600'
                                  }`}
                                  title="Jadikan sebagai foto sampul utama album"
                                >
                                  <Star className={`w-3 h-3 ${isCover ? 'fill-amber-600 text-amber-600' : ''}`} />
                                  <span>{isCover ? 'Sampul Aktif' : 'Jadikan Sampul'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryPhoto(idx)}
                                  className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
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
                    <div className="p-4 rounded-xl bg-white border border-dashed border-slate-300 text-center space-y-1">
                      <Images className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Belum Ada Foto Terdaftar di Slide Show</p>
                      <p className="text-[11px] text-slate-400">
                        Tempel link foto Google Drive di atas agar seluruh foto kegiatan tampil di slide show pengunjung.
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. INPUT LINK FOTO SAMPUL / COVER (OPSIONAL) */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      <span>Link Foto Sampul Album (Opsional Override)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Foto sampul utama secara default diambil dari foto pertama pada daftar di atas atau dengan mengklik tombol "Jadikan Sampul". Anda juga dapat memasukkan tautan khusus di sini jika diinginkan.
                    </p>
                  </div>

                  <input
                    type="url"
                    value={galleryForm.coverImage}
                    onChange={(e) => setGalleryForm({ ...galleryForm, coverImage: e.target.value })}
                    placeholder="Contoh: https://drive.google.com/file/d/1aBcDe.../view?usp=sharing atau link gambar langsung"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />

                  {galleryForm.coverImage.trim() && (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-slate-200">
                      <div className="w-16 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={formatGoogleDriveImageUrl(galleryForm.coverImage, 200)}
                          alt="Preview Sampul"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="text-xs min-w-0">
                        <span className="font-bold text-slate-800 block truncate">Preview Foto Sampul Utama Terpilih</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" /> Foto sampul berhasil terdeteksi
                        </span>
                      </div>
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
                          driveFolderUrl: '',
                          coverImage: '',
                          images: [],
                          description: '',
                          authorId: currentUser?.id || '',
                          authorName: activeAuthorName,
                          authorRole: activeUserRole
                        });
                        setGalleryBatchInput('');
                        setSingleGalleryPhotoInput('');
                        setShowDriveEmbedPreview(false);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-700 font-semibold text-xs"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>

              {/* Section Header & Ownership Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/80">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-500" />
                    <span>
                      {isAdminOrSuperAdmin && galleryFilterTab === 'all'
                        ? `Seluruh Koleksi Album Galeri (${gallery.length} Album)`
                        : `Koleksi Album Unggahan Saya (${displayedGallery.length} Album)`}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAdminOrSuperAdmin && galleryFilterTab === 'all'
                      ? 'Menampilkan seluruh album foto yang diunggah oleh semua pengelola website.'
                      : `Menampilkan hanya album foto dokumentasi yang diunggah oleh akun ${currentUser?.name} (${currentUser?.role}).`}
                  </p>
                </div>

                {/* Filter Tabs Khusus Super Admin & Admin */}
                {isAdminOrSuperAdmin && (
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setGalleryFilterTab('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        galleryFilterTab === 'all'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      Semua Album ({gallery.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setGalleryFilterTab('mine')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        galleryFilterTab === 'mine'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      Unggahan Saya ({gallery.filter((g) => isGalleryItemOwner(g)).length})
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Grid or Empty State */}
              {displayedGallery.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {displayedGallery.map((item) => {
                    const isDrive = Boolean(item.driveFolderUrl || isGoogleDriveFolderUrl(item.image));
                    const hasCover = Boolean(item.image && !isGoogleDriveFolderUrl(item.image) && !item.image.includes('/drive/folders'));
                    const coverSrc = hasCover ? formatGoogleDriveImageUrl(item.image, 500) : '';
                    const folderUrl = item.driveFolderUrl || (isGoogleDriveFolderUrl(item.image) ? item.image : '');
                    const canManageItem = isGalleryItemOwner(item) || isAdminOrSuperAdmin;

                    return (
                      <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
                        <div className="relative h-44 bg-slate-900">
                          {coverSrc ? (
                            <>
                              <img src={coverSrc} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1b56ce] via-[#163fa8] to-[#0f172a] p-4 flex flex-col justify-between">
                              <div className="flex items-center justify-between">
                                <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center">
                                  <Folder className="w-4 h-4 text-amber-300 fill-amber-300/30" />
                                </div>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-white/20 text-white">
                                  Google Drive
                                </span>
                              </div>
                              <div>
                                <span className="text-[9px] font-extrabold uppercase text-blue-200">Cloud Album</span>
                                <p className="text-xs font-bold text-white line-clamp-2 mt-0.5">
                                  {item.title}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                            {item.category}
                          </span>

                          {/* Drive folder badge */}
                          {isDrive ? (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1 border border-white/30">
                              <Folder className="w-3 h-3 text-amber-300 fill-amber-300/20" />
                              <span>Folder Drive</span>
                            </span>
                          ) : (
                            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                              <Folder className="w-3 h-3" />
                              <span>{item.images?.length || 1} Foto</span>
                            </span>
                          )}
                        </div>
                        <div className="p-3.5 space-y-2">
                          <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{item.description || 'Tidak ada deskripsi'}</p>
                          
                          {/* Pengunggah Info Badge */}
                          <div className="flex items-center gap-1.5 text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 w-fit">
                            <User className="w-2.5 h-2.5 text-purple-600" />
                            <span>Oleh: <strong>{item.authorName || 'Super Administrator'}</strong>{item.authorRole ? ` (${item.authorRole})` : ''}</span>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-400 font-mono">{item.date}</span>
                            
                            <div className="flex items-center gap-1.5">
                              {folderUrl && (
                                <a
                                  href={getGoogleDriveFolderViewUrl(folderUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                  title="Buka Folder di Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {canManageItem ? (
                                <>
                                  <button
                                    onClick={() => {
                                      const itemFolder = item.driveFolderUrl || (isGoogleDriveFolderUrl(item.image) ? item.image : '');
                                      const itemCover = item.image && !isGoogleDriveFolderUrl(item.image) && !item.image.includes('/drive/folders') ? item.image : '';
                                      const itemImages = (item.images && item.images.length > 0)
                                        ? item.images.filter((img) => !isGoogleDriveFolderUrl(img) && !img.includes('/drive/folders'))
                                        : (itemCover ? [itemCover] : []);

                                      setEditingGalleryId(item.id);
                                      setGalleryForm({
                                        title: item.title,
                                        category: item.category,
                                        driveFolderUrl: itemFolder,
                                        coverImage: itemCover,
                                        images: itemImages,
                                        description: item.description || '',
                                        authorId: item.authorId || '',
                                        authorName: item.authorName || activeAuthorName,
                                        authorRole: item.authorRole || activeUserRole
                                      });
                                      setGalleryBatchInput('');
                                      setSingleGalleryPhotoInput('');
                                      setShowDriveEmbedPreview(false);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                    title={isAdminOrSuperAdmin ? "Edit Album" : "Edit Album Saya"}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (!isGalleryItemOwner(item) && !isAdminOrSuperAdmin) {
                                        showNoticePopup({
                                          title: 'Akses Ditolak!',
                                          message: 'Anda tidak memiliki hak akses untuk menghapus album yang diunggah oleh akun atau role lain.',
                                          type: 'warning'
                                        });
                                        return;
                                      }

                                      const confirmed = await showConfirmDialog({
                                        title: 'Hapus Album Galeri Ini?',
                                        message: `Apakah Anda yakin ingin menghapus album galeri "${item.title}"?`,
                                        type: 'delete',
                                        itemName: item.title,
                                        confirmText: 'Ya, Hapus Album',
                                        cancelText: 'Tidak, Batalkan'
                                      });
                                      if (!confirmed) return;
                                      deleteGalleryItem(item.id);
                                      showNoticePopup({
                                        title: 'Album Galeri Dihapus!',
                                        message: `Album "${item.title}" telah berhasil dihapus.`,
                                        type: 'success'
                                      });
                                    }}
                                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    title="Hapus Album"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200" title="Hanya akun pengunggah atau Administrator yang dapat mengedit/menghapus">
                                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>Hanya Pemilik</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <Folder className="w-7 h-7 text-amber-500" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    Belum Ada Album yang Diunggah oleh Akun Anda
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Anda sedang login sebagai <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.role}). Foto atau album yang diunggah oleh role/akun lain tidak ditampilkan di panel Anda agar privasi pengelolaan terjaga. Silakan gunakan formulir di atas untuk mengunggah foto dokumentasi kegiatan baru.
                  </p>
                </div>
              )}
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
                            onClick={async () => {
                              const confirmed = await showConfirmDialog({
                                title: 'Hapus Pesan Pengaduan?',
                                message: `Apakah Anda yakin ingin menghapus pesan aspirasi/pengaduan dari "${comp.name}"?`,
                                type: 'delete',
                                itemName: `${comp.name} (${comp.category || 'Aduan'})`,
                                confirmText: 'Ya, Hapus Pesan',
                                cancelText: 'Tidak, Batalkan'
                              });
                              if (!confirmed) return;
                              deleteComplaint(comp.id);
                              showNoticePopup({
                                title: 'Pesan Dihapus!',
                                message: 'Pesan pengaduan telah berhasil dihapus.',
                                type: 'success'
                              });
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

          {/* TAB 7.5: KELOLA MEDIA SOSIAL RESMI */}
          {currentSection === 'social-media-cms' && isAdminOrSuperAdmin && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Kelola Akun & Link Media Sosial Resmi
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                      Publik: Sos Med
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Atur tautan akun media sosial resmi Korwilcam Purwodadi. Akun yang tautannya tidak diisi (kosong) atau dinonaktifkan secara otomatis <strong>TIDAK AKAN DITAMPILKAN</strong> di website publik.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('social-media', '/media-sosial')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-xs transition-colors"
                  >
                    <span>Lihat Halaman Sos Med</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetSocialMedia}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                    title="Kembalikan seluruh akun ke data bawaan awal"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Bawaan</span>
                  </button>
                </div>
              </div>

              {/* Status Ringkasan & Aturan Kondisional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Platform</div>
                    <div className="text-xl font-black text-slate-900">{editingSocialMedia.length} Platform</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Aktif & Tampil di Web</div>
                    <div className="text-xl font-black text-emerald-700">
                      {editingSocialMedia.filter((i) => i.isActive !== false && i.url && i.url.trim() !== '').length} Akun
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Disembunyikan (Kosong/Off)</div>
                    <div className="text-xl font-black text-amber-700">
                      {editingSocialMedia.filter((i) => i.isActive === false || !i.url || i.url.trim() === '').length} Akun
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Banner Aturan Kondisional */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Aturan Tampilan Kondisional:</strong> Kartu akun di halaman web depan <strong>hanya akan muncul jika tautan (URL) terisi</strong> dan statusnya dalam keadaan <strong>Aktif</strong>. Jika Anda mengosongkan kolom tautan suatu platform, kartu akun tersebut akan otomatis disembunyikan dari halaman depan.
                </div>
              </div>

              {/* Form Daftar Akun Media Sosial */}
              <form onSubmit={handleSaveSocialMedia} className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
                  {editingSocialMedia.map((item) => {
                    const isVisibleOnWeb = item.isActive !== false && item.url && item.url.trim() !== '';
                    const isLinkEmpty = !item.url || item.url.trim() === '';

                    return (
                      <div
                        key={item.platform}
                        className={`bg-white rounded-2xl p-5 border transition-all space-y-4 shadow-xs ${
                          isVisibleOnWeb
                            ? 'border-slate-200 hover:border-blue-400'
                            : 'border-dashed border-slate-300 bg-slate-50/50'
                        }`}
                      >
                        {/* Header Kartu Platform */}
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Branded Icon */}
                            {item.platform === 'instagram' && (
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <InstagramIcon className="w-5 h-5" />
                              </div>
                            )}
                            {item.platform === 'youtube' && (
                              <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <YoutubeIcon className="w-5 h-5" />
                              </div>
                            )}
                            {item.platform === 'tiktok' && (
                              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
                                <TikTokIcon className="w-5 h-5" />
                              </div>
                            )}
                            {item.platform === 'facebook' && (
                              <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <FacebookIcon className="w-5 h-5" />
                              </div>
                            )}
                            {item.platform === 'x' && (
                              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shrink-0 shadow-xs">
                                <XIcon className="w-4 h-4" />
                              </div>
                            )}
                            {item.platform === 'whatsapp' && (
                              <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-xs">
                                <WhatsAppIcon className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 text-sm">{item.name}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {item.platform}</span>
                            </div>
                          </div>

                          {/* Status Badge & Toggle Aktif */}
                          <div className="flex items-center gap-2 shrink-0">
                            {isVisibleOnWeb ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ● Tampil di Web
                              </span>
                            ) : isLinkEmpty ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                ⚠ Link Kosong
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300">
                                ○ Dinonaktifkan
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSocialMediaChange(item.platform, 'isActive', !item.isActive)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                item.isActive !== false
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                              }`}
                            >
                              {item.isActive !== false ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-3">
                          {/* 1. URL Tautan */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700">
                                Tautan URL Profil / Halaman <span className="text-rose-500">*</span>
                              </label>
                              {item.url && item.url.trim() !== '' && (
                                <a
                                  href={formatExternalUrl(item.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-semibold"
                                >
                                  <span>Uji Tautan</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <input
                              type="text"
                              value={item.url || ''}
                              onChange={(e) => handleSocialMediaChange(item.platform, 'url', e.target.value)}
                              placeholder={`Contoh: https://${item.platform === 'youtube' ? 'youtube.com/@korwilcam' : item.platform === 'whatsapp' ? 'whatsapp.com/channel/...' : `${item.platform}.com/korwilcam_purwodadi`}`}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400">
                              *Kosongkan kolom ini jika ingin menyembunyikan kartu {item.name} dari website.
                            </p>
                          </div>

                          {/* 2. Username & Follower Stat */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Nama Akun / Handle</label>
                              <input
                                type="text"
                                value={item.username || ''}
                                onChange={(e) => handleSocialMediaChange(item.platform, 'username', e.target.value)}
                                placeholder="Contoh: @korwilcam_purwodadi"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-700">Jumlah Pengikut / Stat</label>
                              <input
                                type="text"
                                value={item.followers || ''}
                                onChange={(e) => handleSocialMediaChange(item.platform, 'followers', e.target.value)}
                                placeholder="Contoh: 15K+ Pengikut"
                                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* 3. Teks Tombol Ikuti */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Teks Tombol Ikuti</label>
                            <input
                              type="text"
                              value={item.buttonLabel || ''}
                              onChange={(e) => handleSocialMediaChange(item.platform, 'buttonLabel', e.target.value)}
                              placeholder={`Contoh: Ikuti di ${item.name}`}
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>

                          {/* 4. Deskripsi Singkat */}
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-700">Deskripsi Singkat</label>
                            <textarea
                              rows={2}
                              value={item.description || ''}
                              onChange={(e) => handleSocialMediaChange(item.platform, 'description', e.target.value)}
                              placeholder="Keterangan singkat seputar konten yang dibagikan pada akun ini..."
                              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tombol Simpan Bawah */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Pastikan tautan sudah benar sebelum menyimpan. Data akan disinkronkan ke Supabase Cloud dan LocalStorage.
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSocialMedia}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingSocialMedia ? 'Menyimpan...' : 'Simpan Semua Pengaturan Media Sosial'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7.6: BROADCAST NOTIFIKASI PWA (ONESIGNAL) */}
          {currentSection === 'broadcast-cms' && isAdminOrSuperAdmin && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Radio className="w-6 h-6 text-blue-600" />
                      <span>Broadcast & Push Notifikasi PWA</span>
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      OneSignal Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                    Kirimkan pengumuman penting, edaran resmi, dan warta kegiatan langsung ke status bar HP Android serta browser seluruh guru, kepala sekolah, dan masyarakat yang telah menginstal aplikasi web Korwilcam Purwodadi.
                  </p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Broadcast Terkirim</span>
                    <Radio className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">{broadcastHistory.length}</div>
                  <p className="text-[11px] text-slate-400">Pemberitahuan telah disiarkan</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gateway Notifikasi</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5 pt-1">
                    <span>OneSignal Web Push v16</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">App ID: f9570b26...1015</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengiriman Terakhir</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 pt-1 truncate">
                    {broadcastHistory.length > 0 
                      ? new Date(broadcastHistory[0].sentAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
                      : 'Belum pernah mengirim'}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {broadcastHistory.length > 0 ? broadcastHistory[0].title : 'Siap mengirim siaran baru'}
                  </p>
                </div>
              </div>

              {/* Form & Live Mobile Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Form Kirim (7 Kolom) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Send className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Formulir Siaran Baru</h3>
                  </div>

                  <form onSubmit={handleSendBroadcast} className="space-y-4">
                    {/* Judul Notifikasi */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Judul Notifikasi <span className="text-rose-500">*</span>
                        </label>
                        <span className={`text-[10px] ${broadcastTitle.length > 60 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                          {broadcastTitle.length}/65 karakter
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={65}
                        required
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Contoh: Surat Edaran Penilaian Kinerja Guru 2026"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Pesan Notifikasi */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Isi Pesan Notifikasi <span className="text-rose-500">*</span>
                        </label>
                        <span className={`text-[10px] ${broadcastMessage.length > 140 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                          {broadcastMessage.length}/150 karakter
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={150}
                        required
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Contoh: Jadwal pelaksanaan dan format berkas instrumen PKG terbaru telah diunggah. Klik untuk melihat petunjuk teknis selengkapnya."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Pilihan Target Tautan URL */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 block">
                        Tautan Tujuan Saat Notifikasi Diklik
                      </label>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setBroadcastTargetType('home')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            broadcastTargetType === 'home'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Beranda
                        </button>
                        <button
                          type="button"
                          onClick={() => setBroadcastTargetType('news')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            broadcastTargetType === 'news'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Pilih Berita
                        </button>
                        <button
                          type="button"
                          onClick={() => setBroadcastTargetType('announcement')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            broadcastTargetType === 'announcement'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Pengumuman
                        </button>
                        <button
                          type="button"
                          onClick={() => setBroadcastTargetType('custom')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            broadcastTargetType === 'custom'
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Tautan Kustom
                        </button>
                      </div>

                      {/* Dropdown Pemilihan Berita */}
                      {broadcastTargetType === 'news' && (
                        <div className="pt-1.5 animate-in fade-in duration-150">
                          <select
                            value={broadcastSelectedNewsId}
                            onChange={(e) => setBroadcastSelectedNewsId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-blue-300 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          >
                            <option value="">-- Pilih Berita Terkait --</option>
                            {news.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title} ({item.date})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Dropdown Pemilihan Pengumuman */}
                      {broadcastTargetType === 'announcement' && (
                        <div className="pt-1.5 animate-in fade-in duration-150">
                          <select
                            value={broadcastSelectedAnnId}
                            onChange={(e) => setBroadcastSelectedAnnId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-blue-300 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          >
                            <option value="">-- Pilih Pengumuman Terkait --</option>
                            {announcements.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title} ({item.date})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Input URL Kustom */}
                      {broadcastTargetType === 'custom' && (
                        <div className="pt-1.5 animate-in fade-in duration-150">
                          <input
                            type="text"
                            value={broadcastCustomUrl}
                            onChange={(e) => setBroadcastCustomUrl(e.target.value)}
                            placeholder="Contoh: https://korwilcampurwodadi.web.id/kontak"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-blue-300 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 font-mono break-all">
                        Tautan akhir: <span className="text-blue-600 font-bold">{getComputedBroadcastUrl()}</span>
                      </div>
                    </div>

                    {/* Tombol Kirim */}
                    <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setBroadcastTitle('');
                          setBroadcastMessage('');
                          setBroadcastCustomUrl('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                      >
                        Bersihkan
                      </button>

                      <button
                        type="submit"
                        disabled={isSendingBroadcast}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all active:scale-98 disabled:opacity-50"
                      >
                        {isSendingBroadcast ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Menyiarkan Notifikasi...</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-4 h-4" />
                            <span>Kirim Broadcast Notifikasi</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Mobile Notification Preview (5 Kolom) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      Pratinjau Layar HP Android (Live)
                    </span>
                    <span className="text-[10px] text-slate-400">Simulasi Real-time</span>
                  </div>

                  {/* Android Phone Frame Mockup */}
                  <div className="bg-slate-900 rounded-3xl p-3 sm:p-4 shadow-xl border-4 border-slate-800 relative overflow-hidden">
                    {/* Phone Camera Hole */}
                    <div className="w-3.5 h-3.5 bg-black rounded-full mx-auto mb-3" />

                    {/* Status Bar */}
                    <div className="flex items-center justify-between text-slate-400 text-[10px] px-2 mb-4 font-mono">
                      <span>09.41</span>
                      <div className="flex items-center gap-1.5">
                        <span>5G</span>
                        <div className="w-4 h-2 border border-slate-400 rounded-xs flex items-center p-0.5">
                          <div className="w-full h-full bg-slate-400 rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* Notification Card on Android Screen */}
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-slate-100 text-slate-800 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                      {/* App header line */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-4 h-4 object-contain rounded-xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <span className="font-bold text-slate-700">Korwilcam Purwodadi</span>
                          <span>•</span>
                          <span>Baru saja</span>
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      </div>

                      {/* Notif Body */}
                      <div className="space-y-1 pt-0.5">
                        <h5 className="font-black text-xs text-slate-900 leading-snug line-clamp-2">
                          {broadcastTitle || 'Judul Notifikasi Resmi'}
                        </h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                          {broadcastMessage || 'Isi pemberitahuan resmi dari Korwilcam Purwodadi akan muncul di sini...'}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1">
                          <span>Buka Berita / Halaman</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">web.id</span>
                      </div>
                    </div>

                    {/* Helper text */}
                    <p className="text-[10px] text-slate-400 text-center mt-6 px-4 leading-relaxed">
                      💡 Notifikasi ini otomatis berbunyi dan tampil di status bar HP pengguna saat layar aktif maupun terkunci.
                    </p>
                  </div>
                </div>
              </div>

              {/* Riwayat Broadcast Notifikasi */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>Riwayat Notifikasi Disiarkan</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daftar seluruh pesan siaran yang pernah dikirimkan oleh Admin/Super Admin.
                    </p>
                  </div>

                  {/* Filter Search */}
                  {broadcastHistory.length > 0 && (
                    <div className="relative max-w-xs w-full">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={broadcastSearchQuery}
                        onChange={(e) => setBroadcastSearchQuery(e.target.value)}
                        placeholder="Cari judul / pesan siaran..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </div>

                {broadcastHistory.length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <Radio className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Broadcast</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Gunakan formulir di atas untuk mengirimkan pesan siaran pertama Anda ke seluruh perangkat yang menginstal aplikasi website ini.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {broadcastHistory
                      .filter((item) => {
                        if (!broadcastSearchQuery.trim()) return true;
                        const q = broadcastSearchQuery.toLowerCase();
                        return item.title.toLowerCase().includes(q) || item.message.toLowerCase().includes(q);
                      })
                      .map((item) => (
                        <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 group">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {new Date(item.sentAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'sent' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {item.status === 'sent' ? '● Terkirim' : '⚠ Gagal'}
                              </span>
                              {item.createdBy && (
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  Oleh: {item.createdBy}
                                </span>
                              )}
                            </div>

                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                              {item.message}
                            </p>

                            {item.targetUrl && (
                              <div className="pt-1">
                                <a
                                  href={item.targetUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  <span>Tautan: {item.targetUrl}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {item.errorMessage && (
                              <p className="text-[11px] text-amber-600 font-medium">
                                Catatan: {item.errorMessage}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleResendBroadcast(item)}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1"
                              title="Muat ke formulir untuk kirim ulang"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Kirim Ulang</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBroadcast(item.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus riwayat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
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
                        <span className="text-[10px] text-emerald-700 font-medium">Warta Berita & Galeri Foto</span>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {adminUsers.filter((u) => u.role === 'Penulis').length}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Wewenang redaksi: menulis artikel berita kegiatan sekolah/kedinasan, serta mengunggah foto dokumentasi pada Galeri Kegiatan.
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

          {/* TAB 9: LOG AKTIVITAS (GOOGLE SPREADSHEET) */}
          {currentSection === 'activity-log-cms' && isSuperAdmin && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      Log Aktivitas Pengelola
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Google Spreadsheet
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                      Non-Supabase
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Seluruh riwayat login, logout, penambahan, pengeditan, penghapusan, dan reset data dicatat otomatis langsung ke Google Spreadsheet Anda secara real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <a
                    href={SPREADSHEET_VIEW_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Buka Google Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyGasCode}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all"
                  >
                    {hasCopiedGasCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{hasCopiedGasCode ? 'Kode Disalin!' : 'Salin Kode Apps Script'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Spreadsheet File */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">File Spreadsheet</h4>
                        <span className="text-[10px] text-emerald-700 font-medium">Sheet: Log Aktivitas</span>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono truncate">
                    ID: 1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM
                  </p>
                  <a
                    href={SPREADSHEET_VIEW_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
                  >
                    <span>Lihat Lembar Kerja Langsung</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Card 2: Supabase Cloud Sync (Single-Row Config) */}
                <div className="bg-gradient-to-br from-blue-50 to-white p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Database className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Supabase Cloud Sync</h4>
                        <span className="text-[10px] text-blue-700 font-medium">Tabel: activity_log_settings</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      1 Baris Config
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Hanya 1 tautan URL Web App yang disimpan di Supabase agar sinkron otomatis di semua browser. Seluruh ribuan data riwayat log tetap 100% masuk ke Google Spreadsheet.
                  </p>
                </div>

                {/* Card 3: Real-Time Webhook Status */}
                <div className="bg-gradient-to-br from-purple-50 to-white p-4 rounded-2xl border border-purple-200/80 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Koneksi Webhook</h4>
                        <span className="text-[10px] text-purple-700 font-medium">Google Apps Script</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activityLogUrlInput && activityLogUrlInput.includes('/exec')
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {activityLogUrlInput && activityLogUrlInput.includes('/exec') ? 'Terkonfigurasi' : 'Belum URL /exec'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Menggunakan Google Apps Script Web App gratis &amp; serverless tanpa batas waktu kedaluwarsa token.
                  </p>
                </div>
              </div>

              {/* Form Input Webhook URL */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-emerald-600" />
                      <span>Konfigurasi URL Google Apps Script Web App</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Masukkan URL Web App hasil deployment dari Google Apps Script Spreadsheet Anda.
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Format: https://script.google.com/macros/s/.../exec
                  </span>
                </div>

                <form onSubmit={handleSaveActivityLogUrl} className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      URL Web App Webhook:
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                        value={activityLogUrlInput}
                        onChange={(e) => setActivityLogUrlInput(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSavingActivityLogUrl}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          {isSavingActivityLogUrl ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          <span>{isSavingActivityLogUrl ? 'Menyimpan...' : 'Simpan URL'}</span>
                        </button>
                        <button
                          type="button"
                          disabled={isTestingWebhook || !activityLogUrlInput.trim()}
                          onClick={handleTestWebhook}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                        >
                          {isTestingWebhook ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>{isTestingWebhook ? 'Menguji...' : 'Uji Koneksi Webhook'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {webhookTestResult && (
                    <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                      webhookTestResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      {webhookTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong>{webhookTestResult.success ? 'Berhasil: ' : 'Peringatan: '}</strong>
                        <span>{webhookTestResult.message}</span>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Panduan Pemasangan Google Apps Script */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Petunjuk Pemasangan Google Apps Script (5 Langkah Mudah)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ikuti langkah di bawah ini untuk menghubungkan Google Spreadsheet Anda dalam waktu kurang dari 2 menit.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">1</span>
                    <h5 className="text-xs font-bold text-slate-800">Buka Spreadsheet</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Buka file Google Spreadsheet Anda, lalu klik menu <strong>Ekstensi</strong> &gt; <strong>Apps Script</strong>.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">2</span>
                    <h5 className="text-xs font-bold text-slate-800">Tempelkan Kode</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Hapus teks di file <code>Code.gs</code>, tempelkan kode di kotak bawah ini, lalu klik ikon <strong>Simpan</strong> (Disket).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">3</span>
                    <h5 className="text-xs font-bold text-slate-800">Jalankan setupSheet</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Pilih fungsi <code>setupSheet</code> di dropdown atas, klik <strong>Jalankan</strong> (Run) untuk membuat judul kolom otomatis.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">4</span>
                    <h5 className="text-xs font-bold text-slate-800">Terapkan Web App</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Klik <strong>Terapkan</strong> &gt; <strong>Penerapan baru</strong> &gt; Jenis: <strong>Aplikasi web</strong>. Siapa yang memiliki akses: <strong>Siapa saja</strong> (Anyone).
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-extrabold text-[11px] flex items-center justify-center">5</span>
                    <h5 className="text-xs font-bold text-slate-800">Tempel URL</h5>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Salin URL Web App (berakhiran <code>/exec</code>), tempelkan ke kolom input di atas, lalu klik <strong>Uji Koneksi</strong>.
                    </p>
                  </div>
                </div>

                {/* Kotak Kode Apps Script */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Kode Skrip (Code.gs) - Siap Pakai:</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyGasCode}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      {hasCopiedGasCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedGasCode ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Kode'}</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800 select-all">
                      <code>{GOOGLE_APPS_SCRIPT_CODE}</code>
                    </pre>
                  </div>
                </div>
              </div>

              {/* Tabel Penjelasan Kolom Google Spreadsheet */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Struktur Kolom Log Aktivitas pada Google Spreadsheet</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Berikut adalah rincian 10 kolom data yang otomatis dibuat dan diisi setiap kali terjadi aktivitas di portal:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Kolom</th>
                        <th className="py-2.5 px-3">Nama Header</th>
                        <th className="py-2.5 px-3">Contoh Nilai</th>
                        <th className="py-2.5 px-3">Fungsi &amp; Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">A</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">No</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">1, 2, 3, ...</td>
                        <td className="py-2.5 px-3">Nomor urut otomatis baris riwayat.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">B</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Waktu (WIB)</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">21/09/2026, 14:35:10 WIB</td>
                        <td className="py-2.5 px-3">Waktu pencatatan dalam zona Waktu Indonesia Barat.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">C</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Nama Pengguna</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">Super Administrator Korwilcam</td>
                        <td className="py-2.5 px-3">Nama lengkap akun pengelola yang melakukan aksi.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">D</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Username / Akun</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">@superadmin</td>
                        <td className="py-2.5 px-3">Username akun yang sedang masuk.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">E</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Peran (Role)</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">Super Admin / Admin / Penulis</td>
                        <td className="py-2.5 px-3">Tingkat hak akses akun pengelola.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">F</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Jenis Aktivitas</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">LOGIN, TAMBAH DATA, UBAH DATA, HAPUS DATA</td>
                        <td className="py-2.5 px-3">Klasifikasi tindakan yang dijalankan.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">G</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Modul / Fitur</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">Berita &amp; Warta, Sekolah, Nominatif Guru, dll.</td>
                        <td className="py-2.5 px-3">Fitur aplikasi tempat perubahan terjadi.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">H</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Keterangan Detail</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">Menambahkan berita: "Rapat Koordinasi Guru SD"</td>
                        <td className="py-2.5 px-3">Informasi spesifik mengenai nama data atau rincian aksi.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">I</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Status</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">BERHASIL / GAGAL</td>
                        <td className="py-2.5 px-3">Status hasil eksekusi operasi.</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">J</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Perangkat / Browser</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">Chrome on Windows 10/11</td>
                        <td className="py-2.5 px-3">Peramban dan sistem operasi yang digunakan pengelola.</td>
                      </tr>
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
                  Gunakan tombol <strong>"Tarik Data Terbaru dari Supabase"</strong> di bawah ini kapan saja Anda menambahkan, mengedit, atau mengunggah data secara manual ke database Supabase (seperti via <em>Import CSV</em>, <em>SQL Editor</em>, atau <em>Table Editor</em>). Sekali klik, seluruh data terbaru di database akan langsung ditarik dan tampil di website.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={async () => {
                      setIsExporting(true);
                      const success = await refreshFromSupabase(true);
                      setIsExporting(false);
                      if (success) {
                        showToast('Berhasil menarik seluruh data terbaru dari Supabase Cloud! Website Anda kini 100% tersinkronisasi.', 'success');
                      } else {
                        showToast('Gagal menarik data dari Supabase. Pastikan URL dan Key Supabase sudah benar.', 'error');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isExporting ? 'animate-spin' : ''}`} />
                    <span>{isExporting ? 'Sedang Menarik Data...' : 'Tarik Data Terbaru dari Supabase'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={handleExportToSupabase}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Data Lokal ke Supabase (Opsional)</span>
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
                    <option value="Penulis">Penulis (Warta, Berita & Galeri Foto)</option>
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

      {/* MODAL: TAMBAH ORGANISASI BARU */}
      {showNewOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Tambah Organisasi Baru</h3>
                  <p className="text-[11px] text-slate-500">Daftarkan organisasi mitra pendidikan baru</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewOrgModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewOrg} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Organisasi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ikatan Guru Olahraga Nasional (IGORNAS)"
                  value={newOrgForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                    setNewOrgForm(prev => ({
                      ...prev,
                      name,
                      slug: prev.slug ? prev.slug : slug
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Singkat / Singkatan</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: IGORNAS"
                  value={newOrgForm.shortName}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, shortName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Slug URL (/organisasi/:slug)</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: igornas"
                  value={newOrgForm.slug}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '-') })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat peran organisasi..."
                  value={newOrgForm.description}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Akun Pengelola Khusus (Opsional)</label>
                <select
                  value={newOrgForm.assignedUsername || ''}
                  onChange={(e) => setNewOrgForm({ ...newOrgForm, assignedUsername: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none font-medium"
                >
                  <option value="">Semua Admin (Tidak dibatasi akun khusus)</option>
                  {adminUsers.map((u) => (
                    <option key={u.id} value={u.username}>
                      @{u.username} — {u.name} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Akun yang dipilih akan dapat membuka menu Organisasi dan mengelola organisasi baru ini.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrgModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Buat Organisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT PENGURUS ORGANISASI */}
      {showOfficialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingOfficialId ? 'Edit Data Pengurus' : 'Tambah Pengurus Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {orgForm?.shortName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOfficialModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOfficialForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nama Lengkap Pengurus & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Drs. BAMBANG SUTRISNO"
                  value={officialForm.name}
                  onChange={(e) => setOfficialForm({ ...officialForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jabatan Resmi</label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Wakil Ketua / Sekretaris"
                    value={officialForm.role}
                    onChange={(e) => setOfficialForm({ ...officialForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Bidang / Divisi</label>
                  <input
                    type="text"
                    placeholder="Misal: Pengurus Harian"
                    value={officialForm.division}
                    onChange={(e) => setOfficialForm({ ...officialForm, division: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">NIP / Keterangan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="197003151994121002"
                    value={officialForm.nip}
                    onChange={(e) => setOfficialForm({ ...officialForm, nip: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Urutan Tampilan</label>
                  <input
                    type="number"
                    min={1}
                    value={officialForm.order}
                    onChange={(e) => setOfficialForm({ ...officialForm, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Foto Pengurus */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="text-xs font-bold text-slate-700 block">Foto Pengurus</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden border border-slate-300 shrink-0 flex items-center justify-center">
                    {officialForm.photo ? (
                      <img
                        src={isGoogleDriveUrl(officialForm.photo) ? formatGoogleDriveImageUrl(officialForm.photo) : officialForm.photo}
                        alt="Foto Pengurus"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      ref={officialPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleOfficialPhotoUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => officialPhotoInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                      >
                        Pilih Foto
                      </button>
                      {officialForm.photo && (
                        <button
                          type="button"
                          onClick={() => setOfficialForm({ ...officialForm, photo: '' })}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-bold"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="Atau link Google Drive / URL foto..."
                      value={officialPhotoDriveInput}
                      onChange={(e) => {
                        setOfficialPhotoDriveInput(e.target.value);
                        setOfficialForm(prev => ({ ...prev, photo: formatGoogleDriveImageUrl(e.target.value.trim()) }));
                      }}
                      className="w-full px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowOfficialModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  {editingOfficialId ? 'Perbarui Pengurus' : 'Tambahkan Pengurus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
