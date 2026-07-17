/**
 * Phase 2 mutation smoke — runs against the runtime store (no HTTP server required).
 */
import {
  persistClaim,
  persistModeration,
  persistQuote,
  persistRequest,
  persistReview,
  persistSubscription,
  getRuntimeWallet,
  getRuntimeRequests,
} from "../src/lib/db/phase2";
import { getStore, resetStore } from "../src/lib/db/runtime-store";

async function main() {
  resetStore();
  const startBalance = getRuntimeWallet().balance;

  const rfq = await persistRequest({
    title: "Phase 2 smoke filler",
    description: "Automated smoke RFQ",
    budgetMin: 10000,
    budgetMax: 20000,
    deliveryCountry: "Thailand",
    actor: "smoke@ratequip.com",
  });
  if (!rfq.ok) throw new Error(rfq.message);

  const afterRfq = getRuntimeWallet().balance;
  if (afterRfq !== startBalance - 25) {
    throw new Error(`Expected credit debit 25, got ${startBalance - afterRfq}`);
  }

  const quote = await persistQuote({
    requestId: rfq.id!,
    amount: 15000,
    leadTimeDays: 60,
    notes: "Smoke quote",
  });
  if (!quote.ok) throw new Error(quote.message);

  const request = getRuntimeRequests().find((r) => r.id === rfq.id);
  if (!request || request.quoteCount < 1) {
    throw new Error("Quote count not updated");
  }

  const review = await persistReview({
    companySlug: "nordicfill-systems",
    rating: 5,
    title: "Smoke review",
    body: "Excellent",
    author: "smoke@ratequip.com",
    evidenceName: "po.pdf",
  });
  if (!review.ok) throw new Error(review.message);

  const mod = await persistModeration({
    entityType: "review",
    entityId: review.id!,
    decision: "approved",
  });
  if (!mod.ok) throw new Error(mod.message);

  const company = getStore().companies.find(
    (c) => c.slug === "nordicfill-systems",
  );
  if (!company || company.reviewCount < 1) {
    throw new Error("Trust/review count not updated after approve");
  }

  const claim = await persistClaim({
    companySlug: "harbor-heavy-freight",
    notes: "Smoke claim",
    claimant: "ops@harbor.example",
  });
  if (!claim.ok) throw new Error(claim.message);

  await persistModeration({
    entityType: "claim",
    entityId: claim.id!,
    decision: "approved",
  });
  const claimed = getStore().companies.find(
    (c) => c.slug === "harbor-heavy-freight",
  );
  if (!claimed?.claimed || !claimed.verified) {
    throw new Error("Claim approve did not mark company claimed/verified");
  }

  await persistSubscription({
    planCode: "buyer-premium",
    status: "active",
  });
  if (getRuntimeWallet().balance < afterRfq + 100) {
    throw new Error("Subscription bonus credits missing");
  }

  console.log("Phase 2 mutation smoke passed.");
  console.log({
    rfqId: rfq.id,
    balance: getRuntimeWallet().balance,
    trustScore: company.trustScore,
    claimed: claimed.slug,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
