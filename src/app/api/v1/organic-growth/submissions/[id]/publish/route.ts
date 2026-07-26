import { NextRequest } from "next/server";
import { publishListingSubmission } from "@/lib/actions/organic-growth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import type { ListingSubmissionDraft } from "@/lib/organic-growth/types";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as {
    declarationsAccepted?: boolean;
    disclosurePreference?: ListingSubmissionDraft["disclosurePreference"];
  } | null;

  if (!body?.declarationsAccepted) {
    return apiResponse(req, err("declarationsAccepted must be true"));
  }

  const result = await publishListingSubmission({
    id,
    declarationsAccepted: true,
    disclosurePreference: body.disclosurePreference,
  });

  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
