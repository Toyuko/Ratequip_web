import { NextRequest } from "next/server";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { isDemoMode } from "@/lib/config";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(
    req,
    ok({
      status: "ok",
      service: "ratequip-api",
      version: "v1",
      demoMode: isDemoMode(),
      at: new Date().toISOString(),
    }),
  );
}
