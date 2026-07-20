-- RateQuip V12 Part 6 AI Catalogue Product Factory
-- App remapped from Part 6 local 0001-0006 → 0035-0040 (avoid collision with Parts 1-5).
-- Tables live in schema catalog_factory (not public) to avoid clashing with rq.product_families etc.
BEGIN;
CREATE SCHEMA IF NOT EXISTS catalog_factory;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS catalog_factory.source_pages (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_source_pages_tenant_status ON catalog_factory.source_pages(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.source_regions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_source_regions_tenant_status ON catalog_factory.source_regions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.source_text_blocks (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_source_text_blocks_tenant_status ON catalog_factory.source_text_blocks(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.field_evidence (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_field_evidence_tenant_status ON catalog_factory.field_evidence(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.extraction_provenance (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_extraction_provenance_tenant_status ON catalog_factory.extraction_provenance(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.supplier_profile_drafts (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_supplier_profile_drafts_tenant_status ON catalog_factory.supplier_profile_drafts(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.company_brands (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_company_brands_tenant_status ON catalog_factory.company_brands(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalogs (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalogs_tenant_status ON catalog_factory.catalogs(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_versions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_versions_tenant_status ON catalog_factory.catalog_versions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_sections (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_sections_tenant_status ON catalog_factory.catalog_sections(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_families (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_families_tenant_status ON catalog_factory.product_families(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.products (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_products_tenant_status ON catalog_factory.products(tenant_id,status) WHERE deleted_at IS NULL;
COMMIT;
