import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  DataRequestLink
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
  initialDataRequests
} from '../data/initialData';

import { getSupabaseClient, getSupabaseConfig, testSupabaseConnection, syncLocalConfigToServer } from '../lib/supabase';
import { fetchAulaAgendaFromSheet, FALLBACK_AULA_BOOKINGS, compareAgendaDatesDescending } from '../services/googleSheetService';
import { resolveNewsCandidates, resolveAnnouncementCandidates } from '../lib/shortLink';
import { normalizeToGoogleMapsUrl } from '../lib/coordinates';
import { getGallerySlug, compareGalleryItemsDescending, sortGalleryDescending } from '../lib/galleryHelper';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../lib/driveHelper';
import { getDocumentSlug, getDocumentDetailPath } from '../lib/documentHelper';
import { getServiceRequirementSlug, getServiceRequirementDetailPath, generateServiceRequirementSlug } from '../lib/serviceRequirementHelper';
import { generateDataRequestSlug, getDataRequestSlug, getDataRequestPath } from '../lib/dataRequestHelper';
import { stripHtml, generateSummary } from '../lib/stripHtml';

export const initialAdminUsers: AdminUser[] = [
  {
    id: 'usr-superadmin',
    username: 'superadmin',
    name: 'Super Administrator Korwilcam',
    role: 'Super Admin',
    email: 'superadmin@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-admin',
    username: 'admin',
    name: 'Administrator Web Korwilcam',
    role: 'Admin',
    email: 'admin@korwilcampurwodadi.sch.id',
    status: 'Aktif',
    createdAt: new Date().toISOString()
  },
  {
    id: 'usr-penulis',
    username: 'penulis',
    name: 'Penulis Berita & Warta',
    role: 'Penulis',
    email: 'penulis@korwilcampurwodadi.sch.id',
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
  selectedDocument: DocumentDownload | null;
  setSelectedDocument: (doc: DocumentDownload | null, customPath?: string) => void;
  incrementDocumentDownloadCount: (id: string) => Promise<void>;
  
  // Organisasi
  organizations: EducationalOrganization[];
  selectedOrganizationSlug: string | null;
  setSelectedOrganizationSlug: (slug: string | null, customPath?: string) => void;
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

  // Persyaratan Pelayanan
  serviceRequirements: ServiceRequirement[];
  serviceRequirementCategories: string[];
  selectedServiceRequirement: ServiceRequirement | null;
  setSelectedServiceRequirement: (item: ServiceRequirement | null, customPath?: string) => void;
  addServiceRequirement: (item: Omit<ServiceRequirement, 'id'>) => Promise<boolean>;
  updateServiceRequirement: (id: string, item: Partial<ServiceRequirement>) => Promise<boolean>;
  deleteServiceRequirement: (id: string) => Promise<boolean>;
  resetServiceRequirements: () => Promise<boolean>;
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
  
  // Auth & Roles
  isAuthenticated: boolean;
  currentUser: AdminUser | null;
  adminUsers: AdminUser[];
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => void;
  addAdminUser: (userData: Omit<AdminUser, 'id'>) => Promise<boolean>;
  updateAdminUser: (id: string, userData: Partial<AdminUser>) => Promise<boolean>;
  deleteAdminUser: (id: string) => Promise<boolean>;

  // Supabase status & operations
  isSupabaseActive: boolean;
  syncStatus: 'connected' | 'offline' | 'syncing';
  exportAllToSupabase: () => Promise<boolean>;
  refreshFromSupabase: () => Promise<boolean>;

  // CRUD actions
  addSchool: (school: Omit<School, 'id'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  addNews: (newsItem: Omit<NewsArticle, 'id'>) => void;
  updateNews: (id: string, newsItem: Partial<NewsArticle>) => void;
  deleteNews: (id: string) => void;
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

  updateOfficeProfile: (profile: Partial<OfficeProfile>) => Promise<boolean>;
  updateSOPImageUrl: (url: string) => Promise<boolean>;
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
    const saved = localStorage.getItem('korwilcam_schools');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
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
    return isDbConfigured ? [] : initialSchools;
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
    const initial = isDbConfigured ? [] : initialNews;
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
    if (_inMemoryAnnouncementsCache && _inMemoryAnnouncementsCache.length > 0) {
      return _inMemoryAnnouncementsCache;
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_announcements');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryAnnouncementsCache = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    try {
      const saved = localStorage.getItem('korwilcam_announcements');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryAnnouncementsCache = parsed;
          return parsed;
        }
      }
    } catch (_) {}
    const initial = isDbConfigured ? [] : initialAnnouncements;
    _inMemoryAnnouncementsCache = initial;
    return initial;
  });

  const [agenda, setAgenda] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem('korwilcam_agenda');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialAgenda);
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
    if (_inMemoryDocumentsCache && _inMemoryDocumentsCache.length > 0) {
      return _inMemoryDocumentsCache;
    }
    const sessionSaved = sessionStorage.getItem('korwilcam_documents');
    if (sessionSaved) {
      try {
        const parsed: DocumentDownload[] = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          _inMemoryDocumentsCache = parsed;
          return parsed;
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
          const filtered = parsed.filter((d) => {
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
    return isDbConfigured ? [] : initialDocuments;
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
    if (_inMemoryGalleryCache && _inMemoryGalleryCache.length > 0) {
      return _inMemoryGalleryCache;
    }
    try {
      const sessionSaved = sessionStorage.getItem('korwilcam_gallery');
      if (sessionSaved) {
        const parsed = JSON.parse(sessionSaved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sorted = sortGalleryDescending(parsed);
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
          const sorted = sortGalleryDescending(parsed);
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
    const saved = localStorage.getItem('korwilcam_complaints');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialComplaints);
  });

  const [sopImageUrl, setSopImageUrl] = useState<string>(() => {
    return localStorage.getItem('korwilcam_sop_image_url') || '';
  });

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [selectedNews, setSelectedNewsState] = useState<NewsArticle | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncementState] = useState<Announcement | null>(null);
  const [selectedSchool, setSelectedSchoolState] = useState<School | null>(null);
  const [selectedGallery, setSelectedGalleryState] = useState<GalleryItem | null>(null);
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
        if (Array.isArray(parsed)) return parsed;
      }
      return initialDataRequests;
    } catch {
      return initialDataRequests;
    }
  });

  const [selectedDataRequestSlug, setSelectedDataRequestSlug] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_current_user');
      if (saved) return JSON.parse(saved);
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const hasAuth = localStorage.getItem('korwilcam_admin_auth') === 'true';
    const hasUser = Boolean(localStorage.getItem('korwilcam_current_user'));
    return hasAuth && hasUser;
  });

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

  // Supabase state
  const [isSupabaseActive, setIsSupabaseActive] = useState<boolean>(() => {
    return getSupabaseConfig().isConfigured;
  });
  const [syncStatus, setSyncStatus] = useState<'connected' | 'offline' | 'syncing'>(() => {
    return getSupabaseConfig().isConfigured ? 'connected' : 'offline';
  });

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_admin_users', JSON.stringify(adminUsers));
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

  // Initial fetch from Supabase if connected
  const refreshFromSupabase = async (): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!client) {
      setSyncStatus('offline');
      setIsSupabaseActive(false);
      return false;
    }

    try {
      setSyncStatus('syncing');

      // 0. Fetch daftar_guru IMMEDIATELY IN PARALLEL (Nominatif Guru)
      // Supaya nominatif langsung tampil cepat tanpa harus menunggu 11 tabel lainnya selesai secara berurutan!
      const teachersFetchPromise = (async () => {
        try {
          const { data: dbTeachers, error: teachErr } = await client
            .from('daftar_guru')
            .select('*')
            .order('no', { ascending: true });
          if (!teachErr && Array.isArray(dbTeachers)) {
            const mappedTeachers: TeacherNominative[] = dbTeachers.map((t: any, index: number) => ({
              id: String(t.id || `guru-${Date.now()}-${index}`),
              no: typeof t.no === 'number' ? t.no : (parseInt(t.no, 10) || index + 1),
              nama: String(t.nama || '').trim(),
              nip: String(t.nip || '-').trim(),
              statusPegawai: String(t.status_pegawai || t.statusPegawai || 'PNS').trim(),
              instansi: String(t.instansi || '').trim(),
              createdAt: t.created_at || t.createdAt,
              updatedAt: t.updated_at || t.updatedAt
            }));
            _inMemoryTeachersCache = mappedTeachers;
            setTeachers(mappedTeachers);
            try {
              sessionStorage.setItem('korwilcam_teachers', JSON.stringify(mappedTeachers));
            } catch {}
            try {
              localStorage.setItem('korwilcam_teachers', JSON.stringify(mappedTeachers));
            } catch {}
          }
        } catch (errTeach) {
          console.warn('Tabel daftar_guru belum terbaca:', errTeach);
        }
      })();

      // 0.1 Fetch service_requirements and categories IMMEDIATELY IN PARALLEL
      const serviceReqsFetchPromise = (async () => {
        try {
          // Fetch categories from service_categories table if exists
          try {
            const { data: dbCats } = await client
              .from('service_categories')
              .select('name')
              .order('created_at', { ascending: true });
            if (Array.isArray(dbCats) && dbCats.length > 0) {
              const catNames = dbCats.map((c: any) => String(c.name || '').trim()).filter(Boolean);
              if (catNames.length > 0) {
                setServiceRequirementCategories((prev) => {
                  const merged = Array.from(new Set([...prev, ...catNames]));
                  try {
                    localStorage.setItem('korwilcam_service_categories', JSON.stringify(merged));
                  } catch {}
                  return merged;
                });
              }
            }
          } catch {}

          const { data: dbReqs, error: reqErr } = await client
            .from('service_requirements')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!reqErr && Array.isArray(dbReqs)) {
            // 1. Ekstrak master kategori tersimpan di Supabase
            const sysCat = dbReqs.find((r: any) => r.id === 'system-service-categories');
            if (sysCat) {
              try {
                let parsed: string[] = [];
                if (Array.isArray(sysCat.requirements) && sysCat.requirements.length > 0) {
                  parsed = sysCat.requirements;
                } else if (sysCat.notes) {
                  parsed = JSON.parse(sysCat.notes);
                }
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setServiceRequirementCategories((prev) => {
                    const merged = Array.from(new Set([...prev, ...parsed]));
                    try {
                      localStorage.setItem('korwilcam_service_categories', JSON.stringify(merged));
                    } catch {}
                    return merged;
                  });
                }
              } catch {}
            }

            // 2. Filter hanya layanan publik riil (abaikan system-service-categories)
            const actualReqs = dbReqs.filter((r: any) => r.id !== 'system-service-categories');

            // Ekstrak kategori dari masing-masing layanan aktual
            actualReqs.forEach((r: any) => {
              if (r.category && typeof r.category === 'string') {
                const c = r.category.trim();
                if (c && c !== 'System') {
                  setServiceRequirementCategories((prev) => {
                    if (prev.includes(c)) return prev;
                    const merged = [...prev, c];
                    try {
                      localStorage.setItem('korwilcam_service_categories', JSON.stringify(merged));
                    } catch {}
                    return merged;
                  });
                }
              }
            });

            const mappedReqs: ServiceRequirement[] = actualReqs.map((r: any, index: number) => ({
              id: String(r.id || `req-${Date.now()}-${index}`),
              title: String(r.title || '').trim(),
              category: String(r.category || 'Kepegawaian & GTK').trim(),
              description: String(r.description || '').trim(),
              requirements: Array.isArray(r.requirements) 
                ? r.requirements 
                : (typeof r.requirements === 'string' ? JSON.parse(r.requirements) : []),
              notes: r.notes || '',
              estimatedTime: r.estimated_time || r.estimatedTime || '1 - 3 Hari Kerja',
              fee: r.fee || 'Gratis / Rp 0',
              order: typeof r.sort_order === 'number' ? r.sort_order : (r.order || index + 1),
              createdAt: r.created_at || r.createdAt,
              updatedAt: r.updated_at || r.updatedAt
            }));
            setServiceRequirements(mappedReqs);
            try {
              localStorage.setItem('korwilcam_service_requirements', JSON.stringify(mappedReqs));
            } catch {}
          } else {
            // Jika di database belum ada data atau tabel belum dibuat, jangan tampilkan data dummy
            setServiceRequirements([]);
            try {
              localStorage.setItem('korwilcam_service_requirements', JSON.stringify([]));
            } catch {}
          }
        } catch (errReq) {
          console.warn('Tabel service_requirements belum terbaca:', errReq);
          setServiceRequirements([]);
          try {
            localStorage.setItem('korwilcam_service_requirements', JSON.stringify([]));
          } catch {}
        }
      })();

      // 0.15 Fetch data_requests IMMEDIATELY IN PARALLEL (Layanan Permintaan Data Webview)
      const dataReqsFetchPromise = (async () => {
        try {
          const { data: dbDataReqs, error: dataReqErr } = await client
            .from('data_requests')
            .select('*')
            .order('sort_order', { ascending: true });

          if (!dataReqErr && Array.isArray(dbDataReqs)) {
            if (dbDataReqs.length > 0) {
              const mappedDataReqs: DataRequestLink[] = dbDataReqs.map((d: any, index: number) => {
                const itemTitle = String(d.title || d.judul || '').trim();
                return {
                  id: String(d.id || `req-data-${Date.now()}-${index}`),
                  title: itemTitle,
                  slug: d.slug ? String(d.slug).trim() : generateDataRequestSlug(itemTitle),
                  url: String(d.url || d.link || '').trim(),
                  description: d.description || d.keterangan || '',
                  cropTop: typeof d.crop_top === 'number' ? d.crop_top : (d.cropTop || 0),
                  isActive: d.is_active !== false && d.isActive !== false,
                  order: typeof d.sort_order === 'number' ? d.sort_order : (d.order || index + 1),
                  createdAt: d.created_at || d.createdAt,
                  updatedAt: d.updated_at || d.updatedAt
                };
              });
              setDataRequests(mappedDataReqs);
              try {
                localStorage.setItem('korwilcam_data_requests', JSON.stringify(mappedDataReqs));
              } catch {}
            } else {
              // Jika di tabel Supabase kosong (0 data), wajib kosongkan state & localStorage (tampilkan empty state)
              setDataRequests([]);
              try {
                localStorage.setItem('korwilcam_data_requests', JSON.stringify([]));
              } catch {}
            }
          } else {
            setDataRequests([]);
            try {
              localStorage.setItem('korwilcam_data_requests', JSON.stringify([]));
            } catch {}
          }
        } catch (errDataReq) {
          console.warn('Tabel data_requests belum terbaca:', errDataReq);
          setDataRequests([]);
          try {
            localStorage.setItem('korwilcam_data_requests', JSON.stringify([]));
          } catch {}
        }
      })();


      // 0.2 Fetch gallery IMMEDIATELY IN PARALLEL (Dokumentasi Kegiatan)
      // Supaya galeri langsung tampil instan tanpa delay 3 detik dan foto terbaru selalu di posisi paling atas!
      const galleryFetchPromise = (async () => {
        try {
          const { data: dbGallery, error: galErr } = await client
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

          if (!galErr && dbGallery) {
            // Cari master kategori galeri tersimpan di Supabase
            const sysGalCat = dbGallery.find((g: any) => g.id === 'system-gallery-categories');
            let loadedGalCategories: string[] = ['Kegiatan Belajar', 'Lomba & Prestasi', 'Rakor & Pelatihan', 'Upacara'];
            if (sysGalCat) {
              try {
                if (sysGalCat.description) {
                  const parsed = JSON.parse(sysGalCat.description);
                  if (Array.isArray(parsed)) loadedGalCategories = parsed;
                }
              } catch {}
            }

            const actualGal = dbGallery.filter((g: any) => g.id !== 'system-gallery-categories');

            // Kumpulkan kategori dari item galeri aktual
            actualGal.forEach((g: any) => {
              if (g.category && typeof g.category === 'string') {
                const c = g.category.trim();
                if (c && c !== 'System' && !loadedGalCategories.some(cat => cat.toLowerCase() === c.toLowerCase())) {
                  loadedGalCategories.push(c);
                }
              }
            });

            // Pastikan kategori default selalu tersedia
            ['Kegiatan Belajar', 'Lomba & Prestasi', 'Rakor & Pelatihan', 'Upacara'].forEach(def => {
              if (!loadedGalCategories.some(cat => cat.toLowerCase() === def.toLowerCase())) {
                loadedGalCategories.push(def);
              }
            });

            setGalleryCategories(loadedGalCategories);
            try {
              localStorage.setItem('korwilcam_gallery_categories', JSON.stringify(loadedGalCategories));
            } catch {}

            const mappedGal: GalleryItem[] = actualGal.map((g: any) => ({
              id: String(g.id || `gal-${Date.now()}`),
              title: String(g.title || g.judul || '').trim(),
              category: g.category || g.kategori || 'Dokumentasi',
              image: g.image || g.gambar || '',
              images: (() => {
                if (Array.isArray(g.images) && g.images.length > 0) return g.images;
                if (typeof g.images === 'string' && g.images.trim().startsWith('[')) {
                  try {
                    const parsed = JSON.parse(g.images);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                  } catch (_) {}
                }
                return g.image ? [g.image] : [];
              })(),
              description: g.description || g.deskripsi || '',
              date: g.date || g.tanggal || '',
              createdAt: g.created_at || g.createdAt,
              authorId: g.author_id || g.authorId || '',
              authorName: g.author_name || g.authorName || g.author || 'Super Administrator',
              authorRole: g.author_role || g.authorRole || 'Super Admin'
            }));

            // Pastikan terurut secara descending (terbaru paling atas)
            const sortedGal = sortGalleryDescending(mappedGal);
            _inMemoryGalleryCache = sortedGal;
            setGallery(sortedGal);

            try {
              sessionStorage.setItem('korwilcam_gallery', JSON.stringify(sortedGal));
            } catch {}
            try {
              localStorage.setItem('korwilcam_gallery', JSON.stringify(sortedGal));
            } catch (quotaErr) {
              // Jika data base64 melebihi kuota 5MB browser, simpan versi cover image agar tetap super cepat
              try {
                const lightweight = sortedGal.map(item => ({
                  id: item.id,
                  title: item.title,
                  category: item.category,
                  date: item.date,
                  createdAt: item.createdAt,
                  description: item.description,
                  image: item.image,
                  images: [item.image]
                }));
                localStorage.setItem('korwilcam_gallery', JSON.stringify(lightweight));
              } catch {}
            }
          }
        } catch (errGal) {
          console.warn('Tabel galeri parallel fetch warning:', errGal);
        }
      })();

      // 0.3 Fetch announcements IMMEDIATELY IN PARALLEL (Pengumuman & Surat Edaran)
      // Supaya pengumuman terbaru langsung tampil instan (0ms) tanpa delay bagi pengunjung!
      let loadedAnnouncements: Announcement[] = [];
      const announcementsFetchPromise = (async () => {
        try {
          const { data: dbAnnouncements, error: annErr } = await client
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

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
              const loadedUrl = sopDoc.download_url || sopDoc.downloadUrl;
              setSopImageUrl((prev) => prev || loadedUrl);
              if (!localStorage.getItem('korwilcam_sop_image_url')) {
                localStorage.setItem('korwilcam_sop_image_url', loadedUrl);
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

            if (duplicateDocIdsToDelete.length > 0 && client) {
              try {
                client.from('documents').delete().in('id', duplicateDocIdsToDelete).then(() => {});
              } catch (_) {}
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

                  try {
                    client.from('documents').upsert({
                      id: newSyncedDoc.id,
                      title: newSyncedDoc.title,
                      category: newSyncedDoc.category,
                      file_type: newSyncedDoc.fileType,
                      file_size: newSyncedDoc.fileSize,
                      download_count: 0,
                      date: newSyncedDoc.date,
                      description: newSyncedDoc.description,
                      download_url: newSyncedDoc.downloadUrl
                    }).then(() => {});
                  } catch (_) {}
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

      // 0.4 Fetch organizations IMMEDIATELY IN PARALLEL (Organisasi Mitra & Profesi)
      // Supaya seluruh data organisasi, sambutan ketua, dan susunan pengurus langsung tampil instan (secepat kilat)
      const organizationsFetchPromise = (async () => {
        try {
          const { data: dbOrgs, error: orgsErr } = await client.from('organizations').select('*');
          if (!orgsErr && dbOrgs && dbOrgs.length > 0) {
            const mappedOrgs: EducationalOrganization[] = dbOrgs.map((o: any) => ({
              id: String(o.id || `org-${Date.now()}`),
              slug: String(o.slug || '').trim(),
              name: String(o.name || '').trim(),
              shortName: String(o.short_name || o.shortName || o.name || '').trim(),
              description: String(o.description || '').trim(),
              logo: String(o.logo || '').trim(),
              coverImage: String(o.cover_image || o.coverImage || '').trim(),
              leader: typeof o.leader === 'object' && o.leader ? o.leader : {
                name: '',
                title: '',
                period: '',
                photo: '',
                speechTitle: '',
                speech: ''
              },
              vision: String(o.vision || ''),
              missions: Array.isArray(o.missions) ? o.missions : [],
              officials: Array.isArray(o.officials) ? o.officials : [],
              address: String(o.address || ''),
              phone: String(o.phone || ''),
              email: String(o.email || ''),
              socialMedia: typeof o.social_media === 'object' && o.social_media ? o.social_media : (typeof o.socialMedia === 'object' && o.socialMedia ? o.socialMedia : {}),
              assignedUsername: o.assigned_username || o.assignedUsername || undefined,
              updatedAt: o.updated_at || o.updatedAt
            }));
            _inMemoryOrganizationsCache = mappedOrgs;
            setOrganizations(mappedOrgs);
            try {
              sessionStorage.setItem('korwilcam_organizations', JSON.stringify(mappedOrgs));
              localStorage.setItem('korwilcam_organizations', JSON.stringify(mappedOrgs));
            } catch {}
            return mappedOrgs;
          }
        } catch (errOrgs) {
          console.warn('Tabel organizations parallel fetch warning:', errOrgs);
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
            heroSlideshowImages: Array.isArray(p.hero_slideshow_images) && p.hero_slideshow_images.length > 0 
              ? p.hero_slideshow_images 
              : (initialOfficeProfile.heroSlideshowImages || []),
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

      // Fetch schools
      const { data: dbSchools, error: schErr } = await client.from('schools').select('*');
      if (!schErr && dbSchools) {
        setSchools(dbSchools.map((s: any) => {
          const rawImage = String(s.image || s.foto || s.gambar || '').trim();
          let cleanImage = isDummySchoolImage(rawImage) ? '' : rawImage;
          if (cleanImage && isGoogleDriveUrl(cleanImage)) {
            cleanImage = formatGoogleDriveImageUrl(cleanImage);
          }
          return {
            id: String(s.id || s.npsn || `sch-${Date.now()}`),
            name: String(s.name || s.nama || s.nama_sekolah || '').trim(),
            level: (s.level === 'PAUD' ? 'KB' : (s.level || s.jenjang || 'SD')) as any,
            status: (s.status || 'Negeri') as any,
            npsn: String(s.npsn || '').trim(),
            akreditasi: (s.akreditasi || 'Belum Terakreditasi') as any,
            headmaster: s.headmaster || s.kepala_sekolah || s.ks || '',
            address: s.address || s.alamat || '',
            desa: s.desa || s.kelurahan || '',
            studentsCount: Number(s.students_count ?? s.studentsCount ?? s.jumlah_siswa ?? 0),
            teachersCount: Number(s.teachers_count ?? s.teachersCount ?? s.jumlah_guru ?? 0),
            phone: String(s.phone || s.telepon || s.no_hp || ''),
            email: String(s.email || ''),
            image: cleanImage,
            coordinates: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || s.titikKoordinat || ''),
            titikKoordinat: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || s.titikKoordinat || ''),
            featured: Boolean(s.featured)
          };
        }));
      }

      // Fetch news
      const { data: dbNews, error: newsErr } = await client.from('news').select('*').order('created_at', { ascending: false });
      if (!newsErr && dbNews) {
        // Cari master kategori tersimpan di Supabase
        const sysCatItem = dbNews.find((n: any) => n.id === 'system-news-categories' || n.slug === 'system-news-categories');
        let loadedCategories: string[] = ['Kedinasan', 'SD', 'TK/KB', 'Prestasi'];
        if (sysCatItem) {
          try {
            if (Array.isArray(sysCatItem.tags) && sysCatItem.tags.length > 0) {
              loadedCategories = sysCatItem.tags.map((t: string) => t === 'TK/PAUD' ? 'TK/KB' : t);
            } else if (sysCatItem.content) {
              const parsed = JSON.parse(sysCatItem.content);
              if (Array.isArray(parsed)) loadedCategories = parsed.map((t: string) => t === 'TK/PAUD' ? 'TK/KB' : t);
            }
          } catch {}
        }

        // Filter keluar record master sistem agar tidak muncul sebagai berita artikel di website
        const actualArticles = dbNews.filter((n: any) => n.id !== 'system-news-categories' && n.slug !== 'system-news-categories');

        // Kumpulkan kategori dari artikel berita yang ada
        actualArticles.forEach((n: any) => {
          if (n.category && typeof n.category === 'string') {
            const rawC = n.category.trim();
            const c = rawC === 'TK/PAUD' ? 'TK/KB' : rawC;
            if (c && !loadedCategories.some(cat => cat.toLowerCase() === c.toLowerCase())) {
              loadedCategories.push(c);
            }
          }
        });

        // Pastikan kategori default selalu tersedia
        ['Kedinasan', 'SD', 'TK/KB', 'Prestasi'].forEach(def => {
          if (!loadedCategories.some(cat => cat.toLowerCase() === def.toLowerCase())) {
            loadedCategories.push(def);
          }
        });

        setNewsCategories(loadedCategories);
        try {
          localStorage.setItem('korwilcam_news_categories', JSON.stringify(loadedCategories));
        } catch {}

        const mappedArticles: NewsArticle[] = actualArticles.map((n: any) => {
          const id = String(n.id || `news-${Date.now()}`);
          const title = String(n.title || n.judul || '').trim();
          const slug = n.slug || (title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : `berita-${Date.now()}`);
          let parsedTags: string[] = [];
          if (Array.isArray(n.tags)) {
            parsedTags = n.tags;
          } else if (typeof n.tags === 'string') {
            try {
              const p = JSON.parse(n.tags);
              if (Array.isArray(p)) parsedTags = p;
              else parsedTags = n.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            } catch {
              parsedTags = n.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
          }
          const existingLocal = _inMemoryNewsCache?.find((p) => p.id === id || p.slug === slug);
          const serverViews = Number(n.views || 0);
          const localViews = existingLocal ? Number(existingLocal.views || 0) : 0;
          const finalViews = Math.max(serverViews, localViews);

          const rawSummary = String(n.summary || n.ringkasan || '').trim();
          const strippedSummary = stripHtml(rawSummary);
          const plainContent = stripHtml(String(n.content || n.isi || n.konten || ''));
          const fallbackSummary = plainContent.length > 180 ? plainContent.slice(0, 180).trim() + '...' : plainContent;
          const safeSummary = strippedSummary || fallbackSummary;

          return {
            id,
            title,
            slug,
            category: n.category || n.kategori || 'Kedinasan',
            summary: safeSummary,
            content: n.content || n.isi || n.konten || '',
            author: n.author || n.penulis || 'Humas Korwilcam',
            authorId: n.author_id || n.authorId || undefined,
            authorRole: n.author_role || n.authorRole || undefined,
            date: n.date || n.tanggal || (n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })),
            image: n.image || n.gambar || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
            views: finalViews,
            totalReadSeconds: Math.max(Number(n.total_read_seconds) || 0, existingLocal?.totalReadSeconds || 0),
            readCount: Math.max(Number(n.read_count) || 0, existingLocal?.readCount || 0),
            tags: parsedTags
          };
        });

        _inMemoryNewsCache = mappedArticles;
        setNews(mappedArticles);
        try {
          sessionStorage.setItem('korwilcam_news', JSON.stringify(mappedArticles));
          localStorage.setItem('korwilcam_news', JSON.stringify(mappedArticles));
        } catch {}

        setSelectedNewsState((current) => {
          if (!current) return null;
          const updated = mappedArticles.find((a) => a.id === current.id || a.slug === current.slug);
          return updated || current;
        });
      }

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

      // Fetch sop_pelayanan table
      try {
        const { data: dbSop, error: sopErr } = await client.from('sop_pelayanan').select('*').limit(1);
        if (!sopErr && dbSop && dbSop.length > 0) {
          const loadedUrl = dbSop[0].image_url || dbSop[0].imageUrl || dbSop[0].foto || '';
          if (loadedUrl) {
            setSopImageUrl(loadedUrl);
            localStorage.setItem('korwilcam_sop_image_url', loadedUrl);
          }
        }
      } catch (_) {
        // Fallback jika tabel sop_pelayanan belum dibuat
      }

      // Await parallel gallery & documents fetch
      await Promise.all([galleryFetchPromise, documentsFetchPromise]);

      // Fetch complaints
      const { data: dbComplaints, error: compErr } = await client.from('complaints').select('*').order('created_at', { ascending: false });
      if (!compErr && dbComplaints) {
        setComplaints(dbComplaints.map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          schoolOrOrigin: c.school_or_origin,
          category: c.category,
          message: c.message,
          date: c.date,
          status: c.status
        })));
      }

      // Fetch admin_users
      try {
        const { data: dbUsers, error: usersErr } = await client.from('admin_users').select('*');
        if (!usersErr && dbUsers && dbUsers.length > 0) {
          setAdminUsers(dbUsers.map((u: any) => ({
            id: u.id,
            username: u.username,
            password: u.password,
            name: u.name,
            role: u.role as AdminRole,
            email: u.email || '',
            avatar: u.avatar || '',
            status: (u.status || 'Aktif') as 'Aktif' | 'Nonaktif',
            createdAt: u.created_at,
            updatedAt: u.updated_at
          })));
        }
      } catch (errUsers) {
        console.warn('Tabel admin_users belum terbaca:', errUsers);
      }

      // Await parallel organizations, daftar_guru, service_requirements, and data_requests fetch
      try {
        await Promise.all([
          organizationsFetchPromise,
          teachersFetchPromise, 
          serviceReqsFetchPromise, 
          dataReqsFetchPromise
        ]);
      } catch (errParallel) {
        console.warn('Parallel fetch warning:', errParallel);
      }

      setSyncStatus('connected');
      setIsSupabaseActive(true);
      return true;
    } catch (err) {
      console.warn('Supabase fetch failed, continuing with local data:', err);
      setSyncStatus('offline');
      return false;
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

      // 3. News
      const newsPayload = news.map((n) => ({
        id: n.id,
        title: n.title,
        slug: n.slug,
        category: n.category,
        summary: n.summary,
        content: n.content,
        author: n.author,
        author_id: n.authorId,
        author_role: n.authorRole,
        date: n.date,
        image: n.image,
        views: n.views,
        tags: n.tags
      }));
      let { error: newsErr } = await client.from('news').upsert(newsPayload);
      if (newsErr && newsErr.message?.toLowerCase().includes('column')) {
        const safeNews = newsPayload.map(({ author_id, author_role, ...rest }: any) => rest);
        await client.from('news').upsert(safeNews);
      }

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
      if (sopImageUrl) {
        docPayload.push({
          id: 'sop-main',
          title: 'Bagan SOP Pelayanan',
          category: 'SOP Pelayanan',
          file_type: 'IMAGE',
          file_size: '1 MB',
          download_count: 0,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          description: 'Bagan Alur Standar Operasional Prosedur Pelayanan Pendidikan Korwilcam Purwodadi',
          download_url: sopImageUrl
        });

        try {
          await client.from('sop_pelayanan').upsert({
            id: 'main',
            title: 'Bagan Alur SOP Pelayanan',
            image_url: sopImageUrl,
            description: 'Standar Operasional Prosedur Pelayanan Pendidikan Korwilcam Purwodadi',
            updated_at: new Date().toISOString()
          });
        } catch (_) {}
      }
      await client.from('documents').upsert(docPayload);

      // 7. Gallery
      const galPayload = gallery.map((g) => ({
        id: g.id,
        title: g.title,
        category: g.category,
        image: g.image,
        images: g.images && g.images.length > 0 ? g.images : [g.image],
        description: g.description,
        date: g.date,
        author_id: g.authorId,
        author_name: g.authorName,
        author_role: g.authorRole
      }));
      let { error: galErr } = await client.from('gallery').upsert(galPayload);
      if (galErr && galErr.message?.toLowerCase().includes('column')) {
        const safeGal = galPayload.map(({ images, ...rest }: any) => rest);
        await client.from('gallery').upsert(safeGal);
      }

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

      // 10. Admin Users
      try {
        const usersPayload = adminUsers.map((u) => ({
          id: u.id,
          username: u.username,
          password: u.password || 'admin123',
          name: u.name,
          role: u.role,
          email: u.email || '',
          avatar: u.avatar || '',
          status: u.status || 'Aktif'
        }));
        await client.from('admin_users').upsert(usersPayload);
      } catch (uErr) {
        console.warn('Gagal ekspor tabel admin_users:', uErr);
      }

      // 11. Organizations
      try {
        const orgPayload = organizations.map((o) => ({
          id: o.id,
          slug: o.slug,
          name: o.name,
          short_name: o.shortName,
          description: o.description,
          logo: o.logo || '',
          cover_image: o.coverImage || '',
          leader: o.leader,
          vision: o.vision,
          missions: o.missions,
          officials: o.officials,
          address: o.address || '',
          phone: o.phone || '',
          email: o.email || '',
          social_media: o.socialMedia || {},
          assigned_username: o.assignedUsername || null,
          updated_at: o.updatedAt || new Date().toISOString()
        }));
        const { error: oErr } = await client.from('organizations').upsert(orgPayload);
        if (oErr) {
          // Fallback jika kolom assigned_username belum ada di skema database pengguna
          const fallbackPayload = orgPayload.map(({ assigned_username, ...rest }) => rest);
          await client.from('organizations').upsert(fallbackPayload);
        }
      } catch (oErr) {
        console.warn('Gagal ekspor tabel organizations:', oErr);
      }

      // 12. Daftar Guru (Nominatif Guru)
      try {
        const teacherPayload = teachers.map((t) => ({
          id: t.id,
          no: t.no,
          nama: t.nama,
          nip: t.nip || '-',
          status_pegawai: t.statusPegawai,
          instansi: t.instansi,
          created_at: t.createdAt || new Date().toISOString(),
          updated_at: t.updatedAt || new Date().toISOString()
        }));
        await client.from('daftar_guru').upsert(teacherPayload);
      } catch (tErr) {
        console.warn('Gagal ekspor tabel daftar_guru:', tErr);
      }

      // 13. Export service_requirements & master categories
      try {
        const reqPayload: any[] = serviceRequirements.map((r) => ({
          id: r.id,
          title: r.title,
          category: r.category || 'Kepegawaian & GTK',
          description: r.description || '',
          requirements: r.requirements || [],
          notes: r.notes || '',
          estimated_time: r.estimatedTime || '1-3 Hari Kerja',
          fee: r.fee || 'Gratis / Rp 0',
          sort_order: r.order || 1,
          created_at: r.createdAt || new Date().toISOString(),
          updated_at: r.updatedAt || new Date().toISOString()
        }));

        // Sertakan record system-service-categories untuk sinkronisasi master kategori antar-admin
        reqPayload.push({
          id: 'system-service-categories',
          title: 'System Service Categories',
          category: 'System',
          description: 'Master category list for service requirements',
          requirements: serviceRequirementCategories,
          notes: JSON.stringify(serviceRequirementCategories),
          estimated_time: '1 Hari',
          fee: 'Gratis',
          sort_order: -999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        await client.from('service_requirements').upsert(reqPayload);

        // Ekspor juga ke tabel service_categories jika tabel ini sudah dibuat
        try {
          const catPayload = serviceRequirementCategories.map((c) => ({
            id: `cat-${c.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
            name: c,
            created_at: new Date().toISOString()
          }));
          await client.from('service_categories').upsert(catPayload, { onConflict: 'name' });
        } catch {}
      } catch (rErr) {
        console.warn('Gagal ekspor tabel service_requirements:', rErr);
      }

      // 14. Export data_requests (Layanan Permintaan Data Webview)
      try {
        if (dataRequests && dataRequests.length > 0) {
          const dataReqPayload = dataRequests.map((d, index) => ({
            id: d.id,
            title: d.title,
            slug: d.slug || generateDataRequestSlug(d.title),
            url: d.url,
            description: d.description || '',
            crop_top: d.cropTop || 0,
            is_active: d.isActive !== false,
            sort_order: d.order || index + 1,
            created_at: d.createdAt || new Date().toISOString(),
            updated_at: d.updatedAt || new Date().toISOString()
          }));
          await client.from('data_requests').upsert(dataReqPayload);
        }
      } catch (dErr) {
        console.warn('Gagal ekspor tabel data_requests:', dErr);
      }

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

    let refreshDebounceTimer: any = null;
    const triggerDebouncedRefresh = () => {
      if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
      refreshDebounceTimer = setTimeout(() => {
        refreshFromSupabase();
      }, 1200);
    };

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
        { event: '*', schema: 'public', table: 'news' },
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
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sop_pelayanan' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daftar_guru' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requirements' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'data_requests' },
        triggerDebouncedRefresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_users' },
        async () => {
          const { data: dbUsers } = await client.from('admin_users').select('*');
          if (dbUsers) {
            setAdminUsers(dbUsers.map((u: any) => ({
              id: u.id,
              username: u.username,
              password: u.password,
              name: u.name,
              role: u.role as AdminRole,
              email: u.email || '',
              avatar: u.avatar || '',
              status: (u.status || 'Aktif') as 'Aktif' | 'Nonaktif',
              createdAt: u.created_at,
              updatedAt: u.updated_at
            })));
          }
        }
      )
      .subscribe();

    return () => {
      if (refreshDebounceTimer) clearTimeout(refreshDebounceTimer);
      client.removeChannel(channel);
    };
  }, [isSupabaseActive]);

  const TAB_ROUTES: Record<string, { path: string; title: string }> = {
    'home': { path: '/beranda', title: 'Beranda - Portal Resmi Korwilcam Bidang Pendidikan Purwodadi' },
    'profile': { path: '/profil', title: 'Profil Instansi - Korwilcam Bidang Pendidikan Purwodadi' },
    'sop-pelayanan': { path: '/sop-pelayanan', title: 'SOP Pelayanan - Korwilcam Purwodadi' },
    'schools': { path: '/sekolah', title: 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi' },
    'nominatif': { path: '/profil#nominatif', title: 'Daftar Nominatif Guru - Korwilcam Purwodadi' },
    'nominative': { path: '/profil#nominatif', title: 'Daftar Nominatif Guru - Korwilcam Purwodadi' },
    'news': { path: '/berita', title: 'Warta & Informasi Terkini - Korwilcam Purwodadi' },
    'organization': { path: '/profil#organisasi', title: 'Organisasi Pendidikan - Korwilcam Purwodadi' },
    'service-requirements': { path: '/layanan/persyaratan-pelayanan', title: 'Persyaratan Pelayanan - Korwilcam Purwodadi' },
    'downloads': { path: '/layanan/unduh-berkas', title: 'Layanan Unduh Berkas - Korwilcam Purwodadi' },
    'service-aula': { path: '/layanan/peminjaman-aula', title: 'Peminjaman Aula Korwilcam Purwodadi' },
    'service-cuti': { path: '/layanan/surat-cuti', title: 'Layanan Surat Cuti GTK Online - Korwilcam Purwodadi' },
    'service-survey': { path: '/layanan/survey-pelayanan', title: 'Survey Kepuasan Pelayanan Terpadu - Korwilcam Purwodadi' },
    'service-permintaan-data': { path: '/layanan/permintaan-data', title: 'Layanan Permintaan Data - Korwilcam Purwodadi' },
    'gallery': { path: '/galeri', title: 'Galeri Kegiatan & Dokumentasi - Korwilcam Purwodadi' },
    'contact': { path: '/kontak', title: 'Kontak & Layanan Pengaduan - Korwilcam Purwodadi' },
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
    if (tab !== 'organization') {
      setSelectedOrganizationSlugState(null);
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
      setSelectedDocumentState(null);
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
      const returnPath = activeTab === 'home' ? '/beranda' : '/berita';
      if (window.location.pathname !== returnPath) {
        window.history.pushState({}, '', returnPath);
      }
      document.title = 'Warta & Informasi - Korwilcam Purwodadi';
    }
  };

  const setSelectedAnnouncement = (ann: Announcement | null, customPath?: string) => {
    setSelectedAnnouncementState(ann);
    if (ann) {
      setSelectedNewsState(null);
      setSelectedGalleryState(null);
      setSelectedDocumentState(null);
      const slug = ann.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const newPath = customPath || `/berita/pengumuman/${encodeURIComponent(slug)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ announcementSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${ann.title} - Pengumuman Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const returnPath = '/berita/pengumuman';
      if (window.location.pathname !== returnPath) {
        window.history.pushState({}, '', returnPath);
      }
      document.title = 'Pengumuman & Surat Edaran - Korwilcam Purwodadi';
    }
  };

  const setSelectedGallery = (item: GalleryItem | null) => {
    setSelectedGalleryState(item);
    if (item) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedDocumentState(null);
      setActiveTabState('gallery');
      const slug = getGallerySlug(item);
      const newPath = `/galeri/${encodeURIComponent(slug)}`;
      if (window.location.pathname !== newPath) {
        window.history.pushState({ gallerySlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${item.title} - Galeri Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const returnPath = '/galeri';
      if (window.location.pathname !== returnPath) {
        window.history.pushState({}, '', returnPath);
      }
      document.title = 'Galeri Kegiatan & Dokumentasi - Korwilcam Purwodadi';
    }
  };

  const setSelectedDocument = (doc: DocumentDownload | null, customPath?: string) => {
    setSelectedDocumentState(doc);
    if (doc) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setActiveTabState('downloads');
      const slug = getDocumentSlug(doc);
      const newPath = customPath || getDocumentDetailPath(doc);
      if (window.location.pathname !== newPath) {
        window.history.pushState({ documentSlug: slug, path: newPath }, '', newPath);
      }
      document.title = `${doc.title} - Pusat Unduhan Korwilcam Purwodadi`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const returnPath = '/layanan/unduh-berkas';
      if (window.location.pathname !== returnPath) {
        window.history.pushState({}, '', returnPath);
      }
      document.title = TAB_ROUTES['downloads'].title;
    }
  };

  const setSelectedServiceRequirement = (item: ServiceRequirement | null, customPath?: string) => {
    setSelectedServiceRequirementState(item);
    if (item) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
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
      const returnPath = '/layanan/persyaratan-pelayanan';
      if (window.location.pathname !== returnPath) {
        window.history.pushState({}, '', returnPath);
      }
      document.title = TAB_ROUTES['service-requirements']?.title || 'Persyaratan Pelayanan - Korwilcam Purwodadi';
    }
  };

  const setSelectedSchool = (school: School | null, customPath?: string) => {
    setSelectedSchoolState(school);
    if (school) {
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedDocumentState(null);

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
        window.history.pushState({}, '', finalUrl);
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
  };

  const setSelectedOrganizationSlug = (slug: string | null, customPath?: string) => {
    setSelectedOrganizationSlugState(slug);
    setActiveTabState('organization');
    setSelectedNewsState(null);
    setSelectedAnnouncementState(null);
    setSelectedGalleryState(null);
    setSelectedDocumentState(null);
    setSelectedSchoolState(null);

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
      const targetPath = '/organisasi';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ orgSlug: null, path: targetPath }, '', targetPath);
      }
      document.title = 'Daftar Organisasi Mitra & Profesi - Korwilcam Purwodadi';
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          document.title = `${found.title} - Pengumuman Korwilcam Purwodadi`;
          return;
        }
      }

      // 2. Support /berita/:slug (excluding subtabs)
      if (rawPath.startsWith('/berita/') && !rawPath.startsWith('/berita/pengumuman') && rawPath !== '/berita/agenda' && rawPath !== '/berita/liputan') {
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
          document.title = `${found.title} - Korwilcam Purwodadi`;
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
            setSelectedGalleryState(found);
            setSelectedNewsState(null);
            setSelectedAnnouncementState(null);
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
          setActiveTabState('gallery');
          setSelectedGalleryState(found);
          setSelectedNewsState(null);
          setSelectedAnnouncementState(null);
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
      if (!rawPath.startsWith('/berita/') && !rawPath.startsWith('/b/') && !searchParams.get('berita')) {
        setSelectedNewsState(null);
      }
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);
      setSelectedServiceRequirementState(null);
      if (!rawPath.includes('permintaan-data') && !rawPath.includes('permintaan') && !rawPath.includes('data-request')) {
        setSelectedDataRequestSlug(null);
      }

      // Match path to tabs
      if (rawPath === '/' || rawPath === '/beranda' || rawPath === '/home') {
        setActiveTabState('home');
        document.title = TAB_ROUTES['home'].title;
      } else if (rawPath.startsWith('/profil')) {
        const hash = (typeof window !== 'undefined' ? (window.location.hash || '').toLowerCase() : '');
        if (hash === '#nominatif' || hash.includes('nominatif')) {
          setActiveTabState('nominatif');
          document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
        } else if (hash === '#organisasi' || hash.includes('organisasi') || hash === '#organization') {
          setActiveTabState('organization');
          document.title = TAB_ROUTES['organization']?.title || 'Organisasi Pendidikan - Korwilcam Purwodadi';
        } else {
          setActiveTabState('profile');
          document.title = TAB_ROUTES['profile'].title;
        }
      } else if (rawPath.startsWith('/sop') || rawPath.startsWith('/sop-pelayanan')) {
        setActiveTabState('sop-pelayanan');
        document.title = TAB_ROUTES['sop-pelayanan']?.title || 'SOP Pelayanan - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/direktori-sekolah') || rawPath.startsWith('/sekolah')) {
        setActiveTabState('schools');
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
        window.history.replaceState({ tab: 'nominatif', path: '/profil#nominatif' }, '', '/profil#nominatif');
        document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/nominatif') || rawPath.startsWith('/daftar-guru')) {
        setActiveTabState('nominatif');
        document.title = TAB_ROUTES['nominatif']?.title || 'Daftar Nominatif Guru - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/berita')) {
        setActiveTabState('news');
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
      } else if (rawPath.startsWith('/galeri')) {
        setActiveTabState('gallery');
        document.title = TAB_ROUTES['gallery'].title;
      } else if (rawPath.startsWith('/kontak') || rawPath.startsWith('/pengaduan') || rawPath.startsWith('/aduan')) {
        setActiveTabState('contact');
        document.title = TAB_ROUTES['contact'].title;
      } else if (rawPath.startsWith('/angmin')) {
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
        document.title = TAB_ROUTES['home'].title;
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, [news, announcements, gallery, documents, schools, organizations, teachers, serviceRequirements, dataRequests]);

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

    // Wajib verifikasi langsung ke tabel admin_users di Supabase
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('admin_users')
          .select('*')
          .ilike('username', trimmedUser)
          .eq('password', trimmedPass)
          .limit(1);

        if (error) {
          console.error('Supabase query error saat login admin_users:', error);
          setIsAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem('korwilcam_admin_auth');
          localStorage.removeItem('korwilcam_current_user');
          showToast('Terjadi gangguan saat memverifikasi akun ke Supabase: ' + error.message, 'error');
          return false;
        }

        if (data && data.length > 0) {
          const u = data[0];
          if (u.status === 'Nonaktif') {
            setIsAuthenticated(false);
            setCurrentUser(null);
            localStorage.removeItem('korwilcam_admin_auth');
            localStorage.removeItem('korwilcam_current_user');
            showToast('Akun ini dinonaktifkan. Silakan hubungi Super Admin.', 'error');
            return false;
          }
          const matched: AdminUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            role: u.role as AdminRole,
            email: u.email || '',
            avatar: u.avatar || '',
            status: u.status || 'Aktif',
            createdAt: u.created_at,
            updatedAt: u.updated_at
          };
          setCurrentUser(matched);
          setIsAuthenticated(true);
          localStorage.setItem('korwilcam_admin_auth', 'true');
          localStorage.setItem('korwilcam_current_user', JSON.stringify(matched));
          showToast(`Login berhasil! Selamat datang, ${matched.name} (${matched.role}).`, 'success');
          return true;
        } else {
          // Username atau password tidak cocok dengan tabel admin_users Supabase
          setIsAuthenticated(false);
          setCurrentUser(null);
          localStorage.removeItem('korwilcam_admin_auth');
          localStorage.removeItem('korwilcam_current_user');
          showToast('Username atau kata sandi salah! Pastikan sesuai dengan tabel admin_users di Supabase.', 'error');
          return false;
        }
      } catch (err: any) {
        console.error('Koneksi ke Supabase admin_users gagal:', err);
        setIsAuthenticated(false);
        setCurrentUser(null);
        localStorage.removeItem('korwilcam_admin_auth');
        localStorage.removeItem('korwilcam_current_user');
        showToast('Gagal menghubungi database Supabase: ' + (err?.message || 'Koneksi terputus'), 'error');
        return false;
      }
    }

    // Jika client Supabase tidak aktif
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('korwilcam_admin_auth');
    localStorage.removeItem('korwilcam_current_user');
    showToast('Database Supabase belum terkonfigurasi!', 'error');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('korwilcam_admin_auth');
    localStorage.removeItem('korwilcam_current_user');
    setActiveTab('home');
    showToast('Anda telah keluar dari sesi pengelola.', 'info');
  };

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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('admin_users').insert({
          id: newId,
          username: newUser.username,
          password: newUser.password,
          name: newUser.name,
          role: newUser.role,
          email: newUser.email || '',
          avatar: newUser.avatar || '',
          status: newUser.status
        });
      } catch (err: any) {
        console.error('Failed to insert admin_user in Supabase:', err);
      }
    }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = { ...userData };
        if (!userData.password) {
          delete payload.password;
        }
        await client.from('admin_users').update(payload).eq('id', id);
      } catch (err: any) {
        console.error('Failed to update admin_user in Supabase:', err);
      }
    }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('admin_users').delete().eq('id', id);
      } catch (err: any) {
        console.error('Failed to delete admin_user in Supabase:', err);
      }
    }
    showToast(`Akun ${target.username} berhasil dihapus.`, 'info');
    return true;
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
  };

  const updateSchool = async (id: string, updatedData: Partial<School>) => {
    const cleanUpdatedData = { ...updatedData };
    if (cleanUpdatedData.image && isGoogleDriveUrl(cleanUpdatedData.image)) {
      cleanUpdatedData.image = formatGoogleDriveImageUrl(cleanUpdatedData.image);
    }
    let mergedSchool: School | null = null;
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          mergedSchool = { ...s, ...cleanUpdatedData };
          return mergedSchool;
        }
        return s;
      })
    );

    if (mergedSchool) {
      setSelectedSchoolState((curr) => (curr?.id === id ? mergedSchool : curr));
    }

    const client = getSupabaseClient();
    if (client && mergedSchool) {
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
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setSelectedSchoolState((curr) => (curr?.id === id ? null : curr));

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

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const supabasePayload = {
          id: newArticle.id,
          title: newArticle.title,
          slug: newArticle.slug,
          category: newArticle.category,
          summary: newArticle.summary,
          content: newArticle.content,
          author: newArticle.author,
          date: newArticle.date,
          image: newArticle.image,
          views: Number(newArticle.views || 0),
          tags: Array.isArray(newArticle.tags) ? newArticle.tags : []
        };

        const { error } = await client.from('news').upsert(supabasePayload);

        if (error) {
          console.error('Supabase addNews error:', error);
          showToast(`Berita diterbitkan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast('Artikel berita berhasil diterbitkan & tersimpan otomatis ke Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast(`Berita disimpan lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Artikel berita berhasil diterbitkan di penyimpanan lokal.', 'success');
    }
  };

  const updateNews = async (id: string, updatedData: Partial<NewsArticle>) => {
    const cleanSummary = updatedData.summary !== undefined
      ? (stripHtml(updatedData.summary) || (updatedData.content ? generateSummary(updatedData.content, 180) : ''))
      : undefined;

    let mergedNews: NewsArticle | null = null;
    setNews((prev) => {
      const updated = prev.map((n) => {
        if (n.id === id) {
          const itemSummary = cleanSummary !== undefined ? cleanSummary : (stripHtml(n.summary) || generateSummary(n.content, 180));
          const itemSlug = updatedData.slug || n.slug || (updatedData.title || n.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `berita-${id}`;
          mergedNews = {
            ...n,
            ...updatedData,
            summary: itemSummary,
            slug: itemSlug
          };
          return mergedNews;
        }
        return n;
      });
      _inMemoryNewsCache = updated;
      try {
        sessionStorage.setItem('korwilcam_news', JSON.stringify(updated));
        localStorage.setItem('korwilcam_news', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (mergedNews) {
      setSelectedNewsState((current) => {
        if (current && (current.id === id || current.slug === (mergedNews as NewsArticle).slug)) {
          return mergedNews;
        }
        return current;
      });
    }

    const client = getSupabaseClient();
    if (client && mergedNews) {
      setSyncStatus('syncing');
      try {
        const n = mergedNews as NewsArticle;
        const safeSlug = n.slug || (n.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `berita-${Date.now()}`;
        const safeSummary = stripHtml(n.summary) || generateSummary(n.content, 180);

        const supabasePayload = {
          title: n.title,
          slug: safeSlug,
          category: n.category || 'Kedinasan',
          summary: safeSummary,
          content: n.content || '',
          author: n.author || 'Humas Korwilcam',
          date: n.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
          image: n.image,
          views: Number(n.views || 0),
          tags: Array.isArray(n.tags) ? n.tags : []
        };

        // 1. Try update first:
        let { error, data } = await client.from('news').update(supabasePayload).eq('id', id).select();

        // 2. If row was not found in Supabase (e.g. created offline), fallback to upsert with id:
        if (!error && (!data || data.length === 0)) {
          const upsertRes = await client.from('news').upsert({ id: n.id, ...supabasePayload }).select();
          error = upsertRes.error;
        }

        if (error) {
          console.error('Supabase updateNews error:', error);
          showToast(`Berita diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast('Berita berhasil diperbarui di database Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast(`Berita diperbarui lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Berita berhasil diperbarui di penyimpanan lokal.', 'success');
    }
  };

  const deleteNews = async (id: string) => {
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

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('news').delete().eq('id', id);
        if (error) {
          showToast(`Gagal hapus berita di Supabase: ${error.message}`, 'error');
        } else {
          showToast('Artikel berita berhasil dihapus dari database Supabase.', 'info');
        }
      } catch (err: any) {
        showToast('Artikel berita berhasil dihapus lokal.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Artikel berita berhasil dihapus dari penyimpanan lokal.', 'info');
    }
  };

  const addNewsCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    // Cek apakah sudah ada (case-insensitive)
    const exists = newsCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? newsCategories : [...newsCategories, trimmed];

    setNewsCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_news_categories', JSON.stringify(updatedCategories));
    } catch {}

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('news').upsert({
          id: 'system-news-categories',
          title: 'System News Categories',
          slug: 'system-news-categories',
          category: 'System',
          summary: 'Master category list',
          content: JSON.stringify(updatedCategories),
          tags: updatedCategories,
          author: 'System',
          date: new Date().toISOString().split('T')[0],
          image: ''
        });

        if (error) {
          console.warn('Gagal menyimpan kategori ke Supabase:', error.message);
          showToast(`Kategori tersimpan lokal. Supabase: ${error.message}`, 'info');
          return false;
        } else {
          showToast(`Kategori "${trimmed}" berhasil disimpan di database Supabase Cloud!`, 'success');
          return true;
        }
      } catch (err: any) {
        showToast('Kategori tersimpan di penyimpanan lokal.', 'info');
        return false;
      }
    } else {
      showToast(`Kategori "${trimmed}" berhasil ditambahkan!`, 'success');
      return true;
    }
  };

  const incrementNewsViews = async (id: string) => {
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

    // Simpan segera ke localStorage agar tersinkronisasi saat refresh halaman seketika
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
        }
      }
    } catch {}

    // 2. Persist ke Supabase Cloud jika terhubung
    const client = getSupabaseClient();
    if (client) {
      try {
        // Coba 1: Gunakan RPC increment_news_views jika tersedia di database
        const { data: rpcViews, error: rpcErr } = await client.rpc('increment_news_views', {
          article_id: id
        });

        if (!rpcErr && typeof rpcViews === 'number' && rpcViews > 0) {
          setNews((prev) =>
            prev.map((n) => (n.id === id || n.slug === id ? { ...n, views: rpcViews } : n))
          );
          setSelectedNewsState((prev) =>
            prev && (prev.id === id || prev.slug === id) ? { ...prev, views: rpcViews } : prev
          );
          return;
        }

        // Coba 2: Direct SELECT & UPDATE fallback
        const { data: dbItem, error: fetchErr } = await client
          .from('news')
          .select('id, views, slug')
          .or(`id.eq."${id}",slug.eq."${id}"`)
          .maybeSingle();

        if (!fetchErr && dbItem) {
          const serverViews = (Number(dbItem.views) || 0) + 1;
          const finalViews = Math.max(serverViews, calculatedNextViews);

          const { error: updateErr } = await client
            .from('news')
            .update({ views: finalViews })
            .eq('id', dbItem.id);

          if (!updateErr) {
            setNews((prev) =>
              prev.map((n) => (n.id === id || n.slug === id ? { ...n, views: finalViews } : n))
            );
            setSelectedNewsState((prev) =>
              prev && (prev.id === id || prev.slug === id) ? { ...prev, views: finalViews } : prev
            );
          } else {
            console.warn('Gagal update views Supabase:', updateErr);
          }
        }
      } catch (err) {
        console.warn('Silently failed to update news view count in Supabase:', err);
      }
    }
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

    // 2. Persist to Supabase Cloud if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: dbItem } = await client
          .from('news')
          .select('total_read_seconds, read_count')
          .eq('id', id)
          .single();

        const dbTotal = dbItem ? (Number(dbItem.total_read_seconds) || 0) : 0;
        const dbCount = dbItem ? (Number(dbItem.read_count) || 0) : 0;

        const finalTotal = dbItem ? dbTotal + secondsSpent : nextTotal;
        const finalCount = dbItem ? (isNewSession ? dbCount + 1 : Math.max(1, dbCount)) : nextCount;

        const { error } = await client
          .from('news')
          .update({
            total_read_seconds: finalTotal,
            read_count: finalCount
          })
          .eq('id', id);

        if (!error && dbItem) {
          setNews((prev) =>
            prev.map((n) => (n.id === id ? { ...n, totalReadSeconds: finalTotal, readCount: finalCount } : n))
          );
          setSelectedNewsState((prev) =>
            prev && prev.id === id ? { ...prev, totalReadSeconds: finalTotal, readCount: finalCount } : prev
          );
        }
      } catch (err) {
        console.warn('Silently caught reading time update exception:', err);
      }
    }
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
  };

  const updateAnnouncement = async (id: string, updatedData: Partial<Announcement>) => {
    let mergedAnn: Announcement | null = null;
    setAnnouncements((prev) => {
      const updated = prev.map((a) => {
        if (a.id === id) {
          mergedAnn = { ...a, ...updatedData };
          return mergedAnn;
        }
        return a;
      });
      _inMemoryAnnouncementsCache = updated;
      try { sessionStorage.setItem('korwilcam_announcements', JSON.stringify(updated)); } catch (_) {}
      return updated;
    });

    const docId = `doc-ann-${id}`;
    let syncedDoc: DocumentDownload | null = null;
    const targetAnn = (mergedAnn || null) as unknown as Announcement | null;
    const hasFile = Boolean(targetAnn && targetAnn.fileUrl && targetAnn.fileUrl?.trim() !== '' && targetAnn.fileUrl !== '#');
    
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

    if (mergedAnn) {
      setSelectedAnnouncementState((curr) => (curr?.id === id ? mergedAnn : curr));
    }

    const client = getSupabaseClient();
    if (client && mergedAnn) {
      setSyncStatus('syncing');
      try {
        const target = mergedAnn as unknown as Announcement;
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

        const { error } = await client.from('announcements').upsert({
          id: target.id,
          title: target.title,
          date: target.date,
          urgency: target.urgency,
          target: target.target,
          file_size: packedFileSize,
          summary: target.summary
        });

        // Sinkronkan ke tabel documents di Supabase
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
          try {
            await client.from('documents').delete().eq('id', docId);
          } catch (_) {}
        }

        if (error) {
          console.error('Supabase updateAnnouncement error:', error);
          showToast(`Pengumuman diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
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
        showToast(`Pengumuman diperbarui lokal.`, 'info');
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
  };

  const updateDocument = async (id: string, updatedData: Partial<DocumentDownload>) => {
    let mergedDoc: DocumentDownload | null = null;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          mergedDoc = { ...d, ...updatedData };
          return mergedDoc;
        }
        return d;
      })
    );

    if (mergedDoc) {
      setSelectedDocumentState((curr) => (curr?.id === id ? mergedDoc : curr));
    }

    const client = getSupabaseClient();
    if (client && mergedDoc) {
      setSyncStatus('syncing');
      try {
        const target = mergedDoc as DocumentDownload;
        const { error } = await client.from('documents').upsert({
          id: target.id,
          title: target.title,
          category: target.category,
          file_type: target.fileType,
          file_size: target.fileSize,
          download_count: target.downloadCount,
          date: target.date,
          description: target.description,
          download_url: target.downloadUrl
        });
        if (error) {
          showToast(`Dokumen diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
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
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocumentState((curr) => (curr?.id === id ? null : curr));

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
  };

  const updateAgenda = async (id: string, updatedData: Partial<AgendaEvent>) => {
    let mergedAgenda: AgendaEvent | null = null;
    setAgenda((prev) =>
      prev.map((ag) => {
        if (ag.id === id) {
          mergedAgenda = { ...ag, ...updatedData };
          return mergedAgenda;
        }
        return ag;
      })
    );

    const client = getSupabaseClient();
    if (client && mergedAgenda) {
      setSyncStatus('syncing');
      try {
        const ag = mergedAgenda as AgendaEvent;
        await client.from('agenda').upsert({
          id: ag.id,
          title: ag.title,
          date: ag.date,
          time: ag.time,
          location: ag.location,
          organizer: ag.organizer,
          target_audience: ag.targetAudience,
          status: ag.status
        });
        showToast('Agenda kegiatan berhasil diperbarui di Supabase Cloud!', 'success');
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
    setAgenda((prev) => prev.filter((a) => a.id !== id));

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

  // GALLERY CRUD (Auto-save to Supabase & local state)
  const addGalleryItem = async (itemData: Omit<GalleryItem, 'id'>) => {
    const imagesList = itemData.images && itemData.images.length > 0 
      ? itemData.images 
      : [itemData.image];

    const newItem: GalleryItem = {
      ...itemData,
      image: imagesList[0] || itemData.image,
      images: imagesList,
      id: `gal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGallery((prev) => {
      const updated = sortGalleryDescending([newItem, ...prev]);
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      return updated;
    });

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        let { error } = await client.from('gallery').upsert({
          id: newItem.id,
          title: newItem.title,
          category: newItem.category,
          image: newItem.image,
          images: newItem.images,
          description: newItem.description,
          date: newItem.date,
          created_at: newItem.createdAt
        });
        if (error) {
          console.error('Supabase addGallery error:', error);
          showToast(`Galeri disimpan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast(`Album galeri "${newItem.title}" berhasil disimpan otomatis ke Supabase Cloud!`, 'success');
        }
      } catch (err: any) {
        showToast(`Album galeri disimpan lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast(`Album galeri "${newItem.title}" (${imagesList.length} foto) berhasil ditambahkan ke penyimpanan lokal.`, 'success');
    }
  };

  const updateGalleryItem = async (id: string, updatedData: Partial<GalleryItem>) => {
    let mergedGallery: GalleryItem | null = null;
    setGallery((prev) => {
      const updated = sortGalleryDescending(
        prev.map((g) => {
          if (g.id === id) {
            mergedGallery = { ...g, ...updatedData };
            if (updatedData.images && updatedData.images.length > 0 && !updatedData.image) {
              mergedGallery.image = updatedData.images[0];
            }
            return mergedGallery;
          }
          return g;
        })
      );
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      return updated;
    });

    if (mergedGallery) {
      setSelectedGalleryState((curr) => (curr?.id === id ? mergedGallery : curr));
    }

    const client = getSupabaseClient();
    if (client && mergedGallery) {
      setSyncStatus('syncing');
      try {
        const g = mergedGallery as GalleryItem;
        const { error } = await client.from('gallery').upsert({
          id: g.id,
          title: g.title,
          category: g.category,
          image: g.image,
          images: g.images,
          description: g.description,
          date: g.date
        });
        if (error) {
          showToast(`Galeri diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast('Album galeri berhasil diperbarui di database Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast(`Album galeri berhasil diperbarui lokal.`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Album galeri berhasil diperbarui.', 'success');
    }
  };

  const deleteGalleryItem = async (id: string) => {
    setGallery((prev) => {
      const updated = prev.filter((g) => g.id !== id);
      _inMemoryGalleryCache = updated;
      try { sessionStorage.setItem('korwilcam_gallery', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSelectedGalleryState((curr) => (curr?.id === id ? null : curr));

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('gallery').delete().eq('id', id);
        if (error) {
          showToast(`Gagal hapus dari Supabase: ${error.message}`, 'error');
        } else {
          showToast('Foto kegiatan berhasil dihapus dari database Supabase.', 'info');
        }
      } catch (err: any) {
        showToast('Foto kegiatan dihapus lokal.', 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Foto kegiatan dihapus.', 'info');
    }
  };

  const addGalleryCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    const exists = galleryCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? galleryCategories : [...galleryCategories, trimmed];

    setGalleryCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_gallery_categories', JSON.stringify(updatedCategories));
    } catch {}

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.from('gallery').upsert({
          id: 'system-gallery-categories',
          title: 'System Gallery Categories',
          category: 'System',
          description: JSON.stringify(updatedCategories),
          image: '',
          date: new Date().toISOString().split('T')[0]
        });

        if (error) {
          console.warn('Gagal menyimpan kategori galeri ke Supabase:', error.message);
          showToast(`Kategori galeri tersimpan lokal. Supabase: ${error.message}`, 'info');
          return false;
        } else {
          showToast(`Kategori galeri "${trimmed}" berhasil disimpan di database Supabase Cloud!`, 'success');
          return true;
        }
      } catch (err: any) {
        showToast('Kategori galeri tersimpan di penyimpanan lokal.', 'info');
        return false;
      }
    } else {
      showToast(`Kategori galeri "${trimmed}" berhasil ditambahkan!`, 'success');
      return true;
    }
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
    let mergedStaff: StaffProfile | null = null;
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const rawPhoto = updatedData.photo !== undefined ? String(updatedData.photo).trim() : String(s.photo || '').trim();
          const cleanPhoto = (rawPhoto.includes('unsplash.com') || rawPhoto.includes('photo-1560250097')) ? '' : rawPhoto;
          mergedStaff = {
            ...s,
            ...updatedData,
            name: updatedData.name ? updatedData.name.trim() : s.name,
            role: updatedData.role ? updatedData.role.trim() : s.role,
            nip: updatedData.nip !== undefined ? updatedData.nip.trim() : s.nip,
            photo: cleanPhoto,
            division: updatedData.division || s.division
          };
          return mergedStaff;
        }
        return s;
      })
    );

    const client = getSupabaseClient();
    if (client && mergedStaff) {
      setSyncStatus('syncing');
      try {
        const st = mergedStaff as StaffProfile;
        const { error } = await client.from('staff').upsert({
          id: st.id,
          name: st.name,
          role: st.role,
          nip: st.nip,
          photo: st.photo,
          division: st.division
        });
        if (error) {
          showToast(`Data staf diperbarui lokal. Supabase: ${error.message}`, 'error');
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
    setStaff((prev) => prev.filter((s) => s.id !== id));

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

  // OFFICE PROFILE (Auto-save to Supabase & local state)
  const updateOfficeProfile = async (profileData: Partial<OfficeProfile>): Promise<boolean> => {
    const updated = { ...officeProfile, ...profileData };
    setOfficeProfile(updated);

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

  // SOP PELAYANAN (Auto-save to Supabase sop_pelayanan table & local state)
  const updateSOPImageUrl = async (url: string): Promise<boolean> => {
    const formatted = formatGoogleDriveImageUrl(url);
    setSopImageUrl(formatted);
    localStorage.setItem('korwilcam_sop_image_url', formatted);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        if (formatted) {
          // 1. Simpan ke tabel dedicated sop_pelayanan
          let savedToSopTable = false;
          try {
            const { error: sopTableErr } = await client.from('sop_pelayanan').upsert({
              id: 'main',
              title: 'Bagan Alur SOP Pelayanan',
              image_url: formatted,
              description: 'Standar Operasional Prosedur Pelayanan Pendidikan Korwilcam Purwodadi',
              updated_at: new Date().toISOString()
            });
            if (!sopTableErr) {
              savedToSopTable = true;
            }
          } catch (_) {}

          // 2. Simpan juga ke tabel documents sebagai cadangan
          const { error: docErr } = await client.from('documents').upsert({
            id: 'sop-main',
            title: 'Bagan SOP Pelayanan',
            category: 'SOP Pelayanan',
            file_type: 'IMAGE',
            file_size: '1 MB',
            download_count: 0,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            description: 'Bagan Alur Standar Operasional Prosedur Pelayanan Pendidikan Korwilcam Purwodadi',
            download_url: formatted
          });

          if (savedToSopTable || !docErr) {
            showToast('Tautan bagan SOP Pelayanan berhasil disimpan ke Supabase Cloud!', 'success');
            return true;
          } else {
            showToast(`Tautan SOP tersimpan lokal. Supabase: ${docErr?.message || 'Error'}`, 'error');
            return false;
          }
        } else {
          try { await client.from('sop_pelayanan').delete().eq('id', 'main'); } catch (_) {}
          try { await client.from('documents').delete().eq('id', 'sop-main'); } catch (_) {}
          showToast('Tautan bagan SOP Pelayanan berhasil dihapus.', 'info');
          return true;
        }
      } catch (err: any) {
        showToast('Tautan SOP disimpan lokal.', 'info');
        return false;
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Tautan gambar bagan SOP Pelayanan berhasil disimpan di penyimpanan lokal.', 'success');
      return true;
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload: any = {
          id: newOrg.id,
          slug: newOrg.slug,
          name: newOrg.name,
          short_name: newOrg.shortName,
          description: newOrg.description,
          logo: newOrg.logo || '',
          cover_image: newOrg.coverImage || '',
          leader: newOrg.leader,
          vision: newOrg.vision,
          missions: newOrg.missions,
          officials: newOrg.officials,
          address: newOrg.address || '',
          phone: newOrg.phone || '',
          email: newOrg.email || '',
          social_media: newOrg.socialMedia || {},
          assigned_username: newOrg.assignedUsername || null,
          updated_at: newOrg.updatedAt
        };
        const { error: upsertErr } = await client.from('organizations').upsert(payload);
        if (upsertErr) {
          // Retry tanpa assigned_username jika kolom belum ada di Supabase
          delete payload.assigned_username;
          await client.from('organizations').upsert(payload);
        }
      } catch (err) {
        console.warn('Supabase organization upsert warning:', err);
      }
    }
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
    const client = getSupabaseClient();
    if (client && targetOrg) {
      try {
        const payload: any = {
          id: targetOrg.id,
          slug: targetOrg.slug,
          name: targetOrg.name,
          short_name: targetOrg.shortName,
          description: targetOrg.description,
          logo: targetOrg.logo || '',
          cover_image: targetOrg.coverImage || '',
          leader: targetOrg.leader,
          vision: targetOrg.vision,
          missions: targetOrg.missions,
          officials: targetOrg.officials,
          address: targetOrg.address || '',
          phone: targetOrg.phone || '',
          email: targetOrg.email || '',
          social_media: targetOrg.socialMedia || {},
          assigned_username: targetOrg.assignedUsername || null,
          updated_at: targetOrg.updatedAt
        };
        const { error: upsertErr } = await client.from('organizations').upsert(payload);
        if (upsertErr) {
          // Retry tanpa assigned_username jika kolom belum ada di Supabase
          delete payload.assigned_username;
          await client.from('organizations').upsert(payload);
        }
      } catch (err) {
        console.warn('Supabase organization update warning:', err);
      }
    }
    showToast('Pengaturan organisasi berhasil disimpan dan disinkronkan!', 'success');
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('organizations').delete().eq('id', target?.id || id);
      } catch (err) {
        console.warn('Supabase organization delete warning:', err);
      }
    }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('daftar_guru').upsert({
          id: newTeacher.id,
          no: newTeacher.no,
          nama: newTeacher.nama,
          nip: newTeacher.nip || '-',
          status_pegawai: newTeacher.statusPegawai,
          instansi: newTeacher.instansi,
          created_at: newTeacher.createdAt,
          updated_at: newTeacher.updatedAt
        });
      } catch (err) {
        console.warn('Supabase addTeacher warning:', err);
      }
    }
    showToast(`Data guru "${newTeacher.nama}" berhasil ditambahkan!`, 'success');
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
    const client = getSupabaseClient();
    if (client && targetTeacher) {
      try {
        await client.from('daftar_guru').upsert({
          id: targetTeacher.id,
          no: targetTeacher.no,
          nama: targetTeacher.nama,
          nip: targetTeacher.nip || '-',
          status_pegawai: targetTeacher.statusPegawai,
          instansi: targetTeacher.instansi,
          created_at: targetTeacher.createdAt || new Date().toISOString(),
          updated_at: targetTeacher.updatedAt
        });
      } catch (err) {
        console.warn('Supabase updateTeacher warning:', err);
      }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('daftar_guru').delete().match({ id });
      } catch (err) {
        console.warn('Supabase deleteTeacher warning:', err);
      }
    }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        const payload = addedList.map((t) => ({
          id: t.id,
          no: t.no,
          nama: t.nama,
          nip: t.nip || '-',
          status_pegawai: t.statusPegawai,
          instansi: t.instansi,
          created_at: t.createdAt,
          updated_at: t.updatedAt
        }));
        await client.from('daftar_guru').upsert(payload);
      } catch (err) {
        console.warn('Supabase batchAddTeachers warning:', err);
      }
    }
    showToast(`Berhasil menambahkan ${addedList.length} data guru!`, 'success');
    return true;
  };

  const clearAllTeachers = async (): Promise<boolean> => {
    setTeachers([]);
    try {
      localStorage.setItem('korwilcam_teachers', JSON.stringify([]));
    } catch (e) {}

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('daftar_guru').delete().neq('id', 'dummy-never-match');
      } catch (err) {
        console.warn('Supabase clearAllTeachers warning:', err);
      }
    }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('service_requirements').upsert({
          id: newItem.id,
          title: newItem.title,
          category: newItem.category || 'Kepegawaian & GTK',
          description: newItem.description || '',
          requirements: newItem.requirements || [],
          notes: newItem.notes || '',
          estimated_time: newItem.estimatedTime || '1-3 Hari Kerja',
          fee: newItem.fee || 'Gratis / Rp 0',
          sort_order: newItem.order,
          created_at: newItem.createdAt,
          updated_at: newItem.updatedAt
        });
      } catch (err) {
        console.warn('Supabase addServiceRequirement warning:', err);
      }
    }
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
    }
    const client = getSupabaseClient();
    if (client && target) {
      try {
        await client.from('service_requirements').upsert({
          id: target.id,
          title: target.title,
          category: target.category || 'Kepegawaian & GTK',
          description: target.description || '',
          requirements: target.requirements || [],
          notes: target.notes || '',
          estimated_time: target.estimatedTime || '1-3 Hari Kerja',
          fee: target.fee || 'Gratis / Rp 0',
          sort_order: target.order || 1,
          created_at: target.createdAt || new Date().toISOString(),
          updated_at: target.updatedAt
        });
      } catch (err) {
        console.warn('Supabase updateServiceRequirement warning:', err);
      }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('service_requirements').delete().match({ id });
      } catch (err) {
        console.warn('Supabase deleteServiceRequirement warning:', err);
      }
    }
    showToast(`Layanan "${target?.title || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const resetServiceRequirements = async (): Promise<boolean> => {
    setServiceRequirements([]);
    try {
      localStorage.setItem('korwilcam_service_requirements', JSON.stringify([]));
    } catch (e) {}
    showToast('Data persyaratan pelayanan telah dikosongkan!', 'info');
    return true;
  };

  const addServiceRequirementCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    if (!trimmed) return false;

    const exists = serviceRequirementCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
    const updatedCategories = exists ? serviceRequirementCategories : [...serviceRequirementCategories, trimmed];

    setServiceRequirementCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_service_categories', JSON.stringify(updatedCategories));
    } catch {}

    const client = getSupabaseClient();
    if (client) {
      try {
        // 1. Simpan ke system record di tabel service_requirements (pasti ada)
        await client.from('service_requirements').upsert({
          id: 'system-service-categories',
          title: 'System Service Categories',
          category: 'System',
          description: 'Master kategori persyaratan pelayanan',
          requirements: updatedCategories,
          notes: JSON.stringify(updatedCategories),
          estimated_time: '1 Hari',
          fee: 'Gratis',
          sort_order: -999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        // 2. Simpan juga ke tabel service_categories jika tabel ini sudah dibuat di Supabase
        try {
          await client.from('service_categories').upsert({
            id: `cat-${trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
            name: trimmed,
            created_at: new Date().toISOString()
          }, { onConflict: 'name' });
        } catch {}

        showToast(`Kategori "${trimmed}" berhasil disimpan di Supabase Cloud untuk seluruh admin!`, 'success');
        return true;
      } catch (err: any) {
        console.warn('Gagal sinkron kategori ke Supabase:', err);
        showToast('Kategori tersimpan di penyimpanan lokal.', 'info');
        return false;
      }
    } else {
      showToast(`Kategori "${trimmed}" berhasil ditambahkan!`, 'success');
      return true;
    }
  };

  const deleteServiceRequirementCategory = async (categoryName: string): Promise<boolean> => {
    const trimmed = categoryName.trim();
    const updatedCategories = serviceRequirementCategories.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());

    setServiceRequirementCategories(updatedCategories);
    try {
      localStorage.setItem('korwilcam_service_categories', JSON.stringify(updatedCategories));
    } catch {}

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('service_requirements').upsert({
          id: 'system-service-categories',
          title: 'System Service Categories',
          category: 'System',
          description: 'Master kategori persyaratan pelayanan',
          requirements: updatedCategories,
          notes: JSON.stringify(updatedCategories),
          estimated_time: '1 Hari',
          fee: 'Gratis',
          sort_order: -999,
          updated_at: new Date().toISOString()
        });

        try {
          await client.from('service_categories').delete().eq('name', trimmed);
        } catch {}
      } catch (err) {
        console.warn('Gagal menghapus kategori dari Supabase:', err);
      }
    }
    return true;
  };

  // ==========================================================
  // PERMINTAAN DATA (WEBVIEW) CRUD
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('data_requests').upsert({
          id: newItem.id,
          title: newItem.title,
          slug: newItem.slug,
          url: newItem.url,
          description: newItem.description || '',
          crop_top: newItem.cropTop || 0,
          is_active: newItem.isActive !== false,
          sort_order: newItem.order,
          created_at: newItem.createdAt,
          updated_at: newItem.updatedAt
        });
      } catch (err) {
        console.warn('Supabase addDataRequest warning:', err);
      }
    }
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
    const client = getSupabaseClient();
    if (client && target) {
      try {
        await client.from('data_requests').upsert({
          id: target.id,
          title: target.title,
          slug: target.slug || generateDataRequestSlug(target.title),
          url: target.url,
          description: target.description || '',
          crop_top: target.cropTop || 0,
          is_active: target.isActive !== false,
          sort_order: target.order || 1,
          created_at: target.createdAt || new Date().toISOString(),
          updated_at: target.updatedAt
        });
      } catch (err) {
        console.warn('Supabase updateDataRequest warning:', err);
      }
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

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('data_requests').delete().match({ id });
      } catch (err) {
        console.warn('Supabase deleteDataRequest warning:', err);
      }
    }
    showToast(`Tautan "${target?.title || ''}" berhasil dihapus!`, 'info');
    return true;
  };

  const toggleDataRequestActive = async (id: string): Promise<boolean> => {
    const target = dataRequests.find((d) => d.id === id);
    if (!target) return false;
    return updateDataRequest(id, { isActive: !target.isActive });
  };

  const resetToDefaultData = () => {
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
        selectedServiceRequirement,
        setSelectedServiceRequirement,
        addServiceRequirement,
        updateServiceRequirement,
        deleteServiceRequirement,
        resetServiceRequirements,
        addServiceRequirementCategory,
        deleteServiceRequirementCategory,
        dataRequests,
        selectedDataRequestSlug,
        setSelectedDataRequestSlug,
        addDataRequest,
        updateDataRequest,
        deleteDataRequest,
        toggleDataRequestActive,
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
        selectedDocument,
        setSelectedDocument,
        incrementDocumentDownloadCount,
        isAuthenticated,
        currentUser,
        adminUsers,
        login,
        logout,
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
        addNews,
        updateNews,
        deleteNews,
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
        updateOfficeProfile,
        sopImageUrl,
        updateSOPImageUrl,
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
        closeNoticePopup
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
