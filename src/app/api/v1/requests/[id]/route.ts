import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const request = getRequestById(id);
  if (!request) {
    return apiResponse(req, err("Request not found", 404));
  }
  return apiResponse(
    req,
    ok({
      request,
      quotes: getQuotesForRequest(request.id),
    }),
  );
}
