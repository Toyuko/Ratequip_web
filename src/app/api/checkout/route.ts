import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  billingAudiencePath,
  getCreditPackByCode,
  getPlanByCode,
} from "@/lib/billing/catalog";
import { purchaseCreditPack } from "@/lib/billing/operations";
import { creditPackPriceEnvMap, getStripe, planPriceEnvMap } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const packCode = req.nextUrl.searchParams.get("pack");
  const planCode = req.nextUrl.searchParams.get("plan") ?? "buyer-premium";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const jar = await cookies();
  const orgId = jar.get("rq_org_id")?.value;
  const role = jar.get("rq_role")?.value;
  const defaultBilling =
    role === "supplier"
      ? "/dashboard/supplier/billing"
      : "/dashboard/buyer/billing";

  if (packCode) {
    return checkoutCreditPack(packCode, appUrl, orgId, defaultBilling);
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
    await purchaseCreditPack({ packCode: pack.code, orgId });
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
