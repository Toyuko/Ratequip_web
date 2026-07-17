import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  categories,
  companies,
  companyCategories,
  creditWallets,
  organisations,
  products,
  requests,
  reviews,
  subscriptionPlans,
  trustScores,
} from "../src/lib/db/schema";
import {
  demoCategories,
  demoCompanies,
  demoPlans,
  demoProducts,
  demoRequests,
  demoReviews,
} from "../src/lib/db/demo-data";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("No DATABASE_URL — skipping seed. Demo data is embedded in the app.");
    return;
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("Seeding categories…");
  const parents = demoCategories.filter((c) => !c.parentId);
  const children = demoCategories.filter((c) => c.parentId);

  for (const cat of parents) {
    await db
      .insert(categories)
      .values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      })
      .onConflictDoNothing({ target: categories.slug });
  }

  let categoryRows = await db.select().from(categories);
  let categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));
  const parentIdByDemoId = new Map(
    parents.map((p) => [p.id, categoryIdBySlug.get(p.slug)!] as const),
  );

  for (const cat of children) {
    const parentUuid = cat.parentId
      ? parentIdByDemoId.get(cat.parentId) ?? null
      : null;
    await db
      .insert(categories)
      .values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: parentUuid,
      })
      .onConflictDoNothing({ target: categories.slug });
  }

  categoryRows = await db.select().from(categories);
  categoryIdBySlug = new Map(categoryRows.map((c) => [c.slug, c.id]));

  console.log("Seeding companies…");
  for (const co of demoCompanies) {
    await db
      .insert(companies)
      .values({
        name: co.name,
        slug: co.slug,
        headline: co.headline,
        description: co.description,
        country: co.country,
        city: co.city,
        website: co.website,
        verified: co.verified,
        claimed: co.claimed,
        trustScore: String(co.trustScore),
        reviewCount: co.reviewCount,
        employeeRange: co.employeeRange,
        yearFounded: co.yearFounded,
      })
      .onConflictDoNothing({ target: companies.slug });
  }

  const companyRows = await db.select().from(companies);
  const companyIdBySlug = new Map(companyRows.map((c) => [c.slug, c.id]));

  for (const co of demoCompanies) {
    const companyId = companyIdBySlug.get(co.slug);
    if (!companyId) continue;

    await db
      .insert(trustScores)
      .values({
        companyId,
        score: String(co.trustScore),
        reviewComponent: "50",
        verificationComponent: co.verified ? "25" : "0",
        activityComponent: "10",
      })
      .onConflictDoNothing({ target: trustScores.companyId });

    for (const catSlug of co.categories) {
      const categoryId = categoryIdBySlug.get(catSlug);
      if (!categoryId) continue;
      const existing = await db
        .select()
        .from(companyCategories)
        .where(eq(companyCategories.companyId, companyId))
        .limit(50);
      if (existing.some((row) => row.categoryId === categoryId)) continue;
      await db.insert(companyCategories).values({ companyId, categoryId });
    }
  }

  console.log("Seeding products…");
  for (const p of demoProducts) {
    const companyId = companyIdBySlug.get(p.companySlug);
    if (!companyId) continue;
    const slug = p.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    await db
      .insert(products)
      .values({
        companyId,
        name: p.name,
        slug: `${p.companySlug}-${slug}`,
        summary: p.summary,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding reviews…");
  for (const r of demoReviews) {
    const companyId = companyIdBySlug.get(r.companySlug);
    if (!companyId) continue;
    await db
      .insert(reviews)
      .values({
        companyId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verifiedPurchase: r.verifiedPurchase,
        status: r.status,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding requests…");
  try {
    await db
      .insert(organisations)
      .values({
        name: "Demo Buyer Org",
        slug: "demo-buyer-org",
        type: "buyer",
      })
      .onConflictDoNothing({ target: organisations.slug });

    const [org] = await db
      .select()
      .from(organisations)
      .where(eq(organisations.slug, "demo-buyer-org"))
      .limit(1);

    if (org) {
      for (const r of demoRequests) {
        await db
          .insert(requests)
          .values({
            organisationId: org.id,
            title: r.title,
            slug: r.slug,
            description: r.description,
            budgetMin: r.budgetMin,
            budgetMax: r.budgetMax,
            currency: r.currency,
            deliveryCountry: r.deliveryCountry,
            status: r.status,
          })
          .onConflictDoNothing();
      }

      await db
        .insert(creditWallets)
        .values({ organisationId: org.id, balance: 250 })
        .onConflictDoNothing();
    }
  } catch (e) {
    console.warn("Request/org seed skipped:", e);
  }

  console.log("Seeding plans…");
  for (const plan of demoPlans) {
    await db
      .insert(subscriptionPlans)
      .values({
        code: plan.code,
        name: plan.name,
        audience: plan.audience,
        priceMonthly: plan.priceMonthly,
        features: plan.features,
      })
      .onConflictDoNothing({ target: subscriptionPlans.code });
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
