-- ==========================================================
-- SKEMA DATABASE SUPABASE: PORTAL KORWILCAM PURWODADI
-- ==========================================================
-- Jalankan seluruh script ini di menu "SQL Editor" pada dashboard Supabase Anda.

-- 1. TABEL PROFIL KANTOR (OFFICE_PROFILE)
CREATE TABLE IF NOT EXISTS office_profile (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL,
  tagline TEXT,
  address TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  working_hours TEXT,
  korwil_name TEXT,
  korwil_nip TEXT,
  korwil_photo TEXT,
  greeting_title TEXT,
  greeting_text TEXT,
  vision TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_badge TEXT,
  korwil_quote TEXT,
  hero_drive_folder_url TEXT,
  hero_slideshow_images JSONB DEFAULT '[]'::jsonb,
  hero_slideshow_interval INTEGER DEFAULT 5,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi Kolom Tambahan (Aman dijalankan jika tabel office_profile sudah ada sebelumnya)
ALTER TABLE office_profile ADD COLUMN IF NOT EXISTS hero_drive_folder_url TEXT;
ALTER TABLE office_profile ADD COLUMN IF NOT EXISTS hero_slideshow_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE office_profile ADD COLUMN IF NOT EXISTS hero_slideshow_interval INTEGER DEFAULT 5;

-- 2. TABEL SATUAN SEKOLAH (SD, TK, PAUD)
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL, -- 'SD', 'TK', 'PAUD'
  status TEXT NOT NULL, -- 'Negeri', 'Swasta'
  npsn TEXT NOT NULL,
  akreditasi TEXT NOT NULL, -- 'A', 'B', 'C', 'Belum Terakreditasi'
  headmaster TEXT,
  address TEXT,
  desa TEXT,
  students_count INTEGER DEFAULT 0,
  teachers_count INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  image TEXT,
  titik_koordinat TEXT,
  coordinates TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABEL ARTIKEL BERITA & INFORMASI
CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Kedinasan', 'SD', 'TK/PAUD', 'Prestasi'
  summary TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  date TEXT NOT NULL,
  image TEXT,
  views INTEGER DEFAULT 0,
  total_read_seconds INTEGER DEFAULT 0,
  read_count INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi kolom durasi membaca & akumulasi rata-rata (jika tabel news sudah pernah dibuat sebelumnya):
ALTER TABLE news ADD COLUMN IF NOT EXISTS total_read_seconds INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS read_count INTEGER DEFAULT 0;

-- 4. TABEL PENGUMUMAN & SURAT EDARAN
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  urgency TEXT NOT NULL, -- 'Mendesak', 'Penting', 'Biasa'
  target TEXT NOT NULL, -- 'Semua Satuan', 'SD', 'TK/PAUD'
  file_size TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrasi kolom file lampiran pengumuman (jika tabel sudah pernah dibuat sebelumnya):
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS file_size TEXT;

-- 5. TABEL AGENDA KEGIATAN WILAYAH
CREATE TABLE IF NOT EXISTS agenda (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  organizer TEXT,
  target_audience TEXT,
  status TEXT NOT NULL, -- 'Akan Datang', 'Sedang Berlangsung', 'Selesai'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABEL DOKUMEN & LAYANAN UNDUHAN
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Kurikulum', 'Surat Edaran', 'Blanko GTK', 'Juknis Lomba'
  file_type TEXT NOT NULL, -- 'PDF', 'DOCX', 'XLSX'
  file_size TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  date TEXT NOT NULL,
  description TEXT,
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABEL GALERI DOKUMENTASI KEGIATAN
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'Kegiatan Belajar', 'Lomba & Prestasi', 'Rakor & Pelatihan', 'Upacara'
  image TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABEL JAJARAN PEJABAT & PENGAWAS/PENILIK
CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  nip TEXT,
  photo TEXT,
  division TEXT NOT NULL, -- 'Pimpinan', 'Pengawas SD', 'Penilik PAUD/TK', 'Tata Usaha'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABEL KOTAK MASUK ADUAN & ASPIRASI MASYARAKAT
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  school_or_origin TEXT,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'Baru', -- 'Baru', 'Dibaca', 'Selesai'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABEL AKUN PENGELOLA WEB (ADMIN_USERS)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Super Admin', 'Admin', 'Penulis')),
  email TEXT,
  avatar TEXT,
  status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Nonaktif')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABEL SOP PELAYANAN
CREATE TABLE IF NOT EXISTS sop_pelayanan (
  id TEXT PRIMARY KEY DEFAULT 'main',
  title TEXT NOT NULL DEFAULT 'Bagan Alur SOP Pelayanan',
  image_url TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. TABEL ORGANISASI MITRA & PROFESI (ORGANIZATIONS)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  cover_image TEXT,
  leader JSONB DEFAULT '{}'::jsonb,
  vision TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  officials JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  phone TEXT,
  email TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  assigned_username TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. TABEL DAFTAR GURU (NOMINATIF)
CREATE TABLE IF NOT EXISTS daftar_guru (
  id TEXT PRIMARY KEY,
  no INT,
  nama TEXT NOT NULL,
  nip TEXT DEFAULT '-',
  status_pegawai TEXT NOT NULL,
  instansi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. TABEL PERSYARATAN PELAYANAN
CREATE TABLE IF NOT EXISTS service_requirements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Kepegawaian & GTK',
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  estimated_time TEXT DEFAULT '1 - 3 Hari Kerja',
  fee TEXT DEFAULT 'Gratis / Rp 0',
  sort_order INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- PENGATURAN ROW LEVEL SECURITY (RLS)
-- ==========================================================

-- Aktifkan RLS di seluruh tabel
ALTER TABLE office_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_pelayanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daftar_guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;

-- Hak Akses Baca untuk Publik (Anonim & Pengunjung)
CREATE POLICY "Public read office_profile" ON office_profile FOR SELECT USING (true);
CREATE POLICY "Public read schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read agenda" ON agenda FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Public read sop_pelayanan" ON sop_pelayanan FOR SELECT USING (true);
CREATE POLICY "Public read organizations" ON organizations FOR SELECT USING (true);
CREATE POLICY "Public read daftar_guru" ON daftar_guru FOR SELECT USING (true);
CREATE POLICY "Public read service_requirements" ON service_requirements FOR SELECT USING (true);

-- Pengunjung boleh kirim aspirasi / aduan
CREATE POLICY "Public insert complaints" ON complaints FOR INSERT WITH CHECK (true);

-- Pengelolaan Penuh (INSERT, UPDATE, DELETE) untuk Pengguna dengan Kunci Anon / Authenticated
CREATE POLICY "Allow all on office_profile" ON office_profile FOR ALL USING (true);
CREATE POLICY "Allow all on schools" ON schools FOR ALL USING (true);
CREATE POLICY "Allow all on news" ON news FOR ALL USING (true);
CREATE POLICY "Allow all on announcements" ON announcements FOR ALL USING (true);
CREATE POLICY "Allow all on agenda" ON agenda FOR ALL USING (true);
CREATE POLICY "Allow all on documents" ON documents FOR ALL USING (true);
CREATE POLICY "Allow all on gallery" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all on staff" ON staff FOR ALL USING (true);
CREATE POLICY "Allow all on complaints" ON complaints FOR ALL USING (true);
CREATE POLICY "Allow all on admin_users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Allow all on sop_pelayanan" ON sop_pelayanan FOR ALL USING (true);
CREATE POLICY "Allow all on organizations" ON organizations FOR ALL USING (true);
CREATE POLICY "Allow all on daftar_guru" ON daftar_guru FOR ALL USING (true);
CREATE POLICY "Allow all on service_requirements" ON service_requirements FOR ALL USING (true);

-- ==========================================================
-- AKUN AWAL BAWAAN (DEFAULT SEED ACCOUNTS)
-- ==========================================================
INSERT INTO admin_users (id, username, password, name, role, email, status)
VALUES 
  ('usr-superadmin', 'superadmin', 'superadmin123', 'Super Administrator Korwilcam', 'Super Admin', 'superadmin@korwilcampurwodadi.sch.id', 'Aktif'),
  ('usr-admin', 'admin', 'admin123', 'Administrator Web Korwilcam', 'Admin', 'admin@korwilcampurwodadi.sch.id', 'Aktif'),
  ('usr-penulis', 'penulis', 'penulis123', 'Penulis Konten Berita', 'Penulis', 'penulis@korwilcampurwodadi.sch.id', 'Aktif')
ON CONFLICT (username) DO NOTHING;

-- ==========================================================
-- REPLIKASI REALTIME (MULTI-USER UPDATE OTOMATIS)
-- ==========================================================
-- Menjadikan perubahan data di tabel langsung memicu update pada layar pengunjung tanpa refresh
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE schools, news, announcements, agenda, documents, gallery, staff, office_profile, complaints, admin_users, sop_pelayanan, organizations, daftar_guru, service_requirements;
EXCEPTION WHEN OTHERS THEN
  -- Abaikan jika tabel sudah terdaftar di publication
  NULL;
END $$;

-- Selesai! Seluruh tabel siap digunakan oleh website.

-- ==========================================================
-- MIGRATION: TAMBAH / UPDATE KOLOM LINK GOOGLE MAPS PADA TABEL SCHOOLS
-- ==========================================================
-- 1. Tambahkan kolom jika belum ada:
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS titik_koordinat TEXT,
ADD COLUMN IF NOT EXISTS coordinates TEXT;

-- 2. Update otomatis link Google Maps untuk masing-masing sekolah di Purwodadi:
UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.086389,110.916111', 
  coordinates = 'https://www.google.com/maps?q=-7.086389,110.916111' 
WHERE id = 'sch-01';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.088194,110.919722', 
  coordinates = 'https://www.google.com/maps?q=-7.088194,110.919722' 
WHERE id = 'sch-02';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.091389,110.908056', 
  coordinates = 'https://www.google.com/maps?q=-7.091389,110.908056' 
WHERE id = 'sch-03';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.102500,110.923889', 
  coordinates = 'https://www.google.com/maps?q=-7.102500,110.923889' 
WHERE id = 'sch-04';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.084722,110.913889', 
  coordinates = 'https://www.google.com/maps?q=-7.084722,110.913889' 
WHERE id = 'sch-05';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.081944,110.925278', 
  coordinates = 'https://www.google.com/maps?q=-7.081944,110.925278' 
WHERE id = 'sch-06';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.089444,110.914722', 
  coordinates = 'https://www.google.com/maps?q=-7.089444,110.914722' 
WHERE id = 'sch-07';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.078611,110.927500', 
  coordinates = 'https://www.google.com/maps?q=-7.078611,110.927500' 
WHERE id = 'sch-08';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.098333,110.931944', 
  coordinates = 'https://www.google.com/maps?q=-7.098333,110.931944' 
WHERE id = 'sch-09';

UPDATE public.schools SET 
  titik_koordinat = 'https://www.google.com/maps?q=-7.096944,110.934167', 
  coordinates = 'https://www.google.com/maps?q=-7.096944,110.934167' 
WHERE id = 'sch-1788412534285' OR name ILIKE '%Kandangan%';

-- 3. Query cerdas: jika ada data koordinat angka biasa, otomatis jadikan link Google Maps:
UPDATE public.schools 
SET 
  titik_koordinat = 'https://www.google.com/maps?q=' || replace(titik_koordinat, ' ', ''),
  coordinates = 'https://www.google.com/maps?q=' || replace(coordinates, ' ', '')
WHERE 
  (titik_koordinat NOT LIKE 'http%' AND titik_koordinat IS NOT NULL AND titik_koordinat <> '')
  OR (coordinates NOT LIKE 'http%' AND coordinates IS NOT NULL AND coordinates <> '');

-- ==========================================================
-- MIGRATION: TAMBAH KOLOM IMAGES PADA TABEL GALLERY (MULTI-FOTO ALBUM)
-- ==========================================================
ALTER TABLE public.gallery 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ==========================================================
-- MIGRATION: BUAT TABEL ORGANISASI MITRA & PROFESI (ORGANIZATIONS)
-- ==========================================================
-- Jalankan potongan script ini di menu "SQL Editor" pada Supabase jika tabel 'organizations' belum ada:
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  cover_image TEXT,
  leader JSONB DEFAULT '{}'::jsonb,
  vision TEXT,
  missions JSONB DEFAULT '[]'::jsonb,
  officials JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  phone TEXT,
  email TEXT,
  social_media JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom social_media ada jika tabel organizations sudah dibuat sebelumnya:
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read organizations" ON public.organizations;
CREATE POLICY "Public read organizations" ON public.organizations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on organizations" ON public.organizations;
CREATE POLICY "Allow all on organizations" ON public.organizations FOR ALL USING (true);

-- Publikasi Realtime untuk Multi-User Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- MIGRATION: BUAT TABEL DAFTAR GURU (NOMINATIF GURU)
-- ==========================================================
-- Jalankan potongan script ini di menu "SQL Editor" pada Supabase:
CREATE TABLE IF NOT EXISTS public.daftar_guru (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  no INT,
  nama TEXT NOT NULL,
  nip TEXT DEFAULT '-',
  status_pegawai TEXT NOT NULL,
  instansi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pastikan kolom id otomatis terisi UUID jika diinput melalui import CSV
ALTER TABLE public.daftar_guru 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.daftar_guru ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read daftar_guru" ON public.daftar_guru;
CREATE POLICY "Public read daftar_guru" ON public.daftar_guru FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on daftar_guru" ON public.daftar_guru;
CREATE POLICY "Allow all on daftar_guru" ON public.daftar_guru FOR ALL USING (true);

-- Publikasi Realtime untuk Multi-User Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.daftar_guru;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- MIGRATION: BUAT TABEL KATEGORI PERSYARATAN PELAYANAN (SERVICE_CATEGORIES)
-- ==========================================================
-- Jalankan potongan script ini di menu "SQL Editor" pada Supabase:
CREATE TABLE IF NOT EXISTS public.service_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read service_categories" ON public.service_categories;
CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on service_categories" ON public.service_categories;
CREATE POLICY "Allow all on service_categories" ON public.service_categories FOR ALL USING (true);

-- Isi kategori default bawaan awal jika belum ada
INSERT INTO public.service_categories (name)
VALUES 
  ('Kepegawaian & GTK'),
  ('Kesiswaan & Kurikulum'),
  ('Kelembagaan & Legalitas'),
  ('Umum & Tata Usaha')
ON CONFLICT (name) DO NOTHING;

-- Publikasi Realtime untuk Multi-User Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.service_categories;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- FUNGSI INCREMENT PENAYANGAN BERITA (ATOMIC & AMAN UNTUK PENGUNJUNG ANONIM)
-- ==========================================================
-- Jalankan fungsi ini di menu "SQL Editor" Supabase jika belum tersedia:
CREATE OR REPLACE FUNCTION public.increment_news_views(article_id TEXT)
RETURNS INTEGER AS $$
DECLARE
  new_views INTEGER;
BEGIN
  UPDATE public.news
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id OR slug = article_id
  RETURNING views INTO new_views;
  
  RETURN COALESCE(new_views, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.increment_news_views(TEXT) TO anon, authenticated, service_role;

-- ==========================================================
-- MIGRATION: TAMBAH KOLOM ASSIGNED_USERNAME KE TABEL ORGANIZATIONS
-- ==========================================================
-- Jalankan potongan script ini di menu "SQL Editor" pada Supabase jika tabel organizations sudah ada sebelumnya:
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS assigned_username TEXT;

-- ==========================================================
-- MIGRATION: BUAT TABEL PERMINTAAN DATA WEBVIEW (DATA_REQUESTS)
-- ==========================================================
-- Jalankan script ini di menu "SQL Editor" pada dashboard Supabase Anda:
CREATE TABLE IF NOT EXISTS public.data_requests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  url TEXT NOT NULL,
  description TEXT,
  crop_top INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tambah kolom slug jika tabel sudah ada sebelumnya:
ALTER TABLE public.data_requests ADD COLUMN IF NOT EXISTS slug TEXT;
CREATE INDEX IF NOT EXISTS idx_data_requests_slug ON public.data_requests(slug);

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read data_requests" ON public.data_requests;
CREATE POLICY "Public read data_requests" ON public.data_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on data_requests" ON public.data_requests;
CREATE POLICY "Allow all on data_requests" ON public.data_requests FOR ALL USING (true);

-- Publikasi Realtime untuk Multi-User Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.data_requests;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- MIGRATION: BUAT TABEL PENGATURAN LOG AKTIVITAS (ACTIVITY_LOG_SETTINGS)
-- ==========================================================
-- Tabel ini HANYA menyimpan 1 baris URL Webhook Google Apps Script agar
-- seluruh browser pengelola otomatis tersinkronisasi dan log aktivitas berjalan lancar.
-- Catatan: Seluruh rekaman log aktivitas tetap 100% masuk ke Google Spreadsheet Anda.
CREATE TABLE IF NOT EXISTS public.activity_log_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  webapp_url TEXT NOT NULL DEFAULT '',
  spreadsheet_url TEXT DEFAULT 'https://docs.google.com/spreadsheets/d/1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM/edit?pli=1&gid=0#gid=0',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.activity_log_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read activity_log_settings" ON public.activity_log_settings;
CREATE POLICY "Public read activity_log_settings" ON public.activity_log_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on activity_log_settings" ON public.activity_log_settings;
CREATE POLICY "Allow all on activity_log_settings" ON public.activity_log_settings FOR ALL USING (true);

-- Tambahkan baris default jika belum ada
INSERT INTO public.activity_log_settings (id, webapp_url, spreadsheet_url, is_active)
VALUES ('default', '', 'https://docs.google.com/spreadsheets/d/1SE2jGfPspFG13jh4lDUyVGZJberXfeKWKfUpz8iv7KM/edit?pli=1&gid=0#gid=0', true)
ON CONFLICT (id) DO NOTHING;

-- Publikasi Realtime untuk Multi-User / Multi-Browser Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log_settings;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- MIGRATION: BUAT TABEL PENGATURAN MEDIA SOSIAL (SOCIAL_MEDIA_SETTINGS)
-- ==========================================================
-- Tabel ini menyimpan pengaturan akun media sosial resmi Korwilcam Purwodadi
-- dengan aturan kondisional: hanya akun dengan tautan terisi yang tampil di web.
CREATE TABLE IF NOT EXISTS public.social_media_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pengaturan RLS (Row Level Security)
ALTER TABLE public.social_media_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read social_media_settings" ON public.social_media_settings;
CREATE POLICY "Public read social_media_settings" ON public.social_media_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all on social_media_settings" ON public.social_media_settings;
CREATE POLICY "Allow all on social_media_settings" ON public.social_media_settings FOR ALL USING (true);

-- Publikasi Realtime untuk Multi-User / Multi-Browser Sync
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.social_media_settings;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Masukkan data awal bawaan jika belum ada
INSERT INTO public.social_media_settings (id, items)
VALUES (
  'default',
  '[
    {"id":"instagram","platform":"instagram","name":"Instagram","badge":"FOTO & DOKUMENTASI","username":"@korwilcam_purwodadi","followers":"15K+ Pengikut","description":"Kumpulan foto, video, dan pengumuman resmi kegiatan pendidikan.","buttonLabel":"Ikuti di Instagram","url":"https://instagram.com/korwilcam_purwodadi","isActive":true,"order":1},
    {"id":"youtube","platform":"youtube","name":"YouTube","badge":"VIDEO & SOSIALISASI","username":"KORWILCAM PURWODADI","followers":"10K+ Subscribers","description":"Video dokumentasi kegiatan, tutorial, dan liputan acara pendidikan.","buttonLabel":"Tonton di YouTube","url":"https://youtube.com/@korwilcam_purwodadi","isActive":true,"order":2},
    {"id":"tiktok","platform":"tiktok","name":"TikTok","badge":"KONTEN KREATIF","username":"@korwilcam_purwodadi","followers":"20K+ Pengikut","description":"Informasi cepat, video edukasi, dan keseruan sekolah.","buttonLabel":"Tonton di TikTok","url":"https://tiktok.com/@korwilcam_purwodadi","isActive":true,"order":3},
    {"id":"facebook","platform":"facebook","name":"Facebook","badge":"KOMUNITAS & BERITA","username":"Korwilcam Purwodadi","followers":"25K+ Pengikut","description":"Update berita, galeri kegiatan, dan ruang diskusi masyarakat.","buttonLabel":"Ikuti di Facebook","url":"https://facebook.com/korwilcam_purwodadi","isActive":true,"order":4},
    {"id":"x","platform":"x","name":"X (Twitter)","badge":"INFORMASI CEPAT","username":"@KorwilcamPwd","followers":"8K+ Pengikut","description":"Pembaruan cepat, opini, dan interaksi langsung seputar layanan.","buttonLabel":"Ikuti di X","url":"https://x.com/KorwilcamPwd","isActive":true,"order":5}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- 21. TABEL RIWAYAT BROADCAST NOTIFIKASI PWA (ONESIGNAL)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.broadcast_notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target_url TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recipients_count INTEGER DEFAULT 0,
  onesignal_id TEXT,
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  created_by TEXT DEFAULT 'Admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on broadcast_notifications" ON public.broadcast_notifications;
CREATE POLICY "Allow all on broadcast_notifications" ON public.broadcast_notifications FOR ALL USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_notifications;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ==========================================================
-- 22. TABEL "analitik website" (ANALITIK KUNJUNGAN REAL-TIME)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public."analitik website" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  city TEXT NOT NULL DEFAULT 'Purwodadi',
  region TEXT DEFAULT 'Jawa Tengah',
  country TEXT NOT NULL DEFAULT 'Indonesia',
  device_type TEXT NOT NULL DEFAULT 'Desktop',
  browser TEXT NOT NULL DEFAULT 'Google Chrome',
  os TEXT DEFAULT 'Windows',
  traffic_source TEXT NOT NULL DEFAULT 'Langsung',
  referrer TEXT DEFAULT '',
  landing_page TEXT NOT NULL DEFAULT 'Beranda',
  current_page TEXT NOT NULL DEFAULT 'Beranda',
  pages_visited JSONB DEFAULT '["Beranda"]'::jsonb,
  page_views INTEGER NOT NULL DEFAULT 1,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT TRUE,
  is_logged_in BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_analitik_created_at ON public."analitik website" (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analitik_session_id ON public."analitik website" (session_id);
CREATE INDEX IF NOT EXISTS idx_analitik_visitor_id ON public."analitik website" (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analitik_city ON public."analitik website" (city);
CREATE INDEX IF NOT EXISTS idx_analitik_device ON public."analitik website" (device_type);
CREATE INDEX IF NOT EXISTS idx_analitik_traffic ON public."analitik website" (traffic_source);
CREATE INDEX IF NOT EXISTS idx_analitik_browser ON public."analitik website" (browser);

ALTER TABLE public."analitik website" ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public insert analitik website') THEN
    CREATE POLICY "Public insert analitik website" ON public."analitik website" FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public update analitik website') THEN
    CREATE POLICY "Public update analitik website" ON public."analitik website" FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analitik website' AND policyname = 'Public read analitik website') THEN
    CREATE POLICY "Public read analitik website" ON public."analitik website" FOR SELECT USING (true);
  END IF;
END $$;

