export interface Candidate {
  id: string;
  eligible: boolean;
  organicScore: number;
  sponsored: boolean;
  category: string;
  supplierId?: string;
  reasonCodes: string[];
  policyVersion?: string;
}

export interface Ranked extends Candidate {
  rank: number;
}

/** ADR-0017: sponsorship never bypasses eligibility or organic floor */
export function rankCandidates(candidates: Candidate[], limit: number): Ranked[] {
  const eligible = candidates
    .filter((x) => x.eligible && x.organicScore >= 40)
    .sort(
      (a, b) =>
        b.organicScore - a.organicScore || a.id.localeCompare(b.id),
    );
  const selected: Candidate[] = [];
  const supplierCount = new Map<string, number>();
  const categoryCount = new Map<string, number>();
  for (const c of eligible) {
    if (selected.length >= limit) break;
    const sc = supplierCount.get(c.supplierId ?? "") ?? 0;
    const cc = categoryCount.get(c.category) ?? 0;
    if (sc >= 2 || cc >= Math.ceil(limit / 2)) continue;
    selected.push(c);
    supplierCount.set(c.supplierId ?? "", sc + 1);
    categoryCount.set(c.category, cc + 1);
  }
  return selected.map((x, i) => ({ ...x, rank: i + 1 }));
}
