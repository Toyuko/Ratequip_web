"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { v12SearchTaxonomy } from "@/lib/actions/v12";

type Node = {
  stable_key: string;
  preferred_label: string;
  node_type: string;
  parent_stable_key?: string;
};

export default function TaxonomyPage() {
  const [q, setQ] = useState("food");
  const [results, setResults] = useState<Node[]>([]);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Universal Industrial Taxonomy
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 05 — stable keys, versioned labels, multilingual-ready
        industrial concepts.
      </p>
      <form
        className="mt-8 flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const rows = await v12SearchTaxonomy(q);
            setResults(rows as Node[]);
          });
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search taxonomy…"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Searching…" : "Search"}
        </Button>
      </form>
      <ul className="mt-6 space-y-2">
        {results.map((n) => (
          <li
            key={n.stable_key}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3"
          >
            <div className="font-medium text-[var(--rq-ink)]">
              {n.preferred_label}
            </div>
            <div className="text-xs text-[var(--rq-muted)]">
              {n.node_type} · {n.stable_key}
              {n.parent_stable_key ? ` · parent ${n.parent_stable_key}` : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
