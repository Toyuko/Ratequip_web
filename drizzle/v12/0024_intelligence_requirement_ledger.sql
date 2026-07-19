-- RateQuip V12.2 Add-On 02 / Part 5
-- Delta migration; apply after 0023 and Part 4 migrations.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rq_intelligence;
CREATE SCHEMA IF NOT EXISTS rq_ecosystem;
CREATE SCHEMA IF NOT EXISTS rq_marketplace_ext;
CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_analysis_run (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  source_document_id uuid, run_type text NOT NULL, model_version text, prompt_version text, retrieval_version text, confidence numeric(5,4), started_at timestamptz, completed_at timestamptz, failure_code text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_document (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  vault_document_id uuid NOT NULL, confidentiality text NOT NULL, malware_scan_status text NOT NULL, ai_routing_policy text NOT NULL
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_document_version (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  intelligence_document_id uuid NOT NULL, vault_version_id uuid NOT NULL, version_number integer NOT NULL, original_filename text, mime_type text, page_count integer
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_document_clause (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  document_version_id uuid NOT NULL, page_number integer, section_path text, clause_reference text, original_text text NOT NULL, normalised_text text, bounding_box jsonb
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_extracted_requirement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, clause_id uuid NOT NULL, classification text NOT NULL, mandatory_status text NOT NULL, original_units text, normalised_units text, confidence numeric(5,4), reviewer_status text NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_requirement_value (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  requirement_id uuid NOT NULL, value_type text NOT NULL, original_value text, normalised_value jsonb, unit_code text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_requirement_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  requirement_id uuid NOT NULL, clause_id uuid NOT NULL, evidence_type text NOT NULL, excerpt_hash text NOT NULL
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_requirement_review (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  requirement_id uuid NOT NULL, decision text NOT NULL, reviewer_id uuid NOT NULL, review_note text, reviewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_inference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, classification text NOT NULL, title text NOT NULL, reasoning_summary text NOT NULL, confidence numeric(5,4), dependencies jsonb, risk_if_omitted text, buyer_confirmation_status text NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_gap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, gap_type text NOT NULL, severity text NOT NULL, title text NOT NULL, blocks_matching boolean NOT NULL DEFAULT false, blocks_publication boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_question (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, question_group text NOT NULL, question_text text NOT NULL, rationale text NOT NULL, assigned_role text, answer_mode text, blocks_matching boolean NOT NULL DEFAULT false, blocks_publication boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_assumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, statement text NOT NULL, source_type text NOT NULL, confidence numeric(5,4), confirmation_status text NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_constraint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, constraint_type text NOT NULL, statement text NOT NULL, source_clause_id uuid
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_contradiction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, left_clause_id uuid, right_clause_id uuid, description text NOT NULL, severity text NOT NULL, resolution_status text NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_risk (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, category text NOT NULL, title text NOT NULL, likelihood integer, consequence integer, mitigation text
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_recommendation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  analysis_run_id uuid NOT NULL, category text NOT NULL, classification text NOT NULL, title text NOT NULL, description text NOT NULL, confidence numeric(5,4), buyer_confirmation_status text NOT NULL DEFAULT 'pending', sponsored boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS rq_intelligence.intelligence_recommendation_reason (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  recommendation_id uuid NOT NULL, evidence_clause_id uuid, factor text NOT NULL, factor_weight numeric(8,4), explanation text NOT NULL
);
COMMIT;
