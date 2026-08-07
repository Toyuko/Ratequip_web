import { NextRequest } from "next/server";
import { getClaimInvitation } from "@/lib/actions/organic-growth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const result = await getClaimInvitation(decodeURIComponent(token));
  if (!result.ok) {
    return apiResponse(req, err(result.message, 404));
  }
  return apiResponse(req, ok(result));
}
