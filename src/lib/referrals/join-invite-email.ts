import {
  emailBenefits,
  emailCallout,
  emailLink,
  emailMeta,
  emailParagraph,
  renderEmailDocument,
} from "@/lib/email-template";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderJoinInviteEmail(vars: {
  kindLabel: string;
  title: string;
  body: string;
  joinUrl: string;
  signUpUrl: string;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  personalNote?: string;
  supportUrl: string;
  recipientName?: string;
}) {
  const inviterName = vars.inviterName?.trim();
  const inviterOrg = vars.inviterOrg?.trim();
  const companyName = vars.companyName?.trim();
  const personalNote = vars.personalNote?.trim();
  const recipientName = vars.recipientName?.trim();

  const who =
    [inviterName, inviterOrg || companyName].filter(Boolean).join(" at ") ||
    companyName ||
    "A RateQuip partner";
  const orgLabel = companyName || inviterOrg || "their organisation";
  const greeting = recipientName
    ? `Hello ${escapeHtml(recipientName)},`
    : "Hello,";

  const whyBody = personalNote
    ? `<p style="margin:0 0 10px"><em style="color:#0F172A">“${escapeHtml(personalNote)}”</em></p>
       <p style="margin:0;font-size:14px;line-height:1.55;color:#334155">${escapeHtml(who)} sent this so you know exactly why you’re here — not a random add, a deliberate invite to connect on RateQuip.</p>`
    : `<p style="margin:0">${escapeHtml(who)} wants you on RateQuip so you can collaborate with confidence: build reputation, get discovered by industrial buyers, compare suppliers, and grow opportunities together — far more than “just another RFQ tool”.</p>`;

  const benefits = [
    `<strong style="color:#0F172A">Claim your free company profile</strong> and control how buyers see you`,
    `<strong style="color:#0F172A">Get discovered</strong> by verified industrial buyers and partners`,
    `<strong style="color:#0F172A">Rate, compare and connect</strong> with suppliers you can trust`,
    `<strong style="color:#0F172A">Win more work</strong> through warm introductions, RFQs and pipeline visibility`,
  ];

  const subject = vars.title;
  const preheader = personalNote
    ? `${orgLabel} invited you — see why, then join free on RateQuip.`
    : `${who} invited you to RateQuip — claim your free profile and unlock buyer discovery.`;

  const html = renderEmailDocument({
    preheader,
    heading: vars.title,
    bodyHtml: `
      ${emailParagraph(greeting)}
      ${emailParagraph(vars.body)}
      ${emailCallout({
        label: `Why ${escapeHtml(orgLabel)} invited you`,
        bodyHtml: whyBody,
      })}
      ${emailParagraph(
        `<strong style="color:#0F172A">What you unlock when you accept</strong> — free to start:`,
      )}
      ${emailBenefits(benefits)}
      ${emailParagraph(
        "Accept below to create your account with this invite. It takes a minute — and you’ll immediately see the opportunity they opened for you.",
      )}
      ${
        inviterName || companyName || inviterOrg
          ? emailMeta(
              [
                inviterName
                  ? `Invited by: <strong style="color:#0F172A">${escapeHtml(inviterName)}</strong>`
                  : null,
                companyName || inviterOrg
                  ? `Company: <strong style="color:#0F172A">${escapeHtml(companyName || inviterOrg || "")}</strong>`
                  : null,
                `Invite type: ${escapeHtml(vars.kindLabel)}`,
              ]
                .filter(Boolean)
                .join("<br/>"),
            )
          : emailMeta(`Invite type: ${escapeHtml(vars.kindLabel)}`)
      }
    `.trim(),
    cta: { label: "Accept invite — join free", href: vars.joinUrl },
    secondaryLink: {
      label: "Or create an account with this referral",
      href: vars.signUpUrl,
    },
    footerNote: emailLink(vars.supportUrl, "Questions? Contact support"),
  });

  return { subject, html };
}
