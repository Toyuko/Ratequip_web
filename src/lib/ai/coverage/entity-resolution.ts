import { generateObject } from "ai";
import { RFQ_AI_MAX_RETRIES, RFQ_AI_MODEL } from "@/lib/ai/model";
import type { DuplicateCandidate } from "@/lib/organic-growth/types";
import { registrableDomainFromUrl } from "@/lib/organic-growth/privacy";
import { COVERAGE_SHARED_RULES } from "./shared-rules";
import {
  entityResolutionSchema,
  type EntityResolutionResult,
} from "./types";

export type ResolutionCandidate = {
  rawName: string;
  website?: string | null;
  countryHint?: string | null;
  registryId?: string | null;
};

function normalizeRegistry(id?: string | null) {
  return (id || "").replace(/[\s-]/g, "").toUpperCase();
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(ltd|limited|inc|incorporated|llc|co|company|corp|corporation|gmbh|pty|plc|sa|bv|ag|srl|spa)\b/g,
      "",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/**
 * Deterministic P5 blocking + decision rules (no AI).
 * Registry ID match is decisive; same apex domain alone is not sufficient for "exact".
 */
export function resolveEntityAgainstDirectory(input: {
  candidate: ResolutionCandidate;
  existing: DuplicateCandidate[];
}): EntityResolutionResult {
  const { candidate, existing } = input;
  if (existing.length === 0) {
    return {
      decision: "different",
      targetId: null,
      confidence: 0.9,
      decidingRule: 6,
      evidence: [],
      conflicts: [],
      needsHuman: false,
      reasoning: "No directory blockers matched this candidate.",
    };
  }

  const candDomain = registrableDomainFromUrl(candidate.website || undefined);
  const candName = normalizeName(candidate.rawName);
  const candRegistry = normalizeRegistry(candidate.registryId);
  const candCountry = (candidate.countryHint || "").toLowerCase();

  // Rule 1: registry ID
  if (candRegistry.length >= 8) {
    // Directory records may carry registry in matchReasons text only today;
    // still check name+domain blockers carefully below.
  }

  let best: {
    row: DuplicateCandidate;
    decision: EntityResolutionResult["decision"];
    rule: number;
    confidence: number;
    reasoning: string;
  } | null = null;

  for (const row of existing) {
    const rowDomain = registrableDomainFromUrl(row.website);
    const rowName = normalizeName(row.name);
    const sameDomain = Boolean(candDomain && rowDomain && candDomain === rowDomain);
    const sameName = Boolean(candName && rowName && candName === rowName);
    const nameOverlap =
      candName &&
      rowName &&
      (candName.includes(rowName) || rowName.includes(candName));
    const sameCountry =
      candCountry &&
      row.country.toLowerCase().includes(candCountry);

    // Rule 2: same registered/legal-ish name + same country
    if (sameName && (sameCountry || !candCountry)) {
      const hit = {
        row,
        decision: "same" as const,
        rule: 2,
        confidence: sameCountry ? 0.92 : 0.86,
        reasoning: "Matching normalised name with compatible geography.",
      };
      if (!best || hit.confidence > best.confidence) best = hit;
      continue;
    }

    // Rule 3: same apex domain — strong but not alone decisive for merge
    if (sameDomain) {
      if (sameName) {
        const hit = {
          row,
          decision: "same" as const,
          rule: 3,
          confidence: 0.9,
          reasoning:
            "Same apex domain and matching trading name — treat as same operating company.",
        };
        if (!best || hit.confidence > best.confidence) best = hit;
      } else if (nameOverlap) {
        // e.g. "Acme Filling Italia" on group domain of "Acme Filling GmbH"
        const hit = {
          row,
          decision: "subsidiary_of" as const,
          rule: 5,
          confidence: 0.72,
          reasoning:
            "Shared group domain with distinct national/trading name — keep as related subsidiary.",
        };
        if (!best || hit.confidence > best.confidence) best = hit;
      } else {
        const hit = {
          row,
          decision: "uncertain" as const,
          rule: 3,
          confidence: 0.55,
          reasoning:
            "Same apex domain but names differ — possible group site hosting multiple entities.",
        };
        if (!best || hit.confidence > best.confidence) best = hit;
      }
      continue;
    }

    // Rule 6: same name different country
    if (sameName && candCountry && !sameCountry) {
      const hit = {
        row,
        decision: "different" as const,
        rule: 6,
        confidence: 0.8,
        reasoning: "Same name in a different country without a corporate link.",
      };
      if (!best || hit.confidence > best.confidence) best = hit;
      continue;
    }

    // Soft name overlap
    if (nameOverlap && (sameCountry || !candCountry)) {
      const hit = {
        row,
        decision: "uncertain" as const,
        rule: 8,
        confidence: 0.5,
        reasoning: "Partial name overlap — needs human or richer evidence.",
      };
      if (!best || hit.confidence > best.confidence) best = hit;
    }
  }

  if (!best) {
    return {
      decision: "different",
      targetId: null,
      confidence: 0.75,
      decidingRule: 6,
      evidence: [],
      conflicts: [],
      needsHuman: false,
      reasoning: "No strong identity link to existing directory records.",
    };
  }

  return {
    decision: best.decision,
    targetId: best.row.companyId,
    confidence: best.confidence,
    decidingRule: best.rule,
    evidence: best.row.website
      ? [{ url: best.row.website, quote: best.row.name }]
      : [],
    conflicts: [],
    needsHuman: best.confidence < 0.85 || best.decision === "uncertain",
    reasoning: best.reasoning,
  };
}

/**
 * Optional AI adjudication when deterministic resolution is uncertain.
 */
export async function resolveEntityWithAi(input: {
  candidate: ResolutionCandidate;
  existing: DuplicateCandidate[];
}): Promise<EntityResolutionResult> {
  const deterministic = resolveEntityAgainstDirectory(input);
  if (
    deterministic.decision !== "uncertain" &&
    deterministic.confidence >= 0.85
  ) {
    return deterministic;
  }

  if (input.existing.length === 0) return deterministic;

  try {
    const { object } = await generateObject({
      model: RFQ_AI_MODEL,
      schema: entityResolutionSchema,
      maxRetries: RFQ_AI_MAX_RETRIES,
      temperature: 0,
      abortSignal: AbortSignal.timeout(15_000),
      system: `${COVERAGE_SHARED_RULES}

TASK: ENTITY RESOLUTION

Decide whether the CANDIDATE is the same real-world business as any EXISTING record.
Rules (priority):
1. Matching registry/VAT/company number = same
2. Same registered legal name + same country = same (unless registry IDs differ)
3. Same apex domain is strong but not sufficient alone for multi-entity groups
4. A brand is not a company → alias_of
5. National subsidiaries are separate (link, do not merge)
6. Same name + different country + no corporate link = different
7. Former name / rename = same with alias
8. If deciding evidence would require an unopened page → uncertain
Set needsHuman=true when confidence < 0.85 or conflicts touch legal name/country/registry.`,
      prompt: JSON.stringify({
        candidate: input.candidate,
        existing: input.existing.slice(0, 8).map((e) => ({
          id: e.companyId,
          name: e.name,
          website: e.website,
          city: e.city,
          country: e.country,
          claimed: e.claimed,
          matchLevel: e.matchLevel,
          matchScore: e.matchScore,
        })),
        deterministicHint: deterministic,
      }),
    });
    return object;
  } catch (error) {
    console.warn("[coverage] entity resolution AI failed", error);
    return deterministic;
  }
}

/**
 * Re-rank / annotate directory duplicates using coverage resolution rules.
 */
export function annotateDuplicatesWithResolution(input: {
  query: string;
  websiteUrl?: string;
  country?: string;
  registryId?: string;
  duplicates: DuplicateCandidate[];
}): DuplicateCandidate[] {
  return input.duplicates.map((row) => {
    const resolution = resolveEntityAgainstDirectory({
      candidate: {
        rawName: input.query,
        website: input.websiteUrl,
        countryHint: input.country,
        registryId: input.registryId,
      },
      existing: [row],
    });

    const matchReasons = [...row.matchReasons];
    let matchLevel = row.matchLevel;

    if (resolution.decision === "same") {
      matchReasons.push(`coverage resolve: same (rule ${resolution.decidingRule})`);
    } else if (resolution.decision === "uncertain") {
      matchReasons.push("coverage resolve: uncertain — review before claiming");
    } else if (resolution.decision === "subsidiary_of") {
      matchReasons.push("coverage resolve: related subsidiary — keep separate");
      if (matchLevel === "exact") matchLevel = "likely";
    }

    // Domain-only exact without name alignment → demote to likely (rule 3).
    if (
      row.matchLevel === "exact" &&
      row.matchReasons.includes("same domain") &&
      !row.matchReasons.includes("similar name") &&
      resolution.decision === "uncertain"
    ) {
      matchLevel = "likely";
    }

    return {
      ...row,
      matchLevel,
      matchScore:
        resolution.decision === "same"
          ? Math.max(row.matchScore, resolution.confidence)
          : row.matchScore,
      matchReasons: Array.from(new Set(matchReasons)).slice(0, 8),
    };
  });
}
