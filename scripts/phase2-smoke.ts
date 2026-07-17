/**
 * Phase 2 mutation smoke — runtime store always; Neon path when DATABASE_URL is set.
 */
import "dotenv/config";
import {
  persistClaim,
  persistModeration,
  persistQuote,
  persistRequest,
  persistReview,
  persistSubscription,
  getRuntimeWallet,
  getRuntimeRequests,
  getWalletAsync,
  listRequestsAsync,
  getCompanyBySlugAsync,
} from "../src/lib/db/phase2";
import { getStore, resetStore } from "../src/lib/db/runtime-store";

async function main() {
  resetStore();
  const usingNeon = Boolean(process.env.DATABASE_URL);
  const startWallet = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };

  const rfq = await persistRequest({
    title: `Phase 2 smoke filler ${Date.now()}`,
    description: "Automated smoke RFQ",
    budgetMin: 10000,
    budgetMax: 20000,
    deliveryCountry: "Thailand",
    actor: "smoke@ratequip.com",
  });
  if (!rfq.ok) throw new Error(rfq.message);

  const afterRfq = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };
  if (afterRfq.balance !== startWallet.balance - 25) {
    throw new Error(
      `Expected credit debit 25, got ${startWallet.balance - afterRfq.balance}`,
    );
  }

  const quote = await persistQuote({
    requestId: rfq.id!,
    amount: 15000,
    leadTimeDays: 60,
    notes: "Smoke quote",
  });
  if (!quote.ok) throw new Error(quote.message);

  if (usingNeon) {
    const requests = await listRequestsAsync();
    const request = requests.find((r) => r.id === rfq.id);
    if (!request || request.quoteCount < 1) {
      throw new Error("Neon quote count not updated");
    }
  } else {
    const request = getRuntimeRequests().find((r) => r.id === rfq.id);
    if (!request || request.quoteCount < 1) {
      throw new Error("Quote count not updated");
    }
  }

  const review = await persistReview({
    companySlug: "nordicfill-systems",
    rating: 5,
    title: `Smoke review ${Date.now()}`,
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

  const company = usingNeon
    ? await getCompanyBySlugAsync("nordicfill-systems")
    : getStore().companies.find((c) => c.slug === "nordicfill-systems");
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

  const claimed = usingNeon
    ? await getCompanyBySlugAsync("harbor-heavy-freight")
    : getStore().companies.find((c) => c.slug === "harbor-heavy-freight");
  if (!claimed?.claimed || !claimed.verified) {
    throw new Error("Claim approve did not mark company claimed/verified");
  }

  const beforeSub = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };
  await persistSubscription({
    planCode: "buyer-premium",
    status: "active",
  });
  const afterSub = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };
  if (afterSub.balance < beforeSub.balance + 100) {
    throw new Error("Subscription bonus credits missing");
  }

  console.log("Phase 2 mutation smoke passed.", {
    neon: usingNeon,
    rfqId: rfq.id,
    balance: afterSub.balance,
    trustScore: company.trustScore,
    claimed: claimed.slug,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
