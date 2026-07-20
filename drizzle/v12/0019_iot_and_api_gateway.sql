BEGIN;

-- Domain 47: Industrial IoT and Edge Gateway
CREATE SCHEMA IF NOT EXISTS iot;
CREATE TABLE IF NOT EXISTS iot.edge_agent_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_edge_agent_types_company_status ON iot.edge_agent_types(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_edge_agent_types_site ON iot.edge_agent_types(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.edge_agent_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_edge_agent_types_tenant_policy ON iot.edge_agent_types USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.edge_agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_edge_agents_company_status ON iot.edge_agents(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_edge_agents_site ON iot.edge_agents(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.edge_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_edge_agents_tenant_policy ON iot.edge_agents USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.iot_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_iot_devices_company_status ON iot.iot_devices(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_iot_devices_site ON iot.iot_devices(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_iot_devices_tenant_policy ON iot.iot_devices USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.device_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_device_certificates_company_status ON iot.device_certificates(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_device_certificates_site ON iot.device_certificates(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.device_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_device_certificates_tenant_policy ON iot.device_certificates USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.telemetry_schemas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_schemas_company_status ON iot.telemetry_schemas(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_schemas_site ON iot.telemetry_schemas(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.telemetry_schemas ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_telemetry_schemas_tenant_policy ON iot.telemetry_schemas USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.telemetry_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_streams_company_status ON iot.telemetry_streams(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_streams_site ON iot.telemetry_streams(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.telemetry_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_telemetry_streams_tenant_policy ON iot.telemetry_streams USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.telemetry_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_measurements_company_status ON iot.telemetry_measurements(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_telemetry_measurements_site ON iot.telemetry_measurements(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.telemetry_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_telemetry_measurements_tenant_policy ON iot.telemetry_measurements USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.ingestion_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_ingestion_batches_company_status ON iot.ingestion_batches(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_ingestion_batches_site ON iot.ingestion_batches(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.ingestion_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_ingestion_batches_tenant_policy ON iot.ingestion_batches USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.edge_buffers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_edge_buffers_company_status ON iot.edge_buffers(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_edge_buffers_site ON iot.edge_buffers(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.edge_buffers ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_edge_buffers_tenant_policy ON iot.edge_buffers USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.iot_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_iot_rules_company_status ON iot.iot_rules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_iot_rules_site ON iot.iot_rules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.iot_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_iot_rules_tenant_policy ON iot.iot_rules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.iot_alarms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_iot_alarms_company_status ON iot.iot_alarms(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_iot_alarms_site ON iot.iot_alarms(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.iot_alarms ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_iot_alarms_tenant_policy ON iot.iot_alarms USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.device_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_device_commands_company_status ON iot.device_commands(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_device_commands_site ON iot.device_commands(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.device_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_device_commands_tenant_policy ON iot.device_commands USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.command_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_command_approvals_company_status ON iot.command_approvals(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_command_approvals_site ON iot.command_approvals(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.command_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_command_approvals_tenant_policy ON iot.command_approvals USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.ota_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_ota_packages_company_status ON iot.ota_packages(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_ota_packages_site ON iot.ota_packages(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.ota_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_ota_packages_tenant_policy ON iot.ota_packages USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.ota_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_ota_deployments_company_status ON iot.ota_deployments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_ota_deployments_site ON iot.ota_deployments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.ota_deployments ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_ota_deployments_tenant_policy ON iot.ota_deployments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS iot.device_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'provisioning',
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
  CHECK (status IN ('provisioning', 'active', 'offline', 'buffering', 'degraded', 'quarantined', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_iot_device_health_company_status ON iot.device_health(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_iot_device_health_site ON iot.device_health(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE iot.device_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY iot_device_health_tenant_policy ON iot.device_health USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 48: Enterprise API Gateway
CREATE SCHEMA IF NOT EXISTS gateway;
CREATE TABLE IF NOT EXISTS gateway.gateway_routes (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_routes_company_status ON gateway.gateway_routes(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_routes_site ON gateway.gateway_routes(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_routes_tenant_policy ON gateway.gateway_routes USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_route_versions (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_route_versions_company_status ON gateway.gateway_route_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_route_versions_site ON gateway.gateway_route_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_route_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_route_versions_tenant_policy ON gateway.gateway_route_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_policies (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_policies_company_status ON gateway.gateway_policies(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_policies_site ON gateway.gateway_policies(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_policies_tenant_policy ON gateway.gateway_policies USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_policy_bindings (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_policy_bindings_company_status ON gateway.gateway_policy_bindings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_policy_bindings_site ON gateway.gateway_policy_bindings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_policy_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_policy_bindings_tenant_policy ON gateway.gateway_policy_bindings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.rate_limit_plans (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_rate_limit_plans_company_status ON gateway.rate_limit_plans(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_rate_limit_plans_site ON gateway.rate_limit_plans(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.rate_limit_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_rate_limit_plans_tenant_policy ON gateway.rate_limit_plans USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.quota_allocations (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_quota_allocations_company_status ON gateway.quota_allocations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_quota_allocations_site ON gateway.quota_allocations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.quota_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_quota_allocations_tenant_policy ON gateway.quota_allocations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_clients (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_clients_company_status ON gateway.gateway_clients(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_clients_site ON gateway.gateway_clients(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_clients_tenant_policy ON gateway.gateway_clients USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_credentials (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_credentials_company_status ON gateway.gateway_credentials(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_credentials_site ON gateway.gateway_credentials(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_credentials_tenant_policy ON gateway.gateway_credentials USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.waf_rules (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_waf_rules_company_status ON gateway.waf_rules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_waf_rules_site ON gateway.waf_rules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.waf_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_waf_rules_tenant_policy ON gateway.waf_rules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.ip_allowlists (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_ip_allowlists_company_status ON gateway.ip_allowlists(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_ip_allowlists_site ON gateway.ip_allowlists(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.ip_allowlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_ip_allowlists_tenant_policy ON gateway.ip_allowlists USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.request_logs (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_request_logs_company_status ON gateway.request_logs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_request_logs_site ON gateway.request_logs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.request_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_request_logs_tenant_policy ON gateway.request_logs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.threat_detections (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_threat_detections_company_status ON gateway.threat_detections(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_threat_detections_site ON gateway.threat_detections(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.threat_detections ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_threat_detections_tenant_policy ON gateway.threat_detections USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.api_version_registry (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_api_version_registry_company_status ON gateway.api_version_registry(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_api_version_registry_site ON gateway.api_version_registry(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.api_version_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_api_version_registry_tenant_policy ON gateway.api_version_registry USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.deprecation_notices (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_deprecation_notices_company_status ON gateway.deprecation_notices(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_deprecation_notices_site ON gateway.deprecation_notices(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.deprecation_notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_deprecation_notices_tenant_policy ON gateway.deprecation_notices USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS gateway.gateway_incidents (
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
  CHECK (status IN ('draft', 'published', 'active', 'degraded', 'blocked', 'deprecated', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_incidents_company_status ON gateway.gateway_incidents(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_gateway_gateway_incidents_site ON gateway.gateway_incidents(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE gateway.gateway_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY gateway_gateway_incidents_tenant_policy ON gateway.gateway_incidents USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
