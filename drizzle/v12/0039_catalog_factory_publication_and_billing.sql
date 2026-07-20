-- RateQuip V12 Part 6 AI Catalogue Product Factory
-- App remapped from Part 6 local 0001-0006 → 0035-0040 (avoid collision with Parts 1-5).
-- Tables live in schema catalog_factory (not public) to avoid clashing with rq.product_families etc.
BEGIN;
CREATE SCHEMA IF NOT EXISTS catalog_factory;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS catalog_factory.publication_batches (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_publication_batches_tenant_status ON catalog_factory.publication_batches(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.publication_versions (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_publication_versions_tenant_status ON catalog_factory.publication_versions(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.publication_rollbacks (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_publication_rollbacks_tenant_status ON catalog_factory.publication_rollbacks(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_pricing_rules (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_pricing_rules_tenant_status ON catalog_factory.catalog_pricing_rules(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_cost_estimates (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_cost_estimates_tenant_status ON catalog_factory.catalog_cost_estimates(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_credit_reservations (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_credit_reservations_tenant_status ON catalog_factory.catalog_credit_reservations(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_credit_consumption (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_credit_consumption_tenant_status ON catalog_factory.catalog_credit_consumption(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_billing_adjustments (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_billing_adjustments_tenant_status ON catalog_factory.catalog_billing_adjustments(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_refund_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_refund_events_tenant_status ON catalog_factory.catalog_refund_events(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_view_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_view_events_tenant_status ON catalog_factory.catalog_view_events(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.product_impression_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_product_impression_events_tenant_status ON catalog_factory.product_impression_events(tenant_id,status) WHERE deleted_at IS NULL;
CREATE TABLE IF NOT EXISTS catalog_factory.catalog_ai_usage_events (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, status TEXT, payload JSONB NOT NULL DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), deleted_at TIMESTAMPTZ);
CREATE INDEX IF NOT EXISTS idx_catalog_ai_usage_events_tenant_status ON catalog_factory.catalog_ai_usage_events(tenant_id,status) WHERE deleted_at IS NULL;
COMMIT;
