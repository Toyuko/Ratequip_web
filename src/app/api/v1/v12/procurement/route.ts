import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  approveRequisition,
  createRequisition,
} from "@/lib/v12/services";
import { getV12Store } from "@/lib/v12/store";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(
    req,
    ok({ requisitions: getV12Store().requisitions }),
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    title?: string;
    description?: string;
    taxonomyKeys?: string[];
    budgetMax?: number;
    startedBy?: string;
    id?: string;
    actor?: string;
  };

  if (body.action === "create") {
    if (!body.title || !body.description) {
      return apiResponse(req, err("title and description required"));
    }
    const item = createRequisition({
      title: body.title,
      description: body.description,
      taxonomyKeys: body.taxonomyKeys ?? [],
      budgetMax: Number(body.budgetMax) || 0,
      startedBy: body.startedBy,
    });
    return apiResponse(req, ok({ item }));
  }

  if (body.action === "approve" && body.id) {
    const res = approveRequisition(body.id, body.actor);
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown procurement action"));
}
