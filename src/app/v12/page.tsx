import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listIndustries, questionPacks, taxonomyNodes } from "@/lib/v12/seeds";
import { getV12Store } from "@/lib/v12/store";
import { listWorkflowTemplates } from "@/lib/v12/workflow/runtime";

export const metadata = {
  title: "V12 Platform",
  description:
    "RateQuip Enterprise Master Repository V12 Parts 1–3 activation layer",
};

const cards = [
  {
    href: "/v12/activation",
    title: "Activation (DQE)",
    body: "Dynamic Question Engine — role/industry packs without hard-coded forms.",
  },
  {
    href: "/v12/taxonomy",
    title: "Industrial Taxonomy",
    body: "Versioned taxonomy nodes and search used by matching and RFQs.",
  },
  {
    href: "/v12/opportunity-builder",
    title: "Opportunity Builder",
    body: "Supplier commercial preferences for targeted matching.",
  },
  {
    href: "/v12/contractor-builder",
    title: "Contractor Builder",
    body: "Trades, licences, coverage, rates and availability.",
  },
  {
    href: "/v12/matching",
    title: "Explainable Matching",
    body: "Eligibility + scored shortlist with stored reason codes.",
  },
  {
    href: "/v12/intelligence",
    title: "Intelligence AI (D13)",
    body: "Grounded drafts that stay unpublished until human confirmation.",
  },
  {
    href: "/v12/requirement-ledger",
    title: "Requirement ledger (5A)",
    body: "URS/RFQ analysis → evidence-linked clauses → confirm/reject + gaps.",
  },
  {
    href: "/v12/release-control",
    title: "Release control (4A)",
    body: "Add-on registry, cohort kill switches, usage preview before charge.",
  },
  {
    href: "/v12/procurement",
    title: "Procurement (2A)",
    body: "Requisitions start workflow approval, then hand off into RFQ.",
  },
  {
    href: "/v12/rfq",
    title: "RFQ Platform (2A)",
    body: "Immutable revisions, comparison and award with audit.",
  },
  {
    href: "/v12/srm",
    title: "SRM",
    body: "Supplier scorecards, preferred status and performance.",
  },
  {
    href: "/v12/crm",
    title: "CRM",
    body: "Industrial accounts, opportunities and pipeline stages.",
  },
  {
    href: "/v12/assets",
    title: "Assets & passport (2B)",
    body: "Award creates commissioning asset + draft digital passport.",
  },
  {
    href: "/v12/workflow",
    title: "Workflow (3A)",
    body: "Configurable approvals, claim/complete tasks, no self-approval.",
  },
  {
    href: "/v12/documents",
    title: "Document vault (3A)",
    body: "Hashed evidence versions; approve locks immutability.",
  },
];

export default function V12HubPage() {
  const industries = listIndustries().length;
  const packs = questionPacks.length;
  const nodes = taxonomyNodes.length;
  const templates = listWorkflowTemplates().length;
  const store = getV12Store();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Badge variant="orange">
        V12 Parts 1–5 · Releases 2A / 2B / 3A / 4A / 5A
      </Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        RateQuip V12 operating layer
      </h1>
      <p className="mt-3 max-w-3xl text-[var(--rq-slate)]">
        From the consolidated Enterprise Master (Parts 1–3 + Part 4 Final + Part
        5): activation, commercial spine, assets, workflow/evidence, release
        & entitlement control, and URS requirement ledger. Later domains remain
        schema contracts until scheduled.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <Stat label="Taxonomy nodes" value={String(nodes)} />
        <Stat label="Industries" value={String(industries)} />
        <Stat label="Question packs" value={String(packs)} />
        <Stat
          label="Live V12 records"
          value={String(
            store.opportunities.length +
              store.contractors.length +
              store.requisitions.length +
              store.awards.length +
              store.assets.length +
              store.workflowInstances.length +
              store.documents.length +
              store.analysisRuns.length +
              templates,
          )}
        />
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 transition hover:border-orange-300"
          >
            <h2 className="font-semibold text-[var(--rq-ink)]">{c.title}</h2>
            <p className="mt-2 text-sm text-[var(--rq-slate)]">{c.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/v12/activation">Start activation</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/v12/workflow">Open workflow</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/buyer">Buyer dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
      <div className="text-2xl font-bold text-[var(--rq-ink)]">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-[var(--rq-muted)]">
        {label}
      </div>
    </div>
  );
}
