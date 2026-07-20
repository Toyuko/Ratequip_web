export type Cohort = {
  key: string;
  startsAt: number;
  expiresAt: number;
  killSwitch: boolean;
  percentage: number;
  members: Set<string>;
  flagKey: string;
};

function stableBucket(subject: string, flag: string): number {
  let h = 2166136261;
  for (const c of `${subject}|${flag}`) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 100;
}

/** Feature 143 — cohort / progressive rollout with kill switch. */
export function isEnabled(
  c: Cohort,
  subject: string,
  flag: string,
  now: number,
): boolean {
  if (c.killSwitch || now < c.startsAt || now >= c.expiresAt) return false;
  if (c.members.has(subject)) return true;
  return stableBucket(subject, flag) < c.percentage;
}
