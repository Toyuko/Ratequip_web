import { emailBenefits, emailParagraph } from "@/lib/email-template";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Shared “what is RateQuip” blurb — industry ecosystem, not RFQ-only. */
export function emailWhatIsRateQuip() {
  return `
    ${emailParagraph(`<strong style="color:#0F172A">What is RateQuip?</strong>`)}
    ${emailParagraph(
      "RateQuip is a B2B equipment and industry platform designed to connect buyers, suppliers, manufacturers and industry partners — helping businesses discover equipment, receive relevant opportunities, respond to enquiries/RFQs, build industry connections and generate new business.",
    )}
  `.trim();
}

export function emailOpportunityBenefits(orgLabel?: string) {
  const withOrg = orgLabel?.trim()
    ? `<strong style="color:#0F172A">Connect with ${escapeHtml(orgLabel.trim())}</strong> and other industry businesses`
    : `<strong style="color:#0F172A">Connect</strong> with buyers, suppliers and industry partners`;

  return emailBenefits([
    `<strong style="color:#0F172A">Claim and manage your company profile</strong>`,
    `<strong style="color:#0F172A">Showcase</strong> your products, equipment and capabilities`,
    withOrg,
    `<strong style="color:#0F172A">Receive relevant customer enquiries and RFQs</strong>`,
    `<strong style="color:#0F172A">Discover referral and partnership opportunities</strong>`,
    `<strong style="color:#0F172A">Build visibility</strong> with buyers looking for equipment and solutions`,
  ]);
}

export { escapeHtml };
