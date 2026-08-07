import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { billingAudiencePath, getPlanByCode } from "@/lib/billing/catalog";
import { resolveBillingSession } from "@/lib/billing/session";
import { getSubscriptionAsync } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const gate = await resolveBillingSession();
  if (!gate.ok) {
    return apiResponse(req, err(gate.message, 401));
  }

  const { orgId } = gate;
  const subscription = orgId ? await getSubscriptionAsync(orgId) : null;
  const plan = getPlanByCode(subscription?.planCode ?? "buyer-premium");
  const returnPath = billingAudiencePath(plan?.audience ?? "buyer");

  const stripe = getStripe();
  const customerId = subscription?.stripeCustomerId;

  if (!stripe || !customerId) {
    return apiResponse(
      req,
      ok({
        url: `${appUrl}${returnPath}?portal=demo&hint=use-cancel`,
        demo: true,
      }),
    );
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}${returnPath}`,
  });

  if (!session.url) {
    return apiResponse(req, err("Unable to open Stripe Customer Portal", 500));
  }

  return apiResponse(req, ok({ url: session.url, demo: false }));
}
