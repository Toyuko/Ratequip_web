"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Party = { partyId: string; legalName: string; kind: string };

export default function NewJobPage() {
  const router = useRouter();
  const [parties, setParties] = useState<Party[]>([]);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/collaborate?action=list_parties")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setParties(d.parties);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Job</Badge>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">
        Post a paid job
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Creates a JOB engagement in DRAFT. Add a contributor and milestone, then
        walk the state machine through funding and acceptance.
      </p>

      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            let buyerPartyId = String(fd.get("buyerPartyId") || "");
            let contributorPartyId = String(fd.get("contributorPartyId") || "");

            if (!buyerPartyId) {
              const b = await fetch("/api/v1/collaborate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create_party",
                  kind: "ORGANISATION",
                  legalName: String(fd.get("buyerName") || "Buyer Org"),
                  jurisdiction: "AU",
                  contactEmail: "buyer-job@example.com",
                  timezone: "Australia/Brisbane",
                }),
              }).then((r) => r.json());
              if (!b.ok) {
                setMessage(b.error);
                return;
              }
              buyerPartyId = b.party.partyId;
            }

            if (!contributorPartyId) {
              const c = await fetch("/api/v1/collaborate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "create_party",
                  kind: "INDIVIDUAL",
                  legalName: String(fd.get("contributorName") || "Contributor"),
                  jurisdiction: "AU",
                  contactEmail: "contributor@example.com",
                  timezone: "Australia/Brisbane",
                }),
              }).then((r) => r.json());
              if (!c.ok) {
                setMessage(c.error);
                return;
              }
              contributorPartyId = c.party.partyId;
              await fetch("/api/v1/collaborate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "add_capability",
                  partyId: contributorPartyId,
                  kind: "SKILL",
                  taxonomyIdOrLabel: String(
                    fd.get("capability") || "skill.automation.plc.siemens_tia",
                  ),
                  level: 4,
                }),
              });
            }

            const engRes = await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Idempotency-Key": `job-${Date.now()}`,
              },
              body: JSON.stringify({
                action: "create_engagement",
                mode: "JOB",
                title: String(fd.get("title")),
                summary: String(fd.get("summary") || ""),
                buyerPartyId,
                actingAsPartyId: buyerPartyId,
                currency: "AUD",
                jurisdiction: "AU",
              }),
            }).then((r) => r.json());
            if (!engRes.ok) {
              setMessage(engRes.error);
              return;
            }
            const engId = engRes.engagement.engagementId as string;

            await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "add_requirement",
                engagementId: engId,
                actingAsPartyId: buyerPartyId,
                kind: "SKILL",
                taxonomyIdOrLabel: String(
                  fd.get("capability") || "skill.automation.plc.siemens_tia",
                ),
                necessity: "MANDATORY",
                rationale: "Required for scope delivery",
              }),
            });

            const actorRes = await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "add_contributor",
                engagementId: engId,
                partyId: contributorPartyId,
                actingAsPartyId: buyerPartyId,
              }),
            }).then((r) => r.json());

            const amountMajor = Number(fd.get("amount") || 5000);
            await fetch("/api/v1/collaborate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                action: "add_milestone",
                engagementId: engId,
                actingAsPartyId: buyerPartyId,
                title: String(fd.get("milestoneTitle") || "Delivery"),
                acceptanceCriteria: [
                  "Deliverable matches scope",
                  "Evidence attached",
                ],
                amountMinor: Math.round(amountMajor * 100),
                contributorActorId: actorRes.actor.actorId,
              }),
            });

            router.push(`/collaborate/engagements/${engId}`);
          });
        }}
      >
        <div>
          <Label htmlFor="title">Job title</Label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Extend Siemens S7 line program — Brisbane"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" className="mt-1" />
        </div>
        <div>
          <Label htmlFor="capability">Capability needed</Label>
          <Input
            id="capability"
            name="capability"
            defaultValue="skill.automation.plc.siemens_tia"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="amount">Milestone amount (AUD)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            defaultValue={5000}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="milestoneTitle">Milestone title</Label>
          <Input
            id="milestoneTitle"
            name="milestoneTitle"
            defaultValue="Program extension & FAT support"
            className="mt-1"
          />
        </div>

        {parties.length > 0 ? (
          <>
            <div>
              <Label htmlFor="buyerPartyId">Buyer Party (optional)</Label>
              <select
                id="buyerPartyId"
                name="buyerPartyId"
                className="mt-1 w-full rounded-md border border-[var(--rq-border)] bg-background px-3 py-2"
                defaultValue=""
              >
                <option value="">Create new buyer</option>
                {parties.map((p) => (
                  <option key={p.partyId} value={p.partyId}>
                    {p.legalName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="contributorPartyId">
                Contributor Party (optional)
              </Label>
              <select
                id="contributorPartyId"
                name="contributorPartyId"
                className="mt-1 w-full rounded-md border border-[var(--rq-border)] bg-background px-3 py-2"
                defaultValue=""
              >
                <option value="">Create new contributor</option>
                {parties.map((p) => (
                  <option key={p.partyId} value={p.partyId}>
                    {p.legalName}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <Label htmlFor="buyerName">Buyer name</Label>
              <Input
                id="buyerName"
                name="buyerName"
                defaultValue="Brisbane Foods Pty Ltd"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contributorName">Contributor name</Label>
              <Input
                id="contributorName"
                name="contributorName"
                defaultValue="Alex Controls"
                className="mt-1"
              />
            </div>
          </>
        )}

        {message ? <p className="text-sm text-amber-800">{message}</p> : null}
        <div className="flex gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create job"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/collaborate/jobs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
