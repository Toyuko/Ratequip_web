-- RateQuip V12 Part 6 AI Catalogue Product Factory
-- App remapped from Part 6 local 0001-0006 → 0035-0040 (avoid collision with Parts 1-5).
-- Tables live in schema catalog_factory (not public) to avoid clashing with rq.product_families etc.
BEGIN;
CREATE SCHEMA IF NOT EXISTS catalog_factory;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS catalog_factory.product_series (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_series_tenant_status ON catalog_factory.product_series(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_models (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_models_tenant_status ON catalog_factory.product_models(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_variants (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_variants_tenant_status ON catalog_factory.product_variants(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_options (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_options_tenant_status ON catalog_factory.product_options(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_accessories (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_accessories_tenant_status ON catalog_factory.product_accessories(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_spare_parts (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_spare_parts_tenant_status ON catalog_factory.product_spare_parts(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_consumables (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_consumables_tenant_status ON catalog_factory.product_consumables(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_relationships (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_relationships_tenant_status ON catalog_factory.product_relationships(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.specification_definitions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_specification_definitions_tenant_status ON catalog_factory.specification_definitions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.specification_templates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_specification_templates_tenant_status ON catalog_factory.specification_templates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_specifications (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_specifications_tenant_status ON catalog_factory.product_specifications(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_specification_values (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_specification_values_tenant_status ON catalog_factory.product_specification_values(tenant_id,status) WHERE deleted_at IS NULL;
COMMIT;
