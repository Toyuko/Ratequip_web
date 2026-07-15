import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { demoPlans } from "@/lib/db/demo-data";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const plans = demoPlans.map((plan) => ({
    ...plan,
    checkoutUrl: `${appUrl}/api/checkout?plan=${plan.code}`,
    webPricingUrl: `${appUrl}/pricing`,
  }));

  return apiResponse(req, ok({ plans, appUrl }));
}
