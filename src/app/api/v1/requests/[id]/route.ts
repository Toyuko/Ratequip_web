import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { reviseRequest } from "@/lib/actions/marketplace";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const reviseSchema = z.object({
  title: z.string().min(8),
  description: z.string().min(40),
  budgetMin: z.number(),
  budgetMax: z.number(),
  currency: z.string().optional(),
  deliveryCountry: z.string().min(1),
  deliveryCity: z.string().optional(),
  deliveryAddress: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const request = await getRequestById(id);
  if (!request) {
    return apiResponse(req, err("Request not found", 404));
  }
  return apiResponse(
    req,
    ok({
      request,
      quotes: await getQuotesForRequest(request.id),
    }),
  );
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = reviseSchema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid RFQ revise payload"));
  }

  const result = await reviseRequest({
    requestId: id,
    ...parsed.data,
  });
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
