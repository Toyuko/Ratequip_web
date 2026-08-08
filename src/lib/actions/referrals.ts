"use server";

import { cookies } from "next/headers";
import { publicAppUrl } from "@/lib/config";
import { looksLikeEmail, sendTransactionalEmail } from "@/lib/email";
import {
  isDisposableEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/organic-growth/privacy";
import {
  INVITE_QUICK_REPLIES,
  isInvitationReason,
  type InvitationReason,
} from "@/lib/referrals/invitation-reasons";
import {
  getInviteRewardSettings,
  setInviteRewardSettings,
  type InviteRewardSettings,
} from "@/lib/referrals/invite-rewards";
import { renderInviteReplyEmail } from "@/lib/referrals/invite-reply-email";
import { renderJoinInviteEmail } from "@/lib/referrals/join-invite-email";
import { buildShareBundle, referralCopy } from "@/lib/referrals/share";
import {
  createEmailInvite,
  createShareCode,
  getInviteByCode,
  getStoredInviteByCode,
  listRecentInvites,
  markInviteSent,
  recordChannelOpen,
} from "@/lib/referrals/store";
import type { ReferralChannel, ReferralKind } from "@/lib/referrals/types";
import { REFERRAL_KINDS } from "@/lib/referrals/types";
import { requireServerAdmin } from "@/lib/api/auth";

function isKind(value: string): value is ReferralKind {
  return (REFERRAL_KINDS as readonly string[]).includes(value);
}

async function inviterContext() {
  const jar = await cookies();
  const emailRaw = jar.get("rq_email")?.value?.trim();
  const nameRaw = jar.get("rq_contact_name")?.value?.trim();
  const orgRaw = jar.get("rq_org")?.value?.trim();
  const inviterEmail = emailRaw && looksLikeEmail(emailRaw) ? emailRaw : undefined;
  // Prefer a real display name — never use the email address as "who invited".
  const inviterName =
    nameRaw && !looksLikeEmail(nameRaw) ? nameRaw : undefined;

  return {
    inviterName,
    inviterOrg: orgRaw || undefined,
    inviterEmail,
  };
}

const KIND_LABELS: Record<ReferralKind, string> = {
  join_platform: "Partner invite",
  join_company: "Join organisation",
  refer_company: "Company referral",
  refer_contractor: "Contractor referral",
};

function rewardSnapshot() {
  const settings = getInviteRewardSettings();
  return {
    welcomeCredits: settings.welcomeCredits,
    inviterRewardCredits: settings.inviterRewardCredits,
    foundingMemberEligible: settings.foundingMemberEnabled,
  };
}

export async function getInviteRewardConfig() {
  return { ok: true as const, settings: getInviteRewardSettings() };
}

export async function updateInviteRewardConfig(
  input: Partial<InviteRewardSettings>,
) {
  const auth = await requireServerAdmin();
  if (!auth.user) {
    return { ok: false as const, message: auth.error ?? "Admin role required" };
  }
  const settings = setInviteRewardSettings(input);
  return {
    ok: true as const,
    settings,
    message: `Invite welcome credits set to ${settings.welcomeCredits}.`,
  };
}

export async function getOrCreateShareLink(input: {
  kind: ReferralKind;
  companyName?: string;
  personalNote?: string;
  opportunitySummary?: string;
  invitationReason?: InvitationReason;
  channel?: ReferralChannel;
}) {
  if (!isKind(input.kind)) {
    return { ok: false as const, message: "Invalid invite type." };
  }
  if (input.invitationReason && !isInvitationReason(input.invitationReason)) {
    return { ok: false as const, message: "Invalid invitation reason." };
  }

  const ctx = await inviterContext();
  const rewards = rewardSnapshot();
  const invite = createShareCode({
    kind: input.kind,
    companyName: input.companyName,
    personalNote: input.personalNote,
    opportunitySummary: input.opportunitySummary,
    invitationReason: input.invitationReason,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    inviterEmail: ctx.inviterEmail,
    ...rewards,
    channel: input.channel ?? "copy_link",
  });

  const share = buildShareBundle({
    code: invite.code,
    token: invite.token,
    kind: input.kind,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName,
    personalNote: input.personalNote,
    opportunitySummary: input.opportunitySummary,
    invitationReason: input.invitationReason,
    welcomeCredits: rewards.welcomeCredits,
  });

  return { ok: true as const, invite, share };
}

export async function sendReferralInvite(input: {
  kind: ReferralKind;
  email: string;
  recipientName?: string;
  companyName?: string;
  personalNote?: string;
  opportunitySummary?: string;
  invitationReason?: InvitationReason;
  inviterName?: string;
  inviterEmail?: string;
}) {
  if (!isKind(input.kind)) {
    return { ok: false as const, message: "Invalid invite type." };
  }
  if (input.invitationReason && !isInvitationReason(input.invitationReason)) {
    return { ok: false as const, message: "Invalid invitation reason." };
  }

  const email = normalizeEmail(input.email);
  if (!email || !isValidEmail(email)) {
    return { ok: false as const, message: "Enter a valid email address." };
  }
  if (isDisposableEmail(email)) {
    return { ok: false as const, message: "Disposable email addresses are not allowed." };
  }

  const ctx = await inviterContext();
  const companyName = input.companyName || ctx.inviterOrg;
  const namedInviter = input.inviterName?.trim();
  const inviterName =
    namedInviter && !namedInviter.includes("@")
      ? namedInviter
      : ctx.inviterName;
  const inviterEmailRaw = input.inviterEmail?.trim() || ctx.inviterEmail;
  const inviterEmail =
    inviterEmailRaw && looksLikeEmail(inviterEmailRaw)
      ? normalizeEmail(inviterEmailRaw)
      : undefined;
  if (inviterEmailRaw && !inviterEmail) {
    return { ok: false as const, message: "Enter a valid reply-to email for yourself." };
  }

  const rewards = rewardSnapshot();
  const invite = createEmailInvite({
    kind: input.kind,
    email,
    recipientName: input.recipientName,
    companyName,
    personalNote: input.personalNote,
    opportunitySummary: input.opportunitySummary,
    invitationReason: input.invitationReason,
    inviterName,
    inviterOrg: ctx.inviterOrg || companyName,
    inviterEmail,
    ...rewards,
  });

  const copy = referralCopy(input.kind, {
    inviterName,
    inviterOrg: ctx.inviterOrg || companyName,
    companyName,
    invitationReason: input.invitationReason,
  });
  const sent = markInviteSent(invite.id) ?? {
    ...invite,
    status: "sent" as const,
    updatedAt: new Date().toISOString(),
  };

  const share = buildShareBundle({
    code: sent.code,
    token: sent.token,
    kind: input.kind,
    inviterName,
    inviterOrg: ctx.inviterOrg || companyName,
    companyName,
    personalNote: input.personalNote,
    opportunitySummary: input.opportunitySummary,
    invitationReason: input.invitationReason,
    welcomeCredits: rewards.welcomeCredits,
  });

  const baseUrl = publicAppUrl();
  const rendered = renderJoinInviteEmail({
    kindLabel: KIND_LABELS[input.kind],
    title: copy.title,
    joinUrl: share.joinUrl,
    signUpUrl: share.signUpUrl,
    inviterName,
    inviterOrg: ctx.inviterOrg || companyName,
    companyName,
    personalNote: input.personalNote,
    opportunitySummary: input.opportunitySummary,
    invitationReason: input.invitationReason,
    recipientName: input.recipientName,
    welcomeCredits: rewards.welcomeCredits,
    inviterRewardCredits: rewards.inviterRewardCredits,
    foundingMemberEligible: rewards.foundingMemberEligible,
    supportUrl: `${baseUrl}/contact`,
  });

  const emailResult = await sendTransactionalEmail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
    replyTo: inviterEmail,
    tags: [{ name: "category", value: "referral_invite" }],
  });
  if (!emailResult.ok) {
    return {
      ok: false as const,
      message: `Invite saved but email failed: ${emailResult.error}`,
    };
  }

  return {
    ok: true as const,
    invite: sent,
    share,
    message: `Invite sent to ${invite.emailMasked}.`,
  };
}

export async function replyToReferralInviter(input: {
  code: string;
  message: string;
  replyFromEmail?: string;
  replyFromName?: string;
}) {
  const message = input.message.trim().slice(0, 1000);
  if (message.length < 2) {
    return { ok: false as const, message: "Enter a short reply." };
  }

  const allowedQuick = (INVITE_QUICK_REPLIES as readonly string[]).includes(
    message,
  );
  if (!allowedQuick && message.length < 8) {
    return { ok: false as const, message: "Please write a slightly longer reply." };
  }

  const invite = getStoredInviteByCode(input.code);
  if (!invite) {
    return { ok: false as const, message: "Invite not found or expired." };
  }

  const inviterEmail = invite.inviterEmail?.trim();
  if (!inviterEmail || !looksLikeEmail(inviterEmail)) {
    return {
      ok: false as const,
      message:
        "This inviter has not enabled direct replies yet. Accept the invite to connect on RateQuip, or contact support.",
    };
  }

  const replyFrom = input.replyFromEmail?.trim()
    ? normalizeEmail(input.replyFromEmail)
    : undefined;
  if (replyFrom && !isValidEmail(replyFrom)) {
    return { ok: false as const, message: "Enter a valid email if you want a reply." };
  }
  if (replyFrom && isDisposableEmail(replyFrom)) {
    return { ok: false as const, message: "Disposable email addresses are not allowed." };
  }

  const orgLabel =
    invite.companyName || invite.inviterOrg || "your organisation";
  const recipientLabel =
    input.replyFromName?.trim() ||
    invite.recipientName ||
    invite.emailMasked ||
    "An invite recipient";

  const baseUrl = publicAppUrl();
  const joinUrl = `${baseUrl}/join/${encodeURIComponent(invite.token || invite.code)}`;
  const rendered = renderInviteReplyEmail({
    inviterName: invite.inviterName,
    orgLabel,
    recipientLabel,
    message,
    joinUrl,
    supportUrl: `${baseUrl}/contact`,
  });

  const emailResult = await sendTransactionalEmail({
    to: inviterEmail,
    subject: rendered.subject,
    html: rendered.html,
    replyTo: replyFrom,
    tags: [{ name: "category", value: "referral_invite_reply" }],
  });

  if (!emailResult.ok) {
    return {
      ok: false as const,
      message: `Could not deliver your reply: ${emailResult.error}`,
    };
  }

  return {
    ok: true as const,
    message: `Your reply was sent to ${orgLabel}. They’ll get an email notification and can respond directly.`,
  };
}

export async function listReferralInvites() {
  return { ok: true as const, invites: listRecentInvites(25) };
}

export async function resolveReferralCode(code: string) {
  // Tokens are case-sensitive (base64url); short codes are hex (case-insensitive).
  const raw = decodeURIComponent(code.trim());
  const invite =
    getInviteByCode(raw) ??
    (!raw.includes(".") ? getInviteByCode(raw.toLowerCase()) : null);
  if (!invite) {
    return { ok: false as const, message: "Invite not found or expired." };
  }
  return { ok: true as const, invite };
}

export async function trackReferralShare(input: {
  code: string;
  channel: ReferralChannel;
}) {
  const updated = recordChannelOpen(input.code, input.channel);
  if (!updated) {
    return { ok: false as const, message: "Invite not found." };
  }
  return { ok: true as const, invite: updated };
}
