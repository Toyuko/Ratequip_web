"use client";

import Link from "next/link";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleHelp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getTourSteps, type TourStep } from "@/components/onboarding/tour-steps";
import {
  hasCompletedTour,
  markTourComplete,
  resetTour,
} from "@/components/onboarding/tour-storage";
import { cn } from "@/lib/utils";

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;

const MAIN_DASHBOARDS = new Set([
  "/dashboard/buyer",
  "/dashboard/supplier",
  "/dashboard/contractor",
  "/dashboard/admin",
]);

function readTargetRect(target?: string): Rect | null {
  if (!target || typeof document === "undefined") return null;
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 2 && r.height < 2) return null;
  return {
    top: r.top - PAD,
    left: r.left - PAD,
    width: r.width + PAD * 2,
    height: r.height + PAD * 2,
  };
}

function scrollTargetIntoView(target?: string) {
  if (!target) return;
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
}

export function ProductTour({ role }: { role: string }) {
  return (
    <Suspense fallback={null}>
      <ProductTourInner role={role} />
    </Suspense>
  );
}

function ProductTourInner({ role }: { role: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const steps = getTourSteps(role);
  const homePath = MAIN_DASHBOARDS.has(`/dashboard/${role}`)
    ? `/dashboard/${role}`
    : "/dashboard/buyer";

  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [ready, setReady] = useState(false);

  const step: TourStep | undefined = steps[stepIndex];
  const isLast = stepIndex >= steps.length - 1;
  const isFirst = stepIndex === 0;
  const onMainDashboard = MAIN_DASHBOARDS.has(pathname);

  const finish = useCallback(() => {
    markTourComplete();
    setOpen(false);
    setStepIndex(0);
    if (searchParams.get("tour") === "1") {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("tour");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }
  }, [pathname, router, searchParams]);

  const start = useCallback(() => {
    resetTour();
    if (!onMainDashboard) {
      router.push(`${homePath}?tour=1`);
      return;
    }
    setStepIndex(0);
    setOpen(true);
  }, [homePath, onMainDashboard, router]);

  useEffect(() => {
    setReady(true);
    const force = searchParams.get("tour") === "1";
    if (!onMainDashboard) return;
    if (force || !hasCompletedTour()) {
      setOpen(true);
      setStepIndex(0);
    }
  }, [onMainDashboard, searchParams]);

  useLayoutEffect(() => {
    if (!open || !step) return;

    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      setRect(readTargetRect(step.target));
    };

    scrollTargetIntoView(step.target);
    measure();
    const t = window.setTimeout(measure, 320);

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (isLast) finish();
        else setStepIndex((i) => Math.min(i + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStepIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, finish, isLast, steps.length]);

  if (!ready) return null;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[var(--rq-muted)]"
        onClick={start}
      >
        <CircleHelp className="h-4 w-4" aria-hidden />
        Take a tour
      </Button>

      {open && step ? (
        <TourOverlay
          step={step}
          stepIndex={stepIndex}
          total={steps.length}
          rect={rect}
          isFirst={isFirst}
          isLast={isLast}
          onSkip={finish}
          onBack={() => setStepIndex((i) => Math.max(i - 1, 0))}
          onNext={() => {
            if (isLast) finish();
            else setStepIndex((i) => i + 1);
          }}
        />
      ) : null}
    </>
  );
}

function TourOverlay({
  step,
  stepIndex,
  total,
  rect,
  isFirst,
  isLast,
  onSkip,
  onBack,
  onNext,
}: {
  step: TourStep;
  stepIndex: number;
  total: number;
  rect: Rect | null;
  isFirst: boolean;
  isLast: boolean;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const centered = step.placement === "center" || !step.target || !rect;

  return (
    <div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rq-tour-title"
      aria-describedby="rq-tour-body"
    >
      {centered || !rect ? (
        <button
          type="button"
          className="absolute inset-0 cursor-default bg-[var(--rq-navy)]/55 backdrop-blur-[1px]"
          aria-label="Dismiss tour backdrop"
          onClick={onSkip}
        />
      ) : (
        <div
          className="pointer-events-none absolute z-[81] rounded-lg transition-all duration-300"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              "0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 0 2px var(--rq-orange)",
          }}
        />
      )}

      {!centered && rect ? (
        <div className="absolute inset-0 z-[80]" aria-hidden />
      ) : null}

      <div
        className={cn(
          "absolute z-[82] w-[min(100%-2rem,24rem)] rq-fade-up",
          centered && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={
          centered || !rect
            ? undefined
            : tooltipStyle(rect, step.placement ?? "bottom")
        }
      >
        <div className="rounded-xl border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 shadow-xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--rq-muted)]">
              Step {stepIndex + 1} of {total}
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-md p-1 text-[var(--rq-muted)] hover:bg-[var(--rq-hover)] hover:text-[var(--rq-ink)]"
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-4 flex gap-1.5" aria-hidden>
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIndex
                    ? "bg-[var(--rq-orange)]"
                    : "bg-[var(--rq-border)]",
                )}
              />
            ))}
          </div>

          <h2
            id="rq-tour-title"
            className="text-lg font-bold text-[var(--rq-ink)]"
          >
            {step.title}
          </h2>
          <p
            id="rq-tour-body"
            className="mt-2 text-sm leading-relaxed text-[var(--rq-slate)]"
          >
            {step.body}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-[var(--rq-muted)] hover:text-[var(--rq-ink)]"
            >
              Skip tour
            </button>
            <div className="flex flex-wrap gap-2">
              {!isFirst ? (
                <Button type="button" variant="outline" size="sm" onClick={onBack}>
                  Back
                </Button>
              ) : null}
              {isLast && step.cta ? (
                <Button asChild size="sm" variant="secondary">
                  <Link href={step.cta.href} onClick={onSkip}>
                    {step.cta.label}
                  </Link>
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={onNext}>
                {isLast ? (step.cta ? "Done" : "Got it") : "Next"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function tooltipStyle(
  rect: Rect,
  placement: NonNullable<TourStep["placement"]>,
): CSSProperties {
  const gap = 14;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const cardW = Math.min(vw - 32, 384);

  let top = rect.top + rect.height + gap;
  let left = rect.left + rect.width / 2 - cardW / 2;

  if (placement === "top") {
    top = rect.top - gap;
  } else if (placement === "left") {
    top = rect.top + rect.height / 2;
    left = rect.left - cardW - gap;
  } else if (placement === "right") {
    top = rect.top + rect.height / 2;
    left = rect.left + rect.width + gap;
  }

  left = Math.max(16, Math.min(left, vw - cardW - 16));

  if (placement === "top") {
    return {
      top,
      left,
      width: cardW,
      transform: "translateY(-100%)",
    };
  }
  if (placement === "left" || placement === "right") {
    const approxH = 220;
    const clampedTop = Math.max(
      16,
      Math.min(top - approxH / 2, vh - approxH - 16),
    );
    return { top: clampedTop, left, width: cardW };
  }

  if (top + 240 > vh) {
    return {
      top: Math.max(16, rect.top - gap),
      left,
      width: cardW,
      transform: "translateY(-100%)",
    };
  }

  return { top, left, width: cardW };
}
