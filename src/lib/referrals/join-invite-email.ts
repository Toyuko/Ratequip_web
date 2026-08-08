import {
  emailOpportunityBenefits,
  emailWhatIsRateQuip,
  escapeHtml,
} from "@/lib/email-copy";
import {
  emailCallout,
  emailLink,
  emailMeta,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";
import {
  invitationReasonExplanation,
  INVITATION_REASON_LABELS,
  type InvitationReason,
} from "@/lib/referrals/invitation-reasons";

export function renderJoinInviteEmail(vars: {
  kindLabel: string;
  title: string;
  joinUrl: string;
  signUpUrl: string;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  personalNote?: string;
  invitationReason?: InvitationReason;
  supportUrl: string;
  recipientName?: string;
}) {
  const inviterName = vars.inviterName?.trim();
  const inviterOrg = vars.inviterOrg?.trim();
  const companyName = vars.companyName?.trim();
  const personalNote = vars.personalNote?.trim();
  const recipientName = vars.recipientName?.trim();
  const invitationReason = vars.invitationReason;

  const orgLabel = companyName || inviterOrg || "A RateQuip partner";
  const fromPerson =
    inviterName && !inviterName.includes("@") ? inviterName : orgLabel;
  const greeting = recipientName
    ? `Hey ${escapeHtml(recipientName)},`
    : "Hello,";

  const belief = invitationReasonExplanation(invitationReason, orgLabel);
  const reasonLabel = invitationReason
    ? INVITATION_REASON_LABELS[invitationReason]
    : null;

  const messageBody = personalNote
    ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#EA580C">Personal message from ${escapeHtml(fromPerson)}</p>
       <p style="margin:0;font-size:16px;line-height:1.6;color:#0F172A"><em>“${escapeHtml(personalNote)}”</em></p>`
    : `<p style="margin:0;font-size:15px;line-height:1.6;color:#0F172A">${escapeHtml(belief)}</p>`;

  const subject = vars.title;
  const preheader = `${orgLabel} invited you to connect on RateQuip — see why, what you gain, and explore the opportunity.`;
  const ctaLabel = `Accept ${orgLabel}'s invitation & explore RateQuip`;

  const html = renderEmailDocument({
    preheader,
    heading: vars.title,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `<strong style="color:#0F172A">${escapeHtml(orgLabel)}</strong> has invited you to connect on RateQuip.`,
      )}
      ${emailParagraph(escapeHtml(belief))}
      ${emailCallout({
        label: reasonLabel
          ? `Why they invited you · ${escapeHtml(reasonLabel)}`
          : "Why they invited you",
        bodyHtml: messageBody,
      })}
      ${emailWhatIsRateQuip()}
      ${emailParagraph(`<strong style="color:#0F172A">Why join?</strong>`)}
      ${emailOpportunityBenefits(orgLabel)}
      ${emailParagraph(
        `Have a question for ${escapeHtml(orgLabel)} before you join? Open the invitation page to send them a quick reply — no account required.`,
      )}
      ${emailMeta(
        [
          fromPerson !== orgLabel
            ? `Invited by: <strong style="color:#0F172A">${escapeHtml(fromPerson)}</strong> at <strong style="color:#0F172A">${escapeHtml(orgLabel)}</strong>`
            : `Invited by: <strong style="color:#0F172A">${escapeHtml(orgLabel)}</strong>`,
          reasonLabel
            ? `Invitation reason: <strong style="color:#0F172A">${escapeHtml(reasonLabel)}</strong>`
            : null,
          `Invite type: ${escapeHtml(vars.kindLabel)}`,
        ]
          .filter(Boolean)
          .join("<br/>"),
      )}
    `.trim(),
    cta: { label: ctaLabel, href: vars.signUpUrl },
    secondaryLink: {
      label: `View why ${orgLabel} invited you (no sign-up required)`,
      href: vars.joinUrl,
    },
    footerNote: emailLink(
      vars.supportUrl,
      "Questions about RateQuip? Contact support",
    ),
  });

  return { subject, html };
}
