import { Badge } from "@/components/ui/badge";
import { getV12Store } from "@/lib/v12/store";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "CRM" };
export const dynamic = "force-dynamic";

export default function CrmPage() {
  const opportunities = getV12Store().crm;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">CRM</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 17 — industrial accounts, opportunities and consent-aware
        pipeline stages.
      </p>
      <ul className="mt-8 space-y-3">
        {opportunities.map((o) => (
          <li
            key={o.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-[var(--rq-ink)]">{o.title}</h2>
                <p className="text-sm text-[var(--rq-muted)]">{o.accountName}</p>
              </div>
              <Badge variant="orange">{o.stage}</Badge>
            </div>
            <p className="mt-3 text-sm text-[var(--rq-slate)]">
              {formatCurrency(o.value, o.currency)} · Owner {o.owner}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
