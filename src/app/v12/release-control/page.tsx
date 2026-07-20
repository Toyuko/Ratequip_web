"use client";

import { useEffect, useState, useTransition } from "react";
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
      <Badge variant="orange">Release 4A · Features 141 / 143 / 145</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Release & entitlement control
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12.1 Part 4 — add-on release registry, cohort kill switches, and usage
        preview before chargeable URS analysis. App migrations{" "}
        <code className="text-xs">0030–0034</code> (canonical Part 4 was
        0024–0028).
      </p>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <h2 className="font-semibold text-[var(--rq-ink)]">Entitlement</h2>
        <p className="mt-2 text-sm text-[var(--rq-slate)]">
          Remaining:{" "}
          <strong>{data?.entitlementRemaining ?? "…"}</strong> credits
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const preview = await v12PreviewUrsUsage();
                setMessage(
                  `Preview ${preview.id}: ${preview.low}–${preview.high} ${preview.unit}` +
                    (preview.warnings.length
                      ? ` · warnings: ${preview.warnings.join(", ")}`
                      : ""),
                );
                reload();
              })
            }
          >
            Preview URS analysis usage
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
                      ? `Confirmed preview ${res.preview.id}`
                      : res.message,
                  );
                  reload();
                })
              }
            >
              Confirm latest preview
            </Button>
          ) : null}
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Registered releases
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
              predecessor {r.predecessor} · migrations {r.minMigration}–
              {r.maxMigration}
            </p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Cohorts
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
                  ? "killed"
                  : c.enabledForDemo
                    ? "enabled"
                    : "off"}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              flag {c.flagKey} · {c.percentage}% · members {c.memberCount}
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
              {c.killSwitch ? "Clear kill switch" : "Engage kill switch"}
            </Button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Usage ledger
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
