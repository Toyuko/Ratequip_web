-- V12 Part 1 migration 0005: audit, outbox, idempotency and row-level security foundations
BEGIN;
CREATE TABLE rq.idempotency_records (
 principal_key text NOT NULL, idempotency_key text NOT NULL, request_hash text NOT NULL, status text NOT NULL,
 response_status integer, response_body jsonb, resource_ref text, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 PRIMARY KEY(principal_key,idempotency_key)
);
CREATE TABLE rq_audit.records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), occurred_at timestamptz NOT NULL DEFAULT now(), actor_type text NOT NULL, actor_id uuid,
 active_company_id uuid, action text NOT NULL, object_type text NOT NULL, object_id uuid, reason text, correlation_id uuid NOT NULL,
 before_ref text, after_ref text, metadata jsonb NOT NULL DEFAULT '{}'
) PARTITION BY RANGE(occurred_at);
CREATE TABLE rq_audit.records_default PARTITION OF rq_audit.records DEFAULT;
CREATE TABLE rq_outbox.events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, aggregate_version bigint NOT NULL,
 event_type text NOT NULL, event_version integer NOT NULL, payload jsonb NOT NULL, headers jsonb NOT NULL DEFAULT '{}',
 occurred_at timestamptz NOT NULL DEFAULT now(), published_at timestamptz, attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(aggregate_type,aggregate_id,aggregate_version,event_type)
);
CREATE INDEX idx_outbox_pending ON rq_outbox.events(next_attempt_at) WHERE published_at IS NULL;
CREATE INDEX idx_audit_object ON rq_audit.records(object_type,object_id,occurred_at DESC);

ALTER TABLE rq.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE rq.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE rq.opportunity_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rq.contractor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rq.capability_assertions ENABLE ROW LEVEL SECURITY;

-- Application sets rq.active_company_id after verified context resolution.
CREATE POLICY site_company_isolation ON rq.sites USING (company_id = nullif(current_setting('rq.active_company_id',true),'')::uuid);
CREATE POLICY membership_company_isolation ON rq.memberships USING (company_id = nullif(current_setting('rq.active_company_id',true),'')::uuid);
CREATE POLICY opportunity_company_isolation ON rq.opportunity_profiles USING (company_id = nullif(current_setting('rq.active_company_id',true),'')::uuid);
CREATE POLICY contractor_company_isolation ON rq.contractor_profiles USING (company_id = nullif(current_setting('rq.active_company_id',true),'')::uuid);
CREATE POLICY capability_company_isolation ON rq.capability_assertions USING (company_id = nullif(current_setting('rq.active_company_id',true),'')::uuid);
COMMIT;
