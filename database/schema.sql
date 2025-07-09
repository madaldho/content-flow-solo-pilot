-- Script untuk membuat schema database di Neon PostgreSQL
-- Berdasarkan migrasi dari Supabase

-- Membuat tabel content_items
CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT DEFAULT 'default-user',
  title TEXT NOT NULL,
  content TEXT,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[],
  
  -- Kolom tambahan dari migrasi Supabase
  content_link TEXT,
  platform_links JSONB,
  is_endorsement BOOLEAN DEFAULT FALSE,
  is_collaboration BOOLEAN DEFAULT FALSE,
  endorsement_name TEXT,
  collaboration_name TEXT,
  endorsement_price TEXT
);

-- Membuat index untuk performa
CREATE INDEX IF NOT EXISTS idx_content_items_user_id ON content_items(user_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_platform ON content_items(platform);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at);

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS update_content_items_updated_at ON content_items;
CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON content_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function untuk konversi snake_case ke camelCase (dari migrasi Supabase)
CREATE OR REPLACE FUNCTION snake_to_camel(snake_case text) RETURNS text AS $$
DECLARE
  camel_case text := '';
  word text;
  words text[] := string_to_array(snake_case, '_');
BEGIN
  camel_case := words[1];
  FOR i IN 2..array_length(words, 1) LOOP
    word := words[i];
    camel_case := camel_case || upper(left(word, 1)) || right(word, -1);
  END LOOP;
  RETURN camel_case;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Tabel untuk sweet spot analysis (jika diperlukan)
CREATE TABLE IF NOT EXISTS sweet_spot_analysis (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT DEFAULT 'default-user',
  platform TEXT NOT NULL,
  best_time TIME,
  best_day TEXT,
  engagement_rate DECIMAL(5,2),
  analysis_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk sweet spot analysis
CREATE INDEX IF NOT EXISTS idx_sweet_spot_user_id ON sweet_spot_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_sweet_spot_platform ON sweet_spot_analysis(platform);

-- Trigger untuk sweet spot analysis
DROP TRIGGER IF EXISTS update_sweet_spot_updated_at ON sweet_spot_analysis;
CREATE TRIGGER update_sweet_spot_updated_at 
    BEFORE UPDATE ON sweet_spot_analysis 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
