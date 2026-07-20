BEGIN;

-- Domain 55: Developer SDKs and CLI
CREATE SCHEMA IF NOT EXISTS sdk;
CREATE TABLE IF NOT EXISTS sdk.sdk_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_packages_company_status ON sdk.sdk_packages(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_packages_site ON sdk.sdk_packages(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_packages_tenant_policy ON sdk.sdk_packages USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_versions_company_status ON sdk.sdk_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_versions_site ON sdk.sdk_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_versions_tenant_policy ON sdk.sdk_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_languages_company_status ON sdk.sdk_languages(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_languages_site ON sdk.sdk_languages(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_languages_tenant_policy ON sdk.sdk_languages USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_generation_jobs_company_status ON sdk.sdk_generation_jobs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_generation_jobs_site ON sdk.sdk_generation_jobs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_generation_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_generation_jobs_tenant_policy ON sdk.sdk_generation_jobs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_compatibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_compatibility_company_status ON sdk.sdk_compatibility(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_compatibility_site ON sdk.sdk_compatibility(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_compatibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_compatibility_tenant_policy ON sdk.sdk_compatibility USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_examples_company_status ON sdk.sdk_examples(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_examples_site ON sdk.sdk_examples(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_examples ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_examples_tenant_policy ON sdk.sdk_examples USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_release_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_release_channels_company_status ON sdk.sdk_release_channels(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_release_channels_site ON sdk.sdk_release_channels(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_release_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_release_channels_tenant_policy ON sdk.sdk_release_channels USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.cli_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_cli_releases_company_status ON sdk.cli_releases(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_cli_releases_site ON sdk.cli_releases(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.cli_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_cli_releases_tenant_policy ON sdk.cli_releases USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_issue_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_issue_records_company_status ON sdk.sdk_issue_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_issue_records_site ON sdk.sdk_issue_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_issue_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_issue_records_tenant_policy ON sdk.sdk_issue_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS sdk.sdk_telemetry_opt_in (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'generated',
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
  CHECK (status IN ('generated', 'testing', 'preview', 'stable', 'deprecated', 'revoked')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_telemetry_opt_in_company_status ON sdk.sdk_telemetry_opt_in(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_sdk_sdk_telemetry_opt_in_site ON sdk.sdk_telemetry_opt_in(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE sdk.sdk_telemetry_opt_in ENABLE ROW LEVEL SECURITY;
CREATE POLICY sdk_sdk_telemetry_opt_in_tenant_policy ON sdk.sdk_telemetry_opt_in USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 56: Cloud Infrastructure and Platform Engineering
CREATE SCHEMA IF NOT EXISTS infra;
CREATE TABLE IF NOT EXISTS infra.infrastructure_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_environments_company_status ON infra.infrastructure_environments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_environments_site ON infra.infrastructure_environments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.infrastructure_environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_infrastructure_environments_tenant_policy ON infra.infrastructure_environments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.infrastructure_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_modules_company_status ON infra.infrastructure_modules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_modules_site ON infra.infrastructure_modules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.infrastructure_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_infrastructure_modules_tenant_policy ON infra.infrastructure_modules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.infrastructure_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_releases_company_status ON infra.infrastructure_releases(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_releases_site ON infra.infrastructure_releases(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.infrastructure_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_infrastructure_releases_tenant_policy ON infra.infrastructure_releases USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.cluster_registries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_cluster_registries_company_status ON infra.cluster_registries(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_cluster_registries_site ON infra.cluster_registries(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.cluster_registries ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_cluster_registries_tenant_policy ON infra.cluster_registries USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.database_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_database_clusters_company_status ON infra.database_clusters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_database_clusters_site ON infra.database_clusters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.database_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_database_clusters_tenant_policy ON infra.database_clusters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.object_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_object_stores_company_status ON infra.object_stores(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_object_stores_site ON infra.object_stores(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.object_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_object_stores_tenant_policy ON infra.object_stores USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.event_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_event_clusters_company_status ON infra.event_clusters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_event_clusters_site ON infra.event_clusters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.event_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_event_clusters_tenant_policy ON infra.event_clusters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.search_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_search_clusters_company_status ON infra.search_clusters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_search_clusters_site ON infra.search_clusters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.search_clusters ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_search_clusters_tenant_policy ON infra.search_clusters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.secret_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_secret_stores_company_status ON infra.secret_stores(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_secret_stores_site ON infra.secret_stores(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.secret_stores ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_secret_stores_tenant_policy ON infra.secret_stores USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.backup_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_backup_policies_company_status ON infra.backup_policies(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_backup_policies_site ON infra.backup_policies(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.backup_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_backup_policies_tenant_policy ON infra.backup_policies USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.backup_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_backup_runs_company_status ON infra.backup_runs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_backup_runs_site ON infra.backup_runs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.backup_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_backup_runs_tenant_policy ON infra.backup_runs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.restore_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_restore_tests_company_status ON infra.restore_tests(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_restore_tests_site ON infra.restore_tests(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.restore_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_restore_tests_tenant_policy ON infra.restore_tests USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.capacity_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_capacity_plans_company_status ON infra.capacity_plans(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_capacity_plans_site ON infra.capacity_plans(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.capacity_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_capacity_plans_tenant_policy ON infra.capacity_plans USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.cost_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_cost_budgets_company_status ON infra.cost_budgets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_cost_budgets_site ON infra.cost_budgets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.cost_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_cost_budgets_tenant_policy ON infra.cost_budgets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS infra.infrastructure_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'planned',
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
  CHECK (status IN ('planned', 'provisioning', 'active', 'degraded', 'maintenance', 'draining', 'destroyed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_exceptions_company_status ON infra.infrastructure_exceptions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_infra_infrastructure_exceptions_site ON infra.infrastructure_exceptions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE infra.infrastructure_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY infra_infrastructure_exceptions_tenant_policy ON infra.infrastructure_exceptions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
