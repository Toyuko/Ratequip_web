import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  getCompanyBySlug,
  getCompanyProducts,
  getCompanyReviews,
} from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const company = getCompanyBySlug(slug);
  if (!company) {
    return apiResponse(req, err("Company not found", 404));
  }
  return apiResponse(
    req,
    ok({
      company,
      products: getCompanyProducts(slug),
      reviews: getCompanyReviews(slug),
    }),
  );
}
