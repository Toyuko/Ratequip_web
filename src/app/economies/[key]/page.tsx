import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
  StatusPill,
} from "@/components/marketing/page-shell";
import { blueprintCapabilities } from "@/data/blueprint/capabilities";
import {
  blueprintEconomies,
  economyByKey,
} from "@/data/blueprint/economies";

export function generateStaticParams() {
  return blueprintEconomies.map((e) => ({ key: e.key }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ key: string }>;
}): Promise<Metadata> {
  const { key } = await params;
  const economy = economyByKey(key);
  return {
    title: economy?.name ?? "Economy",
    description: economy?.description,
  };
}

export default async function EconomyDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const economy = economyByKey(key);
  if (!economy) notFound();

  const caps = blueprintCapabilities.filter((c) =>
    economy.capabilityNumbers.includes(c.number),
  );

  return (
    <>
      <MarketingHero
        eyebrow="Economy"
        title={economy.name}
        lead={economy.description}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Economies", href: "/economies" },
          { label: economy.name, href: `/economies/${economy.key}` },
        ]}
        actions={<StatusPill status={economy.liveStatus} />}
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">Value exchange</h2>
        <p className="mt-3 text-[var(--rq-slate)]">{economy.valueExchange}</p>
        <p className="mt-4 text-sm text-[var(--rq-muted)]">{economy.liveNote}</p>
        <h3 className="mt-8 font-semibold text-[var(--rq-ink)]">Primary actors</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {economy.primaryActors.map((actor) => (
            <li
              key={actor}
              className="rounded-full border border-[var(--rq-border)] px-3 py-1 text-sm text-[var(--rq-slate)]"
            >
              {actor}
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Linked capabilities
        </h2>
        <ul className="mt-6 space-y-3">
          {caps.map((cap) => (
            <li key={cap.slug}>
              <Link
                href={`/capabilities/${cap.slug}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 hover:border-orange-300"
              >
                <span>
                  <span className="text-xs text-[var(--rq-muted)]">
                    {cap.number}.
                  </span>{" "}
                  <span className="font-medium text-[var(--rq-ink)]">
                    {cap.title}
                  </span>
                </span>
                <StatusPill status={cap.layer} />
              </Link>
            </li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingCta
        title="Back to the operating model"
        body="See how this economy sits next to procurement, reputation and credit."
        primary={{ label: "All economies", href: "/economies" }}
      />
    </>
  );
}
