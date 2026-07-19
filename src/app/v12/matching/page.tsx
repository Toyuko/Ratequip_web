"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v12RunMatch } from "@/lib/actions/v12";

type MatchResult = {
  id: string;
  rank: number;
  organicScore: number;
  reasonCodes: string[];
  category: string;
  sponsored: boolean;
  policyVersion?: string;
};

export default function MatchingPage() {
  const [pending, startTransition] = useTransition();
  const [results, setResults] = useState<MatchResult[]>([]);
  const [meta, setMeta] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Explainable Matching Engine
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 11 — eligibility first, then weighted scoring with stored
        reason codes (ADR-0006). Sponsorship cannot bypass the organic floor.
      </p>
      <form
        className="mt-8 grid gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 sm:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const run = await v12RunMatch({
              requirementLabel: String(fd.get("label")),
              requiredCategory: String(fd.get("category") || "") || undefined,
              region: String(fd.get("region") || "") || undefined,
            });
            setResults(run.results as MatchResult[]);
            setMeta(
              `Run ${run.id} · ${run.results.length} ranked · policy ${run.results[0]?.policyVersion ?? "v12"}`,
            );
          });
        }}
      >
        <div className="sm:col-span-3">
          <Label htmlFor="label">Requirement</Label>
          <Input
            id="label"
            name="label"
            defaultValue="rotary filler packaging"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category slug</Label>
          <Input
            id="category"
            name="category"
            defaultValue="packaging-machinery"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="region">Region hint</Label>
          <Input id="region" name="region" defaultValue="Thailand" className="mt-1" />
        </div>
        <div className="flex items-end">
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Scoring…" : "Run match"}
          </Button>
        </div>
      </form>
      {meta ? <p className="mt-4 text-sm text-[var(--rq-muted)]">{meta}</p> : null}
      <ol className="mt-6 space-y-3">
        {results.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs text-[var(--rq-muted)]">#{r.rank}</span>{" "}
                <Link
                  href={`/suppliers/${r.id}`}
                  className="font-semibold text-[var(--rq-ink)] hover:text-orange-600"
                >
                  {r.id}
                </Link>
              </div>
              <Badge variant="orange">{r.organicScore.toFixed(1)}</Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.reasonCodes.map((code) => (
                <Badge key={code} variant="muted">
                  {code}
                </Badge>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
