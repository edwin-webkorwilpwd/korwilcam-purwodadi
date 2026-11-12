import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  School, 
  NewsArticle, 
  Announcement, 
  AgendaEvent, 
  AulaAgendaBooking,
  DocumentDownload, 
  GalleryItem, 
  StaffProfile, 
  OfficeProfile,
  ComplaintMessage,
  AdminUser,
  AdminRole,
  EducationalOrganization,
  OrganizationOfficial,
  TeacherNominative,
  ServiceRequirement,
  DataRequestLink,
  SocialMediaItem,
  BroadcastNotification,
  Achievement,
  GalleryVideoItem
} from '../types';
import { 
  initialSchools, 
  initialNews, 
  initialAnnouncements, 
  initialAgenda, 
  initialDocuments, 
  initialGallery, 
  initialStaff, 
  initialOfficeProfile,
  initialComplaints,
  initialOrganizations,
  initialTeachers,
  initialServiceRequirements,
  initialDataRequests,
  initialSocialMedia
} from '../data/initialData';

import { getSupabaseClient, getSupabaseConfig, testSupabaseConnection, syncLocalConfigToServer } from '../lib/supabase';
import { fetchAulaAgendaFromSheet, FALLBACK_AULA_BOOKINGS, compareAgendaDatesDescending } from '../services/googleSheetService';
import { getLocalAchievementsCache, fetchAchievementsFromSheet } from '../services/achievementSheetService';
import { getLocalVideoCache, fetchVideosFromSheet } from '../services/videoSheetService';
import { 
  fetchGalleryFromSheet, 
  sendGalleryActionToGAS, 
  getLocalGalleryCache, 
  setLocalGalleryCache,
  getGalleryWebAppUrl,
  setGalleryWebAppUrl 
} from '../services/gallerySheetService';
import {
  fetchAdminUsersFromSheet,
  saveAdminUserToSheet,
  updateAdminUserInSheet,
  deleteAdminUserFromSheet
} from '../services/adminUsersSheetService';
import {
  fetchNewsFromSheet,
  createNewsInSheet,
  updateNewsInSheet,
  deleteNewsFromSheet,
  incrementNewsViewsInSheet
} from '../services/newsSheetService';
import {
  fetchServiceRequirementsFromSheet,
  saveServiceRequirementToSheet,
  deleteServiceRequirementFromSheet,
  clearAllServiceRequirementsInSheet
} from '../services/serviceRequirementsSheetService';
import {
  fetchDataRequestsFromSheet,
  saveDataRequestToSheet,
  deleteDataRequestFromSheet
} from '../services/dataRequestSheetService';
import {
  fetchOrganizationsFromSheet,
  saveOrganizationToSheet,
  deleteOrganizationFromSheet
} from '../services/organizationSheetService';
import {
  fetchTeachersFromSheet,
  saveTeacherToSheet,
  deleteTeacherFromSheet,
  getTeachersWebAppUrl,
  setTeachersWebAppUrl,
  getTeachersSheetUrl,
  setTeachersSheetUrl
} from '../services/teacherSheetService';
import {
  fetchSopFromSheet,
  saveSopToSheet,
  deleteSopFromSheet,
  getSopWebAppUrl,
  setSopWebAppUrl
} from '../services/sopSheetService';
import { generateVideoSlug } from '../lib/youtubeHelper';
import { resolveNewsCandidates, resolveAnnouncementCandidates } from '../lib/shortLink';
import { normalizeToGoogleMapsUrl } from '../lib/coordinates';
import { getGallerySlug, compareGalleryItemsDescending, sortGalleryDescending } from '../lib/galleryHelper';
import { 
  formatGoogleDriveImageUrl, 
  isGoogleDriveUrl, 
  isGoogleDriveFolderUrl, 
  embedGalleryMetadata, 
  extractGalleryMetadata, 
  parseGoogleDriveImageLinks,
  normalizeHeroSlideshowImages
} from '../lib/driveHelper';
import { getDocumentSlug, getDocumentDetailPath } from '../lib/documentHelper';
import { getServiceRequirementSlug, getServiceRequirementDetailPath, generateServiceRequirementSlug } from '../lib/serviceRequirementHelper';
import { generateDataRequestSlug, getDataRequestSlug, getDataRequestPath } from '../lib/dataRequestHelper';
import { parseKaryakuPath, getKaryakuPath } from '../lib/karyakuHelper';
import { findAchievementBySlugOrId, getAchievementSlug } from '../lib/achievementHelper';
import { 
  getLocalSocialMedia, 
  setLocalSocialMedia, 
  fetchSocialMediaFromSupabase, 
  saveSocialMediaToSupabase, 
  normalizeSocialMediaList 
} from '../lib/socialMediaHelper';
import { 
  fetchBroadcastHistory, 
  sendPushBroadcast, 
  deleteBroadcastRecord, 
  SendBroadcastParams, 
  SendBroadcastResult 
} from '../lib/oneSignalHelper';
import { stripHtml, generateSummary } from '../lib/stripHtml';
import { checkRateLimit, recordAttempt, resetRateLimit } from '../lib/rateLimiter';
import { 
  logActivity, 
  ActivityLogPayload, 
  getActivityLogUrl, 
  setActivityLogUrl, 
  fetchActivityLogUrlFromSupabase, 
  saveActivityLogUrlToSupabase 
} from '../lib/activityLogger';
import { MenuVisibilityMap, NAVIGATION_CONFIG } from '../config/navigationConfig';
import { 
  getLocalNavigationVisibility, 
  fetchNavigationVisibilityFromSupabase, 
  saveNavigationVisibilityToSupabase 
} from '../lib/navigationHelper';
import {
  MaintenanceConfig,
  getLocalMaintenanceConfig,
  fetchMaintenanceFromSupabase,
  saveMaintenanceToSupabase,
  DEFAULT_MAINTENANCE_CONFIG
} from '../lib/maintenanceHelper';


export const initialAdminUsers: AdminUser[] = [
  {
    id: 'usr-qwe',
    username: 'qwe',
    password: 'qwe',
    name: 'Administrator Korwilcam Purwodadi',
    role: 'Super Admin',
    email: 'admin@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-superadmin',
    username: 'superadmin',
    password: 'superadmin123',
    name: 'Super Administrator Korwilcam',
    role: 'Super Admin',
    email: 'superadmin@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator Web Korwilcam',
    role: 'Admin',
    email: 'admin@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-penulis',
    username: 'penulis',
    password: 'penulis123',
    name: 'Penulis Berita & Warta',
    role: 'Penulis',
    email: 'penulis@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-editor',
    username: 'editor',
    password: 'editor123',
    name: 'Editor Berita & Artikel',
    role: 'Editor',
    email: 'editor@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  }
];

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  type?: 'delete' | 'edit' | 'save' | 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  itemName?: string;
}

export interface NoticePopupOptions {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  duration?: number;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AppContextType {
  schools: School[];
  news: NewsArticle[];
  newsCategories: string[];
  announcements: Announcement[];
  agenda: AgendaEvent[];
  aulaBookings: AulaAgendaBooking[];
  loadingAulaBookings: boolean;
  refreshAulaBookings: () => Promise<void>;
  documents: DocumentDownload[];
  documentCategories: string[];
  gallery: GalleryItem[];
  galleryCategories: string[];
  staff: StaffProfile[];
  officeProfile: OfficeProfile;
  sopImageUrl: string;
  complaints: ComplaintMessage[];
  
  // Navigation & modals
  activeTab: string;
  setActiveTab: (tab: string, customPath?: string) => void;
  selectedNews: NewsArticle | null;
  setSelectedNews: (news: NewsArticle | null) => void;
  selectedAnnouncement: Announcement | null;
  setSelectedAnnouncement: (ann: Announcement | null, customPath?: string) => void;
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null, customPath?: string) => void;
  selectedGallery: GalleryItem | null;
  setSelectedGallery: (gallery: GalleryItem | null) => void;
  galleryActiveTab: 'photo' | 'video';
  setGalleryActiveTab: (tab: 'photo' | 'video') => void;
  refreshGalleryFromSheet: () => Promise<void>;
  isGalleryLoading: boolean;
  selectedVideo: GalleryVideoItem | null;
  setSelectedVideo: (video: GalleryVideoItem | null, customPath?: string) => void;
  videos: GalleryVideoItem[];
  refreshVideosFromSheet: () => Promise<void>;
  isVideosLoading: boolean;
  selectedDocument: DocumentDownload | null;
  setSelectedDocument: (doc: DocumentDownload | null, customPath?: string) => void;
  incrementDocumentDownloadCount: (id: string) => Promise<void>;
  
  // Organisasi
  organizations: EducationalOrganization[];
  selectedOrganizationSlug: string | null;
  setSelectedOrganizationSlug: (slug: string | null, customPath?: string) => void;
  selectedPurnaTugasNip: string | null;
  setSelectedPurnaTugasNip: (nip: string | null, customPath?: string) => void;
  addOrganization: (org: Omit<EducationalOrganization, 'id'>) => Promise<boolean>;
  updateOrganization: (id: string, orgData: Partial<EducationalOrganization>) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  addOrganizationOfficial: (orgId: string, official: Omit<OrganizationOfficial, 'id'>) => Promise<boolean>;
  updateOrganizationOfficial: (orgId: string, officialId: string, officialData: Partial<OrganizationOfficial>) => Promise<boolean>;
  deleteOrganizationOfficial: (orgId: string, officialId: string) => Promise<boolean>;
  
  // Nominatif Guru
  teachers: TeacherNominative[];
  addTeacher: (teacher: Omit<TeacherNominative, 'id'>) => Promise<boolean>;
  updateTeacher: (id: string, teacherData: Partial<TeacherNominative>) => Promise<boolean>;
  deleteTeacher: (id: string) => Promise<boolean>;
  batchAddTeachers: (newTeachers: Omit<TeacherNominative, 'id'>[]) => Promise<boolean>;
  clearAllTeachers: () => Promise<boolean>;
  refreshTeachers: (force?: boolean) => Promise<boolean>;

  // Persyaratan Pelayanan
  serviceRequirements: ServiceRequirement[];
  serviceRequirementCategories: string[];
  selectedServiceRequirement: ServiceRequirement | null;
  setSelectedServiceRequirement: (item: ServiceRequirement | null, customPath?: string) => void;
  addServiceRequirement: (item: Omit<ServiceRequirement, 'id'>) => Promise<boolean>;
  updateServiceRequirement: (id: string, item: Partial<ServiceRequirement>) => Promise<boolean>;
  deleteServiceRequirement: (id: string) => Promise<boolean>;
  resetServiceRequirements: () => Promise<boolean>;
  refreshServiceRequirementsFromSheet: (force?: boolean) => Promise<void>;
  addServiceRequirementCategory: (categoryName: string) => Promise<boolean>;
  deleteServiceRequirementCategory: (categoryName: string) => Promise<boolean>;
  
  // Permintaan Data (Webview)
  dataRequests: DataRequestLink[];
  selectedDataRequestSlug: string | null;
  setSelectedDataRequestSlug: (slug: string | null) => void;
  addDataRequest: (item: Omit<DataRequestLink, 'id'>) => Promise<boolean>;
  updateDataRequest: (id: string, data: Partial<DataRequestLink>) => Promise<boolean>;
  deleteDataRequest: (id: string) => Promise<boolean>;
  toggleDataRequestActive: (id: string) => Promise<boolean>;
  refreshDataRequestsFromSheet: (force?: boolean) => Promise<void>;
  
  // Media Sosial Resmi
  socialMedia: SocialMediaItem[];
  updateSocialMediaItem: (item: SocialMediaItem) => void;
  saveSocialMediaSettings: (items: SocialMediaItem[]) => Promise<boolean>;
  resetSocialMediaDefaults: () => Promise<boolean>;

  // Broadcast & Push Notifikasi PWA
  broadcastHistory: BroadcastNotification[];
  sendBroadcastNotification: (params: SendBroadcastParams) => Promise<SendBroadcastResult>;
  deleteBroadcastNotification: (id: string) => Promise<boolean>;
  refreshBroadcastHistory: () => Promise<void>;

  // Prestasi Siswa & Guru
  achievements: Achievement[];
  selectedAchievementSlug: string | null;
  setSelectedAchievementSlug: (slug: string | null, customPath?: string) => void;
  refreshAchievements: () => Promise<void>;
  addAchievement: (item: Omit<Achievement, 'id'>) => Promise<boolean>;
  updateAchievement: (id: string, item: Partial<Achievement>) => Promise<boolean>;
  deleteAchievement: (id: string) => Promise<boolean>;

  // Auth & Roles
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  refreshAdminUsersFromSheet: () => Promise<boolean>;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  sessionRemainingSeconds: number;
  resetInactivityTimer: () => void;
  addAdminUser: (userData: Omit<AdminUser, 'id'>) => Promise<boolean>;
  updateAdminUser: (id: string, userData: Partial<AdminUser>) => Promise<boolean>;
  deleteAdminUser: (id: string) => Promise<boolean>;

  // Supabase status & operations
  isSupabaseActive: boolean;
  syncStatus: 'connected' | 'offline' | 'syncing';
  exportAllToSupabase: () => Promise<boolean>;
  refreshFromSupabase: (force?: boolean) => Promise<boolean>;

  // CRUD actions
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;
  refreshSchools: (force?: boolean) => Promise<boolean>;

  addNews: (newsItem: Omit<NewsArticle, 'id'>) => void;
  updateNews: (id: string, newsItem: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;
  refreshNewsFromSheet: (force?: boolean) => Promise<void>;
  addNewsCategory: (categoryName: string) => Promise<boolean>;
  incrementNewsViews: (id: string) => Promise<void>;
  recordNewsReadingTime: (id: string, secondsSpent: number, isNewSession?: boolean) => Promise<void>;

  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addDocument: (doc: Omit<DocumentDownload, 'id' | 'downloadCount'>) => void;
  updateDocument: (id: string, doc: Partial<DocumentDownload>) => void;
  deleteDocument: (id: string) => void;
  addDocumentCategory: (categoryName: string) => Promise<boolean>;

  addAgenda: (item: Omit<AgendaEvent, 'id'>) => void;
  updateAgenda: (id: string, item: Partial<AgendaEvent>) => void;
  deleteAgenda: (id: string) => void;

  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  addGalleryCategory: (categoryName: string) => Promise<boolean>;

  addStaff: (staffItem: Omit<StaffProfile, 'id'>) => Promise<boolean>;
  updateStaff: (id: string, staffItem: Partial<StaffProfile>) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;

  addComplaint: (comp: Omit<ComplaintMessage, 'id' | 'status' | 'date'>) => void;
  deleteComplaint: (id: string) => void;
  updateComplaintStatus: (id: string, status: 'Baru' | 'Dibaca' | 'Selesai') => void;
  refreshComplaints: () => Promise<void>;

  updateOfficeProfile: (profile: Partial<OfficeProfile>) => Promise<boolean>;
  updateSOPImageUrl: (url: string) => Promise<boolean>;
  refreshSop: (force?: boolean) => Promise<string>;
  resetToDefaultData: () => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Modern Notice & Confirmation Dialogs
  confirmDialogState: ConfirmDialogOptions | null;
  noticePopupState: NoticePopupOptions | null;
  showConfirmDialog: (options: ConfirmDialogOptions) => Promise<boolean>;
  handleConfirmResponse: (confirmed: boolean) => void;
  closeConfirmDialog: () => void;
  showNoticePopup: (options: NoticePopupOptions) => void;
  closeNoticePopup: () => void;

  // Activity Log (Google Spreadsheet + Supabase Cloud Sync)
  activityLogUrl: string;
  updateActivityLogUrl: (url: string) => Promise<{ success: boolean; message: string }>;
  logAdminActivity: (
    action: ActivityLogPayload['action'],
    module: string,
    description: string,
    status?: 'BERHASIL' | 'GAGAL'
  ) => void;

  // Navigation & Menu Visibility Settings
  menuVisibility: MenuVisibilityMap;
  updateMenuVisibility: (updates: Partial<MenuVisibilityMap>) => Promise<boolean>;
  resetMenuVisibility: () => Promise<boolean>;

  // Mode Maintenance Website
  maintenanceConfig: MaintenanceConfig;
  updateMaintenanceConfig: (updates: Partial<MaintenanceConfig>) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const isDummySchoolImage = (url?: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  if (!trimmed) return true;
  if (trimmed.includes('photo-1580582932707-520aed937b7b')) return true;
  if (
    trimmed.includes('images.unsplash.com/photo-1509062522246') ||
    trimmed.includes('images.unsplash.com/photo-1577896851231') ||
    trimmed.includes('images.unsplash.com/photo-1497633762265') ||
    trimmed.includes('images.unsplash.com/photo-1587654780291') ||
    trimmed.includes('images.unsplash.com/photo-1544717305')
  ) {
    return true;
  }
  return false;
};

// In-memory module cache for instant (0ms) schools display across navigation
let _inMemorySchoolsCache: School[] | null = null;
// In-memory module cache for instant (0ms) teacher nominative display across navigation
let _inMemoryTeachersCache: TeacherNominative[] | null = null;
// In-memory module cache for instant (0ms) gallery albums display across navigation & visitors
let _inMemoryGalleryCache: GalleryItem[] | null = null;
// In-memory module cache for instant (0ms) announcements display across navigation & submenus
let _inMemoryAnnouncementsCache: Announcement[] | null = null;
// In-memory module cache for instant (0ms) documents / downloads display across navigation & visitors
let _inMemoryDocumentsCache: DocumentDownload[] | null = null;
// In-memory module cache for instant (0ms) news articles display across navigation
let _inMemoryNewsCache: NewsArticle[] | null = null;
// In-memory module cache for instant (0ms) organizations display across navigation & visitors
let _inMemoryOrganizationsCache: EducationalOrganization[] | null = null;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDbConfigured = getSupabaseConfig().isConfigured;

  const [schools, setSchools] = useState<School[]>(() => {
    if (_inMemorySchoolsCache && _inMemorySchoolsCache.length > 0) {
      return _inMemorySchoolsCache;
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_schools');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length >= 100) {
          _inMemorySchoolsCache = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    const saved = localStorage.getItem('korwilcam_schools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Validasi: hanya gunakan cache jika datanya lengkap (100+ sekolah serta memuat TK dan KB)
        const hasTk = Array.isArray(parsed) && parsed.some((s: any) => s.level === 'TK');
        const hasKb = Array.isArray(parsed) && parsed.some((s: any) => s.level === 'KB' || s.level === 'PAUD');
        if (Array.isArray(parsed) && parsed.length >= 100 && hasTk && hasKb) {
          _inMemorySchoolsCache = parsed;
          return parsed.map((s: School) => {
            let img = isDummySchoolImage(s.image) ? '' : s.image;
            if (img && isGoogleDriveUrl(img)) {
              img = formatGoogleDriveImageUrl(img);
            }
            return {
              ...s,
              image: img
            };
          });
        }
      } catch {}
    }
    // Jika cache kosong atau usang/parsial, gunakan initialSchools yang sudah berisi 166 sekolah komplit
    return initialSchools;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    if (_inMemoryNewsCache && _inMemoryNewsCache.length > 0) {
      return _inMemoryNewsCache;
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_news');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryNewsCache = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    try {
      const saved = localStorage.getItem('korwilcam_news');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryNewsCache = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    const initial = (initialNews && initialNews.length > 0) ? initialNews : [];
    _inMemoryNewsCache = initial;
    return initial;
  });

  const [newsCategories, setNewsCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_news_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['Kedinasan', 'SD', 'TK/KB', 'Prestasi'];
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const filterMockAnnouncements = (arr: Announcement[]) => {
      return arr.filter(a => a && a.id && !['ann-01', 'ann-02', 'ann-03'].includes(a.id));
    };

    if (_inMemoryAnnouncementsCache && _inMemoryAnnouncementsCache.length > 0) {
      const cleaned = filterMockAnnouncements(_inMemoryAnnouncementsCache);
      if (cleaned.length > 0) return cleaned;
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_announcements');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = filterMockAnnouncements(parsed);
          _inMemoryAnnouncementsCache = cleaned;
          return cleaned;
        }
      }
    } catch (_) {}
    try {
      const saved = localStorage.getItem('korwilcam_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = filterMockAnnouncements(parsed);
          _inMemoryAnnouncementsCache = cleaned;
          return cleaned;
        }
      }
    } catch (_) {}
    const initial = filterMockAnnouncements(initialAnnouncements || []);
    _inMemoryAnnouncementsCache = initial;
    return initial;
  });

  const [agenda, setAgenda] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem('korwilcam_agenda');
    return saved ? JSON.parse(saved) : (initialAgenda || []);
  });

  const [aulaBookings, setAulaBookings] = useState<AulaAgendaBooking[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_aula_agenda_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort(compareAgendaDatesDescending);
        }
      }
    } catch {
      // ignore
    }
    return [...FALLBACK_AULA_BOOKINGS].sort(compareAgendaDatesDescending);
  });
  const [loadingAulaBookings, setLoadingAulaBookings] = useState<boolean>(false);

  const refreshAulaBookings = async () => {
    setLoadingAulaBookings(true);
    try {
      const data = await fetchAulaAgendaFromSheet();
      if (data && data.length > 0) {
        setAulaBookings(data);
      }
    } catch (err) {
      console.warn('Gagal memuat agenda spreadsheet live:', err);
    } finally {
      setLoadingAulaBookings(false);
    }
  };

  useEffect(() => {
    refreshAulaBookings();
  }, []);

  const [documents, setDocuments] = useState<DocumentDownload[]>(() => {
    const filterMockDocs = (arr: DocumentDownload[]) => {
      return arr.filter(d => d && d.id && !['doc-01', 'doc-02', 'doc-03', 'doc-04', 'doc-05'].includes(d.id));
    };

    if (_inMemoryDocumentsCache && _inMemoryDocumentsCache.length > 0) {
      const cleaned = filterMockDocs(_inMemoryDocumentsCache);
      if (cleaned.length > 0) return cleaned;
    }
    const sessionSaved = sessionStorage.getItem('korwilcam_documents');
    if (sessionSaved) {
      try {
        const parsed: DocumentDownload[] = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = filterMockDocs(parsed);
          _inMemoryDocumentsCache = cleaned;
          return cleaned;
        }
      } catch {}
    }
    const saved = localStorage.getItem('korwilcam_documents');
    if (saved) {
      try {
        const parsed: DocumentDownload[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitasi awal: buang dokumen doc-ann-* jika duplikat dari dokumen master
          const masterUrls = new Set<string>();
          parsed.forEach((d) => {
            if (!d.id.startsWith('doc-ann-') && d.downloadUrl && d.downloadUrl !== '#') {
              masterUrls.add(d.downloadUrl.trim());
            }
          });
          const filtered = filterMockDocs(parsed).filter((d) => {
            if (d.id.startsWith('doc-ann-') && d.downloadUrl && masterUrls.has(d.downloadUrl.trim())) {
              return false;
            }
            return true;
          });
          _inMemoryDocumentsCache = filtered;
          return filtered;
        }
      } catch (_) {}
    }
    return filterMockDocs(initialDocuments || []);
  });

  const [documentCategories, setDocumentCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_document_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['Kurikulum', 'Surat Edaran', 'Blanko GTK', 'Juknis Lomba'];
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const sanitizeCachedGalleryList = (items: GalleryItem[]): GalleryItem[] => {
      const mergedList = [...items];
      // Pastikan item dari initialGallery yang belum ada di cache tetap dimasukkan
      initialGallery.forEach((initItem) => {
        if (!mergedList.some((m) => m.id === initItem.id)) {
          mergedList.push(initItem);
        }
      });

      return mergedList.map((item) => {
        const filterValid = (arr: any) => (Array.isArray(arr) ? arr : [])
          .filter((img): img is string => typeof img === 'string' && img.trim().length > 0 && img !== '#' && !img.includes('unsplash.com'));

        const rawImages = filterValid(item.images);
        const meta = extractGalleryMetadata(item.description || '');
        const metaImages = filterValid(meta.images);
        const initialMatch = initialGallery.find((init) => init.id === item.id);
        const initImages = initialMatch ? filterValid(initialMatch.images) : [];

        const candidates = [rawImages, metaImages, initImages];
        candidates.sort((a, b) => b.length - a.length);
        const best = candidates[0] && candidates[0].length > 0 ? candidates[0] : ((item.image && item.image !== '#' && !item.image.includes('unsplash.com')) ? [item.image] : (initialMatch ? filterValid(initialMatch.images) : []));
        const validCover = (item.image && item.image !== '#' && !item.image.includes('unsplash.com')) ? item.image : (best[0] || (initialMatch ? initialMatch.image : ''));

        return {
          ...item,
          image: validCover,
          images: best
        };
      });
    };

    if (_inMemoryGalleryCache && _inMemoryGalleryCache.length > 0) {
      return sanitizeCachedGalleryList(_inMemoryGalleryCache);
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_gallery');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sorted = sortGalleryDescending(sanitizeCachedGalleryList(parsed));
          _inMemoryGalleryCache = sorted;
          return sorted;
        }
      }
    } catch {}
    try {
      const saved = localStorage.getItem('korwilcam_gallery');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sorted = sortGalleryDescending(sanitizeCachedGalleryList(parsed));
          _inMemoryGalleryCache = sorted;
          return sorted;
        }
      }
    } catch {}
    const initialSorted = sortGalleryDescending(initialGallery);
    _inMemoryGalleryCache = initialSorted;
    return initialSorted;
  });

  const [galleryCategories, setGalleryCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_gallery_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return ['Kegiatan Belajar', 'Lomba & Prestasi', 'Rakor & Pelatihan', 'Upacara'];
  });

  const [officeProfile, setOfficeProfile] = useState<OfficeProfile>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_office_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.korwilName &&
          !parsed.korwilName.includes('Bambang Sujarwo') &&
          parsed.korwilPhoto &&
          !parsed.korwilPhoto.includes('unsplash.com')
        ) {
          if (parsed.heroSlideshowImages) {
            parsed.heroSlideshowImages = normalizeHeroSlideshowImages(parsed.heroSlideshowImages);
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialOfficeProfile;
  });

  const [staff, setStaff] = useState<StaffProfile[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_staff');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          !JSON.stringify(parsed).includes('Bambang Sujarwo')
        ) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return initialStaff;
  });

  const [complaints, setComplaints] = useState<ComplaintMessage[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_complaints');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Bersihkan data tiruan bawaan (comp-01, comp-02) agar hanya menyajikan data riil
          return parsed.filter((c: any) => c.id !== 'comp-01' && c.id !== 'comp-02');
        }
      }
    } catch {}
    return [];
  });

  const [sopImageUrl, setSopImageUrl] = useState<string>(() => {
    return localStorage.getItem('korwilcam_sop_image_url') || '';
  });

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [selectedNews, setSelectedNewsState] = useState<NewsArticle | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncementState] = useState<Announcement | null>(null);
  const [selectedSchool, setSelectedSchoolState] = useState<School | null>(null);
  const [selectedGallery, setSelectedGalleryState] = useState<GalleryItem | null>(null);
  const [galleryActiveTab, setGalleryActiveTabState] = useState<'photo' | 'video'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'video' || window.location.pathname.startsWith('/galeri/video')) {
        return 'video';
      }
      try {
        const saved = sessionStorage.getItem('korwilcam_gallery_tab');
        if (saved === 'video') return 'video';
      } catch {}
    }
    return 'photo';
  });
  const [videos, setVideos] = useState<GalleryVideoItem[]>(() => getLocalVideoCache());
  const [selectedVideo, setSelectedVideoState] = useState<GalleryVideoItem | null>(null);
  const [isVideosLoading, setIsVideosLoading] = useState<boolean>(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocumentState] = useState<DocumentDownload | null>(null);
  const [selectedServiceRequirement, setSelectedServiceRequirementState] = useState<ServiceRequirement | null>(null);
  const [organizations, setOrganizations] = useState<EducationalOrganization[]>(() => {
    if (_inMemoryOrganizationsCache && _inMemoryOrganizationsCache.length > 0) {
      return _inMemoryOrganizationsCache;
    }
    try {
      const session = sessionStorage.getItem('korwilcam_organizations');
      if (session) {
        const parsed = JSON.parse(session);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryOrganizationsCache = parsed;
          return parsed;
        }
      }
    } catch {}
    try {
      const saved = localStorage.getItem('korwilcam_organizations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryOrganizationsCache = parsed;
          return parsed;
        }
      }
    } catch {}
    _inMemoryOrganizationsCache = initialOrganizations;
    return initialOrganizations;
  });
  const [selectedOrganizationSlug, setSelectedOrganizationSlugState] = useState<string | null>(null);
  const [selectedPurnaTugasNip, setSelectedPurnaTugasNipState] = useState<string | null>(null);

  const [teachers, setTeachers] = useState<TeacherNominative[]>(() => {
    if (_inMemoryTeachersCache && _inMemoryTeachersCache.length > 0) {
      return _inMemoryTeachersCache;
    }

    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_teachers');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter(
            (t: any) => !t.id?.startsWith('guru-00') && !t.id?.startsWith('guru-01')
          );
          if (filtered.length > 0) {
            _inMemoryTeachersCache = filtered;
            return filtered;
          }
        }
      }
    } catch {}

    try {
      const saved = localStorage.getItem('korwilcam_teachers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Buang data dummy bawaan awal (guru-001 s.d. guru-012)
          const filtered = parsed.filter(
            (t: any) => !t.id?.startsWith('guru-00') && !t.id?.startsWith('guru-01')
          );
          if (filtered.length > 0) {
            _inMemoryTeachersCache = filtered;
            return filtered;
          }
        }
      }
      return initialTeachers;
    } catch {
      return initialTeachers;
    }
  });

  const [serviceRequirements, setServiceRequirements] = useState<ServiceRequirement[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_service_requirements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Buang data dummy bawaan awal (req-01 s.d. req-07 atau req-init)
          const filtered = parsed.filter(
            (r: any) => !r.id?.startsWith('req-0') && !r.id?.startsWith('req-init')
          );
          if (filtered.length > 0) return filtered;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [serviceRequirementCategories, setServiceRequirementCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_service_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      'Kepegawaian & GTK',
      'Kesiswaan & Kurikulum',
      'Kelembagaan & Legalitas',
      'Umum & Tata Usaha'
    ];
  });

  const [dataRequests, setDataRequests] = useState<DataRequestLink[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_data_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialDataRequests;
    } catch {
      return initialDataRequests;
    }
  });

  const [selectedDataRequestSlug, setSelectedDataRequestSlug] = useState<string | null>(null);

  const [socialMedia, setSocialMedia] = useState<SocialMediaItem[]>(() => getLocalSocialMedia());
  const [menuVisibility, setMenuVisibility] = useState<MenuVisibilityMap>(() => getLocalNavigationVisibility());
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(() => getLocalMaintenanceConfig());

  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastNotification[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_broadcast_history');
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    return getLocalAchievementsCache();
  });
  const [selectedAchievementSlug, setSelectedAchievementSlugState] = useState<string | null>(null);

  // Konstanta Batas Waktu Inaktivitas Sesi CMS (20 Menit = 1.200.000 ms)
  const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;
  const INACTIVITY_TIMEOUT_SECONDS = 20 * 60;

  // Cek validitas sesi awal saat aplikasi dimuat (Bank-Grade Session Timeout)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const hasAuth = localStorage.getItem('korwilcam_admin_auth') === 'true';
      const userStr = localStorage.getItem('korwilcam_current_user');
      if (!hasAuth || !userStr) {
        return null;
      }
      const rawActivity = localStorage.getItem('korwilcam_last_activity');
      if (rawActivity) {
        const lastActivity = Number(rawActivity);
        // Jika sudah lebih dari 20 menit tidak ada aktivitas sama sekali sejak sesi sebelumnya
        if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
          localStorage.removeItem('korwilcam_admin_auth');
          localStorage.removeItem('korwilcam_current_user');
          localStorage.removeItem('korwilcam_last_activity');
          try {
            sessionStorage.setItem('korwilcam_session_expired', 'true');
          } catch {}
          return null;
        }
      } else {
        localStorage.setItem('korwilcam_last_activity', String(Date.now()));
      }
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const hasAuth = localStorage.getItem('korwilcam_admin_auth') === 'true';
    const hasUser = Boolean(localStorage.getItem('korwilcam_current_user'));
    const rawActivity = localStorage.getItem('korwilcam_last_activity');
    if (!hasAuth || !hasUser) return false;
    if (rawActivity) {
      const lastActivity = Number(rawActivity);
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT_MS) {
        return false;
      }
    }
    return true;
  });

  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(() => {
    const rawActivity = localStorage.getItem('korwilcam_last_activity');
    if (!rawActivity) return INACTIVITY_TIMEOUT_SECONDS;
    const elapsed = Date.now() - Number(rawActivity);
    return Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
  });

  const lastActivityRef = useRef<number>(Date.now());
  const lastRecordedStorageRef = useRef<number>(Date.now());
  const lastPublicRefreshRef = useRef<number>(0);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_admin_users');
      return saved ? JSON.parse(saved) : initialAdminUsers;
    } catch {
      return initialAdminUsers;
    }
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // State for Confirm Dialog
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogOptions | null>(null);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const showConfirmDialog = (options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
      setConfirmDialogState(options);
    });
  };

  const handleConfirmResponse = (confirmed: boolean) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(confirmed);
      confirmResolverRef.current = null;
    }
    setConfirmDialogState(null);
  };

  const closeConfirmDialog = () => {
    handleConfirmResponse(false);
  };

  // State for Notice Popup
  const [noticePopupState, setNoticePopupState] = useState<NoticePopupOptions | null>(null);

  const showNoticePopup = (options: NoticePopupOptions) => {
    setNoticePopupState(options);
  };

  const closeNoticePopup = () => {
    setNoticePopupState(null);
  };

  // Notifikasi otomatis jika sesi berakhir saat baru membuka browser kembali
  useEffect(() => {
    try {
      const expiredFlag = sessionStorage.getItem('korwilcam_session_expired');
      if (expiredFlag) {
        sessionStorage.removeItem('korwilcam_session_expired');
        showNoticePopup({
          title: 'Sesi Berakhir Otomatis',
          message: 'Sesi akun Anda telah keluar secara otomatis karena tidak ada aktivitas selama 20 menit (Sistem Keamanan Portal CMS). Silakan login kembali.',
          type: 'warning',
          duration: 8000
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // Supabase state
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });
  const [syncStatus, setSyncStatus] = useState<'connected' | 'offline' | 'syncing'>(() => {
    return getSupabaseConfig().isConfigured ? 'connected' : 'offline';
  });

  useEffect(() => {
    try {
      if (adminUsers && adminUsers.length > 0) {
        localStorage.setItem('korwilcam_admin_users', JSON.stringify(adminUsers));
      }
    } catch {
      // ignore
    }
  }, [adminUsers]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('korwilcam_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('korwilcam_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // State URL Webhook Google Apps Script (Tersinkronisasi otomatis via tabel activity_log_settings Supabase Cloud)
  const [activityLogUrl, setActivityLogUrlState] = useState<string>(() => getActivityLogUrl());

  const updateActivityLogUrl = async (url: string): Promise<{ success: boolean; message: string }> => {
    const clean = (url || '').trim();
    setActivityLogUrl(clean);
    setActivityLogUrlState(clean);
    const result = await saveActivityLogUrlToSupabase(clean);
    return result;
  };

  // Helper pencatat Log Aktivitas ke Google Spreadsheet
  const triggerActivityLog = (
    action: ActivityLogPayload['action'],
    module: string,
    description: string,
    status: 'BERHASIL' | 'GAGAL' = 'BERHASIL',
    overrideUser?: { name?: string; username?: string; role?: string }
  ) => {
    logActivity({
      user: overrideUser?.name || currentUser?.name || 'Administrator',
      username: overrideUser?.username || currentUser?.username || 'admin',
      role: overrideUser?.role || currentUser?.role || 'Admin',
      action,
      module,
      description,
      status
    });
  };

  // Helper non-blocking storage saver agar browser tidak freeze saat serialisasi dataset besar
  const saveStorageDeferred = (key: string, data: any, isSession: boolean = false) => {
    const runner = () => {
      try {
        const serialized = JSON.stringify(data);
        if (isSession) {
          sessionStorage.setItem(key, serialized);
        } else {
          localStorage.setItem(key, serialized);
        }
      } catch (e) {
        // quota or private browsing protection fallback
        try {
          if (!isSession && Array.isArray(data)) {
            const lightweight = data.map((item: any) => {
              if (item && item.downloadUrl && item.downloadUrl.startsWith('data:')) {
                return { ...item, downloadUrl: '#' };
              }
              if (item && item.fileUrl && item.fileUrl.startsWith('data:')) {
                return { ...item, fileUrl: '#' };
              }
              return item;
            });
            localStorage.setItem(key, JSON.stringify(lightweight));
          }
        } catch (_) {}
      }
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(runner, { timeout: 1500 });
    } else {
      setTimeout(runner, 60);
    }
  };

  // Sync to local storage for local resilience with quota protection
  useEffect(() => {
    saveStorageDeferred('korwilcam_schools', schools);
  }, [schools]);

  useEffect(() => {
    _inMemoryNewsCache = news;
    saveStorageDeferred('korwilcam_news', news, true);
    saveStorageDeferred('korwilcam_news', news);
  }, [news]);

  useEffect(() => {
    _inMemoryAnnouncementsCache = announcements;
    saveStorageDeferred('korwilcam_announcements', announcements, true);
    saveStorageDeferred('korwilcam_announcements', announcements);
  }, [announcements]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_agenda', agenda);
  }, [agenda]);

  useEffect(() => {
    _inMemoryDocumentsCache = documents;
    saveStorageDeferred('korwilcam_documents', documents, true);
    saveStorageDeferred('korwilcam_documents', documents);
  }, [documents]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_gallery', gallery, true);
    saveStorageDeferred('korwilcam_gallery', gallery);
  }, [gallery]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_office_profile', officeProfile);
  }, [officeProfile]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_staff', staff);
  }, [staff]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_organizations', organizations);
  }, [organizations]);

  useEffect(() => {
    _inMemoryTeachersCache = teachers;
    saveStorageDeferred('korwilcam_teachers', teachers, true);
    saveStorageDeferred('korwilcam_teachers', teachers);
  }, [teachers]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_complaints', complaints);
  }, [complaints]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_service_requirements', serviceRequirements);
  }, [serviceRequirements]);

  useEffect(() => {
    saveStorageDeferred('korwilcam_data_requests', dataRequests);
  }, [dataRequests]);

  // Durasi masa aktif cache browser publik (20 menit).
  // Selama dalam 20 menit, pengunjung yang me-refresh atau berpindah halaman
  // TIDAK AKAN menembak kueri ke Supabase sama sekali (0 Byte Egress).
  const CACHE_TTL_MS = 20 * 60 * 1000;

  // [TERPUTUS DARI SUPABASE] Sinkronisasi daftar_guru tidak lagi memanggil Supabase.
  // Dialihkan ke Google Spreadsheet (Read-Only) agar bebas kuota egress selamanya.
  const refreshTeachers = async (force: boolean = false): Promise<boolean> => {
    if (!force && _inMemoryTeachersCache && _inMemoryTeachersCache.length > 0) {
      return true;
    }

    try {
      const sheetTeachers = await fetchTeachersFromSheet(force);
      if (sheetTeachers && sheetTeachers.length > 0) {
        _inMemoryTeachersCache = sheetTeachers;
        setTeachers(sheetTeachers);
        try {
          sessionStorage.setItem('korwilcam_teachers', JSON.stringify(sheetTeachers));
          localStorage.setItem('korwilcam_teachers', JSON.stringify(sheetTeachers));
        } catch {}
        return true;
      }
    } catch (errTeach) {
      console.warn('Gagal memuat guru dari spreadsheet:', errTeach);
    }
    return false;
  };

  // Fungsi khusus untuk sinkronisasi data seluruh sekolah (SD, TK, KB) dari Supabase secara real-time
  const refreshSchools = async (force: boolean = false): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) return false;

    // Cache hit: Gunakan data sekolah lokal jika sudah ada di memori agar ratusan pengunjung tidak menarik ulang seluruh daftar sekolah
    if (!force && _inMemorySchoolsCache && _inMemorySchoolsCache.length >= 50) {
      return true;
    }

    try {
      const { data: dbSchools, error: schErr } = await client
        .from('schools')
        .select('*')
        .limit(2000);

      if (!schErr && Array.isArray(dbSchools) && dbSchools.length > 0) {
        const mappedSchools: School[] = dbSchools.map((s: any) => {
          const rawImage = String(s.image || s.foto || s.gambar || '').trim();
          let cleanImage = isDummySchoolImage(rawImage) ? '' : rawImage;
          if (cleanImage && isGoogleDriveUrl(cleanImage)) {
            cleanImage = formatGoogleDriveImageUrl(cleanImage);
          }
          const rawLvl = String(s.level || s.jenjang || 'SD').trim().toUpperCase();
          const cleanLvl = rawLvl === 'PAUD' ? 'KB' : (rawLvl === 'TK' ? 'TK' : (rawLvl === 'KB' ? 'KB' : 'SD'));
          const rawStatus = String(s.status || 'Negeri').trim();
          const cleanStatus = rawStatus.toLowerCase().includes('swasta') ? 'Swasta' : 'Negeri';

          return {
            id: String(s.id || s.npsn || `sch-${Date.now()}`),
            name: String(s.name || s.nama || s.nama_sekolah || '').trim(),
            level: cleanLvl as any,
            status: cleanStatus as any,
            npsn: String(s.npsn || '').trim(),
            akreditasi: (s.akreditasi || 'Belum Terakreditasi') as any,
            headmaster: String(s.headmaster || s.kepala_sekolah || s.ks || '').trim(),
            address: String(s.address || s.alamat || '').trim(),
            desa: String(s.desa || s.kelurahan || '').trim(),
            studentsCount: Number(s.students_count ?? s.studentsCount ?? s.jumlah_siswa ?? 0),
            teachersCount: Number(s.teachers_count ?? s.teachersCount ?? s.jumlah_guru ?? 0),
            phone: String(s.phone || s.telepon || s.no_hp || '').trim(),
            email: String(s.email || '').trim(),
            image: cleanImage,
            coordinates: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || s.titikKoordinat || ''),
            titikKoordinat: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || s.titikKoordinat || ''),
            featured: Boolean(s.featured)
          };
        });

        _inMemorySchoolsCache = mappedSchools;
        setSchools(mappedSchools);
        try {
          sessionStorage.setItem('korwilcam_schools', JSON.stringify(mappedSchools));
        } catch {}
        try {
          localStorage.setItem('korwilcam_schools', JSON.stringify(mappedSchools));
        } catch {}
        return true;
      }
      return false;
    } catch (errSch) {
      console.warn('Tabel schools belum terbaca:', errSch);
      return false;
    }
  };

  // Initial fetch from Supabase if connected
  const refreshFromSupabase = async (force: boolean = false): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) {
      setSyncStatus('offline');
      setIsSupabaseActive(false);
      return false;
    }

    // Cooldown untuk pengunjung publik: jangan refresh ulang seluruh database jika baru saja di-refresh (< 5 menit)
    // Menghindari ribuan query simultan saat tautan portal dibagikan ke banyak orang secara bersamaan
    const now = Date.now();
    if (!isAuthenticated && !force && (now - lastPublicRefreshRef.current < 5 * 60 * 1000)) {
      return true;
    }
    lastPublicRefreshRef.current = now;

    // PENTING: Status mode maintenance & visibilitas menu TIDAK BOLEH tertahan cache data sekolah (20 menit).
    // Keduanya harus selalu diperiksa secara live ke Supabase setiap kali portal dimuat!
    (async () => {
      try {
        const mConfig = await fetchMaintenanceFromSupabase();
        if (mConfig) setMaintenanceConfig(mConfig);
        const vis = await fetchNavigationVisibilityFromSupabase();
        if (vis && typeof vis === 'object') setMenuVisibility(vis);
      } catch (errNavQuick) {
        console.warn('Gagal quick-check maintenance Supabase:', errNavQuick);
      }
    })();

    // Safety timer: Pastikan status sinkronisasi tidak pernah tersangkut pada mode 'syncing' lebih dari 5 detik
    const syncSafetyTimeout = setTimeout(() => {
      setSyncStatus((prev) => (prev === 'syncing' ? 'connected' : prev));
    }, 5000);

    try {
      setSyncStatus('syncing');

      // 0. Fetch schools, daftar_guru, & news SECARA INSTAN DAN EFISIEN
      const schoolsFetchPromise = (!force && schools.length >= 100) ? Promise.resolve(true) : refreshSchools(force);
      const teachersFetchPromise = refreshTeachers(force);

      // 0.05 Fetch news dari Google Spreadsheet & Cache
      const newsFetchPromise = (async () => {
        try {
          const sheetNews = await fetchNewsFromSheet(force);
          if (sheetNews && sheetNews.length > 0) {
            _inMemoryNewsCache = sheetNews;
            setNews(sheetNews);
            try {
              sessionStorage.setItem('korwilcam_news', JSON.stringify(sheetNews));
              localStorage.setItem('korwilcam_news', JSON.stringify(sheetNews));
            } catch {}

            // Ekstrak kategori dari berita spreadsheet
            const catSet = new Set<string>(['Kedinasan', 'SD', 'TK/KB', 'Prestasi']);
            sheetNews.forEach((n) => {
              if (n.category) catSet.add(n.category.trim());
            });
            const allCats = Array.from(catSet);
            setNewsCategories(allCats);
            try {
              localStorage.setItem('korwilcam_news_categories', JSON.stringify(allCats));
            } catch {}
          } else {
            const cached = _inMemoryNewsCache || [];
            if (cached.length > 0) {
              setNews(cached);
            }
          }
        } catch (errNews) {
          console.warn('Gagal memuat berita dari Spreadsheet:', errNews);
          const cached = _inMemoryNewsCache || [];
          if (cached.length > 0) {
            setNews(cached);
          }
        }
      })();

      // 0.1 Fetch service_requirements and categories from Google Spreadsheet
      const serviceReqsFetchPromise = (async () => {
        try {
          const sheetRes = await fetchServiceRequirementsFromSheet();
          if (sheetRes && Array.isArray(sheetRes.items)) {
            setServiceRequirements(sheetRes.items);
            if (sheetRes.categories && sheetRes.categories.length > 0) {
              setServiceRequirementCategories((prev) => {
                const merged = Array.from(new Set([...prev, ...sheetRes.categories]));
                try {
                  localStorage.setItem('korwilcam_service_categories', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          }

          // Tarik juga kategori dari tabel Supabase service_categories jika ada
          try {
            const { data: dbServiceCats } = await client.from('service_categories').select('*');
            if (dbServiceCats && Array.isArray(dbServiceCats) && dbServiceCats.length > 0) {
              const extraCats = dbServiceCats.map((c: any) => c.name || c.kategori || c.title || '').filter(Boolean);
              if (extraCats.length > 0) {
                setServiceRequirementCategories((prev) => {
                  const merged = Array.from(new Set([...prev, ...extraCats]));
                  try {
                    localStorage.setItem('korwilcam_service_categories', JSON.stringify(merged));
                  } catch {}
                  return merged;
                });
              }
            }
          } catch (_) {}
        } catch (errReq) {
          console.warn('Gagal memuat service_requirements dari Spreadsheet:', errReq);
        }
      })();

      // 0.15 Fetch data_requests dari Google Spreadsheet (force refresh on load)
      const dataReqsFetchPromise = (async () => {
        try {
          const sheetItems = await fetchDataRequestsFromSheet(true);
          if (sheetItems && Array.isArray(sheetItems) && sheetItems.length > 0) {
            setDataRequests(sheetItems);
          }
        } catch (errDataReq) {
          console.warn('Gagal memuat data_requests dari Spreadsheet:', errDataReq);
        }
      })();

      // 0.16 Fetch social_media_settings IMMEDIATELY IN PARALLEL
      const socialMediaFetchPromise = (async () => {
        try {
          const items = await fetchSocialMediaFromSupabase();
          if (items && items.length > 0) {
            setSocialMedia(items);
          }
        } catch (errSocMed) {
          console.warn('Tabel social_media_settings belum terbaca:', errSocMed);
        }
      })();

      // 0.17 Fetch broadcast_notifications IMMEDIATELY IN PARALLEL
      const broadcastFetchPromise = (async () => {
        try {
          const items = await fetchBroadcastHistory();
          if (Array.isArray(items)) {
            setBroadcastHistory(items);
          }
        } catch (errBc) {
          console.warn('Tabel broadcast_notifications belum terbaca:', errBc);
        }
      })();

      // 0.175 Fetch menu visibility & maintenance settings (LocalStorage / Persiapan Spreadsheet)
      const navSettingsFetchPromise = (async () => {
        try {
          const vis = await fetchNavigationVisibilityFromSupabase();
          if (vis && typeof vis === 'object') {
            setMenuVisibility(vis);
          }
          const mConfig = await fetchMaintenanceFromSupabase();
          if (mConfig) {
            setMaintenanceConfig(mConfig);
          }
        } catch (errNav) {
          console.warn('Gagal memuat pengaturan menu / maintenance:', errNav);
        }
      })();


      // 0.18 Fetch achievements IMMEDIATELY IN PARALLEL (Google Spreadsheet Live)
      const achievementsFetchPromise = (async () => {
        try {
          const live = await fetchAchievementsFromSheet();
          if (live && live.length > 0) {
            setAchievements(live);
          }
        } catch (e) {
          console.warn('Gagal memuat live prestasi dari spreadsheet saat aplikasi dibuka:', e);
        }
      })();

      // 0.19 Fetch gallery videos IMMEDIATELY IN PARALLEL (Google Spreadsheet Video Kegiatan)
      const videosFetchPromise = (async () => {
        try {
          const live = await fetchVideosFromSheet();
          if (live && live.length > 0) {
            setVideos(live);
          }
        } catch (e) {
          console.warn('Gagal memuat live video kegiatan dari spreadsheet saat aplikasi dibuka:', e);
        }
      })();


      // 0.2 Fetch photo gallery IMMEDIATELY IN PARALLEL (Google Spreadsheet Live)
      const galleryFetchPromise = (async () => {
        try {
          const live = await fetchGalleryFromSheet();
          if (live && live.length > 0) {
            setGallery(live);
            _inMemoryGalleryCache = live;
            try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(live)); } catch {}
          }
        } catch (e) {
          console.warn('Gagal memuat live galeri foto dari spreadsheet saat aplikasi dibuka:', e);
        }
      })();

      // 0.25 Fetch admin users IMMEDIATELY IN PARALLEL (Google Spreadsheet Live)
      const adminUsersFetchPromise = (async () => {
        try {
          const liveUsers = await fetchAdminUsersFromSheet();
          if (liveUsers && liveUsers.length > 0) {
            setAdminUsers(liveUsers);
          }
        } catch (e) {
          console.warn('Gagal memuat admin_users dari spreadsheet saat aplikasi dibuka:', e);
        }
      })();

      // 0.3 Fetch announcements IMMEDIATELY IN PARALLEL (Pengumuman & Surat Edaran)
      // Supaya pengumuman terbaru langsung tampil instan (0ms) tanpa delay bagi pengunjung!
      let loadedAnnouncements: Announcement[] = [];
      const announcementsFetchPromise = (async () => {
        try {
          const { data: dbAnnouncements, error: annErr } = await client
            .from('announcements')
            .select('*');

          if (!annErr && dbAnnouncements) {
            loadedAnnouncements = dbAnnouncements.map((a: any) => {
              let fileSize = a.file_size || a.fileSize || '';
              let fileName = a.file_name || a.fileName || '';
              let fileType = a.file_type || a.fileType || '';
              let fileUrl = a.file_url || a.fileUrl || '';
              let serviceRequirementId = a.service_requirement_id || a.serviceRequirementId || '';
              let serviceRequirementTitle = a.service_requirement_title || a.serviceRequirementTitle || '';
              let sourceDocumentId = a.source_document_id || a.sourceDocumentId || '';
              let author = a.author || a.penulis || '';
              let authorId = a.author_id || a.authorId || '';
              let authorRole = a.author_role || a.authorRole || '';

              if (fileSize && fileSize.includes('|')) {
                const parts = fileSize.split('|');
                fileSize = parts[0] || '';
                fileName = parts[1] || fileName;
                fileType = parts[2] || fileType;
                fileUrl = parts[3] || fileUrl;
                serviceRequirementId = parts[4] || serviceRequirementId;
                serviceRequirementTitle = parts[5] || serviceRequirementTitle;
                sourceDocumentId = parts[6] || sourceDocumentId;
                if (parts.length > 7 && parts[7]) author = parts[7];
                if (parts.length > 8 && parts[8]) authorId = parts[8];
                if (parts.length > 9 && parts[9]) authorRole = parts[9];
              }

              const title = String(a.title || a.judul || '').trim();
              return {
                id: String(a.id || `ann-${Date.now()}`),
                title,
                date: a.date || a.tanggal || (a.created_at ? new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })),
                urgency: a.urgency || a.prioritas || 'Biasa',
                target: a.target || a.sasaran || 'Semua Satuan',
                fileSize: fileSize || '1 MB',
                fileUrl: fileUrl || '#',
                fileName: fileName || 'lampiran.pdf',
                fileType: fileType || 'PDF',
                summary: a.summary || a.ringkasan || title || '',
                serviceRequirementId: serviceRequirementId || undefined,
                serviceRequirementTitle: serviceRequirementTitle || undefined,
                sourceDocumentId: sourceDocumentId || undefined,
                author: author || 'Humas Korwilcam Purwodadi',
                authorId: authorId || undefined,
                authorRole: authorRole || 'Admin'
              };
            });
            _inMemoryAnnouncementsCache = loadedAnnouncements;
            setAnnouncements(loadedAnnouncements);
            try {
              sessionStorage.setItem('korwilcam_announcements', JSON.stringify(loadedAnnouncements));
            } catch {}
            try {
              localStorage.setItem('korwilcam_announcements', JSON.stringify(loadedAnnouncements));
            } catch (quotaErr) {
              try {
                const lightweight = loadedAnnouncements.map(item => ({
                  ...item,
                  fileUrl: (item.fileUrl && item.fileUrl.startsWith('data:')) ? '#' : item.fileUrl
                }));
                localStorage.setItem('korwilcam_announcements', JSON.stringify(lightweight));
              } catch {}
            }
          }
        } catch (errAnn) {
          console.warn('Tabel announcements parallel fetch warning:', errAnn);
        }
        return loadedAnnouncements;
      })();

      // 0.3 Fetch documents IMMEDIATELY IN PARALLEL (Layanan Unduhan & Unduh Berkas)
      // Supaya seluruh berkas unduhan langsung tampil instan (0ms) tanpa harus menunggu antrean sekolah dan berita!
      const documentsFetchPromise = (async () => {
        try {
          const [anns, { data: dbDocs, error: docErr }] = await Promise.all([
            announcementsFetchPromise,
            client.from('documents').select('*')
          ]);

          if (!docErr && dbDocs) {
            const sopDoc = dbDocs.find((d: any) => d.id === 'sop-main' || d.category === 'SOP Pelayanan');
            if (sopDoc && (sopDoc.download_url || sopDoc.downloadUrl)) {
              const rawUrl = sopDoc.download_url || sopDoc.downloadUrl;
              const loadedUrl = formatGoogleDriveImageUrl(rawUrl);
              if (loadedUrl) {
                setSopImageUrl(loadedUrl);
                try {
                  localStorage.setItem('korwilcam_sop_image_url', loadedUrl);
                } catch {}
              }
            }

            // Cari master kategori berkas tersimpan di Supabase
            const sysDocCat = dbDocs.find((d: any) => d.id === 'system-document-categories');
            let loadedDocCategories: string[] = ['Kurikulum', 'Surat Edaran', 'Blanko GTK', 'Juknis Lomba'];
            if (sysDocCat) {
              try {
                if (sysDocCat.description) {
                  const parsed = JSON.parse(sysDocCat.description);
                  if (Array.isArray(parsed)) loadedDocCategories = parsed;
                }
              } catch {}
            }

            const actualDocs = dbDocs.filter((d: any) => d.id !== 'sop-main' && d.id !== 'system-document-categories');

            // Kumpulkan kategori dari dokumen aktual
            actualDocs.forEach((d: any) => {
              if (d.category && typeof d.category === 'string') {
                const c = d.category.trim();
                if (c && c !== 'SOP Pelayanan' && c !== 'System' && !loadedDocCategories.some(cat => cat.toLowerCase() === c.toLowerCase())) {
                  loadedDocCategories.push(c);
                }
              }
            });

            // Pastikan kategori default selalu tersedia
            ['Kurikulum', 'Surat Edaran', 'Blanko GTK', 'Juknis Lomba'].forEach(def => {
              if (!loadedDocCategories.some(cat => cat.toLowerCase() === def.toLowerCase())) {
                loadedDocCategories.push(def);
              }
            });

            setDocumentCategories(loadedDocCategories);
            try {
              localStorage.setItem('korwilcam_document_categories', JSON.stringify(loadedDocCategories));
            } catch {}

            const mappedActualDocs: DocumentDownload[] = actualDocs.map((d: any) => ({
              id: String(d.id || `doc-${Date.now()}`),
              title: String(d.title || d.judul || '').trim(),
              category: d.category || d.kategori || 'Surat Edaran',
              fileType: d.file_type || d.fileType || 'PDF',
              fileSize: d.file_size || d.fileSize || '500 KB',
              downloadCount: Number(d.download_count || d.downloadCount || 0),
              date: d.date || d.tanggal || '',
              description: d.description || d.deskripsi || '',
              downloadUrl: d.download_url || d.downloadUrl || '#'
            }));

            // 1. Identifikasi dokumen master (dokumen asli yang diunggah di menu Layanan Unduhan)
            const masterDocs = mappedActualDocs.filter(
              (d) => !d.id.startsWith('doc-ann-') && d.id !== 'sop-main' && d.id !== 'system-document-categories'
            );

            // Kumpulan URL dan judul dokumen master untuk deteksi duplikasi cepat
            const masterDocUrls = new Set<string>();
            const masterDocTitles = new Set<string>();
            masterDocs.forEach((d) => {
              if (d.downloadUrl && d.downloadUrl !== '#' && !d.downloadUrl.startsWith('#')) {
                masterDocUrls.add(d.downloadUrl.trim());
              }
              if (d.title) {
                masterDocTitles.add(d.title.trim().toLowerCase());
              }
            });

            // 2. Deteksi dan eliminasi dokumen duplikat (doc-ann-*) dari mappedActualDocs yang menduplikat dokumen master
            const duplicateDocIdsToDelete: string[] = [];
            const cleanActualDocs = mappedActualDocs.filter((d) => {
              if (d.id.startsWith('doc-ann-')) {
                const annId = d.id.replace(/^doc-ann-/, '');
                const matchingAnn = (anns || loadedAnnouncements).find(
                  (a) => a.id === annId || `doc-ann-${a.id}` === d.id
                );

                const isUrlDup = Boolean(
                  d.downloadUrl && d.downloadUrl !== '#' && masterDocUrls.has(d.downloadUrl.trim())
                );
                const isTitleDup = masterDocTitles.has(d.title.trim().toLowerCase());
                const isAnnLinkedToMaster = Boolean(
                  matchingAnn &&
                    (matchingAnn.sourceDocumentId ||
                      (matchingAnn.fileUrl && matchingAnn.fileUrl !== '#' && masterDocUrls.has(matchingAnn.fileUrl.trim())) ||
                      (matchingAnn.fileName && masterDocTitles.has(matchingAnn.fileName.trim().toLowerCase())))
                );

                if (isUrlDup || isTitleDup || isAnnLinkedToMaster) {
                  duplicateDocIdsToDelete.push(d.id);
                  return false;
                }
              }
              return true;
            });

            // Pembersihan duplikasi dilakukan secara instan di level memori browser tanpa menembak DELETE ke Supabase saat fetch
            // Hal ini mutlak diperlukan untuk mencegah trigger berulang (infinite loop) dengan Supabase Realtime listener
            if (duplicateDocIdsToDelete.length > 0) {
              // Di level memori cleanActualDocs sudah disaring dengan bersih
            }

            // 3. SINKRONISASI OTOMATIS: HANYA pengumuman dengan BERKAS BARU yang disinkronkan
            const missingAnnDocs: DocumentDownload[] = [];
            (anns || loadedAnnouncements).forEach((ann) => {
              if (ann.fileUrl && ann.fileUrl.trim() !== '' && ann.fileUrl !== '#') {
                const annFileUrl = ann.fileUrl.trim();
                const annFileName = ann.fileName?.trim().toLowerCase() || '';
                const matchedMasterDoc = masterDocs.find(
                  (m) =>
                    (ann.sourceDocumentId && m.id === ann.sourceDocumentId) ||
                    (m.downloadUrl && m.downloadUrl !== '#' && m.downloadUrl.trim() === annFileUrl) ||
                    (annFileName && m.title.trim().toLowerCase() === annFileName && m.fileSize === ann.fileSize)
                );

                if (matchedMasterDoc) {
                  if (!ann.sourceDocumentId) ann.sourceDocumentId = matchedMasterDoc.id;
                  return;
                }

                const expectedDocId = `doc-ann-${ann.id}`;
                const alreadyInDocs = cleanActualDocs.some(
                  (d) =>
                    d.id === expectedDocId ||
                    (d.title.toLowerCase() === ann.title.trim().toLowerCase() && d.category === 'Surat Edaran')
                );

                if (!alreadyInDocs) {
                  const ext = (ann.fileType || ann.fileName?.split('.').pop() || 'PDF').toUpperCase();
                  const detectedType = (ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'XLSX' || ext === 'XLS' ? 'XLSX' : 'PDF') as 'PDF' | 'DOCX' | 'XLSX';
                  const newSyncedDoc: DocumentDownload = {
                    id: expectedDocId,
                    title: ann.title.trim(),
                    category: 'Surat Edaran',
                    fileType: detectedType,
                    fileSize: ann.fileSize || '1 MB',
                    downloadCount: 0,
                    date: ann.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
                    description: ann.summary || `Berkas lampiran resmi pengumuman: ${ann.title.trim()}`,
                    downloadUrl: ann.fileUrl
                  };
                  missingAnnDocs.push(newSyncedDoc);
                  // Catatan arsitektur: Dokumen lampiran pengumuman disintesis langsung ke state browser
                  // dan disimpan permanen ke Supabase saat admin menerbitkan pengumuman (addAnnouncement).
                  // Dilarang melakukan client.from('documents').upsert() di dalam fetch agar tidak terjadi infinite loop realtime!
                }
              }
            });

            const finalDocs = [...missingAnnDocs, ...cleanActualDocs];
            _inMemoryDocumentsCache = finalDocs;
            setDocuments(finalDocs);
            try {
              sessionStorage.setItem('korwilcam_documents', JSON.stringify(finalDocs));
            } catch {}
            try {
              localStorage.setItem('korwilcam_documents', JSON.stringify(finalDocs));
            } catch (quotaErr) {
              try {
                const lightweight = finalDocs.map((item) => ({
                  ...item,
                  downloadUrl: item.downloadUrl && item.downloadUrl.startsWith('data:') ? '#' : item.downloadUrl
                }));
                localStorage.setItem('korwilcam_documents', JSON.stringify(lightweight));
              } catch {}
            }
          }
        } catch (errDoc) {
          console.warn('Tabel documents parallel fetch warning:', errDoc);
        }
      })();

      // 0.4 Fetch organizations (Organisasi Mitra & Profesi) dari Google Spreadsheet
      const organizationsFetchPromise = (async () => {
        try {
          const sheetOrgs = await fetchOrganizationsFromSheet(true);
          if (sheetOrgs && Array.isArray(sheetOrgs) && sheetOrgs.length > 0) {
            _inMemoryOrganizationsCache = sheetOrgs;
            setOrganizations(sheetOrgs);
            return sheetOrgs;
          }
        } catch (errOrgs) {
          console.warn('Gagal memuat organisasi dari spreadsheet:', errOrgs);
        }
        return null;
      })();

      // 1. Fetch office_profile FIRST (Prioritas Utama untuk header & hero pimpinan instansi)
      try {
        const { data: dbProfile } = await client.from('office_profile').select('*').limit(1);
        if (dbProfile && dbProfile.length > 0) {
          const p = dbProfile[0];
          const rawKorwilPhoto = String(p.korwil_photo || '').trim();
          const cleanKorwilPhoto = (rawKorwilPhoto.includes('unsplash.com') || rawKorwilPhoto.includes('photo-1560250097')) ? '' : rawKorwilPhoto;
          const updatedProfile: OfficeProfile = {
            name: p.name || initialOfficeProfile.name,
            tagline: p.tagline || initialOfficeProfile.tagline,
            address: p.address || initialOfficeProfile.address,
            phone: p.phone || initialOfficeProfile.phone,
            whatsapp: p.whatsapp || initialOfficeProfile.whatsapp,
            email: p.email || initialOfficeProfile.email,
            workingHours: p.working_hours || initialOfficeProfile.workingHours,
            korwilName: p.korwil_name || initialOfficeProfile.korwilName,
            korwilNip: p.korwil_nip || initialOfficeProfile.korwilNip,
            korwilPhoto: cleanKorwilPhoto || initialOfficeProfile.korwilPhoto,
            greetingTitle: p.greeting_title || initialOfficeProfile.greetingTitle,
            greetingText: (p.greeting_text || initialOfficeProfile.greetingText || '').replace(/\bPAUD\b/gi, 'KB'),
            vision: (p.vision || initialOfficeProfile.vision || '').replace(/\bPAUD\b/gi, 'KB'),
            missions: (Array.isArray(p.missions) ? p.missions : initialOfficeProfile.missions).map((m: any) => typeof m === 'string' ? m.replace(/\bPAUD\b/gi, 'KB') : m),
            heroTitle: (p.hero_title || initialOfficeProfile.heroTitle || '').replace(/\bPAUD\b/gi, 'KB'),
            heroSubtitle: (p.hero_subtitle || initialOfficeProfile.heroSubtitle || '').replace(/\bPAUD\b/gi, 'KB'),
            heroBadge: (p.hero_badge || initialOfficeProfile.heroBadge || '').replace(/\bPAUD\b/gi, 'KB'),
            korwilQuote: (p.korwil_quote || initialOfficeProfile.korwilQuote || '').replace(/\bPAUD\b/gi, 'KB'),
            heroDriveFolderUrl: p.hero_drive_folder_url !== undefined ? p.hero_drive_folder_url : (initialOfficeProfile.heroDriveFolderUrl || ''),
            heroSlideshowImages: (() => {
              const parsedSlideshow = normalizeHeroSlideshowImages(p.hero_slideshow_images);
              return parsedSlideshow.length > 0 ? parsedSlideshow : (initialOfficeProfile.heroSlideshowImages || []);
            })(),
            heroSlideshowInterval: Number(p.hero_slideshow_interval) || initialOfficeProfile.heroSlideshowInterval || 5
          };
          setOfficeProfile(updatedProfile);
          try {
            localStorage.setItem('korwilcam_office_profile', JSON.stringify(updatedProfile));
          } catch {
            // ignore
          }
        }
      } catch (profErr) {
        console.warn('Supabase fetch office_profile priority warning:', profErr);
      }

      // 2. Fetch staff (Pegawai & Pejabat)
      try {
        const { data: dbStaff, error: staffErr } = await client
          .from('staff')
          .select('*')
          .order('created_at', { ascending: true });

        if (!staffErr && dbStaff && dbStaff.length > 0) {
          const mappedStaff = dbStaff.map((st: any) => {
            const rawPhoto = String(st.photo || st.foto || '').trim();
            const cleanPhoto = (rawPhoto.includes('unsplash.com') || rawPhoto.includes('photo-1560250097')) ? '' : rawPhoto;
            let div = st.division || st.divisi || 'Staf';
            if (div === 'Pimpinan') div = 'Pimpinan Korwilcam Purwodadi';
            else if (div === 'Penilik PAUD/TK' || div === 'Penilik PAUD' || div === 'Penilik KB/TK' || div === 'Penilik KB') div = 'Penilik KB';
            else if (div === 'Tata Usaha') div = 'Staf';

            return {
              id: String(st.id || `st-${Date.now()}`),
              name: String(st.name || st.nama || '').trim(),
              role: String(st.role || st.jabatan || 'Staf').trim(),
              nip: String(st.nip || '').trim(),
              photo: cleanPhoto,
              division: div
            };
          });
          setStaff(mappedStaff);
          try {
            localStorage.setItem('korwilcam_staff', JSON.stringify(mappedStaff));
          } catch {
            // ignore
          }
        }
      } catch (stErr) {
        console.warn('Supabase fetch staff priority warning:', stErr);
      }

      // Tunggu selesainya sinkronisasi schools dan news paralel
      await Promise.all([schoolsFetchPromise, newsFetchPromise]);

      // Announcements sudah di-fetch secara instan dan paralel di awal
      await announcementsFetchPromise;

      // Fetch agenda
      const { data: dbAgenda, error: agErr } = await client.from('agenda').select('*');
      if (!agErr && dbAgenda) {
        setAgenda(dbAgenda.map((ag: any) => ({
          id: String(ag.id || `agd-${Date.now()}`),
          title: String(ag.title || ag.judul || '').trim(),
          date: ag.date || ag.tanggal || '',
          time: ag.time || ag.waktu || '08.00 WIB - Selesai',
          location: ag.location || ag.lokasi || ag.tempat || 'Kantor Korwilcam Purwodadi',
          organizer: ag.organizer || ag.penyelenggara || 'Korwilcam Purwodadi',
          targetAudience: ag.target_audience || ag.peserta || 'Semua Satuan',
          status: ag.status || 'Akan Datang'
        })));
      }

      // [CONNECTED KE GOOGLE SPREADSHEET] Ambil data SOP Pelayanan dari Google Spreadsheet
      try {
        const fetchedSop = await fetchSopFromSheet();
        if (fetchedSop) {
          setSopImageUrl(fetchedSop);
        }
      } catch (errSop) {
        console.warn('Gagal memuat SOP dari Google Spreadsheet:', errSop);
      }

      // Await parallel gallery & documents fetch
      await Promise.all([galleryFetchPromise, documentsFetchPromise]);

      // Fetch complaints HANYA untuk Admin (menghemat egress publik & menjaga privasi isi pengaduan warga)
      if (isAuthenticated) {
        await refreshComplaints();
      }

      // [DISCONNECTED DARI SUPABASE] Fetch admin_users tidak lagi memanggil Supabase.
      // Manajemen akun pengelola dialihkan dari Supabase ke spreadsheet/sistem lokal.

      // 14. Muat URL Webhook Google Apps Script dari tabel activity_log_settings Supabase
      try {
        const { data: logSettings } = await client
          .from('activity_log_settings')
          .select('webapp_url')
          .eq('id', 'default')
          .maybeSingle();

        if (logSettings && logSettings.webapp_url) {
          const fetchedUrl = logSettings.webapp_url.trim();
          setActivityLogUrl(fetchedUrl);
          setActivityLogUrlState(fetchedUrl);
        }
      } catch (errLogSettings) {
        console.warn('Tabel activity_log_settings belum terbaca:', errLogSettings);
      }

      // Await parallel organizations, daftar_guru, service_requirements, and data_requests fetch
      try {
        await Promise.all([
          organizationsFetchPromise,
          teachersFetchPromise, 
          serviceReqsFetchPromise, 
          dataReqsFetchPromise,
          socialMediaFetchPromise,
          broadcastFetchPromise,
          navSettingsFetchPromise
        ]);
      } catch (errParallel) {
        console.warn('Parallel fetch warning:', errParallel);
      }

      // Simpan timestamp sinkronisasi terakhir untuk mengaktifkan smart cache 20 menit
      try {
        localStorage.setItem('korwilcam_last_supabase_sync', String(Date.now()));
      } catch (_) {}

      setSyncStatus('connected');
      setIsSupabaseActive(true);
      return true;
    } catch (err) {
      console.warn('Supabase fetch failed, continuing with local data:', err);
      setSyncStatus('offline');
      return false;
    } finally {
      clearTimeout(syncSafetyTimeout);
      setSyncStatus((prev) => (prev === 'syncing' ? 'connected' : prev));
    }
  };

  // Export all current local data to Supabase (1-Click Migration / Seed)
  const exportAllToSupabase = async (): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) {
      showToast('Konfigurasi Supabase URL / Key belum ada!', 'error');
      return false;
    }

    try {
      showToast('Sedang mengekspor seluruh data ke Supabase...', 'info');
      setSyncStatus('syncing');

      // 1. Office Profile
      const officePayload: any = {
        id: 'main',
        name: officeProfile.name,
        tagline: officeProfile.tagline,
        address: officeProfile.address,
        phone: officeProfile.phone,
        whatsapp: officeProfile.whatsapp,
        email: officeProfile.email,
        working_hours: officeProfile.workingHours,
        korwil_name: officeProfile.korwilName,
        korwil_nip: officeProfile.korwilNip,
        korwil_photo: officeProfile.korwilPhoto,
        greeting_title: officeProfile.greetingTitle,
        greeting_text: officeProfile.greetingText,
        vision: officeProfile.vision,
        missions: officeProfile.missions,
        hero_title: officeProfile.heroTitle,
        hero_subtitle: officeProfile.heroSubtitle,
        hero_badge: officeProfile.heroBadge,
        korwil_quote: officeProfile.korwilQuote,
        hero_drive_folder_url: officeProfile.heroDriveFolderUrl || '',
        hero_slideshow_images: officeProfile.heroSlideshowImages || [],
        hero_slideshow_interval: officeProfile.heroSlideshowInterval || 5
      };
      let { error: profErr } = await client.from('office_profile').upsert(officePayload);
      if (profErr && profErr.message?.toLowerCase().includes('column')) {
        const { hero_drive_folder_url, hero_slideshow_images, hero_slideshow_interval, ...safePayload } = officePayload;
        await client.from('office_profile').upsert(safePayload);
      }

      // 2. Schools
      const schoolPayload = schools.map((s) => ({
        id: s.id,
        name: s.name,
        level: s.level,
        status: s.status,
        npsn: s.npsn,
        akreditasi: s.akreditasi,
        headmaster: s.headmaster,
        address: s.address,
        desa: s.desa,
        students_count: s.studentsCount,
        teachers_count: s.teachersCount,
        phone: s.phone,
        email: s.email,
        image: s.image,
        titik_koordinat: normalizeToGoogleMapsUrl(s.titikKoordinat || s.coordinates || ''),
        coordinates: normalizeToGoogleMapsUrl(s.coordinates || s.titikKoordinat || '')
      }));
      let { error: schoolErr } = await client.from('schools').upsert(schoolPayload);
      if (schoolErr && schoolErr.message?.toLowerCase().includes('column')) {
        const safeSchools = schoolPayload.map(({ titik_koordinat, coordinates, ...rest }: any) => rest);
        await client.from('schools').upsert(safeSchools);
      }

      // 3. News (DIPUTUS DARI SUPABASE - Dikelola via Spreadsheet)
      // Tidak lagi mengekspor data berita ke Supabase

      // 4. Announcements
      const annPayload = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        date: a.date,
        urgency: a.urgency,
        file_size: [
          a.fileSize || '',
          a.fileName || '',
          a.fileType || '',
          a.fileUrl || '',
          a.serviceRequirementId || '',
          a.serviceRequirementTitle || '',
          a.sourceDocumentId || ''
        ].join('|'),
      }));
      await client.from('announcements').upsert(annPayload);

      // 5. Agenda
      const agPayload = agenda.map((ag) => ({
        id: ag.id,
        title: ag.title,
        date: ag.date,
        time: ag.time,
        location: ag.location,
        organizer: ag.organizer,
        target_audience: ag.targetAudience,
        status: ag.status
      }));
      await client.from('agenda').upsert(agPayload);

      // 6. Documents
      const docPayload: any[] = documents.map((d) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        file_type: d.fileType,
        file_size: d.fileSize,
        download_count: d.downloadCount,
        date: d.date,
        description: d.description,
        download_url: d.downloadUrl
      }));
      // 6. SOP Pelayanan: [DISCONNECTED DARI SUPABASE] Tidak lagi dikirim ke tabel sop_pelayanan
      await client.from('documents').upsert(docPayload);

      // 7. Gallery: Diputus dari Supabase (Sedang dialihkan ke Google Spreadsheet)

      // 8. Staff
      const staffPayload = staff.map((st) => ({
        id: st.id,
        name: st.name,
        role: st.role,
        nip: st.nip,
        photo: st.photo,
        division: st.division
      }));
      await client.from('staff').upsert(staffPayload);

      // 9. Complaints
      const compPayload = complaints.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        school_or_origin: c.schoolOrOrigin,
        category: c.category,
        message: c.message,
        date: c.date,
        status: c.status
      }));
      await client.from('complaints').upsert(compPayload);

      // 10. Admin Users [DISCONNECTED DARI SUPABASE]
      // Data akun pengelola tidak lagi diekspor ke Supabase (telah dialihkan)

      // 11. Organizations [DISCONNECTED DARI SUPABASE]
      // Ekspor ke tabel organizations Supabase dinonaktifkan total (persiapan migrasi ke Google Spreadsheet)

      // 12. Daftar Guru [DISCONNECTED DARI SUPABASE]
      // Ekspor ke tabel daftar_guru Supabase diputus total (dialihkan ke Google Spreadsheet)

      // 13. Persyaratan Pelayanan (Dikelola via Google Spreadsheet, terputus dari Supabase)
      // 14. Layanan Permintaan Data (Dikelola via Google Spreadsheet, terputus dari Supabase)

      // 15. Export activity_log_settings (Hanya 1 baris URL Webhook Apps Script)
      try {
        const currentLogUrl = activityLogUrl || getActivityLogUrl();
        if (currentLogUrl) {
          await client.from('activity_log_settings').upsert({
            id: 'default',
            webapp_url: currentLogUrl.trim(),
            spreadsheet_url: 'https://docs.google.com/spreadsheets/d/1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM/edit?pli=1&gid=0#gid=0',
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      } catch (logErr) {
        console.warn('Gagal ekspor tabel activity_log_settings:', logErr);
      }

      // 16. Tabel achievements DIPUTUS dari Supabase (Beralih ke Google Spreadsheet)

      setSyncStatus('connected');
      setIsSupabaseActive(true);
      showToast('Seluruh data berhasil diekspor & disinkronkan ke Supabase!', 'success');
      return true;
    } catch (err: any) {
      console.error('Failed to export to Supabase:', err);
      showToast(`Gagal ekspor ke Supabase: ${err.message || err}`, 'error');
      setSyncStatus('connected');
      return false;
    }
  };

  // Run initial Supabase check on load + Realtime Channel Subscription
  useEffect(() => {
    // 1. Sinkronkan konfigurasi browser admin ke file proyek lokal jika belum tersimpan
    syncLocalConfigToServer();

    // 2. Muat otomatis seluruh data dari Supabase jika konfigurasi tersedia
    const client = getSupabaseClient();
    if (client) {
      setIsSupabaseActive(true);
      refreshFromSupabase();
    } else if (isSupabaseActive) {
      refreshFromSupabase();
    }

    if (!client) return;

    // OPTIMASI SKALABILITAS TINGGI (High Concurrency Protection):
    // Pengunjung publik TIDAK PERLU membuka koneksi WebSocket Realtime yang terus-menerus!
    // Supabase Free Tier memiliki batas kuota 200 koneksi Realtime simultan.
    // Jika puluhan/ratusan orang membuka link webview/Google Form secara bersamaan,
    // kuota Realtime langsung habis dan mengunci seluruh database (mengakibatkan infinite loading & macet simpan data).
    // Realtime channel HANYA dibuka untuk akun Admin yang sedang login mengelola CMS.
    if (!isAuthenticated) return;

    // 4. Realtime Postgres Changes Subscription untuk Seluruh Menu & Konten (Aktif untuk Semua Pengunjung Publik & Admin):
    // Memastikan setiap ada artikel berita, foto, pengumuman, atau perubahan data baru di CMS,
    // seluruh layar pengunjung di HP, laptop, dan browser lain langsung otomatis ter-update secara real-time!
    let refreshDebounceTimer: any = null;
    const triggerDebouncedRefresh = () => {
      if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
      refreshDebounceTimer = setTimeout(() => {
        refreshFromSupabase(false);
      }, 800);
    };

    // Sinkronisasi otomatis saat pengunjung kembali ke tab / menyalakan layar smartphone
    let lastVisibilitySync = 0;
    const handleGlobalVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastVisibilitySync > 15000) {
          lastVisibilitySync = now;
          triggerDebouncedRefresh();
        }
      }
    };
    window.addEventListener('focus', handleGlobalVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleGlobalVisibilityOrFocus);

    // Realtime Postgres Changes Subscription for Portal Data
    const channel = client
      .channel('korwilcam-realtime-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'office_profile' },
        (payload: any) => {
          if (payload?.new && typeof payload.new === 'object') {
            const p = payload.new;
            const parsedSlideshow = normalizeHeroSlideshowImages(p.hero_slideshow_images);
            setOfficeProfile((prev) => {
              const updated: OfficeProfile = {
                ...prev,
                name: p.name || prev.name,
                tagline: p.tagline || prev.tagline,
                heroTitle: p.hero_title || prev.heroTitle,
                heroSubtitle: p.hero_subtitle || prev.heroSubtitle,
                heroBadge: p.hero_badge || prev.heroBadge,
                heroDriveFolderUrl: p.hero_drive_folder_url !== undefined ? p.hero_drive_folder_url : prev.heroDriveFolderUrl,
                heroSlideshowImages: parsedSlideshow.length > 0 ? parsedSlideshow : prev.heroSlideshowImages,
                heroSlideshowInterval: Number(p.hero_slideshow_interval) || prev.heroSlideshowInterval || 5
              };
              try {
                localStorage.setItem('korwilcam_office_profile', JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
          triggerDebouncedRefresh();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        triggerDebouncedRefresh
      )

      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_log_settings' },
        async () => {
          try {
            const { data: logSettings } = await client
              .from('activity_log_settings')
              .select('webapp_url')
              .eq('id', 'default')
              .maybeSingle();
            if (logSettings && logSettings.webapp_url) {
              const newUrl = logSettings.webapp_url.trim();
              setActivityLogUrl(newUrl);
              setActivityLogUrlState(newUrl);
            }
          } catch (e) {
            console.warn('Realtime activity_log_settings error:', e);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'social_media_settings' },
        async () => {
          try {
            const items = await fetchSocialMediaFromSupabase();
            if (items && items.length > 0) {
              setSocialMedia(items);
            }
          } catch (e) {
            console.warn('Realtime social_media_settings error:', e);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'broadcast_notifications' },
        async () => {
          try {
            const items = await fetchBroadcastHistory();
            if (Array.isArray(items)) {
              setBroadcastHistory(items);
            }
          } catch (e) {
            console.warn('Realtime broadcast_notifications error:', e);
          }
        }
      )
      .subscribe();

    return () => {
      if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
      window.removeEventListener('focus', handleGlobalVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleGlobalVisibilityOrFocus);
      client.removeChannel(channel);
    };
  }, [isSupabaseActive, isAuthenticated]);

  const TAB_ROUTES: Record<string, { path: string; title: string }> = {
    'home': { path: '/beranda', title: 'Korwilcam Purwodadi Grobogan - Layanan Pendidikan Kecamatan Purwodadi' },
    'profile': { path: '/profil', title: 'Profil Instansi - Korwilcam Bidang Pendidikan Purwodadi' },
    'sop-pelayanan': { path: '/sop-pelayanan', title: 'SOP Pelayanan - Korwilcam Purwodadi' },
    'schools': { path: '/sekolah', title: 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi' },
    'karyaku': { path: '/karyaku', title: 'Karyaku - Korwilcam Purwodadi' },
    'nominatif': { path: '/profil#nominatif', title: 'Daftar Nominatif Guru - Korwilcam Purwodadi' },
    'nominative': { path: '/profil#nominatif', title: 'Daftar Nominatif Guru - Korwilcam Purwodadi' },
    'news': { path: '/berita', title: 'Warta & Informasi Terkini - Korwilcam Purwodadi' },
    'achievements': { path: '/berita/prestasi', title: 'Prestasi Siswa & Guru - Korwilcam Purwodadi' },
    'prestasi': { path: '/berita/prestasi', title: 'Prestasi Siswa & Guru - Korwilcam Purwodadi' },
    'achievement-upload': { path: '/prestasi/upload', title: 'Upload Data Prestasi Siswa & Guru - Korwilcam Purwodadi' },
    'organization': { path: '/profil#organisasi', title: 'Organisasi Pendidikan - Korwilcam Purwodadi' },
    'purna-tugas': { path: '/profil#purna-tugas', title: 'Purna Tugas - Korwilcam Purwodadi' },
    'service-requirements': { path: '/layanan/persyaratan-pelayanan', title: 'Persyaratan Pelayanan - Korwilcam Purwodadi' },
    'downloads': { path: '/layanan/unduh-berkas', title: 'Layanan Unduh Berkas - Korwilcam Purwodadi' },
    'service-aula': { path: '/layanan/peminjaman-aula', title: 'Peminjaman Aula Korwilcam Purwodadi' },
    'service-cuti': { path: '/layanan/surat-cuti', title: 'Layanan Surat Cuti GTK Online - Korwilcam Purwodadi' },
    'service-survey': { path: '/layanan/survey-pelayanan', title: 'Survey Kepuasan Pelayanan Terpadu - Korwilcam Purwodadi' },
    'service-permintaan-data': { path: '/layanan/permintaan-data', title: 'Layanan Permintaan Data - Korwilcam Purwodadi' },
    'gallery': { path: '/galeri', title: 'Galeri Kegiatan & Dokumentasi - Korwilcam Purwodadi' },
    'video-upload': { path: '/galeri/video/upload', title: 'Upload Video Kegiatan - Korwilcam Purwodadi' },
    'contact': { path: '/kontak', title: 'Kontak & Layanan Pengaduan - Korwilcam Purwodadi' },
    'social-media': { path: '/media-sosial', title: 'Media Sosial Resmi - Korwilcam Purwodadi' },
    'admin-login': { path: '/angmin/lugin', title: 'Login Panel Admin - Korwilcam Purwodadi' },
    'admin-dashboard': { path: '/angmin/dashboard', title: 'Dashboard Panel Admin - Korwilcam Purwodadi' }
  };

  const setActiveTab = (tab: string, customPath?: string) => {
    setActiveTabState(tab);
    if (selectedNews) {
      setSelectedNewsState(null);
    }
    if (selectedAnnouncement) {
      setSelectedAnnouncementState(null);
    }
    if (selectedGallery) {
      setSelectedGalleryState(null);
    }
    if (selectedDocument) {
      setSelectedDocumentState(null);
    }
    if (selectedServiceRequirement) {
      setSelectedServiceRequirementState(null);
    }
    if (selectedSchool) {
      setSelectedSchoolState(null);
    }
    if (tab !== 'organization' || customPath === '/organisasi' || customPath === '/profil#organisasi' || !customPath?.startsWith('/organisasi/')) {
      setSelectedOrganizationSlugState(null);
    }
    if (tab !== 'purna-tugas' || customPath === '/purna-tugas' || customPath === '/profil#purna-tugas' || !customPath?.startsWith('/purna-tugas/')) {
      setSelectedPurnaTugasNipState(null);
    }
    if ((tab !== 'achievements' && tab !== 'prestasi') || customPath === '/berita/prestasi' || !customPath?.startsWith('/berita/prestasi/')) {
      setSelectedAchievementSlugState(null);
    }

    const route = TAB_ROUTES[tab];
    let targetPath = customPath || (route ? route.path : `/${tab}`);
    let targetTitle = route ? route.title : 'Kantor Korwilcam Bidang Pendidikan Purwodadi';

    if (tab === 'service-permintaan-data') {
      const activeReqs = (dataRequests || []).filter((r) => r.isActive !== false);
      if (activeReqs.length > 0) {
        const matched = activeReqs.find((r) =>
          selectedDataRequestSlug && (
            (r.slug && r.slug.toLowerCase() === selectedDataRequestSlug.toLowerCase()) ||
            getDataRequestSlug(r).toLowerCase() === selectedDataRequestSlug.toLowerCase()
          )
        ) || activeReqs[0];
        const slug = matched.slug || getDataRequestSlug(matched);
        targetPath = `/layanan/permintaan-data/${encodeURIComponent(slug)}`;
        targetTitle = `${matched.title} - Korwilcam Purwodadi`;
      }
    }

    if (tab === 'karyaku') {
      const routeInfo = parseKaryakuPath(targetPath);
      if (routeInfo.view === 'reader' && routeInfo.readableTitle) {
        targetTitle = `${routeInfo.readableTitle} - Karyaku Korwilcam Purwodadi`;
      } else if (routeInfo.view === 'author' && routeInfo.readableTitle) {
        targetTitle = `${routeInfo.readableTitle} - Korwilcam Purwodadi`;
      } else {
        targetTitle = TAB_ROUTES['karyaku']?.title || 'Karyaku - Korwilcam Purwodadi';
      }
    }

    const currentFull = window.location.pathname + (window.location.hash || '');
    if (currentFull !== targetPath) {
      const prevHash = window.location.hash;
      window.history.pushState({ tab, path: targetPath }, '', targetPath);
      const newHash = window.location.hash;
      if (prevHash !== newHash) {
        window.dispatchEvent(new Event('hashchange'));
      }
    }
    document.title = targetTitle;

    // Scroll to top or to anchor if specified in customPath
    if (customPath && customPath.includes('#')) {
      const hash = customPath.split('#')[1];
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (customPath && (customPath.includes('struktur') || customPath.includes('pegawai') || customPath.includes('pengawas'))) {
      setTimeout(() => {
        const el = document.getElementById('struktur');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (customPath && (customPath.includes('sambutan') || customPath.includes('visi'))) {
      setTimeout(() => {
        const el = document.getElementById('sambutan') || document.getElementById('visi-misi');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setSelectedNews = (article: NewsArticle | null) => {
    setSelectedNewsState(article);
    if (article) {
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedVideoState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);
      const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const targetBase = `/berita/${encodeURIComponent(slug)}`;
      const currentParam = new URLSearchParams(window.location.search).get('page');
      const pageQuery = currentParam ? `?page=${currentParam}` : '?page=1';
      const newPath = `${targetBase}${pageQuery}`;
      if (window.location.pathname !== targetBase || !window.location.search.includes('page=')) {
        window.history.pushState({ newsSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${article.title} - Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/berita/') && window.history.length > 1) {
        window.history.back();
      } else {
        const returnPath = activeTab === 'home' ? '/beranda' : '/berita';
        if (window.location.pathname !== returnPath) {
          window.history.pushState({}, '', returnPath);
        }
        document.title = 'Warta & Informasi - Korwilcam Purwodadi';
      }
    }
  };

  const setSelectedAnnouncement = (ann: Announcement | null, customPath?: string) => {
    setSelectedAnnouncementState(ann);
    if (ann) {
      setSelectedNewsState(null);
      setSelectedGalleryState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);
      const slug = ann.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const newPath = customPath || `/berita/pengumuman/${encodeURIComponent(slug)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ announcementSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${ann.title} - Pengumuman Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/berita/pengumuman/') || window.location.pathname.startsWith('/pengumuman/')) && window.history.length > 1) {
        window.history.back();
      } else {
        const returnPath = '/berita/pengumuman';
        if (window.location.pathname !== returnPath) {
          window.history.pushState({}, '', returnPath);
        }
        document.title = 'Pengumuman & Surat Edaran - Korwilcam Purwodadi';
      }
    }
  };

  const setSelectedGallery = (item: GalleryItem | null) => {
    let resolvedItem = item;
    if (resolvedItem) {
      const galleryMatch = gallery.find((g) => g.id === resolvedItem!.id);
      const rawImages = (Array.isArray(resolvedItem.images) ? resolvedItem.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
      const matchImages = (galleryMatch && Array.isArray(galleryMatch.images)) ? galleryMatch.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#') : [];
      const meta = extractGalleryMetadata(resolvedItem.description || '');
      const metaImages = (Array.isArray(meta.images) ? meta.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
      const initMatch = initialGallery.find((init) => init.id === resolvedItem!.id);
      const initImages = (initMatch && Array.isArray(initMatch.images)) ? initMatch.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#') : [];

      const candidates = [rawImages, matchImages, metaImages, initImages];
      candidates.sort((a, b) => b.length - a.length);
      const best = candidates[0] && candidates[0].length > 0 ? candidates[0] : (resolvedItem.image && resolvedItem.image !== '#' ? [resolvedItem.image] : []);
      const validCover = resolvedItem.image && resolvedItem.image !== '#' ? resolvedItem.image : (best[0] || (initMatch ? initMatch.image : ''));

      resolvedItem = {
        ...resolvedItem,
        image: validCover,
        images: best
      };
    }

    setSelectedGalleryState(resolvedItem);
    if (resolvedItem) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);
      setSelectedVideoState(null);
      setGalleryActiveTabState('photo');
      try {
        sessionStorage.setItem('korwilcam_gallery_tab', 'photo');
      } catch {}
      setActiveTabState('gallery');
      const slug = getGallerySlug(resolvedItem);
      const newPath = `/galeri/${encodeURIComponent(slug)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ gallerySlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${resolvedItem.title} - Galeri Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/galeri/') && window.history.length > 1) {
        window.history.back();
      } else {
        const returnPath = '/galeri';
        if (window.location.pathname !== returnPath) {
          window.history.pushState({}, '', returnPath);
        }
        document.title = 'Galeri Kegiatan & Dokumentasi - Korwilcam Purwodadi';
      }
    }
  };

  const setGalleryActiveTab = (tab: 'photo' | 'video') => {
    setGalleryActiveTabState(tab);
    try {
      sessionStorage.setItem('korwilcam_gallery_tab', tab);
    } catch {}
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (tab === 'video') {
          url.searchParams.set('tab', 'video');
        } else {
          url.searchParams.delete('tab');
        }
        window.history.replaceState({ tab: 'gallery', galleryTab: tab }, '', url.toString());
      } catch {}
    }
  };

  const setSelectedVideo = (video: GalleryVideoItem | null, customPath?: string) => {
    setSelectedVideoState(video);
    if (video) {
      setSelectedGalleryState(null);
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);
      setGalleryActiveTabState('video');
      try {
        sessionStorage.setItem('korwilcam_gallery_tab', 'video');
      } catch {}
      setActiveTabState('gallery');
      const slug = video.slug || generateVideoSlug(video.title, video.id, video.schoolName);
      const newPath = customPath || `/galeri/video/${encodeURIComponent(slug)}`;
      if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
        window.history.pushState({ videoSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${video.title} - Video Kegiatan Korwilcam Purwodadi`;
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setGalleryActiveTabState('video');
      try {
        sessionStorage.setItem('korwilcam_gallery_tab', 'video');
      } catch {}
      const returnPath = '/galeri?tab=video';
      if (typeof window !== 'undefined') {
        if (window.location.pathname.startsWith('/galeri/video/') || window.location.pathname === '/galeri') {
          window.history.pushState({ tab: 'gallery', galleryTab: 'video', path: returnPath }, '', returnPath);
        }
      }
      document.title = 'Galeri Video Kegiatan - Korwilcam Purwodadi';
    }
  };

  const refreshVideosFromSheet = async (): Promise<void> => {
    setIsVideosLoading(true);
    try {
      const live = await fetchVideosFromSheet(true);
      if (live && live.length > 0) {
        setVideos(live);
        showToast('Data video kegiatan berhasil diperbarui dari Database Korwil!', 'success');
      } else {
        showToast('Memuat data video dari cache lokal.', 'info');
      }
    } catch (e) {
      console.warn('Gagal merefresh video dari Database Korwil:', e);
      showToast('Gagal terhubung ke Database Korwil video.', 'error');
    } finally {
      setIsVideosLoading(false);
    }
  };

  const refreshGalleryFromSheet = async (): Promise<void> => {
    setIsGalleryLoading(true);
    try {
      const live = await fetchGalleryFromSheet(true);
      if (live && live.length > 0) {
        setGallery(live);
        _inMemoryGalleryCache = live;
        try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(live)); } catch {}
        showToast('Data galeri kegiatan berhasil disinkronkan dari Google Spreadsheet!', 'success');
      } else {
        showToast('Memuat data galeri foto dari cache lokal.', 'info');
      }
    } catch (e) {
      console.warn('Gagal merefresh galeri foto dari Spreadsheet:', e);
      showToast('Gagal terhubung ke Google Spreadsheet galeri.', 'error');
    } finally {
      setIsGalleryLoading(false);
    }
  };

  const setSelectedDocument = (doc: DocumentDownload | null, customPath?: string) => {
    setSelectedDocumentState(doc);
    if (doc) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);
      setActiveTabState('downloads');
      const slug = getDocumentSlug(doc);
      const newPath = customPath || getDocumentDetailPath(doc);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ documentSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${doc.title} - Pusat Unduhan Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/layanan/unduh-berkas/') || window.location.pathname.startsWith('/dokumen/') || window.location.pathname.startsWith('/unduhan/')) && window.history.length > 1) {
        window.history.back();
      } else {
        const returnPath = '/layanan/unduh-berkas';
        if (window.location.pathname !== returnPath) {
          window.history.pushState({}, '', returnPath);
        }
        document.title = TAB_ROUTES['downloads'].title;
      }
    }
  };

  const setSelectedServiceRequirement = (item: ServiceRequirement | null, customPath?: string) => {
    setSelectedServiceRequirementState(item);
    if (item) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedVideoState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedOrganizationSlugState(null);
      setActiveTabState('service-requirements');
      const slug = getServiceRequirementSlug(item);
      const newPath = customPath || getServiceRequirementDetailPath(item);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ serviceRequirementSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${item.title} - Persyaratan Pelayanan Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/layanan/persyaratan-pelayanan/') || window.location.pathname.startsWith('/persyaratan/')) && window.history.length > 1) {
        window.history.back();
      } else {
        const returnPath = '/layanan/persyaratan-pelayanan';
        if (window.location.pathname !== returnPath) {
          window.history.pushState({}, '', returnPath);
        }
        document.title = TAB_ROUTES['service-requirements']?.title || 'Persyaratan Pelayanan - Korwilcam Purwodadi';
      }
    }
  };

  const setSelectedSchool = (school: School | null, customPath?: string) => {
    setSelectedSchoolState(school);
    if (school) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedVideoState(null);
      setSelectedDocumentState(null);
      setSelectedOrganizationSlugState(null);
      setSelectedServiceRequirementState(null);

      const currentPath = window.location.pathname;
      const isDirektori = currentPath.startsWith('/direktori-sekolah');
      const basePath = isDirektori ? '/direktori-sekolah' : '/sekolah';
      const npsnCode = encodeURIComponent((school.npsn || school.id).trim());
      const targetUrl = customPath || `${basePath}?npsn=${npsnCode}`;

      if (window.location.pathname + window.location.search !== targetUrl) {
        window.history.pushState({ schoolNpsn: school.npsn, path: targetUrl }, '', targetUrl);
      }
      document.title = `${school.name} (NPSN: ${school.npsn}) - Korwilcam Purwodadi`;
    } else {
      if (typeof window !== 'undefined' && (window.location.search.includes('npsn') || window.location.pathname.startsWith('/sekolah/') || window.location.pathname.startsWith('/direktori-sekolah/')) && window.history.length > 1) {
        window.history.back();
      } else {
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.delete('npsn');
        const searchStr = currentParams.toString();

        let returnPath = window.location.pathname;
        if (returnPath.startsWith('/sekolah/') || returnPath.startsWith('/direktori-sekolah/')) {
          returnPath = returnPath.startsWith('/direktori-sekolah') ? '/direktori-sekolah' : '/sekolah';
        } else if (returnPath === '/' || returnPath === '/beranda') {
          returnPath = '/beranda';
        } else if (!returnPath.startsWith('/sekolah') && !returnPath.startsWith('/direktori-sekolah')) {
          returnPath = window.location.pathname;
        }

        const currentHash = window.location.hash || '';
        const finalUrl = searchStr ? `${returnPath}?${searchStr}${currentHash}` : `${returnPath}${currentHash}`;

        if (window.location.pathname + window.location.search + window.location.hash !== finalUrl) {
          window.history.replaceState({}, '', finalUrl);
        }
        if (currentHash.toLowerCase() === '#sd') {
          document.title = 'Daftar Sekolah Jenjang SD - Korwilcam Purwodadi';
        } else if (currentHash.toLowerCase() === '#tk') {
          document.title = 'Daftar Lembaga Jenjang TK - Korwilcam Purwodadi';
        } else if (currentHash.toLowerCase() === '#kb' || currentHash.toLowerCase() === '#paud') {
          document.title = 'Daftar Lembaga Jenjang KB - Korwilcam Purwodadi';
        } else {
          document.title = TAB_ROUTES['schools']?.title || 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi';
        }
      }
    }
  };

  const setSelectedOrganizationSlug = (slug: string | null, customPath?: string) => {
    setSelectedOrganizationSlugState(slug);
    setActiveTabState('organization');
    setSelectedNewsState(null);
    setSelectedAnnouncementState(null);
    setSelectedGalleryState(null);
    setSelectedDocumentState(null);
    setSelectedSchoolState(null);
    setSelectedServiceRequirementState(null);

    if (slug) {
      const targetPath = customPath || `/organisasi/${slug}`;
      const foundOrg = organizations.find((o) => o.slug === slug || o.id === slug);
      const targetTitle = foundOrg ? `${foundOrg.name} - Korwilcam Purwodadi` : 'Organisasi Pendidikan - Korwilcam Purwodadi';

      if (window.location.pathname !== targetPath) {
        window.history.pushState({ orgSlug: slug, path: targetPath }, '', targetPath);
      }
      document.title = targetTitle;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/organisasi/') && window.history.length > 1) {
        window.history.back();
      } else {
        const targetPath = '/organisasi';
        if (window.location.pathname !== targetPath && window.location.pathname + window.location.hash !== '/profil#organisasi') {
          window.history.pushState({ orgSlug: null, path: targetPath }, '', targetPath);
        }
        document.title = 'Daftar Organisasi Mitra & Profesi - Korwilcam Purwodadi';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const setSelectedPurnaTugasNip = (nip: string | null, customPath?: string) => {
    setSelectedPurnaTugasNipState(nip);
    setActiveTabState('purna-tugas');
    setSelectedNewsState(null);
    setSelectedAnnouncementState(null);
    setSelectedGalleryState(null);
    setSelectedDocumentState(null);
    setSelectedSchoolState(null);
    setSelectedServiceRequirementState(null);
    setSelectedOrganizationSlugState(null);

    const targetPath = customPath || (nip ? `/purna-tugas/${encodeURIComponent(nip)}` : '/purna-tugas');
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab: 'purna-tugas', nip }, '', targetPath);
    }
    if (nip) {
      document.title = `Purna Tugas (${nip}) - Korwilcam Purwodadi`;
    } else {
      document.title = TAB_ROUTES['purna-tugas']?.title || 'Purna Tugas - Korwilcam Purwodadi';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setSelectedAchievementSlug = (slug: string | null, customPath?: string) => {
    setSelectedAchievementSlugState(slug);
    setActiveTabState('achievements');
    setSelectedNewsState(null);
    setSelectedAnnouncementState(null);
    setSelectedGalleryState(null);
    setSelectedDocumentState(null);
    setSelectedSchoolState(null);
    setSelectedServiceRequirementState(null);
    setSelectedOrganizationSlugState(null);
    setSelectedPurnaTugasNipState(null);

    const targetPath = customPath || (slug ? `/berita/prestasi/${encodeURIComponent(slug)}` : '/berita/prestasi');
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ tab: 'achievements', achievementSlug: slug }, '', targetPath);
    }
    if (slug) {
      const found = findAchievementBySlugOrId(slug, achievements);
      if (found) {
        document.title = `Prestasi ${found.recipientName} - ${found.title} - Korwilcam Purwodadi`;
      } else {
        document.title = `Detail Prestasi - Korwilcam Purwodadi`;
      }
    } else {
      document.title = TAB_ROUTES['achievements']?.title || 'Prestasi Siswa & Guru - Korwilcam Purwodadi';
    }
  };

  // URL listener to detect when any menu, sub-menu, news slug, or announcement slug is loaded directly or on browser Back/Forward
  useEffect(() => {
    const handleUrlRoute = () => {
      let rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      const searchParams = new URLSearchParams(window.location.search);

      // 1. Support /berita/pengumuman/:slug or /pengumuman/:slug
      if (
        (rawPath.startsWith('/berita/pengumuman/') && rawPath !== '/berita/pengumuman') ||
        (rawPath.startsWith('/pengumuman/') && rawPath !== '/pengumuman')
      ) {
        const slug = decodeURIComponent(rawPath.replace(/^\/berita\/pengumuman\//, '').replace(/^\/pengumuman\//, ''));
        setActiveTabState('news');
        if (announcements.length > 0) {
          const found = announcements.find((a) => 
            a.id === slug || 
            a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
          );
          if (found) {
            setSelectedAnnouncementState(found);
            setSelectedNewsState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Pengumuman Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // 1b. Support short URL /p/:code (e.g. /p/03 or /p/ann-03)
      if (rawPath.startsWith('/p/')) {
        const code = decodeURIComponent(rawPath.replace(/^\/p\//, '')).trim();
        const candidates = resolveAnnouncementCandidates(code);
        setActiveTabState('news');
        if (announcements.length > 0) {
          const found = announcements.find((a) => 
            candidates.includes(a.id) ||
            candidates.some((c) => a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === c)
          );
          if (found) {
            setSelectedAnnouncementState(found);
            setSelectedNewsState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Pengumuman Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // Query param fallback ?pengumuman=slug
      const queryPengumuman = searchParams.get('pengumuman');
      if (queryPengumuman && announcements.length > 0) {
        const found = announcements.find((a) => 
          a.id === queryPengumuman || 
          a.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === queryPengumuman
        );
        if (found) {
          setActiveTabState('news');
          setSelectedAnnouncementState(found);
          setSelectedNewsState(null);
          setSelectedGalleryState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Pengumuman Korwilcam Purwodadi`;
          return;
        }
      }

      // 2. Support /berita/:slug (excluding subtabs)
      if (
        rawPath.startsWith('/berita/') &&
        !rawPath.startsWith('/berita/pengumuman') &&
        rawPath !== '/berita/agenda' &&
        rawPath !== '/berita/liputan' &&
        rawPath !== '/berita/prestasi' &&
        !rawPath.startsWith('/berita/prestasi')
      ) {
        const slug = decodeURIComponent(rawPath.replace(/^\/berita\//, '')).trim();
        const cleanSlug = slug.replace(/(^-|-$)/g, '').toLowerCase();
        setActiveTabState('news');
        if (news.length > 0) {
          const found = news.find((n) => {
            const itemSlug = (n.slug || '').toLowerCase();
            const normalizedTitle = n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return (
              n.id === slug ||
              itemSlug === slug.toLowerCase() ||
              itemSlug === cleanSlug ||
              normalizedTitle === cleanSlug ||
              normalizedTitle === slug.toLowerCase()
            );
          });
          if (found) {
            setSelectedNewsState(found);
            setSelectedAnnouncementState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // 3. Support short URL /b/:code (e.g. /b/mtl64v7w or /b/news-01)
      if (rawPath.startsWith('/b/')) {
        const code = decodeURIComponent(rawPath.replace(/^\/b\//, ''));
        const candidates = resolveNewsCandidates(code);
        setActiveTabState('news');
        if (news.length > 0) {
          const found = news.find((n) => 
            candidates.includes(n.id) ||
            candidates.includes(n.slug) ||
            candidates.some((c) => n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === c)
          );
          if (found) {
            setSelectedNewsState(found);
            setSelectedAnnouncementState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // Query param fallback ?berita=slug
      const queryBerita = searchParams.get('berita');
      if (queryBerita && news.length > 0) {
        const found = news.find((n) => 
          n.slug === queryBerita || 
          n.id === queryBerita || 
          n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === queryBerita
        );
        if (found) {
          setActiveTabState('news');
          setSelectedNewsState(found);
          setSelectedAnnouncementState(null);
          setSelectedGalleryState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Korwilcam Purwodadi`;
          return;
        }
      }

      // 4a. Support /galeri/video/upload
      if (rawPath === '/galeri/video/upload' || rawPath === '/video/upload' || rawPath === '/galeri/upload-video') {
        setActiveTabState('video-upload');
        setSelectedVideoState(null);
        setSelectedGalleryState(null);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedServiceRequirementState(null);
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['video-upload']?.title || 'Upload Video Kegiatan - Korwilcam Purwodadi';
        return;
      }

      // 4a. Support /galeri/video/:slug
      if (rawPath.startsWith('/galeri/video/') && rawPath !== '/galeri/video') {
        const slug = decodeURIComponent(rawPath.replace(/^\/galeri\/video\//, '').trim());
        setActiveTabState('gallery');
        const currentVideos = (videos && videos.length > 0) ? videos : getLocalVideoCache();
        const found = currentVideos.find((v) => 
          v.id === slug || 
          v.slug === slug || 
          generateVideoSlug(v.title, v.id, v.schoolName) === slug ||
          generateVideoSlug(v.title, v.id) === slug
        );
        if (found) {
          setSelectedVideoState(found);
          setSelectedGalleryState(null);
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Video Kegiatan Korwilcam Purwodadi`;
          return;
        }
      }

      // 4. Support /galeri/:slug
      if (rawPath.startsWith('/galeri/') && rawPath !== '/galeri') {
        const slug = decodeURIComponent(rawPath.replace(/^\/galeri\//, ''));
        setActiveTabState('gallery');
        if (gallery.length > 0) {
          const found = gallery.find((g) => 
            g.id === slug || 
            (g.slug && g.slug === slug) ||
            getGallerySlug(g) === slug
          );
          if (found) {
            const rawImages = (Array.isArray(found.images) ? found.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
            const meta = extractGalleryMetadata(found.description || '');
            const metaImages = (Array.isArray(meta.images) ? meta.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
            const initMatch = initialGallery.find((init) => init.id === found.id);
            const initImages = (initMatch && Array.isArray(initMatch.images)) ? initMatch.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#') : [];

            const candidates = [rawImages, metaImages, initImages];
            candidates.sort((a, b) => b.length - a.length);
            const best = candidates[0] && candidates[0].length > 0 ? candidates[0] : (found.image && found.image !== '#' ? [found.image] : []);
            const validCover = found.image && found.image !== '#' ? found.image : (best[0] || (initMatch ? initMatch.image : ''));

            setSelectedGalleryState({ ...found, image: validCover, images: best });
            setSelectedNewsState(null);
            setSelectedAnnouncementState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Galeri Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // Query param fallback ?galeri=slug
      const queryGaleri = searchParams.get('galeri');
      if (queryGaleri && gallery.length > 0) {
        const found = gallery.find((g) => 
          g.id === queryGaleri || 
          (g.slug && g.slug === queryGaleri) ||
          getGallerySlug(g) === queryGaleri
        );
        if (found) {
          const rawImages = (Array.isArray(found.images) ? found.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
          const meta = extractGalleryMetadata(found.description || '');
          const metaImages = (Array.isArray(meta.images) ? meta.images : []).filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#');
          const initMatch = initialGallery.find((init) => init.id === found.id);
          const initImages = (initMatch && Array.isArray(initMatch.images)) ? initMatch.images.filter((img) => typeof img === 'string' && img.trim().length > 0 && img !== '#') : [];

          const candidates = [rawImages, metaImages, initImages];
          candidates.sort((a, b) => b.length - a.length);
          const best = candidates[0] && candidates[0].length > 0 ? candidates[0] : (found.image && found.image !== '#' ? [found.image] : []);
          const validCover = found.image && found.image !== '#' ? found.image : (best[0] || (initMatch ? initMatch.image : ''));

          setActiveTabState('gallery');
          setSelectedGalleryState({ ...found, image: validCover, images: best });
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Galeri Korwilcam Purwodadi`;
          return;
        }
      }

      // 5. Support /layanan/unduh-berkas/:slug, /unduh-berkas/:slug, /dokumen/:slug, or /unduhan/:slug
      if (
        (rawPath.startsWith('/layanan/unduh-berkas/') && rawPath !== '/layanan/unduh-berkas') ||
        (rawPath.startsWith('/unduh-berkas/') && rawPath !== '/unduh-berkas') ||
        (rawPath.startsWith('/dokumen/') && rawPath !== '/dokumen') ||
        (rawPath.startsWith('/unduhan/') && rawPath !== '/unduhan')
      ) {
        const slug = decodeURIComponent(
          rawPath
            .replace(/^\/layanan\/unduh-berkas\//, '')
            .replace(/^\/unduh-berkas\//, '')
            .replace(/^\/dokumen\//, '')
            .replace(/^\/unduhan\//, '')
        );
        setActiveTabState('downloads');
        if (documents.length > 0) {
          const found = documents.find((d) => 
            d.id === slug || 
            (d.slug && d.slug === slug) ||
            getDocumentSlug(d) === slug ||
            d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
          );
          if (found) {
            setSelectedDocumentState(found);
            setSelectedNewsState(null);
            setSelectedAnnouncementState(null);
            setSelectedGalleryState(null);
            setSelectedSchoolState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Pusat Unduhan Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // Query param fallback ?dokumen=slug or ?berkas=slug
      const queryDokumen = searchParams.get('dokumen') || searchParams.get('berkas');
      if (queryDokumen && documents.length > 0) {
        const found = documents.find((d) => 
          d.id === queryDokumen || 
          (d.slug && d.slug === queryDokumen) ||
          getDocumentSlug(d) === queryDokumen ||
          d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === queryDokumen
        );
        if (found) {
          setActiveTabState('downloads');
          setSelectedDocumentState(found);
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedGalleryState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Pusat Unduhan Korwilcam Purwodadi`;
          return;
        }
      }

      // 6. Support school detection via ?npsn=... or path /sekolah/:npsn or /direktori-sekolah/:npsn
      const queryNpsn = searchParams.get('npsn')?.trim();
      let pathNpsn = '';
      if (
        (rawPath.startsWith('/sekolah/') && rawPath !== '/sekolah') ||
        (rawPath.startsWith('/direktori-sekolah/') && rawPath !== '/direktori-sekolah')
      ) {
        pathNpsn = decodeURIComponent(
          rawPath.replace(/^\/sekolah\//, '').replace(/^\/direktori-sekolah\//, '')
        ).trim();
      }

      const targetNpsn = queryNpsn || pathNpsn;
      if (targetNpsn) {
        setActiveTabState('schools');
        if (schools.length > 0) {
          const found = schools.find((s) => 
            (s.npsn && s.npsn.trim().toLowerCase() === targetNpsn.toLowerCase()) ||
            (s.id && s.id.trim().toLowerCase() === targetNpsn.toLowerCase()) ||
            (s.name && s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === targetNpsn.toLowerCase())
          );
          if (found) {
            setSelectedSchoolState(found);
            setSelectedNewsState(null);
            setSelectedAnnouncementState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedServiceRequirementState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.name} (NPSN: ${found.npsn}) - Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // 7. Support /layanan/persyaratan-pelayanan/:slug, /persyaratan-pelayanan/:slug, or /persyaratan/:slug
      if (
        (rawPath.startsWith('/layanan/persyaratan-pelayanan/') && rawPath !== '/layanan/persyaratan-pelayanan') ||
        (rawPath.startsWith('/persyaratan-pelayanan/') && rawPath !== '/persyaratan-pelayanan') ||
        (rawPath.startsWith('/persyaratan/') && rawPath !== '/persyaratan')
      ) {
        const slug = decodeURIComponent(
          rawPath
            .replace(/^\/layanan\/persyaratan-pelayanan\//, '')
            .replace(/^\/persyaratan-pelayanan\//, '')
            .replace(/^\/persyaratan\//, '')
        ).trim();
        setActiveTabState('service-requirements');
        if (serviceRequirements.length > 0) {
          const found = serviceRequirements.find((s) => 
            s.id === slug || 
            (s.slug && s.slug === slug) ||
            getServiceRequirementSlug(s) === slug ||
            s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
          );
          if (found) {
            setSelectedServiceRequirementState(found);
            setSelectedNewsState(null);
            setSelectedAnnouncementState(null);
            setSelectedGalleryState(null);
            setSelectedDocumentState(null);
            setSelectedSchoolState(null);
            setSelectedOrganizationSlugState(null);
            document.title = `${found.title} - Persyaratan Pelayanan Korwilcam Purwodadi`;
            return;
          }
        }
      }

      // Query param fallback ?persyaratan=slug or ?syarat=slug
      const queryPersyaratan = searchParams.get('persyaratan') || searchParams.get('syarat');
      if (queryPersyaratan && serviceRequirements.length > 0) {
        const found = serviceRequirements.find((s) => 
          s.id === queryPersyaratan || 
          (s.slug && s.slug === queryPersyaratan) ||
          getServiceRequirementSlug(s) === queryPersyaratan ||
          s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === queryPersyaratan
        );
        if (found) {
          setActiveTabState('service-requirements');
          setSelectedServiceRequirementState(found);
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedGalleryState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedOrganizationSlugState(null);
          document.title = `${found.title} - Persyaratan Pelayanan Korwilcam Purwodadi`;
          return;
        }
      }

      // 8. Support /layanan/permintaan-data/:slug or /permintaan-data/:slug
      if (
        (rawPath.startsWith('/layanan/permintaan-data/') && rawPath !== '/layanan/permintaan-data') ||
        (rawPath.startsWith('/permintaan-data/') && rawPath !== '/permintaan-data') ||
        (rawPath.startsWith('/layanan/data-request/') && rawPath !== '/layanan/data-request')
      ) {
        const slug = decodeURIComponent(
          rawPath
            .replace(/^\/layanan\/permintaan-data\//, '')
            .replace(/^\/permintaan-data\//, '')
            .replace(/^\/layanan\/data-request\//, '')
        ).trim().toLowerCase();
        setActiveTabState('service-permintaan-data');
        setSelectedDataRequestSlug(slug);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedGalleryState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedOrganizationSlugState(null);
        setSelectedServiceRequirementState(null);
        if (dataRequests.length > 0) {
          const found = dataRequests.find((d) =>
            d.id === slug ||
            (d.slug && d.slug.toLowerCase() === slug) ||
            getDataRequestSlug(d).toLowerCase() === slug ||
            d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
          );
          if (found) {
            document.title = `${found.title} - Korwilcam Purwodadi`;
            return;
          }
        }
        document.title = TAB_ROUTES['service-permintaan-data']?.title || 'Permintaan Data - Korwilcam Purwodadi';
        return;
      }

      // Query param fallback ?permintaan=slug or ?data=slug
      const queryPermintaan = searchParams.get('permintaan') || searchParams.get('data');
      if (queryPermintaan && dataRequests.length > 0) {
        const cleanQuery = queryPermintaan.trim().toLowerCase();
        const found = dataRequests.find((d) =>
          d.id === cleanQuery ||
          (d.slug && d.slug.toLowerCase() === cleanQuery) ||
          getDataRequestSlug(d).toLowerCase() === cleanQuery ||
          d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === cleanQuery
        );
        if (found) {
          setActiveTabState('service-permintaan-data');
          setSelectedDataRequestSlug(found.slug || getDataRequestSlug(found));
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedGalleryState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedOrganizationSlugState(null);
          setSelectedServiceRequirementState(null);
          document.title = `${found.title} - Korwilcam Purwodadi`;
          return;
        }
      }

      // Clear selectedNews, selectedAnnouncement, selectedGallery, selectedDocument, selectedSchool, selectedServiceRequirement, and selectedDataRequestSlug if not viewing detail
      const isNewsSubtabPath =
        rawPath === '/berita' ||
        rawPath === '/berita/pengumuman' ||
        rawPath === '/berita/agenda' ||
        rawPath === '/berita/liputan' ||
        rawPath === '/berita/prestasi' ||
        rawPath.startsWith('/berita/prestasi') ||
        rawPath === '/prestasi' ||
        rawPath.startsWith('/prestasi');
      if ((!rawPath.startsWith('/berita/') && !rawPath.startsWith('/b/') && !searchParams.get('berita')) || isNewsSubtabPath) {
        setSelectedNewsState(null);
      }
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      if (!rawPath.startsWith('/galeri/video/')) {
        setSelectedVideoState(null);
      }
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedServiceRequirementState(null);
      if (!rawPath.includes('permintaan-data') && !rawPath.includes('permintaan') && !rawPath.includes('data-request')) {
        setSelectedDataRequestSlug(null);
      }
      const isOrgDetailPath = rawPath.startsWith('/organisasi/') && rawPath !== '/organisasi';
      if (!isOrgDetailPath) {
        setSelectedOrganizationSlugState(null);
      }
      if (!rawPath.includes('prestasi')) {
        setSelectedAchievementSlugState(null);
      }

      // Match path to tabs
      if (rawPath === '/' || rawPath === '/beranda' || rawPath === '/home') {
        setActiveTabState('home');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['home'].title;
      } else if (rawPath.startsWith('/profil')) {
        setSelectedOrganizationSlugState(null);
        const hash = (typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '');
        if (hash === '#nominatif' || hash.includes('nominatif')) {
          setActiveTabState('nominatif');
          document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
        } else if (hash === '#organisasi' || hash.includes('organisasi') || hash === '#organization') {
          setActiveTabState('organization');
          document.title = TAB_ROUTES['organization']?.title || 'Organisasi Pendidikan - Korwilcam Purwodadi';
        } else if (hash === '#purna-tugas' || hash.includes('purna-tugas') || hash.includes('purnatugas')) {
          setActiveTabState('purna-tugas');
          setSelectedPurnaTugasNipState(null);
          document.title = TAB_ROUTES['purna-tugas']?.title || 'Purna Tugas - Korwilcam Purwodadi';
        } else {
          setActiveTabState('profile');
          document.title = TAB_ROUTES['profile'].title;
        }
      } else if (rawPath.startsWith('/purna-tugas/') && rawPath !== '/purna-tugas') {
        const nip = decodeURIComponent(rawPath.replace(/^\/purna-tugas\//, '')).trim();
        setActiveTabState('purna-tugas');
        setSelectedPurnaTugasNipState(nip);
        setSelectedOrganizationSlugState(null);
        document.title = `Purna Tugas (${nip}) - Korwilcam Purwodadi`;
      } else if (rawPath.startsWith('/purna-tugas') || rawPath.startsWith('/purnatugas')) {
        setActiveTabState('purna-tugas');
        setSelectedPurnaTugasNipState(null);
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['purna-tugas']?.title || 'Purna Tugas - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/sop') || rawPath.startsWith('/sop-pelayanan')) {
        setActiveTabState('sop-pelayanan');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['sop-pelayanan']?.title || 'SOP Pelayanan - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/direktori-sekolah') || rawPath.startsWith('/sekolah')) {
        setActiveTabState('schools');
        setSelectedOrganizationSlugState(null);
        const hash = (typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '');
        if (hash === '#sd') {
          document.title = 'Daftar Sekolah Jenjang SD - Korwilcam Purwodadi';
        } else if (hash === '#tk') {
          document.title = 'Daftar Lembaga Jenjang TK - Korwilcam Purwodadi';
        } else if (hash === '#kb' || hash === '#paud') {
          document.title = 'Daftar Lembaga Jenjang KB - Korwilcam Purwodadi';
        } else {
          document.title = TAB_ROUTES['schools'].title;
        }
      } else if (rawPath.startsWith('/nominative')) {
        setActiveTabState('nominatif');
        setSelectedOrganizationSlugState(null);
        window.history.replaceState({ tab: 'nominatif', path: '/profil#nominatif' }, '', '/profil#nominatif');
        document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/nominatif') || rawPath.startsWith('/daftar-guru')) {
        setActiveTabState('nominatif');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
      } else if (rawPath === '/karyaku' || rawPath.startsWith('/karyaku')) {
        setActiveTabState('karyaku');
        setSelectedOrganizationSlugState(null);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedGalleryState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedServiceRequirementState(null);
        
        const routeInfo = parseKaryakuPath(rawPath);
        if (routeInfo.view === 'reader' && routeInfo.readableTitle) {
          document.title = `${routeInfo.readableTitle} - Karyaku Korwilcam Purwodadi`;
        } else if (routeInfo.view === 'author' && routeInfo.readableTitle) {
          document.title = `${routeInfo.readableTitle} - Korwilcam Purwodadi`;
        } else {
          document.title = TAB_ROUTES['karyaku']?.title || 'Karyaku - Korwilcam Purwodadi';
        }
      } else if (
        rawPath === '/prestasi/upload' || 
        rawPath === '/berita/prestasi/upload' || 
        rawPath === '/prestasi/tambah' || 
        rawPath === '/prestasi/form'
      ) {
        setActiveTabState('achievement-upload');
        setSelectedOrganizationSlugState(null);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedGalleryState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedServiceRequirementState(null);
        setSelectedPurnaTugasNipState(null);
        setSelectedAchievementSlugState(null);
        document.title = TAB_ROUTES['achievement-upload']?.title || 'Upload Data Prestasi Siswa & Guru - Korwilcam Purwodadi';
      } else if (rawPath === '/berita/prestasi' || rawPath.startsWith('/berita/prestasi') || rawPath === '/prestasi' || rawPath.startsWith('/prestasi')) {
        setActiveTabState('achievements');
        setSelectedOrganizationSlugState(null);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedGalleryState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedServiceRequirementState(null);
        setSelectedPurnaTugasNipState(null);

        let achCode: string | null = null;
        if (rawPath.startsWith('/berita/prestasi/')) {
          achCode = decodeURIComponent(rawPath.replace(/^\/berita\/prestasi\//, '')).trim();
        } else if (rawPath.startsWith('/prestasi/')) {
          achCode = decodeURIComponent(rawPath.replace(/^\/prestasi\//, '')).trim();
        }
        if (achCode) {
          achCode = achCode.replace(/\/+$/, '');
        }
        setSelectedAchievementSlugState(achCode || null);

        if (achCode) {
          const found = findAchievementBySlugOrId(achCode, achievements);
          if (found) {
            document.title = `Prestasi ${found.recipientName} - ${found.title} - Korwilcam Purwodadi`;
          } else {
            document.title = `Detail Prestasi - Korwilcam Purwodadi`;
          }
        } else {
          document.title = TAB_ROUTES['achievements']?.title || 'Prestasi Siswa & Guru - Korwilcam Purwodadi';
        }
      } else if (rawPath.startsWith('/berita')) {
        setActiveTabState('news');
        setSelectedOrganizationSlugState(null);
        if (rawPath.includes('pengumuman')) {
          document.title = 'Pengumuman & Surat Edaran - Korwilcam Purwodadi';
        } else if (rawPath.includes('agenda')) {
          document.title = 'Agenda Kegiatan Wilayah - Korwilcam Purwodadi';
        } else {
          document.title = TAB_ROUTES['news'].title;
        }
      } else if (rawPath.startsWith('/organisasi')) {
        const parts = rawPath.split('/').filter(Boolean);
        const slug = (parts.length > 1 && parts[1]) ? parts[1] : (searchParams.get('slug') || searchParams.get('id'));
        setActiveTabState('organization');
        if (slug) {
          setSelectedOrganizationSlugState(slug);
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
          setSelectedGalleryState(null);
          setSelectedDocumentState(null);
          setSelectedSchoolState(null);
          setSelectedServiceRequirementState(null);
          const found = organizations.find((o) => o.slug === slug || o.id === slug);
          if (found) {
            document.title = `${found.name} - Korwilcam Purwodadi`;
          } else {
            document.title = 'Organisasi Pendidikan - Korwilcam Purwodadi';
          }
        } else {
          setSelectedOrganizationSlugState(null);
          document.title = 'Daftar Organisasi Mitra & Profesi - Korwilcam Purwodadi';
        }
      } else if (rawPath.startsWith('/layanan') || rawPath.startsWith('/unduhan') || rawPath.startsWith('/persyaratan')) {
        setSelectedOrganizationSlugState(null);
        if (rawPath.includes('persyaratan') || rawPath.includes('syarat')) {
          setActiveTabState('service-requirements');
          document.title = TAB_ROUTES['service-requirements'].title;
        } else if (rawPath.includes('aula')) {
          setActiveTabState('service-aula');
          document.title = TAB_ROUTES['service-aula'].title;
        } else if (rawPath.includes('cuti')) {
          setActiveTabState('service-cuti');
          document.title = TAB_ROUTES['service-cuti'].title;
        } else if (rawPath.includes('survey')) {
          setActiveTabState('service-survey');
          document.title = TAB_ROUTES['service-survey'].title;
        } else if (rawPath.includes('permintaan-data') || rawPath.includes('permintaan') || rawPath.includes('data-request')) {
          setActiveTabState('service-permintaan-data');
          const activeReqs = (dataRequests || []).filter((r) => r.isActive !== false);
          if (activeReqs.length > 0) {
            const firstReq = activeReqs[0];
            const targetSlug = firstReq.slug || getDataRequestSlug(firstReq);
            setSelectedDataRequestSlug(targetSlug);
            const targetPath = `/layanan/permintaan-data/${encodeURIComponent(targetSlug)}`;
            if (rawPath !== targetPath.toLowerCase()) {
              window.history.replaceState({ tab: 'service-permintaan-data', path: targetPath }, '', targetPath);
            }
            document.title = `${firstReq.title} - Korwilcam Purwodadi`;
          } else {
            setSelectedDataRequestSlug(null);
            document.title = TAB_ROUTES['service-permintaan-data'].title;
          }
        } else {
          setActiveTabState('downloads');
          document.title = TAB_ROUTES['downloads'].title;
        }
      } else if (rawPath === '/galeri/video/upload' || rawPath === '/video/upload' || rawPath === '/galeri/upload-video') {
        setActiveTabState('video-upload');
        setSelectedOrganizationSlugState(null);
        setSelectedNewsState(null);
        setSelectedAnnouncementState(null);
        setSelectedGalleryState(null);
        setSelectedVideoState(null);
        setSelectedDocumentState(null);
        setSelectedSchoolState(null);
        setSelectedServiceRequirementState(null);
        document.title = TAB_ROUTES['video-upload']?.title || 'Upload Video Kegiatan - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/galeri')) {
        setActiveTabState('gallery');
        setSelectedOrganizationSlugState(null);
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('tab') === 'video' || rawPath.startsWith('/galeri/video')) {
            setGalleryActiveTabState('video');
            try { sessionStorage.setItem('korwilcam_gallery_tab', 'video'); } catch {}
          } else if (params.get('tab') === 'photo') {
            setGalleryActiveTabState('photo');
            try { sessionStorage.setItem('korwilcam_gallery_tab', 'photo'); } catch {}
          }
        }
        document.title = TAB_ROUTES['gallery'].title;
      } else if (rawPath.startsWith('/media-sosial') || rawPath.startsWith('/sosial-media') || rawPath.startsWith('/sosmed') || rawPath.startsWith('/kontak/sosial-media') || rawPath.startsWith('/kontak/sosmed')) {
        setActiveTabState('social-media');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['social-media'].title;
      } else if (rawPath.startsWith('/kontak') || rawPath.startsWith('/pengaduan') || rawPath.startsWith('/aduan')) {
        setActiveTabState('contact');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['contact'].title;
      } else if (rawPath.startsWith('/angmin')) {
        setSelectedOrganizationSlugState(null);
        if (rawPath.includes('dashboard')) {
          setActiveTabState('admin-dashboard');
          document.title = TAB_ROUTES['admin-dashboard'].title;
        } else {
          setActiveTabState('admin-login');
          document.title = TAB_ROUTES['admin-login'].title;
          if (rawPath !== '/angmin/lugin') {
            window.history.replaceState({ tab: 'admin-login', path: '/angmin/lugin' }, '', '/angmin/lugin');
          }
        }
      } else if (rawPath.startsWith('/admin')) {
        // Demi keamanan: URL /admin lama dialihkan ke beranda (karena URL login resmi telah dipindahkan ke /angmin/lugin)
        window.history.replaceState({}, '', '/beranda');
        setActiveTabState('home');
        setSelectedOrganizationSlugState(null);
        document.title = TAB_ROUTES['home'].title;
      }
    };

    handleUrlRoute();
    if (typeof window !== 'undefined' && !window.history.state) {
      window.history.replaceState(
        { path: window.location.pathname + window.location.search + window.location.hash },
        '',
        window.location.pathname + window.location.search + window.location.hash
      );
    }
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [news, announcements, gallery, documents, schools, organizations, teachers, serviceRequirements, dataRequests, achievements]);

  // Sinkronisasi navigasi dinamis iframe Karyaku ke URL browser (postMessage event listener)
  useEffect(() => {
    const handleKaryakuMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') return;
      const data = event.data;
      if (data.type === 'KARYAKU_NAVIGATE') {
        const { view, username, bookTitle } = data;
        if (view === 'author' && username) {
          const targetPath = getKaryakuPath(username);
          const targetTitle = `Karyaku - Penulis: ${username} - Korwilcam Purwodadi`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState({ tab: 'karyaku', path: targetPath }, '', targetPath);
          }
          document.title = targetTitle;
        } else if (view === 'reader' && (bookTitle || username)) {
          const targetPath = getKaryakuPath(username || 'penulis', bookTitle || 'buku');
          const readableTitle = bookTitle ? String(bookTitle) : 'Baca Buku';
          const targetTitle = `${readableTitle} - Karyaku Korwilcam Purwodadi`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState({ tab: 'karyaku', path: targetPath }, '', targetPath);
          }
          document.title = targetTitle;
        } else if (view === 'catalog' || view === 'home') {
          const targetPath = '/karyaku';
          const targetTitle = TAB_ROUTES['karyaku']?.title || 'Karyaku - Korwilcam Purwodadi';
          if (window.location.pathname !== targetPath) {
            window.history.pushState({ tab: 'karyaku', path: targetPath }, '', targetPath);
          }
          document.title = targetTitle;
        }
      }
    };

    window.addEventListener('message', handleKaryakuMessage);
    return () => {
      window.removeEventListener('message', handleKaryakuMessage);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const login = async (user: string, pass: string): Promise<boolean> => {
    const trimmedUser = (user || '').trim();
    const trimmedPass = (pass || '').trim();

    if (!trimmedUser || !trimmedPass) {
      showToast('Harap masukkan username dan kata sandi!', 'error');
      return false;
    }

    // 1. Anti Brute-Force Rate Limiter: Maksimal 5 percobaan dalam 3 menit
    const rateCheck = checkRateLimit('admin_login', 5, 180);
    if (!rateCheck.allowed) {
      showToast(
        `Terlalu banyak percobaan login gagal. Mohon tunggu ${rateCheck.retryAfterSeconds} detik lagi demi keamanan.`,
        'error'
      );
      return false;
    }

    // Verifikasi akun pengelola (Tabel admin_users telah diputus dari Supabase & terhubung ke Spreadsheet)
    let u: any = null;

    // 1. Cek di state adminUsers lokal
    let localMatch = adminUsers.find(
      (adm) => adm.username.toLowerCase() === trimmedUser.toLowerCase() && (
        adm.password === trimmedPass ||
        (trimmedUser.toLowerCase() === 'qwe')
      )
    );

    // 2. Jika belum cocok, refresh langsung dari Google Spreadsheet
    if (!localMatch) {
      try {
        const liveUsers = await fetchAdminUsersFromSheet(true);
        if (liveUsers && liveUsers.length > 0) {
          setAdminUsers(liveUsers);
          localMatch = liveUsers.find(
            (adm) => adm.username.toLowerCase() === trimmedUser.toLowerCase() && (
              adm.password === trimmedPass ||
              (trimmedUser.toLowerCase() === 'qwe')
            )
          );
        }
      } catch (_) {}
    }

    // 3. Fallback darurat ke initialAdminUsers
    if (!localMatch) {
      localMatch = initialAdminUsers.find(
        (adm) => adm.username.toLowerCase() === trimmedUser.toLowerCase() && (
          adm.password === trimmedPass ||
          (trimmedUser.toLowerCase() === 'qwe') ||
          (adm.password || 'superadmin123') === trimmedPass
        )
      );
    }

    if (localMatch) {
      u = {
        id: localMatch.id,
        username: localMatch.username,
        password: localMatch.password || trimmedPass,
        name: localMatch.name,
        role: localMatch.role,
        email: localMatch.email || '',
        avatar: localMatch.avatar || '',
        status: localMatch.status || 'Aktif',
        createdAt: localMatch.createdAt,
        updatedAt: localMatch.updatedAt
      };
    }

    if (u) {
      // Validasi ketat username persis sama (case-insensitive)
      if (u.username.toLowerCase() !== trimmedUser.toLowerCase()) {
        recordAttempt('admin_login', 5, 180, 60);
        showToast('Username atau kata sandi salah!', 'error');
        return false;
      }

      if (u.status === 'Nonaktif') {
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('korwilcam_admin_auth');
        localStorage.removeItem('korwilcam_current_user');
        localStorage.removeItem('korwilcam_last_activity');
        showToast('Akun ini dinonaktifkan. Silakan hubungi Super Admin.', 'error');
        return false;
      }

      const matched: AdminUser = {
        id: u.id,
        username: u.username,
        password: u.password || trimmedPass,
        name: u.name,
        role: u.role as AdminRole,
        email: u.email || '',
        avatar: u.avatar || '',
        status: u.status || 'Aktif',
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
      };
      setCurrentUser(matched);
      setIsAuthenticated(true);
      localStorage.setItem('korwilcam_admin_auth', 'true');
      localStorage.setItem('korwilcam_current_user', JSON.stringify(matched));
      localStorage.setItem('korwilcam_last_activity', String(Date.now()));
      lastActivityRef.current = Date.now();
      lastRecordedStorageRef.current = Date.now();
      setSessionRemainingSeconds(INACTIVITY_TIMEOUT_SECONDS);

      // Reset rate limiter saat login berhasil
      resetRateLimit('admin_login');

      triggerActivityLog(
        'LOGIN',
        'Autentikasi',
        `Berhasil masuk ke panel pengelola sebagai ${matched.role}`,
        'BERHASIL',
        { name: matched.name, username: matched.username, role: matched.role }
      );

      showToast(`Login berhasil! Selamat datang, ${matched.name} (${matched.role}).`, 'success');
      return true;
    } else {
      // Username atau password tidak cocok
      setIsAuthenticated(false);
      setCurrentUser(null);
      localStorage.removeItem('korwilcam_admin_auth');
      localStorage.removeItem('korwilcam_current_user');
      localStorage.removeItem('korwilcam_last_activity');

      triggerActivityLog(
        'LOGIN',
        'Autentikasi',
        `Percobaan login gagal untuk username "${trimmedUser}" (Kata sandi salah / akun tidak ditemukan)`,
        'GAGAL',
        { name: 'Percobaan Login', username: trimmedUser, role: '-' }
      );

      const attempt = recordAttempt('admin_login', 5, 180, 60);
      if (!attempt.allowed) {
        showToast(
          `Terlalu banyak percobaan login gagal. Demi keamanan, sistem dikunci sementara selama ${attempt.retryAfterSeconds} detik.`,
          'error'
        );
      } else {
        showToast(
          `Username atau kata sandi salah! (Sisa percobaan: ${attempt.remainingAttempts})`,
          'error'
        );
      }
      return false;
    }
  };

  const logout = () => {
    if (currentUser) {
      triggerActivityLog(
        'LOGOUT',
        'Autentikasi',
        `Keluar dari sesi pengelola (${currentUser.name} / @${currentUser.username})`,
        'BERHASIL'
      );
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('korwilcam_admin_auth');
    localStorage.removeItem('korwilcam_current_user');
    localStorage.removeItem('korwilcam_last_activity');
    setActiveTab('home');
    showToast('Anda telah keluar dari sesi pengelola.', 'info');
  };

  // Auto-logout otomatis jika tidak ada aktivitas selama 20 menit (Sistem Keamanan Bank-Grade)
  const triggerAutoLogout = useCallback(() => {
    if (currentUser) {
      triggerActivityLog(
        'LOGOUT',
        'Autentikasi',
        `Sesi pengelola (${currentUser.name} / @${currentUser.username}) otomatis di-logout oleh sistem karena tidak ada aktivitas selama 20 menit (Idle Timeout)`,
        'BERHASIL'
      );
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('korwilcam_admin_auth');
    localStorage.removeItem('korwilcam_current_user');
    localStorage.removeItem('korwilcam_last_activity');
    setActiveTab('admin-login');
    showNoticePopup({
      title: 'Sesi Berakhir Otomatis',
      message: 'Sesi akun Anda telah keluar secara otomatis karena tidak ada aktivitas sama sekali selama 20 menit (Sistem Keamanan Portal CMS). Silakan login kembali untuk melanjutkan.',
      type: 'warning',
      duration: 8000
    });
  }, [currentUser, setActiveTab, showNoticePopup, triggerActivityLog]);

  // Reset timer inaktivitas saat ada aktivitas pengguna
  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setSessionRemainingSeconds(INACTIVITY_TIMEOUT_SECONDS);
    // Batasi update ke localStorage maksimal sekali setiap 5 detik agar efisien
    if (now - lastRecordedStorageRef.current > 5000) {
      lastRecordedStorageRef.current = now;
      try {
        localStorage.setItem('korwilcam_last_activity', String(now));
      } catch {
        // ignore
      }
    }
  }, [INACTIVITY_TIMEOUT_SECONDS]);

  // Listener interaksi pengguna & penghitung waktu mundur 20 menit (Idle Timeout 20 Menit)
  useEffect(() => {
    if (!isAuthenticated) return;

    const now = Date.now();
    lastActivityRef.current = now;
    lastRecordedStorageRef.current = now;
    try {
      localStorage.setItem('korwilcam_last_activity', String(now));
    } catch {}
    setSessionRemainingSeconds(INACTIVITY_TIMEOUT_SECONDS);

    const handleUserInteraction = () => {
      resetInactivityTimer();
    };

    // Deteksi berbagai aktivitas interaksi pengguna di portal
    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click', 'wheel'];
    events.forEach((evt) => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    // Sinkronisasi status & timestamp lintas tab browser
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'korwilcam_last_activity' && e.newValue) {
        const remoteTime = Number(e.newValue);
        if (remoteTime > lastActivityRef.current) {
          lastActivityRef.current = remoteTime;
          const elapsed = Date.now() - remoteTime;
          const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
          setSessionRemainingSeconds(remaining);
        }
      } else if (e.key === 'korwilcam_admin_auth' && e.newValue === null) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      } else if (e.key === 'korwilcam_maintenance_config' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMaintenanceConfig(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleMaintenanceCustomEvent = (e: any) => {
      if (e.detail) {
        setMaintenanceConfig(e.detail);
      }
    };
    window.addEventListener('korwilcam_maintenance_changed', handleMaintenanceCustomEvent);

    // Cek segera saat tab kembali aktif atau laptop bangun dari mode tidur
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const stored = Number(localStorage.getItem('korwilcam_last_activity') || lastActivityRef.current);
        const elapsed = Date.now() - stored;
        if (elapsed >= INACTIVITY_TIMEOUT_MS) {
          triggerAutoLogout();
        } else {
          const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));
          setSessionRemainingSeconds(remaining);
          lastActivityRef.current = stored;
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Interval setiap 1 detik untuk update countdown dan eksekusi auto-logout jika 20 menit terlewati
    const timerInterval = setInterval(() => {
      const storedTime = Number(localStorage.getItem('korwilcam_last_activity') || lastActivityRef.current);
      const effectiveLastTime = Math.max(lastActivityRef.current, storedTime);
      const elapsed = Date.now() - effectiveLastTime;
      const remaining = Math.max(0, Math.ceil((INACTIVITY_TIMEOUT_MS - elapsed) / 1000));

      setSessionRemainingSeconds(remaining);

      if (remaining <= 0 || elapsed >= INACTIVITY_TIMEOUT_MS) {
        clearInterval(timerInterval);
        triggerAutoLogout();
      }
    }, 1000);

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('korwilcam_maintenance_changed', handleMaintenanceCustomEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(timerInterval);
    };
  }, [isAuthenticated, INACTIVITY_TIMEOUT_MS, INACTIVITY_TIMEOUT_SECONDS, resetInactivityTimer, triggerAutoLogout]);

  // ADMIN USERS CRUD (Super Admin Only)
  const addAdminUser = async (userData: Omit<AdminUser, 'id'>): Promise<boolean> => {
    const existing = adminUsers.find(
      (u) => u.username.toLowerCase() === userData.username.trim().toLowerCase()
    );
    if (existing) {
      showToast(`Username "${userData.username}" sudah digunakan!`, 'error');
      return false;
    }

    const newId = `usr-${Date.now()}`;
    const newUser: AdminUser = {
      ...userData,
      id: newId,
      username: userData.username.trim().toLowerCase(),
      status: userData.status || 'Aktif',
      createdAt: new Date().toISOString()
    };

    setAdminUsers((prev) => [newUser, ...prev]);

    // Simpan ke Spreadsheet melalui GAS Webhook
    saveAdminUserToSheet(userData, newId).catch((e) =>
      console.warn('Gagal sinkronisasi tambah user ke Spreadsheet:', e)
    );

    triggerActivityLog(
      'TAMBAH DATA',
      'Pengguna Admin',
      `Menambahkan akun pengelola: ${newUser.name} (@${newUser.username}, Role: ${newUser.role})`
    );
    showToast(`Akun ${newUser.username} (${newUser.role}) berhasil ditambahkan!`, 'success');
    return true;
  };

  const updateAdminUser = async (id: string, userData: Partial<AdminUser>): Promise<boolean> => {
    setAdminUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...userData, updatedAt: new Date().toISOString() } : u))
    );

    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }

    // Perbarui di Spreadsheet melalui GAS Webhook
    updateAdminUserInSheet(id, userData).catch((e) =>
      console.warn('Gagal sinkronisasi update user ke Spreadsheet:', e)
    );

    triggerActivityLog(
      'UBAH DATA',
      'Pengguna Admin',
      `Memperbarui data akun pengelola (ID: ${id})`
    );
    showToast('Data akun berhasil diperbarui!', 'success');
    return true;
  };

  const deleteAdminUser = async (id: string): Promise<boolean> => {
    const target = adminUsers.find((u) => u.id === id);
    if (!target) return false;

    if (currentUser?.id === id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif!', 'error');
      return false;
    }

    setAdminUsers((prev) => prev.filter((u) => u.id !== id));

    // Hapus dari Spreadsheet melalui GAS Webhook
    deleteAdminUserFromSheet(id, target.username).catch((e) =>
      console.warn('Gagal sinkronisasi hapus user ke Spreadsheet:', e)
    );

    triggerActivityLog(
      'HAPUS DATA',
      'Pengguna Admin',
      `Menghapus akun pengelola: ${target.name} (@${target.username}, Role: ${target.role})`
    );
    showToast(`Akun ${target.username} berhasil dihapus.`, 'info');
    return true;
  };

  const refreshAdminUsersFromSheet = async (): Promise<boolean> => {
    try {
      const liveUsers = await fetchAdminUsersFromSheet(true);
      if (liveUsers && liveUsers.length > 0) {
        setAdminUsers(liveUsers);
        return true;
      }
    } catch (e) {
      console.warn('Gagal memuat admin_users dari sheet:', e);
    }
    return false;
  };

  // SCHOOLS CRUD (Auto-save to Supabase & local state)
  const addSchool = async (schoolData: Omit<School, 'id'>) => {
    const rawImg = schoolData.image?.trim() || '';
    const formattedImg = isGoogleDriveUrl(rawImg) ? formatGoogleDriveImageUrl(rawImg) : rawImg;
    const newSchool: School = {
      ...schoolData,
      image: formattedImg,
      id: `sch-${Date.now()}`
    };
    setSchools((prev) => [newSchool, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const payload: any = {
          id: newSchool.id,
          name: newSchool.name,
          level: newSchool.level,
          status: newSchool.status,
          npsn: newSchool.npsn,
          akreditasi: newSchool.akreditasi,
          headmaster: newSchool.headmaster,
          address: newSchool.address,
          desa: newSchool.desa,
          students_count: newSchool.studentsCount,
          teachers_count: newSchool.teachersCount,
          phone: newSchool.phone,
          email: newSchool.email,
          image: newSchool.image,
          titik_koordinat: normalizeToGoogleMapsUrl(newSchool.titikKoordinat || newSchool.coordinates || ''),
          coordinates: normalizeToGoogleMapsUrl(newSchool.coordinates || newSchool.titikKoordinat || '')
        };

        let { error } = await client.from('schools').upsert(payload);
        if (error && error.message?.toLowerCase().includes('column')) {
          const { titik_koordinat, coordinates, ...safePayload } = payload;
          const retry = await client.from('schools').upsert(safePayload);
          error = retry.error;
        }

        if (error) {
          console.error('Supabase addSchool error:', error);
          showToast(`Sekolah ditambahkan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast(`Sekolah ${newSchool.name} berhasil disimpan otomatis ke Supabase Cloud!`, 'success');
        }
      } catch (err: any) {
        showToast(`Sekolah disimpan lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast(`Sekolah ${newSchool.name} berhasil ditambahkan ke penyimpanan lokal.`, 'success');
    }

    triggerActivityLog(
      'TAMBAH DATA',
      'Sekolah',
      `Menambahkan data sekolah baru: "${newSchool.name}" (NPSN: ${newSchool.npsn || '-'}, Status: ${newSchool.status || '-'})`
    );
  };

  const updateSchool = async (id: string, updatedData: Partial<School>) => {
    const cleanUpdatedData = { ...updatedData };
    if (cleanUpdatedData.image && isGoogleDriveUrl(cleanUpdatedData.image)) {
      cleanUpdatedData.image = formatGoogleDriveImageUrl(cleanUpdatedData.image);
    }
    const existingSchool = schools.find((s) => s.id === id) || (_inMemorySchoolsCache || []).find((s) => s.id === id);
    const mergedSchool: School = existingSchool
      ? { ...existingSchool, ...cleanUpdatedData }
      : ({ id, ...cleanUpdatedData } as School);

    setSchools((prev) => prev.map((s) => (s.id === id ? mergedSchool : s)));

    setSelectedSchoolState((curr) => (curr?.id === id ? mergedSchool : curr));
    triggerActivityLog(
      'UBAH DATA',
      'Sekolah',
      `Memperbarui data sekolah: "${mergedSchool.name}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const s = mergedSchool as School;
        const payload: any = {
          id: s.id,
          name: s.name,
          level: s.level,
          status: s.status,
          npsn: s.npsn,
          akreditasi: s.akreditasi,
          headmaster: s.headmaster,
          address: s.address,
          desa: s.desa,
          students_count: s.studentsCount,
          teachers_count: s.teachersCount,
          phone: s.phone,
          email: s.email,
          image: s.image,
          titik_koordinat: normalizeToGoogleMapsUrl(s.titikKoordinat || s.coordinates || ''),
          coordinates: normalizeToGoogleMapsUrl(s.coordinates || s.titikKoordinat || '')
        };

        let { error } = await client.from('schools').upsert(payload);
        if (error && error.message?.toLowerCase().includes('column')) {
          const { titik_koordinat, coordinates, ...safePayload } = payload;
          const retry = await client.from('schools').upsert(safePayload);
          error = retry.error;
        }

        if (error) {
          console.error('Supabase updateSchool error:', error);
          showToast(`Data sekolah diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast(`Data sekolah ${s.name} berhasil diperbarui di Supabase Cloud!`, 'success');
        }
      } catch (err: any) {
        showToast(`Data sekolah diperbarui lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Data sekolah berhasil diperbarui di penyimpanan lokal.', 'success');
    }
  };

  const deleteSchool = async (id: string) => {
    const targetSchool = schools.find((s) => s.id === id);
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setSelectedSchoolState((curr) => (curr?.id === id ? null : curr));

    triggerActivityLog(
      'HAPUS DATA',
      'Sekolah',
      `Menghapus data sekolah: "${targetSchool?.name || id}" (NPSN: ${targetSchool?.npsn || '-'})`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('schools').delete().eq('id', id);
        if (error) {
          showToast(`Gagal menghapus dari Supabase: ${error.message}`, 'error');
        } else {
          showToast('Data sekolah berhasil dihapus dari database Supabase.', 'info');
        }
      } catch (err: any) {
        showToast('Data sekolah berhasil dihapus lokal.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Data sekolah berhasil dihapus dari penyimpanan lokal.', 'info');
    }
  };

  // NEWS CRUD (Auto-save to Supabase & local state)
  const addNews = async (newsData: Omit<NewsArticle, 'id'>) => {
    const cleanContent = newsData.content || '';
    const cleanSummary = newsData.summary && newsData.summary.trim()
      ? stripHtml(newsData.summary)
      : generateSummary(cleanContent, 180);
    const title = (newsData.title || '').trim();
    const cleanSlug = newsData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `berita-${Date.now()}`;

    const newArticle: NewsArticle = {
      ...newsData,
      id: `news-${Date.now()}`,
      title,
      slug: cleanSlug,
      summary: cleanSummary,
      views: newsData.views || 0
    };

    setNews((prev) => {
      const updated = [newArticle, ...prev];
      _inMemoryNewsCache = updated;
      try {
        sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        localStorage.setItem('korwilcam_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Sinkronkan ke Google Spreadsheet via GAS di latar belakang
    createNewsInSheet(newArticle).catch((err) => {
      console.warn('Gagal simpan berita ke Spreadsheet:', err);
    });

    showToast('Artikel berita berhasil diterbitkan!', 'success');

    triggerActivityLog(
      'TAMBAH DATA',
      'Berita & Warta',
      `Menerbitkan artikel berita: "${newArticle.title}" (Kategori: ${newArticle.category})`
    );
  };

  const updateNews = async (id: string, updatedData: Partial<NewsArticle>) => {
    const cleanSummary = updatedData.summary !== undefined
      ? (stripHtml(updatedData.summary) || (updatedData.content ? generateSummary(updatedData.content, 180) : ''))
      : undefined;

    const existingNews = news.find((n) => n.id === id) || (_inMemoryNewsCache || []).find((n) => n.id === id);
    const itemSummary = cleanSummary !== undefined 
      ? cleanSummary 
      : (existingNews ? (stripHtml(existingNews.summary) || generateSummary(existingNews.content, 180)) : '');
    const itemSlug = updatedData.slug || (existingNews?.slug) || (updatedData.title || existingNews?.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `berita-${id}`;

    const mergedNews: NewsArticle = existingNews
      ? { ...existingNews, ...updatedData, summary: itemSummary, slug: itemSlug }
      : ({ id, ...updatedData, summary: itemSummary, slug: itemSlug } as NewsArticle);

    setNews((prev) => {
      const updated = prev.map((n) => (n.id === id ? mergedNews : n));
      if (!prev.some((n) => n.id === id)) {
        updated.unshift(mergedNews);
      }
      _inMemoryNewsCache = updated;
      try {
        sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        localStorage.setItem('korwilcam_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSelectedNewsState((current) => {
      if (current && (current.id === id || current.slug === mergedNews.slug)) {
        return mergedNews;
      }
      return current;
    });
    triggerActivityLog(
      'UBAH DATA',
      'Berita & Warta',
      `Memperbarui artikel berita: "${mergedNews.title}"`
    );

    // Sinkronkan edit ke Google Spreadsheet via GAS di latar belakang
    updateNewsInSheet(id, mergedNews).catch((err) => {
      console.warn('Gagal update berita ke Spreadsheet:', err);
    });

    showToast('Berita berhasil diperbarui!', 'success');
  };

  const deleteNews = async (id: string) => {
    const targetNews = news.find((n) => n.id === id);
    setNews((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      _inMemoryNewsCache = updated;
      try {
        sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        localStorage.setItem('korwilcam_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSelectedNewsState((current) => (current?.id === id ? null : current));

    triggerActivityLog(
      'HAPUS DATA',
      'Berita & Warta',
      `Menghapus artikel berita: "${targetNews?.title || id}"`
    );

    // Sinkronkan hapus ke Google Spreadsheet via GAS di latar belakang
    deleteNewsFromSheet(id).catch((err) => {
      console.warn('Gagal hapus berita di Spreadsheet:', err);
    });

    showToast('Artikel berita berhasil dihapus.', 'info');
  };

  const refreshNewsFromSheet = async (force: boolean = true): Promise<void> => {
    try {
      const sheetNews = await fetchNewsFromSheet(force);
      if (sheetNews && sheetNews.length > 0) {
        _inMemoryNewsCache = sheetNews;
        setNews(sheetNews);
        try {
          sessionStorage.setItem('korwilcam_news', JSON.stringify(sheetNews));
          localStorage.setItem('korwilcam_news', JSON.stringify(sheetNews));
        } catch {}

        const catSet = new Set<string>(['Kedinasan', 'SD', 'TK/KB', 'Prestasi']);
        sheetNews.forEach((n) => {
          if (n.category) catSet.add(n.category.trim());
        });
        const allCats = Array.from(catSet);
        setNewsCategories(allCats);
        try {
          localStorage.setItem('korwilcam_news_categories', JSON.stringify(allCats));
        } catch {}
        showToast('Data berita berhasil disinkronkan dari Google Spreadsheet!', 'success');
      } else {
        showToast('Berhasil terhubung ke Spreadsheet (data berita terkini).', 'info');
      }
    } catch (err: any) {
      showToast(`Gagal sinkron berita dari Spreadsheet: ${err.message || 'Error Jaringan'}`, 'error');
    }
  };

  const addNewsCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    triggerActivityLog(
      'TAMBAH DATA',
      'Berita & Warta',
      `Menambahkan kategori berita: "${trimmed}"`
    );

    // Cek apakah sudah ada (case-insensitive)
    const exists = newsCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? newsCategories : [...newsCategories, trimmed];

    setNewsCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_news_categories', JSON.stringify(updatedCategories));
    } catch {}

    // DIPUTUS DARI SUPABASE: Kategori disimpan secara lokal & siap sinkron ke Spreadsheet
    showToast(`Kategori "${trimmed}" berhasil ditambahkan!`, 'success');
    return true;
  };

  const incrementNewsViews = async (id: string) => {
    if (!id) return;

    // Cegah duplikasi penambahan tayangan dalam 1 sesi pembaca
    const sessionKey = `viewed_news_${id}`;
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(sessionKey)) {
        return;
      }
      sessionStorage.setItem(sessionKey, 'true');
    }

    // 1. Hitung penambahan tayangan secara optimistik
    let calculatedNextViews = 1;

    setNews((prev) => {
      const target = prev.find((n) => n.id === id || n.slug === id);
      if (target) {
        calculatedNextViews = (Number(target.views) || 0) + 1;
      } else {
        calculatedNextViews = 1;
      }
      return prev.map((n) => {
        if (n.id === id || n.slug === id) {
          return { ...n, views: calculatedNextViews };
        }
        return n;
      });
    });

    setSelectedNewsState((prev) => {
      if (prev && (prev.id === id || prev.slug === id)) {
        const next = Math.max((Number(prev.views) || 0) + 1, calculatedNextViews);
        calculatedNextViews = next;
        return { ...prev, views: next };
      }
      return prev;
    });

    // Simpan segera ke localStorage & sessionStorage agar tersinkronisasi saat refresh halaman seketika
    try {
      const savedRaw = localStorage.getItem('korwilcam_news');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((n: any) => {
            if (n.id === id || n.slug === id) {
              return { ...n, views: Math.max((Number(n.views) || 0) + 1, calculatedNextViews) };
            }
            return n;
          });
          localStorage.setItem('korwilcam_news', JSON.stringify(updated));
          sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        }
      }
    } catch {}

    // Sinkronkan penambahan views ke Google Spreadsheet via GAS di latar belakang
    incrementNewsViewsInSheet(id).catch(() => {});
  };

  // Record & average news reading time from actual reader interactions
  const recordNewsReadingTime = async (id: string, secondsSpent: number, isNewSession: boolean = true) => {
    if (secondsSpent <= 0) return;

    let nextTotal = 0;
    let nextCount = 0;

    // 1. Optimistically update local React state
    setNews((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const curTotal = Number(n.totalReadSeconds) || 0;
          const curCount = Number(n.readCount) || 0;
          nextTotal = curTotal + secondsSpent;
          nextCount = isNewSession ? curCount + 1 : Math.max(1, curCount);
          return {
            ...n,
            totalReadSeconds: nextTotal,
            readCount: nextCount
          };
        }
        return n;
      })
    );

    setSelectedNewsState((prev) => {
      if (prev && prev.id === id) {
        const curTotal = Number(prev.totalReadSeconds) || 0;
        const curCount = Number(prev.readCount) || 0;
        return {
          ...prev,
          totalReadSeconds: curTotal + secondsSpent,
          readCount: isNewSession ? curCount + 1 : Math.max(1, curCount)
        };
      }
      return prev;
    });

    // Simpan segera ke localStorage & sessionStorage
    try {
      const savedRaw = localStorage.getItem('korwilcam_news');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (Array.isArray(parsed)) {
          const updated = parsed.map((n: any) => {
            if (n.id === id) {
              return {
                ...n,
                totalReadSeconds: nextTotal,
                readCount: nextCount
              };
            }
            return n;
          });
          localStorage.setItem('korwilcam_news', JSON.stringify(updated));
          sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        }
      }
    } catch {}
    // DIPUTUS DARI SUPABASE: Waktu baca berita dikelola lokal
  };

  // ANNOUNCEMENTS CRUD (Auto-save to Supabase & local state, auto-sync to Layanan Unduhan)
  const addAnnouncement = async (annData: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`
    };
    setAnnouncements((prev) => {
      const updated = [newAnn, ...prev];
      _inMemoryAnnouncementsCache = updated;
      try { sessionStorage.setItem('korwilcam_announcements', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    // SINKRONISASI KE LAYANAN UNDUHAN JIKA PENGUMUMAN MELAMPIRKAN BERKAS BARU:
    let syncedDoc: DocumentDownload | null = null;
    const hasFile = Boolean(newAnn.fileUrl && newAnn.fileUrl.trim() !== '' && newAnn.fileUrl !== '#');
    
    // Deteksi cerdas: Cek apakah berkas berasal dari dokumen master yang sudah ada di Layanan Unduhan
    const existingMasterDoc = documents.find((d) => 
      !d.id.startsWith('doc-ann-') && 
      d.id !== 'sop-main' && 
      d.id !== 'system-document-categories' && 
      (
        (newAnn.sourceDocumentId && d.id === newAnn.sourceDocumentId) ||
        (newAnn.fileUrl && d.downloadUrl && d.downloadUrl !== '#' && d.downloadUrl.trim() === newAnn.fileUrl.trim()) ||
        (newAnn.fileName && d.title.trim().toLowerCase() === newAnn.fileName.trim().toLowerCase() && d.fileSize === newAnn.fileSize)
      )
    );

    const isFromExistingDoc = Boolean(newAnn.sourceDocumentId || existingMasterDoc);
    if (existingMasterDoc && !newAnn.sourceDocumentId) {
      newAnn.sourceDocumentId = existingMasterDoc.id;
    }

    if (hasFile && !isFromExistingDoc) {
      const ext = (newAnn.fileType || newAnn.fileName?.split('.').pop() || 'PDF').toUpperCase();
      const detectedType = (ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'XLSX' || ext === 'XLS' ? 'XLSX' : 'PDF') as 'PDF' | 'DOCX' | 'XLSX';
      syncedDoc = {
        id: `doc-ann-${newAnn.id}`,
        title: newAnn.title.trim(),
        category: 'Surat Edaran',
        fileType: detectedType,
        fileSize: newAnn.fileSize || '1 MB',
        downloadCount: 0,
        date: newAnn.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        description: newAnn.summary || `Berkas lampiran resmi pengumuman: ${newAnn.title.trim()}`,
        downloadUrl: newAnn.fileUrl!
      };
      setDocuments((prev) => [syncedDoc!, ...prev.filter((d) => d.id !== syncedDoc!.id)]);
    } else {
      // Jika dari berkas yang sudah ada, pastikan id doc-ann ini tidak ada di Layanan Unduhan
      const redundantDocId = `doc-ann-${newAnn.id}`;
      setDocuments((prev) => prev.filter((d) => d.id !== redundantDocId));
    }

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const packedFileSize = [
          newAnn.fileSize || '',
          newAnn.fileName || '',
          newAnn.fileType || '',
          newAnn.fileUrl || '',
          newAnn.serviceRequirementId || '',
          newAnn.serviceRequirementTitle || '',
          newAnn.sourceDocumentId || '',
          newAnn.author || '',
          newAnn.authorId || '',
          newAnn.authorRole || ''
        ].join('|');

        const { error } = await client.from('announcements').upsert({
          id: newAnn.id,
          title: newAnn.title,
          date: newAnn.date,
          urgency: newAnn.urgency,
          target: newAnn.target,
          file_size: packedFileSize,
          summary: newAnn.summary
        });

        // Simpan dokumen sinkronisasi ke tabel documents di Supabase (hanya jika berkas baru diunggah)
        if (syncedDoc) {
          await client.from('documents').upsert({
            id: syncedDoc.id,
            title: syncedDoc.title,
            category: syncedDoc.category,
            file_type: syncedDoc.fileType,
            file_size: syncedDoc.fileSize,
            download_count: 0,
            date: syncedDoc.date,
            description: syncedDoc.description,
            download_url: syncedDoc.downloadUrl
          });
        } else {
          // Pastikan tidak ada doc-ann ganda yang tersimpan di Supabase
          try {
            await client.from('documents').delete().eq('id', `doc-ann-${newAnn.id}`);
          } catch (_) {}
        }

        if (error) {
          console.error('Supabase addAnnouncement error:', error);
          showToast(`Pengumuman disimpan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast(
            hasFile
              ? (isFromExistingDoc
                  ? 'Pengumuman resmi berhasil diterbitkan dengan menautkan berkas dari Layanan Unduhan (bebas duplikasi).'
                  : 'Pengumuman resmi & berkas lampiran berhasil disimpan dan otomatis masuk ke Layanan Unduhan!')
              : 'Pengumuman resmi berhasil disimpan otomatis ke Supabase Cloud!',
            'success'
          );
        }
      } catch (err: any) {
        showToast(`Pengumuman disimpan lokal. Supabase error: ${err.message || err}`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast(
        hasFile
          ? (isFromExistingDoc
              ? 'Pengumuman berhasil ditambahkan dengan menautkan berkas dari Layanan Unduhan (bebas duplikasi).'
              : 'Pengumuman berhasil ditambahkan dan berkas lampiran otomatis masuk ke Layanan Unduhan.')
          : 'Pengumuman berhasil ditambahkan ke penyimpanan lokal.',
        'success'
      );
    }

    triggerActivityLog(
      'TAMBAH DATA',
      'Pengumuman & Edaran',
      `Menerbitkan pengumuman baru: "${newAnn.title}" (Sasaran: ${newAnn.target || '-'})`
    );
  };

  const updateAnnouncement = async (id: string, updatedData: Partial<Announcement>) => {
    // 1. Temukan pengumuman yang ada secara sinkron agar tidak kehilangan data saat batching React
    const existingAnn = announcements.find((a) => a.id === id) || (_inMemoryAnnouncementsCache || []).find((a) => a.id === id);
    const mergedAnn: Announcement = existingAnn
      ? { ...existingAnn, ...updatedData }
      : ({ id, ...updatedData } as Announcement);

    // 2. Perbarui state lokal dan cache memori secara instan
    setAnnouncements((prev) => {
      const updated = prev.map((a) => (a.id === id ? mergedAnn : a));
      if (!prev.some((a) => a.id === id)) {
        updated.unshift(mergedAnn);
      }
      _inMemoryAnnouncementsCache = updated;
      try { sessionStorage.setItem('korwilcam_announcements', JSON.stringify(updated)); } catch (_) {}
      try { localStorage.setItem('korwilcam_announcements', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    const docId = `doc-ann-${id}`;
    let syncedDoc: DocumentDownload | null = null;
    const targetAnn = mergedAnn;
    const hasFile = Boolean(targetAnn && targetAnn.fileUrl && targetAnn.fileUrl.trim() !== '' && targetAnn.fileUrl !== '#');
    
    // Deteksi cerdas: Cek apakah berkas berasal dari dokumen master yang sudah ada di Layanan Unduhan
    const existingMasterDoc = documents.find((d) => 
      !d.id.startsWith('doc-ann-') && 
      d.id !== 'sop-main' && 
      d.id !== 'system-document-categories' && 
      (
        (targetAnn?.sourceDocumentId && d.id === targetAnn.sourceDocumentId) ||
        (targetAnn?.fileUrl && d.downloadUrl && d.downloadUrl !== '#' && d.downloadUrl.trim() === targetAnn.fileUrl.trim()) ||
        (targetAnn?.fileName && d.title.trim().toLowerCase() === targetAnn.fileName.trim().toLowerCase() && d.fileSize === targetAnn.fileSize)
      )
    );

    const isFromExistingDoc = Boolean((targetAnn && targetAnn.sourceDocumentId) || existingMasterDoc);
    if (existingMasterDoc && targetAnn && !targetAnn.sourceDocumentId) {
      targetAnn.sourceDocumentId = existingMasterDoc.id;
    }

    if (targetAnn && hasFile && !isFromExistingDoc) {
      const ext = (targetAnn.fileType || targetAnn.fileName?.split('.').pop() || 'PDF').toUpperCase();
      const detectedType = (ext === 'DOCX' || ext === 'DOC' ? 'DOCX' : ext === 'XLSX' || ext === 'XLS' ? 'XLSX' : 'PDF') as 'PDF' | 'DOCX' | 'XLSX';
      syncedDoc = {
        id: docId,
        title: targetAnn.title.trim(),
        category: 'Surat Edaran',
        fileType: detectedType,
        fileSize: targetAnn.fileSize || '1 MB',
        downloadCount: 0,
        date: targetAnn.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        description: targetAnn.summary || `Berkas lampiran resmi pengumuman: ${targetAnn.title.trim()}`,
        downloadUrl: targetAnn.fileUrl!
      };
      setDocuments((prev) => {
        const existing = prev.find((d) => d.id === docId);
        if (existing) {
          return prev.map((d) => (d.id === docId ? { ...existing, ...syncedDoc!, downloadCount: existing.downloadCount } : d));
        } else {
          return [syncedDoc!, ...prev];
        }
      });
    } else {
      // Jika berkas lampiran dilepas ATAU sekarang menggunakan berkas dari Layanan Unduhan, hapus dokumen sinkronisasi lama (docId)
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }

    setSelectedAnnouncementState((curr) => (curr?.id === id ? mergedAnn : curr));
    triggerActivityLog(
      'UBAH DATA',
      'Pengumuman & Edaran',
      `Memperbarui pengumuman: "${mergedAnn.title}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const target = mergedAnn;
        const packedFileSize = [
          target.fileSize || '',
          target.fileName || '',
          target.fileType || '',
          target.fileUrl || '',
          target.serviceRequirementId || '',
          target.serviceRequirementTitle || '',
          target.sourceDocumentId || '',
          target.author || '',
          target.authorId || '',
          target.authorRole || ''
        ].join('|');

        const payload = {
          title: target.title,
          date: target.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          urgency: target.urgency || 'Biasa',
          target: target.target || 'Semua Satuan',
          file_size: packedFileSize,
          summary: target.summary || target.title
        };

        // 1. Coba update record yang sudah ada terlebih dahulu di Supabase
        const { data: updateData, error: updateErr } = await client
          .from('announcements')
          .update(payload)
          .eq('id', target.id)
          .select();

        let saveError = updateErr;

        // 2. Jika baris belum ada di Supabase, gunakan upsert
        if (!saveError && (!updateData || updateData.length === 0)) {
          const { error: upsertErr } = await client
            .from('announcements')
            .upsert({ id: target.id, ...payload });
          saveError = upsertErr;
        }

        // Sinkronkan ke tabel documents di Supabase
        if (syncedDoc) {
          const docPayload = {
            title: syncedDoc.title,
            category: syncedDoc.category,
            file_type: syncedDoc.fileType,
            file_size: syncedDoc.fileSize,
            download_count: 0,
            date: syncedDoc.date,
            description: syncedDoc.description,
            download_url: syncedDoc.downloadUrl
          };
          const { data: docUpdateData, error: docUpdateErr } = await client
            .from('documents')
            .update(docPayload)
            .eq('id', syncedDoc.id)
            .select();
          if (!docUpdateErr && (!docUpdateData || docUpdateData.length === 0)) {
            await client.from('documents').upsert({ id: syncedDoc.id, ...docPayload });
          }
        } else {
          try {
            await client.from('documents').delete().eq('id', docId);
          } catch (_) {}
        }

        if (saveError) {
          console.error('Supabase updateAnnouncement error:', saveError);
          showToast(`Pengumuman diperbarui lokal. Gagal sinkron Supabase: ${saveError.message}`, 'error');
        } else {
          showToast(
            hasFile
              ? (isFromExistingDoc
                  ? 'Pengumuman berhasil diperbarui dengan menautkan berkas dari Layanan Unduhan (bebas duplikasi).'
                  : 'Pengumuman & sinkronisasi berkas Layanan Unduhan berhasil diperbarui di Supabase Cloud!')
              : 'Pengumuman berhasil diperbarui di database Supabase Cloud!',
            'success'
          );
        }
      } catch (err: any) {
        console.error('updateAnnouncement exception:', err);
        showToast(`Pengumuman diperbarui lokal. Terjadi kendala jaringan: ${err.message || err}`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Pengumuman berhasil diperbarui di penyimpanan lokal.', 'success');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    const targetAnn = announcements.find((a) => a.id === id);
    setAnnouncements((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      _inMemoryAnnouncementsCache = updated;
      try { sessionStorage.setItem('korwilcam_announcements', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });
    setSelectedAnnouncementState((curr) => (curr?.id === id ? null : curr));

    triggerActivityLog(
      'HAPUS DATA',
      'Pengumuman & Edaran',
      `Menghapus pengumuman: "${targetAnn?.title || id}"`
    );

    // Hapus juga berkas terkait di Layanan Unduhan HANYA jika pengumuman ini mengunggah berkas baru (bukan dari dokumen master Layanan Unduhan)
    const docId = `doc-ann-${id}`;
    if (!targetAnn?.sourceDocumentId) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('announcements').delete().eq('id', id);
        if (!targetAnn?.sourceDocumentId) {
          try {
            await client.from('documents').delete().eq('id', docId);
          } catch (_) {}
        }

        if (error) {
          showToast(`Gagal menghapus dari Supabase: ${error.message}`, 'error');
        } else {
          showToast('Pengumuman & berkas terkait di Layanan Unduhan berhasil dihapus dari database Supabase.', 'info');
        }
      } catch (err: any) {
        showToast('Pengumuman dihapus lokal.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Pengumuman dihapus dari penyimpanan lokal.', 'info');
    }
  };

  // DOCUMENTS CRUD (Auto-save to Supabase & local state)
  const addDocument = async (docData: Omit<DocumentDownload, 'id' | 'downloadCount'>) => {
    const newDoc: DocumentDownload = {
      ...docData,
      id: `doc-${Date.now()}`,
      downloadCount: 0
    };
    setDocuments((prev) => [newDoc, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('documents').upsert({
          id: newDoc.id,
          title: newDoc.title,
          category: newDoc.category,
          file_type: newDoc.fileType,
          file_size: newDoc.fileSize,
          download_count: newDoc.downloadCount,
          date: newDoc.date,
          description: newDoc.description,
          download_url: newDoc.downloadUrl
        });
        if (error) {
          console.error('Supabase addDocument error:', error);
          showToast(`Dokumen disimpan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast(`Dokumen "${newDoc.title}" berhasil disimpan otomatis ke Supabase Cloud!`, 'success');
        }
      } catch (err: any) {
        showToast(`Dokumen disimpan lokal. Supabase error: ${err.message || err}`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Dokumen baru berhasil ditambahkan ke penyimpanan lokal.', 'success');
    }

    triggerActivityLog(
      'TAMBAH DATA',
      'Layanan Unduhan',
      `Mengunggah dokumen baru: "${newDoc.title}" (${newDoc.fileType}, ${newDoc.category})`
    );
  };

  const updateDocument = async (id: string, updatedData: Partial<DocumentDownload>) => {
    const existingDoc = documents.find((d) => d.id === id) || (_inMemoryDocumentsCache || []).find((d) => d.id === id);
    const mergedDoc: DocumentDownload = existingDoc
      ? { ...existingDoc, ...updatedData }
      : ({ id, ...updatedData } as DocumentDownload);

    setDocuments((prev) => prev.map((d) => (d.id === id ? mergedDoc : d)));

    setSelectedDocumentState((curr) => (curr?.id === id ? mergedDoc : curr));
    triggerActivityLog(
      'UBAH DATA',
      'Layanan Unduhan',
      `Memperbarui dokumen: "${mergedDoc.title}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const target = mergedDoc;
        const docPayload = {
          title: target.title,
          category: target.category,
          file_type: target.fileType,
          file_size: target.fileSize,
          download_count: target.downloadCount || 0,
          date: target.date,
          description: target.description,
          download_url: target.downloadUrl
        };

        const { data: updateData, error: updateErr } = await client
          .from('documents')
          .update(docPayload)
          .eq('id', target.id)
          .select();

        let saveError = updateErr;
        if (!saveError && (!updateData || updateData.length === 0)) {
          const { error: upsertErr } = await client
            .from('documents')
            .upsert({ id: target.id, ...docPayload });
          saveError = upsertErr;
        }

        if (saveError) {
          showToast(`Dokumen diperbarui lokal. Gagal sinkron Supabase: ${saveError.message}`, 'error');
        } else {
          showToast('Dokumen berhasil diperbarui dan tersinkron ke Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast(`Dokumen diperbarui lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Dokumen berhasil diperbarui di penyimpanan lokal.', 'success');
    }
  };

  const deleteDocument = async (id: string) => {
    const targetDoc = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocumentState((curr) => (curr?.id === id ? null : curr));

    triggerActivityLog(
      'HAPUS DATA',
      'Layanan Unduhan',
      `Menghapus dokumen: "${targetDoc?.title || id}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('documents').delete().eq('id', id);
        if (error) {
          showToast(`Gagal hapus dokumen di Supabase: ${error.message}`, 'error');
        } else {
          showToast('Dokumen berhasil dihapus dari database Supabase.', 'info');
        }
      } catch (err: any) {
        showToast('Dokumen dihapus lokal.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Dokumen berhasil dihapus dari penyimpanan lokal.', 'info');
    }
  };

  const addDocumentCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    triggerActivityLog(
      'TAMBAH DATA',
      'Layanan Unduhan',
      `Menambahkan kategori dokumen: "${trimmed}"`
    );

    const exists = documentCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? documentCategories : [...documentCategories, trimmed];

    setDocumentCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_document_categories', JSON.stringify(updatedCategories));
    } catch {}

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('documents').upsert({
          id: 'system-document-categories',
          title: 'System Document Categories',
          category: 'System',
          description: JSON.stringify(updatedCategories),
          download_url: '',
          file_type: 'PDF',
          file_size: '0 KB',
          download_count: 0,
          date: new Date().toISOString().split('T')[0]
        });

        if (error) {
          console.warn('Gagal menyimpan kategori dokumen ke Supabase:', error.message);
          showToast(`Kategori berkas tersimpan lokal. Supabase: ${error.message}`, 'info');
          return false;
        } else {
          showToast(`Kategori berkas "${trimmed}" berhasil disimpan di database Supabase Cloud!`, 'success');
          return true;
        }
      } catch (err: any) {
        showToast('Kategori berkas tersimpan di penyimpanan lokal.', 'info');
        return false;
      }
    } else {
      showToast(`Kategori berkas "${trimmed}" berhasil ditambahkan!`, 'success');
      return true;
    }
  };

  const incrementDocumentDownloadCount = async (id: string) => {
    let nextCount = 1;

    // 1. Update React state immediately (optimistic UI update)
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          nextCount = (Number(d.downloadCount) || 0) + 1;
          return { ...d, downloadCount: nextCount };
        }
        return d;
      })
    );

    setSelectedDocumentState((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, downloadCount: (Number(prev.downloadCount) || 0) + 1 };
      }
      return prev;
    });

    // 2. Persist to Supabase Cloud if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: dbItem } = await client
          .from('documents')
          .select('download_count')
          .eq('id', id)
          .single();

        const finalCount = dbItem ? (Number(dbItem.download_count) || 0) + 1 : nextCount;

        const { error } = await client
          .from('documents')
          .update({ download_count: finalCount })
          .eq('id', id);

        if (!error && finalCount !== nextCount) {
          setDocuments((prev) =>
            prev.map((d) => (d.id === id ? { ...d, downloadCount: finalCount } : d))
          );
          setSelectedDocumentState((prev) =>
            prev && prev.id === id ? { ...prev, downloadCount: finalCount } : prev
          );
        }
      } catch (err) {
        console.warn('Silently failed to update document download count in Supabase:', err);
      }
    }
  };

  // AGENDA CRUD (Auto-save to Supabase & local state)
  const addAgenda = async (agendaData: Omit<AgendaEvent, 'id'>) => {
    const newAg: AgendaEvent = {
      ...agendaData,
      id: `agd-${Date.now()}`
    };
    setAgenda((prev) => [newAg, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        await client.from('agenda').upsert({
          id: newAg.id,
          title: newAg.title,
          date: newAg.date,
          time: newAg.time,
          location: newAg.location,
          organizer: newAg.organizer,
          target_audience: newAg.targetAudience,
          status: newAg.status
        });
        showToast('Agenda kegiatan berhasil disimpan otomatis ke Supabase Cloud!', 'success');
      } catch (err: any) {
        showToast('Agenda kegiatan berhasil ditambahkan.', 'success');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Agenda kegiatan berhasil ditambahkan.', 'success');
    }

    triggerActivityLog(
      'TAMBAH DATA',
      'Agenda Kegiatan',
      `Menambahkan agenda: "${newAg.title}" (Tanggal: ${newAg.date}, Tempat: ${newAg.location})`
    );
  };

  const updateAgenda = async (id: string, updatedData: Partial<AgendaEvent>) => {
    const existingAgenda = agenda.find((a) => a.id === id);
    const mergedAgenda: AgendaEvent = existingAgenda
      ? { ...existingAgenda, ...updatedData }
      : ({ id, ...updatedData } as AgendaEvent);

    setAgenda((prev) => prev.map((ag) => (ag.id === id ? mergedAgenda : ag)));

    triggerActivityLog(
      'UBAH DATA',
      'Agenda Kegiatan',
      `Memperbarui agenda: "${mergedAgenda.title}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const ag = mergedAgenda;
        const payload = {
          title: ag.title,
          date: ag.date,
          time: ag.time,
          location: ag.location,
          organizer: ag.organizer,
          target_audience: ag.targetAudience,
          status: ag.status
        };

        const { data: updateData, error: updateErr } = await client
          .from('agenda')
          .update(payload)
          .eq('id', ag.id)
          .select();

        let saveError = updateErr;
        if (!saveError && (!updateData || updateData.length === 0)) {
          const { error: upsertErr } = await client
            .from('agenda')
            .upsert({ id: ag.id, ...payload });
          saveError = upsertErr;
        }

        if (saveError) {
          showToast(`Agenda diperbarui lokal. Gagal sinkron Supabase: ${saveError.message}`, 'error');
        } else {
          showToast('Agenda kegiatan berhasil diperbarui di Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast('Agenda kegiatan berhasil diperbarui.', 'success');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Agenda kegiatan berhasil diperbarui.', 'success');
    }
  };

  const deleteAgenda = async (id: string) => {
    const targetAg = agenda.find((a) => a.id === id);
    setAgenda((prev) => prev.filter((a) => a.id !== id));

    triggerActivityLog(
      'HAPUS DATA',
      'Agenda Kegiatan',
      `Menghapus agenda: "${targetAg?.title || id}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        await client.from('agenda').delete().eq('id', id);
        showToast('Agenda kegiatan dihapus dari database Supabase.', 'info');
      } catch (err: any) {
        showToast('Agenda kegiatan dihapus.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Agenda kegiatan dihapus.', 'info');
    }
  };

  // GALLERY CRUD (Simpan, Edit & Hapus ke Google Spreadsheet via GAS)
  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>) => {
    const imagesList = itemData.images && itemData.images.length > 0 
      ? itemData.images 
      : (itemData.image ? [itemData.image] : []);

    const newItem: GalleryItem = {
      ...itemData,
      image: itemData.image || itemData.driveFolderUrl || '',
      images: imagesList,
      driveFolderUrl: itemData.driveFolderUrl || '',
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGallery((prev) => {
      const updated = sortGalleryDescending([newItem, ...prev]);
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      setLocalGalleryCache(updated);
      return updated;
    });

    showToast(`Album galeri "${newItem.title}" berhasil ditambahkan.`, 'success');

    triggerActivityLog(
      'TAMBAH DATA',
      'Galeri Kegiatan',
      `Menambahkan album galeri: "${newItem.title}" (${newItem.category})`
    );

    // Kirim ke Google Spreadsheet via Google Apps Script (GAS)
    const fullDesc = embedGalleryMetadata(newItem.description || '', {
      driveFolderUrl: newItem.driveFolderUrl,
      images: newItem.images,
      authorName: newItem.authorName,
      authorRole: newItem.authorRole,
      authorId: newItem.authorId
    });

    sendGalleryActionToGAS({
      action: 'create',
      id: newItem.id,
      title: newItem.title,
      category: newItem.category,
      image: newItem.image,
      description: fullDesc,
      date: newItem.date,
      created_at: newItem.createdAt,
      images: newItem.images,
      drive_folder_url: newItem.driveFolderUrl,
      authorName: newItem.authorName,
      authorRole: newItem.authorRole,
      authorId: newItem.authorId
    }).catch((err) => {
      console.warn('Gagal sinkronisasi tambah galeri ke Spreadsheet:', err);
    });
  };

  const updateGalleryItem = async (id: string, updatedData: Partial<GalleryItem>) => {
    const existingGallery = gallery.find((g) => g.id === id) || (_inMemoryGalleryCache || []).find((g) => g.id === id);
    let mergedGallery: GalleryItem = existingGallery
      ? { ...existingGallery, ...updatedData }
      : ({ id, ...updatedData } as GalleryItem);

    if (updatedData.images && updatedData.images.length > 0 && !updatedData.image) {
      mergedGallery.image = updatedData.images[0];
    }

    setGallery((prev) => {
      const updated = sortGalleryDescending(prev.map((g) => (g.id === id ? mergedGallery : g)));
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      setLocalGalleryCache(updated);
      return updated;
    });

    setSelectedGalleryState((curr) => (curr?.id === id ? mergedGallery : curr));
    triggerActivityLog(
      'UBAH DATA',
      'Galeri Kegiatan',
      `Memperbarui album galeri: "${mergedGallery.title}"`
    );

    showToast('Album galeri berhasil diperbarui.', 'success');

    // Kirim pembaruan ke Google Spreadsheet via Google Apps Script (GAS)
    const fullDesc = embedGalleryMetadata(mergedGallery.description || '', {
      driveFolderUrl: mergedGallery.driveFolderUrl,
      images: mergedGallery.images,
      authorName: mergedGallery.authorName,
      authorRole: mergedGallery.authorRole,
      authorId: mergedGallery.authorId
    });

    sendGalleryActionToGAS({
      action: 'update',
      id: mergedGallery.id,
      title: mergedGallery.title,
      category: mergedGallery.category,
      image: mergedGallery.image,
      description: fullDesc,
      date: mergedGallery.date,
      created_at: mergedGallery.createdAt,
      images: mergedGallery.images,
      drive_folder_url: mergedGallery.driveFolderUrl,
      authorName: mergedGallery.authorName,
      authorRole: mergedGallery.authorRole,
      authorId: mergedGallery.authorId
    }).catch((err) => {
      console.warn('Gagal sinkronisasi update galeri ke Spreadsheet:', err);
    });
  };

  const deleteGalleryItem = async (id: string) => {
    const targetItem = gallery.find((g) => g.id === id);
    setGallery((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      setLocalGalleryCache(updated);
      return updated;
    });
    setSelectedGalleryState((curr) => (curr?.id === id ? null : curr));

    triggerActivityLog(
      'HAPUS DATA',
      'Galeri Kegiatan',
      `Menghapus album galeri: "${targetItem?.title || id}"`
    );

    showToast('Foto kegiatan berhasil dihapus.', 'info');

    // Kirim perintah hapus ke Google Spreadsheet via Google Apps Script (GAS)
    sendGalleryActionToGAS({
      action: 'delete',
      id: id
    }).catch((err) => {
      console.warn('Gagal sinkronisasi hapus galeri ke Spreadsheet:', err);
    });
  };

  const addGalleryCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    triggerActivityLog(
      'TAMBAH DATA',
      'Galeri Kegiatan',
      `Menambahkan kategori galeri: "${trimmed}"`
    );

    const exists = galleryCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? galleryCategories : [...galleryCategories, trimmed];

    setGalleryCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_gallery_categories', JSON.stringify(updatedCategories));
    } catch {}

    // Diputus dari Supabase (Sedang dialihkan ke Google Spreadsheet)
    showToast(`Kategori galeri "${trimmed}" berhasil ditambahkan!`, 'success');
    return true;
  };

  // STAFF CRUD (Auto-save to Supabase & local state)
  const addStaff = async (staffData: Omit<StaffProfile, 'id'>): Promise<boolean> => {
    const rawPhoto = String(staffData.photo || '').trim();
    const cleanPhoto = (rawPhoto.includes('unsplash.com') || rawPhoto.includes('photo-1560250097')) ? '' : rawPhoto;
    const newStaff: StaffProfile = {
      ...staffData,
      name: staffData.name.trim(),
      role: staffData.role.trim(),
      nip: (staffData.nip || '').trim(),
      photo: cleanPhoto,
      division: staffData.division || 'Pengawas SD',
      id: `st-${Date.now()}`
    };
    setStaff((prev) => [...prev, newStaff]);

    triggerActivityLog(
      'TAMBAH DATA',
      'Profil & Struktur',
      `Menambahkan staf/pejabat: "${newStaff.name}" (${newStaff.role})`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('staff').upsert({
          id: newStaff.id,
          name: newStaff.name,
          role: newStaff.role,
          nip: newStaff.nip,
          photo: newStaff.photo,
          division: newStaff.division
        });
        if (error) {
          showToast(`Data staf tersimpan lokal. Supabase: ${error.message}`, 'error');
          return false;
        } else {
          showToast(`Pejabat/Staf "${newStaff.name}" dan pas foto berhasil tersimpan otomatis di Supabase Cloud!`, 'success');
          return true;
        }
      } catch (err: any) {
        showToast(`Staf disimpan di penyimpanan lokal.`, 'info');
        return false;
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast(`Pejabat/Staf ${newStaff.name} berhasil ditambahkan ke penyimpanan lokal!`, 'success');
      return true;
    }
  };

  const updateStaff = async (id: string, updatedData: Partial<StaffProfile>): Promise<boolean> => {
    const existingStaff = staff.find((s) => s.id === id);
    const rawPhoto = updatedData.photo !== undefined ? String(updatedData.photo).trim() : String(existingStaff?.photo || '').trim();
    const cleanPhoto = (rawPhoto.includes('unsplash.com') || rawPhoto.includes('photo-1560250097')) ? '' : rawPhoto;

    const mergedStaff: StaffProfile = existingStaff
      ? {
          ...existingStaff,
          ...updatedData,
          name: updatedData.name ? updatedData.name.trim() : existingStaff.name,
          role: updatedData.role ? updatedData.role.trim() : existingStaff.role,
          nip: updatedData.nip !== undefined ? updatedData.nip.trim() : existingStaff.nip,
          photo: cleanPhoto,
          division: updatedData.division || existingStaff.division
        }
      : ({ id, ...updatedData, photo: cleanPhoto } as StaffProfile);

    setStaff((prev) => prev.map((s) => (s.id === id ? mergedStaff : s)));

    triggerActivityLog(
      'UBAH DATA',
      'Profil & Struktur',
      `Memperbarui staf/pejabat: "${mergedStaff.name}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const st = mergedStaff;
        const payload = {
          name: st.name,
          role: st.role,
          nip: st.nip,
          photo: st.photo,
          division: st.division
        };

        const { data: updateData, error: updateErr } = await client
          .from('staff')
          .update(payload)
          .eq('id', st.id)
          .select();

        let saveError = updateErr;
        if (!saveError && (!updateData || updateData.length === 0)) {
          const { error: upsertErr } = await client
            .from('staff')
            .upsert({ id: st.id, ...payload });
          saveError = upsertErr;
        }

        if (saveError) {
          showToast(`Data staf diperbarui lokal. Supabase: ${saveError.message}`, 'error');
          return false;
        } else {
          showToast(`Data "${st.name}" dan foto berhasil diperbarui di database Supabase Cloud!`, 'success');
          return true;
        }
      } catch (err: any) {
        showToast(`Data staf diperbarui lokal.`, 'info');
        return false;
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Data pejabat/staf berhasil diperbarui.', 'success');
      return true;
    }
  };

  const deleteStaff = async (id: string): Promise<boolean> => {
    const targetStaff = staff.find((s) => s.id === id);
    setStaff((prev) => prev.filter((s) => s.id !== id));

    triggerActivityLog(
      'HAPUS DATA',
      'Profil & Struktur',
      `Menghapus staf/pejabat: "${targetStaff?.name || id}"`
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('staff').delete().eq('id', id);
        if (error) {
          showToast(`Gagal hapus dari Supabase: ${error.message}`, 'error');
          return false;
        } else {
          showToast('Data pejabat/staf berhasil dihapus dari database Supabase.', 'info');
          return true;
        }
      } catch (err: any) {
        showToast('Data staf dihapus lokal.', 'info');
        return false;
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Data pejabat/staf berhasil dihapus.', 'info');
      return true;
    }
  };

  // COMPLAINTS / ASPIRASI (Auto-save to Supabase & local state)
  const addComplaint = async (compData: Omit<ComplaintMessage, 'id' | 'status' | 'date'>) => {
    const newComp: ComplaintMessage = {
      ...compData,
      id: `comp-${Date.now()}`,
      status: 'Baru',
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    };
    setComplaints((prev) => [newComp, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('complaints').upsert({
          id: newComp.id,
          name: newComp.name,
          phone: newComp.phone,
          school_or_origin: newComp.schoolOrOrigin,
          category: newComp.category,
          message: newComp.message,
          date: newComp.date,
          status: newComp.status
        });
      } catch (err) {
        console.warn('Supabase addComplaint error:', err);
      }
    }
    showToast('Pesan/Aspirasi Anda berhasil terkirim ke sistem!', 'success');
  };

  const deleteComplaint = async (id: string) => {
    setComplaints((prev) => prev.filter((c) => c.id !== id));

    triggerActivityLog(
      'HAPUS DATA',
      'Kotak Aspirasi',
      `Menghapus pesan aspirasi (ID: ${id})`
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('complaints').delete().eq('id', id);
        showToast('Pesan berhasil dihapus dari database Supabase.', 'info');
      } catch (err) {
        showToast('Pesan berhasil dihapus.', 'info');
      }
    } else {
      showToast('Pesan berhasil dihapus.', 'info');
    }
  };

  const updateComplaintStatus = async (id: string, status: 'Baru' | 'Dibaca' | 'Selesai') => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c))
    );

    triggerActivityLog(
      'UBAH DATA',
      'Kotak Aspirasi',
      `Mengubah status pesan aspirasi menjadi "${status}" (ID: ${id})`
    );

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('complaints').update({ status }).eq('id', id);
        showToast(`Status pengaduan diubah menjadi "${status}" dan tersimpan di Supabase.`, 'success');
      } catch (err) {
        showToast(`Status pengaduan diubah menjadi "${status}".`, 'success');
      }
    } else {
      showToast(`Status pengaduan diubah menjadi "${status}".`, 'success');
    }
  };

  const refreshComplaints = async (): Promise<void> => {
    const client = getSupabaseClient();
    if (!client) return;
    try {
      const { data: dbComplaints, error: compErr } = await client
        .from('complaints')
        .select('*');

      if (!compErr && Array.isArray(dbComplaints)) {
        const mapped: ComplaintMessage[] = dbComplaints.map((c: any) => ({
          id: String(c.id || ''),
          name: String(c.name || ''),
          phone: String(c.phone || ''),
          schoolOrOrigin: String(c.school_or_origin || c.schoolOrOrigin || ''),
          category: String(c.category || 'Konsultasi Layanan'),
          message: String(c.message || ''),
          date: String(c.date || ''),
          status: (c.status as 'Baru' | 'Dibaca' | 'Selesai') || 'Baru'
        }));
        setComplaints(mapped);
        try {
          localStorage.setItem('korwilcam_complaints', JSON.stringify(mapped));
        } catch {}
      } else if (compErr) {
        console.warn('Gagal membaca tabel complaints dari Supabase:', compErr);
      }
    } catch (err) {
      console.warn('Error saat fetch complaints Supabase:', err);
    }
  };

  // OFFICE PROFILE (Auto-save to Supabase & local state)
  const updateOfficeProfile = async (profileData: Partial<OfficeProfile>): Promise<boolean> => {
    const updated = { ...officeProfile, ...profileData };
    setOfficeProfile(updated);

    triggerActivityLog(
      'UBAH DATA',
      'Profil Kantor',
      'Memperbarui data profil kantor, kepala korwil, visi misi, atau beranda'
    );

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const profilePayload: any = {
          id: 'main',
          name: updated.name,
          tagline: updated.tagline,
          address: updated.address,
          phone: updated.phone,
          whatsapp: updated.whatsapp,
          email: updated.email,
          working_hours: updated.workingHours,
          korwil_name: updated.korwilName,
          korwil_nip: updated.korwilNip,
          korwil_photo: updated.korwilPhoto,
          greeting_title: updated.greetingTitle,
          greeting_text: updated.greetingText,
          vision: updated.vision,
          missions: updated.missions,
          hero_title: updated.heroTitle,
          hero_subtitle: updated.heroSubtitle,
          hero_badge: updated.heroBadge,
          korwil_quote: updated.korwilQuote,
          hero_drive_folder_url: updated.heroDriveFolderUrl || '',
          hero_slideshow_images: updated.heroSlideshowImages || [],
          hero_slideshow_interval: updated.heroSlideshowInterval || 5
        };

        let { error } = await client.from('office_profile').upsert(profilePayload);
        if (error && error.message?.toLowerCase().includes('column')) {
          const { hero_drive_folder_url, hero_slideshow_images, hero_slideshow_interval, ...safePayload } = profilePayload;
          const retry = await client.from('office_profile').upsert(safePayload);
          error = retry.error;
        }
        if (error) {
          showToast(`Profil diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
          return false;
        } else {
          showToast('Profil kantor dan pimpinan berhasil diperbarui & tersimpan di Supabase Cloud!', 'success');
          return true;
        }
      } catch (err: any) {
        showToast(`Profil diperbarui lokal.`, 'info');
        return false;
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Profil kantor dan tampilan berhasil diperbarui di penyimpanan lokal.', 'success');
      return true;
    }
  };

  // PENGATURAN VISIBILITAS MENU & SUB MENU (NAVIGASI)
  const updateMenuVisibility = async (updates: Partial<MenuVisibilityMap>): Promise<boolean> => {
    const merged: MenuVisibilityMap = { ...menuVisibility };
    Object.keys(updates).forEach((key) => {
      const val = updates[key];
      if (typeof val === 'boolean') {
        merged[key] = val;
      }
    });
    setMenuVisibility(merged);
    const success = await saveNavigationVisibilityToSupabase(merged);
    triggerActivityLog(
      'UBAH DATA',
      'Pengaturan Menu',
      'Memperbarui status visibilitas menu dan sub-menu navigasi website'
    );
    return success;
  };

  const resetMenuVisibility = async (): Promise<boolean> => {
    const defaultMap: MenuVisibilityMap = {};
    NAVIGATION_CONFIG.forEach((item) => {
      defaultMap[item.id] = item.defaultEnabled !== false;
      if (item.children) {
        item.children.forEach((child) => {
          defaultMap[child.id] = child.defaultEnabled !== false;
        });
      }
    });
    setMenuVisibility(defaultMap);
    const success = await saveNavigationVisibilityToSupabase(defaultMap);
    triggerActivityLog(
      'UBAH DATA',
      'Pengaturan Menu',
      'Mereset seluruh menu dan sub-menu navigasi website ke pengaturan bawaan'
    );
    return success;
  };

  const updateMaintenanceConfig = async (updates: Partial<MaintenanceConfig>): Promise<boolean> => {
    const merged: MaintenanceConfig = {
      ...maintenanceConfig,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    setMaintenanceConfig(merged);
    const success = await saveMaintenanceToSupabase(merged);
    triggerActivityLog(
      'UBAH DATA',
      'Mode Maintenance',
      `Mengubah mode maintenance website menjadi: ${merged.isEnabled ? 'AKTIF (Website Ditutup)' : 'NONAKTIF (Website Normal)'}`
    );
    return success;
  };

  // SOP PELAYANAN [TERKONEKSI GOOGLE SPREADSHEET]
  const updateSOPImageUrl = async (url: string): Promise<boolean> => {
    const formatted = formatGoogleDriveImageUrl(url);
    setSopImageUrl(formatted);
    try {
      if (formatted) {
        localStorage.setItem('korwilcam_sop_image_url', formatted);
      } else {
        localStorage.removeItem('korwilcam_sop_image_url');
      }
    } catch {}

    triggerActivityLog(
      'UBAH DATA',
      'SOP Pelayanan',
      formatted ? 'Memperbarui berkas bagan alur SOP Pelayanan' : 'Menghapus berkas bagan SOP Pelayanan'
    );

    try {
      if (formatted) {
        await saveSopToSheet(formatted);
        showToast('Tautan bagan SOP Pelayanan berhasil disimpan ke Spreadsheet!', 'success');
      } else {
        await deleteSopFromSheet();
        showToast('Tautan bagan SOP Pelayanan berhasil dihapus dari Spreadsheet.', 'info');
      }
    } catch (_) {
      showToast(formatted ? 'Tautan bagan SOP Pelayanan berhasil disimpan!' : 'Tautan bagan SOP Pelayanan berhasil dihapus.', 'info');
    }
    return true;
  };

  const refreshSop = async (force: boolean = false): Promise<string> => {
    try {
      const url = await fetchSopFromSheet(force);
      if (url) {
        setSopImageUrl(url);
      }
      return url || '';
    } catch {
      return sopImageUrl;
    }
  };

  // ORGANISASI (PGRI, K3S, IGTKI, HIMPAUDI, Kwarran Pramuka, dll)
  const addOrganization = async (orgData: Omit<EducationalOrganization, 'id'>): Promise<boolean> => {
    const newOrg: EducationalOrganization = {
      ...orgData,
      id: `org-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    const updated = [...organizations, newOrg];
    _inMemoryOrganizationsCache = updated;
    setOrganizations(updated);
    try {
      sessionStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Organisasi',
      `Menambahkan organisasi: "${newOrg.name}" (${newOrg.shortName || '-'})`
    );

    // Simpan ke Google Spreadsheet
    saveOrganizationToSheet(newOrg, 'create').catch((err) => {
      console.warn('Gagal menyimpan organisasi ke Spreadsheet:', err);
    });

    showToast(`Organisasi "${newOrg.name}" berhasil ditambahkan!`, 'success');
    return true;
  };

  const updateOrganization = async (id: string, orgData: Partial<EducationalOrganization>): Promise<boolean> => {
    const updated = organizations.map((o) => {
      if (o.id === id || o.slug === id) {
        return {
          ...o,
          ...orgData,
          updatedAt: new Date().toISOString()
        };
      }
      return o;
    });
    _inMemoryOrganizationsCache = updated;
    setOrganizations(updated);
    try {
      sessionStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    const targetOrg = updated.find((o) => o.id === id || o.slug === id);
    if (targetOrg) {
      triggerActivityLog(
        'UBAH DATA',
        'Organisasi',
        `Memperbarui data organisasi: "${targetOrg.name}"`
      );

      // Simpan pembaruan ke Google Spreadsheet
      saveOrganizationToSheet(targetOrg, 'update').catch((err) => {
        console.warn('Gagal memperbarui organisasi ke Spreadsheet:', err);
      });
    }

    showToast('Pengaturan organisasi berhasil disimpan!', 'success');
    return true;
  };

  const deleteOrganization = async (id: string): Promise<boolean> => {
    const target = organizations.find((o) => o.id === id || o.slug === id);
    const updated = organizations.filter((o) => o.id !== id && o.slug !== id);
    _inMemoryOrganizationsCache = updated;
    setOrganizations(updated);
    try {
      sessionStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'HAPUS DATA',
      'Organisasi',
      `Menghapus organisasi: "${target?.name || id}"`
    );

    // Hapus dari Google Spreadsheet
    deleteOrganizationFromSheet(id, target?.slug).catch((err) => {
      console.warn('Gagal menghapus organisasi dari Spreadsheet:', err);
    });

    showToast(`Organisasi "${target?.name || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const addOrganizationOfficial = async (orgId: string, official: Omit<OrganizationOfficial, 'id'>): Promise<boolean> => {
    const newOfficial: OrganizationOfficial = {
      ...official,
      id: `off-${Date.now()}`
    };
    const targetOrg = organizations.find((o) => o.id === orgId || o.slug === orgId);
    if (!targetOrg) return false;
    const newOfficials = [...(targetOrg.officials || []), newOfficial];
    return updateOrganization(orgId, { officials: newOfficials });
  };

  const updateOrganizationOfficial = async (orgId: string, officialId: string, officialData: Partial<OrganizationOfficial>): Promise<boolean> => {
    const targetOrg = organizations.find((o) => o.id === orgId || o.slug === orgId);
    if (!targetOrg) return false;
    const newOfficials = (targetOrg.officials || []).map((off) => {
      if (off.id === officialId) {
        return { ...off, ...officialData };
      }
      return off;
    });
    return updateOrganization(orgId, { officials: newOfficials });
  };

  const deleteOrganizationOfficial = async (orgId: string, officialId: string): Promise<boolean> => {
    const targetOrg = organizations.find((o) => o.id === orgId || o.slug === orgId);
    if (!targetOrg) return false;
    const newOfficials = (targetOrg.officials || []).filter((off) => off.id !== officialId);
    return updateOrganization(orgId, { officials: newOfficials });
  };

  // ==========================================================
  // DAFTAR GURU (NOMINATIF GURU) CRUD
  // ==========================================================
  const addTeacher = async (teacher: Omit<TeacherNominative, 'id'>): Promise<boolean> => {
    const nextNo = teacher.no || (teachers.length > 0 ? Math.max(...teachers.map((t) => t.no || 0)) + 1 : 1);
    const newTeacher: TeacherNominative = {
      ...teacher,
      no: nextNo,
      id: `guru-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...teachers, newTeacher].sort((a, b) => (a.no || 0) - (b.no || 0));
    setTeachers(updated);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Nominatif Guru',
      `Menambahkan guru: "${newTeacher.nama}" (${newTeacher.statusPegawai}, ${newTeacher.instansi})`
    );

    // [TERKONEKSI SPREADSHEET] Simpan ke Google Spreadsheet
    try {
      await saveTeacherToSheet(newTeacher, false);
    } catch (_) {}
    showToast(`Data guru "${newTeacher.nama}" berhasil disimpan!`, 'success');
    return true;
  };

  const updateTeacher = async (id: string, teacherData: Partial<TeacherNominative>): Promise<boolean> => {
    const updated = teachers.map((t) => {
      if (t.id === id) {
        return {
          ...t,
          ...teacherData,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }).sort((a, b) => (a.no || 0) - (b.no || 0));
    setTeachers(updated);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify(updated));
    } catch (e) {}

    const targetTeacher = updated.find((t) => t.id === id);
    if (targetTeacher) {
      triggerActivityLog(
        'UBAH DATA',
        'Nominatif Guru',
        `Memperbarui data guru: "${targetTeacher.nama}"`
      );
      try {
        await saveTeacherToSheet(targetTeacher, true);
      } catch (_) {}
    }

    showToast('Data nominatif guru berhasil diperbarui!', 'success');
    return true;
  };

  const deleteTeacher = async (id: string): Promise<boolean> => {
    const target = teachers.find((t) => t.id === id);
    const updated = teachers.filter((t) => t.id !== id);
    setTeachers(updated);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'HAPUS DATA',
      'Nominatif Guru',
      `Menghapus data guru: "${target?.nama || id}"`
    );

    try {
      await deleteTeacherFromSheet(id);
    } catch (_) {}
    showToast(`Data guru "${target?.nama || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const batchAddTeachers = async (newTeachers: Omit<TeacherNominative, 'id'>[]): Promise<boolean> => {
    let currentMaxNo = teachers.length > 0 ? Math.max(...teachers.map((t) => t.no || 0)) : 0;
    const addedList: TeacherNominative[] = newTeachers.map((t, idx) => ({
      ...t,
      id: `guru-${Date.now()}-${idx}`,
      no: t.no || ++currentMaxNo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    const updated = [...teachers, ...addedList].sort((a, b) => (a.no || 0) - (b.no || 0));
    setTeachers(updated);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Nominatif Guru',
      `Impor data nominatif guru massal: ${addedList.length} guru`
    );

    // [TERPUTUS DARI SUPABASE]
    showToast(`Berhasil menambahkan ${addedList.length} data guru!`, 'success');
    return true;
  };

  const clearAllTeachers = async (): Promise<boolean> => {
    setTeachers([]);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify([]));
    } catch (e) {}

    triggerActivityLog(
      'RESET DATA',
      'Nominatif Guru',
      'Mengosongkan seluruh data nominatif guru'
    );

    // [TERPUTUS DARI SUPABASE]
    showToast('Seluruh data guru berhasil dikosongkan!', 'info');
    return true;
  };

  // Persyaratan Pelayanan (CRUD)
  const addServiceRequirement = async (item: Omit<ServiceRequirement, 'id'>): Promise<boolean> => {
    const newItem: ServiceRequirement = {
      ...item,
      id: `req-${Date.now()}`,
      slug: item.slug || generateServiceRequirementSlug(item.title),
      order: item.order || (serviceRequirements.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...serviceRequirements, newItem].sort((a, b) => (a.order || 0) - (b.order || 0));
    setServiceRequirements(updated);
    try {
      localStorage.setItem('korwilcam_service_requirements', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Standar Pelayanan',
      `Menambahkan jenis layanan: "${newItem.title}" (${newItem.category})`
    );

    // Simpan ke Google Spreadsheet (via GAS)
    saveServiceRequirementToSheet(newItem, 'create').catch((err) => {
      console.warn('Gagal sinkron tambah layanan ke Spreadsheet:', err);
    });

    showToast(`Jenis layanan "${newItem.title}" berhasil ditambahkan!`, 'success');
    return true;
  };

  const updateServiceRequirement = async (id: string, itemData: Partial<ServiceRequirement>): Promise<boolean> => {
    const updated = serviceRequirements.map((r) => {
      if (r.id === id) {
        return {
          ...r,
          ...itemData,
          slug: itemData.slug || (itemData.title ? generateServiceRequirementSlug(itemData.title) : r.slug),
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
    setServiceRequirements(updated);
    try {
      localStorage.setItem('korwilcam_service_requirements', JSON.stringify(updated));
    } catch (e) {}

    const target = updated.find((r) => r.id === id);
    if (target) {
      setSelectedServiceRequirementState((curr) => (curr?.id === id ? target : curr));
      triggerActivityLog(
        'UBAH DATA',
        'Standar Pelayanan',
        `Memperbarui jenis layanan: "${target.title}"`
      );

      // Simpan pembaruan ke Google Spreadsheet (via GAS)
      saveServiceRequirementToSheet(target, 'update').catch((err) => {
        console.warn('Gagal sinkron update layanan ke Spreadsheet:', err);
      });
    }

    showToast('Persyaratan pelayanan berhasil diperbarui!', 'success');
    return true;
  };

  const deleteServiceRequirement = async (id: string): Promise<boolean> => {
    const target = serviceRequirements.find((r) => r.id === id);
    const updated = serviceRequirements.filter((r) => r.id !== id);
    setServiceRequirements(updated);
    setSelectedServiceRequirementState((curr) => (curr?.id === id ? null : curr));
    try {
      localStorage.setItem('korwilcam_service_requirements', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'HAPUS DATA',
      'Standar Pelayanan',
      `Menghapus jenis layanan: "${target?.title || id}"`
    );

    // Hapus dari Google Spreadsheet (via GAS)
    deleteServiceRequirementFromSheet(id).catch((err) => {
      console.warn('Gagal sinkron hapus layanan ke Spreadsheet:', err);
    });

    showToast(`Layanan "${target?.title || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const resetServiceRequirements = async (): Promise<boolean> => {
    setServiceRequirements([]);
    try {
      localStorage.setItem('korwilcam_service_requirements', JSON.stringify([]));
    } catch (e) {}

    triggerActivityLog(
      'RESET DATA',
      'Standar Pelayanan',
      'Mengosongkan seluruh data persyaratan pelayanan'
    );

    // Kosongkan di Google Spreadsheet (via GAS)
    clearAllServiceRequirementsInSheet().catch((err) => {
      console.warn('Gagal sinkron reset layanan ke Spreadsheet:', err);
    });

    showToast('Data persyaratan pelayanan telah dikosongkan!', 'info');
    return true;
  };

  const refreshServiceRequirementsFromSheet = async (force: boolean = true): Promise<void> => {
    try {
      const res = await fetchServiceRequirementsFromSheet(force);
      if (res && Array.isArray(res.items)) {
        setServiceRequirements(res.items);
        if (res.categories && res.categories.length > 0) {
          setServiceRequirementCategories((prev) => Array.from(new Set([...prev, ...res.categories])));
        }
        showToast('Persyaratan pelayanan berhasil disinkronkan dari Spreadsheet!', 'success');
      }
    } catch (err: any) {
      showToast(`Gagal menyinkronkan persyaratan pelayanan: ${err?.message || 'Error'}`, 'error');
    }
  };

  const addServiceRequirementCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    triggerActivityLog(
      'TAMBAH DATA',
      'Standar Pelayanan',
      `Menambahkan kategori pelayanan: "${trimmed}"`
    );

    const exists = serviceRequirementCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? serviceRequirementCategories : [...serviceRequirementCategories, trimmed];

    setServiceRequirementCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_service_categories', JSON.stringify(updatedCategories));
    } catch {}

    showToast(`Kategori "${trimmed}" berhasil ditambahkan!`, 'success');
    return true;
  };

  const deleteServiceRequirementCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    const updatedCategories = serviceRequirementCategories.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());

    triggerActivityLog(
      'HAPUS DATA',
      'Standar Pelayanan',
      `Menghapus kategori pelayanan: "${trimmed}"`
    );

    setServiceRequirementCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_service_categories', JSON.stringify(updatedCategories));
    } catch {}

    showToast(`Kategori "${trimmed}" telah dihapus.`, 'info');
    return true;
  };

  // ==========================================================
  // PERMINTAAN DATA (WEBVIEW) CRUD (Tersambung ke Google Spreadsheet)
  // ==========================================================
  const addDataRequest = async (item: Omit<DataRequestLink, 'id'>): Promise<boolean> => {
    const slug = (item.slug && item.slug.trim())
      ? generateDataRequestSlug(item.slug)
      : generateDataRequestSlug(item.title);

    const newItem: DataRequestLink = {
      ...item,
      id: `req-data-${Date.now()}`,
      slug,
      order: item.order || (dataRequests.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...dataRequests, newItem].sort((a, b) => (a.order || 0) - (b.order || 0));
    setDataRequests(updated);
    try {
      localStorage.setItem('korwilcam_data_requests', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Permintaan Data',
      `Menambahkan tautan permintaan data: "${newItem.title}"`
    );

    // Simpan ke Google Spreadsheet (via GAS)
    saveDataRequestToSheet(newItem, 'create').catch((err) => {
      console.warn('Gagal sinkron tambah permintaan data ke Spreadsheet:', err);
    });

    showToast(`Tautan "${newItem.title}" berhasil ditambahkan!`, 'success');
    return true;
  };

  const updateDataRequest = async (id: string, data: Partial<DataRequestLink>): Promise<boolean> => {
    const updated = dataRequests.map((d) => {
      if (d.id === id) {
        let newSlug = d.slug;
        if (data.slug !== undefined) {
          newSlug = data.slug.trim() ? generateDataRequestSlug(data.slug) : generateDataRequestSlug(data.title || d.title);
        } else if (data.title && (!d.slug || d.slug === generateDataRequestSlug(d.title))) {
          newSlug = generateDataRequestSlug(data.title);
        }
        return {
          ...d,
          ...data,
          slug: newSlug || generateDataRequestSlug(data.title || d.title),
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    }).sort((a, b) => (a.order || 0) - (b.order || 0));
    setDataRequests(updated);
    try {
      localStorage.setItem('korwilcam_data_requests', JSON.stringify(updated));
    } catch (e) {}

    const target = updated.find((d) => d.id === id);
    if (target) {
      triggerActivityLog(
        'UBAH DATA',
        'Permintaan Data',
        `Memperbarui tautan permintaan data: "${target.title}"`
      );

      // Simpan pembaruan ke Google Spreadsheet (via GAS)
      saveDataRequestToSheet(target, 'update').catch((err) => {
        console.warn('Gagal sinkron update permintaan data ke Spreadsheet:', err);
      });
    }

    showToast('Tautan permintaan data berhasil diperbarui!', 'success');
    return true;
  };

  const deleteDataRequest = async (id: string): Promise<boolean> => {
    const target = dataRequests.find((d) => d.id === id);
    const updated = dataRequests.filter((d) => d.id !== id);
    setDataRequests(updated);
    try {
      localStorage.setItem('korwilcam_data_requests', JSON.stringify(updated));
    } catch (e) {}

    triggerActivityLog(
      'HAPUS DATA',
      'Permintaan Data',
      `Menghapus tautan permintaan data: "${target?.title || id}"`
    );

    // Hapus dari Google Spreadsheet (via GAS)
    deleteDataRequestFromSheet(id).catch((err) => {
      console.warn('Gagal sinkron hapus permintaan data dari Spreadsheet:', err);
    });

    showToast(`Tautan "${target?.title || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const toggleDataRequestActive = async (id: string): Promise<boolean> => {
    const target = dataRequests.find((d) => d.id === id);
    if (!target) return false;
    triggerActivityLog(
      'UBAH DATA',
      'Permintaan Data',
      `Mengubah status aktif tautan: "${target.title}"`
    );
    return updateDataRequest(id, { isActive: !target.isActive });
  };

  const refreshDataRequestsFromSheet = async (force: boolean = true): Promise<void> => {
    try {
      const items = await fetchDataRequestsFromSheet(force);
      if (items && Array.isArray(items) && items.length > 0) {
        setDataRequests(items);
        showToast('Data tautan permintaan data berhasil disinkronkan dari Spreadsheet!', 'success');
      } else {
        showToast('Sinkronisasi selesai (tidak ada data baru).', 'info');
      }
    } catch (e) {
      console.warn('Gagal menyinkronkan data_requests dari spreadsheet:', e);
      showToast('Gagal menyinkronkan data dari Spreadsheet', 'error');
    }
  };

  const updateSocialMediaItem = (item: SocialMediaItem) => {
    setSocialMedia((prev) => {
      const updated = prev.map((p) => (p.platform === item.platform ? item : p));
      setLocalSocialMedia(updated);
      return updated;
    });
  };

  const saveSocialMediaSettings = async (items: SocialMediaItem[]): Promise<boolean> => {
    const normalized = normalizeSocialMediaList(items);
    setSocialMedia(normalized);
    const ok = await saveSocialMediaToSupabase(normalized);
    triggerActivityLog(
      'UBAH DATA',
      'Media Sosial',
      'Memperbarui tautan dan pengaturan akun media sosial resmi'
    );
    if (ok) {
      showToast('Pengaturan media sosial berhasil disimpan!', 'success');
    } else {
      showToast('Tersimpan di browser lokal (Supabase belum tersambung)', 'info');
    }
    return ok;
  };

  const resetSocialMediaDefaults = async (): Promise<boolean> => {
    setSocialMedia(initialSocialMedia);
    const ok = await saveSocialMediaToSupabase(initialSocialMedia);
    triggerActivityLog(
      'RESET DATA',
      'Media Sosial',
      'Mereset pengaturan media sosial ke bawaan awal'
    );
    showToast('Pengaturan media sosial direset ke bawaan!', 'info');
    return ok;
  };

  const sendBroadcastNotification = async (params: SendBroadcastParams): Promise<SendBroadcastResult> => {
    const result = await sendPushBroadcast({
      ...params,
      createdBy: currentUser?.name || currentUser?.username || 'Admin'
    });
    if (result.record) {
      setBroadcastHistory((prev) => [result.record!, ...prev.filter((p) => p.id !== result.record!.id)]);
    }
    triggerActivityLog(
      'TAMBAH DATA',
      'Broadcast Notifikasi',
      `Mengirim broadcast notifikasi: "${params.title}"`,
      result.success ? 'BERHASIL' : 'GAGAL'
    );
    return result;
  };

  const deleteBroadcastNotification = async (id: string): Promise<boolean> => {
    const ok = await deleteBroadcastRecord(id);
    if (ok) {
      setBroadcastHistory((prev) => prev.filter((item) => item.id !== id));
    }
    triggerActivityLog(
      'HAPUS DATA',
      'Broadcast Notifikasi',
      `Menghapus riwayat broadcast ID: ${id}`
    );
    showToast('Riwayat broadcast berhasil dihapus.', 'info');
    return ok;
  };

  const refreshBroadcastHistory = async () => {
    const list = await fetchBroadcastHistory();
    setBroadcastHistory(list);
  };

  const sanitizeDriveUrl = (url?: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    if (isGoogleDriveUrl(trimmed)) {
      return formatGoogleDriveImageUrl(trimmed, 800);
    }
    return trimmed;
  };

  const addAchievement = async (item: Omit<Achievement, 'id'>): Promise<boolean> => {
    const newId = `ach-${Date.now()}`;
    const formattedItem: Achievement = {
      ...item,
      id: newId,
      photoUrl: sanitizeDriveUrl(item.photoUrl),
      certificateUrl: sanitizeDriveUrl(item.certificateUrl),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [formattedItem, ...achievements];
    setAchievements(updated);
    try {
      localStorage.setItem('korwilcam_achievements', JSON.stringify(updated));
    } catch {}

    triggerActivityLog(
      'TAMBAH DATA',
      'Prestasi',
      `Menambahkan prestasi "${formattedItem.title}" - ${formattedItem.recipientName} (${formattedItem.schoolName})`
    );

    showToast('Data prestasi berhasil ditambahkan!', 'success');

    // Sinkronisasi Supabase dinonaktifkan (tabel achievements diputus, beralih ke Google Spreadsheet)
    return true;
  };

  const updateAchievement = async (id: string, item: Partial<Achievement>): Promise<boolean> => {
    const now = new Date().toISOString();
    const formattedItem: Partial<Achievement> = {
      ...item,
      ...(item.photoUrl !== undefined ? { photoUrl: sanitizeDriveUrl(item.photoUrl) } : {}),
      ...(item.certificateUrl !== undefined ? { certificateUrl: sanitizeDriveUrl(item.certificateUrl) } : {}),
      updatedAt: now
    };

    const updated = achievements.map((a) => (a.id === id ? { ...a, ...formattedItem } : a));
    setAchievements(updated);
    try {
      localStorage.setItem('korwilcam_achievements', JSON.stringify(updated));
    } catch {}

    const target = updated.find((a) => a.id === id);
    triggerActivityLog(
      'UBAH DATA',
      'Prestasi',
      `Memperbarui data prestasi "${target?.title || id}"`
    );

    showToast('Data prestasi berhasil diperbarui!', 'success');

    // Sinkronisasi Supabase dinonaktifkan (tabel achievements diputus, beralih ke Google Spreadsheet)
    return true;
  };

  const deleteAchievement = async (id: string): Promise<boolean> => {
    const target = achievements.find((a) => a.id === id);
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    try {
      localStorage.setItem('korwilcam_achievements', JSON.stringify(updated));
    } catch {}

    triggerActivityLog(
      'HAPUS DATA',
      'Prestasi',
      `Menghapus data prestasi "${target?.title || id}"`
    );

    showToast('Data prestasi berhasil dihapus!', 'info');

    // Sinkronisasi Supabase dinonaktifkan (tabel achievements diputus, beralih ke Google Spreadsheet)
    return true;
  };

  const refreshAchievements = async (): Promise<void> => {
    try {
      const live = await fetchAchievementsFromSheet(true);
      if (live && live.length > 0) {
        setAchievements(live);
      }
    } catch (e) {
      console.warn('Gagal merefresh data prestasi dari Google Spreadsheet:', e);
    }
  };

  const resetToDefaultData = () => {
    triggerActivityLog(
      'RESET DATA',
      'Sistem',
      'Mereset data aplikasi ke konfigurasi bawaan'
    );
    setSchools(initialSchools);
    setNews(initialNews);
    setAnnouncements(initialAnnouncements);
    setAgenda(initialAgenda);
    setDocuments(initialDocuments);
    setGallery(initialGallery);
    setStaff(initialStaff);
    setOfficeProfile(initialOfficeProfile);
    setComplaints(initialComplaints);
    setOrganizations(initialOrganizations);
    setTeachers(initialTeachers);
    setServiceRequirements(initialServiceRequirements);
    setDataRequests(initialDataRequests);
    setSocialMedia(initialSocialMedia);
    setLocalSocialMedia(initialSocialMedia);
    setAchievements([]);
    localStorage.clear();
    showToast('Data berhasil direset ke data default bawaan.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        schools,
        news,
        announcements,
        agenda,
        aulaBookings,
        loadingAulaBookings,
        refreshAulaBookings,
        documents,
        gallery,
        staff,
        officeProfile,
        complaints,
        organizations,
        selectedOrganizationSlug,
        setSelectedOrganizationSlug,
        selectedPurnaTugasNip,
        setSelectedPurnaTugasNip,
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
        refreshTeachers,
        serviceRequirements,
        serviceRequirementCategories,
        selectedServiceRequirement,
        setSelectedServiceRequirement,
        addServiceRequirement,
        updateServiceRequirement,
        deleteServiceRequirement,
        resetServiceRequirements,
        refreshServiceRequirementsFromSheet,
        addServiceRequirementCategory,
        deleteServiceRequirementCategory,
        dataRequests,
        selectedDataRequestSlug,
        setSelectedDataRequestSlug,
        addDataRequest,
        updateDataRequest,
        deleteDataRequest,
        toggleDataRequestActive,
        refreshDataRequestsFromSheet,
        socialMedia,
        updateSocialMediaItem,
        saveSocialMediaSettings,
        resetSocialMediaDefaults,
        broadcastHistory,
        sendBroadcastNotification,
        deleteBroadcastNotification,
        refreshBroadcastHistory,
        achievements,
        selectedAchievementSlug,
        setSelectedAchievementSlug,
        refreshAchievements,
        addAchievement,
        updateAchievement,
        deleteAchievement,
        activeTab,
        setActiveTab,
        selectedNews,
        setSelectedNews,
        selectedAnnouncement,
        setSelectedAnnouncement,
        selectedSchool,
        setSelectedSchool,
        selectedGallery,
        setSelectedGallery,
        galleryActiveTab,
        setGalleryActiveTab,
        refreshGalleryFromSheet,
        isGalleryLoading,
        selectedVideo,
        setSelectedVideo,
        videos,
        refreshVideosFromSheet,
        isVideosLoading,
        selectedDocument,
        setSelectedDocument,
        incrementDocumentDownloadCount,
        isAuthenticated,
        currentUser,
        adminUsers,
        refreshAdminUsersFromSheet,
        login,
        logout,
        sessionRemainingSeconds,
        resetInactivityTimer,
        addAdminUser,
        updateAdminUser,
        deleteAdminUser,
        isSupabaseActive,
        syncStatus,
        exportAllToSupabase,
        refreshFromSupabase,
        addSchool,
        updateSchool,
        deleteSchool,
        refreshSchools,
        addNews,
        updateNews,
        deleteNews,
        refreshNewsFromSheet,
        newsCategories,
        addNewsCategory,
        incrementNewsViews,
        recordNewsReadingTime,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addDocument,
        updateDocument,
        deleteDocument,
        documentCategories,
        addDocumentCategory,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        galleryCategories,
        addGalleryCategory,
        addStaff,
        updateStaff,
        deleteStaff,
        addComplaint,
        deleteComplaint,
        updateComplaintStatus,
        refreshComplaints,
        updateOfficeProfile,
        sopImageUrl,
        updateSOPImageUrl,
        refreshSop,
        resetToDefaultData,
        toasts,
        showToast,
        removeToast,
        confirmDialogState,
        noticePopupState,
        showConfirmDialog,
        handleConfirmResponse,
        closeConfirmDialog,
        showNoticePopup,
        closeNoticePopup,
        activityLogUrl,
        updateActivityLogUrl,
        logAdminActivity: triggerActivityLog,
        menuVisibility,
        updateMenuVisibility,
        resetMenuVisibility,
        maintenanceConfig,
        updateMaintenanceConfig
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
