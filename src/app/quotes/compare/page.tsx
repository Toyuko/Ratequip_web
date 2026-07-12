import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getQuotesForRequest, getRequestById } from "@/lib/db/queries";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Compare quotes" };

export default async function CompareQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>;
}) {
  const { request: requestId = "req-1" } = await searchParams;
  const request = getRequestById(requestId);
  const quotes = getQuotesForRequest(requestId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-navy)]">Compare quotes</h1>
      <p className="mt-2 text-slate-600">
        {request ? request.title : `RFQ ${requestId}`}
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-[var(--rq-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--rq-border)] bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Supplier</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Lead time</th>
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
                    className="text-[var(--rq-navy)] hover:text-orange-600"
                  >
                    {q.companyName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-orange-600">
                  {formatCurrency(q.amount, q.currency)}
                </td>
                <td className="px-4 py-3">{q.leadTimeDays} days</td>
                <td className="px-4 py-3">
                  <Badge variant="muted">{q.status}</Badge>
                </td>
                <td className="px-4 py-3 text-slate-600">{q.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
