"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { AddCompanyWizardShell } from "@/components/organic-growth/wizard-shell";
import { writeLocalDraft } from "@/components/organic-growth/use-listing-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchCompaniesForAdd,
  startListingSubmission,
} from "@/lib/actions/organic-growth";
import type { DuplicateCandidate } from "@/lib/organic-growth/types";

function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [country, setCountry] = useState("");
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(
    initialQ ? null : [],
  );
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    startTransition(async () => {
      const result = await searchCompaniesForAdd({ q, country });
      if (!result.ok) {
        setMessage(result.message);
        setCandidates([]);
        setSearched(false);
        return;
      }
      setMessage(null);
      setCandidates(result.candidates);
      setSearched(true);
    });
  }

  function startAdd() {
    startTransition(async () => {
      const result = await startListingSubmission({ searchQuery: q });
      if (!result.ok) return;
      writeLocalDraft(result.submission as never);
      router.push(`/companies/add/duplicates?submissionId=${result.submission.id}`);
    });
  }

  const exact = candidates?.filter((c) => c.matchLevel === "exact") ?? [];
  const likely = candidates?.filter((c) => c.matchLevel === "likely") ?? [];
  const other = candidates?.filter((c) => c.matchLevel === "possible") ?? [];

  return (
    <AddCompanyWizardShell
      step="search"
      title="Search before adding"
      description="Prevent duplicate profiles. Search by company name, website or location before creating a listing."
    >
      <form onSubmit={runSearch} className="space-y-4">
        <div>
          <Label htmlFor="q">Company name, website or location</Label>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1"
            placeholder="e.g. Apex Conveyors or apexconveyors.com"
            required
            minLength={2}
          />
        </div>
        <div>
          <Label htmlFor="country">Country filter (optional)</Label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1"
            placeholder="Thailand, Germany, Singapore…"
          />
        </div>
        <Button type="submit" disabled={pending || q.trim().length < 2}>
          {pending ? "Searching…" : "Search companies"}
        </Button>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      </form>

      {searched ? (
        <div className="mt-8 space-y-6">
          <ResultGroup title="Exact matches" items={exact} />
          <ResultGroup title="Likely matches" items={likely} />
          <ResultGroup title="Other results" items={other} />

          <div className="rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-surface)] p-4">
            <p className="text-sm text-[var(--rq-slate)]">
              You can review an unclaimed company and RateQuip will invite them
              to claim it. Contact emails you supply stay private.
            </p>
            <Button
              className="mt-4"
              onClick={startAdd}
              disabled={pending || q.trim().length < 2}
            >
              None of these — add a company
            </Button>
          </div>
        </div>
      ) : null}
    </AddCompanyWizardShell>
  );
}

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: DuplicateCandidate[];
}) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--rq-muted)]">No {title.toLowerCase()}.</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
        {title}
      </h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.companyId}
            className="rounded-md border border-[var(--rq-border)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={`/companies/${item.companySlug}`}
                  className="font-semibold text-[var(--rq-ink)] hover:text-orange-600"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-[var(--rq-slate)]">
                  {item.city}, {item.country} · {item.website.replace(/^https?:\/\//, "")}
                </p>
                <p className="mt-1 text-xs text-[var(--rq-muted)]">
                  {item.matchReasons.join(" · ")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.claimed ? (
                  <Badge variant="orange">Claimed</Badge>
                ) : (
                  <Badge variant="warning">Unclaimed</Badge>
                )}
                {item.verified ? <Badge variant="success">Verified</Badge> : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/companies/${item.companySlug}`}>Open profile</Link>
              </Button>
              {!item.claimed ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/companies/claim?company=${item.companySlug}`}>
                    Claim this company
                  </Link>
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CompaniesSearchPage() {
  return (
    <Suspense>
      <SearchForm />
    </Suspense>
  );
}
