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

export function hasClerkPublishableKey() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
}

export function isDemoMode() {
  return (
    process.env.DEMO_MODE === "true" ||
    !process.env.DATABASE_URL ||
    !hasClerkPublishableKey()
  );
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