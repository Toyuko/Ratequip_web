-- RateQuip V12.2 Add-On 02 / Part 5
-- Delta migration; apply after 0023 and Part 4 migrations.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rq_intelligence;
CREATE SCHEMA IF NOT EXISTS rq_ecosystem;
CREATE SCHEMA IF NOT EXISTS rq_marketplace_ext;
CREATE TABLE IF NOT EXISTS rq_intelligence.supplier_response_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  supplier_response_id uuid NOT NULL, analysis_run_id uuid NOT NULL, overall_status text NOT NULL, confidence numeric(5,4)
);

CREATE TABLE IF NOT EXISTS rq_intelligence.supplier_compliance_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  response_analysis_id uuid NOT NULL, requirement_id uuid NOT NULL, response_status text NOT NULL, evidence_text text, evidence_verified boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_intelligence.supplier_deviation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  response_analysis_id uuid NOT NULL, requirement_id uuid, deviation_type text NOT NULL, description text NOT NULL, impact text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.supplier_exclusion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  response_analysis_id uuid NOT NULL, exclusion_text text NOT NULL, category text, commercial_impact text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_policy_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  policy_name text NOT NULL, version text NOT NULL, effective_at timestamptz NOT NULL, rules jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, recommendation_id uuid, feedback_type text NOT NULL, comment text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_confirmation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  subject_type text NOT NULL, subject_id uuid NOT NULL, confirmation_type text NOT NULL, confirmed_by uuid NOT NULL, confirmed_at timestamptz NOT NULL DEFAULT now(), confirmation_payload jsonb NOT NULL
);
COMMIT;
