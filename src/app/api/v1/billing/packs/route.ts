import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { listCreditPacks } from "@/lib/billing/catalog";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const packs = listCreditPacks().map((pack) => ({
    ...pack,
    checkoutUrl: `${appUrl}/api/checkout?pack=${pack.code}`,
  }));
  return apiResponse(req, ok({ packs, appUrl }));
}
