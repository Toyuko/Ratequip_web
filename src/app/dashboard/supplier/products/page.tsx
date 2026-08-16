import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SupplierProductImportPanel } from "@/components/dashboard/supplier-product-import-panel";
import { getCompanyBySlug, getCompanyProducts } from "@/lib/db/queries";

export const metadata = { title: "Product catalogue" };
export const dynamic = "force-dynamic";

export default async function SupplierProductsPage({
  searchParams,
}: {
  searchParams?: Promise<{ import?: string; company?: string }>;
}) {
  const jar = await cookies();
  const params = (await searchParams) ?? {};
  const companySlug =
    params.company?.trim() ||
    jar.get("rq_org_slug")?.value ||
    "nordicfill-systems";
  const company = await getCompanyBySlug(companySlug);
  const products = await getCompanyProducts(companySlug);
  const highlightImport = params.import === "1";

  return (
    <DashboardShell role="supplier" title="Product catalogue">
      <div className="space-y-8">
        <p className="text-sm text-[var(--rq-slate)]">
          {company
            ? `Catalogue for ${company.name}. Import from Machines4u or review products already on your profile.`
            : "Import marketplace listings, then publish them to your company profile."}
        </p>

        <div id="marketplace-import">
          <SupplierProductImportPanel
            companySlug={companySlug}
            autoFocusUrl={highlightImport}
          />
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[var(--rq-ink)]">
            Published products
          </h2>
          {products.length === 0 ? (
            <p className="text-sm text-[var(--rq-muted)]">
              No products yet. Paste a Machines4u dealer URL above to get
              started.
            </p>
          ) : (
            products.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
              >
                <h3 className="font-semibold text-[var(--rq-ink)]">{p.name}</h3>
                <p className="mt-1 text-sm text-[var(--rq-slate)]">{p.summary}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
