-- FORM & HALO — lead location fields
-- Keep country and ZIP/postal code queryable as first-class CRM fields.

ALTER TABLE leads ADD COLUMN country TEXT;
ALTER TABLE leads ADD COLUMN zip TEXT;
