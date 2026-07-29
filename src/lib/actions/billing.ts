"use server";

import { revalidatePath } from "next/cache";
import { refundCredits } from "@/lib/billing/operations";

export async function applyDemoRefundAction() {
  await refundCredits({
    amount: 25,
    reason: "RFQ credit refund/adjustment (acceptance demo)",
    referenceType: "refund",
  });
  revalidatePath("/dashboard/buyer/billing");
}
