"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { v12SaveOpportunity } from "@/lib/actions/v12";

export default function OpportunityBuilderPage() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Opportunity Builder
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 09 — capture supplier target industries, regions and
        commercial preferences for explainable matching.
      </p>
      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const profile = await v12SaveOpportunity({
              companyId: "co-nordic-fill",
              companyName: String(fd.get("companyName")),
              targetIndustries: String(fd.get("industries"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              targetRegions: String(fd.get("regions"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              projectValueMin: Number(fd.get("min") || 0),
              projectValueMax: Number(fd.get("max") || 0),
              preferredRequirementTypes: ["equipment", "turnkey"],
              notes: String(fd.get("notes") || ""),
              publish: true,
            });
            setMessage(
              `Opportunity profile ${profile.id} published for ${profile.companyName}.`,
            );
          });
        }}
      >
        <div>
          <Label htmlFor="companyName">Company</Label>
          <Input
            id="companyName"
            name="companyName"
            defaultValue="NordicFill Systems"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="industries">Target industries (comma-separated)</Label>
          <Input
            id="industries"
            name="industries"
            defaultValue="Food Beverage, Packaging"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="regions">Target regions</Label>
          <Input
            id="regions"
            name="regions"
            defaultValue="ASEAN, Australia"
            className="mt-1"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="min">Project value min</Label>
            <Input id="min" name="min" type="number" defaultValue={50000} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="max">Project value max</Label>
            <Input id="max" name="max" type="number" defaultValue={500000} className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Private preferences</Label>
          <Textarea id="notes" name="notes" className="mt-1" />
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Publish opportunity profile"}
        </Button>
      </form>
    </div>
  );
}
