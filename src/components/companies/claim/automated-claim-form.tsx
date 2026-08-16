"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ClaimWizardShell,
  claimProgressStep,
} from "@/components/companies/claim/claim-wizard-shell";
import { CompanyDiscoverySearch } from "@/components/companies/company-discovery-search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  completeAutomatedClaim,
  getClaimCompanyContext,
  sendClaimEmailCode,
} from "@/lib/actions/claims";
import type {
  ClaimMethod,
  ClaimOutcome,
  ClaimRelationship,
  DiscoveredSource,
} from "@/lib/claims/types";

type Stage =
  | "lookup"
  | "confirm"
  | "relationship"
  | "verify"
  | "review"
  | "result";

type ClaimCompany = {
  id: string;
  name: string;
  legalName: string;
  slug: string;
  website: string;
  city: string;
  country: string;
  phone?: string;
  abn?: string;
  emailDomain?: string;
  logoUrl?: string;
  claimed: boolean;
  verified: boolean;
  headline: string;
};

const RELATIONSHIPS: Array<{
  id: ClaimRelationship;
  label: string;
  description: string;
}> = [
  {
    id: "owner_director",
    label: "Owner or director",
    description: "You're a legal owner or officer of the business.",
  },
  {
    id: "employee",
    label: "Employee",
    description: "You work at the company but aren't an owner.",
  },
  {
    id: "authorised_representative",
    label: "Authorised agency or representative",
    description: "You manage this profile on the company's behalf.",
  },
  {
    id: "contractor",
    label: "Contractor or consultant",
    description: "You do work for the company but aren't staff.",
  },
];

const METHOD_COPY: Array<{
  id: ClaimMethod;
  title: string;
  description: string;
  recommended?: boolean;
}> = [
  {
    id: "company_email",
    title: "Verify using my company email",
    description: "Fastest path — we'll send a one-time code.",
    recommended: true,
  },
  {
    id: "admin_approval",
    title: "Ask an existing admin to approve me",
    description: "An admin on this profile confirms your access.",
  },
  {
    id: "company_phone",
    title: "Verify using the company's published phone",
    description: "We'll call or text the number on public record.",
  },
  {
    id: "website_control",
    title: "Verify control of the company website",
    description: "Add a DNS record or upload a small file.",
  },
];

function methodLabel(method: ClaimMethod) {
  return (
    METHOD_COPY.find((m) => m.id === method)?.title ??
    method.replaceAll("_", " ")
  );
}

function relationshipLabel(id: ClaimRelationship) {
  return RELATIONSHIPS.find((r) => r.id === id)?.label ?? id;
}

export function AutomatedClaimForm({
  initialSlug,
  initialQuery,
}: {
  initialSlug: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>(
    initialSlug ? "confirm" : "lookup",
  );
  const [error, setError] = useState<string | null>(null);
  const [companyQuery, setCompanyQuery] = useState(
    initialQuery || initialSlug || "",
  );
  const [company, setCompany] = useState<ClaimCompany | null>(null);
  const [sources, setSources] = useState<DiscoveredSource[]>([]);
  const [loading, setLoading] = useState(Boolean(initialSlug));
  const [relationship, setRelationship] = useState<ClaimRelationship | null>(
    null,
  );
  const [method, setMethod] = useState<ClaimMethod>("company_email");
  const [workEmail, setWorkEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [demoCode, setDemoCode] = useState<string | undefined>();
  const [codeSent, setCodeSent] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<ClaimOutcome | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const progressStep = claimProgressStep(stage);
  const displayName = company?.legalName || company?.name || "";
  const domain = company?.emailDomain;

  const selectedSources = useMemo(
    () => sources.filter((s) => selectedSourceIds.includes(s.id)),
    [sources, selectedSourceIds],
  );

  useEffect(() => {
    if (!initialSlug) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const result = await getClaimCompanyContext(initialSlug);
      if (cancelled) return;
      if (!result.ok) {
        setError(result.message);
        setLoading(false);
        setStage("lookup");
        return;
      }
      applyCompanyResult(result);
      setStage("confirm");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSlug]);

  function applyCompanyResult(result: {
    company: ClaimCompany;
    sources: DiscoveredSource[];
  }) {
    setCompany(result.company);
    setSources(result.sources);
    setSelectedSourceIds(
      result.sources
        .filter(
          (s) =>
            s.kind === "linkedin" ||
            s.kind === "google_business" ||
            s.kind === "abn" ||
            s.kind === "website",
        )
        .map((s) => s.id),
    );
    setCompanyQuery(result.company.name);
    setWorkEmail("");
    setCodeSent(false);
    setDemoCode(undefined);
    setEmailCode("");
  }

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectDirectoryCompany(slug: string) {
    setError(null);
    startTransition(async () => {
      const result = await getClaimCompanyContext(slug);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      applyCompanyResult(result);
      setStage("confirm");
      router.replace(`/companies/claim?company=${encodeURIComponent(slug)}`, {
        scroll: false,
      });
    });
  }

  function submitClaim() {
    if (!company || !relationship) return;
    setError(null);
    startTransition(async () => {
      const result = await completeAutomatedClaim({
        companySlug: company.slug,
        relationship,
        method,
        workEmail:
          method === "company_email" ? workEmail.trim() || undefined : undefined,
        emailCode: method === "company_email" ? emailCode : undefined,
        selectedSourceIds,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOutcome(result.outcome);
      setResultMessage(result.message);
      setStage("result");
      router.refresh();
    });
  }

  function resetClaim() {
    setError(null);
    setCompany(null);
    setSources([]);
    setSelectedSourceIds([]);
    setRelationship(null);
    setMethod("company_email");
    setWorkEmail("");
    setEmailCode("");
    setDemoCode(undefined);
    setCodeSent(false);
    setOutcome(null);
    setResultMessage(null);
    setStage("lookup");
    router.replace("/companies/claim", { scroll: false });
  }

  function jumpToStep(step: ReturnType<typeof claimProgressStep>) {
    if (step === "lookup") {
      if (company) {
        setStage("confirm");
        return;
      }
      resetClaim();
      return;
    }
    if (!company) {
      setStage("lookup");
      return;
    }
    if (step === "relationship") setStage("relationship");
    else if (step === "verify") setStage(relationship ? "verify" : "relationship");
    else setStage(relationship ? "review" : "relationship");
  }

  const shellTitle =
    stage === "lookup" || stage === "confirm"
      ? "Claim a company profile"
      : stage === "relationship"
        ? "How are you connected?"
        : stage === "verify"
          ? "Verify your connection"
          : stage === "review"
            ? "Review your claim"
            : stage === "result" && outcome?.startsWith("verified")
              ? "You're verified"
              : "Claim result";

  const shellDescription =
    stage === "lookup" || stage === "confirm"
      ? "Search RateQuip and public sources for the company you represent. Claim an existing profile, or add it first if it’s missing."
      : stage === "relationship"
        ? "This determines what level of access you can be granted."
        : stage === "verify"
          ? "Most claims take under a minute. Pick whichever is easiest for you."
          : stage === "review"
            ? "Check everything looks right before you submit."
            : "Here's what happens next.";

  if (loading) {
    return (
      <ClaimWizardShell
        step="lookup"
        title="Claim a company profile"
        description="Loading company details…"
        onCancel={resetClaim}
      >
        <p className="text-sm text-[var(--rq-muted)]">Loading…</p>
      </ClaimWizardShell>
    );
  }

  return (
    <ClaimWizardShell
      step={progressStep}
      title={shellTitle}
      description={shellDescription}
      onCancel={stage === "result" ? undefined : resetClaim}
      onSelectStep={stage === "result" ? undefined : jumpToStep}
    >
      {stage === "lookup" ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
          <CompanyDiscoverySearch
            intent="claim"
            initialQuery={companyQuery || initialQuery}
            embedded
            autoSearch={Boolean(initialQuery && !initialSlug)}
            onSelectDirectoryCompany={selectDirectoryCompany}
          />
        </section>
      ) : null}

      {stage === "confirm" && company ? (
        <section className="space-y-6">
          <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-[var(--rq-navy)] text-lg font-bold text-white">
                {company.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={company.logoUrl}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 space-y-1 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-[var(--rq-ink)]">
                    {displayName}
                  </span>
                  {company.abn ? (
                    <Badge variant="success">ABN active</Badge>
                  ) : company.claimed ? (
                    <Badge variant="success">Claimed</Badge>
                  ) : (
                    <Badge variant="warning">Unclaimed</Badge>
                  )}
                </div>
                {company.website ? (
                  <p className="text-[var(--rq-slate)]">
                    {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </p>
                ) : null}
                <p className="text-[var(--rq-slate)]">
                  {[company.city, company.country].filter(Boolean).join(", ") ||
                    "—"}
                </p>
                {company.abn ? (
                  <p className="text-[var(--rq-slate)]">
                    <span className="text-[var(--rq-muted)]">ABN · </span>
                    {company.abn}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          {sources.length > 0 ? (
            <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
              <h2 className="text-sm font-semibold text-[var(--rq-ink)]">
                {sources.length} public profile
                {sources.length === 1 ? "" : "s"} found — confirm the ones that
                are you:
              </h2>
              <ul className="mt-4 space-y-2">
                {sources.map((source) => (
                  <li key={source.id}>
                    <label className="flex cursor-pointer gap-3 rounded-md border border-[var(--rq-border)] bg-[var(--rq-bg)] px-3 py-3 text-sm hover:bg-[var(--rq-hover)]">
                      <input
                        type="checkbox"
                        checked={selectedSourceIds.includes(source.id)}
                        onChange={() => toggleSource(source.id)}
                        className="mt-1 accent-[var(--rq-orange)]"
                      />
                      <span className="min-w-0">
                        <span className="font-medium text-[var(--rq-ink)]">
                          {source.label}
                        </span>
                        <span className="mt-0.5 block break-all text-[var(--rq-muted)]">
                          {source.value}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={() => setStage("relationship")}>
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCompany(null);
                setSources([]);
                setStage("lookup");
              }}
            >
              Search again
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "relationship" && company ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--rq-ink)]">
            Your relationship to {displayName}
          </h2>
          <ul className="mt-4 space-y-2">
            {RELATIONSHIPS.map((option) => {
              const selected = relationship === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => setRelationship(option.id)}
                    className={`flex w-full items-start gap-3 rounded-md border px-4 py-3 text-left transition-colors ${
                      selected
                        ? "border-[var(--rq-orange)] bg-orange-50"
                        : "border-[var(--rq-border)] bg-[var(--rq-bg)] hover:bg-[var(--rq-hover)]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[var(--rq-orange)] bg-[var(--rq-orange)]"
                          : "border-[var(--rq-border)]"
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[var(--rq-ink)]">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-[var(--rq-slate)]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("confirm")}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={!relationship}
              onClick={() => setStage("verify")}
            >
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "verify" && company ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <h2 className="text-sm font-semibold text-[var(--rq-ink)]">
            Choose how you&apos;d like to verify
          </h2>
          <div className="mt-4 space-y-3">
            {METHOD_COPY.map((option) => {
              const selected = method === option.id;
              return (
                <div
                  key={option.id}
                  className={`rounded-md border px-4 py-3 transition-colors ${
                    selected
                      ? "border-[var(--rq-orange)] bg-orange-50"
                      : "border-[var(--rq-border)] bg-[var(--rq-bg)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setMethod(option.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        selected
                          ? "border-[var(--rq-orange)] bg-[var(--rq-orange)]"
                          : "border-[var(--rq-border)]"
                      }`}
                      aria-hidden
                    >
                      {selected ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--rq-ink)]">
                          {option.id === "company_email" && domain
                            ? `Verify using my @${domain} email`
                            : option.title}
                        </span>
                        {option.recommended ? (
                          <Badge variant="success">Recommended</Badge>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-sm text-[var(--rq-slate)]">
                        {option.description}
                      </span>
                    </span>
                  </button>

                  {selected && option.id === "company_email" ? (
                    <div className="mt-4 space-y-3 border-t border-[var(--rq-border)] pt-4">
                      <div>
                        <Label htmlFor="workEmail">Work email</Label>
                        <Input
                          id="workEmail"
                          type="email"
                          className="mt-1"
                          placeholder={
                            domain ? `you@${domain}` : "you@company.com"
                          }
                          value={workEmail}
                          onChange={(e) => {
                            setWorkEmail(e.target.value);
                            setCodeSent(false);
                            setDemoCode(undefined);
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={pending || !workEmail.includes("@")}
                        onClick={() =>
                          startTransition(async () => {
                            setError(null);
                            const sent = await sendClaimEmailCode({
                              companySlug: company.slug,
                              email: workEmail,
                            });
                            if (!sent.ok) {
                              setError(sent.message);
                              return;
                            }
                            setCodeSent(true);
                            setDemoCode(sent.demoCode);
                            if (sent.demoCode) setEmailCode(sent.demoCode);
                          })
                        }
                      >
                        {pending ? "Sending…" : "Send verification code"}
                      </Button>
                      {codeSent ? (
                        <div>
                          <Label htmlFor="emailCode">Verification code</Label>
                          <Input
                            id="emailCode"
                            className="mt-1"
                            inputMode="numeric"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                          />
                          {demoCode ? (
                            <p className="mt-2 text-xs text-[var(--rq-muted)]">
                              Demo mode: code <code>{demoCode}</code>
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-[var(--rq-muted)]">
                              Check your work inbox for the code.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {selected && option.id === "admin_approval" ? (
                    <StubPanel body="We'll notify an existing profile admin. Demo mode records this as an admin-approval signal." />
                  ) : null}
                  {selected && option.id === "company_phone" ? (
                    <StubPanel
                      body={`Demo: confirm a code sent to ${company.phone || "the published company number"}.`}
                    />
                  ) : null}
                  {selected && option.id === "website_control" ? (
                    <StubPanel
                      body={`Demo: confirm temporary DNS TXT or verification file on ${company.website || "the company website"}.`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("relationship")}
            >
              Back
            </Button>
            <Button
              type="button"
              disabled={
                method === "company_email" && (!codeSent || !emailCode.trim())
              }
              onClick={() => {
                setError(null);
                setStage("review");
              }}
            >
              Continue
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "review" && company && relationship ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <dl className="space-y-3 text-sm">
            <ReviewRow label="Company" value={displayName} />
            <ReviewRow label="ABN" value={company.abn || "—"} />
            <ReviewRow
              label="Your relationship"
              value={relationshipLabel(relationship)}
            />
            <ReviewRow
              label="Verification method"
              value={methodLabel(method)}
            />
            <ReviewRow
              label="Details"
              value={
                method === "company_email"
                  ? workEmail || "—"
                  : company.phone || company.website || "—"
              }
            />
            <ReviewRow
              label="Supporting sources"
              value={
                selectedSources.length > 0
                  ? selectedSources.map((s) => s.label).join(", ")
                  : "None selected"
              }
            />
          </dl>
          <p className="mt-5 flex items-start gap-2 text-xs text-[var(--rq-muted)]">
            <span aria-hidden>🔒</span>
            Your verification information stays private and is never shown
            publicly.
          </p>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("verify")}
            >
              Back
            </Button>
            <Button type="button" disabled={pending} onClick={submitClaim}>
              {pending ? "Submitting…" : "Submit claim"}
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "result" && outcome && company ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <Badge
            variant={
              outcome.startsWith("verified")
                ? "success"
                : outcome === "blocked_conflict"
                  ? "warning"
                  : "muted"
            }
          >
            {outcome === "verified_representative"
              ? "Verified representative — access granted"
              : outcome === "verified_controller"
                ? "Verified controller — access granted"
                : outcome.replaceAll("_", " ")}
          </Badge>
          <h2 className="mt-4 text-2xl font-bold text-[var(--rq-ink)]">
            {outcome.startsWith("verified")
              ? "You're verified"
              : outcome === "blocked_conflict"
                ? "Claim blocked"
                : "Stronger proof required"}
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">{resultMessage}</p>
          {outcome.startsWith("verified") ? (
            <p className="mt-2 text-sm text-[var(--rq-muted)]">
              Ownership transfer, billing and admin removal still require a
              stronger check.
            </p>
          ) : null}
          {outcome.startsWith("verified") ? (
            <div className="mt-5 rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-bg)] p-4">
              <p className="text-sm font-medium text-[var(--rq-ink)]">
                Optional: import your Machines4u stock
              </p>
              <p className="mt-1 text-sm text-[var(--rq-slate)]">
                Paste your dealer listing URL and we&apos;ll draft products for
                your catalogue — review before anything goes public.
              </p>
              <Button asChild className="mt-3" variant="outline" size="sm">
                <Link
                  href={`/dashboard/supplier/products?import=1&company=${encodeURIComponent(company.slug)}`}
                >
                  Import marketplace products
                </Link>
              </Button>
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {outcome.startsWith("verified") ? (
              <Button asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : null}
            {outcome === "stronger_proof_required" ? (
              <Button type="button" onClick={() => setStage("verify")}>
                Try another method
              </Button>
            ) : null}
            {outcome === "blocked_conflict" ? (
              <Button type="button" onClick={() => setStage("verify")}>
                Try a stronger method
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/companies/${company.slug}`}>
                Open company profile
              </Link>
            </Button>
          </div>
        </section>
      ) : null}
    </ClaimWizardShell>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[var(--rq-border)] pb-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-[var(--rq-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--rq-ink)] sm:text-right">{value}</dd>
    </div>
  );
}

function StubPanel({ body }: { body: string }) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-bg)] p-3 text-sm text-[var(--rq-slate)]">
      {body}
    </div>
  );
}
