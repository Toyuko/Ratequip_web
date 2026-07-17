import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { submitQuote } from "@/lib/actions/marketplace";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  requestId: z.string().min(1),
  amount: z.number().positive(),
  leadTimeDays: z.number().int().nonnegative().default(30),
  notes: z.string().default(""),
  companySlug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid quote payload"));
  }

  const result = await submitQuote(parsed.data);
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
