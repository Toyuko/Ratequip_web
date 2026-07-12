"use client";

import { useState, useTransition } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoAudit } from "@/lib/db/demo-data";
import { listPendingClaims, listPendingReviews } from "@/lib/db/queries";
import { moderateEntity } from "@/lib/actions/admin";

export default function AdminDashboardPage() {
  const pendingReviews = listPendingReviews();
  const pendingClaims = listPendingClaims();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  return (
    <DashboardShell role="admin" title="Admin moderation">
      {note ? <p className="mb-4 text-sm text-emerald-700">{note}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pending reviews" value={String(pendingReviews.length)} />
        <Stat label="Pending claims" value={String(pendingClaims.length)} />
        <Stat label="Audit events" value={String(demoAudit.length)} />
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-navy)]">Review queue</h2>
        <ul className="mt-3 space-y-3">
          {pendingReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[var(--rq-border)] bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-[var(--rq-navy)]">
                    {r.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {r.companySlug} · {r.rating}/5
                  </div>
                </div>
                <Badge variant="warning">pending</Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.body}</p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await moderateEntity({
                        entityType: "review",
                        entityId: r.id,
                        decision: "approved",
                      });
                      setNote(res.message);
                    })
                  }
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await moderateEntity({
                        entityType: "review",
                        entityId: r.id,
                        decision: "rejected",
                      });
                      setNote(res.message);
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
          {pendingReviews.length === 0 ? (
            <p className="text-sm text-slate-500">Queue clear.</p>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-navy)]">Company claims</h2>
        <ul className="mt-3 space-y-3">
          {pendingClaims.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-[var(--rq-border)] bg-white p-4"
            >
              <div className="font-medium text-[var(--rq-navy)]">
                {c.companyName}
              </div>
              <p className="text-sm text-slate-500">
                {c.claimant} · {c.notes}
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await moderateEntity({
                        entityType: "claim",
                        entityId: c.id,
                        decision: "approved",
                      });
                      setNote(res.message);
                    })
                  }
                >
                  Approve claim
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await moderateEntity({
                        entityType: "claim",
                        entityId: c.id,
                        decision: "rejected",
                      });
                      setNote(res.message);
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-navy)]">Audit log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {demoAudit.map((a) => (
            <li
              key={a.id}
              className="flex justify-between rounded-md border border-[var(--rq-border)] bg-white px-3 py-2"
            >
              <span>
                {a.action} · {a.actor}
              </span>
              <span className="text-slate-400">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rq-border)] bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[var(--rq-navy)]">{value}</div>
    </div>
  );
}
