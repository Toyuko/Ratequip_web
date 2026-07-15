import { NextRequest, NextResponse } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

/**
 * Legacy stub kept for backward compatibility.
 * Prefer /api/v1/health and resource routes.
 */
export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(
    req,
    err(
      "Use /api/v1/health, /api/v1/companies, /api/v1/requests, etc.",
      400,
      "moved",
    ),
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (body?.action === "ping") {
    return apiResponse(
      req,
      ok({ pong: true, at: new Date().toISOString() }),
    );
  }
  return apiResponse(req, err("Invalid body. Use { action: \"ping\" } or resource routes."));
}
