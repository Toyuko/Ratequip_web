-- RateQuip V12.1 Add-On 01 / Part 4
-- App migration number 0030 (canonical Part 4 was 0024-0028; renumbered because 0024-0029 already hold Part 5 on Neon).
-- Forward-only additive migration. Execute after V12 Part 3 migration 0023.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS release_mgmt;
CREATE TABLE IF NOT EXISTS release_mgmt.addon_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  release_key text NOT NULL,
  predecessor_release text NOT NULL,
  checksum_sha256 text NOT NULL,
  compatibility_min text,
  compatibility_max text,
  UNIQUE(tenant_id,release_key)
);
ALTER TABLE release_mgmt.addon_release ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS addon_release_tenant_isolation ON release_mgmt.addon_release;
CREATE POLICY addon_release_tenant_isolation ON release_mgmt.addon_release
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_addon_release_tenant_status ON release_mgmt.addon_release(tenant_id,status);
CREATE TABLE IF NOT EXISTS release_mgmt.compatibility_contract (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  release_id uuid NOT NULL REFERENCES release_mgmt.addon_release(id),
  contract_json jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE release_mgmt.compatibility_contract ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS compatibility_contract_tenant_isolation ON release_mgmt.compatibility_contract;
CREATE POLICY compatibility_contract_tenant_isolation ON release_mgmt.compatibility_contract
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_compatibility_contract_tenant_status ON release_mgmt.compatibility_contract(tenant_id,status);
CREATE TABLE IF NOT EXISTS release_mgmt.patch_operation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  release_id uuid NOT NULL REFERENCES release_mgmt.addon_release(id),
  sequence_no integer NOT NULL,
  operation text NOT NULL,
  target_path text NOT NULL,
  expected_before_sha256 text,
  after_sha256 text,
  UNIQUE(release_id,sequence_no)
);
ALTER TABLE release_mgmt.patch_operation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS patch_operation_tenant_isolation ON release_mgmt.patch_operation;
CREATE POLICY patch_operation_tenant_isolation ON release_mgmt.patch_operation
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_patch_operation_tenant_status ON release_mgmt.patch_operation(tenant_id,status);
CREATE TABLE IF NOT EXISTS release_mgmt.applied_release (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  release_id uuid NOT NULL REFERENCES release_mgmt.addon_release(id),
  environment text NOT NULL,
  applied_at timestamptz,
  validation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(tenant_id,release_id,environment)
);
ALTER TABLE release_mgmt.applied_release ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS applied_release_tenant_isolation ON release_mgmt.applied_release;
CREATE POLICY applied_release_tenant_isolation ON release_mgmt.applied_release
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_applied_release_tenant_status ON release_mgmt.applied_release(tenant_id,status);
CREATE TABLE IF NOT EXISTS release_mgmt.checksum_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  release_id uuid NOT NULL REFERENCES release_mgmt.addon_release(id),
  path text NOT NULL,
  sha256 text NOT NULL,
  size_bytes bigint NOT NULL,
  UNIQUE(release_id,path)
);
ALTER TABLE release_mgmt.checksum_record ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS checksum_record_tenant_isolation ON release_mgmt.checksum_record;
CREATE POLICY checksum_record_tenant_isolation ON release_mgmt.checksum_record
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_checksum_record_tenant_status ON release_mgmt.checksum_record(tenant_id,status);

COMMIT;
