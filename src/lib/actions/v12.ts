"use server";

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
  listWorkflowOverview,
  rejectRequirement,
  resolveActivationPack,
  runExplainableMatch,
  saveAnswerSet,
  startWorkflow,
  taxonomySearch,
  uploadAndAnalyzeUrs,
  upsertContractor,
  upsertOpportunity,
} from "@/lib/v12/services";

export async function v12ResolveQuestions(input: {
  packId: string;
  roles: string[];
  answers?: Record<string, unknown>;
  taxonomyKeys?: string[];
  jurisdiction?: string;
}) {
  return resolveActivationPack(input);
}

export async function v12SaveAnswers(
  sessionId: string,
  answers: Record<string, unknown>,
) {
  return saveAnswerSet(sessionId, answers);
}

export async function v12SaveOpportunity(
  input: Parameters<typeof upsertOpportunity>[0],
) {
  return upsertOpportunity(input);
}

export async function v12SaveContractor(
  input: Parameters<typeof upsertContractor>[0],
) {
  return upsertContractor(input);
}

export async function v12RunMatch(input: {
  requirementLabel: string;
  requiredCategory?: string;
  region?: string;
}) {
  return runExplainableMatch(input);
}

export async function v12CreateDraft(
  input: Parameters<typeof createAIDraft>[0],
) {
  return createAIDraft(input);
}

export async function v12ConfirmDraft(
  input: Parameters<typeof confirmAIDraft>[0],
) {
  return confirmAIDraft(input);
}

export async function v12CreateRequisition(
  input: Parameters<typeof createRequisition>[0],
) {
  return createRequisition(input);
}

export async function v12ApproveRequisition(id: string, actor?: string) {
  return approveRequisition(id, actor);
}

export async function v12CreateRevision(
  input: Parameters<typeof createRfqRevision>[0],
) {
  return createRfqRevision(input);
}

export async function v12AwardRfq(input: Parameters<typeof awardRfq>[0]) {
  return awardRfq(input);
}

export async function v12SearchTaxonomy(q: string) {
  return taxonomySearch(q);
}

export async function v12ListAssets() {
  return listAssets();
}

export async function v12IssuePassport(passportId: string) {
  return issuePassport(passportId);
}

export async function v12ListWorkflow() {
  return listWorkflowOverview();
}

export async function v12StartWorkflow(
  input: Parameters<typeof startWorkflow>[0],
) {
  return startWorkflow(input);
}

export async function v12ClaimTask(
  input: Parameters<typeof claimWorkflowTask>[0],
) {
  return claimWorkflowTask(input);
}

export async function v12CompleteTask(
  input: Parameters<typeof completeWorkflowTask>[0],
) {
  return completeWorkflowTask(input);
}

export async function v12ListDocuments() {
  return listDocuments();
}

export async function v12CreateDocument(
  input: Parameters<typeof createDocument>[0],
) {
  return createDocument(input);
}

export async function v12AddDocumentVersion(
  input: Parameters<typeof addDocumentVersion>[0],
) {
  return addDocumentVersion(input);
}

export async function v12ApproveDocumentVersion(
  input: Parameters<typeof approveDocumentVersion>[0],
) {
  return approveDocumentVersion(input);
}

export async function v12ListIndustryPacks() {
  return listIndustryPacks();
}

export async function v12UploadAnalyzeUrs(
  input: Parameters<typeof uploadAndAnalyzeUrs>[0],
) {
  return uploadAndAnalyzeUrs(input);
}

export async function v12ListAnalysis(runId?: string) {
  return listAnalysisOverview(runId);
}

export async function v12ConfirmRequirement(
  input: Parameters<typeof confirmRequirement>[0],
) {
  return confirmRequirement(input);
}

export async function v12RejectRequirement(
  input: Parameters<typeof rejectRequirement>[0],
) {
  return rejectRequirement(input);
}

export async function v12AnswerIntelQuestion(
  input: Parameters<typeof answerIntelligenceQuestion>[0],
) {
  return answerIntelligenceQuestion(input);
}

export async function v12ApproveIntelRecommendation(
  input: Parameters<typeof approveIntelligenceRecommendation>[0],
) {
  return approveIntelligenceRecommendation(input);
}
