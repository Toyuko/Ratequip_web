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
  getInviteRewardSettings,
  potentialWelcomeCredits,
  WELCOME_CREDIT_USES,
  WELCOME_CREDIT_USES_INTRO,
  welcomeRewardCtaLabel,
} from "@/lib/referrals/invite-rewards";
import { rewardLadderSummaryLines } from "@/lib/referrals/reward-ladder";

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
  const settings = getInviteRewardSettings();
  const welcomeCredits = Math.max(0, vars.welcomeCredits ?? 0);
  const inviterRewardCredits = Math.max(0, vars.inviterRewardCredits ?? 0);
  const potentialCredits = Math.max(
    welcomeCredits,
    potentialWelcomeCredits(settings),
  );
  const ladderLines = rewardLadderSummaryLines(settings.ladder);
  const founding = Boolean(vars.foundingMemberEligible && welcomeCredits > 0);

  const orgLabel = companyName || inviterOrg || "A RateQuip partner";
  const fromPerson =
    inviterName && !inviterName.includes("@") ? inviterName : undefined;
  const replyName = fromPerson || orgLabel;
  const whoLabel = fromPerson ? `${fromPerson} at ${orgLabel}` : orgLabel;
  const askUrl = `${vars.joinUrl}${vars.joinUrl.includes("#") ? "" : "#ask-inviter"}`;
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

  const relationshipLead = emailParagraph(
    `<strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong> wants to connect with you on RateQuip — this is a personal industry introduction from <strong style="color:#0F172A">${escapeHtml(orgLabel)}</strong>, not a platform marketing blast.`,
  );

  const whyOrOpportunity = attachedOpportunity
    ? emailCallout({
        label: `Why ${escapeHtml(orgLabel)} reached out · opportunity`,
        bodyHtml: `<p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#0F172A">${
          opportunitySummary
            ? escapeHtml(opportunitySummary)
            : escapeHtml(belief)
        }</p>
        <p style="margin:0;font-size:14px;line-height:1.55;color:#334155">Accept the invite and you’ll immediately see the opportunity they opened for you.</p>`,
      })
    : emailCallout({
        label: reasonLabel
          ? `Why ${escapeHtml(orgLabel)} invited you · ${escapeHtml(reasonLabel)}`
          : `Why ${escapeHtml(orgLabel)} invited you`,
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

  const askInviterBlock = emailCallout({
    label: `Talk to ${escapeHtml(replyName)} before you join`,
    bodyHtml: `
      <p style="margin:0 0 10px;font-size:15px;line-height:1.6;color:#0F172A">Not sure why ${escapeHtml(orgLabel)} invited you? Ask them directly — no RateQuip account required.</p>
      <p style="margin:0 0 8px;font-size:14px;line-height:1.55;color:#334155">Quick replies: “Thanks for the referral!” · “What is RateQuip all about?” · “Why did you send this to me?” · “What opportunity did you have in mind?”</p>
      <p style="margin:0">${emailLink(askUrl, `Ask ${replyName} a question →`)}</p>
    `.trim(),
  });

  const rewardBlock =
    welcomeCredits > 0
      ? emailRewardBanner({
          title: `${escapeHtml(orgLabel)} unlocked your RateQuip Welcome Reward`,
          headline: `Accept this invitation and unlock ${welcomeCredits} RateQuip Credits`,
          bodyHtml: `
            <p style="margin:0 0 8px">A real platform benefit because <strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong> invited you — spend credits on visibility and growth tools once you’re in.</p>
            <p style="margin:0 0 6px"><strong style="color:#0F172A">${escapeHtml(WELCOME_CREDIT_USES_INTRO)}</strong></p>
            ${creditUses}
            ${
              potentialCredits > welcomeCredits
                ? `<p style="margin:10px 0 6px"><strong style="color:#0F172A">Keep earning — up to ${potentialCredits} credits</strong> as you verify and participate:</p>
                   ${emailBenefits(ladderLines.map((line) => escapeHtml(line)))}`
                : ""
            }
            ${
              inviterRewardCredits > 0
                ? `<p style="margin:10px 0 0">${escapeHtml(orgLabel)} also earns <strong style="color:#0F172A">${inviterRewardCredits} credits</strong> when you claim and participate — a shared win.</p>`
                : ""
            }
            ${
              founding
                ? `<p style="margin:10px 0 0"><strong style="color:#0F172A">Early Member / Founding Member badge</strong> included for invited launch users.</p>`
                : ""
            }
          `.trim(),
        })
      : "";

  const growthLoop =
    welcomeCredits > 0
      ? `
      ${emailParagraph(`<strong style="color:#0F172A">Grow with RateQuip</strong>`)}
      ${emailParagraph(
        `Invite businesses you work with → they get a welcome benefit → you earn RateQuip Credits when they join and participate. Both sides grow through verified network activity.`,
      )}
    `.trim()
      : "";

  const subject =
    welcomeCredits > 0
      ? `${whoLabel} invited you — unlock ${welcomeCredits} RateQuip credits`
      : vars.title;
  const preheader =
    welcomeCredits > 0
      ? `${whoLabel} invited you. Unlock ${welcomeCredits} credits you can use for profile boosts, featured listings and more — or ask them a question first.`
      : `${whoLabel} invited you to connect on RateQuip — see why and explore the opportunity.`;

  const html = renderEmailDocument({
    preheader,
    heading: vars.title,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${relationshipLead}
      ${whyOrOpportunity}
      ${personalWithOpportunity}
      ${askInviterBlock}
      ${rewardBlock}
      ${emailWhatIsRateQuip()}
      ${emailParagraph(`<strong style="color:#0F172A">Why join?</strong>`)}
      ${emailOpportunityBenefits(orgLabel)}
      ${growthLoop}
      ${emailMeta(
        [
          `Invited by: <strong style="color:#0F172A">${escapeHtml(whoLabel)}</strong>`,
          `Connect with: <strong style="color:#0F172A">${escapeHtml(orgLabel)}</strong>`,
          reasonLabel
            ? `Invitation reason: <strong style="color:#0F172A">${escapeHtml(reasonLabel)}</strong>`
            : null,
          welcomeCredits > 0
            ? `Welcome credits: <strong style="color:#0F172A">${welcomeCredits}</strong> you can use on RateQuip`
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
    cta: {
      label:
        welcomeCredits > 0
          ? `Accept invite + claim ${welcomeCredits} free credits`
          : welcomeRewardCtaLabel(potentialCredits),
      href: vars.signUpUrl,
    },
    secondaryLink: {
      label: `Ask ${replyName} a question (no account needed)`,
      href: askUrl,
    },
    footerNote: emailLink(
      vars.supportUrl,
      "Questions about RateQuip? Contact support",
    ),
  });

  return { subject, html };
}
