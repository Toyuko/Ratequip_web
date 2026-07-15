import { NextRequest } from "next/server";
import { resolveApiUser } from "@/lib/api/auth";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const { user } = await resolveApiUser(req);
  return apiResponse(
    req,
    ok({
      authenticated: Boolean(user),
      user,
    }),
  );
}
