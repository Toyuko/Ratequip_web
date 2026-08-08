export const INVITATION_REASONS = [
  "potential_supplier",
  "potential_customer",
  "potential_contractor",
  "referral_partner",
  "industry_connection",
  "equipment_opportunity",
  "collaboration",
  "other",
] as const;

export type InvitationReason = (typeof INVITATION_REASONS)[number];

export const INVITATION_REASON_LABELS: Record<InvitationReason, string> = {
  potential_supplier: "Potential supplier",
  potential_customer: "Potential customer",
  potential_contractor: "Potential contractor",
  referral_partner: "Referral partner",
  industry_connection: "Industry connection",
  equipment_opportunity: "Equipment opportunity",
  collaboration: "Collaboration",
  other: "Other",
};

/** Dynamic “why you were invited” copy when the sender picks a reason. */
export function invitationReasonExplanation(
  reason: InvitationReason | undefined,
  orgLabel: string,
  personLabel?: string,
): string {
  const org = orgLabel.trim() || "A RateQuip partner";
  const who =
    personLabel?.trim() && personLabel.trim() !== org
      ? `${personLabel.trim()} at ${org}`
      : org;
  switch (reason) {
    case "potential_supplier":
      return `${who} invited you as a potential supplier in their industry network on RateQuip.`;
    case "potential_customer":
      return `${who} invited you as a potential customer and wants to connect with you on RateQuip.`;
    case "potential_contractor":
      return `${who} invited you as a potential contractor / service provider on RateQuip.`;
    case "referral_partner":
      return `${who} invited you as a referral partner to grow opportunities together on RateQuip.`;
    case "industry_connection":
      return `${who} invited you as an industry connection — to build visibility and collaborate on RateQuip.`;
    case "equipment_opportunity":
      return `${who} invited you because of a potential equipment or solutions opportunity on RateQuip.`;
    case "collaboration":
      return `${who} invited you to collaborate with their business through RateQuip.`;
    case "other":
      return `${who} invited you to connect on RateQuip and explore opportunities together.`;
    default:
      return `${who} believes your company could be a valuable addition to its industry network on RateQuip.`;
  }
}

/** True when the invite carries a concrete opportunity (not just a relationship reason). */
export function hasAttachedOpportunity(input: {
  invitationReason?: InvitationReason;
  opportunitySummary?: string;
}): boolean {
  if (input.opportunitySummary?.trim()) return true;
  return input.invitationReason === "equipment_opportunity";
}

export function isInvitationReason(value: string): value is InvitationReason {
  return (INVITATION_REASONS as readonly string[]).includes(value);
}

export const INVITE_QUICK_REPLIES = [
  "Thanks for the referral!",
  "What is RateQuip all about?",
  "Why did you send this to me?",
  "What opportunity did you have in mind?",
] as const;
