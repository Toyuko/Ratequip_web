import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listTalentGigs } from "@/lib/talent/operations";
import { EQUIPMENT_LABELS } from "@/lib/talent/taxonomy";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gigs = await listTalentGigs();
  const gig = gigs.find((g) => g.id === id);
  return { title: gig?.title ?? "Operator gig" };
}

export default async function OperatorGigPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gigs = await listTalentGigs();
  const gig = gigs.find((g) => g.id === id);
  if (!gig) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Operator gig</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">{gig.title}</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        {EQUIPMENT_LABELS[gig.equipmentClass] ?? gig.equipmentClass}
        {gig.siteLabel ? ` · ${gig.siteLabel}` : ""}
      </p>
      <p className="mt-4 text-[var(--rq-slate)]">
        {gig.description ?? "Ticketed operator required for this hire."}
      </p>
      <p className="mt-4 text-sm text-[var(--rq-muted)]">
        {(gig.rateCents / 100).toFixed(2)} {gig.currency}/hr ·{" "}
        {new Date(gig.startsAt).toLocaleDateString()} –{" "}
        {new Date(gig.endsAt).toLocaleDateString()}
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/operators/join">Apply / join the pool</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/legal/operator-pool-notice">Collection notice</Link>
        </Button>
      </div>
    </div>
  );
}
