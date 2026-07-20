-- RateQuip V12.1 Add-On 01 / Part 4
-- App migration number 0034 (canonical Part 4 was 0024-0028; renumbered because 0024-0029 already hold Part 5 on Neon).
-- Forward-only additive migration. Execute after V12 Part 3 migration 0023.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS pilot_ops;
CREATE TABLE IF NOT EXISTS pilot_ops.rollout_cohort (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  cohort_key text NOT NULL,
  description text,
  starts_at timestamptz,
  expires_at timestamptz,
  kill_switch boolean NOT NULL DEFAULT false,
  UNIQUE(tenant_id,cohort_key)
);
ALTER TABLE pilot_ops.rollout_cohort ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rollout_cohort_tenant_isolation ON pilot_ops.rollout_cohort;
CREATE POLICY rollout_cohort_tenant_isolation ON pilot_ops.rollout_cohort
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_rollout_cohort_tenant_status ON pilot_ops.rollout_cohort(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.feature_flag_assignment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  cohort_id uuid NOT NULL REFERENCES pilot_ops.rollout_cohort(id),
  flag_key text NOT NULL,
  percentage numeric(5,2) NOT NULL DEFAULT 100,
  approved_by uuid,
  approved_at timestamptz,
  UNIQUE(cohort_id,flag_key)
);
ALTER TABLE pilot_ops.feature_flag_assignment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feature_flag_assignment_tenant_isolation ON pilot_ops.feature_flag_assignment;
CREATE POLICY feature_flag_assignment_tenant_isolation ON pilot_ops.feature_flag_assignment
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_feature_flag_assignment_tenant_status ON pilot_ops.feature_flag_assignment(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.pilot_decision (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  cohort_id uuid NOT NULL REFERENCES pilot_ops.rollout_cohort(id),
  decision text NOT NULL,
  evidence jsonb NOT NULL,
  decided_by uuid NOT NULL,
  decided_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE pilot_ops.pilot_decision ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pilot_decision_tenant_isolation ON pilot_ops.pilot_decision;
CREATE POLICY pilot_decision_tenant_isolation ON pilot_ops.pilot_decision
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_pilot_decision_tenant_status ON pilot_ops.pilot_decision(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.taxonomy_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  source_value text NOT NULL,
  context jsonb NOT NULL,
  proposal_type text NOT NULL,
  proposed_mapping jsonb NOT NULL,
  impact_preview jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE pilot_ops.taxonomy_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS taxonomy_feedback_tenant_isolation ON pilot_ops.taxonomy_feedback;
CREATE POLICY taxonomy_feedback_tenant_isolation ON pilot_ops.taxonomy_feedback
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_taxonomy_feedback_tenant_status ON pilot_ops.taxonomy_feedback(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.question_pack_simulation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  pack_key text NOT NULL,
  pack_version text NOT NULL,
  synthetic_answers jsonb NOT NULL,
  dependency_trace jsonb NOT NULL,
  comparison jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE pilot_ops.question_pack_simulation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS question_pack_simulation_tenant_isolation ON pilot_ops.question_pack_simulation;
CREATE POLICY question_pack_simulation_tenant_isolation ON pilot_ops.question_pack_simulation
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_question_pack_simulation_tenant_status ON pilot_ops.question_pack_simulation(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.synthetic_workspace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  workspace_key text NOT NULL,
  dataset_version text NOT NULL,
  external_messages_blocked boolean NOT NULL DEFAULT true,
  payments_blocked boolean NOT NULL DEFAULT true,
  webhooks_blocked boolean NOT NULL DEFAULT true
);
ALTER TABLE pilot_ops.synthetic_workspace ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS synthetic_workspace_tenant_isolation ON pilot_ops.synthetic_workspace;
CREATE POLICY synthetic_workspace_tenant_isolation ON pilot_ops.synthetic_workspace
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_synthetic_workspace_tenant_status ON pilot_ops.synthetic_workspace(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  feedback_type text NOT NULL,
  impact text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  decision text
);
ALTER TABLE pilot_ops.product_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_feedback_tenant_isolation ON pilot_ops.product_feedback;
CREATE POLICY product_feedback_tenant_isolation ON pilot_ops.product_feedback
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_product_feedback_tenant_status ON pilot_ops.product_feedback(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.roadmap_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  feedback_id uuid REFERENCES pilot_ops.product_feedback(id),
  epic_key text,
  priority integer,
  acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  dependencies jsonb NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE pilot_ops.roadmap_item ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roadmap_item_tenant_isolation ON pilot_ops.roadmap_item;
CREATE POLICY roadmap_item_tenant_isolation ON pilot_ops.roadmap_item
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_roadmap_item_tenant_status ON pilot_ops.roadmap_item(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.pilot_kpi_definition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  kpi_key text NOT NULL,
  definition_version text NOT NULL,
  formula text NOT NULL,
  threshold_json jsonb NOT NULL,
  UNIQUE(tenant_id,kpi_key,definition_version)
);
ALTER TABLE pilot_ops.pilot_kpi_definition ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pilot_kpi_definition_tenant_isolation ON pilot_ops.pilot_kpi_definition;
CREATE POLICY pilot_kpi_definition_tenant_isolation ON pilot_ops.pilot_kpi_definition
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_pilot_kpi_definition_tenant_status ON pilot_ops.pilot_kpi_definition(tenant_id,status);
CREATE TABLE IF NOT EXISTS pilot_ops.pilot_kpi_observation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  kpi_definition_id uuid NOT NULL REFERENCES pilot_ops.pilot_kpi_definition(id),
  cohort_id uuid REFERENCES pilot_ops.rollout_cohort(id),
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  value numeric(20,6),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE pilot_ops.pilot_kpi_observation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pilot_kpi_observation_tenant_isolation ON pilot_ops.pilot_kpi_observation;
CREATE POLICY pilot_kpi_observation_tenant_isolation ON pilot_ops.pilot_kpi_observation
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_pilot_kpi_observation_tenant_status ON pilot_ops.pilot_kpi_observation(tenant_id,status);

COMMIT;
