import { NextRequest } from "next/server";
import { startListingSubmission } from "@/lib/actions/organic-growth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    searchQuery?: string;
    idempotencyKey?: string;
  } | null;

  if (!body?.searchQuery?.trim()) {
    return apiResponse(req, err("searchQuery is required"));
  }

  const result = await startListingSubmission({
    searchQuery: body.searchQuery.trim(),
    idempotencyKey: body.idempotencyKey,
  });

  if (!result.ok) {
    return apiResponse(req, err("Unable to start submission"));
  }
  return apiResponse(req, ok({ submission: result.submission }));
}
