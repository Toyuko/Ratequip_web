-- RateQuip V12.1 Add-On 01 / Part 4
-- App migration number 0033 (canonical Part 4 was 0024-0028; renumbered because 0024-0029 already hold Part 5 on Neon).
-- Forward-only additive migration. Execute after V12 Part 3 migration 0023.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS growth_governance;
CREATE TABLE IF NOT EXISTS growth_governance.import_batch (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  source_name text NOT NULL,
  source_sha256 text NOT NULL,
  schema_version text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0
);
ALTER TABLE growth_governance.import_batch ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS import_batch_tenant_isolation ON growth_governance.import_batch;
CREATE POLICY import_batch_tenant_isolation ON growth_governance.import_batch
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_import_batch_tenant_status ON growth_governance.import_batch(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.import_row (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  batch_id uuid NOT NULL REFERENCES growth_governance.import_batch(id),
  row_number integer NOT NULL,
  raw_data jsonb NOT NULL,
  normalized_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(batch_id,row_number)
);
ALTER TABLE growth_governance.import_row ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS import_row_tenant_isolation ON growth_governance.import_row;
CREATE POLICY import_row_tenant_isolation ON growth_governance.import_row
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_import_row_tenant_status ON growth_governance.import_row(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.duplicate_candidate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  batch_id uuid NOT NULL REFERENCES growth_governance.import_batch(id),
  import_row_id uuid NOT NULL REFERENCES growth_governance.import_row(id),
  existing_company_id uuid,
  score numeric(8,6) NOT NULL,
  factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution text
);
ALTER TABLE growth_governance.duplicate_candidate ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS duplicate_candidate_tenant_isolation ON growth_governance.duplicate_candidate;
CREATE POLICY duplicate_candidate_tenant_isolation ON growth_governance.duplicate_candidate
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_duplicate_candidate_tenant_status ON growth_governance.duplicate_candidate(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.contact_point_provenance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  company_id uuid,
  contact_type text NOT NULL,
  contact_value text NOT NULL,
  evidence_class text NOT NULL,
  source_url text,
  confidence numeric(8,6),
  verified_at timestamptz
);
ALTER TABLE growth_governance.contact_point_provenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS contact_point_provenance_tenant_isolation ON growth_governance.contact_point_provenance;
CREATE POLICY contact_point_provenance_tenant_isolation ON growth_governance.contact_point_provenance
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_contact_point_provenance_tenant_status ON growth_governance.contact_point_provenance(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.claim_campaign (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  campaign_name text NOT NULL,
  purpose text NOT NULL,
  sender_identity text NOT NULL,
  jurisdiction_policy text NOT NULL,
  cadence_policy jsonb NOT NULL,
  approved_at timestamptz
);
ALTER TABLE growth_governance.claim_campaign ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS claim_campaign_tenant_isolation ON growth_governance.claim_campaign;
CREATE POLICY claim_campaign_tenant_isolation ON growth_governance.claim_campaign
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_claim_campaign_tenant_status ON growth_governance.claim_campaign(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.suppression_entry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  normalized_destination text NOT NULL,
  reason text NOT NULL,
  source text NOT NULL,
  effective_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id,normalized_destination)
);
ALTER TABLE growth_governance.suppression_entry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS suppression_entry_tenant_isolation ON growth_governance.suppression_entry;
CREATE POLICY suppression_entry_tenant_isolation ON growth_governance.suppression_entry
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_suppression_entry_tenant_status ON growth_governance.suppression_entry(tenant_id,status);
CREATE TABLE IF NOT EXISTS growth_governance.campaign_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  campaign_id uuid NOT NULL REFERENCES growth_governance.claim_campaign(id),
  destination text NOT NULL,
  attribution jsonb NOT NULL DEFAULT '{}'::jsonb,
  suppression_checked_at timestamptz NOT NULL,
  sent_at timestamptz,
  delivery_status text
);
ALTER TABLE growth_governance.campaign_delivery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campaign_delivery_tenant_isolation ON growth_governance.campaign_delivery;
CREATE POLICY campaign_delivery_tenant_isolation ON growth_governance.campaign_delivery
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_campaign_delivery_tenant_status ON growth_governance.campaign_delivery(tenant_id,status);

COMMIT;
