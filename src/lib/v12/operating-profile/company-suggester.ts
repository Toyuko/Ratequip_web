/**
 * Suggest marketplace companies from a confirmed Business Operating Profile.
 * Deterministic explainable ranking — trust + category/adjacency relevance.
 */
import type { DemoCompany } from "@/lib/db/demo-data";
import { listCompaniesSync } from "@/lib/db/queries";
import { getSetupIndustryPack } from "@/lib/v12/operating-profile/interview";
import type {
  CompanyRole,
  OperatingProfileRecord,
  ProfileCompanySuggestion,
  SetupSuggestion,
} from "@/lib/v12/operating-profile/types";
import { scoreMatch } from "@/lib/v12/matching/scorer";
import { DEFAULT_MATCH_POLICY, type MatchFeature } from "@/lib/v12/matching/types";

/** Industry pack → marketplace category / keyword anchors */
const PACK_CATEGORY_HINTS: Record<string, string[]> = {
  pet_food: [
    "food-processing",
    "packaging-machinery",
    "cip-systems",
    "pumps",
    "tanks",
    "bottle-fillers",
    "inspection-qc",
  ],
  pharma_capping: [
    "packaging-machinery",
    "cappers",
    "labellers",
    "metal-detectors",
    "inspection-qc",
    "commissioning",
    "sensors",
  ],
  hand_sanitiser: [
    "food-processing",
    "packaging-machinery",
    "bottle-fillers",
    "pumps",
    "cip-systems",
    "industrial-hvac",
    "tanks",
  ],
  mining_assay: [
    "inspection-qc",
    "industrial-equipment",
    "heavy-logistics",
    "professional-services",
    "commissioning",
    "sensors",
  ],
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function tokensFromText(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2);
}

function companyBlob(c: DemoCompany): string {
  return [
    c.name,
    c.headline,
    c.description,
    c.city,
    c.country,
    ...c.categories,
  ]
    .join(" ")
    .toLowerCase();
}

function adjacencyKeywords(suggestions: SetupSuggestion[]): string[] {
  return suggestions
    .filter((s) => s.status === "accepted")
    .flatMap((s) => tokensFromText(s.label));
}

function answerKeywords(answers: Record<string, string>): string[] {
  return Object.values(answers).flatMap((v) => tokensFromText(v)).slice(0, 40);
}

export function buildProfileSearchContext(input: {
  role: CompanyRole;
  industryPack: string;
  answers: Record<string, string>;
  suggestions: SetupSuggestion[];
}): {
  categoryHints: string[];
  keywords: string[];
  regionHints: string[];
  intent: "find_suppliers" | "find_buyers" | "find_partners";
} {
  const pack = getSetupIndustryPack(input.industryPack);
  const categoryHints = [
    ...(PACK_CATEGORY_HINTS[input.industryPack] ?? []),
    ...pack.adjacent.flatMap((a) => tokensFromText(a)),
  ];
  const keywords = [
    ...categoryHints,
    ...adjacencyKeywords(input.suggestions),
    ...answerKeywords(input.answers),
    input.industryPack.replace(/_/g, " "),
  ];
  const locationAnswer = input.answers["universal.locations"] ?? "";
  const regionHints = tokensFromText(locationAnswer);
  const intentAnswer = input.answers["universal.intent"] ?? "";
  let intent: "find_suppliers" | "find_buyers" | "find_partners" =
    "find_partners";
  if (
    input.role === "buyer" ||
    intentAnswer === "find_supplier" ||
    intentAnswer === "create_rfq"
  ) {
    intent = "find_suppliers";
  } else if (input.role === "supplier" || intentAnswer === "publish_products") {
    intent = "find_buyers";
  } else if (input.role === "contractor") {
    intent = "find_partners";
  }
  return {
    categoryHints: [...new Set(categoryHints)],
    keywords: [...new Set(keywords)].slice(0, 60),
    regionHints: [...new Set(regionHints)],
    intent,
  };
}

function relevanceScore(
  company: DemoCompany,
  ctx: ReturnType<typeof buildProfileSearchContext>,
): { value: number; hits: string[] } {
  const blob = companyBlob(company);
  const hits: string[] = [];
  let score = 0;
  for (const cat of company.categories) {
    if (ctx.categoryHints.some((h) => cat.includes(h) || h.includes(cat))) {
      score += 0.22;
      hits.push(`category:${cat}`);
    }
  }
  for (const kw of ctx.keywords) {
    if (kw.length < 4) continue;
    if (blob.includes(kw)) {
      score += 0.04;
      if (hits.length < 6) hits.push(`keyword:${kw}`);
    }
  }
  return { value: clamp01(score), hits };
}

function regionScore(
  company: DemoCompany,
  regionHints: string[],
): { value: number; hit?: string } {
  if (regionHints.length === 0) return { value: 0.65 };
  const blob = `${company.city} ${company.country}`.toLowerCase();
  for (const r of regionHints) {
    if (blob.includes(r)) return { value: 1, hit: `region:${r}` };
  }
  // Soft preference for AU demo footprint when profile mentions australia/au
  if (
    regionHints.some((r) => ["australia", "au", "nsw", "vic", "qld"].includes(r)) &&
    company.country.toLowerCase().includes("australia")
  ) {
    return { value: 0.9, hit: "region:australia" };
  }
  return { value: 0.45 };
}

export function suggestCompaniesForOperatingProfile(
  profile: Pick<
    OperatingProfileRecord,
    "id" | "companyId" | "companyName" | "role" | "industryPack" | "answers" | "suggestions"
  >,
  opts?: { limit?: number; excludeSlugs?: string[] },
): ProfileCompanySuggestion[] {
  const limit = opts?.limit ?? 6;
  const exclude = new Set(
    (opts?.excludeSlugs ?? []).concat(
      profile.companyName
        ? [profile.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")]
        : [],
    ),
  );
  const ctx = buildProfileSearchContext({
    role: profile.role,
    industryPack: profile.industryPack,
    answers: profile.answers,
    suggestions: profile.suggestions,
  });

  let companies = listCompaniesSync({});
  // Prefer a filtered pass when we have strong category hints
  if (ctx.categoryHints.length > 0) {
    const filtered = listCompaniesSync({
      q: ctx.categoryHints.slice(0, 3).join(" "),
    });
    if (filtered.length >= 3) companies = filtered;
  }

  const scored = companies
    .filter((c) => !exclude.has(c.slug) && c.name !== profile.companyName)
    .map((c) => {
      const rel = relevanceScore(c, ctx);
      const geo = regionScore(c, ctx.regionHints);
      const trust = clamp01(c.trustScore / 100);
      const verifiedBoost = c.verified ? 0.12 : 0;
      const claimedBoost = c.claimed ? 0.05 : 0;

      const features: MatchFeature[] = [
        {
          key: "capability",
          value: rel.value,
          weight: 0.28,
          reasonCode: rel.hits[0] ?? "profile_relevance",
        },
        {
          key: "industry",
          value: rel.value,
          weight: 0.18,
          reasonCode: "industry_alignment",
        },
        {
          key: "trust",
          value: trust,
          weight: 0.22,
          reasonCode: c.verified ? "trusted_verified" : "trust_score",
        },
        {
          key: "geography",
          value: geo.value,
          weight: 0.12,
          reasonCode: geo.hit ?? "geo_soft",
        },
        {
          key: "response",
          value: c.claimed ? 0.85 : 0.45,
          weight: 0.08,
          reasonCode: "claimed_profile",
        },
        {
          key: "commercial",
          value: clamp01(0.55 + verifiedBoost + claimedBoost),
          weight: 0.06,
          reasonCode:
            ctx.intent === "find_suppliers"
              ? "trusted_supplier_candidate"
              : ctx.intent === "find_buyers"
                ? "relevant_buyer_partner"
                : "relevant_partner",
        },
      ];

      const match = scoreMatch(features, DEFAULT_MATCH_POLICY);
      // Floor boost for high-trust verified companies so “trusted suppliers” surface
      const adjusted =
        match.score +
        (c.verified && c.trustScore >= 85 ? 6 : 0) +
        (rel.value >= 0.35 ? 4 : 0);

      const reasons = [
        ...match.reasons,
        ...rel.hits.slice(0, 2),
        ...(geo.hit ? [geo.hit] : []),
        c.verified ? "verified_company" : "unverified_company",
        `trust:${Math.round(c.trustScore)}`,
      ].slice(0, 8);

      return {
        company: c,
        score: adjusted,
        confidence: match.confidence,
        reasons,
        policyVersion: match.policyVersion,
      };
    })
    .filter((x) => x.score >= 38)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.company.trustScore - a.company.trustScore ||
        a.company.name.localeCompare(b.company.name),
    );

  // Diversity: prefer different primary categories
  const picked: typeof scored = [];
  const categoryCount = new Map<string, number>();
  for (const row of scored) {
    if (picked.length >= limit) break;
    const cat = row.company.categories[0] ?? "general";
    const n = categoryCount.get(cat) ?? 0;
    if (n >= 2) continue;
    picked.push(row);
    categoryCount.set(cat, n + 1);
  }

  return picked.map((row, i) => ({
    id: `pcs-${profile.id}-${row.company.slug}`,
    companyId: row.company.id,
    companySlug: row.company.slug,
    companyName: row.company.name,
    headline: row.company.headline,
    country: row.company.country,
    city: row.company.city,
    categories: row.company.categories.slice(0, 4),
    trustScore: row.company.trustScore,
    verified: row.company.verified,
    claimed: row.company.claimed,
    rank: i + 1,
    score: Math.round(row.score * 10) / 10,
    confidence: row.confidence,
    reasons: row.reasons,
    badge:
      row.company.verified && row.company.trustScore >= 85
        ? ("trusted_supplier" as const)
        : row.score >= 70
          ? ("strong_fit" as const)
          : ("relevant" as const),
    status: "suggested" as const,
    policyVersion: `ops-suggest/${row.policyVersion}`,
  }));
}
