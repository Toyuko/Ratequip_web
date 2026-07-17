"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { moderateEntity } from "@/lib/actions/admin";
import type { DemoClaim, DemoReview } from "@/lib/db/demo-data";
import type { RuntimeAudit } from "@/lib/db/runtime-store";

export function AdminModerationClient({
  initialReviews,
  initialClaims,
  initialAudit,
}: {
  initialReviews: DemoReview[];
  initialClaims: DemoClaim[];
  initialAudit: RuntimeAudit[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [claims, setClaims] = useState(initialClaims);
  const [audit, setAudit] = useState(initialAudit);
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function afterModerate(
    entityType: "review" | "claim",
    entityId: string,
    message: string,
  ) {
    setNote(message);
    if (entityType === "review") {
      setReviews((prev) => prev.filter((r) => r.id !== entityId));
    } else {
      setClaims((prev) => prev.filter((c) => c.id !== entityId));
    }
    setAudit((prev) => [
      {
        id: `aud-local-${Date.now()}`,
        action: `${entityType}.moderated`,
        entityType,
        actor: "admin",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    router.refresh();
  }

  return (
    <>
      {note ? <p className="mb-4 text-sm text-emerald-700">{note}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pending reviews" value={String(reviews.length)} />
        <Stat label="Pending claims" value={String(claims.length)} />
        <Stat label="Audit events" value={String(audit.length)} />
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">Review queue</h2>
        <ul className="mt-3 space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-[var(--rq-ink)]">
                    {r.title}
                  </div>
                  <div className="text-sm text-[var(--rq-muted)]">
                    {r.companySlug} · {r.rating}/5
                  </div>
                </div>
                <Badge variant="warning">pending</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--rq-slate)]">{r.body}</p>
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
                      if (res.ok) afterModerate("review", r.id, res.message);
                      else setNote(res.message);
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
                      if (res.ok) afterModerate("review", r.id, res.message);
                      else setNote(res.message);
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
          {reviews.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">Queue clear.</p>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">Company claims</h2>
        <ul className="mt-3 space-y-3">
          {claims.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="font-medium text-[var(--rq-ink)]">
                {c.companyName}
              </div>
              <p className="text-sm text-[var(--rq-muted)]">
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
                      if (res.ok) afterModerate("claim", c.id, res.message);
                      else setNote(res.message);
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
                      if (res.ok) afterModerate("claim", c.id, res.message);
                      else setNote(res.message);
                    })
                  }
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
          {claims.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">No pending claims.</p>
          ) : null}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">Audit log</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {audit.slice(0, 20).map((a) => (
            <li
              key={a.id}
              className="flex justify-between rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2"
            >
              <span>
                {a.action} · {a.actor}
              </span>
              <span className="text-[var(--rq-muted)]">
                {new Date(a.createdAt).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[var(--rq-ink)]">{value}</div>
    </div>
  );
}
