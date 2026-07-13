import Link from "next/link";
import { listChildCategories, listTopCategories } from "@/lib/db/queries";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  const parents = listTopCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Categories</h1>
      <p className="mt-2 max-w-2xl text-[var(--rq-slate)]">
        Browse industrial equipment, automation, services and related supplier
        verticals from the RateQuip taxonomy.
      </p>

      <div className="mt-10 space-y-12">
        {parents.map((parent) => {
          const children = listChildCategories(parent.id);
          return (
            <section key={parent.id}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[var(--rq-ink)]">
                    <Link
                      href={`/categories/${parent.slug}`}
                      className="hover:text-orange-600"
                    >
                      {parent.name}
                    </Link>
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-[var(--rq-slate)]">
                    {parent.description}
                  </p>
                </div>
                <Link
                  href={`/categories/${parent.slug}`}
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  View all
                </Link>
              </div>
              {children.length > 0 ? (
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
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
