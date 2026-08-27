-- FORM & HALO — project attachment support
-- Allow project files to belong directly to a CRM lead.

ALTER TABLE documents ADD COLUMN lead_id TEXT REFERENCES leads(id) ON DELETE CASCADE;

-- SQLite cannot alter an existing CHECK constraint in place.
-- The application will use the new lead_id relation for project attachments.
