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

export const enterpriseAccounts = pgTable("enterprise_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Shared RateQuip credits across member organisations. */
  pooledBalance: integer("pooled_balance").notNull().default(0),
  /** Marketplace commission in basis points (250 = 2.5%). */
  commissionBps: integer("commission_bps").notNull().default(250),
  stripeCustomerId: varchar("stripe_customer_id", { length: 128 }),
  ...timestamps,
});

export const organisations = pgTable("organisations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: accountRoleEnum("type").notNull().default("buyer"),
  country: varchar("country", { length: 100 }),
  website: text("website"),
  enterpriseAccountId: uuid("enterprise_account_id").references(
    () => enterpriseAccounts.id,
  ),
  ...timestamps,
});

export const enterpriseLedgerEntries = pgTable("enterprise_ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  enterpriseAccountId: uuid("enterprise_account_id")
    .notNull()
    .references(() => enterpriseAccounts.id),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  delta: integer("delta").notNull(),
  reason: varchar("reason", { length: 255 }).notNull(),
  referenceType: varchar("reference_type", { length: 64 }),
  referenceId: uuid("reference_id"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
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

export const commissionLedgerEntries = pgTable("commission_ledger_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  enterpriseAccountId: uuid("enterprise_account_id").references(
    () => enterpriseAccounts.id,
  ),
  organisationId: uuid("organisation_id").references(() => organisations.id),
  requestId: uuid("request_id").references(() => requests.id),
  quoteId: uuid("quote_id").references(() => quotes.id),
  amountCents: integer("amount_cents").notNull(),
  commissionBps: integer("commission_bps").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("recorded"),
  notes: text("notes"),
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
  monthlyCredits: integer("monthly_credits").notNull().default(0),
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
 * Organic Growth Engine — v10.1 Phase 1 tables.
 * Full SQL: drizzle/0001_organic_growth_v10_1.sql
 * Authoritative source: RateQuip_Enterprise_Master_Repository_v10.1/07_Organic_Growth_Engine/
 */

export const listingStatusEnum = pgEnum("listing_status", [
  "draft",
  "duplicate_check",
  "details_complete",
  "contacts_complete",
  "contacts_skipped",
  "review_ready",
  "review_skipped",
  "confirmation_required",
  "publishing",
  "published",
  "abandoned",
  "blocked",
  "merged_into_existing",
  "failed",
]);

export const companyListingSubmissions = pgTable("company_listing_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  submittedByUserId: uuid("submitted_by_user_id").references(() => users.id),
  status: listingStatusEnum("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  companyName: varchar("company_name", { length: 255 }),
  normalizedName: varchar("normalized_name", { length: 255 }),
  websiteUrl: text("website_url"),
  registrableDomain: varchar("registrable_domain", { length: 255 }),
  companyTypes: jsonb("company_types").$type<string[]>().default([]),
  countryCode: varchar("country_code", { length: 2 }),
  addressLine: text("address_line"),
  locality: varchar("locality", { length: 120 }),
  region: varchar("region", { length: 120 }),
  postalCode: varchar("postal_code", { length: 32 }),
  phoneDisplay: varchar("phone_display", { length: 64 }),
  publicSourceUrl: text("public_source_url"),
  privateNotes: text("private_notes"),
  relationship: varchar("relationship", { length: 64 }),
  intendedPurpose: varchar("intended_purpose", { length: 64 }),
  conflictDeclared: boolean("conflict_declared").default(false),
  disclosurePreference: varchar("disclosure_preference", { length: 64 })
    .notNull()
    .default("anonymous_ratequip_user"),
  declarationVersion: varchar("declaration_version", { length: 32 }),
  declarationsAcceptedAt: timestamp("declarations_accepted_at", {
    withTimezone: true,
  }),
  publishedCompanyId: uuid("published_company_id").references(() => companies.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  idempotencyKey: varchar("idempotency_key", { length: 128 }),
  ...timestamps,
});

export const companyContactCandidates = pgTable("company_contact_candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id")
    .notNull()
    .references(() => companyListingSubmissions.id),
  companyId: uuid("company_id").references(() => companies.id),
  addedByUserId: uuid("added_by_user_id").references(() => users.id),
  /** Application/KMS encrypted email — never public. */
  emailCiphertext: text("email_ciphertext").notNull(),
  emailNormalizedHash: text("email_normalized_hash").notNull(),
  emailDomain: varchar("email_domain", { length: 255 }).notNull(),
  emailMasked: varchar("email_masked", { length: 255 }).notNull(),
  contactNameCiphertext: text("contact_name_ciphertext"),
  role: varchar("role", { length: 64 }),
  sourceType: varchar("source_type", { length: 64 }).notNull(),
  sourceUrl: text("source_url"),
  personalNoteCiphertext: text("personal_note_ciphertext"),
  sendAfterPublish: boolean("send_after_publish").notNull().default(true),
  domainMatchCategory: varchar("domain_match_category", { length: 64 }),
  sendEligibility: varchar("send_eligibility", { length: 32 })
    .notNull()
    .default("pending"),
  ...timestamps,
});

export const growthInvitations = pgTable("growth_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  purpose: varchar("purpose", { length: 64 }).notNull().default("company_claim"),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  sourceSubmissionId: uuid("source_submission_id").references(
    () => companyListingSubmissions.id,
  ),
  companyId: uuid("company_id").references(() => companies.id),
  disclosurePreference: varchar("disclosure_preference", { length: 64 })
    .notNull()
    .default("anonymous_ratequip_user"),
  templateFamily: varchar("template_family", { length: 64 }).notNull(),
  templateVersion: varchar("template_version", { length: 32 }).notNull(),
  locale: varchar("locale", { length: 16 }).notNull().default("en"),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  creditCost: integer("credit_cost").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const growthInvitationRecipients = pgTable(
  "growth_invitation_recipients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    invitationId: uuid("invitation_id")
      .notNull()
      .references(() => growthInvitations.id),
    contactCandidateId: uuid("contact_candidate_id").references(
      () => companyContactCandidates.id,
    ),
    emailCiphertext: text("email_ciphertext").notNull(),
    emailNormalizedHash: text("email_normalized_hash").notNull(),
    emailDomain: varchar("email_domain", { length: 255 }).notNull(),
    emailMasked: varchar("email_masked", { length: 255 }).notNull(),
    tokenHash: text("token_hash").notNull(),
    tokenPrefix: varchar("token_prefix", { length: 16 }).notNull(),
    state: varchar("state", { length: 32 }).notNull().default("queued"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    manualResendCount: integer("manual_resend_count").notNull().default(0),
    ...timestamps,
  },
);

/**
 * Future v10 extension tables (see master repo v10_extension_schema.sql):
 * rq_asset, rq_digital_passport, rq_asset_event, rq_supplier_scorecard,
 * rq_risk_signal, rq_compliance_*, rq_api_*, rq_course, rq_event_exhibitor
 */
