import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import {
  categories,
  companies,
  companyCategories,
  creditWallets,
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
  for (const cat of demoCategories) {
    await db
      .insert(categories)
      .values({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        parentId: cat.parentId ?? null,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding companies…");
  for (const co of demoCompanies) {
    await db
      .insert(companies)
      .values({
        id: co.id,
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
      .onConflictDoNothing();

    await db
      .insert(trustScores)
      .values({
        companyId: co.id,
        score: String(co.trustScore),
        reviewComponent: "50",
        verificationComponent: co.verified ? "25" : "0",
        activityComponent: "10",
      })
      .onConflictDoNothing();

    for (const catSlug of co.categories) {
      const cat = demoCategories.find((c) => c.slug === catSlug);
      if (!cat) continue;
      await db
        .insert(companyCategories)
        .values({ companyId: co.id, categoryId: cat.id })
        .onConflictDoNothing();
    }
  }

  console.log("Seeding products…");
  for (const p of demoProducts) {
    const company = demoCompanies.find((c) => c.slug === p.companySlug);
    if (!company) continue;
    await db
      .insert(products)
      .values({
        id: p.id,
        companyId: company.id,
        name: p.name,
        slug: p.id,
        summary: p.summary,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding reviews…");
  for (const r of demoReviews) {
    await db
      .insert(reviews)
      .values({
        id: r.id,
        companyId: r.companyId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verifiedPurchase: r.verifiedPurchase,
        status: r.status,
      })
      .onConflictDoNothing();
  }

  console.log("Seeding requests…");
  // Requests need organisation FK — create a demo org first via raw SQL if needed.
  // For MVP seed without org graph, skip if FK would fail; demo mode covers UI.
  try {
    await sql`INSERT INTO organisations (id, name, slug, type)
      VALUES ('org-demo-buyer', 'Demo Buyer Org', 'demo-buyer-org', 'buyer')
      ON CONFLICT DO NOTHING`;

    for (const r of demoRequests) {
      await db
        .insert(requests)
        .values({
          id: r.id,
          organisationId: "org-demo-buyer",
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
      .values({ organisationId: "org-demo-buyer", balance: 250 })
      .onConflictDoNothing();
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
      .onConflictDoNothing();
  }

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
