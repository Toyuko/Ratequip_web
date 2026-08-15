import type {
  CanonicalGig,
  OperatorAvailability,
  OperatorCredential,
  PlacementBlockReason,
} from "@/lib/talent/types";

export function isCredentialUsable(
  cred: OperatorCredential,
  gigEnd: string,
  now = new Date(),
): boolean {
  if (cred.status !== "ACTIVE") return false;
  if (!cred.verifiedAt) return false;
  if (cred.expiresAt && new Date(cred.expiresAt) <= now) return false;
  if (cred.expiresAt && new Date(cred.expiresAt) < new Date(gigEnd)) return false;
  return true;
}

export function expireIfNeeded(
  cred: OperatorCredential,
  now = new Date(),
): OperatorCredential {
  if (
    cred.status === "ACTIVE" &&
    cred.expiresAt &&
    new Date(cred.expiresAt) <= now
  ) {
    return { ...cred, status: "EXPIRED" };
  }
  return cred;
}

export function expiryRunwayDays(cred: OperatorCredential, now = new Date()) {
  if (!cred.expiresAt) return null;
  return Math.ceil(
    (new Date(cred.expiresAt).getTime() - now.getTime()) / 86_400_000,
  );
}

export function placementBlocks(input: {
  credentials: OperatorCredential[];
  required: string[];
  gig: CanonicalGig;
  availability: OperatorAvailability[];
  overlappingPlacedGigIds: string[];
  rightToWorkVerifiedAt?: string;
  operatorStatus: string;
  now?: Date;
}): PlacementBlockReason[] {
  const now = input.now ?? new Date();
  const blocks: PlacementBlockReason[] = [];
  if (input.operatorStatus !== "ACTIVE") blocks.push("INACTIVE");
  if (!input.rightToWorkVerifiedAt) blocks.push("NO_RIGHT_TO_WORK");
  if (input.overlappingPlacedGigIds.length > 0) blocks.push("OVERLAPPING_GIG");

  for (const required of input.required) {
    const held = input.credentials.filter((c) => c.credentialType === required);
    if (held.length === 0) {
      blocks.push("MISSING_CREDENTIAL");
      continue;
    }
    const usable = held.some((c) => isCredentialUsable(c, input.gig.endsAt, now));
    if (!usable) {
      const expired = held.some(
        (c) => c.expiresAt && new Date(c.expiresAt) <= now,
      );
      blocks.push(expired ? "EXPIRED_CREDENTIAL" : "UNVERIFIED_CREDENTIAL");
    }
  }

  const covers = input.availability.some(
    (a) =>
      new Date(a.windowStart) <= new Date(input.gig.startsAt) &&
      new Date(a.windowEnd) >= new Date(input.gig.endsAt),
  );
  if (!covers) blocks.push("UNAVAILABLE");

  if (
    input.gig.siteLat != null &&
    input.gig.siteLng != null &&
    input.availability.length > 0
  ) {
    const inRadius = input.availability.some((a) => {
      if (a.baseLat == null || a.baseLng == null) return true;
      return (
        haversineKm(a.baseLat, a.baseLng, input.gig.siteLat!, input.gig.siteLng!) <=
        a.radiusKm
      );
    });
    if (!inRadius) blocks.push("OUT_OF_RADIUS");
  }

  return [...new Set(blocks)];
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
