import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";

export const metadata: Metadata = {
  title: "Trust and safety",
  description:
    "How RateQuip computes Trust Scores, verifies company claims and weights reviews that have evidence.",
};

export default function TrustPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Trust model"
        title="Trust and safety"
        lead="Reputation on RateQuip is earned from delivery facts, not from marketing claims or anonymous star ratings."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Trust", href: "/trust" },
        ]}
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          What the live Trust Score measures
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          Phase 2 scores are explainable weighted heuristics, stored with the
          inputs that produced them. A score cannot be written without that
          explanation payload.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rq-border)] text-[var(--rq-muted)]">
                <th className="py-2 pr-4 font-semibold">Component</th>
                <th className="py-2 pr-4 font-semibold">What it measures</th>
                <th className="py-2 font-semibold">Weight</th>
              </tr>
            </thead>
            <tbody className="text-[var(--rq-slate)]">
              <tr className="border-b border-[var(--rq-border)]">
                <td className="py-3 pr-4 font-medium text-[var(--rq-ink)]">
                  Reviews
                </td>
                <td className="py-3 pr-4">
                  Average rating, review volume, and the share of reviews with
                  purchase evidence
                </td>
                <td className="py-3">Up to 65 points</td>
              </tr>
              <tr className="border-b border-[var(--rq-border)]">
                <td className="py-3 pr-4 font-medium text-[var(--rq-ink)]">
                  Verification
                </td>
                <td className="py-3 pr-4">
                  Whether the company is claimed and verified after authority
                  review
                </td>
                <td className="py-3">Up to 25 points</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-[var(--rq-ink)]">
                  Activity
                </td>
                <td className="py-3 pr-4">
                  Response rate on RFQs and marketplace engagement
                </td>
                <td className="py-3">Up to 10 points</td>
              </tr>
            </tbody>
          </table>
        </div>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Company claims
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          A public social profile is not enough to take control of a company.
          Approval requires evidence or an automated verification payload, and
          the database rejects an approved claim that has not been marked
          authority-verified.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          <li>Search the directory or add the company from public sources.</li>
          <li>
            Submit a claim with notes and evidence from{" "}
            <Link href="/companies/claim" className="text-orange-600 hover:underline">
              Claim a company
            </Link>
            .
          </li>
          <li>Admin review records the decision and, on approval, sets claimed + verified.</li>
        </ul>
      </MarketingSection>

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Reviews that count
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          <li>
            A review is marked verified purchase only when evidence was uploaded.
          </li>
          <li>Reviews queue for moderation before they move the Trust Score.</li>
          <li>Suppliers can reply; appeals go to a human reviewer.</li>
          <li>Trust Score placement is never sold.</li>
        </ul>
      </MarketingSection>

      <MarketingCta
        title="See who is already verified"
        body="Browse the supplier directory. Scores on a company page match the score used in search."
        primary={{ label: "Supplier directory", href: "/suppliers" }}
        secondary={{ label: "How RateQuip works", href: "/how-it-works" }}
      />
    </>
  );
}
