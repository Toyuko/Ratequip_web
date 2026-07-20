"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  v12ListReleaseControl,
  v12PreviewUrsUsage,
  v12ConfirmUsagePreview,
  v12SetCohortKillSwitch,
} from "@/lib/actions/v12";

export default function ReleaseControlPage() {
  const [data, setData] = useState<Awaited<
    ReturnType<typeof v12ListReleaseControl>
  > | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () =>
    startTransition(async () => {
      setData(await v12ListReleaseControl());
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Credits & pilots</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Usage & pilot controls
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Before RateQuip runs a chargeable AI analysis, you see an estimate and
        confirm it. You can also turn a pilot feature off instantly if something
        looks wrong.{" "}
        <Link href="/v12" className="text-orange-700 underline">
          Back to guide
        </Link>
      </p>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <h2 className="font-semibold text-[var(--rq-ink)]">Your credit balance</h2>
        <p className="mt-2 text-sm text-[var(--rq-slate)]">
          Credits left:{" "}
          <strong>{data?.entitlementRemaining ?? "…"}</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const preview = await v12PreviewUrsUsage();
                setMessage(
                  `Estimated cost for reading a specification: ${preview.low}–${preview.high} ${preview.unit}` +
                    (preview.warnings.length
                      ? ` (note: ${preview.warnings.join(", ")})`
                      : ""),
                );
                reload();
              })
            }
          >
            Show cost estimate
          </Button>
          {data?.previews[0] && !data.previews[0].confirmed ? (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await v12ConfirmUsagePreview({
                    previewId: data.previews[0]!.id,
                    confirmedBy: "buyer@demo.ratequip.com",
                  });
                  setMessage(
                    res.ok
                      ? "Cost estimate confirmed — you can run the analysis"
                      : res.message,
                  );
                  reload();
                })
              }
            >
              Confirm this estimate
            </Button>
          ) : null}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Platform versions installed
      </h2>
      <ul className="mt-3 space-y-2">
        {(data?.releases ?? []).map((r) => (
          <li
            key={r.key}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-3 text-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-[var(--rq-ink)]">{r.key}</span>
              <Badge variant="muted">{r.status ?? "registered"}</Badge>
            </div>
            <p className="mt-1 text-[var(--rq-muted)]">
              Built on {r.predecessor}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Pilot groups
      </h2>
      <ul className="mt-3 space-y-3">
        {(data?.cohorts ?? []).map((c) => (
          <li
            key={c.key}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-medium text-[var(--rq-ink)]">{c.key}</span>
              <Badge variant={c.enabledForDemo ? "success" : "muted"}>
                {c.killSwitch
                  ? "turned off"
                  : c.enabledForDemo
                    ? "on"
                    : "off"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              Feature: {c.flagKey}
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await v12SetCohortKillSwitch({
                    cohortKey: c.key,
                    killSwitch: !c.killSwitch,
                  });
                  reload();
                })
              }
            >
              {c.killSwitch ? "Turn pilot back on" : "Turn pilot off now"}
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Recent credit use
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(data?.ledger ?? []).length === 0 ? (
          <li className="text-[var(--rq-muted)]">No ledger entries yet.</li>
        ) : (
          data!.ledger.map((e) => (
            <li
              key={e.id}
              className="rounded-md border border-[var(--rq-border)] px-3 py-2"
            >
              {e.entryType} {e.quantity} {e.unit} · {e.actionClass} · hash{" "}
              {e.immutableHash.slice(0, 12)}…
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
