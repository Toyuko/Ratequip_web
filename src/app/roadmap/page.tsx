import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { capabilityCounts } from "@/data/blueprint/capabilities";

export const metadata: Metadata = {
  title: "Delivery roadmap",
  description:
    "What is live on RateQuip today, what sits in the V12 overlay, and what remains later-wave from the Super Repository blueprint.",
};

const waves = [
  {
    name: "Phase 2 MVP — live",
    scope:
      "Industrial marketplace, company claim, reviews, RFQ create/quote/award, Stripe credits, Organic Growth, Collaborate.",
  },
  {
    name: "V12 / V13 overlay — thin slices",
    scope:
      "Taxonomy, DQE, matching, procurement overlay, workflow, vault, catalogue factory, Part 7 business DNA.",
  },
  {
    name: "Wave 0 of this overlay — shipping now",
    scope:
      "Sitemap, robots, titles, JSON-LD, security headers, skip link, and public blueprint pages.",
  },
  {
    name: "Later waves",
    scope:
      "Field evidence, academy, advertising, team constitutions, insurance/freight marketplaces, OT integrations.",
  },
];

export default function RoadmapPage() {
  const counts = capabilityCounts();

  return (
    <>
      <MarketingHero
        eyebrow="Delivery"
        title="Delivery roadmap"
        lead="The Super Repository is the product backlog. The live site is the product. Capabilities move from later → V12 slice → live without replacing Clerk, Neon or Stripe."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Roadmap", href: "/roadmap" },
        ]}
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Coverage of 105 blueprint capabilities
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          {counts.live} live · {counts.v12} V12 thin slices · {counts.later} later
          wave. See the{" "}
          <Link href="/capabilities" className="text-orange-600 hover:underline">
            full map
          </Link>
          .
        </p>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">Sequence</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--rq-border)] text-[var(--rq-muted)]">
                <th className="py-2 pr-4 font-semibold">Wave</th>
                <th className="py-2 font-semibold">Scope</th>
              </tr>
            </thead>
            <tbody className="text-[var(--rq-slate)]">
              {waves.map((wave) => (
                <tr
                  key={wave.name}
                  className="border-b border-[var(--rq-border)] align-top last:border-0"
                >
                  <td className="py-3 pr-4 font-medium text-[var(--rq-ink)]">
                    {wave.name}
                  </td>
                  <td className="py-3">{wave.scope}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MarketingSection>

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Definition of done
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">
          A capability is not complete until it is demonstrable, permissioned,
          explainable, audited and documented. Seed screens do not count.
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          <li>Functional path works against a real account, not only fixtures</li>
          <li>State transitions covered, including rejection and reversal</li>
          <li>Permissions enforced in data access, not only in the UI</li>
          <li>The user can see why a score, match or approval happened</li>
          <li>Changelog and API contract updated in the same change</li>
        </ul>
      </MarketingSection>

      <MarketingCta
        title="See the twelve economies"
        body="Each economy reuses identity, ledger and permissions. Only some are live today."
        primary={{ label: "Economies", href: "/economies" }}
        secondary={{ label: "Coming modules", href: "/modules" }}
      />
    </>
  );
}
