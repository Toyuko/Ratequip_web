"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createRequest } from "@/lib/actions/marketplace";

type LineItemDraft = {
  key: string;
  productName: string;
  productCode: string;
  quantity: string;
  unit: string;
  oemOnly: boolean;
  notes: string;
};

function emptyItem(): LineItemDraft {
  return {
    key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    productName: "",
    productCode: "",
    quantity: "1",
    unit: "unit",
    oemOnly: false,
    notes: "",
  };
}

function NewRequestForm() {
  const params = useSearchParams();
  const supplier = params.get("supplier");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [items, setItems] = useState<LineItemDraft[]>([emptyItem()]);
  const [currency, setCurrency] = useState("USD");

  return (
    <form
      className="mt-8 max-w-3xl space-y-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const file = fd.get("attachment") as File | null;
        startTransition(async () => {
          const result = await createRequest({
            title: String(fd.get("title")),
            description: String(fd.get("description")),
            budgetMin: Number(fd.get("budgetMin")),
            budgetMax: Number(fd.get("budgetMax")),
            currency: String(fd.get("currency") ?? "USD"),
            taxTreatment:
              String(fd.get("taxTreatment")) === "exclusive"
                ? "exclusive"
                : "inclusive",
            quoteValidityDays: Number(fd.get("quoteValidityDays") ?? 30),
            deliveryCountry: String(fd.get("deliveryCountry")),
            deliveryCity: String(fd.get("deliveryCity") ?? ""),
            deliveryAddress: String(fd.get("deliveryAddress") ?? ""),
            dueDate: String(fd.get("dueDate") ?? ""),
            items: items
              .filter((item) => item.productName.trim())
              .map((item) => ({
                productName: item.productName,
                productCode: item.productCode || undefined,
                quantity: Number(item.quantity) || 1,
                unit: item.unit || undefined,
                oemOnly: item.oemOnly,
                notes: item.notes || undefined,
              })),
            attachmentFile: file && file.size > 0 ? file : null,
          });
          setError(!result.ok);
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

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="attachment">Document or photo (optional)</Label>
          <Input
            id="attachment"
            name="attachment"
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf"
            className="mt-1"
          />
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Images, PDF, Word, Excel, or text — up to 10 MB.
          </p>
        </div>
      </div>

      <fieldset className="space-y-4 border-t border-[var(--rq-border)] pt-6">
        <legend className="text-sm font-semibold text-[var(--rq-ink)]">
          Commercial terms
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm text-[var(--rq-ink)]"
            >
              <option value="USD">USD</option>
              <option value="AUD">AUD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
              <option value="THB">THB</option>
              <option value="VND">VND</option>
              <option value="CNY">CNY</option>
              <option value="JPY">JPY</option>
            </select>
          </div>
          <div>
            <Label htmlFor="taxTreatment">Tax on price</Label>
            <select
              id="taxTreatment"
              name="taxTreatment"
              defaultValue="inclusive"
              className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm text-[var(--rq-ink)]"
            >
              <option value="inclusive">Inclusive of tax</option>
              <option value="exclusive">Exclusive of tax</option>
            </select>
          </div>
          <div>
            <Label htmlFor="budgetMin">Budget min ({currency})</Label>
            <Input
              id="budgetMin"
              name="budgetMin"
              type="number"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="budgetMax">Budget max ({currency})</Label>
            <Input
              id="budgetMax"
              name="budgetMax"
              type="number"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Closing date</Label>
            <Input id="dueDate" name="dueDate" type="date" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="quoteValidityDays">Quote validity (days)</Label>
            <Input
              id="quoteValidityDays"
              name="quoteValidityDays"
              type="number"
              min={1}
              defaultValue={30}
              required
              className="mt-1"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-[var(--rq-border)] pt-6">
        <legend className="text-sm font-semibold text-[var(--rq-ink)]">
          Ship to
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="deliveryCountry">Country</Label>
            <Input
              id="deliveryCountry"
              name="deliveryCountry"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="deliveryCity">City / locality</Label>
            <Input id="deliveryCity" name="deliveryCity" className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="deliveryAddress">Site / address (optional)</Label>
          <Input
            id="deliveryAddress"
            name="deliveryAddress"
            className="mt-1"
            placeholder="Site name, industrial estate, or street address"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-[var(--rq-border)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="text-sm font-semibold text-[var(--rq-ink)]">
            Line items
          </legend>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setItems((prev) => [...prev, emptyItem()])}
          >
            Add item
          </Button>
        </div>
        <p className="text-xs text-[var(--rq-muted)]">
          Optional but recommended — product name, code/SKU, quantity, and OEM
          only.
        </p>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.key}
              className="space-y-3 rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--rq-muted)]">
                  Item {index + 1}
                </p>
                {items.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() =>
                      setItems((prev) =>
                        prev.filter((row) => row.key !== item.key),
                      )
                    }
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor={`productName-${item.key}`}>Product name</Label>
                  <Input
                    id={`productName-${item.key}`}
                    value={item.productName}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, productName: e.target.value }
                            : row,
                        ),
                      )
                    }
                    className="mt-1"
                    placeholder="e.g. Hybrid sunken pump"
                  />
                </div>
                <div>
                  <Label htmlFor={`productCode-${item.key}`}>
                    Product code / SKU
                  </Label>
                  <Input
                    id={`productCode-${item.key}`}
                    value={item.productCode}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, productCode: e.target.value }
                            : row,
                        ),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`quantity-${item.key}`}>Qty</Label>
                    <Input
                      id={`quantity-${item.key}`}
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.key === item.key
                              ? { ...row, quantity: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`unit-${item.key}`}>Unit</Label>
                    <Input
                      id={`unit-${item.key}`}
                      value={item.unit}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row) =>
                            row.key === item.key
                              ? { ...row, unit: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor={`notes-${item.key}`}>Notes</Label>
                  <Input
                    id={`notes-${item.key}`}
                    value={item.notes}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((row) =>
                          row.key === item.key
                            ? { ...row, notes: e.target.value }
                            : row,
                        ),
                      )
                    }
                    className="mt-1"
                    placeholder="Specs, packaging, or constraints"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--rq-ink)]">
                <input
                  type="checkbox"
                  checked={item.oemOnly}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((row) =>
                        row.key === item.key
                          ? { ...row, oemOnly: e.target.checked }
                          : row,
                      ),
                    )
                  }
                />
                Original / OEM only — no alternatives
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      {message ? (
        <p
          className={`text-sm ${error ? "text-red-600" : "text-emerald-700"}`}
        >
          {message}
        </p>
      ) : null}
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
        Add closing date, ship-to, line items, and commercial terms so suppliers
        can quote accurately.
      </p>
      <Suspense>
        <NewRequestForm />
      </Suspense>
    </div>
  );
}
