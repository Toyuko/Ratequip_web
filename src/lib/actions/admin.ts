"use server";

import { cookies } from "next/headers";
import { requireServerAdmin } from "@/lib/api/auth";
import { persistModeration } from "@/lib/db/phase2";
import {
  looksLikeEmail,
  opsEmail,
  sendTransactionalEmail,
} from "@/lib/email";

export async function moderateEntity(input: {
  entityType: "review" | "claim";
  entityId: string;
  decision: "approved" | "rejected";
}) {
  const auth = await requireServerAdmin();
  if (!auth.user) {
    return { ok: false as const, message: auth.error ?? "Admin role required" };
  }

  const jar = await cookies();
  const actor =
    auth.user.email ||
    jar.get("rq_email")?.value ||
    "admin@ratequip.com";

  const result = await persistModeration({
    ...input,
    actor,
  });

  if (result.ok) {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const companyLabel =
      ("companyName" in result && result.companyName) ||
      ("companySlug" in result && result.companySlug) ||
      input.entityId;
    const profileUrl =
      "companySlug" in result && result.companySlug
        ? `${baseUrl}/companies/${result.companySlug}`
        : `${baseUrl}/admin`;

    await sendTransactionalEmail({
      to: opsEmail(),
      subject: `Moderation ${input.decision}: ${input.entityType}`,
      html: `<p>${input.entityType} ${input.entityId} (${companyLabel}) was ${input.decision} by ${actor}.</p>`,
      tags: [
        { name: "category", value: "moderation_ops" },
        { name: "entity", value: input.entityType },
      ],
    });

    if (
      input.entityType === "claim" &&
      "claimantEmail" in result &&
      looksLikeEmail(result.claimantEmail)
    ) {
      const approved = input.decision === "approved";
      await sendTransactionalEmail({
        to: result.claimantEmail,
        subject: approved
          ? `Your claim for ${companyLabel} was approved`
          : `Update on your claim for ${companyLabel}`,
        html: `
          <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
            <p>Your company profile claim for <strong>${companyLabel}</strong> was <strong>${input.decision}</strong>.</p>
            ${
              approved
                ? `<p>You can manage the profile here: <a href="${profileUrl}">${profileUrl}</a></p>`
                : `<p>If you believe this was in error, reply to this email or contact support via <a href="${baseUrl}/contact">${baseUrl}/contact</a>.</p>`
            }
          </div>
        `.trim(),
        tags: [
          { name: "category", value: "claim_decision" },
          { name: "decision", value: input.decision },
        ],
      });
    }
  }

  return result;
}
