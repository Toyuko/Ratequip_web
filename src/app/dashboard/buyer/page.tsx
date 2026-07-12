import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { demoProjects, demoRequests, demoWallet } from "@/lib/db/demo-data";
import { listCompanies } from "@/lib/db/queries";

export const metadata = { title: "Buyer dashboard" };

export default function BuyerDashboardPage() {
  const saved = listCompanies().slice(0, 3);

  return (
    <DashboardShell role="buyer" title="Buyer dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Open RFQs" value={String(demoRequests.length)} />
        <Stat label="Active projects" value={String(demoProjects.length)} />
        <Stat label="Credits" value={String(demoWallet.balance)} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-[var(--rq-navy)]">Quick actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/requests/new">New RFQ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects/new">New project</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/quotes/compare?request=req-1">Compare quotes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/buyer/billing">Billing</Link>
          </Button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-navy)]">Saved suppliers</h2>
        <ul className="mt-3 space-y-2">
          {saved.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-[var(--rq-border)] bg-white px-4 py-3"
            >
              <Link
                href={`/suppliers/${c.slug}`}
                className="font-medium text-[var(--rq-navy)] hover:text-orange-600"
              >
                {c.name}
              </Link>
              <Badge variant="orange">Trust {c.trustScore.toFixed(0)}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-navy)]">Projects</h2>
        <ul className="mt-3 space-y-2">
          {demoProjects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/workspaces/${p.id}`}
                className="block rounded-lg border border-[var(--rq-border)] bg-white px-4 py-3 hover:border-orange-300"
              >
                <div className="font-medium text-[var(--rq-navy)]">{p.name}</div>
                <div className="text-sm text-slate-500">{p.summary}</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--rq-border)] bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[var(--rq-navy)]">{value}</div>
    </div>
  );
}
