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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Hak Akses Baca untuk Publik (Anonim & Pengunjung)
CREATE POLICY "Public read office_profile" ON office_profile FOR SELECT USING (true);
CREATE POLICY "Public read schools" ON schools FOR SELECT USING (true);
CREATE POLICY "Public read news" ON news FOR SELECT USING (true);
CREATE POLICY "Public read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read agenda" ON agenda FOR SELECT USING (true);
CREATE POLICY "Public read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Public read gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read staff" ON staff FOR SELECT USING (true);

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

-- ==========================================================
-- REPLIKASI REALTIME (MULTI-USER UPDATE OTOMATIS)
-- ==========================================================
-- Menjadikan perubahan data di tabel langsung memicu update pada layar pengunjung tanpa refresh
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE schools, news, announcements, agenda, documents, gallery, staff, office_profile, complaints;
EXCEPTION WHEN OTHERS THEN
  -- Abaikan jika tabel sudah terdaftar di publication
  NULL;
END $$;

-- Selesai! Seluruh tabel siap digunakan oleh website.

