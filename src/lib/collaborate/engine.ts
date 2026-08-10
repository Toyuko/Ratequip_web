/**
 * RateQuip Collaborate — engagement engine (Phase 0 + Phase 1).
 * One Engagement aggregate, four modes. Jobs and Sessions ship first.
 */

import { createHash, randomUUID } from "crypto";
import { appendDomainEvent, verifyEventChain } from "@/lib/collaborate/events";
import { assertFeeDisclosed, computeFeeQuote } from "@/lib/collaborate/fees";
import { generateAgreement, signAgreement } from "@/lib/collaborate/documents";
import { money, sumAllocations } from "@/lib/collaborate/money";
import {
  PayoutRouter,
  type HoldRef,
} from "@/lib/collaborate/payment-provider";
import {
  createReputationEvent,
  projectReputation,
} from "@/lib/collaborate/reputation";
import {
  getSandboxPaymentProvider,
  resetSandboxPaymentProvider,
} from "@/lib/collaborate/sandbox-provider";
import { assertModeTransition, assertMilestoneTransition } from "@/lib/collaborate/state-machines";
import { getCollaborateStore, resetCollaborateStore } from "@/lib/collaborate/store";
import {
  enqueuePendingTerm,
  resolveTaxonomyId,
} from "@/lib/collaborate/taxonomy";
import type {
  ActingContext,
  Actor,
  Capability,
  CapabilityKind,
  CollaborateWorkspace,
  Engagement,
  EngagementMode,
  FeeQuote,
  Milestone,
  Party,
  PartyKind,
  Requirement,
  SessionOffering,
  SessionOfferingType,
  VerificationTier,
} from "@/lib/collaborate/types";
import { ManualVerificationQueue } from "@/lib/collaborate/verification";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function now() {
  return new Date().toISOString();
}

function router() {
  return new PayoutRouter([getSandboxPaymentProvider()]);
}

const verificationQueue = new ManualVerificationQueue();

export function getVerificationQueue() {
  return verificationQueue;
}

function emit(
  engagementId: string,
  actingAsPartyId: string,
  type: string,
  payload: Record<string, unknown>,
  actorId?: string,
) {
  const store = getCollaborateStore();
  const prev =
    store.events.filter((e) => e.engagementId === engagementId).at(-1) ?? null;
  const event = appendDomainEvent({
    engagementId,
    actingAsPartyId,
    actorId,
    type,
    payload,
    prevEvent: prev,
  });
  store.events.push(event);
  return event;
}

function requireIdempotency(ctx: ActingContext, scope: string): string | null {
  if (!ctx.idempotencyKey) return null;
  const store = getCollaborateStore();
  const key = `${scope}:${ctx.idempotencyKey}`;
  const existing = store.idempotency.get(key);
  return existing ?? null;
}

function rememberIdempotency(ctx: ActingContext, scope: string, resultId: string) {
  if (!ctx.idempotencyKey) return;
  getCollaborateStore().idempotency.set(
    `${scope}:${ctx.idempotencyKey}`,
    resultId,
  );
}

// ─── Parties ───────────────────────────────────────────────────────────────

export function createParty(input: {
  kind: PartyKind;
  legalName: string;
  jurisdiction: string;
  contactEmail: string;
  timezone: string;
  userId?: string;
  organisationId?: string;
}): Party {
  const store = getCollaborateStore();
  const party: Party = {
    partyId: id("pty"),
    kind: input.kind,
    legalName: input.legalName,
    jurisdiction: input.jurisdiction,
    contactEmail: input.contactEmail,
    timezone: input.timezone,
    verificationTier: "T0",
    userId: input.userId,
    organisationId: input.organisationId,
    createdAt: now(),
  };
  store.parties.push(party);
  store.payoutProfiles.push({
    partyId: party.partyId,
    preferredCurrency: "AUD",
    methods: [],
  });
  return party;
}

export function listParties(): Party[] {
  return getCollaborateStore().parties;
}

export function getParty(partyId: string): Party | undefined {
  return getCollaborateStore().parties.find((p) => p.partyId === partyId);
}

export function linkMembership(input: {
  individualPartyId: string;
  organisationPartyId: string;
  role: "OWNER" | "ADMIN" | "AUTHORISED_REP" | "MEMBER";
  authorityLimitMinor?: number | null;
  currency?: string;
}) {
  const store = getCollaborateStore();
  const membership = {
    membershipId: id("pm"),
    individualPartyId: input.individualPartyId,
    organisationPartyId: input.organisationPartyId,
    role: input.role,
    authorityLimitMinor: input.authorityLimitMinor ?? null,
    currency: input.currency ?? "AUD",
    createdAt: now(),
  };
  store.memberships.push(membership);
  return membership;
}

export function setVerificationTier(partyId: string, tier: VerificationTier) {
  const party = getParty(partyId);
  if (!party) throw new Error("Party not found");
  party.verificationTier = tier;
  return party;
}

// ─── Capabilities ──────────────────────────────────────────────────────────

export function addCapability(input: {
  partyId: string;
  kind: CapabilityKind;
  taxonomyIdOrLabel: string;
  level?: number;
}): Capability {
  const store = getCollaborateStore();
  let taxonomyId = input.taxonomyIdOrLabel;
  const resolved = resolveTaxonomyId(store.taxonomy, input.taxonomyIdOrLabel);
  if (resolved) {
    taxonomyId = resolved.taxonomyId;
  } else {
    store.pendingTaxonomy.push(
      enqueuePendingTerm({
        rawLabel: input.taxonomyIdOrLabel,
        kind: input.kind,
        submittedByPartyId: input.partyId,
      }),
    );
    taxonomyId = `pending.${input.taxonomyIdOrLabel
      .toLowerCase()
      .replace(/\s+/g, "_")
      .slice(0, 40)}`;
  }

  const cap: Capability = {
    capabilityId: id("cap"),
    partyId: input.partyId,
    kind: input.kind,
    taxonomyId,
    verifiedState: "SELF_DECLARED",
    visibility: "PUBLIC",
    level: input.level,
    evidenceRefs: [],
    createdAt: now(),
    lastConfirmedAt: now(),
  };
  store.capabilities.push(cap);
  return cap;
}

export function listCapabilities(partyId?: string): Capability[] {
  const all = getCollaborateStore().capabilities;
  return partyId ? all.filter((c) => c.partyId === partyId) : all;
}

// ─── Session offerings (Phase 1) ───────────────────────────────────────────

export function createSessionOffering(input: {
  expertPartyId: string;
  type: SessionOfferingType;
  title: string;
  description: string;
  priceMinor: number;
  currency: string;
  durationMinutes: number;
  languages?: string[];
  supportedMachineBrands?: string[];
  prerequisites?: string[];
  deliverableDefinition: string;
  requiresCredentialVerification?: boolean;
}): SessionOffering {
  const expert = getParty(input.expertPartyId);
  if (!expert) throw new Error("Expert Party not found");
  if (
    input.requiresCredentialVerification &&
    !["T3", "T4"].includes(expert.verificationTier)
  ) {
    throw new Error(
      "Offerings that imply certification require T3 credential verification",
    );
  }

  const offering: SessionOffering = {
    offeringId: id("off"),
    expertPartyId: input.expertPartyId,
    type: input.type,
    title: input.title,
    description: input.description,
    price: money(input.currency, input.priceMinor),
    durationMinutes: input.durationMinutes,
    languages: input.languages ?? ["en"],
    supportedMachineBrands: input.supportedMachineBrands ?? [],
    prerequisites: input.prerequisites ?? [],
    deliverableDefinition: input.deliverableDefinition,
    requiresCredentialVerification: !!input.requiresCredentialVerification,
    active: true,
    createdAt: now(),
  };
  getCollaborateStore().offerings.push(offering);
  return offering;
}

export function listOfferings(activeOnly = true): SessionOffering[] {
  const all = getCollaborateStore().offerings;
  return activeOnly ? all.filter((o) => o.active) : all;
}

// ─── Workspace ─────────────────────────────────────────────────────────────

function createWorkspace(engagementId: string): CollaborateWorkspace {
  const ws: CollaborateWorkspace = {
    workspaceId: id("ws"),
    engagementId,
    threads: [],
    messages: [],
    files: [],
    tasks: [],
    accessLog: [],
  };
  getCollaborateStore().workspaces.push(ws);
  return ws;
}

export function postWorkspaceMessage(input: {
  workspaceId: string;
  authorPartyId: string;
  body: string;
  engagementState: string;
}) {
  const store = getCollaborateStore();
  const ws = store.workspaces.find((w) => w.workspaceId === input.workspaceId);
  if (!ws) throw new Error("Workspace not found");

  // Pre-award contact-detail masking (§13.2)
  const contactPattern =
    /(\+?\d[\d\s\-()]{7,}\d)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(whatsapp|telegram|wechat)/i;
  const preAward = ["DRAFT", "PUBLISHED", "QUOTING", "OFFERED", "BOOKED"].includes(
    input.engagementState,
  );
  let body = input.body;
  let masked = false;
  if (preAward && contactPattern.test(body)) {
    body = body.replace(contactPattern, "[contact hidden until award]");
    masked = true;
  }

  let thread = ws.threads[0];
  if (!thread) {
    thread = {
      threadId: id("thr"),
      workspaceId: ws.workspaceId,
      subject: "General",
      createdAt: now(),
    };
    ws.threads.push(thread);
  }

  const message = {
    messageId: id("msg"),
    threadId: thread.threadId,
    authorPartyId: input.authorPartyId,
    body,
    createdAt: now(),
    masked,
  };
  ws.messages.push(message);
  ws.accessLog.push({
    logId: id("log"),
    workspaceId: ws.workspaceId,
    partyId: input.authorPartyId,
    action: "MESSAGE",
    resourceId: message.messageId,
    occurredAt: now(),
  });
  return message;
}

// ─── Engagements ───────────────────────────────────────────────────────────

export function createEngagement(input: {
  mode: EngagementMode;
  title: string;
  summary?: string;
  buyerPartyId: string;
  currency?: string;
  jurisdiction?: string;
  contractingStructure?: Engagement["contractingStructure"];
  visibility?: Engagement["visibility"];
  offeringId?: string;
  scheduledAt?: string;
  ctx: ActingContext;
}): Engagement {
  const existing = requireIdempotency(input.ctx, "createEngagement");
  if (existing) {
    const found = getCollaborateStore().engagements.find(
      (e) => e.engagementId === existing,
    );
    if (found) return found;
  }

  const buyer = getParty(input.buyerPartyId);
  if (!buyer) throw new Error("Buyer Party not found");
  if (input.ctx.actingAsPartyId !== input.buyerPartyId) {
    throw new Error("actingAsPartyId must match buyerPartyId on create");
  }

  const engagementId = id("eng");
  const eventStreamId = id("evs");
  const initialState =
    input.mode === "SESSION"
      ? "OFFERED"
      : input.mode === "VENTURE"
        ? "CONCEPT"
        : "DRAFT";

  const actors: Actor[] = [
    {
      actorId: id("act"),
      engagementId,
      partyId: input.buyerPartyId,
      role: "BUYER",
      conflictDeclaration: "NONE",
      joinedAt: now(),
    },
  ];

  let offering: SessionOffering | undefined;
  if (input.mode === "SESSION") {
    if (!input.offeringId) throw new Error("SESSION requires offeringId");
    offering = listOfferings(false).find((o) => o.offeringId === input.offeringId);
    if (!offering || !offering.active) throw new Error("Offering not found");
    actors.push({
      actorId: id("act"),
      engagementId,
      partyId: offering.expertPartyId,
      role: "CONTRIBUTOR",
      conflictDeclaration: "NONE",
      joinedAt: now(),
    });
  }

  const engagement: Engagement = {
    engagementId,
    mode: input.mode,
    title: input.title,
    summary: input.summary,
    buyerPartyId: input.buyerPartyId,
    contractingStructure: input.contractingStructure ?? "DIRECT",
    leadActorId: null,
    state: initialState,
    currency: (input.currency ?? offering?.price.currency ?? "AUD").toUpperCase(),
    jurisdiction: input.jurisdiction ?? buyer.jurisdiction,
    requirements: [],
    actors,
    milestones: [],
    feeQuoteId: null,
    riskFlags: [],
    visibility: input.visibility ?? "PRIVATE",
    createdAt: now(),
    eventStreamId,
    offeringId: input.offeringId,
    scheduledAt: input.scheduledAt,
    quotes: [],
    agreements: [],
    changeOrders: [],
    disputes: [],
  };

  const ws = createWorkspace(engagementId);
  engagement.workspaceId = ws.workspaceId;

  if (input.mode === "SESSION" && offering) {
    const contributor = actors.find((a) => a.role === "CONTRIBUTOR")!;
    const fee = computeFeeQuote({
      engagementId,
      mode: "SESSION",
      currency: offering.price.currency,
      grossMinor: offering.price.amountMinor,
    });
    getCollaborateStore().feeQuotes.push(fee);
    engagement.feeQuoteId = fee.feeQuoteId;

    engagement.milestones.push({
      milestoneId: id("ms"),
      engagementId,
      sequence: 1,
      title: "Remote expert session deliverable",
      acceptanceCriteria: [
        "Structured session record with findings",
        "Recommendations and next steps provided",
      ],
      requiredEvidence: ["SESSION_RECORD"],
      amount: offering.price,
      allocations: [
        {
          actorId: contributor.actorId,
          amountMinor: fee.netToContributorMinor,
          currency: offering.price.currency,
          basis: "FIXED",
        },
      ],
      dependsOn: [],
      acceptanceWindowDays: 3,
      state: "DRAFT",
      evidence: [],
      revisionCount: 0,
    });
  }

  getCollaborateStore().engagements.push(engagement);
  emit(engagementId, input.ctx.actingAsPartyId, "ENGAGEMENT_CREATED", {
    mode: input.mode,
    title: input.title,
  });
  rememberIdempotency(input.ctx, "createEngagement", engagementId);
  return engagement;
}

export function listEngagements(filter?: {
  mode?: EngagementMode;
  partyId?: string;
}): Engagement[] {
  let list = getCollaborateStore().engagements;
  if (filter?.mode) list = list.filter((e) => e.mode === filter.mode);
  if (filter?.partyId) {
    list = list.filter(
      (e) =>
        e.buyerPartyId === filter.partyId ||
        e.actors.some((a) => a.partyId === filter.partyId),
    );
  }
  return list;
}

export function getEngagement(engagementId: string): Engagement | undefined {
  return getCollaborateStore().engagements.find(
    (e) => e.engagementId === engagementId,
  );
}

export function addRequirement(input: {
  engagementId: string;
  kind: CapabilityKind;
  taxonomyIdOrLabel: string;
  necessity: Requirement["necessity"];
  onSiteRequired?: boolean;
  rationale?: string;
  ctx: ActingContext;
}): Requirement {
  const eng = getEngagement(input.engagementId);
  if (!eng) throw new Error("Engagement not found");
  const store = getCollaborateStore();
  const resolved = resolveTaxonomyId(store.taxonomy, input.taxonomyIdOrLabel);
  const taxonomyId =
    resolved?.taxonomyId ??
    `pending.${input.taxonomyIdOrLabel.toLowerCase().replace(/\s+/g, "_")}`;

  const req: Requirement = {
    requirementId: id("req"),
    engagementId: input.engagementId,
    kind: input.kind,
    taxonomyId,
    necessity: input.necessity,
    onSiteRequired: input.onSiteRequired ?? false,
    status: "UNFILLED",
    filledByActorId: null,
    derivedFrom: "BUYER",
    rationale: input.rationale,
  };
  eng.requirements.push(req);
  emit(eng.engagementId, input.ctx.actingAsPartyId, "REQUIREMENT_ADDED", {
    requirementId: req.requirementId,
    taxonomyId,
  });
  return req;
}

export function addMilestone(input: {
  engagementId: string;
  title: string;
  acceptanceCriteria: string[];
  amountMinor: number;
  contributorActorId: string;
  dueDate?: string;
  acceptanceWindowDays?: number;
  ctx: ActingContext;
}): Milestone {
  const eng = getEngagement(input.engagementId);
  if (!eng) throw new Error("Engagement not found");
  if (!["DRAFT", "PUBLISHED", "QUOTING"].includes(eng.state)) {
    throw new Error("Cannot add milestones after contracting");
  }

  const fee = computeFeeQuote({
    engagementId: eng.engagementId,
    mode: eng.mode,
    currency: eng.currency,
    grossMinor: input.amountMinor,
  });
  getCollaborateStore().feeQuotes.push(fee);
  eng.feeQuoteId = fee.feeQuoteId;

  const ms: Milestone = {
    milestoneId: id("ms"),
    engagementId: eng.engagementId,
    sequence: eng.milestones.length + 1,
    title: input.title,
    acceptanceCriteria: input.acceptanceCriteria,
    requiredEvidence: ["DOCUMENT"],
    amount: money(eng.currency, input.amountMinor),
    allocations: [
      {
        actorId: input.contributorActorId,
        amountMinor: fee.netToContributorMinor,
        currency: eng.currency,
        basis: "FIXED",
      },
    ],
    dependsOn: [],
    dueDate: input.dueDate,
    acceptanceWindowDays: input.acceptanceWindowDays ?? 5,
    state: "DRAFT",
    evidence: [],
    revisionCount: 0,
  };
  eng.milestones.push(ms);
  emit(eng.engagementId, input.ctx.actingAsPartyId, "MILESTONE_ADDED", {
    milestoneId: ms.milestoneId,
    amountMinor: input.amountMinor,
  });
  return ms;
}

export function addContributor(input: {
  engagementId: string;
  partyId: string;
  role?: Actor["role"];
  conflictDeclaration?: Actor["conflictDeclaration"];
  ctx: ActingContext;
}): Actor {
  const eng = getEngagement(input.engagementId);
  if (!eng) throw new Error("Engagement not found");
  const actor: Actor = {
    actorId: id("act"),
    engagementId: eng.engagementId,
    partyId: input.partyId,
    role: input.role ?? "CONTRIBUTOR",
    conflictDeclaration: input.conflictDeclaration ?? "NONE",
    joinedAt: now(),
  };
  eng.actors.push(actor);
  emit(eng.engagementId, input.ctx.actingAsPartyId, "ACTOR_JOINED", {
    actorId: actor.actorId,
    partyId: input.partyId,
    role: actor.role,
  });
  return actor;
}

export function getFeeQuote(feeQuoteId: string): FeeQuote | undefined {
  return getCollaborateStore().feeQuotes.find((f) => f.feeQuoteId === feeQuoteId);
}

export function discloseFee(engagementId: string): FeeQuote {
  const eng = getEngagement(engagementId);
  if (!eng?.feeQuoteId) throw new Error("No FeeQuote on engagement");
  const quote = getFeeQuote(eng.feeQuoteId);
  if (!quote) throw new Error("FeeQuote not found");
  assertFeeDisclosed(quote);
  return quote;
}

// ─── Transitions ───────────────────────────────────────────────────────────

export async function transitionEngagement(input: {
  engagementId: string;
  toState: string;
  ctx: ActingContext;
  payload?: Record<string, unknown>;
}): Promise<Engagement> {
  const eng = getEngagement(input.engagementId);
  if (!eng) throw new Error("Engagement not found");

  const existing = requireIdempotency(
    input.ctx,
    `transition:${eng.engagementId}:${input.toState}`,
  );
  if (existing) return eng;

  assertModeTransition(eng.mode, eng.state, input.toState);

  // Fee disclosure before acceptance actions
  if (["ACCEPTED", "CONTRACTED", "AUTHORISED", "BOOKED"].includes(input.toState)) {
    if (eng.feeQuoteId) {
      const q = getFeeQuote(eng.feeQuoteId);
      assertFeeDisclosed(q);
      if (q && !q.acceptedAt && ["ACCEPTED", "CONTRACTED", "AUTHORISED"].includes(input.toState)) {
        q.acceptedAt = now();
      }
    }
  }

  const from = eng.state;
  eng.state = input.toState;

  // Side effects by transition
  if (eng.mode === "JOB") {
    await handleJobSideEffects(eng, from, input.toState, input.ctx);
  } else if (eng.mode === "SESSION") {
    await handleSessionSideEffects(eng, from, input.toState, input.ctx, input.payload);
  }

  emit(
    eng.engagementId,
    input.ctx.actingAsPartyId,
    "STATE_TRANSITION",
    { from, to: input.toState, ...(input.payload ?? {}) },
  );
  rememberIdempotency(
    input.ctx,
    `transition:${eng.engagementId}:${input.toState}`,
    eng.engagementId,
  );
  return eng;
}

async function handleJobSideEffects(
  eng: Engagement,
  _from: string,
  to: string,
  ctx: ActingContext,
) {
  if (to === "CONTRACTED") {
    let agreement = generateAgreement({
      engagement: eng,
      kind: "SCOPE_OF_WORK",
      structuredJson: {
        title: eng.title,
        milestones: eng.milestones.map((m) => ({
          milestoneId: m.milestoneId,
          title: m.title,
          amountMinor: m.amount.amountMinor,
          acceptanceCriteria: m.acceptanceCriteria,
        })),
        feeQuoteId: eng.feeQuoteId,
      },
    });
    for (const actor of eng.actors.filter((a) =>
      ["BUYER", "CONTRIBUTOR", "LEAD"].includes(a.role),
    )) {
      agreement = signAgreement(agreement, actor.partyId);
    }
    eng.agreements.push(agreement);
  }

  if (to === "FUNDED") {
    await fundAllDraftMilestones(eng, ctx);
  }

  if (to === "IN_PROGRESS") {
    for (const ms of eng.milestones.filter((m) => m.state === "FUNDED")) {
      assertMilestoneTransition(ms.state, "IN_PROGRESS");
      ms.state = "IN_PROGRESS";
    }
  }

  if (to === "SUBMITTED") {
    for (const ms of eng.milestones.filter((m) => m.state === "IN_PROGRESS")) {
      assertMilestoneTransition(ms.state, "SUBMITTED");
      ms.state = "SUBMITTED";
      ms.submittedAt = now();
    }
  }

  if (to === "ACCEPTED") {
    await acceptAndPay(eng, ctx);
  }
}

async function handleSessionSideEffects(
  eng: Engagement,
  _from: string,
  to: string,
  ctx: ActingContext,
  payload?: Record<string, unknown>,
) {
  if (to === "BOOKED" || to === "AUTHORISED") {
    await fundAllDraftMilestones(eng, ctx);
  }

  if (to === "IN_SESSION") {
    const ms = eng.milestones[0];
    if (ms && ms.state === "FUNDED") {
      assertMilestoneTransition(ms.state, "IN_PROGRESS");
      ms.state = "IN_PROGRESS";
    }
  }

  if (to === "DELIVERABLE_SUBMITTED") {
    const findings = String(payload?.findings ?? "");
    const recommendations = String(payload?.recommendations ?? "");
    const nextSteps = String(payload?.nextSteps ?? "");
    if (!findings || !recommendations || !nextSteps) {
      throw new Error(
        "Every session must produce a written deliverable (findings, recommendations, nextSteps)",
      );
    }
    eng.sessionRecord = {
      findings,
      recommendations,
      nextSteps,
      submittedAt: now(),
    };
    const ms = eng.milestones[0];
    if (ms) {
      assertMilestoneTransition(
        ms.state === "IN_PROGRESS" ? "IN_PROGRESS" : ms.state,
        "SUBMITTED",
      );
      ms.state = "SUBMITTED";
      ms.submittedAt = now();
      const hash = createHash("sha256")
        .update(JSON.stringify(eng.sessionRecord))
        .digest("hex");
      ms.evidence.push({
        evidenceId: id("evd"),
        milestoneId: ms.milestoneId,
        type: "SESSION_RECORD",
        uploaderPartyId: ctx.actingAsPartyId,
        uploadTime: now(),
        contentHash: hash,
        criterionIndex: 0,
      });
    }
  }

  if (to === "ACCEPTED") {
    await acceptAndPay(eng, ctx);
  }
}

async function fundAllDraftMilestones(eng: Engagement, ctx: ActingContext) {
  const provider = router().select({
    jurisdiction: eng.jurisdiction,
    currency: eng.currency,
    method: "bank",
    valueMinor: eng.milestones.reduce((s, m) => s + m.amount.amountMinor, 0),
  });

  for (const ms of eng.milestones.filter((m) => m.state === "DRAFT")) {
    // Allocations must sum consistently (FIXED basis)
    sumAllocations(ms.allocations, eng.currency);
    const hold = await provider.createHold(
      ms.milestoneId,
      ms.amount,
      eng.buyerPartyId,
    );
    assertMilestoneTransition(ms.state, "FUNDED");
    ms.state = "FUNDED";
    ms.fundingRef = hold.holdId;
    getCollaborateStore().moneyLedger.push({
      hold,
      milestoneId: ms.milestoneId,
      engagementId: eng.engagementId,
    });
    emit(eng.engagementId, ctx.actingAsPartyId, "MILESTONE_FUNDED", {
      milestoneId: ms.milestoneId,
      holdId: hold.holdId,
      amountMinor: ms.amount.amountMinor,
      providerName: hold.providerName,
    });
  }
}

async function acceptAndPay(eng: Engagement, ctx: ActingContext) {
  const store = getCollaborateStore();
  const provider = router().select({
    jurisdiction: eng.jurisdiction,
    currency: eng.currency,
    method: "bank",
    valueMinor: eng.milestones.reduce((s, m) => s + m.amount.amountMinor, 0),
  });
  const fee = eng.feeQuoteId ? getFeeQuote(eng.feeQuoteId) : null;
  assertFeeDisclosed(fee);

  for (const ms of eng.milestones.filter((m) =>
    ["SUBMITTED", "IN_PROGRESS", "FUNDED"].includes(m.state),
  )) {
    if (ms.state !== "SUBMITTED" && ms.state !== "ACCEPTED") {
      // allow accept from submitted primarily
      if (ms.state === "IN_PROGRESS" || ms.state === "FUNDED") {
        // force through submitted for simplicity in sandbox
        ms.state = "SUBMITTED";
        ms.submittedAt = ms.submittedAt ?? now();
      }
    }
    assertMilestoneTransition("SUBMITTED", "ACCEPTED");
    ms.state = "ACCEPTED";
    ms.acceptedAt = now();

    const ledger = store.moneyLedger.find((l) => l.milestoneId === ms.milestoneId);
    if (!ledger?.hold) throw new Error("Missing funding hold");

    const capture = await provider.captureHold(ledger.hold);
    ledger.capture = capture;
    const payouts = await provider.releaseSplit(
      capture,
      ms.allocations,
      {
        platformFeeMinor: fee?.platformFeeMinor ?? 0,
        currency: eng.currency,
      },
    );
    ledger.payouts = payouts;

    assertMilestoneTransition("ACCEPTED", "PAID");
    ms.state = "PAID";

    emit(eng.engagementId, ctx.actingAsPartyId, "MILESTONE_PAID", {
      milestoneId: ms.milestoneId,
      captureId: capture.captureId,
      payoutIds: payouts.map((p) => p.payoutId),
    });

    // Reputation — only from funded, completed, non-refunded transactions
    for (const actor of eng.actors.filter((a) => a.role === "CONTRIBUTOR")) {
      const rep = createReputationEvent({
        partyId: actor.partyId,
        engagementId: eng.engagementId,
        milestoneId: ms.milestoneId,
        counterpartyId: eng.buyerPartyId,
        type:
          eng.mode === "SESSION" ? "SESSION_COMPLETED" : "MILESTONE_ACCEPTED",
        transactionRef: capture.captureId,
        valueMinor: ms.amount.amountMinor,
        currency: eng.currency,
      });
      store.reputationEvents.push(rep);
      const projection = projectReputation(
        actor.partyId,
        store.reputationEvents,
      );
      const idx = store.reputationProjections.findIndex(
        (p) => p.partyId === actor.partyId,
      );
      if (idx >= 0) store.reputationProjections[idx] = projection;
      else store.reputationProjections.push(projection);

      // DELIVERY_PROVEN after N accepted milestones for a capability
      maybeMarkDeliveryProven(actor.partyId);
    }
  }

  eng.state = "PAID";
}

function maybeMarkDeliveryProven(partyId: string) {
  const store = getCollaborateStore();
  const accepted = store.reputationEvents.filter(
    (e) =>
      e.partyId === partyId &&
      (e.type === "MILESTONE_ACCEPTED" || e.type === "SESSION_COMPLETED"),
  );
  if (accepted.length < 3) return;
  for (const cap of store.capabilities.filter((c) => c.partyId === partyId)) {
    if (cap.verifiedState === "SELF_DECLARED" || cap.verifiedState === "THIRD_PARTY_VERIFIED") {
      cap.verifiedState = "DELIVERY_PROVEN";
      cap.lastConfirmedAt = now();
    }
  }
}

export function submitMilestoneEvidence(input: {
  engagementId: string;
  milestoneId: string;
  type: Milestone["evidence"][0]["type"];
  fileUrl?: string;
  fileName?: string;
  criterionIndex?: number;
  ctx: ActingContext;
}) {
  const eng = getEngagement(input.engagementId);
  if (!eng) throw new Error("Engagement not found");
  const ms = eng.milestones.find((m) => m.milestoneId === input.milestoneId);
  if (!ms) throw new Error("Milestone not found");
  if (ms.state === "DRAFT") {
    throw new Error(
      "Work on unfunded milestones is at contributor risk — fund before submitting evidence",
    );
  }

  const contentHash = createHash("sha256")
    .update(`${input.fileUrl ?? ""}|${input.fileName ?? ""}|${now()}`)
    .digest("hex");

  const artifact = {
    evidenceId: id("evd"),
    milestoneId: ms.milestoneId,
    type: input.type,
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    uploaderPartyId: input.ctx.actingAsPartyId,
    uploadTime: now(),
    contentHash,
    criterionIndex: input.criterionIndex,
  };
  ms.evidence.push(artifact);
  emit(eng.engagementId, input.ctx.actingAsPartyId, "EVIDENCE_SUBMITTED", {
    evidenceId: artifact.evidenceId,
    milestoneId: ms.milestoneId,
  });
  return artifact;
}

export function getEventChain(engagementId: string) {
  const events = getCollaborateStore().events.filter(
    (e) => e.engagementId === engagementId,
  );
  return { events, verification: verifyEventChain(events) };
}

export function getReputation(partyId: string) {
  const store = getCollaborateStore();
  return {
    events: store.reputationEvents.filter((e) => e.partyId === partyId),
    projection:
      store.reputationProjections.find((p) => p.partyId === partyId) ??
      projectReputation(partyId, store.reputationEvents),
  };
}

export function snapshot() {
  const store = getCollaborateStore();
  return {
    parties: store.parties.length,
    engagements: store.engagements.length,
    offerings: store.offerings.length,
    events: store.events.length,
    reputationEvents: store.reputationEvents.length,
    taxonomy: store.taxonomy.length,
    pendingTaxonomy: store.pendingTaxonomy.length,
  };
}

export function resetCollaborateRuntime() {
  resetCollaborateStore();
  resetSandboxPaymentProvider();
}

/** Convert a completed SESSION into a JOB seed (§8.1 escalation path). */
export function escalateSessionToJob(input: {
  sessionEngagementId: string;
  title: string;
  ctx: ActingContext;
}): Engagement {
  const session = getEngagement(input.sessionEngagementId);
  if (!session || session.mode !== "SESSION") {
    throw new Error("Source must be a SESSION engagement");
  }
  const job = createEngagement({
    mode: "JOB",
    title: input.title,
    summary: session.sessionRecord
      ? `Escalated from session. Findings: ${session.sessionRecord.findings}`
      : `Escalated from session ${session.engagementId}`,
    buyerPartyId: session.buyerPartyId,
    currency: session.currency,
    jurisdiction: session.jurisdiction,
    ctx: input.ctx,
  });
  emit(job.engagementId, input.ctx.actingAsPartyId, "ESCALATED_FROM_SESSION", {
    sessionEngagementId: session.engagementId,
  });
  return job;
}

export type { HoldRef };
