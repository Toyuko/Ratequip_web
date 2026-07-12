import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const accountRoleEnum = pgEnum("account_role", [
  "buyer",
  "supplier",
  "contractor",
  "admin",
]);

export const claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "approved",
  "rejected",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const requestStatusEnum = pgEnum("request_status", [
  "draft",
  "open",
  "closed",
  "awarded",
]);

export const quoteStatusEnum = pgEnum("quote_status", [
  "submitted",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  primaryRole: accountRoleEnum("primary_role").notNull().default("buyer"),
  onboardingComplete: boolean("onboarding_complete").notNull().default(false),
  ...timestamps,
});

export const organisations = pgTable("organisations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: accountRoleEnum("type").notNull().default("buyer"),
  country: varchar("country", { length: 100 }),
  website: text("website"),
  ...timestamps,
});

export const organisationMembers = pgTable("organisation_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 64 }).notNull().default("member"),
  ...timestamps,
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
  ...timestamps,
});

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  headline: varchar("headline", { length: 320 }),
  description: text("description"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  website: text("website"),
  verified: boolean("verified").notNull().default(false),
  claimed: boolean("claimed").notNull().default(false),
  trustScore: numeric("trust_score", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  employeeRange: varchar("employee_range", { length: 64 }),
  yearFounded: integer("year_founded"),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  ...timestamps,
});

export const companyCategories = pgTable("company_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id),
});

export const companyClaims = pgTable("company_claims", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  claimantUserId: uuid("claimant_user_id")
    .notNull()
    .references(() => users.id),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  evidenceUrl: text("evidence_url"),
  notes: text("notes"),
  status: claimStatusEnum("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  ...timestamps,
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  categoryId: uuid("category_id").references(() => categories.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  summary: text("summary"),
  specs: jsonb("specs").$type<Record<string, string>>().default({}),
  ...timestamps,
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  authorUserId: uuid("author_user_id").references(() => users.id),
  authorOrgId: uuid("author_org_id").references(() => organisations.id),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  verifiedPurchase: boolean("verified_purchase").notNull().default(false),
  status: moderationStatusEnum("status").notNull().default("pending"),
  ...timestamps,
});

export const reviewDocuments = pgTable("review_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id),
  blobUrl: text("blob_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }),
  ...timestamps,
});

export const reviewResponses = pgTable("review_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => reviews.id),
  authorUserId: uuid("author_user_id").references(() => users.id),
  body: text("body").notNull(),
  ...timestamps,
});

export const trustScores = pgTable("trust_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id)
    .unique(),
  score: numeric("score", { precision: 5, scale: 2 }).notNull().default("0"),
  reviewComponent: numeric("review_component", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  verificationComponent: numeric("verification_component", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("0"),
  activityComponent: numeric("activity_component", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  explanation: jsonb("explanation")
    .$type<Record<string, number>>()
    .default({}),
  ...timestamps,
});

export const moderationQueue = pgTable("moderation_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: uuid("entity_id").notNull(),
  reason: text("reason"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  assigneeUserId: uuid("assignee_user_id").references(() => users.id),
  ...timestamps,
});

export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id),
  createdByUserId: uuid("created_by_user_id").references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  deliveryCountry: varchar("delivery_country", { length: 100 }),
  status: requestStatusEnum("status").notNull().default("open"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  ...timestamps,
});

export const quotes = pgTable("quotes", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => requests.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  submittedByUserId: uuid("submitted_by_user_id").references(() => users.id),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  leadTimeDays: integer("lead_time_days"),
  notes: text("notes"),
  status: quoteStatusEnum("status").notNull().default("submitted"),
  ...timestamps,
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  summary: text("summary"),
  status: varchar("status", { length: 64 }).notNull().default("active"),
  ...timestamps,
});

export const projectMembers = pgTable("project_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: varchar("role", { length: 64 }).notNull().default("member"),
  ...timestamps,
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  audience: accountRoleEnum("audience").notNull(),
  priceMonthly: integer("price_monthly").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  stripePriceId: varchar("stripe_price_id", { length: 128 }),
  features: jsonb("features").$type<string[]>().default([]),
  ...timestamps,
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id),
  planId: uuid("plan_id")
    .notNull()
    .references(() => subscriptionPlans.id),
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 128 }),
  status: subscriptionStatusEnum("status").notNull().default("incomplete"),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  ...timestamps,
});

export const creditWallets = pgTable("credit_wallets", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id")
    .notNull()
    .references(() => organisations.id)
    .unique(),
  balance: integer("balance").notNull().default(0),
  ...timestamps,
});

export const creditLedgerEntries = pgTable("credit_ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  walletId: uuid("wallet_id")
    .notNull()
    .references(() => creditWallets.id),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  referenceType: varchar("reference_type", { length: 64 }),
  referenceId: uuid("reference_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  ...timestamps,
});

export const evidenceDocuments = pgTable("evidence_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id),
  blobUrl: text("blob_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }),
  purpose: varchar("purpose", { length: 64 }).notNull(),
  ...timestamps,
});

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: uuid("entity_id"),
  payload: jsonb("payload").$type<Record<string, unknown>>().default({}),
  ...timestamps,
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body"),
  href: text("href"),
  readAt: timestamp("read_at", { withTimezone: true }),
  ...timestamps,
});

export const savedSuppliers = pgTable("saved_suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  ...timestamps,
});

/**
 * Future v10 extension tables (see master repo v10_extension_schema.sql):
 * rq_asset, rq_digital_passport, rq_asset_event, rq_supplier_scorecard,
 * rq_risk_signal, rq_compliance_*, rq_api_*, rq_course, rq_event_exhibitor
 */
