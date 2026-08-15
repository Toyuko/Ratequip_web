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
  onCancel,
  onSelectStep,
}: {
  step: ClaimWizardStepId;
  title: string;
  description: string;
  children: React.ReactNode;
  onCancel?: () => void;
  /** Jump back to an earlier progress segment. */
  onSelectStep?: (step: ClaimWizardStepId) => void;
}) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-3xl font-bold text-[var(--rq-ink)]">{title}</h1>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-[var(--rq-muted)] hover:text-[var(--rq-orange)]"
          >
            Cancel &amp; start again
          </button>
        ) : null}
      </div>
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
          const canJump =
            Boolean(onSelectStep) && index < activeIndex && s.id !== step;
          return (
            <div key={s.id} className="min-w-0">
              <div
                className={cn(
                  "h-1.5 rounded-full transition-colors",
                  filled ? "bg-[var(--rq-orange)]" : "bg-[var(--rq-border)]",
                )}
              />
              {canJump ? (
                <button
                  type="button"
                  className="mt-2 truncate text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--rq-orange)] hover:underline sm:text-xs"
                  onClick={() => onSelectStep?.(s.id)}
                >
                  {s.label}
                </button>
              ) : (
                <p
                  className={cn(
                    "mt-2 truncate text-[10px] font-semibold uppercase tracking-wide sm:text-xs",
                    filled
                      ? "text-[var(--rq-orange)]"
                      : "text-[var(--rq-muted)]",
                  )}
                >
                  {s.label}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}
