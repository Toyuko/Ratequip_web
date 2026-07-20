/**
 * Deterministic catalogue stub extractor for Release 6A (no live OCR/LLM).
 */
import packagingManifest from "@/data/v12/part6/packaging_line_manifest.json";
import {
  safeDocumentText,
  scanDocumentText,
  type ExtractedField,
} from "@/lib/v12/catalogue-factory/domain";

export type DraftProduct = {
  id: string;
  jobId: string;
  title: string;
  pageClass: string;
  page: number;
  status: "draft" | "accepted" | "rejected";
  fields: ExtractedField[];
  publishable: boolean;
  createdAt: string;
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function fieldFromTitle(
  title: string,
  page: number,
  documentId: string,
  versionId: string,
): ExtractedField {
  return {
    name: "title",
    value: title,
    classification: "DIRECTLY_EXTRACTED",
    confidence: 0.92,
    evidence: [
      {
        documentId,
        versionId,
        page,
        sourceText: title,
      },
    ],
  };
}

export function preflightFromText(sourceText: string) {
  const lines = sourceText
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);
  const pages = Math.max(1, Math.ceil(lines.length / 8));
  const productLines = lines.filter(
    (l) =>
      /model|machine|system|filler|capper|bagger|pallet|sealer|mixer|pump/i.test(
        l,
      ),
  );
  return {
    pages,
    scannedPages: 0,
    complexTables: Math.min(3, Math.floor(productLines.length / 3)),
    products: Math.max(1, productLines.length),
    variants: Math.floor(productLines.length / 2),
    images: Math.min(5, productLines.length),
    lineCount: lines.length,
  };
}

export function extractDraftProducts(input: {
  jobId: string;
  sourceText: string;
  documentId: string;
  versionId: string;
  usePackagingFixture?: boolean;
}): { drafts: DraftProduct[]; firewall: ReturnType<typeof scanDocumentText> } {
  const firewall = scanDocumentText(input.sourceText);
  const text = safeDocumentText(input.sourceText);

  if (!firewall.safeForExtraction) {
    return { drafts: [], firewall };
  }

  const drafts: DraftProduct[] = [];

  if (input.usePackagingFixture) {
    const productPages = (
      packagingManifest as {
        pages: Array<{ page: number; class: string; title: string }>;
      }
    ).pages.filter((p) => p.class === "products" || p.class === "table");
    for (const p of productPages) {
      const titleField = fieldFromTitle(
        p.title,
        p.page,
        input.documentId,
        input.versionId,
      );
      drafts.push({
        id: id("cprod"),
        jobId: input.jobId,
        title: p.title,
        pageClass: p.class,
        page: p.page,
        status: "draft",
        fields: [titleField],
        publishable: false, // needs supplier confirm
        createdAt: new Date().toISOString(),
      });
    }
  }

  const lines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 8);
  let page = 1;
  for (const line of lines) {
    if (
      !/^(model|product|machine|system|filler|capper|bagger|pallet|sealer|mixer|pump|auger)/i.test(
        line,
      ) &&
      !/\b(model|sku|capacity)\b/i.test(line)
    ) {
      continue;
    }
    const titleField = fieldFromTitle(
      line.slice(0, 160),
      page,
      input.documentId,
      input.versionId,
    );
    drafts.push({
      id: id("cprod"),
      jobId: input.jobId,
      title: line.slice(0, 160),
      pageClass: "products",
      page,
      status: "draft",
      fields: [titleField],
      publishable: false,
      createdAt: new Date().toISOString(),
    });
    page += 1;
  }

  return { drafts, firewall };
}
