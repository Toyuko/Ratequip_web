import { calculateTrustScore } from "../src/lib/trust-score";

const result = calculateTrustScore({
  avgRating: 4.8,
  reviewCount: 28,
  verifiedReviewShare: 0.9,
  verifiedCompany: true,
  claimedCompany: true,
  responseRate: 0.85,
});

if (result.score < 70 || result.score > 100) {
  console.error("Trust score out of expected range", result);
  process.exit(1);
}

console.log("Trust score OK:", result.score);
