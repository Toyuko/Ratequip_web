"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitQuote } from "@/lib/actions/marketplace";
import type {
  DemoRequestItem,
  DemoTechnicalRequirement,
} from "@/lib/db/demo-data";

export function QuoteForm({
  requestId,
  requestTitle,
  currency,
  taxTreatment,
  quoteValidityDays,
  dueDate,
  shipTo,
  referenceModel,
  complianceStandards,
  technicalRequirements,
  items,
  closed,
}: {
  requestId: string;
  requestTitle?: string;
  currency: string;
  taxTreatment: "inclusive" | "exclusive";
  quoteValidityDays: number;
  dueDate?: string;
  shipTo?: string;
  referenceModel?: string;
  complianceStandards?: string[];
  technicalRequirements?: DemoTechnicalRequirement[];
  items: DemoRequestItem[];
  closed?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [meetsRequirements, setMeetsRequirements] = useState(true);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
        <p className="text-sm text-[var(--rq-muted)]">RFQ: {requestId}</p>
        {requestTitle ? (
          <h2 className="mt-1 text-lg font-semibold text-[var(--rq-ink)]">
            {requestTitle}
          </h2>
        ) : null}
        <dl className="mt-3 grid gap-2 text-sm text-[var(--rq-slate)] sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Currency / tax
            </dt>
            <dd>
              {currency} · tax {taxTreatment}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Validity required
            </dt>
            <dd>{quoteValidityDays} days</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Closing date
            </dt>
            <dd>{dueDate ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Ship to
            </dt>
            <dd>{shipTo || "—"}</dd>
          </div>
          {referenceModel ? (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                Reference model
              </dt>
              <dd>{referenceModel}</dd>
            </div>
          ) : null}
          {(complianceStandards?.length ?? 0) > 0 ? (
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                Compliance
              </dt>
              <dd>{complianceStandards?.join(" · ")}</dd>
            </div>
          ) : null}
        </dl>
        {(technicalRequirements?.length ?? 0) > 0 ? (
          <ul className="mt-4 space-y-2 border-t border-[var(--rq-border)] pt-3 text-sm">
            {technicalRequirements!.map((req, index) => (
              <li key={`${req.text}-${index}`} className="flex gap-2">
                <Badge variant="muted">{req.priority}</Badge>
                <span className="text-[var(--rq-slate)]">{req.text}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {items.length > 0 ? (
          <ul className="mt-4 space-y-1 border-t border-[var(--rq-border)] pt-3 text-sm text-[var(--rq-slate)]">
            {items.map((item) => (
              <li key={item.id}>
                <span className="font-medium text-[var(--rq-ink)]">
                  {item.productName}
                </span>
                {item.productCode ? ` (${item.productCode})` : ""} · qty{" "}
                {item.quantity}
                {item.unit ? ` ${item.unit}` : ""}
                {item.oemOnly ? " · OEM only" : ""}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <form
        className="space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (closed) return;
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await submitQuote({
              requestId,
              amount: Number(fd.get("amount")),
              leadTimeDays: Number(fd.get("leadTime")),
              deliveryPeriodDays: Number(fd.get("deliveryPeriod")) || undefined,
              stockAvailability: String(fd.get("stockAvailability") ?? ""),
              meetsRequirements,
              deviations: String(fd.get("deviations") ?? ""),
              notes: String(fd.get("notes") ?? ""),
            });
            setError(!result.ok);
            setMessage(result.message);
          });
        }}
      >
        <div>
          <Label htmlFor="amount">Quote amount ({currency})</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            required
            disabled={closed}
            className="mt-1"
          />
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Price should be tax {taxTreatment}. Keep offer open for at least{" "}
            {quoteValidityDays} days.
          </p>
        </div>
        <div>
          <Label htmlFor="stockAvailability">Stock availability</Label>
          <select
            id="stockAvailability"
            name="stockAvailability"
            required
            disabled={closed}
            defaultValue="in_stock"
            className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm disabled:opacity-60"
          >
            <option value="in_stock">In stock</option>
            <option value="on_order">On order / made to order</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="leadTime">Lead time (days)</Label>
            <Input
              id="leadTime"
              name="leadTime"
              type="number"
              required
              disabled={closed}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="deliveryPeriod">Delivery to site (days)</Label>
            <Input
              id="deliveryPeriod"
              name="deliveryPeriod"
              type="number"
              min={0}
              disabled={closed}
              className="mt-1"
            />
          </div>
        </div>
        <fieldset className="space-y-3 rounded-md border border-[var(--rq-border)] p-3">
          <legend className="px-1 text-sm font-medium text-[var(--rq-ink)]">
            Requirements compliance
          </legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="meets"
              checked={meetsRequirements}
              disabled={closed}
              onChange={() => setMeetsRequirements(true)}
            />
            Can meet all must-have requirements
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="meets"
              checked={!meetsRequirements}
              disabled={closed}
              onChange={() => setMeetsRequirements(false)}
            />
            Cannot meet some requirements (list deviations)
          </label>
          {!meetsRequirements ? (
            <div>
              <Label htmlFor="deviations">Deviations</Label>
              <Textarea
                id="deviations"
                name="deviations"
                required
                disabled={closed}
                className="mt-1"
                placeholder="Clearly identify where the offer cannot meet the URS / RFQ criteria"
              />
            </div>
          ) : (
            <input type="hidden" name="deviations" value="" />
          )}
        </fieldset>
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            disabled={closed}
            className="mt-1"
            placeholder="Confirm OEM match, inclusions, freight, FAT/SAT, or exclusions"
          />
        </div>
        {closed ? (
          <p className="text-sm text-red-600">
            This RFQ is closed or past its closing date.
          </p>
        ) : null}
        {message ? (
          <p
            className={`text-sm ${error ? "text-red-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || closed}>
          {pending ? "Submitting…" : "Submit quote"}
        </Button>
      </form>
    </div>
  );
}
