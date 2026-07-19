import type {
  IntelligenceRecommendation,
  RequirementCandidate,
} from "@/lib/v12/intelligence/types";

/** Explicit requirements must carry evidence (Feature 142 / classification policy). */
export function assertEvidenceLinked(candidate: RequirementCandidate): void {
  if (
    candidate.classification === "explicit_requirement" &&
    candidate.evidence.length === 0
  ) {
    throw new Error("EXPLICIT_REQUIREMENT_REQUIRES_EVIDENCE");
  }
  if (candidate.confidence < 0 || candidate.confidence > 1) {
    throw new Error("INVALID_CONFIDENCE");
  }
}

/** Never auto-publish commercial-only or insufficient information. */
export function canEnterPublishedScope(
  rec: Pick<
    IntelligenceRecommendation,
    "buyerConfirmationStatus" | "classification"
  >,
): boolean {
  return (
    rec.buyerConfirmationStatus === "approved" &&
    rec.classification !== "commercial_opportunity_only" &&
    rec.classification !== "insufficient_information" &&
    rec.classification !== "out_of_scope"
  );
}

export function readinessScore(input: {
  requirements: RequirementCandidate[];
  openGaps: number;
  unansweredBlockingQuestions: number;
}) {
  const confirmed = input.requirements.filter(
    (r) => r.reviewerStatus === "confirmed",
  ).length;
  const pending = input.requirements.filter(
    (r) => r.reviewerStatus === "pending",
  ).length;
  const total = Math.max(1, input.requirements.length);
  const base = (confirmed / total) * 100;
  const penalty =
    pending * 2 +
    input.openGaps * 4 +
    input.unansweredBlockingQuestions * 6;
  return Math.max(0, Math.min(100, Math.round(base - penalty)));
}
