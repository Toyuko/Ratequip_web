import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { billingAudiencePath, getPlanByCode } from "@/lib/billing/catalog";
import { hasClerk, isDemoMode } from "@/lib/config";
import { getSubscriptionAsync } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

async function requireBillingSession() {
  if (hasClerk()) {
    try {
      const session = await auth();
      if (!session.userId) {
        return { ok: false as const };
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const };
    }
  }
  if (!isDemoMode()) return { ok: false as const };
  const jar = await cookies();
  if (jar.get("rq_onboarded")?.value !== "1" && !jar.get("rq_email")?.value) {
    return { ok: false as const };
  }
  return { ok: true as const };
}

export async function GET(_req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const gate = await requireBillingSession();
  if (!gate.ok) {
    return NextResponse.redirect(new URL("/sign-in", appUrl), 303);
  }

  const jar = await cookies();
  const orgId = jar.get("rq_org_id")?.value;
  const subscription = await getSubscriptionAsync(orgId);
  const plan = getPlanByCode(subscription?.planCode ?? "buyer-premium");
  const returnPath = billingAudiencePath(plan?.audience ?? "buyer");

  const stripe = getStripe();
  const customerId = subscription?.stripeCustomerId;

  if (!stripe || !customerId) {
    return NextResponse.redirect(
      new URL(
        `${returnPath}?portal=demo&hint=use-cancel`,
        appUrl,
      ),
      303,
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}${returnPath}`,
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to open Stripe Customer Portal" },
      { status: 500 },
    );
  }

  return NextResponse.redirect(session.url, 303);
}
