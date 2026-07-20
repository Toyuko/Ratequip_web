import type { AIDraft } from "@/lib/v12/ai/confirmation-policy";
import type {
  DocumentRecord,
  DocumentVersion,
} from "@/lib/v12/documents/vault";
import type {
  AnalysisRun,
  ClauseRecord,
  IntelligenceGap,
  IntelligenceQuestion,
  IntelligenceRecommendation,
  RequirementCandidate,
} from "@/lib/v12/intelligence/types";
import type { LedgerEntry, UsagePreview } from "@/lib/v12/part4/entitlements";
import type { Cohort } from "@/lib/v12/part4/rollout";
import type { ReleaseContract } from "@/lib/v12/part4/releaseRegistry";
import type { Ranked } from "@/lib/v12/recommendations/ranker";
import type {
  WorkflowInstance,
  WorkflowTask,
} from "@/lib/v12/workflow/runtime";

export type OpportunityProfile = {
  id: string;
  companyId: string;
  companyName: string;
  status: "draft" | "published";
  targetIndustries: string[];
  targetRegions: string[];
  projectValueMin?: number;
  projectValueMax?: number;
  currency: string;
  preferredRequirementTypes: string[];
  notes: string;
  updatedAt: string;
};

export type ContractorProfile = {
  id: string;
  companyId: string;
  companyName: string;
  status: "draft" | "published";
  trades: string[];
  licences: string[];
  serviceRadiusKm: number;
  emergencyAvailable: boolean;
  rateSummary: string;
  notes: string;
  updatedAt: string;
};

export type Requisition = {
  id: string;
  title: string;
  description: string;
  taxonomyKeys: string[];
  budgetMax: number;
  currency: string;
  status: "draft" | "submitted" | "approved" | "sourcing" | "closed";
  createdAt: string;
  rfqId?: string;
  workflowInstanceId?: string;
};

export type RfqRevision = {
  id: string;
  rfqId: string;
  revision: number;
  contentHash: string;
  payload: Record<string, unknown>;
  createdAt: string;
  createdBy: string;
};

export type AwardRecord = {
  id: string;
  rfqId: string;
  quoteId: string;
  supplierSlug: string;
  amount: number;
  currency: string;
  reasonCodes: string[];
  policyVersion: string;
  awardedAt: string;
  awardedBy: string;
  assetId?: string;
};

export type SrmScorecard = {
  id: string;
  supplierSlug: string;
  supplierName: string;
  period: string;
  overall: number;
  quality: number;
  delivery: number;
  responsiveness: number;
  status: "active" | "watch" | "preferred";
};

export type CrmOpportunity = {
  id: string;
  accountName: string;
  title: string;
  stage: "prospect" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  value: number;
  currency: string;
  owner: string;
  updatedAt: string;
};

export type MatchRun = {
  id: string;
  requirementLabel: string;
  results: Ranked[];
  createdAt: string;
};

/** Release 2B — asset register + digital passport stub */
export type AssetRecord = {
  id: string;
  name: string;
  taxonomyKeys: string[];
  status: "commissioning" | "in_service" | "maintenance" | "disposed";
  supplierSlug: string;
  awardId?: string;
  rfqId?: string;
  passportId?: string;
  serialHint?: string;
  createdAt: string;
  createdBy: string;
};

export type PassportRecord = {
  id: string;
  assetId: string;
  status: "draft" | "issued" | "shared";
  sections: Array<{ key: string; label: string; value: string }>;
  evidenceDocumentIds: string[];
  issuedAt?: string;
  createdAt: string;
};

type V12Store = {
  opportunities: OpportunityProfile[];
  contractors: ContractorProfile[];
  requisitions: Requisition[];
  rfqRevisions: RfqRevision[];
  awards: AwardRecord[];
  srm: SrmScorecard[];
  crm: CrmOpportunity[];
  aiDrafts: AIDraft[];
  answerSets: Record<string, Record<string, unknown>>;
  matchRuns: MatchRun[];
  assets: AssetRecord[];
  passports: PassportRecord[];
  workflowInstances: WorkflowInstance[];
  workflowTasks: WorkflowTask[];
  documents: DocumentRecord[];
  documentVersions: DocumentVersion[];
  /** Part 5 / Release 5A */
  analysisRuns: AnalysisRun[];
  intelligenceClauses: ClauseRecord[];
  intelligenceRequirements: RequirementCandidate[];
  intelligenceGaps: IntelligenceGap[];
  intelligenceQuestions: IntelligenceQuestion[];
  intelligenceRecommendations: IntelligenceRecommendation[];
  /** Part 4 / Release 4A */
  releases: ReleaseContract[];
  cohorts: Cohort[];
  usagePreviews: UsagePreview[];
  usageLedger: LedgerEntry[];
  entitlementRemaining: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __ratequipV12Store: V12Store | undefined;
}

function seedStore(): V12Store {
  return {
    opportunities: [],
    contractors: [],
    requisitions: [
      {
        id: "reqn-1",
        title: "Auger filler for snack line (AU)",
        description:
          "Requisition for hygienic auger filler, food-grade, Australian delivery.",
        taxonomyKeys: ["tax:rq:industry.food_beverage.snack_foods"],
        budgetMax: 220000,
        currency: "AUD",
        status: "approved",
        createdAt: new Date().toISOString(),
      },
    ],
    rfqRevisions: [],
    awards: [],
    srm: [
      {
        id: "srm-1",
        supplierSlug: "nordicfill-systems",
        supplierName: "NordicFill Systems",
        period: "2026-Q2",
        overall: 91,
        quality: 94,
        delivery: 88,
        responsiveness: 90,
        status: "preferred",
      },
      {
        id: "srm-2",
        supplierSlug: "apex-robotics-asia",
        supplierName: "Apex Robotics Asia",
        period: "2026-Q2",
        overall: 84,
        quality: 86,
        delivery: 80,
        responsiveness: 87,
        status: "active",
      },
    ],
    crm: [
      {
        id: "crm-1",
        accountName: "Bangkok Beverage Co",
        title: "Line 2 packaging upgrade",
        stage: "proposal",
        value: 265000,
        currency: "USD",
        owner: "demo-supplier",
        updatedAt: new Date().toISOString(),
      },
    ],
    aiDrafts: [],
    answerSets: {},
    matchRuns: [],
    assets: [],
    passports: [],
    workflowInstances: [],
    workflowTasks: [],
    documents: [],
    documentVersions: [],
    analysisRuns: [],
    intelligenceClauses: [],
    intelligenceRequirements: [],
    intelligenceGaps: [],
    intelligenceQuestions: [],
    intelligenceRecommendations: [],
    releases: [
      {
        key: "12.1.0-addon.1-part4",
        predecessor: "12.0.0-part3",
        minMigration: 30,
        maxMigration: 34,
        checksum:
          "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        status: "registered",
        registeredAt: new Date().toISOString(),
      },
    ],
    cohorts: [
      {
        key: "au-food-pilot",
        flagKey: "part5.requirement_ledger",
        startsAt: Date.now() - 86400000,
        expiresAt: Date.now() + 86400000 * 90,
        killSwitch: false,
        percentage: 100,
        members: new Set(["platform-buyer", "buyer@demo.ratequip.com"]),
      },
    ],
    usagePreviews: [],
    usageLedger: [],
    entitlementRemaining: 250,
  };
}

export function getV12Store(): V12Store {
  if (!globalThis.__ratequipV12Store) {
    globalThis.__ratequipV12Store = seedStore();
  }
  return globalThis.__ratequipV12Store;
}

export function resetV12Store() {
  globalThis.__ratequipV12Store = seedStore();
}
