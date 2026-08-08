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
  claimRewardCtaLabel,
  getInviteRewardSettings,
  WELCOME_CREDIT_USES,
  WELCOME_CREDIT_USES_INTRO,
} from "@/lib/referrals/invite-rewards";

export function renderClaimInviteEmail(vars: {
  companyName: string;
  companyContext: string;
  profileUrl: string;
  claimUrl: string;
  expiresDate: string;
  reportOrCorrectUrl: string;
  emailPreferencesUrl: string;
  supportUrl: string;
  recipientName?: string;
  inviterDisplay?: string;
  personalNote?: string;
  welcomeCredits?: number;
  inviterRewardCredits?: number;
  foundingMemberEligible?: boolean;
}) {
  const settings = getInviteRewardSettings();
  const welcomeCredits = Math.max(
    0,
    vars.welcomeCredits ?? settings.welcomeCredits,
  );
  const inviterRewardCredits = Math.max(
    0,
    vars.inviterRewardCredits ?? settings.inviterRewardCredits,
  );
  const founding = Boolean(
    (vars.foundingMemberEligible ?? settings.foundingMemberEnabled) &&
      welcomeCredits > 0,
  );

  const companyName = escapeHtml(vars.companyName);
  const inviter = vars.inviterDisplay?.trim() || "A RateQuip partner";
  const inviterSafe = escapeHtml(inviter);
  const recipientName = vars.recipientName?.trim();
  const personalNote = vars.personalNote?.trim();
  const greeting = recipientName
    ? `Hey ${escapeHtml(recipientName)},`
    : "Hello,";

  const messageBody = personalNote
    ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#EA580C">Personal message from ${inviterSafe}</p>
       <p style="margin:0;font-size:16px;line-height:1.6;color:#0F172A"><em>“${escapeHtml(personalNote)}”</em></p>`
    : `<p style="margin:0;font-size:15px;line-height:1.6;color:#0F172A">${inviterSafe} added <strong>${companyName}</strong> so buyers and partners can discover the business on RateQuip — a deliberate introduction, not a random listing.</p>`;

  const creditUses = emailBenefits(
    WELCOME_CREDIT_USES.map((use) => escapeHtml(use)),
  );

  const rewardBlock =
    welcomeCredits > 0
      ? emailRewardBanner({
          title: `${inviterSafe} opened a RateQuip credit path for ${companyName}`,
          headline: `Claim this profile to unlock ${welcomeCredits} RateQuip Credits after verification`,
          bodyHtml: `
            <p style="margin:0 0 8px">Credits stay pending until your claim is verified — then you receive <strong style="color:#0F172A">${welcomeCredits}</strong>${
              inviterRewardCredits > 0
                ? ` and ${inviterSafe} earns <strong style="color:#0F172A">${inviterRewardCredits}</strong>`
                : ""
            }.</p>
            <p style="margin:0 0 6px"><strong style="color:#0F172A">${escapeHtml(WELCOME_CREDIT_USES_INTRO)}</strong></p>
            ${creditUses}
            ${
              founding
                ? `<p style="margin:10px 0 0"><strong style="color:#0F172A">Early Member / Founding Member badge</strong> included for invited launch users.</p>`
                : ""
            }
          `.trim(),
        })
      : "";

  const ctaLabel = claimRewardCtaLabel(vars.companyName, welcomeCredits);

  const subject =
    welcomeCredits > 0
      ? `${vars.companyName} was introduced on RateQuip — unlock ${welcomeCredits} credits after claim`
      : `${vars.companyName} was introduced on RateQuip — claim your free profile`;

  const html = renderEmailDocument({
    preheader:
      welcomeCredits > 0
        ? `${inviter} introduced ${vars.companyName}. Unlock ${welcomeCredits} credits after your claim is verified.`
        : `${inviter} introduced ${vars.companyName} on RateQuip. See why and claim your free profile if you represent the business.`,
    heading: `${vars.companyName} was introduced on RateQuip`,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `<strong style="color:#0F172A">${inviterSafe}</strong> has introduced <strong style="color:#0F172A">${companyName}</strong> to RateQuip — so industrial buyers and partners can discover the company and open opportunities.`,
      )}
      ${rewardBlock}
      ${emailParagraph(
        `Company details: <strong style="color:#0F172A">${escapeHtml(vars.companyContext)}</strong>`,
      )}
      ${emailCallout({
        label: `Why ${inviterSafe} added ${companyName}`,
        bodyHtml: messageBody,
      })}
      ${emailWhatIsRateQuip()}
      ${emailParagraph(`<strong style="color:#0F172A">What you gain by claiming</strong> — free to start:`)}
      ${emailOpportunityBenefits()}
      ${
        welcomeCredits > 0
          ? emailParagraph(
              `Credits unlock on verified actions — claim, complete profile, list products, participate in enquiries. Unlimited invitations; rewards only when real value is created.`,
            )
          : ""
      }
      ${emailParagraph(
        `The profile is currently <strong style="color:#0F172A">Unclaimed</strong>. If you are authorised to represent ${companyName}, claim it free, control how you appear, and start getting discovered. RateQuip will verify your email and authority before granting access.`,
      )}
      ${emailMeta(
        `This secure invitation expires on ${escapeHtml(vars.expiresDate)}. Do not forward the claim link.`,
      )}
      ${emailParagraph(emailLink(vars.reportOrCorrectUrl, "Not your company, or are the details wrong?"))}
      ${emailParagraph(
        `${emailLink(vars.emailPreferencesUrl, "Manage invitation emails")} · ${emailLink(vars.supportUrl, "Support")}`,
      )}
    `.trim(),
    cta: { label: ctaLabel, href: vars.claimUrl },
    secondaryLink: {
      label: `View ${vars.companyName} on RateQuip (no claim required)`,
      href: vars.profileUrl,
    },
    footerNote: "Template v12.0-en-1",
  });

  return { subject, html };
}
