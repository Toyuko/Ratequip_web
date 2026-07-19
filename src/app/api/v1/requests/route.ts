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
  const all = await listRequests();
  const requests = await Promise.all(
    all.map(async (r) => ({
      ...r,
      quotes: await getQuotesForRequest(r.id),
    })),
  );
  return apiResponse(req, ok({ requests, count: requests.length }));
}

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  budgetMin: z.number().nonnegative().default(0),
  budgetMax: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
  taxTreatment: z.enum(["inclusive", "exclusive"]).default("inclusive"),
  quoteValidityDays: z.number().int().positive().default(30),
  deliveryCountry: z.string().default(""),
  deliveryCity: z.string().optional(),
  deliveryAddress: z.string().optional(),
  dueDate: z.string().optional(),
  referenceModel: z.string().optional(),
  complianceStandards: z.array(z.string()).optional(),
  materialOfConstruction: z.string().optional(),
  utilitiesNotes: z.string().optional(),
  warrantyMonthsRequired: z.number().int().nonnegative().optional(),
  deliveryWeeksRequired: z.number().int().positive().optional(),
  scopeOfSupply: z.array(z.string()).optional(),
  technicalRequirements: z
    .array(
      z.object({
        text: z.string().min(1),
        priority: z.enum(["must", "prefer", "optional"]).default("must"),
      }),
    )
    .optional(),
  items: z
    .array(
      z.object({
        productName: z.string().min(1),
        productCode: z.string().optional(),
        quantity: z.number().positive().default(1),
        unit: z.string().optional(),
        oemOnly: z.boolean().optional(),
        notes: z.string().optional(),
      }),
    )
    .optional(),
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
