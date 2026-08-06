-- RateQuip Part 7 — Business DNA / AI Intelligent Onboarding (additive)
-- Forward-only. Does not alter Phase 2 tables.
-- Bridges to rq_marketplace_ext.operating_profile via tenant_id / company_id in payload.
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS onboarding;

CREATE TABLE IF NOT EXISTS onboarding.business_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  company_id text,
  setup_session_id text,
  operating_profile_id text,
  legal_name text NOT NULL,
  role text,
  industry_pack text,
  profile_status text NOT NULL DEFAULT 'draft'
    CHECK (profile_status IN ('draft','in_review','confirmed','archived')),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text,
  UNIQUE(tenant_id, legal_name)
);

CREATE TABLE IF NOT EXISTS onboarding.business_fact (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  business_profile_id uuid NOT NULL REFERENCES onboarding.business_profile(id) ON DELETE CASCADE,
  predicate text NOT NULL,
  object_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_type text NOT NULL,
  source_id text,
  confidence numeric(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  confirmation_status text NOT NULL DEFAULT 'inferred'
    CHECK (confirmation_status IN ('observed','inferred','confirmed','rejected','superseded')),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_to timestamptz,
  last_verified_at timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_fact_lookup_idx
  ON onboarding.business_fact(tenant_id, business_profile_id, predicate)
  WHERE valid_to IS NULL;

CREATE INDEX IF NOT EXISTS business_profile_tenant_status_idx
  ON onboarding.business_profile(tenant_id, profile_status);

CREATE TABLE IF NOT EXISTS onboarding.setup_session_checkpoint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  setup_session_id text NOT NULL,
  business_profile_id uuid REFERENCES onboarding.business_profile(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, setup_session_id)
);

ALTER TABLE onboarding.business_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.business_fact ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding.setup_session_checkpoint ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_profile_policy ON onboarding.business_profile;
CREATE POLICY tenant_profile_policy ON onboarding.business_profile
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_fact_policy ON onboarding.business_fact;
CREATE POLICY tenant_fact_policy ON onboarding.business_fact
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

DROP POLICY IF EXISTS tenant_checkpoint_policy ON onboarding.setup_session_checkpoint;
CREATE POLICY tenant_checkpoint_policy ON onboarding.setup_session_checkpoint
  USING (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true), '')::uuid);

COMMIT;
