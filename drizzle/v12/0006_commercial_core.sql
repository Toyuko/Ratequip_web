-- V12 Part 2 migration 0006: commercial_core

BEGIN;

CREATE TABLE IF NOT EXISTS rq.procurement_requests (
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

CREATE INDEX IF NOT EXISTS ix_procurement_requests_company_status ON rq.procurement_requests(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_procurement_requests_data_gin ON rq.procurement_requests USING gin(data);

DROP TRIGGER IF EXISTS trg_procurement_requests_updated_at ON rq.procurement_requests; CREATE TRIGGER trg_procurement_requests_updated_at BEFORE UPDATE ON rq.procurement_requests FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.procurement_request_lines (
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

CREATE INDEX IF NOT EXISTS ix_procurement_request_lines_company_status ON rq.procurement_request_lines(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_procurement_request_lines_data_gin ON rq.procurement_request_lines USING gin(data);

DROP TRIGGER IF EXISTS trg_procurement_request_lines_updated_at ON rq.procurement_request_lines; CREATE TRIGGER trg_procurement_request_lines_updated_at BEFORE UPDATE ON rq.procurement_request_lines FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.sourcing_events (
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

CREATE INDEX IF NOT EXISTS ix_sourcing_events_company_status ON rq.sourcing_events(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_sourcing_events_data_gin ON rq.sourcing_events USING gin(data);

DROP TRIGGER IF EXISTS trg_sourcing_events_updated_at ON rq.sourcing_events; CREATE TRIGGER trg_sourcing_events_updated_at BEFORE UPDATE ON rq.sourcing_events FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.approval_cases (
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

CREATE INDEX IF NOT EXISTS ix_approval_cases_company_status ON rq.approval_cases(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_approval_cases_data_gin ON rq.approval_cases USING gin(data);

DROP TRIGGER IF EXISTS trg_approval_cases_updated_at ON rq.approval_cases; CREATE TRIGGER trg_approval_cases_updated_at BEFORE UPDATE ON rq.approval_cases FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.approval_steps (
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

CREATE INDEX IF NOT EXISTS ix_approval_steps_company_status ON rq.approval_steps(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_approval_steps_data_gin ON rq.approval_steps USING gin(data);

DROP TRIGGER IF EXISTS trg_approval_steps_updated_at ON rq.approval_steps; CREATE TRIGGER trg_approval_steps_updated_at BEFORE UPDATE ON rq.approval_steps FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.purchase_orders (
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

CREATE INDEX IF NOT EXISTS ix_purchase_orders_company_status ON rq.purchase_orders(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_purchase_orders_data_gin ON rq.purchase_orders USING gin(data);

DROP TRIGGER IF EXISTS trg_purchase_orders_updated_at ON rq.purchase_orders; CREATE TRIGGER trg_purchase_orders_updated_at BEFORE UPDATE ON rq.purchase_orders FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.purchase_order_lines (
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

CREATE INDEX IF NOT EXISTS ix_purchase_order_lines_company_status ON rq.purchase_order_lines(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_purchase_order_lines_data_gin ON rq.purchase_order_lines USING gin(data);

DROP TRIGGER IF EXISTS trg_purchase_order_lines_updated_at ON rq.purchase_order_lines; CREATE TRIGGER trg_purchase_order_lines_updated_at BEFORE UPDATE ON rq.purchase_order_lines FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.goods_receipts (
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

CREATE INDEX IF NOT EXISTS ix_goods_receipts_company_status ON rq.goods_receipts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_goods_receipts_data_gin ON rq.goods_receipts USING gin(data);

DROP TRIGGER IF EXISTS trg_goods_receipts_updated_at ON rq.goods_receipts; CREATE TRIGGER trg_goods_receipts_updated_at BEFORE UPDATE ON rq.goods_receipts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.procurement_policies (
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

CREATE INDEX IF NOT EXISTS ix_procurement_policies_company_status ON rq.procurement_policies(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_procurement_policies_data_gin ON rq.procurement_policies USING gin(data);

DROP TRIGGER IF EXISTS trg_procurement_policies_updated_at ON rq.procurement_policies; CREATE TRIGGER trg_procurement_policies_updated_at BEFORE UPDATE ON rq.procurement_policies FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.rfqs (
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

CREATE INDEX IF NOT EXISTS ix_rfqs_company_status ON rq.rfqs(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_rfqs_data_gin ON rq.rfqs USING gin(data);

DROP TRIGGER IF EXISTS trg_rfqs_updated_at ON rq.rfqs; CREATE TRIGGER trg_rfqs_updated_at BEFORE UPDATE ON rq.rfqs FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.rfq_versions (
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

CREATE INDEX IF NOT EXISTS ix_rfq_versions_company_status ON rq.rfq_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_rfq_versions_data_gin ON rq.rfq_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_rfq_versions_updated_at ON rq.rfq_versions; CREATE TRIGGER trg_rfq_versions_updated_at BEFORE UPDATE ON rq.rfq_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.rfq_requirements (
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

CREATE INDEX IF NOT EXISTS ix_rfq_requirements_company_status ON rq.rfq_requirements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_rfq_requirements_data_gin ON rq.rfq_requirements USING gin(data);

DROP TRIGGER IF EXISTS trg_rfq_requirements_updated_at ON rq.rfq_requirements; CREATE TRIGGER trg_rfq_requirements_updated_at BEFORE UPDATE ON rq.rfq_requirements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.rfq_visibility_rules (
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

CREATE INDEX IF NOT EXISTS ix_rfq_visibility_rules_company_status ON rq.rfq_visibility_rules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_rfq_visibility_rules_data_gin ON rq.rfq_visibility_rules USING gin(data);

DROP TRIGGER IF EXISTS trg_rfq_visibility_rules_updated_at ON rq.rfq_visibility_rules; CREATE TRIGGER trg_rfq_visibility_rules_updated_at BEFORE UPDATE ON rq.rfq_visibility_rules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_invitations (
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

CREATE INDEX IF NOT EXISTS ix_supplier_invitations_company_status ON rq.supplier_invitations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_invitations_data_gin ON rq.supplier_invitations USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_invitations_updated_at ON rq.supplier_invitations; CREATE TRIGGER trg_supplier_invitations_updated_at BEFORE UPDATE ON rq.supplier_invitations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.clarifications (
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

CREATE INDEX IF NOT EXISTS ix_clarifications_company_status ON rq.clarifications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_clarifications_data_gin ON rq.clarifications USING gin(data);

DROP TRIGGER IF EXISTS trg_clarifications_updated_at ON rq.clarifications; CREATE TRIGGER trg_clarifications_updated_at BEFORE UPDATE ON rq.clarifications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.clarification_answers (
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

CREATE INDEX IF NOT EXISTS ix_clarification_answers_company_status ON rq.clarification_answers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_clarification_answers_data_gin ON rq.clarification_answers USING gin(data);

DROP TRIGGER IF EXISTS trg_clarification_answers_updated_at ON rq.clarification_answers; CREATE TRIGGER trg_clarification_answers_updated_at BEFORE UPDATE ON rq.clarification_answers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.quotations (
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

CREATE INDEX IF NOT EXISTS ix_quotations_company_status ON rq.quotations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_quotations_data_gin ON rq.quotations USING gin(data);

DROP TRIGGER IF EXISTS trg_quotations_updated_at ON rq.quotations; CREATE TRIGGER trg_quotations_updated_at BEFORE UPDATE ON rq.quotations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.quotation_versions (
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

CREATE INDEX IF NOT EXISTS ix_quotation_versions_company_status ON rq.quotation_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_quotation_versions_data_gin ON rq.quotation_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_quotation_versions_updated_at ON rq.quotation_versions; CREATE TRIGGER trg_quotation_versions_updated_at BEFORE UPDATE ON rq.quotation_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.quotation_lines (
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

CREATE INDEX IF NOT EXISTS ix_quotation_lines_company_status ON rq.quotation_lines(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_quotation_lines_data_gin ON rq.quotation_lines USING gin(data);

DROP TRIGGER IF EXISTS trg_quotation_lines_updated_at ON rq.quotation_lines; CREATE TRIGGER trg_quotation_lines_updated_at BEFORE UPDATE ON rq.quotation_lines FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.quote_comparisons (
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

CREATE INDEX IF NOT EXISTS ix_quote_comparisons_company_status ON rq.quote_comparisons(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_quote_comparisons_data_gin ON rq.quote_comparisons USING gin(data);

DROP TRIGGER IF EXISTS trg_quote_comparisons_updated_at ON rq.quote_comparisons; CREATE TRIGGER trg_quote_comparisons_updated_at BEFORE UPDATE ON rq.quote_comparisons FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.award_decisions (
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

CREATE INDEX IF NOT EXISTS ix_award_decisions_company_status ON rq.award_decisions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_award_decisions_data_gin ON rq.award_decisions USING gin(data);

DROP TRIGGER IF EXISTS trg_award_decisions_updated_at ON rq.award_decisions; CREATE TRIGGER trg_award_decisions_updated_at BEFORE UPDATE ON rq.award_decisions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_relationships (
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

CREATE INDEX IF NOT EXISTS ix_supplier_relationships_company_status ON rq.supplier_relationships(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_relationships_data_gin ON rq.supplier_relationships USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_relationships_updated_at ON rq.supplier_relationships; CREATE TRIGGER trg_supplier_relationships_updated_at BEFORE UPDATE ON rq.supplier_relationships FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_segments (
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

CREATE INDEX IF NOT EXISTS ix_supplier_segments_company_status ON rq.supplier_segments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_segments_data_gin ON rq.supplier_segments USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_segments_updated_at ON rq.supplier_segments; CREATE TRIGGER trg_supplier_segments_updated_at BEFORE UPDATE ON rq.supplier_segments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_qualifications (
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

CREATE INDEX IF NOT EXISTS ix_supplier_qualifications_company_status ON rq.supplier_qualifications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_qualifications_data_gin ON rq.supplier_qualifications USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_qualifications_updated_at ON rq.supplier_qualifications; CREATE TRIGGER trg_supplier_qualifications_updated_at BEFORE UPDATE ON rq.supplier_qualifications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_scorecards (
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

CREATE INDEX IF NOT EXISTS ix_supplier_scorecards_company_status ON rq.supplier_scorecards(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_scorecards_data_gin ON rq.supplier_scorecards USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_scorecards_updated_at ON rq.supplier_scorecards; CREATE TRIGGER trg_supplier_scorecards_updated_at BEFORE UPDATE ON rq.supplier_scorecards FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.performance_periods (
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

CREATE INDEX IF NOT EXISTS ix_performance_periods_company_status ON rq.performance_periods(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_performance_periods_data_gin ON rq.performance_periods USING gin(data);

DROP TRIGGER IF EXISTS trg_performance_periods_updated_at ON rq.performance_periods; CREATE TRIGGER trg_performance_periods_updated_at BEFORE UPDATE ON rq.performance_periods FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_risks (
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

CREATE INDEX IF NOT EXISTS ix_supplier_risks_company_status ON rq.supplier_risks(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_risks_data_gin ON rq.supplier_risks USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_risks_updated_at ON rq.supplier_risks; CREATE TRIGGER trg_supplier_risks_updated_at BEFORE UPDATE ON rq.supplier_risks FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.supplier_reviews (
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

CREATE INDEX IF NOT EXISTS ix_supplier_reviews_company_status ON rq.supplier_reviews(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_supplier_reviews_data_gin ON rq.supplier_reviews USING gin(data);

DROP TRIGGER IF EXISTS trg_supplier_reviews_updated_at ON rq.supplier_reviews; CREATE TRIGGER trg_supplier_reviews_updated_at BEFORE UPDATE ON rq.supplier_reviews FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.corrective_action_plans (
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

CREATE INDEX IF NOT EXISTS ix_corrective_action_plans_company_status ON rq.corrective_action_plans(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_corrective_action_plans_data_gin ON rq.corrective_action_plans USING gin(data);

DROP TRIGGER IF EXISTS trg_corrective_action_plans_updated_at ON rq.corrective_action_plans; CREATE TRIGGER trg_corrective_action_plans_updated_at BEFORE UPDATE ON rq.corrective_action_plans FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.preferred_vendor_lists (
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

CREATE INDEX IF NOT EXISTS ix_preferred_vendor_lists_company_status ON rq.preferred_vendor_lists(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_preferred_vendor_lists_data_gin ON rq.preferred_vendor_lists USING gin(data);

DROP TRIGGER IF EXISTS trg_preferred_vendor_lists_updated_at ON rq.preferred_vendor_lists; CREATE TRIGGER trg_preferred_vendor_lists_updated_at BEFORE UPDATE ON rq.preferred_vendor_lists FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_accounts (
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

CREATE INDEX IF NOT EXISTS ix_crm_accounts_company_status ON rq.crm_accounts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_accounts_data_gin ON rq.crm_accounts USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_accounts_updated_at ON rq.crm_accounts; CREATE TRIGGER trg_crm_accounts_updated_at BEFORE UPDATE ON rq.crm_accounts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_contacts (
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

CREATE INDEX IF NOT EXISTS ix_crm_contacts_company_status ON rq.crm_contacts(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_contacts_data_gin ON rq.crm_contacts USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_contacts_updated_at ON rq.crm_contacts; CREATE TRIGGER trg_crm_contacts_updated_at BEFORE UPDATE ON rq.crm_contacts FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_contact_points (
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

CREATE INDEX IF NOT EXISTS ix_crm_contact_points_company_status ON rq.crm_contact_points(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_contact_points_data_gin ON rq.crm_contact_points USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_contact_points_updated_at ON rq.crm_contact_points; CREATE TRIGGER trg_crm_contact_points_updated_at BEFORE UPDATE ON rq.crm_contact_points FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_opportunities (
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

CREATE INDEX IF NOT EXISTS ix_crm_opportunities_company_status ON rq.crm_opportunities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_opportunities_data_gin ON rq.crm_opportunities USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_opportunities_updated_at ON rq.crm_opportunities; CREATE TRIGGER trg_crm_opportunities_updated_at BEFORE UPDATE ON rq.crm_opportunities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_pipeline_stages (
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

CREATE INDEX IF NOT EXISTS ix_crm_pipeline_stages_company_status ON rq.crm_pipeline_stages(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_pipeline_stages_data_gin ON rq.crm_pipeline_stages USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_pipeline_stages_updated_at ON rq.crm_pipeline_stages; CREATE TRIGGER trg_crm_pipeline_stages_updated_at BEFORE UPDATE ON rq.crm_pipeline_stages FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_activities (
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

CREATE INDEX IF NOT EXISTS ix_crm_activities_company_status ON rq.crm_activities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_activities_data_gin ON rq.crm_activities USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_activities_updated_at ON rq.crm_activities; CREATE TRIGGER trg_crm_activities_updated_at BEFORE UPDATE ON rq.crm_activities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_tasks (
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

CREATE INDEX IF NOT EXISTS ix_crm_tasks_company_status ON rq.crm_tasks(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_tasks_data_gin ON rq.crm_tasks USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_tasks_updated_at ON rq.crm_tasks; CREATE TRIGGER trg_crm_tasks_updated_at BEFORE UPDATE ON rq.crm_tasks FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_campaign_members (
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

CREATE INDEX IF NOT EXISTS ix_crm_campaign_members_company_status ON rq.crm_campaign_members(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_campaign_members_data_gin ON rq.crm_campaign_members USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_campaign_members_updated_at ON rq.crm_campaign_members; CREATE TRIGGER trg_crm_campaign_members_updated_at BEFORE UPDATE ON rq.crm_campaign_members FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_consents (
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

CREATE INDEX IF NOT EXISTS ix_crm_consents_company_status ON rq.crm_consents(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_consents_data_gin ON rq.crm_consents USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_consents_updated_at ON rq.crm_consents; CREATE TRIGGER trg_crm_consents_updated_at BEFORE UPDATE ON rq.crm_consents FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.crm_attributions (
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

CREATE INDEX IF NOT EXISTS ix_crm_attributions_company_status ON rq.crm_attributions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_crm_attributions_data_gin ON rq.crm_attributions USING gin(data);

DROP TRIGGER IF EXISTS trg_crm_attributions_updated_at ON rq.crm_attributions; CREATE TRIGGER trg_crm_attributions_updated_at BEFORE UPDATE ON rq.crm_attributions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

COMMIT;
