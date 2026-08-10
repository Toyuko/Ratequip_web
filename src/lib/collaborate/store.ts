import type {
  Capability,
  CollaborateWorkspace,
  DomainEvent,
  Engagement,
  FeeQuote,
  Party,
  PartyMembership,
  PendingTaxonomyTerm,
  PayoutProfile,
  ReputationEvent,
  ReputationProjection,
  SessionOffering,
  TaxonomyTerm,
  VerificationRecord,
} from "@/lib/collaborate/types";
import { SEED_TAXONOMY } from "@/lib/collaborate/taxonomy";
import type { HoldRef, CaptureRef, PayoutRef } from "@/lib/collaborate/payment-provider";

export type MoneyLedgerEntry = {
  hold?: HoldRef;
  capture?: CaptureRef;
  payouts?: PayoutRef[];
  milestoneId: string;
  engagementId: string;
};

export type CollaborateStore = {
  parties: Party[];
  memberships: PartyMembership[];
  capabilities: Capability[];
  engagements: Engagement[];
  feeQuotes: FeeQuote[];
  events: DomainEvent[];
  reputationEvents: ReputationEvent[];
  reputationProjections: ReputationProjection[];
  offerings: SessionOffering[];
  workspaces: CollaborateWorkspace[];
  verifications: VerificationRecord[];
  payoutProfiles: PayoutProfile[];
  taxonomy: TaxonomyTerm[];
  pendingTaxonomy: PendingTaxonomyTerm[];
  moneyLedger: MoneyLedgerEntry[];
  idempotency: Map<string, string>;
};

function seed(): CollaborateStore {
  return {
    parties: [],
    memberships: [],
    capabilities: [],
    engagements: [],
    feeQuotes: [],
    events: [],
    reputationEvents: [],
    reputationProjections: [],
    offerings: [],
    workspaces: [],
    verifications: [],
    payoutProfiles: [],
    taxonomy: structuredClone(SEED_TAXONOMY),
    pendingTaxonomy: [],
    moneyLedger: [],
    idempotency: new Map(),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __ratequipCollaborateStore: CollaborateStore | undefined;
}

export function getCollaborateStore(): CollaborateStore {
  if (!globalThis.__ratequipCollaborateStore) {
    globalThis.__ratequipCollaborateStore = seed();
  }
  return globalThis.__ratequipCollaborateStore;
}

export function resetCollaborateStore() {
  globalThis.__ratequipCollaborateStore = seed();
}
