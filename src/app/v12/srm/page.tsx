import { Badge } from "@/components/ui/badge";
import { getV12Store } from "@/lib/v12/store";

export const metadata = { title: "SRM" };
export const dynamic = "force-dynamic";

export default function SrmPage() {
  const scorecards = getV12Store().srm;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Supplier Relationship Management
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 16 — qualification, preferred status and performance
        scorecards feeding matching confidence.
      </p>
      <ul className="mt-8 space-y-3">
        {scorecards.map((s) => (
          <li
            key={s.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-[var(--rq-ink)]">
                {s.supplierName}
              </h2>
              <Badge
                variant={s.status === "preferred" ? "success" : "muted"}
              >
                {s.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-[var(--rq-muted)]">{s.period}</p>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-sm">
              <Metric label="Overall" value={s.overall} />
              <Metric label="Quality" value={s.quality} />
              <Metric label="Delivery" value={s.delivery} />
              <Metric label="Response" value={s.responsiveness} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-[var(--rq-surface)] px-2 py-2">
      <div className="text-[10px] uppercase tracking-wide text-[var(--rq-muted)]">
        {label}
      </div>
      <div className="font-bold text-[var(--rq-ink)]">{value}</div>
    </div>
  );
}
