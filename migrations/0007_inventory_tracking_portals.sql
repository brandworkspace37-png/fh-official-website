PRAGMA foreign_keys = ON;

-- Inventory / shipping portal access.
-- Raw portal tokens are never stored; only SHA-256 hashes are persisted.
ALTER TABLE shipments ADD COLUMN portal_token_hash TEXT;
ALTER TABLE shipments ADD COLUMN portal_token_expires_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_shipments_portal_token_hash
  ON shipments(portal_token_hash)
  WHERE portal_token_hash IS NOT NULL;
