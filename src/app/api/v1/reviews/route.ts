import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { submitReview } from "@/lib/actions/marketplace";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  companySlug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(1),
  evidenceName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid review payload"));
  }

  const result = await submitReview(parsed.data);
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }

  return apiResponse(
    req,
    ok({
      message: result.message,
      review: {
        id: "id" in result && result.id ? result.id : `rev-${Date.now()}`,
        ...parsed.data,
        status: "pending",
        author: authResult.user.fullName,
        createdAt: new Date().toISOString(),
      },
    }),
  );
}
