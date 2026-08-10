"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/collaborate/money";
import type { Money } from "@/lib/collaborate/types";

type Offering = {
  offeringId: string;
  expertPartyId: string;
  type: string;
  title: string;
  description: string;
  price: Money;
  durationMinutes: number;
  supportedMachineBrands: string[];
  deliverableDefinition: string;
};

type Party = {
  partyId: string;
  legalName: string;
};

export default function SessionsPage() {
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [buyerId, setBuyerId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function refresh() {
    const [o, p] = await Promise.all([
      fetch("/api/v1/collaborate?action=list_offerings").then((r) => r.json()),
      fetch("/api/v1/collaborate?action=list_parties").then((r) => r.json()),
    ]);
    if (o.ok) setOfferings(o.offerings);
    if (p.ok) {
      setParties(p.parties);
      if (!buyerId && p.parties[0]) setBuyerId(p.parties[0].partyId);
    }
  }

  useEffect(() => {
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function book(offering: Offering) {
    if (!buyerId) {
      setMessage("Create a Party first (via Publish an offering) or select one.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/v1/collaborate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `book-${offering.offeringId}-${Date.now()}`,
        },
        body: JSON.stringify({
          action: "create_engagement",
          mode: "SESSION",
          title: offering.title,
          buyerPartyId: buyerId,
          actingAsPartyId: buyerId,
          offeringId: offering.offeringId,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMessage(data.error ?? "Booking failed");
        return;
      }
      const engId = data.engagement.engagementId as string;
      // Authorise (funds hold) immediately after book
      const t = await fetch("/api/v1/collaborate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": `auth-${engId}`,
        },
        body: JSON.stringify({
          action: "transition",
          engagementId: engId,
          toState: "BOOKED",
          actingAsPartyId: buyerId,
        }),
      });
      const td = await t.json();
      if (!td.ok) {
        setMessage(td.error ?? "Authorisation failed");
        return;
      }
      window.location.href = `/collaborate/engagements/${engId}`;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="orange">Session</Badge>
          <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
            Remote expert support
          </h1>
          <p className="mt-2 text-[var(--rq-slate)]">
            Every session produces a written deliverable. Fees are shown before
            you book.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/collaborate/experts">Publish offering</Link>
        </Button>
      </div>

      {parties.length > 0 ? (
        <label className="mt-6 block text-sm text-[var(--rq-slate)]">
          Acting as Party
          <select
            className="mt-1 w-full max-w-md rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2 text-[var(--rq-ink)]"
            value={buyerId}
            onChange={(e) => setBuyerId(e.target.value)}
          >
            {parties.map((p) => (
              <option key={p.partyId} value={p.partyId}>
                {p.legalName} ({p.partyId.slice(0, 12)})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="mt-6 text-sm text-amber-700">
          No parties yet.{" "}
          <Link className="underline" href="/collaborate/experts">
            Publish an expert offering
          </Link>{" "}
          to create demo parties, then return here to book.
        </p>
      )}

      {message ? (
        <p className="mt-4 text-sm text-amber-800">{message}</p>
      ) : null}

      <ul className="mt-8 space-y-4">
        {offerings.length === 0 ? (
          <li className="rounded-lg border border-dashed border-[var(--rq-border)] p-8 text-center text-[var(--rq-slate)]">
            No offerings yet. Experts can publish from the offering form.
          </li>
        ) : (
          offerings.map((o) => (
            <li
              key={o.offeringId}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
                      {o.title}
                    </h2>
                    <Badge variant="muted">{o.type}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--rq-slate)]">
                    {o.description || o.deliverableDefinition}
                  </p>
                  <p className="mt-2 text-sm text-[var(--rq-muted)]">
                    {o.durationMinutes} min
                    {o.supportedMachineBrands.length
                      ? ` · ${o.supportedMachineBrands.join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-[var(--rq-ink)]">
                    {formatMoney(o.price)}
                  </div>
                  <p className="text-xs text-[var(--rq-muted)]">
                    Fee disclosed at booking
                  </p>
                  <Button
                    className="mt-2"
                    size="sm"
                    disabled={pending || !buyerId}
                    onClick={() => book(o)}
                  >
                    {pending ? "Booking…" : "Book session"}
                  </Button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
