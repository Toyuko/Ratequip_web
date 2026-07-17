import { NextRequest, NextResponse } from "next/server";
import { persistSubscription } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message: "Stripe webhook received in demo mode.",
    });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as {
          customer?: string;
          subscription?: string;
          metadata?: { plan?: string; orgId?: string };
        };
        await persistSubscription({
          planCode: session.metadata?.plan ?? "buyer-premium",
          stripeCustomerId:
            typeof session.customer === "string" ? session.customer : undefined,
          stripeSubscriptionId:
            typeof session.subscription === "string"
              ? session.subscription
              : undefined,
          status: "active",
          orgId: session.metadata?.orgId,
        });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as {
          id: string;
          customer?: string;
          status?: string;
          metadata?: { plan?: string; orgId?: string };
        };
        await persistSubscription({
          planCode: sub.metadata?.plan ?? "buyer-premium",
          stripeCustomerId:
            typeof sub.customer === "string" ? sub.customer : undefined,
          stripeSubscriptionId: sub.id,
          status: sub.status ?? "active",
          orgId: sub.metadata?.orgId,
        });
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as {
          id: string;
          customer?: string;
          metadata?: { plan?: string; orgId?: string };
        };
        await persistSubscription({
          planCode: sub.metadata?.plan ?? "buyer-premium",
          stripeCustomerId:
            typeof sub.customer === "string" ? sub.customer : undefined,
          stripeSubscriptionId: sub.id,
          status: "canceled",
          orgId: sub.metadata?.orgId,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Webhook error" },
      { status: 400 },
    );
  }
}
