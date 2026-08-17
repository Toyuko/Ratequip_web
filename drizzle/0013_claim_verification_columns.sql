-- Claim verification columns on the public schema the app actually writes.
-- drizzle/0008 targeted company_claims without a schema qualifier and never
-- landed on public.company_claims (search_path is "$user", public).

ALTER TYPE public.claim_status ADD VALUE IF NOT EXISTS 'verified_representative';
ALTER TYPE public.claim_status ADD VALUE IF NOT EXISTS 'verified_controller';
ALTER TYPE public.claim_status ADD VALUE IF NOT EXISTS 'stronger_proof_required';
ALTER TYPE public.claim_status ADD VALUE IF NOT EXISTS 'blocked_conflict';

ALTER TABLE public.company_claims
  ADD COLUMN IF NOT EXISTS verification_payload jsonb;

ALTER TABLE public.company_claims
  ADD COLUMN IF NOT EXISTS authority_verified boolean NOT NULL DEFAULT false;

UPDATE public.company_claims
SET authority_verified = true
WHERE status::text IN (
  'approved',
  'verified_representative',
  'verified_controller'
)
AND authority_verified = false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE c.conname = 'claim_approval_requires_authority'
      AND n.nspname = 'public'
  ) THEN
    ALTER TABLE public.company_claims
      ADD CONSTRAINT claim_approval_requires_authority
      CHECK (
        status::text NOT IN (
          'approved',
          'verified_representative',
          'verified_controller'
        )
        OR authority_verified = true
      );
  END IF;
END $$;
