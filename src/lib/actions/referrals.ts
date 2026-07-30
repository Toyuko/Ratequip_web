"use server";

import { cookies } from "next/headers";
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
  join_platform: "Join RateQuip",
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
  const share = buildShareBundle({
    code: invite.code,
    kind: input.kind,
    inviterName: ctx.inviterName,
    inviterOrg: ctx.inviterOrg,
    companyName: input.companyName,
    personalNote: input.personalNote,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const rendered = renderJoinInviteEmail({
    kindLabel: KIND_LABELS[input.kind],
    title: copy.emailSubject,
    body: copy.text,
    joinUrl: share.joinUrl,
    signUpUrl: share.signUpUrl,
    inviterName: ctx.inviterName,
    companyName: input.companyName,
    personalNote: input.personalNote,
    supportUrl: `${baseUrl}/contact`,
  });

  await sendTransactionalEmail({
    to: email,
    subject: rendered.subject,
    html: rendered.html,
  });

  const sent = markInviteSent(invite.id);

  return {
    ok: true as const,
    invite: sent ?? {
      id: invite.id,
      code: invite.code,
      kind: invite.kind,
      status: "sent" as const,
      emailMasked: invite.emailMasked,
      recipientName: invite.recipientName,
      companyName: invite.companyName,
      personalNote: invite.personalNote,
      inviterName: invite.inviterName,
      inviterOrg: invite.inviterOrg,
      channel: invite.channel,
      createdAt: invite.createdAt,
      updatedAt: new Date().toISOString(),
    },
    share,
    message: `Invite sent to ${invite.emailMasked}.`,
  };
}

export async function listReferralInvites() {
  return { ok: true as const, invites: listRecentInvites(25) };
}

export async function resolveReferralCode(code: string) {
  const invite = getInviteByCode(code.trim().toLowerCase()) ?? getInviteByCode(code.trim());
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
