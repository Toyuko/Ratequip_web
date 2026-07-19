import { generateObject } from "ai";
import {
  COMPLIANCE_OPTIONS,
  SCOPE_OF_SUPPLY_OPTIONS,
  type TechnicalRequirement,
} from "@/lib/rfq/types";
import { rfqDraftSchema, type RfqDraft } from "@/lib/rfq/draft";

export type { RfqDraft };
export { rfqDraftSchema };

const SYSTEM = `You help industrial equipment buyers draft a marketplace RFQ / URS-lite brief.
Extract structured fields from messy notes or pasted User Requirements Specification (URS) text.
Prefer concise buyer language. Put hard specs into technicalRequirements with priority must/prefer/optional.
For compliance, prefer labels like: ${COMPLIANCE_OPTIONS.join(", ")}.
For scopeOfSupply, prefer: ${SCOPE_OF_SUPPLY_OPTIONS.join(", ")}.
If quantity/line items are clear, fill items. Do not invent a budget unless clearly stated.
If currency is AUD/Australia-focused, use AUD.`;

function heuristicDraft(prompt: string): RfqDraft {
  const text = prompt.trim();
  const lower = text.toLowerCase();
  const firstLine =
    text.split(/\n/).map((l) => l.trim()).find(Boolean)?.slice(0, 120) ??
    "Equipment RFQ";

  const complianceStandards = COMPLIANCE_OPTIONS.filter((option) => {
    const key = option.split(" ")[0]!.toLowerCase();
    return lower.includes(key.toLowerCase()) || lower.includes(option.toLowerCase());
  });

  const scopeOfSupply = SCOPE_OF_SUPPLY_OPTIONS.filter((option) =>
    lower.includes(option),
  ) as string[];

  const qtyMatch = text.match(
    /(\d+)\s*(?:x\s*)?(?:units?|sieves?|machines?|pcs?|pieces?)/i,
  );
  const weeksMatch = text.match(/(\d+)\s*weeks?/i);
  const warrantyMatch = text.match(/(\d+)\s*month(?:s)?\s+warranty/i);
  const refMatch = text.match(
    /(?:identical to|same as|reference(?:\s+model)?|model)\s*[:\-]?\s*([A-Za-z0-9][A-Za-z0-9 .\/\-_]{2,80})/i,
  );

  const mustLines = text
    .split(/\n/)
    .map((line) => line.replace(/^[\s\-\*\d\.]+/, "").trim())
    .filter((line) => line.length > 12 && line.length < 180)
    .slice(0, 8)
    .map(
      (line): TechnicalRequirement => ({
        text: line,
        priority: "must",
      }),
    );

  const currency = /\baud\b|australia/i.test(text) ? "AUD" : "USD";

  return {
    title:
      firstLine
        .replace(/^user requirements? specification[:\s-]*/i, "")
        .trim() || "Equipment RFQ",
    description: text.slice(0, 1200),
    currency: currency as RfqDraft["currency"],
    taxTreatment: "inclusive",
    quoteValidityDays: 30,
    deliveryCountry: /australia/i.test(text) ? "Australia" : "",
    deliveryCity: "",
    deliveryAddress: "",
    referenceModel: refMatch?.[1]?.trim(),
    complianceStandards,
    materialOfConstruction: /ss\s?316|316l|304\s*s\/?s|stainless/i.test(text)
      ? (text.match(/ss\s?316\s?l?|304\s*s\/?s[^.\n]{0,40}/i)?.[0] ??
        "Stainless steel product contact parts")
      : "",
    utilitiesNotes: /415\s*v|3\s*phase|compressed air|6\s*bar/i.test(text)
      ? (text.match(
          /(?:415\s*v[^.\n]*|3\s*phase[^.\n]*|compressed air[^.\n]*)/i,
        )?.[0] ?? "")
      : "",
    warrantyMonthsRequired: warrantyMatch
      ? Number(warrantyMatch[1])
      : undefined,
    deliveryWeeksRequired: weeksMatch ? Number(weeksMatch[1]) : undefined,
    scopeOfSupply:
      scopeOfSupply.length > 0 ? scopeOfSupply : ["supply", "commission"],
    technicalRequirements: mustLines,
    items: [
      {
        productName: firstLine.slice(0, 80),
        productCode: "",
        quantity: qtyMatch ? Number(qtyMatch[1]) : 1,
        unit: "unit",
        oemOnly: /identical|original only|oem only|no alternative/i.test(text),
        notes: "",
      },
    ],
  };
}

export async function draftRfqFromPrompt(prompt: string): Promise<{
  draft: RfqDraft;
  source: "ai" | "heuristic";
  message: string;
}> {
  const cleaned = prompt.trim();
  if (cleaned.length < 20) {
    throw new Error("Add a bit more detail (at least a short equipment brief).");
  }

  try {
    const { object } = await generateObject({
      model: "openai/gpt-5.4",
      schema: rfqDraftSchema,
      system: SYSTEM,
      prompt: cleaned.slice(0, 14000),
      temperature: 0.2,
      abortSignal: AbortSignal.timeout(4000),
    });
    return {
      draft: object,
      source: "ai",
      message: "Draft ready — review and edit before posting.",
    };
  } catch (error) {
    console.warn("[rfq-assist] AI draft failed, using heuristic", error);
    return {
      draft: heuristicDraft(cleaned),
      source: "heuristic",
      message:
        "AI gateway unavailable — generated a starter draft from your text. Review carefully.",
    };
  }
}
