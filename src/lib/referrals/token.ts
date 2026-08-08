import { createHmac, timingSafeEqual } from "crypto";
import {
  isInvitationReason,
  type InvitationReason,
} from "./invitation-reasons";
import type { ReferralInvite, ReferralKind } from "./types";
import { REFERRAL_KINDS } from "./types";

type InvitePayload = {
  v: 1;
  id: string;
  code: string;
  kind: ReferralKind;
  inviterName?: string;
  inviterOrg?: string;
  inviterEmail?: string;
  companyName?: string;
  personalNote?: string;
  opportunitySummary?: string;
  invitationReason?: InvitationReason;
  welcomeCredits?: number;
  inviterRewardCredits?: number;
  foundingMemberEligible?: boolean;
  emailMasked?: string;
  recipientName?: string;
  status?: ReferralInvite["status"];
  channel?: ReferralInvite["channel"];
  createdAt: string;
  exp: number;
};

function hmacSecret() {
  const configured =
    process.env.REFERRAL_HMAC_SECRET?.trim() ||
    process.env.OG_EMAIL_HMAC_SECRET?.trim();
  if (configured) return configured;
  return "ratequip-demo-referral-hmac-v1";
}

function isKind(value: unknown): value is ReferralKind {
  return (
    typeof value === "string" &&
    (REFERRAL_KINDS as readonly string[]).includes(value)
  );
}

/** Signed, self-contained invite token for /join/[code] across serverless instances. */
export function mintInviteToken(
  invite: Pick<
    ReferralInvite,
    | "id"
    | "code"
    | "kind"
    | "inviterName"
    | "inviterOrg"
    | "inviterEmail"
    | "companyName"
    | "personalNote"
    | "opportunitySummary"
    | "invitationReason"
    | "welcomeCredits"
    | "inviterRewardCredits"
    | "foundingMemberEligible"
    | "emailMasked"
    | "recipientName"
    | "status"
    | "channel"
    | "createdAt"
  >,
  ttlMs = 30 * 24 * 60 * 60 * 1000,
): string {
  const payload: InvitePayload = {
    v: 1,
    id: invite.id,
    code: invite.code,
    kind: invite.kind,
    inviterName: invite.inviterName,
    inviterOrg: invite.inviterOrg,
    inviterEmail: invite.inviterEmail,
    companyName: invite.companyName,
    personalNote: invite.personalNote?.slice(0, 500),
    opportunitySummary: invite.opportunitySummary?.slice(0, 280),
    invitationReason: invite.invitationReason,
    welcomeCredits: invite.welcomeCredits,
    inviterRewardCredits: invite.inviterRewardCredits,
    foundingMemberEligible: invite.foundingMemberEligible,
    emailMasked: invite.emailMasked,
    recipientName: invite.recipientName,
    status: invite.status,
    channel: invite.channel,
    createdAt: invite.createdAt,
    exp: Date.now() + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", hmacSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyInviteToken(token: string): ReferralInvite | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  if (!body || !sig) return null;

  const expected = createHmac("sha256", hmacSecret())
    .update(body)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const raw = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as InvitePayload;
    if (raw.v !== 1 || !isKind(raw.kind) || !raw.id || !raw.createdAt) {
      return null;
    }
    if (typeof raw.exp !== "number" || raw.exp < Date.now()) return null;

    const invitationReason =
      raw.invitationReason && isInvitationReason(raw.invitationReason)
        ? raw.invitationReason
        : undefined;

    return {
      id: raw.id,
      code: raw.code || raw.id.slice(0, 10),
      token: trimmed,
      kind: raw.kind,
      status: raw.status ?? "sent",
      emailMasked: raw.emailMasked,
      recipientName: raw.recipientName,
      companyName: raw.companyName,
      personalNote: raw.personalNote,
      opportunitySummary: raw.opportunitySummary,
      invitationReason,
      welcomeCredits:
        typeof raw.welcomeCredits === "number" ? raw.welcomeCredits : undefined,
      inviterRewardCredits:
        typeof raw.inviterRewardCredits === "number"
          ? raw.inviterRewardCredits
          : undefined,
      foundingMemberEligible: raw.foundingMemberEligible,
      inviterName: raw.inviterName,
      inviterOrg: raw.inviterOrg,
      inviterEmail: raw.inviterEmail,
      channel: raw.channel ?? "copy_link",
      createdAt: raw.createdAt,
      updatedAt: raw.createdAt,
    };
  } catch {
    return null;
  }
}

export function looksLikeInviteToken(code: string) {
  return code.includes(".") && code.length > 40;
}
