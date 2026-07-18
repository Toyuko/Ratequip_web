import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  FREE_TIER_MONTHLY_RFQ_LIMIT,
  RFQ_CREDIT_COST,
  listCatalogPlans,
  listCreditPacks,
} from "@/lib/billing/catalog";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const plans = listCatalogPlans().map((plan) => ({
    ...plan,
    checkoutUrl: `${appUrl}/api/checkout?plan=${plan.code}`,
    webPricingUrl: `${appUrl}/pricing`,
  }));
  const packs = listCreditPacks().map((pack) => ({
    ...pack,
    checkoutUrl: `${appUrl}/api/checkout?pack=${pack.code}`,
  }));

  return apiResponse(
    req,
    ok({
      plans,
      packs,
      appUrl,
      rfqCreditCost: RFQ_CREDIT_COST,
      freeTierMonthlyRfqLimit: FREE_TIER_MONTHLY_RFQ_LIMIT,
      portalUrl: `${appUrl}/api/billing/portal`,
      cancelUrl: `${appUrl}/api/billing/cancel`,
    }),
  );
}
