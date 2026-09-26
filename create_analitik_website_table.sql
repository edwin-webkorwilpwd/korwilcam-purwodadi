-- ==============================================================================
-- SKEMA PEMBUATAN TABEL: "analitik website" (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Tabel ini digunakan untuk menyimpan seluruh rekaman data analitik kunjungan riil
-- dari website Korwilcam Purwodadi secara dinamis tanpa data dummy.
--
-- CARA PENGGUNAAN:
-- 1. Buka dashboard Supabase Anda (https://supabase.com/dashboard)
-- 2. Masuk ke project Anda -> Klik menu "SQL Editor" di bilah samping kiri
-- 3. Tempelkan seluruh isi script ini dan klik tombol "Run" (Jalankan)
-- ==============================================================================

-- 1. Buat Tabel "analitik website"
CREATE TABLE IF NOT EXISTS public."analitik website" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  visitor_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metrik Wilayah & Geolokasi (IP Geolocation)
  city TEXT NOT NULL DEFAULT 'Purwodadi',
  region TEXT DEFAULT 'Jawa Tengah',
  country TEXT NOT NULL DEFAULT 'Indonesia',
  
  -- Metrik Perangkat & Klien
  device_type TEXT NOT NULL DEFAULT 'Desktop', -- 'Desktop', 'Mobile', 'Tablet'
  browser TEXT NOT NULL DEFAULT 'Google Chrome', -- 'Google Chrome', 'Safari', 'Mozilla Firefox', 'Microsoft Edge', 'Lainnya'
  os TEXT DEFAULT 'Windows',
  
  -- Metrik Sumber Trafik
  traffic_source TEXT NOT NULL DEFAULT 'Langsung', -- 'Organik (Google)', 'Langsung', 'Media Sosial', 'Referral', 'Lainnya'
  referrer TEXT DEFAULT '',
  
  -- Metrik Halaman & Aktivitas
  landing_page TEXT NOT NULL DEFAULT 'Beranda',
  current_page TEXT NOT NULL DEFAULT 'Beranda',
  pages_visited JSONB DEFAULT '["Beranda"]'::jsonb,
  page_views INTEGER NOT NULL DEFAULT 1,
  
  -- Metrik Waktu & Perilaku Kunjungan
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  is_bounce BOOLEAN NOT NULL DEFAULT TRUE,
  is_logged_in BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Buat Index agar agregasi query cepat dan hemat kuota Supabase
CREATE INDEX IF NOT EXISTS idx_analitik_created_at ON public."analitik website" (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analitik_session_id ON public."analitik website" (session_id);
CREATE INDEX IF NOT EXISTS idx_analitik_visitor_id ON public."analitik website" (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analitik_city ON public."analitik website" (city);
CREATE INDEX IF NOT EXISTS idx_analitik_device ON public."analitik website" (device_type);
CREATE INDEX IF NOT EXISTS idx_analitik_traffic ON public."analitik website" (traffic_source);
CREATE INDEX IF NOT EXISTS idx_analitik_browser ON public."analitik website" (browser);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public."analitik website" ENABLE ROW LEVEL SECURITY;

-- 4. Kebijakan Keamanan (RLS Policies):
-- Izinkan pengunjung (publik / anon) untuk mencatat sesi kunjungan baru
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analitik website' AND policyname = 'Public insert analitik website'
  ) THEN
    CREATE POLICY "Public insert analitik website" ON public."analitik website"
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Izinkan pengunjung untuk memperbarui durasi dan halaman dilihat pada sesinya
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analitik website' AND policyname = 'Public update analitik website'
  ) THEN
    CREATE POLICY "Public update analitik website" ON public."analitik website"
      FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Izinkan pembacaan data analitik untuk ditampilkan di dashboard
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'analitik website' AND policyname = 'Public read analitik website'
  ) THEN
    CREATE POLICY "Public read analitik website" ON public."analitik website"
      FOR SELECT USING (true);
  END IF;
END $$;

-- Catatan: Data riil akan otomatis bertambah setiap kali pengunjung atau admin mengakses website!
