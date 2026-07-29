/**
 * Phase 2 mutation smoke — runtime store always; Neon path when DATABASE_URL is set.
 */
import "dotenv/config";
import {
  cancelSubscription,
  purchaseCreditPack,
} from "../src/lib/billing/operations";
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
    currency: "USD",
    taxTreatment: "inclusive",
    quoteValidityDays: 30,
    deliveryCountry: "Thailand",
    deliveryCity: "Bangkok",
    dueDate: "2099-12-31",
    items: [
      {
        productName: "Smoke filler unit",
        productCode: "SMK-1",
        quantity: 1,
        oemOnly: true,
      },
    ],
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
    deliveryPeriodDays: 75,
    stockAvailability: "in_stock",
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
  if (afterSub.balance !== beforeSub.balance + 100) {
    throw new Error(
      `Expected +100 premium credits, got delta ${afterSub.balance - beforeSub.balance}`,
    );
  }

  await persistSubscription({
    planCode: "buyer-premium",
    status: "active",
  });
  const afterSecond = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };
  if (afterSecond.balance !== afterSub.balance) {
    throw new Error(
      `Double-grant detected: balance moved from ${afterSub.balance} to ${afterSecond.balance}`,
    );
  }

  const beforePack = afterSecond.balance;
  const pack = await purchaseCreditPack({ packCode: "credits-100" });
  if (!pack.ok) throw new Error(pack.message);
  const afterPack = usingNeon
    ? await getWalletAsync()
    : { balance: getRuntimeWallet().balance };
  if (afterPack.balance < beforePack + 100) {
    throw new Error("Credit pack grant missing");
  }

  await cancelSubscription();
  // After cancel, free-tier monthly cap applies again (1 RFQ already created above).
  const blocked = await persistRequest({
    title: `Free tier block ${Date.now()}`,
    description:
      "Should be blocked by free-tier monthly RFQ limit after cancel returns buyer to free plan.",
    budgetMin: 1000,
    budgetMax: 2000,
    currency: "USD",
    taxTreatment: "inclusive",
    quoteValidityDays: 30,
    deliveryCountry: "Thailand",
    actor: "smoke@ratequip.com",
  });
  if (blocked.ok) {
    throw new Error("Expected free-tier monthly RFQ limit to block second RFQ");
  }

  const { refundCredits, reconcileCreditLedger } = await import(
    "../src/lib/billing/operations"
  );
  const { persistReviewResponse, persistReviewAppeal, updateRequestFields } =
    await import("../src/lib/db/phase2");
  const { ensureSubmission, getSubmission } = await import(
    "../src/lib/organic-growth/store"
  );
  const { validateRfqContent } = await import("../src/lib/rfq/validation");

  const junk = validateRfqContent({
    title: "x",
    description: "nope",
    budgetMin: 9e15,
    budgetMax: 1,
  });
  if (!junk) throw new Error("Expected RFQ validation to reject junk payload");

  const draftId = `sub-smoke-${Date.now()}`;
  ensureSubmission({
    id: draftId,
    companyName: "Smoke Co",
    status: "details_complete",
    companyTypes: ["supplier"],
    categories: ["packaging-machinery"],
    conflictDeclared: false,
    disclosurePreference: "anonymous_ratequip_user",
    declarationsAccepted: false,
    skipContacts: true,
    skipReview: true,
    contacts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    idempotencyKey: `idem-${draftId}`,
  });
  if (!getSubmission(draftId)) {
    throw new Error("OG submission upsert recovery failed");
  }

  const openRfq = await persistRequest({
    title: `Smoke revise target ${Date.now()}`,
    description:
      "Open RFQ used to prove edit/revise path after free-tier premium reactivation.",
    budgetMin: 5000,
    budgetMax: 8000,
    currency: "USD",
    taxTreatment: "inclusive",
    quoteValidityDays: 30,
    deliveryCountry: "Thailand",
    actor: "smoke@ratequip.com",
  });
  // May be blocked on free tier — activate premium again for revise path.
  await persistSubscription({
    planCode: "buyer-premium",
    status: "active",
  });
  const reviseTarget = openRfq.ok
    ? openRfq
    : await persistRequest({
        title: `Smoke revise target ${Date.now()}`,
        description:
          "Open RFQ used to prove edit/revise path after free-tier premium reactivation.",
        budgetMin: 5000,
        budgetMax: 8000,
        currency: "USD",
        taxTreatment: "inclusive",
        quoteValidityDays: 30,
        deliveryCountry: "Thailand",
        actor: "smoke@ratequip.com",
      });
  if (!reviseTarget.ok || !reviseTarget.id) {
    throw new Error(reviseTarget.ok ? "missing id" : reviseTarget.message);
  }
  const revised = await updateRequestFields({
    requestId: reviseTarget.id,
    title: "Smoke revised RFQ title ok",
    description:
      "Revised description with enough detail for suppliers to quote accurately.",
    budgetMin: 5500,
    budgetMax: 9000,
    currency: "USD",
    deliveryCountry: "Thailand",
    actor: "smoke@ratequip.com",
  });
  if (!revised.ok) throw new Error(revised.message);

  const response = await persistReviewResponse({
    reviewId: review.id!,
    body: "Supplier thanks the reviewer for the detailed smoke feedback.",
    actor: "ops@nordicfill.example",
  });
  if (!response.ok) throw new Error(response.message);

  const appeal = await persistReviewAppeal({
    reviewId: review.id!,
    reason: "Smoke appeal requesting re-moderation of factual claim.",
    actor: "smoke@ratequip.com",
  });
  if (!appeal.ok) throw new Error(appeal.message);

  const beforeRefund = usingNeon
    ? (await getWalletAsync()).balance
    : getRuntimeWallet().balance;
  const refund = await refundCredits({
    amount: 10,
    reason: "Smoke refund adjustment",
  });
  if (!refund.ok) throw new Error(refund.message);
  const afterRefund = usingNeon
    ? (await getWalletAsync()).balance
    : getRuntimeWallet().balance;
  if (afterRefund !== beforeRefund + 10) {
    throw new Error("Refund did not credit wallet");
  }

  const reconciliation = await reconcileCreditLedger();
  if (!reconciliation.ok || !reconciliation.balanced) {
    throw new Error("Ledger reconciliation failed");
  }

  console.log("Phase 2 mutation smoke passed.", {
    neon: usingNeon,
    rfqId: rfq.id,
    balance: afterRefund,
    trustScore: company.trustScore,
    claimed: claimed.slug,
    freeTierBlocked: blocked.message,
    revised: reviseTarget.id,
    reconciliation: {
      balance: reconciliation.balance,
      ledgerSum: reconciliation.ledgerSum,
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
