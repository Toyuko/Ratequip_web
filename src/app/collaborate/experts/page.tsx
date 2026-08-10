"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const OFFERING_TYPES = [
  "DIAGNOSTIC_15",
  "CONSULT_60",
  "LIVE_TROUBLESHOOT",
  "DOCUMENT_REVIEW",
  "REVIEW_PLC",
  "SPEC_ADVICE",
] as const;

export default function ExpertsPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Expert</Badge>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
        Publish a session offering
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Creates your Party (if needed), a remote-support capability, and a
        priced SessionOffering. Certification-implying offerings require T3+.
      </p>

      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            // 1. Create expert party
            const partyRes = await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create_party",
                kind: "INDIVIDUAL",
                legalName: String(fd.get("legalName")),
                jurisdiction: String(fd.get("jurisdiction") || "AU"),
                contactEmail: String(fd.get("email")),
                timezone: String(fd.get("timezone") || "Australia/Brisbane"),
              }),
            });
            const partyData = await partyRes.json();
            if (!partyData.ok) {
              setMessage(partyData.error);
              return;
            }
            const expertPartyId = partyData.party.partyId as string;

            // Also create a buyer demo party for booking flows
            await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create_party",
                kind: "ORGANISATION",
                legalName: "Demo Buyer Co",
                jurisdiction: "AU",
                contactEmail: "buyer@example.com",
                timezone: "Australia/Brisbane",
              }),
            });

            await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "add_capability",
                partyId: expertPartyId,
                kind: "SKILL",
                taxonomyIdOrLabel: "skill.support.remote_diagnostic",
                level: 4,
              }),
            });

            const priceMajor = Number(fd.get("price"));
            const offRes = await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "create_offering",
                expertPartyId,
                type: String(fd.get("type")),
                title: String(fd.get("title")),
                description: String(fd.get("description") || ""),
                priceMinor: Math.round(priceMajor * 100),
                currency: String(fd.get("currency") || "AUD"),
                durationMinutes: Number(fd.get("duration") || 60),
                supportedMachineBrands: String(fd.get("brands") || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
                deliverableDefinition: String(
                  fd.get("deliverable") ||
                    "Structured session record with findings, recommendations and next steps",
                ),
              }),
            });
            const offData = await offRes.json();
            if (!offData.ok) {
              setMessage(offData.error);
              return;
            }
            setMessage("Offering published.");
            router.push("/collaborate/sessions");
          });
        }}
      >
        <div>
          <Label htmlFor="legalName">Your legal name</Label>
          <Input id="legalName" name="legalName" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="email">Contact email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Input
              id="jurisdiction"
              name="jurisdiction"
              defaultValue="AU"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              name="timezone"
              defaultValue="Australia/Brisbane"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="title">Offering title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Siemens S7 remote diagnostic"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="mt-1 w-full rounded-md border border-[var(--rq-border)] bg-background px-3 py-2"
            defaultValue="CONSULT_60"
          >
            {OFFERING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" className="mt-1" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Label htmlFor="price">Price (major units)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min={1}
              step="0.01"
              defaultValue={250}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              name="currency"
              defaultValue="AUD"
              className="mt-1"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            defaultValue={60}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="brands">Machine brands (comma-separated)</Label>
          <Input
            id="brands"
            name="brands"
            placeholder="Siemens, Allen-Bradley"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="deliverable">Deliverable definition</Label>
          <Textarea
            id="deliverable"
            name="deliverable"
            defaultValue="Structured session record with findings, recommendations and next steps"
            className="mt-1"
          />
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Publishing…" : "Publish offering"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/collaborate/sessions">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
