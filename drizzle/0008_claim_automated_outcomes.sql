-- Automated company claim outcomes (replaces staff review queue semantics).
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'verified_representative';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'verified_controller';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'stronger_proof_required';
ALTER TYPE claim_status ADD VALUE IF NOT EXISTS 'blocked_conflict';

ALTER TABLE company_claims
  ADD COLUMN IF NOT EXISTS verification_payload jsonb;
