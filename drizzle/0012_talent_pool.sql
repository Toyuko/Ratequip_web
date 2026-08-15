-- Talent pool + Collaborate Neon persistence (Job Board Integration Spec Phase 1 / 2a).
-- Operators are Collaborate INDIVIDUAL parties. Board adapters land applicants here.

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

ALTER TABLE collaborate_parties
  ADD COLUMN IF NOT EXISTS primary_email_norm text,
  ADD COLUMN IF NOT EXISTS primary_phone_e164 text,
  ADD COLUMN IF NOT EXISTS given_name text,
  ADD COLUMN IF NOT EXISTS family_name text,
  ADD COLUMN IF NOT EXISTS verified_identity_at timestamptz,
  ADD COLUMN IF NOT EXISTS home_lat double precision,
  ADD COLUMN IF NOT EXISTS home_lng double precision,
  ADD COLUMN IF NOT EXISTS created_via_board text,
  ADD COLUMN IF NOT EXISTS operator_status text NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS pool_consent_at timestamptz,
  ADD COLUMN IF NOT EXISTS privacy_notice_version text,
  ADD COLUMN IF NOT EXISTS right_to_work_verified_at timestamptz;

CREATE TABLE IF NOT EXISTS collaborate_runtime (
  id text PRIMARY KEY DEFAULT 'default',
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_operator_identity_links (
  id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  board text NOT NULL,
  external_id text NOT NULL,
  confidence text NOT NULL DEFAULT 'HIGH',
  matched_by_rule text,
  merged_from text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_identity_board_ext_uniq
  ON talent_operator_identity_links (board, external_id);

CREATE TABLE IF NOT EXISTS talent_merge_snapshots (
  id text PRIMARY KEY,
  surviving_party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  absorbed_party_id text NOT NULL,
  pre_merge jsonb NOT NULL,
  rule text NOT NULL,
  reversed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_operator_credentials (
  id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  credential_type text NOT NULL,
  identifier text,
  issuing_jurisdiction text NOT NULL DEFAULT 'AU-NSW',
  issued_at timestamptz,
  expires_at timestamptz,
  verification_method text NOT NULL DEFAULT 'DOCUMENT_CAPTURE',
  verified_at timestamptz,
  verified_by text,
  document_blob_url text,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_credentials_active_uniq
  ON talent_operator_credentials (party_id, credential_type, issuing_jurisdiction)
  WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS talent_credentials_expiry
  ON talent_operator_credentials (expires_at)
  WHERE status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS talent_operator_availability (
  id text PRIMARY KEY,
  party_id text NOT NULL REFERENCES collaborate_parties(party_id),
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  radius_km integer NOT NULL DEFAULT 40,
  base_lat double precision,
  base_lng double precision,
  exclusivity boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_gigs (
  id text PRIMARY KEY,
  hirer_id text NOT NULL,
  booking_id text,
  request_id uuid,
  engagement_id text,
  equipment_class text NOT NULL,
  required_credentials jsonb NOT NULL DEFAULT '[]'::jsonb,
  site_lat double precision,
  site_lng double precision,
  site_label text,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  rate_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'AUD',
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_gig_publications (
  id text PRIMARY KEY,
  gig_id text NOT NULL REFERENCES talent_gigs(id),
  board text NOT NULL,
  external_posting_id text,
  external_task_id text,
  state text NOT NULL DEFAULT 'PENDING',
  taxonomy_version text,
  published_at timestamptz,
  expires_at timestamptz,
  last_reconciled_at timestamptz,
  ad_spend_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_gig_publications_gig_board_uniq
  ON talent_gig_publications (gig_id, board);

CREATE TABLE IF NOT EXISTS talent_applications (
  id text PRIMARY KEY,
  gig_publication_id text REFERENCES talent_gig_publications(id),
  party_id text REFERENCES collaborate_parties(party_id),
  board text NOT NULL,
  external_application_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  source_payload_blob_url text,
  pipeline_state text NOT NULL DEFAULT 'APPLIED',
  disposition_sent_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_applications_board_ext_uniq
  ON talent_applications (board, external_application_id);

CREATE TABLE IF NOT EXISTS talent_inbound_events (
  id text PRIMARY KEY,
  board text NOT NULL,
  external_event_id text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  raw jsonb NOT NULL,
  processed_at timestamptz,
  error text
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_inbound_events_board_ext_uniq
  ON talent_inbound_events (board, external_event_id);

CREATE TABLE IF NOT EXISTS talent_outbox (
  id text PRIMARY KEY,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  board text NOT NULL,
  operation text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_by text,
  processed_at timestamptz,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS talent_outbox_due
  ON talent_outbox (next_attempt_at)
  WHERE processed_at IS NULL;

CREATE TABLE IF NOT EXISTS talent_board_hirer_links (
  id text PRIMARY KEY,
  hirer_id text NOT NULL,
  board text NOT NULL,
  board_account_ref text,
  credentials_secret_name text,
  disabled_features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS talent_board_hirer_uniq
  ON talent_board_hirer_links (hirer_id, board);

ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS needs_operator boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS equipment_class varchar(64),
  ADD COLUMN IF NOT EXISTS required_credentials jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMIT;
