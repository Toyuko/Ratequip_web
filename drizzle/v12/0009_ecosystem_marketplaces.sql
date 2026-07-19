-- V12 Part 2 migration 0009: ecosystem_marketplaces

BEGIN;

CREATE TABLE IF NOT EXISTS rq.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_job_postings_company_status ON rq.job_postings(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_job_postings_data_gin ON rq.job_postings USING gin(data);

DROP TRIGGER IF EXISTS trg_job_postings_updated_at ON rq.job_postings; CREATE TRIGGER trg_job_postings_updated_at BEFORE UPDATE ON rq.job_postings FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.job_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_job_requirements_company_status ON rq.job_requirements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_job_requirements_data_gin ON rq.job_requirements USING gin(data);

DROP TRIGGER IF EXISTS trg_job_requirements_updated_at ON rq.job_requirements; CREATE TRIGGER trg_job_requirements_updated_at BEFORE UPDATE ON rq.job_requirements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_candidate_profiles_company_status ON rq.candidate_profiles(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_candidate_profiles_data_gin ON rq.candidate_profiles USING gin(data);

DROP TRIGGER IF EXISTS trg_candidate_profiles_updated_at ON rq.candidate_profiles; CREATE TRIGGER trg_candidate_profiles_updated_at BEFORE UPDATE ON rq.candidate_profiles FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.candidate_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_candidate_credentials_company_status ON rq.candidate_credentials(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_candidate_credentials_data_gin ON rq.candidate_credentials USING gin(data);

DROP TRIGGER IF EXISTS trg_candidate_credentials_updated_at ON rq.candidate_credentials; CREATE TRIGGER trg_candidate_credentials_updated_at BEFORE UPDATE ON rq.candidate_credentials FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.candidate_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_candidate_consents_company_status ON rq.candidate_consents(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_candidate_consents_data_gin ON rq.candidate_consents USING gin(data);

DROP TRIGGER IF EXISTS trg_candidate_consents_updated_at ON rq.candidate_consents; CREATE TRIGGER trg_candidate_consents_updated_at BEFORE UPDATE ON rq.candidate_consents FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_job_applications_company_status ON rq.job_applications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_job_applications_data_gin ON rq.job_applications USING gin(data);

DROP TRIGGER IF EXISTS trg_job_applications_updated_at ON rq.job_applications; CREATE TRIGGER trg_job_applications_updated_at BEFORE UPDATE ON rq.job_applications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.application_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_application_stages_company_status ON rq.application_stages(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_application_stages_data_gin ON rq.application_stages USING gin(data);

DROP TRIGGER IF EXISTS trg_application_stages_updated_at ON rq.application_stages; CREATE TRIGGER trg_application_stages_updated_at BEFORE UPDATE ON rq.application_stages FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.interview_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_interview_schedules_company_status ON rq.interview_schedules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_interview_schedules_data_gin ON rq.interview_schedules USING gin(data);

DROP TRIGGER IF EXISTS trg_interview_schedules_updated_at ON rq.interview_schedules; CREATE TRIGGER trg_interview_schedules_updated_at BEFORE UPDATE ON rq.interview_schedules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.employment_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_employment_offers_company_status ON rq.employment_offers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_employment_offers_data_gin ON rq.employment_offers USING gin(data);

DROP TRIGGER IF EXISTS trg_employment_offers_updated_at ON rq.employment_offers; CREATE TRIGGER trg_employment_offers_updated_at BEFORE UPDATE ON rq.employment_offers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.workforce_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_workforce_providers_company_status ON rq.workforce_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_workforce_providers_data_gin ON rq.workforce_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_workforce_providers_updated_at ON rq.workforce_providers; CREATE TRIGGER trg_workforce_providers_updated_at BEFORE UPDATE ON rq.workforce_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_providers_company_status ON rq.finance_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_providers_data_gin ON rq.finance_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_providers_updated_at ON rq.finance_providers; CREATE TRIGGER trg_finance_providers_updated_at BEFORE UPDATE ON rq.finance_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_products_company_status ON rq.finance_products(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_products_data_gin ON rq.finance_products USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_products_updated_at ON rq.finance_products; CREATE TRIGGER trg_finance_products_updated_at BEFORE UPDATE ON rq.finance_products FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_eligibility_rules_company_status ON rq.finance_eligibility_rules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_eligibility_rules_data_gin ON rq.finance_eligibility_rules USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_eligibility_rules_updated_at ON rq.finance_eligibility_rules; CREATE TRIGGER trg_finance_eligibility_rules_updated_at BEFORE UPDATE ON rq.finance_eligibility_rules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_referrals_company_status ON rq.finance_referrals(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_referrals_data_gin ON rq.finance_referrals USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_referrals_updated_at ON rq.finance_referrals; CREATE TRIGGER trg_finance_referrals_updated_at BEFORE UPDATE ON rq.finance_referrals FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_applications_company_status ON rq.finance_applications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_applications_data_gin ON rq.finance_applications USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_applications_updated_at ON rq.finance_applications; CREATE TRIGGER trg_finance_applications_updated_at BEFORE UPDATE ON rq.finance_applications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_documents_company_status ON rq.finance_documents(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_documents_data_gin ON rq.finance_documents USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_documents_updated_at ON rq.finance_documents; CREATE TRIGGER trg_finance_documents_updated_at BEFORE UPDATE ON rq.finance_documents FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.indicative_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_indicative_terms_company_status ON rq.indicative_terms(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_indicative_terms_data_gin ON rq.indicative_terms USING gin(data);

DROP TRIGGER IF EXISTS trg_indicative_terms_updated_at ON rq.indicative_terms; CREATE TRIGGER trg_indicative_terms_updated_at BEFORE UPDATE ON rq.indicative_terms FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_decisions_company_status ON rq.finance_decisions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_decisions_data_gin ON rq.finance_decisions USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_decisions_updated_at ON rq.finance_decisions; CREATE TRIGGER trg_finance_decisions_updated_at BEFORE UPDATE ON rq.finance_decisions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.finance_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_finance_commissions_company_status ON rq.finance_commissions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_finance_commissions_data_gin ON rq.finance_commissions USING gin(data);

DROP TRIGGER IF EXISTS trg_finance_commissions_updated_at ON rq.finance_commissions; CREATE TRIGGER trg_finance_commissions_updated_at BEFORE UPDATE ON rq.finance_commissions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_providers_company_status ON rq.insurance_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_providers_data_gin ON rq.insurance_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_providers_updated_at ON rq.insurance_providers; CREATE TRIGGER trg_insurance_providers_updated_at BEFORE UPDATE ON rq.insurance_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_products_company_status ON rq.insurance_products(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_products_data_gin ON rq.insurance_products USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_products_updated_at ON rq.insurance_products; CREATE TRIGGER trg_insurance_products_updated_at BEFORE UPDATE ON rq.insurance_products FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.risk_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_risk_profiles_company_status ON rq.risk_profiles(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_risk_profiles_data_gin ON rq.risk_profiles USING gin(data);

DROP TRIGGER IF EXISTS trg_risk_profiles_updated_at ON rq.risk_profiles; CREATE TRIGGER trg_risk_profiles_updated_at BEFORE UPDATE ON rq.risk_profiles FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_referrals_company_status ON rq.insurance_referrals(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_referrals_data_gin ON rq.insurance_referrals USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_referrals_updated_at ON rq.insurance_referrals; CREATE TRIGGER trg_insurance_referrals_updated_at BEFORE UPDATE ON rq.insurance_referrals FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_submissions_company_status ON rq.insurance_submissions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_submissions_data_gin ON rq.insurance_submissions USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_submissions_updated_at ON rq.insurance_submissions; CREATE TRIGGER trg_insurance_submissions_updated_at BEFORE UPDATE ON rq.insurance_submissions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_quotes_company_status ON rq.insurance_quotes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_quotes_data_gin ON rq.insurance_quotes USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_quotes_updated_at ON rq.insurance_quotes; CREATE TRIGGER trg_insurance_quotes_updated_at BEFORE UPDATE ON rq.insurance_quotes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.policy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_policy_records_company_status ON rq.policy_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_policy_records_data_gin ON rq.policy_records USING gin(data);

DROP TRIGGER IF EXISTS trg_policy_records_updated_at ON rq.policy_records; CREATE TRIGGER trg_policy_records_updated_at BEFORE UPDATE ON rq.policy_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.coverage_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_coverage_evidence_company_status ON rq.coverage_evidence(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_coverage_evidence_data_gin ON rq.coverage_evidence USING gin(data);

DROP TRIGGER IF EXISTS trg_coverage_evidence_updated_at ON rq.coverage_evidence; CREATE TRIGGER trg_coverage_evidence_updated_at BEFORE UPDATE ON rq.coverage_evidence FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.claims_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_claims_referrals_company_status ON rq.claims_referrals(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_claims_referrals_data_gin ON rq.claims_referrals USING gin(data);

DROP TRIGGER IF EXISTS trg_claims_referrals_updated_at ON rq.claims_referrals; CREATE TRIGGER trg_claims_referrals_updated_at BEFORE UPDATE ON rq.claims_referrals FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.insurance_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_insurance_commissions_company_status ON rq.insurance_commissions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_insurance_commissions_data_gin ON rq.insurance_commissions USING gin(data);

DROP TRIGGER IF EXISTS trg_insurance_commissions_updated_at ON rq.insurance_commissions; CREATE TRIGGER trg_insurance_commissions_updated_at BEFORE UPDATE ON rq.insurance_commissions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.freight_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_freight_requests_company_status ON rq.freight_requests(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_freight_requests_data_gin ON rq.freight_requests USING gin(data);

DROP TRIGGER IF EXISTS trg_freight_requests_updated_at ON rq.freight_requests; CREATE TRIGGER trg_freight_requests_updated_at BEFORE UPDATE ON rq.freight_requests FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.freight_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_freight_items_company_status ON rq.freight_items(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_freight_items_data_gin ON rq.freight_items USING gin(data);

DROP TRIGGER IF EXISTS trg_freight_items_updated_at ON rq.freight_items; CREATE TRIGGER trg_freight_items_updated_at BEFORE UPDATE ON rq.freight_items FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.freight_lanes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_freight_lanes_company_status ON rq.freight_lanes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_freight_lanes_data_gin ON rq.freight_lanes USING gin(data);

DROP TRIGGER IF EXISTS trg_freight_lanes_updated_at ON rq.freight_lanes; CREATE TRIGGER trg_freight_lanes_updated_at BEFORE UPDATE ON rq.freight_lanes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.carriers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_carriers_company_status ON rq.carriers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_carriers_data_gin ON rq.carriers USING gin(data);

DROP TRIGGER IF EXISTS trg_carriers_updated_at ON rq.carriers; CREATE TRIGGER trg_carriers_updated_at BEFORE UPDATE ON rq.carriers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.carrier_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_carrier_capabilities_company_status ON rq.carrier_capabilities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_carrier_capabilities_data_gin ON rq.carrier_capabilities USING gin(data);

DROP TRIGGER IF EXISTS trg_carrier_capabilities_updated_at ON rq.carrier_capabilities; CREATE TRIGGER trg_carrier_capabilities_updated_at BEFORE UPDATE ON rq.carrier_capabilities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.freight_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_freight_quotes_company_status ON rq.freight_quotes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_freight_quotes_data_gin ON rq.freight_quotes USING gin(data);

DROP TRIGGER IF EXISTS trg_freight_quotes_updated_at ON rq.freight_quotes; CREATE TRIGGER trg_freight_quotes_updated_at BEFORE UPDATE ON rq.freight_quotes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_shipments_company_status ON rq.shipments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_shipments_data_gin ON rq.shipments USING gin(data);

DROP TRIGGER IF EXISTS trg_shipments_updated_at ON rq.shipments; CREATE TRIGGER trg_shipments_updated_at BEFORE UPDATE ON rq.shipments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.shipment_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_shipment_milestones_company_status ON rq.shipment_milestones(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_shipment_milestones_data_gin ON rq.shipment_milestones USING gin(data);

DROP TRIGGER IF EXISTS trg_shipment_milestones_updated_at ON rq.shipment_milestones; CREATE TRIGGER trg_shipment_milestones_updated_at BEFORE UPDATE ON rq.shipment_milestones FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_tracking_events_company_status ON rq.tracking_events(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_tracking_events_data_gin ON rq.tracking_events USING gin(data);

DROP TRIGGER IF EXISTS trg_tracking_events_updated_at ON rq.tracking_events; CREATE TRIGGER trg_tracking_events_updated_at BEFORE UPDATE ON rq.tracking_events FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.proofs_of_delivery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_proofs_of_delivery_company_status ON rq.proofs_of_delivery(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_proofs_of_delivery_data_gin ON rq.proofs_of_delivery USING gin(data);

DROP TRIGGER IF EXISTS trg_proofs_of_delivery_updated_at ON rq.proofs_of_delivery; CREATE TRIGGER trg_proofs_of_delivery_updated_at BEFORE UPDATE ON rq.proofs_of_delivery FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.freight_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_freight_exceptions_company_status ON rq.freight_exceptions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_freight_exceptions_data_gin ON rq.freight_exceptions USING gin(data);

DROP TRIGGER IF EXISTS trg_freight_exceptions_updated_at ON rq.freight_exceptions; CREATE TRIGGER trg_freight_exceptions_updated_at BEFORE UPDATE ON rq.freight_exceptions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warehouse_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_providers_company_status ON rq.warehouse_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warehouse_providers_data_gin ON rq.warehouse_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_warehouse_providers_updated_at ON rq.warehouse_providers; CREATE TRIGGER trg_warehouse_providers_updated_at BEFORE UPDATE ON rq.warehouse_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warehouse_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_facilities_company_status ON rq.warehouse_facilities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warehouse_facilities_data_gin ON rq.warehouse_facilities USING gin(data);

DROP TRIGGER IF EXISTS trg_warehouse_facilities_updated_at ON rq.warehouse_facilities; CREATE TRIGGER trg_warehouse_facilities_updated_at BEFORE UPDATE ON rq.warehouse_facilities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.storage_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_storage_zones_company_status ON rq.storage_zones(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_storage_zones_data_gin ON rq.storage_zones USING gin(data);

DROP TRIGGER IF EXISTS trg_storage_zones_updated_at ON rq.storage_zones; CREATE TRIGGER trg_storage_zones_updated_at BEFORE UPDATE ON rq.storage_zones FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.capacity_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_capacity_positions_company_status ON rq.capacity_positions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_capacity_positions_data_gin ON rq.capacity_positions USING gin(data);

DROP TRIGGER IF EXISTS trg_capacity_positions_updated_at ON rq.capacity_positions; CREATE TRIGGER trg_capacity_positions_updated_at BEFORE UPDATE ON rq.capacity_positions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.storage_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_storage_requirements_company_status ON rq.storage_requirements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_storage_requirements_data_gin ON rq.storage_requirements USING gin(data);

DROP TRIGGER IF EXISTS trg_storage_requirements_updated_at ON rq.storage_requirements; CREATE TRIGGER trg_storage_requirements_updated_at BEFORE UPDATE ON rq.storage_requirements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warehouse_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_quotes_company_status ON rq.warehouse_quotes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warehouse_quotes_data_gin ON rq.warehouse_quotes USING gin(data);

DROP TRIGGER IF EXISTS trg_warehouse_quotes_updated_at ON rq.warehouse_quotes; CREATE TRIGGER trg_warehouse_quotes_updated_at BEFORE UPDATE ON rq.warehouse_quotes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.storage_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_storage_agreements_company_status ON rq.storage_agreements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_storage_agreements_data_gin ON rq.storage_agreements USING gin(data);

DROP TRIGGER IF EXISTS trg_storage_agreements_updated_at ON rq.storage_agreements; CREATE TRIGGER trg_storage_agreements_updated_at BEFORE UPDATE ON rq.storage_agreements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.inventory_custody (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_inventory_custody_company_status ON rq.inventory_custody(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_inventory_custody_data_gin ON rq.inventory_custody USING gin(data);

DROP TRIGGER IF EXISTS trg_inventory_custody_updated_at ON rq.inventory_custody; CREATE TRIGGER trg_inventory_custody_updated_at BEFORE UPDATE ON rq.inventory_custody FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warehouse_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_movements_company_status ON rq.warehouse_movements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warehouse_movements_data_gin ON rq.warehouse_movements USING gin(data);

DROP TRIGGER IF EXISTS trg_warehouse_movements_updated_at ON rq.warehouse_movements; CREATE TRIGGER trg_warehouse_movements_updated_at BEFORE UPDATE ON rq.warehouse_movements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.fulfilment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_fulfilment_orders_company_status ON rq.fulfilment_orders(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_fulfilment_orders_data_gin ON rq.fulfilment_orders USING gin(data);

DROP TRIGGER IF EXISTS trg_fulfilment_orders_updated_at ON rq.fulfilment_orders; CREATE TRIGGER trg_fulfilment_orders_updated_at BEFORE UPDATE ON rq.fulfilment_orders FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warehouse_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE RESTRICT,
  site_id uuid NULL REFERENCES rq.sites(id) ON DELETE RESTRICT,
  record_key text NOT NULL,
  display_name text,
  status text NOT NULL DEFAULT 'draft',
  version_no integer NOT NULL DEFAULT 1 CHECK (version_no > 0),
  taxonomy_refs uuid[] NOT NULL DEFAULT '{}',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES rq.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE(company_id, record_key)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_evidence_company_status ON rq.warehouse_evidence(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warehouse_evidence_data_gin ON rq.warehouse_evidence USING gin(data);

DROP TRIGGER IF EXISTS trg_warehouse_evidence_updated_at ON rq.warehouse_evidence; CREATE TRIGGER trg_warehouse_evidence_updated_at BEFORE UPDATE ON rq.warehouse_evidence FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

COMMIT;
