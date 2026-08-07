import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { getProjectById, listRequests } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const { id } = await ctx.params;
  const project = await getProjectById(id);
  if (!project) {
    return apiResponse(req, err("Project not found", 404));
  }

  // Workspace lite: surface recent open RFQs as linked context (same as web).
  const linkedRequests = (await listRequests()).slice(0, 5);

  return apiResponse(
    req,
    ok({
      project,
      linkedRequests,
    }),
  );
}
