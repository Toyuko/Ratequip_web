import {
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
  const greeting = vars.recipientName
    ? `Hello ${vars.recipientName},`
    : "Hello,";
  const inviter = vars.inviterDisplay
    ? emailParagraph(`Added by: <strong style="color:#0F172A">${vars.inviterDisplay}</strong>`)
    : "";
  const note = vars.personalNote
    ? emailParagraph(
        `Message from the person who added the company:<br/><em style="color:#334155">“${vars.personalNote}”</em>`,
      )
    : "";

  const subject = `${vars.companyName} was added to RateQuip — claim your free profile`;
  const html = renderEmailDocument({
    preheader: `${vars.companyName} was added to RateQuip so buyers can find you. Claim the free profile if you represent this business.`,
    heading: `${vars.companyName} was added to RateQuip`,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `A RateQuip user added <strong style="color:#0F172A">${vars.companyName}</strong> so industrial buyers can discover the company, compare suppliers, and open opportunities — this is a growth invite, not a random listing.`,
      )}
      ${emailParagraph(`Company: ${vars.companyContext}`)}
      ${inviter}
      ${note}
      ${emailParagraph(
        "The profile is currently <strong style=\"color:#0F172A\">Unclaimed</strong>. If you are authorised to represent this company, claim it free, control how you appear, and start getting discovered. RateQuip will verify your email and authority before granting access.",
      )}
      ${emailParagraph(emailLink(vars.profileUrl, "View the public profile"))}
      ${emailMeta(
        `This secure invitation expires on ${vars.expiresDate}. Do not forward the claim link.`,
      )}
      ${emailParagraph(emailLink(vars.reportOrCorrectUrl, "Not your company, or are the details wrong?"))}
      ${emailParagraph(
        `${emailLink(vars.emailPreferencesUrl, "Manage invitation emails")} · ${emailLink(vars.supportUrl, "Support")}`,
      )}
    `.trim(),
    cta: { label: "Claim free profile — get discovered", href: vars.claimUrl },
    footerNote: "Template v10.2-en-1",
  });

  return { subject, html };
}
