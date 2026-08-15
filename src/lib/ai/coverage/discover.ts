import type {
  CompanyEnrichment,
  WebCompanyDiscovery,
} from "@/lib/ai/company-web-enrich";
import { registrableDomainFromUrl } from "@/lib/organic-growth/privacy";
import { expandLaterallyFromPage } from "./lateral";
import {
  buildCoverageQueries,
  looksLikeRosterHit,
} from "./query-expansion";
import { extractRosterFromPage } from "./roster";
import type {
  CoverageDiscoveryMeta,
  CoverageLane,
  LateralCandidate,
  RosterCandidate,
} from "./types";

export type PublicSearchHit = {
  title: string;
  url: string;
  snippet: string;
};

export type FetchedPage = {
  ok: true;
  url: string;
  title?: string;
  description?: string;
  text: string;
  html: string;
} | { ok: false; message: string };

export type CoverageDiscoverInput = {
  query: string;
  country?: string;
  limit?: number;
  /** Injected search so we stay decoupled from DuckDuckGo internals. */
  searchWeb: (query: string) => Promise<PublicSearchHit[]>;
  /** Injected page fetch (avoids circular imports with company-web-enrich). */
  fetchPage: (url: string) => Promise<FetchedPage>;
  /** Enrich a single company website into a listing card. */
  enrichHit: (hit: PublicSearchHit) => Promise<CompanyEnrichment | null>;
  /** Allow one AI roster extract + one lateral expand per search. */
  allowAi?: boolean;
};

function uniqueHits(hits: PublicSearchHit[], limit = 16) {
  const out: PublicSearchHit[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    const key = hit.url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}

function candidateToShell(
  candidate: RosterCandidate | LateralCandidate,
  meta: {
    lane: CoverageLane;
    confidence: number;
    reasons: string[];
  },
): CompanyEnrichment {
  const website =
    ("website" in candidate ? candidate.website : null) ||
    ("profileUrl" in candidate ? candidate.profileUrl : null) ||
    undefined;
  const safeWebsite =
    website && /^https?:\/\//i.test(website) ? website : undefined;
  const categoryHints =
    "categoryHints" in candidate ? candidate.categoryHints ?? [] : [];

  return {
    companyName: candidate.rawName.slice(0, 160),
    legalName: candidate.rawName.slice(0, 160),
    websiteUrl: safeWebsite,
    phones: [],
    emails: [],
    addresses: [],
    countryCode: candidate.countryHint || undefined,
    locality: "cityHint" in candidate ? candidate.cityHint || undefined : undefined,
    companyTypes: mapRoleToTypes(
      "roleGuess" in candidate ? candidate.roleGuess : undefined,
      "relationship" in candidate ? candidate.relationship : undefined,
    ),
    categoryHints,
    publicProfiles: [],
    confidence: meta.confidence,
    publicSourceUrl: candidate.sourceUrl || safeWebsite,
    source: "web_search",
    usedAi: Boolean(candidate.evidenceQuote),
    fetchedUrl: candidate.sourceUrl || safeWebsite,
    headline:
      "relationship" in candidate
        ? `Related via ${candidate.relationship.replace(/_/g, " ")}`
        : undefined,
    description: candidate.evidenceQuote || undefined,
    matchReasons: meta.reasons,
  };
}

function mapRoleToTypes(
  role?: RosterCandidate["roleGuess"],
  relationship?: LateralCandidate["relationship"],
): CompanyEnrichment["companyTypes"] {
  if (role === "oem") return ["manufacturer"];
  if (role === "distributor") return ["supplier"];
  if (role === "integrator" || role === "service") return ["contractor"];
  if (relationship === "distributor_of_seed") return ["supplier"];
  if (relationship === "oem_of_seeds_distributor") return ["manufacturer"];
  if (relationship === "services_seed_brand") return ["contractor"];
  return ["supplier"];
}

function enrichmentHostKey(e: CompanyEnrichment) {
  const domain = registrableDomainFromUrl(e.websiteUrl);
  if (domain) return `d:${domain}`;
  return `n:${e.companyName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}`;
}

/**
 * Coverage-first discovery: expand queries → harvest roster pages → enrich
 * company sites → lateral expand from the best seed.
 */
export async function discoverCompaniesWithCoverage(
  input: CoverageDiscoverInput,
): Promise<WebCompanyDiscovery & { coverage: CoverageDiscoveryMeta }> {
  const query = input.query.trim();
  const limit = Math.min(input.limit ?? 6, 8);
  const allowAi = input.allowAi !== false;
  const lanesUsed: CoverageLane[] = ["direct_lookup"];
  const queriesExecuted: string[] = [];

  const querySet = buildCoverageQueries({
    query,
    country: input.country,
  });

  // Run primary + a few coverage probes (bounded for latency / rate limits).
  const searchBatch = Array.from(
    new Set(
      [
        ...querySet.primary.slice(0, 2),
        ...querySet.roster.slice(0, 3),
        ...querySet.regional.slice(0, 2),
      ]
        .map((q) => q.trim())
        .filter((q) => q.length >= 3),
    ),
  ).slice(0, 7);

  const hitLists = await Promise.all(
    searchBatch.map(async (q) => {
      queriesExecuted.push(q);
      try {
        return await input.searchWeb(q);
      } catch {
        return [] as PublicSearchHit[];
      }
    }),
  );

  const allHits = uniqueHits(hitLists.flat(), 18);
  const rosterHits = allHits.filter(looksLikeRosterHit).slice(0, 3);
  const companyHits = allHits.filter((h) => !looksLikeRosterHit(h));

  const enrichments: CompanyEnrichment[] = [];
  const seen = new Set<string>();

  const pushEnrichment = (e: CompanyEnrichment) => {
    const key = enrichmentHostKey(e);
    if (seen.has(key)) return;
    seen.add(key);
    enrichments.push(e);
  };

  // Lane: roster harvest (coverage)
  let rosterPagesFetched = 0;
  let candidatesFromRosters = 0;
  let usedRosterAi = false;

  for (const hit of rosterHits) {
    if (enrichments.length >= limit) break;
    const page = await input.fetchPage(hit.url);
    if (!page.ok) continue;
    rosterPagesFetched += 1;
    lanesUsed.push("roster_harvest");

    const extracted = await extractRosterFromPage({
      sourceUrl: page.url,
      pageText: page.text,
      html: page.html,
      useAi: allowAi && !usedRosterAi,
    });
    if (extracted.usedAi) usedRosterAi = true;

    for (const company of extracted.companies) {
      if (enrichments.length >= limit) break;
      candidatesFromRosters += 1;
      // Prefer enriching when we have a real website; otherwise shell card.
      if (company.website && /^https?:\/\//i.test(company.website)) {
        const enriched = await input.enrichHit({
          title: company.rawName,
          url: company.website,
          snippet: company.evidenceQuote,
        });
        if (enriched) {
          pushEnrichment({
            ...enriched,
            matchReasons: [
              ...enriched.matchReasons,
              `Coverage roster: ${hit.title || hit.url}`,
            ],
          });
          continue;
        }
      }
      pushEnrichment(
        candidateToShell(company, {
          lane: "roster_harvest",
          confidence: 0.4,
          reasons: [
            "Harvested from public roster / directory page",
            hit.title ? `Source: ${hit.title}` : `Source: ${hit.url}`,
            company.evidenceQuote
              ? `Evidence: ${company.evidenceQuote.slice(0, 80)}`
              : "Name listed on source page",
          ],
        }),
      );
    }
  }

  // Lane: direct company enrichments from search
  for (const hit of companyHits) {
    if (enrichments.length >= limit) break;
    const enriched = await input.enrichHit(hit);
    if (enriched) {
      pushEnrichment({
        ...enriched,
        matchReasons: [
          ...enriched.matchReasons,
          `Web search hit: ${hit.title}`,
        ],
      });
    }
  }

  // Lane: lateral expansion from the strongest enriched seed
  let candidatesFromLateral = 0;
  const seed = enrichments.find((e) => e.websiteUrl && (e.confidence ?? 0) >= 0.45);
  if (seed?.websiteUrl && allowAi && enrichments.length < limit) {
    const page = await input.fetchPage(seed.websiteUrl);
    if (page.ok) {
      lanesUsed.push("lateral_expansion");
      const lateral = await expandLaterallyFromPage({
        companyName: seed.companyName,
        companyDomain: registrableDomainFromUrl(seed.websiteUrl) || undefined,
        country: input.country || seed.countryCode,
        categoryHints: seed.categoryHints,
        pageText: page.text,
        pageUrl: page.url,
        useAi: true,
      });
      for (const related of lateral.candidates) {
        if (enrichments.length >= limit) break;
        candidatesFromLateral += 1;
        if (related.website && /^https?:\/\//i.test(related.website)) {
          const enriched = await input.enrichHit({
            title: related.rawName,
            url: related.website,
            snippet: related.evidenceQuote,
          });
          if (enriched) {
            pushEnrichment({
              ...enriched,
              matchReasons: [
                ...enriched.matchReasons,
                `Lateral: ${related.relationship.replace(/_/g, " ")} of ${seed.companyName}`,
              ],
            });
            continue;
          }
        }
        pushEnrichment(
          candidateToShell(related, {
            lane: "lateral_expansion",
            confidence:
              related.confidence === "high"
                ? 0.55
                : related.confidence === "medium"
                  ? 0.45
                  : 0.35,
            reasons: [
              `Related company via ${related.relationship.replace(/_/g, " ")}`,
              `Seed: ${seed.companyName}`,
              related.evidenceQuote
                ? `Evidence: ${related.evidenceQuote.slice(0, 80)}`
                : "Named on seed company page",
            ],
          }),
        );
      }
    }
  }

  if (querySet.regional.length > 0) {
    lanesUsed.push("regional_sweep");
  }

  const uniqueLanes = Array.from(new Set(lanesUsed));
  const coverageCount =
    candidatesFromRosters + candidatesFromLateral;
  const message =
    enrichments.length > 0
      ? coverageCount > 0
        ? `Found ${enrichments.length} candidate${enrichments.length === 1 ? "" : "s"} using coverage discovery (${candidatesFromRosters} from roster pages, ${candidatesFromLateral} related). Review before adding.`
        : `Found ${enrichments.length} public web candidate${enrichments.length === 1 ? "" : "s"}. Review extracted details or add the company with your own brief description.`
      : "No public websites found yet. Enter the company name and a brief description below, or try a full website URL.";

  return {
    query,
    enrichments: enrichments.slice(0, limit),
    searchHits: allHits.slice(0, 12),
    usedWebSearch: allHits.length > 0,
    message,
    coverage: {
      lanesUsed: uniqueLanes,
      queriesExecuted,
      rosterPagesFetched,
      candidatesFromRosters,
      candidatesFromLateral,
    },
  };
}
