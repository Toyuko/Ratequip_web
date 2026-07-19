"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/rfq/line-companions";
import type { ProjectCompanionResult } from "@/lib/rfq/project-companion";
import { formatCurrency } from "@/lib/utils";

export function RfqProjectCompanion({
  requestId,
  seedPrompt,
}: {
  requestId?: string;
  /** Optional pasted text when used on create page */
  seedPrompt?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ProjectCompanionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function run() {
    startTransition(async () => {
      setError(null);
      try {
        const res = await fetch("/api/rfq/project-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestId,
            prompt: seedPrompt,
          }),
        });
        const data = (await res.json()) as ProjectCompanionResult & {
          ok?: boolean;
          message?: string;
        };
        if (!res.ok || data.ok === false) {
          setError(data.message ?? "Unable to analyse this RFQ.");
          setResult(null);
          return;
        }
        setResult(data);
      } catch {
        setError("Project assist request failed.");
      }
    });
  }

  return (
    <section className="mt-10 rounded-lg border border-orange-200 bg-orange-50/50 p-5 dark:border-orange-900/40 dark:bg-orange-950/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">
            Project companion agent
          </h2>
          <p className="mt-1 text-sm text-[var(--rq-slate)]">
            Reads this URS/RFQ, maps the full production line (even add-ons not
            in the original document), and recommends marketplace suppliers with
            indicative compare prices — from materials through processing,
            filling, capping, labelling, and end-of-line.
          </p>
        </div>
        <Button type="button" onClick={run} disabled={pending}>
          {pending
            ? "Mapping project…"
            : result
              ? "Refresh recommendations"
              : "Analyse project & recommend suppliers"}
        </Button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {result ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="orange">{result.projectType}</Badge>
              <Badge variant="muted">
                Focus: {result.primaryFocus}
              </Badge>
              <Badge variant="muted">
                {result.source === "ai" ? "AI map" : "Rules map"}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[var(--rq-slate)]">
              {result.summary}
            </p>
            <p className="mt-2 text-xs text-[var(--rq-muted)]">
              Indicative prices are for compare shopping only — not binding
              quotes. Post a child RFQ to collect formal offers.
            </p>
          </div>

          <div className="space-y-5">
            {result.needs.map((need) => (
              <div
                key={need.id}
                className="overflow-hidden rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--rq-border)] bg-[var(--rq-surface)] px-4 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-[var(--rq-ink)]">
                        {need.label}
                      </h3>
                      <Badge variant="muted">{roleLabel(need.role)}</Badge>
                      {need.inOriginalRfq ? (
                        <Badge variant="success">In this RFQ</Badge>
                      ) : (
                        <Badge variant="orange">Suggested add-on</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--rq-slate)]">
                      {need.why}
                    </p>
                    {need.budgetMin != null && need.budgetMax != null ? (
                      <p className="mt-1 text-xs text-[var(--rq-muted)]">
                        Indicative band{" "}
                        {formatCurrency(need.budgetMin, result.currency)} –{" "}
                        {formatCurrency(need.budgetMax, result.currency)}
                      </p>
                    ) : null}
                  </div>
                  {!need.inOriginalRfq ? (
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/requests/new?title=${encodeURIComponent(need.label)}&description=${encodeURIComponent(
                          `${need.why}\n\nSuggested from parent RFQ${requestId ? ` ${requestId}` : ""}.`,
                        )}`}
                      >
                        Post RFQ for this
                      </Link>
                    </Button>
                  ) : null}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                      <tr>
                        <th className="px-4 py-2">Supplier</th>
                        <th className="px-4 py-2">Location</th>
                        <th className="px-4 py-2">Trust</th>
                        <th className="px-4 py-2">Indicative price</th>
                        <th className="px-4 py-2">Why matched</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {need.suppliers.map((s) => (
                        <tr
                          key={`${need.id}-${s.companySlug}`}
                          className="border-t border-[var(--rq-border)]"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/companies/${s.companySlug}`}
                              className="font-medium text-[var(--rq-ink)] hover:text-orange-600"
                            >
                              {s.companyName}
                            </Link>
                            <p className="text-xs text-[var(--rq-muted)]">
                              {s.headline}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-[var(--rq-slate)]">
                            {[s.city, s.country].filter(Boolean).join(", ")}
                          </td>
                          <td className="px-4 py-3">
                            {s.trustScore.toFixed(0)}
                            {s.verified ? (
                              <span className="ml-1 text-xs text-emerald-700">
                                verified
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 font-semibold text-orange-600">
                            {formatCurrency(s.indicativePrice, s.currency)}
                          </td>
                          <td className="px-4 py-3 text-[var(--rq-slate)]">
                            {s.reason}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/requests/new?supplier=${s.companySlug}&title=${encodeURIComponent(
                                need.label,
                              )}`}
                              className="text-xs font-medium text-orange-600 hover:underline"
                            >
                              Invite quote
                            </Link>
                          </td>
                        </tr>
                      ))}
                      {need.suppliers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-3 text-sm text-[var(--rq-muted)]"
                          >
                            No marketplace suppliers matched yet — broaden
                            category tags or post an open RFQ.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
