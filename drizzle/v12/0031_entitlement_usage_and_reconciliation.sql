-- RateQuip V12.1 Add-On 01 / Part 4
-- App migration number 0031 (canonical Part 4 was 0024-0028; renumbered because 0024-0029 already hold Part 5 on Neon).
-- Forward-only additive migration. Execute after V12 Part 3 migration 0023.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS entitlement;
CREATE TABLE IF NOT EXISTS entitlement.usage_preview (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  action_class text NOT NULL,
  calculation_unit text NOT NULL,
  estimated_low numeric(20,6) NOT NULL,
  estimated_high numeric(20,6) NOT NULL,
  remaining_amount numeric(20,6),
  reset_at timestamptz,
  warning_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  policy_version text NOT NULL
);
ALTER TABLE entitlement.usage_preview ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usage_preview_tenant_isolation ON entitlement.usage_preview;
CREATE POLICY usage_preview_tenant_isolation ON entitlement.usage_preview
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_usage_preview_tenant_status ON entitlement.usage_preview(tenant_id,status);
CREATE TABLE IF NOT EXISTS entitlement.usage_reservation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  preview_id uuid NOT NULL REFERENCES entitlement.usage_preview(id),
  idempotency_key text NOT NULL,
  reserved_amount numeric(20,6) NOT NULL,
  expires_at timestamptz NOT NULL,
  UNIQUE(tenant_id,idempotency_key)
);
ALTER TABLE entitlement.usage_reservation ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usage_reservation_tenant_isolation ON entitlement.usage_reservation;
CREATE POLICY usage_reservation_tenant_isolation ON entitlement.usage_reservation
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_usage_reservation_tenant_status ON entitlement.usage_reservation(tenant_id,status);
CREATE TABLE IF NOT EXISTS entitlement.usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  reservation_id uuid REFERENCES entitlement.usage_reservation(id),
  correlation_id uuid NOT NULL,
  provider text,
  model text,
  quantity numeric(20,6) NOT NULL,
  unit text NOT NULL,
  entry_type text NOT NULL,
  immutable_hash text NOT NULL
);
ALTER TABLE entitlement.usage_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usage_ledger_tenant_isolation ON entitlement.usage_ledger;
CREATE POLICY usage_ledger_tenant_isolation ON entitlement.usage_ledger
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_usage_ledger_tenant_status ON entitlement.usage_ledger(tenant_id,status);
CREATE TABLE IF NOT EXISTS entitlement.task_delivery_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  correlation_id uuid NOT NULL,
  requested_artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  delivered_artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  heartbeat_at timestamptz,
  validation_result jsonb NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE entitlement.task_delivery_evidence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS task_delivery_evidence_tenant_isolation ON entitlement.task_delivery_evidence;
CREATE POLICY task_delivery_evidence_tenant_isolation ON entitlement.task_delivery_evidence
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_task_delivery_evidence_tenant_status ON entitlement.task_delivery_evidence(tenant_id,status);
CREATE TABLE IF NOT EXISTS entitlement.usage_adjustment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  ledger_entry_id uuid REFERENCES entitlement.usage_ledger(id),
  adjustment_type text NOT NULL,
  quantity numeric(20,6) NOT NULL,
  reason_code text NOT NULL,
  reviewer_id uuid,
  approved_at timestamptz
);
ALTER TABLE entitlement.usage_adjustment ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS usage_adjustment_tenant_isolation ON entitlement.usage_adjustment;
CREATE POLICY usage_adjustment_tenant_isolation ON entitlement.usage_adjustment
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_usage_adjustment_tenant_status ON entitlement.usage_adjustment(tenant_id,status);
CREATE TABLE IF NOT EXISTS entitlement.reconciliation_case (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  correlation_id uuid NOT NULL,
  eligibility_reason text NOT NULL,
  consumed_amount numeric(20,6) NOT NULL,
  proposed_adjustment numeric(20,6),
  final_adjustment numeric(20,6),
  policy_version text NOT NULL
);
ALTER TABLE entitlement.reconciliation_case ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reconciliation_case_tenant_isolation ON entitlement.reconciliation_case;
CREATE POLICY reconciliation_case_tenant_isolation ON entitlement.reconciliation_case
  USING (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid)
  WITH CHECK (tenant_id = nullif(current_setting('app.tenant_id', true),'')::uuid);
CREATE INDEX IF NOT EXISTS ix_reconciliation_case_tenant_status ON entitlement.reconciliation_case(tenant_id,status);

COMMIT;
