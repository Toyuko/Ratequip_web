export type SolutionPage = {
  slug: string;
  title: string;
  eyebrow: string;
  lead: string;
  description: string;
  whatYouGet: string[];
  startHref: string;
  startLabel: string;
};

export const solutionPages: SolutionPage[] = [
  {
    slug: "buyers",
    title: "For buyers and plant teams",
    eyebrow: "Solutions",
    lead: "Source equipment and services with evidence at every step.",
    description: "Search verified suppliers, post structured RFQs, compare quotes and award with a credit ledger.",
    whatYouGet: [
      "Search suppliers, equipment and categories with Trust Scores in view",
      "Publish a structured RFQ (25 credits; Buyer Free is capped at one per month)",
      "Compare quotes in one workspace",
      "Award against the live request, with marketplace commission recorded",
      "Carry claimed and verified supplier history into the next purchase",
    ],
    startHref: "/requests/new",
    startLabel: "Post an RFQ",
  },
  {
    slug: "suppliers",
    title: "For manufacturers and distributors",
    eyebrow: "Solutions",
    lead: "Claim your profile, quote with evidence, and get paid for qualified demand.",
    description: "Claimed company profiles, RFQ quotes, catalogues and Stripe-backed supplier plans.",
    whatYouGet: [
      "Claim an existing company or add one through Organic Growth",
      "Respond to open RFQs from your supplier dashboard",
      "Publish products and media on a claimed profile",
      "Silver / Gold / Platinum plans with monthly credits",
      "Right of reply on reviews after moderation",
    ],
    startHref: "/companies/claim",
    startLabel: "Claim a company",
  },
  {
    slug: "professionals",
    title: "For engineers and specialists",
    eyebrow: "Solutions",
    lead: "Work as an individual — not only through a company letterhead.",
    description: "Contractor dashboard, Collaborate jobs and V12 contractor builder.",
    whatYouGet: [
      "A contractor workspace on the live platform",
      "Paid jobs and remote expert sessions in Collaborate",
      "V12 contractor builder for capability packaging",
      "Evidence that can later become a Work Passport",
    ],
    startHref: "/collaborate",
    startLabel: "Open Collaborate",
  },
  {
    slug: "project-owners",
    title: "For project owners",
    eyebrow: "Solutions",
    lead: "Move from a requirement to a governed delivery workspace.",
    description: "RFQ to award on Phase 2, with V12 workflow for the execution overlay.",
    whatYouGet: [
      "Turn an objective into a structured RFQ",
      "Shortlist and award suppliers on the live request",
      "Open a project workspace after award",
      "V12 workflow and document vault as the execution overlay",
    ],
    startHref: "/projects/new",
    startLabel: "Start a project",
  },
  {
    slug: "agencies",
    title: "For agencies and procurement partners",
    eyebrow: "Solutions",
    lead: "Run sourcing programmes on the same graph your clients will inherit.",
    description: "Enterprise credit pools, commission ledger and preferred-supplier overlays.",
    whatYouGet: [
      "Enterprise pooled credits across member organisations",
      "Marketplace commission recorded on award",
      "V12 SRM and procurement overlays for scorecards",
      "Shared identity so the client can take the graph with them",
    ],
    startHref: "/contact",
    startLabel: "Talk to RateQuip",
  },
  {
    slug: "students",
    title: "For students and early-career specialists",
    eyebrow: "Solutions",
    lead: "Build evidence before you have a company to put on a slide.",
    description: "Public learning paths are specified; Collaborate and contractor surfaces are the live entry.",
    whatYouGet: [
      "Create a free account and complete role-aware onboarding",
      "Follow public RFQs and supplier profiles to learn the market",
      "Academy and Work Passport remain later-wave",
      "Collaborate is the live place to offer specialist time",
    ],
    startHref: "/sign-up",
    startLabel: "Create an account",
  },
];

export function solutionBySlug(slug: string) {
  return solutionPages.find((s) => s.slug === slug) ?? null;
}
