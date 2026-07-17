import { desc, eq, or } from "drizzle-orm";
import { hasDatabase } from "@/lib/config";
import { calculateTrustScore } from "@/lib/trust-score";
import { slugify } from "@/lib/utils";
import {
  demoCategories,
  type DemoClaim,
  type DemoCompany,
  type DemoProject,
  type DemoQuote,
  type DemoRequest,
  type DemoReview,
} from "./demo-data";
import { getDb } from "./index";
import {
  appendAudit,
  creditCredits,
  debitCredits,
  getStore,
} from "./runtime-store";
import {
  auditEvents,
  categories,
  companies,
  companyCategories,
  companyClaims,
  creditLedgerEntries,
  creditWallets,
  organisationMembers,
  organisations,
  products,
  projects,
  quotes,
  requests,
  reviewDocuments,
  reviews,
  subscriptionPlans,
  subscriptions,
  trustScores,
  users,
} from "./schema";

const RFQ_CREDIT_COST = 25;
const DEMO_BUYER_ORG_SLUG = "demo-buyer-org";

type DbClient = NonNullable<ReturnType<typeof getDb>>;

async function ensureDemoBuyerOrg(db: DbClient) {
  const [existing] = await db
    .select()
    .from(organisations)
    .where(eq(organisations.slug, DEMO_BUYER_ORG_SLUG))
    .limit(1);
  if (existing) {
    const [wallet] = await db
      .select()
      .from(creditWallets)
      .where(eq(creditWallets.organisationId, existing.id))
      .limit(1);
    if (!wallet) {
      await db.insert(creditWallets).values({
        organisationId: existing.id,
        balance: 250,
      });
    }
    return existing;
  }

  const [created] = await db
    .insert(organisations)
    .values({
      name: "Demo Buyer Org",
      slug: DEMO_BUYER_ORG_SLUG,
      type: "buyer",
    })
    .returning();
  await db.insert(creditWallets).values({
    organisationId: created.id,
    balance: 250,
  });
  return created;
}

async function neonDebitCredits(
  db: DbClient,
  organisationId: string,
  amount: number,
  reason: string,
  referenceType?: string,
  referenceId?: string,
) {
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
  return { ok: true as const, balance, walletId: wallet.id };
}

async function neonCreditCredits(
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

function mapCompanyRow(row: typeof companies.$inferSelect, cats: string[] = []): DemoCompany {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    headline: row.headline ?? "",
    description: row.description ?? "",
    country: row.country ?? "",
    city: row.city ?? "",
    website: row.website ?? "",
    verified: row.verified,
    claimed: row.claimed,
    trustScore: Number(row.trustScore),
    reviewCount: row.reviewCount,
    employeeRange: row.employeeRange ?? "",
    yearFounded: row.yearFounded ?? 0,
    categories: cats,
  };
}

export async function listCategoriesAsync() {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(categories);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description ?? "",
          parentId: r.parentId,
        }));
      }
    } catch (error) {
      console.warn("[phase2] Neon listCategories failed", error);
    }
  }
  return demoCategories;
}

export async function listCompaniesAsync(opts?: {
  q?: string;
  category?: string;
  country?: string;
}): Promise<DemoCompany[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db.select().from(companies);
      if (rows.length > 0) {
        const links = await db.select().from(companyCategories);
        const cats = await db.select().from(categories);
        const slugByCatId = new Map(cats.map((c) => [c.id, c.slug]));
        const catsByCompany = new Map<string, string[]>();
        for (const link of links) {
          const slug = slugByCatId.get(link.categoryId);
          if (!slug) continue;
          const list = catsByCompany.get(link.companyId) ?? [];
          list.push(slug);
          catsByCompany.set(link.companyId, list);
        }

        let items = rows.map((r) =>
          mapCompanyRow(r, catsByCompany.get(r.id) ?? []),
        );
        if (opts?.q) {
          const q = opts.q.toLowerCase();
          items = items.filter(
            (c) =>
              c.name.toLowerCase().includes(q) ||
              c.headline.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q),
          );
        }
        if (opts?.category) {
          const match = new Set(categoryMatchSlugsSync(opts.category));
          items = items.filter((c) =>
            c.categories.some((slug) => match.has(slug)),
          );
        }
        if (opts?.country) {
          items = items.filter(
            (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
          );
        }
        return items.sort((a, b) => b.trustScore - a.trustScore);
      }
    } catch (error) {
      console.warn("[phase2] Neon listCompanies failed, using runtime store", error);
    }
  }

  const store = getStore();
  let items = [...store.companies];
  if (opts?.q) {
    const q = opts.q.toLowerCase();
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.headline.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }
  if (opts?.category) {
    const match = new Set(categoryMatchSlugsSync(opts.category));
    items = items.filter((c) => c.categories.some((slug) => match.has(slug)));
  }
  if (opts?.country) {
    items = items.filter(
      (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
    );
  }
  return items.sort((a, b) => b.trustScore - a.trustScore);
}

function categoryMatchSlugsSync(slug: string): string[] {
  const category = demoCategories.find((c) => c.slug === slug);
  if (!category) return [slug];
  const children = demoCategories
    .filter((c) => c.parentId === category.id)
    .map((c) => c.slug);
  return [category.slug, ...children];
}

export async function getCompanyBySlugAsync(
  slug: string,
): Promise<DemoCompany | null> {
  const db = getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(companies)
        .where(eq(companies.slug, slug))
        .limit(1);
      if (row) {
        const links = await db
          .select()
          .from(companyCategories)
          .where(eq(companyCategories.companyId, row.id));
        const cats = await db.select().from(categories);
        const slugByCatId = new Map(cats.map((c) => [c.id, c.slug]));
        const catSlugs = links
          .map((l) => slugByCatId.get(l.categoryId))
          .filter((s): s is string => Boolean(s));
        return mapCompanyRow(row, catSlugs);
      }
    } catch (error) {
      console.warn("[phase2] Neon getCompany failed", error);
    }
  }
  return getStore().companies.find((c) => c.slug === slug) ?? null;
}

export async function getCompanyProductsAsync(slug: string) {
  const company = await getCompanyBySlugAsync(slug);
  if (!company) return [];

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(products)
        .where(eq(products.companyId, company.id));
      if (rows.length > 0) {
        return rows.map((p) => ({
          id: p.id,
          companySlug: slug,
          name: p.name,
          summary: p.summary ?? "",
        }));
      }
    } catch (error) {
      console.warn("[phase2] Neon products failed", error);
    }
  }
  return getStore().products.filter((p) => p.companySlug === slug);
}

export async function getCompanyReviewsAsync(slug: string): Promise<DemoReview[]> {
  const company = await getCompanyBySlugAsync(slug);
  if (!company) return [];

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(reviews)
        .where(eq(reviews.companyId, company.id))
        .orderBy(desc(reviews.createdAt));
      if (rows.length > 0) {
        return rows
          .filter((r) => r.status === "approved")
          .map((r) => ({
            id: r.id,
            companyId: r.companyId,
            companySlug: slug,
            rating: r.rating,
            title: r.title,
            body: r.body,
            author: "User",
            verifiedPurchase: r.verifiedPurchase,
            status: r.status,
            createdAt: r.createdAt.toISOString().slice(0, 10),
          }));
      }
    } catch (error) {
      console.warn("[phase2] Neon reviews failed", error);
    }
  }
  return getStore().reviews.filter(
    (r) => r.companySlug === slug && r.status === "approved",
  );
}

export async function listRequestsAsync(): Promise<DemoRequest[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(requests)
        .orderBy(desc(requests.createdAt));
      if (rows.length > 0) {
        const quoteRows = await db.select().from(quotes);
        const countByRequest = new Map<string, number>();
        for (const q of quoteRows) {
          countByRequest.set(
            q.requestId,
            (countByRequest.get(q.requestId) ?? 0) + 1,
          );
        }
        return rows.map((r) => ({
          id: r.id,
          title: r.title,
          slug: r.slug,
          description: r.description,
          category: "",
          budgetMin: r.budgetMin ?? 0,
          budgetMax: r.budgetMax ?? 0,
          currency: r.currency,
          deliveryCountry: r.deliveryCountry ?? "",
          status: r.status as DemoRequest["status"],
          quoteCount: countByRequest.get(r.id) ?? 0,
          createdAt: r.createdAt.toISOString().slice(0, 10),
        }));
      }
    } catch (error) {
      console.warn("[phase2] Neon listRequests failed", error);
    }
  }
  return getStore().requests;
}

export async function getRequestByIdAsync(
  id: string,
): Promise<DemoRequest | null> {
  const all = await listRequestsAsync();
  return all.find((r) => r.id === id || r.slug === id) ?? null;
}

export async function getQuotesForRequestAsync(requestId: string) {
  const request = await getRequestByIdAsync(requestId);
  if (!request) return [];

  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(quotes)
        .where(eq(quotes.requestId, request.id));
      if (rows.length > 0) {
        const companyRows = await db.select().from(companies);
        const companyById = new Map(companyRows.map((c) => [c.id, c]));
        return rows.map((q) => {
          const company = companyById.get(q.companyId);
          return {
            id: q.id,
            requestId: q.requestId,
            companySlug: company?.slug ?? "",
            companyName: company?.name ?? "Supplier",
            amount: q.amount,
            currency: q.currency,
            leadTimeDays: q.leadTimeDays ?? 0,
            notes: q.notes ?? "",
            status: q.status,
          };
        });
      }
    } catch (error) {
      console.warn("[phase2] Neon quotes failed", error);
    }
  }
  return getStore().quotes.filter(
    (q) => q.requestId === request.id || q.requestId === requestId,
  );
}

export async function listPendingReviewsAsync(): Promise<DemoReview[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          review: reviews,
          companySlug: companies.slug,
          authorEmail: users.email,
        })
        .from(reviews)
        .leftJoin(companies, eq(reviews.companyId, companies.id))
        .leftJoin(users, eq(reviews.authorUserId, users.id))
        .where(eq(reviews.status, "pending"))
        .orderBy(desc(reviews.createdAt));
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.review.id,
          companyId: r.review.companyId,
          companySlug: r.companySlug ?? r.review.companyId,
          rating: r.review.rating,
          title: r.review.title,
          body: r.review.body,
          author: r.authorEmail ?? "User",
          verifiedPurchase: r.review.verifiedPurchase,
          status: r.review.status,
          createdAt: r.review.createdAt.toISOString().slice(0, 10),
        }));
      }
    } catch (error) {
      console.warn("[phase2] Neon pending reviews failed", error);
    }
  }
  return getStore().reviews.filter((r) => r.status === "pending");
}

export async function listPendingClaimsAsync(): Promise<DemoClaim[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          claim: companyClaims,
          companyName: companies.name,
          companySlug: companies.slug,
          claimantEmail: users.email,
        })
        .from(companyClaims)
        .leftJoin(companies, eq(companyClaims.companyId, companies.id))
        .leftJoin(users, eq(companyClaims.claimantUserId, users.id))
        .where(eq(companyClaims.status, "pending"))
        .orderBy(desc(companyClaims.createdAt));
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.claim.id,
          companyName: r.companyName ?? r.claim.companyId,
          companySlug: r.companySlug ?? r.claim.companyId,
          claimant: r.claimantEmail ?? "claimant",
          status: r.claim.status,
          notes: r.claim.notes ?? "",
          createdAt: r.claim.createdAt.toISOString().slice(0, 10),
        }));
      }
    } catch (error) {
      console.warn("[phase2] Neon pending claims failed", error);
    }
  }
  return getStore().claims.filter((c) => c.status === "pending");
}

export async function upsertClerkUser(input: {
  clerkUserId: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}) {
  const db = getDb();
  if (db) {
    try {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, input.clerkUserId))
        .limit(1);
      if (existing[0]) {
        await db
          .update(users)
          .set({
            email: input.email,
            fullName: input.fullName,
            avatarUrl: input.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkUserId, input.clerkUserId));
        return { id: existing[0].id, demo: false };
      }
      const [created] = await db
        .insert(users)
        .values({
          clerkUserId: input.clerkUserId,
          email: input.email,
          fullName: input.fullName,
          avatarUrl: input.avatarUrl,
        })
        .returning({ id: users.id });
      return { id: created.id, demo: false };
    } catch (error) {
      console.warn("[phase2] Neon upsertClerkUser failed", error);
    }
  }

  const store = getStore();
  let user = store.users.find((u) => u.clerkUserId === input.clerkUserId);
  if (!user) {
    user = {
      id: `user-${input.clerkUserId}`,
      clerkUserId: input.clerkUserId,
      email: input.email,
      fullName: input.fullName ?? input.email,
      role: "buyer",
      orgId: null,
      onboardingComplete: false,
    };
    store.users.push(user);
  } else {
    user.email = input.email;
    user.fullName = input.fullName ?? user.fullName;
  }
  return { id: user.id, demo: true };
}

export async function persistOnboarding(input: {
  clerkUserId?: string | null;
  role: "buyer" | "supplier" | "contractor";
  orgName: string;
  email: string;
  contactName: string;
  phone: string;
  address: string;
}) {
  const orgSlug = slugify(input.orgName);
  const db = getDb();

  if (db) {
    try {
      const clerkUserId =
        input.clerkUserId ?? `local-${slugify(input.email) || Date.now()}`;
      const { id: userId } = await upsertClerkUser({
        clerkUserId,
        email: input.email,
        fullName: input.contactName,
      });

      const [org] = await db
        .insert(organisations)
        .values({
          name: input.orgName,
          slug: `${orgSlug}-${Date.now().toString(36)}`,
          type: input.role,
        })
        .returning();

      await db.insert(organisationMembers).values({
        organisationId: org.id,
        userId,
        role: "admin",
      });

      await db.insert(creditWallets).values({
        organisationId: org.id,
        balance: 250,
      });

      await db
        .update(users)
        .set({
          primaryRole: input.role,
          onboardingComplete: true,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      appendAudit("onboarding.completed", "organisation", input.email);
      return { ok: true, orgId: org.id, demo: false };
    } catch (error) {
      console.warn("[phase2] Neon onboarding failed", error);
    }
  }

  const store = getStore();
  const orgId = `org-${Date.now()}`;
  store.orgs.push({
    id: orgId,
    name: input.orgName,
    slug: orgSlug,
    type: input.role,
    contactEmail: input.email,
    contactName: input.contactName,
    phone: input.phone,
    address: input.address,
  });

  const userId = input.clerkUserId
    ? `user-${input.clerkUserId}`
    : `user-demo-${Date.now()}`;
  const existing = store.users.find((u) => u.id === userId);
  if (existing) {
    existing.role = input.role;
    existing.orgId = orgId;
    existing.onboardingComplete = true;
    existing.email = input.email;
    existing.fullName = input.contactName;
  } else {
    store.users.push({
      id: userId,
      clerkUserId: input.clerkUserId ?? null,
      email: input.email,
      fullName: input.contactName,
      role: input.role,
      orgId,
      onboardingComplete: true,
    });
  }

  appendAudit("onboarding.completed", "organisation", input.email);
  return { ok: true, orgId, demo: true };
}

export async function persistCompanyProfile(input: {
  companySlug: string;
  name: string;
  headline: string;
  description: string;
  city: string;
  country: string;
  actor?: string;
}) {
  const company = await getCompanyBySlugAsync(input.companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(companies)
        .set({
          name: input.name,
          headline: input.headline,
          description: input.description,
          city: input.city,
          country: input.country,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, company.id));
      appendAudit("company.updated", "company", input.actor ?? "supplier");
      return {
        ok: true as const,
        message: `Profile for ${input.name} saved.`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon company profile failed", error);
    }
  }

  const store = getStore();
  const runtime = store.companies.find((c) => c.slug === input.companySlug);
  if (runtime) {
    runtime.name = input.name;
    runtime.headline = input.headline;
    runtime.description = input.description;
    runtime.city = input.city;
    runtime.country = input.country;
  }
  appendAudit("company.updated", "company", input.actor ?? "supplier");
  return {
    ok: true as const,
    message: `Profile for ${input.name} saved.`,
    demo: true,
  };
}

export async function persistClaim(input: {
  companySlug: string;
  notes: string;
  claimant: string;
  evidenceUrl?: string;
}) {
  const company = await getCompanyBySlugAsync(input.companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const db = getDb();
  if (db && hasDatabase()) {
    try {
      const [claim] = await db
        .insert(companyClaims)
        .values({
          companyId: company.id,
          claimantUserId: (
            await upsertClerkUser({
              clerkUserId: `demo-${input.claimant}`,
              email: input.claimant,
            })
          ).id,
          evidenceUrl: input.evidenceUrl,
          notes: input.notes,
          status: "pending",
        })
        .returning();
      appendAudit("claim.submitted", "company_claim", input.claimant);
      return {
        ok: true as const,
        id: claim.id,
        message: `Claim for ${company.name} queued for admin review.`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon claim failed", error);
    }
  }

  const store = getStore();
  const id = `claim-${Date.now()}`;
  store.claims.unshift({
    id,
    companyName: company.name,
    companySlug: company.slug,
    claimant: input.claimant,
    status: "pending",
    notes: input.notes,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  appendAudit("claim.submitted", "company_claim", input.claimant);
  return {
    ok: true as const,
    id,
    message: `Claim for ${company.name} queued for admin review.`,
    demo: true,
  };
}

export async function persistReview(input: {
  companySlug: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  evidenceName?: string;
  evidenceUrl?: string;
}) {
  const company = await getCompanyBySlugAsync(input.companySlug);
  if (!company) {
    return { ok: false as const, message: "Company not found." };
  }

  const provisional = calculateTrustScore({
    avgRating: input.rating,
    reviewCount: company.reviewCount + 1,
    verifiedReviewShare: input.evidenceName ? 1 : 0.5,
    verifiedCompany: company.verified,
    claimedCompany: company.claimed,
    responseRate: 0.8,
  });

  const db = getDb();
  if (db && hasDatabase()) {
    try {
      const author = await upsertClerkUser({
        clerkUserId: `local-${slugify(input.author) || "author"}`,
        email: input.author.includes("@")
          ? input.author
          : `${slugify(input.author) || "author"}@example.com`,
        fullName: input.author,
      });
      const [review] = await db
        .insert(reviews)
        .values({
          companyId: company.id,
          authorUserId: author.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
          verifiedPurchase: Boolean(input.evidenceName || input.evidenceUrl),
          status: "pending",
        })
        .returning();

      if (input.evidenceName || input.evidenceUrl) {
        await db.insert(reviewDocuments).values({
          reviewId: review.id,
          blobUrl:
            input.evidenceUrl ?? `demo://evidence/${input.evidenceName}`,
          fileName: input.evidenceName ?? "evidence",
        });
      }

      appendAudit("review.submitted", "review", input.author);
      return {
        ok: true as const,
        id: review.id,
        message: `Review submitted for moderation. Provisional Trust Score impact: ${provisional.score}.`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon review failed", error);
    }
  }

  const store = getStore();
  const id = `rev-${Date.now()}`;
  store.reviews.unshift({
    id,
    companyId: company.id,
    companySlug: company.slug,
    rating: input.rating,
    title: input.title,
    body: input.body,
    author: input.author,
    verifiedPurchase: Boolean(input.evidenceName),
    status: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  appendAudit("review.submitted", "review", input.author);
  return {
    ok: true as const,
    id,
    message: `Review submitted for moderation. Provisional Trust Score impact: ${provisional.score}.`,
    demo: true,
  };
}

async function recalculateCompanyTrust(companyId: string, companySlug: string) {
  const store = getStore();
  const db = getDb();

  let company =
    store.companies.find((c) => c.id === companyId || c.slug === companySlug) ??
    null;
  let companyReviews = store.reviews.filter(
    (r) =>
      (r.companyId === companyId || r.companySlug === companySlug) &&
      r.status === "approved",
  );

  if (db) {
    try {
      const [row] = await db
        .select()
        .from(companies)
        .where(or(eq(companies.id, companyId), eq(companies.slug, companySlug)))
        .limit(1);
      if (row) {
        company = mapCompanyRow(row, company?.categories ?? []);
        const neonReviews = await db
          .select()
          .from(reviews)
          .where(eq(reviews.companyId, row.id));
        companyReviews = neonReviews
          .filter((r) => r.status === "approved")
          .map((r) => ({
            id: r.id,
            companyId: r.companyId,
            companySlug: row.slug,
            rating: r.rating,
            title: r.title,
            body: r.body,
            author: "User",
            verifiedPurchase: r.verifiedPurchase,
            status: r.status,
            createdAt: r.createdAt.toISOString().slice(0, 10),
          }));
      }
    } catch (error) {
      console.warn("[phase2] Neon trust load failed", error);
    }
  }

  if (!company) return null;

  const avgRating =
    companyReviews.length === 0
      ? 0
      : companyReviews.reduce((sum, r) => sum + r.rating, 0) /
        companyReviews.length;
  const verifiedShare =
    companyReviews.length === 0
      ? 0
      : companyReviews.filter((r) => r.verifiedPurchase).length /
        companyReviews.length;

  const result = calculateTrustScore({
    avgRating,
    reviewCount: companyReviews.length,
    verifiedReviewShare: verifiedShare,
    verifiedCompany: company.verified,
    claimedCompany: company.claimed,
    responseRate: 0.85,
  });

  const runtimeCompany = store.companies.find(
    (c) => c.id === company!.id || c.slug === company!.slug,
  );
  if (runtimeCompany) {
    runtimeCompany.trustScore = result.score;
    runtimeCompany.reviewCount = companyReviews.length;
  }

  if (db) {
    try {
      await db
        .update(companies)
        .set({
          trustScore: String(result.score),
          reviewCount: companyReviews.length,
          updatedAt: new Date(),
        })
        .where(eq(companies.id, company.id));
      await db
        .insert(trustScores)
        .values({
          companyId: company.id,
          score: String(result.score),
          reviewComponent: String(result.reviewComponent),
          verificationComponent: String(result.verificationComponent),
          activityComponent: String(result.activityComponent),
          explanation: result.explanation,
        })
        .onConflictDoUpdate({
          target: trustScores.companyId,
          set: {
            score: String(result.score),
            reviewComponent: String(result.reviewComponent),
            verificationComponent: String(result.verificationComponent),
            activityComponent: String(result.activityComponent),
            explanation: result.explanation,
            updatedAt: new Date(),
          },
        });
    } catch (error) {
      console.warn("[phase2] Neon trust update failed", error);
    }
  }

  return result;
}

export async function persistModeration(input: {
  entityType: "review" | "claim";
  entityId: string;
  decision: "approved" | "rejected";
  actor?: string;
}) {
  const store = getStore();
  const actor = input.actor ?? "admin";
  const db = getDb();

  if (input.entityType === "review") {
    let review = store.reviews.find((r) => r.id === input.entityId) ?? null;
    let companyId = review?.companyId;
    let companySlug = review?.companySlug;

    if (db) {
      try {
        const [row] = await db
          .select({
            review: reviews,
            companySlug: companies.slug,
          })
          .from(reviews)
          .leftJoin(companies, eq(reviews.companyId, companies.id))
          .where(eq(reviews.id, input.entityId))
          .limit(1);
        if (row) {
          companyId = row.review.companyId;
          companySlug = row.companySlug ?? row.review.companyId;
          await db
            .update(reviews)
            .set({ status: input.decision, updatedAt: new Date() })
            .where(eq(reviews.id, input.entityId));
          if (!review) {
            review = {
              id: row.review.id,
              companyId: row.review.companyId,
              companySlug,
              rating: row.review.rating,
              title: row.review.title,
              body: row.review.body,
              author: "User",
              verifiedPurchase: row.review.verifiedPurchase,
              status: input.decision,
              createdAt: row.review.createdAt.toISOString().slice(0, 10),
            };
          }
        }
      } catch (error) {
        console.warn("[phase2] Neon review moderation failed", error);
      }
    }

    if (!review || !companyId || !companySlug) {
      return { ok: false as const, message: "Review not found." };
    }
    review.status = input.decision;

    if (input.decision === "approved") {
      await recalculateCompanyTrust(companyId, companySlug);
    }

    appendAudit(`review.${input.decision}`, "review", actor);
    return {
      ok: true as const,
      message: `Review ${input.entityId} marked ${input.decision}.`,
    };
  }

  let claim = store.claims.find((c) => c.id === input.entityId) ?? null;
  let companySlug = claim?.companySlug;
  let companyId: string | undefined;

  if (db) {
    try {
      const [row] = await db
        .select({
          claim: companyClaims,
          companySlug: companies.slug,
          companyId: companies.id,
        })
        .from(companyClaims)
        .leftJoin(companies, eq(companyClaims.companyId, companies.id))
        .where(eq(companyClaims.id, input.entityId))
        .limit(1);
      if (row) {
        companySlug = row.companySlug ?? undefined;
        companyId = row.companyId ?? row.claim.companyId;
        await db
          .update(companyClaims)
          .set({
            status: input.decision,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(companyClaims.id, input.entityId));

        if (input.decision === "approved" && companyId) {
          await db
            .update(companies)
            .set({
              claimed: true,
              verified: true,
              updatedAt: new Date(),
            })
            .where(eq(companies.id, companyId));
        }

        if (!claim) {
          claim = {
            id: row.claim.id,
            companyName: companySlug ?? row.claim.companyId,
            companySlug: companySlug ?? row.claim.companyId,
            claimant: "claimant",
            status: input.decision,
            notes: row.claim.notes ?? "",
            createdAt: row.claim.createdAt.toISOString().slice(0, 10),
          };
        }
      }
    } catch (error) {
      console.warn("[phase2] Neon claim moderation failed", error);
    }
  }

  if (!claim) {
    return { ok: false as const, message: "Claim not found." };
  }
  claim.status = input.decision;

  if (input.decision === "approved" && companySlug) {
    const company = store.companies.find((c) => c.slug === companySlug);
    if (company) {
      company.claimed = true;
      company.verified = true;
    }
  }

  appendAudit(`claim.${input.decision}`, "company_claim", actor);
  return {
    ok: true as const,
    message: `Claim ${input.entityId} marked ${input.decision}.`,
  };
}

export async function persistRequest(input: {
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  deliveryCountry: string;
  actor?: string;
  organisationId?: string;
}) {
  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
  const db = getDb();

  if (db) {
    try {
      const org = input.organisationId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, input.organisationId))
              .limit(1)
          )[0]
        : await ensureDemoBuyerOrg(db);
      if (!org) {
        return { ok: false as const, message: "Buyer organisation not found." };
      }

      const [wallet] = await db
        .select()
        .from(creditWallets)
        .where(eq(creditWallets.organisationId, org.id))
        .limit(1);
      if (!wallet || wallet.balance < RFQ_CREDIT_COST) {
        return {
          ok: false as const,
          message: `Insufficient credits. Need ${RFQ_CREDIT_COST}, have ${wallet?.balance ?? 0}.`,
        };
      }

      const [created] = await db
        .insert(requests)
        .values({
          organisationId: org.id,
          title: input.title,
          slug,
          description: input.description,
          budgetMin: input.budgetMin,
          budgetMax: input.budgetMax,
          currency: "USD",
          deliveryCountry: input.deliveryCountry,
          status: "open",
        })
        .returning();

      const debit = await neonDebitCredits(
        db,
        org.id,
        RFQ_CREDIT_COST,
        `RFQ lead distribution: ${input.title}`,
        "request",
        created.id,
      );
      if (!debit.ok) {
        await db.delete(requests).where(eq(requests.id, created.id));
        return debit;
      }

      await db.insert(auditEvents).values({
        action: "request.created",
        entityType: "request",
        entityId: created.id,
        organisationId: org.id,
        payload: { title: input.title, credits: RFQ_CREDIT_COST },
      });

      const store = getStore();
      store.requests.unshift({
        id: created.id,
        title: created.title,
        slug: created.slug,
        description: created.description,
        category: "packaging-machinery",
        budgetMin: created.budgetMin ?? 0,
        budgetMax: created.budgetMax ?? 0,
        currency: created.currency,
        deliveryCountry: created.deliveryCountry ?? "",
        status: "open",
        quoteCount: 0,
        createdAt: created.createdAt.toISOString().slice(0, 10),
      });
      store.wallet.balance = debit.balance;
      store.wallet.entries.unshift({
        id: `neon-${Date.now()}`,
        delta: -RFQ_CREDIT_COST,
        reason: `RFQ lead distribution: ${input.title}`,
        createdAt: new Date().toISOString(),
      });

      appendAudit("request.created", "request", input.actor ?? "buyer");
      return {
        ok: true as const,
        id: created.id,
        message: `RFQ “${input.title}” created. ${RFQ_CREDIT_COST} credits reserved (balance ${debit.balance}).`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon request create failed", error);
    }
  }

  const debit = debitCredits(
    RFQ_CREDIT_COST,
    `RFQ lead distribution: ${input.title}`,
  );
  if (!debit.ok) {
    return { ok: false as const, message: debit.message };
  }

  const id = `req-${Date.now()}`;
  const store = getStore();
  const request: DemoRequest = {
    id,
    title: input.title,
    slug,
    description: input.description,
    category: "packaging-machinery",
    budgetMin: input.budgetMin,
    budgetMax: input.budgetMax,
    currency: "USD",
    deliveryCountry: input.deliveryCountry,
    status: "open",
    quoteCount: 0,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.requests.unshift(request);
  appendAudit("request.created", "request", input.actor ?? "buyer");
  return {
    ok: true as const,
    id,
    message: `RFQ “${input.title}” created. ${RFQ_CREDIT_COST} credits reserved (balance ${debit.balance}).`,
    demo: true,
  };
}

export async function persistQuote(input: {
  requestId: string;
  amount: number;
  leadTimeDays: number;
  notes: string;
  companySlug?: string;
  companyName?: string;
  actor?: string;
}) {
  const store = getStore();
  const companySlug = input.companySlug ?? "nordicfill-systems";
  const db = getDb();

  if (db) {
    try {
      const neonRequest = await getRequestByIdAsync(input.requestId);
      if (!neonRequest) {
        return { ok: false as const, message: "RFQ not found." };
      }
      if (neonRequest.status !== "open") {
        return { ok: false as const, message: "RFQ is not open for quotes." };
      }

      const company = await getCompanyBySlugAsync(companySlug);
      if (!company) {
        return { ok: false as const, message: "Supplier company not found." };
      }

      const [created] = await db
        .insert(quotes)
        .values({
          requestId: neonRequest.id,
          companyId: company.id,
          amount: input.amount,
          currency: "USD",
          leadTimeDays: input.leadTimeDays,
          notes: input.notes,
          status: "submitted",
        })
        .returning();

      const runtimeRequest = store.requests.find(
        (r) => r.id === neonRequest.id || r.slug === neonRequest.slug,
      );
      if (runtimeRequest) runtimeRequest.quoteCount += 1;
      store.quotes.unshift({
        id: created.id,
        requestId: neonRequest.id,
        companyName: input.companyName ?? company.name,
        companySlug: company.slug,
        amount: input.amount,
        currency: "USD",
        leadTimeDays: input.leadTimeDays,
        notes: input.notes,
        status: "submitted",
      });

      appendAudit("quote.submitted", "quote", input.actor ?? "supplier");
      return {
        ok: true as const,
        id: created.id,
        message: `Quote of $${input.amount} submitted for ${neonRequest.id}.`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon quote failed", error);
    }
  }

  const request = store.requests.find(
    (r) => r.id === input.requestId || r.slug === input.requestId,
  );
  if (!request) {
    return { ok: false as const, message: "RFQ not found." };
  }
  if (request.status !== "open") {
    return { ok: false as const, message: "RFQ is not open for quotes." };
  }

  const id = `q-${Date.now()}`;
  const quote: DemoQuote = {
    id,
    requestId: request.id,
    companyName: input.companyName ?? "Your company",
    companySlug,
    amount: input.amount,
    currency: "USD",
    leadTimeDays: input.leadTimeDays,
    notes: input.notes,
    status: "submitted",
  };
  store.quotes.unshift(quote);
  request.quoteCount += 1;

  appendAudit("quote.submitted", "quote", input.actor ?? "supplier");
  return {
    ok: true as const,
    id,
    message: `Quote of $${input.amount} submitted for ${request.id}.`,
    demo: true,
  };
}

export async function persistProject(input: {
  name: string;
  summary: string;
  actor?: string;
  organisationId?: string;
}) {
  const slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
  const db = getDb();

  if (db) {
    try {
      const org = input.organisationId
        ? (
            await db
              .select()
              .from(organisations)
              .where(eq(organisations.id, input.organisationId))
              .limit(1)
          )[0]
        : await ensureDemoBuyerOrg(db);
      if (!org) {
        return { ok: false as const, message: "Organisation not found." };
      }
      const [created] = await db
        .insert(projects)
        .values({
          organisationId: org.id,
          name: input.name,
          slug,
          summary: input.summary,
          status: "active",
        })
        .returning();
      getStore().projects.unshift({
        id: created.id,
        name: created.name,
        slug: created.slug,
        summary: created.summary ?? "",
        status: created.status,
        memberCount: 1,
      });
      appendAudit("project.created", "project", input.actor ?? "buyer");
      return {
        ok: true as const,
        id: created.id,
        message: `Project “${input.name}” created.`,
        demo: false,
      };
    } catch (error) {
      console.warn("[phase2] Neon project failed", error);
    }
  }

  const id = `proj-${Date.now()}`;
  const project: DemoProject = {
    id,
    name: input.name,
    slug,
    summary: input.summary,
    status: "active",
    memberCount: 1,
  };
  getStore().projects.unshift(project);
  appendAudit("project.created", "project", input.actor ?? "buyer");
  return {
    ok: true as const,
    id,
    message: `Project “${input.name}” created.`,
    demo: true,
  };
}

export async function updateRequestStatus(input: {
  requestId: string;
  status: "open" | "closed" | "awarded";
  actor?: string;
}) {
  const store = getStore();
  const db = getDb();

  if (db) {
    try {
      const neonRequest = await getRequestByIdAsync(input.requestId);
      if (neonRequest) {
        await db
          .update(requests)
          .set({ status: input.status, updatedAt: new Date() })
          .where(eq(requests.id, neonRequest.id));

        if (input.status === "awarded") {
          await db
            .update(quotes)
            .set({ status: "accepted", updatedAt: new Date() })
            .where(eq(quotes.requestId, neonRequest.id));
        }

        const runtime = store.requests.find(
          (r) => r.id === neonRequest.id || r.slug === neonRequest.slug,
        );
        if (runtime) runtime.status = input.status;

        appendAudit(
          `request.${input.status}`,
          "request",
          input.actor ?? "buyer",
        );
        return {
          ok: true as const,
          message: `RFQ ${neonRequest.id} marked ${input.status}.`,
          demo: false,
        };
      }
    } catch (error) {
      console.warn("[phase2] Neon request status failed", error);
    }
  }

  const request = store.requests.find(
    (r) => r.id === input.requestId || r.slug === input.requestId,
  );
  if (!request) {
    return { ok: false as const, message: "RFQ not found." };
  }
  request.status = input.status;
  appendAudit(`request.${input.status}`, "request", input.actor ?? "buyer");
  return {
    ok: true as const,
    message: `RFQ ${request.id} marked ${input.status}.`,
    demo: true,
  };
}

export async function persistSubscription(input: {
  planCode: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  status: string;
  orgId?: string;
}) {
  const store = getStore();
  const runtimeId = `sub-${Date.now()}`;
  store.subscriptions.push({
    id: runtimeId,
    orgId: input.orgId ?? "org-demo",
    planCode: input.planCode,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
  });

  if (input.status === "active") {
    creditCredits(100, `Subscription bonus: ${input.planCode}`);
  }

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
        : await ensureDemoBuyerOrg(db);

      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.code, input.planCode))
        .limit(1);

      let subscriptionId = runtimeId;
      if (org && plan) {
        const status =
          input.status === "active" ||
          input.status === "canceled" ||
          input.status === "past_due" ||
          input.status === "trialing" ||
          input.status === "incomplete"
            ? input.status
            : "active";

        const [created] = await db
          .insert(subscriptions)
          .values({
            organisationId: org.id,
            planId: plan.id,
            stripeCustomerId: input.stripeCustomerId,
            stripeSubscriptionId: input.stripeSubscriptionId,
            status,
          })
          .returning();
        subscriptionId = created.id;

        if (status === "active") {
          await neonCreditCredits(
            db,
            org.id,
            100,
            `Subscription bonus: ${input.planCode}`,
            "subscription",
            created.id,
          );
        }
      }

      await db.insert(auditEvents).values({
        action: "subscription.updated",
        entityType: "subscription",
        entityId: subscriptionId.match(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        )
          ? subscriptionId
          : undefined,
        organisationId: org?.id,
        payload: input,
      });

      appendAudit("subscription.updated", "subscription", "stripe");
      return { ok: true as const, id: subscriptionId, demo: false };
    } catch (error) {
      console.warn("[phase2] Neon subscription failed", error);
    }
  }

  appendAudit("subscription.updated", "subscription", "stripe");
  return { ok: true as const, id: runtimeId, demo: true };
}

export function getRuntimeWallet() {
  return getStore().wallet;
}

export async function getWalletAsync(organisationId?: string) {
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
        : await ensureDemoBuyerOrg(db);
      if (org) {
        const [wallet] = await db
          .select()
          .from(creditWallets)
          .where(eq(creditWallets.organisationId, org.id))
          .limit(1);
        if (wallet) {
          const entries = await db
            .select()
            .from(creditLedgerEntries)
            .where(eq(creditLedgerEntries.walletId, wallet.id))
            .orderBy(desc(creditLedgerEntries.createdAt))
            .limit(20);
          return {
            balance: wallet.balance,
            entries: entries.map((e) => ({
              id: e.id,
              delta: e.delta,
              reason: e.reason,
              createdAt: e.createdAt.toISOString(),
            })),
            organisationId: org.id,
            demo: false as const,
          };
        }
      }
    } catch (error) {
      console.warn("[phase2] Neon wallet read failed", error);
    }
  }
  const wallet = getRuntimeWallet();
  return { ...wallet, organisationId: organisationId ?? null, demo: true as const };
}

export function getRuntimeAudit() {
  return getStore().audit;
}

export function getRuntimeRequests() {
  return getStore().requests;
}

export function getRuntimeQuotes() {
  return getStore().quotes;
}

export function getRuntimeProjects() {
  return getStore().projects;
}

export function getRuntimeReviews(companySlug?: string) {
  const reviews = getStore().reviews;
  if (!companySlug) return reviews;
  return reviews.filter((r) => r.companySlug === companySlug);
}

export { RFQ_CREDIT_COST };
