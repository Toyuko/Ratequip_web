import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoQuotes, demoRequests, demoReviews } from "@/lib/db/demo-data";

export const metadata = { title: "Supplier dashboard" };

export default function SupplierDashboardPage() {
  const leads = demoRequests.filter((r) => r.status === "open");

  return (
    <DashboardShell role="supplier" title="Supplier dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open leads" value={String(leads.length)} />
        <Stat label="Quotes sent" value={String(demoQuotes.length)} />
        <Stat
          label="Pending reviews"
          value={String(demoReviews.filter((r) => r.status === "pending").length)}
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/dashboard/supplier/profile">Edit profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/supplier/products">Products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/supplier/quotes">Quote builder</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/supplier/billing">Billing</Link>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">Lead inbox</h2>
        <ul className="mt-3 space-y-2">
          {leads.map((r) => (
            <li
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3"
            >
              <div>
                <Link
                  href={`/requests/${r.id}`}
                  className="font-medium text-[var(--rq-ink)] hover:text-orange-600"
                >
                  {r.title}
                </Link>
                <p className="text-xs text-[var(--rq-muted)]">
                  {r.deliveryCountry} · {r.quoteCount} quotes
                </p>
              </div>
              <Badge variant="success">Open</Badge>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[var(--rq-ink)]">{value}</div>
    </div>
  );
}
