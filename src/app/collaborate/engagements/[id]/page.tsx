"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FeeDisclosure = {
  gross: string;
  platformFee: string;
  providerFee: string;
  netToContributor: string;
  feeBps: number;
  scheduleVersion: string;
};

type Engagement = {
  engagementId: string;
  mode: string;
  title: string;
  state: string;
  buyerPartyId: string;
  currency: string;
  actors: { actorId: string; partyId: string; role: string }[];
  milestones: {
    milestoneId: string;
    title: string;
    state: string;
    amount: { currency: string; amountMinor: number };
    acceptanceCriteria: string[];
    evidence: { evidenceId: string; type: string }[];
    fundingRef?: string;
  }[];
  sessionRecord?: {
    findings: string;
    recommendations: string;
    nextSteps: string;
  };
  requirements: { requirementId: string; taxonomyId: string; status: string }[];
};

const JOB_NEXT: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["QUOTING"],
  QUOTING: ["AWARDED"],
  AWARDED: ["CONTRACTED"],
  CONTRACTED: ["FUNDED"],
  FUNDED: ["IN_PROGRESS"],
  IN_PROGRESS: ["SUBMITTED"],
  SUBMITTED: ["ACCEPTED"],
  ACCEPTED: ["PAID"],
  PAID: ["CLOSED"],
};

const SESSION_NEXT: Record<string, string[]> = {
  OFFERED: ["BOOKED"],
  BOOKED: ["AUTHORISED"],
  AUTHORISED: ["IN_SESSION"],
  IN_SESSION: ["DELIVERABLE_SUBMITTED"],
  DELIVERABLE_SUBMITTED: ["ACCEPTED"],
  ACCEPTED: ["PAID"],
  PAID: ["CLOSED"],
};

export default function EngagementDetailPage() {
  const params = useParams();
  const engagementId = String(params.id);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [fee, setFee] = useState<FeeDisclosure | null>(null);
  const [events, setEvents] = useState<
    { eventId: string; type: string; occurredAt: string; chainHash: string }[]
  >([]);
  const [chainOk, setChainOk] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    const [e, c] = await Promise.all([
      fetch(
        `/api/v1/collaborate?action=get_engagement&engagementId=${engagementId}`,
      ).then((r) => r.json()),
      fetch(
        `/api/v1/collaborate?action=event_chain&engagementId=${engagementId}`,
      ).then((r) => r.json()),
    ]);
    if (e.ok) {
      setEngagement(e.engagement);
      setFee(e.feeDisclosure);
    }
    if (c.ok) {
      setEvents(c.events);
      setChainOk(c.verification?.ok ?? null);
    }
  }, [engagementId]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  function actingAs(): string {
    if (!engagement) return "";
    return engagement.buyerPartyId;
  }

  function contributorPartyId(): string {
    return (
      engagement?.actors.find((a) => a.role === "CONTRIBUTOR")?.partyId ??
      actingAs()
    );
  }

  function transition(toState: string, payload?: Record<string, unknown>) {
    startTransition(async () => {
      const res = await fetch("/api/v1/collaborate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `${engagementId}-${toState}-${Date.now()}`,
        },
        body: JSON.stringify({
          action: "transition",
          engagementId,
          toState,
          actingAsPartyId:
            toState === "DELIVERABLE_SUBMITTED"
              ? contributorPartyId()
              : actingAs(),
          payload,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMessage(data.error ?? "Transition failed");
        return;
      }
      setMessage(`Moved to ${toState}`);
      await refresh();
    });
  }

  if (!engagement) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-[var(--rq-slate)]">
        Loading engagement…
      </div>
    );
  }

  const nextMap = engagement.mode === "SESSION" ? SESSION_NEXT : JOB_NEXT;
  const nextStates = nextMap[engagement.state] ?? [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="orange">{engagement.mode}</Badge>
        <Badge variant="muted">{engagement.state}</Badge>
        {chainOk != null ? (
          <Badge variant={chainOk ? "success" : "warning"}>
            Event chain {chainOk ? "intact" : "broken"}
          </Badge>
        ) : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {engagement.title}
      </h1>
      <p className="mt-1 text-xs text-[var(--rq-muted)]">
        {engagement.engagementId}
      </p>

      {fee ? (
        <section className="mt-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">
            Fee disclosure
          </h2>
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Schedule {fee.scheduleVersion} · {fee.feeBps} bps
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[var(--rq-muted)]">Gross</dt>
              <dd className="font-medium text-[var(--rq-ink)]">{fee.gross}</dd>
            </div>
            <div>
              <dt className="text-[var(--rq-muted)]">Platform fee</dt>
              <dd className="font-medium text-[var(--rq-ink)]">
                {fee.platformFee}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--rq-muted)]">Provider fee</dt>
              <dd className="font-medium text-[var(--rq-ink)]">
                {fee.providerFee}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--rq-muted)]">Net to contributor</dt>
              <dd className="font-medium text-[var(--rq-ink)]">
                {fee.netToContributor}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-semibold text-[var(--rq-ink)]">Milestones</h2>
        <ul className="mt-3 space-y-3">
          {engagement.milestones.map((m) => (
            <li
              key={m.milestoneId}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-[var(--rq-ink)]">
                  {m.title}
                </span>
                <Badge variant="muted">{m.state}</Badge>
              </div>
              <p className="mt-1 text-[var(--rq-slate)]">
                {(m.amount.amountMinor / 100).toFixed(2)} {m.amount.currency}
                {m.fundingRef ? ` · funded ${m.fundingRef.slice(0, 14)}…` : ""}
              </p>
              <ul className="mt-2 list-inside list-disc text-[var(--rq-muted)]">
                {m.acceptanceCriteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              {m.state === "DRAFT" ? (
                <p className="mt-2 text-amber-700">
                  Unfunded — work started now is at contributor risk.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {engagement.requirements.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-semibold text-[var(--rq-ink)]">Requirements</h2>
          <ul className="mt-2 space-y-1 text-sm text-[var(--rq-slate)]">
            {engagement.requirements.map((r) => (
              <li key={r.requirementId}>
                {r.taxonomyId}{" "}
                <Badge variant="muted">{r.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {engagement.mode === "SESSION" &&
      engagement.state === "IN_SESSION" ? (
        <form
          className="mt-6 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            transition("DELIVERABLE_SUBMITTED", {
              findings: String(fd.get("findings")),
              recommendations: String(fd.get("recommendations")),
              nextSteps: String(fd.get("nextSteps")),
            });
          }}
        >
          <h2 className="font-semibold text-[var(--rq-ink)]">
            Session deliverable
          </h2>
          <p className="text-xs text-[var(--rq-muted)]">
            Voice-only advice without an artefact is not accepted.
          </p>
          <div>
            <Label htmlFor="findings">Findings</Label>
            <Textarea id="findings" name="findings" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              name="recommendations"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nextSteps">Next steps</Label>
            <Textarea
              id="nextSteps"
              name="nextSteps"
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={pending}>
            Submit deliverable
          </Button>
        </form>
      ) : null}

      {engagement.sessionRecord ? (
        <section className="mt-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 text-sm">
          <h2 className="font-semibold text-[var(--rq-ink)]">Session record</h2>
          <p className="mt-2">
            <span className="text-[var(--rq-muted)]">Findings: </span>
            {engagement.sessionRecord.findings}
          </p>
          <p className="mt-1">
            <span className="text-[var(--rq-muted)]">Recommendations: </span>
            {engagement.sessionRecord.recommendations}
          </p>
          <p className="mt-1">
            <span className="text-[var(--rq-muted)]">Next steps: </span>
            {engagement.sessionRecord.nextSteps}
          </p>
        </section>
      ) : null}

      {engagement.mode === "JOB" &&
      ["FUNDED", "IN_PROGRESS"].includes(engagement.state) ? (
        <div className="mt-6">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              const ms = engagement.milestones[0];
              if (!ms) return;
              startTransition(async () => {
                await fetch("/api/v1/collaborate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "submit_evidence",
                    engagementId,
                    milestoneId: ms.milestoneId,
                    type: "DOCUMENT",
                    fileName: "delivery-pack.pdf",
                    actingAsPartyId: contributorPartyId(),
                    criterionIndex: 0,
                  }),
                });
                setMessage("Evidence submitted");
                await refresh();
              });
            }}
          >
            Submit evidence artefact
          </Button>
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="font-semibold text-[var(--rq-ink)]">Advance state</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {nextStates.map((s) => (
            <Button
              key={s}
              size="sm"
              disabled={pending}
              onClick={() => transition(s)}
            >
              → {s}
            </Button>
          ))}
          {nextStates.length === 0 ? (
            <span className="text-sm text-[var(--rq-muted)]">
              No further transitions from {engagement.state}
            </span>
          ) : null}
        </div>
        {message ? (
          <p className="mt-3 text-sm text-emerald-700">{message}</p>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">
          Domain event chain
        </h2>
        <ol className="mt-3 space-y-2 text-xs text-[var(--rq-slate)]">
          {events.map((ev) => (
            <li
              key={ev.eventId}
              className="rounded border border-[var(--rq-border)] px-3 py-2 font-mono"
            >
              <div className="text-[var(--rq-ink)]">{ev.type}</div>
              <div>
                {ev.occurredAt} · {ev.chainHash.slice(0, 16)}…
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/collaborate">Back to Collaborate</Link>
        </Button>
      </div>
    </div>
  );
}
