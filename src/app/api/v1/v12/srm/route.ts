import { NextRequest } from "next/server";
import { gateApiUser } from "@/lib/api/guards";
import { ok } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { getV12Store } from "@/lib/v12/store";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  return apiResponse(req, ok({ scorecards: getV12Store().srm }));
}
