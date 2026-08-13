import type { Metadata } from "next";
import Link from "next/link";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
  StatusPill,
} from "@/components/marketing/page-shell";
import { blueprintEconomies } from "@/data/blueprint/economies";

export const metadata: Metadata = {
  title: "The twelve connected economies",
  description:
    "RateQuip is not one marketplace. It is twelve connected economies sharing identity, ledger and permissions — with a clear live vs later-wave split.",
};

export default function EconomiesPage() {
  return (
    <>
      <MarketingHero
        eyebrow="Operating model"
        title="Twelve connected economies"
        lead="Each economy governs a distinct value exchange. All of them reuse the same identity, organisation, permission and ledger primitives, so new modules land without a platform rewrite."
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Economies", href: "/economies" },
        ]}
      />

      <MarketingSection>
        <ul className="grid gap-4 sm:grid-cols-2">
          {blueprintEconomies.map((economy) => (
            <li key={economy.key}>
              <Link
                href={`/economies/${economy.key}`}
                className="block h-full rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 transition hover:border-orange-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-[var(--rq-ink)]">
                    {economy.name}
                  </h2>
                  <StatusPill status={economy.liveStatus} />
                </div>
                <p className="mt-2 text-sm text-[var(--rq-slate)]">
                  {economy.valueExchange}
                </p>
                <p className="mt-3 text-xs text-[var(--rq-muted)]">
                  {economy.liveNote}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingCta
        title="Browse the 105 capabilities"
        body="Every economy maps onto numbered capabilities. Each one is tagged live, V12 slice, or later wave."
        primary={{ label: "Capability map", href: "/capabilities" }}
        secondary={{ label: "Roadmap", href: "/roadmap" }}
      />
    </>
  );
}
