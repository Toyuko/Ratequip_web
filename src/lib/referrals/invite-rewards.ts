/**
 * Invite welcome-reward economics — admin/env configurable until credit model is final.
 */

export type InviteRewardSettings = {
  /** Credits granted to an invited user who accepts and joins. */
  welcomeCredits: number;
  /** Credits the inviter earns when their invitee joins and participates (messaging). */
  inviterRewardCredits: number;
  /** Award Early / Founding Member badge to invited launch users. */
  foundingMemberEnabled: boolean;
};

const DEFAULTS: InviteRewardSettings = {
  welcomeCredits: 250,
  inviterRewardCredits: 50,
  foundingMemberEnabled: true,
};

type GlobalRewards = typeof globalThis & {
  __rqInviteRewardSettings?: InviteRewardSettings;
};

function clampCredits(value: number, fallback: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(1_000_000, Math.round(value)));
}

function fromEnv(): InviteRewardSettings {
  const welcomeRaw = process.env.INVITE_WELCOME_CREDITS?.trim();
  const inviterRaw = process.env.INVITE_INVITER_REWARD_CREDITS?.trim();
  const foundingRaw = process.env.INVITE_FOUNDING_MEMBER_ENABLED?.trim();

  return {
    welcomeCredits: welcomeRaw
      ? clampCredits(Number(welcomeRaw), DEFAULTS.welcomeCredits)
      : DEFAULTS.welcomeCredits,
    inviterRewardCredits: inviterRaw
      ? clampCredits(Number(inviterRaw), DEFAULTS.inviterRewardCredits)
      : DEFAULTS.inviterRewardCredits,
    foundingMemberEnabled:
      foundingRaw === undefined || foundingRaw === ""
        ? DEFAULTS.foundingMemberEnabled
        : !["0", "false", "off", "no"].includes(foundingRaw.toLowerCase()),
  };
}

/** Effective settings: runtime admin override wins over env/defaults. */
export function getInviteRewardSettings(): InviteRewardSettings {
  const g = globalThis as GlobalRewards;
  const env = fromEnv();
  const override = g.__rqInviteRewardSettings;
  if (!override) return env;
  return {
    welcomeCredits: clampCredits(
      override.welcomeCredits,
      env.welcomeCredits,
    ),
    inviterRewardCredits: clampCredits(
      override.inviterRewardCredits,
      env.inviterRewardCredits,
    ),
    foundingMemberEnabled: Boolean(override.foundingMemberEnabled),
  };
}

export function setInviteRewardSettings(
  input: Partial<InviteRewardSettings>,
): InviteRewardSettings {
  const current = getInviteRewardSettings();
  const next: InviteRewardSettings = {
    welcomeCredits:
      input.welcomeCredits !== undefined
        ? clampCredits(input.welcomeCredits, current.welcomeCredits)
        : current.welcomeCredits,
    inviterRewardCredits:
      input.inviterRewardCredits !== undefined
        ? clampCredits(input.inviterRewardCredits, current.inviterRewardCredits)
        : current.inviterRewardCredits,
    foundingMemberEnabled:
      input.foundingMemberEnabled !== undefined
        ? Boolean(input.foundingMemberEnabled)
        : current.foundingMemberEnabled,
  };
  (globalThis as GlobalRewards).__rqInviteRewardSettings = next;
  return next;
}

/** What welcome credits can eventually be used for (email + landing copy). */
export const WELCOME_CREDIT_USES = [
  "Profile boosts to stand out with buyers",
  "Featured listings and product visibility",
  "Premium opportunities and RFQ access",
  "Advertising and discovery placements",
  "Other RateQuip platform functions as they roll out",
] as const;

export function welcomeRewardCtaLabel(credits: number) {
  if (credits <= 0) return "Accept invite & explore RateQuip";
  return `Accept invite + claim ${credits} free credits`;
}
