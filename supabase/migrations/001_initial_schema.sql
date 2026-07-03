-- ============================================================
-- Teatch: AI Learning Platform for Parents
-- Database Migration: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Parent accounts linked to auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_auth_user_id ON profiles(auth_user_id);

-- ============================================================
-- 2. CHILDREN (Child profiles belonging to a parent)
-- ============================================================
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('PAUD', 'TK A', 'TK B', 'SD', 'SMP', 'SMA')),
  grade TEXT,
  interests TEXT[] DEFAULT '{}',
  favorite_subjects TEXT[] DEFAULT '{}',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_children_parent_id ON children(parent_id);

-- ============================================================
-- 3. SUBJECTS (Mata pelajaran per level/jenjang)
-- ============================================================
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('PAUD', 'TK A', 'TK B', 'SD', 'SMP', 'SMA')),
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subjects_level ON subjects(level);
CREATE UNIQUE INDEX idx_subjects_name_level ON subjects(name, level);

-- ============================================================
-- 4. WORKSHEETS (Generated AI worksheets)
-- ============================================================
CREATE TABLE worksheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('mudah', 'sedang', 'sulit')),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'essay', 'short_answer', 'drag_and_drop',
    'guess_image', 'coloring', 'matching', 'image_matching'
  )),
  question_count INTEGER NOT NULL DEFAULT 5,
  topic TEXT,
  ai_prompt TEXT,
  ai_response JSONB,
  status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generating', 'generated', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_worksheets_child_id ON worksheets(child_id);
CREATE INDEX idx_worksheets_subject_id ON worksheets(subject_id);
CREATE INDEX idx_worksheets_created_at ON worksheets(created_at DESC);

-- ============================================================
-- 5. QUESTIONS (Individual questions within a worksheet)
-- ============================================================
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'multiple_choice', 'essay', 'short_answer', 'drag_and_drop',
    'guess_image', 'coloring', 'matching', 'image_matching'
  )),
  question TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  answer TEXT,
  explanation TEXT,
  image_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_worksheet_id ON questions(worksheet_id);

-- ============================================================
-- 6. ATTEMPTS (Quiz attempts by children)
-- ============================================================
CREATE TABLE attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worksheet_id UUID NOT NULL REFERENCES worksheets(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  score NUMERIC(5,2),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  duration INTEGER, -- in seconds
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_worksheet_id ON attempts(worksheet_id);
CREATE INDEX idx_attempts_child_id ON attempts(child_id);
CREATE INDEX idx_attempts_created_at ON attempts(created_at DESC);

-- ============================================================
-- 7. ANSWERS (Individual answers within an attempt)
-- ============================================================
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can only access their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = auth_user_id);

-- CHILDREN: Parents can only access their own children
CREATE POLICY "Parents can view their children"
  ON children FOR SELECT
  USING (
    parent_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create children"
  ON children FOR INSERT
  WITH CHECK (
    parent_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their children"
  ON children FOR UPDATE
  USING (
    parent_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete their children"
  ON children FOR DELETE
  USING (
    parent_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- SUBJECTS: Everyone can read subjects
CREATE POLICY "Anyone can view subjects"
  ON subjects FOR SELECT
  USING (true);

-- WORKSHEETS: Parents can only access worksheets for their children
CREATE POLICY "Parents can view their children worksheets"
  ON worksheets FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create worksheets for their children"
  ON worksheets FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete their children worksheets"
  ON worksheets FOR DELETE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- QUESTIONS: Access through worksheet ownership
CREATE POLICY "Parents can view questions of their worksheets"
  ON questions FOR SELECT
  USING (
    worksheet_id IN (
      SELECT w.id FROM worksheets w
      JOIN children c ON c.id = w.child_id
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create questions for their worksheets"
  ON questions FOR INSERT
  WITH CHECK (
    worksheet_id IN (
      SELECT w.id FROM worksheets w
      JOIN children c ON c.id = w.child_id
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- ATTEMPTS: Access through child ownership
CREATE POLICY "Parents can view attempts of their children"
  ON attempts FOR SELECT
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create attempts for their children"
  ON attempts FOR INSERT
  WITH CHECK (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update attempts of their children"
  ON attempts FOR UPDATE
  USING (
    child_id IN (
      SELECT c.id FROM children c
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- ANSWERS: Access through attempt ownership
CREATE POLICY "Parents can view answers of their attempts"
  ON answers FOR SELECT
  USING (
    attempt_id IN (
      SELECT a.id FROM attempts a
      JOIN children c ON c.id = a.child_id
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create answers for their attempts"
  ON answers FOR INSERT
  WITH CHECK (
    attempt_id IN (
      SELECT a.id FROM attempts a
      JOIN children c ON c.id = a.child_id
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update answers of their attempts"
  ON answers FOR UPDATE
  USING (
    attempt_id IN (
      SELECT a.id FROM attempts a
      JOIN children c ON c.id = a.child_id
      JOIN profiles p ON p.id = c.parent_id
      WHERE p.auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Create storage bucket for child avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for worksheet assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('worksheets', 'worksheets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Storage policies for worksheets
CREATE POLICY "Anyone can view worksheet assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'worksheets');

CREATE POLICY "Authenticated users can upload worksheet assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'worksheets' AND auth.role() = 'authenticated');
