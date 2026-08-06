import type {
  BusinessFact,
  BusinessProfile,
  SetupCheckpoint,
} from "@/lib/v13/part7/types";

type Part7Store = {
  profiles: BusinessProfile[];
  facts: BusinessFact[];
  checkpoints: SetupCheckpoint[];
  idempotency: Map<string, string>;
};

declare global {
  // eslint-disable-next-line no-var
  var __ratequipPart7Store: Part7Store | undefined;
}

function seed(): Part7Store {
  return {
    profiles: [],
    facts: [],
    checkpoints: [],
    idempotency: new Map(),
  };
}

export function getPart7Store(): Part7Store {
  if (!globalThis.__ratequipPart7Store) {
    globalThis.__ratequipPart7Store = seed();
  }
  return globalThis.__ratequipPart7Store;
}

export function resetPart7Store() {
  globalThis.__ratequipPart7Store = seed();
}
