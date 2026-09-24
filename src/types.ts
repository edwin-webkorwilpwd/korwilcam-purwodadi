export type SchoolLevel = 'SD' | 'TK' | 'PAUD' | 'KB';
export type SchoolStatus = 'Negeri' | 'Swasta';
export type Accreditation = 'A' | 'B' | 'C' | 'Belum Terakreditasi';

export interface School {
  id: string;
  name: string;
  level: SchoolLevel;
  status: SchoolStatus;
  npsn: string;
  akreditasi: Accreditation;
  headmaster: string;
  address: string;
  desa: string;
  studentsCount: number;
  teachersCount: number;
  phone: string;
  email: string;
  image: string;
  coordinates?: string;
  titikKoordinat?: string;
  featured?: boolean;
}

export type NewsCategory = 'Kedinasan' | 'SD' | 'TK/PAUD' | 'TK/KB' | 'Prestasi' | 'Pengumuman' | string;

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  summary: string;
  content: string;
  author: string;
  authorId?: string;
  authorRole?: string;
  date: string;
  image: string;
  views: number;
  totalReadSeconds?: number;
  readCount?: number;
  isPinned?: boolean;
  tags: string[];
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  urgency: 'Penting' | 'Biasa' | 'Mendesak';
  target: 'Semua Satuan' | 'SD' | 'TK/PAUD' | 'TK/KB';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  summary: string;
  serviceRequirementId?: string;
  serviceRequirementTitle?: string;
  sourceDocumentId?: string;
  author?: string;
  authorId?: string;
  authorRole?: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  targetAudience: string;
  status: 'Akan Datang' | 'Sedang Berlangsung' | 'Selesai';
}

export interface AulaAgendaBooking {
  id: string;
  timestamp?: string;
  namaPJ: string;
  organisasi: string;
  whatsapp?: string;
  tanggalPenggunaan: string;
  jamPemakaian: string;
  kategori: string;
  keterangan: string;
  statusPersetujuan: string;
  nip?: string;
}

export interface DocumentDownload {
  id: string;
  title: string;
  slug?: string;
  category: 'Kurikulum' | 'Surat Edaran' | 'Blanko GTK' | 'Juknis Lomba' | string;
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  downloadCount: number;
  date: string;
  description: string;
  downloadUrl: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  slug?: string;
  category: 'Kegiatan Belajar' | 'Lomba & Prestasi' | 'Rakor & Pelatihan' | 'Upacara' | string;
  date: string;
  image: string;
  images?: string[];
  description: string;
  createdAt?: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
}

export type StaffDivision = 
  | 'Pimpinan Korwilcam Purwodadi' 
  | 'Pengawas SD' 
  | 'Pengawas TK' 
  | 'Penilik PAUD' 
  | 'Penilik KB'
  | 'Staf'
  | 'Pimpinan' 
  | 'Penilik PAUD/TK' 
  | 'Penilik KB/TK'
  | 'Tata Usaha';

export interface StaffProfile {
  id: string;
  name: string;
  role: string;
  nip: string;
  photo: string;
  division: StaffDivision;
}

export interface OfficeProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  workingHours: string;
  korwilName: string;
  korwilNip: string;
  korwilPhoto: string;
  greetingTitle: string;
  greetingText: string;
  vision: string;
  missions: string[];
  heroTitle?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  korwilQuote?: string;
  heroDriveFolderUrl?: string;
  heroSlideshowImages?: string[];
  heroSlideshowInterval?: number;
}

export interface ComplaintMessage {
  id: string;
  name: string;
  phone: string;
  schoolOrOrigin: string;
  category: string;
  message: string;
  date: string;
  status: 'Baru' | 'Dibaca' | 'Selesai';
}

export type AdminRole = 'Super Admin' | 'Admin' | 'Penulis';

export interface AdminUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: AdminRole;
  email?: string;
  avatar?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationLeader {
  name: string;
  title?: string;
  period?: string;
  photo?: string;
  speechTitle?: string;
  speech: string;
}

export interface OrganizationOfficial {
  id: string;
  name: string;
  role: string;
  nip?: string;
  photo?: string;
  division?: string;
  order?: number;
}

export interface OrganizationSocialMedia {
  website?: string;
  tiktok?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface EducationalOrganization {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  logo?: string;
  coverImage?: string;
  leader: OrganizationLeader;
  vision: string;
  missions: string[];
  officials: OrganizationOfficial[];
  address?: string;
  phone?: string;
  email?: string;
  socialMedia?: OrganizationSocialMedia;
  assignedUsername?: string;
  updatedAt?: string;
}

export type TeacherEmployeeStatus = 'PNS' | 'PPPK' | 'GTT' | 'Guru Honor Sekolah' | 'Tenaga Kependidikan' | string;

export interface TeacherNominative {
  id: string;
  no: number;
  nama: string;
  nip: string;
  statusPegawai: string;
  instansi: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceRequirement {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  description?: string;
  requirements: string[];
  notes?: string;
  estimatedTime?: string;
  fee?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataRequestLink {
  id: string;
  title: string;
  slug?: string;
  url: string;
  description?: string;
  cropTop?: number;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type SocialPlatform = 'instagram' | 'youtube' | 'tiktok' | 'facebook' | 'x';

export interface SocialMediaItem {
  id: string;
  platform: SocialPlatform;
  name: string;
  badge: string;
  username: string;
  followers: string;
  description: string;
  buttonLabel: string;
  url: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  targetUrl?: string;
  imageUrl?: string;
  sentAt: string;
  recipientsCount?: number;
  oneSignalId?: string;
  status: 'sent' | 'failed';
  errorMessage?: string;
  createdBy?: string;
}

export interface OneSignalConfig {
  appId: string;
  apiKey: string;
  isEnabled: boolean;
}

export type AchievementCategory = 'Siswa' | 'Guru';

export type AchievementLevel = 
  | 'Kecamatan' 
  | 'Kabupaten' 
  | 'Provinsi' 
  | 'Nasional' 
  | 'Internasional';

export type AchievementField = 
  | 'Sains / OSN' 
  | 'Olahraga / O2SN' 
  | 'Seni & Budaya / FLS2N' 
  | 'Keagamaan / MAPSI' 
  | 'Literasi / FTBI' 
  | 'Inovasi GTK' 
  | 'Lainnya';

export interface Achievement {
  id: string;
  title: string;              // Nama ajang / kompetisi (misal: "FLS2N Tari Tradisional", "OSN Matematika")
  category: AchievementCategory; // Siswa | Guru
  field: AchievementField | string; // Bidang
  rank: string;               // Juara 1, Juara 2, Juara 3, Harapan 1, dll.
  level: AchievementLevel;    // Tingkat
  recipientName: string;      // Nama siswa / guru
  schoolName: string;         // Asal sekolah
  year: number;               // Tahun (misal: 2026)
  eventDate?: string;         // Tanggal pelaksanaan
  mentorName?: string;        // Pembimbing / Pelatih
  photoUrl?: string;          // Link Google Drive foto peraih / piala
  certificateUrl?: string;    // Link Google Drive foto piagam
  description?: string;       // Catatan / Deskripsi singkat
  createdAt?: string;
  updatedAt?: string;
  authorId?: string;          // ID Akun pembuat (misal: usr-superadmin, usr-penulis-1)
  authorName?: string;        // Nama pembuat (misal: "Budi Santoso", "Admin")
  authorRole?: string;        // Role pembuat (misal: "Penulis", "Super Admin")
}



