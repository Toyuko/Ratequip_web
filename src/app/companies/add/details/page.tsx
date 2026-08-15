"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { useListingDraft } from "@/components/organic-growth/use-listing-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateListingSubmission, enrichCompanyListingFromWeb } from "@/lib/actions/organic-growth";
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
  const [enriching, startEnrich] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [enrichNote, setEnrichNote] = useState<string | null>(null);
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
    description: "",
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
      description: draft.description ?? draft.headline ?? "",
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
        description: form.description.trim() || undefined,
        headline: form.description.trim().slice(0, 180) || undefined,
        privateNotes: form.privateNotes.trim() || undefined,
        status: "details_complete" as const,
      };
      const result = await updateListingSubmission(next);
      if (!result.ok) {
        setError(
          "message" in result && result.message
            ? result.message
            : "Unable to save company details.",
        );
        return;
      }
      save(result.submission as never);
      router.push(`/companies/add/contacts?submissionId=${current.id}`);
    });
  }

  function autoFillFromWeb() {
    const query = form.companyName.trim() || draft?.searchQuery || "";
    if (query.length < 2 && !form.websiteUrl.trim()) {
      setError("Enter a company name or website before auto-fill.");
      return;
    }
    setError(null);
    setEnrichNote(null);
    startEnrich(async () => {
      const result = await enrichCompanyListingFromWeb({
        query,
        websiteUrl: form.websiteUrl.trim() || undefined,
        country: form.countryCode.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      const e = result.enrichment;
      setForm((prev) => ({
        ...prev,
        companyName: e.companyName || prev.companyName,
        websiteUrl: e.websiteUrl || prev.websiteUrl,
        companyTypes:
          e.companyTypes.length > 0 ? e.companyTypes : prev.companyTypes,
        countryCode: e.countryCode || prev.countryCode,
        locality: e.locality || prev.locality,
        addressLine: e.addressLine || prev.addressLine,
        phoneDisplay: e.phoneDisplay || e.phoneNumbers?.[0] || prev.phoneDisplay,
        category: e.categories[0] || prev.category,
        publicSourceUrl: e.publicSourceUrl || prev.publicSourceUrl,
        description:
          e.description || e.headline || prev.description,
        privateNotes: e.privateNotes || prev.privateNotes,
      }));
      const contactBits = [
        e.phoneNumbers?.length
          ? `${e.phoneNumbers.length} phone(s)`
          : e.phoneDisplay
            ? "phone"
            : null,
        e.emailCandidates?.length
          ? `${e.emailCandidates.length} email(s)`
          : null,
        e.addressLine ? "address" : null,
        e.abnOrRegistry ? "ABN/registry" : null,
      ].filter(Boolean);
      setEnrichNote(
        `${result.message}${
          contactBits.length ? ` Found ${contactBits.join(", ")}.` : ""
        }`,
      );
    });
  }

  return (
    <AddCompanyWizardShell
      step="details"
      title="Company details"
      description="Capture enough public facts for a useful unclaimed profile. Use AI web fill to scrape a public website, then review. Private notes never appear on the public page."
      submissionId={draft.id}
    >
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-[var(--rq-border)] bg-[var(--rq-surface)] p-3">
        <Button
          type="button"
          variant="secondary"
          disabled={enriching || pending}
          onClick={autoFillFromWeb}
        >
          {enriching ? "Scraping website…" : "Auto-fill from website / web search"}
        </Button>
        <p className="text-xs text-[var(--rq-muted)]">
          Fetches the public site (or searches for it), then AI extracts name,
          location, phone and more.
        </p>
      </div>
      {enrichNote ? (
        <p className="mb-4 text-sm text-emerald-700">{enrichNote}</p>
      ) : null}
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
        <div>
          <Label htmlFor="description">Brief public description</Label>
          <Textarea
            id="description"
            className="mt-1"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What the company does, products/services, and locality…"
            maxLength={600}
            rows={3}
          />
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Shown on the unclaimed profile. Auto-fill may populate this from the
            company website.
          </p>
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
