-- FORM & HALO — allow documents to belong to CRM leads
-- Rebuild documents so project attachments have a dedicated type and lead relation.

PRAGMA foreign_keys = OFF;

CREATE TABLE documents_new (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('receipt','installation_manual','shipping_label','order_document','project_attachment')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  version TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (customer_id IS NOT NULL OR order_id IS NOT NULL OR lead_id IS NOT NULL)
);

INSERT INTO documents_new (id, customer_id, order_id, lead_id, type, file_url, file_name, version, expires_at, created_at)
SELECT id, customer_id, order_id, lead_id, type, file_url, file_name, version, expires_at, created_at
FROM documents;

DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;

CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_order ON documents(order_id);
CREATE INDEX IF NOT EXISTS idx_documents_lead ON documents(lead_id);

PRAGMA foreign_keys = ON;
