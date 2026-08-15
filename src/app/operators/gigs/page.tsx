"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EQUIPMENT_LABELS } from "@/lib/talent/taxonomy";

type Gig = {
  id: string;
  title: string;
  equipmentClass: string;
  siteLabel?: string;
  status: string;
  rateCents: number;
  currency: string;
  startsAt: string;
};

export default function OperatorGigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);

  useEffect(() => {
    fetch("/api/v1/talent?action=list_gigs")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setGigs(d.gigs);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Operator gigs</Badge>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
        Open operator requirements
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Gigs published to the Indeed XML feed and held in the RateQuip pool.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild>
          <Link href="/operators/join">Join the pool</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/collaborate/jobs/new">Post a specialist job</Link>
        </Button>
      </div>
      <ul className="mt-8 space-y-3">
        {gigs.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[var(--rq-border)] p-8 text-center text-[var(--rq-slate)]">
            No operator gigs yet.
          </li>
        ) : (
          gigs.map((g) => (
            <li
              key={g.id}
              className="flex items-center justify-between rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div>
                <div className="font-medium text-[var(--rq-ink)]">{g.title}</div>
                <div className="text-xs text-[var(--rq-muted)]">
                  {EQUIPMENT_LABELS[g.equipmentClass] ?? g.equipmentClass}
                  {g.siteLabel ? ` · ${g.siteLabel}` : ""}
                  {` · ${(g.rateCents / 100).toFixed(0)} ${g.currency}/hr`}
                </div>
              </div>
              <Badge variant="muted">{g.status}</Badge>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
