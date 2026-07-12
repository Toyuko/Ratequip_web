import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { demoPlans, demoWallet } from "@/lib/db/demo-data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Buyer billing" };

export default function BuyerBillingPage() {
  const plan = demoPlans.find((p) => p.code === "buyer-premium")!;

  return (
    <DashboardShell role="buyer" title="Billing & credits">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Subscription</h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Current plan: <strong>{plan.name}</strong> (
            {formatCurrency(plan.priceMonthly)}/mo)
          </p>
          <Button asChild className="mt-4">
            <Link href="/api/checkout?plan=buyer-premium">
              Manage with Stripe
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Credit wallet</h2>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {demoWallet.balance}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--rq-slate)]">
            {demoWallet.entries.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>{e.reason}</span>
                <span className={e.delta < 0 ? "text-red-600" : "text-emerald-600"}>
                  {e.delta > 0 ? "+" : ""}
                  {e.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
