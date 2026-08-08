export const INVITATION_REASONS = [
  "potential_supplier",
  "potential_customer",
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
): string {
  const org = orgLabel.trim() || "A RateQuip partner";
  switch (reason) {
    case "potential_supplier":
      return `${org} believes your company could be a valuable supplier in their industry network on RateQuip.`;
    case "potential_customer":
      return `${org} sees your company as a potential customer and wants to connect with you on RateQuip.`;
    case "referral_partner":
      return `${org} would like to explore referral partnership opportunities with you on RateQuip.`;
    case "industry_connection":
      return `${org} invited you as an industry connection — to build visibility and collaborate on RateQuip.`;
    case "equipment_opportunity":
      return `${org} invited you because of a potential equipment or solutions opportunity on RateQuip.`;
    case "collaboration":
      return `${org} would like to collaborate with your business through RateQuip.`;
    case "other":
      return `${org} invited you to connect on RateQuip and explore opportunities together.`;
    default:
      return `${org} believes your company could be a valuable addition to its industry network on RateQuip.`;
  }
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
