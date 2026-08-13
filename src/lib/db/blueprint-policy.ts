/**
 * Super Repository policy encoded in application code.
 * SQL counterparts live in drizzle/0011_blueprint_policy_constraints.sql
 */

export function claimHasAuthorityProof(claim: {
  authorityVerified?: boolean | null;
  evidenceUrl?: string | null;
  verificationPayload?: Record<string, unknown> | null;
}) {
  if (claim.authorityVerified) return true;
  if (claim.evidenceUrl?.trim()) return true;
  const payload = claim.verificationPayload;
  return Boolean(payload && Object.keys(payload).length > 0);
}

export function trustExplanationIsComplete(
  explanation: Record<string, unknown> | null | undefined,
) {
  if (!explanation) return false;
  return Object.keys(explanation).length > 0;
}
