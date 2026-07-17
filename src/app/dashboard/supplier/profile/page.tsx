import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SupplierProfileForm } from "@/components/dashboard/supplier-profile-form";
import { getCompanyBySlug } from "@/lib/db/queries";

export const metadata = { title: "Supplier profile editor" };
export const dynamic = "force-dynamic";

export default async function SupplierProfilePage() {
  const company = await getCompanyBySlug("nordicfill-systems");
  if (!company) {
    return (
      <DashboardShell role="supplier" title="Company profile">
        <p className="text-sm text-[var(--rq-muted)]">
          No company profile found. Complete supplier onboarding first.
        </p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="supplier" title="Company profile">
      <SupplierProfileForm company={company} />
    </DashboardShell>
  );
}
