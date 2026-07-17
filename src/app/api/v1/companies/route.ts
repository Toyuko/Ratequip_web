import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { listCompanies } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const companies = await listCompanies({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    country: searchParams.get("country") ?? undefined,
  });
  return apiResponse(req, ok({ companies, count: companies.length }));
}
