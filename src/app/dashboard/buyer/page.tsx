import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getRuntimeProjects,
  getWalletAsync,
  listRequestsAsync,
} from "@/lib/db/phase2";
import { listCompanies } from "@/lib/db/queries";

export const metadata = { title: "Buyer dashboard" };
export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const [savedAll, requests, wallet] = await Promise.all([
    listCompanies(),
    listRequestsAsync(),
    getWalletAsync(),
  ]);
  const saved = savedAll.slice(0, 3);
  const projects = getRuntimeProjects();

  return (
    <DashboardShell role="buyer" title="Buyer dashboard">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Open RFQs"
          value={String(requests.filter((r) => r.status === "open").length)}
        />
        <Stat label="Active projects" value={String(projects.length)} />
        <Stat label="Credits" value={String(wallet.balance)} />
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-[var(--rq-ink)]">Quick actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/requests/new">New RFQ</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/companies/search">Add a company</Link>
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
        <h2 className="font-semibold text-[var(--rq-ink)]">Saved suppliers</h2>
        <ul className="mt-3 space-y-2">
          {saved.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3"
            >
              <Link
                href={`/suppliers/${c.slug}`}
                className="font-medium text-[var(--rq-ink)] hover:text-orange-600"
              >
                {c.name}
              </Link>
              <Badge variant="orange">Trust {c.trustScore.toFixed(0)}</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold text-[var(--rq-ink)]">Projects</h2>
        <ul className="mt-3 space-y-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/workspaces/${p.id}`}
                className="block rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 hover:border-orange-300"
              >
                <div className="font-medium text-[var(--rq-ink)]">{p.name}</div>
                <div className="text-sm text-[var(--rq-muted)]">{p.summary}</div>
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
    <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
      <div className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[var(--rq-ink)]">{value}</div>
    </div>
  );
}
