import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import { demoPlans } from "@/lib/db/demo-data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Supplier billing" };

export default function SupplierBillingPage() {
  return (
    <DashboardShell role="supplier" title="Supplier billing">
      <div className="grid gap-4 md:grid-cols-3">
        {demoPlans
          .filter((p) => p.audience === "supplier")
          .map((plan) => (
            <div
              key={plan.code}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
            >
              <h2 className="font-semibold text-[var(--rq-ink)]">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(plan.priceMonthly)}
                <span className="text-sm font-medium text-[var(--rq-muted)]">/mo</span>
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href={`/api/checkout?plan=${plan.code}`}>Upgrade</Link>
              </Button>
            </div>
          ))}
      </div>
    </DashboardShell>
  );
}
