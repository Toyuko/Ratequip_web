import { eq } from "drizzle-orm";
import { hasDatabase } from "@/lib/config";
import { getDb } from "@/lib/db";
import { collaborateParties, collaborateRuntime } from "@/lib/db/schema";
import { getCollaborateStore } from "@/lib/collaborate/store";
import type { CollaborateStore } from "@/lib/collaborate/store";
import type { Party } from "@/lib/collaborate/types";

const SNAPSHOT_ID = "default";

declare global {
  // eslint-disable-next-line no-var
  var __ratequipCollaborateHydrated: boolean | undefined;
}

function serializeStore(store: CollaborateStore) {
  return {
    parties: store.parties,
    memberships: store.memberships,
    capabilities: store.capabilities,
    engagements: store.engagements,
    feeQuotes: store.feeQuotes,
    events: store.events,
    reputationEvents: store.reputationEvents,
    reputationProjections: store.reputationProjections,
    offerings: store.offerings,
    workspaces: store.workspaces,
    verifications: store.verifications,
    payoutProfiles: store.payoutProfiles,
    taxonomy: store.taxonomy,
    pendingTaxonomy: store.pendingTaxonomy,
    moneyLedger: store.moneyLedger,
    idempotency: Object.fromEntries(store.idempotency),
  };
}

function applySnapshot(
  store: CollaborateStore,
  snapshot: Record<string, unknown>,
) {
  const asArray = <T>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
  store.parties = asArray(snapshot.parties);
  store.memberships = asArray(snapshot.memberships);
  store.capabilities = asArray(snapshot.capabilities);
  store.engagements = asArray(snapshot.engagements);
  store.feeQuotes = asArray(snapshot.feeQuotes);
  store.events = asArray(snapshot.events);
  store.reputationEvents = asArray(snapshot.reputationEvents);
  store.reputationProjections = asArray(snapshot.reputationProjections);
  store.offerings = asArray(snapshot.offerings);
  store.workspaces = asArray(snapshot.workspaces);
  store.verifications = asArray(snapshot.verifications);
  store.payoutProfiles = asArray(snapshot.payoutProfiles);
  if (asArray(snapshot.taxonomy).length > 0) {
    store.taxonomy = asArray(snapshot.taxonomy);
  }
  store.pendingTaxonomy = asArray(snapshot.pendingTaxonomy);
  store.moneyLedger = asArray(snapshot.moneyLedger);
  const idem = snapshot.idempotency;
  store.idempotency = new Map(
    idem && typeof idem === "object"
      ? Object.entries(idem as Record<string, string>)
      : [],
  );
}

export async function hydrateCollaborateStore() {
  if (!hasDatabase()) return;
  if (globalThis.__ratequipCollaborateHydrated) return;
  const db = getDb();
  if (!db) return;
  try {
    const rows = await db
      .select()
      .from(collaborateRuntime)
      .where(eq(collaborateRuntime.id, SNAPSHOT_ID))
      .limit(1);
    const row = rows[0];
    if (row?.snapshot) {
      applySnapshot(getCollaborateStore(), row.snapshot);
    }
    globalThis.__ratequipCollaborateHydrated = true;
  } catch (error) {
    console.warn("[collaborate] hydrate failed", error);
  }
}

export async function flushCollaborateStore() {
  if (!hasDatabase()) return;
  const db = getDb();
  if (!db) return;
  const store = getCollaborateStore();
  const snapshot = serializeStore(store);
  try {
    await db
      .insert(collaborateRuntime)
      .values({
        id: SNAPSHOT_ID,
        snapshot,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: collaborateRuntime.id,
        set: { snapshot, updatedAt: new Date() },
      });

    for (const party of store.parties) {
      await upsertCollaborateParty(party);
    }
  } catch (error) {
    console.warn("[collaborate] flush failed", error);
  }
}

export async function upsertCollaborateParty(party: Party) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(collaborateParties)
    .values({
      partyId: party.partyId,
      kind: party.kind,
      legalName: party.legalName,
      jurisdiction: party.jurisdiction,
      contactEmail: party.contactEmail,
      timezone: party.timezone,
      verificationTier: party.verificationTier,
      createdAt: new Date(party.createdAt),
    })
    .onConflictDoUpdate({
      target: collaborateParties.partyId,
      set: {
        legalName: party.legalName,
        contactEmail: party.contactEmail,
        verificationTier: party.verificationTier,
        updatedAt: new Date(),
      },
    });
}
