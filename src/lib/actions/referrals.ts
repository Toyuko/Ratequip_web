"use server";

import { cookies } from "next/headers";
import { publicAppUrl } from "@/lib/config";
import { sendTransactionalEmail } from "@/lib/email";
import {
  isDisposableEmail,
  isValidEmail,
  normalizeEmail,
} from "@/lib/organic-growth/privacy";
import { renderJoinInviteEmail } from "@/lib/referrals/join-invite-email";
import { buildShareBundle, referralCopy } from "@/lib/referrals/share";
import {
  createEmailInvite,
  createShareCode,
  getInviteByCode,
  listRecentInvites,
  markInviteSent,
  recordChannelOpen,
} from "@/lib/referrals/store";
import type { ReferralChannel, ReferralKind } from "@/lib/referrals/types";
import { REFERRAL_KINDS } from "@/lib/referrals/types";

function isKind(value: string): value is ReferralKind {
  return (REFERRAL_KINDS as readonly string[]).includes(value);
}

async function inviterContext() {
  const jar = await cookies();
  return {
    inviterName:
      jar.get("rq_contact_name")?.value ||
      jar.get("rq_email")?.value ||
      undefined,
    inviterOrg: jar.get("rq_org")?.value || undefined,
  };
}

const KIND_LABELS: Record<ReferralKind, string> = {
  join_platform: "Partner invite",
  join_company: "Join organisation",
  refer_company: "Company referral",
  refer_contractor: "Contractor referral",
};

export async function getOrCreateShareLink(input: {
  kind: ReferralKind;
  companyName?: string;
  channel?: ReferralChannel;
}) {
  if (!isKind(input.kind)) {
    return { ok: false as const, message: "Invalid invite type." };
  }

  const ctx = await inviterContext();
  const invite = createShareCode({
    kind: input.kind,
    companyName: input.companyName,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    channel: input.channel ?? "copy_link",
  });

  const share = buildShareBundle({
    code: invite.code,
    token: invite.token,
    kind: input.kind,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName,
  });

  return { ok: true as const, invite, share };
}

export async function sendReferralInvite(input: {
  kind: ReferralKind;
  email: string;
  recipientName?: string;
  companyName?: string;
  personalNote?: string;
}) {
  if (!isKind(input.kind)) {
    return { ok: false as const, message: "Invalid invite type." };
  }

  const email = normalizeEmail(input.email);
  if (!email || !isValidEmail(email)) {
    return { ok: false as const, message: "Enter a valid email address." };
  }
  if (isDisposableEmail(email)) {
    return { ok: false as const, message: "Disposable email addresses are not allowed." };
  }

  const ctx = await inviterContext();
  const invite = createEmailInvite({
    kind: input.kind,
    email,
    recipientName: input.recipientName,
    companyName: input.companyName,
    personalNote: input.personalNote,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
  });

  const copy = referralCopy(input.kind, {
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName,
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
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName,
    personalNote: input.personalNote,
  });

  const baseUrl = publicAppUrl();
  const rendered = renderJoinInviteEmail({
    kindLabel: KIND_LABELS[input.kind],
    title: copy.title,
    body: copy.text,
    joinUrl: share.joinUrl,
    signUpUrl: share.signUpUrl,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName || ctx.inviterOrg,
    personalNote: input.personalNote,
    recipientName: input.recipientName,
    supportUrl: `${baseUrl}/contact`,
  });

  const emailResult = await sendTransactionalEmail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
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
