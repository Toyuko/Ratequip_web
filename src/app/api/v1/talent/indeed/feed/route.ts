import { NextResponse } from "next/server";
import { indeedXml } from "@/lib/talent/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const xml = await indeedXml();
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
