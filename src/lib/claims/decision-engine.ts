import {
  maxOutcomeForRelationship,
  type ClaimOutcome,
  type ClaimRelationship,
  type ClaimVerificationPayload,
  type VerificationSignal,
} from "./types";

export type DecisionInput = {
  relationship: ClaimRelationship;
  verifiedSignals: VerificationSignal[];
  selectedSupportingCount: number;
  riskFlags: string[];
  companyAlreadyClaimed: boolean;
  hasExistingAdmins: boolean;
  competingOpenClaims: number;
};

function has(signals: VerificationSignal[], signal: VerificationSignal) {
  return signals.includes(signal);
}

function capOutcome(
  outcome: ClaimOutcome,
  relationship: ClaimRelationship,
): ClaimOutcome {
  const max = maxOutcomeForRelationship(relationship);
  if (outcome === "verified_controller" && max !== "verified_controller") {
    return "verified_representative";
  }
  return outcome;
}

/**
 * Deterministic claim access rules. AI may discover sources; this function alone decides access.
 */
export function decideClaimOutcome(input: DecisionInput): {
  outcome: ClaimOutcome;
  riskFlags: string[];
  reason: string;
} {
  const riskFlags = [...input.riskFlags];

  if (input.companyAlreadyClaimed && input.hasExistingAdmins) {
    riskFlags.push("existing_verified_admins");
  }
  if (input.competingOpenClaims > 0) {
    riskFlags.push("competing_open_claims");
  }

  const serious =
    riskFlags.includes("fraud_signal") ||
    riskFlags.includes("disposable_email") ||
    riskFlags.includes("domain_mismatch") ||
    (riskFlags.includes("existing_verified_admins") &&
      !has(input.verifiedSignals, "admin_approval") &&
      !has(input.verifiedSignals, "website_dns_control"));

  if (serious && input.companyAlreadyClaimed) {
    return {
      outcome: "blocked_conflict",
      riskFlags,
      reason: "Existing controller conflict or fraud signal",
    };
  }

  if (riskFlags.includes("fraud_signal") || riskFlags.includes("disposable_email")) {
    return {
      outcome: "blocked_conflict",
      riskFlags,
      reason: "Fraud or disposable identity signal",
    };
  }

  if (has(input.verifiedSignals, "website_dns_control")) {
    return {
      outcome: capOutcome("verified_controller", input.relationship),
      riskFlags,
      reason: "Website/DNS control verified",
    };
  }

  if (
    has(input.verifiedSignals, "director_registry") &&
    (has(input.verifiedSignals, "company_domain_email") ||
      has(input.verifiedSignals, "published_phone") ||
      has(input.verifiedSignals, "website_dns_control") ||
      has(input.verifiedSignals, "registration_match"))
  ) {
    return {
      outcome: capOutcome("verified_controller", input.relationship),
      riskFlags,
      reason: "Director identity plus second company-control signal",
    };
  }

  if (
    has(input.verifiedSignals, "company_domain_email") &&
    (has(input.verifiedSignals, "registration_match") ||
      input.verifiedSignals.includes("company_domain_email"))
  ) {
    // Email OTP + domain match is enough for representative (domain match implied by signal).
    return {
      outcome: capOutcome("verified_representative", input.relationship),
      riskFlags,
      reason: "Company-domain email verified",
    };
  }

  if (
    has(input.verifiedSignals, "published_phone") &&
    has(input.verifiedSignals, "registration_match") &&
    (has(input.verifiedSignals, "business_profile_match") ||
      input.selectedSupportingCount >= 1)
  ) {
    return {
      outcome: capOutcome("verified_representative", input.relationship),
      riskFlags,
      reason: "Published phone plus registration and corroboration",
    };
  }

  if (has(input.verifiedSignals, "admin_approval")) {
    return {
      outcome: capOutcome("verified_representative", input.relationship),
      riskFlags,
      reason: "Existing administrator approval",
    };
  }

  // Supporting public sources alone never grant ownership / full access.
  if (input.selectedSupportingCount >= 3) {
    return {
      outcome: "stronger_proof_required",
      riskFlags,
      reason: "Supporting sources only — stronger company-control method required",
    };
  }

  return {
    outcome: "stronger_proof_required",
    riskFlags,
    reason: "Insufficient automatic verification signals",
  };
}

export function buildVerificationPayload(input: {
  relationship: ClaimRelationship;
  method: ClaimVerificationPayload["method"];
  verifiedSignals: VerificationSignal[];
  selectedSourceIds: string[];
  workEmail?: string;
  matchResults?: ClaimVerificationPayload["matchResults"];
  riskFlags: string[];
  outcome: ClaimOutcome;
  discoveredSources?: ClaimVerificationPayload["discoveredSources"];
}): ClaimVerificationPayload {
  return {
    relationship: input.relationship,
    method: input.method,
    verifiedSignals: input.verifiedSignals,
    selectedSourceIds: input.selectedSourceIds,
    workEmail: input.workEmail,
    matchResults: input.matchResults ?? [],
    riskFlags: input.riskFlags,
    recommendedPermission: input.outcome,
    discoveredSources: input.discoveredSources,
  };
}
