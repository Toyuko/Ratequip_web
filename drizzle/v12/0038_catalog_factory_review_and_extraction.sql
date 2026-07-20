-- RateQuip V12 Part 6 AI Catalogue Product Factory
-- App remapped from Part 6 local 0001-0006 → 0035-0040 (avoid collision with Parts 1-5).
-- Tables live in schema catalog_factory (not public) to avoid clashing with rq.product_families etc.
BEGIN;
CREATE SCHEMA IF NOT EXISTS catalog_factory;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS catalog_factory.unit_definitions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_unit_definitions_tenant_status ON catalog_factory.unit_definitions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.unit_conversions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_unit_conversions_tenant_status ON catalog_factory.unit_conversions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.extraction_entities (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_extraction_entities_tenant_status ON catalog_factory.extraction_entities(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.extraction_fields (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_extraction_fields_tenant_status ON catalog_factory.extraction_fields(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.extraction_candidates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_extraction_candidates_tenant_status ON catalog_factory.extraction_candidates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.extraction_conflicts (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_extraction_conflicts_tenant_status ON catalog_factory.extraction_conflicts(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.duplicate_candidates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_tenant_status ON catalog_factory.duplicate_candidates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.taxonomy_mapping_candidates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_taxonomy_mapping_candidates_tenant_status ON catalog_factory.taxonomy_mapping_candidates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.image_product_candidates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_image_product_candidates_tenant_status ON catalog_factory.image_product_candidates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_review_sessions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_review_sessions_tenant_status ON catalog_factory.catalog_review_sessions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_review_tasks (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_review_tasks_tenant_status ON catalog_factory.catalog_review_tasks(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_approval_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_approval_events_tenant_status ON catalog_factory.catalog_approval_events(tenant_id,status) WHERE deleted_at IS NULL;
COMMIT;
