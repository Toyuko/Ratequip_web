import { NextRequest } from "next/server";
import { z } from "zod";
import { draftRfqFromPrompt } from "@/lib/ai/rfq-draft";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const bodySchema = z.object({
  prompt: z.string().min(20).max(20000),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return apiResponse(
      req,
      err("Provide a longer brief or paste URS text."),
    );
  }

  try {
    const result = await draftRfqFromPrompt(parsed.data.prompt);
    return apiResponse(req, ok({ ok: true, ...result }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to draft RFQ.";
    return apiResponse(req, err(message));
  }
}
