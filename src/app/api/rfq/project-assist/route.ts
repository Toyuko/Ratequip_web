import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildProjectCompanion } from "@/lib/ai/rfq-project-agent";
import { getRequestById } from "@/lib/db/queries";

const bodySchema = z.object({
  requestId: z.string().optional(),
  prompt: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().optional(),
  deliveryCountry: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Provide an RFQ id or pasted URS/RFQ text." },
      { status: 400 },
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
      return NextResponse.json(
        { ok: false, message: "RFQ not found." },
        { status: 404 },
      );
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
    return NextResponse.json(
      { ok: false, message: "Provide an RFQ id or pasted URS/RFQ text." },
      { status: 400 },
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
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyse project.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
