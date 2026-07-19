-- Account media: photos, videos, and documents on company profiles.
-- Apply via: npm run db:push (preferred) or run this SQL on Neon.

create table if not exists company_media (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id),
  organisation_id uuid references organisations (id),
  uploaded_by_user_id uuid references users (id),
  kind varchar(32) not null,
  blob_url text not null,
  file_name varchar(255) not null,
  mime_type varchar(128),
  byte_size integer,
  title varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists company_media_company_id_idx
  on company_media (company_id)
  where deleted_at is null;

create index if not exists company_media_kind_idx
  on company_media (company_id, kind)
  where deleted_at is null;
