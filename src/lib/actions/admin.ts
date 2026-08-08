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
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";
import { renderClaimDecisionEmail } from "@/lib/organic-growth/claim-lifecycle-emails";
import {
  getClaimAttribution,
  processReferralRewardEvent,
} from "@/lib/referrals/reward-engine";

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
      subject: `Moderation ${input.decision}: ${input.entityType} · ${companyLabel}`,
      html: renderEmailDocument({
        preheader: `${input.entityType} for ${companyLabel} was ${input.decision}`,
        heading: `Moderation ${input.decision}`,
        bodyHtml: `
          ${emailParagraph(
            `<strong style="color:#0F172A">${input.entityType}</strong> ${input.entityId} (<strong style="color:#0F172A">${companyLabel}</strong>) was <strong style="color:#0F172A">${input.decision}</strong> by ${actor}.`,
          )}
          ${emailParagraph(
            input.decision === "approved"
              ? "If this was a company claim, the business can now manage their profile and get discovered on RateQuip."
              : "If this was a company claim, the claimant has been notified with next-step guidance.",
          )}
        `.trim(),
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
      const decision = renderClaimDecisionEmail({
        companyName: String(companyLabel),
        approved: input.decision === "approved",
        profileUrl,
        supportUrl: `${baseUrl}/contact`,
      });
      await sendTransactionalEmail({
        to: result.claimantEmail,
        subject: decision.subject,
        html: decision.html,
        tags: [
          { name: "category", value: "claim_decision" },
          { name: "decision", value: input.decision },
        ],
      });
    }

    if (input.entityType === "claim" && input.decision === "approved") {
      const attribution = getClaimAttribution(input.entityId);
      if (attribution?.inviteCode) {
        try {
          const reward = await processReferralRewardEvent({
            event: "profile_claimed",
            inviteCode: attribution.inviteCode,
            inviteeOrganisationId: attribution.organisationId,
            allowDemoFallback: true,
          });
          if (reward.ok) {
            return {
              ...result,
              message: `${result.message} ${reward.message}`,
            };
          }
        } catch (error) {
          console.warn("[admin] claim referral reward failed", error);
        }
      }
    }
  }

  return result;
}
