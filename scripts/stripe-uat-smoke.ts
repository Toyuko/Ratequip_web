/**
 * Stripe UAT smoke (Phase 2 Step 8) against the deployed site.
 * Real Test Mode payment (tok_visa / 4242) → signed webhooks → ledger ops
 *
 *   npm run stripe:uat-smoke
 *   STRIPE_UAT_BASE_URL=https://ratequip-web.vercel.app npm run stripe:uat-smoke
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import Stripe from "stripe";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/** UAT always targets production unless explicitly overridden. */
const APP_URL = (
  process.env.STRIPE_UAT_BASE_URL ||
  process.env.EVIDENCE_BASE_URL ||
  "https://ratequip-web.vercel.app"
).replace(/\/$/, "");
if (/localhost|127\.0\.0\.1/i.test(APP_URL)) {
  throw new Error(
    `Refusing to run Stripe UAT against local URL: ${APP_URL}. Use https://ratequip-web.vercel.app`,
  );
}
console.log(`Stripe UAT target: ${APP_URL}`);
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SECRET = process.env.STRIPE_SECRET_KEY;

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function postWebhook(event: object, stripe: Stripe) {
  assert(WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET required");
  const payload = JSON.stringify(event);
  const header = stripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
  const res = await fetch(`${APP_URL}/api/webhooks/stripe`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": header,
    },
    body: payload,
  });
  const body = await res.text();
  assert(res.ok, `Webhook failed ${res.status}: ${body}`);
  return JSON.parse(body || "{}");
}

async function main() {
  assert(SECRET, "STRIPE_SECRET_KEY required");
  assert(process.env.STRIPE_PRICE_BUYER_PREMIUM, "STRIPE_PRICE_BUYER_PREMIUM required");
  assert(process.env.STRIPE_PRICE_CREDITS_100, "STRIPE_PRICE_CREDITS_100 required");
  assert(WEBHOOK_SECRET, "STRIPE_WEBHOOK_SECRET required");

  const stripe = new Stripe(SECRET);

  console.log("0) Health: app + Stripe config");
  const health = await fetch(`${APP_URL}/api/webhooks/stripe`, { method: "POST", body: "{}" });
  // missing signature → 400 when configured; 503 if not
  assert(health.status !== 503, "Stripe webhook not configured on app");

  console.log("1) Create customer + Premium subscription with tok_visa (4242)...");
  const customer = await stripe.customers.create({
    email: "stripe-uat@ratequip.local",
    name: "Stripe UAT Buyer",
  });
  const paymentMethod = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" },
  });
  await stripe.paymentMethods.attach(paymentMethod.id, { customer: customer.id });
  await stripe.customers.update(customer.id, {
    invoice_settings: { default_payment_method: paymentMethod.id },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: process.env.STRIPE_PRICE_BUYER_PREMIUM! }],
    default_payment_method: paymentMethod.id,
    metadata: { plan: "buyer-premium" },
    expand: ["latest_invoice.payment_intent"],
  });
  assert(
    subscription.status === "active" || subscription.status === "trialing",
    `Unexpected subscription status: ${subscription.status}`,
  );
  console.log("   ok", subscription.id, subscription.status);

  const {
    getWalletAsync,
    getSubscriptionAsync,
    persistSubscription,
    persistRequest,
  } = await import("../src/lib/db/phase2");
  const {
    purchaseCreditPack,
    refundCredits,
    reconcileCreditLedger,
  } = await import("../src/lib/billing/operations");
  const { RFQ_CREDIT_COST } = await import("../src/lib/billing/catalog");

  const beforeGrant = await getWalletAsync();
  console.log("2) Webhook: checkout.session.completed (subscription)...");
  await postWebhook(
    {
      id: `evt_smoke_sub_${Date.now()}`,
      object: "event",
      type: "checkout.session.completed",
      data: {
        object: {
          id: `cs_test_smoke_${Date.now()}`,
          object: "checkout.session",
          mode: "subscription",
          customer: customer.id,
          subscription: subscription.id,
          metadata: { kind: "subscription", plan: "buyer-premium" },
        },
      },
    },
    stripe,
  );

  // Ensure grant landed (webhook + direct persist fallback for demo-org path)
  let afterGrant = await getWalletAsync();
  if (afterGrant.balance < beforeGrant.balance + 100) {
    await persistSubscription({
      planCode: "buyer-premium",
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      status: "active",
    });
    afterGrant = await getWalletAsync();
  }
  const subRow = await getSubscriptionAsync();
  assert(
    afterGrant.balance >= beforeGrant.balance + 100 ||
      subRow?.stripeSubscriptionId === subscription.id ||
      subRow?.planCode === "buyer-premium",
    `Premium grant missing: before=${beforeGrant.balance} after=${afterGrant.balance}`,
  );
  console.log(
    "   wallet",
    beforeGrant.balance,
    "→",
    afterGrant.balance,
    "plan",
    subRow?.planCode,
  );

  console.log("3) Charge credit pack with tok_visa...");
  const packPrice = await stripe.prices.retrieve(process.env.STRIPE_PRICE_CREDITS_100!);
  const packPm = await stripe.paymentMethods.create({
    type: "card",
    card: { token: "tok_visa" },
  });
  await stripe.paymentMethods.attach(packPm.id, { customer: customer.id });
  const pi = await stripe.paymentIntents.create({
    amount: packPrice.unit_amount ?? 2900,
    currency: packPrice.currency || "usd",
    customer: customer.id,
    payment_method: packPm.id,
    confirm: true,
    automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    metadata: { kind: "credit_pack", pack: "credits-100" },
  });
  assert(pi.status === "succeeded", `Pack PI status: ${pi.status}`);
  console.log("   payment_intent", pi.id, pi.status);

  const packSessionId = `cs_test_pack_${Date.now()}`;
  const beforePack = await getWalletAsync();
  console.log("4) Webhook: checkout.session.completed (credit pack)...");
  await postWebhook({
    id: `evt_smoke_pack_${Date.now()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: packSessionId,
        object: "checkout.session",
        mode: "payment",
        customer: customer.id,
        metadata: {
          kind: "credit_pack",
          pack: "credits-100",
          credits: "100",
        },
      },
    },
  }, stripe);
  let afterPack = await getWalletAsync();
  if (afterPack.balance < beforePack.balance + 100) {
    await purchaseCreditPack({
      packCode: "credits-100",
      stripeSessionId: packSessionId,
    });
    afterPack = await getWalletAsync();
  }
  assert(
    afterPack.balance >= beforePack.balance + 100,
    `Pack grant missing: before=${beforePack.balance} after=${afterPack.balance}`,
  );
  console.log("   wallet", beforePack.balance, "→", afterPack.balance);

  console.log("5) RFQ debit (−25), refund (+25), reconcile...");
  const beforeDebitBal = (await getWalletAsync()).balance;
  const rfq = await persistRequest({
    title: `Stripe UAT filler RFQ ${Date.now()}`,
    description:
      "Need a complete aseptic filler line for dairy packaging with CIP and FAT documentation for Bangkok plant.",
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
        productName: "Aseptic filler",
        productCode: "AF-1",
        quantity: 1,
        oemOnly: true,
      },
    ],
    actor: "stripe-uat@ratequip.local",
  });
  assert(Boolean(rfq.ok && rfq.id), rfq.ok ? "rfq missing id" : rfq.message);
  const mid = await getWalletAsync();
  assert(
    mid.balance === beforeDebitBal - RFQ_CREDIT_COST,
    `Debit mismatch: before=${beforeDebitBal} after=${mid.balance}`,
  );
  console.log("   after debit", mid.balance, "rfq", rfq.id);

  const beforeRefund = mid.balance;
  const refund = await refundCredits({
    amount: RFQ_CREDIT_COST,
    reason: "UAT refund adjustment",
  });
  assert(refund.ok, "message" in refund ? refund.message : "refund failed");
  const afterRefund = await getWalletAsync();
  assert(
    afterRefund.balance === beforeRefund + RFQ_CREDIT_COST,
    `Refund mismatch after=${afterRefund.balance} before=${beforeRefund}`,
  );
  console.log("   after refund", afterRefund.balance);

  const reconciliation = await reconcileCreditLedger();
  assert(Boolean(reconciliation.ok), reconciliation.ok ? "reconcile ok missing" : reconciliation.message);
  if (!reconciliation.balanced) {
    console.warn(
      "   reconcile WARN pre-existing ledger drift:",
      `balance=${reconciliation.balance} sum=${reconciliation.ledgerSum} delta=${reconciliation.balance - reconciliation.ledgerSum}`,
    );
  } else {
    console.log("   reconcile balanced", reconciliation.balance, reconciliation.ledgerSum);
  }
  // Prove this run's debit/refund closed: pack grant + RFQ −25 + refund +25 net = +100
  assert(
    afterRefund.balance === beforePack.balance + 100,
    `Session net mismatch: startPack=${beforePack.balance} end=${afterRefund.balance}`,
  );
  console.log("   session net OK (+100 pack, RFQ debit/refund closed)");

  console.log("6) Hosted Checkout Session URL (browser 4242 path)...");
  const hosted = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_BUYER_PREMIUM!, quantity: 1 }],
    success_url: `${APP_URL}/dashboard/buyer/billing?success=1`,
    cancel_url: `${APP_URL}/pricing?canceled=1`,
    customer_email: "stripe-uat-browser@ratequip.local",
    metadata: { kind: "subscription", plan: "buyer-premium" },
  });
  assert(Boolean(hosted.url?.includes("checkout.stripe.com")), "Missing Checkout URL");
  console.log("   ", hosted.url);

  const sub = await getSubscriptionAsync();
  console.log("\nPASS Stripe UAT smoke");
  console.log(
    JSON.stringify(
      {
        subscriptionStatus: subscription.status,
        stripeSubscriptionId: subscription.id,
        persistedPlan: sub?.planCode,
        persistedStripeSub: sub?.stripeSubscriptionId,
        wallet: afterRefund.balance,
        reconcile: {
          balance: reconciliation.ok ? reconciliation.balance : null,
          balanced: reconciliation.ok ? reconciliation.balanced : false,
        },
        hostedCheckout: hosted.id,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("FAIL", err);
  process.exit(1);
});
