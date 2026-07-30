import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AdminModerationClient } from "@/components/dashboard/admin-moderation-client";
import { requireServerAdmin } from "@/lib/api/auth";
import {
  getRuntimeAudit,
  listPendingClaimsAsync,
  listPendingReviewsAsync,
} from "@/lib/db/phase2";

export const metadata = { title: "Admin moderation" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const auth = await requireServerAdmin();
  if (!auth.user) {
    redirect("/dashboard/buyer");
  }

  const [pendingReviews, pendingClaims] = await Promise.all([
    listPendingReviewsAsync(),
    listPendingClaimsAsync(),
  ]);
  const audit = getRuntimeAudit();

  return (
    <DashboardShell role="admin" title="Admin moderation">
      <AdminModerationClient
        initialReviews={pendingReviews}
        initialClaims={pendingClaims}
        initialAudit={audit}
      />
    </DashboardShell>
  );
}
