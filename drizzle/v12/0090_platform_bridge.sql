-- Bridge V12 rq.* identity to the existing public platform (Clerk / slugs / demo keys)
BEGIN;

ALTER TABLE rq.companies
  ADD COLUMN IF NOT EXISTS external_key text,
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS trust_score numeric(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claimed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS country varchar(100);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rq_companies_external_key
  ON rq.companies(external_key) WHERE external_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_rq_companies_slug
  ON rq.companies(slug) WHERE slug IS NOT NULL;

ALTER TABLE rq.users
  ADD COLUMN IF NOT EXISTS clerk_user_id text,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS primary_role text;

CREATE UNIQUE INDEX IF NOT EXISTS uq_rq_users_clerk
  ON rq.users(clerk_user_id) WHERE clerk_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS rq.platform_sync_state (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
