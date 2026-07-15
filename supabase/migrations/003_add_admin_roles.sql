-- 1. Tambahkan kolom email dan role ke tabel profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- 2. Sinkronisasi email dari auth.users ke profiles (jika memungkinkan)
-- Fungsi ini akan dijalankan dengan hak akses yang lebih tinggi
DO $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.auth_user_id = u.id AND p.email IS NULL;
EXCEPTION WHEN OTHERS THEN
  -- Abaikan jika terjadi error karena masalah hak akses saat migrasi
  RAISE NOTICE 'Skipping email sync from auth.users: %', SQLERRM;
END $$;

-- 3. Tetapkan sevafarel17@gmail.com sebagai admin
UPDATE profiles SET role = 'admin' WHERE email = 'sevafarel17@gmail.com';

-- 4. Update trigger handle_new_user agar menyertakan email dan otomatis menjadi admin jika emailnya sama
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    CASE WHEN NEW.email = 'sevafarel17@gmail.com' THEN 'admin' ELSE 'user' END
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 5. Buat fungsi keamanan is_admin() untuk RLS
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Tambahkan kebijakan RLS (Row Level Security) untuk Admin
-- Admin dapat melihat seluruh profil
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

-- Admin dapat memperbarui seluruh profil
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin());

-- Admin juga perlu bisa melihat worksheets dan children untuk metrik dashboard jika diperlukan nantinya
DROP POLICY IF EXISTS "Admins can view all worksheets" ON worksheets;
CREATE POLICY "Admins can view all worksheets"
  ON worksheets FOR SELECT
  USING (is_admin());
