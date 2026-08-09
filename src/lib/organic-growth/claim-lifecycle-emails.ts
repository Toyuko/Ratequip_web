import {
  emailLink,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";
import { emailOpportunityBenefits, emailWhatIsRateQuip, escapeHtml } from "@/lib/email-copy";
import type { ClaimOutcome } from "@/lib/claims/types";

export function renderClaimOutcomeEmail(vars: {
  companyName: string;
  outcome: ClaimOutcome;
  profileUrl: string;
  claimFormUrl?: string;
  supportUrl: string;
}) {
  const company = escapeHtml(vars.companyName);

  if (vars.outcome === "verified_representative") {
    const subject = `You’re verified to represent ${vars.companyName} on RateQuip`;
    const html = renderEmailDocument({
      preheader: `Manage the public profile for ${vars.companyName}. Ownership transfer and billing stay locked.`,
      heading: "Verified representative access",
      bodyHtml: `
        ${emailParagraph(
          `You’re verified to represent <strong style="color:#0F172A">${company}</strong> on RateQuip.`,
        )}
        ${emailParagraph(
          "You can manage the public profile, products and buyer-facing details. Ownership transfer, removing other administrators, and billing controls stay locked until a stronger company-control check passes.",
        )}
        ${emailWhatIsRateQuip()}
        ${emailParagraph(`<strong style="color:#0F172A">What to do next</strong>`)}
        ${emailOpportunityBenefits()}
      `.trim(),
      cta: { label: "Open your company profile", href: vars.profileUrl },
    });
    return { subject, html };
  }

  if (vars.outcome === "verified_controller") {
    const subject = `${vars.companyName} controller access is active on RateQuip`;
    const html = renderEmailDocument({
      preheader: `You can manage the ${vars.companyName} profile and administrators.`,
      heading: "Company controller access",
      bodyHtml: `
        ${emailParagraph(
          `You’re verified as a company controller for <strong style="color:#0F172A">${company}</strong>.`,
        )}
        ${emailParagraph(
          "You can manage the public profile and administrators. Keep verification methods current so buyers continue to trust the listing.",
        )}
        ${emailWhatIsRateQuip()}
        ${emailOpportunityBenefits()}
      `.trim(),
      cta: {
        label: "Open your profile & get discovered",
        href: vars.profileUrl,
      },
    });
    return { subject, html };
  }

  if (vars.outcome === "blocked_conflict") {
    const subject = `Claim blocked for ${vars.companyName}`;
    const html = renderEmailDocument({
      preheader: `A conflict or risk signal blocked automatic verification for ${vars.companyName}.`,
      heading: "Claim blocked",
      bodyHtml: `
        ${emailParagraph(
          `Your claim for <strong style="color:#0F172A">${company}</strong> is blocked because of a conflict or risk signal.`,
        )}
        ${emailParagraph(
          "Complete a stronger company-control method (website ownership, director registry match, or approval from an existing verified administrator) to continue. RateQuip does not staff a document-review queue for claims.",
        )}
        ${emailParagraph(emailLink(vars.supportUrl, "Contact support if you need help"))}
      `.trim(),
      cta: { label: "Try another verification method", href: vars.claimFormUrl ?? vars.profileUrl },
      secondaryLink: { label: "View public profile", href: vars.profileUrl },
    });
    return { subject, html };
  }

  const subject = `Stronger verification needed for ${vars.companyName}`;
  const html = renderEmailDocument({
    preheader: `Automatic checks need a stronger company-control method for ${vars.companyName}.`,
    heading: "Stronger proof required",
    bodyHtml: `
      ${emailParagraph(
        `We couldn’t complete automatic verification for <strong style="color:#0F172A">${company}</strong> yet.`,
      )}
      ${emailParagraph(
        "Try company-domain email, website ownership, published phone, or director registry matching. You can still prepare a draft profile — it stays unpublished until verification succeeds.",
      )}
      ${
        vars.claimFormUrl
          ? emailParagraph(
              `${emailLink(vars.claimFormUrl, "Continue verification")} · ${emailLink(vars.profileUrl, "View profile")}`,
            )
          : emailParagraph(emailLink(vars.profileUrl, "View profile"))
      }
    `.trim(),
    cta: {
      label: "Continue verification",
      href: vars.claimFormUrl ?? vars.profileUrl,
    },
  });
  return { subject, html };
}

/** @deprecated Prefer renderClaimOutcomeEmail — kept for admin override paths. */
export function renderClaimSubmittedEmail(vars: {
  companyName: string;
  profileUrl: string;
  claimFormUrl?: string;
}) {
  return renderClaimOutcomeEmail({
    companyName: vars.companyName,
    outcome: "stronger_proof_required",
    profileUrl: vars.profileUrl,
    claimFormUrl: vars.claimFormUrl,
    supportUrl: vars.profileUrl,
  });
}

export function renderClaimConflictOpsEmail(vars: {
  companyName: string;
  claimant: string;
  claimId: string;
  riskFlags: string[];
  adminUrl: string;
  profileUrl: string;
}) {
  const company = escapeHtml(vars.companyName);
  const subject = `Claim conflict audit: ${vars.companyName}`;
  const html = renderEmailDocument({
    preheader: `${vars.claimant} hit a blocked_conflict outcome for ${vars.companyName}.`,
    heading: "Claim conflict (audit only)",
    bodyHtml: `
      ${emailParagraph(
        `Automated verification blocked a claim for <strong style="color:#0F172A">${company}</strong>.`,
      )}
      ${emailParagraph(`Claimant: <strong style="color:#0F172A">${escapeHtml(vars.claimant)}</strong>`)}
      ${emailParagraph(`Claim id: ${escapeHtml(vars.claimId)}`)}
      ${emailParagraph(
        `Risk flags: ${escapeHtml(vars.riskFlags.join(", ") || "(none)")}`,
      )}
      ${emailParagraph(
        "This is an audit notification only — RateQuip does not staff a claim review queue. The claimant must complete a stronger method.",
      )}
      ${emailParagraph(
        `${emailLink(vars.adminUrl, "Open admin audit")} · ${emailLink(vars.profileUrl, "View profile")}`,
      )}
    `.trim(),
    cta: { label: "Open admin audit", href: vars.adminUrl },
  });
  return { subject, html };
}

/** @deprecated Ops staffing alerts removed — conflicts use renderClaimConflictOpsEmail. */
export function renderClaimOpsAlertEmail(vars: {
  companyName: string;
  claimant: string;
  claimId: string;
  notes?: string;
  adminUrl: string;
  profileUrl: string;
}) {
  return renderClaimConflictOpsEmail({
    companyName: vars.companyName,
    claimant: vars.claimant,
    claimId: vars.claimId,
    riskFlags: vars.notes ? [vars.notes] : [],
    adminUrl: vars.adminUrl,
    profileUrl: vars.profileUrl,
  });
}

export function renderClaimDecisionEmail(vars: {
  companyName: string;
  approved: boolean;
  profileUrl: string;
  supportUrl: string;
}) {
  return renderClaimOutcomeEmail({
    companyName: vars.companyName,
    outcome: vars.approved ? "verified_controller" : "blocked_conflict",
    profileUrl: vars.profileUrl,
    supportUrl: vars.supportUrl,
  });
}
