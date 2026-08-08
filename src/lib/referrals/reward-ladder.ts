/**
 * Progressive dual-sided referral rewards.
 * Unlimited invites; credits release only on verified marketplace actions.
 */

export const REWARD_EVENTS = [
  "email_verified",
  "profile_claimed",
  "profile_completed",
  "first_listing",
  "first_enquiry",
  "paying_customer",
] as const;

export type RewardEvent = (typeof REWARD_EVENTS)[number];

export type RewardStage = {
  event: RewardEvent;
  label: string;
  description: string;
  inviteeCredits: number;
  inviterCredits: number;
};

/** Default ladder — invite send earns 0; value unlocks on real participation. */
export const DEFAULT_REWARD_LADDER: RewardStage[] = [
  {
    event: "email_verified",
    label: "Email verified / account joined",
    description: "Invitee creates an account and verifies their email.",
    inviteeCredits: 25,
    inviterCredits: 10,
  },
  {
    event: "profile_claimed",
    label: "Company profile claimed",
    description: "Invitee claims and gets approval for their business profile.",
    inviteeCredits: 250,
    inviterCredits: 100,
  },
  {
    event: "profile_completed",
    label: "Profile completed",
    description: "Core company profile fields completed (about, location, types).",
    inviteeCredits: 50,
    inviterCredits: 25,
  },
  {
    event: "first_listing",
    label: "First product / service listed",
    description: "Invitee publishes a legitimate catalogue listing.",
    inviteeCredits: 75,
    inviterCredits: 50,
  },
  {
    event: "first_enquiry",
    label: "First RFQ / enquiry participation",
    description: "Invitee creates an enquiry or submits a quote.",
    inviteeCredits: 50,
    inviterCredits: 40,
  },
  {
    event: "paying_customer",
    label: "Becomes a paying customer",
    description: "Invitee purchases credits or an active paid plan.",
    inviteeCredits: 200,
    inviterCredits: 150,
  },
];

export function isRewardEvent(value: string): value is RewardEvent {
  return (REWARD_EVENTS as readonly string[]).includes(value);
}

export function totalInviteeCredits(ladder: RewardStage[]) {
  return ladder.reduce((sum, stage) => sum + Math.max(0, stage.inviteeCredits), 0);
}

export function totalInviterCredits(ladder: RewardStage[]) {
  return ladder.reduce((sum, stage) => sum + Math.max(0, stage.inviterCredits), 0);
}

export function stageForEvent(
  ladder: RewardStage[],
  event: RewardEvent,
): RewardStage | undefined {
  return ladder.find((stage) => stage.event === event);
}

/** Short copy lines for emails / join landings. */
export function rewardLadderSummaryLines(ladder: RewardStage[]): string[] {
  return ladder
    .filter((s) => s.inviteeCredits > 0 || s.inviterCredits > 0)
    .map((s) => {
      const parts: string[] = [];
      if (s.inviteeCredits > 0) parts.push(`you ${s.inviteeCredits}`);
      if (s.inviterCredits > 0) parts.push(`inviter ${s.inviterCredits}`);
      return `${s.label}: ${parts.join(" · ")} credits`;
    });
}
