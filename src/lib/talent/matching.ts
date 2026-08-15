import {
  haversineKm,
  isCredentialUsable,
  placementBlocks,
} from "@/lib/talent/credentials";
import type {
  CanonicalGig,
  OperatorAvailability,
  OperatorCredential,
  OperatorProfile,
} from "@/lib/talent/types";

export type TalentMatch = {
  partyId: string;
  legalName: string;
  score: number;
  reasons: string[];
  blocked: string[];
};

export function matchGigToOperators(input: {
  gig: CanonicalGig;
  operators: OperatorProfile[];
  credentialsByParty: Map<string, OperatorCredential[]>;
  availabilityByParty: Map<string, OperatorAvailability[]>;
  overlappingByParty: Map<string, string[]>;
}): TalentMatch[] {
  const results: TalentMatch[] = [];

  for (const op of input.operators) {
    if (op.status !== "ACTIVE") continue;
    const creds = input.credentialsByParty.get(op.partyId) ?? [];
    const avail = input.availabilityByParty.get(op.partyId) ?? [];
    const blocked = placementBlocks({
      credentials: creds,
      required: input.gig.requiredCredentials,
      gig: input.gig,
      availability: avail,
      overlappingPlacedGigIds: input.overlappingByParty.get(op.partyId) ?? [],
      rightToWorkVerifiedAt: op.rightToWorkVerifiedAt,
      operatorStatus: op.status,
    });

    let score = 0;
    const reasons: string[] = [];
    if (blocked.length === 0) {
      score += 50;
      reasons.push("Passes hard filters");
    }

    const machineCreds = creds.filter((c) =>
      isCredentialUsable(c, input.gig.endsAt),
    );
    if (machineCreds.length >= input.gig.requiredCredentials.length) {
      score += 20;
      reasons.push("All required tickets current");
    }
    if (op.verifiedIdentityAt) {
      score += 10;
      reasons.push("Identity verified");
    }
    if (
      op.homeLat != null &&
      op.homeLng != null &&
      input.gig.siteLat != null &&
      input.gig.siteLng != null
    ) {
      const km = haversineKm(
        op.homeLat,
        op.homeLng,
        input.gig.siteLat,
        input.gig.siteLng,
      );
      score += Math.max(0, 15 - Math.round(km / 10));
      reasons.push(`${Math.round(km)} km from site`);
    }

    results.push({
      partyId: op.partyId,
      legalName: op.legalName,
      score,
      reasons,
      blocked,
    });
  }

  return results.sort((a, b) => {
    const aOk = a.blocked.length === 0 ? 1 : 0;
    const bOk = b.blocked.length === 0 ? 1 : 0;
    if (aOk !== bOk) return bOk - aOk;
    return b.score - a.score;
  });
}
