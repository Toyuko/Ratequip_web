import { and, eq, isNull, lte } from "drizzle-orm";
import { hasDatabase } from "@/lib/config";
import { getDb } from "@/lib/db";
import {
  collaborateParties,
  talentApplications,
  talentGigPublications,
  talentGigs,
  talentInboundEvents,
  talentMergeSnapshots,
  talentOperatorAvailability,
  talentOperatorCredentials,
  talentOperatorIdentityLinks,
  talentOutbox,
} from "@/lib/db/schema";
import { getTalentStore } from "@/lib/talent/store";
import type {
  BoardId,
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

function ts(value: Date | string | null | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : value;
}

function asDate(value?: string | null) {
  return value ? new Date(value) : null;
}

export async function persistPartyRow(op: OperatorProfile) {
  const db = getDb();
  if (!db) return;
  await db
    .insert(collaborateParties)
    .values({
      partyId: op.partyId,
      kind: "INDIVIDUAL",
      legalName: op.legalName,
      jurisdiction: op.jurisdiction,
      contactEmail: op.primaryEmailNorm,
      timezone: "Australia/Sydney",
      verificationTier: op.verifiedIdentityAt ? "T2" : "T0",
      userId: undefined,
      primaryEmailNorm: op.primaryEmailNorm,
      primaryPhoneE164: op.primaryPhoneE164,
      givenName: op.givenName,
      familyName: op.familyName,
      verifiedIdentityAt: asDate(op.verifiedIdentityAt),
      homeLat: op.homeLat,
      homeLng: op.homeLng,
      createdViaBoard: op.createdViaBoard,
      operatorStatus: op.status,
      poolConsentAt: asDate(op.poolConsentAt),
      privacyNoticeVersion: op.privacyNoticeVersion,
      rightToWorkVerifiedAt: asDate(op.rightToWorkVerifiedAt),
    })
    .onConflictDoUpdate({
      target: collaborateParties.partyId,
      set: {
        legalName: op.legalName,
        contactEmail: op.primaryEmailNorm,
        primaryEmailNorm: op.primaryEmailNorm,
        primaryPhoneE164: op.primaryPhoneE164,
        givenName: op.givenName,
        familyName: op.familyName,
        verifiedIdentityAt: asDate(op.verifiedIdentityAt),
        homeLat: op.homeLat,
        homeLng: op.homeLng,
        createdViaBoard: op.createdViaBoard,
        operatorStatus: op.status,
        poolConsentAt: asDate(op.poolConsentAt),
        privacyNoticeVersion: op.privacyNoticeVersion,
        rightToWorkVerifiedAt: asDate(op.rightToWorkVerifiedAt),
        updatedAt: new Date(),
      },
    });
}

export async function loadOperators(): Promise<OperatorProfile[]> {
  const db = getDb();
  if (!db) return getTalentStore().operators;
  try {
    const rows = await db.select().from(collaborateParties);
    return rows
      .filter((r) => r.kind === "INDIVIDUAL" && r.primaryEmailNorm)
      .map((r) => ({
        partyId: r.partyId,
        status: (r.operatorStatus as OperatorProfile["status"]) ?? "ACTIVE",
        legalName: r.legalName,
        givenName: r.givenName ?? undefined,
        familyName: r.familyName ?? undefined,
        primaryEmailNorm: r.primaryEmailNorm ?? r.contactEmail.toLowerCase(),
        primaryPhoneE164: r.primaryPhoneE164 ?? undefined,
        homeLat: r.homeLat ?? undefined,
        homeLng: r.homeLng ?? undefined,
        createdViaBoard: (r.createdViaBoard as BoardId | undefined) ?? undefined,
        verifiedIdentityAt: ts(r.verifiedIdentityAt),
        poolConsentAt: ts(r.poolConsentAt),
        privacyNoticeVersion: r.privacyNoticeVersion ?? undefined,
        rightToWorkVerifiedAt: ts(r.rightToWorkVerifiedAt),
        jurisdiction: r.jurisdiction,
        userId: r.userId ?? undefined,
        createdAt: ts(r.createdAt) ?? new Date().toISOString(),
      }));
  } catch (error) {
    console.warn("[talent] loadOperators failed", error);
    return getTalentStore().operators;
  }
}

export async function persistCredential(cred: OperatorCredential) {
  const store = getTalentStore();
  const idx = store.credentials.findIndex((c) => c.id === cred.id);
  if (idx >= 0) store.credentials[idx] = cred;
  else store.credentials.push(cred);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentOperatorCredentials)
    .values({
      id: cred.id,
      partyId: cred.partyId,
      credentialType: cred.credentialType,
      identifier: cred.identifier,
      issuingJurisdiction: cred.issuingJurisdiction,
      issuedAt: asDate(cred.issuedAt),
      expiresAt: asDate(cred.expiresAt),
      verificationMethod: cred.verificationMethod,
      verifiedAt: asDate(cred.verifiedAt),
      verifiedBy: cred.verifiedBy,
      documentBlobUrl: cred.documentBlobUrl,
      status: cred.status,
    })
    .onConflictDoUpdate({
      target: talentOperatorCredentials.id,
      set: {
        identifier: cred.identifier,
        expiresAt: asDate(cred.expiresAt),
        verificationMethod: cred.verificationMethod,
        verifiedAt: asDate(cred.verifiedAt),
        verifiedBy: cred.verifiedBy,
        documentBlobUrl: cred.documentBlobUrl,
        status: cred.status,
        updatedAt: new Date(),
      },
    });
}

export async function loadCredentials(): Promise<OperatorCredential[]> {
  const db = getDb();
  if (!db) return getTalentStore().credentials;
  try {
    const rows = await db.select().from(talentOperatorCredentials);
    return rows.map((r) => ({
      id: r.id,
      partyId: r.partyId,
      credentialType: r.credentialType,
      identifier: r.identifier ?? undefined,
      issuingJurisdiction: r.issuingJurisdiction,
      issuedAt: ts(r.issuedAt),
      expiresAt: ts(r.expiresAt),
      verificationMethod:
        r.verificationMethod as OperatorCredential["verificationMethod"],
      verifiedAt: ts(r.verifiedAt),
      verifiedBy: r.verifiedBy ?? undefined,
      documentBlobUrl: r.documentBlobUrl ?? undefined,
      status: r.status as OperatorCredential["status"],
    }));
  } catch (error) {
    console.warn("[talent] loadCredentials failed", error);
    return getTalentStore().credentials;
  }
}

export async function persistAvailability(row: OperatorAvailability) {
  const store = getTalentStore();
  const idx = store.availability.findIndex((a) => a.id === row.id);
  if (idx >= 0) store.availability[idx] = row;
  else store.availability.push(row);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentOperatorAvailability)
    .values({
      id: row.id,
      partyId: row.partyId,
      windowStart: new Date(row.windowStart),
      windowEnd: new Date(row.windowEnd),
      radiusKm: row.radiusKm,
      baseLat: row.baseLat,
      baseLng: row.baseLng,
      exclusivity: row.exclusivity,
    })
    .onConflictDoUpdate({
      target: talentOperatorAvailability.id,
      set: {
        windowStart: new Date(row.windowStart),
        windowEnd: new Date(row.windowEnd),
        radiusKm: row.radiusKm,
        baseLat: row.baseLat,
        baseLng: row.baseLng,
        exclusivity: row.exclusivity,
      },
    });
}

export async function loadAvailability(): Promise<OperatorAvailability[]> {
  const db = getDb();
  if (!db) return getTalentStore().availability;
  try {
    const rows = await db.select().from(talentOperatorAvailability);
    return rows.map((r) => ({
      id: r.id,
      partyId: r.partyId,
      windowStart: r.windowStart.toISOString(),
      windowEnd: r.windowEnd.toISOString(),
      radiusKm: r.radiusKm,
      baseLat: r.baseLat ?? undefined,
      baseLng: r.baseLng ?? undefined,
      exclusivity: r.exclusivity,
    }));
  } catch (error) {
    console.warn("[talent] loadAvailability failed", error);
    return getTalentStore().availability;
  }
}

export async function persistIdentityLink(link: IdentityLink) {
  const store = getTalentStore();
  if (!store.identityLinks.some((l) => l.id === link.id)) {
    store.identityLinks.push(link);
  }
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentOperatorIdentityLinks)
    .values({
      id: link.id,
      partyId: link.partyId,
      board: link.board,
      externalId: link.externalId,
      confidence: link.confidence,
      matchedByRule: link.matchedByRule,
      mergedFrom: link.mergedFrom,
    })
    .onConflictDoNothing();
}

export async function loadIdentityLinks(): Promise<IdentityLink[]> {
  const db = getDb();
  if (!db) return getTalentStore().identityLinks;
  try {
    const rows = await db.select().from(talentOperatorIdentityLinks);
    return rows.map((r) => ({
      id: r.id,
      partyId: r.partyId,
      board: r.board as BoardId,
      externalId: r.externalId,
      confidence: r.confidence as IdentityLink["confidence"],
      matchedByRule: r.matchedByRule ?? undefined,
      mergedFrom: r.mergedFrom ?? undefined,
    }));
  } catch (error) {
    console.warn("[talent] loadIdentityLinks failed", error);
    return getTalentStore().identityLinks;
  }
}

export async function persistGig(gig: CanonicalGig) {
  const store = getTalentStore();
  const idx = store.gigs.findIndex((g) => g.id === gig.id);
  if (idx >= 0) store.gigs[idx] = gig;
  else store.gigs.push(gig);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentGigs)
    .values({
      id: gig.id,
      hirerId: gig.hirerId,
      bookingId: gig.bookingId,
      requestId: gig.requestId,
      engagementId: gig.engagementId,
      equipmentClass: gig.equipmentClass,
      requiredCredentials: gig.requiredCredentials,
      siteLat: gig.siteLat,
      siteLng: gig.siteLng,
      siteLabel: gig.siteLabel,
      startsAt: new Date(gig.startsAt),
      endsAt: new Date(gig.endsAt),
      rateCents: gig.rateCents,
      currency: gig.currency,
      title: gig.title,
      description: gig.description,
      status: gig.status,
    })
    .onConflictDoUpdate({
      target: talentGigs.id,
      set: {
        status: gig.status,
        title: gig.title,
        description: gig.description,
        requiredCredentials: gig.requiredCredentials,
        engagementId: gig.engagementId,
        updatedAt: new Date(),
      },
    });
}

export async function loadGigs(): Promise<CanonicalGig[]> {
  const db = getDb();
  if (!db) return getTalentStore().gigs;
  try {
    const rows = await db.select().from(talentGigs);
    return rows.map((r) => ({
      id: r.id,
      hirerId: r.hirerId,
      bookingId: r.bookingId ?? undefined,
      requestId: r.requestId ?? undefined,
      engagementId: r.engagementId ?? undefined,
      equipmentClass: r.equipmentClass,
      requiredCredentials: r.requiredCredentials ?? [],
      siteLat: r.siteLat ?? undefined,
      siteLng: r.siteLng ?? undefined,
      siteLabel: r.siteLabel ?? undefined,
      startsAt: r.startsAt.toISOString(),
      endsAt: r.endsAt.toISOString(),
      rateCents: r.rateCents,
      currency: r.currency,
      title: r.title,
      description: r.description ?? undefined,
      status: r.status as CanonicalGig["status"],
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.warn("[talent] loadGigs failed", error);
    return getTalentStore().gigs;
  }
}

export async function persistPublication(pub: GigPublication) {
  const store = getTalentStore();
  const idx = store.publications.findIndex((p) => p.id === pub.id);
  if (idx >= 0) store.publications[idx] = pub;
  else store.publications.push(pub);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentGigPublications)
    .values({
      id: pub.id,
      gigId: pub.gigId,
      board: pub.board,
      externalPostingId: pub.externalPostingId,
      externalTaskId: pub.externalTaskId,
      state: pub.state,
      taxonomyVersion: pub.taxonomyVersion,
      publishedAt: asDate(pub.publishedAt),
      expiresAt: asDate(pub.expiresAt),
      lastReconciledAt: asDate(pub.lastReconciledAt),
      adSpendCents: pub.adSpendCents,
    })
    .onConflictDoUpdate({
      target: talentGigPublications.id,
      set: {
        state: pub.state,
        externalPostingId: pub.externalPostingId,
        publishedAt: asDate(pub.publishedAt),
        lastReconciledAt: asDate(pub.lastReconciledAt),
      },
    });
}

export async function loadPublications(): Promise<GigPublication[]> {
  const db = getDb();
  if (!db) return getTalentStore().publications;
  try {
    const rows = await db.select().from(talentGigPublications);
    return rows.map((r) => ({
      id: r.id,
      gigId: r.gigId,
      board: r.board as BoardId,
      externalPostingId: r.externalPostingId ?? undefined,
      externalTaskId: r.externalTaskId ?? undefined,
      state: r.state as GigPublication["state"],
      taxonomyVersion: r.taxonomyVersion ?? undefined,
      publishedAt: ts(r.publishedAt),
      expiresAt: ts(r.expiresAt),
      lastReconciledAt: ts(r.lastReconciledAt),
      adSpendCents: r.adSpendCents,
    }));
  } catch (error) {
    console.warn("[talent] loadPublications failed", error);
    return getTalentStore().publications;
  }
}

export async function persistApplication(app: CanonicalApplication) {
  const store = getTalentStore();
  const idx = store.applications.findIndex((a) => a.id === app.id);
  if (idx >= 0) store.applications[idx] = app;
  else store.applications.push(app);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentApplications)
    .values({
      id: app.id,
      gigPublicationId: app.gigPublicationId,
      partyId: app.partyId,
      board: app.board,
      externalApplicationId: app.externalApplicationId,
      receivedAt: new Date(app.receivedAt),
      sourcePayloadBlobUrl: app.sourcePayloadBlobUrl,
      pipelineState: app.pipelineState,
    })
    .onConflictDoUpdate({
      target: talentApplications.id,
      set: {
        partyId: app.partyId,
        pipelineState: app.pipelineState,
        sourcePayloadBlobUrl: app.sourcePayloadBlobUrl,
      },
    });
}

export async function loadApplications(): Promise<CanonicalApplication[]> {
  const db = getDb();
  if (!db) return getTalentStore().applications;
  try {
    const rows = await db.select().from(talentApplications);
    return rows.map((r) => ({
      id: r.id,
      gigPublicationId: r.gigPublicationId ?? undefined,
      partyId: r.partyId ?? undefined,
      board: r.board as BoardId,
      externalApplicationId: r.externalApplicationId,
      receivedAt: r.receivedAt.toISOString(),
      sourcePayloadBlobUrl: r.sourcePayloadBlobUrl ?? undefined,
      pipelineState: r.pipelineState as CanonicalApplication["pipelineState"],
      answers: {},
    }));
  } catch (error) {
    console.warn("[talent] loadApplications failed", error);
    return getTalentStore().applications;
  }
}

export async function insertInboundEvent(
  event: InboundEvent,
): Promise<{ inserted: boolean }> {
  const store = getTalentStore();
  if (
    store.inbound.some(
      (e) =>
        e.board === event.board && e.externalEventId === event.externalEventId,
    )
  ) {
    return { inserted: false };
  }
  store.inbound.push(event);

  const db = getDb();
  if (!db) return { inserted: true };
  try {
    await db.insert(talentInboundEvents).values({
      id: event.id,
      board: event.board,
      externalEventId: event.externalEventId,
      raw: event.raw,
    });
    return { inserted: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/unique|duplicate/i.test(message)) return { inserted: false };
    console.warn("[talent] insertInboundEvent failed", error);
    return { inserted: true };
  }
}

export async function markInboundProcessed(
  id: string,
  error?: string,
) {
  const store = getTalentStore();
  const row = store.inbound.find((e) => e.id === id);
  if (row) {
    row.processedAt = new Date().toISOString();
    row.error = error;
  }
  const db = getDb();
  if (!db) return;
  await db
    .update(talentInboundEvents)
    .set({ processedAt: new Date(), error: error ?? null })
    .where(eq(talentInboundEvents.id, id));
}

export async function loadUnprocessedInbound(): Promise<InboundEvent[]> {
  const db = getDb();
  if (!db) {
    return getTalentStore().inbound.filter((e) => !e.processedAt);
  }
  try {
    const rows = await db
      .select()
      .from(talentInboundEvents)
      .where(isNull(talentInboundEvents.processedAt));
    return rows.map((r) => ({
      id: r.id,
      board: r.board as BoardId,
      externalEventId: r.externalEventId,
      receivedAt: r.receivedAt.toISOString(),
      raw: r.raw,
    }));
  } catch (error) {
    console.warn("[talent] loadUnprocessedInbound failed", error);
    return getTalentStore().inbound.filter((e) => !e.processedAt);
  }
}

export async function persistOutbox(row: OutboxRow) {
  const store = getTalentStore();
  const idx = store.outbox.findIndex((o) => o.id === row.id);
  if (idx >= 0) store.outbox[idx] = row;
  else store.outbox.push(row);
  const db = getDb();
  if (!db) return;
  await db
    .insert(talentOutbox)
    .values({
      id: row.id,
      aggregateType: row.aggregateType,
      aggregateId: row.aggregateId,
      board: row.board,
      operation: row.operation,
      payload: row.payload,
      attempts: row.attempts,
      nextAttemptAt: new Date(row.nextAttemptAt),
      processedAt: asDate(row.processedAt),
      error: row.error,
    })
    .onConflictDoUpdate({
      target: talentOutbox.id,
      set: {
        attempts: row.attempts,
        nextAttemptAt: new Date(row.nextAttemptAt),
        processedAt: asDate(row.processedAt),
        error: row.error,
      },
    });
}

export async function loadDueOutbox(now = new Date()): Promise<OutboxRow[]> {
  const db = getDb();
  if (!db) {
    return getTalentStore().outbox.filter(
      (o) => !o.processedAt && new Date(o.nextAttemptAt) <= now,
    );
  }
  try {
    const rows = await db
      .select()
      .from(talentOutbox)
      .where(
        and(isNull(talentOutbox.processedAt), lte(talentOutbox.nextAttemptAt, now)),
      );
    return rows.map((r) => ({
      id: r.id,
      aggregateType: r.aggregateType,
      aggregateId: r.aggregateId,
      board: r.board as BoardId,
      operation: r.operation,
      payload: r.payload ?? {},
      attempts: r.attempts,
      nextAttemptAt: r.nextAttemptAt.toISOString(),
      processedAt: ts(r.processedAt),
      error: r.error ?? undefined,
    }));
  } catch (error) {
    console.warn("[talent] loadDueOutbox failed", error);
    return getTalentStore().outbox.filter((o) => !o.processedAt);
  }
}

export async function persistMergeSnapshot(input: {
  id: string;
  survivingPartyId: string;
  absorbedPartyId: string;
  preMerge: Record<string, unknown>;
  rule: string;
}) {
  getTalentStore().mergeSnapshots.push(input);
  const db = getDb();
  if (!db) return;
  await db.insert(talentMergeSnapshots).values({
    id: input.id,
    survivingPartyId: input.survivingPartyId,
    absorbedPartyId: input.absorbedPartyId,
    preMerge: input.preMerge,
    rule: input.rule,
  });
}

export function databaseEnabled() {
  return hasDatabase();
}
