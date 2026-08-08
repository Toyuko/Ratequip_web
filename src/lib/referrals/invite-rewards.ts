/**
 * Invite welcome-reward economics — progressive ladder + admin/env overrides.
 * Credits unlock on verified actions; sending an invite earns nothing.
 */

import {
  DEFAULT_REWARD_LADDER,
  isRewardEvent,
  stageForEvent,
  totalInviteeCredits,
  totalInviterCredits,
  type RewardEvent,
  type RewardStage,
} from "./reward-ladder";

export type InviteRewardSettings = {
  /**
   * Primary invitee reward (profile claimed). Kept for invite stamping /
   * legacy UI; always mirrored from the ladder's profile_claimed stage.
   */
  welcomeCredits: number;
  /**
   * Primary inviter reward (profile claimed). Mirrored from the ladder.
   */
  inviterRewardCredits: number;
  /** Award Early / Founding Member badge to invited launch users. */
  foundingMemberEnabled: boolean;
  /** Full progressive dual-sided ladder. */
  ladder: RewardStage[];
};

const DEFAULTS: InviteRewardSettings = {
  welcomeCredits:
    stageForEvent(DEFAULT_REWARD_LADDER, "profile_claimed")?.inviteeCredits ??
    250,
  inviterRewardCredits:
    stageForEvent(DEFAULT_REWARD_LADDER, "profile_claimed")?.inviterCredits ??
    100,
  foundingMemberEnabled: true,
  ladder: DEFAULT_REWARD_LADDER.map((s) => ({ ...s })),
};

type GlobalRewards = typeof globalThis & {
  __rqInviteRewardSettings?: InviteRewardSettings;
};

function clampCredits(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1_000_000, Math.round(value)));
}

function normalizeLadder(input?: RewardStage[]): RewardStage[] {
  const byEvent = new Map<RewardEvent, RewardStage>();
  for (const stage of DEFAULT_REWARD_LADDER) {
    byEvent.set(stage.event, { ...stage });
  }
  for (const stage of input ?? []) {
    if (!isRewardEvent(stage.event)) continue;
    const base = byEvent.get(stage.event)!;
    byEvent.set(stage.event, {
      ...base,
      inviteeCredits: clampCredits(stage.inviteeCredits, base.inviteeCredits),
      inviterCredits: clampCredits(stage.inviterCredits, base.inviterCredits),
    });
  }
  return DEFAULT_REWARD_LADDER.map((s) => byEvent.get(s.event)!);
}

function syncPrimaryFromLadder(ladder: RewardStage[]): {
  welcomeCredits: number;
  inviterRewardCredits: number;
} {
  const claimed = stageForEvent(ladder, "profile_claimed");
  return {
    welcomeCredits: claimed?.inviteeCredits ?? DEFAULTS.welcomeCredits,
    inviterRewardCredits:
      claimed?.inviterCredits ?? DEFAULTS.inviterRewardCredits,
  };
}

function fromEnv(): InviteRewardSettings {
  const welcomeRaw = process.env.INVITE_WELCOME_CREDITS?.trim();
  const inviterRaw = process.env.INVITE_INVITER_REWARD_CREDITS?.trim();
  const foundingRaw = process.env.INVITE_FOUNDING_MEMBER_ENABLED?.trim();

  const ladder = normalizeLadder(DEFAULT_REWARD_LADDER);
  if (welcomeRaw) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviteeCredits = clampCredits(
      Number(welcomeRaw),
      claimed.inviteeCredits,
    );
  }
  if (inviterRaw) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviterCredits = clampCredits(
      Number(inviterRaw),
      claimed.inviterCredits,
    );
  }

  const primary = syncPrimaryFromLadder(ladder);
  return {
    ...primary,
    foundingMemberEnabled:
      foundingRaw === undefined || foundingRaw === ""
        ? DEFAULTS.foundingMemberEnabled
        : !["0", "false", "off", "no"].includes(foundingRaw.toLowerCase()),
    ladder,
  };
}

/** Effective settings: runtime admin override wins over env/defaults. */
export function getInviteRewardSettings(): InviteRewardSettings {
  const g = globalThis as GlobalRewards;
  const env = fromEnv();
  const override = g.__rqInviteRewardSettings;
  if (!override) return env;
  const ladder = normalizeLadder(override.ladder ?? env.ladder);
  // Allow admin primary knobs to override the claimed stage.
  if (override.welcomeCredits !== undefined) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviteeCredits = clampCredits(
      override.welcomeCredits,
      claimed.inviteeCredits,
    );
  }
  if (override.inviterRewardCredits !== undefined) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviterCredits = clampCredits(
      override.inviterRewardCredits,
      claimed.inviterCredits,
    );
  }
  const primary = syncPrimaryFromLadder(ladder);
  return {
    welcomeCredits: primary.welcomeCredits,
    inviterRewardCredits: primary.inviterRewardCredits,
    foundingMemberEnabled:
      override.foundingMemberEnabled !== undefined
        ? Boolean(override.foundingMemberEnabled)
        : env.foundingMemberEnabled,
    ladder,
  };
}

export function setInviteRewardSettings(
  input: Partial<InviteRewardSettings>,
): InviteRewardSettings {
  const current = getInviteRewardSettings();
  const ladder = normalizeLadder(input.ladder ?? current.ladder);
  if (input.welcomeCredits !== undefined) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviteeCredits = clampCredits(
      input.welcomeCredits,
      claimed.inviteeCredits,
    );
  }
  if (input.inviterRewardCredits !== undefined) {
    const claimed = stageForEvent(ladder, "profile_claimed")!;
    claimed.inviterCredits = clampCredits(
      input.inviterRewardCredits,
      claimed.inviterCredits,
    );
  }
  const primary = syncPrimaryFromLadder(ladder);
  const next: InviteRewardSettings = {
    welcomeCredits: primary.welcomeCredits,
    inviterRewardCredits: primary.inviterRewardCredits,
    foundingMemberEnabled:
      input.foundingMemberEnabled !== undefined
        ? Boolean(input.foundingMemberEnabled)
        : current.foundingMemberEnabled,
    ladder,
  };
  (globalThis as GlobalRewards).__rqInviteRewardSettings = next;
  return next;
}

export function getRewardStage(event: RewardEvent): RewardStage {
  const settings = getInviteRewardSettings();
  return (
    stageForEvent(settings.ladder, event) ??
    stageForEvent(DEFAULT_REWARD_LADDER, event)!
  );
}

export function potentialWelcomeCredits(settings = getInviteRewardSettings()) {
  return totalInviteeCredits(settings.ladder);
}

export function potentialInviterCredits(settings = getInviteRewardSettings()) {
  return totalInviterCredits(settings.ladder);
}

/** What welcome credits unlock on RateQuip (email + landing copy). */
export const WELCOME_CREDIT_USES = [
  "Boost your company profile so buyers find you first",
  "Feature listings and products in discovery",
  "Access premium opportunities and RFQs",
  "Run advertising and visibility placements",
  "Power other RateQuip growth tools on the platform",
] as const;

export const WELCOME_CREDIT_USES_INTRO = "Use your credits to:";

export function welcomeRewardCtaLabel(credits: number) {
  if (credits <= 0) return "Accept invite & explore RateQuip";
  return `Accept invite & unlock up to ${credits} credits`;
}

export function claimRewardCtaLabel(company: string, credits: number) {
  if (credits <= 0) return `Claim ${company}'s free profile & get discovered`;
  return `Claim ${company} & unlock ${credits} credits after verification`;
}
