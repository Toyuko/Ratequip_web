import {
  emailLink,
  emailMeta,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

export function renderJoinInviteEmail(vars: {
  kindLabel: string;
  title: string;
  body: string;
  joinUrl: string;
  signUpUrl: string;
  inviterName?: string;
  companyName?: string;
  personalNote?: string;
  supportUrl: string;
}) {
  const inviter = vars.inviterName
    ? emailParagraph(`Invited by: <strong style="color:#0F172A">${vars.inviterName}</strong>`)
    : "";
  const company = vars.companyName
    ? emailParagraph(`Company: <strong style="color:#0F172A">${vars.companyName}</strong>`)
    : "";
  const note = vars.personalNote
    ? emailParagraph(
        `Personal message:<br/><em style="color:#334155">“${vars.personalNote}”</em>`,
      )
    : "";

  const subject = vars.title;
  const html = renderEmailDocument({
    preheader: vars.body,
    heading: vars.title,
    bodyHtml: `
      ${emailParagraph("Hello,")}
      ${emailParagraph(vars.body)}
      ${inviter}
      ${company}
      ${note}
      ${emailMeta(`Invite type: ${vars.kindLabel}`)}
    `.trim(),
    cta: { label: "Accept invite", href: vars.joinUrl },
    secondaryLink: {
      label: "Or create an account with this referral",
      href: vars.signUpUrl,
    },
    footerNote: emailLink(vars.supportUrl, "Contact support"),
  });

  return { subject, html };
}
