-- Persist onboarding contact fields on organisations.
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_email varchar(255);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS contact_name varchar(255);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS phone varchar(64);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS address text;
