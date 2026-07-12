"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuote } from "@/lib/actions/marketplace";

function QuoteForm() {
  const params = useSearchParams();
  const requestId = params.get("request") ?? "req-1";
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="max-w-xl space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await submitQuote({
            requestId,
            amount: Number(fd.get("amount")),
            leadTimeDays: Number(fd.get("leadTime")),
            notes: String(fd.get("notes") ?? ""),
          });
          setMessage(result.message);
        });
      }}
    >
      <p className="text-sm text-[var(--rq-muted)]">RFQ: {requestId}</p>
      <div>
        <Label htmlFor="amount">Quote amount (USD)</Label>
        <Input id="amount" name="amount" type="number" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="leadTime">Lead time (days)</Label>
        <Input
          id="leadTime"
          name="leadTime"
          type="number"
          required
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" className="mt-1" />
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit quote"}
      </Button>
    </form>
  );
}

export default function SupplierQuotesPage() {
  return (
    <DashboardShell role="supplier" title="Quote builder">
      <Suspense fallback={<p>Loading…</p>}>
        <QuoteForm />
      </Suspense>
    </DashboardShell>
  );
}
