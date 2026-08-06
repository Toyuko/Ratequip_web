import { isPart7Enabled } from "@/lib/v13/flags";
import { buildCommandEnvelope } from "@/lib/v13/command-envelope";
import { getPart7Store } from "@/lib/v13/part7/store";
import { seedPredicatesForSetup } from "@/lib/v13/part7/packs";
import type {
  BusinessFact,
  BusinessProfile,
  ConfirmationStatus,
} from "@/lib/v13/part7/types";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function tenantUuidFromCompany(companyId: string): string {
  // Deterministic pseudo-uuid for runtime store when Neon tenant uuid unavailable
  let hex = "";
  for (let i = 0; i < companyId.length; i++) {
    hex += companyId.charCodeAt(i).toString(16).padStart(2, "0");
  }
  hex = hex.padEnd(32, "0").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function ensureBusinessProfile(input: {
  companyId: string;
  legalName: string;
  role?: string;
  industryPack?: string;
  setupSessionId?: string;
  createdBy?: string;
}): BusinessProfile {
  const store = getPart7Store();
  const tenantId = tenantUuidFromCompany(input.companyId);
  let profile = store.profiles.find(
    (p) =>
      p.tenantId === tenantId &&
      p.legalName.toLowerCase() === input.legalName.trim().toLowerCase(),
  );
  const now = new Date().toISOString();
  if (!profile) {
    profile = {
      id: id("bprof"),
      tenantId,
      companyId: input.companyId,
      setupSessionId: input.setupSessionId,
      legalName: input.legalName.trim(),
      role: input.role,
      industryPack: input.industryPack,
      profileStatus: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: input.createdBy,
    };
    store.profiles.unshift(profile);
  } else {
    profile.setupSessionId = input.setupSessionId ?? profile.setupSessionId;
    profile.role = input.role ?? profile.role;
    profile.industryPack = input.industryPack ?? profile.industryPack;
    profile.updatedAt = now;
  }
  return profile;
}

export function ingestFact(input: {
  tenantId?: string;
  companyId: string;
  businessProfileId: string;
  predicate: string;
  objectJson: Record<string, unknown>;
  sourceType: string;
  sourceId?: string;
  confidence: number;
  confirmationStatus?: ConfirmationStatus;
  createdBy?: string;
  idempotencyKey?: string;
}):
  | { ok: true; fact: BusinessFact; envelope: ReturnType<typeof buildCommandEnvelope> }
  | { ok: false; message: string } {
  if (!isPart7Enabled()) {
    return { ok: false, message: "Part 7 Business DNA is disabled" };
  }
  const store = getPart7Store();
  const profile = store.profiles.find((p) => p.id === input.businessProfileId);
  if (!profile) return { ok: false, message: "Business profile not found" };
  if (profile.companyId && profile.companyId !== input.companyId) {
    return { ok: false, message: "Tenant isolation: company mismatch" };
  }

  const envelope = buildCommandEnvelope({
    tenantId: profile.tenantId,
    actorId: input.createdBy ?? "system",
    idempotencyKey: input.idempotencyKey,
  });
  if (input.idempotencyKey) {
    const existingId = store.idempotency.get(input.idempotencyKey);
    if (existingId) {
      const existing = store.facts.find((f) => f.id === existingId);
      if (existing) return { ok: true, fact: existing, envelope };
    }
  }

  // Supersede prior active fact with same predicate
  for (const f of store.facts) {
    if (
      f.businessProfileId === profile.id &&
      f.predicate === input.predicate &&
      !f.validTo
    ) {
      f.validTo = envelope.occurredAt;
      f.confirmationStatus = "superseded";
    }
  }

  const confidence = Math.max(0, Math.min(1, input.confidence));
  const fact: BusinessFact = {
    id: id("bfact"),
    tenantId: profile.tenantId,
    businessProfileId: profile.id,
    predicate: input.predicate,
    objectJson: input.objectJson,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    confidence,
    confirmationStatus: input.confirmationStatus ?? "inferred",
    validFrom: envelope.occurredAt,
    createdBy: input.createdBy,
    createdAt: envelope.occurredAt,
  };
  store.facts.unshift(fact);
  if (input.idempotencyKey) {
    store.idempotency.set(input.idempotencyKey, fact.id);
  }
  profile.updatedAt = envelope.occurredAt;
  if (profile.profileStatus === "draft") profile.profileStatus = "in_review";
  return { ok: true, fact, envelope };
}

export function confirmOrRejectFact(input: {
  factId: string;
  companyId: string;
  status: "confirmed" | "rejected";
  actorId: string;
}):
  | { ok: true; fact: BusinessFact }
  | { ok: false; message: string } {
  if (!isPart7Enabled()) {
    return { ok: false, message: "Part 7 Business DNA is disabled" };
  }
  const store = getPart7Store();
  const fact = store.facts.find((f) => f.id === input.factId);
  if (!fact) return { ok: false, message: "Fact not found" };
  const profile = store.profiles.find((p) => p.id === fact.businessProfileId);
  if (!profile || profile.companyId !== input.companyId) {
    return { ok: false, message: "Tenant isolation: fact not in company" };
  }
  if (fact.validTo) {
    return { ok: false, message: "Fact is no longer active" };
  }
  fact.confirmationStatus = input.status;
  fact.lastVerifiedAt = new Date().toISOString();
  fact.createdBy = input.actorId;
  return { ok: true, fact };
}

export function listActiveFacts(businessProfileId: string): BusinessFact[] {
  const store = getPart7Store();
  return store.facts.filter(
    (f) => f.businessProfileId === businessProfileId && !f.validTo,
  );
}

export function getProfileBySession(setupSessionId: string): BusinessProfile | null {
  const store = getPart7Store();
  return store.profiles.find((p) => p.setupSessionId === setupSessionId) ?? null;
}

export function seedFactsFromSetup(input: {
  companyId: string;
  legalName: string;
  role: string;
  industryPack: string;
  setupSessionId: string;
  createdBy?: string;
}): { profile: BusinessProfile; facts: BusinessFact[] } {
  const profile = ensureBusinessProfile(input);
  const seeds = seedPredicatesForSetup({
    role: input.role,
    industryPack: input.industryPack,
  });
  const facts: BusinessFact[] = [];
  if (!isPart7Enabled()) return { profile, facts };

  for (const seed of seeds) {
    const res = ingestFact({
      companyId: input.companyId,
      businessProfileId: profile.id,
      predicate: seed.predicate,
      objectJson: { value: seed.value },
      sourceType: "industry_pack",
      sourceId: input.industryPack,
      confidence: seed.confidence,
      confirmationStatus: "inferred",
      createdBy: input.createdBy ?? "system",
      idempotencyKey: `${input.setupSessionId}:${seed.predicate}`,
    });
    if (res.ok) facts.push(res.fact);
  }

  // Observed fact from user-provided legal name
  const nameRes = ingestFact({
    companyId: input.companyId,
    businessProfileId: profile.id,
    predicate: "identity.legal_name",
    objectJson: { value: input.legalName },
    sourceType: "user_input",
    confidence: 1,
    confirmationStatus: "observed",
    createdBy: input.createdBy,
    idempotencyKey: `${input.setupSessionId}:identity.legal_name`,
  });
  if (nameRes.ok) facts.push(nameRes.fact);

  checkpointSession({
    companyId: input.companyId,
    setupSessionId: input.setupSessionId,
    businessProfileId: profile.id,
    payload: { role: input.role, industryPack: input.industryPack },
  });

  return { profile, facts };
}

export function checkpointSession(input: {
  companyId: string;
  setupSessionId: string;
  businessProfileId?: string;
  payload: Record<string, unknown>;
}) {
  const store = getPart7Store();
  const tenantId = tenantUuidFromCompany(input.companyId);
  const existing = store.checkpoints.find(
    (c) => c.tenantId === tenantId && c.setupSessionId === input.setupSessionId,
  );
  const now = new Date().toISOString();
  if (existing) {
    existing.payload = { ...existing.payload, ...input.payload };
    existing.businessProfileId =
      input.businessProfileId ?? existing.businessProfileId;
    existing.updatedAt = now;
    return existing;
  }
  const row = {
    tenantId,
    setupSessionId: input.setupSessionId,
    businessProfileId: input.businessProfileId,
    payload: input.payload,
    updatedAt: now,
  };
  store.checkpoints.unshift(row);
  return row;
}

export function resumeSession(input: {
  companyId: string;
  setupSessionId: string;
}):
  | {
      ok: true;
      profile: BusinessProfile | null;
      facts: BusinessFact[];
      checkpoint: ReturnType<typeof checkpointSession> | null;
    }
  | { ok: false; message: string } {
  if (!isPart7Enabled()) {
    return { ok: false, message: "Part 7 Business DNA is disabled" };
  }
  const store = getPart7Store();
  const tenantId = tenantUuidFromCompany(input.companyId);
  const checkpoint =
    store.checkpoints.find(
      (c) =>
        c.tenantId === tenantId && c.setupSessionId === input.setupSessionId,
    ) ?? null;
  const profile =
    getProfileBySession(input.setupSessionId) ??
    (checkpoint?.businessProfileId
      ? (store.profiles.find((p) => p.id === checkpoint.businessProfileId) ??
        null)
      : null);
  if (profile && profile.companyId !== input.companyId) {
    return { ok: false, message: "Tenant isolation: session mismatch" };
  }
  const facts = profile ? listActiveFacts(profile.id) : [];
  return { ok: true, profile, facts, checkpoint };
}

export function markProfileConfirmed(input: {
  businessProfileId: string;
  operatingProfileId?: string;
  companyId: string;
}) {
  const store = getPart7Store();
  const profile = store.profiles.find((p) => p.id === input.businessProfileId);
  if (!profile || profile.companyId !== input.companyId) return null;
  profile.profileStatus = "confirmed";
  profile.operatingProfileId = input.operatingProfileId;
  profile.updatedAt = new Date().toISOString();
  profile.version += 1;
  return profile;
}

/** Confirmed/observed facts → answer keys for company suggester enrichment */
export function factsToAnswerEnrichment(
  facts: BusinessFact[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of facts) {
    if (
      f.confirmationStatus !== "confirmed" &&
      f.confirmationStatus !== "observed"
    ) {
      continue;
    }
    const v = f.objectJson.value;
    if (typeof v === "string") out[`dna:${f.predicate}`] = v;
    else if (Array.isArray(v)) out[`dna:${f.predicate}`] = v.join(", ");
    else if (typeof v === "boolean") out[`dna:${f.predicate}`] = v ? "yes" : "no";
    else if (v != null) out[`dna:${f.predicate}`] = JSON.stringify(v);
  }
  return out;
}

export function listDnaForSession(setupSessionId: string) {
  const profile = getProfileBySession(setupSessionId);
  if (!profile) {
    return {
      enabled: isPart7Enabled(),
      profile: null,
      facts: [] as BusinessFact[],
    };
  }
  return {
    enabled: isPart7Enabled(),
    profile,
    facts: listActiveFacts(profile.id),
  };
}
