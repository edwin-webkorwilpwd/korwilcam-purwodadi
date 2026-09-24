-- ==========================================================
-- PENINGKATAN KEAMANAN (POIN 1): PENGUNCIAN TABEL ADMIN_USERS & LOGIN RPC
-- ==========================================================
-- Jalankan skrip ini di menu "SQL Editor" pada Dashboard Supabase Anda, lalu klik "Run".

-- 1. Buat Fungsi Verifikasi Login Aman di Sisi Server (RPC)
-- Fungsi ini berjalan sebagai SECURITY DEFINER, artinya fungsi ini memiliki wewenang
-- untuk memverifikasi username & password secara internal di dalam server Supabase,
-- lalu mengembalikan data akun pengelola TANPA pernah menyertakan kolom password ke publik.
CREATE OR REPLACE FUNCTION verify_admin_login(p_username TEXT, p_password TEXT)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  name TEXT,
  role TEXT,
  email TEXT,
  avatar TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.username,
    a.name,
    a.role,
    a.email,
    a.avatar,
    a.status,
    a.created_at,
    a.updated_at
  FROM admin_users a
  WHERE LOWER(TRIM(a.username)) = LOWER(TRIM(p_username))
    AND a.password = TRIM(p_password)
  LIMIT 1;
END;
$$;

-- Berikan izin pemanggilan fungsi RPC ke peran anon (publik), authenticated, dan service_role
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_login(TEXT, TEXT) TO service_role;

-- 2. Kunci Kolom Password dari Peran 'anon' (Pengunjung / Publik / Internet)
-- Dengan perintah ini, siapa pun yang mencoba meminta "SELECT * FROM admin_users"
-- atau "SELECT password FROM admin_users" dari browser/API akan DITOLAK seketika oleh PostgreSQL!
REVOKE SELECT (password) ON admin_users FROM anon;

-- Berikan izin SELECT hanya untuk kolom-kolom non-sensitif (identitas publik akun) ke anon
GRANT SELECT (id, username, name, role, email, avatar, status, created_at, updated_at) ON admin_users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_users TO service_role;

-- 3. Rapikan Kebijakan RLS (Row Level Security) pada admin_users
DROP POLICY IF EXISTS "Allow all on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Public read admin_users" ON admin_users;

CREATE POLICY "Allow select on non-sensitive admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Allow insert on admin_users" ON admin_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on admin_users" ON admin_users FOR UPDATE USING (true);
CREATE POLICY "Allow delete on admin_users" ON admin_users FOR DELETE USING (true);
