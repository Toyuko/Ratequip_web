import { NextRequest, NextResponse } from "next/server";
import { ingestInbound } from "@/lib/talent/operations";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const result = await ingestInbound(
    {
      headers: {
        "x-linkedin-signature": req.headers.get("x-linkedin-signature"),
        "X-LinkedIn-Signature": req.headers.get("X-LinkedIn-Signature"),
        "x-li-signature": req.headers.get("x-li-signature"),
      },
      rawBody,
    },
    "linkedin",
  );
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ received: true, ...result });
}
