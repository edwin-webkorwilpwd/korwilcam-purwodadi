-- ==========================================================
-- TABEL BARU: PRESTASI SISWA & GURU (ACHIEVEMENTS)
-- ==========================================================
-- Jalankan skrip ini di menu "SQL Editor" pada Dashboard Supabase Anda, lalu klik "Run".

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,                -- Nama Ajang / Kompetisi (misal: "FLS2N Seni Tari", "OSN Matematika")
  category TEXT NOT NULL,             -- 'Siswa' atau 'Guru'
  field TEXT NOT NULL,                -- 'Sains / OSN', 'Olahraga / O2SN', 'Seni & Budaya / FLS2N', 'Keagamaan / MAPSI', 'Literasi / FTBI', 'Inovasi GTK', 'Lainnya'
  rank TEXT NOT NULL,                 -- 'Juara 1', 'Juara 2', 'Juara 3', 'Juara Harapan 1', 'Finalis', dll.
  level TEXT NOT NULL,                -- 'Kecamatan', 'Kabupaten', 'Provinsi', 'Nasional', 'Internasional'
  recipient_name TEXT NOT NULL,       -- Nama Lengkap Siswa atau Guru Peraih Prestasi
  school_name TEXT NOT NULL,          -- Asal Satuan Pendidikan / Sekolah
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE), -- Tahun Prestasi
  event_date TEXT,                    -- Tanggal / Bulan Pelaksanaan
  mentor_name TEXT,                   -- Nama Guru Pembimbing / Pelatih
  photo_url TEXT,                     -- Link Google Drive Foto Peraih / Piala
  certificate_url TEXT,               -- Link Google Drive Foto Piagam / Sertifikat
  description TEXT,                   -- Cerita Singkat / Deskripsi Prestasi
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id TEXT,                     -- ID Akun Pembuat (misal: usr-superadmin, usr-penulis-1)
  author_name TEXT,                   -- Nama Akun Pembuat (misal: "Budi Santoso", "Admin")
  author_role TEXT                    -- Role Pembuat ('Super Admin', 'Admin', 'Penulis')
);

-- Tambahkan kolom author ke tabel yang sudah terlanjur dibuat sebelumnya (aman dijalankan ulang)
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS author_id TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS author_role TEXT;

-- Index untuk mempercepat query filter dan pencarian
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_level ON achievements(level);
CREATE INDEX IF NOT EXISTS idx_achievements_year ON achievements(year);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses:
-- 1. Publik (Anonim & Pengunjung) diizinkan membaca data prestasi
DROP POLICY IF EXISTS "Public read achievements" ON achievements;
CREATE POLICY "Public read achievements" ON achievements FOR SELECT USING (true);

-- 2. Pengelolaan penuh (Insert, Update, Delete) untuk Admin
DROP POLICY IF EXISTS "Allow all on achievements" ON achievements;
CREATE POLICY "Allow all on achievements" ON achievements FOR ALL USING (true);

-- Memberikan izin Data API Supabase (Sesuai panduan resmi Supabase terbaru)
GRANT SELECT ON public.achievements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO service_role;
