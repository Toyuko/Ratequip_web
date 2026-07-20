-- RateQuip V12.1 Add-On 01 / Part 4
-- App migration number 0032 (canonical Part 4 was 0024-0028; renumbered because 0024-0029 already hold Part 5 on Neon).
-- Forward-only additive migration. Execute after V12 Part 3 migration 0023.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS support_privacy;
CREATE TABLE IF NOT EXISTS support_privacy.diagnostic_bundle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  requested_by uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  content_included boolean NOT NULL DEFAULT false,
  manifest_sha256 text
);
ALTER TABLE support_privacy.diagnostic_bundle ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS diagnostic_bundle_tenant_isolation ON support_privacy.diagnostic_bundle;
CREATE POLICY diagnostic_bundle_tenant_isolation ON support_privacy.diagnostic_bundle
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_diagnostic_bundle_tenant_status ON support_privacy.diagnostic_bundle(tenant_id,status);
CREATE TABLE IF NOT EXISTS support_privacy.diagnostic_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  bundle_id uuid NOT NULL REFERENCES support_privacy.diagnostic_bundle(id),
  item_type text NOT NULL,
  field_name text NOT NULL,
  sanitisation text NOT NULL,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE support_privacy.diagnostic_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS diagnostic_item_tenant_isolation ON support_privacy.diagnostic_item;
CREATE POLICY diagnostic_item_tenant_isolation ON support_privacy.diagnostic_item
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_diagnostic_item_tenant_status ON support_privacy.diagnostic_item(tenant_id,status);
CREATE TABLE IF NOT EXISTS support_privacy.support_consent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  granted_by uuid NOT NULL,
  purpose text NOT NULL,
  object_scope jsonb NOT NULL,
  operator_class text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz
);
ALTER TABLE support_privacy.support_consent ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS support_consent_tenant_isolation ON support_privacy.support_consent;
CREATE POLICY support_consent_tenant_isolation ON support_privacy.support_consent
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_support_consent_tenant_status ON support_privacy.support_consent(tenant_id,status);
CREATE TABLE IF NOT EXISTS support_privacy.support_content_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  consent_id uuid NOT NULL REFERENCES support_privacy.support_consent(id),
  operator_id uuid NOT NULL,
  object_type text NOT NULL,
  object_id uuid NOT NULL,
  fields_accessed jsonb NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  purpose text NOT NULL
);
ALTER TABLE support_privacy.support_content_access ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS support_content_access_tenant_isolation ON support_privacy.support_content_access;
CREATE POLICY support_content_access_tenant_isolation ON support_privacy.support_content_access
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_support_content_access_tenant_status ON support_privacy.support_content_access(tenant_id,status);

COMMIT;
