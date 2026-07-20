BEGIN;

-- Domain 45: SCADA and Historian Integrations
CREATE SCHEMA IF NOT EXISTS scada;
CREATE TABLE IF NOT EXISTS scada.scada_gateway_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_gateway_types_company_status ON scada.scada_gateway_types(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_gateway_types_site ON scada.scada_gateway_types(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_gateway_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_gateway_types_tenant_policy ON scada.scada_gateway_types USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_gateways_company_status ON scada.scada_gateways(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_gateways_site ON scada.scada_gateways(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_gateways ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_gateways_tenant_policy ON scada.scada_gateways USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_endpoints_company_status ON scada.scada_endpoints(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_endpoints_site ON scada.scada_endpoints(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_endpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_endpoints_tenant_policy ON scada.scada_endpoints USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_tag_catalogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_tag_catalogs_company_status ON scada.scada_tag_catalogs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_tag_catalogs_site ON scada.scada_tag_catalogs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_tag_catalogs ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_tag_catalogs_tenant_policy ON scada.scada_tag_catalogs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_tag_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_tag_mappings_company_status ON scada.scada_tag_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_tag_mappings_site ON scada.scada_tag_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_tag_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_tag_mappings_tenant_policy ON scada.scada_tag_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_alarm_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_alarm_mappings_company_status ON scada.scada_alarm_mappings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_alarm_mappings_site ON scada.scada_alarm_mappings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_alarm_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_alarm_mappings_tenant_policy ON scada.scada_alarm_mappings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_subscriptions_company_status ON scada.scada_subscriptions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_subscriptions_site ON scada.scada_subscriptions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_subscriptions_tenant_policy ON scada.scada_subscriptions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_historian_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_historian_queries_company_status ON scada.scada_historian_queries(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_historian_queries_site ON scada.scada_historian_queries(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_historian_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_historian_queries_tenant_policy ON scada.scada_historian_queries USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_data_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_data_batches_company_status ON scada.scada_data_batches(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_data_batches_site ON scada.scada_data_batches(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_data_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_data_batches_tenant_policy ON scada.scada_data_batches USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_connection_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_connection_health_company_status ON scada.scada_connection_health(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_connection_health_site ON scada.scada_connection_health(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_connection_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_connection_health_tenant_policy ON scada.scada_connection_health USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_access_sessions_company_status ON scada.scada_access_sessions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_access_sessions_site ON scada.scada_access_sessions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_access_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_access_sessions_tenant_policy ON scada.scada_access_sessions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS scada.scada_write_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'commissioning', 'active', 'degraded', 'isolated', 'maintenance', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_scada_scada_write_requests_company_status ON scada.scada_write_requests(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_scada_scada_write_requests_site ON scada.scada_write_requests(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE scada.scada_write_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY scada_scada_write_requests_tenant_policy ON scada.scada_write_requests USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 46: PLC and Automation Platform Integrations
CREATE SCHEMA IF NOT EXISTS plc;
CREATE TABLE IF NOT EXISTS plc.plc_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_platforms_company_status ON plc.plc_platforms(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_platforms_site ON plc.plc_platforms(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_platforms_tenant_policy ON plc.plc_platforms USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_devices_company_status ON plc.plc_devices(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_devices_site ON plc.plc_devices(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_devices_tenant_policy ON plc.plc_devices USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_programs_company_status ON plc.plc_programs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_programs_site ON plc.plc_programs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_programs_tenant_policy ON plc.plc_programs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_program_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_program_versions_company_status ON plc.plc_program_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_program_versions_site ON plc.plc_program_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_program_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_program_versions_tenant_policy ON plc.plc_program_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_backups_company_status ON plc.plc_backups(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_backups_site ON plc.plc_backups(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_backups ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_backups_tenant_policy ON plc.plc_backups USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_firmware_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_firmware_records_company_status ON plc.plc_firmware_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_firmware_records_site ON plc.plc_firmware_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_firmware_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_firmware_records_tenant_policy ON plc.plc_firmware_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_checksum_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_checksum_records_company_status ON plc.plc_checksum_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_checksum_records_site ON plc.plc_checksum_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_checksum_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_checksum_records_tenant_policy ON plc.plc_checksum_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_change_requests_company_status ON plc.plc_change_requests(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_change_requests_site ON plc.plc_change_requests(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_change_requests_tenant_policy ON plc.plc_change_requests USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_change_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_change_approvals_company_status ON plc.plc_change_approvals(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_change_approvals_site ON plc.plc_change_approvals(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_change_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_change_approvals_tenant_policy ON plc.plc_change_approvals USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_access_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_access_sessions_company_status ON plc.plc_access_sessions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_access_sessions_site ON plc.plc_access_sessions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_access_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_access_sessions_tenant_policy ON plc.plc_access_sessions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_engineering_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_engineering_tools_company_status ON plc.plc_engineering_tools(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_engineering_tools_site ON plc.plc_engineering_tools(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_engineering_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_engineering_tools_tenant_policy ON plc.plc_engineering_tools USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_restore_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_restore_tests_company_status ON plc.plc_restore_tests(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_restore_tests_site ON plc.plc_restore_tests(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_restore_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_restore_tests_tenant_policy ON plc.plc_restore_tests USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS plc.plc_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'registered',
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
  CHECK (status IN ('registered', 'verified', 'change_pending', 'access_active', 'changed', 'restore_tested', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_plc_plc_incidents_company_status ON plc.plc_incidents(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_plc_plc_incidents_site ON plc.plc_incidents(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE plc.plc_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY plc_plc_incidents_tenant_policy ON plc.plc_incidents USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
