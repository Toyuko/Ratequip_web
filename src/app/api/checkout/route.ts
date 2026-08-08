import { NextRequest, NextResponse } from "next/server";
import {
  billingAudiencePath,
  getCreditPackByCode,
  getPlanByCode,
} from "@/lib/billing/catalog";
import { resolveBillingSession } from "@/lib/billing/session";
import { purchaseCreditPack } from "@/lib/billing/operations";
import { isDemoMode } from "@/lib/config";
import { creditPackPriceEnvMap, getStripe, planPriceEnvMap } from "@/lib/stripe";

function integrationId(kind: "plan" | "pack") {
  const suffix = Math.random().toString(36).slice(2, 10);
  return `ratequip_${kind}_${suffix}`;
}

export async function GET(req: NextRequest) {
  const gate = await resolveBillingSession();
  if (!gate.ok) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(
      new URL(
        `/sign-in?redirect_url=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`,
        appUrl,
      ),
      303,
    );
  }

  const packCode = req.nextUrl.searchParams.get("pack");
  const planCode = req.nextUrl.searchParams.get("plan") ?? "buyer-premium";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { orgId, email, role } = gate;
  const defaultBilling =
    role === "supplier"
      ? "/dashboard/supplier/billing"
      : "/dashboard/buyer/billing";

  if (packCode) {
    return checkoutCreditPack(packCode, appUrl, orgId, email, defaultBilling);
  }

  const plan = getPlanByCode(planCode);
  if (!plan) {
    return NextResponse.json(
      { error: `Unknown plan: ${planCode}` },
      { status: 400 },
    );
  }

  const billingPath = billingAudiencePath(plan.audience);

  if (plan.priceMonthly === 0) {
    return NextResponse.redirect(
      new URL(`/sign-up?plan=${plan.code}`, appUrl),
      303,
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    // Demo grants only when explicit demo mode — never mint in production.
    if (!isDemoMode()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Checkout unavailable." },
        { status: 503 },
      );
    }
    const { persistSubscription } = await import("@/lib/db/phase2");
    await persistSubscription({
      planCode: plan.code,
      status: "active",
      orgId,
    });
    return NextResponse.redirect(
      new URL(`${billingPath}?checkout=demo&plan=${plan.code}`, appUrl),
      303,
    );
  }

  const priceId = planPriceEnvMap[plan.code];
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price for plan ${plan.code}` },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}${billingPath}?success=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
    ...(email ? { customer_email: email } : {}),
    ...(orgId ? { client_reference_id: orgId } : {}),
    integration_identifier: integrationId("plan"),
    metadata: {
      kind: "subscription",
      plan: plan.code,
      ...(orgId ? { orgId } : {}),
    },
    subscription_data: {
      metadata: {
        plan: plan.code,
        ...(orgId ? { orgId } : {}),
      },
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}

async function checkoutCreditPack(
  packCode: string,
  appUrl: string,
  orgId: string | undefined,
  email: string | undefined,
  billingPath: string,
) {
  const pack = getCreditPackByCode(packCode);
  if (!pack) {
    return NextResponse.json(
      { error: `Unknown credit pack: ${packCode}` },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  if (!stripe) {
    if (!isDemoMode()) {
      return NextResponse.json(
        { error: "Stripe is not configured. Checkout unavailable." },
        { status: 503 },
      );
    }
    await purchaseCreditPack({ packCode: pack.code, orgId });
    if (orgId) {
      try {
        const { processReferralRewardForOrganisation } = await import(
          "@/lib/referrals/reward-engine"
        );
        await processReferralRewardForOrganisation({
          event: "paying_customer",
          organisationId: orgId,
          allowDemoFallback: true,
        });
      } catch (error) {
        console.warn("[checkout] paying_customer reward failed", error);
      }
    }
    return NextResponse.redirect(
      new URL(
        `${billingPath}?pack=demo&credits=${pack.credits}`,
        appUrl,
      ),
      303,
    );
  }

  const priceId = creditPackPriceEnvMap[pack.code];
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price for pack ${pack.code}` },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}${billingPath}?pack=success&credits=${pack.credits}`,
    cancel_url: `${appUrl}${billingPath}?pack=canceled`,
    ...(email ? { customer_email: email } : {}),
    ...(orgId ? { client_reference_id: orgId } : {}),
    integration_identifier: integrationId("pack"),
    metadata: {
      kind: "credit_pack",
      pack: pack.code,
      credits: String(pack.credits),
      ...(orgId ? { orgId } : {}),
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}
