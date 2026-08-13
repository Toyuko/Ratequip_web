import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  MarketingCta,
  MarketingHero,
  MarketingSection,
} from "@/components/marketing/page-shell";
import { solutionBySlug, solutionPages } from "@/data/blueprint/solutions";

export function generateStaticParams() {
  return solutionPages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = solutionBySlug(slug);
  return {
    title: page?.title ?? "Solutions",
    description: page?.description,
  };
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = solutionBySlug(slug);
  if (!page) notFound();

  return (
    <>
      <MarketingHero
        eyebrow={page.eyebrow}
        title={page.title}
        lead={page.lead}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Solutions", href: `/solutions/${page.slug}` },
          { label: page.title, href: `/solutions/${page.slug}` },
        ]}
        actions={
          <Button asChild>
            <Link href={page.startHref}>{page.startLabel}</Link>
          </Button>
        }
      />

      <MarketingSection>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">What you get</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[var(--rq-slate)]">
          {page.whatYouGet.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </MarketingSection>

      <MarketingSection alt>
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">Other audiences</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {solutionPages
            .filter((s) => s.slug !== page.slug)
            .map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="block rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 hover:border-orange-300"
                >
                  <span className="font-medium text-[var(--rq-ink)]">{s.title}</span>
                  <span className="mt-1 block text-sm text-[var(--rq-muted)]">
                    {s.lead}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </MarketingSection>

      <MarketingCta
        title={page.startLabel}
        body={page.description}
        primary={{ label: page.startLabel, href: page.startHref }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
      />
    </>
  );
}
