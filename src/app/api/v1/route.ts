import { NextRequest, NextResponse } from "next/server";
import { listCompanies, listRequests, getCompanyBySlug } from "@/lib/db/queries";
import { z } from "zod";

function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null }, init);
}

function err(message: string, status = 400) {
  return NextResponse.json({ data: null, error: { message } }, { status });
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const resource = searchParams.get("resource");

  if (resource === "companies") {
    return ok(
      listCompanies({
        q: searchParams.get("q") ?? undefined,
        category: searchParams.get("category") ?? undefined,
      }),
    );
  }

  if (resource === "company") {
    const slug = searchParams.get("slug");
    if (!slug) return err("slug required");
    const company = getCompanyBySlug(slug);
    if (!company) return err("Not found", 404);
    return ok(company);
  }

  if (resource === "requests") {
    return ok(listRequests());
  }

  return err("Unknown resource. Use companies | company | requests");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const schema = z.object({
    action: z.enum(["ping"]),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return err("Invalid body");
  return ok({ pong: true, at: new Date().toISOString() });
}
