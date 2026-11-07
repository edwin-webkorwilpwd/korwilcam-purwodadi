-- ==========================================================
-- SCRIPT SQL: AKTIFKAN ROLE 'Editor' DI TABEL ADMIN_USERS SUPABASE
-- Jalankan di menu SQL Editor pada Dashboard Supabase, lalu klik "RUN"
-- ==========================================================

-- 1. Hapus batasan CHECK constraint lama pada kolom 'role' yang membatasi hanya ke ('Super Admin', 'Admin', 'Penulis')
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.admin_users'::regclass
          AND contype = 'c'
          AND pg_get_constraintdef(oid) LIKE '%role%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.admin_users DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- 2. Pasang kembali CHECK constraint baru yang mengizinkan role 'Editor'
ALTER TABLE public.admin_users 
  ADD CONSTRAINT admin_users_role_check 
  CHECK (role IN ('Super Admin', 'Admin', 'Penulis', 'Editor'));

-- 3. Berikan izin SELECT, INSERT, UPDATE, DELETE ke peran 'anon' dan 'authenticated'
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO service_role;

-- 4. Pastikan RLS Policy pada tabel admin_users mengizinkan UPDATE dan INSERT
DROP POLICY IF EXISTS "Allow update on admin_users" ON public.admin_users;
CREATE POLICY "Allow update on admin_users" ON public.admin_users FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert on admin_users" ON public.admin_users;
CREATE POLICY "Allow insert on admin_users" ON public.admin_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all on admin_users" ON public.admin_users;
CREATE POLICY "Allow all on admin_users" ON public.admin_users FOR ALL USING (true);
