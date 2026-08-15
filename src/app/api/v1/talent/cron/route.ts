import { NextRequest, NextResponse } from "next/server";
import {
  expireCredentials,
  processOutbox,
  processUnprocessedInbound,
} from "@/lib/talent/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return process.env.VERCEL_ENV !== "production";
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const expired = await expireCredentials();
  const inbound = await processUnprocessedInbound();
  const outbox = await processOutbox();
  return NextResponse.json({
    ok: true,
    expired,
    inboundReplayed: inbound,
    outbox,
  });
}
