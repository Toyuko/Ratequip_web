import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { submitClaim } from "@/lib/actions/marketplace";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  companySlug: z.string().min(1),
  notes: z.string().min(1),
  evidenceName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid claim payload"));
  }

  const result = await submitClaim({
    ...parsed.data,
    evidenceFile: null,
  });
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
