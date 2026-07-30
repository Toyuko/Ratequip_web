import { NextRequest } from "next/server";
import { gateApiUser } from "@/lib/api/guards";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { awardRfq, createRfqRevision } from "@/lib/v12/services";
import { getV12Store } from "@/lib/v12/store";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const store = getV12Store();
  return apiResponse(
    req,
    ok({
      revisions: store.rfqRevisions,
      awards: store.awards,
    }),
  );
}

export async function POST(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    rfqId?: string;
    payload?: Record<string, unknown>;
    createdBy?: string;
    quoteId?: string;
    supplierSlug?: string;
    amount?: number;
    currency?: string;
    reasonCodes?: string[];
    awardedBy?: string;
    assetName?: string;
    taxonomyKeys?: string[];
  };

  if (body.action === "revision") {
    if (!body.rfqId || !body.payload || !body.createdBy) {
      return apiResponse(req, err("rfqId, payload, createdBy required"));
    }
    const row = createRfqRevision({
      rfqId: body.rfqId,
      payload: body.payload,
      createdBy: body.createdBy,
    });
    return apiResponse(req, ok({ revision: row }));
  }

  if (body.action === "award") {
    if (
      !body.rfqId ||
      !body.quoteId ||
      !body.supplierSlug ||
      body.amount == null ||
      !body.awardedBy
    ) {
      return apiResponse(req, err("Incomplete award payload"));
    }
    const award = awardRfq({
      rfqId: body.rfqId,
      quoteId: body.quoteId,
      supplierSlug: body.supplierSlug,
      amount: Number(body.amount),
      currency: body.currency ?? "USD",
      reasonCodes: body.reasonCodes ?? ["best_value"],
      awardedBy: body.awardedBy,
      assetName: body.assetName,
      taxonomyKeys: body.taxonomyKeys,
    });
    return apiResponse(req, ok({ award }));
  }

  return apiResponse(req, err("Unknown rfq action"));
}
