import { randomUUID } from "crypto";
import type {
  CapabilityKind,
  PendingTaxonomyTerm,
  TaxonomyTerm,
} from "@/lib/collaborate/types";

/** Seed taxonomy from industrial equipment/services categories. OPEN-1 deferred. */
export const SEED_TAXONOMY: TaxonomyTerm[] = [
  {
    taxonomyId: "skill.automation.plc.siemens_tia",
    path: "industry/automation/plc/siemens_tia",
    label: "Siemens TIA Portal / S7",
    synonyms: ["siemens plc", "tia portal", "s7-1500"],
    kind: "SKILL",
    curated: true,
  },
  {
    taxonomyId: "skill.automation.plc.allen_bradley",
    path: "industry/automation/plc/allen_bradley",
    label: "Allen-Bradley / Studio 5000",
    synonyms: ["rockwell", "compactlogix", "controllogix"],
    kind: "SKILL",
    curated: true,
  },
  {
    taxonomyId: "skill.process.food.fill_pack",
    path: "industry/food/fill_pack",
    label: "Food filling & packaging line design",
    synonyms: ["filler", "packaging line", "sauce fill"],
    kind: "SKILL",
    curated: true,
  },
  {
    taxonomyId: "credential.electrical.licensed_au",
    path: "credential/electrical/au",
    label: "Licensed electrician (AU)",
    synonyms: ["electrical licence", "sparky licence"],
    kind: "CREDENTIAL",
    curated: true,
  },
  {
    taxonomyId: "asset.machine.cnc",
    path: "asset/machine/cnc",
    label: "CNC machining capacity",
    synonyms: ["cnc mill", "cnc lathe"],
    kind: "ASSET",
    curated: true,
  },
  {
    taxonomyId: "capacity.hours.engineering",
    path: "capacity/hours/engineering",
    label: "Engineering hours capacity",
    synonyms: ["eng hours", "design capacity"],
    kind: "CAPACITY",
    curated: true,
  },
  {
    taxonomyId: "skill.support.remote_diagnostic",
    path: "industry/support/remote_diagnostic",
    label: "Remote equipment diagnostics",
    synonyms: ["remote support", "troubleshoot", "plc remote"],
    kind: "SKILL",
    curated: true,
  },
  {
    taxonomyId: "skill.support.spec_advice",
    path: "industry/support/spec_advice",
    label: "Equipment specification advice",
    synonyms: ["spec review", "URS advice"],
    kind: "SKILL",
    curated: true,
  },
];

export function resolveTaxonomyId(
  terms: TaxonomyTerm[],
  query: string,
): TaxonomyTerm | null {
  const q = query.toLowerCase().trim();
  const exact = terms.find(
    (t) =>
      t.curated &&
      (t.taxonomyId === q ||
        t.label.toLowerCase() === q ||
        t.synonyms.some((s) => s.toLowerCase() === q)),
  );
  if (exact) return exact;
  return (
    terms.find(
      (t) =>
        t.curated &&
        (t.label.toLowerCase().includes(q) ||
          t.synonyms.some((s) => s.toLowerCase().includes(q))),
    ) ?? null
  );
}

export function enqueuePendingTerm(input: {
  rawLabel: string;
  kind: CapabilityKind;
  submittedByPartyId: string;
}): PendingTaxonomyTerm {
  return {
    pendingId: `ptx_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    rawLabel: input.rawLabel,
    kind: input.kind,
    submittedByPartyId: input.submittedByPartyId,
    createdAt: new Date().toISOString(),
  };
}
