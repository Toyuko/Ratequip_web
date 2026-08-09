import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getQuotesForRequest,
  getRequestById,
  listRequests,
} from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Compare quotes" };

function stockLabel(value?: string) {
  if (value === "in_stock") return "In stock";
  if (value === "on_order") return "On order";
  if (value === "unavailable") return "Unavailable";
  return "—";
}

async function resolveCompareTarget(preferredId?: string) {
  if (preferredId) {
    const request = await getRequestById(preferredId);
    const quotes = await getQuotesForRequest(preferredId);
    if (request && quotes.length > 0) {
      return { request, quotes, requestId: preferredId };
    }
    if (request) {
      return { request, quotes, requestId: preferredId };
    }
  }

  const fallbackIds = ["req-1", "req-2", "req-3"];
  for (const id of fallbackIds) {
    const request = await getRequestById(id);
    const quotes = await getQuotesForRequest(id);
    if (request && quotes.length > 0) {
      return { request, quotes, requestId: id };
    }
  }

  const open = (await listRequests()).filter((r) => r.status === "open");
  for (const request of open.slice(0, 12)) {
    const quotes = await getQuotesForRequest(request.id);
    if (quotes.length > 0) {
      return { request, quotes, requestId: request.id };
    }
  }

  if (open[0]) {
    const quotes = await getQuotesForRequest(open[0].id);
    return { request: open[0], quotes, requestId: open[0].id };
  }

  return { request: null, quotes: [], requestId: preferredId ?? "req-1" };
}

export default async function CompareQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>;
}) {
  const { request: preferredId } = await searchParams;
  const { request, quotes, requestId } = await resolveCompareTarget(preferredId);

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

      {quotes.length === 0 ? (
        <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-8 text-center">
          <p className="text-[var(--rq-slate)]">
            No quotes to compare for this RFQ yet.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/requests">Browse RFQs</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/suppliers">Browse suppliers</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--rq-border)] bg-[var(--rq-surface)] text-xs uppercase tracking-wide text-[var(--rq-muted)]">
              <tr>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Meets reqs</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Lead time</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes / deviations</th>
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
                    {q.meetsRequirements === false ? "No" : "Yes"}
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
                  <td className="px-4 py-3 text-[var(--rq-slate)]">
                    {q.notes}
                    {q.deviations ? (
                      <span className="mt-1 block text-amber-800 dark:text-amber-200">
                        Deviations: {q.deviations}
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
