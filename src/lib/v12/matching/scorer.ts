import {
  DEFAULT_MATCH_POLICY,
  type EligibilityResult,
  type MatchFeature,
  type MatchPolicy,
  type ScoreResult,
} from "./types";

const clamp = (n: number, min = 0, max = 1) => Math.max(min, Math.min(max, n));

export function scoreMatch(
  features: MatchFeature[],
  policy: MatchPolicy = DEFAULT_MATCH_POLICY,
): ScoreResult {
  const active = features.filter(
    (f) => f.value !== null && Number.isFinite(f.value),
  );
  const weightTotal = active.reduce(
    (s, f) => s + (policy.weights[f.key] ?? f.weight),
    0,
  );
  if (weightTotal <= 0) {
    return {
      score: 0,
      confidence: 0,
      components: [],
      reasons: ["insufficient_evidence"],
      policyVersion: policy.version,
    };
  }
  const components = active.map((f) => {
    const weight = policy.weights[f.key] ?? f.weight;
    const contribution = (clamp(f.value!) * weight) / weightTotal;
    return { ...f, weight, contribution };
  });
  const raw = components.reduce((s, f) => s + f.contribution, 0) * 100;
  const evidenceCoverage = active.length / Math.max(features.length, 1);
  const confidence = clamp(evidenceCoverage);
  const reasons = components
    .filter((x) => x.contribution >= 0.08)
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 5)
    .map((x) => x.reasonCode ?? `match_${x.key}`);
  return {
    score: Math.round(raw * 1000) / 1000,
    confidence: Math.round(confidence * 10000) / 10000,
    components,
    reasons,
    policyVersion: policy.version,
  };
}

export function evaluateEligibility(input: {
  hasRequiredCapability: boolean;
  inJurisdiction: boolean;
  serviceable: boolean;
  deadlineOk: boolean;
}): EligibilityResult {
  const exclusionCodes: string[] = [];
  if (!input.hasRequiredCapability) exclusionCodes.push("missing_capability");
  if (!input.inJurisdiction) exclusionCodes.push("jurisdiction_blocked");
  if (!input.serviceable) exclusionCodes.push("not_serviceable");
  if (!input.deadlineOk) exclusionCodes.push("deadline_infeasible");
  return { eligible: exclusionCodes.length === 0, exclusionCodes };
}
