-- ═══════════════════════════════════════════════════
-- FSCreative Visual World Workbook — Supabase Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════

-- 1. Users table (stores identity)
CREATE TABLE IF NOT EXISTS vww_users (
  email       TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  last_seen   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Progress table (stores all workbook answers)
CREATE TABLE IF NOT EXISTS vww_progress (
  email       TEXT PRIMARY KEY REFERENCES vww_users(email) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (required for anon access)
ALTER TABLE vww_users    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vww_progress ENABLE ROW LEVEL SECURITY;

-- 4. Allow public read/write (anon key users can save their own progress)
CREATE POLICY "allow_all" ON vww_users    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON vww_progress FOR ALL TO anon USING (true) WITH CHECK (true);
