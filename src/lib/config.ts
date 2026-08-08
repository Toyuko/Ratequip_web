export const brand = {
  name: "RateQuip",
  domain: "RateQuip.com",
  tagline: "Rate. Compare. Connect. Grow.",
  colors: {
    navy: "#0F172A",
    orange: "#F97316",
    orangeDeep: "#EA580C",
    slate: "#334155",
    muted: "#64748B",
    surface: "#F8FAFC",
    border: "#E2E8F0",
  },
} as const;

/** Canonical public origin for emails and share links (never localhost). */
export const PUBLIC_APP_URL = "https://ratequip-web.vercel.app";

/**
 * Absolute site origin for outbound links (transactional email, invites).
 * Uses NEXT_PUBLIC_APP_URL when it is a non-local URL; otherwise the
 * deployed RateQuip origin so recipients never get localhost links.
 */
export function publicAppUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (raw && !/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)) {
    return raw;
  }
  return PUBLIC_APP_URL;
}

export function hasClerkPublishableKey() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

/**
 * Demo / dual-path mode.
 * - Vercel production: only when DEMO_MODE=true (never auto-enable on missing env).
 * - Local / preview: DEMO_MODE=true, or missing DATABASE_URL / Clerk publishable key (DX).
 */
export function isDemoMode() {
  const explicit = process.env.DEMO_MODE === "true";
  if (process.env.VERCEL_ENV === "production") {
    return explicit;
  }
  return (
    explicit || !process.env.DATABASE_URL || !hasClerkPublishableKey()
  );
}

/** Prefer Neon; allow in-memory runtime store only while demo mode is active. */
export function mayUseRuntimeStore() {
  return isDemoMode();
}

export function hasClerk() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY,
  );
}

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function hasStripe() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}