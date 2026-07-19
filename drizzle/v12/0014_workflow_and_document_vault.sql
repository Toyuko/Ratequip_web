BEGIN;

-- Domain 37: Enterprise Workflow Engine
CREATE SCHEMA IF NOT EXISTS workflow;
CREATE TABLE IF NOT EXISTS workflow.workflow_definitions (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_definitions_company_status ON workflow.workflow_definitions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_definitions_site ON workflow.workflow_definitions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_definitions_tenant_policy ON workflow.workflow_definitions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_versions (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_versions_company_status ON workflow.workflow_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_versions_site ON workflow.workflow_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_versions_tenant_policy ON workflow.workflow_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_nodes (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_nodes_company_status ON workflow.workflow_nodes(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_nodes_site ON workflow.workflow_nodes(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_nodes_tenant_policy ON workflow.workflow_nodes USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_transitions (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_transitions_company_status ON workflow.workflow_transitions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_transitions_site ON workflow.workflow_transitions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_transitions_tenant_policy ON workflow.workflow_transitions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_instances (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_instances_company_status ON workflow.workflow_instances(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_instances_site ON workflow.workflow_instances(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_instances_tenant_policy ON workflow.workflow_instances USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_tasks (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_tasks_company_status ON workflow.workflow_tasks(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_tasks_site ON workflow.workflow_tasks(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_tasks_tenant_policy ON workflow.workflow_tasks USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_assignments (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_assignments_company_status ON workflow.workflow_assignments(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_assignments_site ON workflow.workflow_assignments(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_assignments_tenant_policy ON workflow.workflow_assignments USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_variables (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_variables_company_status ON workflow.workflow_variables(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_variables_site ON workflow.workflow_variables(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_variables ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_variables_tenant_policy ON workflow.workflow_variables USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_timers (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_timers_company_status ON workflow.workflow_timers(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_timers_site ON workflow.workflow_timers(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_timers ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_timers_tenant_policy ON workflow.workflow_timers USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_escalations (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_escalations_company_status ON workflow.workflow_escalations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_escalations_site ON workflow.workflow_escalations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_escalations_tenant_policy ON workflow.workflow_escalations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_decisions (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_decisions_company_status ON workflow.workflow_decisions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_decisions_site ON workflow.workflow_decisions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_decisions_tenant_policy ON workflow.workflow_decisions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_compensations (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_compensations_company_status ON workflow.workflow_compensations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_compensations_site ON workflow.workflow_compensations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_compensations ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_compensations_tenant_policy ON workflow.workflow_compensations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS workflow.workflow_execution_logs (
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
  CHECK (status IN ('draft', 'published', 'retired', 'running', 'waiting', 'paused', 'completed', 'failed', 'cancelled')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_execution_logs_company_status ON workflow.workflow_execution_logs(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_workflow_workflow_execution_logs_site ON workflow.workflow_execution_logs(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE workflow.workflow_execution_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY workflow_workflow_execution_logs_tenant_policy ON workflow.workflow_execution_logs USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


-- Domain 38: Industrial Document Vault
CREATE SCHEMA IF NOT EXISTS documents;
CREATE TABLE IF NOT EXISTS documents.document_records (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_records_company_status ON documents.document_records(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_records_site ON documents.document_records(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_records_tenant_policy ON documents.document_records USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_versions (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_versions_company_status ON documents.document_versions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_versions_site ON documents.document_versions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_versions_tenant_policy ON documents.document_versions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_files (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_files_company_status ON documents.document_files(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_files_site ON documents.document_files(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_files_tenant_policy ON documents.document_files USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_folders (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_folders_company_status ON documents.document_folders(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_folders_site ON documents.document_folders(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_folders_tenant_policy ON documents.document_folders USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_classifications (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_classifications_company_status ON documents.document_classifications(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_classifications_site ON documents.document_classifications(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_classifications_tenant_policy ON documents.document_classifications USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_access_grants (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_access_grants_company_status ON documents.document_access_grants(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_access_grants_site ON documents.document_access_grants(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_access_grants_tenant_policy ON documents.document_access_grants USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_links (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_links_company_status ON documents.document_links(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_links_site ON documents.document_links(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_links_tenant_policy ON documents.document_links USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_approvals (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_approvals_company_status ON documents.document_approvals(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_approvals_site ON documents.document_approvals(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_approvals_tenant_policy ON documents.document_approvals USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_signatures (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_signatures_company_status ON documents.document_signatures(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_signatures_site ON documents.document_signatures(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_signatures_tenant_policy ON documents.document_signatures USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_annotations (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_annotations_company_status ON documents.document_annotations(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_annotations_site ON documents.document_annotations(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_annotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_annotations_tenant_policy ON documents.document_annotations USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_extractions (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_extractions_company_status ON documents.document_extractions(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_extractions_site ON documents.document_extractions(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_extractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_extractions_tenant_policy ON documents.document_extractions USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.document_transmittals (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_document_transmittals_company_status ON documents.document_transmittals(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_document_transmittals_site ON documents.document_transmittals(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.document_transmittals ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_document_transmittals_tenant_policy ON documents.document_transmittals USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.retention_policies (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_retention_policies_company_status ON documents.retention_policies(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_retention_policies_site ON documents.retention_policies(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.retention_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_retention_policies_tenant_policy ON documents.retention_policies USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);

CREATE TABLE IF NOT EXISTS documents.legal_holds (
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
  CHECK (status IN ('draft', 'in_review', 'approved', 'issued', 'superseded', 'withdrawn', 'held', 'expired')),
  UNIQUE(company_id, record_key)
);
CREATE INDEX IF NOT EXISTS ix_documents_legal_holds_company_status ON documents.legal_holds(company_id,status,updated_at DESC);
CREATE INDEX IF NOT EXISTS ix_documents_legal_holds_site ON documents.legal_holds(company_id,site_id) WHERE site_id IS NOT NULL;
ALTER TABLE documents.legal_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_legal_holds_tenant_policy ON documents.legal_holds USING (company_id = nullif(current_setting('app.company_id', true),'')::uuid) WITH CHECK (company_id = nullif(current_setting('app.company_id', true),'')::uuid);


COMMIT;
