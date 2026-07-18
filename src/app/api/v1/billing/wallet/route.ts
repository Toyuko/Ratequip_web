import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  FREE_TIER_MONTHLY_RFQ_LIMIT,
  RFQ_CREDIT_COST,
  isPaidActivePlan,
} from "@/lib/billing/catalog";
import {
  countRfqsThisMonth,
  getEnterpriseAsync,
} from "@/lib/billing/operations";
import { getSubscriptionAsync, getWalletAsync } from "@/lib/db/phase2";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const [wallet, subscription, rfqsThisMonth, enterprise] = await Promise.all([
    getWalletAsync(),
    getSubscriptionAsync(),
    countRfqsThisMonth(),
    getEnterpriseAsync(),
  ]);

  const paid = isPaidActivePlan(
    subscription?.planCode,
    subscription?.status ?? null,
  );

  return apiResponse(
    req,
    ok({
      balance: wallet.balance,
      entries: wallet.entries,
      rfqCreditCost: RFQ_CREDIT_COST,
      freeTier: paid
        ? null
        : {
            monthlyRfqLimit: FREE_TIER_MONTHLY_RFQ_LIMIT,
            rfqsUsedThisMonth: rfqsThisMonth,
            remaining: Math.max(
              0,
              FREE_TIER_MONTHLY_RFQ_LIMIT - rfqsThisMonth,
            ),
          },
      enterprise,
      subscription: subscription
        ? {
            planCode: subscription.planCode,
            planName: subscription.planName,
            status: subscription.status,
            monthlyCredits: subscription.monthlyCredits,
            priceMonthly: subscription.priceMonthly,
            audience: subscription.audience,
          }
        : null,
      demo: wallet.demo,
    }),
  );
}
