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
  inviterName?: string;
  inviterOrg?: string;
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
