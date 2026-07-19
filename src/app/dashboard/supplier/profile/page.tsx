import { cookies } from "next/headers";
import { AccountMediaPanel } from "@/components/dashboard/account-media-panel";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SupplierProfileForm } from "@/components/dashboard/supplier-profile-form";
import { getCompanyBySlug, getCompanyMedia } from "@/lib/db/queries";

export const metadata = { title: "Supplier profile editor" };
export const dynamic = "force-dynamic";

export default async function SupplierProfilePage() {
  const jar = await cookies();
  const companySlug = jar.get("rq_org_slug")?.value ?? "nordicfill-systems";
  const company = await getCompanyBySlug(companySlug);
  if (!company) {
    return (
      <DashboardShell role="supplier" title="Company profile">
        <p className="text-sm text-[var(--rq-muted)]">
          No company profile found. Complete supplier onboarding first.
        </p>
      </DashboardShell>
    );
  }

  const media = await getCompanyMedia(company.slug);

  return (
    <DashboardShell role="supplier" title="Company profile">
      <div className="space-y-8">
        <SupplierProfileForm company={company} />
        <AccountMediaPanel companySlug={company.slug} media={media} />
      </div>
    </DashboardShell>
  );
}
