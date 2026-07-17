import { NextRequest, NextResponse } from "next/server";
import { getStripe, planPriceEnvMap } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan") ?? "buyer-premium";
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    const { persistSubscription } = await import("@/lib/db/phase2");
    await persistSubscription({
      planCode: plan,
      status: "active",
    });
    return NextResponse.redirect(
      new URL(`/dashboard/buyer/billing?checkout=demo&plan=${plan}`, appUrl),
      303,
    );
  }

  const priceId = planPriceEnvMap[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: `Missing Stripe price for plan ${plan}` },
      { status: 400 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/buyer/billing?success=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
    metadata: {
      plan,
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
