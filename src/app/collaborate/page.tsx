"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Snapshot = {
  parties: number;
  engagements: number;
  offerings: number;
  events: number;
  reputationEvents: number;
};

const modes = [
  {
    title: "Remote Expert Support",
    mode: "SESSION",
    phase: "Phase 1 — launch",
    href: "/collaborate/sessions",
    body: "Book a diagnostic, consult, or PLC review. Payment authorised at booking, released after the written session record is accepted.",
  },
  {
    title: "Paid Jobs",
    mode: "JOB",
    phase: "Phase 2",
    href: "/collaborate/jobs",
    body: "One buyer, one contributor, milestone funding, evidence-based acceptance, and transparent fees before every accept.",
  },
  {
    title: "Project Pods",
    mode: "POD",
    phase: "Phase 3",
    href: "/collaborate/jobs?mode=POD",
    body: "AI Team Architect decomposes an outcome into requirements, assembles a multi-party team, and pays on milestone evidence.",
  },
  {
    title: "Venture Builder",
    mode: "VENTURE",
    phase: "Phase 5",
    href: "/collaborate#venture",
    body: "Record contributions and close capability gaps — without equity, profit-share, or investment features on-platform.",
  },
];

export default function CollaborateHubPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    fetch("/api/v1/collaborate?action=snapshot")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setSnap(d);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Collaborate</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)] sm:text-4xl">
        Work, teams and venture creation
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--rq-slate)]">
        Tell RateQuip what you can do, what you have, or what you want to build —
        and RateQuip helps assemble the people, companies and resources required
        to make it happen.
      </p>

      {snap ? (
        <div className="mt-6 flex flex-wrap gap-3 text-xs text-[var(--rq-muted)]">
          <span>{snap.parties} parties</span>
          <span>·</span>
          <span>{snap.offerings} offerings</span>
          <span>·</span>
          <span>{snap.engagements} engagements</span>
          <span>·</span>
          <span>{snap.events} domain events</span>
          <span>·</span>
          <span>{snap.reputationEvents} reputation events</span>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/collaborate/sessions">Browse expert sessions</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/collaborate/experts">Publish an offering</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/collaborate/jobs/new">Post a job</Link>
        </Button>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {modes.map((m) => (
          <li
            key={m.mode}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
                {m.title}
              </h2>
              <Badge variant="muted">{m.phase}</Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--rq-slate)]">{m.body}</p>
            <Button asChild className="mt-4" size="sm" variant="outline">
              <Link href={m.href}>Open</Link>
            </Button>
          </li>
        ))}
      </ul>

      <section
        id="venture"
        className="mt-12 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
      >
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          Hard constraints
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--rq-slate)]">
          <li>
            RateQuip is never the counterparty by default — escrow sits with a
            licensed payment provider.
          </li>
          <li>
            Fees are disclosed (gross, platform fee, provider fee, net) before
            every acceptance.
          </li>
          <li>
            Reputation is earned from funded deliveries only — never purchased
            or free-text authored.
          </li>
          <li>
            Contribution ≠ equity. Venture Builder never computes ownership
            percentages or profit shares.
          </li>
        </ul>
      </section>
    </div>
  );
}
