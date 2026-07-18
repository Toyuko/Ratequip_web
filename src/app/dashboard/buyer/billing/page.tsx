import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";
import {
  FREE_TIER_MONTHLY_RFQ_LIMIT,
  RFQ_CREDIT_COST,
  getPlanByCode,
  isPaidActivePlan,
  listCreditPacks,
} from "@/lib/billing/catalog";
import {
  countRfqsThisMonth,
  getEnterpriseAsync,
} from "@/lib/billing/operations";
import { getSubscriptionAsync, getWalletAsync } from "@/lib/db/phase2";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Buyer billing" };
export const dynamic = "force-dynamic";

export default async function BuyerBillingPage({
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
    at_period_end?: string;
  }>;
}) {
  const params = await searchParams;
  const [wallet, subscription, rfqsThisMonth, enterprise] = await Promise.all([
    getWalletAsync(),
    getSubscriptionAsync(),
    countRfqsThisMonth(),
    getEnterpriseAsync(),
  ]);
  const plan =
    getPlanByCode(subscription?.planCode ?? "buyer-free") ??
    getPlanByCode("buyer-free")!;
  const paid = isPaidActivePlan(subscription?.planCode, subscription?.status);
  const packs = listCreditPacks();

  return (
    <DashboardShell role="buyer" title="Billing & credits">
      {params.checkout === "demo" || params.success === "1" ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {params.checkout === "demo"
            ? `Demo subscription activated${params.plan ? ` (${params.plan})` : ""}.`
            : "Checkout completed. Credits appear when Stripe confirms payment."}
        </p>
      ) : null}
      {params.pack === "demo" || params.pack === "success" ? (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Credit pack applied{params.credits ? `: +${params.credits} credits` : ""}.
        </p>
      ) : null}
      {params.canceled === "1" ? (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Subscription canceled
          {params.at_period_end === "1"
            ? " at period end (Stripe)."
            : " (demo / immediate status update)."}
        </p>
      ) : null}
      {params.portal === "demo" ? (
        <p className="mb-4 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 py-2 text-sm text-[var(--rq-slate)]">
          Stripe Customer Portal needs a real Stripe customer. Use Cancel below
          in demo mode.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5">
          <h2 className="font-semibold text-[var(--rq-ink)]">Subscription</h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">
            Current plan:{" "}
            <strong>{subscription?.planName ?? plan.name}</strong>{" "}
            ({formatCurrency(subscription?.priceMonthly ?? plan.priceMonthly)}
            /mo)
          </p>
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Status: {subscription?.status ?? "none"} ·{" "}
            {subscription?.monthlyCredits ?? plan.monthlyCredits} credits on
            activate/renewal · RFQs cost {RFQ_CREDIT_COST}
          </p>
          {!paid ? (
            <p className="mt-2 text-xs text-amber-800">
              Free tier: {rfqsThisMonth}/{FREE_TIER_MONTHLY_RFQ_LIMIT} RFQs used
              this month (limit is separate from credit balance).
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/api/checkout?plan=buyer-premium">
                {paid ? "Change plan" : "Upgrade to Premium"}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/api/billing/portal">Stripe portal</Link>
            </Button>
            {subscription?.status === "active" ||
            subscription?.status === "trialing" ? (
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
              Enterprise pool ({enterprise.name}):{" "}
              <strong>{enterprise.pooledBalance}</strong> credits · commission{" "}
              {(enterprise.commissionBps / 100).toFixed(2)}%
            </p>
          ) : null}
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm text-[var(--rq-slate)]">
            {wallet.entries.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
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

      <section className="mt-8">
        <h2 className="font-semibold text-[var(--rq-ink)]">Buy credit packs</h2>
        <p className="mt-1 text-sm text-[var(--rq-muted)]">
          One-time purchases. Demo mode grants credits immediately.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {packs.map((pack) => (
            <div
              key={pack.code}
              className={`rounded-lg border p-5 ${
                pack.highlighted
                  ? "border-orange-400 bg-[var(--rq-card)]"
                  : "border-[var(--rq-border)] bg-[var(--rq-card)]"
              }`}
            >
              <h3 className="font-semibold text-[var(--rq-ink)]">{pack.name}</h3>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(pack.priceUsd)}
              </p>
              <p className="mt-1 text-sm text-[var(--rq-muted)]">
                {pack.credits} credits
              </p>
              <Button asChild className="mt-4 w-full">
                <Link href={`/api/checkout?pack=${pack.code}`}>Buy pack</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </DashboardShell>
  );
}
