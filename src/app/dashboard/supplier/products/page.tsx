import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getCompanyProducts } from "@/lib/db/queries";

export const metadata = { title: "Product catalogue" };

export default function SupplierProductsPage() {
  const products = getCompanyProducts("nordicfill-systems");

  return (
    <DashboardShell role="supplier" title="Product catalogue">
      <div className="space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-[var(--rq-border)] bg-white p-4"
          >
            <h2 className="font-semibold text-[var(--rq-navy)]">{p.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{p.summary}</p>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
