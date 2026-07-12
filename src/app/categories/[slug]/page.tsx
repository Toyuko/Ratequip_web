import { notFound } from "next/navigation";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import { getCategoryBySlug, listCompanies } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const companies = listCompanies({ category: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        {category.name}
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">{category.description}</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((c) => (
          <SupplierCard key={c.id} company={c} />
        ))}
      </div>
      {companies.length === 0 ? (
        <p className="mt-10 text-[var(--rq-muted)]">No suppliers in this category yet.</p>
      ) : null}
    </div>
  );
}
