import { NextRequest, NextResponse } from "next/server";
import { ingestInbound } from "@/lib/talent/operations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const result = await ingestInbound({
    headers: {
      "x-indeed-signature": req.headers.get("x-indeed-signature"),
      "X-Indeed-Signature": req.headers.get("X-Indeed-Signature"),
    },
    rawBody,
  });
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ received: true, ...result });
}
