import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = getRequestById(id);
  return { title: request?.title ?? "RFQ" };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = getRequestById(id);
  if (!request) notFound();
  const quotes = getQuotesForRequest(request.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="success">{request.status}</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        {request.title}
      </h1>
      <p className="mt-4 leading-relaxed text-[var(--rq-slate)]">
        {request.description}
      </p>
      <dl className="mt-6 grid gap-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Budget
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {formatCurrency(request.budgetMin, request.currency)} –{" "}
            {formatCurrency(request.budgetMax, request.currency)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Delivery
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.deliveryCountry}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Category
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.category}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Quotes
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.quoteCount}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/dashboard/supplier/quotes?request=${request.id}`}>
            Submit quote
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/quotes/compare?request=${request.id}`}>
            Compare quotes
          </Link>
        </Button>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Submitted quotes
        </h2>
        <div className="mt-4 space-y-3">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/suppliers/${q.companySlug}`}
                  className="font-semibold text-[var(--rq-ink)] hover:text-orange-600"
                >
                  {q.companyName}
                </Link>
                <span className="font-bold text-orange-600">
                  {formatCurrency(q.amount, q.currency)}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--rq-slate)]">{q.notes}</p>
              <p className="mt-2 text-xs text-[var(--rq-muted)]">
                Lead time {q.leadTimeDays} days · {q.status}
              </p>
            </div>
          ))}
          {quotes.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">No quotes yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
