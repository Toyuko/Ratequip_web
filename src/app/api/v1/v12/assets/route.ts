import { NextRequest } from "next/server";
import { gateApiUser } from "@/lib/api/guards";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { issuePassport, listAssets } from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const { getV12Store } = await import("@/lib/v12/store");
  const store = getV12Store();
  return apiResponse(
    req,
    ok({
      assets: listAssets(),
      passports: store.passports,
    }),
  );
}

export async function POST(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    passportId?: string;
  };

  if (body.action === "issue_passport" && body.passportId) {
    const res = issuePassport(body.passportId);
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown assets action"));
}
