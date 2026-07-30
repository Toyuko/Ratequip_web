import { NextRequest } from "next/server";
import { z } from "zod";
import {
  allowAiRequest,
  clientIp,
  requireAssistAuth,
} from "@/lib/ai/assist-guard";
import { buildProjectCompanion } from "@/lib/ai/rfq-project-agent";
import { getRequestById } from "@/lib/db/queries";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const bodySchema = z.object({
  requestId: z.string().optional(),
  prompt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  deliveryCountry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  if (!(await requireAssistAuth(req))) {
    return apiResponse(req, err("Authentication required", 401));
  }
  if (!allowAiRequest(`rfq-project-assist-v1:${clientIp(req)}`)) {
    return apiResponse(req, err("Rate limit exceeded. Try again shortly.", 429));
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiResponse(
      req,
      err("Provide an RFQ id or pasted URS/RFQ text."),
    );
  }

  const data = parsed.data;
  let title = data.title;
  let description = data.description;
  let currency = data.currency;
  let deliveryCountry = data.deliveryCountry;
  let items: { productName: string; notes?: string }[] | undefined;
  let technicalRequirements: { text: string }[] | undefined;
  let referenceModel: string | undefined;
  let complianceStandards: string[] | undefined;

  if (data.requestId) {
    const request = await getRequestById(data.requestId);
    if (!request) {
      return apiResponse(req, err("RFQ not found.", 404));
    }
    title = request.title;
    description = request.description;
    currency = request.currency;
    deliveryCountry = request.deliveryCountry;
    items = request.items?.map((i) => ({
      productName: i.productName,
      notes: i.notes,
    }));
    technicalRequirements = request.technicalRequirements?.map((r) => ({
      text: r.text,
    }));
    referenceModel = request.referenceModel;
    complianceStandards = request.complianceStandards;
  }

  const prompt = data.prompt?.trim();
  if (!prompt && !title && !description) {
    return apiResponse(
      req,
      err("Provide an RFQ id or pasted URS/RFQ text."),
    );
  }

  try {
    const result = await buildProjectCompanion({
      prompt,
      title,
      description,
      currency,
      deliveryCountry,
      items,
      technicalRequirements,
      referenceModel,
      complianceStandards,
    });
    return apiResponse(req, ok({ ok: true, ...result }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyse project.";
    return apiResponse(req, err(message));
  }
}
