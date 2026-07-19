-- RateQuip V12.2 Add-On 02 / Part 5
-- Delta migration; apply after 0023 and Part 4 migrations.
BEGIN;
CREATE SCHEMA IF NOT EXISTS rq_intelligence;
CREATE SCHEMA IF NOT EXISTS rq_ecosystem;
CREATE SCHEMA IF NOT EXISTS rq_marketplace_ext;
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_facility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_process (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_material (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_packaging (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_cleaning_agent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.operating_profile_service_provider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.professional_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.professional_skill (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.professional_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.job_opportunity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.project_opportunity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.laboratory_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.laboratory_test_method (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.test_request (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.sample (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.chain_of_custody_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.freight_request_ext (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.capacity_listing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.capacity_booking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.innovation_project (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.project_team_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.sourcing_preference (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.country_restriction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.commercial_referral (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS rq_marketplace_ext.marketplace_fee_rule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL, project_id uuid, created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), revision bigint NOT NULL DEFAULT 1, status text NOT NULL DEFAULT 'draft', policy_version text NOT NULL, content_hash text, deleted_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
COMMIT;
