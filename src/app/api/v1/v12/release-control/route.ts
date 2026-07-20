import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  confirmUsagePreview,
  listReleaseControl,
  previewUrsAnalysisUsage,
  setCohortKillSwitch,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  return apiResponse(req, ok(listReleaseControl()));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    action?: string;
    previewId?: string;
    confirmedBy?: string;
    cohortKey?: string;
    killSwitch?: boolean;
  };

  if (body.action === "preview") {
    return apiResponse(req, ok(previewUrsAnalysisUsage()));
  }

  if (body.action === "confirm" && body.previewId && body.confirmedBy) {
    const res = confirmUsagePreview({
      previewId: body.previewId,
      confirmedBy: body.confirmedBy,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  if (
    body.action === "kill_switch" &&
    body.cohortKey != null &&
    typeof body.killSwitch === "boolean"
  ) {
    const res = setCohortKillSwitch({
      cohortKey: body.cohortKey,
      killSwitch: body.killSwitch,
    });
    return apiResponse(req, res.ok ? ok(res) : err(res.message));
  }

  return apiResponse(req, err("Unknown release-control action"));
}
