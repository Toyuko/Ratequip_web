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
  companies,
  companyClaims,
  creditWallets,
  organisationMembers,
  organisations,
  reviewDocuments,
  reviews,
  trustScores,
  users,
} from "./schema";

const RFQ_CREDIT_COST = 25;

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
      let items = rows.map((r) => mapCompanyRow(r));
      if (opts?.q) {
        const q = opts.q.toLowerCase();
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.headline.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q),
        );
      }
      if (opts?.country) {
        items = items.filter(
          (c) => c.country.toLowerCase() === opts.country!.toLowerCase(),
        );
      }
      return items.sort((a, b) => b.trustScore - a.trustScore);
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
      if (row) return mapCompanyRow(row);
    } catch (error) {
      console.warn("[phase2] Neon getCompany failed", error);
    }
  }
  return getStore().companies.find((c) => c.slug === slug) ?? null;
}

export async function listPendingReviewsAsync(): Promise<DemoReview[]> {
  const db = getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(reviews)
        .where(eq(reviews.status, "pending"))
        .orderBy(desc(reviews.createdAt));
      return rows.map((r) => ({
        id: r.id,
        companyId: r.companyId,
        companySlug: r.companyId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        author: "User",
        verifiedPurchase: r.verifiedPurchase,
        status: r.status,
        createdAt: r.createdAt.toISOString().slice(0, 10),
      }));
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
        .select()
        .from(companyClaims)
        .where(eq(companyClaims.status, "pending"))
        .orderBy(desc(companyClaims.createdAt));
      return rows.map((r) => ({
        id: r.id,
        companyName: r.companyId,
        companySlug: r.companyId,
        claimant: "claimant",
        status: r.status,
        notes: r.notes ?? "",
        createdAt: r.createdAt.toISOString().slice(0, 10),
      }));
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

  if (db && input.clerkUserId) {
    try {
      const { id: userId } = await upsertClerkUser({
        clerkUserId: input.clerkUserId,
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
      const [review] = await db
        .insert(reviews)
        .values({
          companyId: company.id,
          rating: input.rating,
          title: input.title,
          body: input.body,
          verifiedPurchase: Boolean(input.evidenceName),
          status: "pending",
        })
        .returning();

      if (input.evidenceName) {
        await db.insert(reviewDocuments).values({
          reviewId: review.id,
          blobUrl: `demo://evidence/${input.evidenceName}`,
          fileName: input.evidenceName,
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
  const companyReviews = store.reviews.filter(
    (r) =>
      (r.companyId === companyId || r.companySlug === companySlug) &&
      r.status === "approved",
  );
  const company = store.companies.find(
    (c) => c.id === companyId || c.slug === companySlug,
  );
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

  company.trustScore = result.score;
  company.reviewCount = companyReviews.length;

  const db = getDb();
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

  if (input.entityType === "review") {
    const review = store.reviews.find((r) => r.id === input.entityId);
    if (!review) {
      return { ok: false as const, message: "Review not found." };
    }
    review.status = input.decision;

    const db = getDb();
    if (db) {
      try {
        await db
          .update(reviews)
          .set({ status: input.decision, updatedAt: new Date() })
          .where(eq(reviews.id, input.entityId));
      } catch (error) {
        console.warn("[phase2] Neon review moderation failed", error);
      }
    }

    if (input.decision === "approved") {
      await recalculateCompanyTrust(review.companyId, review.companySlug);
    }

    appendAudit(`review.${input.decision}`, "review", actor);
    return {
      ok: true as const,
      message: `Review ${input.entityId} marked ${input.decision}.`,
    };
  }

  const claim = store.claims.find((c) => c.id === input.entityId);
  if (!claim) {
    return { ok: false as const, message: "Claim not found." };
  }
  claim.status = input.decision;

  if (input.decision === "approved") {
    const company = store.companies.find((c) => c.slug === claim.companySlug);
    if (company) {
      company.claimed = true;
      company.verified = true;
    }
  }

  const db = getDb();
  if (db) {
    try {
      await db
        .update(companyClaims)
        .set({
          status: input.decision,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(companyClaims.id, input.entityId));

      if (input.decision === "approved") {
        const company = store.companies.find(
          (c) => c.slug === claim.companySlug,
        );
        if (company) {
          await db
            .update(companies)
            .set({
              claimed: true,
              verified: true,
              updatedAt: new Date(),
            })
            .where(
              or(eq(companies.id, company.id), eq(companies.slug, company.slug)),
            );
        }
      }
    } catch (error) {
      console.warn("[phase2] Neon claim moderation failed", error);
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
}) {
  const debit = debitCredits(RFQ_CREDIT_COST, `RFQ lead distribution: ${input.title}`);
  if (!debit.ok) {
    return { ok: false as const, message: debit.message };
  }

  const id = `req-${Date.now()}`;
  const slug = slugify(input.title);
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

  const db = getDb();
  if (db) {
    try {
      // Ensure demo buyer org exists for FK when seeded
      await db.insert(auditEvents).values({
        action: "request.created",
        entityType: "request",
        payload: { id, title: input.title, credits: RFQ_CREDIT_COST },
      });
    } catch (error) {
      console.warn("[phase2] Neon request audit failed", error);
    }
  }

  appendAudit("request.created", "request", input.actor ?? "buyer");
  return {
    ok: true as const,
    id,
    message: `RFQ “${input.title}” created. ${RFQ_CREDIT_COST} credits reserved (balance ${debit.balance}).`,
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
    companySlug: input.companySlug ?? "nordicfill-systems",
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
  };
}

export async function persistProject(input: {
  name: string;
  summary: string;
  actor?: string;
}) {
  const id = `proj-${Date.now()}`;
  const project: DemoProject = {
    id,
    name: input.name,
    slug: slugify(input.name),
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
  };
}

export async function updateRequestStatus(input: {
  requestId: string;
  status: "open" | "closed" | "awarded";
  actor?: string;
}) {
  const store = getStore();
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
  const id = `sub-${Date.now()}`;
  store.subscriptions.push({
    id,
    orgId: input.orgId ?? "org-demo",
    planCode: input.planCode,
    status: input.status,
    stripeCustomerId: input.stripeCustomerId,
    stripeSubscriptionId: input.stripeSubscriptionId,
  });

  // Starter credit top-up on new active subscription only
  if (input.status === "active") {
    creditCredits(100, `Subscription bonus: ${input.planCode}`);
  }

  const db = getDb();
  if (db) {
    try {
      await db.insert(auditEvents).values({
        action: "subscription.updated",
        entityType: "subscription",
        payload: input,
      });
    } catch (error) {
      console.warn("[phase2] Neon subscription audit failed", error);
    }
  }

  appendAudit("subscription.updated", "subscription", "stripe");
  return { ok: true as const, id };
}

export function getRuntimeWallet() {
  return getStore().wallet;
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
