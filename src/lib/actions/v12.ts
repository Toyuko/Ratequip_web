"use server";

import { resolveSessionUser } from "@/lib/api/auth";
import {
  addDocumentVersion,
  answerIntelligenceQuestion,
  approveDocumentVersion,
  approveIntelligenceRecommendation,
  approveRequisition,
  awardRfq,
  claimWorkflowTask,
  completeWorkflowTask,
  confirmAIDraft,
  confirmRequirement,
  createAIDraft,
  createDocument,
  createRequisition,
  createRfqRevision,
  issuePassport,
  listAnalysisOverview,
  listAssets,
  listDocuments,
  listIndustryPacks,
  listReleaseControl,
  listWorkflowOverview,
  previewUrsAnalysisUsage,
  rejectRequirement,
  resolveActivationPack,
  runExplainableMatch,
  saveAnswerSet,
  setCohortKillSwitch,
  startWorkflow,
  taxonomySearch,
  uploadAndAnalyzeUrs,
  upsertContractor,
  upsertOpportunity,
  confirmUsagePreview,
  createCatalogImport,
  previewCatalogImportUsage,
  processCatalogImport,
  reviewCatalogDraft,
  publishCatalogJob,
  listCatalogFactory,
  startCompanySetup,
  saveCompanySetupSection,
  reviewCompanySetupSuggestions,
  confirmCompanySetup,
  listCompanySetup,
  listSetupIndustryPacks,
  reviewProfileCompanySuggestion,
  refreshCompanySuggestionsForProfile,
  part7ConfirmFact,
  part7IngestFact,
  part7ResumeSession,
} from "@/lib/v12/services";
import {
  hydrateSetupSessionIntoStore,
  persistSetupSession,
} from "@/lib/v12/setup-session-cookie";

async function requireServerV12Session() {
  const { user, error } = await resolveSessionUser();
  if (!user) {
    throw new Error(error ?? "Authentication required");
  }
  return user;
}

async function requireServerV12Admin() {
  const user = await requireServerV12Session();
  if (user.role !== "admin") {
    throw new Error("Admin role required");
  }
  return user;
}


export async function v12ResolveQuestions(input: {
  packId: string;
  roles: string[];
  answers?: Record<string, unknown>;
  taxonomyKeys?: string[];
  jurisdiction?: string;
}) {
  await requireServerV12Session();

  return resolveActivationPack(input);
}

export async function v12SaveAnswers(
  sessionId: string,
  answers: Record<string, unknown>,
) {
  await requireServerV12Session();

  return saveAnswerSet(sessionId, answers);
}

export async function v12SaveOpportunity(
  input: Parameters<typeof upsertOpportunity>[0],
) {
  await requireServerV12Session();

  return upsertOpportunity(input);
}

export async function v12SaveContractor(
  input: Parameters<typeof upsertContractor>[0],
) {
  await requireServerV12Session();

  return upsertContractor(input);
}

export async function v12RunMatch(input: {
  requirementLabel: string;
  requiredCategory?: string;
  region?: string;
}) {
  await requireServerV12Session();

  return runExplainableMatch(input);
}

export async function v12CreateDraft(
  input: Parameters<typeof createAIDraft>[0],
) {
  await requireServerV12Session();

  return createAIDraft(input);
}

export async function v12ConfirmDraft(
  input: Parameters<typeof confirmAIDraft>[0],
) {
  await requireServerV12Session();

  return confirmAIDraft(input);
}

export async function v12CreateRequisition(
  input: Parameters<typeof createRequisition>[0],
) {
  await requireServerV12Session();

  return createRequisition(input);
}

export async function v12ApproveRequisition(id: string, actor?: string) {
  await requireServerV12Session();

  return approveRequisition(id, actor);
}

export async function v12CreateRevision(
  input: Parameters<typeof createRfqRevision>[0],
) {
  await requireServerV12Session();

  return createRfqRevision(input);
}

export async function v12AwardRfq(input: Parameters<typeof awardRfq>[0]) {
  return awardRfq(input);
}

export async function v12SearchTaxonomy(q: string) {
  await requireServerV12Session();

  return taxonomySearch(q);
}

export async function v12ListAssets() {
  return listAssets();
}

export async function v12IssuePassport(passportId: string) {
  await requireServerV12Session();

  return issuePassport(passportId);
}

export async function v12ListWorkflow() {
  return listWorkflowOverview();
}

export async function v12StartWorkflow(
  input: Parameters<typeof startWorkflow>[0],
) {
  await requireServerV12Session();

  return startWorkflow(input);
}

export async function v12ClaimTask(
  input: Parameters<typeof claimWorkflowTask>[0],
) {
  await requireServerV12Session();

  return claimWorkflowTask(input);
}

export async function v12CompleteTask(
  input: Parameters<typeof completeWorkflowTask>[0],
) {
  await requireServerV12Session();

  return completeWorkflowTask(input);
}

export async function v12ListDocuments() {
  return listDocuments();
}

export async function v12CreateDocument(
  input: Parameters<typeof createDocument>[0],
) {
  await requireServerV12Session();

  return createDocument(input);
}

export async function v12AddDocumentVersion(
  input: Parameters<typeof addDocumentVersion>[0],
) {
  await requireServerV12Session();

  return addDocumentVersion(input);
}

export async function v12ApproveDocumentVersion(
  input: Parameters<typeof approveDocumentVersion>[0],
) {
  await requireServerV12Session();

  return approveDocumentVersion(input);
}

export async function v12ListIndustryPacks() {
  return listIndustryPacks();
}

export async function v12UploadAnalyzeUrs(
  input: Parameters<typeof uploadAndAnalyzeUrs>[0],
) {
  await requireServerV12Session();

  return uploadAndAnalyzeUrs(input);
}

export async function v12PreviewUrsUsage() {
  return previewUrsAnalysisUsage();
}

export async function v12ConfirmUsagePreview(
  input: Parameters<typeof confirmUsagePreview>[0],
) {
  await requireServerV12Session();

  return confirmUsagePreview(input);
}

export async function v12ListReleaseControl() {
  return listReleaseControl();
}

export async function v12SetCohortKillSwitch(
  input: Parameters<typeof setCohortKillSwitch>[0],
) {
  await requireServerV12Admin();

  return setCohortKillSwitch(input);
}

export async function v12CreateCatalogImport(
  input: Parameters<typeof createCatalogImport>[0],
) {
  await requireServerV12Session();

  return createCatalogImport(input);
}

export async function v12PreviewCatalogImport(jobId: string) {
  await requireServerV12Session();

  return previewCatalogImportUsage(jobId);
}

export async function v12ProcessCatalogImport(
  input: Parameters<typeof processCatalogImport>[0],
) {
  await requireServerV12Session();

  return processCatalogImport(input);
}

export async function v12ReviewCatalogDraft(
  input: Parameters<typeof reviewCatalogDraft>[0],
) {
  await requireServerV12Session();

  return reviewCatalogDraft(input);
}

export async function v12PublishCatalogJob(
  input: Parameters<typeof publishCatalogJob>[0],
) {
  await requireServerV12Session();

  return publishCatalogJob(input);
}

export async function v12ListCatalogFactory() {
  return listCatalogFactory();
}

export async function v12ListSetupIndustryPacks() {
  await requireServerV12Session();

  return listSetupIndustryPacks();
}

export async function v12StartCompanySetup(
  input: Parameters<typeof startCompanySetup>[0],
) {
  await requireServerV12Session();

  const res = startCompanySetup(input);
  if (res.ok) await persistSetupSession(res.session);
  return res;
}

export async function v12SaveCompanySetupSection(
  input: Parameters<typeof saveCompanySetupSection>[0],
) {
  await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);

  const res = saveCompanySetupSection(input);
  if (res.ok) await persistSetupSession(res.session);
  return res;
}

export async function v12ReviewCompanySetupSuggestions(
  input: Parameters<typeof reviewCompanySetupSuggestions>[0],
) {
  await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);

  const res = reviewCompanySetupSuggestions(input);
  if (res.ok) await persistSetupSession(res.session);
  return res;
}

export async function v12ConfirmCompanySetup(
  input: Parameters<typeof confirmCompanySetup>[0],
) {
  await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);

  const res = confirmCompanySetup(input);
  if (res.ok) await persistSetupSession(res.session);
  return res;
}

export async function v12ListCompanySetup(sessionId?: string) {
  await requireServerV12Session();
  await hydrateSetupSessionIntoStore(sessionId);

  return listCompanySetup(sessionId);
}

export async function v12ReviewProfileCompanySuggestion(
  input: Parameters<typeof reviewProfileCompanySuggestion>[0],
) {
  await requireServerV12Session();

  return reviewProfileCompanySuggestion(input);
}

export async function v12RefreshCompanySuggestions(profileId: string) {
  await requireServerV12Session();

  return refreshCompanySuggestionsForProfile(profileId);
}

export async function v12Part7IngestFact(
  input: Parameters<typeof part7IngestFact>[0],
) {
  const user = await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);
  return part7IngestFact({
    ...input,
    createdBy: input.createdBy ?? user.id,
  });
}

export async function v12Part7ConfirmFact(
  input: Parameters<typeof part7ConfirmFact>[0],
) {
  const user = await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);
  return part7ConfirmFact({
    ...input,
    actorId: input.actorId || user.id,
  });
}

export async function v12Part7ResumeSession(
  input: Parameters<typeof part7ResumeSession>[0],
) {
  await requireServerV12Session();
  await hydrateSetupSessionIntoStore(input.sessionId);
  return part7ResumeSession(input);
}

export async function v12ListAnalysis(runId?: string) {
  await requireServerV12Session();

  return listAnalysisOverview(runId);
}

export async function v12ConfirmRequirement(
  input: Parameters<typeof confirmRequirement>[0],
) {
  await requireServerV12Session();

  return confirmRequirement(input);
}

export async function v12RejectRequirement(
  input: Parameters<typeof rejectRequirement>[0],
) {
  await requireServerV12Session();

  return rejectRequirement(input);
}

export async function v12AnswerIntelQuestion(
  input: Parameters<typeof answerIntelligenceQuestion>[0],
) {
  await requireServerV12Session();

  return answerIntelligenceQuestion(input);
}

export async function v12ApproveIntelRecommendation(
  input: Parameters<typeof approveIntelligenceRecommendation>[0],
) {
  await requireServerV12Session();

  return approveIntelligenceRecommendation(input);
}
