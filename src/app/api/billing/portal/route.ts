import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { billingAudiencePath, getPlanByCode } from "@/lib/billing/catalog";
import { getSubscriptionAsync } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
