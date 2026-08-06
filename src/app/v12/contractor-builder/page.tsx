"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { v12SaveContractor } from "@/lib/actions/v12";

export default function ContractorBuilderPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [hints, setHints] = useState<{
    capabilityCount: number;
    explanation: string;
  } | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Badge variant="muted">V13 Domain 10</Badge>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
        Contractor Builder
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Trades, licences, coverage and availability for service matching.
        Capability keys are derived for explainable shortlists.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const profile = await v12SaveContractor({
              companyId: "co-inspectpro",
              companyName: String(fd.get("companyName")),
              trades: String(fd.get("trades"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              licences: String(fd.get("licences"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              serviceRadiusKm: Number(fd.get("radius") || 100),
              emergencyAvailable: fd.get("emergency") === "on",
              rateSummary: String(fd.get("rates") || ""),
              notes: String(fd.get("notes") || ""),
              coverageRegions: String(fd.get("regions") || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              publish: true,
              actorId: "contractor-ui",
              idempotencyKey: `ctr-${Date.now()}`,
            });
            setHints(profile.matchHints ?? null);
            setMessage(
              `Contractor profile ${profile.id} published · request ${profile.requestId ?? "n/a"}.`,
            );
          });
        }}
      >
        <div>
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue="InspectPro Global"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="trades">Trades</Label>
          <Input
            id="trades"
            name="trades"
            defaultValue="FAT witnessing, Loading inspection, QC audit"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="licences">Licences</Label>
          <Input
            id="licences"
            name="licences"
            defaultValue="ISO 17020, Food safety auditor"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="regions">Coverage regions</Label>
          <Input
            id="regions"
            name="regions"
            defaultValue="Australia, ASEAN"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="radius">Service radius (km)</Label>
          <Input id="radius" name="radius" type="number" defaultValue={500} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="rates">Rate summary</Label>
          <Input id="rates" name="rates" defaultValue="Day rate from USD 850" className="mt-1" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="emergency" defaultChecked />
          Emergency available
        </label>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" className="mt-1" />
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {hints ? (
          <p className="text-xs text-[var(--rq-muted)]">
            {hints.explanation} · {hints.capabilityCount} capability keys
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Publish contractor profile"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/v12/matching">See matching</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
