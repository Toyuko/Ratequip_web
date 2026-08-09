"use client";

import { cn } from "@/lib/utils";

const STEPS = [
  { id: "lookup", label: "Company" },
  { id: "relationship", label: "Relationship" },
  { id: "verify", label: "Verify" },
  { id: "review", label: "Review" },
] as const;

export type ClaimWizardStepId = (typeof STEPS)[number]["id"];

/** Map finer form stages onto the four video progress segments. */
export function claimProgressStep(
  stage:
    | "lookup"
    | "confirm"
    | "relationship"
    | "verify"
    | "review"
    | "result",
): ClaimWizardStepId {
  if (stage === "lookup" || stage === "confirm") return "lookup";
  if (stage === "relationship") return "relationship";
  if (stage === "verify") return "verify";
  return "review";
}

export function ClaimWizardShell({
  step,
  title,
  description,
  children,
}: {
  step: ClaimWizardStepId;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">{title}</h1>
      <p className="mt-2 text-[var(--rq-slate)]">{description}</p>

      <div
        className="mt-8 grid grid-cols-4 gap-2"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={activeIndex + 1}
        aria-label="Claim progress"
      >
        {STEPS.map((s, index) => {
          const filled = index <= activeIndex;
          return (
            <div key={s.id} className="min-w-0">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  filled ? "bg-[var(--rq-orange)]" : "bg-[var(--rq-border)]",
                )}
              />
              <p
                className={cn(
                  "mt-2 truncate text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
                  filled ? "text-[var(--rq-orange)]" : "text-[var(--rq-muted)]",
                )}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
