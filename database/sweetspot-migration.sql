-- Migration untuk Sweet Spot features
-- Membuat tabel untuk SweetSpot entries dan settings

-- Tabel untuk sweet spot entries
CREATE TABLE IF NOT EXISTS sweet_spot_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT DEFAULT 'default-user',
  niche TEXT NOT NULL,
  account TEXT NOT NULL,
  keywords TEXT NOT NULL,
  audience INTEGER NOT NULL DEFAULT 0,
  revenue_stream TEXT NOT NULL,
  pricing TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel untuk sweet spot settings
CREATE TABLE IF NOT EXISTS sweet_spot_settings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL DEFAULT 'default-user',
  target_revenue_per_month BIGINT NOT NULL DEFAULT 10000000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_sweet_spot_entries_user_id ON sweet_spot_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_sweet_spot_entries_niche ON sweet_spot_entries(niche);
CREATE INDEX IF NOT EXISTS idx_sweet_spot_settings_user_id ON sweet_spot_settings(user_id);

-- Trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS update_sweet_spot_entries_updated_at ON sweet_spot_entries;
CREATE TRIGGER update_sweet_spot_entries_updated_at 
    BEFORE UPDATE ON sweet_spot_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sweet_spot_settings_updated_at ON sweet_spot_settings;
CREATE TRIGGER update_sweet_spot_settings_updated_at 
    BEFORE UPDATE ON sweet_spot_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings jika belum ada
INSERT INTO sweet_spot_settings (user_id, target_revenue_per_month) 
VALUES ('default-user', 10000000)
ON CONFLICT (user_id) DO NOTHING;
