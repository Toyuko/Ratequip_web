export const CLAIM_OUTCOMES = [
  "verified_representative",
  "verified_controller",
  "stronger_proof_required",
  "blocked_conflict",
] as const;

export type ClaimOutcome = (typeof CLAIM_OUTCOMES)[number];

/** Legacy statuses kept for older rows / moderation compatibility. */
export type LegacyClaimStatus = "pending" | "approved" | "rejected";

export type ClaimStatus = ClaimOutcome | LegacyClaimStatus;

export const CLAIM_RELATIONSHIPS = [
  "owner_director",
  "employee",
  "authorised_representative",
  "contractor",
  "other",
] as const;

export type ClaimRelationship = (typeof CLAIM_RELATIONSHIPS)[number];

export const CLAIM_METHODS = [
  "company_email",
  "admin_approval",
  "company_phone",
  "website_control",
  "business_profile",
  "director_registry",
  "supporting_sources",
] as const;

export type ClaimMethod = (typeof CLAIM_METHODS)[number];

export type VerificationSignal =
  | "company_domain_email"
  | "website_dns_control"
  | "published_phone"
  | "director_registry"
  | "admin_approval"
  | "business_profile_match"
  | "registration_match"
  | "supporting_public_source";

export type EvidenceStrength = "very_strong" | "strong" | "medium" | "supporting";

export type DiscoveredSource = {
  id: string;
  kind:
    | "website"
    | "email_domain"
    | "phone"
    | "abn"
    | "linkedin"
    | "google_business"
    | "alibaba"
    | "youtube"
    | "social"
    | "other";
  label: string;
  value: string;
  strength: EvidenceStrength;
  confidence: number;
};

export type ClaimVerificationPayload = {
  relationship: ClaimRelationship;
  method: ClaimMethod;
  verifiedSignals: VerificationSignal[];
  selectedSourceIds: string[];
  workEmail?: string;
  phoneLast4?: string;
  matchResults: Array<{
    sourceId: string;
    matched: boolean;
    detail: string;
  }>;
  riskFlags: string[];
  recommendedPermission: ClaimOutcome;
  discoveredSources?: DiscoveredSource[];
};

export function isVerifiedOutcome(
  status: string,
): status is "verified_representative" | "verified_controller" {
  return (
    status === "verified_representative" || status === "verified_controller"
  );
}

export function normalizeClaimStatus(status: string): ClaimStatus {
  if (status === "pending") return "stronger_proof_required";
  if (status === "approved") return "verified_controller";
  if (status === "rejected") return "blocked_conflict";
  if ((CLAIM_OUTCOMES as readonly string[]).includes(status)) {
    return status as ClaimOutcome;
  }
  return "stronger_proof_required";
}

export function outcomeCustomerMessage(
  outcome: ClaimOutcome,
  companyName: string,
): string {
  switch (outcome) {
    case "verified_representative":
      return `You’re verified to represent ${companyName}. You can manage the public profile. Ownership transfer and billing stay locked.`;
    case "verified_controller":
      return `You’re verified as a company controller for ${companyName}. You can manage the profile and administrators.`;
    case "stronger_proof_required":
      return `We couldn’t complete automatic verification for ${companyName} yet. Try a stronger method, or keep editing a draft profile (unpublished).`;
    case "blocked_conflict":
      return `This claim for ${companyName} is blocked due to a conflict or risk signal. Complete a stronger company-control check to continue.`;
  }
}

export function maxOutcomeForRelationship(
  relationship: ClaimRelationship,
): ClaimOutcome {
  if (relationship === "owner_director") return "verified_controller";
  if (relationship === "authorised_representative") {
    return "verified_controller";
  }
  return "verified_representative";
}
