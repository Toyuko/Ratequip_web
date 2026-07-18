"use client";

import Link from "next/link";
import { useT } from "@/components/i18n/locale-provider";
import { Button } from "@/components/ui/button";
import { listCreditPacks } from "@/lib/billing/catalog";
import { demoPlans } from "@/lib/db/demo-data";
import { formatCurrency } from "@/lib/utils";

export default function PricingPage() {
  const t = useT();
  const buyerPlans = demoPlans.filter((p) => p.audience === "buyer");
  const supplierPlans = demoPlans.filter((p) => p.audience === "supplier");
  const packs = listCreditPacks();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">{t.pricing.title}</h1>
      <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">{t.pricing.body}</p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          {t.pricing.buyers}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {buyerPlans.map((plan) => (
            <PlanCard key={plan.code} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          {t.pricing.suppliers}
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {supplierPlans.map((plan) => (
            <PlanCard key={plan.code} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          RateQuip credit packs
        </h2>
        <p className="mt-2 text-sm text-[var(--rq-muted)]">
          One-time top-ups. Subscriptions renew monthly credits automatically.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.code}
              className={`rounded-lg border bg-[var(--rq-card)] p-6 ${
                pack.highlighted
                  ? "border-orange-400 shadow-md"
                  : "border-[var(--rq-border)]"
              }`}
            >
              <h3 className="text-lg font-bold text-[var(--rq-ink)]">
                {pack.name}
              </h3>
              <p className="mt-2 text-3xl font-extrabold text-[var(--rq-ink)]">
                {formatCurrency(pack.priceUsd)}
              </p>
              <p className="mt-1 text-sm text-[var(--rq-muted)]">
                {pack.credits} credits
              </p>
              <Button asChild className="mt-6 w-full">
                <Link href={`/api/checkout?pack=${pack.code}`}>Buy pack</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  plan,
}: {
  plan: (typeof demoPlans)[number];
}) {
  const t = useT();
  return (
    <div
      className={`rounded-lg border bg-[var(--rq-card)] p-6 ${
        plan.highlighted
          ? "border-orange-400 shadow-md"
          : "border-[var(--rq-border)]"
      }`}
    >
      {plan.highlighted ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
          Popular
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-[var(--rq-ink)]">{plan.name}</h3>
      <p className="mt-2 text-3xl font-extrabold text-[var(--rq-ink)]">
        {plan.priceMonthly === 0 ? "Free" : formatCurrency(plan.priceMonthly)}
        {plan.priceMonthly > 0 ? (
          <span className="text-sm font-medium text-[var(--rq-muted)]">/mo</span>
        ) : null}
      </p>
      <p className="mt-1 text-sm text-[var(--rq-muted)]">
        {plan.monthlyCredits > 0
          ? `${plan.monthlyCredits} RateQuip credits on activate`
          : "Starter credits after onboarding"}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-[var(--rq-slate)]">
        {plan.features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <Button asChild className="mt-6 w-full">
        <Link
          href={
            plan.priceMonthly === 0
              ? `/sign-up?plan=${plan.code}`
              : `/api/checkout?plan=${plan.code}`
          }
        >
          {plan.priceMonthly === 0 ? t.auth.getStarted : "Checkout"}
        </Link>
      </Button>
    </div>
  );
}
