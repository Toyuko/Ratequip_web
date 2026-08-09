-- Optional non-English organisation name (Thai, Chinese, etc.).
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS name_local varchar(255);
ALTER TABLE organisations ADD COLUMN IF NOT EXISTS name_local_locale varchar(16);
