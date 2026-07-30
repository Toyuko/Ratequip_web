import { randomBytes } from "crypto";
import { maskEmail, normalizeEmail } from "@/lib/organic-growth/privacy";
import { mintInviteToken, verifyInviteToken } from "./token";
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

function withToken(invite: StoredInvite): StoredInvite {
  const token = mintInviteToken(invite);
  return { ...invite, token, code: invite.code || token.slice(0, 10) };
}

export function createShareCode(input: {
  kind: ReferralKind;
  inviterName?: string;
  inviterOrg?: string;
  companyName?: string;
  channel?: ReferralChannel;
}): ReferralInvite {
  const now = new Date().toISOString();
  const draft: StoredInvite = {
    id: newId(),
    code: newCode(),
    token: "",
    kind: input.kind,
    status: "queued",
    inviterName: input.inviterName,
    inviterOrg: input.inviterOrg,
    companyName: input.companyName,
    channel: input.channel ?? "copy_link",
    createdAt: now,
    updatedAt: now,
  };
  const invite = withToken(draft);
  invites().set(invite.id, invite);
  codes().set(invite.code, invite.id);
  codes().set(invite.token, invite.id);
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
  const draft: StoredInvite = {
    id: newId(),
    code: newCode(),
    token: "",
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
  const invite = withToken(draft);
  invites().set(invite.id, invite);
  codes().set(invite.code, invite.id);
  codes().set(invite.token, invite.id);
  return invite;
}

export function markInviteSent(id: string) {
  const invite = invites().get(id);
  if (!invite) return null;
  invite.status = "sent";
  invite.updatedAt = new Date().toISOString();
  const refreshed = withToken(invite);
  invites().set(id, refreshed);
  codes().set(refreshed.token, id);
  return publicInvite(refreshed);
}

export function getInviteByCode(code: string) {
  const raw = code.trim();
  if (!raw) return null;

  const id = codes().get(raw) ?? codes().get(raw.toLowerCase());
  if (id) {
    const invite = invites().get(id);
    if (invite) return publicInvite(invite);
  }

  // Self-contained signed token — works when memory store is cold on another instance.
  const fromToken = verifyInviteToken(raw);
  if (fromToken) {
    // Hydrate local store so subsequent channel tracking can update status.
    if (!invites().has(fromToken.id)) {
      const stored: StoredInvite = { ...fromToken };
      invites().set(fromToken.id, stored);
      codes().set(fromToken.code, fromToken.id);
      codes().set(fromToken.token, fromToken.id);
    }
    return fromToken;
  }

  return null;
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
  if (!stored) {
    // Token-only invite that wasn't hydrated — still acknowledge open.
    return {
      ...invite,
      channel,
      status:
        invite.status === "queued" || invite.status === "sent"
          ? ("opened" as const)
          : invite.status,
      updatedAt: new Date().toISOString(),
    };
  }
  stored.channel = channel;
  if (stored.status === "queued" || stored.status === "sent") {
    stored.status = "opened";
  }
  stored.updatedAt = new Date().toISOString();
  const refreshed = withToken(stored);
  invites().set(stored.id, refreshed);
  codes().set(refreshed.token, stored.id);
  return publicInvite(refreshed);
}

function publicInvite(invite: StoredInvite): ReferralInvite {
  const { email: _email, ...rest } = invite;
  return rest;
}
