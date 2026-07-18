import { and, desc, eq, gte, sql } from "drizzle-orm";
import {
  DEFAULT_COMMISSION_BPS,
  FREE_TIER_MONTHLY_RFQ_LIMIT,
  RFQ_CREDIT_COST,
  commissionAmountCents,
  getCreditPackByCode,
  getPlanByCode,
  isPaidActivePlan,
} from "@/lib/billing/catalog";
import { getDb } from "@/lib/db/index";
import {
  appendAudit,
  creditCredits,
  debitCredits,
  getStore,
} from "@/lib/db/runtime-store";
import {
  commissionLedgerEntries,
  creditLedgerEntries,
  creditWallets,
  enterpriseAccounts,
  enterpriseLedgerEntries,
  organisations,
  quotes,
  requests,
  subscriptionPlans,
  subscriptions,
} from "@/lib/db/schema";

type DbClient = NonNullable<ReturnType<typeof getDb>>;

function monthStartUtc(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

async function resolveSubscription(organisationId?: string) {
  const db = getDb();
  if (db) {
    try {
      const org = organisationId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, organisationId))
              .limit(1)
          )[0]
        : (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.slug, "demo-buyer-org"))
              .limit(1)
          )[0];
      if (org) {
        const [row] = await db
          .select({
            planCode: subscriptionPlans.code,
            status: subscriptions.status,
            organisationId: subscriptions.organisationId,
          })
          .from(subscriptions)
          .innerJoin(
            subscriptionPlans,
            eq(subscriptions.planId, subscriptionPlans.id),
          )
          .where(eq(subscriptions.organisationId, org.id))
          .orderBy(desc(subscriptions.updatedAt))
          .limit(1);
        if (row) return row;
      }
    } catch (error) {
      console.warn("[billing] resolveSubscription neon failed", error);
    }
  }
  const store = getStore();
  const sub =
    store.subscriptions.find((s) => s.orgId === (organisationId ?? "org-demo")) ??
    store.subscriptions[0];
  if (!sub) return null;
  return {
    planCode: sub.planCode,
    status: sub.status,
    organisationId: sub.orgId,
  };
}

async function neonCreditOrg(
  db: DbClient,
  organisationId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string,
) {
  let [wallet] = await db
    .select()
    .from(creditWallets)
    .where(eq(creditWallets.organisationId, organisationId))
    .limit(1);
  if (!wallet) {
    [wallet] = await db
      .insert(creditWallets)
      .values({ organisationId, balance: 0 })
      .returning();
  }
  const balance = wallet.balance + amount;
  await db
    .update(creditWallets)
    .set({ balance, updatedAt: new Date() })
    .where(eq(creditWallets.id, wallet.id));
  await db.insert(creditLedgerEntries).values({
    walletId: wallet.id,
    delta: amount,
    reason,
    referenceType,
    referenceId,
  });
  return { ok: true as const, balance, walletId: wallet.id };
}

export async function countRfqsThisMonth(organisationId?: string) {
  const db = getDb();
  const start = monthStartUtc();
  if (db) {
    try {
      let orgId = organisationId;
      if (!orgId) {
        const [org] = await db
          .select({ id: organisations.id })
          .from(organisations)
          .where(eq(organisations.slug, "demo-buyer-org"))
          .limit(1);
        orgId = org?.id;
      }
      if (orgId) {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(requests)
          .where(
            and(
              eq(requests.organisationId, orgId),
              gte(requests.createdAt, start),
            ),
          );
        return row?.count ?? 0;
      }
    } catch (error) {
      console.warn("[billing] countRfqsThisMonth neon failed", error);
    }
  }
  const store = getStore();
  const ym = start.toISOString().slice(0, 7);
  // Only count RFQs created in this process (`req-<timestamp>`), not seed fixtures.
  return store.requests.filter(
    (r) => r.createdAt.startsWith(ym) && /^req-\d{10,}/.test(r.id),
  ).length;
}

export async function assertCanCreateRfq(organisationId?: string) {
  const subscription = await resolveSubscription(organisationId);
  const paid = isPaidActivePlan(
    subscription?.planCode,
    subscription?.status ?? null,
  );
  if (paid) {
    return { ok: true as const, freeTier: false as const, used: 0, limit: 0 };
  }

  const used = await countRfqsThisMonth(organisationId);
  if (used >= FREE_TIER_MONTHLY_RFQ_LIMIT) {
    return {
      ok: false as const,
      freeTier: true as const,
      used,
      limit: FREE_TIER_MONTHLY_RFQ_LIMIT,
      message: `Free tier allows ${FREE_TIER_MONTHLY_RFQ_LIMIT} RFQ per month. Upgrade to Buyer Premium or wait until next month.`,
    };
  }
  return {
    ok: true as const,
    freeTier: true as const,
    used,
    limit: FREE_TIER_MONTHLY_RFQ_LIMIT,
  };
}

/** Debit org wallet, or enterprise pool when linked and funded. */
export async function debitCreditsPreferPool(
  db: DbClient,
  organisationId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string,
) {
  const [org] = await db
    .select()
    .from(organisations)
    .where(eq(organisations.id, organisationId))
    .limit(1);

  if (org?.enterpriseAccountId) {
    const [enterprise] = await db
      .select()
      .from(enterpriseAccounts)
      .where(eq(enterpriseAccounts.id, org.enterpriseAccountId))
      .limit(1);
    if (enterprise && enterprise.pooledBalance >= amount) {
      const balance = enterprise.pooledBalance - amount;
      await db
        .update(enterpriseAccounts)
        .set({ pooledBalance: balance, updatedAt: new Date() })
        .where(eq(enterpriseAccounts.id, enterprise.id));
      await db.insert(enterpriseLedgerEntries).values({
        enterpriseAccountId: enterprise.id,
        organisationId,
        delta: -amount,
        reason,
        referenceType,
        referenceId,
      });
      return {
        ok: true as const,
        balance,
        source: "enterprise_pool" as const,
        enterpriseAccountId: enterprise.id,
      };
    }
  }

  const [wallet] = await db
    .select()
    .from(creditWallets)
    .where(eq(creditWallets.organisationId, organisationId))
    .limit(1);
  if (!wallet || wallet.balance < amount) {
    return {
      ok: false as const,
      message: `Insufficient credits. Need ${amount}, have ${wallet?.balance ?? 0}.`,
    };
  }
  const balance = wallet.balance - amount;
  await db
    .update(creditWallets)
    .set({ balance, updatedAt: new Date() })
    .where(eq(creditWallets.id, wallet.id));
  await db.insert(creditLedgerEntries).values({
    walletId: wallet.id,
    delta: -amount,
    reason,
    referenceType,
    referenceId,
  });
  return { ok: true as const, balance, source: "org_wallet" as const };
}

export async function purchaseCreditPack(input: {
  packCode: string;
  orgId?: string;
  stripeSessionId?: string;
}) {
  const pack = getCreditPackByCode(input.packCode);
  if (!pack) {
    return { ok: false as const, message: `Unknown credit pack: ${input.packCode}` };
  }

  const reason = `Credit pack: ${pack.name} (${pack.credits})`;
  const db = getDb();
  if (db) {
    try {
      let org = input.orgId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, input.orgId))
              .limit(1)
          )[0]
        : undefined;
      if (!org) {
        [org] = await db
          .select()
          .from(organisations)
          .where(eq(organisations.slug, "demo-buyer-org"))
          .limit(1);
      }
      if (!org) {
        return { ok: false as const, message: "Organisation not found." };
      }

      if (input.stripeSessionId) {
        const [wallet] = await db
          .select()
          .from(creditWallets)
          .where(eq(creditWallets.organisationId, org.id))
          .limit(1);
        if (wallet) {
          const [dup] = await db
            .select()
            .from(creditLedgerEntries)
            .where(
              and(
                eq(creditLedgerEntries.walletId, wallet.id),
                eq(creditLedgerEntries.referenceType, "credit_pack"),
                eq(creditLedgerEntries.reason, `${reason} #${input.stripeSessionId}`),
              ),
            )
            .limit(1);
          if (dup) {
            return {
              ok: true as const,
              credits: pack.credits,
              balance: wallet.balance,
              demo: false as const,
              duplicate: true as const,
            };
          }
        }
      }

      const ledgerReason = input.stripeSessionId
        ? `${reason} #${input.stripeSessionId}`
        : reason;
      const credited = await neonCreditOrg(
        db,
        org.id,
        pack.credits,
        ledgerReason,
        "credit_pack",
      );
      creditCredits(pack.credits, reason);
      appendAudit("credits.pack_purchased", "wallet", "stripe");
      return {
        ok: true as const,
        credits: pack.credits,
        balance: credited.balance,
        demo: false as const,
      };
    } catch (error) {
      console.warn("[billing] purchaseCreditPack neon failed", error);
    }
  }

  const result = creditCredits(pack.credits, reason);
  appendAudit("credits.pack_purchased", "wallet", "demo");
  return {
    ok: true as const,
    credits: pack.credits,
    balance: result.balance,
    demo: true as const,
  };
}

export async function cancelSubscription(input?: { orgId?: string }) {
  const db = getDb();
  if (db) {
    try {
      const org = input?.orgId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, input.orgId))
              .limit(1)
          )[0]
        : (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.slug, "demo-buyer-org"))
              .limit(1)
          )[0];

      if (org) {
        const [sub] = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.organisationId, org.id))
          .orderBy(desc(subscriptions.updatedAt))
          .limit(1);
        if (sub) {
          await db
            .update(subscriptions)
            .set({ status: "canceled", updatedAt: new Date() })
            .where(eq(subscriptions.id, sub.id));
        }
      }
    } catch (error) {
      console.warn("[billing] cancelSubscription neon failed", error);
    }
  }

  const store = getStore();
  const runtime =
    store.subscriptions.find((s) => s.orgId === (input?.orgId ?? "org-demo")) ??
    store.subscriptions[0];
  if (runtime) runtime.status = "canceled";
  appendAudit("subscription.canceled", "subscription", "user");
  return { ok: true as const };
}

export async function grantSubscriptionRenewalCredits(input: {
  planCode: string;
  orgId?: string;
  stripeSubscriptionId?: string;
  periodKey: string;
}) {
  const plan = getPlanByCode(input.planCode);
  const amount = plan?.monthlyCredits ?? 0;
  if (amount <= 0) {
    return { ok: true as const, granted: 0 };
  }
  const reason = `Subscription renewal: ${input.planCode} (${input.periodKey})`;
  const db = getDb();
  if (db) {
    try {
      const org = input.orgId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, input.orgId))
              .limit(1)
          )[0]
        : (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.slug, "demo-buyer-org"))
              .limit(1)
          )[0];
      if (!org) return { ok: false as const, message: "Org not found" };

      const [wallet] = await db
        .select()
        .from(creditWallets)
        .where(eq(creditWallets.organisationId, org.id))
        .limit(1);
      if (wallet) {
        const [dup] = await db
          .select()
          .from(creditLedgerEntries)
          .where(
            and(
              eq(creditLedgerEntries.walletId, wallet.id),
              eq(creditLedgerEntries.reason, reason),
            ),
          )
          .limit(1);
        if (dup) return { ok: true as const, granted: 0, duplicate: true };
      }

      const [sub] = input.stripeSubscriptionId
        ? await db
            .select()
            .from(subscriptions)
            .where(
              eq(
                subscriptions.stripeSubscriptionId,
                input.stripeSubscriptionId,
              ),
            )
            .limit(1)
        : await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.organisationId, org.id))
            .orderBy(desc(subscriptions.updatedAt))
            .limit(1);

      await neonCreditOrg(
        db,
        org.id,
        amount,
        reason,
        "subscription_renewal",
        sub?.id,
      );
      appendAudit("subscription.renewed", "subscription", "stripe");
      return { ok: true as const, granted: amount, demo: false as const };
    } catch (error) {
      console.warn("[billing] renewal grant failed", error);
    }
  }

  creditCredits(amount, reason);
  return { ok: true as const, granted: amount, demo: true as const };
}

export async function ensureEnterpriseAccount(input: {
  name: string;
  slug: string;
  pooledCredits?: number;
  commissionBps?: number;
  memberOrgId?: string;
}) {
  const db = getDb();
  if (!db) {
    const store = getStore();
    const id = `ent-${input.slug}`;
    (store as { enterprise?: { id: string; pooledBalance: number; commissionBps: number } }).enterprise =
      {
        id,
        pooledBalance: input.pooledCredits ?? 1000,
        commissionBps: input.commissionBps ?? DEFAULT_COMMISSION_BPS,
      };
    return {
      ok: true as const,
      id,
      pooledBalance: input.pooledCredits ?? 1000,
      demo: true as const,
    };
  }

  let [existing] = await db
    .select()
    .from(enterpriseAccounts)
    .where(eq(enterpriseAccounts.slug, input.slug))
    .limit(1);
  if (!existing) {
    [existing] = await db
      .insert(enterpriseAccounts)
      .values({
        name: input.name,
        slug: input.slug,
        pooledBalance: input.pooledCredits ?? 0,
        commissionBps: input.commissionBps ?? DEFAULT_COMMISSION_BPS,
      })
      .returning();
  }

  if (input.memberOrgId) {
    await db
      .update(organisations)
      .set({
        enterpriseAccountId: existing.id,
        updatedAt: new Date(),
      })
      .where(eq(organisations.id, input.memberOrgId));
  }

  return {
    ok: true as const,
    id: existing.id,
    pooledBalance: existing.pooledBalance,
    demo: false as const,
  };
}

export async function creditEnterprisePool(input: {
  enterpriseId: string;
  credits: number;
  reason: string;
  organisationId?: string;
}) {
  const db = getDb();
  if (!db) {
    return { ok: false as const, message: "Database required for enterprise pool" };
  }
  const [enterprise] = await db
    .select()
    .from(enterpriseAccounts)
    .where(eq(enterpriseAccounts.id, input.enterpriseId))
    .limit(1);
  if (!enterprise) {
    return { ok: false as const, message: "Enterprise not found" };
  }
  const balance = enterprise.pooledBalance + input.credits;
  await db
    .update(enterpriseAccounts)
    .set({ pooledBalance: balance, updatedAt: new Date() })
    .where(eq(enterpriseAccounts.id, enterprise.id));
  await db.insert(enterpriseLedgerEntries).values({
    enterpriseAccountId: enterprise.id,
    organisationId: input.organisationId,
    delta: input.credits,
    reason: input.reason,
    referenceType: "pool_topup",
  });
  return { ok: true as const, balance };
}

export async function recordAwardCommission(input: {
  requestId: string;
  organisationId?: string;
}) {
  const db = getDb();
  if (!db) {
    const store = getStore();
    const quote = store.quotes.find((q) => q.requestId === input.requestId);
    const amount = quote?.amount ?? 0;
    const commission = commissionAmountCents(amount, DEFAULT_COMMISSION_BPS);
    appendAudit(
      "commission.recorded",
      "request",
      `bps=${DEFAULT_COMMISSION_BPS};cents=${commission}`,
    );
    return {
      ok: true as const,
      amountCents: commission,
      commissionBps: DEFAULT_COMMISSION_BPS,
      demo: true as const,
    };
  }

  try {
    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, input.requestId))
      .limit(1);
    if (!request) {
      return { ok: false as const, message: "Request not found" };
    }

    const [accepted] = await db
      .select()
      .from(quotes)
      .where(
        and(eq(quotes.requestId, request.id), eq(quotes.status, "accepted")),
      )
      .limit(1);
    const [anyQuote] = accepted
      ? [accepted]
      : await db
          .select()
          .from(quotes)
          .where(eq(quotes.requestId, request.id))
          .orderBy(desc(quotes.amount))
          .limit(1);

    if (!anyQuote) {
      return { ok: true as const, amountCents: 0, skipped: true as const };
    }

    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.id, request.organisationId))
      .limit(1);

    let commissionBps = DEFAULT_COMMISSION_BPS;
    let enterpriseAccountId: string | undefined;
    if (org?.enterpriseAccountId) {
      const [ent] = await db
        .select()
        .from(enterpriseAccounts)
        .where(eq(enterpriseAccounts.id, org.enterpriseAccountId))
        .limit(1);
      if (ent) {
        commissionBps = ent.commissionBps;
        enterpriseAccountId = ent.id;
      }
    }

    const amountCents = commissionAmountCents(anyQuote.amount, commissionBps);

    const [dup] = await db
      .select()
      .from(commissionLedgerEntries)
      .where(eq(commissionLedgerEntries.requestId, request.id))
      .limit(1);
    if (dup) {
      return {
        ok: true as const,
        amountCents: dup.amountCents,
        commissionBps: dup.commissionBps,
        duplicate: true as const,
      };
    }

    await db.insert(commissionLedgerEntries).values({
      enterpriseAccountId,
      organisationId: request.organisationId,
      requestId: request.id,
      quoteId: anyQuote.id,
      amountCents,
      commissionBps,
      status: "recorded",
      notes: `Award commission on quote ${anyQuote.id}`,
    });

    appendAudit("commission.recorded", "request", request.id);
    return {
      ok: true as const,
      amountCents,
      commissionBps,
      demo: false as const,
    };
  } catch (error) {
    console.warn("[billing] recordAwardCommission failed", error);
    return { ok: false as const, message: "Commission record failed" };
  }
}

export async function getEnterpriseAsync(organisationId?: string) {
  const db = getDb();
  if (!db) return null;
  try {
    const org = organisationId
      ? (
          await db
            .select()
            .from(organisations)
            .where(eq(organisations.id, organisationId))
            .limit(1)
        )[0]
      : (
          await db
            .select()
            .from(organisations)
            .where(eq(organisations.slug, "demo-buyer-org"))
            .limit(1)
        )[0];
    if (!org?.enterpriseAccountId) return null;
    const [ent] = await db
      .select()
      .from(enterpriseAccounts)
      .where(eq(enterpriseAccounts.id, org.enterpriseAccountId))
      .limit(1);
    if (!ent) return null;
    const ledger = await db
      .select()
      .from(enterpriseLedgerEntries)
      .where(eq(enterpriseLedgerEntries.enterpriseAccountId, ent.id))
      .orderBy(desc(enterpriseLedgerEntries.createdAt))
      .limit(10);
    return {
      id: ent.id,
      name: ent.name,
      slug: ent.slug,
      pooledBalance: ent.pooledBalance,
      commissionBps: ent.commissionBps,
      ledger: ledger.map((e) => ({
        id: e.id,
        delta: e.delta,
        reason: e.reason,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.warn("[billing] getEnterpriseAsync failed", error);
    return null;
  }
}

export { RFQ_CREDIT_COST, FREE_TIER_MONTHLY_RFQ_LIMIT };
