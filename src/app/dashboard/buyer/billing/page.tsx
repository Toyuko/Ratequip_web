import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { demoPlans } from "@/lib/db/demo-data";
import { getRuntimeWallet } from "@/lib/db/phase2";
import { getStore } from "@/lib/db/runtime-store";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Buyer billing" };
export const dynamic = "force-dynamic";

export default function BuyerBillingPage() {
  const plan = demoPlans.find((p) => p.code === "buyer-premium")!;
  const wallet = getRuntimeWallet();
  const subscription = getStore().subscriptions[0];

  return (
    <DashboardShell role="buyer" title="Billing & credits">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Subscription</h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Current plan:{" "}
            <strong>
              {subscription?.planCode ?? plan.name}
            </strong>{" "}
            ({formatCurrency(plan.priceMonthly)}/mo)
          </p>
          {subscription ? (
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              Status: {subscription.status}
            </p>
          ) : null}
          <Button asChild className="mt-4">
            <Link href="/api/checkout?plan=buyer-premium">
              Manage with Stripe
            </Link>
          </Button>
        </div>
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Credit wallet</h2>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {wallet.balance}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--rq-slate)]">
            {wallet.entries.map((e) => (
              <li key={e.id} className="flex justify-between">
                <span>{e.reason}</span>
                <span
                  className={e.delta < 0 ? "text-red-600" : "text-emerald-600"}
                >
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
