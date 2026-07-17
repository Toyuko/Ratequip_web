import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { closeOrAwardRequest } from "@/lib/actions/marketplace";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  status: z.enum(["closed", "awarded"]),
});

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid status payload"));
  }

  const result = await closeOrAwardRequest({
    requestId: id,
    status: parsed.data.status,
  });
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
