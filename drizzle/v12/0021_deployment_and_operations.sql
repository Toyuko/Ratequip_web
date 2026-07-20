BEGIN;

-- Domain 59: Deployment and Release Engineering
CREATE SCHEMA IF NOT EXISTS deployment;
CREATE TABLE IF NOT EXISTS deployment.release_trains (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_trains_company_status ON deployment.release_trains(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_trains_site ON deployment.release_trains(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_trains ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_trains_tenant_policy ON deployment.release_trains USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.release_candidates (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_candidates_company_status ON deployment.release_candidates(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_candidates_site ON deployment.release_candidates(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_candidates_tenant_policy ON deployment.release_candidates USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.release_artifacts (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_artifacts_company_status ON deployment.release_artifacts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_artifacts_site ON deployment.release_artifacts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_artifacts_tenant_policy ON deployment.release_artifacts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.environment_promotions (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_environment_promotions_company_status ON deployment.environment_promotions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_environment_promotions_site ON deployment.environment_promotions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.environment_promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_environment_promotions_tenant_policy ON deployment.environment_promotions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.deployment_plans (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_plans_company_status ON deployment.deployment_plans(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_plans_site ON deployment.deployment_plans(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.deployment_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_deployment_plans_tenant_policy ON deployment.deployment_plans USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.deployment_runs (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_runs_company_status ON deployment.deployment_runs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_runs_site ON deployment.deployment_runs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.deployment_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_deployment_runs_tenant_policy ON deployment.deployment_runs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.deployment_steps (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_steps_company_status ON deployment.deployment_steps(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_deployment_steps_site ON deployment.deployment_steps(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.deployment_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_deployment_steps_tenant_policy ON deployment.deployment_steps USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.feature_flags (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_feature_flags_company_status ON deployment.feature_flags(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_feature_flags_site ON deployment.feature_flags(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_feature_flags_tenant_policy ON deployment.feature_flags USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.flag_overrides (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_flag_overrides_company_status ON deployment.flag_overrides(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_flag_overrides_site ON deployment.flag_overrides(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.flag_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_flag_overrides_tenant_policy ON deployment.flag_overrides USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.database_change_sets (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_database_change_sets_company_status ON deployment.database_change_sets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_database_change_sets_site ON deployment.database_change_sets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.database_change_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_database_change_sets_tenant_policy ON deployment.database_change_sets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.data_backfills (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_data_backfills_company_status ON deployment.data_backfills(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_data_backfills_site ON deployment.data_backfills(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.data_backfills ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_data_backfills_tenant_policy ON deployment.data_backfills USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.rollback_plans (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_rollback_plans_company_status ON deployment.rollback_plans(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_rollback_plans_site ON deployment.rollback_plans(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.rollback_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_rollback_plans_tenant_policy ON deployment.rollback_plans USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.release_approvals (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_approvals_company_status ON deployment.release_approvals(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_approvals_site ON deployment.release_approvals(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_approvals_tenant_policy ON deployment.release_approvals USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.release_evidence (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_evidence_company_status ON deployment.release_evidence(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_evidence_site ON deployment.release_evidence(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_evidence_tenant_policy ON deployment.release_evidence USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS deployment.release_incidents (
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
  CHECK (status IN ('draft', 'validating', 'approved', 'deploying', 'canary', 'active', 'rolled_back', 'failed', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_deployment_release_incidents_company_status ON deployment.release_incidents(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_deployment_release_incidents_site ON deployment.release_incidents(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE deployment.release_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY deployment_release_incidents_tenant_policy ON deployment.release_incidents USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 60: Operations, SRE and Support
CREATE SCHEMA IF NOT EXISTS operations;
CREATE TABLE IF NOT EXISTS operations.service_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_service_catalog_company_status ON operations.service_catalog(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_service_catalog_site ON operations.service_catalog(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.service_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_service_catalog_tenant_policy ON operations.service_catalog USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.service_level_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_service_level_objectives_company_status ON operations.service_level_objectives(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_service_level_objectives_site ON operations.service_level_objectives(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.service_level_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_service_level_objectives_tenant_policy ON operations.service_level_objectives USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.service_level_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_service_level_indicators_company_status ON operations.service_level_indicators(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_service_level_indicators_site ON operations.service_level_indicators(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.service_level_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_service_level_indicators_tenant_policy ON operations.service_level_indicators USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.error_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_error_budgets_company_status ON operations.error_budgets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_error_budgets_site ON operations.error_budgets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.error_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_error_budgets_tenant_policy ON operations.error_budgets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.operational_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_operational_alerts_company_status ON operations.operational_alerts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_operational_alerts_site ON operations.operational_alerts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.operational_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_operational_alerts_tenant_policy ON operations.operational_alerts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_incidents_company_status ON operations.incidents(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_incidents_site ON operations.incidents(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_incidents_tenant_policy ON operations.incidents USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.incident_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_incident_actions_company_status ON operations.incident_actions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_incident_actions_site ON operations.incident_actions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.incident_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_incident_actions_tenant_policy ON operations.incident_actions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.problem_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_problem_records_company_status ON operations.problem_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_problem_records_site ON operations.problem_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.problem_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_problem_records_tenant_policy ON operations.problem_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.change_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_change_records_company_status ON operations.change_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_change_records_site ON operations.change_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.change_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_change_records_tenant_policy ON operations.change_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.runbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_runbooks_company_status ON operations.runbooks(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_runbooks_site ON operations.runbooks(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.runbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_runbooks_tenant_policy ON operations.runbooks USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.on_call_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_on_call_schedules_company_status ON operations.on_call_schedules(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_on_call_schedules_site ON operations.on_call_schedules(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.on_call_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_on_call_schedules_tenant_policy ON operations.on_call_schedules USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.support_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_support_cases_company_status ON operations.support_cases(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_support_cases_site ON operations.support_cases(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.support_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_support_cases_tenant_policy ON operations.support_cases USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.support_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_support_actions_company_status ON operations.support_actions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_support_actions_site ON operations.support_actions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.support_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_support_actions_tenant_policy ON operations.support_actions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.queue_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_queue_health_company_status ON operations.queue_health(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_queue_health_site ON operations.queue_health(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.queue_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_queue_health_tenant_policy ON operations.queue_health USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.capacity_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_capacity_forecasts_company_status ON operations.capacity_forecasts(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_capacity_forecasts_site ON operations.capacity_forecasts(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.capacity_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_capacity_forecasts_tenant_policy ON operations.capacity_forecasts USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.disaster_recovery_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_disaster_recovery_exercises_company_status ON operations.disaster_recovery_exercises(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_disaster_recovery_exercises_site ON operations.disaster_recovery_exercises(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.disaster_recovery_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_disaster_recovery_exercises_tenant_policy ON operations.disaster_recovery_exercises USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS operations.business_continuity_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'normal',
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
  CHECK (status IN ('normal', 'warning', 'incident', 'mitigating', 'recovering', 'resolved', 'postmortem', 'closed')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_operations_business_continuity_plans_company_status ON operations.business_continuity_plans(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_operations_business_continuity_plans_site ON operations.business_continuity_plans(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE operations.business_continuity_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY operations_business_continuity_plans_tenant_policy ON operations.business_continuity_plans USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
