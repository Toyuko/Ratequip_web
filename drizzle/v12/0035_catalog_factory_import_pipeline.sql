-- RateQuip V12 Part 6 AI Catalogue Product Factory
-- App remapped from Part 6 local 0001-0006 → 0035-0040 (avoid collision with Parts 1-5).
-- Tables live in schema catalog_factory (not public) to avoid clashing with rq.product_families etc.
BEGIN;
CREATE SCHEMA IF NOT EXISTS catalog_factory;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS catalog_factory.catalog_import_jobs (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_import_jobs_tenant_status ON catalog_factory.catalog_import_jobs(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_import_files (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_import_files_tenant_status ON catalog_factory.catalog_import_files(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_import_pages (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_import_pages_tenant_status ON catalog_factory.catalog_import_pages(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_page_regions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_page_regions_tenant_status ON catalog_factory.catalog_page_regions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_preflight_estimates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_preflight_estimates_tenant_status ON catalog_factory.catalog_preflight_estimates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_processing_steps (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_processing_steps_tenant_status ON catalog_factory.catalog_processing_steps(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_processing_attempts (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_processing_attempts_tenant_status ON catalog_factory.catalog_processing_attempts(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_processing_errors (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_processing_errors_tenant_status ON catalog_factory.catalog_processing_errors(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_job_checkpoints (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_job_checkpoints_tenant_status ON catalog_factory.catalog_job_checkpoints(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_job_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_job_events_tenant_status ON catalog_factory.catalog_job_events(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.source_documents (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_source_documents_tenant_status ON catalog_factory.source_documents(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.source_document_versions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_source_document_versions_tenant_status ON catalog_factory.source_document_versions(tenant_id,status) WHERE deleted_at IS NULL;
COMMIT;
