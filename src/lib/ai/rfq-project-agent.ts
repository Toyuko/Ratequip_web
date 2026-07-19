import { generateObject } from "ai";
import {
  RFQ_AI_MAX_RETRIES,
  RFQ_AI_MODEL,
  aiFallbackMessage,
} from "@/lib/ai/model";
import { listCompanies, listCompaniesSync } from "@/lib/db/queries";
import type { DemoCompany } from "@/lib/db/demo-data";
import {
  detectPrimaryProfile,
  type CompanionTemplate,
} from "@/lib/rfq/line-companions";
import {
  projectBreakdownSchema,
  type ProjectBreakdownDraft,
  type ProjectCompanionResult,
  type ProjectNeedDraft,
  type ProjectNeedWithSuppliers,
  type MatchedSupplierQuote,
} from "@/lib/rfq/project-companion";

export type ProjectAssistInput = {
  title?: string;
  description?: string;
  items?: { productName: string; notes?: string }[];
  technicalRequirements?: { text: string }[];
  referenceModel?: string;
  complianceStandards?: string[];
  currency?: string;
  deliveryCountry?: string;
  /** Free-text URS/RFQ paste (create flow) */
  prompt?: string;
};

function corpusFromInput(input: ProjectAssistInput) {
  return [
    input.prompt,
    input.title,
    input.description,
    input.referenceModel,
    ...(input.items ?? []).flatMap((i) => [i.productName, i.notes]),
    ...(input.technicalRequirements ?? []).map((r) => r.text),
    ...(input.complianceStandards ?? []),
  ]
    .filter(Boolean)
    .join("\n");
}

function heuristicBreakdown(input: ProjectAssistInput): ProjectBreakdownDraft {
  const text = corpusFromInput(input);
  const profile = detectPrimaryProfile(text);
  const primaryInRfq = true;

  const needs: ProjectNeedDraft[] = [
    {
      ...profile.primary,
      inOriginalRfq: primaryInRfq,
    },
    ...profile.companions.map((c) => ({
      ...c,
      inOriginalRfq: false,
    })),
  ];

  // Keep the list actionable — primary + top companions
  const trimmed = [
    needs[0]!,
    ...needs.slice(1).filter((n) => n.role !== "utilities").slice(0, 8),
    ...needs.filter((n) => n.role === "utilities").slice(0, 1),
  ];

  return {
    summary: `This looks like a ${profile.label.toLowerCase()} project. Beyond the primary request, buyers usually need upstream/downstream equipment, packaging materials, and commissioning support to complete the line.`,
    projectType: profile.label,
    primaryFocus: profile.primary.label,
    needs: dedupeNeeds(trimmed),
  };
}

function dedupeNeeds(needs: ProjectNeedDraft[]) {
  const seen = new Set<string>();
  return needs.filter((need) => {
    const key = need.label.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function aiBreakdown(input: ProjectAssistInput): Promise<{
  draft: ProjectBreakdownDraft | null;
  error?: unknown;
}> {
  const text = corpusFromInput(input).slice(0, 14000);
  if (text.length < 20) return { draft: null };

  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: projectBreakdownSchema,
      temperature: 0.2,
      maxRetries: RFQ_AI_MAX_RETRIES,
      abortSignal: AbortSignal.timeout(20000),
      system: `You are RateQuip's RFQ/URS project agent for industrial equipment buyers.
Given a URS or RFQ (often for ONE machine), expand into a full project bill of needs:
- Keep the original request as role=primary, inOriginalRfq=true
- Add complementary upstream/downstream equipment, materials (bottles, caps, labels), utilities, and services
- Prefer marketplace category slugs when known: cappers, bottle-fillers, labellers, conveyors, checkweighers, metal-detectors, tray-sealers, coding-and-marking, case-packers, palletisers, food-processing, inspection-qc, industrial-hvac, factory-automation
- Include indicative USD budgetMin/budgetMax for each need (rough ranges for compare pricing)
- Explain why each add-on matters in one short sentence
Do not invent that something was in the original RFQ unless clearly present.`,
      prompt: text,
    });
    return {
      draft: {
        ...object,
        needs: dedupeNeeds(object.needs).slice(0, 12),
      },
    };
  } catch (error) {
    console.warn("[rfq-project-agent] AI breakdown failed", error);
    return { draft: null, error };
  }
}

function scoreCompanyForNeed(
  company: DemoCompany,
  need: ProjectNeedDraft,
  deliveryCountry?: string,
) {
  const cats = new Set(company.categories.map((c) => c.toLowerCase()));
  const slugHits = need.categorySlugs.filter((s) => cats.has(s.toLowerCase())).length;
  const q = need.searchQuery.toLowerCase();
  const blob = `${company.name} ${company.headline} ${company.description}`.toLowerCase();
  const textHit = q
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .some((w) => blob.includes(w));
  let score = company.trustScore / 100;
  score += slugHits * 0.35;
  if (textHit) score += 0.15;
  if (company.verified) score += 0.08;
  if (company.claimed) score += 0.05;
  if (
    deliveryCountry &&
    company.country.toLowerCase().includes(deliveryCountry.toLowerCase())
  ) {
    score += 0.12;
  }
  return score;
}

function indicativePrice(
  company: DemoCompany,
  need: ProjectNeedDraft,
  currency: string,
): number {
  const min = need.budgetMin ?? 20000;
  const max = need.budgetMax ?? Math.max(min * 2, 80000);
  const mid = (min + max) / 2;
  const spread = (max - min) / 2;
  // Stable pseudo-variation from slug so compares look consistent
  let hash = 0;
  for (const ch of company.slug) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const t = ((hash >>> 0) % 1000) / 1000;
  const trustBias = (company.trustScore - 70) / 200;
  const price = mid + (t - 0.5) * spread * 1.2 + trustBias * spread;
  return Math.max(min, Math.round(price / 100) * 100);
}

async function matchSuppliersForNeed(
  need: ProjectNeedDraft,
  opts: { currency: string; deliveryCountry?: string; excludeSlugs?: Set<string> },
): Promise<MatchedSupplierQuote[]> {
  const pools: DemoCompany[] = [];
  const seen = new Set<string>();

  const pushAll = (rows: DemoCompany[]) => {
    for (const row of rows) {
      if (seen.has(row.slug)) continue;
      seen.add(row.slug);
      pools.push(row);
    }
  };

  // Prefer curated demo specialists first (fast + high signal).
  for (const slug of need.categorySlugs.slice(0, 3)) {
    pushAll(listCompaniesSync({ category: slug }));
  }
  if (need.searchQuery) {
    pushAll(listCompaniesSync({ q: need.searchQuery }));
  }

  // Only hit Neon when demo coverage is thin.
  if (pools.length < 3) {
    for (const slug of need.categorySlugs.slice(0, 2)) {
      pushAll(await listCompanies({ category: slug, limit: 12 }));
    }
  }
  if (pools.length < 3 && need.searchQuery) {
    pushAll(await listCompanies({ q: need.searchQuery, limit: 12 }));
  }
  if (pools.length === 0) {
    pushAll(listCompaniesSync({}));
  }

  const scored = pools
    .filter((c) => !opts.excludeSlugs?.has(c.slug))
    .map((company) => {
      const cats = company.categories.map((c) => c.toLowerCase());
      const categoryHit = need.categorySlugs.find((s) =>
        cats.includes(s.toLowerCase()),
      );
      const qWords = need.searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const blob =
        `${company.name} ${company.headline} ${company.description}`.toLowerCase();
      const textHits = qWords.filter((w) => blob.includes(w)).length;
      const matchScore = scoreCompanyForNeed(
        company,
        need,
        opts.deliveryCountry,
      );
      const reason = categoryHit
        ? categoryHit
        : textHits > 0
          ? "keyword fit"
          : company.verified
            ? "verified supplier"
            : "marketplace profile";
      return {
        companyId: company.id,
        companySlug: company.slug,
        companyName: company.name,
        country: company.country,
        city: company.city,
        trustScore: company.trustScore,
        headline: company.headline,
        verified: company.verified,
        matchScore,
        categoryHit: Boolean(categoryHit),
        textHits,
        reason: `Matched on ${reason}`,
        indicativePrice: indicativePrice(company, need, opts.currency),
        currency: opts.currency,
      };
    });

  const relevant = scored.filter((s) => s.categoryHit || s.textHits > 0);
  const pool = relevant.length >= 2 ? relevant : scored;

  return pool
    .sort(
      (a, b) =>
        Number(b.categoryHit) - Number(a.categoryHit) ||
        b.textHits - a.textHits ||
        b.matchScore - a.matchScore ||
        a.indicativePrice - b.indicativePrice,
    )
    .slice(0, 3)
    .map(({ categoryHit: _c, textHits: _t, ...supplier }) => supplier);
}

export async function buildProjectCompanion(
  input: ProjectAssistInput,
): Promise<ProjectCompanionResult> {
  const currency = (input.currency ?? "USD").toUpperCase();
  const { draft: aiDraft, error: aiError } = await aiBreakdown(input);
  const breakdown = aiDraft ?? heuristicBreakdown(input);
  const source = aiDraft ? ("ai" as const) : ("heuristic" as const);

  const needs: ProjectNeedWithSuppliers[] = [];

  for (const [index, need] of breakdown.needs.entries()) {
    const suppliers = await matchSuppliersForNeed(need, {
      currency,
      deliveryCountry: input.deliveryCountry,
    });
    needs.push({
      ...need,
      id: `need-${index + 1}`,
      budgetMin: need.budgetMin,
      budgetMax: need.budgetMax,
      suppliers,
    });
  }

  return {
    summary: breakdown.summary,
    projectType: breakdown.projectType,
    primaryFocus: breakdown.primaryFocus,
    needs,
    source,
    currency,
    message:
      source === "ai"
        ? "Project breakdown ready — compare complementary suppliers below."
        : aiFallbackMessage(aiError, "project"),
  };
}

/** Expose templates for tests / UI hints */
export function templatesForText(text: string): CompanionTemplate[] {
  const profile = detectPrimaryProfile(text);
  return [profile.primary, ...profile.companions];
}
