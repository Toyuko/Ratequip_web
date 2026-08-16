/**
 * Marketplace URL → product catalogue walkthrough on the LIVE site.
 *
 *   EVIDENCE_BASE_URL=https://ratequip-web.vercel.app node scripts/record-marketplace-import-demo.mjs
 *
 * Output: docs/evidence-videos/marketplace-import-demo.{webm,mp4}
 */
import "dotenv/config";
import { config as loadEnv } from "dotenv";
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

loadEnv({ path: ".env.local" });

const BASE = (
  process.env.EVIDENCE_BASE_URL || "https://ratequip-web.vercel.app"
).replace(/\/$/, "");
const OUT = path.resolve("docs/evidence-videos");
const RAW = path.resolve("scripts/evidence-recordings/marketplace-import-demo");
const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
const EVIDENCE_USER_ID =
  process.env.EVIDENCE_CLERK_USER_ID || "user_3GiniBf1oc2m7ADRiSOEhrdZkKP";
const NAME = "marketplace-import-demo";
const SAMPLE_PATH = "/evidence/machines4u-dealer-sample.html";
const IMPORT_URL = `${BASE}${SAMPLE_PATH}`;

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(RAW, { recursive: true, force: true });
fs.mkdirSync(RAW, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function caption(page, text, ok = false) {
  return page
    .evaluate(
      ({ text, ok }) => {
        if (!document.body) return;
        document
          .querySelectorAll("[data-evidence-caption]")
          .forEach((n) => n.remove());
        const el = document.createElement("div");
        el.dataset.evidenceCaption = "1";
        el.textContent = text;
        el.style.cssText = `position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:${ok ? "#065F46" : "#0F172A"};color:#fff;padding:12px 16px;border-radius:8px;font:600 15px/1.4 system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25)`;
        document.body.appendChild(el);
      },
      { text, ok },
    )
    .catch(() => undefined);
}

async function clearCaption(page) {
  await page
    .evaluate(() => {
      document
        .querySelectorAll("[data-evidence-caption]")
        .forEach((n) => n.remove());
    })
    .catch(() => undefined);
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
  await clerkFetch(`/users/${EVIDENCE_USER_ID}/metadata`, {
    method: "PATCH",
    body: JSON.stringify({
      public_metadata: { role },
      public_metadata_update: true,
    }),
  }).catch(async () => {
    await clerkFetch(`/users/${EVIDENCE_USER_ID}`, {
      method: "PATCH",
      body: JSON.stringify({ public_metadata: { role } }),
    });
  });
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

async function signInLive(page) {
  await setUserRole("supplier");
  const token = await createSignInToken();
  const appTicketUrl = `${BASE}/sign-in?__clerk_ticket=${encodeURIComponent(token.token)}`;
  await page.goto(appTicketUrl, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await sleep(2500);

  for (let i = 0; i < 20; i++) {
    const url = page.url();
    if (
      url.includes(new URL(BASE).hostname) &&
      !url.includes("__clerk_ticket")
    ) {
      break;
    }
    await sleep(500);
  }

  await page.goto(`${BASE}/onboarding`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await sleep(1200);

  const host = new URL(BASE).hostname;
  await page.context().addCookies([
    { name: "rq_role", value: "supplier", domain: host, path: "/" },
    { name: "rq_onboarded", value: "1", domain: host, path: "/" },
    {
      name: "rq_email",
      value: "touysmith@gmail.com",
      domain: host,
      path: "/",
    },
    {
      name: "rq_org_slug",
      value: "nordicfill-systems",
      domain: host,
      path: "/",
    },
  ]);

  if (page.url().includes("/sign-in") || page.url().includes("accounts.dev")) {
    await page.goto(token.url, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(3000);
  }
}

async function dismissTour(page) {
  await page.evaluate(() => {
    try {
      localStorage.setItem("rq_product_tour_v1", "done");
    } catch {
      /* ignore */
    }
  });
  const skip = page.getByRole("button", { name: /Skip tour/i });
  if (await skip.count()) {
    await skip.click({ force: true }).catch(() => {});
  }
}

async function waitUntilLive() {
  for (let i = 0; i < 40; i++) {
    const products = await fetch(`${BASE}/dashboard/supplier/products`)
      .then((r) => r.ok || r.status === 307 || r.status === 302)
      .catch(() => false);
    const sample = await fetch(`${BASE}${SAMPLE_PATH}`)
      .then((r) => r.ok)
      .catch(() => false);
    console.log(`  probe ${i + 1}: products=${products} sample=${sample}`);
    if (sample) return;
    await sleep(5000);
  }
  throw new Error(
    "Timed out waiting for marketplace sample page on live site",
  );
}

async function typeSlow(locator, text) {
  await locator.click();
  await locator.fill("");
  await locator.type(text, { delay: 18 });
}

async function main() {
  console.log(`Waiting for marketplace import demo assets on ${BASE}…`);
  await waitUntilLive();
  console.log(`Recording marketplace import against ${BASE}`);

  const browser = await chromium.launch({ headless: true });

  const authContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const authPage = await authContext.newPage();
  await signInLive(authPage);
  await dismissTour(authPage);
  const storage = await authContext.storageState();
  await authContext.close();

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    storageState: storage,
    recordVideo: { dir: RAW, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    // 1) Title / source stock page
    await page.goto(`${BASE}${SAMPLE_PATH}`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(1200);
    await caption(
      page,
      "Machines4u-style dealer stock — excavators, loaders, generators",
    );
    await sleep(3200);
    await page.evaluate(() => window.scrollBy(0, 280));
    await sleep(1800);
    await caption(
      page,
      "Suppliers already list equipment here — RateQuip can import the catalogue",
    );
    await sleep(3000);

    // 2) Supplier product catalogue
    await clearCaption(page);
    await page.goto(`${BASE}/dashboard/supplier/products?import=1`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissTour(page);
    await sleep(1800);
    await caption(
      page,
      "Supplier → Product catalogue — paste a Machines4u dealer URL",
    );
    await sleep(2800);

    const urlInput = page.locator("#sourceUrl");
    await urlInput.waitFor({ state: "visible", timeout: 30000 });
    await urlInput.scrollIntoViewIfNeeded();
    await typeSlow(urlInput, IMPORT_URL);
    await sleep(900);

    const rights = page.locator('input[name="rights"]');
    if (await rights.count()) {
      await rights.check({ force: true });
      await sleep(600);
    }

    await caption(page, "Confirm rights, then fetch & create drafts");
    await sleep(1800);

    await page
      .getByRole("button", { name: /Fetch & create drafts/i })
      .click();
    await sleep(1500);
    await caption(page, "Fetching listings and building draft products…");

    const draftsHeading = page.getByRole("heading", {
      name: /Draft products/i,
    });
    await draftsHeading.waitFor({ state: "visible", timeout: 90000 });
    await sleep(2200);
    await caption(
      page,
      "Drafts extracted from the dealer URL — accept what you want to publish",
    );
    await sleep(2800);

    // 3) Accept first three drafts
    const acceptButtons = page.getByRole("button", { name: /^Accept$/i });
    const acceptCount = Math.min(3, await acceptButtons.count());
    for (let i = 0; i < acceptCount; i++) {
      await acceptButtons.nth(0).click();
      await sleep(900);
    }
    await sleep(1000);
    await caption(page, "Accepted drafts are ready to publish");
    await sleep(2200);

    // 4) Publish
    const publish = page.getByRole("button", {
      name: /Publish accepted to catalogue/i,
    });
    await publish.waitFor({ state: "visible", timeout: 20000 });
    await publish.click();
    await sleep(2500);
    await caption(
      page,
      "Published into your RateQuip product catalogue",
      true,
    );
    await sleep(2800);

    // 5) Show published list + company profile
    await page.evaluate(() => {
      const el = document.querySelector("h2");
      if (el && /Published products/i.test(el.textContent || "")) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
    await sleep(2200);

    await clearCaption(page);
    await page.goto(`${BASE}/companies/nordicfill-systems`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(2000);
    await caption(
      page,
      "Imported products now appear on the public company profile",
      true,
    );
    await sleep(3500);

    await page.screenshot({
      path: path.join(OUT, `${NAME}-final.png`),
      fullPage: true,
    });
  } finally {
    await context.close();
    await browser.close();
  }

  const webm = fs
    .readdirSync(RAW)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => path.join(RAW, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  if (!webm) throw new Error("No webm recorded");

  const destWebm = path.join(OUT, `${NAME}.webm`);
  const destMp4 = path.join(OUT, `${NAME}.mp4`);
  fs.copyFileSync(webm, destWebm);

  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      destWebm,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      destMp4,
    ],
    { encoding: "utf8" },
  );
  if (ff.status !== 0) {
    console.error(ff.stderr);
    throw new Error("ffmpeg failed");
  }

  console.log(`Wrote ${destWebm}`);
  console.log(`Wrote ${destMp4}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
