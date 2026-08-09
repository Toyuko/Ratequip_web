"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { writeLocalDraft } from "@/components/organic-growth/use-listing-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  searchCompaniesForAdd,
  startListingSubmission,
} from "@/lib/actions/organic-growth";
import type {
  CompanyType,
  DuplicateCandidate,
} from "@/lib/organic-growth/types";
import { isPublicWebsiteUrl } from "@/lib/utils";

export const CLAIM_AFTER_PUBLISH_KEY = "rq_claim_after_publish";

export type DiscoveryIntent = "add" | "claim" | "both";

export type WebEnrichmentCard = {
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
    registryMeta?: {
      provider: string;
      status?: string;
      acn?: string;
      sourceUrl?: string;
    };
  };
};

type CompanyDiscoverySearchProps = {
  intent?: DiscoveryIntent;
  initialQuery?: string;
  initialCountry?: string;
  /** Claim wizard: select an existing directory company by slug. */
  onSelectDirectoryCompany?: (slug: string) => void;
  /** After publish from an add started here, redirect into claim confirm. */
  returnToClaimAfterPublish?: boolean;
  /** Hide outer spacing when embedded in claim shell. */
  embedded?: boolean;
  autoSearch?: boolean;
};

export function CompanyDiscoverySearch({
  intent = "both",
  initialQuery = "",
  initialCountry = "",
  onSelectDirectoryCompany,
  returnToClaimAfterPublish = false,
  embedded = false,
  autoSearch = false,
}: CompanyDiscoverySearchProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [country, setCountry] = useState(initialCountry);
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(
    null,
  );
  const [webEnrichments, setWebEnrichments] = useState<WebEnrichmentCard[]>(
    [],
  );
  const [webMessage, setWebMessage] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const showAdd = intent === "add" || intent === "both";
  const showClaim = intent === "claim" || intent === "both";

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (query.length < 2) return;
    startTransition(async () => {
      const result = await searchCompaniesForAdd({
        q: query,
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
      setWebEnrichments((result.webEnrichments ?? []) as WebEnrichmentCard[]);
      setWebMessage(result.webMessage ?? null);
      setSearched(true);
    });
  }

  useEffect(() => {
    if (!autoSearch || initialQuery.trim().length < 2) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, []);

  function markClaimAfterPublish() {
    try {
      sessionStorage.setItem(CLAIM_AFTER_PUBLISH_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function startAdd(enrichment?: WebEnrichmentCard) {
    const claimLoop =
      intent === "claim" || returnToClaimAfterPublish;
    if (claimLoop) markClaimAfterPublish();
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
      const fromClaim = claimLoop ? "&from=claim" : "";
      const next = enrichment
        ? `/companies/add/details?submissionId=${result.submission.id}${fromClaim}`
        : `/companies/add/duplicates?submissionId=${result.submission.id}${fromClaim}`;
      router.push(next);
    });
  }

  function claimDirectory(slug: string) {
    if (onSelectDirectoryCompany) {
      onSelectDirectoryCompany(slug);
      return;
    }
    router.push(`/companies/claim?company=${encodeURIComponent(slug)}`);
  }

  const exact = candidates?.filter((c) => c.matchLevel === "exact") ?? [];
  const likely = candidates?.filter((c) => c.matchLevel === "likely") ?? [];
  const other = candidates?.filter((c) => c.matchLevel === "possible") ?? [];

  return (
    <div className={embedded ? "" : "space-y-6"}>
      <form onSubmit={runSearch} className="space-y-4">
        <div>
          <Label htmlFor="discovery-q">Company name, website or location</Label>
          <Input
            id="discovery-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="mt-1"
            placeholder="e.g. InkjetPrint or inkjetprint.com.au"
            required
            minLength={2}
          />
          <p className="mt-2 text-sm text-[var(--rq-muted)]">
            We&apos;ll search RateQuip&apos;s directory and public sources
            (registry, website, marketplaces, socials).
          </p>
        </div>
        <div>
          <Label htmlFor="discovery-country">Country filter (optional)</Label>
          <Input
            id="discovery-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1"
            placeholder="Australia, Thailand, Germany…"
          />
        </div>
        <Button type="submit" disabled={pending || q.trim().length < 2}>
          {pending ? "Searching directory + web…" : "Search companies"}
        </Button>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      </form>

      {searched ? (
        <div className="mt-8 space-y-6">
          <DirectoryGroup
            title="Exact matches on RateQuip"
            items={exact}
            showClaim={showClaim}
            showAdd={showAdd}
            pending={pending}
            onClaim={claimDirectory}
            onAddExisting={(item) =>
              startAdd({
                companyName: item.name,
                websiteUrl: item.website || undefined,
                companyTypes: [],
                countryCode: item.country,
                locality: item.city,
                categories: [],
              })
            }
          />
          <DirectoryGroup
            title="Likely matches on RateQuip"
            items={likely}
            showClaim={showClaim}
            showAdd={showAdd}
            pending={pending}
            onClaim={claimDirectory}
            onAddExisting={(item) =>
              startAdd({
                companyName: item.name,
                websiteUrl: item.website || undefined,
                companyTypes: [],
                countryCode: item.country,
                locality: item.city,
                categories: [],
              })
            }
          />
          <DirectoryGroup
            title="Other RateQuip results"
            items={other}
            showClaim={showClaim}
            showAdd={showAdd}
            pending={pending}
            onClaim={claimDirectory}
            onAddExisting={(item) =>
              startAdd({
                companyName: item.name,
                websiteUrl: item.website || undefined,
                companyTypes: [],
                countryCode: item.country,
                locality: item.city,
                categories: [],
              })
            }
          />

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
              Found on the web
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
                    className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
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
                        {(item.phoneNumbers?.length || item.phoneDisplay) && (
                          <p className="mt-1 text-sm text-[var(--rq-slate)]">
                            Phone ·{" "}
                            {(item.phoneNumbers?.length
                              ? item.phoneNumbers
                              : [item.phoneDisplay]
                            )
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
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
                            Registry / ABN ·{" "}
                            {item.enrichmentMeta.abnOrRegistry}
                            {item.enrichmentMeta.registryMeta?.status
                              ? ` · ${item.enrichmentMeta.registryMeta.status}`
                              : ""}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-[var(--rq-muted)]">
                          {(item.enrichmentMeta?.matchReasons ?? []).join(
                            " · ",
                          )}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="success">
                          {item.enrichmentMeta?.registryMeta
                            ? "Registry + web"
                            : item.enrichmentMeta?.usedAi
                              ? "AI extracted"
                              : "Web scrape"}
                        </Badge>
                        {typeof item.enrichmentMeta?.confidence ===
                        "number" ? (
                          <Badge variant="muted">
                            {Math.round(
                              item.enrichmentMeta.confidence * 100,
                            )}
                            %
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.websiteUrl &&
                      isPublicWebsiteUrl(item.websiteUrl) ? (
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
                      {showAdd || intent === "claim" ? (
                        <Button
                          size="sm"
                          disabled={pending}
                          onClick={() => startAdd(item)}
                        >
                          {intent === "claim" || returnToClaimAfterPublish
                            ? "Add company, then claim"
                            : "Use data — add company"}
                        </Button>
                      ) : null}
                    </div>
                    {intent === "claim" || returnToClaimAfterPublish ? (
                      <p className="mt-2 text-xs text-[var(--rq-muted)]">
                        This business isn&apos;t on RateQuip yet. Add the
                        listing first — we&apos;ll bring you straight back to
                        claim.
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {showAdd || intent === "claim" ? (
            <div className="rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-surface)] p-4">
              <p className="text-sm text-[var(--rq-slate)]">
                {intent === "claim" || returnToClaimAfterPublish
                  ? "No match? Add the company with public facts, then continue claiming."
                  : "You can add an unclaimed company and invite them to claim it. Web-scraped fields are public facts only — always review before publishing."}
              </p>
              <Button
                className="mt-4"
                onClick={() => startAdd()}
                disabled={pending || q.trim().length < 2}
                variant="outline"
              >
                {intent === "claim" || returnToClaimAfterPublish
                  ? "Add manually, then claim"
                  : "None of these — add manually"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DirectoryGroup({
  title,
  items,
  showClaim,
  showAdd,
  pending,
  onClaim,
  onAddExisting,
}: {
  title: string;
  items: DuplicateCandidate[];
  showClaim: boolean;
  showAdd: boolean;
  pending: boolean;
  onClaim: (slug: string) => void;
  onAddExisting: (item: DuplicateCandidate) => void;
}) {
  if (items.length === 0) {
    return (
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[var(--rq-muted)]">
          No {title.toLowerCase()}.
        </p>
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
            className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
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
                  {[item.city, item.country].filter(Boolean).join(", ")}
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
                {item.verified ? (
                  <Badge variant="success">Verified</Badge>
                ) : null}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href={`/companies/${item.companySlug}`}>
                  {item.claimed ? "View profile" : "Open profile"}
                </Link>
              </Button>
              {showClaim && !item.claimed ? (
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => onClaim(item.companySlug)}
                >
                  Claim this company
                </Button>
              ) : null}
              {showClaim && item.claimed ? (
                <Button asChild size="sm" variant="outline">
                  <Link href={`/companies/${item.companySlug}`}>
                    Ask an admin / view profile
                  </Link>
                </Button>
              ) : null}
              {showAdd && !showClaim ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={() => onAddExisting(item)}
                >
                  Use as add draft
                </Button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
