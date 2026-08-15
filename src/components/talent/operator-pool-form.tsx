"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CREDENTIAL_LABELS, CREDENTIAL_TYPES } from "@/lib/talent/taxonomy";
import { PRIVACY_NOTICE_VERSION } from "@/lib/talent/types";

type OperatorPayload = {
  operator: {
    partyId: string;
    legalName: string;
    primaryEmailNorm: string;
    primaryPhoneE164?: string;
    poolConsentAt?: string;
  };
  credentials: {
    id: string;
    credentialType: string;
    identifier?: string;
    expiresAt?: string;
    status: string;
  }[];
  availability: { id: string; windowStart: string; windowEnd: string; radiusKm: number }[];
};

export function OperatorPoolForm() {
  const [pending, start] = useTransition();
  const [partyId, setPartyId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<OperatorPayload | null>(null);

  useEffect(() => {
    if (!partyId) return;
    fetch(`/api/v1/talent?action=get_operator&partyId=${encodeURIComponent(partyId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setProfile(d);
      })
      .catch(() => undefined);
  }, [partyId]);

  return (
    <div className="space-y-8">
      <form
        className="space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          start(async () => {
            setMessage(null);
            const res = await fetch("/api/v1/talent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "upsert_operator",
                legalName: form.get("legalName"),
                email: form.get("email"),
                phone: form.get("phone"),
                poolConsent: form.get("poolConsent") === "on",
                rightToWork: form.get("rightToWork") === "on",
              }),
            });
            const data = await res.json();
            setError(!data.ok);
            if (data.ok) {
              setPartyId(data.operator.partyId);
              setMessage(
                data.merged
                  ? `Matched existing operator (${data.rule}).`
                  : "Operator profile saved to the RateQuip pool.",
              );
            } else {
              setMessage(data.error ?? "Could not save profile.");
            }
          });
        }}
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
            Operator profile
          </h2>
          <p className="mt-1 text-sm text-[var(--rq-slate)]">
            Applications from Indeed land here. Direct signup uses the same
            identity rules.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="legalName">Full name</Label>
            <Input id="legalName" name="legalName" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="phone">Mobile</Label>
            <Input id="phone" name="phone" className="mt-1" placeholder="04xx xxx xxx" />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-[var(--rq-ink)]">
          <input type="checkbox" name="rightToWork" className="mt-1" />
          I have a current right to work in Australia / New Zealand.
        </label>
        <label className="flex items-start gap-2 text-sm text-[var(--rq-ink)]">
          <input type="checkbox" name="poolConsent" required className="mt-1" />
          I have read the{" "}
          <Link href="/legal/operator-pool-notice" className="text-orange-600 underline">
            operator pool notice
          </Link>{" "}
          ({PRIVACY_NOTICE_VERSION}) and consent to RateQuip retaining my
          details for placement with rental customers.
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Join operator pool"}
        </Button>
        {message ? (
          <p className={error ? "text-sm text-red-600" : "text-sm text-[var(--rq-slate)]"}>
            {message}
          </p>
        ) : null}
      </form>

      {partyId ? (
        <form
          className="space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            start(async () => {
              await fetch("/api/v1/talent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "add_credential",
                  partyId,
                  credentialType: form.get("credentialType"),
                  identifier: form.get("identifier"),
                  issuingJurisdiction: form.get("jurisdiction") || "AU-NSW",
                  expiresAt: form.get("expiresAt")
                    ? new Date(String(form.get("expiresAt"))).toISOString()
                    : undefined,
                }),
              });
              const d = await fetch(
                `/api/v1/talent?action=get_operator&partyId=${encodeURIComponent(partyId)}`,
              ).then((r) => r.json());
              if (d.ok) setProfile(d);
            });
          }}
        >
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">Tickets</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="credentialType">Credential</Label>
              <select
                id="credentialType"
                name="credentialType"
                className="mt-1 flex h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
              >
                {CREDENTIAL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CREDENTIAL_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="identifier">Licence number</Label>
              <Input id="identifier" name="identifier" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="jurisdiction">Jurisdiction</Label>
              <Input id="jurisdiction" name="jurisdiction" defaultValue="AU-NSW" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="expiresAt">Expires</Label>
              <Input id="expiresAt" name="expiresAt" type="date" className="mt-1" />
            </div>
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            Add ticket
          </Button>
          {profile?.credentials.length ? (
            <ul className="space-y-2 text-sm">
              {profile.credentials.map((c) => (
                <li key={c.id} className="flex justify-between gap-3">
                  <span>
                    {CREDENTIAL_LABELS[c.credentialType] ?? c.credentialType}
                    {c.identifier ? ` · ${c.identifier}` : ""}
                  </span>
                  <Badge variant={c.status === "ACTIVE" ? "success" : "warning"}>
                    {c.status}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : null}
        </form>
      ) : null}

      {partyId ? (
        <form
          className="space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            start(async () => {
              await fetch("/api/v1/talent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "set_availability",
                  partyId,
                  windowStart: new Date(String(form.get("windowStart"))).toISOString(),
                  windowEnd: new Date(String(form.get("windowEnd"))).toISOString(),
                  radiusKm: Number(form.get("radiusKm") || 40),
                }),
              });
            });
          }}
        >
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
            Availability
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="windowStart">From</Label>
              <Input id="windowStart" name="windowStart" type="datetime-local" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="windowEnd">To</Label>
              <Input id="windowEnd" name="windowEnd" type="datetime-local" required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="radiusKm">Travel radius (km)</Label>
              <Input id="radiusKm" name="radiusKm" type="number" defaultValue="40" className="mt-1" />
            </div>
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            Save window
          </Button>
        </form>
      ) : null}
    </div>
  );
}
