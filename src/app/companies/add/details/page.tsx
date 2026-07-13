"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { useListingDraft } from "@/components/organic-growth/use-listing-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateListingSubmission } from "@/lib/actions/organic-growth";
import { demoCategories } from "@/lib/db/demo-data";
import {
  COMPANY_TYPES,
  type CompanyType,
} from "@/lib/organic-growth/types";

const TYPE_LABELS: Record<CompanyType, string> = {
  buyer: "Buyer",
  supplier: "Supplier",
  manufacturer: "Manufacturer",
  contractor: "Contractor",
  installer: "Installer",
  freight: "Freight",
  inspector: "Inspector",
  auditor: "Auditor",
  consultant: "Consultant",
  other: "Other",
};

export default function AddDetailsPage() {
  const router = useRouter();
  const { draft, ready, save } = useListingDraft();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const categories = demoCategories.filter((c) => !c.parentId);

  const [form, setForm] = useState({
    companyName: "",
    websiteUrl: "",
    companyTypes: [] as CompanyType[],
    countryCode: "",
    locality: "",
    addressLine: "",
    phoneDisplay: "",
    category: "",
    publicSourceUrl: "",
    privateNotes: "",
  });

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    setForm({
      companyName: draft.companyName ?? draft.searchQuery ?? "",
      websiteUrl: draft.websiteUrl ?? "",
      companyTypes: draft.companyTypes,
      countryCode: draft.countryCode ?? "",
      locality: draft.locality ?? "",
      addressLine: draft.addressLine ?? "",
      phoneDisplay: draft.phoneDisplay ?? "",
      category: draft.categories[0] ?? "",
      publicSourceUrl: draft.publicSourceUrl ?? "",
      privateNotes: draft.privateNotes ?? "",
    });
  }, [ready, draft, router]);

  if (!ready || !draft) return null;

  function toggleType(type: CompanyType) {
    setForm((prev) => ({
      ...prev,
      companyTypes: prev.companyTypes.includes(type)
        ? prev.companyTypes.filter((t) => t !== type)
        : [...prev.companyTypes, type],
    }));
  }

  function onContinue(e: React.FormEvent) {
    e.preventDefault();
    const current = draft;
    if (!current) return;
    if (!form.companyName.trim() || form.companyName.trim().length < 2) {
      setError("Enter a real company name (2–160 characters).");
      return;
    }
    if (form.companyTypes.length === 0) {
      setError("Select at least one company type.");
      return;
    }
    if (!form.countryCode.trim() || !form.locality.trim() || !form.category) {
      setError("Country, locality and category are required.");
      return;
    }

    startTransition(async () => {
      const next = {
        ...current,
        companyName: form.companyName.trim(),
        websiteUrl: form.websiteUrl.trim() || undefined,
        companyTypes: form.companyTypes,
        countryCode: form.countryCode.trim(),
        locality: form.locality.trim(),
        addressLine: form.addressLine.trim() || undefined,
        phoneDisplay: form.phoneDisplay.trim() || undefined,
        categories: [form.category],
        publicSourceUrl: form.publicSourceUrl.trim() || undefined,
        privateNotes: form.privateNotes.trim() || undefined,
        status: "details_complete" as const,
      };
      const result = await updateListingSubmission(next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      save(result.submission as never);
      router.push(`/companies/add/contacts?submissionId=${current.id}`);
    });
  }

  return (
    <AddCompanyWizardShell
      step="details"
      title="Company details"
      description="Capture enough public facts for a useful unclaimed profile. Private notes never appear on the public page."
      submissionId={draft.id}
    >
      <form onSubmit={onContinue} className="space-y-4">
        <div>
          <Label htmlFor="companyName">Legal or trading name</Label>
          <Input
            id="companyName"
            className="mt-1"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
            maxLength={160}
          />
        </div>
        <div>
          <Label htmlFor="websiteUrl">Website</Label>
          <Input
            id="websiteUrl"
            className="mt-1"
            value={form.websiteUrl}
            onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Company type</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {COMPANY_TYPES.map((type) => {
              const active = form.companyTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                    active
                      ? "border-[var(--rq-navy)] bg-[var(--rq-navy)] text-white"
                      : "border-[var(--rq-border)] text-[var(--rq-slate)]"
                  }`}
                >
                  {TYPE_LABELS[type]}
                </button>
              );
            })}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="countryCode">Country</Label>
            <Input
              id="countryCode"
              className="mt-1"
              value={form.countryCode}
              onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
              placeholder="Thailand"
              required
            />
          </div>
          <div>
            <Label htmlFor="locality">City / locality</Label>
            <Input
              id="locality"
              className="mt-1"
              value={form.locality}
              onChange={(e) => setForm({ ...form, locality: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="addressLine">Street address (optional)</Label>
          <Input
            id="addressLine"
            className="mt-1"
            value={form.addressLine}
            onChange={(e) => setForm({ ...form, addressLine: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phoneDisplay">Phone (optional)</Label>
          <Input
            id="phoneDisplay"
            className="mt-1"
            value={form.phoneDisplay}
            onChange={(e) => setForm({ ...form, phoneDisplay: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="category">Primary category</Label>
          <select
            id="category"
            className="mt-1 h-11 w-full rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="publicSourceUrl">Public source URL (if no direct relationship)</Label>
          <Input
            id="publicSourceUrl"
            className="mt-1"
            value={form.publicSourceUrl}
            onChange={(e) => setForm({ ...form, publicSourceUrl: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="privateNotes">Notes for RateQuip (private)</Label>
          <Textarea
            id="privateNotes"
            className="mt-1"
            value={form.privateNotes}
            onChange={(e) => setForm({ ...form, privateNotes: e.target.value })}
            maxLength={1000}
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Continue"}
        </Button>
      </form>
    </AddCompanyWizardShell>
  );
}
