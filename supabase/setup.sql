-- NEXUS — Supabase setup script
-- Run this in your Supabase SQL editor (Database → SQL Editor → New query)

-- 1. App state table (one row per user)
CREATE TABLE IF NOT EXISTS app_state (
  user_id     TEXT        PRIMARY KEY,
  doc         JSONB       NOT NULL,
  updated_at  BIGINT      NOT NULL DEFAULT 0
);

-- 2. Index on updated_at for efficient conflict resolution
CREATE INDEX IF NOT EXISTS app_state_updated_at_idx ON app_state (updated_at);

-- 3. Row-level security — disable for now (single-user, token-gated at API layer)
--    Enable RLS if you ever add auth: ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_state DISABLE ROW LEVEL SECURITY;

-- 4. Insert default empty doc for joseph (upsert-safe)
INSERT INTO app_state (user_id, doc, updated_at)
VALUES (
  'joseph',
  '{"schemaVersion":3,"ui":{"activeWorld":"medi"},"medi":{"state":null,"sylState":{"topics":[],"checked":{}},"caseLog":[]},"kinetix":{"checks":{},"bm":{"d":21.0975,"t":8602,"label":"Jun 14 HM (2:23:22 · 29 °C / 80 % RH)"},"heat":false}}',
  0
)
ON CONFLICT (user_id) DO NOTHING;

-- Done. Verify:
SELECT user_id, updated_at, jsonb_pretty(doc) FROM app_state WHERE user_id = 'joseph';
