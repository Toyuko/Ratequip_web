export type TrustInputs = {
  avgRating: number;
  reviewCount: number;
  verifiedReviewShare: number;
  verifiedCompany: boolean;
  claimedCompany: boolean;
  responseRate: number;
};

/** Basic explainable Trust Score (0–100). Not ML — weighted heuristics for MVP. */
export function calculateTrustScore(input: TrustInputs) {
  const reviewComponent =
    Math.min(input.avgRating / 5, 1) * 40 +
    Math.min(input.reviewCount / 30, 1) * 15 +
    input.verifiedReviewShare * 10;

  const verificationComponent =
    (input.verifiedCompany ? 15 : 0) + (input.claimedCompany ? 10 : 0);

  const activityComponent = Math.min(input.responseRate, 1) * 10;

  const score = Math.round(
    (reviewComponent + verificationComponent + activityComponent) * 10,
  ) / 10;

  return {
    score: Math.min(100, Math.max(0, score)),
    reviewComponent: Math.round(reviewComponent * 10) / 10,
    verificationComponent,
    activityComponent: Math.round(activityComponent * 10) / 10,
    explanation: {
      avgRating: input.avgRating,
      reviewCount: input.reviewCount,
      verifiedReviewShare: input.verifiedReviewShare,
      verifiedCompany: input.verifiedCompany ? 1 : 0,
      claimedCompany: input.claimedCompany ? 1 : 0,
      responseRate: input.responseRate,
    },
  };
}
