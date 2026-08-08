"use server";

import { cookies } from "next/headers";
import { requireServerAdmin } from "@/lib/api/auth";
import { persistModeration } from "@/lib/db/phase2";
import { publicAppUrl } from "@/lib/config";
import {
  looksLikeEmail,
  opsEmail,
  sendTransactionalEmail,
} from "@/lib/email";
import {
  emailLink,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

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
    const baseUrl = publicAppUrl();
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
      html: renderEmailDocument({
        preheader: `${input.entityType} ${input.entityId} was ${input.decision}`,
        heading: `Moderation ${input.decision}`,
        bodyHtml: emailParagraph(
          `<strong style="color:#0F172A">${input.entityType}</strong> ${input.entityId} (${companyLabel}) was <strong style="color:#0F172A">${input.decision}</strong> by ${actor}.`,
        ),
        cta: { label: "Open admin", href: `${baseUrl}/admin` },
      }),
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
        html: renderEmailDocument({
          preheader: `Your claim for ${companyLabel} was ${input.decision}.`,
          heading: approved ? "Claim approved" : "Claim update",
          bodyHtml: `
            ${emailParagraph(
              `Your company profile claim for <strong style="color:#0F172A">${companyLabel}</strong> was <strong style="color:#0F172A">${input.decision}</strong>.`,
            )}
            ${
              approved
                ? emailParagraph(
                    `You can manage the profile here: ${emailLink(profileUrl, "Open company profile")}`,
                  )
                : emailParagraph(
                    `If you believe this was in error, reply to this email or contact support via ${emailLink(`${baseUrl}/contact`, "Contact")}.`,
                  )
            }
          `.trim(),
          cta: approved
            ? { label: "Manage profile", href: profileUrl }
            : { label: "Contact support", href: `${baseUrl}/contact` },
        }),
        tags: [
          { name: "category", value: "claim_decision" },
          { name: "decision", value: input.decision },
        ],
      });
    }
  }

  return result;
}
