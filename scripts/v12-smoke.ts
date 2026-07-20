/**
 * V12 engines + commercial spine + 2B assets + 3A workflow/vault smoke.
 */
import { evaluateRule } from "../src/lib/v12/dqe/rule-engine";
import { resolveQuestions } from "../src/lib/v12/dqe/resolver";
import { scoreMatch, evaluateEligibility } from "../src/lib/v12/matching/scorer";
import { DEFAULT_MATCH_POLICY } from "../src/lib/v12/matching/types";
import { rankCandidates } from "../src/lib/v12/recommendations/ranker";
import { mayExecuteWithoutConfirmation } from "../src/lib/v12/ai/confirmation-policy";
import {
  assertEvidenceLinked,
  canEnterPublishedScope,
} from "../src/lib/v12/intelligence/classification";
import {
  approveDocumentVersion,
  approveRequisition,
  awardRfq,
  claimWorkflowTask,
  completeWorkflowTask,
  confirmAIDraft,
  confirmRequirement,
  confirmUsagePreview,
  createAIDraft,
  createCatalogImport,
  createDocument,
  createRequisition,
  createRfqRevision,
  issuePassport,
  previewCatalogImportUsage,
  previewUrsAnalysisUsage,
  processCatalogImport,
  publishCatalogJob,
  rejectRequirement,
  confirmCompanySetup,
  reviewCompanySetupSuggestions,
  resolveActivationPack,
  reviewCatalogDraft,
  runExplainableMatch,
  saveCompanySetupSection,
  startCompanySetup,
  uploadAndAnalyzeUrs,
} from "../src/lib/v12/services";
import { resetV12Store, getV12Store } from "../src/lib/v12/store";
import { questionsForPack } from "../src/lib/v12/seeds";
import { listWorkflowTemplates } from "../src/lib/v12/workflow/runtime";

async function main() {
  resetV12Store();

  if (!evaluateRule({ const: true }, { roles: [], answers: {}, taxonomy: new Set(), permissions: new Set() })) {
    throw new Error("rule engine failed");
  }

  const pack = resolveActivationPack({ packId: "universal", roles: ["buyer"] });
  if (pack.questions.length < 1) throw new Error("DQE pack empty");

  const qs = questionsForPack("role.buyer");
  const resolved = resolveQuestions(
    qs.map((q, i) => ({ ...q, display_order: q.display_order ?? i, version: 1 })),
    { roles: ["buyer"], answers: {}, taxonomy: new Set(), permissions: new Set() },
  );
  if (resolved.length < 1) throw new Error("role.buyer unresolved");

  const eligibility = evaluateEligibility({
    hasRequiredCapability: true,
    inJurisdiction: true,
    serviceable: true,
    deadlineOk: true,
  });
  if (!eligibility.eligible) throw new Error("eligibility failed");

  const scored = scoreMatch(
    [
      { key: "capability", value: 0.9, weight: 0.22, reasonCode: "capability_coverage" },
      { key: "trust", value: 0.8, weight: 0.1, reasonCode: "trust_score" },
      { key: "geography", value: 0.7, weight: 0.12, reasonCode: "geo_serviceability" },
    ],
    DEFAULT_MATCH_POLICY,
  );
  if (scored.score < 40) throw new Error("score too low");

  const ranked = rankCandidates(
    [
      {
        id: "a",
        eligible: true,
        organicScore: 88,
        sponsored: false,
        category: "packaging",
        reasonCodes: scored.reasons,
      },
      {
        id: "b",
        eligible: true,
        organicScore: 70,
        sponsored: true,
        category: "packaging",
        reasonCodes: ["sponsored"],
      },
    ],
    5,
  );
  if (ranked[0]?.id !== "a") throw new Error("ranking order wrong");

  if (mayExecuteWithoutConfirmation({
    type: "publish_rfq",
    draftId: "x",
    companyId: "c",
    requestedBy: "u",
  })) {
    throw new Error("publish_rfq must require confirmation");
  }

  const match = await runExplainableMatch({
    requirementLabel: "filler",
    requiredCategory: "packaging-machinery",
  });
  if (!match.results.length) throw new Error("match empty");

  const draft = createAIDraft({
    type: "publish_rfq",
    title: "Smoke draft",
    body: "body",
    companyId: "c1",
    requestedBy: "u1",
  });
  const confirmed = confirmAIDraft({
    draftId: draft.id,
    confirmedBy: "u1",
  });
  if (!confirmed.ok || confirmed.draft?.status !== "confirmed") {
    throw new Error("AI confirm failed");
  }

  if (listWorkflowTemplates().length < 1) {
    throw new Error("workflow templates missing");
  }

  const reqn = createRequisition({
    title: "Smoke requisition",
    description: "desc",
    taxonomyKeys: ["tax:rq:industry.food_beverage"],
    budgetMax: 1,
    startedBy: "buyer@demo.ratequip.com",
  });
  if (!reqn.workflowInstanceId) throw new Error("requisition did not start workflow");

  // Self-approval must fail
  const self = claimWorkflowTask({
    taskId: getV12Store().workflowTasks.find((t) => t.status === "open")!.id,
    actor: "buyer@demo.ratequip.com",
  });
  if (self.ok) throw new Error("self-approval should be blocked");

  // Manager + finance steps
  let open = getV12Store().workflowTasks.find((t) => t.status === "open");
  if (!open) throw new Error("expected manager task");
  const mgr = completeWorkflowTask({
    taskId: open.id,
    actor: "manager@demo.ratequip.com",
  });
  if (!mgr.ok) throw new Error(`manager step failed: ${mgr.message}`);

  open = getV12Store().workflowTasks.find((t) => t.status === "open");
  if (!open) throw new Error("expected finance task");
  const fin = completeWorkflowTask({
    taskId: open.id,
    actor: "finance@demo.ratequip.com",
  });
  if (!fin.ok) throw new Error(`finance step failed: ${fin.message}`);

  const approved = getV12Store().requisitions.find((r) => r.id === reqn.id);
  if (approved?.status !== "approved") {
    throw new Error("requisition not approved after workflow");
  }

  // Legacy one-shot approve path still works on seeded item
  const legacy = approveRequisition("reqn-1", "manager@demo.ratequip.com");
  if (!legacy.ok) throw new Error("legacy approve failed");

  const rev = createRfqRevision({
    rfqId: "req-1",
    payload: { note: "smoke" },
    createdBy: "u1",
  });
  if (rev.revision !== 1) throw new Error("revision numbering failed");

  const award = awardRfq({
    rfqId: "req-1",
    quoteId: "q-1",
    supplierSlug: "nordicfill-systems",
    amount: 100,
    currency: "USD",
    reasonCodes: ["commercial_fit"],
    awardedBy: "u1",
    assetName: "Smoke auger filler",
    taxonomyKeys: ["tax:rq:industry.food_beverage"],
  });
  if (!award.id || !award.assetId) throw new Error("award→asset failed");

  const asset = getV12Store().assets.find((a) => a.id === award.assetId);
  if (!asset?.passportId) throw new Error("passport missing");
  const issued = issuePassport(asset.passportId);
  if (!issued.ok || issued.asset?.status !== "in_service") {
    throw new Error("passport issue failed");
  }

  const doc = createDocument({
    title: "FAT certificate",
    docType: "certificate",
    body: "Factory acceptance test passed",
    createdBy: "buyer@demo.ratequip.com",
    linkedType: "asset",
    linkedId: asset.id,
  });
  const badSelf = approveDocumentVersion({
    documentId: doc.document.id,
    version: 1,
    approvedBy: "buyer@demo.ratequip.com",
  });
  if (badSelf.ok) throw new Error("document self-approval should fail");

  const docOk = approveDocumentVersion({
    documentId: doc.document.id,
    version: 1,
    approvedBy: "qa@demo.ratequip.com",
  });
  if (!docOk.ok) throw new Error(`document approve failed: ${docOk.message}`);

  const again = approveDocumentVersion({
    documentId: doc.document.id,
    version: 1,
    approvedBy: "qa@demo.ratequip.com",
  });
  if (again.ok) throw new Error("approved version must be immutable");

  // Part 5 / Release 5A — requirement ledger
  try {
    assertEvidenceLinked({
      id: "x",
      analysisRunId: "a",
      clauseId: "c",
      originalText: "x",
      normalisedText: "x",
      classification: "explicit_requirement",
      mandatory: true,
      confidence: 0.9,
      evidence: [],
      reviewerStatus: "pending",
    });
    throw new Error("explicit without evidence should throw");
  } catch (e) {
    if (!(e instanceof Error) || e.message !== "EXPLICIT_REQUIREMENT_REQUIRES_EVIDENCE") {
      throw e;
    }
  }
  if (
    canEnterPublishedScope({
      buyerConfirmationStatus: "approved",
      classification: "commercial_opportunity_only",
    })
  ) {
    throw new Error("commercial-only must not enter published scope");
  }

  const analysisBlocked = uploadAndAnalyzeUrs({
    title: "Smoke capping URS",
    industryPack: "pharma_capping",
    createdBy: "buyer@demo.ratequip.com",
    sourceText: `
      The machine shall be a single head capper capable of 20-60 containers/min.
      It must accept screw and press-on caps.
      Infeed after counting/filling shall be provided.
      Foil presence and cap-height inspection are required with reject tray.
      Checkweigher outfeed and validation documentation are mandatory.
    `,
  });
  if (analysisBlocked.ok || analysisBlocked.code !== "USAGE_PREVIEW_REQUIRED") {
    throw new Error("URS analysis must require usage preview");
  }

  const preview = previewUrsAnalysisUsage();
  const previewOk = confirmUsagePreview({
    previewId: preview.id,
    confirmedBy: "buyer@demo.ratequip.com",
  });
  if (!previewOk.ok) throw new Error(previewOk.message);

  const analysis = uploadAndAnalyzeUrs({
    title: "Smoke capping URS",
    industryPack: "pharma_capping",
    createdBy: "buyer@demo.ratequip.com",
    previewId: preview.id,
    confirmUsage: true,
    sourceText: `
      The machine shall be a single head capper capable of 20-60 containers/min.
      It must accept screw and press-on caps.
      Infeed after counting/filling shall be provided.
      Foil presence and cap-height inspection are required with reject tray.
      Checkweigher outfeed and validation documentation are mandatory.
    `,
  });
  if (!analysis.ok) throw new Error(analysis.message);
  if (analysis.counts.requirements < 4) {
    throw new Error("expected multiple explicit requirements from fixture terms");
  }
  if (analysis.explicitRecall < 0.5) {
    throw new Error(`explicit recall too low: ${analysis.explicitRecall}`);
  }
  const firstReq = getV12Store().intelligenceRequirements.find(
    (r) => r.analysisRunId === analysis.run.id,
  );
  if (!firstReq) throw new Error("no ledger requirement");
  const ledgerConfirm = confirmRequirement({
    requirementId: firstReq.id,
    reviewerId: "buyer_engineer@demo.ratequip.com",
  });
  if (!ledgerConfirm.ok) throw new Error(ledgerConfirm.message);
  const ledgerReject = rejectRequirement({
    requirementId: firstReq.id,
    reviewerId: "buyer_engineer@demo.ratequip.com",
  });
  if (ledgerReject.ok) throw new Error("double review should fail");

  // Part 6 / Release 6A — catalogue factory
  const catBlocked = createCatalogImport({
    title: "Smoke brochure",
    sourceText: "Model: Capper-X\nCapacity: 40/min",
    createdBy: "supplier@demo.ratequip.com",
    rightsAttested: false,
  });
  if (catBlocked.ok) throw new Error("rights attestation required");

  const cat = createCatalogImport({
    title: "Smoke brochure",
    sourceText: `Model: Capper-X single head
Capacity: 40 containers/min
Model: BagFill-200
Capacity: 20-60 bags/min`,
    createdBy: "supplier@demo.ratequip.com",
    rightsAttested: true,
  });
  if (!cat.ok) throw new Error(cat.message);

  const catPreview = previewCatalogImportUsage(cat.job.id);
  if (!catPreview.ok) throw new Error(catPreview.message);
  const catConfirm = confirmUsagePreview({
    previewId: catPreview.preview.id,
    confirmedBy: "supplier@demo.ratequip.com",
  });
  if (!catConfirm.ok) throw new Error(catConfirm.message);

  const processed = processCatalogImport({
    jobId: cat.job.id,
    previewId: catPreview.preview.id,
    confirmUsage: true,
    usePackagingFixture: true,
  });
  if (!processed.ok) throw new Error(processed.message);
  if (processed.drafts.length < 1) throw new Error("expected catalogue drafts");

  const catalogDraft = processed.drafts[0]!;
  const reviewed = reviewCatalogDraft({
    draftId: catalogDraft.id,
    decision: "accepted",
    reviewerId: "supplier@demo.ratequip.com",
  });
  if (!reviewed.ok || !reviewed.draft.publishable) {
    throw new Error("accepted draft should become publishable");
  }
  const published = publishCatalogJob({
    jobId: cat.job.id,
    publisherId: "supplier@demo.ratequip.com",
  });
  if (!published.ok || published.publishedCount < 1) {
    throw new Error("publish failed");
  }

  const setup = startCompanySetup({
    companyName: "Smoke Foods Pty Ltd",
    role: "buyer",
    industryPack: "pet_food",
  });
  if (!setup.ok) throw new Error(setup.message);
  if (setup.session.sections.length < 5) {
    throw new Error("expected multi-section company setup interview");
  }

  let setupSession = setup.session;
  for (let i = 0; i < setup.session.sections.length; i++) {
    const section = setupSession.sections[setupSession.sectionIndex]!;
    const answers: Record<string, string> = {};
    for (const q of section.questions) {
      answers[q.id] =
        q.inputType === "single_select" && q.options?.[0]
          ? q.options[0].value
          : `smoke-answer-${q.id}`;
    }
    const advanced = saveCompanySetupSection({
      sessionId: setupSession.id,
      answers,
      advance: true,
    });
    if (!advanced.ok) throw new Error(advanced.message);
    setupSession = advanced.session;
  }
  if (setupSession.status !== "review" || setupSession.suggestions.length < 1) {
    throw new Error("setup should reach review with suggestions");
  }

  const reviewedSetup = reviewCompanySetupSuggestions({
    sessionId: setupSession.id,
    decisions: setupSession.suggestions.map((s) => ({
      id: s.id,
      status: "accepted" as const,
    })),
  });
  if (!reviewedSetup.ok) throw new Error(reviewedSetup.message);

  const confirmedSetup = confirmCompanySetup({
    sessionId: setupSession.id,
    confirmedBy: "smoke@demo.ratequip.com",
  });
  if (!confirmedSetup.ok || confirmedSetup.profile.status !== "confirmed") {
    throw new Error("company operating profile confirm failed");
  }
  if (
    !confirmedSetup.companySuggestions ||
    confirmedSetup.companySuggestions.length < 1
  ) {
    throw new Error("expected AI company suggestions from operating profile");
  }
  if (
    !confirmedSetup.companySuggestions.some(
      (c) => c.badge === "trusted_supplier" || c.trustScore >= 70,
    )
  ) {
    throw new Error("expected trusted/relevant supplier in suggestions");
  }

  console.log("V12 smoke passed.", {
    questions: pack.questions.length,
    matchCount: match.results.length,
    awardId: award.id,
    assetId: award.assetId,
    workflowTemplates: listWorkflowTemplates().length,
    documentHash: doc.version.contentHash,
    analysisRunId: analysis.run.id,
    ledgerRequirements: analysis.counts.requirements,
    explicitRecall: analysis.explicitRecall,
    catalogDrafts: processed.drafts.length,
    catalogPublished: published.publishedCount,
    setupSections: setup.session.sections.length,
    operatingProfileId: confirmedSetup.profile.id,
    suggestedCompanies: confirmedSetup.companySuggestions.length,
    topSuggested: confirmedSetup.companySuggestions[0]?.companyName,
    policy: scored.policyVersion,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
