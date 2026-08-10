import { listCapabilities, listParties } from "@/lib/collaborate/engine";
import { getCollaborateStore } from "@/lib/collaborate/store";
import type { Requirement } from "@/lib/collaborate/types";

export type MatchCandidate = {
  partyId: string;
  legalName: string;
  score: number;
  reasons: string[];
  capabilityIds: string[];
};

/**
 * Matching pipeline Phase 0 slice (§4):
 * retrieval → scoring → explanation.
 * Team assembly deferred to Phase 3.
 */
export function matchRequirement(requirement: Requirement): MatchCandidate[] {
  const store = getCollaborateStore();
  const parties = listParties();
  const caps = listCapabilities();
  const results: MatchCandidate[] = [];

  for (const party of parties) {
    const partyCaps = caps.filter((c) => c.partyId === party.partyId);
    const matched = partyCaps.filter(
      (c) =>
        c.taxonomyId === requirement.taxonomyId ||
        c.taxonomyId.startsWith(requirement.taxonomyId.split(".").slice(0, 2).join(".")),
    );
    if (matched.length === 0) continue;

    // Hard filters
    if (
      requirement.jurisdictionConstraint &&
      !party.jurisdiction.startsWith(
        requirement.jurisdictionConstraint.split("-")[0]!,
      )
    ) {
      continue;
    }

    let score = 0;
    const reasons: string[] = [];

    for (const cap of matched) {
      if (cap.taxonomyId === requirement.taxonomyId) {
        score += 40;
        reasons.push(`Exact capability match: ${cap.taxonomyId}`);
      } else {
        score += 15;
        reasons.push(`Neighbour capability: ${cap.taxonomyId}`);
      }
      if (cap.verifiedState === "DELIVERY_PROVEN") {
        score += 35;
        reasons.push("DELIVERY_PROVEN on this capability");
      } else if (cap.verifiedState === "THIRD_PARTY_VERIFIED") {
        score += 15;
        reasons.push("Third-party verified capability");
      }
    }

    const rep = store.reputationProjections.find(
      (p) => p.partyId === party.partyId,
    );
    const onTime = rep?.dimensions.on_time_delivery;
    if (onTime && onTime.sampleSize >= 3) {
      score += Math.round(onTime.score * 0.2);
      reasons.push(`On-time rate ${onTime.score}% (n=${onTime.sampleSize})`);
    }

    // Cold-start bounded exposure (§4.2)
    if (
      !rep ||
      Object.keys(rep.dimensions).length === 0
    ) {
      score += 5;
      reasons.push("Bounded cold-start exposure allocation");
    }

    results.push({
      partyId: party.partyId,
      legalName: party.legalName,
      score,
      reasons,
      capabilityIds: matched.map((c) => c.capabilityId),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}
