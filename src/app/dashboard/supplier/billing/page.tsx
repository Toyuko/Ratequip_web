import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  RFQ_CREDIT_COST,
  getPlanByCode,
  listCatalogPlans,
  listCreditPacks,
} from "@/lib/billing/catalog";
import { getEnterpriseAsync } from "@/lib/billing/operations";
import { getSubscriptionAsync, getWalletAsync } from "@/lib/db/phase2";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Supplier billing" };
export const dynamic = "force-dynamic";

export default async function SupplierBillingPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkout?: string;
    plan?: string;
    success?: string;
    pack?: string;
    credits?: string;
    canceled?: string;
    portal?: string;
  }>;
}) {
  const params = await searchParams;
  const [wallet, subscription, enterprise] = await Promise.all([
    getWalletAsync(),
    getSubscriptionAsync(),
    getEnterpriseAsync(),
  ]);
  const supplierPlans = listCatalogPlans().filter(
    (p) => p.audience === "supplier",
  );
  const current = getPlanByCode(subscription?.planCode ?? "") ?? supplierPlans[0];
  const packs = listCreditPacks();

  return (
    <DashboardShell role="supplier" title="Supplier billing">
      {params.checkout === "demo" || params.success === "1" ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {params.checkout === "demo"
            ? `Demo subscription activated${params.plan ? ` (${params.plan})` : ""}.`
            : "Checkout completed."}
        </p>
      ) : null}
      {params.pack === "demo" || params.pack === "success" ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Credit pack applied{params.credits ? `: +${params.credits}` : ""}.
        </p>
      ) : null}
      {params.canceled === "1" ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Subscription canceled.
        </p>
      ) : null}

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Current plan</h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            <strong>
              {subscription?.planName ?? current?.name ?? "No plan"}
            </strong>
            {subscription || current ? (
              <>
                {" "}
                (
                {formatCurrency(
                  subscription?.priceMonthly ?? current?.priceMonthly ?? 0,
                )}
                /mo)
              </>
            ) : null}
          </p>
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Status: {subscription?.status ?? "none"} ·{" "}
            {subscription?.monthlyCredits ?? current?.monthlyCredits ?? 0}{" "}
            credits on activate
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/api/billing/portal">Stripe portal</Link>
            </Button>
            {subscription?.status === "active" ? (
              <Button asChild variant="outline">
                <Link href="/api/billing/cancel">Cancel</Link>
              </Button>
            ) : null}
          </div>
        </div>
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Credit wallet</h2>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {wallet.balance}
          </p>
          {enterprise ? (
            <p className="mt-2 text-sm text-[var(--rq-slate)]">
              Enterprise pool: <strong>{enterprise.pooledBalance}</strong> ·
              commission {(enterprise.commissionBps / 100).toFixed(2)}%
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              Shared org wallet (RFQs cost {RFQ_CREDIT_COST} when applicable).
            </p>
          )}
        </div>
      </div>

      <h2 className="mb-3 font-semibold text-[var(--rq-ink)]">Upgrade plans</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {supplierPlans.map((plan) => (
          <div
            key={plan.code}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          >
            <h3 className="font-semibold text-[var(--rq-ink)]">{plan.name}</h3>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(plan.priceMonthly)}
              <span className="text-sm font-medium text-[var(--rq-muted)]">
                /mo
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--rq-muted)]">
              {plan.monthlyCredits} credits on activate
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href={`/api/checkout?plan=${plan.code}`}>Upgrade</Link>
            </Button>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-semibold text-[var(--rq-ink)]">
        Credit packs
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {packs.map((pack) => (
          <div
            key={pack.code}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
          >
            <h3 className="font-semibold">{pack.name}</h3>
            <p className="mt-2 text-xl font-bold">
              {formatCurrency(pack.priceUsd)} · {pack.credits} credits
            </p>
            <Button asChild className="mt-4 w-full">
              <Link href={`/api/checkout?pack=${pack.code}`}>Buy pack</Link>
            </Button>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
