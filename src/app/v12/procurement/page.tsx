"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  v12ApproveRequisition,
  v12CreateRequisition,
} from "@/lib/actions/v12";

type Requisition = {
  id: string;
  title: string;
  description: string;
  taxonomyKeys: string[];
  budgetMax: number;
  currency: string;
  status: string;
  createdAt: string;
};

export default function ProcurementPage() {
  const [items, setItems] = useState<Requisition[]>([]);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Initial list via server action pattern — load from a lightweight fetch
    startTransition(async () => {
      const res = await fetch("/api/v1/v12/procurement");
      const json = await res.json();
      setItems(json.data?.requisitions ?? []);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Procurement Platform
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 14 / Release 2A — requisitions with approval before RFQ
        sourcing.
      </p>

      <form
        className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const created = await v12CreateRequisition({
              title: String(fd.get("title")),
              description: String(fd.get("description")),
              taxonomyKeys: String(fd.get("taxonomy"))
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
              budgetMax: Number(fd.get("budget")),
            });
            setItems((prev) => [created, ...prev]);
            setMessage(`Requisition ${created.id} submitted.`);
            e.currentTarget.reset();
          });
        }}
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="taxonomy">Taxonomy keys</Label>
          <Input
            id="taxonomy"
            name="taxonomy"
            defaultValue="tax:rq:industry.food_beverage"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="budget">Budget max</Label>
          <Input id="budget" name="budget" type="number" defaultValue={100000} className="mt-1" />
        </div>
        <Button type="submit" disabled={pending}>
          Create requisition
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <ul className="mt-8 space-y-3">
        {items.map((r) => (
          <li
            key={r.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-[var(--rq-ink)]">{r.title}</h2>
              <Badge variant={r.status === "approved" ? "success" : "warning"}>
                {r.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-[var(--rq-slate)]">{r.description}</p>
            {r.status === "submitted" ? (
              <Button
                size="sm"
                className="mt-3"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const res = await v12ApproveRequisition(r.id);
                    if (res.ok && res.item) {
                      setItems((prev) =>
                        prev.map((x) => (x.id === r.id ? res.item! : x)),
                      );
                      setMessage(`Approved ${r.id} — ready for RFQ.`);
                    }
                  })
                }
              >
                Approve
              </Button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
