/**
 * Lightweight RateQuip Messenger for invite quick-replies.
 * Email notification still fires; threads live here for on-platform continuity.
 */

export type MessengerThread = {
  id: string;
  inviteId: string;
  inviteCode: string;
  inviterEmail?: string;
  inviterName?: string;
  inviterOrg?: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  messages: MessengerMessage[];
};

export type MessengerMessage = {
  id: string;
  threadId: string;
  fromLabel: string;
  fromEmail?: string;
  body: string;
  createdAt: string;
  direction: "invitee_to_inviter" | "inviter_to_invitee" | "system";
};

type GlobalMessenger = typeof globalThis & {
  __rqMessengerThreads?: Map<string, MessengerThread>;
};

function threads() {
  const g = globalThis as GlobalMessenger;
  if (!g.__rqMessengerThreads) g.__rqMessengerThreads = new Map();
  return g.__rqMessengerThreads;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function appendInviteReplyMessage(input: {
  inviteId: string;
  inviteCode: string;
  inviterEmail?: string;
  inviterName?: string;
  inviterOrg?: string;
  fromLabel: string;
  fromEmail?: string;
  body: string;
}): MessengerThread {
  const map = threads();
  let thread = [...map.values()].find((t) => t.inviteId === input.inviteId);
  const now = new Date().toISOString();
  if (!thread) {
    thread = {
      id: newId("msg"),
      inviteId: input.inviteId,
      inviteCode: input.inviteCode,
      inviterEmail: input.inviterEmail,
      inviterName: input.inviterName,
      inviterOrg: input.inviterOrg,
      subject: `Invite reply · ${input.inviterOrg || "RateQuip network"}`,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    map.set(thread.id, thread);
  }

  const message: MessengerMessage = {
    id: newId("m"),
    threadId: thread.id,
    fromLabel: input.fromLabel,
    fromEmail: input.fromEmail,
    body: input.body.trim(),
    createdAt: now,
    direction: "invitee_to_inviter",
  };
  thread.messages.push(message);
  thread.updatedAt = now;
  map.set(thread.id, thread);
  return thread;
}

export function listMessengerThreadsForEmail(email?: string): MessengerThread[] {
  const normalized = email?.trim().toLowerCase();
  return [...threads().values()]
    .filter((t) => {
      if (!normalized) return true;
      if (t.inviterEmail?.toLowerCase() === normalized) return true;
      return t.messages.some(
        (m) => m.fromEmail?.toLowerCase() === normalized,
      );
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getMessengerThread(id: string) {
  return threads().get(id) ?? null;
}
