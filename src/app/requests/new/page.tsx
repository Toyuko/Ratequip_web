"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRequest } from "@/lib/actions/marketplace";

function NewRequestForm() {
  const params = useSearchParams();
  const supplier = params.get("supplier");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-8 max-w-2xl space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await createRequest({
            title: String(fd.get("title")),
            description: String(fd.get("description")),
            budgetMin: Number(fd.get("budgetMin")),
            budgetMax: Number(fd.get("budgetMax")),
            deliveryCountry: String(fd.get("deliveryCountry")),
          });
          setMessage(result.message);
          if (result.ok && result.id) {
            router.push(`/requests/${result.id}`);
          }
        });
      }}
    >
      {supplier ? (
        <p className="text-sm text-[var(--rq-muted)]">
          Prefilling invite for supplier: {supplier}
        </p>
      ) : null}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required className="mt-1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="budgetMin">Budget min (USD)</Label>
          <Input
            id="budgetMin"
            name="budgetMin"
            type="number"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="budgetMax">Budget max (USD)</Label>
          <Input
            id="budgetMax"
            name="budgetMax"
            type="number"
            required
            className="mt-1"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="deliveryCountry">Delivery country</Label>
        <Input id="deliveryCountry" name="deliveryCountry" required className="mt-1" />
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting…" : "Post RFQ"}
      </Button>
    </form>
  );
}

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Post an RFQ</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Describe your equipment or service need. Suppliers receive lead
        notifications; credits are reserved per unlock.
      </p>
      <Suspense>
        <NewRequestForm />
      </Suspense>
    </div>
  );
}
