"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
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

type Stage = "confirm" | "relationship" | "verify" | "result";

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

const RELATIONSHIPS: Array<{ id: ClaimRelationship; label: string }> = [
  { id: "owner_director", label: "Owner or director" },
  { id: "employee", label: "Employee" },
  { id: "authorised_representative", label: "Authorised agency or representative" },
  { id: "contractor", label: "Contractor or consultant" },
  { id: "other", label: "Something else" },
];

export function AutomatedClaimForm({
  initialSlug,
}: {
  initialSlug: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [stage, setStage] = useState<Stage>("confirm");
  const [error, setError] = useState<string | null>(null);
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
        return;
      }
      setCompany(result.company);
      setSources(result.sources);
      setWorkEmail("");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSlug]);

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function submitVerification() {
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

  if (!initialSlug) {
    return (
      <div className="mt-8 max-w-2xl rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          Find your company first
        </h2>
        <p className="mt-2 text-sm text-[var(--rq-slate)]">
          Open a company profile, then choose Claim this profile. RateQuip fills
          the company details for you — you never enter an internal ID.
        </p>
        <Button asChild className="mt-4">
          <Link href="/companies/search">Search companies</Link>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <p className="mt-8 text-sm text-[var(--rq-muted)]">
        Loading company details…
      </p>
    );
  }

  if (!company) {
    return (
      <div className="mt-8 max-w-2xl space-y-3">
        <p className="text-sm text-red-600">{error || "Company not found."}</p>
        <Button asChild variant="outline">
          <Link href="/companies/search">Search companies</Link>
        </Button>
      </div>
    );
  }

  const displayName = company.legalName || company.name;
  const domain = company.emailDomain;

  return (
    <div className="mt-8 max-w-2xl space-y-6">
      {stage === "confirm" ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
            Step 1 of 3 · Confirm the company
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--rq-ink)]">
            Claim {displayName}
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Verify your connection to this company. Most claims take less than
            one minute. Your verification information remains private.
          </p>

          <div className="mt-6 flex gap-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-bg)] p-4">
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
                <span className="font-semibold text-[var(--rq-ink)]">
                  {displayName}
                </span>
                {company.claimed ? (
                  <Badge variant="success">Claimed</Badge>
                ) : (
                  <Badge variant="warning">Unclaimed</Badge>
                )}
              </div>
              {company.headline ? (
                <p className="text-[var(--rq-slate)]">{company.headline}</p>
              ) : null}
              {company.website ? (
                <p>
                  <span className="text-[var(--rq-muted)]">Website · </span>
                  <a
                    href={company.website}
                    className="text-[var(--rq-orange)] hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </p>
              ) : null}
              <p>
                <span className="text-[var(--rq-muted)]">Location · </span>
                {[company.city, company.country].filter(Boolean).join(", ") ||
                  "—"}
              </p>
              {company.abn ? (
                <p>
                  <span className="text-[var(--rq-muted)]">
                    ABN / registration ·{" "}
                  </span>
                  {company.abn}
                  <span className="ml-2 text-xs text-[var(--rq-muted)]">
                    Confirms the entity, not your authority
                  </span>
                </p>
              ) : null}
              {company.phone ? (
                <p>
                  <span className="text-[var(--rq-muted)]">Phone · </span>
                  {company.phone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={() => setStage("relationship")}>
              This is my company
            </Button>
            <Button asChild variant="outline">
              <Link href="/companies/search">
                This is not the correct company
              </Link>
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "relationship" ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
            Step 2 of 3 · Your relationship
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--rq-ink)]">
            How are you connected to {displayName}?
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Your answer caps the permission you can receive. Proving you work
            there does not automatically make you the legal owner of the
            profile.
          </p>
          <ul className="mt-6 space-y-2">
            {RELATIONSHIPS.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={() => setRelationship(option.id)}
                  className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                    relationship === option.id
                      ? "border-[var(--rq-orange)] bg-orange-50 text-[var(--rq-ink)] dark:bg-orange-950/30"
                      : "border-[var(--rq-border)] bg-[var(--rq-bg)] text-[var(--rq-ink)] hover:bg-[var(--rq-hover)]"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={!relationship}
              onClick={() => setStage("verify")}
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("confirm")}
            >
              Back
            </Button>
          </div>
        </section>
      ) : null}

      {stage === "verify" ? (
        <section className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--rq-orange)]">
            Step 3 of 3 · Verify
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--rq-ink)]">
            Choose how you would like to verify
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Company-domain email is usually enough to manage the public profile —
            not enough to transfer ownership or control billing.
          </p>

          <div className="mt-6 space-y-3">
            <MethodCard
              selected={method === "company_email"}
              recommended
              title={
                domain
                  ? `Verify using your @${domain} email`
                  : "Verify using your company email"
              }
              description="We’ll email a one-time code to your work address."
              onSelect={() => setMethod("company_email")}
            />
            <MethodCard
              selected={method === "website_control"}
              title="Verify using the company website"
              description="Demo: confirm temporary DNS / file control of the published domain."
              onSelect={() => setMethod("website_control")}
            />
            <MethodCard
              selected={method === "company_phone"}
              title="Verify the published company phone"
              description="Demo: confirm a code sent to the number listed on the profile."
              onSelect={() => setMethod("company_phone")}
            />
            <MethodCard
              selected={method === "business_profile"}
              title="Verify a company-controlled business profile"
              description="Select public profiles RateQuip discovered for this business."
              onSelect={() => setMethod("business_profile")}
            />
            <MethodCard
              selected={method === "director_registry"}
              title="Verify as the registered owner or director"
              description="Demo: match yourself against the registry record for this entity."
              onSelect={() => setMethod("director_registry")}
            />
            <MethodCard
              selected={method === "supporting_sources"}
              title="No company email? Use supporting business sources"
              description="Supporting links alone never grant automatic ownership — they raise confidence for a stronger method."
              onSelect={() => setMethod("supporting_sources")}
            />
          </div>

          {method === "company_email" ? (
            <div className="mt-6 space-y-4 rounded-md border border-[var(--rq-border)] bg-[var(--rq-bg)] p-4">
              <div>
                <Label htmlFor="workEmail">Work email</Label>
                <Input
                  id="workEmail"
                  type="email"
                  className="mt-1"
                  placeholder={domain ? `you@${domain}` : "you@company.com"}
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
                      Demo mode: code <code>{demoCode}</code> (email provider
                      not configured).
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

          {method === "website_control" ? (
            <StubPanel
              title="Website ownership (demo)"
              body={`Confirm you can place a temporary DNS TXT record or verification file on ${company.website || "the company website"}. In production this mirrors Google Search Console ownership checks.`}
            />
          ) : null}

          {method === "company_phone" ? (
            <StubPanel
              title="Published phone (demo)"
              body={`We’ll treat a successful callback/code to ${company.phone || "the published company number"} as a strong signal, together with registration match.`}
            />
          ) : null}

          {method === "director_registry" ? (
            <StubPanel
              title="Registered owner or director (demo)"
              body={`Match yourself as a director/officer on the registry record${company.abn ? ` for ABN ${company.abn}` : ""}. Owner/controller access still needs a second company-control signal when required by policy.`}
            />
          ) : null}

          {(method === "business_profile" ||
            method === "supporting_sources" ||
            method === "company_phone") &&
          sources.length > 0 ? (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--rq-ink)]">
                We found {sources.length} public sources associated with{" "}
                {displayName}
              </h3>
              <p className="text-sm text-[var(--rq-slate)]">
                Select the ones you control or that show your connection. Simply
                confirming a link is not proof by itself — RateQuip checks
                matches against your details.
              </p>
              <ul className="space-y-2">
                {sources.map((source) => (
                  <li key={source.id}>
                    <label className="flex cursor-pointer gap-3 rounded-md border border-[var(--rq-border)] bg-[var(--rq-bg)] px-3 py-3 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSourceIds.includes(source.id)}
                        onChange={() => toggleSource(source.id)}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-medium text-[var(--rq-ink)]">
                          {source.label}
                        </span>
                        <span className="mt-0.5 block break-all text-[var(--rq-muted)]">
                          {source.value}
                        </span>
                        <Badge variant="muted" className="mt-1">
                          {source.strength}
                        </Badge>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={
                pending ||
                (method === "company_email" && (!codeSent || !emailCode))
              }
              onClick={submitVerification}
            >
              {pending
                ? "Verifying…"
                : method === "company_email"
                  ? "Verify email & complete claim"
                  : "Complete verification"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStage("relationship")}
            >
              Back
            </Button>
          </div>
          <p className="mt-4 text-xs text-[var(--rq-muted)]">
            Your verification information remains private. RateQuip decides
            access with deterministic security rules — not staff document review.
          </p>
        </section>
      ) : null}

      {stage === "result" && outcome ? (
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
            {outcome.replaceAll("_", " ")}
          </Badge>
          <h2 className="mt-3 text-2xl font-bold text-[var(--rq-ink)]">
            {outcome === "verified_representative"
              ? `You’re connected to ${displayName}`
              : outcome === "verified_controller"
                ? `You’re a controller for ${displayName}`
                : outcome === "blocked_conflict"
                  ? "Claim blocked"
                  : "Stronger proof required"}
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">{resultMessage}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {outcome.startsWith("verified") ? (
              <Button asChild>
                <Link href={`/companies/${company.slug}`}>
                  Open company profile
                </Link>
              </Button>
            ) : null}
            {outcome === "stronger_proof_required" ? (
              <>
                <Button type="button" onClick={() => setStage("verify")}>
                  Try another method
                </Button>
                <Button asChild variant="outline">
                  <Link
                    href={`/companies/${company.slug}?draft=1`}
                  >
                    Continue draft profile (unpublished)
                  </Link>
                </Button>
              </>
            ) : null}
            {outcome === "blocked_conflict" ? (
              <Button type="button" onClick={() => setStage("verify")}>
                Try a stronger method
              </Button>
            ) : null}
            <Button asChild variant="outline">
              <Link href={`/companies/${company.slug}`}>View public profile</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function MethodCard({
  selected,
  recommended,
  title,
  description,
  onSelect,
}: {
  selected: boolean;
  recommended?: boolean;
  title: string;
  description: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
        selected
          ? "border-[var(--rq-orange)] bg-orange-50 dark:bg-orange-950/30"
          : "border-[var(--rq-border)] bg-[var(--rq-bg)] hover:bg-[var(--rq-hover)]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-[var(--rq-ink)]">
          {title}
        </span>
        {recommended ? <Badge variant="success">Recommended</Badge> : null}
      </div>
      <p className="mt-1 text-sm text-[var(--rq-slate)]">{description}</p>
    </button>
  );
}

function StubPanel({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-6 rounded-md border border-dashed border-[var(--rq-border)] bg-[var(--rq-bg)] p-4 text-sm">
      <p className="font-semibold text-[var(--rq-ink)]">{title}</p>
      <p className="mt-2 text-[var(--rq-slate)]">{body}</p>
      <p className="mt-2 text-xs text-[var(--rq-muted)]">
        Completing this step records a demo verification signal and runs the
        automated decision engine immediately.
      </p>
    </div>
  );
}
