import Link from "next/link";
import { notFound } from "next/navigation";
import { RfqProjectCompanion } from "@/components/marketplace/rfq-project-companion";
import { RequestStatusActions } from "@/components/marketplace/request-status-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function stockLabel(value?: string) {
  if (value === "in_stock") return "In stock";
  if (value === "on_order") return "On order";
  if (value === "unavailable") return "Unavailable";
  return null;
}

function formatShipTo(request: {
  deliveryCountry: string;
  deliveryCity?: string;
  deliveryAddress?: string;
}) {
  return [request.deliveryAddress, request.deliveryCity, request.deliveryCountry]
    .filter(Boolean)
    .join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestById(id);
  return { title: request?.title ?? "RFQ" };
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestById(id);
  if (!request) notFound();
  const quotes = await getQuotesForRequest(request.id);
  const items = request.items ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="success">{request.status}</Badge>
        <RequestStatusActions requestId={request.id} status={request.status} />
      </div>
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
            Currency / tax
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.currency} · tax {request.taxTreatment ?? "inclusive"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Ship to
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {formatShipTo(request) || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Closing date
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.dueDate ?? "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Quote validity
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.quoteValidityDays ?? 30} days
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Delivery from PO
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.deliveryWeeksRequired != null
              ? `${request.deliveryWeeksRequired} weeks`
              : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Warranty required
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.warrantyMonthsRequired != null
              ? `${request.warrantyMonthsRequired} months`
              : "Not set"}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            Reference model
          </dt>
          <dd className="font-semibold text-[var(--rq-ink)]">
            {request.referenceModel || "—"}
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
        {(request.complianceStandards?.length ?? 0) > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Compliance
            </dt>
            <dd className="font-semibold text-[var(--rq-ink)]">
              {request.complianceStandards.join(" · ")}
            </dd>
          </div>
        ) : null}
        {(request.scopeOfSupply?.length ?? 0) > 0 ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Scope of supply
            </dt>
            <dd className="font-semibold capitalize text-[var(--rq-ink)]">
              {request.scopeOfSupply.join(" · ")}
            </dd>
          </div>
        ) : null}
        {request.materialOfConstruction ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Material of construction
            </dt>
            <dd className="font-semibold text-[var(--rq-ink)]">
              {request.materialOfConstruction}
            </dd>
          </div>
        ) : null}
        {request.utilitiesNotes ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Utilities
            </dt>
            <dd className="font-semibold text-[var(--rq-ink)]">
              {request.utilitiesNotes}
            </dd>
          </div>
        ) : null}
        {request.attachmentName || request.attachmentUrl ? (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              Attachment
            </dt>
            <dd className="font-semibold text-[var(--rq-ink)]">
              {request.attachmentUrl &&
              !request.attachmentUrl.startsWith("demo://") ? (
                <a
                  href={request.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:underline"
                >
                  {request.attachmentName ?? "View attachment"}
                </a>
              ) : (
                (request.attachmentName ?? "Attached file")
              )}
            </dd>
          </div>
        ) : null}
      </dl>

      {(request.technicalRequirements?.length ?? 0) > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">
            Technical requirements
          </h2>
          <ul className="mt-4 space-y-2 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4">
            {request.technicalRequirements.map((req, index) => (
              <li
                key={`${req.text}-${index}`}
                className="flex flex-wrap items-start gap-2 text-sm text-[var(--rq-slate)]"
              >
                <Badge variant="muted">{req.priority}</Badge>
                <span>{req.text}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {items.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-[var(--rq-ink)]">Line items</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--rq-border)] bg-[var(--rq-surface)] text-xs uppercase tracking-wide text-[var(--rq-muted)]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">OEM</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--rq-border)] last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--rq-ink)]">
                      {item.productName}
                    </td>
                    <td className="px-4 py-3 text-[var(--rq-slate)]">
                      {item.productCode || "—"}
                    </td>
                    <td className="px-4 py-3 text-[var(--rq-slate)]">
                      {item.quantity}
                      {item.unit ? ` ${item.unit}` : ""}
                    </td>
                    <td className="px-4 py-3 text-[var(--rq-slate)]">
                      {item.oemOnly ? "Original only" : "Alternatives OK"}
                    </td>
                    <td className="px-4 py-3 text-[var(--rq-slate)]">
                      {item.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

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

      <RfqProjectCompanion requestId={request.id} />

      <section className="mt-10">
        <h2 className="text-xl font-bold text-[var(--rq-ink)]">
          Submitted quotes
        </h2>
        <div className="mt-4 space-y-3">
          {quotes.map((q) => {
            const availability = stockLabel(q.stockAvailability);
            return (
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
                {q.deviations ? (
                  <p className="mt-2 text-sm text-amber-800 dark:text-amber-200">
                    Deviations: {q.deviations}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--rq-muted)]">
                  {q.meetsRequirements === false
                    ? "Does not meet all must-haves"
                    : "Meets requirements"}
                  {" · "}
                  Lead time {q.leadTimeDays} days
                  {q.deliveryPeriodDays != null
                    ? ` · Delivery ${q.deliveryPeriodDays} days`
                    : ""}
                  {availability ? ` · ${availability}` : ""} · {q.status}
                </p>
              </div>
            );
          })}
          {quotes.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">No quotes yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
