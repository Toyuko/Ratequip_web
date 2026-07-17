import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { listCategories, listTopCategories } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const topOnly = req.nextUrl.searchParams.get("top") === "1";
  const categories = topOnly
    ? await listTopCategories()
    : await listCategories();
  return apiResponse(
    req,
    ok({
      categories,
    }),
  );
}
