-- SUPABASE SCHEMA FOR THE APP STATE
-- Run this SQL in your Supabase SQL Editor (https://supabase.host) to set up persistent storage:

CREATE TABLE IF NOT EXISTS app_state (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Initialize the row if it doesn't exist
INSERT INTO app_state (id, data) 
VALUES ('main', '{}'::jsonb) 
ON CONFLICT (id) DO NOTHING;
