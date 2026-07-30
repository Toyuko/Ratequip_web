import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { ProductTour } from "@/components/onboarding/product-tour";
import { resolveSessionUser } from "@/lib/api/auth";

export async function DashboardShell({
  role,
  title,
  children,
}: {
  role: string;
  title: string;
  children: React.ReactNode;
}) {
  const { user } = await resolveSessionUser();
  const showAdmin = user?.role === "admin";

  return (
    <>
      <DashboardNav active={role} showAdmin={showAdmin} />
      <div className="flex-1 px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[var(--rq-ink)]">{title}</h1>
          <ProductTour role={role} />
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
