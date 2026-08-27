-- FORM & HALO — CRM lead layer
-- Keeps customers as the master contact record and stores each project inquiry as a first-class lead.

CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','follow_up','won','lost')),
  source TEXT NOT NULL DEFAULT 'website',
  project_details TEXT,
  interests TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_leads_customer_id ON leads(customer_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at);
