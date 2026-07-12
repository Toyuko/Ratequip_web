import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCompanyBySlug,
  getCompanyProducts,
  getCompanyReviews,
} from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  return { title: company?.name ?? "Supplier" };
}

export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompanyBySlug(slug);
  if (!company) notFound();

  const products = getCompanyProducts(slug);
  const reviews = getCompanyReviews(slug);

  return (
    <div>
      <section className="border-b border-[var(--rq-border)] bg-[var(--rq-navy)] text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {company.verified ? (
                  <Badge variant="success">Verified factory</Badge>
                ) : null}
                {company.claimed ? (
                  <Badge variant="orange">Claimed profile</Badge>
                ) : (
                  <Badge variant="warning">Unclaimed</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold sm:text-4xl">{company.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-300">{company.headline}</p>
              <p className="mt-3 text-sm text-slate-400">
                {company.city}, {company.country} · Founded {company.yearFounded}{" "}
                · {company.employeeRange} employees
              </p>
            </div>
            <div className="rounded-lg bg-white/10 px-6 py-4 text-center backdrop-blur">
              <div className="text-xs uppercase tracking-wide text-orange-300">
                Trust Score
              </div>
              <div className="text-4xl font-extrabold">
                {company.trustScore.toFixed(1)}
              </div>
              <div className="text-sm text-slate-300">
                {company.reviewCount} reviews
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/requests/new?supplier=${company.slug}`}>
                Request quote
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              <Link href={`/reviews/new?company=${company.slug}`}>
                Write review
              </Link>
            </Button>
            {!company.claimed ? (
              <Button
                asChild
                variant="outline"
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                <Link href={`/companies/claim?company=${company.slug}`}>
                  Claim this profile
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-[var(--rq-navy)]">About</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {company.description}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--rq-navy)]">Products</h2>
            <div className="mt-4 space-y-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-[var(--rq-border)] bg-white p-4"
                >
                  <h3 className="font-semibold text-[var(--rq-navy)]">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
                </div>
              ))}
              {products.length === 0 ? (
                <p className="text-sm text-slate-500">No products listed yet.</p>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[var(--rq-navy)]">Reviews</h2>
            <div className="mt-4 space-y-4">
              {reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-lg border border-[var(--rq-border)] bg-white p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-[var(--rq-navy)]">
                      {r.title}
                    </h3>
                    <span className="text-sm font-bold text-orange-600">
                      {r.rating}/5
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{r.body}</p>
                  <p className="mt-3 text-xs text-slate-400">
                    {r.author}
                    {r.verifiedPurchase ? " · Invoice verified" : ""}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-[var(--rq-border)] bg-white p-5">
            <h3 className="font-semibold text-[var(--rq-navy)]">Categories</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {company.categories.map((c) => (
                <li key={c}>
                  <Link
                    href={`/categories/${c}`}
                    className="text-orange-600 hover:underline"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[var(--rq-border)] bg-white p-5">
            <h3 className="font-semibold text-[var(--rq-navy)]">Website</h3>
            <a
              href={company.website}
              className="mt-2 block text-sm text-orange-600 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              Visit site
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
