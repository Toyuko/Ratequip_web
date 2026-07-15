import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { moderateEntity } from "@/lib/actions/admin";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  entityType: z.enum(["review", "claim"]),
  entityId: z.string().min(1),
  decision: z.enum(["approved", "rejected"]),
});

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid moderation payload"));
  }

  const result = await moderateEntity(parsed.data);
  return apiResponse(req, ok(result));
}
