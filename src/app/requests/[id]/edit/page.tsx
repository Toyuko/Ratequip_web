"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { reviseRequest } from "@/lib/actions/marketplace";

export default function EditRequestPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    currency: "USD",
    deliveryCountry: "",
    deliveryCity: "",
    deliveryAddress: "",
    dueDate: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/v1/requests/${params.id}`);
        const json = await res.json();
        const request = json?.data?.request ?? json?.request;
        if (!cancelled && request) {
          setForm({
            title: request.title ?? "",
            description: request.description ?? "",
            budgetMin: String(request.budgetMin ?? ""),
            budgetMax: String(request.budgetMax ?? ""),
            currency: request.currency ?? "USD",
            deliveryCountry: request.deliveryCountry ?? "",
            deliveryCity: request.deliveryCity ?? "",
            deliveryAddress: request.deliveryAddress ?? "",
            dueDate: request.dueDate ?? "",
          });
        }
      } catch {
        if (!cancelled) setError("Unable to load RFQ.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-[var(--rq-muted)]">
        Loading RFQ…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--rq-ink)]">Edit / revise RFQ</h1>
      <p className="mt-2 text-sm text-[var(--rq-slate)]">
        Update an open request. Changes are audited and remain visible to invited
        suppliers.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const result = await reviseRequest({
              requestId: params.id,
              title: form.title,
              description: form.description,
              budgetMin: Number(form.budgetMin),
              budgetMax: Number(form.budgetMax),
              currency: form.currency,
              deliveryCountry: form.deliveryCountry,
              deliveryCity: form.deliveryCity,
              deliveryAddress: form.deliveryAddress,
              dueDate: form.dueDate,
            });
            if (!result.ok) {
              setError(result.message);
              return;
            }
            router.push(`/requests/${params.id}`);
            router.refresh();
          });
        }}
      >
        <div>
          <Label>Title</Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            minLength={8}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            className="mt-1"
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            required
            minLength={40}
            rows={5}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <Label>Budget min</Label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.budgetMin}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMin: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Budget max</Label>
            <Input
              className="mt-1"
              type="number"
              min={0}
              value={form.budgetMax}
              onChange={(e) =>
                setForm((f) => ({ ...f, budgetMax: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Currency</Label>
            <Input
              className="mt-1"
              value={form.currency}
              onChange={(e) =>
                setForm((f) => ({ ...f, currency: e.target.value }))
              }
              required
            />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Delivery country</Label>
            <Input
              className="mt-1"
              value={form.deliveryCountry}
              onChange={(e) =>
                setForm((f) => ({ ...f, deliveryCountry: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label>Delivery city</Label>
            <Input
              className="mt-1"
              value={form.deliveryCity}
              onChange={(e) =>
                setForm((f) => ({ ...f, deliveryCity: e.target.value }))
              }
            />
          </div>
        </div>
        <div>
          <Label>Delivery address</Label>
          <Input
            className="mt-1"
            value={form.deliveryAddress}
            onChange={(e) =>
              setForm((f) => ({ ...f, deliveryAddress: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Closing date</Label>
          <Input
            className="mt-1"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save revision"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/requests/${params.id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
