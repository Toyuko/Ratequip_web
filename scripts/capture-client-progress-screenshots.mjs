#!/usr/bin/env node
/**
 * Client-facing Phase 2 MVP progress screenshots (curated highlight reel).
 *
 *   node scripts/capture-client-progress-screenshots.mjs
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

loadEnv({ path: ".env.local" });

const BASE = (
  process.env.EVIDENCE_BASE_URL || "https://ratequip-web.vercel.app"
).replace(/\/$/, "");
const OUT = path.resolve("docs/client-progress-phase2");
const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
const EVIDENCE_USER_ID =
  process.env.EVIDENCE_CLERK_USER_ID || "user_3GiniBf1oc2m7ADRiSOEhrdZkKP";

fs.mkdirSync(OUT, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function clerkFetch(pathname, init = {}) {
  if (!CLERK_SECRET) throw new Error("CLERK_SECRET_KEY missing in .env.local");
  const res = await fetch(`https://api.clerk.com/v1${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${CLERK_SECRET}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Clerk ${pathname} failed (${res.status}): ${JSON.stringify(data)}`,
    );
  }
  return data;
}

async function setUserRole(role) {
  try {
    await clerkFetch(`/users/${EVIDENCE_USER_ID}/metadata`, {
      method: "PATCH",
      body: JSON.stringify({
        public_metadata: { role },
        public_metadata_update: true,
      }),
    });
  } catch {
    await clerkFetch(`/users/${EVIDENCE_USER_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ public_metadata: { role } }),
    });
  }
}

async function createSignInToken() {
  return clerkFetch("/sign_in_tokens", {
    method: "POST",
    body: JSON.stringify({
      user_id: EVIDENCE_USER_ID,
      expires_in_seconds: 1800,
    }),
  });
}

async function dismissTour(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem("rq_product_tour_v1", "done");
    } catch {}
  });
}

async function signIn(page, role = "buyer") {
  await setUserRole(role);
  const token = await createSignInToken();
  await page.goto(
    `${BASE}/sign-in?__clerk_ticket=${encodeURIComponent(token.token)}`,
    { waitUntil: "domcontentloaded", timeout: 60_000 },
  );
  await sleep(2500);
  for (let i = 0; i < 24; i++) {
    const url = page.url();
    if (
      !url.includes("sign-in") &&
      !url.includes("accounts.dev") &&
      !url.includes("__clerk_ticket")
    ) {
      break;
    }
    await sleep(500);
  }
  await page.context().addCookies([
    {
      name: "rq_role",
      value: role,
      domain: "ratequip-web.vercel.app",
      path: "/",
    },
    {
      name: "rq_onboarded",
      value: "1",
      domain: "ratequip-web.vercel.app",
      path: "/",
    },
    {
      name: "rq_email",
      value: "touysmith@gmail.com",
      domain: "ratequip-web.vercel.app",
      path: "/",
    },
    {
      name: "rq_contact_name",
      value: "Touy Smith",
      domain: "ratequip-web.vercel.app",
      path: "/",
    },
  ]);
  await dismissTour(page);
  const dash =
    role === "admin" ? "admin" : role === "supplier" ? "supplier" : "buyer";
  await page.goto(`${BASE}/dashboard/${dash}`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await sleep(1500);
  if (page.url().includes("sign-in") || page.url().includes("accounts.dev")) {
    await page.goto(token.url, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await sleep(3000);
    await page.goto(`${BASE}/dashboard/${dash}`, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    await sleep(1500);
  }
}

async function waitForMainContent(page, { clerk = false } = {}) {
  await page.waitForLoadState("domcontentloaded");
  try {
    await page.waitForLoadState("networkidle", { timeout: 20_000 });
  } catch {
    /* marketing pages may keep sockets open */
  }
  if (clerk) {
    const selectors = [
      ".cl-rootBox",
      ".cl-signIn-root",
      ".cl-signUp-root",
      "input[name='identifier']",
      "input[name='emailAddress']",
      "input[type='email']",
      "text=Continue",
      "text=Sign in",
      "text=Sign up",
    ];
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 8_000 });
        break;
      } catch {
        /* try next */
      }
    }
  } else {
    try {
      await page.waitForSelector("main, h1, [data-testid], form, table, article", {
        timeout: 15_000,
      });
    } catch {
      await sleep(2000);
    }
  }
  await sleep(800);
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true, type: "png" });
  const bodyText = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    return (main?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 100);
  });
  console.log(`OK ${name} :: ${bodyText.slice(0, 70)}`);
}

async function gotoPublic(page, urlPath, name, opts = {}) {
  await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, opts);
  return shot(page, name);
}

async function gotoAuthed(page, urlPath, name) {
  await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page);
  if (page.url().includes("sign-in") || page.url().includes("accounts.dev")) {
    console.log(`WARN ${name} redirected to auth: ${page.url()}`);
  }
  return shot(page, name);
}

async function main() {
  console.log("Capturing client progress screenshots →", OUT);
  console.log("Base:", BASE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Public surfaces
  await gotoPublic(page, "/", "01-homepage");
  await gotoPublic(page, "/pricing", "02-pricing");
  await gotoPublic(page, "/suppliers", "03-suppliers-directory");
  await gotoPublic(page, "/categories", "04-categories");
  await gotoPublic(page, "/search", "05-search");
  await gotoPublic(page, "/companies/search", "06-companies-search");
  await gotoPublic(page, "/requests", "07-rfq-marketplace");
  await gotoPublic(page, "/sign-in", "09-sign-in", { clerk: true });
  await gotoPublic(page, "/sign-up", "10-sign-up", { clerk: true });

  // Buyer flows
  await signIn(page, "buyer");
  await gotoAuthed(page, "/v12", "08-v12-procurement");
  await gotoAuthed(page, "/dashboard/buyer", "11-buyer-dashboard");
  await gotoAuthed(page, "/onboarding", "12-role-onboarding");
  await gotoAuthed(page, "/companies/search", "13-company-create");
  await gotoAuthed(page, "/companies/claim", "14-company-claim");
  await gotoAuthed(page, "/reviews/new", "15-review-create");
  await gotoAuthed(page, "/requests/new", "16-rfq-create-ai");
  await gotoAuthed(page, "/quotes/compare", "17-quote-compare");
  await gotoAuthed(page, "/dashboard/buyer/billing", "18-billing-credits");

  // Open a concrete RFQ detail (skip /new)
  await page.goto(`${BASE}/dashboard/buyer`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await waitForMainContent(page);
  let rfqShot = false;
  const rfqLinks = await page.locator('a[href*="/requests/"]').all();
  for (const link of rfqLinks) {
    const href = await link.getAttribute("href");
    if (href && /\/requests\/[^/?]+/.test(href) && !href.includes("/new")) {
      await page.goto(`${BASE}${href}`, {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await waitForMainContent(page);
      await shot(page, "19-rfq-detail-award");
      rfqShot = true;
      break;
    }
  }
  if (!rfqShot) {
    await gotoAuthed(page, "/requests", "19-rfq-detail-award");
  }

  // Supplier
  await signIn(page, "supplier");
  await gotoAuthed(page, "/dashboard/supplier", "20-supplier-dashboard");

  // Admin
  await signIn(page, "admin");
  await gotoAuthed(page, "/dashboard/admin", "21-admin-moderation");

  await browser.close();

  const index = `# Phase 2 MVP — Client Progress Screenshots

**Captured:** ${new Date().toISOString().slice(0, 10)}  
**Environment:** ${BASE}  
**Purpose:** Visual progress pack for client review of Phase 2 MVP features.

## Highlight reel

| # | File | Feature |
|---|------|---------|
| 01 | \`01-homepage.png\` | Marketing homepage / trust positioning |
| 02 | \`02-pricing.png\` | Pricing & plans |
| 03 | \`03-suppliers-directory.png\` | Supplier directory |
| 04 | \`04-categories.png\` | Category browse |
| 05 | \`05-search.png\` | Global search |
| 06 | \`06-companies-search.png\` | Company search |
| 07 | \`07-rfq-marketplace.png\` | Public RFQ marketplace |
| 08 | \`08-v12-procurement.png\` | V1.2 procurement module |
| 09 | \`09-sign-in.png\` | Authentication (sign-in) |
| 10 | \`10-sign-up.png\` | Authentication (sign-up) |
| 11 | \`11-buyer-dashboard.png\` | Buyer dashboard (RFQs, credits, projects) |
| 12 | \`12-role-onboarding.png\` | Role onboarding (Buyer / Supplier / Admin) |
| 13 | \`13-company-create.png\` | Add / create company wizard |
| 14 | \`14-company-claim.png\` | Claim company |
| 15 | \`15-review-create.png\` | Submit review + evidence |
| 16 | \`16-rfq-create-ai.png\` | RFQ create with AI drafting assistant |
| 17 | \`17-quote-compare.png\` | Buyer quote comparison |
| 18 | \`18-billing-credits.png\` | Billing / credits / checkout |
| 19 | \`19-rfq-detail-award.png\` | RFQ detail / award path |
| 20 | \`20-supplier-dashboard.png\` | Supplier dashboard / quote response |
| 21 | \`21-admin-moderation.png\` | Admin moderation queue |

## Phase 2 areas covered

- **Auth & RBAC** — Sign-in/up, role onboarding
- **Company management** — Create, claim
- **Reviews** — Create with evidence; admin moderation
- **RFQ marketplace** — Create (AI assist), marketplace, compare, award
- **Billing** — Credits & checkout
- **Discovery** — Suppliers, categories, search, V1.2

Full acceptance evidence (40 screenshots + videos + PDFs) remains in \`docs/acceptance-phase2/\`.
`;

  fs.writeFileSync(path.join(OUT, "README.md"), index);
  console.log("Done. Wrote", OUT);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
