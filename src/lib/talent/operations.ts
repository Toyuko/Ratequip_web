import { createParty, getParty } from "@/lib/collaborate/engine";
import { expireIfNeeded, placementBlocks } from "@/lib/talent/credentials";
import {
  defaultHirerContext,
  indeedScreenerQuestions,
  renderIndeedXmlFeed,
} from "@/lib/talent/adapters/indeed";
import {
  defaultLinkedInHirerContext,
  linkedInConfigured,
  pollLinkedInTask,
} from "@/lib/talent/adapters/linkedin";
import { getAdapter } from "@/lib/talent/adapters/registry";
import {
  linkId,
  newId,
  normalizeEmail,
  normalizePhoneE164,
  resolveOperatorIdentity,
  splitName,
} from "@/lib/talent/identity";
import { matchGigToOperators } from "@/lib/talent/matching";
import {
  insertInboundEvent,
  loadApplications,
  loadAvailability,
  loadCredentials,
  loadDueOutbox,
  loadGigs,
  loadIdentityLinks,
  loadOperators,
  loadPublications,
  loadUnprocessedInbound,
  markInboundProcessed,
  persistApplication,
  persistAvailability,
  persistCredential,
  persistGig,
  persistIdentityLink,
  persistMergeSnapshot,
  persistOutbox,
  persistPartyRow,
  persistPublication,
} from "@/lib/talent/persist";
import { getTalentStore } from "@/lib/talent/store";
import {
  DEFAULT_CREDENTIALS_FOR_CLASS,
  indeedMappingFor,
  linkedInMappingFor,
  TAXONOMY_VERSION,
} from "@/lib/talent/taxonomy";
import type {
  BoardId,
  CanonicalApplication,
  CanonicalGig,
  DispositionStatus,
  OperatorCredential,
  OperatorProfile,
  PipelineState,
  RawInboundRequest,
} from "@/lib/talent/types";
import {
  PRIVACY_NOTICE_VERSION,
  RATEQUIP_HIRER_ID,
} from "@/lib/talent/types";

export { PRIVACY_NOTICE_VERSION, RATEQUIP_HIRER_ID };

const DISPOSITION_MAP: Record<PipelineState, DispositionStatus> = {
  APPLIED: "NEW",
  SCREENING: "SCREEN",
  CREDENTIAL_CHECK: "REVIEW",
  VERIFIED: "INTERVIEW",
  PLACED: "HIRE",
  REJECTED: "REJECT",
};

function licenceOwners(creds: OperatorCredential[]) {
  const map = new Map<string, { partyId: string }>();
  for (const c of creds) {
    if (c.identifier) map.set(c.identifier.trim().toUpperCase(), { partyId: c.partyId });
  }
  return map;
}

export async function upsertOperator(input: {
  legalName: string;
  email: string;
  phone?: string;
  givenName?: string;
  familyName?: string;
  homeLat?: number;
  homeLng?: number;
  jurisdiction?: string;
  userId?: string;
  createdViaBoard?: OperatorProfile["createdViaBoard"];
  poolConsent: boolean;
  rightToWork?: boolean;
  licenceNumbers?: string[];
}): Promise<{ operator: OperatorProfile; merged: boolean; rule?: string }> {
  if (!input.poolConsent) {
    throw new Error("Pool consent is required to join the operator talent pool.");
  }
  const email = normalizeEmail(input.email);
  const names = splitName(input.legalName);
  const existing = await loadOperators();
  const creds = await loadCredentials();
  const decision = resolveOperatorIdentity({
    email,
    phone: input.phone,
    familyName: input.familyName ?? names.familyName,
    licenceNumbers: input.licenceNumbers,
    existing,
    licenceOwners: licenceOwners(creds),
  });

  if (decision.action === "block") {
    throw new Error(`Identity conflict: ${decision.reason}`);
  }
  if (decision.action === "review") {
    throw new Error(`Identity needs review: ${decision.reason}`);
  }

  if (decision.action === "auto-merge") {
    const surviving = existing.find((o) => o.partyId === decision.survivingPartyId);
    if (!surviving) throw new Error("Merge target missing");
    const absorbed = {
      ...surviving,
      primaryPhoneE164:
        surviving.primaryPhoneE164 ?? normalizePhoneE164(input.phone ?? ""),
      givenName: surviving.givenName ?? input.givenName ?? names.givenName,
      familyName: surviving.familyName ?? input.familyName ?? names.familyName,
      homeLat: surviving.homeLat ?? input.homeLat,
      homeLng: surviving.homeLng ?? input.homeLng,
      poolConsentAt: surviving.poolConsentAt ?? new Date().toISOString(),
      privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
      rightToWorkVerifiedAt: input.rightToWork
        ? surviving.rightToWorkVerifiedAt ?? new Date().toISOString()
        : surviving.rightToWorkVerifiedAt,
    };
    await persistMergeSnapshot({
      id: newId("mrg"),
      survivingPartyId: surviving.partyId,
      absorbedPartyId: surviving.partyId,
      preMerge: { ...surviving },
      rule: decision.rule,
    });
    const store = getTalentStore();
    const idx = store.operators.findIndex((o) => o.partyId === absorbed.partyId);
    if (idx >= 0) store.operators[idx] = absorbed;
    else store.operators.push(absorbed);
    await persistPartyRow(absorbed);
    return { operator: absorbed, merged: true, rule: decision.rule };
  }

  let party = createParty({
    kind: "INDIVIDUAL",
    legalName: input.legalName,
    jurisdiction: input.jurisdiction ?? "AU",
    contactEmail: email,
    timezone: "Australia/Sydney",
    userId: input.userId,
  });

  const operator: OperatorProfile = {
    partyId: party.partyId,
    status: "ACTIVE",
    legalName: input.legalName,
    givenName: input.givenName ?? names.givenName,
    familyName: input.familyName ?? names.familyName,
    primaryEmailNorm: email,
    primaryPhoneE164: normalizePhoneE164(input.phone ?? ""),
    homeLat: input.homeLat,
    homeLng: input.homeLng,
    createdViaBoard: input.createdViaBoard,
    poolConsentAt: new Date().toISOString(),
    privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
    rightToWorkVerifiedAt: input.rightToWork
      ? new Date().toISOString()
      : undefined,
    jurisdiction: input.jurisdiction ?? "AU",
    userId: input.userId,
    createdAt: party.createdAt,
  };
  const store = getTalentStore();
  store.operators.push(operator);
  await persistPartyRow(operator);
  return { operator, merged: false };
}

export async function addOperatorCredential(input: {
  partyId: string;
  credentialType: string;
  identifier?: string;
  issuingJurisdiction?: string;
  expiresAt?: string;
  issuedAt?: string;
  documentBlobUrl?: string;
  verificationMethod?: OperatorCredential["verificationMethod"];
  verifiedBy?: string;
}) {
  const cred: OperatorCredential = {
    id: newId("crd"),
    partyId: input.partyId,
    credentialType: input.credentialType,
    identifier: input.identifier,
    issuingJurisdiction: input.issuingJurisdiction ?? "AU-NSW",
    issuedAt: input.issuedAt,
    expiresAt: input.expiresAt,
    verificationMethod: input.verificationMethod ?? "DOCUMENT_CAPTURE",
    verifiedAt: input.verifiedBy ? new Date().toISOString() : undefined,
    verifiedBy: input.verifiedBy,
    documentBlobUrl: input.documentBlobUrl,
    status: "ACTIVE",
  };
  await persistCredential(cred);
  return cred;
}

export async function setOperatorAvailability(input: {
  partyId: string;
  windowStart: string;
  windowEnd: string;
  radiusKm?: number;
  baseLat?: number;
  baseLng?: number;
}) {
  const row = {
    id: newId("avl"),
    partyId: input.partyId,
    windowStart: input.windowStart,
    windowEnd: input.windowEnd,
    radiusKm: input.radiusKm ?? 40,
    baseLat: input.baseLat,
    baseLng: input.baseLng,
    exclusivity: false,
  };
  await persistAvailability(row);
  return row;
}

export async function createGig(input: {
  title: string;
  description?: string;
  equipmentClass: string;
  requiredCredentials?: string[];
  siteLabel?: string;
  siteLat?: number;
  siteLng?: number;
  startsAt: string;
  endsAt: string;
  rateCents: number;
  currency?: string;
  requestId?: string;
  bookingId?: string;
  hirerId?: string;
  publishToIndeed?: boolean;
  publishToLinkedIn?: boolean;
}): Promise<CanonicalGig> {
  const publishIndeed = input.publishToIndeed !== false;
  const publishLinkedIn =
    input.publishToLinkedIn === true ||
    (input.publishToLinkedIn !== false && linkedInConfigured());

  if (publishIndeed && !indeedMappingFor(input.equipmentClass)) {
    throw new Error(
      `Cannot publish unmapped equipment class ${input.equipmentClass}`,
    );
  }
  if (publishLinkedIn && !linkedInMappingFor(input.equipmentClass)) {
    throw new Error(
      `Cannot publish to LinkedIn — unmapped equipment class ${input.equipmentClass}`,
    );
  }

  const gig: CanonicalGig = {
    id: newId("gig"),
    hirerId: input.hirerId ?? RATEQUIP_HIRER_ID,
    bookingId: input.bookingId,
    requestId: input.requestId,
    equipmentClass: input.equipmentClass,
    requiredCredentials:
      input.requiredCredentials?.length
        ? input.requiredCredentials
        : (DEFAULT_CREDENTIALS_FOR_CLASS[input.equipmentClass] ?? ["WHITE_CARD"]),
    siteLat: input.siteLat,
    siteLng: input.siteLng,
    siteLabel: input.siteLabel,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    rateCents: input.rateCents,
    currency: input.currency ?? "AUD",
    title: input.title,
    description: input.description,
    status: "OPEN",
    createdAt: new Date().toISOString(),
  };
  await persistGig(gig);

  const boards: BoardId[] = [];
  if (publishIndeed) boards.push("indeed");
  if (publishLinkedIn) boards.push("linkedin");

  for (const board of boards) {
    const pub = {
      id: newId("pub"),
      gigId: gig.id,
      board,
      externalPostingId: gig.id,
      state: "PENDING" as const,
      taxonomyVersion: TAXONOMY_VERSION,
      adSpendCents: 0,
    };
    await persistPublication(pub);
    await persistOutbox({
      id: newId("obx"),
      aggregateType: "gig",
      aggregateId: gig.id,
      board,
      operation: "publish",
      payload: { publicationId: pub.id },
      attempts: 0,
      nextAttemptAt: new Date().toISOString(),
    });
  }
  return gig;
}

export async function createGigFromRequest(input: {
  requestId: string;
  title: string;
  description?: string;
  equipmentClass?: string;
  requiredCredentials?: string[];
  siteLabel?: string;
  dueDate?: string;
  rateCents?: number;
  currency?: string;
}) {
  const starts = new Date();
  const ends = input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 7 * 86400000);
  return createGig({
    title: input.title.startsWith("Operator")
      ? input.title
      : `Operator — ${input.title}`,
    description: input.description,
    equipmentClass: input.equipmentClass ?? "EXCAVATOR_20T",
    requiredCredentials: input.requiredCredentials,
    siteLabel: input.siteLabel,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
    rateCents: input.rateCents ?? 6800,
    currency: input.currency ?? "AUD",
    requestId: input.requestId,
    publishToIndeed: true,
  });
}

export async function processOutbox() {
  const due = await loadDueOutbox();
  const gigs = await loadGigs();
  const pubs = await loadPublications();
  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const row of due) {
    try {
      if (row.operation === "publish") {
        const gig = gigs.find((g) => g.id === row.aggregateId);
        const pub = pubs.find((p) => p.id === String(row.payload.publicationId));
        if (!gig || !pub) throw new Error("gig or publication missing");
        const adapter = getAdapter(row.board);
        const ctx =
          row.board === "linkedin"
            ? defaultLinkedInHirerContext()
            : defaultHirerContext();
        const res = await adapter.publishGig(ctx, gig);
        const demoTask =
          Boolean(res.externalTaskId?.startsWith("urn:li:simpleJobPostingTask:demo-"));
        pub.state = res.ok
          ? adapter.capabilities().asyncPublish && !demoTask
            ? "PENDING"
            : "LIVE"
          : "REJECTED";
        if (res.ok && (!adapter.capabilities().asyncPublish || demoTask)) {
          pub.publishedAt = new Date().toISOString();
        }
        pub.externalPostingId = res.externalPostingId;
        pub.externalTaskId = res.externalTaskId;
        await persistPublication(pub);
        if (
          res.ok &&
          res.externalTaskId &&
          row.board === "linkedin" &&
          !demoTask
        ) {
          await persistOutbox({
            id: newId("obx"),
            aggregateType: "publication",
            aggregateId: pub.id,
            board: "linkedin",
            operation: "poll_task",
            payload: { taskUrn: res.externalTaskId, publicationId: pub.id },
            attempts: 0,
            nextAttemptAt: new Date(Date.now() + 30_000).toISOString(),
          });
        }
      } else if (row.operation === "poll_task") {
        const taskUrn = String(row.payload.taskUrn ?? "");
        const pub = pubs.find((p) => p.id === String(row.payload.publicationId));
        if (!pub || !taskUrn) throw new Error("poll_task missing publication/task");
        if (taskUrn.startsWith("urn:li:simpleJobPostingTask:demo-")) {
          pub.state = "LIVE";
          pub.publishedAt = new Date().toISOString();
          await persistPublication(pub);
        } else {
          const status = await pollLinkedInTask(taskUrn);
          const state = String(
            status.status ?? status.taskStatus ?? "",
          ).toUpperCase();
          if (state.includes("SUCCESS") || state.includes("COMPLETE")) {
            pub.state = "LIVE";
            pub.publishedAt = new Date().toISOString();
            await persistPublication(pub);
          } else if (state.includes("FAIL") || state.includes("ERROR")) {
            pub.state = "REJECTED";
            await persistPublication(pub);
          } else {
            throw new Error(`LinkedIn task still ${state || "PENDING"}`);
          }
        }
      } else if (row.operation === "disposition") {
        const adapter = getAdapter(row.board);
        await adapter.sendDisposition(
          { externalApplicationId: String(row.payload.applyId) },
          row.payload.status as DispositionStatus,
          String(row.payload.changedAt),
        );
      }
      row.processedAt = new Date().toISOString();
      row.attempts += 1;
      await persistOutbox(row);
      results.push({ id: row.id, ok: true });
    } catch (error) {
      row.attempts += 1;
      row.error = error instanceof Error ? error.message : String(error);
      row.nextAttemptAt = new Date(
        Date.now() + Math.min(6 * 3600000, 15 * 60_000 * 2 ** row.attempts),
      ).toISOString();
      await persistOutbox(row);
      results.push({ id: row.id, ok: false, error: row.error });
    }
  }
  return results;
}

export async function ingestInbound(
  req: RawInboundRequest,
  board: BoardId = "indeed",
) {
  const adapter = getAdapter(board);
  let env;
  try {
    env = await adapter.verifyInbound(req);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "INVALID_SIGNATURE") {
      return { ok: false as const, status: 401, error: "Invalid signature" };
    }
    return { ok: false as const, status: 400, error: message };
  }

  const eventId = newId("evt");
  const inserted = await insertInboundEvent({
    id: eventId,
    board: env.board,
    externalEventId: env.externalEventId,
    receivedAt: new Date().toISOString(),
    raw: env.raw,
  });
  if (!inserted.inserted) {
    return { ok: true as const, duplicate: true, applyId: env.externalEventId };
  }

  try {
    const app = await adapter.fetchApplication(env);
    await processBoardApplication(app, env.raw, eventId);
  } catch (error) {
    await markInboundProcessed(
      eventId,
      error instanceof Error ? error.message : String(error),
    );
    return { ok: true as const, queued: true, applyId: env.externalEventId };
  }
  return { ok: true as const, applyId: env.externalEventId };
}

async function processBoardApplication(
  app: CanonicalApplication,
  raw: Record<string, unknown>,
  eventId: string,
) {
  const consent = (app.answers.pool_consent ?? "").toLowerCase();
  if (consent === "no") {
    await markInboundProcessed(eventId, "no_pool_consent");
    return;
  }
  const white = (app.answers.white_card ?? "").toLowerCase();
  if (white === "no") {
    app.pipelineState = "REJECTED";
  }

  const gigs = await loadGigs();
  const pubs = await loadPublications();
  const job = (raw.job ?? raw.jobPosting ?? {}) as Record<string, unknown>;
  const jobId = String(
    job.jobId ??
      job.jobid ??
      job.externalJobPostingId ??
      raw.externalJobPostingId ??
      app.externalApplicationId,
  );
  const gig =
    gigs.find((g) => g.id === jobId) ??
    gigs.find((g) => g.status === "OPEN");
  const pub = pubs.find((p) => p.gigId === gig?.id && p.board === app.board);
  app.gigPublicationId = pub?.id;

  const licences = (app.answers.ticket_numbers ?? "")
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const upserted = await upsertOperator({
    legalName:
      [app.givenName, app.familyName].filter(Boolean).join(" ") || "Applicant",
    email:
      app.email ??
      `${app.externalApplicationId}@applicants.ratequip.invalid`,
    phone: app.phone,
    givenName: app.givenName,
    familyName: app.familyName,
    createdViaBoard: app.board,
    poolConsent: consent !== "no",
    licenceNumbers: licences,
  });
  app.partyId = upserted.operator.partyId;

  await persistIdentityLink({
    id: linkId(app.board, app.externalApplicationId),
    partyId: upserted.operator.partyId,
    board: app.board,
    externalId: app.externalApplicationId,
    confidence: "HIGH",
    matchedByRule: upserted.rule ?? `${app.board}_apply`,
  });

  if (white === "yes") {
    await addOperatorCredential({
      partyId: upserted.operator.partyId,
      credentialType: "WHITE_CARD",
      identifier: licences[0],
      issuingJurisdiction: "AU",
      verificationMethod: "DOCUMENT_CAPTURE",
    });
  }

  await persistApplication(app);
  if (app.board === "indeed") {
    await enqueueDisposition(app.externalApplicationId, app.pipelineState);
  }
  await markInboundProcessed(eventId);
}

export async function processUnprocessedInbound() {
  const pending = await loadUnprocessedInbound();
  for (const event of pending) {
    try {
      const adapter = getAdapter(event.board);
      const app = await adapter.fetchApplication({
        board: event.board,
        externalEventId: event.externalEventId,
        raw: event.raw,
      });
      await processBoardApplication(app, event.raw, event.id);
    } catch (error) {
      await markInboundProcessed(
        event.id,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  return pending.length;
}

async function enqueueDisposition(applyId: string, state: PipelineState) {
  await persistOutbox({
    id: newId("obx"),
    aggregateType: "application",
    aggregateId: applyId,
    board: "indeed",
    operation: "disposition",
    payload: {
      applyId,
      status: DISPOSITION_MAP[state],
      changedAt: new Date().toISOString(),
    },
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
  });
}

export async function setApplicationState(
  applicationId: string,
  state: PipelineState,
) {
  const apps = await loadApplications();
  const app = apps.find((a) => a.id === applicationId);
  if (!app) throw new Error("Application not found");
  app.pipelineState = state;
  await persistApplication(app);
  if (app.board === "indeed") {
    await enqueueDisposition(app.externalApplicationId, state);
  }
  return app;
}

export async function matchGig(gigId: string) {
  const gigs = await loadGigs();
  const gig = gigs.find((g) => g.id === gigId);
  if (!gig) throw new Error("Gig not found");
  const operators = await loadOperators();
  const credentials = await loadCredentials();
  const availability = await loadAvailability();
  const applications = await loadApplications();

  const credentialsByParty = new Map<string, OperatorCredential[]>();
  for (const c of credentials) {
    const list = credentialsByParty.get(c.partyId) ?? [];
    list.push(expireIfNeeded(c));
    credentialsByParty.set(c.partyId, list);
  }
  const availabilityByParty = new Map<string, typeof availability>();
  for (const a of availability) {
    const list = availabilityByParty.get(a.partyId) ?? [];
    list.push(a);
    availabilityByParty.set(a.partyId, list);
  }
  const overlappingByParty = new Map<string, string[]>();
  for (const app of applications) {
    if (app.pipelineState !== "PLACED" || !app.partyId) continue;
    overlappingByParty.set(app.partyId, [
      ...(overlappingByParty.get(app.partyId) ?? []),
      app.id,
    ]);
  }

  return matchGigToOperators({
    gig,
    operators,
    credentialsByParty,
    availabilityByParty,
    overlappingByParty,
  });
}

export async function placeOperator(gigId: string, partyId: string) {
  const gigs = await loadGigs();
  const gig = gigs.find((g) => g.id === gigId);
  if (!gig) throw new Error("Gig not found");
  const operators = await loadOperators();
  const operator = operators.find((o) => o.partyId === partyId);
  if (!operator) throw new Error("Operator not found");
  const credentials = (await loadCredentials()).filter((c) => c.partyId === partyId);
  const availability = (await loadAvailability()).filter((a) => a.partyId === partyId);
  const applications = await loadApplications();
  const overlappingPlacedGigIds = applications
    .filter((a) => a.partyId === partyId && a.pipelineState === "PLACED")
    .map((a) => a.gigPublicationId)
    .filter((id): id is string => Boolean(id));
  const blocks = placementBlocks({
    credentials: credentials.map((c) => expireIfNeeded(c)),
    required: gig.requiredCredentials,
    gig,
    availability,
    overlappingPlacedGigIds,
    rightToWorkVerifiedAt: operator.rightToWorkVerifiedAt,
    operatorStatus: operator.status,
  });
  if (blocks.length > 0) {
    throw new Error(`Placement blocked: ${blocks.join(", ")}`);
  }
  gig.status = "FILLED";
  await persistGig(gig);
  const apps = await loadApplications();
  const app = apps.find((a) => a.partyId === partyId);
  if (app) {
    app.pipelineState = "PLACED";
    await persistApplication(app);
    await enqueueDisposition(app.externalApplicationId, "PLACED");
  }
  return { ok: true as const, gigId, partyId };
}

export async function expireCredentials(now = new Date()) {
  const creds = await loadCredentials();
  let expired = 0;
  for (const cred of creds) {
    const next = expireIfNeeded(cred, now);
    if (next.status !== cred.status) {
      await persistCredential(next);
      expired += 1;
    }
  }
  return expired;
}

export async function indeedXml() {
  const gigs = await loadGigs();
  const pubs = await loadPublications();
  const liveIds = new Set(
    pubs.filter((p) => p.board === "indeed" && p.state === "LIVE").map((p) => p.gigId),
  );
  const listed = gigs.filter((g) => g.status === "OPEN" && liveIds.has(g.id));
  return renderIndeedXmlFeed(listed.length > 0 ? listed : gigs.filter((g) => g.status === "OPEN"));
}

export async function indeedQuestions(gigId: string) {
  const gigs = await loadGigs();
  const gig = gigs.find((g) => g.id === gigId);
  if (!gig) {
    return indeedScreenerQuestions({
      id: gigId,
      hirerId: RATEQUIP_HIRER_ID,
      equipmentClass: "EXCAVATOR_20T",
      requiredCredentials: ["WHITE_CARD"],
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 86400000).toISOString(),
      rateCents: 6800,
      currency: "AUD",
      title: "Plant operator",
      status: "OPEN",
      createdAt: new Date().toISOString(),
    });
  }
  return indeedScreenerQuestions(gig);
}

export async function talentSnapshot() {
  const [operators, gigs, applications, inbound, creds] = await Promise.all([
    loadOperators(),
    loadGigs(),
    loadApplications(),
    loadUnprocessedInbound(),
    loadCredentials(),
  ]);
  return {
    operators: operators.length,
    gigs: gigs.length,
    applications: applications.length,
    unprocessedInbound: inbound.length,
    credentials: creds.length,
    openGigs: gigs.filter((g) => g.status === "OPEN").length,
  };
}

export async function getOperator(partyId: string) {
  const operators = await loadOperators();
  const operator = operators.find((o) => o.partyId === partyId);
  if (!operator) return null;
  const credentials = (await loadCredentials()).filter((c) => c.partyId === partyId);
  const availability = (await loadAvailability()).filter((a) => a.partyId === partyId);
  const links = (await loadIdentityLinks()).filter((l) => l.partyId === partyId);
  return { operator, credentials, availability, links };
}

export async function listTalentGigs() {
  return loadGigs();
}

export { getParty };
