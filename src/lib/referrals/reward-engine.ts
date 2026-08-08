/**
 * Dual-sided progressive referral reward engine.
 * Attribution via invite code cookie + invite store; grants via credit ledger.
 */

import { grantPlatformCredits } from "@/lib/billing/operations";
import { appendAudit } from "@/lib/db/runtime-store";
import { getInviteRewardSettings } from "./invite-rewards";
import type { RewardEvent } from "./reward-ladder";
import { stageForEvent } from "./reward-ladder";
import {
  getInviteByCode,
  getInviteById,
  getStoredInviteByCode,
  markInviteAccepted,
} from "./store";

export const REFERRAL_COOKIE = "rq_ref";

export type RewardGrantRecord = {
  id: string;
  inviteId: string;
  event: RewardEvent;
  side: "invitee" | "inviter";
  organisationId?: string;
  amount: number;
  createdAt: string;
  demo: boolean;
  duplicate?: boolean;
};

type ClaimAttribution = {
  inviteCode: string;
  organisationId?: string;
  claimantEmail?: string;
};

type GlobalRewardState = typeof globalThis & {
  __rqReferralGrants?: Map<string, RewardGrantRecord>;
  __rqInviteOrgBindings?: Map<string, string>;
  __rqClaimAttributions?: Map<string, ClaimAttribution>;
};

function grants() {
  const g = globalThis as GlobalRewardState;
  if (!g.__rqReferralGrants) g.__rqReferralGrants = new Map();
  return g.__rqReferralGrants;
}

function orgBindings() {
  const g = globalThis as GlobalRewardState;
  if (!g.__rqInviteOrgBindings) g.__rqInviteOrgBindings = new Map();
  return g.__rqInviteOrgBindings;
}

function claimAttributions() {
  const g = globalThis as GlobalRewardState;
  if (!g.__rqClaimAttributions) g.__rqClaimAttributions = new Map();
  return g.__rqClaimAttributions;
}

/** Remember which invite/org a company claim belongs to (for approve-time grants). */
export function bindClaimAttribution(
  claimId: string,
  input: ClaimAttribution,
) {
  if (!claimId || !input.inviteCode) return;
  claimAttributions().set(claimId, input);
  if (input.organisationId) {
    bindInviteeOrganisation(input.inviteCode, input.organisationId);
  }
}

export function getClaimAttribution(claimId: string) {
  return claimAttributions().get(claimId) ?? null;
}

function grantKey(inviteId: string, event: RewardEvent, side: string) {
  return `${inviteId}:${event}:${side}`;
}

/** Bind an invitee's organisation to an accepted invite for later ladder grants. */
export function bindInviteeOrganisation(inviteCode: string, organisationId: string) {
  const invite = getInviteByCode(inviteCode);
  if (!invite || !organisationId) return null;
  orgBindings().set(invite.id, organisationId);
  markInviteAccepted(invite.code);
  return invite.id;
}

export function getBoundInviteeOrganisation(inviteId: string) {
  return orgBindings().get(inviteId);
}

export function listRewardGrants(limit = 50): RewardGrantRecord[] {
  return [...grants().values()]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function acceptReferralAttribution(code: string) {
  const invite = getInviteByCode(code);
  if (!invite) {
    return { ok: false as const, message: "Invite not found or expired." };
  }
  const accepted = markInviteAccepted(invite.token || invite.code) ?? invite;
  appendAudit("referral.accepted", "referral_invite", invite.id);
  return {
    ok: true as const,
    invite: accepted,
    cookieValue: invite.token || invite.code,
  };
}

type ProcessResult = {
  ok: true;
  event: RewardEvent;
  inviteId: string;
  inviteeGranted: number;
  inviterGranted: number;
  grants: RewardGrantRecord[];
  message: string;
};

/**
 * Release ladder credits for a verified event.
 * Uses invite-stamped primary amounts for profile_claimed when present.
 */
/** Resolve invite from an organisation binding (e.g. Stripe webhook path). */
export async function processReferralRewardForOrganisation(input: {
  event: RewardEvent;
  organisationId: string;
  allowDemoFallback?: boolean;
}) {
  const orgId = input.organisationId.trim();
  if (!orgId) {
    return { ok: false as const, message: "Organisation id required." };
  }
  for (const [inviteId, boundOrgId] of orgBindings()) {
    if (boundOrgId !== orgId) continue;
    const invite = getInviteById(inviteId);
    if (!invite) continue;
    return processReferralRewardEvent({
      event: input.event,
      inviteCode: invite.token || invite.code,
      inviteeOrganisationId: orgId,
      allowDemoFallback: input.allowDemoFallback,
    });
  }
  return {
    ok: false as const,
    message: "No referral attribution bound to this organisation.",
  };
}

export async function processReferralRewardEvent(input: {
  event: RewardEvent;
  inviteCode?: string | null;
  inviteeOrganisationId?: string | null;
  inviterOrganisationId?: string | null;
  /** When true, allow demo wallet credit even without org ids. */
  allowDemoFallback?: boolean;
}): Promise<
  | ProcessResult
  | { ok: false; message: string }
> {
  const code = input.inviteCode?.trim();
  if (!code) {
    return { ok: false, message: "No referral attribution on this account." };
  }

  const invite = getStoredInviteByCode(code) ?? getInviteByCode(code);
  if (!invite) {
    return { ok: false, message: "Invite not found for attribution." };
  }

  markInviteAccepted(invite.token || invite.code);

  const settings = getInviteRewardSettings();
  const stage = stageForEvent(settings.ladder, input.event);
  if (!stage) {
    return { ok: false, message: `Unknown reward event: ${input.event}` };
  }

  // Prefer amounts stamped on the invite for the primary claim stage.
  let inviteeAmount = stage.inviteeCredits;
  let inviterAmount = stage.inviterCredits;
  if (input.event === "profile_claimed") {
    if (typeof invite.welcomeCredits === "number") {
      inviteeAmount = invite.welcomeCredits;
    }
    if (typeof invite.inviterRewardCredits === "number") {
      inviterAmount = invite.inviterRewardCredits;
    }
  }

  const inviteeOrgId =
    input.inviteeOrganisationId?.trim() ||
    orgBindings().get(invite.id) ||
    undefined;
  const inviterOrgId =
    input.inviterOrganisationId?.trim() ||
    invite.inviterOrgId ||
    undefined;

  if (inviteeOrgId) {
    orgBindings().set(invite.id, inviteeOrgId);
  }

  const created: RewardGrantRecord[] = [];
  let inviteeGranted = 0;
  let inviterGranted = 0;

  async function grantSide(
    side: "invitee" | "inviter",
    amount: number,
    organisationId?: string,
  ) {
    if (amount <= 0) return;
    const key = grantKey(invite!.id, input.event, side);
    if (grants().has(key)) {
      const existing = grants().get(key)!;
      created.push({ ...existing, duplicate: true });
      return;
    }

    if (!organisationId && !input.allowDemoFallback) {
      return;
    }

    const reason = `Referral reward · ${input.event} · ${side} · ${invite!.id}`;
    const result = await grantPlatformCredits({
      amount,
      reason,
      organisationId,
      referenceType: "referral_reward",
    });

    if (!result.ok) return;

    const record: RewardGrantRecord = {
      id: key,
      inviteId: invite!.id,
      event: input.event,
      side,
      organisationId,
      amount: result.granted ?? amount,
      createdAt: new Date().toISOString(),
      demo: Boolean(result.demo),
      duplicate: Boolean(result.duplicate),
    };
    grants().set(key, record);
    created.push(record);
    if (!result.duplicate) {
      if (side === "invitee") inviteeGranted += record.amount;
      else inviterGranted += record.amount;
    }
  }

  await grantSide("invitee", inviteeAmount, inviteeOrgId);
  await grantSide("inviter", inviterAmount, inviterOrgId);

  // If invitee had no org but demo fallback — still credit runtime wallet once.
  if (
    inviteeAmount > 0 &&
    !inviteeOrgId &&
    input.allowDemoFallback &&
    !grants().has(grantKey(invite.id, input.event, "invitee"))
  ) {
    await grantSide("invitee", inviteeAmount, undefined);
  }

  appendAudit(
    `referral.reward.${input.event}`,
    "referral_invite",
    invite.id,
  );

  const parts: string[] = [];
  if (inviteeGranted > 0) parts.push(`${inviteeGranted} to invitee`);
  if (inviterGranted > 0) parts.push(`${inviterGranted} to inviter`);
  const message =
    parts.length > 0
      ? `Unlocked ${parts.join(" and ")} for ${stage.label}.`
      : created.some((g) => g.duplicate)
        ? `Reward already granted for ${stage.label}.`
        : `No credits released yet for ${stage.label} (waiting for organisation binding).`;

  return {
    ok: true,
    event: input.event,
    inviteId: invite.id,
    inviteeGranted,
    inviterGranted,
    grants: created,
    message,
  };
}
