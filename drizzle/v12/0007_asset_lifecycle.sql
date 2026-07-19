-- V12 Part 2 migration 0007: asset_lifecycle

BEGIN;

CREATE TABLE IF NOT EXISTS rq.assets (
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

CREATE INDEX IF NOT EXISTS ix_assets_company_status ON rq.assets(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_assets_data_gin ON rq.assets USING gin(data);

DROP TRIGGER IF EXISTS trg_assets_updated_at ON rq.assets; CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON rq.assets FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_identifiers (
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

CREATE INDEX IF NOT EXISTS ix_asset_identifiers_company_status ON rq.asset_identifiers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_identifiers_data_gin ON rq.asset_identifiers USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_identifiers_updated_at ON rq.asset_identifiers; CREATE TRIGGER trg_asset_identifiers_updated_at BEFORE UPDATE ON rq.asset_identifiers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_locations (
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

CREATE INDEX IF NOT EXISTS ix_asset_locations_company_status ON rq.asset_locations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_locations_data_gin ON rq.asset_locations USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_locations_updated_at ON rq.asset_locations; CREATE TRIGGER trg_asset_locations_updated_at BEFORE UPDATE ON rq.asset_locations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_configurations (
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

CREATE INDEX IF NOT EXISTS ix_asset_configurations_company_status ON rq.asset_configurations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_configurations_data_gin ON rq.asset_configurations USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_configurations_updated_at ON rq.asset_configurations; CREATE TRIGGER trg_asset_configurations_updated_at BEFORE UPDATE ON rq.asset_configurations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_components (
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

CREATE INDEX IF NOT EXISTS ix_asset_components_company_status ON rq.asset_components(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_components_data_gin ON rq.asset_components USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_components_updated_at ON rq.asset_components; CREATE TRIGGER trg_asset_components_updated_at BEFORE UPDATE ON rq.asset_components FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_documents (
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

CREATE INDEX IF NOT EXISTS ix_asset_documents_company_status ON rq.asset_documents(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_documents_data_gin ON rq.asset_documents USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_documents_updated_at ON rq.asset_documents; CREATE TRIGGER trg_asset_documents_updated_at BEFORE UPDATE ON rq.asset_documents FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_relationships (
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

CREATE INDEX IF NOT EXISTS ix_asset_relationships_company_status ON rq.asset_relationships(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_relationships_data_gin ON rq.asset_relationships USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_relationships_updated_at ON rq.asset_relationships; CREATE TRIGGER trg_asset_relationships_updated_at BEFORE UPDATE ON rq.asset_relationships FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_service_records (
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

CREATE INDEX IF NOT EXISTS ix_asset_service_records_company_status ON rq.asset_service_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_service_records_data_gin ON rq.asset_service_records USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_service_records_updated_at ON rq.asset_service_records; CREATE TRIGGER trg_asset_service_records_updated_at BEFORE UPDATE ON rq.asset_service_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_meter_readings (
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

CREATE INDEX IF NOT EXISTS ix_asset_meter_readings_company_status ON rq.asset_meter_readings(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_meter_readings_data_gin ON rq.asset_meter_readings USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_meter_readings_updated_at ON rq.asset_meter_readings; CREATE TRIGGER trg_asset_meter_readings_updated_at BEFORE UPDATE ON rq.asset_meter_readings FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_tags (
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

CREATE INDEX IF NOT EXISTS ix_asset_tags_company_status ON rq.asset_tags(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_tags_data_gin ON rq.asset_tags USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_tags_updated_at ON rq.asset_tags; CREATE TRIGGER trg_asset_tags_updated_at BEFORE UPDATE ON rq.asset_tags FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.lifecycle_plans (
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

CREATE INDEX IF NOT EXISTS ix_lifecycle_plans_company_status ON rq.lifecycle_plans(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_lifecycle_plans_data_gin ON rq.lifecycle_plans USING gin(data);

DROP TRIGGER IF EXISTS trg_lifecycle_plans_updated_at ON rq.lifecycle_plans; CREATE TRIGGER trg_lifecycle_plans_updated_at BEFORE UPDATE ON rq.lifecycle_plans FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.lifecycle_stages (
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

CREATE INDEX IF NOT EXISTS ix_lifecycle_stages_company_status ON rq.lifecycle_stages(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_lifecycle_stages_data_gin ON rq.lifecycle_stages USING gin(data);

DROP TRIGGER IF EXISTS trg_lifecycle_stages_updated_at ON rq.lifecycle_stages; CREATE TRIGGER trg_lifecycle_stages_updated_at BEFORE UPDATE ON rq.lifecycle_stages FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.asset_acquisitions (
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

CREATE INDEX IF NOT EXISTS ix_asset_acquisitions_company_status ON rq.asset_acquisitions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_asset_acquisitions_data_gin ON rq.asset_acquisitions USING gin(data);

DROP TRIGGER IF EXISTS trg_asset_acquisitions_updated_at ON rq.asset_acquisitions; CREATE TRIGGER trg_asset_acquisitions_updated_at BEFORE UPDATE ON rq.asset_acquisitions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.installation_records (
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

CREATE INDEX IF NOT EXISTS ix_installation_records_company_status ON rq.installation_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_installation_records_data_gin ON rq.installation_records USING gin(data);

DROP TRIGGER IF EXISTS trg_installation_records_updated_at ON rq.installation_records; CREATE TRIGGER trg_installation_records_updated_at BEFORE UPDATE ON rq.installation_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.commissioning_records (
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

CREATE INDEX IF NOT EXISTS ix_commissioning_records_company_status ON rq.commissioning_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_commissioning_records_data_gin ON rq.commissioning_records USING gin(data);

DROP TRIGGER IF EXISTS trg_commissioning_records_updated_at ON rq.commissioning_records; CREATE TRIGGER trg_commissioning_records_updated_at BEFORE UPDATE ON rq.commissioning_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.upgrade_programs (
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

CREATE INDEX IF NOT EXISTS ix_upgrade_programs_company_status ON rq.upgrade_programs(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_upgrade_programs_data_gin ON rq.upgrade_programs USING gin(data);

DROP TRIGGER IF EXISTS trg_upgrade_programs_updated_at ON rq.upgrade_programs; CREATE TRIGGER trg_upgrade_programs_updated_at BEFORE UPDATE ON rq.upgrade_programs FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.refurbishment_records (
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

CREATE INDEX IF NOT EXISTS ix_refurbishment_records_company_status ON rq.refurbishment_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_refurbishment_records_data_gin ON rq.refurbishment_records USING gin(data);

DROP TRIGGER IF EXISTS trg_refurbishment_records_updated_at ON rq.refurbishment_records; CREATE TRIGGER trg_refurbishment_records_updated_at BEFORE UPDATE ON rq.refurbishment_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.replacement_assessments (
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

CREATE INDEX IF NOT EXISTS ix_replacement_assessments_company_status ON rq.replacement_assessments(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_replacement_assessments_data_gin ON rq.replacement_assessments USING gin(data);

DROP TRIGGER IF EXISTS trg_replacement_assessments_updated_at ON rq.replacement_assessments; CREATE TRIGGER trg_replacement_assessments_updated_at BEFORE UPDATE ON rq.replacement_assessments FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.disposal_records (
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

CREATE INDEX IF NOT EXISTS ix_disposal_records_company_status ON rq.disposal_records(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_disposal_records_data_gin ON rq.disposal_records USING gin(data);

DROP TRIGGER IF EXISTS trg_disposal_records_updated_at ON rq.disposal_records; CREATE TRIGGER trg_disposal_records_updated_at BEFORE UPDATE ON rq.disposal_records FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.lifecycle_costs (
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

CREATE INDEX IF NOT EXISTS ix_lifecycle_costs_company_status ON rq.lifecycle_costs(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_lifecycle_costs_data_gin ON rq.lifecycle_costs USING gin(data);

DROP TRIGGER IF EXISTS trg_lifecycle_costs_updated_at ON rq.lifecycle_costs; CREATE TRIGGER trg_lifecycle_costs_updated_at BEFORE UPDATE ON rq.lifecycle_costs FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.digital_passports (
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

CREATE INDEX IF NOT EXISTS ix_digital_passports_company_status ON rq.digital_passports(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_digital_passports_data_gin ON rq.digital_passports USING gin(data);

DROP TRIGGER IF EXISTS trg_digital_passports_updated_at ON rq.digital_passports; CREATE TRIGGER trg_digital_passports_updated_at BEFORE UPDATE ON rq.digital_passports FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_sections (
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

CREATE INDEX IF NOT EXISTS ix_passport_sections_company_status ON rq.passport_sections(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_sections_data_gin ON rq.passport_sections USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_sections_updated_at ON rq.passport_sections; CREATE TRIGGER trg_passport_sections_updated_at BEFORE UPDATE ON rq.passport_sections FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_claims (
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

CREATE INDEX IF NOT EXISTS ix_passport_claims_company_status ON rq.passport_claims(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_claims_data_gin ON rq.passport_claims USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_claims_updated_at ON rq.passport_claims; CREATE TRIGGER trg_passport_claims_updated_at BEFORE UPDATE ON rq.passport_claims FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_credentials (
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

CREATE INDEX IF NOT EXISTS ix_passport_credentials_company_status ON rq.passport_credentials(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_credentials_data_gin ON rq.passport_credentials USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_credentials_updated_at ON rq.passport_credentials; CREATE TRIGGER trg_passport_credentials_updated_at BEFORE UPDATE ON rq.passport_credentials FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_disclosures (
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

CREATE INDEX IF NOT EXISTS ix_passport_disclosures_company_status ON rq.passport_disclosures(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_disclosures_data_gin ON rq.passport_disclosures USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_disclosures_updated_at ON rq.passport_disclosures; CREATE TRIGGER trg_passport_disclosures_updated_at BEFORE UPDATE ON rq.passport_disclosures FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_shares (
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

CREATE INDEX IF NOT EXISTS ix_passport_shares_company_status ON rq.passport_shares(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_shares_data_gin ON rq.passport_shares USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_shares_updated_at ON rq.passport_shares; CREATE TRIGGER trg_passport_shares_updated_at BEFORE UPDATE ON rq.passport_shares FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_qr_codes (
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

CREATE INDEX IF NOT EXISTS ix_passport_qr_codes_company_status ON rq.passport_qr_codes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_qr_codes_data_gin ON rq.passport_qr_codes USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_qr_codes_updated_at ON rq.passport_qr_codes; CREATE TRIGGER trg_passport_qr_codes_updated_at BEFORE UPDATE ON rq.passport_qr_codes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_nfc_tokens (
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

CREATE INDEX IF NOT EXISTS ix_passport_nfc_tokens_company_status ON rq.passport_nfc_tokens(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_nfc_tokens_data_gin ON rq.passport_nfc_tokens USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_nfc_tokens_updated_at ON rq.passport_nfc_tokens; CREATE TRIGGER trg_passport_nfc_tokens_updated_at BEFORE UPDATE ON rq.passport_nfc_tokens FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.passport_verifications (
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

CREATE INDEX IF NOT EXISTS ix_passport_verifications_company_status ON rq.passport_verifications(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_passport_verifications_data_gin ON rq.passport_verifications USING gin(data);

DROP TRIGGER IF EXISTS trg_passport_verifications_updated_at ON rq.passport_verifications; CREATE TRIGGER trg_passport_verifications_updated_at BEFORE UPDATE ON rq.passport_verifications FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.digital_twins (
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

CREATE INDEX IF NOT EXISTS ix_digital_twins_company_status ON rq.digital_twins(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_digital_twins_data_gin ON rq.digital_twins USING gin(data);

DROP TRIGGER IF EXISTS trg_digital_twins_updated_at ON rq.digital_twins; CREATE TRIGGER trg_digital_twins_updated_at BEFORE UPDATE ON rq.digital_twins FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_models (
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

CREATE INDEX IF NOT EXISTS ix_twin_models_company_status ON rq.twin_models(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_models_data_gin ON rq.twin_models USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_models_updated_at ON rq.twin_models; CREATE TRIGGER trg_twin_models_updated_at BEFORE UPDATE ON rq.twin_models FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_model_versions (
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

CREATE INDEX IF NOT EXISTS ix_twin_model_versions_company_status ON rq.twin_model_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_model_versions_data_gin ON rq.twin_model_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_model_versions_updated_at ON rq.twin_model_versions; CREATE TRIGGER trg_twin_model_versions_updated_at BEFORE UPDATE ON rq.twin_model_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_nodes (
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

CREATE INDEX IF NOT EXISTS ix_twin_nodes_company_status ON rq.twin_nodes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_nodes_data_gin ON rq.twin_nodes USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_nodes_updated_at ON rq.twin_nodes; CREATE TRIGGER trg_twin_nodes_updated_at BEFORE UPDATE ON rq.twin_nodes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_edges (
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

CREATE INDEX IF NOT EXISTS ix_twin_edges_company_status ON rq.twin_edges(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_edges_data_gin ON rq.twin_edges USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_edges_updated_at ON rq.twin_edges; CREATE TRIGGER trg_twin_edges_updated_at BEFORE UPDATE ON rq.twin_edges FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_properties (
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

CREATE INDEX IF NOT EXISTS ix_twin_properties_company_status ON rq.twin_properties(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_properties_data_gin ON rq.twin_properties USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_properties_updated_at ON rq.twin_properties; CREATE TRIGGER trg_twin_properties_updated_at BEFORE UPDATE ON rq.twin_properties FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_state_snapshots (
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

CREATE INDEX IF NOT EXISTS ix_twin_state_snapshots_company_status ON rq.twin_state_snapshots(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_state_snapshots_data_gin ON rq.twin_state_snapshots USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_state_snapshots_updated_at ON rq.twin_state_snapshots; CREATE TRIGGER trg_twin_state_snapshots_updated_at BEFORE UPDATE ON rq.twin_state_snapshots FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_simulations (
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

CREATE INDEX IF NOT EXISTS ix_twin_simulations_company_status ON rq.twin_simulations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_simulations_data_gin ON rq.twin_simulations USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_simulations_updated_at ON rq.twin_simulations; CREATE TRIGGER trg_twin_simulations_updated_at BEFORE UPDATE ON rq.twin_simulations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.twin_alert_rules (
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

CREATE INDEX IF NOT EXISTS ix_twin_alert_rules_company_status ON rq.twin_alert_rules(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_twin_alert_rules_data_gin ON rq.twin_alert_rules USING gin(data);

DROP TRIGGER IF EXISTS trg_twin_alert_rules_updated_at ON rq.twin_alert_rules; CREATE TRIGGER trg_twin_alert_rules_updated_at BEFORE UPDATE ON rq.twin_alert_rules FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

COMMIT;
