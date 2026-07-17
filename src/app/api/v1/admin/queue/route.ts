import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { listPendingClaims, listPendingReviews } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const [pendingReviews, pendingClaims] = await Promise.all([
    listPendingReviews(),
    listPendingClaims(),
  ]);

  const reviews = pendingReviews.map((r) => ({
    entityType: "review" as const,
    entityId: r.id,
    title: r.title,
    companySlug: r.companySlug,
    rating: r.rating,
    author: r.author,
    createdAt: r.createdAt,
  }));

  const claims = pendingClaims.map((c) => ({
    entityType: "claim" as const,
    entityId: c.id,
    title: `Claim: ${c.companySlug}`,
    companySlug: c.companySlug,
    notes: c.notes,
    createdAt: c.createdAt,
  }));

  return apiResponse(
    req,
    ok({
      items: [...reviews, ...claims],
      reviews,
      claims,
    }),
  );
}
