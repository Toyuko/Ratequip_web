-- V12 Part 1 migration 0002: identity, tenancy and authentication
BEGIN;
CREATE TABLE rq.users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email citext UNIQUE NOT NULL,
 status text NOT NULL CHECK(status IN ('pending','active','suspended','closed')) DEFAULT 'pending',
 locale text NOT NULL DEFAULT 'en-AU', timezone text NOT NULL DEFAULT 'Australia/Sydney',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1
);
CREATE TABLE rq.companies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), legal_name text NOT NULL, display_name text NOT NULL,
 registration_country char(2), registration_number text, primary_domain citext,
 status text NOT NULL CHECK(status IN ('draft','unclaimed','claim_pending','verified','suspended','closed')) DEFAULT 'draft',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1,
 UNIQUE(registration_country, registration_number)
);
CREATE TABLE rq.company_groups (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, parent_group_id uuid REFERENCES rq.company_groups(id),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.sites (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE CASCADE,
 name text NOT NULL, country_code char(2) NOT NULL, region text, locality text, postal_code text, address_private jsonb NOT NULL DEFAULT '{}',
 latitude numeric(9,6), longitude numeric(9,6), timezone text NOT NULL, status text NOT NULL DEFAULT 'active',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), version bigint NOT NULL DEFAULT 1
);
CREATE TABLE rq.memberships (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES rq.users(id) ON DELETE CASCADE,
 company_id uuid NOT NULL REFERENCES rq.companies(id) ON DELETE CASCADE, status text NOT NULL CHECK(status IN ('invited','active','suspended','revoked')),
 job_title text, invited_by uuid REFERENCES rq.users(id), accepted_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id, company_id)
);
CREATE TABLE rq.membership_roles (
 membership_id uuid NOT NULL REFERENCES rq.memberships(id) ON DELETE CASCADE, role_key text NOT NULL,
 site_scope uuid[] NOT NULL DEFAULT '{}', granted_by uuid REFERENCES rq.users(id), granted_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(membership_id, role_key)
);
CREATE TABLE rq.company_claims (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), company_id uuid NOT NULL REFERENCES rq.companies(id), claimant_user_id uuid NOT NULL REFERENCES rq.users(id),
 status text NOT NULL CHECK(status IN ('draft','submitted','evidence_required','approved','rejected','withdrawn')), evidence_refs jsonb NOT NULL DEFAULT '[]',
 decision_reason text, decided_by uuid REFERENCES rq.users(id), created_at timestamptz NOT NULL DEFAULT now(), decided_at timestamptz
);
CREATE TABLE rq.auth_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES rq.users(id) ON DELETE CASCADE,
 token_family_hash text NOT NULL, client_id text NOT NULL, expires_at timestamptz NOT NULL, revoked_at timestamptz,
 ip_hash text, device jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE rq.mfa_enrolments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES rq.users(id) ON DELETE CASCADE,
 method text NOT NULL CHECK(method IN ('totp','webauthn','recovery_codes')), secret_ciphertext bytea, credential jsonb,
 verified_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sites_company ON rq.sites(company_id,status);
CREATE INDEX idx_memberships_company ON rq.memberships(company_id,status);
CREATE INDEX idx_claims_company_status ON rq.company_claims(company_id,status);
COMMIT;
