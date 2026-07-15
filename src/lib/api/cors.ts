import { NextRequest, NextResponse } from "next/server";

const DEFAULT_ALLOWED = [
  "http://localhost:8081",
  "http://localhost:19006",
  "http://127.0.0.1:8081",
  "http://127.0.0.1:19006",
];

function allowedOrigins(): string[] {
  const fromEnv = process.env.EXPO_PUBLIC_APP_URL
    ? [process.env.EXPO_PUBLIC_APP_URL]
    : [];
  const extra = (process.env.MOBILE_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED, ...fromEnv, ...extra];
}

export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return true;
  if (origin.startsWith("exp://") || origin.startsWith("exps://")) return true;
  return allowedOrigins().includes(origin);
}

export function corsHeaders(req: NextRequest): HeadersInit {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, X-Demo-Role, X-Demo-Org",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && isOriginAllowed(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Vary"] = "Origin";
  } else if (!origin) {
    headers["Access-Control-Allow-Origin"] = "*";
  }
  return headers;
}

export function withCors(req: NextRequest, res: NextResponse): NextResponse {
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.headers.set(key, value);
  }
  return res;
}

export function handleOptions(req: NextRequest): NextResponse {
  return withCors(req, new NextResponse(null, { status: 204 }));
}
