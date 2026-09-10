export type SchoolLevel = 'SD' | 'TK' | 'PAUD';
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

export type NewsCategory = 'Kedinasan' | 'SD' | 'TK/PAUD' | 'Prestasi' | 'Pengumuman' | string;

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  summary: string;
  content: string;
  author: string;
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
  target: 'Semua Satuan' | 'SD' | 'TK/PAUD';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  summary: string;
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
}

export type StaffDivision = 
  | 'Pimpinan Korwilcam Purwodadi' 
  | 'Pengawas SD' 
  | 'Pengawas TK' 
  | 'Penilik PAUD' 
  | 'Staf'
  | 'Pimpinan' 
  | 'Penilik PAUD/TK' 
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

