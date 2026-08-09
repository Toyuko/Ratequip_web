"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { CaptureReferralRef } from "@/components/referrals/capture-referral-ref";
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
import type { CompanyType, DuplicateCandidate } from "@/lib/organic-growth/types";
import { isPublicWebsiteUrl } from "@/lib/utils";

type WebEnrichmentCard = {
  companyName: string;
  websiteUrl?: string;
  companyTypes: CompanyType[];
  countryCode?: string;
  locality?: string;
  region?: string;
  addressLine?: string;
  postalCode?: string;
  phoneDisplay?: string;
  phoneNumbers?: string[];
  emailCandidates?: string[];
  publicSourceUrl?: string;
  privateNotes?: string;
  categories: string[];
  enrichmentMeta?: {
    source: string;
    usedAi: boolean;
    confidence: number;
    matchReasons: string[];
    abnOrRegistry?: string;
    fetchedUrl?: string;
    phones?: string[];
    emails?: string[];
    addresses?: Array<{
      line?: string;
      locality?: string;
      region?: string;
      postalCode?: string;
      country?: string;
    }>;
  };
};

function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialQ = params.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const [country, setCountry] = useState("");
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(
    initialQ ? null : [],
  );
  const [webEnrichments, setWebEnrichments] = useState<WebEnrichmentCard[]>([]);
  const [webMessage, setWebMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    startTransition(async () => {
      const result = await searchCompaniesForAdd({
        q,
        country,
        includeWeb: true,
      });
      if (!result.ok) {
        setMessage(result.message);
        setCandidates([]);
        setWebEnrichments([]);
        setWebMessage(null);
        setSearched(false);
        return;
      }
      setMessage(null);
      setCandidates(result.candidates);
      setWebEnrichments(result.webEnrichments ?? []);
      setWebMessage(result.webMessage ?? null);
      setSearched(true);
    });
  }

  function startAdd(enrichment?: WebEnrichmentCard) {
    startTransition(async () => {
      const result = await startListingSubmission({
        searchQuery: enrichment?.companyName || q,
        enrichment: enrichment
          ? {
              companyName: enrichment.companyName,
              websiteUrl: enrichment.websiteUrl,
              companyTypes: enrichment.companyTypes,
              countryCode: enrichment.countryCode,
              locality: enrichment.locality,
              region: enrichment.region,
              addressLine: enrichment.addressLine,
              postalCode: enrichment.postalCode,
              phoneDisplay: enrichment.phoneDisplay,
              phoneNumbers:
                enrichment.phoneNumbers ?? enrichment.enrichmentMeta?.phones,
              emailCandidates:
                enrichment.emailCandidates ?? enrichment.enrichmentMeta?.emails,
              abnOrRegistry: enrichment.enrichmentMeta?.abnOrRegistry,
              publicSourceUrl: enrichment.publicSourceUrl,
              privateNotes: enrichment.privateNotes,
              categories: enrichment.categories,
            }
          : undefined,
      });
      if (!result.ok) return;
      writeLocalDraft(result.submission as never);
      // Skip duplicates when we already scraped a concrete web company.
      const next = enrichment
        ? `/companies/add/details?submissionId=${result.submission.id}`
        : `/companies/add/duplicates?submissionId=${result.submission.id}`;
      router.push(next);
    });
  }

  const exact = candidates?.filter((c) => c.matchLevel === "exact") ?? [];
  const likely = candidates?.filter((c) => c.matchLevel === "likely") ?? [];
  const other = candidates?.filter((c) => c.matchLevel === "possible") ?? [];

  return (
    <AddCompanyWizardShell
      step="search"
      title="Search before adding"
      description="Search RateQuip’s directory and the open web. AI reads public websites and pre-fills company details — you review before publishing."
    >
      <CaptureReferralRef />
      <form onSubmit={runSearch} className="space-y-4">
        <div>
          <Label htmlFor="q">Company name, website or location</Label>
          <Input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1"
            placeholder="e.g. InkjetPrint or inkjetprint.com.au"
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
          {pending ? "Searching directory + web…" : "Search companies"}
        </Button>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      </form>

      {searched ? (
        <div className="mt-8 space-y-6">
          <ResultGroup title="Exact matches on RateQuip" items={exact} />
          <ResultGroup title="Likely matches on RateQuip" items={likely} />
          <ResultGroup title="Other RateQuip results" items={other} />

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
              Found on the web (AI-assisted)
            </h2>
            {webMessage ? (
              <p className="mt-2 text-sm text-[var(--rq-slate)]">{webMessage}</p>
            ) : null}
            {webEnrichments.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--rq-muted)]">
                No enrichable public websites found yet. Try a full website URL.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {webEnrichments.map((item, index) => (
                  <li
                    key={`${item.websiteUrl ?? item.companyName}-${index}`}
                    className="rounded-md border border-[var(--rq-border)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--rq-ink)]">
                          {item.companyName}
                        </p>
                        <p className="mt-1 text-sm text-[var(--rq-slate)]">
                          {[item.locality, item.region, item.countryCode]
                            .filter(Boolean)
                            .join(", ") || "Location unknown"}
                          {item.websiteUrl
                            ? ` · ${item.websiteUrl.replace(/^https?:\/\//, "")}`
                            : ""}
                        </p>
                        {(item.phoneNumbers?.length || item.phoneDisplay) ? (
                          <p className="mt-1 text-sm text-[var(--rq-slate)]">
                            Phone ·{" "}
                            {(item.phoneNumbers?.length
                              ? item.phoneNumbers
                              : [item.phoneDisplay]
                            )
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                        {item.emailCandidates?.length ? (
                          <p className="mt-1 text-sm text-[var(--rq-slate)]">
                            Email · {item.emailCandidates.join(" · ")}
                          </p>
                        ) : null}
                        {item.addressLine ? (
                          <p className="mt-1 text-sm text-[var(--rq-slate)]">
                            Address ·{" "}
                            {[
                              item.addressLine,
                              item.locality,
                              item.region,
                              item.postalCode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        ) : null}
                        {item.enrichmentMeta?.abnOrRegistry ? (
                          <p className="mt-1 text-xs text-[var(--rq-muted)]">
                            Registry / ABN · {item.enrichmentMeta.abnOrRegistry}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-[var(--rq-muted)]">
                          {(item.enrichmentMeta?.matchReasons ?? []).join(" · ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="success">
                          {item.enrichmentMeta?.usedAi ? "AI extracted" : "Web scrape"}
                        </Badge>
                        {typeof item.enrichmentMeta?.confidence === "number" ? (
                          <Badge variant="muted">
                            {Math.round(item.enrichmentMeta.confidence * 100)}%
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.websiteUrl && isPublicWebsiteUrl(item.websiteUrl) ? (
                        <Button asChild size="sm" variant="outline">
                          <a
                            href={item.websiteUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open website
                          </a>
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        disabled={pending}
                        onClick={() => startAdd(item)}
                      >
                        Use data — add company
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-surface)] p-4">
            <p className="text-sm text-[var(--rq-slate)]">
              You can review an unclaimed company and RateQuip will invite them
              to claim it. Contact emails you supply stay private. Web-scraped
              fields are public facts only — always review before publishing.
            </p>
            <Button
              className="mt-4"
              onClick={() => startAdd()}
              disabled={pending || q.trim().length < 2}
              variant="outline"
            >
              None of these — add manually
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
                  {item.city}, {item.country}
                  {isPublicWebsiteUrl(item.website)
                    ? ` · ${item.website.replace(/^https?:\/\//, "")}`
                    : ""}
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
