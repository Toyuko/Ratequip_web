import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { err, ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { refundCredits } from "@/lib/billing/operations";
import { isDemoMode } from "@/lib/config";

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
  // Reject anonymous demo invents (no explicit demo session).
  if (authResult.user.isDemo) {
    const jarCheck = await cookies();
    const demoSession =
      Boolean(req.headers.get("x-demo-role")) ||
      jarCheck.get("rq_onboarded")?.value === "1" ||
      Boolean(jarCheck.get("rq_email")?.value);
    if (!demoSession) {
      return apiResponse(req, err("Authentication required", 401));
    }
  }
  // Refunds mint credits — admin only outside demo; buyers allowed only in demo for UAT.
  if (!isDemoMode() && authResult.user.role !== "admin") {
    return apiResponse(req, err("Admin role required", 403));
  }
  if (authResult.user.role !== "admin" && authResult.user.role !== "buyer") {
    return apiResponse(req, err("Buyer or admin role required", 403));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid refund payload"));
  }

  const jar = await cookies();
  const organisationId = jar.get("rq_org_id")?.value;

  const result = await refundCredits({
    ...parsed.data,
    organisationId,
  });
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
