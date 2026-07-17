import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { createRequest } from "@/lib/actions/marketplace";
import { getQuotesForRequest, listRequests } from "@/lib/db/queries";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const requests = listRequests().map((r) => ({
    ...r,
    quotes: getQuotesForRequest(r.id),
  }));
  return apiResponse(req, ok({ requests, count: requests.length }));
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budgetMin: z.number().nonnegative().default(0),
  budgetMax: z.number().nonnegative().default(0),
  deliveryCountry: z.string().default(""),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid RFQ payload"));
  }

  const result = await createRequest(parsed.data);
  if (!result.ok || !("id" in result) || !result.id) {
    return apiResponse(
      req,
      err("message" in result ? result.message : "Unable to create RFQ"),
    );
  }

  const requestId = result.id;

  return apiResponse(
    req,
    ok({
      id: requestId,
      message: result.message,
      request: {
        id: requestId,
        title: parsed.data.title,
        description: parsed.data.description,
        budgetMin: parsed.data.budgetMin,
        budgetMax: parsed.data.budgetMax,
        deliveryCountry: parsed.data.deliveryCountry,
        status: "open",
        quoteCount: 0,
        createdAt: new Date().toISOString(),
      },
    }),
  );
}
