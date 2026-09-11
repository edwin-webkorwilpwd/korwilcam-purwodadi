import React, { createContext, useContext, useState, useEffect } from 'react';
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
  OrganizationOfficial 
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
  initialOrganizations 
} from '../data/initialData';
import { getSupabaseClient, getSupabaseConfig, testSupabaseConnection, syncLocalConfigToServer } from '../lib/supabase';
import { fetchAulaAgendaFromSheet, FALLBACK_AULA_BOOKINGS, compareAgendaDatesDescending } from '../services/googleSheetService';
import { resolveNewsCandidates, resolveAnnouncementCandidates } from '../lib/shortLink';
import { normalizeToGoogleMapsUrl } from '../lib/coordinates';
import { getGallerySlug } from '../lib/galleryHelper';
import { formatGoogleDriveImageUrl, isGoogleDriveUrl } from '../lib/driveHelper';
import { getDocumentSlug, getDocumentDetailPath } from '../lib/documentHelper';

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
    const saved = localStorage.getItem('korwilcam_news');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialNews);
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
    const saved = localStorage.getItem('korwilcam_announcements');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialAnnouncements);
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
    const saved = localStorage.getItem('korwilcam_documents');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialDocuments);
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
    const saved = localStorage.getItem('korwilcam_gallery');
    return saved ? JSON.parse(saved) : (isDbConfigured ? [] : initialGallery);
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
  const [organizations, setOrganizations] = useState<EducationalOrganization[]>(() => {
    try {
      const saved = localStorage.getItem('korwilcam_organizations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialOrganizations;
    } catch {
      return initialOrganizations;
    }
  });
  const [selectedOrganizationSlug, setSelectedOrganizationSlugState] = useState<string | null>(null);

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

  // Sync to local storage for local resilience with quota protection
  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_schools', JSON.stringify(schools));
    } catch (e) {
      console.warn('localStorage save schools quota warning:', e);
    }
  }, [schools]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_news', JSON.stringify(news));
    } catch (e) {
      console.warn('localStorage save news quota warning:', e);
    }
  }, [news]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_announcements', JSON.stringify(announcements));
    } catch (e) {
      console.warn('localStorage save announcements quota warning:', e);
    }
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_agenda', JSON.stringify(agenda));
    } catch (e) {
      console.warn('localStorage save agenda quota warning:', e);
    }
  }, [agenda]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_documents', JSON.stringify(documents));
    } catch (e) {
      console.warn('localStorage save documents quota warning:', e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_gallery', JSON.stringify(gallery));
    } catch (e) {
      console.warn('localStorage save gallery quota warning:', e);
    }
  }, [gallery]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_office_profile', JSON.stringify(officeProfile));
    } catch (e) {
      console.warn('localStorage save office_profile quota warning:', e);
    }
  }, [officeProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_staff', JSON.stringify(staff));
    } catch (e) {
      console.warn('localStorage save staff quota warning:', e);
    }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_organizations', JSON.stringify(organizations));
    } catch (e) {
      console.warn('localStorage save organizations quota warning:', e);
    }
  }, [organizations]);

  useEffect(() => {
    try {
      localStorage.setItem('korwilcam_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.warn('localStorage save complaints quota warning:', e);
    }
  }, [complaints]);

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
            korwilQuote: (p.korwil_quote || initialOfficeProfile.korwilQuote || '').replace(/\bPAUD\b/gi, 'KB')
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

        setNews(actualArticles.map((n: any) => {
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
          return {
            id: String(n.id || `news-${Date.now()}`),
            title,
            slug,
            category: n.category || n.kategori || 'Kedinasan',
            summary: n.summary || n.ringkasan || (n.content ? String(n.content).substring(0, 150) : ''),
            content: n.content || n.isi || n.konten || '',
            author: n.author || n.penulis || 'Humas Korwilcam',
            date: n.date || n.tanggal || (n.created_at ? new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })),
            image: n.image || n.gambar || 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1000',
            views: Number(n.views || 0),
            totalReadSeconds: Number(n.total_read_seconds) || 0,
            readCount: Number(n.read_count) || 0,
            tags: parsedTags
          };
        }));
      }

      // Fetch announcements
      const { data: dbAnnouncements, error: annErr } = await client.from('announcements').select('*').order('created_at', { ascending: false });
      if (!annErr && dbAnnouncements) {
        setAnnouncements(dbAnnouncements.map((a: any) => {
          let fileSize = a.file_size || a.fileSize || '';
          let fileName = a.file_name || a.fileName || '';
          let fileType = a.file_type || a.fileType || '';
          let fileUrl = a.file_url || a.fileUrl || '';

          if (fileSize && fileSize.includes('|')) {
            const parts = fileSize.split('|');
            fileSize = parts[0] || '';
            fileName = parts[1] || fileName;
            fileType = parts[2] || fileType;
            fileUrl = parts[3] || fileUrl;
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
            summary: a.summary || a.ringkasan || title || ''
          };
        }));
      }

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

      // Fetch documents
      const { data: dbDocs, error: docErr } = await client.from('documents').select('*');
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

        setDocuments(actualDocs.map((d: any) => ({
          id: String(d.id || `doc-${Date.now()}`),
          title: String(d.title || d.judul || '').trim(),
          category: d.category || d.kategori || 'Surat Edaran',
          fileType: d.file_type || d.fileType || 'PDF',
          fileSize: d.file_size || d.fileSize || '500 KB',
          downloadCount: Number(d.download_count || d.downloadCount || 0),
          date: d.date || d.tanggal || '',
          description: d.description || d.deskripsi || '',
          downloadUrl: d.download_url || d.downloadUrl || '#'
        })));
      }

      // Fetch gallery
      const { data: dbGallery, error: galErr } = await client.from('gallery').select('*');
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

        setGallery(actualGal.map((g: any) => ({
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
          date: g.date || g.tanggal || ''
        })));
      }

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

      // Fetch organizations
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
            updatedAt: o.updated_at || o.updatedAt
          }));
          setOrganizations(mappedOrgs);
          try {
            localStorage.setItem('korwilcam_organizations', JSON.stringify(mappedOrgs));
          } catch {}
        }
      } catch (errOrgs) {
        console.warn('Tabel organizations belum terbaca:', errOrgs);
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
      await client.from('office_profile').upsert({
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
        korwil_quote: officeProfile.korwilQuote
      });

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
        date: n.date,
        image: n.image,
        views: n.views,
        tags: n.tags
      }));
      await client.from('news').upsert(newsPayload);

      // 4. Announcements
      const annPayload = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        date: a.date,
        urgency: a.urgency,
        target: a.target,
        file_size: [a.fileSize || '', a.fileName || '', a.fileType || '', a.fileUrl || ''].join('|'),
        summary: a.summary
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
        date: g.date
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
          updated_at: o.updatedAt || new Date().toISOString()
        }));
        await client.from('organizations').upsert(orgPayload);
      } catch (oErr) {
        console.warn('Gagal ekspor tabel organizations:', oErr);
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

    // Realtime Postgres Changes Subscription for Portal Data
    const channel = client
      .channel('korwilcam-realtime-listener')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schools' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'news' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'staff' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'office_profile' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sop_pelayanan' },
        () => {
          refreshFromSupabase();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organizations' },
        () => {
          refreshFromSupabase();
        }
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
      client.removeChannel(channel);
    };
  }, [isSupabaseActive]);

  const TAB_ROUTES: Record<string, { path: string; title: string }> = {
    'home': { path: '/beranda', title: 'Beranda - Portal Resmi Korwilcam Bidang Pendidikan Purwodadi' },
    'profile': { path: '/profil', title: 'Profil Instansi - Korwilcam Bidang Pendidikan Purwodadi' },
    'sop-pelayanan': { path: '/sop-pelayanan', title: 'SOP Pelayanan - Korwilcam Purwodadi' },
    'schools': { path: '/sekolah', title: 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi' },
    'news': { path: '/berita', title: 'Warta & Informasi Terkini - Korwilcam Purwodadi' },
    'organization': { path: '/organisasi', title: 'Organisasi Pendidikan - Korwilcam Purwodadi' },
    'downloads': { path: '/layanan/unduh-berkas', title: 'Layanan Unduh Berkas - Korwilcam Purwodadi' },
    'service-aula': { path: '/layanan/peminjaman-aula', title: 'Peminjaman Aula Korwilcam Purwodadi' },
    'service-cuti': { path: '/layanan/surat-cuti', title: 'Layanan Surat Cuti GTK Online - Korwilcam Purwodadi' },
    'service-survey': { path: '/layanan/survey-pelayanan', title: 'Survey Kepuasan Pelayanan Terpadu - Korwilcam Purwodadi' },
    'gallery': { path: '/galeri', title: 'Galeri Kegiatan & Dokumentasi - Korwilcam Purwodadi' },
    'contact': { path: '/kontak', title: 'Kontak & Layanan Pengaduan - Korwilcam Purwodadi' },
    'admin-login': { path: '/admin/login', title: 'Login Panel Admin - Korwilcam Purwodadi' },
    'admin-dashboard': { path: '/admin/dashboard', title: 'Dashboard Panel Admin - Korwilcam Purwodadi' }
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
    if (selectedSchool) {
      setSelectedSchoolState(null);
    }
    if (tab !== 'organization') {
      setSelectedOrganizationSlugState(null);
    }

    const route = TAB_ROUTES[tab];
    const targetPath = customPath || (route ? route.path : `/${tab}`);
    const targetTitle = route ? route.title : 'Kantor Korwilcam Bidang Pendidikan Purwodadi';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tab, path: targetPath }, '', targetPath);
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

      const finalUrl = searchStr ? `${returnPath}?${searchStr}` : returnPath;

      if (window.location.pathname + window.location.search !== finalUrl) {
        window.history.pushState({}, '', finalUrl);
      }
      document.title = TAB_ROUTES['schools']?.title || 'Daftar Sekolah SD, TK & KB - Korwilcam Purwodadi';
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
        const slug = decodeURIComponent(rawPath.replace(/^\/berita\//, ''));
        setActiveTabState('news');
        if (news.length > 0) {
          const found = news.find((n) => 
            n.slug === slug || 
            n.id === slug || 
            n.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
          );
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

      // Clear selectedNews, selectedAnnouncement, selectedGallery, selectedDocument, and selectedSchool if not viewing detail
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
      setSelectedDocumentState(null);
      setSelectedSchoolState(null);

      // Match path to tabs
      if (rawPath === '/' || rawPath === '/beranda' || rawPath === '/home') {
        setActiveTabState('home');
        document.title = TAB_ROUTES['home'].title;
      } else if (rawPath.startsWith('/profil')) {
        setActiveTabState('profile');
        document.title = TAB_ROUTES['profile'].title;
      } else if (rawPath.startsWith('/sop') || rawPath.startsWith('/sop-pelayanan')) {
        setActiveTabState('sop-pelayanan');
        document.title = TAB_ROUTES['sop-pelayanan']?.title || 'SOP Pelayanan - Korwilcam Purwodadi';
      } else if (rawPath.startsWith('/direktori-sekolah') || rawPath.startsWith('/sekolah')) {
        setActiveTabState('schools');
        document.title = TAB_ROUTES['schools'].title;
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
      } else if (rawPath.startsWith('/layanan') || rawPath.startsWith('/unduhan')) {
        if (rawPath.includes('aula')) {
          setActiveTabState('service-aula');
          document.title = TAB_ROUTES['service-aula'].title;
        } else if (rawPath.includes('cuti')) {
          setActiveTabState('service-cuti');
          document.title = TAB_ROUTES['service-cuti'].title;
        } else if (rawPath.includes('survey')) {
          setActiveTabState('service-survey');
          document.title = TAB_ROUTES['service-survey'].title;
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
      } else if (rawPath.startsWith('/admin')) {
        if (rawPath.includes('dashboard')) {
          setActiveTabState('admin-dashboard');
          document.title = TAB_ROUTES['admin-dashboard'].title;
        } else {
          setActiveTabState('admin-login');
          document.title = TAB_ROUTES['admin-login'].title;
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [news, announcements, gallery, documents, schools]);

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
    const newArticle: NewsArticle = {
      ...newsData,
      id: `news-${Date.now()}`,
      views: 0
    };
    setNews((prev) => [newArticle, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const payload: any = {
          id: newArticle.id,
          title: newArticle.title,
          slug: newArticle.slug,
          category: newArticle.category,
          summary: newArticle.summary,
          content: newArticle.content,
          author: newArticle.author,
          date: newArticle.date,
          image: newArticle.image,
          views: newArticle.views,
          tags: newArticle.tags
        };

        const { error } = await client.from('news').upsert(payload);

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
    let mergedNews: NewsArticle | null = null;
    setNews((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          mergedNews = { ...n, ...updatedData };
          return mergedNews;
        }
        return n;
      })
    );

    const client = getSupabaseClient();
    if (client && mergedNews) {
      setSyncStatus('syncing');
      try {
        const n = mergedNews as NewsArticle;
        const payload: any = {
          id: n.id,
          title: n.title,
          slug: n.slug,
          category: n.category,
          summary: n.summary,
          content: n.content,
          author: n.author,
          date: n.date,
          image: n.image,
          views: n.views,
          tags: n.tags
        };

        const { error } = await client.from('news').upsert(payload);

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
    setNews((prev) => prev.filter((n) => n.id !== id));

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
    let nextViews = 1;

    // 1. Update React state immediately (optimistic UI update)
    setNews((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          nextViews = (Number(n.views) || 0) + 1;
          return { ...n, views: nextViews };
        }
        return n;
      })
    );

    setSelectedNewsState((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, views: (Number(prev.views) || 0) + 1 };
      }
      return prev;
    });

    // 2. Persist to Supabase Cloud if connected
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: dbItem } = await client
          .from('news')
          .select('views')
          .eq('id', id)
          .single();

        const finalViews = dbItem ? (Number(dbItem.views) || 0) + 1 : nextViews;

        const { error } = await client
          .from('news')
          .update({ views: finalViews })
          .eq('id', id);

        if (!error && finalViews !== nextViews) {
          setNews((prev) =>
            prev.map((n) => (n.id === id ? { ...n, views: finalViews } : n))
          );
          setSelectedNewsState((prev) =>
            prev && prev.id === id ? { ...prev, views: finalViews } : prev
          );
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

  // ANNOUNCEMENTS CRUD (Auto-save to Supabase & local state)
  const addAnnouncement = async (annData: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const packedFileSize = [
          newAnn.fileSize || '',
          newAnn.fileName || '',
          newAnn.fileType || '',
          newAnn.fileUrl || ''
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
        if (error) {
          console.error('Supabase addAnnouncement error:', error);
          showToast(`Pengumuman disimpan lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast('Pengumuman resmi & berkas lampiran berhasil disimpan otomatis ke Supabase Cloud!', 'success');
        }
      } catch (err: any) {
        showToast(`Pengumuman disimpan lokal. Supabase error: ${err.message || err}`, 'info');
      } finally {
        setSyncStatus('connected');
      }
    } else {
      showToast('Pengumuman berhasil ditambahkan ke penyimpanan lokal.', 'success');
    }
  };

  const updateAnnouncement = async (id: string, updatedData: Partial<Announcement>) => {
    let mergedAnn: Announcement | null = null;
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          mergedAnn = { ...a, ...updatedData };
          return mergedAnn;
        }
        return a;
      })
    );

    const client = getSupabaseClient();
    if (client && mergedAnn) {
      setSyncStatus('syncing');
      try {
        const target = mergedAnn as Announcement;
        const packedFileSize = [
          target.fileSize || '',
          target.fileName || '',
          target.fileType || '',
          target.fileUrl || ''
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
        if (error) {
          console.error('Supabase updateAnnouncement error:', error);
          showToast(`Pengumuman diperbarui lokal. Gagal sinkron Supabase: ${error.message}`, 'error');
        } else {
          showToast('Pengumuman & berkas berhasil diperbarui di database Supabase Cloud!', 'success');
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
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));

    const client = getSupabaseClient();
    if (client) {
      setSyncStatus('syncing');
      try {
        const { error } = await client.from('announcements').delete().eq('id', id);
        if (error) {
          showToast(`Gagal menghapus dari Supabase: ${error.message}`, 'error');
        } else {
          showToast('Pengumuman berhasil dihapus dari database Supabase.', 'info');
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
      id: `gal-${Date.now()}`
    };
    setGallery((prev) => [newItem, ...prev]);

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
          date: newItem.date
        });
        if (error && error.message?.toLowerCase().includes('column')) {
          const retry = await client.from('gallery').upsert({
            id: newItem.id,
            title: newItem.title,
            category: newItem.category,
            image: newItem.image,
            description: newItem.description,
            date: newItem.date
          });
          error = retry.error;
        }
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
    setGallery((prev) =>
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

    const client = getSupabaseClient();
    if (client && mergedGallery) {
      setSyncStatus('syncing');
      try {
        const g = mergedGallery as GalleryItem;
        let { error } = await client.from('gallery').upsert({
          id: g.id,
          title: g.title,
          category: g.category,
          image: g.image,
          images: g.images,
          description: g.description,
          date: g.date
        });
        if (error && error.message?.toLowerCase().includes('column')) {
          const retry = await client.from('gallery').upsert({
            id: g.id,
            title: g.title,
            category: g.category,
            image: g.image,
            description: g.description,
            date: g.date
          });
          error = retry.error;
        }
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
    setGallery((prev) => prev.filter((g) => g.id !== id));

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
        const { error } = await client.from('office_profile').upsert({
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
          korwil_quote: updated.korwilQuote
        });
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
    setOrganizations(updated);
    try {
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('organizations').upsert({
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
          updated_at: newOrg.updatedAt
        });
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
    setOrganizations(updated);
    try {
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    const targetOrg = updated.find((o) => o.id === id || o.slug === id);
    const client = getSupabaseClient();
    if (client && targetOrg) {
      try {
        await client.from('organizations').upsert({
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
          updated_at: targetOrg.updatedAt
        });
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
    setOrganizations(updated);
    try {
      localStorage.setItem('korwilcam_organizations', JSON.stringify(updated));
    } catch (e) {}

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('organizations').delete().match({ id });
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
        removeToast
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
