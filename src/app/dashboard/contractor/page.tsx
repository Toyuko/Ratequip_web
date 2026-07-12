import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Contractor dashboard" };

export default function ContractorDashboardPage() {
  return (
    <DashboardShell role="contractor" title="Service provider dashboard">
      <p className="text-[var(--rq-slate)]">
        Manage installation, inspection and logistics opportunities. Full
        provider directories expand in Phase 3.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/requests">Browse RFQs</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/companies/claim">Claim company profile</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/modules/compliance">Compliance centre</Link>
        </Button>
      </div>
    </DashboardShell>
  );
}
