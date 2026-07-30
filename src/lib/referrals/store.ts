import { randomBytes } from "crypto";
import { maskEmail, normalizeEmail } from "@/lib/organic-growth/privacy";
import type {
  ReferralChannel,
  ReferralInvite,
  ReferralKind,
} from "./types";

type StoredInvite = ReferralInvite & {
  email?: string;
};

const globalStore = globalThis as typeof globalThis & {
  __rqReferralInvites?: Map<string, StoredInvite>;
  __rqReferralCodes?: Map<string, string>;
};

function invites() {
  if (!globalStore.__rqReferralInvites) {
    globalStore.__rqReferralInvites = new Map();
  }
  return globalStore.__rqReferralInvites;
}

function codes() {
  if (!globalStore.__rqReferralCodes) {
    globalStore.__rqReferralCodes = new Map();
  }
  return globalStore.__rqReferralCodes;
}

function newCode() {
  return randomBytes(5).toString("hex");
}

function newId() {
  return `ref-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createShareCode(input: {
  kind: ReferralKind;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  channel?: ReferralChannel;
}): ReferralInvite {
  const now = new Date().toISOString();
  const code = newCode();
  const invite: StoredInvite = {
    id: newId(),
    code,
    kind: input.kind,
    status: "queued",
    inviterName: input.inviterName,
    inviterOrg: input.inviterOrg,
    companyName: input.companyName,
    channel: input.channel ?? "copy_link",
    createdAt: now,
    updatedAt: now,
  };
  invites().set(invite.id, invite);
  codes().set(code, invite.id);
  return publicInvite(invite);
}

export function createEmailInvite(input: {
  kind: ReferralKind;
  email: string;
  recipientName?: string;
  companyName?: string;
  personalNote?: string;
  inviterName?: string;
  inviterOrg?: string;
}): StoredInvite {
  const now = new Date().toISOString();
  const email = normalizeEmail(input.email);
  const code = newCode();
  const invite: StoredInvite = {
    id: newId(),
    code,
    kind: input.kind,
    status: "queued",
    email,
    emailMasked: maskEmail(email),
    recipientName: input.recipientName?.trim() || undefined,
    companyName: input.companyName?.trim() || undefined,
    personalNote: input.personalNote?.trim() || undefined,
    inviterName: input.inviterName,
    inviterOrg: input.inviterOrg,
    channel: "email",
    createdAt: now,
    updatedAt: now,
  };
  invites().set(invite.id, invite);
  codes().set(code, invite.id);
  return invite;
}

export function markInviteSent(id: string) {
  const invite = invites().get(id);
  if (!invite) return null;
  invite.status = "sent";
  invite.updatedAt = new Date().toISOString();
  invites().set(id, invite);
  return publicInvite(invite);
}

export function getInviteByCode(code: string) {
  const id = codes().get(code);
  if (!id) return null;
  const invite = invites().get(id);
  return invite ? publicInvite(invite) : null;
}

export function listRecentInvites(limit = 20): ReferralInvite[] {
  return [...invites().values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(publicInvite);
}

export function recordChannelOpen(code: string, channel: ReferralChannel) {
  const invite = getInviteByCode(code);
  if (!invite) return null;
  const stored = invites().get(invite.id);
  if (!stored) return null;
  stored.channel = channel;
  if (stored.status === "queued" || stored.status === "sent") {
    stored.status = "opened";
  }
  stored.updatedAt = new Date().toISOString();
  invites().set(stored.id, stored);
  return publicInvite(stored);
}

function publicInvite(invite: StoredInvite): ReferralInvite {
  const { email: _email, ...rest } = invite;
  return rest;
}
