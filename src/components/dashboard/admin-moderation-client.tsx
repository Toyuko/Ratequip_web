"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { moderateEntity } from "@/lib/actions/admin";
import { updateInviteRewardConfig } from "@/lib/actions/referrals";
import type { DemoClaim, DemoReview } from "@/lib/db/demo-data";
import type { RuntimeAudit } from "@/lib/db/runtime-store";
import type { InviteRewardSettings } from "@/lib/referrals/invite-rewards";

export function AdminModerationClient({
  initialReviews,
  initialClaims,
  initialAudit,
  initialInviteRewards,
}: {
  initialReviews: DemoReview[];
  initialClaims: DemoClaim[];
  initialAudit: RuntimeAudit[];
  initialInviteRewards: InviteRewardSettings;
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [claims] = useState(initialClaims);
  const [audit, setAudit] = useState(initialAudit);
  const [welcomeCredits, setWelcomeCredits] = useState(
    String(initialInviteRewards.welcomeCredits),
  );
  const [inviterRewardCredits, setInviterRewardCredits] = useState(
    String(initialInviteRewards.inviterRewardCredits),
  );
  const [foundingMemberEnabled, setFoundingMemberEnabled] = useState(
    initialInviteRewards.foundingMemberEnabled,
  );
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function afterModerate(entityId: string, message: string) {
    setNote(message);
    setReviews((prev) => prev.filter((r) => r.id !== entityId));
    setAudit((prev) => [
      {
        id: `aud-local-${Date.now()}`,
        action: "review.moderated",
        entityType: "review",
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
        <Stat label="Claim conflicts" value={String(claims.length)} />
        <Stat label="Audit events" value={String(audit.length)} />
      </div>

      <section className="mt-10 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
        <h2 className="font-semibold text-[var(--rq-ink)]">
          Progressive invite rewards
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-slate)]">
          Unlimited invites. Primary knobs set the <em>profile claimed</em>{" "}
          stage (locked onto each invite at send). Full ladder releases on
          verified events only — override env (
          <code className="text-xs">INVITE_WELCOME_CREDITS</code>).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="welcome-credits">
              Invitee credits (on claim verified)
            </Label>
            <Input
              id="welcome-credits"
              type="number"
              min={0}
              className="mt-1"
              value={welcomeCredits}
              onChange={(e) => setWelcomeCredits(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="inviter-credits">
              Inviter credits (on claim verified)
            </Label>
            <Input
              id="inviter-credits"
              type="number"
              min={0}
              className="mt-1"
              value={inviterRewardCredits}
              onChange={(e) => setInviterRewardCredits(e.target.value)}
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-[var(--rq-ink)]">
              <input
                type="checkbox"
                checked={foundingMemberEnabled}
                onChange={(e) => setFoundingMemberEnabled(e.target.checked)}
              />
              Founding Member badge
            </label>
          </div>
        </div>
        <ul className="mt-4 space-y-1 text-xs text-[var(--rq-muted)]">
          {initialInviteRewards.ladder.map((stage) => (
            <li key={stage.event}>
              {stage.label}: invitee {stage.inviteeCredits} · inviter{" "}
              {stage.inviterCredits}
            </li>
          ))}
        </ul>
        <Button
          className="mt-4"
          size="sm"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await updateInviteRewardConfig({
                welcomeCredits: Number(welcomeCredits),
                inviterRewardCredits: Number(inviterRewardCredits),
                foundingMemberEnabled,
              });
              setNote(res.message);
              if (res.ok) router.refresh();
            })
          }
        >
          Save invite rewards
        </Button>
      </section>

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
                      if (res.ok) afterModerate(r.id, res.message);
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
                      if (res.ok) afterModerate(r.id, res.message);
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
        <h2 className="font-semibold text-[var(--rq-ink)]">
          Claim conflicts / audit
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-slate)]">
          Claims are decided automatically. This panel lists{" "}
          <code className="text-xs">blocked_conflict</code> outcomes for audit
          only — there is no Approve/Reject staffing queue.
        </p>
        <ul className="mt-3 space-y-3">
          {claims.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-medium text-[var(--rq-ink)]">
                  {c.companyName}
                </div>
                <Badge variant="warning">{c.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-[var(--rq-muted)]">
                {c.claimant}
                {c.method ? ` · ${c.method}` : ""}
                {c.relationship ? ` · ${c.relationship}` : ""}
              </p>
              <p className="mt-2 text-sm text-[var(--rq-slate)]">{c.notes}</p>
              {c.verificationPayload?.riskFlags ? (
                <p className="mt-2 text-xs text-[var(--rq-muted)]">
                  Risk flags:{" "}
                  {Array.isArray(c.verificationPayload.riskFlags)
                    ? c.verificationPayload.riskFlags.join(", ")
                    : String(c.verificationPayload.riskFlags)}
                </p>
              ) : null}
            </li>
          ))}
          {claims.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">
              No blocked conflicts.
            </p>
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
