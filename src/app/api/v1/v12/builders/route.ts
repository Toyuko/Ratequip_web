import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { upsertContractor, upsertOpportunity } from "@/lib/v12/services";
import { getV12Store } from "@/lib/v12/store";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const store = getV12Store();
  return apiResponse(
    req,
    ok({
      opportunities: store.opportunities,
      contractors: store.contractors,
    }),
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    companyId?: string;
    companyName?: string;
    targetIndustries?: string[];
    targetRegions?: string[];
    projectValueMin?: number;
    projectValueMax?: number;
    preferredRequirementTypes?: string[];
    notes?: string;
    publish?: boolean;
    trades?: string[];
    licences?: string[];
    serviceRadiusKm?: number;
    emergencyAvailable?: boolean;
    rateSummary?: string;
  };

  if (body.action === "opportunity") {
    if (!body.companyId || !body.companyName) {
      return apiResponse(req, err("companyId and companyName required"));
    }
    const profile = upsertOpportunity({
      companyId: body.companyId,
      companyName: body.companyName,
      targetIndustries: body.targetIndustries ?? [],
      targetRegions: body.targetRegions ?? [],
      projectValueMin: body.projectValueMin,
      projectValueMax: body.projectValueMax,
      preferredRequirementTypes: body.preferredRequirementTypes ?? [],
      notes: body.notes ?? "",
      publish: body.publish,
    });
    return apiResponse(req, ok({ profile }));
  }

  if (body.action === "contractor") {
    if (!body.companyId || !body.companyName) {
      return apiResponse(req, err("companyId and companyName required"));
    }
    const profile = upsertContractor({
      companyId: body.companyId,
      companyName: body.companyName,
      trades: body.trades ?? [],
      licences: body.licences ?? [],
      serviceRadiusKm: Number(body.serviceRadiusKm) || 50,
      emergencyAvailable: Boolean(body.emergencyAvailable),
      rateSummary: body.rateSummary ?? "",
      notes: body.notes ?? "",
      publish: body.publish,
    });
    return apiResponse(req, ok({ profile }));
  }

  return apiResponse(req, err("Unknown builders action"));
}
