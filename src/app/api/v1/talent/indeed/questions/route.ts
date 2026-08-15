import { NextRequest, NextResponse } from "next/server";
import { indeedQuestions } from "@/lib/talent/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gigId = new URL(req.url).searchParams.get("gigId") ?? "preview";
  const json = await indeedQuestions(gigId);
  return NextResponse.json(json, {
    headers: { "Cache-Control": "no-store" },
  });
}
