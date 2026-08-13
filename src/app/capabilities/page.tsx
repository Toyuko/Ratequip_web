import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
  StatusPill,
} from "@/components/marketing/page-shell";
import {
  capabilitiesByGroup,
  capabilityCounts,
} from "@/data/blueprint/capabilities";

export const metadata: Metadata = {
  title: "Capability map (1–105)",
  description:
    "All 105 Super Repository capabilities mapped onto live RateQuip, the V12 overlay, or a later wave.",
};

export default function CapabilitiesPage() {
  const counts = capabilityCounts();
  const groups = capabilitiesByGroup();

  return (
    <>
      <MarketingHero
        eyebrow="Blueprint"
        title="Capability map"
        lead="The Super Repository specified 105 capabilities. This page is the sequenced backlog for the live platform — not a claim that 105 features have shipped."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Capabilities", href: "/capabilities" },
        ]}
      />

      <MarketingSection>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
            <p className="text-2xl font-bold text-[var(--rq-ink)]">{counts.live}</p>
            <p className="mt-1 text-sm text-[var(--rq-muted)]">Live on Phase 2</p>
          </div>
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
            <p className="text-2xl font-bold text-[var(--rq-ink)]">{counts.v12}</p>
            <p className="mt-1 text-sm text-[var(--rq-muted)]">V12 / V13 thin slice</p>
          </div>
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
            <p className="text-2xl font-bold text-[var(--rq-ink)]">{counts.later}</p>
            <p className="mt-1 text-sm text-[var(--rq-muted)]">Later wave</p>
          </div>
        </div>
      </MarketingSection>

      {groups.map((group, i) => (
        <MarketingSection key={group.group} alt={i % 2 === 1}>
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">{group.group}</h2>
          <ul className="mt-4 divide-y divide-[var(--rq-border)]">
            {group.items.map((cap) => (
              <li key={cap.slug} className="py-3">
                <Link
                  href={`/capabilities/${cap.slug}`}
                  className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                >
                  <span>
                    <span className="text-xs font-semibold text-[var(--rq-muted)]">
                      {cap.number}
                    </span>{" "}
                    <span className="font-medium text-[var(--rq-ink)]">
                      {cap.title}
                    </span>
                    <span className="mt-1 block text-sm text-[var(--rq-slate)]">
                      {cap.note}
                    </span>
                  </span>
                  <StatusPill status={cap.layer} />
                </Link>
              </li>
            ))}
          </ul>
        </MarketingSection>
      ))}

      <MarketingCta
        title="See the delivery sequence"
        body="Live work stays on Ratequip_web. Later economies ship as flagged overlays."
        primary={{ label: "Roadmap", href: "/roadmap" }}
        secondary={{ label: "Economies", href: "/economies" }}
      />
    </>
  );
}
