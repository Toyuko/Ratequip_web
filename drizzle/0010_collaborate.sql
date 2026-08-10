-- Collaborate Phase 0 foundation (Features 61–70)
-- Party, Capability, Engagement, Milestone, events, reputation, workspace, fees.
-- Runtime currently uses process store; this SQL is the durable schema target.

BEGIN;

CREATE TABLE IF NOT EXISTS collaborate_parties (
  party_id text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('INDIVIDUAL', 'ORGANISATION')),
  legal_name text NOT NULL,
  jurisdiction text NOT NULL,
  contact_email text NOT NULL,
  timezone text NOT NULL,
  verification_tier text NOT NULL DEFAULT 'T0',
  user_id uuid,
  organisation_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_party_memberships (
  membership_id text PRIMARY KEY,
  individual_party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  organisation_party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  role text NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'AUTHORISED_REP', 'MEMBER')),
  authority_limit_minor integer,
  currency text NOT NULL DEFAULT 'AUD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_capabilities (
  capability_id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  kind text NOT NULL CHECK (kind IN ('SKILL', 'CREDENTIAL', 'ASSET', 'CAPACITY')),
  taxonomy_id text NOT NULL,
  verified_state text NOT NULL DEFAULT 'SELF_DECLARED',
  visibility text NOT NULL DEFAULT 'PUBLIC',
  level integer,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_confirmed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_engagements (
  engagement_id text PRIMARY KEY,
  mode text NOT NULL CHECK (mode IN ('JOB', 'POD', 'SESSION', 'VENTURE')),
  title text NOT NULL,
  summary text,
  buyer_party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  contracting_structure text NOT NULL DEFAULT 'DIRECT',
  lead_actor_id text,
  state text NOT NULL,
  currency text NOT NULL,
  value_band jsonb,
  jurisdiction text NOT NULL,
  fee_quote_id text,
  risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  visibility text NOT NULL DEFAULT 'PRIVATE',
  offering_id text,
  scheduled_at timestamptz,
  workspace_id text,
  event_stream_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_collaborate_engagements_mode_state
  ON collaborate_engagements(mode, state);

CREATE TABLE IF NOT EXISTS collaborate_actors (
  actor_id text PRIMARY KEY,
  engagement_id text NOT NULL REFERENCES collaborate_engagements(engagement_id),
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  role text NOT NULL,
  conflict_declaration text NOT NULL DEFAULT 'NONE',
  joined_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_requirements (
  requirement_id text PRIMARY KEY,
  engagement_id text NOT NULL REFERENCES collaborate_engagements(engagement_id),
  kind text NOT NULL,
  taxonomy_id text NOT NULL,
  necessity text NOT NULL,
  min_level integer,
  jurisdiction_constraint text,
  on_site_required boolean NOT NULL DEFAULT false,
  quantity jsonb,
  budget_band jsonb,
  status text NOT NULL DEFAULT 'UNFILLED',
  filled_by_actor_id text,
  derived_from text NOT NULL,
  rationale text
);

CREATE TABLE IF NOT EXISTS collaborate_milestones (
  milestone_id text PRIMARY KEY,
  engagement_id text NOT NULL REFERENCES collaborate_engagements(engagement_id),
  sequence integer NOT NULL,
  title text NOT NULL,
  acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  amount_minor integer NOT NULL,
  currency text NOT NULL,
  allocations jsonb NOT NULL DEFAULT '[]'::jsonb,
  depends_on jsonb NOT NULL DEFAULT '[]'::jsonb,
  due_date date,
  acceptance_window_days integer NOT NULL DEFAULT 5,
  state text NOT NULL DEFAULT 'DRAFT',
  funding_ref text,
  slip_attribution text,
  revision_count integer NOT NULL DEFAULT 0,
  submitted_at timestamptz,
  accepted_at timestamptz,
  -- Money as integer minor units — never floats
  CHECK (amount_minor >= 0)
);

CREATE TABLE IF NOT EXISTS collaborate_fee_quotes (
  fee_quote_id text PRIMARY KEY,
  engagement_id text NOT NULL REFERENCES collaborate_engagements(engagement_id),
  schedule_version text NOT NULL,
  currency text NOT NULL,
  gross_minor integer NOT NULL,
  platform_fee_minor integer NOT NULL,
  provider_fee_minor integer NOT NULL,
  net_to_contributor_minor integer NOT NULL,
  fee_bps integer NOT NULL,
  charged_to text NOT NULL,
  disclosure jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE TABLE IF NOT EXISTS collaborate_domain_events (
  event_id text PRIMARY KEY,
  engagement_id text NOT NULL REFERENCES collaborate_engagements(engagement_id),
  actor_id text,
  acting_as_party_id text NOT NULL,
  type text NOT NULL,
  payload jsonb NOT NULL,
  payload_hash text NOT NULL,
  occurred_at timestamptz NOT NULL,
  prev_event_id text,
  chain_hash text NOT NULL
);

CREATE INDEX IF NOT EXISTS ix_collaborate_events_engagement
  ON collaborate_domain_events(engagement_id, occurred_at);

CREATE TABLE IF NOT EXISTS collaborate_reputation_events (
  reputation_event_id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  engagement_id text NOT NULL,
  milestone_id text,
  counterparty_id text,
  type text NOT NULL,
  value_minor integer,
  currency text,
  occurred_at timestamptz NOT NULL,
  attribution text,
  transaction_ref text NOT NULL
);

CREATE TABLE IF NOT EXISTS collaborate_session_offerings (
  offering_id text PRIMARY KEY,
  expert_party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_minor integer NOT NULL,
  currency text NOT NULL,
  duration_minutes integer NOT NULL,
  languages jsonb NOT NULL DEFAULT '["en"]'::jsonb,
  supported_machine_brands jsonb NOT NULL DEFAULT '[]'::jsonb,
  prerequisites jsonb NOT NULL DEFAULT '[]'::jsonb,
  deliverable_definition text NOT NULL,
  requires_credential_verification boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_workspaces (
  workspace_id text PRIMARY KEY,
  engagement_id text NOT NULL UNIQUE REFERENCES collaborate_engagements(engagement_id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_workspace_messages (
  message_id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES collaborate_workspaces(workspace_id),
  thread_id text NOT NULL,
  author_party_id text NOT NULL,
  body text NOT NULL,
  masked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_workspace_access_log (
  log_id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES collaborate_workspaces(workspace_id),
  party_id text NOT NULL,
  action text NOT NULL,
  resource_id text,
  occurred_at timestamptz NOT NULL,
  reason text
);

CREATE TABLE IF NOT EXISTS collaborate_taxonomy_terms (
  taxonomy_id text PRIMARY KEY,
  path text NOT NULL,
  label text NOT NULL,
  synonyms jsonb NOT NULL DEFAULT '[]'::jsonb,
  kind text NOT NULL,
  curated boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS collaborate_pending_taxonomy (
  pending_id text PRIMARY KEY,
  raw_label text NOT NULL,
  kind text NOT NULL,
  submitted_by_party_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collaborate_verifications (
  verification_id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  provider text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL,
  tier_unlocked text,
  evidence jsonb,
  expires_at timestamptz,
  reviewed_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
