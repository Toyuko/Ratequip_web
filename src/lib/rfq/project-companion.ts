import { z } from "zod";
import type { CompanionRole } from "@/lib/rfq/line-companions";

export const projectNeedSchema = z.object({
  role: z.enum([
    "primary",
    "upstream",
    "downstream",
    "materials",
    "utilities",
    "services",
  ]),
  label: z.string(),
  why: z.string(),
  categorySlugs: z.array(z.string()).default([]),
  searchQuery: z.string().default(""),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  inOriginalRfq: z.boolean().default(false),
});

export const projectBreakdownSchema = z.object({
  summary: z.string(),
  projectType: z.string(),
  primaryFocus: z.string(),
  needs: z.array(projectNeedSchema).min(1),
});

export type ProjectNeedDraft = z.infer<typeof projectNeedSchema>;
export type ProjectBreakdownDraft = z.infer<typeof projectBreakdownSchema>;

export type MatchedSupplierQuote = {
  companyId: string;
  companySlug: string;
  companyName: string;
  country: string;
  city?: string;
  trustScore: number;
  headline: string;
  verified: boolean;
  matchScore: number;
  reason: string;
  /** Indicative compare price — not a binding quote */
  indicativePrice: number;
  currency: string;
};

export type ProjectNeedWithSuppliers = ProjectNeedDraft & {
  id: string;
  suppliers: MatchedSupplierQuote[];
};

export type ProjectCompanionResult = {
  summary: string;
  projectType: string;
  primaryFocus: string;
  needs: ProjectNeedWithSuppliers[];
  source: "ai" | "heuristic";
  message: string;
  currency: string;
};

export function asCompanionRole(value: string): CompanionRole {
  if (
    value === "primary" ||
    value === "upstream" ||
    value === "downstream" ||
    value === "materials" ||
    value === "utilities" ||
    value === "services"
  ) {
    return value;
  }
  return "downstream";
}
