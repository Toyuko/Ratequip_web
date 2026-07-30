import { NextRequest } from "next/server";
import { gateApiUser } from "@/lib/api/guards";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { confirmAIDraft, createAIDraft } from "@/lib/v12/services";
import { getV12Store } from "@/lib/v12/store";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  return apiResponse(req, ok({ drafts: getV12Store().aiDrafts }));
}

export async function POST(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    type?: string;
    title?: string;
    body?: string;
    companyId?: string;
    requestedBy?: string;
    groundingRefs?: string[];
    draftId?: string;
    confirmedBy?: string;
    executeType?: string;
  };

  if (body.action === "create") {
    if (!body.title || !body.body || !body.companyId || !body.requestedBy) {
      return apiResponse(req, err("Incomplete draft payload"));
    }
    const draft = createAIDraft({
      type: body.type ?? "policy",
      title: body.title,
      body: body.body,
      companyId: body.companyId,
      requestedBy: body.requestedBy,
      groundingRefs: body.groundingRefs,
    });
    return apiResponse(req, ok({ draft }));
  }

  if (body.action === "confirm" && body.draftId && body.confirmedBy) {
    const res = confirmAIDraft({
      draftId: body.draftId,
      confirmedBy: body.confirmedBy,
      executeType: body.executeType,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown intelligence action"));
}
