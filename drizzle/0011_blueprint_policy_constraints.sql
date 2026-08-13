-- Blueprint policy constraints from RATEQUIP_SUPER_REPOSITORY_V1.
-- Adopted into the live Neon schema without replacing Phase 2 tables.

ALTER TABLE company_claims
  ADD COLUMN IF NOT EXISTS authority_verified boolean NOT NULL DEFAULT false;

UPDATE company_claims
SET authority_verified = true
WHERE status IN (
  'approved',
  'verified_representative',
  'verified_controller'
);

ALTER TABLE company_claims
  DROP CONSTRAINT IF EXISTS claim_approval_requires_authority;

ALTER TABLE company_claims
  ADD CONSTRAINT claim_approval_requires_authority
  CHECK (
    status::text NOT IN (
      'approved',
      'verified_representative',
      'verified_controller'
    )
    OR authority_verified = true
  );

ALTER TABLE trust_scores
  ALTER COLUMN explanation SET NOT NULL,
  ALTER COLUMN explanation SET DEFAULT '{}'::jsonb;

CREATE OR REPLACE FUNCTION ratequip_reject_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'RateQuip ledger is append-only; corrections must be compensating rows';
END;
$$;

DROP TRIGGER IF EXISTS credit_ledger_no_update ON credit_ledger_entries;
CREATE TRIGGER credit_ledger_no_update
  BEFORE UPDATE OR DELETE ON credit_ledger_entries
  FOR EACH ROW
  EXECUTE PROCEDURE ratequip_reject_ledger_mutation();

DROP TRIGGER IF EXISTS commission_ledger_no_update ON commission_ledger_entries;
CREATE TRIGGER commission_ledger_no_update
  BEFORE UPDATE OR DELETE ON commission_ledger_entries
  FOR EACH ROW
  EXECUTE PROCEDURE ratequip_reject_ledger_mutation();

DROP TRIGGER IF EXISTS enterprise_ledger_no_update ON enterprise_ledger_entries;
CREATE TRIGGER enterprise_ledger_no_update
  BEFORE UPDATE OR DELETE ON enterprise_ledger_entries
  FOR EACH ROW
  EXECUTE PROCEDURE ratequip_reject_ledger_mutation();
