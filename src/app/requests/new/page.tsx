"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { RfqAiAssistant } from "@/components/marketplace/rfq-ai-assistant";
import { RfqProjectCompanion } from "@/components/marketplace/rfq-project-companion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RfqDraft } from "@/lib/rfq/draft";
import { createRequest } from "@/lib/actions/marketplace";
import {
  COMPLIANCE_OPTIONS,
  SCOPE_OF_SUPPLY_OPTIONS,
  type TechnicalRequirement,
} from "@/lib/rfq/types";

type LineItemDraft = {
  key: string;
  productName: string;
  productCode: string;
  quantity: string;
  unit: string;
  oemOnly: boolean;
  notes: string;
};

type RequirementDraft = TechnicalRequirement & { key: string };

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

function emptyRequirement(): RequirementDraft {
  return {
    key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    text: "",
    priority: "must",
  };
}

function NewRequestForm() {
  const params = useSearchParams();
  const supplier = params.get("supplier");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const [title, setTitle] = useState(params.get("title") ?? "");
  const [description, setDescription] = useState(params.get("description") ?? "");
  const [currency, setCurrency] = useState("USD");
  const [taxTreatment, setTaxTreatment] = useState<"inclusive" | "exclusive">(
    "inclusive",
  );
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [quoteValidityDays, setQuoteValidityDays] = useState("30");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [referenceModel, setReferenceModel] = useState("");
  const [materialOfConstruction, setMaterialOfConstruction] = useState("");
  const [utilitiesNotes, setUtilitiesNotes] = useState("");
  const [warrantyMonthsRequired, setWarrantyMonthsRequired] = useState("12");
  const [deliveryWeeksRequired, setDeliveryWeeksRequired] = useState("");
  const [complianceStandards, setComplianceStandards] = useState<string[]>([]);
  const [scopeOfSupply, setScopeOfSupply] = useState<string[]>(["supply"]);
  const [items, setItems] = useState<LineItemDraft[]>([emptyItem()]);
  const [requirements, setRequirements] = useState<RequirementDraft[]>([
    emptyRequirement(),
  ]);

  function applyDraft(draft: RfqDraft) {
    setTitle(draft.title ?? "");
    setDescription(draft.description ?? "");
    if (draft.currency) setCurrency(draft.currency);
    if (draft.taxTreatment) setTaxTreatment(draft.taxTreatment);
    if (draft.budgetMin != null) setBudgetMin(String(draft.budgetMin));
    if (draft.budgetMax != null) setBudgetMax(String(draft.budgetMax));
    setDueDate(draft.dueDate ?? "");
    setQuoteValidityDays(String(draft.quoteValidityDays ?? 30));
    setDeliveryCountry(draft.deliveryCountry ?? "");
    setDeliveryCity(draft.deliveryCity ?? "");
    setDeliveryAddress(draft.deliveryAddress ?? "");
    setReferenceModel(draft.referenceModel ?? "");
    setMaterialOfConstruction(draft.materialOfConstruction ?? "");
    setUtilitiesNotes(draft.utilitiesNotes ?? "");
    if (draft.warrantyMonthsRequired != null) {
      setWarrantyMonthsRequired(String(draft.warrantyMonthsRequired));
    }
    if (draft.deliveryWeeksRequired != null) {
      setDeliveryWeeksRequired(String(draft.deliveryWeeksRequired));
    }
    setComplianceStandards(draft.complianceStandards ?? []);
    setScopeOfSupply(
      draft.scopeOfSupply?.length ? draft.scopeOfSupply : ["supply"],
    );
    setItems(
      (draft.items ?? []).length > 0
        ? draft.items.map((item) => ({
            key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            productName: item.productName,
            productCode: item.productCode ?? "",
            quantity: String(item.quantity ?? 1),
            unit: item.unit ?? "unit",
            oemOnly: Boolean(item.oemOnly),
            notes: item.notes ?? "",
          }))
        : [emptyItem()],
    );
    setRequirements(
      (draft.technicalRequirements ?? []).length > 0
        ? draft.technicalRequirements.map((req) => ({
            key: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            text: req.text,
            priority: req.priority,
          }))
        : [emptyRequirement()],
    );
  }

  function toggleList(
    value: string,
    list: string[],
    setList: (next: string[]) => void,
  ) {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value],
    );
  }

  const companionSeed = [title, description, referenceModel]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mt-8 max-w-3xl space-y-6">
      <RfqAiAssistant onApply={applyDraft} />

      {companionSeed.length > 40 ? (
        <RfqProjectCompanion seedPrompt={companionSeed} />
      ) : null}

      <form
        className="space-y-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const file = fd.get("attachment") as File | null;
          startTransition(async () => {
            const result = await createRequest({
              title,
              description,
              budgetMin: Number(budgetMin),
              budgetMax: Number(budgetMax),
              currency,
              taxTreatment,
              quoteValidityDays: Number(quoteValidityDays || 30),
              deliveryCountry,
              deliveryCity,
              deliveryAddress,
              dueDate,
              referenceModel,
              complianceStandards,
              materialOfConstruction,
              utilitiesNotes,
              warrantyMonthsRequired: warrantyMonthsRequired
                ? Number(warrantyMonthsRequired)
                : undefined,
              deliveryWeeksRequired: deliveryWeeksRequired
                ? Number(deliveryWeeksRequired)
                : undefined,
              scopeOfSupply,
              technicalRequirements: requirements
                .filter((req) => req.text.trim())
                .map(({ text, priority }) => ({ text, priority })),
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
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              Attach URS, drawings, or photos — up to 10 MB.
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
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
              >
                {["USD", "AUD", "EUR", "GBP", "SGD", "THB", "VND", "CNY", "JPY"].map(
                  (code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ),
                )}
              </select>
            </div>
            <div>
              <Label htmlFor="taxTreatment">Tax on price</Label>
              <select
                id="taxTreatment"
                value={taxTreatment}
                onChange={(e) =>
                  setTaxTreatment(
                    e.target.value === "exclusive" ? "exclusive" : "inclusive",
                  )
                }
                className="mt-1 flex h-10 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
              >
                <option value="inclusive">Inclusive of tax</option>
                <option value="exclusive">Exclusive of tax</option>
              </select>
            </div>
            <div>
              <Label htmlFor="budgetMin">Budget min ({currency})</Label>
              <Input
                id="budgetMin"
                type="number"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="budgetMax">Budget max ({currency})</Label>
              <Input
                id="budgetMax"
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Closing date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quoteValidityDays">Quote validity (days)</Label>
              <Input
                id="quoteValidityDays"
                type="number"
                min={1}
                required
                value={quoteValidityDays}
                onChange={(e) => setQuoteValidityDays(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryWeeksRequired">
                Required delivery (weeks from PO)
              </Label>
              <Input
                id="deliveryWeeksRequired"
                type="number"
                min={1}
                value={deliveryWeeksRequired}
                onChange={(e) => setDeliveryWeeksRequired(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="warrantyMonthsRequired">
                Warranty required (months)
              </Label>
              <Input
                id="warrantyMonthsRequired"
                type="number"
                min={0}
                value={warrantyMonthsRequired}
                onChange={(e) => setWarrantyMonthsRequired(e.target.value)}
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
                required
                value={deliveryCountry}
                onChange={(e) => setDeliveryCountry(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deliveryCity">City / locality</Label>
              <Input
                id="deliveryCity"
                value={deliveryCity}
                onChange={(e) => setDeliveryCity(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="deliveryAddress">Site / address (optional)</Label>
            <Input
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="mt-1"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[var(--rq-border)] pt-6">
          <legend className="text-sm font-semibold text-[var(--rq-ink)]">
            Specifications (URS-lite)
          </legend>
          <div>
            <Label htmlFor="referenceModel">Reference model / match to</Label>
            <Input
              id="referenceModel"
              value={referenceModel}
              onChange={(e) => setReferenceModel(e.target.value)}
              className="mt-1"
              placeholder="e.g. Lao Soung LS800-1S"
            />
          </div>
          <div>
            <Label htmlFor="materialOfConstruction">
              Material of construction
            </Label>
            <Input
              id="materialOfConstruction"
              value={materialOfConstruction}
              onChange={(e) => setMaterialOfConstruction(e.target.value)}
              className="mt-1"
              placeholder="e.g. Product contact SS316L, frame SS304"
            />
          </div>
          <div>
            <Label htmlFor="utilitiesNotes">Utilities</Label>
            <Textarea
              id="utilitiesNotes"
              value={utilitiesNotes}
              onChange={(e) => setUtilitiesNotes(e.target.value)}
              className="mt-1"
              placeholder="e.g. 3 phase 415V 50Hz, clean dry air 6 bar"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--rq-ink)]">
              Compliance
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {COMPLIANCE_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm text-[var(--rq-ink)]"
                >
                  <input
                    type="checkbox"
                    checked={complianceStandards.includes(option)}
                    onChange={() =>
                      toggleList(
                        option,
                        complianceStandards,
                        setComplianceStandards,
                      )
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--rq-ink)]">
              Scope of supply
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {SCOPE_OF_SUPPLY_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 text-sm capitalize text-[var(--rq-ink)]"
                >
                  <input
                    type="checkbox"
                    checked={scopeOfSupply.includes(option)}
                    onChange={() =>
                      toggleList(option, scopeOfSupply, setScopeOfSupply)
                    }
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="space-y-4 border-t border-[var(--rq-border)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <legend className="text-sm font-semibold text-[var(--rq-ink)]">
              Technical requirements checklist
            </legend>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setRequirements((prev) => [...prev, emptyRequirement()])
              }
            >
              Add requirement
            </Button>
          </div>
          <p className="text-xs text-[var(--rq-muted)]">
            Suppliers must confirm must-haves or list deviations in their quote.
          </p>
          <div className="space-y-3">
            {requirements.map((req, index) => (
              <div
                key={req.key}
                className="grid gap-2 rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] p-3 sm:grid-cols-[1fr_140px_auto]"
              >
                <Input
                  value={req.text}
                  onChange={(e) =>
                    setRequirements((prev) =>
                      prev.map((row) =>
                        row.key === req.key
                          ? { ...row, text: e.target.value }
                          : row,
                      ),
                    )
                  }
                  placeholder={`Requirement ${index + 1}`}
                />
                <select
                  value={req.priority}
                  onChange={(e) =>
                    setRequirements((prev) =>
                      prev.map((row) =>
                        row.key === req.key
                          ? {
                              ...row,
                              priority: e.target.value as TechnicalRequirement["priority"],
                            }
                          : row,
                      ),
                    )
                  }
                  className="flex h-10 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
                >
                  <option value="must">Must</option>
                  <option value="prefer">Prefer</option>
                  <option value="optional">Optional</option>
                </select>
                {requirements.length > 1 ? (
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() =>
                      setRequirements((prev) =>
                        prev.filter((row) => row.key !== req.key),
                      )
                    }
                  >
                    Remove
                  </button>
                ) : (
                  <span />
                )}
              </div>
            ))}
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
                    <Label>Product name</Label>
                    <Input
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
                    />
                  </div>
                  <div>
                    <Label>Product code / SKU</Label>
                    <Input
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
                      <Label>Qty</Label>
                      <Input
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
                      <Label>Unit</Label>
                      <Input
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
                    <Label>Notes</Label>
                    <Input
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
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
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
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Post an RFQ</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Draft with AI from a URS paste, or fill commercial terms, ship-to, line
        items, and must-have requirements yourself.
      </p>
      <Suspense>
        <NewRequestForm />
      </Suspense>
    </div>
  );
}
