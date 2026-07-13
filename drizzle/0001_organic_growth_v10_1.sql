-- RateQuip Enterprise Master Repository v10.1
-- Organic Growth Engine extension for the v9/v10 conceptual PostgreSQL schema.
-- Apply through the production migration framework; do not run directly in
-- production without backup, staging rehearsal and application compatibility.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ---------------------------------------------------------------------------
-- Listing submissions and duplicate resolution
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company_listing_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  submitted_by_user_id UUID NOT NULL REFERENCES users(id),
  search_query_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'duplicate_check', 'details_complete', 'contacts_complete',
    'contacts_skipped', 'review_ready', 'review_skipped',
    'confirmation_required', 'publishing', 'published', 'abandoned',
    'blocked', 'merged_into_existing', 'failed'
  )),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  company_name TEXT,
  normalized_name TEXT,
  website_url TEXT,
  registrable_domain TEXT,
  company_types TEXT[] NOT NULL DEFAULT '{}',
  country_code CHAR(2),
  address_line TEXT,
  locality TEXT,
  region TEXT,
  postal_code TEXT,
  phone_display TEXT,
  phone_e164 TEXT,
  public_source_url TEXT,
  private_notes TEXT,
  relationship TEXT,
  intended_purpose TEXT,
  conflict_declared BOOLEAN,
  review_draft_id UUID,
  disclosure_preference TEXT NOT NULL DEFAULT 'anonymous_ratequip_user'
    CHECK (disclosure_preference IN (
      'user_display_name', 'verified_business_name', 'anonymous_ratequip_user'
    )),
  declaration_version TEXT,
  declarations_accepted_at TIMESTAMPTZ,
  duplicate_check_rule_version TEXT,
  duplicate_checked_at TIMESTAMPTZ,
  published_company_id UUID REFERENCES companies(id),
  published_at TIMESTAMPTZ,
  blocked_reason_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_listing_submissions_submitter_status
  ON company_listing_submissions(submitted_by_user_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_listing_submissions_domain
  ON company_listing_submissions(registrable_domain)
  WHERE registrable_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listing_submissions_published_company
  ON company_listing_submissions(published_company_id)
  WHERE published_company_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS company_listing_submission_categories (
  submission_id UUID NOT NULL REFERENCES company_listing_submissions(id) ON DELETE CASCADE,
  category_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (submission_id, category_id)
);

CREATE TABLE IF NOT EXISTS company_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  location_type TEXT NOT NULL DEFAULT 'primary'
    CHECK (location_type IN ('primary', 'branch', 'service_area', 'registered')),
  country_code CHAR(2) NOT NULL,
  address_line TEXT,
  locality TEXT,
  region TEXT,
  postal_code TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  source_submission_id UUID REFERENCES company_listing_submissions(id),
  verification_status TEXT NOT NULL DEFAULT 'contributor_supplied'
    CHECK (verification_status IN ('contributor_supplied', 'company_verified', 'admin_verified', 'disputed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_locations_company
  ON company_locations(company_id, location_type);

CREATE TABLE IF NOT EXISTS company_duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES company_listing_submissions(id) ON DELETE CASCADE,
  candidate_company_id UUID NOT NULL REFERENCES companies(id),
  match_level TEXT NOT NULL CHECK (match_level IN ('exact', 'likely', 'possible')),
  match_score NUMERIC(5,4) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  match_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  rule_version TEXT NOT NULL,
  resolution TEXT CHECK (resolution IN (
    'selected_existing', 'related_branch', 'not_same', 'reported_duplicate', 'admin_merged'
  )),
  resolution_reason TEXT,
  resolved_by_user_id UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, candidate_company_id, rule_version)
);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_unresolved
  ON company_duplicate_candidates(submission_id, match_level, match_score DESC)
  WHERE resolution IS NULL;

-- ---------------------------------------------------------------------------
-- Private referral contact candidates
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS company_contact_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES company_listing_submissions(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id),
  added_by_user_id UUID NOT NULL REFERENCES users(id),
  -- email_ciphertext is encrypted by the application/KMS envelope key.
  email_ciphertext BYTEA NOT NULL,
  -- Keyed HMAC of normalized email; never use an unsalted public hash.
  email_normalized_hash BYTEA NOT NULL,
  email_domain TEXT NOT NULL,
  email_masked TEXT NOT NULL,
  contact_name_ciphertext BYTEA,
  role TEXT,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'business_relationship', 'company_website', 'business_card_or_signature',
    'public_directory', 'other'
  )),
  source_url TEXT,
  source_note_ciphertext BYTEA,
  personal_note_ciphertext BYTEA,
  send_after_publish BOOLEAN NOT NULL DEFAULT TRUE,
  domain_match_category TEXT CHECK (domain_match_category IN (
    'company_domain', 'approved_parent_domain', 'generic_business_domain',
    'consumer_domain', 'unrelated_domain', 'unknown'
  )),
  send_eligibility TEXT NOT NULL DEFAULT 'pending' CHECK (send_eligibility IN (
    'pending', 'eligible', 'suppressed', 'blocked', 'manual_review'
  )),
  ineligibility_code TEXT,
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  declaration_version TEXT,
  declaration_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (submission_id, email_normalized_hash)
);

CREATE INDEX IF NOT EXISTS idx_contact_candidates_company_hash
  ON company_contact_candidates(company_id, email_normalized_hash)
  WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_candidates_submission
  ON company_contact_candidates(submission_id, send_eligibility);

COMMENT ON TABLE company_contact_candidates IS
  'Private user-supplied contacts for claim invitations. Never expose as public company contacts or search fields.';
COMMENT ON COLUMN company_contact_candidates.email_ciphertext IS
  'Application/KMS encrypted email display value; access requires purpose authorization.';
COMMENT ON COLUMN company_contact_candidates.email_normalized_hash IS
  'Keyed HMAC used for equality/deduplication without exposing the normalized email.';

-- ---------------------------------------------------------------------------
-- Unified invitations, recipients, delivery and suppression
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS growth_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  purpose TEXT NOT NULL CHECK (purpose IN (
    'company_claim', 'review', 'business', 'project', 'rfq', 'direct_referral'
  )),
  invited_by_user_id UUID REFERENCES users(id),
  source_submission_id UUID REFERENCES company_listing_submissions(id),
  company_id UUID REFERENCES companies(id),
  review_id UUID REFERENCES reviews(id),
  project_id UUID REFERENCES project_workspaces(id),
  rfq_id UUID REFERENCES rfqs(id),
  disclosure_preference TEXT NOT NULL DEFAULT 'anonymous_ratequip_user'
    CHECK (disclosure_preference IN (
      'user_display_name', 'verified_business_name', 'anonymous_ratequip_user'
    )),
  template_family TEXT NOT NULL,
  template_version TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en',
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'converted', 'cancelled', 'expired', 'blocked')),
  credit_quote_id UUID,
  credit_cost INTEGER NOT NULL DEFAULT 0 CHECK (credit_cost >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  converted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancelled_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_growth_invitations_company_purpose
  ON growth_invitations(company_id, purpose, status);
CREATE INDEX IF NOT EXISTS idx_growth_invitations_inviter
  ON growth_invitations(invited_by_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS growth_invitation_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES growth_invitations(id) ON DELETE CASCADE,
  contact_candidate_id UUID REFERENCES company_contact_candidates(id),
  invited_user_id UUID REFERENCES users(id),
  email_ciphertext BYTEA NOT NULL,
  email_normalized_hash BYTEA NOT NULL,
  email_domain TEXT NOT NULL,
  email_masked TEXT NOT NULL,
  contact_name_ciphertext BYTEA,
  role TEXT,
  token_hash BYTEA NOT NULL,
  token_prefix TEXT NOT NULL,
  token_version INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN (
    'queued', 'sent', 'delivered', 'opened', 'clicked', 'registered',
    'claim_started', 'converted', 'bounced', 'complained', 'unsubscribed',
    'expired', 'cancelled', 'suppressed', 'failed'
  )),
  first_sent_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ,
  claim_started_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  manual_resend_count INTEGER NOT NULL DEFAULT 0 CHECK (manual_resend_count BETWEEN 0 AND 2),
  next_manual_resend_at TIMESTAMPTZ,
  terminal_reason_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (invitation_id, email_normalized_hash)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_growth_recipient_active_company_purpose
  ON growth_invitation_recipients(email_normalized_hash, invitation_id)
  WHERE state NOT IN ('expired', 'cancelled', 'suppressed', 'failed');
CREATE INDEX IF NOT EXISTS idx_growth_recipient_token_prefix
  ON growth_invitation_recipients(token_prefix);
CREATE INDEX IF NOT EXISTS idx_growth_recipient_state
  ON growth_invitation_recipients(state, updated_at);

CREATE TABLE IF NOT EXISTS growth_invitation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES growth_invitation_recipients(id) ON DELETE CASCADE,
  schedule_slot TEXT NOT NULL CHECK (schedule_slot IN (
    'initial', 'reminder_day_3', 'reminder_day_10', 'manual_resend_1', 'manual_resend_2'
  )),
  template_code TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'processing', 'sent', 'cancelled', 'skipped', 'failed')),
  cancel_reason TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (recipient_id, schedule_slot)
);

CREATE INDEX IF NOT EXISTS idx_invitation_schedules_due
  ON growth_invitation_schedules(scheduled_at)
  WHERE status = 'scheduled';

CREATE TABLE IF NOT EXISTS growth_invitation_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES growth_invitation_recipients(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES growth_invitation_schedules(id),
  template_code TEXT NOT NULL,
  template_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  rendered_content_hash BYTEA NOT NULL,
  provider TEXT NOT NULL,
  provider_message_id_hash BYTEA,
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN (
    'queued', 'provider_accepted', 'delivered', 'delayed', 'soft_bounced',
    'hard_bounced', 'complained', 'unsubscribed', 'failed', 'cancelled'
  )),
  attempt_number INTEGER NOT NULL DEFAULT 1 CHECK (attempt_number > 0),
  error_category TEXT,
  provider_response_code TEXT,
  correlation_id UUID NOT NULL,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  provider_accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  terminal_at TIMESTAMPTZ,
  UNIQUE (recipient_id, schedule_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_invitation_deliveries_provider_state
  ON growth_invitation_deliveries(provider, state, queued_at);
CREATE INDEX IF NOT EXISTS idx_invitation_deliveries_correlation
  ON growth_invitation_deliveries(correlation_id);

CREATE TABLE IF NOT EXISTS email_suppressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_normalized_hash BYTEA NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN (
    'global_nonessential', 'company_claim', 'review', 'business_project', 'single_invitation'
  )),
  invitation_id UUID REFERENCES growth_invitations(id),
  source TEXT NOT NULL CHECK (source IN (
    'recipient_preference', 'hard_bounce', 'complaint', 'admin', 'legal', 'security'
  )),
  reason_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by_user_id UUID REFERENCES users(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_email_suppressions_active
  ON email_suppressions(email_normalized_hash, scope, COALESCE(invitation_id, '00000000-0000-0000-0000-000000000000'::uuid))
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS email_provider_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  provider_message_id_hash BYTEA,
  event_type TEXT NOT NULL,
  signature_verified BOOLEAN NOT NULL,
  occurred_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
  error_category TEXT,
  UNIQUE (provider, provider_event_id)
);

-- ---------------------------------------------------------------------------
-- Company claim extension
-- ---------------------------------------------------------------------------

ALTER TABLE company_claims
  ADD COLUMN IF NOT EXISTS source_invitation_recipient_id UUID REFERENCES growth_invitation_recipients(id),
  ADD COLUMN IF NOT EXISTS requested_role TEXT,
  ADD COLUMN IF NOT EXISTS granted_role TEXT,
  ADD COLUMN IF NOT EXISTS authority_method TEXT,
  ADD COLUMN IF NOT EXISTS assurance_level TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decision_reason_code TEXT,
  ADD COLUMN IF NOT EXISTS conflict_group_id UUID,
  ADD COLUMN IF NOT EXISTS rule_version TEXT,
  ADD COLUMN IF NOT EXISTS risk_state TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_company_claims_company_status
  ON company_claims(company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_claims_conflict_group
  ON company_claims(conflict_group_id)
  WHERE conflict_group_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS company_claim_domain_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES company_claims(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('company_domain_email', 'dns_txt')),
  domain TEXT NOT NULL,
  work_email_ciphertext BYTEA,
  work_email_normalized_hash BYTEA,
  challenge_hash BYTEA NOT NULL,
  dns_name TEXT,
  token_prefix TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending', 'verified', 'expired', 'failed', 'cancelled')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_claim_domain_challenges_claim
  ON company_claim_domain_challenges(claim_id, state);

CREATE TABLE IF NOT EXISTS company_claim_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES company_claims(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'company_registration', 'business_licence', 'authorization_letter',
    'official_correspondence', 'role_evidence', 'other'
  )),
  storage_object_key_ciphertext BYTEA NOT NULL,
  original_filename_ciphertext BYTEA NOT NULL,
  content_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size > 0 AND byte_size <= 20971520),
  sha256 BYTEA NOT NULL,
  scan_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (scan_status IN ('pending', 'clean', 'rejected', 'quarantined')),
  review_status TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (review_status IN ('unreviewed', 'accepted', 'insufficient', 'inconsistent')),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  retained_until TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_claim_evidence_claim
  ON company_claim_evidence(claim_id, scan_status, review_status);

CREATE TABLE IF NOT EXISTS company_claim_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES company_claims(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN (
    'approve', 'reject', 'request_information', 'conflict_review', 'withdraw', 'expire'
  )),
  reason_code TEXT NOT NULL,
  notes_ciphertext BYTEA,
  granted_role TEXT,
  decided_by_user_id UUID REFERENCES users(id),
  automated_rule_version TEXT,
  second_approval_required BOOLEAN NOT NULL DEFAULT FALSE,
  second_approved_by_user_id UUID REFERENCES users(id),
  second_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_claim_decisions_claim
  ON company_claim_decisions(claim_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Referral attribution, qualification and immutable reward linkage
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  referrer_user_id UUID NOT NULL REFERENCES users(id),
  referrer_company_id UUID REFERENCES companies(id),
  referred_user_id UUID REFERENCES users(id),
  referred_company_id UUID REFERENCES companies(id),
  source_type TEXT NOT NULL CHECK (source_type IN (
    'company_claim_invitation', 'review_invitation', 'project_business_invitation',
    'direct_referral_link', 'campaign_link', 'declared_at_signup'
  )),
  source_invitation_id UUID REFERENCES growth_invitations(id),
  source_recipient_id UUID REFERENCES growth_invitation_recipients(id),
  source_campaign_code TEXT,
  attribution_rule_version TEXT NOT NULL,
  attribution_priority INTEGER NOT NULL CHECK (attribution_priority > 0),
  state TEXT NOT NULL DEFAULT 'recorded' CHECK (state IN (
    'recorded', 'candidate', 'qualified', 'reward_pending', 'reward_settled',
    'superseded', 'ineligible', 'fraud_hold', 'reversed', 'expired'
  )),
  first_touch_at TIMESTAMPTZ NOT NULL,
  last_eligible_touch_at TIMESTAMPTZ NOT NULL,
  attribution_expires_at TIMESTAMPTZ NOT NULL,
  qualifying_event_type TEXT,
  qualifying_event_id UUID,
  qualified_at TIMESTAMPTZ,
  ineligibility_reason_code TEXT,
  superseded_by_attribution_id UUID REFERENCES referral_attributions(id),
  risk_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_attributions_referrer
  ON referral_attributions(referrer_user_id, state, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_attributions_referred_company
  ON referral_attributions(referred_company_id, state)
  WHERE referred_company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_attributions_expires
  ON referral_attributions(attribution_expires_at)
  WHERE state IN ('recorded', 'candidate');

CREATE TABLE IF NOT EXISTS referral_attribution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_id UUID NOT NULL REFERENCES referral_attributions(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  reason_code TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'service')),
  actor_id UUID,
  correlation_id UUID NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_attribution_events
  ON referral_attribution_events(attribution_id, occurred_at);

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attribution_id UUID NOT NULL REFERENCES referral_attributions(id),
  program_code TEXT NOT NULL,
  program_version TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('credits', 'commission', 'badge', 'placement')),
  credit_amount INTEGER CHECK (credit_amount IS NULL OR credit_amount >= 0),
  currency_code CHAR(3),
  monetary_amount NUMERIC(14,2),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN (
    'pending', 'fraud_hold', 'settled', 'denied', 'reversed'
  )),
  hold_until TIMESTAMPTZ,
  eligibility_rule_version TEXT NOT NULL,
  reason_code TEXT,
  credit_ledger_entry_id UUID REFERENCES credit_ledger_entries(id),
  compensating_ledger_entry_id UUID REFERENCES credit_ledger_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  reversed_at TIMESTAMPTZ,
  UNIQUE (attribution_id, program_code, program_version, reward_type)
);

CREATE INDEX IF NOT EXISTS idx_referral_rewards_hold
  ON referral_rewards(hold_until)
  WHERE state IN ('pending', 'fraud_hold');

-- ---------------------------------------------------------------------------
-- Idempotency, outbox and audit
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS growth_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  tenant_id UUID REFERENCES tenants(id),
  operation TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash BYTEA NOT NULL,
  response_status INTEGER,
  response_body JSONB,
  resource_type TEXT,
  resource_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (actor_user_id, operation, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_growth_idempotency_expiry
  ON growth_idempotency_keys(expires_at);

CREATE TABLE IF NOT EXISTS growth_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  event_version INTEGER NOT NULL DEFAULT 1,
  aggregate_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  actor_type TEXT NOT NULL,
  actor_id UUID,
  correlation_id UUID NOT NULL,
  causation_id UUID,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_error_category TEXT
);

CREATE INDEX IF NOT EXISTS idx_growth_outbox_unpublished
  ON growth_outbox(created_at)
  WHERE published_at IS NULL;

CREATE TABLE IF NOT EXISTS growth_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('user', 'admin', 'service')),
  actor_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  before_state JSONB,
  after_state JSONB,
  reason_code TEXT,
  correlation_id UUID NOT NULL,
  source_ip_prefix INET,
  user_agent_hash BYTEA,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_growth_audit_resource
  ON growth_audit_events(resource_type, resource_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_growth_audit_actor
  ON growth_audit_events(actor_type, actor_id, occurred_at);

-- ---------------------------------------------------------------------------
-- Public company fields: suggested contacts are intentionally not copied here.
-- ---------------------------------------------------------------------------

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS normalized_name TEXT,
  ADD COLUMN IF NOT EXISTS registrable_domain TEXT,
  ADD COLUMN IF NOT EXISTS profile_source TEXT NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS profile_source_submission_id UUID REFERENCES company_listing_submissions(id),
  ADD COLUMN IF NOT EXISTS verification_level TEXT NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS disputed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS merged_into_company_id UUID REFERENCES companies(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_companies_normalized_name_country
  ON companies(normalized_name, id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_companies_active_registrable_domain
  ON companies(registrable_domain)
  WHERE registrable_domain IS NOT NULL
    AND status NOT IN ('merged', 'removed');

COMMIT;

-- Application/RLS requirements are specified in the data dictionary and RBAC
-- document. Enable row-level security only after the owning application's
-- service-role and tenant policies are defined and tested in staging.
