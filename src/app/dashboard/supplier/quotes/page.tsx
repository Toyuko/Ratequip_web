import { Suspense } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { QuoteForm } from "@/components/marketplace/quote-form";
import { getRequestById } from "@/lib/db/queries";

export default async function SupplierQuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ request?: string }>;
}) {
  const { request: requestId = "req-1" } = await searchParams;
  const request = await getRequestById(requestId);

  return (
    <DashboardShell role="supplier" title="Quote builder">
      <Suspense fallback={<p>Loading…</p>}>
        <QuoteForm
          requestId={request?.id ?? requestId}
          requestTitle={request?.title}
          currency={request?.currency ?? "USD"}
          taxTreatment={request?.taxTreatment ?? "inclusive"}
          quoteValidityDays={request?.quoteValidityDays ?? 30}
          dueDate={request?.dueDate}
          shipTo={[
            request?.deliveryAddress,
            request?.deliveryCity,
            request?.deliveryCountry,
          ]
            .filter(Boolean)
            .join(", ")}
          referenceModel={request?.referenceModel}
          complianceStandards={request?.complianceStandards}
          technicalRequirements={request?.technicalRequirements}
          items={request?.items ?? []}
          closed={
            !request ||
            request.status !== "open" ||
            Boolean(
              request.dueDate &&
                Date.now() >
                  new Date(`${request.dueDate}T23:59:59.000Z`).getTime(),
            )
          }
        />
      </Suspense>
    </DashboardShell>
  );
}
