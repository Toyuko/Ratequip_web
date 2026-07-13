"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { useListingDraft } from "@/components/organic-growth/use-listing-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { searchCompaniesForAdd } from "@/lib/actions/organic-growth";
import type { DuplicateCandidate } from "@/lib/organic-growth/types";

export default function AddDuplicatesPage() {
  const router = useRouter();
  const { draft, ready, save } = useListingDraft();
  const [candidates, setCandidates] = useState<DuplicateCandidate[]>([]);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!ready) return;
    if (!draft) {
      router.replace("/companies/search");
      return;
    }
    startTransition(async () => {
      const result = await searchCompaniesForAdd({
        q: draft.companyName || draft.searchQuery || "",
        websiteUrl: draft.websiteUrl,
        country: draft.countryCode,
      });
      if (result.ok) setCandidates(result.candidates);
    });
  }, [ready, draft, router]);

  if (!ready || !draft) return null;

  const exact = candidates.filter((c) => c.matchLevel === "exact");
  const likely = candidates.filter((c) => c.matchLevel === "likely");

  function continueAsNew() {
    const current = draft;
    if (!current) return;
    if (likely.length > 0 && reason.trim().length < 8) {
      return;
    }
    save({ ...current, status: "duplicate_check" });
    router.push(`/companies/add/details?submissionId=${current.id}`);
  }

  return (
    <AddCompanyWizardShell
      step="duplicates"
      title="Resolve possible duplicates"
      description="Duplicate profiles split reviews and trust history. Exact domain matches cannot be overridden."
      submissionId={draft.id}
    >
      {exact.length > 0 ? (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          Exact domain or name matches found. Open the existing profile instead of
          creating a new one.
        </div>
      ) : null}

      <CandidateList title="Exact matches" items={exact} locked />
      <CandidateList title="Likely matches" items={likely} />

      {likely.length > 0 || exact.length === 0 ? (
        <div className="mt-6 space-y-3">
          {likely.length > 0 ? (
            <div>
              <Label htmlFor="reason">Why is this not the same company?</Label>
              <Textarea
                id="reason"
                className="mt-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Different legal entity, different location, related brand…"
                required
              />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={continueAsNew}
              disabled={
                pending ||
                exact.length > 0 ||
                (likely.length > 0 && reason.trim().length < 8)
              }
            >
              Not the same company — continue
            </Button>
            <Button asChild variant="outline">
              <Link href="/companies/search">Back to search</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </AddCompanyWizardShell>
  );
}

function CandidateList({
  title,
  items,
  locked,
}: {
  title: string;
  items: DuplicateCandidate[];
  locked?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className="font-semibold text-[var(--rq-ink)]">{title}</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.companyId}
            className="rounded-md border border-[var(--rq-border)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                href={`/companies/${item.companySlug}`}
                className="font-medium hover:text-orange-600"
              >
                {item.name}
              </Link>
              <Badge variant={item.claimed ? "orange" : "warning"}>
                {item.claimed ? "Claimed" : "Unclaimed"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--rq-slate)]">
              {item.city}, {item.country} · {item.matchReasons.join(", ")}
            </p>
            {locked ? (
              <p className="mt-2 text-xs text-amber-700">
                Exact match — use this profile or request a correction.
              </p>
            ) : null}
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href={`/companies/${item.companySlug}`}>This is the company</Link>
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
