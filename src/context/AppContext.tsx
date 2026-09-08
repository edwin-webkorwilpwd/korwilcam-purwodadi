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
  AdminRole 
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
  initialComplaints 
} from '../data/initialData';
import { getSupabaseClient, getSupabaseConfig, testSupabaseConnection, syncLocalConfigToServer } from '../lib/supabase';
import { fetchAulaAgendaFromSheet, FALLBACK_AULA_BOOKINGS, compareAgendaDatesDescending } from '../services/googleSheetService';
import { resolveNewsCandidates, resolveAnnouncementCandidates } from '../lib/shortLink';
import { normalizeToGoogleMapsUrl } from '../lib/coordinates';
import { getGallerySlug } from '../lib/galleryHelper';

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
  announcements: Announcement[];
  agenda: AgendaEvent[];
  aulaBookings: AulaAgendaBooking[];
  loadingAulaBookings: boolean;
  refreshAulaBookings: () => Promise<void>;
  documents: DocumentDownload[];
  gallery: GalleryItem[];
  staff: StaffProfile[];
  officeProfile: OfficeProfile;
  complaints: ComplaintMessage[];
  
  // Navigation & modals
  activeTab: string;
  setActiveTab: (tab: string, customPath?: string) => void;
  selectedNews: NewsArticle | null;
  setSelectedNews: (news: NewsArticle | null) => void;
  selectedAnnouncement: Announcement | null;
  setSelectedAnnouncement: (ann: Announcement | null, customPath?: string) => void;
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  selectedGallery: GalleryItem | null;
  setSelectedGallery: (gallery: GalleryItem | null) => void;
  
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
  incrementNewsViews: (id: string) => Promise<void>;
  recordNewsReadingTime: (id: string, secondsSpent: number, isNewSession?: boolean) => Promise<void>;

  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  updateAnnouncement: (id: string, ann: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addDocument: (doc: Omit<DocumentDownload, 'id' | 'downloadCount'>) => void;
  updateDocument: (id: string, doc: Partial<DocumentDownload>) => void;
  deleteDocument: (id: string) => void;

  addAgenda: (item: Omit<AgendaEvent, 'id'>) => void;
  updateAgenda: (id: string, item: Partial<AgendaEvent>) => void;
  deleteAgenda: (id: string) => void;

  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, item: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;

  addStaff: (staffItem: Omit<StaffProfile, 'id'>) => Promise<boolean>;
  updateStaff: (id: string, staffItem: Partial<StaffProfile>) => Promise<boolean>;
  deleteStaff: (id: string) => Promise<boolean>;

  addComplaint: (comp: Omit<ComplaintMessage, 'id' | 'status' | 'date'>) => void;
  deleteComplaint: (id: string) => void;
  updateComplaintStatus: (id: string, status: 'Baru' | 'Dibaca' | 'Selesai') => void;

  updateOfficeProfile: (profile: Partial<OfficeProfile>) => Promise<boolean>;
  resetToDefaultData: () => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('korwilcam_schools');
    return saved ? JSON.parse(saved) : initialSchools;
  });

  const [news, setNews] = useState<NewsArticle[]>(() => {
    const saved = localStorage.getItem('korwilcam_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('korwilcam_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  const [agenda, setAgenda] = useState<AgendaEvent[]>(() => {
    const saved = localStorage.getItem('korwilcam_agenda');
    return saved ? JSON.parse(saved) : initialAgenda;
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
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('korwilcam_gallery');
    return saved ? JSON.parse(saved) : initialGallery;
  });

  const [officeProfile, setOfficeProfile] = useState<OfficeProfile>(() => {
    const saved = localStorage.getItem('korwilcam_office_profile');
    return saved ? JSON.parse(saved) : initialOfficeProfile;
  });

  const [staff, setStaff] = useState<StaffProfile[]>(() => {
    const saved = localStorage.getItem('korwilcam_staff');
    return saved ? JSON.parse(saved) : initialStaff;
  });

  const [complaints, setComplaints] = useState<ComplaintMessage[]>(() => {
    const saved = localStorage.getItem('korwilcam_complaints');
    return saved ? JSON.parse(saved) : initialComplaints;
  });

  const [activeTab, setActiveTabState] = useState<string>('home');
  const [selectedNews, setSelectedNewsState] = useState<NewsArticle | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncementState] = useState<Announcement | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [selectedGallery, setSelectedGalleryState] = useState<GalleryItem | null>(null);

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
      
      // Fetch schools
      const { data: dbSchools } = await client.from('schools').select('*');
      if (dbSchools && dbSchools.length > 0) {
        setSchools(dbSchools.map((s: any) => ({
          id: s.id,
          name: s.name,
          level: s.level,
          status: s.status,
          npsn: s.npsn,
          akreditasi: s.akreditasi,
          headmaster: s.headmaster || '',
          address: s.address || '',
          desa: s.desa || '',
          studentsCount: s.students_count || 0,
          teachersCount: s.teachers_count || 0,
          phone: s.phone || '',
          email: s.email || '',
          image: s.image || '',
          coordinates: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || ''),
          titikKoordinat: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || '')
        })));
      }

      // Fetch news
      const { data: dbNews } = await client.from('news').select('*').order('created_at', { ascending: false });
      if (dbNews && dbNews.length > 0) {
        setNews(dbNews.map((n: any) => ({
          id: n.id,
          title: n.title,
          slug: n.slug,
          category: n.category,
          summary: n.summary,
          content: n.content,
          author: n.author,
          date: n.date,
          image: n.image,
          views: n.views || 0,
          totalReadSeconds: Number(n.total_read_seconds) || 0,
          readCount: Number(n.read_count) || 0,
          tags: Array.isArray(n.tags) ? n.tags : []
        })));
      }

      // Fetch announcements
      const { data: dbAnnouncements } = await client.from('announcements').select('*').order('created_at', { ascending: false });
      if (dbAnnouncements && dbAnnouncements.length > 0) {
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

          return {
            id: a.id,
            title: a.title,
            date: a.date,
            urgency: a.urgency,
            target: a.target,
            fileSize,
            fileUrl,
            fileName,
            fileType,
            summary: a.summary
          };
        }));
      }

      // Fetch agenda
      const { data: dbAgenda } = await client.from('agenda').select('*');
      if (dbAgenda && dbAgenda.length > 0) {
        setAgenda(dbAgenda.map((ag: any) => ({
          id: ag.id,
          title: ag.title,
          date: ag.date,
          time: ag.time,
          location: ag.location,
          organizer: ag.organizer,
          targetAudience: ag.target_audience,
          status: ag.status
        })));
      }

      // Fetch documents
      const { data: dbDocs } = await client.from('documents').select('*');
      if (dbDocs && dbDocs.length > 0) {
        setDocuments(dbDocs.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          fileType: d.file_type,
          fileSize: d.file_size,
          downloadCount: d.download_count || 0,
          date: d.date,
          description: d.description,
          downloadUrl: d.download_url
        })));
      }

      // Fetch gallery
      const { data: dbGallery } = await client.from('gallery').select('*');
      if (dbGallery && dbGallery.length > 0) {
        setGallery(dbGallery.map((g: any) => ({
          id: g.id,
          title: g.title,
          category: g.category,
          image: g.image,
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
          description: g.description,
          date: g.date
        })));
      }

      // Fetch staff from Supabase (sorted by created_at)
      try {
        const { data: dbStaff, error: staffErr } = await client
          .from('staff')
          .select('*')
          .order('created_at', { ascending: true });

        if (!staffErr && dbStaff) {
          if (dbStaff.length > 0) {
            setStaff(dbStaff.map((st: any) => ({
              id: st.id,
              name: st.name || '',
              role: st.role || '',
              nip: st.nip || '',
              photo: st.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
              division: st.division || 'Pengawas SD'
            })));
          } else {
            setStaff([]);
          }
        }
      } catch (stErr) {
        console.warn('Supabase fetch staff warning:', stErr);
      }

      // Fetch office profile
      const { data: dbProfile } = await client.from('office_profile').select('*').limit(1);
      if (dbProfile && dbProfile.length > 0) {
        const p = dbProfile[0];
        setOfficeProfile({
          name: p.name || initialOfficeProfile.name,
          tagline: p.tagline || initialOfficeProfile.tagline,
          address: p.address || initialOfficeProfile.address,
          phone: p.phone || initialOfficeProfile.phone,
          whatsapp: p.whatsapp || initialOfficeProfile.whatsapp,
          email: p.email || initialOfficeProfile.email,
          workingHours: p.working_hours || initialOfficeProfile.workingHours,
          korwilName: p.korwil_name || initialOfficeProfile.korwilName,
          korwilNip: p.korwil_nip || initialOfficeProfile.korwilNip,
          korwilPhoto: p.korwil_photo || initialOfficeProfile.korwilPhoto,
          greetingTitle: p.greeting_title || initialOfficeProfile.greetingTitle,
          greetingText: p.greeting_text || initialOfficeProfile.greetingText,
          vision: p.vision || initialOfficeProfile.vision,
          missions: Array.isArray(p.missions) ? p.missions : initialOfficeProfile.missions,
          heroTitle: p.hero_title,
          heroSubtitle: p.hero_subtitle,
          heroBadge: p.hero_badge,
          korwilQuote: p.korwil_quote
        });
      }

      // Fetch complaints
      const { data: dbComplaints } = await client.from('complaints').select('*').order('created_at', { ascending: false });
      if (dbComplaints && dbComplaints.length > 0) {
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
      const docPayload = documents.map((d) => ({
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
        async () => {
          const { data: dbSchools } = await client.from('schools').select('*');
          if (dbSchools) {
            setSchools(dbSchools.map((s: any) => ({
              id: s.id,
              name: s.name,
              level: s.level,
              status: s.status,
              npsn: s.npsn,
              akreditasi: s.akreditasi,
              headmaster: s.headmaster || '',
              address: s.address || '',
              desa: s.desa || '',
              studentsCount: Number(s.students_count) || 0,
              teachersCount: Number(s.teachers_count) || 0,
              phone: s.phone || '',
              email: s.email || '',
              image: s.image || '',
              coordinates: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || ''),
              titikKoordinat: normalizeToGoogleMapsUrl(s.titik_koordinat || s.coordinates || '')
            })));
          }
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
    'schools': { path: '/direktori-sekolah', title: 'Direktori Sekolah SD/TK/PAUD - Korwilcam Purwodadi' },
    'news': { path: '/berita', title: 'Warta & Informasi Terkini - Korwilcam Purwodadi' },
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
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setSelectedNews = (article: NewsArticle | null) => {
    setSelectedNewsState(article);
    if (article) {
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);
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

      // Clear selectedNews, selectedAnnouncement, and selectedGallery if not viewing detail
      setSelectedNewsState(null);
      setSelectedAnnouncementState(null);
      setSelectedGalleryState(null);

      // Match path to tabs
      if (rawPath === '/' || rawPath === '/beranda' || rawPath === '/home') {
        setActiveTabState('home');
        document.title = TAB_ROUTES['home'].title;
      } else if (rawPath.startsWith('/profil')) {
        setActiveTabState('profile');
        document.title = TAB_ROUTES['profile'].title;
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
  }, [news, announcements, gallery]);

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
    const newSchool: School = {
      ...schoolData,
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
    let mergedSchool: School | null = null;
    setSchools((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          mergedSchool = { ...s, ...updatedData };
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

  // STAFF CRUD (Auto-save to Supabase & local state)
  const addStaff = async (staffData: Omit<StaffProfile, 'id'>): Promise<boolean> => {
    const newStaff: StaffProfile = {
      ...staffData,
      name: staffData.name.trim(),
      role: staffData.role.trim(),
      nip: (staffData.nip || '').trim(),
      photo: staffData.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600',
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
          mergedStaff = {
            ...s,
            ...updatedData,
            name: updatedData.name ? updatedData.name.trim() : s.name,
            role: updatedData.role ? updatedData.role.trim() : s.role,
            nip: updatedData.nip !== undefined ? updatedData.nip.trim() : s.nip,
            photo: updatedData.photo ? updatedData.photo : s.photo,
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
        incrementNewsViews,
        recordNewsReadingTime,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        addDocument,
        updateDocument,
        deleteDocument,
        addAgenda,
        updateAgenda,
        deleteAgenda,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addStaff,
        updateStaff,
        deleteStaff,
        addComplaint,
        deleteComplaint,
        updateComplaintStatus,
        updateOfficeProfile,
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
