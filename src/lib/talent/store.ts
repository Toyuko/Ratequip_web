import type {
  CanonicalApplication,
  CanonicalGig,
  GigPublication,
  IdentityLink,
  InboundEvent,
  OperatorAvailability,
  OperatorCredential,
  OperatorProfile,
  OutboxRow,
} from "@/lib/talent/types";

export type TalentStore = {
  operators: OperatorProfile[];
  credentials: OperatorCredential[];
  availability: OperatorAvailability[];
  identityLinks: IdentityLink[];
  gigs: CanonicalGig[];
  publications: GigPublication[];
  applications: CanonicalApplication[];
  inbound: InboundEvent[];
  outbox: OutboxRow[];
  mergeSnapshots: {
    id: string;
    survivingPartyId: string;
    absorbedPartyId: string;
    preMerge: Record<string, unknown>;
    rule: string;
    reversedAt?: string;
  }[];
};

function empty(): TalentStore {
  return {
    operators: [],
    credentials: [],
    availability: [],
    identityLinks: [],
    gigs: [],
    publications: [],
    applications: [],
    inbound: [],
    outbox: [],
    mergeSnapshots: [],
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __ratequipTalentStore: TalentStore | undefined;
}

export function getTalentStore(): TalentStore {
  if (!globalThis.__ratequipTalentStore) {
    globalThis.__ratequipTalentStore = empty();
  }
  return globalThis.__ratequipTalentStore;
}

export function resetTalentStore() {
  globalThis.__ratequipTalentStore = empty();
}
