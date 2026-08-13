import type { Metadata } from "next";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Common questions about Trust Scores, credits, claiming a company and RFQs on RateQuip.",
};

const groups = [
  {
    heading: "Getting started",
    items: [
      {
        q: "Does it cost anything to join RateQuip?",
        a: "No. Buyer Free is $0. It includes a starter wallet of 250 credits and one RFQ per month. Additional RFQs cost 25 credits. Suppliers can exist as an unclaimed profile at no cost and upgrade when they want catalogue and lead features.",
      },
      {
        q: "Do I need a company to use RateQuip?",
        a: "No. You can join as a buyer, supplier or contractor. Company profiles and individual accounts are separate. Collaborate is the live surface for specialist work without a full company claim.",
      },
      {
        q: "What is a Work Passport?",
        a: "A portable, evidence-backed record of what you have delivered. It is specified in the enterprise blueprint and started as a V12 thin slice. It is not the Phase 2 MVP.",
      },
    ],
  },
  {
    heading: "Trust and verification",
    items: [
      {
        q: "How is a Trust Score calculated?",
        a: "It combines reviews (rating, volume, verified-purchase share), verification (claimed and verified company) and activity (response rate). The inputs are stored with the score so the result is explainable.",
      },
      {
        q: "Can a supplier pay for a higher Trust Score?",
        a: "No. Placement by Trust Score is never sold.",
      },
      {
        q: "My company profile exists but I did not create it. Why?",
        a: "RateQuip lists industrial companies from public and contributed sources so buyers can find them. You can claim the profile, request a correction, or ask for it to be suppressed.",
      },
      {
        q: "How do I claim my company?",
        a: "Start at Claim a company. Approval requires evidence or a verification payload — a claim link alone is not enough.",
      },
    ],
  },
  {
    heading: "RFQs and quoting",
    items: [
      {
        q: "What does it cost to post an RFQ?",
        a: "25 credits, debited when the request is created. Buyer Free is capped at one RFQ per month.",
      },
      {
        q: "What does it cost to quote?",
        a: "Submitting a quote does not debit credits on the live path. Supplier plans add monthly credits for catalogue and lead features.",
      },
      {
        q: "Can I compare quotes that are structured differently?",
        a: "Yes. The compare workspace is at /quotes/compare and lines up responses against the same request.",
      },
    ],
  },
  {
    heading: "Credits and payments",
    items: [
      {
        q: "Are RateQuip Credits an investment?",
        a: "No. Credits are a platform utility used to access RateQuip services. They are not a financial product and are never promoted as an investment.",
      },
      {
        q: "How does settlement work?",
        a: "Subscriptions and credit packs are charged by Stripe. The RateQuip ledger records credit grants, RFQ debits, renewals and marketplace commission. The ledger is append-only — corrections are new rows, not edits.",
      },
      {
        q: "Does RateQuip provide finance or insurance?",
        a: "No. Those marketplaces are specified for later waves and will be referrals to licensed providers.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Support"
        title="Frequently asked questions"
        lead="Answers on trust, credits, claiming a company and RFQs — matching what the live platform actually does."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: "/faq" },
        ]}
      />

      {groups.map((group, i) => (
        <MarketingSection key={group.heading} alt={i % 2 === 1}>
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">{group.heading}</h2>
          <dl className="mt-6 space-y-6">
            {group.items.map((item) => (
              <div key={item.q}>
                <dt className="font-semibold text-[var(--rq-ink)]">{item.q}</dt>
                <dd className="mt-2 text-[var(--rq-slate)]">{item.a}</dd>
              </div>
            ))}
          </dl>
        </MarketingSection>
      ))}

      <MarketingCta
        title="Still stuck?"
        body="Send a note and we will point you at the right live workflow."
        primary={{ label: "Contact", href: "/contact" }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
      />
    </>
  );
}
