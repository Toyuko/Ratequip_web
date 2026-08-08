import {
  emailOpportunityBenefits,
  emailWhatIsRateQuip,
  escapeHtml,
} from "@/lib/email-copy";
import {
  emailBenefits,
  emailCallout,
  emailLink,
  emailMeta,
  emailParagraph,
  emailRewardBanner,
  renderEmailDocument,
} from "@/lib/email-template";
import {
  hasAttachedOpportunity,
  invitationReasonExplanation,
  INVITATION_REASON_LABELS,
  type InvitationReason,
} from "@/lib/referrals/invitation-reasons";
import {
  WELCOME_CREDIT_USES,
  welcomeRewardCtaLabel,
} from "@/lib/referrals/invite-rewards";

export function renderJoinInviteEmail(vars: {
  kindLabel: string;
  title: string;
  joinUrl: string;
  signUpUrl: string;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  personalNote?: string;
  opportunitySummary?: string;
  invitationReason?: InvitationReason;
  welcomeCredits?: number;
  inviterRewardCredits?: number;
  foundingMemberEligible?: boolean;
  supportUrl: string;
  recipientName?: string;
}) {
  const inviterName = vars.inviterName?.trim();
  const inviterOrg = vars.inviterOrg?.trim();
  const companyName = vars.companyName?.trim();
  const personalNote = vars.personalNote?.trim();
  const opportunitySummary = vars.opportunitySummary?.trim();
  const recipientName = vars.recipientName?.trim();
  const invitationReason = vars.invitationReason;
  const welcomeCredits = Math.max(0, vars.welcomeCredits ?? 0);
  const inviterRewardCredits = Math.max(0, vars.inviterRewardCredits ?? 0);
  const founding = Boolean(vars.foundingMemberEligible && welcomeCredits > 0);

  const orgLabel = companyName || inviterOrg || "A RateQuip partner";
  const fromPerson =
    inviterName && !inviterName.includes("@") ? inviterName : undefined;
  const whoLabel = fromPerson ? `${fromPerson} at ${orgLabel}` : orgLabel;
  const greeting = recipientName
    ? `Hey ${escapeHtml(recipientName)},`
    : "Hello,";

  const belief = invitationReasonExplanation(
    invitationReason,
    orgLabel,
    fromPerson,
  );
  const reasonLabel = invitationReason
    ? INVITATION_REASON_LABELS[invitationReason]
    : null;
  const attachedOpportunity = hasAttachedOpportunity({
    invitationReason,
    opportunitySummary,
  });

  const creditUses = emailBenefits(
    WELCOME_CREDIT_USES.map((use) => escapeHtml(use)),
  );

  const rewardBlock =
    welcomeCredits > 0
      ? emailRewardBanner({
          title: `${escapeHtml(orgLabel)} has unlocked your RateQuip Welcome Reward`,
          headline: `Accept this invitation and receive ${welcomeCredits} FREE RateQuip Credits`,
          bodyHtml: `
            <p style="margin:0 0 8px">A tangible welcome benefit because <strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong> invited you — not just another free signup.</p>
            <p style="margin:0 0 6px"><strong style="color:#0F172A">Credits can eventually be used for:</strong></p>
            ${creditUses}
            ${
              founding
                ? `<p style="margin:10px 0 0"><strong style="color:#0F172A">Early Member / Founding Member badge</strong> included for invited launch users.</p>`
                : ""
            }
          `.trim(),
        })
      : "";

  const whyOrOpportunity = attachedOpportunity
    ? emailCallout({
        label: "The opportunity they opened for you",
        bodyHtml: `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0F172A">${
          opportunitySummary
            ? escapeHtml(opportunitySummary)
            : escapeHtml(belief)
        }</p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#334155">Accept the invite and you’ll immediately see the opportunity they opened for you.</p>`,
      })
    : emailCallout({
        label: reasonLabel
          ? `Why they invited you · ${escapeHtml(reasonLabel)}`
          : "Why they invited you",
        bodyHtml: personalNote
          ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#EA580C">Personal message from ${escapeHtml(whoLabel)}</p>
             <p style="margin:0 0 10px;font-size:16px;line-height:1.6;color:#0F172A"><em>“${escapeHtml(personalNote)}”</em></p>
             <p style="margin:0;font-size:14px;line-height:1.55;color:#334155">${escapeHtml(belief)}</p>`
          : `<p style="margin:0;font-size:15px;line-height:1.6;color:#0F172A">${escapeHtml(belief)}</p>`,
      });

  const personalWithOpportunity =
    attachedOpportunity && personalNote
      ? emailCallout({
          label: `Personal message from ${escapeHtml(whoLabel)}`,
          bodyHtml: `<p style="margin:0;font-size:16px;line-height:1.6;color:#0F172A"><em>“${escapeHtml(personalNote)}”</em></p>`,
        })
      : "";

  const growthLoop =
    welcomeCredits > 0
      ? `
      ${emailParagraph(`<strong style="color:#0F172A">Grow with RateQuip</strong>`)}
      ${emailParagraph(
        `Invite businesses you work with → they receive a welcome benefit (like your ${welcomeCredits} free credits) → you earn RateQuip Credits${
          inviterRewardCredits > 0 ? ` (from ${inviterRewardCredits} credits)` : ""
        } when they join and participate.`,
      )}
    `.trim()
      : "";

  const subject =
    welcomeCredits > 0
      ? `${whoLabel} invited you — claim ${welcomeCredits} free RateQuip credits`
      : vars.title;
  const preheader =
    welcomeCredits > 0
      ? `${orgLabel} unlocked your welcome reward: ${welcomeCredits} free credits. See why they invited you and claim them.`
      : `${whoLabel} invited you to connect on RateQuip — see why and explore the opportunity.`;

  const html = renderEmailDocument({
    preheader,
    heading: vars.title,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `<strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong> has personally invited you to connect on RateQuip.`,
      )}
      ${rewardBlock}
      ${whyOrOpportunity}
      ${personalWithOpportunity}
      ${emailWhatIsRateQuip()}
      ${emailParagraph(`<strong style="color:#0F172A">Why join?</strong>`)}
      ${emailOpportunityBenefits(orgLabel)}
      ${growthLoop}
      ${emailParagraph(
        `Have a question for ${escapeHtml(fromPerson || orgLabel)} before you join? Open the invitation page to send a quick reply — no account required.`,
      )}
      ${emailMeta(
        [
          `Invited by: <strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong>`,
          reasonLabel
            ? `Invitation reason: <strong style="color:#0F172A">${escapeHtml(reasonLabel)}</strong>`
            : null,
          welcomeCredits > 0
            ? `Welcome reward: <strong style="color:#0F172A">${welcomeCredits} free credits</strong>`
            : null,
          founding
            ? `Badge: <strong style="color:#0F172A">Early / Founding Member</strong>`
            : null,
          `Invite type: ${escapeHtml(vars.kindLabel)}`,
        ]
          .filter(Boolean)
          .join("<br/>"),
      )}
    `.trim(),
    cta: { label: welcomeRewardCtaLabel(welcomeCredits), href: vars.signUpUrl },
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
