import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "RateQuip platform guide",
  description: "Simple guide to what RateQuip does for buyers and suppliers",
};

const journey = [
  {
    step: "1",
    title: "Set up your company",
    body: "Answer a short guided questionnaire for your role and industry so RateQuip understands what you buy or sell.",
    href: "/v12/activation",
    cta: "Start setup",
  },
  {
    step: "2",
    title: "Describe what you need (or offer)",
    body: "Use shared equipment language, then save buyer opportunities or contractor skills so the right partners can be found.",
    href: "/v12/taxonomy",
    cta: "Browse categories",
  },
  {
    step: "3",
    title: "Find a good match",
    body: "See a shortlist with clear reasons — not a mystery ranking — so you know why someone appears.",
    href: "/v12/matching",
    cta: "See matching",
  },
  {
    step: "4",
    title: "Buy with approvals",
    body: "Raise a request, get manager/finance approval, send an RFQ, compare quotes, and award with a recorded trail.",
    href: "/v12/procurement",
    cta: "Open buying",
  },
  {
    step: "5",
    title: "Keep the equipment on record",
    body: "When you award, RateQuip can create an asset record and a digital passport so history is not lost.",
    href: "/v12/assets",
    cta: "View assets",
  },
];

const tools = [
  {
    group: "Getting started",
    items: [
      {
        href: "/v12/activation",
        title: "Company setup",
        body: "Guided questions that adapt to your role and industry.",
      },
      {
        href: "/v12/taxonomy",
        title: "Equipment & industry categories",
        body: "A shared catalogue so buyers and suppliers use the same terms.",
      },
      {
        href: "/v12/opportunity-builder",
        title: "What I sell / want to win",
        body: "Tell RateQuip your preferred markets and project types.",
      },
      {
        href: "/v12/contractor-builder",
        title: "Contractor profile",
        body: "Trades, licences, coverage area, rates and availability.",
      },
    ],
  },
  {
    group: "Buying & quoting",
    items: [
      {
        href: "/v12/matching",
        title: "Smart shortlist",
        body: "Who fits — and why — before you invite them.",
      },
      {
        href: "/v12/procurement",
        title: "Purchase requests",
        body: "Internal requests with approval before you go to market.",
      },
      {
        href: "/v12/rfq",
        title: "RFQ & award",
        body: "Controlled quote rounds, comparison, and a defensible award.",
      },
      {
        href: "/v12/srm",
        title: "Supplier scorecards",
        body: "Quality, delivery and responsiveness in one place.",
      },
      {
        href: "/v12/crm",
        title: "Sales pipeline",
        body: "Accounts and opportunities for industrial sales teams.",
      },
    ],
  },
  {
    group: "After the award",
    items: [
      {
        href: "/v12/assets",
        title: "Equipment register",
        body: "Turn an award into a tracked asset with a digital passport.",
      },
      {
        href: "/v12/documents",
        title: "Evidence & certificates",
        body: "Store important files so approved versions cannot be silently changed.",
      },
      {
        href: "/v12/workflow",
        title: "Approvals inbox",
        body: "Claim and complete approval tasks — you cannot approve your own request.",
      },
    ],
  },
  {
    group: "Smarter project intake",
    items: [
      {
        href: "/v12/requirement-ledger",
        title: "Read my specification",
        body: "Paste a URS/RFQ. RateQuip lists requirements to accept or reject, plus missing gaps and questions.",
      },
      {
        href: "/v12/intelligence",
        title: "AI draft helper",
        body: "AI can draft text, but nothing consequential goes live until a person confirms.",
      },
      {
        href: "/v12/release-control",
        title: "Usage & pilot controls",
        body: "See credit cost before AI runs, and switch pilot features on or off safely.",
      },
    ],
  },
];

export default function V12HubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Plain-language guide</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)] sm:text-4xl">
        What RateQuip does for you
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--rq-slate)]">
        RateQuip helps industrial buyers and suppliers find the right fit, run a
        clear buying process, and keep a trustworthy record from need → quote →
        award → equipment on site.
      </p>

      <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <h2 className="font-semibold text-[var(--rq-ink)]">
          In one sentence
        </h2>
        <p className="mt-2 text-[var(--rq-slate)]">
          You describe what you need, RateQuip suggests suitable partners with
          reasons, you approve and award fairly, and the system remembers the
          equipment and paperwork afterwards — without hidden charges or silent
          AI decisions.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-bold text-[var(--rq-ink)]">
        A typical project, step by step
      </h2>
      <ol className="mt-6 space-y-4">
        {journey.map((j) => (
          <li
            key={j.step}
            className="flex gap-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-800">
              {j.step}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-[var(--rq-ink)]">{j.title}</h3>
              <p className="mt-1 text-sm text-[var(--rq-slate)]">{j.body}</p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href={j.href}>{j.cta}</Link>
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-xl font-bold text-[var(--rq-ink)]">
        Tools by job
      </h2>
      <div className="mt-6 space-y-10">
        {tools.map((section) => (
          <div key={section.group}>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
              {section.group}
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block h-full rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 transition hover:border-orange-300"
                  >
                    <div className="font-semibold text-[var(--rq-ink)]">
                      {item.title}
                    </div>
                    <p className="mt-1 text-sm text-[var(--rq-slate)]">
                      {item.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-surface)] p-5">
        <h2 className="font-semibold text-[var(--rq-ink)]">
          What you can use today vs later
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <div className="font-medium text-emerald-800">Ready to try</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--rq-slate)]">
              <li>Company setup & matching</li>
              <li>Purchase request → RFQ → award</li>
              <li>Asset record after award</li>
              <li>Approvals & document evidence</li>
              <li>Specification reading (accept / reject)</li>
              <li>Credit preview before AI analysis</li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-[var(--rq-muted)]">
              Coming in later phases
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--rq-slate)]">
              <li>Full service / maintenance marketplaces</li>
              <li>Finance, freight, lab and workforce add-ons</li>
              <li>Deep ERP / factory system connections</li>
              <li>Broader pilot packs and analytics</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/v12/activation">Start with company setup</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/v12/requirement-ledger">Try specification reading</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/buyer">Buyer home</Link>
        </Button>
      </div>
    </div>
  );
}
