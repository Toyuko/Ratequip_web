-- V12 Part 2 migration 0008: industrial_providers

BEGIN;

CREATE TABLE IF NOT EXISTS rq.maintenance_models (
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

CREATE INDEX IF NOT EXISTS ix_maintenance_models_company_status ON rq.maintenance_models(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_maintenance_models_data_gin ON rq.maintenance_models USING gin(data);

DROP TRIGGER IF EXISTS trg_maintenance_models_updated_at ON rq.maintenance_models; CREATE TRIGGER trg_maintenance_models_updated_at BEFORE UPDATE ON rq.maintenance_models FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.model_versions (
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

CREATE INDEX IF NOT EXISTS ix_model_versions_company_status ON rq.model_versions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_model_versions_data_gin ON rq.model_versions USING gin(data);

DROP TRIGGER IF EXISTS trg_model_versions_updated_at ON rq.model_versions; CREATE TRIGGER trg_model_versions_updated_at BEFORE UPDATE ON rq.model_versions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.feature_definitions (
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

CREATE INDEX IF NOT EXISTS ix_feature_definitions_company_status ON rq.feature_definitions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_feature_definitions_data_gin ON rq.feature_definitions USING gin(data);

DROP TRIGGER IF EXISTS trg_feature_definitions_updated_at ON rq.feature_definitions; CREATE TRIGGER trg_feature_definitions_updated_at BEFORE UPDATE ON rq.feature_definitions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.prediction_runs (
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

CREATE INDEX IF NOT EXISTS ix_prediction_runs_company_status ON rq.prediction_runs(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_prediction_runs_data_gin ON rq.prediction_runs USING gin(data);

DROP TRIGGER IF EXISTS trg_prediction_runs_updated_at ON rq.prediction_runs; CREATE TRIGGER trg_prediction_runs_updated_at BEFORE UPDATE ON rq.prediction_runs FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.maintenance_predictions (
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

CREATE INDEX IF NOT EXISTS ix_maintenance_predictions_company_status ON rq.maintenance_predictions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_maintenance_predictions_data_gin ON rq.maintenance_predictions USING gin(data);

DROP TRIGGER IF EXISTS trg_maintenance_predictions_updated_at ON rq.maintenance_predictions; CREATE TRIGGER trg_maintenance_predictions_updated_at BEFORE UPDATE ON rq.maintenance_predictions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.prediction_explanations (
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

CREATE INDEX IF NOT EXISTS ix_prediction_explanations_company_status ON rq.prediction_explanations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_prediction_explanations_data_gin ON rq.prediction_explanations USING gin(data);

DROP TRIGGER IF EXISTS trg_prediction_explanations_updated_at ON rq.prediction_explanations; CREATE TRIGGER trg_prediction_explanations_updated_at BEFORE UPDATE ON rq.prediction_explanations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.maintenance_recommendations (
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

CREATE INDEX IF NOT EXISTS ix_maintenance_recommendations_company_status ON rq.maintenance_recommendations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_maintenance_recommendations_data_gin ON rq.maintenance_recommendations USING gin(data);

DROP TRIGGER IF EXISTS trg_maintenance_recommendations_updated_at ON rq.maintenance_recommendations; CREATE TRIGGER trg_maintenance_recommendations_updated_at BEFORE UPDATE ON rq.maintenance_recommendations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.recommendation_reviews (
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

CREATE INDEX IF NOT EXISTS ix_recommendation_reviews_company_status ON rq.recommendation_reviews(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_recommendation_reviews_data_gin ON rq.recommendation_reviews USING gin(data);

DROP TRIGGER IF EXISTS trg_recommendation_reviews_updated_at ON rq.recommendation_reviews; CREATE TRIGGER trg_recommendation_reviews_updated_at BEFORE UPDATE ON rq.recommendation_reviews FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.model_monitoring (
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

CREATE INDEX IF NOT EXISTS ix_model_monitoring_company_status ON rq.model_monitoring(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_model_monitoring_data_gin ON rq.model_monitoring USING gin(data);

DROP TRIGGER IF EXISTS trg_model_monitoring_updated_at ON rq.model_monitoring; CREATE TRIGGER trg_model_monitoring_updated_at BEFORE UPDATE ON rq.model_monitoring FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.failure_labels (
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

CREATE INDEX IF NOT EXISTS ix_failure_labels_company_status ON rq.failure_labels(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_failure_labels_data_gin ON rq.failure_labels USING gin(data);

DROP TRIGGER IF EXISTS trg_failure_labels_updated_at ON rq.failure_labels; CREATE TRIGGER trg_failure_labels_updated_at BEFORE UPDATE ON rq.failure_labels FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.manufacturers (
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

CREATE INDEX IF NOT EXISTS ix_manufacturers_company_status ON rq.manufacturers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_manufacturers_data_gin ON rq.manufacturers USING gin(data);

DROP TRIGGER IF EXISTS trg_manufacturers_updated_at ON rq.manufacturers; CREATE TRIGGER trg_manufacturers_updated_at BEFORE UPDATE ON rq.manufacturers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.product_families (
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

CREATE INDEX IF NOT EXISTS ix_product_families_company_status ON rq.product_families(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_product_families_data_gin ON rq.product_families USING gin(data);

DROP TRIGGER IF EXISTS trg_product_families_updated_at ON rq.product_families; CREATE TRIGGER trg_product_families_updated_at BEFORE UPDATE ON rq.product_families FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.equipment_models (
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

CREATE INDEX IF NOT EXISTS ix_equipment_models_company_status ON rq.equipment_models(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_equipment_models_data_gin ON rq.equipment_models USING gin(data);

DROP TRIGGER IF EXISTS trg_equipment_models_updated_at ON rq.equipment_models; CREATE TRIGGER trg_equipment_models_updated_at BEFORE UPDATE ON rq.equipment_models FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.model_configurations (
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

CREATE INDEX IF NOT EXISTS ix_model_configurations_company_status ON rq.model_configurations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_model_configurations_data_gin ON rq.model_configurations USING gin(data);

DROP TRIGGER IF EXISTS trg_model_configurations_updated_at ON rq.model_configurations; CREATE TRIGGER trg_model_configurations_updated_at BEFORE UPDATE ON rq.model_configurations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.manufacturing_sites (
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

CREATE INDEX IF NOT EXISTS ix_manufacturing_sites_company_status ON rq.manufacturing_sites(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_manufacturing_sites_data_gin ON rq.manufacturing_sites USING gin(data);

DROP TRIGGER IF EXISTS trg_manufacturing_sites_updated_at ON rq.manufacturing_sites; CREATE TRIGGER trg_manufacturing_sites_updated_at BEFORE UPDATE ON rq.manufacturing_sites FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.production_capacities (
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

CREATE INDEX IF NOT EXISTS ix_production_capacities_company_status ON rq.production_capacities(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_production_capacities_data_gin ON rq.production_capacities USING gin(data);

DROP TRIGGER IF EXISTS trg_production_capacities_updated_at ON rq.production_capacities; CREATE TRIGGER trg_production_capacities_updated_at BEFORE UPDATE ON rq.production_capacities FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.manufacturer_channels (
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

CREATE INDEX IF NOT EXISTS ix_manufacturer_channels_company_status ON rq.manufacturer_channels(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_manufacturer_channels_data_gin ON rq.manufacturer_channels USING gin(data);

DROP TRIGGER IF EXISTS trg_manufacturer_channels_updated_at ON rq.manufacturer_channels; CREATE TRIGGER trg_manufacturer_channels_updated_at BEFORE UPDATE ON rq.manufacturer_channels FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warranty_programs (
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

CREATE INDEX IF NOT EXISTS ix_warranty_programs_company_status ON rq.warranty_programs(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warranty_programs_data_gin ON rq.warranty_programs USING gin(data);

DROP TRIGGER IF EXISTS trg_warranty_programs_updated_at ON rq.warranty_programs; CREATE TRIGGER trg_warranty_programs_updated_at BEFORE UPDATE ON rq.warranty_programs FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.technical_bulletins (
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

CREATE INDEX IF NOT EXISTS ix_technical_bulletins_company_status ON rq.technical_bulletins(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_technical_bulletins_data_gin ON rq.technical_bulletins USING gin(data);

DROP TRIGGER IF EXISTS trg_technical_bulletins_updated_at ON rq.technical_bulletins; CREATE TRIGGER trg_technical_bulletins_updated_at BEFORE UPDATE ON rq.technical_bulletins FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.oem_relationships (
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

CREATE INDEX IF NOT EXISTS ix_oem_relationships_company_status ON rq.oem_relationships(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_oem_relationships_data_gin ON rq.oem_relationships USING gin(data);

DROP TRIGGER IF EXISTS trg_oem_relationships_updated_at ON rq.oem_relationships; CREATE TRIGGER trg_oem_relationships_updated_at BEFORE UPDATE ON rq.oem_relationships FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.distributors (
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

CREATE INDEX IF NOT EXISTS ix_distributors_company_status ON rq.distributors(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_distributors_data_gin ON rq.distributors USING gin(data);

DROP TRIGGER IF EXISTS trg_distributors_updated_at ON rq.distributors; CREATE TRIGGER trg_distributors_updated_at BEFORE UPDATE ON rq.distributors FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.distribution_authorisations (
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

CREATE INDEX IF NOT EXISTS ix_distribution_authorisations_company_status ON rq.distribution_authorisations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_distribution_authorisations_data_gin ON rq.distribution_authorisations USING gin(data);

DROP TRIGGER IF EXISTS trg_distribution_authorisations_updated_at ON rq.distribution_authorisations; CREATE TRIGGER trg_distribution_authorisations_updated_at BEFORE UPDATE ON rq.distribution_authorisations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.territories (
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

CREATE INDEX IF NOT EXISTS ix_territories_company_status ON rq.territories(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_territories_data_gin ON rq.territories USING gin(data);

DROP TRIGGER IF EXISTS trg_territories_updated_at ON rq.territories; CREATE TRIGGER trg_territories_updated_at BEFORE UPDATE ON rq.territories FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.brand_portfolios (
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

CREATE INDEX IF NOT EXISTS ix_brand_portfolios_company_status ON rq.brand_portfolios(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_brand_portfolios_data_gin ON rq.brand_portfolios USING gin(data);

DROP TRIGGER IF EXISTS trg_brand_portfolios_updated_at ON rq.brand_portfolios; CREATE TRIGGER trg_brand_portfolios_updated_at BEFORE UPDATE ON rq.brand_portfolios FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.inventory_positions (
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

CREATE INDEX IF NOT EXISTS ix_inventory_positions_company_status ON rq.inventory_positions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_inventory_positions_data_gin ON rq.inventory_positions USING gin(data);

DROP TRIGGER IF EXISTS trg_inventory_positions_updated_at ON rq.inventory_positions; CREATE TRIGGER trg_inventory_positions_updated_at BEFORE UPDATE ON rq.inventory_positions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.availability_promises (
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

CREATE INDEX IF NOT EXISTS ix_availability_promises_company_status ON rq.availability_promises(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_availability_promises_data_gin ON rq.availability_promises USING gin(data);

DROP TRIGGER IF EXISTS trg_availability_promises_updated_at ON rq.availability_promises; CREATE TRIGGER trg_availability_promises_updated_at BEFORE UPDATE ON rq.availability_promises FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.price_books (
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

CREATE INDEX IF NOT EXISTS ix_price_books_company_status ON rq.price_books(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_price_books_data_gin ON rq.price_books USING gin(data);

DROP TRIGGER IF EXISTS trg_price_books_updated_at ON rq.price_books; CREATE TRIGGER trg_price_books_updated_at BEFORE UPDATE ON rq.price_books FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.channel_orders (
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

CREATE INDEX IF NOT EXISTS ix_channel_orders_company_status ON rq.channel_orders(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_channel_orders_data_gin ON rq.channel_orders USING gin(data);

DROP TRIGGER IF EXISTS trg_channel_orders_updated_at ON rq.channel_orders; CREATE TRIGGER trg_channel_orders_updated_at BEFORE UPDATE ON rq.channel_orders FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.warranty_routes (
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

CREATE INDEX IF NOT EXISTS ix_warranty_routes_company_status ON rq.warranty_routes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_warranty_routes_data_gin ON rq.warranty_routes USING gin(data);

DROP TRIGGER IF EXISTS trg_warranty_routes_updated_at ON rq.warranty_routes; CREATE TRIGGER trg_warranty_routes_updated_at BEFORE UPDATE ON rq.warranty_routes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.channel_performance (
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

CREATE INDEX IF NOT EXISTS ix_channel_performance_company_status ON rq.channel_performance(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_channel_performance_data_gin ON rq.channel_performance USING gin(data);

DROP TRIGGER IF EXISTS trg_channel_performance_updated_at ON rq.channel_performance; CREATE TRIGGER trg_channel_performance_updated_at BEFORE UPDATE ON rq.channel_performance FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.contractor_organisations (
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

CREATE INDEX IF NOT EXISTS ix_contractor_organisations_company_status ON rq.contractor_organisations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_contractor_organisations_data_gin ON rq.contractor_organisations USING gin(data);

DROP TRIGGER IF EXISTS trg_contractor_organisations_updated_at ON rq.contractor_organisations; CREATE TRIGGER trg_contractor_organisations_updated_at BEFORE UPDATE ON rq.contractor_organisations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.technicians (
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

CREATE INDEX IF NOT EXISTS ix_technicians_company_status ON rq.technicians(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_technicians_data_gin ON rq.technicians USING gin(data);

DROP TRIGGER IF EXISTS trg_technicians_updated_at ON rq.technicians; CREATE TRIGGER trg_technicians_updated_at BEFORE UPDATE ON rq.technicians FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.technician_credentials (
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

CREATE INDEX IF NOT EXISTS ix_technician_credentials_company_status ON rq.technician_credentials(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_technician_credentials_data_gin ON rq.technician_credentials USING gin(data);

DROP TRIGGER IF EXISTS trg_technician_credentials_updated_at ON rq.technician_credentials; CREATE TRIGGER trg_technician_credentials_updated_at BEFORE UPDATE ON rq.technician_credentials FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.contractor_availability (
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

CREATE INDEX IF NOT EXISTS ix_contractor_availability_company_status ON rq.contractor_availability(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_contractor_availability_data_gin ON rq.contractor_availability USING gin(data);

DROP TRIGGER IF EXISTS trg_contractor_availability_updated_at ON rq.contractor_availability; CREATE TRIGGER trg_contractor_availability_updated_at BEFORE UPDATE ON rq.contractor_availability FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_territories (
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

CREATE INDEX IF NOT EXISTS ix_service_territories_company_status ON rq.service_territories(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_territories_data_gin ON rq.service_territories USING gin(data);

DROP TRIGGER IF EXISTS trg_service_territories_updated_at ON rq.service_territories; CREATE TRIGGER trg_service_territories_updated_at BEFORE UPDATE ON rq.service_territories FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.job_dispatches (
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

CREATE INDEX IF NOT EXISTS ix_job_dispatches_company_status ON rq.job_dispatches(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_job_dispatches_data_gin ON rq.job_dispatches USING gin(data);

DROP TRIGGER IF EXISTS trg_job_dispatches_updated_at ON rq.job_dispatches; CREATE TRIGGER trg_job_dispatches_updated_at BEFORE UPDATE ON rq.job_dispatches FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.field_checkins (
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

CREATE INDEX IF NOT EXISTS ix_field_checkins_company_status ON rq.field_checkins(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_field_checkins_data_gin ON rq.field_checkins USING gin(data);

DROP TRIGGER IF EXISTS trg_field_checkins_updated_at ON rq.field_checkins; CREATE TRIGGER trg_field_checkins_updated_at BEFORE UPDATE ON rq.field_checkins FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_reports (
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

CREATE INDEX IF NOT EXISTS ix_service_reports_company_status ON rq.service_reports(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_reports_data_gin ON rq.service_reports USING gin(data);

DROP TRIGGER IF EXISTS trg_service_reports_updated_at ON rq.service_reports; CREATE TRIGGER trg_service_reports_updated_at BEFORE UPDATE ON rq.service_reports FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.labour_rates (
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

CREATE INDEX IF NOT EXISTS ix_labour_rates_company_status ON rq.labour_rates(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_labour_rates_data_gin ON rq.labour_rates USING gin(data);

DROP TRIGGER IF EXISTS trg_labour_rates_updated_at ON rq.labour_rates; CREATE TRIGGER trg_labour_rates_updated_at BEFORE UPDATE ON rq.labour_rates FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.contractor_equipment (
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

CREATE INDEX IF NOT EXISTS ix_contractor_equipment_company_status ON rq.contractor_equipment(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_contractor_equipment_data_gin ON rq.contractor_equipment USING gin(data);

DROP TRIGGER IF EXISTS trg_contractor_equipment_updated_at ON rq.contractor_equipment; CREATE TRIGGER trg_contractor_equipment_updated_at BEFORE UPDATE ON rq.contractor_equipment FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_providers (
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

CREATE INDEX IF NOT EXISTS ix_service_providers_company_status ON rq.service_providers(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_providers_data_gin ON rq.service_providers USING gin(data);

DROP TRIGGER IF EXISTS trg_service_providers_updated_at ON rq.service_providers; CREATE TRIGGER trg_service_providers_updated_at BEFORE UPDATE ON rq.service_providers FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_catalogues (
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

CREATE INDEX IF NOT EXISTS ix_service_catalogues_company_status ON rq.service_catalogues(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_catalogues_data_gin ON rq.service_catalogues USING gin(data);

DROP TRIGGER IF EXISTS trg_service_catalogues_updated_at ON rq.service_catalogues; CREATE TRIGGER trg_service_catalogues_updated_at BEFORE UPDATE ON rq.service_catalogues FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_offerings (
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

CREATE INDEX IF NOT EXISTS ix_service_offerings_company_status ON rq.service_offerings(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_offerings_data_gin ON rq.service_offerings USING gin(data);

DROP TRIGGER IF EXISTS trg_service_offerings_updated_at ON rq.service_offerings; CREATE TRIGGER trg_service_offerings_updated_at BEFORE UPDATE ON rq.service_offerings FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_level_agreements (
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

CREATE INDEX IF NOT EXISTS ix_service_level_agreements_company_status ON rq.service_level_agreements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_level_agreements_data_gin ON rq.service_level_agreements USING gin(data);

DROP TRIGGER IF EXISTS trg_service_level_agreements_updated_at ON rq.service_level_agreements; CREATE TRIGGER trg_service_level_agreements_updated_at BEFORE UPDATE ON rq.service_level_agreements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_coverage (
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

CREATE INDEX IF NOT EXISTS ix_service_coverage_company_status ON rq.service_coverage(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_coverage_data_gin ON rq.service_coverage USING gin(data);

DROP TRIGGER IF EXISTS trg_service_coverage_updated_at ON rq.service_coverage; CREATE TRIGGER trg_service_coverage_updated_at BEFORE UPDATE ON rq.service_coverage FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_requests (
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

CREATE INDEX IF NOT EXISTS ix_service_requests_company_status ON rq.service_requests(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_requests_data_gin ON rq.service_requests USING gin(data);

DROP TRIGGER IF EXISTS trg_service_requests_updated_at ON rq.service_requests; CREATE TRIGGER trg_service_requests_updated_at BEFORE UPDATE ON rq.service_requests FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_deliveries (
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

CREATE INDEX IF NOT EXISTS ix_service_deliveries_company_status ON rq.service_deliveries(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_deliveries_data_gin ON rq.service_deliveries USING gin(data);

DROP TRIGGER IF EXISTS trg_service_deliveries_updated_at ON rq.service_deliveries; CREATE TRIGGER trg_service_deliveries_updated_at BEFORE UPDATE ON rq.service_deliveries FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_evidence (
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

CREATE INDEX IF NOT EXISTS ix_service_evidence_company_status ON rq.service_evidence(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_evidence_data_gin ON rq.service_evidence USING gin(data);

DROP TRIGGER IF EXISTS trg_service_evidence_updated_at ON rq.service_evidence; CREATE TRIGGER trg_service_evidence_updated_at BEFORE UPDATE ON rq.service_evidence FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.service_subscriptions (
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

CREATE INDEX IF NOT EXISTS ix_service_subscriptions_company_status ON rq.service_subscriptions(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_service_subscriptions_data_gin ON rq.service_subscriptions USING gin(data);

DROP TRIGGER IF EXISTS trg_service_subscriptions_updated_at ON rq.service_subscriptions; CREATE TRIGGER trg_service_subscriptions_updated_at BEFORE UPDATE ON rq.service_subscriptions FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.consultants (
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

CREATE INDEX IF NOT EXISTS ix_consultants_company_status ON rq.consultants(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_consultants_data_gin ON rq.consultants USING gin(data);

DROP TRIGGER IF EXISTS trg_consultants_updated_at ON rq.consultants; CREATE TRIGGER trg_consultants_updated_at BEFORE UPDATE ON rq.consultants FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.expertise_profiles (
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

CREATE INDEX IF NOT EXISTS ix_expertise_profiles_company_status ON rq.expertise_profiles(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_expertise_profiles_data_gin ON rq.expertise_profiles USING gin(data);

DROP TRIGGER IF EXISTS trg_expertise_profiles_updated_at ON rq.expertise_profiles; CREATE TRIGGER trg_expertise_profiles_updated_at BEFORE UPDATE ON rq.expertise_profiles FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.consultant_credentials (
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

CREATE INDEX IF NOT EXISTS ix_consultant_credentials_company_status ON rq.consultant_credentials(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_consultant_credentials_data_gin ON rq.consultant_credentials USING gin(data);

DROP TRIGGER IF EXISTS trg_consultant_credentials_updated_at ON rq.consultant_credentials; CREATE TRIGGER trg_consultant_credentials_updated_at BEFORE UPDATE ON rq.consultant_credentials FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.consulting_engagements (
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

CREATE INDEX IF NOT EXISTS ix_consulting_engagements_company_status ON rq.consulting_engagements(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_consulting_engagements_data_gin ON rq.consulting_engagements USING gin(data);

DROP TRIGGER IF EXISTS trg_consulting_engagements_updated_at ON rq.consulting_engagements; CREATE TRIGGER trg_consulting_engagements_updated_at BEFORE UPDATE ON rq.consulting_engagements FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.engagement_scopes (
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

CREATE INDEX IF NOT EXISTS ix_engagement_scopes_company_status ON rq.engagement_scopes(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_engagement_scopes_data_gin ON rq.engagement_scopes USING gin(data);

DROP TRIGGER IF EXISTS trg_engagement_scopes_updated_at ON rq.engagement_scopes; CREATE TRIGGER trg_engagement_scopes_updated_at BEFORE UPDATE ON rq.engagement_scopes FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.conflict_declarations (
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

CREATE INDEX IF NOT EXISTS ix_conflict_declarations_company_status ON rq.conflict_declarations(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_conflict_declarations_data_gin ON rq.conflict_declarations USING gin(data);

DROP TRIGGER IF EXISTS trg_conflict_declarations_updated_at ON rq.conflict_declarations; CREATE TRIGGER trg_conflict_declarations_updated_at BEFORE UPDATE ON rq.conflict_declarations FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.consulting_deliverables (
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

CREATE INDEX IF NOT EXISTS ix_consulting_deliverables_company_status ON rq.consulting_deliverables(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_consulting_deliverables_data_gin ON rq.consulting_deliverables USING gin(data);

DROP TRIGGER IF EXISTS trg_consulting_deliverables_updated_at ON rq.consulting_deliverables; CREATE TRIGGER trg_consulting_deliverables_updated_at BEFORE UPDATE ON rq.consulting_deliverables FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.timesheets (
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

CREATE INDEX IF NOT EXISTS ix_timesheets_company_status ON rq.timesheets(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_timesheets_data_gin ON rq.timesheets USING gin(data);

DROP TRIGGER IF EXISTS trg_timesheets_updated_at ON rq.timesheets; CREATE TRIGGER trg_timesheets_updated_at BEFORE UPDATE ON rq.timesheets FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

CREATE TABLE IF NOT EXISTS rq.professional_references (
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

CREATE INDEX IF NOT EXISTS ix_professional_references_company_status ON rq.professional_references(company_id,status) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS ix_professional_references_data_gin ON rq.professional_references USING gin(data);

DROP TRIGGER IF EXISTS trg_professional_references_updated_at ON rq.professional_references; CREATE TRIGGER trg_professional_references_updated_at BEFORE UPDATE ON rq.professional_references FOR EACH ROW EXECUTE FUNCTION rq.set_updated_at();

COMMIT;
