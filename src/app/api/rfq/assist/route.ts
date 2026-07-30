import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  allowAiRequest,
  clientIp,
  requireAssistAuth,
} from "@/lib/ai/assist-guard";
import { draftRfqFromPrompt } from "@/lib/ai/rfq-draft";

const bodySchema = z.object({
  prompt: z.string().min(20).max(20000),
});

export async function POST(req: NextRequest) {
  if (!(await requireAssistAuth(req))) {
    return NextResponse.json(
      { ok: false, message: "Authentication required" },
      { status: 401 },
    );
  }
  if (!allowAiRequest(`rfq-assist:${clientIp(req)}`)) {
    return NextResponse.json(
      { ok: false, message: "Rate limit exceeded. Try again shortly." },
      { status: 429 },
    );
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Provide a longer brief or paste URS text." },
      { status: 400 },
    );
  }

  try {
    const result = await draftRfqFromPrompt(parsed.data.prompt);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to draft RFQ.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
