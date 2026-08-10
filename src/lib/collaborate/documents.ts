import { createHash, randomUUID } from "crypto";
import type { Agreement, Engagement } from "@/lib/collaborate/types";

const TEMPLATE_VERSION = "au-v1";

/**
 * Document generation (§10.1).
 * JSON is enforced; PDF is what parties read — same source.
 * Templates require legal review per jurisdiction before enablement.
 */
export function generateAgreement(input: {
  engagement: Engagement;
  kind: Agreement["kind"];
  structuredJson: Record<string, unknown>;
}): Agreement {
  const structured = {
    ...input.structuredJson,
    engagementId: input.engagement.engagementId,
    mode: input.engagement.mode,
    jurisdiction: input.engagement.jurisdiction,
    draftNotice: "DRAFT — NOT LEGAL ADVICE. Template-derived only.",
    templateVersion: TEMPLATE_VERSION,
  };
  const documentHash = createHash("sha256")
    .update(JSON.stringify(structured))
    .digest("hex");

  return {
    agreementId: `agr_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    engagementId: input.engagement.engagementId,
    kind: input.kind,
    version: TEMPLATE_VERSION,
    jurisdiction: input.engagement.jurisdiction,
    structuredJson: structured,
    documentHash,
    signedBy: [],
    createdAt: new Date().toISOString(),
  };
}

export function signAgreement(
  agreement: Agreement,
  partyId: string,
  ip?: string,
): Agreement {
  if (agreement.signedBy.some((s) => s.partyId === partyId)) {
    return agreement;
  }
  return {
    ...agreement,
    signedBy: [
      ...agreement.signedBy,
      { partyId, signedAt: new Date().toISOString(), ip },
    ],
  };
}
