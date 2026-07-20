import pricingRules from "@/data/v12/part6/pricing_rules.json";

export type FieldClassification =
  | "SUPPLIER_PROVIDED"
  | "DIRECTLY_EXTRACTED"
  | "TABLE_EXTRACTED"
  | "IMAGE_DERIVED"
  | "TRANSLATED"
  | "NORMALISED"
  | "AI_SUGGESTED"
  | "EXTERNALLY_ENRICHED"
  | "ADMIN_ENTERED"
  | "SUPPLIER_CONFIRMED";

export type EvidenceRef = {
  documentId: string;
  versionId: string;
  page: number;
  sourceText: string;
};

export type ExtractedField = {
  name: string;
  value: string;
  classification: FieldClassification;
  confidence: number;
  evidence: EvidenceRef[];
};

export type PricingInputs = {
  pages: number;
  scannedPages: number;
  complexTables: number;
  products: number;
  variants: number;
  images: number;
  translations?: number;
  priority?: boolean;
};

const rules = {
  base: Number(pricingRules.base),
  page: Number(pricingRules.digital_page),
  scan: Number(pricingRules.scanned_page_surcharge),
  table: Number(pricingRules.complex_table),
  product: Number(pricingRules.product),
  variant: Number(pricingRules.variant),
  image: Number(pricingRules.image),
  translation: Number(pricingRules.translation_product_language),
  priorityMultiplier: Number(pricingRules.priority_multiplier),
};

export function estimateCredits(x: PricingInputs): number {
  let total =
    rules.base +
    x.pages * rules.page +
    x.scannedPages * rules.scan +
    x.complexTables * rules.table +
    x.products * rules.product +
    x.variants * rules.variant +
    x.images * rules.image +
    (x.translations ?? 0) * rules.translation;
  if (x.priority) total *= rules.priorityMultiplier;
  return Math.round(total * 100) / 100;
}

export function isFieldPublishable(f: ExtractedField): boolean {
  return (
    f.classification === "SUPPLIER_PROVIDED" ||
    f.classification === "SUPPLIER_CONFIRMED" ||
    (f.confidence >= 0.9 && f.evidence.length > 0)
  );
}

const SUSPICIOUS = [
  /ignore (all|the) previous instructions/i,
  /system prompt/i,
  /developer message/i,
  /exfiltrat(e|ion)/i,
  /send .* secrets/i,
  /override policy/i,
];

export function scanDocumentText(text: string) {
  const matched = SUSPICIOUS.filter((p) => p.test(text)).map((p) => p.source);
  return {
    safeForExtraction: matched.length === 0,
    instructionLikeContent: matched.length > 0,
    matchedPatterns: matched,
    handling: "treat_as_untrusted_document_content" as const,
  };
}

export function safeDocumentText(text: string): string {
  const scan = scanDocumentText(text);
  return scan.safeForExtraction ? text : "[UNTRUSTED_DOCUMENT_CONTENT]";
}
