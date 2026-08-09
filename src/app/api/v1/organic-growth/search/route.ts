import { NextRequest } from "next/server";
import { searchCompaniesForAdd } from "@/lib/actions/organic-growth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    q?: string;
    country?: string;
    websiteUrl?: string;
    includeWeb?: boolean;
  } | null;

  const result = await searchCompaniesForAdd({
    q: body?.q ?? "",
    country: body?.country,
    websiteUrl: body?.websiteUrl,
    includeWeb: body?.includeWeb,
  });

  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(
    req,
    ok({
      candidates: result.candidates,
      webEnrichments: result.webEnrichments,
      webMessage: result.webMessage,
      webSearchHits: result.webSearchHits,
    }),
  );
}
