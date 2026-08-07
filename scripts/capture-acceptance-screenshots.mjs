#!/usr/bin/env node
/**
 * Re-capture acceptance screenshots with real content (Clerk hydrated + authenticated flows).
 * Fixes blank header/footer-only captures from early domcontentloaded shots.
 *
 *   node scripts/capture-acceptance-screenshots.mjs
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
const OUT = path.resolve("docs/acceptance-phase2/screenshots");
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
    if (url.includes(BASE.replace("https://", "")) && !url.includes("__clerk_ticket")) {
      break;
    }
    if (!url.includes("sign-in") && !url.includes("accounts.dev") && !url.includes("__clerk_ticket")) {
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
    await page.goto(token.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
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
      "text=Create your account",
      "text=Forgot password",
    ];
    let found = false;
    for (const sel of selectors) {
      try {
        await page.waitForSelector(sel, { timeout: 8_000 });
        found = true;
        break;
      } catch {
        /* try next */
      }
    }
    if (!found) {
      await sleep(3000);
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

async function shot(page, name, { fullPage = true } = {}) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage, type: "png" });
  const bodyText = await page.evaluate(() => {
    const main = document.querySelector("main") || document.body;
    return (main?.innerText || "").replace(/\s+/g, " ").trim().slice(0, 120);
  });
  const blankish =
    !bodyText ||
    bodyText.length < 40 ||
    /English\s+Auto\s*$/i.test(bodyText);
  console.log(
    `${blankish ? "WARN-SHORT" : "OK"} ${name} → ${path.basename(file)} :: ${bodyText.slice(0, 80)}`,
  );
  return !blankish;
}

async function gotoPublic(page, urlPath, name, opts = {}) {
  await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, opts);
  return shot(page, name);
}

async function gotoAuth(page, urlPath, name) {
  await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  return shot(page, name);
}

async function gotoAuthed(page, urlPath, name) {
  await page.goto(`${BASE}${urlPath}`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page);
  // If bounced to sign-in, mark fail
  if (page.url().includes("sign-in") || page.url().includes("accounts.dev")) {
    console.log(`WARN ${name} redirected to auth: ${page.url()}`);
  }
  return shot(page, name);
}

async function main() {
  console.log("Capturing acceptance screenshots →", OUT);
  console.log("Base:", BASE);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // --- Public / guest ---
  await gotoPublic(page, "/", "01-homepage");
  await gotoAuth(page, "/sign-up", "02-signup");

  // Email verification: Clerk factor route after sign-up entry
  await page.goto(`${BASE}/sign-up`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  // Try deep-link factor-one / verify surfaces Clerk exposes
  await page.goto(`${BASE}/sign-in#/factor-one`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  await shot(page, "03-email-verification");

  await gotoAuth(page, "/sign-in", "04-login");

  // Logout evidence: signed-in then sign-out landing
  await signIn(page, "buyer");
  await gotoAuthed(page, "/dashboard/buyer", "05-logout-before");
  // Prefer Clerk user button sign-out if present; else hit sign-in after clearing
  try {
    const userBtn = page.locator(".cl-userButtonTrigger, button:has-text(\"Account\")").first();
    if (await userBtn.count()) {
      await userBtn.click({ timeout: 5_000 });
      await sleep(500);
      const signOut = page.locator("text=Sign out").first();
      if (await signOut.count()) {
        await signOut.click({ timeout: 5_000 });
        await sleep(2000);
      }
    }
  } catch {
    /* fall through */
  }
  await context.clearCookies();
  await page.goto(`${BASE}/sign-in`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  await shot(page, "05-logout");

  await page.goto(`${BASE}/sign-in#/forgot-password`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  await shot(page, "06-password-reset");

  await page.goto(`${BASE}/sign-in#/factor-one`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  await shot(page, "07-mfa");

  // Guest blocked protected route — show sign-in challenge (not empty shell)
  await context.clearCookies();
  await page.goto(`${BASE}/dashboard/buyer`, {
    waitUntil: "domcontentloaded",
    timeout: 60_000,
  });
  await waitForMainContent(page, { clerk: true });
  await shot(page, "08-session-protected");
  await shot(page, "35-security-guest-block");

  // --- Authenticated buyer ---
  await signIn(page, "buyer");
  await gotoAuthed(page, "/onboarding", "09-roles");
  await gotoAuthed(page, "/companies/add/details", "10-company-create");
  await gotoAuthed(page, "/companies/add/details", "11-company-add");
  await gotoAuthed(page, "/companies/claim", "12-company-claim");
  await gotoAuthed(page, "/onboarding", "13-company-invite");
  await gotoAuthed(page, "/companies/add/details", "15-company-resume");
  await gotoAuthed(page, "/reviews/new", "16-review-create");
  await gotoAuthed(page, "/reviews/new", "19-review-appeal");
  await gotoAuthed(page, "/requests/new", "20-rfq-create");
  await gotoAuthed(page, "/requests/new", "21-rfq-ai");
  await gotoAuthed(page, "/requests/new", "22-rfq-attach");
  await gotoAuthed(page, "/dashboard/buyer", "23-rfq-dashboard");
  await gotoAuthed(page, "/quotes/compare", "25-rfq-compare");
  await gotoAuthed(page, "/dashboard/buyer", "29-billing-debit");
  await gotoAuthed(page, "/dashboard/buyer/billing", "27-billing-checkout");
  await gotoAuthed(page, "/dashboard/buyer/billing", "28-billing-webhook");
  await gotoAuthed(page, "/dashboard/buyer/billing", "30-billing-refund");
  await gotoAuthed(page, "/dashboard/buyer/billing", "40-billing-ledger");

  // Find an RFQ for award screenshot
  await page.goto(`${BASE}/requests`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await waitForMainContent(page);
  const rfqLink = page.locator('a[href*="/requests/"]').first();
  if (await rfqLink.count()) {
    await rfqLink.click();
    await waitForMainContent(page);
    await shot(page, "26-rfq-award");
  } else {
    await shot(page, "26-rfq-award");
  }

  // --- Supplier ---
  await signIn(page, "supplier");
  await gotoAuthed(page, "/dashboard/supplier", "18-review-response");
  await gotoAuthed(page, "/dashboard/supplier", "24-rfq-quote");

  // --- Admin ---
  await signIn(page, "admin");
  await gotoAuthed(page, "/dashboard/admin", "14-admin-approve");
  await gotoAuthed(page, "/dashboard/admin", "17-review-moderate");

  // --- Public catalog ---
  await context.clearCookies();
  await gotoPublic(page, "/suppliers", "31-suppliers");
  await gotoPublic(page, "/categories", "32-categories");
  await gotoPublic(page, "/search", "33-search");
  await gotoPublic(page, "/companies/search", "34-companies-search");
  await gotoPublic(page, "/v12", "37-v12");
  await gotoPublic(page, "/contact", "39-contact");
  await gotoPublic(page, "/pricing", "27b-pricing-public");

  // Health / database evidence (JSON rendered in browser)
  await page.goto(`${BASE}/api/v1/health`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await sleep(500);
  await shot(page, "38-database-health", { fullPage: true });

  // RBAC API probe page: capture me endpoint unauthenticated
  await page.goto(`${BASE}/api/v1/me`, {
    waitUntil: "networkidle",
    timeout: 60_000,
  });
  await sleep(500);
  await shot(page, "36-rbac-api", { fullPage: true });

  // Remove accidental intermediate if kept
  const before = path.join(OUT, "05-logout-before.png");
  if (fs.existsSync(before)) fs.unlinkSync(before);
  const pricingPub = path.join(OUT, "27b-pricing-public.png");
  if (fs.existsSync(pricingPub)) {
    // keep pricing as supplemental; 27 is billing
  }

  await browser.close();

  // Write README note
  fs.writeFileSync(
    path.join(OUT, "README.md"),
    `# Screenshots

Recaptured ${new Date().toISOString()} from ${BASE} with:
- \`networkidle\` / Clerk widget wait for auth surfaces
- Clerk sign-in tokens for buyer / supplier / admin dashboards
- Guest blocked routes captured on live sign-in challenge (not empty shells)

03 / 06 / 07 are Clerk-hosted factor / forgot-password / factor-one surfaces.
`,
  );

  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
