export type FeatureKey =
  | "capability"
  | "industry"
  | "technology"
  | "geography"
  | "availability"
  | "capacity"
  | "trust"
  | "history"
  | "relationship"
  | "response"
  | "commercial";

export interface MatchFeature {
  key: FeatureKey;
  value: number | null;
  weight: number;
  sourceRef?: string;
  reasonCode?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  exclusionCodes: string[];
}

export interface ScoreResult {
  score: number;
  confidence: number;
  components: Array<MatchFeature & { contribution: number }>;
  reasons: string[];
  policyVersion: string;
}

export interface MatchPolicy {
  version: string;
  weights: Record<FeatureKey, number>;
  minimumScore: number;
  confidenceFloor: number;
}

/** ADR-0006 default policy — V12 Part 1 scoring model */
export const DEFAULT_MATCH_POLICY: MatchPolicy = {
  version: "v12.0.0-part1",
  weights: {
    capability: 0.22,
    industry: 0.12,
    technology: 0.1,
    geography: 0.12,
    availability: 0.1,
    capacity: 0.07,
    trust: 0.1,
    history: 0.06,
    relationship: 0.04,
    response: 0.04,
    commercial: 0.03,
  },
  minimumScore: 40,
  confidenceFloor: 0.35,
};
