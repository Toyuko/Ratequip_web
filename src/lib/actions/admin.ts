"use server";

import { cookies } from "next/headers";
import { requireServerAdmin } from "@/lib/api/auth";
import { persistModeration } from "@/lib/db/phase2";
import { publicAppUrl } from "@/lib/config";
import { opsEmail, sendTransactionalEmail } from "@/lib/email";
import {
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

  if (input.entityType === "claim") {
    return {
      ok: false as const,
      message:
        "Company claims are automated. There is no Approve/Reject queue — review blocked_conflict audit entries only.",
    };
  }

  const jar = await cookies();
  const actor =
    auth.user.email ||
    jar.get("rq_email")?.value ||
    "admin@ratequip.com";

  const result = await persistModeration({
    entityType: "review",
    entityId: input.entityId,
    decision: input.decision,
    actor,
  });

  if (result.ok) {
    const baseUrl = publicAppUrl();
    const companyLabel =
      ("companyName" in result && result.companyName) ||
      ("companySlug" in result && result.companySlug) ||
      input.entityId;

    await sendTransactionalEmail({
      to: opsEmail(),
      subject: `Moderation ${input.decision}: review · ${companyLabel}`,
      html: renderEmailDocument({
        preheader: `review for ${companyLabel} was ${input.decision}`,
        heading: `Moderation ${input.decision}`,
        bodyHtml: `
          ${emailParagraph(
            `<strong style="color:#0F172A">review</strong> ${input.entityId} (<strong style="color:#0F172A">${companyLabel}</strong>) was <strong style="color:#0F172A">${input.decision}</strong> by ${actor}.`,
          )}
        `.trim(),
        cta: { label: "Open admin", href: `${baseUrl}/dashboard/admin` },
      }),
      tags: [
        { name: "category", value: "moderation_ops" },
        { name: "entity", value: "review" },
      ],
    });
  }

  return result;
}
