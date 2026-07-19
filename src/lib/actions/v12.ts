"use server";

import {
  approveRequisition,
  awardRfq,
  confirmAIDraft,
  createAIDraft,
  createRequisition,
  createRfqRevision,
  resolveActivationPack,
  runExplainableMatch,
  saveAnswerSet,
  taxonomySearch,
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

export async function v12ApproveRequisition(id: string) {
  return approveRequisition(id);
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
