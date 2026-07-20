import {
  mayExecuteWithoutConfirmation,
  type AIDraft,
} from "@/lib/v12/ai/confirmation-policy";
import { hashDocumentBody } from "@/lib/v12/documents/vault";
import { resolveQuestions, type RuleContext } from "@/lib/v12/dqe/resolver";
import {
  analyzeDocumentText,
  listIndustryPacks,
} from "@/lib/v12/intelligence/analyzer";
import {
  canEnterPublishedScope,
  readinessScore,
} from "@/lib/v12/intelligence/classification";
import type { AnalysisRun } from "@/lib/v12/intelligence/types";
import {
  CHARGEABLE_ACTIONS,
  createUsagePreview,
  hashLedgerPayload,
} from "@/lib/v12/part4/entitlements";
import { ReleaseRegistry } from "@/lib/v12/part4/releaseRegistry";
import { isEnabled } from "@/lib/v12/part4/rollout";
import {
  evaluateEligibility,
  scoreMatch,
} from "@/lib/v12/matching/scorer";
import { DEFAULT_MATCH_POLICY, type MatchFeature } from "@/lib/v12/matching/types";
import { rankCandidates } from "@/lib/v12/recommendations/ranker";
import { listCompanies, listCompaniesSync } from "@/lib/db/queries";
import {
  persistAward,
  persistContractorProfile,
  persistMatchRun,
  persistOpportunityProfile,
  persistRequisition,
} from "@/lib/db/v12-neon";
import { questionsForPack, searchTaxonomy } from "@/lib/v12/seeds";
import {
  getV12Store,
  type AssetRecord,
  type AwardRecord,
  type PassportRecord,
  type Requisition,
} from "@/lib/v12/store";
import {
  getWorkflowTemplate,
  isTerminalNode,
  listWorkflowTemplates,
  nextApprovalNode,
  type WorkflowInstance,
} from "@/lib/v12/workflow/runtime";
import { createHash } from "node:crypto";

export { listIndustryPacks };

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function neonPersist(label: string, work: Promise<unknown>) {
  void work.catch((err) => {
    console.error(`[v12-neon] ${label} failed`, err);
  });
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
  neonPersist(
    "opportunity",
    persistOpportunityProfile({
      companyId: profile.companyId,
      companyName: profile.companyName,
      status: profile.status,
      targetIndustries: profile.targetIndustries,
      targetRegions: profile.targetRegions,
      projectValueMin: profile.projectValueMin,
      projectValueMax: profile.projectValueMax,
      preferredRequirementTypes: profile.preferredRequirementTypes,
      notes: profile.notes,
    }),
  );
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
  neonPersist(
    "contractor",
    persistContractorProfile({
      companyId: profile.companyId,
      companyName: profile.companyName,
      status: profile.status,
      trades: profile.trades,
      licences: profile.licences,
      serviceRadiusKm: profile.serviceRadiusKm,
      emergencyAvailable: profile.emergencyAvailable,
      rateSummary: profile.rateSummary,
      notes: profile.notes,
    }),
  );
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
  neonPersist(
    "match",
    persistMatchRun({
      requirementLabel: run.requirementLabel,
      results: ranked.map((r) => ({
        supplierId: r.supplierId ?? r.id,
        eligible: r.eligible,
        organicScore: r.organicScore,
        reasonCodes: r.reasonCodes,
        policyVersion: r.policyVersion ?? DEFAULT_MATCH_POLICY.version,
      })),
    }),
  );
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
  startedBy?: string;
}) {
  const item: Requisition = {
    id: id("reqn"),
    title: input.title,
    description: input.description,
    taxonomyKeys: input.taxonomyKeys,
    budgetMax: input.budgetMax,
    currency: "USD",
    status: "submitted",
    createdAt: new Date().toISOString(),
  };
  getV12Store().requisitions.unshift(item);
  const workflow = startWorkflow({
    templateId: "wf-procurement-approval-v1",
    subjectType: "requisition",
    subjectId: item.id,
    startedBy: input.startedBy ?? "buyer@demo.ratequip.com",
  });
  if (workflow.ok) {
    item.workflowInstanceId = workflow.instance.id;
  }
  neonPersist(
    "requisition",
    persistRequisition({
      id: item.id,
      companyId: "platform-buyer",
      title: item.title,
      status: item.status,
      lines: [],
      data: {
        description: item.description,
        taxonomyKeys: item.taxonomyKeys,
        budgetMax: item.budgetMax,
        currency: item.currency,
        workflowInstanceId: item.workflowInstanceId,
      },
    }),
  );
  return item;
}

export function approveRequisition(idValue: string, actor = "manager@demo.ratequip.com") {
  const item = getV12Store().requisitions.find((r) => r.id === idValue);
  if (!item) return { ok: false as const, message: "Not found" };

  // Prefer workflow completion when an instance is attached (Release 3A).
  if (item.workflowInstanceId) {
    const store = getV12Store();
    const open = store.workflowTasks.find(
      (t) =>
        t.instanceId === item.workflowInstanceId &&
        (t.status === "open" || t.status === "claimed"),
    );
    if (open) {
      const claimed = claimWorkflowTask({ taskId: open.id, actor });
      if (!claimed.ok) return claimed;
      const completed = completeWorkflowTask({ taskId: open.id, actor });
      if (!completed.ok) return completed;
      // Finance step still open — keep submitted until terminal.
      const stillOpen = store.workflowTasks.find(
        (t) =>
          t.instanceId === item.workflowInstanceId &&
          (t.status === "open" || t.status === "claimed"),
      );
      if (stillOpen) {
        return {
          ok: true as const,
          item,
          message: `Workflow advanced; awaiting ${stillOpen.node}`,
        };
      }
    }
  }

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
  assetName?: string;
  taxonomyKeys?: string[];
}) {
  const award: AwardRecord = {
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
  neonPersist(
    "award",
    persistAward({
      id: award.id,
      companyId: "platform-buyer",
      rfqId: award.rfqId,
      supplierId: award.supplierSlug,
      reasonCodes: award.reasonCodes,
      amount: award.amount,
    }),
  );

  // Release 2B — award creates asset + digital passport stub
  const asset = createAssetFromAward({
    awardId: award.id,
    rfqId: award.rfqId,
    supplierSlug: award.supplierSlug,
    name:
      input.assetName ??
      `Asset from award ${award.id.slice(0, 12)} (${award.supplierSlug})`,
    taxonomyKeys: input.taxonomyKeys ?? [],
    createdBy: input.awardedBy,
  });
  award.assetId = asset.id;

  return award;
}

export function taxonomySearch(q: string) {
  return searchTaxonomy(q);
}

/* ─── Release 2B: assets + passport ─── */

export function createAssetFromAward(input: {
  awardId: string;
  rfqId: string;
  supplierSlug: string;
  name: string;
  taxonomyKeys: string[];
  createdBy: string;
}) {
  const store = getV12Store();
  const asset: AssetRecord = {
    id: id("asset"),
    name: input.name,
    taxonomyKeys: input.taxonomyKeys,
    status: "commissioning",
    supplierSlug: input.supplierSlug,
    awardId: input.awardId,
    rfqId: input.rfqId,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  const passport: PassportRecord = {
    id: id("passport"),
    assetId: asset.id,
    status: "draft",
    sections: [
      { key: "identity", label: "Identity", value: asset.name },
      { key: "supplier", label: "Supplier", value: input.supplierSlug },
      { key: "award", label: "Award ref", value: input.awardId },
      { key: "rfq", label: "RFQ ref", value: input.rfqId },
    ],
    evidenceDocumentIds: [],
    createdAt: new Date().toISOString(),
  };
  asset.passportId = passport.id;
  store.assets.unshift(asset);
  store.passports.unshift(passport);
  return asset;
}

export function listAssets() {
  return getV12Store().assets;
}

export function issuePassport(passportId: string) {
  const passport = getV12Store().passports.find((p) => p.id === passportId);
  if (!passport) return { ok: false as const, message: "Passport not found" };
  passport.status = "issued";
  passport.issuedAt = new Date().toISOString();
  const asset = getV12Store().assets.find((a) => a.id === passport.assetId);
  if (asset) asset.status = "in_service";
  return { ok: true as const, passport, asset };
}

/* ─── Release 3A: workflow ─── */

export function startWorkflow(input: {
  templateId: string;
  subjectType: string;
  subjectId: string;
  startedBy: string;
}) {
  const template = getWorkflowTemplate(input.templateId);
  if (!template) {
    return { ok: false as const, message: "Unknown workflow template" };
  }
  const store = getV12Store();
  const startNode = template.nodes[0] ?? "submit";
  const firstTaskNode = template.nodes[1] ?? startNode;
  const instance: WorkflowInstance = {
    id: id("wfinst"),
    templateId: template.id,
    templateName: template.name,
    subjectType: input.subjectType,
    subjectId: input.subjectId,
    status: "running",
    currentNode: firstTaskNode,
    startedBy: input.startedBy,
    startedAt: new Date().toISOString(),
    history: [
      {
        at: new Date().toISOString(),
        node: startNode,
        action: "started",
        actor: input.startedBy,
      },
    ],
  };
  store.workflowInstances.unshift(instance);

  if (!isTerminalNode(template, firstTaskNode)) {
    store.workflowTasks.unshift({
      id: id("wftask"),
      instanceId: instance.id,
      node: firstTaskNode,
      status: "open",
      createdAt: new Date().toISOString(),
    });
  } else {
    instance.status = "completed";
    instance.completedAt = new Date().toISOString();
  }

  return { ok: true as const, instance };
}

export function claimWorkflowTask(input: { taskId: string; actor: string }) {
  const store = getV12Store();
  const task = store.workflowTasks.find((t) => t.id === input.taskId);
  if (!task) return { ok: false as const, message: "Task not found" };
  if (task.status !== "open" && task.status !== "claimed") {
    return { ok: false as const, message: "Task not claimable" };
  }
  const instance = store.workflowInstances.find((i) => i.id === task.instanceId);
  if (instance && instance.startedBy === input.actor) {
    return {
      ok: false as const,
      message: "Self-approval blocked (ADR-0024)",
    };
  }
  task.status = "claimed";
  task.claimedBy = input.actor;
  task.assignee = input.actor;
  return { ok: true as const, task };
}

export function completeWorkflowTask(input: { taskId: string; actor: string }) {
  const store = getV12Store();
  const task = store.workflowTasks.find((t) => t.id === input.taskId);
  if (!task) return { ok: false as const, message: "Task not found" };
  if (task.status === "open") {
    const claimed = claimWorkflowTask(input);
    if (!claimed.ok) return claimed;
  }
  if (task.status !== "claimed") {
    return { ok: false as const, message: "Task must be claimed first" };
  }
  if (task.claimedBy && task.claimedBy !== input.actor) {
    return { ok: false as const, message: "Task claimed by another actor" };
  }

  const instance = store.workflowInstances.find((i) => i.id === task.instanceId);
  if (!instance) return { ok: false as const, message: "Instance missing" };
  const template = getWorkflowTemplate(instance.templateId);
  if (!template) return { ok: false as const, message: "Template missing" };

  task.status = "completed";
  task.completedBy = input.actor;
  task.completedAt = new Date().toISOString();
  instance.history.push({
    at: task.completedAt,
    node: task.node,
    action: "completed",
    actor: input.actor,
  });

  const next = nextApprovalNode(template, task.node);
  if (!next || isTerminalNode(template, next)) {
    instance.status = "completed";
    instance.currentNode = template.nodes[template.nodes.length - 1] ?? "approved";
    instance.completedAt = new Date().toISOString();
    if (instance.subjectType === "requisition") {
      const reqn = store.requisitions.find((r) => r.id === instance.subjectId);
      if (reqn) reqn.status = "approved";
    }
    return { ok: true as const, task, instance };
  }

  instance.currentNode = next;
  store.workflowTasks.unshift({
    id: id("wftask"),
    instanceId: instance.id,
    node: next,
    status: "open",
    createdAt: new Date().toISOString(),
  });
  return { ok: true as const, task, instance };
}

export function listWorkflowOverview() {
  const store = getV12Store();
  return {
    templates: listWorkflowTemplates(),
    instances: store.workflowInstances,
    tasks: store.workflowTasks,
  };
}

/* ─── Release 3A: document vault ─── */

export function createDocument(input: {
  title: string;
  docType: string;
  body: string;
  createdBy: string;
  linkedType?: string;
  linkedId?: string;
}) {
  const store = getV12Store();
  const doc = {
    id: id("doc"),
    title: input.title,
    docType: input.docType,
    linkedType: input.linkedType,
    linkedId: input.linkedId,
    status: "draft" as const,
    currentVersion: 1,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const version = {
    id: id("docver"),
    documentId: doc.id,
    version: 1,
    contentHash: hashDocumentBody(input.body),
    label: "v1",
    body: input.body,
    status: "draft" as const,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  store.documents.unshift(doc);
  store.documentVersions.unshift(version);
  return { document: doc, version };
}

export function addDocumentVersion(input: {
  documentId: string;
  body: string;
  createdBy: string;
  label?: string;
}) {
  const store = getV12Store();
  const doc = store.documents.find((d) => d.id === input.documentId);
  if (!doc) return { ok: false as const, message: "Document not found" };
  if (doc.status === "held") {
    return { ok: false as const, message: "Document on legal hold" };
  }
  const current = store.documentVersions.find(
    (v) => v.documentId === doc.id && v.version === doc.currentVersion,
  );
  if (current?.status === "approved") {
    current.status = "superseded";
  }
  const nextVersion = doc.currentVersion + 1;
  const version = {
    id: id("docver"),
    documentId: doc.id,
    version: nextVersion,
    contentHash: hashDocumentBody(input.body),
    label: input.label ?? `v${nextVersion}`,
    body: input.body,
    status: "draft" as const,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  doc.currentVersion = nextVersion;
  doc.status = "draft";
  doc.updatedAt = new Date().toISOString();
  store.documentVersions.unshift(version);
  return { ok: true as const, document: doc, version };
}

export function approveDocumentVersion(input: {
  documentId: string;
  version: number;
  approvedBy: string;
}) {
  const store = getV12Store();
  const doc = store.documents.find((d) => d.id === input.documentId);
  if (!doc) return { ok: false as const, message: "Document not found" };
  const version = store.documentVersions.find(
    (v) => v.documentId === doc.id && v.version === input.version,
  );
  if (!version) return { ok: false as const, message: "Version not found" };
  if (version.status === "approved") {
    return { ok: false as const, message: "Version already approved (immutable)" };
  }
  if (doc.createdBy === input.approvedBy) {
    return {
      ok: false as const,
      message: "Self-approval blocked for document evidence",
    };
  }
  version.status = "approved";
  version.approvedBy = input.approvedBy;
  version.approvedAt = new Date().toISOString();
  doc.status = "approved";
  doc.updatedAt = new Date().toISOString();

  // Link evidence onto passport when document is tied to an asset
  if (doc.linkedType === "asset" && doc.linkedId) {
    const passport = store.passports.find((p) => p.assetId === doc.linkedId);
    if (passport && !passport.evidenceDocumentIds.includes(doc.id)) {
      passport.evidenceDocumentIds.push(doc.id);
    }
  }

  return { ok: true as const, document: doc, version };
}

export function listDocuments() {
  const store = getV12Store();
  return {
    documents: store.documents,
    versions: store.documentVersions,
  };
}

/* ─── Release 5A: document intelligence + requirement ledger ─── */

export function uploadAndAnalyzeUrs(input: {
  title: string;
  sourceText: string;
  industryPack: string;
  createdBy: string;
  companyId?: string;
  filename?: string;
  /** Part 4 ADR-0041 — required for chargeable analysis */
  previewId?: string;
  confirmUsage?: boolean;
}) {
  const store = getV12Store();
  const companyId = input.companyId ?? "platform-buyer";

  // Feature 143 — cohort gate for requirement ledger
  const cohort = store.cohorts.find(
    (c) => c.flagKey === "part5.requirement_ledger",
  );
  if (
    cohort &&
    !isEnabled(cohort, companyId, cohort.flagKey, Date.now()) &&
    !isEnabled(cohort, input.createdBy, cohort.flagKey, Date.now())
  ) {
    return {
      ok: false as const,
      code: "FEATURE_DISABLED",
      message: "Requirement ledger disabled for this cohort (kill switch / expiry)",
    };
  }

  // Feature 145 — usage preview before chargeable analysis
  if (CHARGEABLE_ACTIONS.has("intelligence.urs_analysis")) {
    if (!input.previewId || !input.confirmUsage) {
      const preview = previewUrsAnalysisUsage({
        companyId,
        createdBy: input.createdBy,
      });
      return {
        ok: false as const,
        code: "USAGE_PREVIEW_REQUIRED",
        message: "Confirm usage preview before running URS analysis",
        preview,
      };
    }
    const preview = store.usagePreviews.find((p) => p.id === input.previewId);
    if (!preview) {
      return { ok: false as const, code: "PREVIEW_NOT_FOUND", message: "Unknown preview" };
    }
    if (!preview.confirmed) {
      return {
        ok: false as const,
        code: "PREVIEW_NOT_CONFIRMED",
        message: "Confirm the usage preview first",
      };
    }
    // Consume against ledger
    const qty = preview.high;
    if (qty > store.entitlementRemaining) {
      return {
        ok: false as const,
        code: "INSUFFICIENT_ENTITLEMENT",
        message: "Not enough remaining usage",
      };
    }
    store.entitlementRemaining -= qty;
    store.usageLedger.unshift({
      id: id("ule"),
      correlationId: id("corr"),
      previewId: preview.id,
      quantity: qty,
      unit: preview.unit,
      entryType: "consume",
      immutableHash: hashLedgerPayload({
        previewId: preview.id,
        qty,
        action: preview.actionClass,
      }),
      createdAt: new Date().toISOString(),
      actionClass: preview.actionClass,
    });
  }

  // Reuse Domain 38 vault for evidence continuity
  const vault = createDocument({
    title: input.title,
    docType: "urs_rfq",
    body: input.sourceText,
    createdBy: input.createdBy,
    linkedType: "analysis",
  });

  const run: AnalysisRun = {
    id: id("arun"),
    companyId,
    title: input.title,
    industryPack: input.industryPack,
    status: "running",
    policyVersion: "pending",
    modelVersion: "rules-v1-stub",
    documentId: vault.document.id,
    documentVersionId: vault.version.id,
    vaultDocumentId: vault.document.id,
    sourceFilename: input.filename ?? `${input.title}.txt`,
    sourceText: input.sourceText,
    startedAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  store.analysisRuns.unshift(run);

  const result = analyzeDocumentText({
    analysisRunId: run.id,
    documentVersionId: vault.version.id,
    industryPack: input.industryPack,
    sourceText: input.sourceText,
  });

  store.intelligenceClauses.push(...result.clauses);
  store.intelligenceRequirements.push(...result.requirements);
  store.intelligenceGaps.push(...result.gaps);
  store.intelligenceQuestions.push(...result.questions);
  store.intelligenceRecommendations.push(...result.recommendations);

  run.status = "completed";
  run.completedAt = new Date().toISOString();
  run.confidence = result.confidence;
  run.policyVersion = result.policyVersion;

  return {
    ok: true as const,
    run,
    vault,
    counts: {
      clauses: result.clauses.length,
      requirements: result.requirements.length,
      gaps: result.gaps.length,
      questions: result.questions.length,
      recommendations: result.recommendations.length,
    },
    explicitRecall: result.explicitRecall,
    readiness: readinessScore({
      requirements: result.requirements,
      openGaps: result.gaps.length,
      unansweredBlockingQuestions: result.questions.filter(
        (q) => q.blocksPublication && !q.answer,
      ).length,
    }),
    entitlementRemaining: store.entitlementRemaining,
  };
}

export function listAnalysisOverview(runId?: string) {
  const store = getV12Store();
  const runs = store.analysisRuns;
  const run = runId
    ? runs.find((r) => r.id === runId)
    : runs[0];
  if (!run) {
    return {
      packs: listIndustryPacks(),
      runs,
      run: null,
      requirements: [],
      gaps: [],
      questions: [],
      recommendations: [],
      readiness: 0,
    };
  }
  const requirements = store.intelligenceRequirements.filter(
    (r) => r.analysisRunId === run.id,
  );
  const gaps = store.intelligenceGaps.filter((g) => g.analysisRunId === run.id);
  const questions = store.intelligenceQuestions.filter(
    (q) => q.analysisRunId === run.id,
  );
  const recommendations = store.intelligenceRecommendations.filter(
    (r) => r.analysisRunId === run.id,
  );
  return {
    packs: listIndustryPacks(),
    runs,
    run,
    requirements,
    gaps,
    questions,
    recommendations,
    readiness: readinessScore({
      requirements,
      openGaps: gaps.length,
      unansweredBlockingQuestions: questions.filter(
        (q) => q.blocksPublication && !q.answer,
      ).length,
    }),
  };
}

export function confirmRequirement(input: {
  requirementId: string;
  reviewerId: string;
  note?: string;
}) {
  const req = getV12Store().intelligenceRequirements.find(
    (r) => r.id === input.requirementId,
  );
  if (!req) return { ok: false as const, message: "Requirement not found" };
  if (req.reviewerStatus !== "pending") {
    return { ok: false as const, message: "Requirement already reviewed" };
  }
  req.reviewerStatus = "confirmed";
  req.reviewedBy = input.reviewerId;
  req.reviewedAt = new Date().toISOString();
  req.reviewNote = input.note;
  return { ok: true as const, requirement: req };
}

export function rejectRequirement(input: {
  requirementId: string;
  reviewerId: string;
  note?: string;
}) {
  const req = getV12Store().intelligenceRequirements.find(
    (r) => r.id === input.requirementId,
  );
  if (!req) return { ok: false as const, message: "Requirement not found" };
  if (req.reviewerStatus !== "pending") {
    return { ok: false as const, message: "Requirement already reviewed" };
  }
  req.reviewerStatus = "rejected";
  req.reviewedBy = input.reviewerId;
  req.reviewedAt = new Date().toISOString();
  req.reviewNote = input.note;
  return { ok: true as const, requirement: req };
}

export function answerIntelligenceQuestion(input: {
  questionId: string;
  answer: string;
  answeredBy: string;
}) {
  const q = getV12Store().intelligenceQuestions.find(
    (x) => x.id === input.questionId,
  );
  if (!q) return { ok: false as const, message: "Question not found" };
  q.answer = input.answer;
  q.answeredBy = input.answeredBy;
  q.answeredAt = new Date().toISOString();
  return { ok: true as const, question: q };
}

export function approveIntelligenceRecommendation(input: {
  recommendationId: string;
  reviewerId: string;
}) {
  const rec = getV12Store().intelligenceRecommendations.find(
    (r) => r.id === input.recommendationId,
  );
  if (!rec) return { ok: false as const, message: "Recommendation not found" };
  rec.buyerConfirmationStatus = "approved";
  if (!canEnterPublishedScope(rec)) {
    // Keep approved for audit but mark that it cannot enter published scope
    return {
      ok: true as const,
      recommendation: rec,
      publishable: false as const,
      message: "Approved for record but blocked from published scope",
    };
  }
  return { ok: true as const, recommendation: rec, publishable: true as const };
}

/* ─── Release 4A: release registry + cohort + entitlement preview ─── */

const releaseRegistrySingleton = new ReleaseRegistry();

export function previewUrsAnalysisUsage(input?: {
  companyId?: string;
  createdBy?: string;
}) {
  const store = getV12Store();
  const preview = createUsagePreview({
    actionClass: "intelligence.urs_analysis",
    unit: "credits",
    low: 3,
    high: 8,
    remaining: store.entitlementRemaining,
    resetAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    policyVersion: "entitlement-v12.1-part4",
  });
  store.usagePreviews.unshift(preview);
  void input;
  return preview;
}

export function confirmUsagePreview(input: {
  previewId: string;
  confirmedBy: string;
}) {
  const preview = getV12Store().usagePreviews.find(
    (p) => p.id === input.previewId,
  );
  if (!preview) return { ok: false as const, message: "Preview not found" };
  preview.confirmed = true;
  preview.confirmedAt = new Date().toISOString();
  preview.confirmedBy = input.confirmedBy;
  return { ok: true as const, preview };
}

export function registerAddonRelease(input: {
  key: string;
  predecessor: string;
  minMigration: number;
  maxMigration: number;
  checksum: string;
}) {
  // Seed registry from store first
  const store = getV12Store();
  for (const r of store.releases) {
    if (!releaseRegistrySingleton.get(r.key)) {
      releaseRegistrySingleton.register(r);
    }
  }
  const validation = releaseRegistrySingleton.validate(input, {
    release: input.predecessor,
    migration: input.minMigration - 1,
  });
  if (!validation.ok) return validation;
  const registered = releaseRegistrySingleton.register(input);
  if (registered.ok) {
    store.releases.unshift(registered.value);
  }
  return registered;
}

export function listReleaseControl() {
  const store = getV12Store();
  return {
    releases: store.releases,
    cohorts: store.cohorts.map((c) => ({
      key: c.key,
      flagKey: c.flagKey,
      killSwitch: c.killSwitch,
      percentage: c.percentage,
      startsAt: c.startsAt,
      expiresAt: c.expiresAt,
      memberCount: c.members.size,
      enabledForDemo: isEnabled(
        c,
        "platform-buyer",
        c.flagKey,
        Date.now(),
      ),
    })),
    entitlementRemaining: store.entitlementRemaining,
    previews: store.usagePreviews.slice(0, 10),
    ledger: store.usageLedger.slice(0, 20),
  };
}

export function setCohortKillSwitch(input: {
  cohortKey: string;
  killSwitch: boolean;
}) {
  const cohort = getV12Store().cohorts.find((c) => c.key === input.cohortKey);
  if (!cohort) return { ok: false as const, message: "Cohort not found" };
  cohort.killSwitch = input.killSwitch;
  return { ok: true as const, cohort };
}
