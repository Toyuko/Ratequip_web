/** V12.2 Part 5 — Domains 66/67/70 classification & ledger types */

export type RequirementClassification =
  | "explicit_requirement"
  | "implied_prerequisite"
  | "required_interface"
  | "likely_project_requirement"
  | "risk_control_recommendation"
  | "optional_enhancement"
  | "alternative_solution"
  | "future_stage_opportunity"
  | "commercial_opportunity_only"
  | "out_of_scope"
  | "insufficient_information";

export type ReviewerStatus = "pending" | "confirmed" | "rejected";

export type EvidenceRef = {
  documentVersionId: string;
  page?: number;
  section?: string;
  clause?: string;
  contentHash: string;
};

export type ClauseRecord = {
  id: string;
  documentVersionId: string;
  pageNumber: number;
  sectionPath: string;
  clauseReference: string;
  originalText: string;
  normalisedText: string;
  contentHash: string;
};

export type RequirementCandidate = {
  id: string;
  analysisRunId: string;
  clauseId: string;
  originalText: string;
  normalisedText: string;
  classification: RequirementClassification;
  mandatory: boolean;
  confidence: number;
  evidence: EvidenceRef[];
  reviewerStatus: ReviewerStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
};

export type IntelligenceGap = {
  id: string;
  analysisRunId: string;
  gapType: string;
  severity: "low" | "medium" | "high";
  title: string;
  blocksMatching: boolean;
  blocksPublication: boolean;
};

export type IntelligenceQuestion = {
  id: string;
  analysisRunId: string;
  questionGroup: string;
  questionText: string;
  rationale: string;
  assignedRole?: string;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  blocksMatching: boolean;
  blocksPublication: boolean;
};

export type IntelligenceRecommendation = {
  id: string;
  analysisRunId: string;
  classification: RequirementClassification;
  title: string;
  description: string;
  confidence: number;
  buyerConfirmationStatus: "pending" | "approved" | "dismissed";
  sponsored: boolean;
  reasonCodes: string[];
};

export type AnalysisRun = {
  id: string;
  companyId: string;
  title: string;
  industryPack: string;
  status: "queued" | "running" | "completed" | "failed";
  policyVersion: string;
  modelVersion: string;
  documentId: string;
  documentVersionId: string;
  vaultDocumentId?: string;
  sourceFilename: string;
  sourceText: string;
  confidence?: number;
  startedAt: string;
  completedAt?: string;
  createdBy: string;
};
