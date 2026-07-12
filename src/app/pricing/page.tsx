import Link from "next/link";
import { Button } from "@/components/ui/button";
import { demoPlans } from "@/lib/db/demo-data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  const buyerPlans = demoPlans.filter((p) => p.audience === "buyer");
  const supplierPlans = demoPlans.filter((p) => p.audience === "supplier");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-navy)]">Pricing</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Subscriptions plus RateQuip Credits for RFQ leads and premium actions.
        Paid placement never alters Trust Score.
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--rq-navy)]">Buyers</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {buyerPlans.map((plan) => (
            <PlanCard key={plan.code} plan={plan} />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-xl font-bold text-[var(--rq-navy)]">Suppliers</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {supplierPlans.map((plan) => (
            <PlanCard key={plan.code} plan={plan} />
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
  return (
    <div
      className={`rounded-lg border bg-white p-6 ${
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
      <h3 className="text-lg font-bold text-[var(--rq-navy)]">{plan.name}</h3>
      <p className="mt-2 text-3xl font-extrabold text-[var(--rq-navy)]">
        {plan.priceMonthly === 0
          ? "Free"
          : formatCurrency(plan.priceMonthly)}
        {plan.priceMonthly > 0 ? (
          <span className="text-sm font-medium text-slate-500">/mo</span>
        ) : null}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {plan.features.map((f) => (
          <li key={f}>• {f}</li>
        ))}
      </ul>
      <Button asChild className="mt-6 w-full">
        <Link href={`/sign-up?plan=${plan.code}`}>
          {plan.priceMonthly === 0 ? "Get started" : "Start checkout"}
        </Link>
      </Button>
    </div>
  );
}
