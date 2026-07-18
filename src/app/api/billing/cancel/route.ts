import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { billingAudiencePath, getPlanByCode } from "@/lib/billing/catalog";
import { cancelSubscription } from "@/lib/billing/operations";
import { getSubscriptionAsync } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

/**
 * Demo / fallback cancel. When Stripe is configured with a customer,
 * prefer Customer Portal (`/api/billing/portal`) which can cancel at period end.
 */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const jar = await cookies();
  const orgId = jar.get("rq_org_id")?.value;
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

  await cancelSubscription({ orgId });
  return NextResponse.redirect(
    new URL(`${returnPath}?canceled=1`, appUrl),
    303,
  );
}
