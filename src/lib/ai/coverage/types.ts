import { z } from "zod";

export const coverageSourceArchetypes = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
] as const;

export type CoverageSourceArchetype =
  (typeof coverageSourceArchetypes)[number];

export const rosterCandidateSchema = z.object({
  rawName: z.string().min(1).max(200),
  nativeName: z.string().max(200).nullable().optional(),
  website: z.string().nullable().optional(),
  profileUrl: z.string().nullable().optional(),
  countryHint: z.string().max(80).nullable().optional(),
  cityHint: z.string().max(80).nullable().optional(),
  categoryHints: z.array(z.string().max(80)).default([]),
  brandsOnPage: z.array(z.string().max(120)).default([]),
  roleGuess: z
    .enum([
      "oem",
      "distributor",
      "integrator",
      "service",
      "marketplace",
      "association",
      "unknown",
    ])
    .default("unknown"),
  sourceRef: z.string().max(120).nullable().optional(),
  evidenceQuote: z.string().max(200).default(""),
  sourceUrl: z.string().default(""),
});

export type RosterCandidate = z.infer<typeof rosterCandidateSchema>;

export const rosterExtractionSchema = z.object({
  companies: z.array(rosterCandidateSchema).max(40),
  nextPageUrls: z.array(z.string()).default([]),
  facetUrls: z.array(z.string()).default([]),
  truncated: z.boolean().default(false),
});

export const lateralCandidateSchema = z.object({
  rawName: z.string().min(1).max(200),
  nativeName: z.string().max(200).nullable().optional(),
  website: z.string().nullable().optional(),
  countryHint: z.string().max(80).nullable().optional(),
  relationship: z.enum([
    "distributor_of_seed",
    "oem_of_seeds_distributor",
    "services_seed_brand",
    "partner",
    "competitor",
    "parent",
    "subsidiary",
    "former_name",
    "patent_peer",
  ]),
  probe: z.number().int().min(1).max(9),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
  evidenceQuote: z.string().max(200).default(""),
  sourceUrl: z.string().default(""),
});

export type LateralCandidate = z.infer<typeof lateralCandidateSchema>;

export const lateralExpansionSchema = z.object({
  candidates: z.array(lateralCandidateSchema).max(25),
  newSourcesForP1: z.array(z.string()).default([]),
  notes: z.string().max(400).optional(),
});

export const entityResolutionSchema = z.object({
  decision: z.enum([
    "same",
    "alias_of",
    "subsidiary_of",
    "different",
    "uncertain",
  ]),
  targetId: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  decidingRule: z.number().int().min(1).max(8),
  evidence: z
    .array(z.object({ url: z.string(), quote: z.string().max(200) }))
    .default([]),
  conflicts: z.array(z.string()).default([]),
  needsHuman: z.boolean().default(false),
  reasoning: z.string().max(400),
});

export type EntityResolutionResult = z.infer<typeof entityResolutionSchema>;

export const fieldEvidenceSchema = z.object({
  url: z.string(),
  quote: z.string().max(200),
});

export type FieldEvidence = z.infer<typeof fieldEvidenceSchema>;

export type CoverageLane =
  | "direct_lookup"
  | "roster_harvest"
  | "lateral_expansion"
  | "regional_sweep";

export type CoverageDiscoveryMeta = {
  lanesUsed: CoverageLane[];
  queriesExecuted: string[];
  rosterPagesFetched: number;
  candidatesFromRosters: number;
  candidatesFromLateral: number;
};
