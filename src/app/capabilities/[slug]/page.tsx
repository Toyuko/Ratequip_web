import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
  StatusPill,
} from "@/components/marketing/page-shell";
import {
  blueprintCapabilities,
  capabilityBySlug,
} from "@/data/blueprint/capabilities";
import { blueprintEconomies } from "@/data/blueprint/economies";
import Link from "next/link";

export function generateStaticParams() {
  return blueprintCapabilities.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cap = capabilityBySlug(slug);
  return {
    title: cap ? `${cap.number}. ${cap.title}` : "Capability",
    description: cap?.summary,
  };
}

export default async function CapabilityDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cap = capabilityBySlug(slug);
  if (!cap) notFound();

  const economies = blueprintEconomies.filter((e) =>
    e.capabilityNumbers.includes(cap.number),
  );

  return (
    <>
      <MarketingHero
        eyebrow={cap.group}
        title={`${cap.number}. ${cap.title}`}
        lead={cap.summary}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Capabilities", href: "/capabilities" },
          { label: String(cap.number), href: `/capabilities/${cap.slug}` },
        ]}
        actions={<StatusPill status={cap.layer} />}
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Status on the live platform
        </h2>
        <p className="mt-3 text-[var(--rq-slate)]">{cap.note}</p>
        {economies.length > 0 ? (
          <>
            <h3 className="mt-8 font-semibold text-[var(--rq-ink)]">Economies</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {economies.map((economy) => (
                <li key={economy.key}>
                  <Link
                    href={`/economies/${economy.key}`}
                    className="rounded-full border border-[var(--rq-border)] px-3 py-1 text-sm text-[var(--rq-slate)] hover:border-orange-300"
                  >
                    {economy.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </MarketingSection>

      <MarketingCta
        title="Back to the map"
        body="105 capabilities, each tagged live, V12 slice, or later wave."
        primary={{ label: "All capabilities", href: "/capabilities" }}
      />
    </>
  );
}
