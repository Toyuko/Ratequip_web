/**
 * Lightweight command envelope for new enterprise APIs (archive Part 7 contract).
 * Not applied to frozen Phase 2 routes.
 */

export type CommandEnvelope = {
  requestId: string;
  tenantId: string;
  actorId: string;
  correlationId: string;
  schemaVersion: string;
  occurredAt: string;
  idempotencyKey: string;
};

export function buildCommandEnvelope(input: {
  tenantId: string;
  actorId: string;
  idempotencyKey?: string;
  correlationId?: string;
  schemaVersion?: string;
}): CommandEnvelope {
  const now = new Date().toISOString();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    requestId,
    tenantId: input.tenantId,
    actorId: input.actorId,
    correlationId: input.correlationId ?? requestId,
    schemaVersion: input.schemaVersion ?? "v13.part7.1",
    occurredAt: now,
    idempotencyKey:
      input.idempotencyKey ??
      `idem-${input.tenantId}-${input.actorId}-${Date.now()}`,
  };
}
