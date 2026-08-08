import { emailOpportunityBenefits, emailWhatIsRateQuip, escapeHtml } from "@/lib/email-copy";
import {
  emailLink,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

export function renderClaimSubmittedEmail(vars: {
  companyName: string;
  profileUrl: string;
  claimFormUrl?: string;
}) {
  const company = escapeHtml(vars.companyName);
  const subject = `We received your claim for ${vars.companyName} — next steps`;
  const html = renderEmailDocument({
    preheader: `Your claim for ${vars.companyName} is in review. Once approved, you can showcase capabilities and get discovered by buyers.`,
    heading: "Your claim is in review",
    bodyHtml: `
      ${emailParagraph("Thanks — we’ve received your company profile claim.")}
      ${emailParagraph(
        `Company: <strong style="color:#0F172A">${company}</strong>`,
      )}
      ${emailParagraph(
        "Our team will verify your authority to represent the business. We’ll email you as soon as it’s approved or if we need anything else.",
      )}
      ${emailParagraph(
        `<strong style="color:#0F172A">Once approved, you’ll be able to:</strong>`,
      )}
      ${emailOpportunityBenefits()}
      ${
        vars.claimFormUrl
          ? emailParagraph(
              `${emailLink(vars.profileUrl, "View the public profile")} · ${emailLink(vars.claimFormUrl, "Open claim form")}`,
            )
          : emailParagraph(emailLink(vars.profileUrl, "View the public profile"))
      }
    `.trim(),
    cta: { label: "View your public profile", href: vars.profileUrl },
  });
  return { subject, html };
}

export function renderClaimOpsAlertEmail(vars: {
  companyName: string;
  claimant: string;
  claimId: string;
  notes?: string;
  adminUrl: string;
  profileUrl: string;
}) {
  const company = escapeHtml(vars.companyName);
  const subject = `New company claim to review: ${vars.companyName}`;
  const html = renderEmailDocument({
    preheader: `${vars.claimant} claimed ${vars.companyName} — review and unlock their profile opportunity.`,
    heading: "New company claim to review",
    bodyHtml: `
      ${emailParagraph(
        `A business has requested to claim <strong style="color:#0F172A">${company}</strong> on RateQuip.`,
      )}
      ${emailParagraph(`Claimant: <strong style="color:#0F172A">${escapeHtml(vars.claimant)}</strong>`)}
      ${emailParagraph(`Claim id: ${escapeHtml(vars.claimId)}`)}
      ${emailParagraph(`Notes: ${escapeHtml(vars.notes || "(none)")}`)}
      ${emailParagraph(
        "Approving unlocks their ability to manage the profile, get discovered by buyers, and respond to opportunities.",
      )}
      ${emailParagraph(
        `${emailLink(vars.adminUrl, "Open admin")} · ${emailLink(vars.profileUrl, "View profile")}`,
      )}
    `.trim(),
    cta: { label: "Review claim in admin", href: vars.adminUrl },
  });
  return { subject, html };
}

export function renderClaimDecisionEmail(vars: {
  companyName: string;
  approved: boolean;
  profileUrl: string;
  supportUrl: string;
}) {
  const company = escapeHtml(vars.companyName);
  if (vars.approved) {
    const subject = `${vars.companyName} is yours on RateQuip — start getting discovered`;
    const html = renderEmailDocument({
      preheader: `Your claim for ${vars.companyName} was approved. Showcase capabilities, connect with buyers, and grow opportunities.`,
      heading: `Welcome — ${vars.companyName} is live`,
      bodyHtml: `
        ${emailParagraph(
          `Great news — your claim for <strong style="color:#0F172A">${company}</strong> was <strong style="color:#0F172A">approved</strong>.`,
        )}
        ${emailParagraph(
          "You now control the company profile. This is your opportunity to show buyers what you offer and grow through RateQuip’s industry network.",
        )}
        ${emailWhatIsRateQuip()}
        ${emailParagraph(`<strong style="color:#0F172A">What to do next</strong>`)}
        ${emailOpportunityBenefits()}
        ${emailParagraph(
          emailLink(vars.profileUrl, "Open your company profile"),
        )}
      `.trim(),
      cta: {
        label: "Open your profile & get discovered",
        href: vars.profileUrl,
      },
    });
    return { subject, html };
  }

  const subject = `Update on your claim for ${vars.companyName}`;
  const html = renderEmailDocument({
    preheader: `Your claim for ${vars.companyName} needs attention. Contact us if you believe this was in error.`,
    heading: "Claim update",
    bodyHtml: `
      ${emailParagraph(
        `Your company profile claim for <strong style="color:#0F172A">${company}</strong> was not approved.`,
      )}
      ${emailParagraph(
        "This can happen when we can’t verify authority, or when company details need correcting. If you represent this business, reply or contact support and we’ll help you sort it out.",
      )}
      ${emailParagraph(
        `We’re still here if there’s a better path — RateQuip is built to help industry businesses get discovered and grow connections.`,
      )}
      ${emailParagraph(emailLink(vars.supportUrl, "Contact support"))}
    `.trim(),
    cta: { label: "Contact support", href: vars.supportUrl },
    secondaryLink: {
      label: "View the public profile",
      href: vars.profileUrl,
    },
  });
  return { subject, html };
}
