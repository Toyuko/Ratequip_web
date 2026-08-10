"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Engagement = {
  engagementId: string;
  mode: string;
  title: string;
  state: string;
  currency: string;
  createdAt: string;
};

export default function JobsListPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);

  useEffect(() => {
    fetch("/api/v1/collaborate?action=list_engagements&mode=JOB")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setEngagements(d.engagements);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="orange">Job</Badge>
          <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
            Paid jobs
          </h1>
          <p className="mt-2 text-[var(--rq-slate)]">
            Single-contributor engagements with milestone funding and
            evidence-based acceptance.
          </p>
        </div>
        <Button asChild>
          <Link href="/collaborate/jobs/new">Post a job</Link>
        </Button>
      </div>

      <ul className="mt-8 space-y-3">
        {engagements.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[var(--rq-border)] p-8 text-center text-[var(--rq-slate)]">
            No jobs yet.
          </li>
        ) : (
          engagements.map((e) => (
            <li key={e.engagementId}>
              <Link
                href={`/collaborate/engagements/${e.engagementId}`}
                className="flex items-center justify-between rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 transition hover:border-[var(--rq-ink)]"
              >
                <div>
                  <div className="font-medium text-[var(--rq-ink)]">
                    {e.title}
                  </div>
                  <div className="text-xs text-[var(--rq-muted)]">
                    {e.engagementId}
                  </div>
                </div>
                <Badge variant="muted">{e.state}</Badge>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
