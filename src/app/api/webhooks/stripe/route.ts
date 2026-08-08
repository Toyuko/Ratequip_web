import { NextRequest, NextResponse } from "next/server";
import {
  grantSubscriptionRenewalCredits,
  purchaseCreditPack,
} from "@/lib/billing/operations";
import { isDemoMode } from "@/lib/config";
import { persistSubscription } from "@/lib/db/phase2";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    if (process.env.VERCEL_ENV === "production" || !isDemoMode()) {
      return NextResponse.json(
        { error: "Stripe webhook not configured" },
        { status: 503 },
      );
    }
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
          id: string;
          mode?: string;
          customer?: string;
          subscription?: string;
          metadata?: {
            kind?: string;
            plan?: string;
            pack?: string;
            orgId?: string;
          };
        };

        if (
          session.metadata?.kind === "credit_pack" ||
          session.mode === "payment"
        ) {
          if (session.metadata?.pack) {
            await purchaseCreditPack({
              packCode: session.metadata.pack,
              orgId: session.metadata.orgId,
              stripeSessionId: session.id,
            });
            if (session.metadata.orgId) {
              try {
                const { processReferralRewardForOrganisation } = await import(
                  "@/lib/referrals/reward-engine"
                );
                await processReferralRewardForOrganisation({
                  event: "paying_customer",
                  organisationId: session.metadata.orgId,
                  allowDemoFallback: true,
                });
              } catch (error) {
                console.warn("[stripe] paying_customer reward failed", error);
              }
            }
          }
          break;
        }

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
      case "invoice.paid": {
        const invoice = event.data.object as {
          billing_reason?: string;
          subscription?: string | { id?: string };
          customer?: string;
          lines?: {
            data?: Array<{
              period?: { start?: number };
              metadata?: { plan?: string };
            }>;
          };
          metadata?: { plan?: string; orgId?: string };
        };
        // Skip the first invoice (activation grant handled on checkout.completed)
        if (invoice.billing_reason === "subscription_create") break;

        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        const periodStart =
          invoice.lines?.data?.[0]?.period?.start ??
          Math.floor(Date.now() / 1000);
        const planCode =
          invoice.metadata?.plan ??
          invoice.lines?.data?.[0]?.metadata?.plan ??
          "buyer-premium";

        await grantSubscriptionRenewalCredits({
          planCode,
          orgId: invoice.metadata?.orgId,
          stripeSubscriptionId: subId,
          periodKey: String(periodStart),
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
