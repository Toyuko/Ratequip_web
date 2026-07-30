/**
 * Create RateQuip Stripe products/prices (Test or Live — matches STRIPE_SECRET_KEY mode)
 * and print env vars to paste into .env.local / Vercel.
 *
 * Usage:
 *   STRIPE_SECRET_KEY=sk_test_... npx tsx scripts/stripe-setup-local.ts
 *   # or with .env.local loaded:
 *   npm run stripe:setup
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import Stripe from "stripe";
import { creditPacks } from "../src/lib/billing/catalog";
import { demoPlans } from "../src/lib/db/demo-data";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY (prefer sk_test_... for local UAT).");
  process.exit(1);
}

const stripe = new Stripe(key);
const mode = key.startsWith("sk_live") || key.startsWith("rk_live") ? "live" : "test";

const paidPlans = demoPlans.filter((p) => p.priceMonthly > 0);

type Created = { code: string; envKey: string; priceId: string; productId: string };

async function ensurePlan(plan: (typeof paidPlans)[number]): Promise<Created> {
  const existing = await stripe.products.search({
    query: `metadata['code']:'${plan.code}' AND active:'true'`,
    limit: 1,
  });
  let product = existing.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: `RateQuip ${plan.name}`,
      description: plan.features[0],
      metadata: { code: plan.code },
      default_price_data: {
        currency: "usd",
        unit_amount: Math.round(plan.priceMonthly * 100),
        recurring: { interval: "month" },
      },
    });
  }

  const priceId =
    typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id;

  if (!priceId) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: Math.round(plan.priceMonthly * 100),
      recurring: { interval: "month" },
      metadata: { code: plan.code },
    });
    await stripe.products.update(product.id, { default_price: price.id });
    return {
      code: plan.code,
      envKey: envKeyForPlan(plan.code),
      priceId: price.id,
      productId: product.id,
    };
  }

  return {
    code: plan.code,
    envKey: envKeyForPlan(plan.code),
    priceId,
    productId: product.id,
  };
}

async function ensurePack(pack: (typeof creditPacks)[number]): Promise<Created> {
  const existing = await stripe.products.search({
    query: `metadata['code']:'${pack.code}' AND active:'true'`,
    limit: 1,
  });
  let product = existing.data[0];
  if (!product) {
    product = await stripe.products.create({
      name: `RateQuip ${pack.name}`,
      description: `${pack.credits} credits`,
      metadata: { code: pack.code, credits: String(pack.credits) },
      default_price_data: {
        currency: "usd",
        unit_amount: Math.round(pack.priceUsd * 100),
      },
    });
  }

  const priceId =
    typeof product.default_price === "string"
      ? product.default_price
      : product.default_price?.id;

  if (!priceId) {
    const price = await stripe.prices.create({
      product: product.id,
      currency: "usd",
      unit_amount: Math.round(pack.priceUsd * 100),
      metadata: { code: pack.code },
    });
    await stripe.products.update(product.id, { default_price: price.id });
    return {
      code: pack.code,
      envKey: envKeyForPack(pack.code),
      priceId: price.id,
      productId: product.id,
    };
  }

  return {
    code: pack.code,
    envKey: envKeyForPack(pack.code),
    priceId,
    productId: product.id,
  };
}

function envKeyForPlan(code: string) {
  const map: Record<string, string> = {
    "buyer-premium": "STRIPE_PRICE_BUYER_PREMIUM",
    "supplier-silver": "STRIPE_PRICE_SUPPLIER_SILVER",
    "supplier-gold": "STRIPE_PRICE_SUPPLIER_GOLD",
    "supplier-platinum": "STRIPE_PRICE_SUPPLIER_PLATINUM",
  };
  return map[code] ?? `STRIPE_PRICE_${code.toUpperCase().replace(/-/g, "_")}`;
}

function envKeyForPack(code: string) {
  const map: Record<string, string> = {
    "credits-100": "STRIPE_PRICE_CREDITS_100",
    "credits-500": "STRIPE_PRICE_CREDITS_500",
    "credits-2000": "STRIPE_PRICE_CREDITS_2000",
  };
  return map[code] ?? `STRIPE_PRICE_${code.toUpperCase().replace(/-/g, "_")}`;
}

async function main() {
  console.log(`Stripe mode: ${mode}`);
  if (mode === "live") {
    console.warn(
      "WARNING: Using LIVE key. Prefer sk_test_... for local UAT.",
    );
  }

  const created: Created[] = [];
  for (const plan of paidPlans) {
    const row = await ensurePlan(plan);
    created.push(row);
    console.log(`plan ${plan.code} → ${row.priceId}`);
  }
  for (const pack of creditPacks) {
    const row = await ensurePack(pack);
    created.push(row);
    console.log(`pack ${pack.code} → ${row.priceId}`);
  }

  console.log("\n# Paste into .env.local (and Vercel):\n");
  for (const row of created) {
    console.log(`${row.envKey}=${row.priceId}`);
  }
  console.log(`\n# Webhook (local):\n# stripe listen --forward-to localhost:3000/api/webhooks/stripe`);
  console.log(`# Then set STRIPE_WEBHOOK_SECRET=whsec_... from the CLI output`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
