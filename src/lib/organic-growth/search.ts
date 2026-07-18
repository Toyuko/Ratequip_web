import { listCompanies } from "@/lib/db/queries";
import { registrableDomainFromUrl } from "./privacy";
import type { DuplicateCandidate, MatchLevel } from "./types";

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(
      /\b(ltd|limited|inc|incorporated|llc|co|company|corp|corporation|gmbh|pty|plc|sa|bv|ag)\b/g,
      "",
    )
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function scoreNameSimilarity(a: string, b: string) {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.82;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = right.split(" ").filter(Boolean);
  if (rightTokens.length === 0) return 0;
  const overlap = rightTokens.filter((t) => leftTokens.has(t)).length;
  return overlap / Math.max(leftTokens.size, rightTokens.length);
}

function matchLevelFromScore(score: number, exactDomain: boolean): MatchLevel | null {
  if (exactDomain || score >= 0.95) return "exact";
  if (score >= 0.72) return "likely";
  if (score >= 0.45) return "possible";
  return null;
}

export async function findDuplicateCandidates(input: {
  query?: string;
  companyName?: string;
  websiteUrl?: string;
  country?: string;
}): Promise<DuplicateCandidate[]> {
  const query = (input.query ?? input.companyName ?? "").trim();
  const domain = registrableDomainFromUrl(input.websiteUrl);
  if (!query && !domain) return [];

  const results: DuplicateCandidate[] = [];

  for (const company of await listCompanies({
    q: query || undefined,
    country: input.country,
    limit: 500,
  })) {
    const companyDomain = registrableDomainFromUrl(company.website);
    const exactDomain = Boolean(domain && companyDomain && domain === companyDomain);
    const nameScore = scoreNameSimilarity(query || company.name, company.name);
    const countryBoost =
      input.country &&
      company.country.toLowerCase().includes(input.country.toLowerCase())
        ? 0.08
        : 0;
    const score = Math.min(1, (exactDomain ? 1 : nameScore) + countryBoost);
    const level = matchLevelFromScore(score, exactDomain);
    if (!level) continue;

    const matchReasons: string[] = [];
    if (exactDomain) matchReasons.push("same domain");
    if (nameScore >= 0.72) matchReasons.push("similar name");
    if (countryBoost > 0) matchReasons.push("same country/location");

    results.push({
      companyId: company.id,
      companySlug: company.slug,
      name: company.name,
      website: company.website,
      city: company.city,
      country: company.country,
      claimed: company.claimed,
      verified: company.verified,
      matchLevel: level,
      matchScore: Number(score.toFixed(4)),
      matchReasons,
    });
  }

  return results.sort((a, b) => {
    const order = { exact: 0, likely: 1, possible: 2 } as const;
    if (order[a.matchLevel] !== order[b.matchLevel]) {
      return order[a.matchLevel] - order[b.matchLevel];
    }
    return b.matchScore - a.matchScore;
  });
}

export function groupDuplicateCandidates(candidates: DuplicateCandidate[]) {
  return {
    exact: candidates.filter((c) => c.matchLevel === "exact"),
    likely: candidates.filter((c) => c.matchLevel === "likely"),
    other: candidates.filter((c) => c.matchLevel === "possible"),
  };
}
