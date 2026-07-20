BEGIN;

-- Domain 41: Enterprise Analytics Platform
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE TABLE IF NOT EXISTS analytics.metric_definitions (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_metric_definitions_company_status ON analytics.metric_definitions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_metric_definitions_site ON analytics.metric_definitions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.metric_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_metric_definitions_tenant_policy ON analytics.metric_definitions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.semantic_models (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_semantic_models_company_status ON analytics.semantic_models(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_semantic_models_site ON analytics.semantic_models(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.semantic_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_semantic_models_tenant_policy ON analytics.semantic_models USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.dimensions (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_dimensions_company_status ON analytics.dimensions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_dimensions_site ON analytics.dimensions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_dimensions_tenant_policy ON analytics.dimensions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.measures (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_measures_company_status ON analytics.measures(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_measures_site ON analytics.measures(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.measures ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_measures_tenant_policy ON analytics.measures USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.data_products (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_data_products_company_status ON analytics.data_products(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_data_products_site ON analytics.data_products(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.data_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_data_products_tenant_policy ON analytics.data_products USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.datasets (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_datasets_company_status ON analytics.datasets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_datasets_site ON analytics.datasets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.datasets ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_datasets_tenant_policy ON analytics.datasets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.dataset_versions (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_dataset_versions_company_status ON analytics.dataset_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_dataset_versions_site ON analytics.dataset_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.dataset_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_dataset_versions_tenant_policy ON analytics.dataset_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.lineage_edges (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_lineage_edges_company_status ON analytics.lineage_edges(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_lineage_edges_site ON analytics.lineage_edges(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.lineage_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_lineage_edges_tenant_policy ON analytics.lineage_edges USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.data_quality_rules (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_data_quality_rules_company_status ON analytics.data_quality_rules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_data_quality_rules_site ON analytics.data_quality_rules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.data_quality_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_data_quality_rules_tenant_policy ON analytics.data_quality_rules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.data_quality_results (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_data_quality_results_company_status ON analytics.data_quality_results(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_data_quality_results_site ON analytics.data_quality_results(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.data_quality_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_data_quality_results_tenant_policy ON analytics.data_quality_results USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.dashboards (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_dashboards_company_status ON analytics.dashboards(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_dashboards_site ON analytics.dashboards(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_dashboards_tenant_policy ON analytics.dashboards USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.dashboard_widgets (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_dashboard_widgets_company_status ON analytics.dashboard_widgets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_dashboard_widgets_site ON analytics.dashboard_widgets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_dashboard_widgets_tenant_policy ON analytics.dashboard_widgets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.reports (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_reports_company_status ON analytics.reports(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_reports_site ON analytics.reports(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_reports_tenant_policy ON analytics.reports USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.report_schedules (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_report_schedules_company_status ON analytics.report_schedules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_report_schedules_site ON analytics.report_schedules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.report_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_report_schedules_tenant_policy ON analytics.report_schedules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.cohorts (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_cohorts_company_status ON analytics.cohorts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_cohorts_site ON analytics.cohorts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.cohorts ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_cohorts_tenant_policy ON analytics.cohorts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.experiments (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_experiments_company_status ON analytics.experiments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_experiments_site ON analytics.experiments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_experiments_tenant_policy ON analytics.experiments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.forecast_models (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_forecast_models_company_status ON analytics.forecast_models(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_forecast_models_site ON analytics.forecast_models(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.forecast_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_forecast_models_tenant_policy ON analytics.forecast_models USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS analytics.analytics_exports (
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
  CHECK (status IN ('draft', 'published', 'refreshing', 'ready', 'degraded', 'failed', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_analytics_analytics_exports_company_status ON analytics.analytics_exports(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_analytics_analytics_exports_site ON analytics.analytics_exports(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE analytics.analytics_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_analytics_exports_tenant_policy ON analytics.analytics_exports USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 42: Marketplace APIs and Developer Platform
CREATE SCHEMA IF NOT EXISTS partner_api;
CREATE TABLE IF NOT EXISTS partner_api.api_products (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_products_company_status ON partner_api.api_products(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_products_site ON partner_api.api_products(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.api_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_api_products_tenant_policy ON partner_api.api_products USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.api_product_versions (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_product_versions_company_status ON partner_api.api_product_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_product_versions_site ON partner_api.api_product_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.api_product_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_api_product_versions_tenant_policy ON partner_api.api_product_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.developer_organisations (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_organisations_company_status ON partner_api.developer_organisations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_organisations_site ON partner_api.developer_organisations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.developer_organisations ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_developer_organisations_tenant_policy ON partner_api.developer_organisations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.developer_users (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_users_company_status ON partner_api.developer_users(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_users_site ON partner_api.developer_users(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.developer_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_developer_users_tenant_policy ON partner_api.developer_users USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.partner_applications (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_partner_applications_company_status ON partner_api.partner_applications(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_partner_applications_site ON partner_api.partner_applications(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_partner_applications_tenant_policy ON partner_api.partner_applications USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.application_credentials (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_application_credentials_company_status ON partner_api.application_credentials(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_application_credentials_site ON partner_api.application_credentials(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.application_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_application_credentials_tenant_policy ON partner_api.application_credentials USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.api_subscriptions (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_subscriptions_company_status ON partner_api.api_subscriptions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_subscriptions_site ON partner_api.api_subscriptions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.api_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_api_subscriptions_tenant_policy ON partner_api.api_subscriptions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.scope_grants (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_scope_grants_company_status ON partner_api.scope_grants(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_scope_grants_site ON partner_api.scope_grants(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.scope_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_scope_grants_tenant_policy ON partner_api.scope_grants USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.sandbox_tenants (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_sandbox_tenants_company_status ON partner_api.sandbox_tenants(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_sandbox_tenants_site ON partner_api.sandbox_tenants(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.sandbox_tenants ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_sandbox_tenants_tenant_policy ON partner_api.sandbox_tenants USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.usage_meters (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_usage_meters_company_status ON partner_api.usage_meters(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_usage_meters_site ON partner_api.usage_meters(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.usage_meters ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_usage_meters_tenant_policy ON partner_api.usage_meters USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.usage_records (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_usage_records_company_status ON partner_api.usage_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_usage_records_site ON partner_api.usage_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_usage_records_tenant_policy ON partner_api.usage_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.api_invoices (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_invoices_company_status ON partner_api.api_invoices(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_api_invoices_site ON partner_api.api_invoices(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.api_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_api_invoices_tenant_policy ON partner_api.api_invoices USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.partner_webhooks (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_partner_webhooks_company_status ON partner_api.partner_webhooks(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_partner_webhooks_site ON partner_api.partner_webhooks(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.partner_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_partner_webhooks_tenant_policy ON partner_api.partner_webhooks USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.catalog_sync_jobs (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_catalog_sync_jobs_company_status ON partner_api.catalog_sync_jobs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_catalog_sync_jobs_site ON partner_api.catalog_sync_jobs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.catalog_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_catalog_sync_jobs_tenant_policy ON partner_api.catalog_sync_jobs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS partner_api.developer_support_cases (
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
  CHECK (status IN ('draft', 'review', 'active', 'suspended', 'revoked', 'retired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_support_cases_company_status ON partner_api.developer_support_cases(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_partner_api_developer_support_cases_site ON partner_api.developer_support_cases(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE partner_api.developer_support_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY partner_api_developer_support_cases_tenant_policy ON partner_api.developer_support_cases USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
