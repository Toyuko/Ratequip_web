import type { InvitationReason } from "./invitation-reasons";

export const REFERRAL_KINDS = [
  "join_platform",
  "join_company",
  "refer_company",
  "refer_contractor",
] as const;

export type ReferralKind = (typeof REFERRAL_KINDS)[number];

export const REFERRAL_CHANNELS = [
  "email",
  "linkedin",
  "x",
  "whatsapp",
  "facebook",
  "copy_link",
  "native_share",
  "other",
] as const;

export type ReferralChannel = (typeof REFERRAL_CHANNELS)[number];

export type ReferralInviteStatus =
  | "queued"
  | "sent"
  | "opened"
  | "accepted"
  | "expired"
  | "failed";

export type ReferralInvite = {
  id: string;
  /** Short display code; join URLs use `token` when present. */
  code: string;
  /** Signed self-contained token for /join across serverless instances. */
  token: string;
  kind: ReferralKind;
  status: ReferralInviteStatus;
  emailMasked?: string;
  recipientName?: string;
  companyName?: string;
  personalNote?: string;
  /** Concrete opportunity attached to this invite (optional). */
  opportunitySummary?: string;
  invitationReason?: InvitationReason;
  /** Welcome credits promised at send time (admin-configurable economics). */
  welcomeCredits?: number;
  /** Inviter reward credits mentioned in growth-loop copy at send time. */
  inviterRewardCredits?: number;
  /** Early / Founding Member badge eligibility for launch invites. */
  foundingMemberEligible?: boolean;
  inviterName?: string;
  inviterOrg?: string;
  /** Inviter organisation id for dual-sided credit grants when available. */
  inviterOrgId?: string;
  /**
   * Inviter contact for reply routing. Prefer omitting from list UIs;
   * use `canReplyToInviter` for invitee-facing pages.
   */
  inviterEmail?: string;
  /** True when the invitee can message the inviter before joining. */
  canReplyToInviter?: boolean;
  channel: ReferralChannel;
  createdAt: string;
  updatedAt: string;
};

export type ReferralShareBundle = {
  code: string;
  token?: string;
  joinUrl: string;
  signUpUrl: string;
  title: string;
  text: string;
  emailSubject: string;
  emailBody: string;
  linkedInUrl: string;
  xUrl: string;
  whatsAppUrl: string;
  facebookUrl: string;
  mailtoUrl: string;
};
