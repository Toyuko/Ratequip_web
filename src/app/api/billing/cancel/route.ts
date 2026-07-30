import { NextRequest, NextResponse } from "next/server";
import { billingAudiencePath, getPlanByCode } from "@/lib/billing/catalog";
import { cancelSubscription } from "@/lib/billing/operations";
import { resolveBillingSession } from "@/lib/billing/session";
import { isDemoMode } from "@/lib/config";
import { getSubscriptionAsync } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

/**
 * Cancel subscription. Prefer Customer Portal when Stripe is configured.
 * Auth required. POST preferred; GET kept for existing UI links but auth-gated.
 */
async function handleCancel() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const gate = await resolveBillingSession();
  if (!gate.ok) {
    return NextResponse.redirect(new URL("/sign-in", appUrl), 303);
  }

  const { orgId } = gate;
  const subscription = await getSubscriptionAsync(orgId);
  const plan = getPlanByCode(subscription?.planCode ?? "buyer-premium");
  const returnPath = billingAudiencePath(plan?.audience ?? "buyer");

  const stripe = getStripe();
  if (stripe && subscription?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      await cancelSubscription({ orgId });
      return NextResponse.redirect(
        new URL(`${returnPath}?canceled=1&at_period_end=1`, appUrl),
        303,
      );
    } catch (error) {
      console.warn("[billing] stripe cancel failed", error);
    }
  }

  if (!isDemoMode() && !subscription?.stripeSubscriptionId) {
    return NextResponse.redirect(
      new URL(`${returnPath}?canceled=0&error=no_subscription`, appUrl),
      303,
    );
  }

  await cancelSubscription({ orgId });
  return NextResponse.redirect(
    new URL(`${returnPath}?canceled=1`, appUrl),
    303,
  );
}

export async function GET(_req: NextRequest) {
  return handleCancel();
}

export async function POST(_req: NextRequest) {
  return handleCancel();
}
