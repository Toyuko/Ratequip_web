import type { DemoCompany } from "@/lib/db/demo-data";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function SupplierCard({ company }: { company: DemoCompany }) {
  return (
    <Card interactive className="h-full">
      <Link href={`/suppliers/${company.slug}`} className="block h-full">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--rq-ink)]">
              {company.name}
            </h3>
            <p className="text-sm text-[var(--rq-muted)]">
              {company.city}, {company.country}
            </p>
          </div>
          <div className="rounded-md bg-[var(--rq-navy)] px-2.5 py-1 text-center text-white">
            <div className="text-[10px] uppercase tracking-wide text-orange-300">
              Trust
            </div>
            <div className="text-lg font-bold leading-none">
              {company.trustScore.toFixed(0)}
            </div>
          </div>
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-[var(--rq-slate)]">
          {company.headline}
        </p>
        <div className="flex flex-wrap gap-2">
          {company.verified ? <Badge variant="success">Verified</Badge> : null}
          {company.claimed ? <Badge variant="orange">Claimed</Badge> : null}
          <Badge variant="muted">{company.reviewCount} reviews</Badge>
        </div>
      </Link>
    </Card>
  );
}
