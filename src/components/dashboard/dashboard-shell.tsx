import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardNav active={role} />
      <div className="flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-[var(--rq-ink)]">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </>
  );
}
