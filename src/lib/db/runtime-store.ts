/**
 * Process-local mutable store for Phase 2 demo mode.
 * Mutations (claims, reviews, RFQs, moderation) persist for the Node process lifetime.
 * When DATABASE_URL is set, Neon is the source of truth instead.
 */

import {
  demoAudit,
  demoClaims,
  demoCompanies,
  demoProducts,
  demoProjects,
  demoQuotes,
  demoRequests,
  demoReviews,
  demoWallet,
  type DemoClaim,
  type DemoCompany,
  type DemoProject,
  type DemoQuote,
  type DemoRequest,
  type DemoReview,
} from "./demo-data";

export type RuntimeWallet = {
  balance: number;
  entries: { id: string; delta: number; reason: string; createdAt: string }[];
};

export type RuntimeAudit = {
  id: string;
  action: string;
  entityType: string;
  actor: string;
  createdAt: string;
};

export type RuntimeOrg = {
  id: string;
  name: string;
  slug: string;
  type: "buyer" | "supplier" | "contractor" | "admin";
  contactEmail: string;
  contactName: string;
  phone: string;
  address: string;
};

export type RuntimeUser = {
  id: string;
  clerkUserId: string | null;
  email: string;
  fullName: string;
  role: "buyer" | "supplier" | "contractor" | "admin";
  orgId: string | null;
  onboardingComplete: boolean;
};

export type RuntimeSubscription = {
  id: string;
  orgId: string;
  planCode: string;
  status: string;
  monthlyCredits: number;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  /** Prevents double-granting activation credits in demo mode. */
  creditsGranted?: boolean;
};

type GlobalStore = {
  companies: DemoCompany[];
  reviews: DemoReview[];
  claims: DemoClaim[];
  requests: DemoRequest[];
  quotes: DemoQuote[];
  projects: DemoProject[];
  products: typeof demoProducts;
  wallet: RuntimeWallet;
  audit: RuntimeAudit[];
  orgs: RuntimeOrg[];
  users: RuntimeUser[];
  subscriptions: RuntimeSubscription[];
};

declare global {
  // eslint-disable-next-line no-var
  var __ratequipStore: GlobalStore | undefined;
}

function cloneStore(): GlobalStore {
  return {
    companies: structuredClone(demoCompanies),
    reviews: structuredClone(demoReviews),
    claims: structuredClone(demoClaims),
    requests: structuredClone(demoRequests),
    quotes: structuredClone(demoQuotes),
    projects: structuredClone(demoProjects),
    products: structuredClone(demoProducts),
    wallet: structuredClone(demoWallet),
    audit: structuredClone(demoAudit),
    orgs: [],
    users: [],
    subscriptions: [],
  };
}

export function getStore(): GlobalStore {
  if (!globalThis.__ratequipStore) {
    globalThis.__ratequipStore = cloneStore();
  }
  return globalThis.__ratequipStore;
}

export function resetStore() {
  globalThis.__ratequipStore = cloneStore();
}

export function appendAudit(
  action: string,
  entityType: string,
  actor = "system",
) {
  const store = getStore();
  store.audit.unshift({
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    action,
    entityType,
    actor,
    createdAt: new Date().toISOString(),
  });
}

export function debitCredits(amount: number, reason: string) {
  const store = getStore();
  if (store.wallet.balance < amount) {
    return { ok: false as const, message: "Insufficient credits." };
  }
  store.wallet.balance -= amount;
  store.wallet.entries.unshift({
    id: `led-${Date.now()}`,
    delta: -amount,
    reason,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  return { ok: true as const, balance: store.wallet.balance };
}

export function creditCredits(amount: number, reason: string) {
  const store = getStore();
  store.wallet.balance += amount;
  store.wallet.entries.unshift({
    id: `led-${Date.now()}`,
    delta: amount,
    reason,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  return { ok: true as const, balance: store.wallet.balance };
}
