import type { Metadata } from "next";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "How RateQuip works",
  description:
    "Discover suppliers, post an RFQ, verify with evidence, and award — without leaving RateQuip.",
};

const steps = [
  {
    title: "1. Discover",
    body: "Search equipment, suppliers and categories, or describe a project and let RateQuip’s AI map it onto the graph. Every supplier card shows the live Trust Score.",
    items: [
      "Unified search across companies and open RFQs",
      "Category and country filters",
      "Add-company search before you create a duplicate",
    ],
  },
  {
    title: "2. Request",
    body: "Convert the objective into a structured RFQ. AI can draft scope; you confirm before publication. Creating an RFQ costs 25 credits. Buyer Free is capped at one RFQ per month.",
    items: [
      "Line items, compliance options and attachments",
      "Credit debit before the request goes live",
      "One comparison workspace for quotes",
    ],
  },
  {
    title: "3. Verify",
    body: "Claim a company with evidence. Reviews with purchase documents carry more weight. Scores are recomputed when a review is approved.",
    items: [
      "Authority verification before a claim is approved",
      "Moderation queue for reviews",
      "Right of reply for suppliers",
    ],
  },
  {
    title: "4. Deliver",
    body: "Award the RFQ on the live request. Commission is written to the ledger. V12 workflow and Collaborate cover the execution overlay.",
    items: [
      "Award records marketplace commission",
      "Project create after sourcing",
      "Collaborate for specialist sessions and jobs",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Workflow"
        title="How RateQuip works"
        lead="Discover, request, verify, deliver. Each step writes evidence back into the company graph."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "How it works", href: "/how-it-works" },
        ]}
      />

      {steps.map((step, i) => (
        <MarketingSection key={step.title} alt={i % 2 === 1}>
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">{step.title}</h2>
          <p className="mt-3 text-[var(--rq-slate)]">{step.body}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
            {step.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </MarketingSection>
      ))}

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          What each side gets today
        </h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rq-border)] text-[var(--rq-muted)]">
                <th className="py-2 pr-4 font-semibold">Buyers</th>
                <th className="py-2 pr-4 font-semibold">Suppliers</th>
                <th className="py-2 font-semibold">Professionals</th>
              </tr>
            </thead>
            <tbody className="text-[var(--rq-slate)]">
              <tr className="border-b border-[var(--rq-border)] align-top">
                <td className="py-3 pr-4">Evidence-backed shortlists</td>
                <td className="py-3 pr-4">Qualified RFQ flow</td>
                <td className="py-3">Contractor dashboard</td>
              </tr>
              <tr className="border-b border-[var(--rq-border)] align-top">
                <td className="py-3 pr-4">Structured RFQs in minutes</td>
                <td className="py-3 pr-4">Claimed, verified profile</td>
                <td className="py-3">Collaborate jobs and sessions</td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4">Quote comparison workspace</td>
                <td className="py-3 pr-4">Right of reply on reviews</td>
                <td className="py-3">V12 contractor builder</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MarketingSection>

      <MarketingCta
        title="Start with a requirement"
        body="Post an objective and let RateQuip assemble the suppliers who can deliver it."
        primary={{ label: "Create an RFQ", href: "/requests/new" }}
        secondary={{ label: "See pricing", href: "/pricing" }}
      />
    </>
  );
}
