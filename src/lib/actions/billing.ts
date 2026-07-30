"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireServerAdmin, resolveSessionUser } from "@/lib/api/auth";
import { refundCredits } from "@/lib/billing/operations";
import { isDemoMode } from "@/lib/config";

export async function applyDemoRefundAction() {
  if (!isDemoMode()) {
    const admin = await requireServerAdmin();
    if (!admin.user) {
      throw new Error(admin.error ?? "Admin role required");
    }
  } else {
    const { user } = await resolveSessionUser();
    if (!user || (user.role !== "admin" && user.role !== "buyer")) {
      throw new Error("Buyer or admin role required");
    }
  }

  const orgId = (await cookies()).get("rq_org_id")?.value;

  await refundCredits({
    amount: 25,
    reason: "RFQ credit refund/adjustment (acceptance demo)",
    referenceType: "refund",
    organisationId: orgId,
  });
  revalidatePath("/dashboard/buyer/billing");
}
