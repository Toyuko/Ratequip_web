import pricingRules from "@/data/v12/part6/pricing_rules.json";
import { isCatalogueLedgerEnabled } from "@/lib/v13/flags";
import {
  reconcileCredits,
  reserveCredits,
  type ReservationEntry,
} from "@/lib/v12/catalogue-factory/credit-ledger";

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

/** Module 68 PricingEngine.estimate — same formula as Python reference. */
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

/**
 * Module 68 ExtractedField.publishable — supplier-confirmed or high-confidence
 * with evidence. AI_SUGGESTED alone is never publishable.
 */
export function isFieldPublishable(f: ExtractedField): boolean {
  if (f.classification === "AI_SUGGESTED") return false;
  return (
    f.classification === "SUPPLIER_PROVIDED" ||
    f.classification === "SUPPLIER_CONFIRMED" ||
    (f.confidence >= 0.9 && f.evidence.length > 0)
  );
}

export function productPublishability(fields: ExtractedField[]): {
  publishable: boolean;
  blockedFields: string[];
  reasons: string[];
} {
  const blocked = fields.filter((f) => !isFieldPublishable(f));
  const reasons: string[] = [];
  if (blocked.some((f) => f.classification === "AI_SUGGESTED")) {
    reasons.push("ai_suggested_requires_human_confirm");
  }
  if (blocked.some((f) => f.confidence < 0.9)) {
    reasons.push("low_confidence_without_supplier_confirm");
  }
  if (blocked.some((f) => f.evidence.length === 0)) {
    reasons.push("missing_evidence");
  }
  return {
    publishable: blocked.length === 0 && fields.length > 0,
    blockedFields: blocked.map((f) => f.name),
    reasons,
  };
}

/** Reserve catalogue credits (idempotent). No-op path when flag off returns estimate only. */
export function reserveCatalogueCredits(
  jobKey: string,
  estimate: number,
): { reservation: ReservationEntry | null; estimate: number; ledgerEnabled: boolean } {
  const ledgerEnabled = isCatalogueLedgerEnabled();
  if (!ledgerEnabled) {
    return { reservation: null, estimate, ledgerEnabled: false };
  }
  return {
    reservation: reserveCredits(jobKey, estimate),
    estimate,
    ledgerEnabled: true,
  };
}

export function reconcileCatalogueCredits(
  jobKey: string,
  actual: number,
): ReservationEntry {
  return reconcileCredits(jobKey, actual);
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
