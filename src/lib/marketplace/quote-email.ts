import { escapeHtml } from "@/lib/email-copy";
import {
  emailCallout,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

export function renderQuoteSubmittedEmail(vars: {
  requestId: string;
  amount: string | number;
  leadTimeDays: string | number;
  notes?: string;
  requestUrl: string;
  supplierLabel?: string;
}) {
  const amount = escapeHtml(String(vars.amount));
  const lead = escapeHtml(String(vars.leadTimeDays));
  const supplier = vars.supplierLabel?.trim()
    ? escapeHtml(vars.supplierLabel.trim())
    : "A supplier on RateQuip";

  const subject = `New supplier opportunity on your enquiry ${vars.requestId}`;
  const html = renderEmailDocument({
    preheader: `${supplier} submitted a quote of ${vars.amount}. Compare options and keep the conversation moving on RateQuip.`,
    heading: "You’ve received a new quote",
    bodyHtml: `
      ${emailParagraph(
        `<strong style="color:#0F172A">${supplier}</strong> responded to your enquiry <strong style="color:#0F172A">${escapeHtml(vars.requestId)}</strong> on RateQuip.`,
      )}
      ${emailCallout({
        label: "Quote summary",
        bodyHtml: `<p style="margin:0;font-size:15px;line-height:1.6;color:#0F172A"><strong>${amount}</strong> · ${lead} days lead time${
          vars.notes?.trim()
            ? `<br/><em style="color:#334155">“${escapeHtml(vars.notes.trim())}”</em>`
            : ""
        }</p>`,
      })}
      ${emailParagraph(
        "This is more than a price ping — it’s a chance to compare suppliers, continue the conversation, and move the opportunity forward on RateQuip.",
      )}
      ${emailParagraph(
        "<strong style=\"color:#0F172A\">Suggested next step:</strong> open the enquiry, review the quote, and shortlist or reply while the supplier is engaged.",
      )}
    `.trim(),
    cta: {
      label: "Review quote & compare options",
      href: vars.requestUrl,
    },
  });

  return { subject, html };
}
