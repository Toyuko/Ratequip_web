import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { getV12Store } from "@/lib/v12/store";
import {
  resolveActivationPack,
  runExplainableMatch,
  taxonomySearch,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const resource = req.nextUrl.searchParams.get("resource") ?? "overview";

  if (resource === "overview") {
    const store = getV12Store();
    return apiResponse(
      req,
      ok({
        version: "12.0.0-part3",
        parts: ["part1", "part2-2A", "part2-2B", "part3-3A"],
        counts: {
          opportunities: store.opportunities.length,
          contractors: store.contractors.length,
          requisitions: store.requisitions.length,
          awards: store.awards.length,
          assets: store.assets.length,
          workflowInstances: store.workflowInstances.length,
          documents: store.documents.length,
          matchRuns: store.matchRuns.length,
          aiDrafts: store.aiDrafts.length,
        },
      }),
    );
  }

  if (resource === "taxonomy") {
    const q = req.nextUrl.searchParams.get("q") ?? "";
    return apiResponse(req, ok({ nodes: taxonomySearch(q) }));
  }

  if (resource === "match") {
    const label = req.nextUrl.searchParams.get("q") ?? "packaging";
    const run = await runExplainableMatch({ requirementLabel: label });
    return apiResponse(req, ok(run));
  }

  if (resource === "questions") {
    const packId = req.nextUrl.searchParams.get("pack") ?? "universal";
    const role = req.nextUrl.searchParams.get("role") ?? "buyer";
    return apiResponse(
      req,
      ok(
        resolveActivationPack({
          packId,
          roles: [role],
        }),
      ),
    );
  }

  return apiResponse(req, err("Unknown resource"));
}
