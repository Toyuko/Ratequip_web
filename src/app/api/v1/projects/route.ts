import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { createProject } from "@/lib/actions/marketplace";
import { listProjects } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const createSchema = z.object({
  name: z.string().min(1),
  summary: z.string().default(""),
});

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const projects = await listProjects();
  return apiResponse(req, ok({ projects, count: projects.length }));
}

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid project payload"));
  }

  const result = await createProject(parsed.data);
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
