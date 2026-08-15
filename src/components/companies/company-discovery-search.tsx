"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { writeLocalDraft } from "@/components/organic-growth/use-listing-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  headline?: string;
  description?: string;
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

type WebSearchHit = { title: string; url: string; snippet: string };

type LiveMatchPreview = {
  status: "idle" | "checking" | "found" | "none";
  count: number;
  topName?: string;
};

/** Treat pasted URLs / bare domains as website lookups for domain matching. */
function websiteUrlFromQuery(query: string): string | undefined {
  const trimmed = query.trim();
  if (!trimmed) return undefined;
  if (isPublicWebsiteUrl(trimmed)) return trimmed;
  if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return undefined;
}

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
  const [manualName, setManualName] = useState(initialQuery);
  const [manualDescription, setManualDescription] = useState("");
  const [manualWebsite, setManualWebsite] = useState("");
  const [candidates, setCandidates] = useState<DuplicateCandidate[] | null>(
    null,
  );
  const [webEnrichments, setWebEnrichments] = useState<WebEnrichmentCard[]>(
    [],
  );
  const [webSearchHits, setWebSearchHits] = useState<WebSearchHit[]>([]);
  const [webMessage, setWebMessage] = useState<string | null>(null);
  const [coverageSummary, setCoverageSummary] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [liveMatch, setLiveMatch] = useState<LiveMatchPreview>({
    status: "idle",
    count: 0,
  });
  const [matchNoticeDismissed, setMatchNoticeDismissed] = useState(false);
  const [pending, startTransition] = useTransition();
  const matchNoticeShownFor = useRef<string | null>(null);

  const showAdd = intent === "add" || intent === "both";
  const showClaim = intent === "claim" || intent === "both";
  const claimLoop = intent === "claim" || returnToClaimAfterPublish;

  function runSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const query = q.trim();
    if (query.length < 2) return;
    if (!manualName.trim()) setManualName(query);
    startTransition(async () => {
      const result = await searchCompaniesForAdd({
        q: query,
        country,
        websiteUrl: websiteUrlFromQuery(query),
        includeWeb: true,
      });
      if (!result.ok) {
        setMessage(result.message);
        setCandidates([]);
        setWebEnrichments([]);
        setWebSearchHits([]);
        setWebMessage(null);
        setCoverageSummary(null);
        setSearched(false);
        return;
      }
      setMessage(null);
      setCandidates(result.candidates);
      setWebEnrichments((result.webEnrichments ?? []) as WebEnrichmentCard[]);
      setWebSearchHits(result.webSearchHits ?? []);
      setWebMessage(result.webMessage ?? null);
      const cov = result.coverage;
      setCoverageSummary(
        cov
          ? [
              cov.lanesUsed.length
                ? `Lanes: ${cov.lanesUsed.join(", ")}`
                : null,
              cov.rosterPagesFetched
                ? `${cov.rosterPagesFetched} roster page${cov.rosterPagesFetched === 1 ? "" : "s"}`
                : null,
              cov.candidatesFromRosters
                ? `${cov.candidatesFromRosters} from lists`
                : null,
              cov.candidatesFromLateral
                ? `${cov.candidatesFromLateral} related`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || null
          : null,
      );
      setSearched(true);
    });
  }

  useEffect(() => {
    if (!autoSearch || initialQuery.trim().length < 2) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot on mount
  }, []);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setLiveMatch({ status: "idle", count: 0 });
      return;
    }

    let cancelled = false;
    setLiveMatch((prev) => ({ ...prev, status: "checking" }));
    const timer = window.setTimeout(() => {
      void (async () => {
        const result = await searchCompaniesForAdd({
          q: query,
          country,
          websiteUrl: websiteUrlFromQuery(query),
          includeWeb: false,
        });
        if (cancelled) return;
        if (!result.ok) {
          setLiveMatch({ status: "idle", count: 0 });
          return;
        }
        const strong = result.candidates.filter(
          (c) => c.matchLevel === "exact" || c.matchLevel === "likely",
        );
        const hits = strong.length > 0 ? strong : result.candidates;
        if (hits.length === 0) {
          setLiveMatch({ status: "none", count: 0 });
          return;
        }
        setLiveMatch({
          status: "found",
          count: hits.length,
          topName: hits[0]?.name,
        });
      })();
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, country]);

  function markClaimAfterPublish() {
    try {
      sessionStorage.setItem(CLAIM_AFTER_PUBLISH_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  function startAdd(enrichment?: WebEnrichmentCard, skipDuplicates = false) {
    if (claimLoop) markClaimAfterPublish();
    startTransition(async () => {
      const result = await startListingSubmission({
        searchQuery: enrichment?.companyName || manualName.trim() || q,
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
              headline: enrichment.headline,
              description: enrichment.description,
              privateNotes: enrichment.privateNotes,
              categories: enrichment.categories,
            }
          : {
              companyName: manualName.trim() || q.trim(),
              websiteUrl: manualWebsite.trim() || undefined,
              description: manualDescription.trim() || undefined,
              headline: manualDescription.trim().slice(0, 180) || undefined,
            },
      });
      if (!result.ok) return;
      writeLocalDraft(result.submission as never);
      const fromClaim = claimLoop ? "&from=claim" : "";
      const next =
        enrichment || skipDuplicates
          ? `/companies/add/details?submissionId=${result.submission.id}${fromClaim}`
          : `/companies/add/duplicates?submissionId=${result.submission.id}${fromClaim}`;
      router.push(next);
    });
  }

  function startManualAdd(e?: React.FormEvent) {
    e?.preventDefault();
    const name = manualName.trim() || q.trim();
    if (name.length < 2) {
      setMessage("Enter a company name (at least 2 characters).");
      return;
    }
    setMessage(null);
    startAdd(
      {
        companyName: name,
        websiteUrl: manualWebsite.trim() || undefined,
        description: manualDescription.trim() || undefined,
        headline: manualDescription.trim().slice(0, 180) || undefined,
        companyTypes: [],
        categories: [],
      },
      true,
    );
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

  const matchNotice = useMemo(() => {
    const directoryCount = exact.length + likely.length;
    if (searched && directoryCount > 0) {
      const top = exact[0] ?? likely[0];
      return {
        key: `dir:${top?.companyId ?? directoryCount}`,
        title:
          directoryCount === 1
            ? "We found a match"
            : `We found ${directoryCount} matches`,
        detail: top
          ? `${top.name} on RateQuip${top.claimed ? " (already claimed)" : " — unclaimed"}`
          : "Matching companies on RateQuip",
      };
    }
    if (searched && webEnrichments.length > 0) {
      const top = webEnrichments[0];
      return {
        key: `web:${top?.websiteUrl ?? top?.companyName ?? webEnrichments.length}`,
        title:
          webEnrichments.length === 1
            ? "We found a match"
            : `We found ${webEnrichments.length} matches`,
        detail: top
          ? `${top.companyName} on the public web`
          : "Matching companies on the public web",
      };
    }
    if (liveMatch.status === "found") {
      return {
        key: `live:${liveMatch.topName ?? liveMatch.count}`,
        title:
          liveMatch.count === 1
            ? "We found a match"
            : `We found ${liveMatch.count} matches`,
        detail: liveMatch.topName
          ? `${liveMatch.topName} on RateQuip — search companies to review`
          : "Matching companies on RateQuip — search to review",
      };
    }
    return null;
  }, [exact, likely, liveMatch, searched, webEnrichments]);

  useEffect(() => {
    if (!matchNotice) {
      matchNoticeShownFor.current = null;
      return;
    }
    if (matchNoticeShownFor.current === matchNotice.key) return;
    matchNoticeShownFor.current = matchNotice.key;
    setMatchNoticeDismissed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [matchNotice]);

  return (
    <div className={embedded ? "space-y-6" : "space-y-6"}>
      {matchNotice && !matchNoticeDismissed ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-16 z-30 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950 shadow-sm"
        >
          <div className="mx-auto flex max-w-3xl items-start justify-between gap-3 sm:px-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold">{matchNotice.title}</p>
              <p className="mt-0.5 text-sm text-emerald-800">
                {matchNotice.detail}
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-md px-2 py-1 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
              onClick={() => setMatchNoticeDismissed(true)}
              aria-label="Dismiss match notification"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      <form onSubmit={runSearch} className="space-y-4">
        <div>
          <Label htmlFor="discovery-q">Company name, website or location</Label>
          <Input
            id="discovery-q"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSearched(false);
              setMatchNoticeDismissed(false);
              if (!manualName || manualName === q) {
                setManualName(e.target.value);
              }
            }}
            className="mt-1"
            placeholder="e.g. InkjetPrint or inkjetprint.com.au"
            required
            minLength={2}
            aria-describedby="discovery-q-live discovery-q-help"
          />
          <div id="discovery-q-live" className="mt-2 min-h-5" aria-live="polite">
            {liveMatch.status === "checking" ? (
              <p className="text-sm text-[var(--rq-muted)]">
                Checking RateQuip for a match…
              </p>
            ) : liveMatch.status === "found" ? (
              <p className="text-sm font-medium text-emerald-700">
                {liveMatch.count === 1
                  ? `We found a match${liveMatch.topName ? `: ${liveMatch.topName}` : ""}.`
                  : `We found ${liveMatch.count} matches on RateQuip${
                      liveMatch.topName ? `, including ${liveMatch.topName}` : ""
                    }.`}{" "}
                <span className="font-normal text-[var(--rq-slate)]">
                  Search companies to review and claim.
                </span>
              </p>
            ) : liveMatch.status === "none" ? (
              <p className="text-sm text-[var(--rq-muted)]">
                No RateQuip listing yet — search to check public sources, or add
                it below.
              </p>
            ) : null}
          </div>
          <p id="discovery-q-help" className="mt-2 text-sm text-[var(--rq-muted)]">
            Searches RateQuip&apos;s directory plus public company sites, trade
            fair / association lists, and distributor brand pages. Add a country
            to unlock regional and in-language coverage probes.
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
          {pending ? "Coverage search in progress…" : "Search companies"}
        </Button>
        {message ? <p className="text-sm text-amber-700">{message}</p> : null}
      </form>

      <section className="rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-surface)] p-4">
        <h2 className="text-sm font-semibold text-[var(--rq-ink)]">
          Not in our directory? Add it yourself
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-slate)]">
          Enter the company name and a brief description. Optional website helps
          AI scrape public contact details on the next step.
        </p>
        <form onSubmit={startManualAdd} className="mt-4 space-y-3">
          <div>
            <Label htmlFor="manual-name">Company name</Label>
            <Input
              id="manual-name"
              className="mt-1"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Trading or legal name"
              minLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="manual-description">Brief description</Label>
            <Textarea
              id="manual-description"
              className="mt-1"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="What they supply or do, city, and any useful public context…"
              maxLength={600}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="manual-website">Website (optional)</Label>
            <Input
              id="manual-website"
              className="mt-1"
              value={manualWebsite}
              onChange={(e) => setManualWebsite(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            disabled={pending || (manualName.trim() || q.trim()).length < 2}
          >
            {claimLoop
              ? "Continue with this company, then claim"
              : "Continue with this company"}
          </Button>
        </form>
      </section>

      {searched ? (
        <div className="mt-2 space-y-6">
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
              Found on the public web
            </h2>
            {webMessage ? (
              <p className="mt-2 text-sm text-[var(--rq-slate)]">{webMessage}</p>
            ) : null}
            {coverageSummary ? (
              <p className="mt-1 text-xs text-[var(--rq-muted)]">
                Coverage discovery · {coverageSummary}
              </p>
            ) : null}
            {webEnrichments.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--rq-muted)]">
                No enrichable public websites found yet. Use the manual form
                above, or try a full website URL in search.
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
                        {item.headline || item.description ? (
                          <p className="mt-1 text-sm text-[var(--rq-slate)]">
                            {(item.headline || item.description || "").slice(
                              0,
                              220,
                            )}
                          </p>
                        ) : null}
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
                              : item.enrichmentMeta?.source === "web_search"
                                ? "Web search"
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
                          {claimLoop
                            ? "Add company, then claim"
                            : "Use data — add company"}
                        </Button>
                      ) : null}
                    </div>
                    {claimLoop ? (
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

          {webSearchHits.length > 0 ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
                Other public search hits
              </h2>
              <ul className="mt-3 space-y-2">
                {webSearchHits.slice(0, 6).map((hit) => (
                  <li
                    key={hit.url}
                    className="flex flex-wrap items-start justify-between gap-3 rounded-md border border-[var(--rq-border)] px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--rq-ink)]">
                        {hit.title}
                      </p>
                      <p className="truncate text-[var(--rq-muted)]">
                        {hit.url.replace(/^https?:\/\//, "")}
                      </p>
                      {hit.snippet ? (
                        <p className="mt-1 text-[var(--rq-slate)]">
                          {hit.snippet.slice(0, 160)}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={hit.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Button>
                      {showAdd || intent === "claim" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pending}
                          onClick={() =>
                            startAdd({
                              companyName:
                                hit.title.split(/[|\-–—]/)[0]?.trim() ||
                                q.trim(),
                              websiteUrl: hit.url,
                              description: hit.snippet || undefined,
                              headline: hit.snippet?.slice(0, 180),
                              publicSourceUrl: hit.url,
                              companyTypes: [],
                              categories: [],
                            })
                          }
                        >
                          Use this site
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
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
