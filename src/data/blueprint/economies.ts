export type BlueprintEconomy = {
  key: string;
  name: string;
  valueExchange: string;
  description: string;
  primaryActors: string[];
  capabilityNumbers: number[];
  liveStatus: "live" | "partial" | "specified";
  liveNote: string;
};

export const blueprintEconomies: BlueprintEconomy[] = [
  {
    key: "industrial-marketplace",
    name: "Industrial marketplace",
    valueExchange:
      "Machinery, parts, consumables, ingredients, packaging, software and services.",
    description:
      "How industrial goods and services move between verified buyers and suppliers on a shared company graph.",
    primaryActors: ["Manufacturers", "Distributors", "Integrators", "Buyers"],
    capabilityNumbers: [1, 2, 41, 86],
    liveStatus: "live",
    liveNote: "Directory, claim, reviews, categories and Organic Growth add-company.",
  },
  {
    key: "procurement",
    name: "Procurement",
    valueExchange:
      "RFQs, comparison, awards, preferred networks and project conversion.",
    description:
      "Structured requirements, quoting, comparison and award — with credits and eligibility on the live path.",
    primaryActors: ["Buyers", "Procurement leads", "Suppliers", "Approvers"],
    capabilityNumbers: [41, 42, 49],
    liveStatus: "live",
    liveNote: "RFQ create, quote, award and 25-credit debit. V12 overlays the URS ledger.",
  },
  {
    key: "professional-services",
    name: "Professional services",
    valueExchange:
      "Engineering, trades, inspection, consulting, project management and field work.",
    description:
      "Individual competency as a first-class record, separate from the company profile.",
    primaryActors: ["Engineers", "Inspectors", "Consultants", "Project managers"],
    capabilityNumbers: [3, 4, 5, 9],
    liveStatus: "partial",
    liveNote: "Contractor dashboard, Collaborate jobs/experts, V12 contractor builder.",
  },
  {
    key: "referral",
    name: "Referral",
    valueExchange:
      "Attributable introductions between genuine buyers, companies and opportunities.",
    description:
      "Invites and join codes that reward participation, not signup volume.",
    primaryActors: ["Members", "Companies", "Introducers"],
    capabilityNumbers: [91, 92, 93, 94],
    liveStatus: "live",
    liveNote: "Referral invites, join codes and share. Rewards on participation remain a later gate.",
  },
  {
    key: "reputation",
    name: "Reputation",
    valueExchange:
      "Portable, explainable evidence of reliable capability and delivery.",
    description:
      "Trust Scores are computed from reviews, verification and activity — never sold as placement.",
    primaryActors: ["All verified actors"],
    capabilityNumbers: [44, 45, 61],
    liveStatus: "live",
    liveNote: "Explainable Trust Score, review moderation and claim verification.",
  },
  {
    key: "credit",
    name: "Credit",
    valueExchange:
      "Platform credits used for RateQuip services, never promoted as an investment.",
    description:
      "Subscriptions, credit packs, wallets and an append-only commercial ledger.",
    primaryActors: ["Account holders", "Finance operations"],
    capabilityNumbers: [21, 24, 26, 73],
    liveStatus: "live",
    liveNote: "Stripe billing, wallets, packs, enterprise pool and commission ledger.",
  },
  {
    key: "project",
    name: "Project",
    valueExchange:
      "Controlled workspaces, tasks, milestones, evidence and completion.",
    description:
      "Governed delivery after award, with evidence before approval.",
    primaryActors: ["Project owners", "Delivery teams", "Approvers"],
    capabilityNumbers: [10, 50, 59],
    liveStatus: "partial",
    liveNote: "Project create plus V12 workflow. Milestone evidence is still a thin slice.",
  },
  {
    key: "venture",
    name: "Venture",
    valueExchange:
      "Temporary teams, contractual consortiums and connected legal entities.",
    description:
      "Team formation, constitutions and revenue splits — specified, not the live MVP.",
    primaryActors: ["Founders", "Consortium partners"],
    capabilityNumbers: [11, 12, 17, 18],
    liveStatus: "partial",
    liveNote: "Collaborate jobs and experts. Constitutions and splits are later-wave.",
  },
  {
    key: "knowledge",
    name: "Knowledge",
    valueExchange:
      "Taxonomy, supplier capability, asset intelligence and human validation.",
    description:
      "Shared industrial taxonomy and capability graph used by search and matching.",
    primaryActors: ["Data stewards", "Contributors", "Domain experts"],
    capabilityNumbers: [87, 88, 104],
    liveStatus: "partial",
    liveNote: "Categories live; V12 taxonomy, DQE and catalogue factory thin slices.",
  },
  {
    key: "field-agent",
    name: "Field-agent",
    valueExchange:
      "Location-bound visits, measurements, evidence, representation and urgent response.",
    description:
      "Local eyes when the buyer cannot be on site. Specified; not shipped.",
    primaryActors: ["Local representatives", "Inspectors", "Site contacts"],
    capabilityNumbers: [6, 7, 8, 32],
    liveStatus: "specified",
    liveNote: "Blueprint only. Will ship under a later flagged overlay.",
  },
  {
    key: "creator",
    name: "Creator",
    valueExchange:
      "Technical articles, demonstrations, translations, videos and educational media.",
    description: "Academy and contributor media. Specified; not shipped.",
    primaryActors: ["Writers", "Translators", "Technical authors"],
    capabilityNumbers: [35, 68, 95],
    liveStatus: "specified",
    liveNote: "Academy module is listed as coming soon.",
  },
  {
    key: "advertising",
    name: "Advertising",
    valueExchange:
      "Approved campaigns with transparent sponsored placement and outcome conditions.",
    description:
      "Sponsored placement that never alters Trust Score. Specified; not shipped.",
    primaryActors: ["Sponsors", "Suppliers", "Contributors"],
    capabilityNumbers: [31, 66, 99],
    liveStatus: "specified",
    liveNote: "Blueprint only. Placement must stay labelled and never buy rank.",
  },
];

export function economyByKey(key: string) {
  return blueprintEconomies.find((e) => e.key === key) ?? null;
}
