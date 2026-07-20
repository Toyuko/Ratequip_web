BEGIN;

-- Domain 43: ERP Integrations
CREATE SCHEMA IF NOT EXISTS erp;
CREATE TABLE IF NOT EXISTS erp.erp_connector_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_connector_types_company_status ON erp.erp_connector_types(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_connector_types_site ON erp.erp_connector_types(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_connector_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_connector_types_tenant_policy ON erp.erp_connector_types USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_installations_company_status ON erp.erp_installations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_installations_site ON erp.erp_installations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_installations_tenant_policy ON erp.erp_installations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_credentials_company_status ON erp.erp_credentials(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_credentials_site ON erp.erp_credentials(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_credentials_tenant_policy ON erp.erp_credentials USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_company_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_company_mappings_company_status ON erp.erp_company_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_company_mappings_site ON erp.erp_company_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_company_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_company_mappings_tenant_policy ON erp.erp_company_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_object_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_object_mappings_company_status ON erp.erp_object_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_object_mappings_site ON erp.erp_object_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_object_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_object_mappings_tenant_policy ON erp.erp_object_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_field_mappings_company_status ON erp.erp_field_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_field_mappings_site ON erp.erp_field_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_field_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_field_mappings_tenant_policy ON erp.erp_field_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_sync_jobs_company_status ON erp.erp_sync_jobs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_sync_jobs_site ON erp.erp_sync_jobs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_sync_jobs_tenant_policy ON erp.erp_sync_jobs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_sync_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_sync_checkpoints_company_status ON erp.erp_sync_checkpoints(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_sync_checkpoints_site ON erp.erp_sync_checkpoints(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_sync_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_sync_checkpoints_tenant_policy ON erp.erp_sync_checkpoints USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_change_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_change_records_company_status ON erp.erp_change_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_change_records_site ON erp.erp_change_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_change_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_change_records_tenant_policy ON erp.erp_change_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_conflicts_company_status ON erp.erp_conflicts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_conflicts_site ON erp.erp_conflicts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_conflicts_tenant_policy ON erp.erp_conflicts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_dead_letters_company_status ON erp.erp_dead_letters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_dead_letters_site ON erp.erp_dead_letters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_dead_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_dead_letters_tenant_policy ON erp.erp_dead_letters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_reconciliation_runs_company_status ON erp.erp_reconciliation_runs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_reconciliation_runs_site ON erp.erp_reconciliation_runs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_reconciliation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_reconciliation_runs_tenant_policy ON erp.erp_reconciliation_runs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS erp.erp_export_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('draft', 'configured', 'testing', 'active', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_erp_erp_export_batches_company_status ON erp.erp_export_batches(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_erp_erp_export_batches_site ON erp.erp_export_batches(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE erp.erp_export_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY erp_erp_export_batches_tenant_policy ON erp.erp_export_batches USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 44: CMMS and EAM Integrations
CREATE SCHEMA IF NOT EXISTS cmms;
CREATE TABLE IF NOT EXISTS cmms.cmms_connector_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_connector_types_company_status ON cmms.cmms_connector_types(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_connector_types_site ON cmms.cmms_connector_types(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_connector_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_connector_types_tenant_policy ON cmms.cmms_connector_types USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_installations_company_status ON cmms.cmms_installations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_installations_site ON cmms.cmms_installations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_installations_tenant_policy ON cmms.cmms_installations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_asset_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_asset_mappings_company_status ON cmms.cmms_asset_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_asset_mappings_site ON cmms.cmms_asset_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_asset_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_asset_mappings_tenant_policy ON cmms.cmms_asset_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_work_order_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_work_order_mappings_company_status ON cmms.cmms_work_order_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_work_order_mappings_site ON cmms.cmms_work_order_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_work_order_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_work_order_mappings_tenant_policy ON cmms.cmms_work_order_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_plan_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_plan_mappings_company_status ON cmms.cmms_plan_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_plan_mappings_site ON cmms.cmms_plan_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_plan_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_plan_mappings_tenant_policy ON cmms.cmms_plan_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_part_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_part_mappings_company_status ON cmms.cmms_part_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_part_mappings_site ON cmms.cmms_part_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_part_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_part_mappings_tenant_policy ON cmms.cmms_part_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_technician_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_technician_mappings_company_status ON cmms.cmms_technician_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_technician_mappings_site ON cmms.cmms_technician_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_technician_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_technician_mappings_tenant_policy ON cmms.cmms_technician_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_sync_jobs_company_status ON cmms.cmms_sync_jobs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_sync_jobs_site ON cmms.cmms_sync_jobs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_sync_jobs_tenant_policy ON cmms.cmms_sync_jobs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_checkpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_checkpoints_company_status ON cmms.cmms_checkpoints(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_checkpoints_site ON cmms.cmms_checkpoints(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_checkpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_checkpoints_tenant_policy ON cmms.cmms_checkpoints USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_conflicts_company_status ON cmms.cmms_conflicts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_conflicts_site ON cmms.cmms_conflicts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_conflicts_tenant_policy ON cmms.cmms_conflicts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_dead_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_dead_letters_company_status ON cmms.cmms_dead_letters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_dead_letters_site ON cmms.cmms_dead_letters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_dead_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_dead_letters_tenant_policy ON cmms.cmms_dead_letters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS cmms.cmms_reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'configured',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  policy_version text NULL,
  effective_from timestamptz NULL,
  effective_to timestamptz NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  content_hash text NULL,
  created_by uuid NULL,
  updated_by uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz NULL,
  CHECK (effective_to IS NULL OR effective_from IS NULL OR effective_to > effective_from),
  CHECK (status IN ('configured', 'active', 'read_only', 'degraded', 'paused', 'failed', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_reconciliation_runs_company_status ON cmms.cmms_reconciliation_runs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_cmms_cmms_reconciliation_runs_site ON cmms.cmms_reconciliation_runs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE cmms.cmms_reconciliation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY cmms_cmms_reconciliation_runs_tenant_policy ON cmms.cmms_reconciliation_runs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
