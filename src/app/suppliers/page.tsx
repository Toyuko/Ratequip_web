import { SupplierCard } from "@/components/suppliers/supplier-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listCategories, listCompanies } from "@/lib/db/queries";

export const metadata = { title: "Supplier directory" };

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; country?: string }>;
}) {
  const params = await searchParams;
  const companies = listCompanies({
    q: params.q,
    category: params.category,
    country: params.country,
  });
  const categories = listCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        Supplier directory
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Compare verified manufacturers, contractors and service providers.
      </p>

      <form className="mt-8 grid gap-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 md:grid-cols-4">
        <Input name="q" placeholder="Search…" defaultValue={params.q} />
        <select
          name="category"
          defaultValue={params.category ?? ""}
          className="h-11 rounded-md border border-[var(--rq-border)] bg-[var(--rq-card)] px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          name="country"
          placeholder="Country"
          defaultValue={params.country}
        />
        <Button type="submit">Filter</Button>
      </form>

      <div className="rq-stagger mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <SupplierCard key={company.id} company={company} />
        ))}
      </div>
      {companies.length === 0 ? (
        <p className="mt-10 text-center text-[var(--rq-muted)]">No suppliers matched.</p>
      ) : null}
    </div>
  );
}
