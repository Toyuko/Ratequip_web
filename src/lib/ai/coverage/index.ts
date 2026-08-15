export { COVERAGE_SHARED_RULES, COVERAGE_EXTRACTION_RULES } from "./shared-rules";
export { buildCoverageQueries, looksLikeRosterHit } from "./query-expansion";
export { extractRosterFromPage, heuristicRosterExtract } from "./roster";
export { expandLaterallyFromPage } from "./lateral";
export {
  annotateDuplicatesWithResolution,
  resolveEntityAgainstDirectory,
  resolveEntityWithAi,
} from "./entity-resolution";
export { discoverCompaniesWithCoverage } from "./discover";
export type {
  CoverageDiscoveryMeta,
  CoverageLane,
  EntityResolutionResult,
  FieldEvidence,
  LateralCandidate,
  RosterCandidate,
} from "./types";
