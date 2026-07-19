"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v12AwardRfq, v12CreateRevision } from "@/lib/actions/v12";
import { demoQuotes, demoRequests } from "@/lib/db/demo-data";

export default function V12RfqPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [revisionInfo, setRevisionInfo] = useState<string | null>(null);
  const rfq = demoRequests[0];
  const quotes = demoQuotes.filter((q) => q.requestId === rfq.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">RFQ Platform</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 15 / ADR-0012 — immutable commercial revisions, comparison
        and award with reason codes.
      </p>

      <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
            {rfq.title}
          </h2>
          <Badge variant="success">{rfq.status}</Badge>
        </div>
        <p className="mt-2 text-sm text-[var(--rq-slate)]">{rfq.description}</p>
        <Button asChild variant="outline" size="sm" className="mt-4">
          <Link href={`/requests/${rfq.id}`}>Open classic RFQ view</Link>
        </Button>
      </div>

      <form
        className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const rev = await v12CreateRevision({
              rfqId: rfq.id,
              createdBy: "buyer@demo.ratequip.com",
              payload: {
                title: rfq.title,
                clarification: String(fd.get("clarification")),
                dueDate: String(fd.get("dueDate")),
              },
            });
            setRevisionInfo(
              `Revision r${rev.revision} stored · content hash ${rev.contentHash}`,
            );
            setMessage("Immutable RFQ revision recorded.");
          });
        }}
      >
        <h3 className="font-semibold text-[var(--rq-ink)]">
          Create immutable revision
        </h3>
        <div>
          <Label htmlFor="clarification">Clarification / change note</Label>
          <Input
            id="clarification"
            name="clarification"
            required
            className="mt-1"
            placeholder="Add CIP documentation requirement"
          />
        </div>
        <div>
          <Label htmlFor="dueDate">Quote due date</Label>
          <Input id="dueDate" name="dueDate" type="date" className="mt-1" />
        </div>
        <Button type="submit" disabled={pending}>
          Save revision
        </Button>
        {revisionInfo ? (
          <p className="text-sm text-[var(--rq-muted)]">{revisionInfo}</p>
        ) : null}
      </form>

      <section className="mt-10">
        <h3 className="font-semibold text-[var(--rq-ink)]">Compare & award</h3>
        <ul className="mt-4 space-y-3">
          {quotes.map((q) => (
            <li
              key={q.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div>
                <div className="font-medium text-[var(--rq-ink)]">
                  {q.companyName}
                </div>
                <div className="text-sm text-[var(--rq-muted)]">
                  {q.currency} {q.amount.toLocaleString()} · {q.leadTimeDays} days
                </div>
              </div>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const award = await v12AwardRfq({
                      rfqId: rfq.id,
                      quoteId: q.id,
                      supplierSlug: q.companySlug,
                      amount: q.amount,
                      currency: q.currency,
                      reasonCodes: [
                        "commercial_fit",
                        "capability_coverage",
                        "lead_time_acceptable",
                      ],
                      awardedBy: "buyer@demo.ratequip.com",
                    });
                    setMessage(
                      `Awarded ${award.id} to ${award.supplierSlug} with reasons: ${award.reasonCodes.join(", ")}`,
                    );
                  })
                }
              >
                Award
              </Button>
            </li>
          ))}
        </ul>
      </section>
      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
