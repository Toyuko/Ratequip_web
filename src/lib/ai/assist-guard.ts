import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasClerk, isDemoMode } from "@/lib/config";

const hits = new Map<string, { count: number; resetAt: number }>();

export function allowAiRequest(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || now > row.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}

export function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function requireAssistAuth(req?: NextRequest) {
  if (hasClerk()) {
    try {
      const session = await auth();
      if (session.userId) return true;
    } catch {
      /* fall through to demo session check */
    }
  }

  if (!isDemoMode()) return false;

  const jar = await cookies();
  const headerRole = req?.headers.get("x-demo-role");
  return (
    Boolean(headerRole) ||
    jar.get("rq_onboarded")?.value === "1" ||
    Boolean(jar.get("rq_email")?.value)
  );
}
