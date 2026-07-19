/**
 * Deterministic URS/RFQ stub analyzer for Release 5A.
 * Uses industry packs + expected fixture keywords — not production OCR/LLM.
 */
import { createHash } from "node:crypto";
import classificationPolicy from "@/data/v12/part5/classification_policy.v1.json";
import cappingExpected from "@/data/v12/part5/capping_expected.json";
import handSanitiserExpected from "@/data/v12/part5/hand_sanitiser_expected.json";
import petFoodExpected from "@/data/v12/part5/pet_food_expected.json";
import pharmaCapping from "@/data/v12/part5/pharma_capping.v1.json";
import handSanitiser from "@/data/v12/part5/hand_sanitiser.v1.json";
import petFood from "@/data/v12/part5/pet_food.v1.json";
import miningAssay from "@/data/v12/part5/mining_assay.v1.json";
import { assertEvidenceLinked } from "@/lib/v12/intelligence/classification";
import type {
  ClauseRecord,
  IntelligenceGap,
  IntelligenceQuestion,
  IntelligenceRecommendation,
  RequirementCandidate,
} from "@/lib/v12/intelligence/types";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function hash(text: string) {
  return createHash("sha256").update(text).digest("hex").slice(0, 24);
}

function norm(text: string) {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

type PackExpected = {
  scenario: string;
  explicit: string[];
  suggested?: string[];
  risk_controls?: string[];
  minimum_explicit_recall?: number;
};

type IndustryPack = {
  industry: string;
  adjacent: string[];
  critical_questions: string[];
};

const EXPECTED: Record<string, PackExpected> = {
  pharma_capping: cappingExpected as PackExpected,
  hand_sanitiser: handSanitiserExpected as PackExpected,
  pet_food: petFoodExpected as PackExpected,
};

const PACKS: Record<string, IndustryPack> = {
  pharma_capping: pharmaCapping as IndustryPack,
  hand_sanitiser: handSanitiser as IndustryPack,
  pet_food: petFood as IndustryPack,
  mining_assay: miningAssay as IndustryPack,
};

export function listIndustryPacks() {
  return Object.keys(PACKS);
}

export function analyzeDocumentText(input: {
  analysisRunId: string;
  documentVersionId: string;
  industryPack: string;
  sourceText: string;
}): {
  clauses: ClauseRecord[];
  requirements: RequirementCandidate[];
  gaps: IntelligenceGap[];
  questions: IntelligenceQuestion[];
  recommendations: IntelligenceRecommendation[];
  confidence: number;
  explicitRecall: number;
  policyVersion: string;
} {
  const pack = PACKS[input.industryPack] ?? PACKS.pharma_capping!;
  const expected = EXPECTED[input.industryPack] ?? EXPECTED.pharma_capping!;
  const policyVersion = `classification-v${classificationPolicy.version}`;

  const lines = input.sourceText
    .split(/\n|(?<=[.;])\s+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 8);

  const clauses: ClauseRecord[] = lines.map((line, i) => {
    const normalisedText = norm(line);
    return {
      id: id("clause"),
      documentVersionId: input.documentVersionId,
      pageNumber: 1,
      sectionPath: `§${i + 1}`,
      clauseReference: `C-${i + 1}`,
      originalText: line,
      normalisedText,
      contentHash: hash(normalisedText),
    };
  });

  const corpus = norm(input.sourceText);
  const requirements: RequirementCandidate[] = [];
  const matchedExplicit: string[] = [];

  for (const term of expected.explicit) {
    const hit = clauses.find((c) => c.normalisedText.includes(norm(term)));
    const inCorpus = corpus.includes(norm(term));
    if (!hit && !inCorpus) continue;
    matchedExplicit.push(term);
    const clause: ClauseRecord =
      hit ??
      {
        id: id("clause"),
        documentVersionId: input.documentVersionId,
        pageNumber: 1,
        sectionPath: "inferred",
        clauseReference: `C-X-${matchedExplicit.length}`,
        originalText: term,
        normalisedText: norm(term),
        contentHash: hash(norm(term)),
      };
    if (!hit) clauses.push(clause);

    const candidate: RequirementCandidate = {
      id: id("req"),
      analysisRunId: input.analysisRunId,
      clauseId: clause.id,
      originalText: clause.originalText,
      normalisedText: clause.normalisedText,
      classification: "explicit_requirement",
      mandatory: true,
      confidence: 0.92,
      evidence: [
        {
          documentVersionId: input.documentVersionId,
          page: clause.pageNumber,
          section: clause.sectionPath,
          clause: clause.clauseReference,
          contentHash: clause.contentHash,
        },
      ],
      reviewerStatus: "pending",
    };
    assertEvidenceLinked(candidate);
    requirements.push(candidate);
  }

  const gaps: IntelligenceGap[] = expected.explicit
    .filter((term) => !matchedExplicit.some((m) => norm(m) === norm(term)))
    .map((term) => ({
      id: id("gap"),
      analysisRunId: input.analysisRunId,
      gapType: "missing_explicit",
      severity: "high" as const,
      title: `Missing explicit requirement: ${term}`,
      blocksMatching: true,
      blocksPublication: true,
    }));

  const questions: IntelligenceQuestion[] = pack.critical_questions.map(
    (q) => ({
      id: id("iq"),
      analysisRunId: input.analysisRunId,
      questionGroup: "critical",
      questionText: q,
      rationale: `Industry pack ${pack.industry}`,
      assignedRole: "buyer_engineer",
      blocksMatching: true,
      blocksPublication: true,
    }),
  );

  if (gaps.length > 0) {
    questions.unshift({
      id: id("iq"),
      analysisRunId: input.analysisRunId,
      questionGroup: "gap",
      questionText: `Confirm whether missing items are in scope: ${gaps
        .slice(0, 3)
        .map((g) => g.title.replace("Missing explicit requirement: ", ""))
        .join(", ")}`,
      rationale: "Gap detection (Feature 149)",
      blocksMatching: true,
      blocksPublication: true,
    });
  }

  const recommendations: IntelligenceRecommendation[] = (
    expected.suggested ?? pack.adjacent
  )
    .slice(0, 8)
    .map((title) => ({
      id: id("irec"),
      analysisRunId: input.analysisRunId,
      classification: "future_stage_opportunity" as const,
      title,
      description: `Suggested adjacency for ${pack.industry}; buyer confirmation required before publish.`,
      confidence: classificationPolicy.minimum_confidence_for_suggestion,
      buyerConfirmationStatus: "pending" as const,
      sponsored: false,
      reasonCodes: ["adjacency_rule", `pack:${pack.industry}`],
    }));

  for (const rc of expected.risk_controls ?? []) {
    recommendations.push({
      id: id("irec"),
      analysisRunId: input.analysisRunId,
      classification: "risk_control_recommendation",
      title: rc,
      description: "Risk control suggestion — not mandatory until confirmed.",
      confidence: 0.7,
      buyerConfirmationStatus: "pending",
      sponsored: false,
      reasonCodes: ["risk_control", `pack:${pack.industry}`],
    });
  }

  const explicitRecall =
    expected.explicit.length === 0
      ? 1
      : matchedExplicit.length / expected.explicit.length;

  return {
    clauses,
    requirements,
    gaps,
    questions,
    recommendations,
    confidence: Math.min(0.99, 0.55 + explicitRecall * 0.4),
    explicitRecall,
    policyVersion,
  };
}
