import { NextRequest } from "next/server";
import {
  getListingSubmission,
  updateListingSubmission,
} from "@/lib/actions/organic-growth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const result = await getListingSubmission(id);
  if (!result.ok) {
    return apiResponse(req, err(result.message, 404));
  }
  return apiResponse(req, ok({ submission: result.submission }));
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body) {
    return apiResponse(req, err("Invalid payload"));
  }

  const result = await updateListingSubmission({
    ...(body as object),
    id,
  } as Parameters<typeof updateListingSubmission>[0]);

  if (!result.ok) {
    return apiResponse(req, err(result.message, 404));
  }
  return apiResponse(req, ok({ submission: result.submission }));
}
