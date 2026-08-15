"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearLocalDraft } from "@/components/organic-growth/use-listing-draft";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "search", label: "Search", n: 1 },
  { href: "duplicates", label: "Matches", n: 2 },
  { href: "details", label: "Details", n: 3 },
  { href: "contacts", label: "Contacts", n: 4 },
  { href: "relationship", label: "Relationship", n: 5 },
  { href: "confirm", label: "Confirm", n: 6 },
] as const;

type WizardStep = (typeof STEPS)[number]["href"] | "success";

function stepPath(
  href: (typeof STEPS)[number]["href"],
  submissionId?: string,
) {
  if (href === "search") return "/companies/search";
  const qs = submissionId
    ? `?submissionId=${encodeURIComponent(submissionId)}`
    : "";
  return `/companies/add/${href}${qs}`;
}

export function AddCompanyWizardShell({
  step,
  title,
  description,
  children,
  submissionId,
  backHref,
}: {
  step: WizardStep;
  title: string;
  description: string;
  children: React.ReactNode;
  submissionId?: string;
  /** Explicit back target; defaults from step order when available. */
  backHref?: string;
}) {
  const router = useRouter();
  const activeIndex = STEPS.findIndex((s) => s.href === step);
  const resolvedActive =
    activeIndex >= 0
      ? activeIndex
      : step === "success"
        ? STEPS.length - 1
        : 0;

  const defaultBack =
    backHref ??
    (resolvedActive > 0
      ? stepPath(STEPS[resolvedActive - 1].href, submissionId)
      : undefined);

  function cancelAndRestart() {
    clearLocalDraft();
    try {
      sessionStorage.removeItem("rq_claim_after_publish");
    } catch {
      /* ignore */
    }
    router.push("/companies/search");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm text-[var(--rq-muted)]">
          <Link href="/companies/search" className="hover:text-orange-600">
            Add a company
          </Link>
          {submissionId ? (
            <>
              {" · "}
              <span className="font-mono text-xs">
                Draft {submissionId.slice(0, 12)}
              </span>
            </>
          ) : null}
        </p>
        {step !== "success" ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-[var(--rq-muted)]"
            onClick={cancelAndRestart}
          >
            Cancel &amp; start again
          </Button>
        ) : null}
      </div>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">{title}</h1>
      <p className="mt-2 text-[var(--rq-slate)]">{description}</p>

      {step !== "success" ? (
        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s, index) => {
            const active = s.href === step;
            const reachable =
              s.href === "search" ||
              (Boolean(submissionId) && index <= resolvedActive);
            const className = cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              active
                ? "bg-[var(--rq-navy)] text-white"
                : reachable
                  ? "bg-[var(--rq-hover)] text-[var(--rq-slate)] hover:bg-[var(--rq-border)]"
                  : "bg-[var(--rq-hover)] text-[var(--rq-muted)] opacity-70",
            );

            if (reachable && !active) {
              return (
                <li key={s.href}>
                  <Link
                    href={stepPath(s.href, submissionId)}
                    className={className}
                  >
                    <span className="opacity-70">{s.n}</span>
                    {s.label}
                  </Link>
                </li>
              );
            }

            return (
              <li key={s.href}>
                <span
                  className={className}
                  aria-current={active ? "step" : undefined}
                >
                  <span className="opacity-70">{s.n}</span>
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-6">
        {children}
      </div>

      {step !== "search" && step !== "success" && defaultBack ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={defaultBack}>Back</Link>
          </Button>
          <Button type="button" variant="ghost" onClick={cancelAndRestart}>
            Cancel &amp; start again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
