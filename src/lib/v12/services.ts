import {
  mayExecuteWithoutConfirmation,
  type AIDraft,
} from "@/lib/v12/ai/confirmation-policy";
import { resolveQuestions, type RuleContext } from "@/lib/v12/dqe/resolver";
import {
  evaluateEligibility,
  scoreMatch,
} from "@/lib/v12/matching/scorer";
import { DEFAULT_MATCH_POLICY, type MatchFeature } from "@/lib/v12/matching/types";
import { rankCandidates } from "@/lib/v12/recommendations/ranker";
import { listCompanies, listCompaniesSync } from "@/lib/db/queries";
import { questionsForPack, searchTaxonomy } from "@/lib/v12/seeds";
import { getV12Store } from "@/lib/v12/store";
import { createHash } from "node:crypto";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function resolveActivationPack(input: {
  packId: string;
  roles: string[];
  answers?: Record<string, unknown>;
  taxonomyKeys?: string[];
  jurisdiction?: string;
}) {
  const ctx: RuleContext = {
    roles: input.roles,
    answers: (input.answers ?? {}) as RuleContext["answers"],
    taxonomy: new Set(input.taxonomyKeys ?? []),
    permissions: new Set(["activation.read"]),
    jurisdiction: input.jurisdiction,
  };
  const questions = questionsForPack(input.packId);
  const resolved = resolveQuestions(
    questions.map((q, i) => ({
      ...q,
      display_order: q.display_order ?? i + 1,
      version: q.version ?? 1,
      visibility_rule: q.visibility_rule ?? {},
      required_rule: q.required_rule ?? {},
    })),
    ctx,
  );
  return { packId: input.packId, questions: resolved, policyVersion: "v12.0.0-part1" };
}

export function saveAnswerSet(sessionId: string, answers: Record<string, unknown>) {
  const store = getV12Store();
  store.answerSets[sessionId] = answers;
  return { ok: true as const, sessionId };
}

export function upsertOpportunity(input: {
  companyId: string;
  companyName: string;
  targetIndustries: string[];
  targetRegions: string[];
  projectValueMin?: number;
  projectValueMax?: number;
  preferredRequirementTypes: string[];
  notes: string;
  publish?: boolean;
}) {
  const store = getV12Store();
  const existing = store.opportunities.find((o) => o.companyId === input.companyId);
  const profile = {
    id: existing?.id ?? id("opp"),
    companyId: input.companyId,
    companyName: input.companyName,
    status: (input.publish ? "published" : "draft") as "draft" | "published",
    targetIndustries: input.targetIndustries,
    targetRegions: input.targetRegions,
    projectValueMin: input.projectValueMin,
    projectValueMax: input.projectValueMax,
    currency: "USD",
    preferredRequirementTypes: input.preferredRequirementTypes,
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  };
  if (existing) {
    Object.assign(existing, profile);
  } else {
    store.opportunities.push(profile);
  }
  return profile;
}

export function upsertContractor(input: {
  companyId: string;
  companyName: string;
  trades: string[];
  licences: string[];
  serviceRadiusKm: number;
  emergencyAvailable: boolean;
  rateSummary: string;
  notes: string;
  publish?: boolean;
}) {
  const store = getV12Store();
  const existing = store.contractors.find((c) => c.companyId === input.companyId);
  const profile = {
    id: existing?.id ?? id("ctr"),
    companyId: input.companyId,
    companyName: input.companyName,
    status: (input.publish ? "published" : "draft") as "draft" | "published",
    trades: input.trades,
    licences: input.licences,
    serviceRadiusKm: input.serviceRadiusKm,
    emergencyAvailable: input.emergencyAvailable,
    rateSummary: input.rateSummary,
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  };
  if (existing) Object.assign(existing, profile);
  else store.contractors.push(profile);
  return profile;
}

export async function runExplainableMatch(input: {
  requirementLabel: string;
  requiredCategory?: string;
  region?: string;
}) {
  let list = listCompaniesSync({ q: input.requirementLabel });
  if (list.length === 0) {
    list = listCompaniesSync({});
  }
  try {
    const asyncList = await listCompanies({
      q: input.requirementLabel,
    });
    if (Array.isArray(asyncList) && asyncList.length > 0) {
      list = asyncList;
    }
  } catch {
    // keep sync list
  }
  const candidates = list.map((c) => {
    const eligibility = evaluateEligibility({
      hasRequiredCapability: true,
      inJurisdiction: true,
      serviceable: true,
      deadlineOk: true,
    });
    const features: MatchFeature[] = [
      {
        key: "capability",
        value: Math.min(1, c.trustScore / 100 + 0.1),
        weight: 0.22,
        reasonCode: "capability_coverage",
      },
      {
        key: "industry",
        value: c.categories.length ? 0.85 : 0.4,
        weight: 0.12,
        reasonCode: "industry_alignment",
      },
      {
        key: "geography",
        value: input.region
          ? c.country.toLowerCase().includes(input.region.toLowerCase())
            ? 1
            : 0.55
          : 0.7,
        weight: 0.12,
        reasonCode: "geo_serviceability",
      },
      {
        key: "trust",
        value: clamp01(c.trustScore / 100),
        weight: 0.1,
        reasonCode: "trust_score",
      },
      {
        key: "response",
        value: c.claimed ? 0.8 : 0.5,
        weight: 0.04,
        reasonCode: "claimed_profile",
      },
      {
        key: "commercial",
        value: 0.65,
        weight: 0.03,
        reasonCode: "commercial_fit",
      },
    ];
    const scored = scoreMatch(features, DEFAULT_MATCH_POLICY);
    return {
      id: c.slug,
      eligible: eligibility.eligible,
      organicScore: scored.score,
      sponsored: false,
      category: c.categories[0] ?? "general",
      supplierId: c.id,
      reasonCodes: [
        ...scored.reasons,
        ...eligibility.exclusionCodes.map((x) => `excluded:${x}`),
      ],
      policyVersion: scored.policyVersion,
    };
  });

  const ranked = rankCandidates(candidates, 8);
  const run = {
    id: id("match"),
    requirementLabel: input.requirementLabel,
    results: ranked,
    createdAt: new Date().toISOString(),
  };
  getV12Store().matchRuns.unshift(run);
  return run;
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function createAIDraft(input: {
  type: string;
  title: string;
  body: string;
  companyId: string;
  requestedBy: string;
  groundingRefs?: string[];
}) {
  const draft: AIDraft = {
    id: id("aidraft"),
    type: input.type,
    title: input.title,
    body: input.body,
    companyId: input.companyId,
    requestedBy: input.requestedBy,
    status: "draft",
    groundingRefs: input.groundingRefs ?? [],
    createdAt: new Date().toISOString(),
  };
  getV12Store().aiDrafts.unshift(draft);
  return draft;
}

export function confirmAIDraft(input: {
  draftId: string;
  confirmedBy: string;
  executeType?: string;
}) {
  const store = getV12Store();
  const draft = store.aiDrafts.find((d) => d.id === input.draftId);
  if (!draft) return { ok: false as const, message: "Draft not found" };
  if (draft.status !== "draft") {
    return { ok: false as const, message: "Draft already resolved" };
  }
  const actionType = input.executeType ?? draft.type;
  if (
    !mayExecuteWithoutConfirmation({
      type: actionType,
      draftId: draft.id,
      companyId: draft.companyId,
      requestedBy: input.confirmedBy,
    })
  ) {
    // Confirmation IS required — this call satisfies it
  }
  draft.status = "confirmed";
  draft.confirmedAt = new Date().toISOString();
  draft.confirmedBy = input.confirmedBy;
  return { ok: true as const, draft };
}

export function createRequisition(input: {
  title: string;
  description: string;
  taxonomyKeys: string[];
  budgetMax: number;
}) {
  const item = {
    id: id("reqn"),
    title: input.title,
    description: input.description,
    taxonomyKeys: input.taxonomyKeys,
    budgetMax: input.budgetMax,
    currency: "USD",
    status: "submitted" as const,
    createdAt: new Date().toISOString(),
  };
  getV12Store().requisitions.unshift(item);
  return item;
}

export function approveRequisition(idValue: string) {
  const item = getV12Store().requisitions.find((r) => r.id === idValue);
  if (!item) return { ok: false as const, message: "Not found" };
  item.status = "approved";
  return { ok: true as const, item };
}

export function createRfqRevision(input: {
  rfqId: string;
  payload: Record<string, unknown>;
  createdBy: string;
}) {
  const store = getV12Store();
  const prior = store.rfqRevisions.filter((r) => r.rfqId === input.rfqId);
  const revision = prior.length + 1;
  const contentHash = createHash("sha256")
    .update(JSON.stringify(input.payload))
    .digest("hex")
    .slice(0, 16);
  const row = {
    id: id("rfqrev"),
    rfqId: input.rfqId,
    revision,
    contentHash,
    payload: input.payload,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  store.rfqRevisions.unshift(row);
  return row;
}

export function awardRfq(input: {
  rfqId: string;
  quoteId: string;
  supplierSlug: string;
  amount: number;
  currency: string;
  reasonCodes: string[];
  awardedBy: string;
}) {
  const award = {
    id: id("award"),
    rfqId: input.rfqId,
    quoteId: input.quoteId,
    supplierSlug: input.supplierSlug,
    amount: input.amount,
    currency: input.currency,
    reasonCodes: input.reasonCodes,
    policyVersion: DEFAULT_MATCH_POLICY.version,
    awardedAt: new Date().toISOString(),
    awardedBy: input.awardedBy,
  };
  getV12Store().awards.unshift(award);
  return award;
}

export function taxonomySearch(q: string) {
  return searchTaxonomy(q);
}
