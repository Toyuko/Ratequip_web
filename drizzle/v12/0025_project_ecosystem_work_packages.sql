-- RateQuip V12.2 Add-On 02 / Part 5
-- Delta migration; apply after 0023 and Part 4 migrations.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rq_intelligence;
CREATE SCHEMA IF NOT EXISTS rq_ecosystem;
CREATE SCHEMA IF NOT EXISTS rq_marketplace_ext;
CREATE TABLE IF NOT EXISTS rq_ecosystem.project_ecosystem_node (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  graph_version_id uuid NOT NULL, node_type text NOT NULL, canonical_taxonomy_id uuid, label text NOT NULL, attributes jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_ecosystem_edge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  graph_version_id uuid NOT NULL, from_node_id uuid NOT NULL, to_node_id uuid NOT NULL, relationship_type text NOT NULL, evidence_clause_id uuid, confidence numeric(5,4)
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_process_step (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  graph_version_id uuid NOT NULL, sequence_no integer NOT NULL, name text NOT NULL, inputs jsonb, outputs jsonb, operating_conditions jsonb
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_work_package (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  lot_number text, title text NOT NULL, scope text NOT NULL, battery_limits text, budget_min numeric(18,2), budget_max numeric(18,2), currency char(3), invitation_status text NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_work_package_requirement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  work_package_id uuid NOT NULL, requirement_id uuid NOT NULL, inclusion_status text NOT NULL
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_work_package_supplier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  work_package_id uuid NOT NULL, supplier_company_id uuid NOT NULL, supplier_role text NOT NULL, match_score numeric(8,4), approval_status text NOT NULL DEFAULT 'proposed', disclosure_grant_id uuid
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_interface (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  interface_category text NOT NULL, title text NOT NULL, upstream_party_id uuid, downstream_party_id uuid, owner_party_id uuid, specification_status text NOT NULL, confirmation_status text NOT NULL, due_at timestamptz, risk_level text
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_interface_party (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  interface_id uuid NOT NULL, party_id uuid NOT NULL, role text NOT NULL, responsibility text
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_option (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  option_type text NOT NULL, title text NOT NULL, supplier_strategy text NOT NULL, approval_status text NOT NULL DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_option_component (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  option_id uuid NOT NULL, work_package_id uuid, supplier_id uuid, component_type text NOT NULL, provenance text NOT NULL, amount numeric(18,2), currency char(3), lead_time_days integer
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_cost_estimate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  option_id uuid, category text NOT NULL, provenance text NOT NULL, amount_low numeric(18,2), amount_high numeric(18,2), currency char(3), basis text
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_schedule_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  option_id uuid, work_package_id uuid, activity_code text NOT NULL, title text NOT NULL, duration_days integer, predecessors jsonb, critical boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_supplier_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  supplier_id uuid NOT NULL, role_type text NOT NULL, work_package_id uuid, lead_integrator boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_ecosystem.project_completeness_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, dimension text NOT NULL, score numeric(5,2) NOT NULL, explanation text NOT NULL, blockers jsonb
);
COMMIT;
