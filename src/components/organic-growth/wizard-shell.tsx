"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "duplicates", label: "Matches", n: 2 },
  { href: "details", label: "Details", n: 3 },
  { href: "contacts", label: "Contacts", n: 4 },
  { href: "relationship", label: "Relationship", n: 5 },
  { href: "confirm", label: "Confirm", n: 6 },
] as const;

export function AddCompanyWizardShell({
  step,
  title,
  description,
  children,
  submissionId,
}: {
  step: (typeof STEPS)[number]["href"] | "search" | "success";
  title: string;
  description: string;
  children: React.ReactNode;
  submissionId?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-sm text-[var(--rq-muted)]">
        <Link href="/companies/search" className="hover:text-orange-600">
          Add a company
        </Link>
        {submissionId ? (
          <>
            {" · "}
            <span className="font-mono text-xs">Draft {submissionId.slice(0, 12)}</span>
          </>
        ) : null}
      </p>
      <h1 className="mt-2 text-3xl font-bold text-[var(--rq-ink)]">{title}</h1>
      <p className="mt-2 text-[var(--rq-slate)]">{description}</p>

      {step !== "search" && step !== "success" ? (
        <ol className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((s) => {
            const active = s.href === step;
            return (
              <li key={s.href}>
                <span
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "bg-[var(--rq-navy)] text-white"
                      : "bg-[var(--rq-hover)] text-[var(--rq-slate)]",
                  )}
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
    </div>
  );
}
