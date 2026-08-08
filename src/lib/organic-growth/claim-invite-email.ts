import { emailOpportunityBenefits, emailWhatIsRateQuip, escapeHtml } from "@/lib/email-copy";
import {
  emailCallout,
  emailLink,
  emailMeta,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

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
}) {
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

  const subject = `${vars.companyName} was introduced on RateQuip — claim your free profile`;
  const html = renderEmailDocument({
    preheader: `${inviter} introduced ${vars.companyName} on RateQuip. See why, what RateQuip is, and claim your free profile if you represent the business.`,
    heading: `${vars.companyName} was introduced on RateQuip`,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `<strong style="color:#0F172A">${inviterSafe}</strong> has introduced <strong style="color:#0F172A">${companyName}</strong> to RateQuip — so industrial buyers and partners can discover the company and open opportunities.`,
      )}
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
    cta: {
      label: `Claim ${vars.companyName}'s free profile & get discovered`,
      href: vars.claimUrl,
    },
    secondaryLink: {
      label: `View ${vars.companyName} on RateQuip (no claim required)`,
      href: vars.profileUrl,
    },
    footerNote: "Template v11.0-en-1",
  });

  return { subject, html };
}
