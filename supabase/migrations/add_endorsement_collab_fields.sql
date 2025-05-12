-- Menambahkan kolom-kolom baru ke tabel content_items
ALTER TABLE content_items
ADD COLUMN IF NOT EXISTS content_link TEXT,
ADD COLUMN IF NOT EXISTS platform_links JSONB,
ADD COLUMN IF NOT EXISTS is_endorsement BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_collaboration BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS endorsement_name TEXT,
ADD COLUMN IF NOT EXISTS collaboration_name TEXT,
ADD COLUMN IF NOT EXISTS endorsement_price TEXT;

-- Membuat function untuk mengonversi nama kolom dari snake_case ke camelCase saat mengembalikan data
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

-- Gunakan RLS (Row Level Security) untuk memastikan data hanya bisa diakses oleh pemiliknya
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk SELECT (membaca data)
CREATE POLICY "Users can view their own content" ON content_items
FOR SELECT 
USING (auth.uid() = user_id);

-- Kebijakan untuk INSERT (menambahkan data)
CREATE POLICY "Users can insert their own content" ON content_items
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Kebijakan untuk UPDATE (memperbarui data)
CREATE POLICY "Users can update their own content" ON content_items
FOR UPDATE
USING (auth.uid() = user_id);

-- Kebijakan untuk DELETE (menghapus data)
CREATE POLICY "Users can delete their own content" ON content_items
FOR DELETE
USING (auth.uid() = user_id); 