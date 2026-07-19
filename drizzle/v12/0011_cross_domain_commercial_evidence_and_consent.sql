-- Cross-domain immutable revisions, transitions, disclosures, consent and correlation
BEGIN;
CREATE TABLE IF NOT EXISTS rq.commercial_revisions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id),
 aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, revision_no integer NOT NULL,
 content_hash text NOT NULL, payload jsonb NOT NULL, accepted_at timestamptz, accepted_by uuid REFERENCES rq.users(id),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(aggregate_type,aggregate_id,revision_no), UNIQUE(aggregate_type,aggregate_id,content_hash));
CREATE TABLE IF NOT EXISTS rq.domain_state_transitions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id),
 aggregate_type text NOT NULL, aggregate_id uuid NOT NULL, from_state text, to_state text NOT NULL,
 actor_id uuid REFERENCES rq.users(id), reason_code text, policy_version text NOT NULL,
 evidence_refs uuid[] NOT NULL DEFAULT '{}', correlation_id uuid NOT NULL, causation_id uuid,
 occurred_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rq.consent_ledger (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid REFERENCES rq.companies(id), subject_user_id uuid REFERENCES rq.users(id),
 purpose text NOT NULL, channel text, status text NOT NULL, source text NOT NULL, policy_version text NOT NULL,
 granted_at timestamptz, revoked_at timestamptz, evidence jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rq.disclosure_grants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_company_id uuid NOT NULL REFERENCES rq.companies(id), resource_type text NOT NULL,
 resource_id uuid NOT NULL, grantee_type text NOT NULL, grantee_id uuid, scope text[] NOT NULL, token_hash text,
 starts_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, revoked_at timestamptz, created_by uuid REFERENCES rq.users(id));
CREATE INDEX IF NOT EXISTS ix_state_transitions_aggregate ON rq.domain_state_transitions(aggregate_type,aggregate_id,occurred_at);
CREATE INDEX IF NOT EXISTS ix_consent_subject_purpose ON rq.consent_ledger(subject_user_id,purpose,created_at DESC);
COMMIT;
