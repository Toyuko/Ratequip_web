"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listRequests } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export default function RequestsPage() {
  const t = useT();
  const requests = listRequests();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
            {t.requests.title}
          </h1>
          <p className="mt-2 text-[var(--rq-slate)]">{t.requests.body}</p>
        </div>
        <Button asChild>
          <Link href="/requests/new">{t.requests.newRfq}</Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        {requests.map((r) => (
          <Link
            key={r.id}
            href={`/requests/${r.id}`}
            className="block rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 transition hover:border-orange-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
                {r.title}
              </h2>
              <Badge variant={r.status === "open" ? "success" : "muted"}>
                {r.status}
              </Badge>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-[var(--rq-slate)]">
              {r.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--rq-muted)]">
              <span>{r.deliveryCountry}</span>
              <span>
                {formatCurrency(r.budgetMin, r.currency)} –{" "}
                {formatCurrency(r.budgetMax, r.currency)}
              </span>
              <span>{r.quoteCount} quotes</span>
              <span>Posted {r.createdAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
