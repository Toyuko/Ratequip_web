import Link from "next/link";
import { notFound } from "next/navigation";
import { SupplierCard } from "@/components/suppliers/supplier-card";
import {
  getCategoryBySlug,
  listCategories,
  listChildCategories,
  listCompanies,
} from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: category?.name ?? "Category" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const [companies, children, allCategories] = await Promise.all([
    listCompanies({ category: slug }),
    listChildCategories(category.id),
    listCategories(),
  ]);
  const parentCategory = category.parentId
    ? (allCategories.find((c) => c.id === category.parentId) ?? null)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="text-sm text-[var(--rq-muted)]">
        <Link href="/categories" className="hover:text-orange-600">
          Categories
        </Link>
        {parentCategory ? (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/categories/${parentCategory.slug}`}
              className="hover:text-orange-600"
            >
              {parentCategory.name}
            </Link>
          </>
        ) : null}
      </div>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {category.name}
      </h1>
      <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">
        {category.description}
      </p>

      {children.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
            Subcategories
          </h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 text-sm font-medium text-[var(--rq-ink)] transition hover:border-orange-300"
              >
                {child.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
          Suppliers
        </h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <SupplierCard key={c.id} company={c} />
          ))}
        </div>
        {companies.length === 0 ? (
          <p className="mt-6 text-[var(--rq-muted)]">
            No suppliers in this category yet.
          </p>
        ) : null}
      </section>
    </div>
  );
}
