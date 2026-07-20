BEGIN;

-- Domain 39: Compliance and Assurance
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE TABLE IF NOT EXISTS compliance.obligation_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_obligation_catalog_company_status ON compliance.obligation_catalog(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_obligation_catalog_site ON compliance.obligation_catalog(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.obligation_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_obligation_catalog_tenant_policy ON compliance.obligation_catalog USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.compliance_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_compliance_profiles_company_status ON compliance.compliance_profiles(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_compliance_profiles_site ON compliance.compliance_profiles(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.compliance_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_compliance_profiles_tenant_policy ON compliance.compliance_profiles USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.control_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_control_frameworks_company_status ON compliance.control_frameworks(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_control_frameworks_site ON compliance.control_frameworks(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.control_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_control_frameworks_tenant_policy ON compliance.control_frameworks USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_controls_company_status ON compliance.controls(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_controls_site ON compliance.controls(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_controls_tenant_policy ON compliance.controls USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.control_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_control_assignments_company_status ON compliance.control_assignments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_control_assignments_site ON compliance.control_assignments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.control_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_control_assignments_tenant_policy ON compliance.control_assignments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.control_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_control_evidence_company_status ON compliance.control_evidence(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_control_evidence_site ON compliance.control_evidence(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.control_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_control_evidence_tenant_policy ON compliance.control_evidence USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.licences_and_permits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_licences_and_permits_company_status ON compliance.licences_and_permits(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_licences_and_permits_site ON compliance.licences_and_permits(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.licences_and_permits ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_licences_and_permits_tenant_policy ON compliance.licences_and_permits USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_inspections_company_status ON compliance.inspections(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_inspections_site ON compliance.inspections(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_inspections_tenant_policy ON compliance.inspections USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_audits_company_status ON compliance.audits(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_audits_site ON compliance.audits(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_audits_tenant_policy ON compliance.audits USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_audit_findings_company_status ON compliance.audit_findings(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_audit_findings_site ON compliance.audit_findings(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.audit_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_audit_findings_tenant_policy ON compliance.audit_findings USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_corrective_actions_company_status ON compliance.corrective_actions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_corrective_actions_site ON compliance.corrective_actions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.corrective_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_corrective_actions_tenant_policy ON compliance.corrective_actions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.site_inductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_site_inductions_company_status ON compliance.site_inductions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_site_inductions_site ON compliance.site_inductions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.site_inductions ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_site_inductions_tenant_policy ON compliance.site_inductions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.permit_to_work (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_permit_to_work_company_status ON compliance.permit_to_work(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_permit_to_work_site ON compliance.permit_to_work(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.permit_to_work ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_permit_to_work_tenant_policy ON compliance.permit_to_work USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS compliance.compliance_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  site_id uuid NULL,
  record_key text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'not_assessed',
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
  CHECK (status IN ('not_assessed', 'required', 'in_progress', 'compliant', 'non_compliant', 'expired', 'waived', 'under_review')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_compliance_compliance_exceptions_company_status ON compliance.compliance_exceptions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_compliance_compliance_exceptions_site ON compliance.compliance_exceptions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE compliance.compliance_exceptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY compliance_compliance_exceptions_tenant_policy ON compliance.compliance_exceptions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 40: ESG and Sustainability
CREATE SCHEMA IF NOT EXISTS esg;
CREATE TABLE IF NOT EXISTS esg.esg_frameworks (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_esg_frameworks_company_status ON esg.esg_frameworks(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_esg_frameworks_site ON esg.esg_frameworks(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.esg_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_esg_frameworks_tenant_policy ON esg.esg_frameworks USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.reporting_boundaries (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_reporting_boundaries_company_status ON esg.reporting_boundaries(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_reporting_boundaries_site ON esg.reporting_boundaries(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.reporting_boundaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_reporting_boundaries_tenant_policy ON esg.reporting_boundaries USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.materiality_assessments (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_materiality_assessments_company_status ON esg.materiality_assessments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_materiality_assessments_site ON esg.materiality_assessments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.materiality_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_materiality_assessments_tenant_policy ON esg.materiality_assessments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.emission_sources (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_emission_sources_company_status ON esg.emission_sources(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_emission_sources_site ON esg.emission_sources(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.emission_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_emission_sources_tenant_policy ON esg.emission_sources USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.activity_data (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_activity_data_company_status ON esg.activity_data(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_activity_data_site ON esg.activity_data(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.activity_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_activity_data_tenant_policy ON esg.activity_data USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.emission_factors (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_emission_factors_company_status ON esg.emission_factors(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_emission_factors_site ON esg.emission_factors(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.emission_factors ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_emission_factors_tenant_policy ON esg.emission_factors USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.ghg_inventories (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_ghg_inventories_company_status ON esg.ghg_inventories(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_ghg_inventories_site ON esg.ghg_inventories(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.ghg_inventories ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_ghg_inventories_tenant_policy ON esg.ghg_inventories USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.energy_records (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_energy_records_company_status ON esg.energy_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_energy_records_site ON esg.energy_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.energy_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_energy_records_tenant_policy ON esg.energy_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.water_records (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_water_records_company_status ON esg.water_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_water_records_site ON esg.water_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.water_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_water_records_tenant_policy ON esg.water_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.waste_records (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_waste_records_company_status ON esg.waste_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_waste_records_site ON esg.waste_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.waste_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_waste_records_tenant_policy ON esg.waste_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.social_metrics (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_social_metrics_company_status ON esg.social_metrics(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_social_metrics_site ON esg.social_metrics(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.social_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_social_metrics_tenant_policy ON esg.social_metrics USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.governance_metrics (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_governance_metrics_company_status ON esg.governance_metrics(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_governance_metrics_site ON esg.governance_metrics(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.governance_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_governance_metrics_tenant_policy ON esg.governance_metrics USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.supplier_esg_assessments (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_supplier_esg_assessments_company_status ON esg.supplier_esg_assessments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_supplier_esg_assessments_site ON esg.supplier_esg_assessments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.supplier_esg_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_supplier_esg_assessments_tenant_policy ON esg.supplier_esg_assessments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.esg_targets (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_esg_targets_company_status ON esg.esg_targets(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_esg_targets_site ON esg.esg_targets(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.esg_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_esg_targets_tenant_policy ON esg.esg_targets USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.esg_disclosures (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_esg_disclosures_company_status ON esg.esg_disclosures(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_esg_disclosures_site ON esg.esg_disclosures(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.esg_disclosures ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_esg_disclosures_tenant_policy ON esg.esg_disclosures USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS esg.assurance_records (
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
  CHECK (status IN ('draft', 'collecting', 'calculated', 'reviewed', 'assured', 'published', 'restated', 'withdrawn')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_esg_assurance_records_company_status ON esg.assurance_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_esg_assurance_records_site ON esg.assurance_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE esg.assurance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY esg_assurance_records_tenant_policy ON esg.assurance_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
