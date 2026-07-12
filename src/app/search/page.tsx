import Link from "next/link";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { searchAll } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const { companies, requests } = searchAll(q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-navy)]">Search</h1>
      <p className="mt-2 text-slate-600">
        {q ? (
          <>
            Results for <span className="font-semibold">{q}</span>
          </>
        ) : (
          "Browse suppliers and open RFQs."
        )}
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--rq-navy)]">
          Suppliers ({companies.length})
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <SupplierCard key={c.id} company={c} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-[var(--rq-navy)]">
          RFQs ({requests.length})
        </h2>
        <div className="mt-4 space-y-3">
          {requests.map((r) => (
            <Link
              key={r.id}
              href={`/requests/${r.id}`}
              className="block rounded-lg border border-[var(--rq-border)] bg-white p-4 hover:border-orange-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-[var(--rq-navy)]">
                  {r.title}
                </h3>
                <span className="text-sm text-slate-500">
                  {formatCurrency(r.budgetMin, r.currency)} –{" "}
                  {formatCurrency(r.budgetMax, r.currency)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                {r.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
