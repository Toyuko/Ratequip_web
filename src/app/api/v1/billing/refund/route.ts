import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { err, ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { refundCredits } from "@/lib/billing/operations";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(3),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }
  if (authResult.user.role !== "admin" && authResult.user.role !== "buyer") {
    return apiResponse(req, err("Buyer or admin role required", 403));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid refund payload"));
  }

  const result = await refundCredits(parsed.data);
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
