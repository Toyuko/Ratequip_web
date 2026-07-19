import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Compare quotes" };

function stockLabel(value?: string) {
  if (value === "in_stock") return "In stock";
  if (value === "on_order") return "On order";
  if (value === "unavailable") return "Unavailable";
  return "—";
}

export default async function CompareQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>;
}) {
  const { request: requestId = "req-1" } = await searchParams;
  const request = await getRequestById(requestId);
  const quotes = await getQuotesForRequest(requestId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">Compare quotes</h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        {request ? request.title : `RFQ ${requestId}`}
      </p>
      {request ? (
        <p className="mt-1 text-sm text-[var(--rq-muted)]">
          {request.currency} · tax {request.taxTreatment ?? "inclusive"}
          {request.dueDate ? ` · closes ${request.dueDate}` : ""}
          {request.quoteValidityDays
            ? ` · validity ${request.quoteValidityDays} days`
            : ""}
        </p>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--rq-border)] bg-[var(--rq-surface)] text-xs uppercase tracking-wide text-[var(--rq-muted)]">
            <tr>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Lead time</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => (
              <tr key={q.id} className="border-b border-[var(--rq-border)]">
                <td className="px-4 py-3 font-medium">
                  <Link
                    href={`/suppliers/${q.companySlug}`}
                    className="text-[var(--rq-ink)] hover:text-orange-600"
                  >
                    {q.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-orange-600">
                  {formatCurrency(q.amount, q.currency)}
                </td>
                <td className="px-4 py-3">
                  {stockLabel(q.stockAvailability)}
                </td>
                <td className="px-4 py-3">{q.leadTimeDays} days</td>
                <td className="px-4 py-3">
                  {q.deliveryPeriodDays != null
                    ? `${q.deliveryPeriodDays} days`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="muted">{q.status}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--rq-slate)]">{q.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
