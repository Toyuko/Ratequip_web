import { escapeHtml } from "@/lib/email-copy";
import {
  emailCallout,
  emailLink,
  emailMeta,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

export function renderInviteReplyEmail(vars: {
  inviterName?: string;
  orgLabel: string;
  recipientLabel: string;
  message: string;
  joinUrl: string;
  supportUrl: string;
}) {
  const greeting = vars.inviterName
    ? `Hey ${escapeHtml(vars.inviterName)},`
    : "Hello,";

  const subject = `${vars.recipientLabel} replied to your RateQuip invitation`;
  const html = renderEmailDocument({
    preheader: `${vars.recipientLabel} is engaging with your invitation — continue the conversation before they even join.`,
    heading: "Your invitation started a conversation",
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(
        `<strong style="color:#0F172A">${escapeHtml(vars.recipientLabel)}</strong> replied to the RateQuip invitation you sent for <strong style="color:#0F172A">${escapeHtml(vars.orgLabel)}</strong> — before creating an account.`,
      )}
      ${emailCallout({
        label: "Their message",
        bodyHtml: `<p style="margin:0;font-size:16px;line-height:1.6;color:#0F172A"><em>“${escapeHtml(vars.message)}”</em></p>`,
      })}
      ${emailParagraph(
        "This is the point of the invitation: start a real business conversation. Reply to this email to continue — when they join RateQuip, you can keep collaborating on the platform.",
      )}
      ${emailMeta(
        "Sent from your invitation landing page — no RateQuip account required for the recipient yet.",
      )}
    `.trim(),
    cta: { label: "View invitation page", href: vars.joinUrl },
    footerNote: emailLink(vars.supportUrl, "Contact support"),
  });

  return { subject, html };
}
