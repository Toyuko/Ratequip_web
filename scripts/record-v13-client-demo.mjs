#!/usr/bin/env node
/**
 * Client demo video: RateQuip V13 enterprise overlay features.
 *
 *   EVIDENCE_BASE_URL=https://ratequip-web.vercel.app node scripts/record-v13-client-demo.mjs
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
const RAW = path.resolve("scripts/evidence-recordings/v13-client-demo");
const NAME = "v13-enterprise-client-demo";
const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
const EVIDENCE_USER_ID =
  process.env.EVIDENCE_CLERK_USER_ID || "user_3GiniBf1oc2m7ADRiSOEhrdZkKP";

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(RAW, { recursive: true, force: true });
fs.mkdirSync(RAW, { recursive: true });

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function caption(page, text, ok = false) {
  return page.evaluate(
    ({ text, ok }) => {
      document
        .querySelectorAll("[data-evidence-caption]")
        .forEach((n) => n.remove());
      const el = document.createElement("div");
      el.dataset.evidenceCaption = "1";
      el.textContent = text;
      el.style.cssText = `position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:${ok ? "#065F46" : "#0F172A"};color:#fff;padding:12px 16px;border-radius:8px;font:600 16px/1.4 system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25)`;
      document.body.appendChild(el);
    },
    { text, ok },
  );
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
    if (!url.includes("__clerk_ticket") && !url.includes("accounts.dev")) break;
    await sleep(500);
  }
  await page.evaluate(() => {
    try {
      localStorage.setItem("rq_product_tour_v1", "done");
    } catch {
      /* ignore */
    }
  });
}

async function ensureSignedIn(page, role = "buyer") {
  if (page.url().includes("/sign-in") || page.url().includes("accounts.dev")) {
    await signIn(page, role);
  }
}

async function isBrokenPage(page) {
  const body = ((await page.locator("body").innerText().catch(() => "")) || "")
    .toLowerCase();
  return (
    body.includes("this page couldn't load") ||
    body.includes("this page couldnt load") ||
    body.includes("this site can't be reached") ||
    body.includes("err_connection") ||
    body.includes("err_timed_out") ||
    body.includes("aw snap")
  );
}

/** Navigate with retries; avoid flaky networkidle + recover load-error screens. */
async function safeGoto(page, path, { role = "buyer", expectText } = {}) {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await sleep(900);
      await ensureSignedIn(page, role);
      if (!page.url().includes(path.replace(BASE, "")) && path.startsWith("/")) {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await sleep(900);
      }
      if (await isBrokenPage(page)) {
        throw new Error(`Broken page UI at ${page.url()}`);
      }
      if (expectText) {
        await page
          .getByText(expectText)
          .first()
          .waitFor({ state: "visible", timeout: 20_000 });
      }
      return;
    } catch (err) {
      lastErr = err;
      console.warn(`safeGoto attempt ${attempt} failed for ${url}: ${err}`);
      await sleep(1200);
      // Re-auth and retry — Clerk ticket / role flips often cause blank load errors
      try {
        await signIn(page, role);
      } catch {
        /* continue */
      }
    }
  }
  throw lastErr ?? new Error(`Failed to open ${url}`);
}

async function fillVisibleAnswers(page) {
  const selects = page.locator("select");
  const selectCount = await selects.count();
  for (let i = 0; i < selectCount; i++) {
    const select = selects.nth(i);
    const options = select.locator("option");
    const n = await options.count();
    if (n > 1) {
      const value = await options.nth(1).getAttribute("value");
      if (value) await select.selectOption(value);
    }
  }

  const inputs = page.locator(
    'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])',
  );
  const inputCount = await inputs.count();
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    if (!(await input.isVisible().catch(() => false))) continue;
    const value = await input.inputValue().catch(() => "");
    if (!value) await input.fill("V13 demo plant — Bangkok");
  }

  const textareas = page.locator("textarea");
  const taCount = await textareas.count();
  for (let i = 0; i < taCount; i++) {
    const ta = textareas.nth(i);
    if (!(await ta.isVisible().catch(() => false))) continue;
    const value = await ta.inputValue().catch(() => "");
    if (!value) {
      await ta.fill(
        "Pet-food extrusion and packaging; need trusted OEMs, installers, and validated suppliers.",
      );
    }
  }
}

async function runInterview(page) {
  for (let step = 0; step < 8; step++) {
    const interviewHeading = page.getByText(/AI assistant · section/i);
    const reviewHeading = page.getByText(/Review AI suggestions/i);
    const doneHeading = page.getByText(/is ready/i);

    if (await reviewHeading.isVisible().catch(() => false)) break;
    if (await doneHeading.isVisible().catch(() => false)) break;
    if (!(await interviewHeading.isVisible().catch(() => false))) break;

    const label = await interviewHeading
      .textContent()
      .catch(() => `section ${step + 1}`);
    await caption(page, `AI questionnaire — ${label?.trim() || "answering"}`);
    await fillVisibleAnswers(page);
    await sleep(800);

    const continueBtn = page.getByRole("button", { name: /^Continue$/i });
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
      await sleep(1400);
    } else {
      break;
    }
  }
}

async function main() {
  console.log(`Recording ${NAME} against ${BASE}`);
  const probe = await fetch(BASE);
  if (!probe.ok) throw new Error(`Site not reachable: ${probe.status}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: RAW, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(45_000);

  try {
    await page.addInitScript(() => {
      try {
        localStorage.setItem("rq_product_tour_v1", "done");
      } catch {
        /* ignore */
      }
    });

    // --- Open: V13 index + flags ---
    await page.goto(`${BASE}/v13`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await sleep(1200);
    if (await isBrokenPage(page)) {
      throw new Error("Opening /v13 failed to load");
    }
    await caption(
      page,
      "RateQuip V13 — enterprise overlay on the Phase 2 MVP",
      true,
    );
    await sleep(2200);
    await caption(
      page,
      "Flags enabled: Part 7 Business DNA · Graph matching · Catalogue ledger",
    );
    await sleep(2500);

    await signIn(page, "buyer");
    await sleep(800);
    await caption(page, "Signed in for the V13 feature walkthrough", true);
    await sleep(1200);

    // --- Part 7 Business DNA ---
    await safeGoto(page, "/v12/activation", {
      expectText: /Set up your company with AI/i,
    });

    await caption(
      page,
      "Wave 1 — Part 7 Business DNA: AI company setup with inferred vs confirmed facts",
    );
    await sleep(2000);

    const startBtn = page.getByRole("button", { name: /Start AI interview/i });
    if (await startBtn.isVisible().catch(() => false)) {
      const company = page.locator("#company");
      if (await company.isVisible().catch(() => false)) {
        await company.fill("V13 Client Demo Foods Co");
      }
      const buyerBtn = page.getByRole("button", { name: /^Buyer$/i });
      if (await buyerBtn.isVisible().catch(() => false)) {
        await buyerBtn.click();
      }
      await startBtn.click();
      await sleep(1800);
    }

    await runInterview(page);

    if (
      await page.getByText(/Review AI suggestions/i).isVisible().catch(() => false)
    ) {
      await caption(page, "Review AI profile suggestions — human confirm required");
      await sleep(1400);
      const acceptButtons = page.getByRole("button", { name: /^Accept$/i });
      const acceptCount = Math.min(await acceptButtons.count(), 4);
      for (let i = 0; i < acceptCount; i++) {
        await acceptButtons.nth(i).click();
        await sleep(450);
      }

      const dnaHeading = page.getByText(/Business DNA facts/i);
      if (await dnaHeading.isVisible().catch(() => false)) {
        await caption(
          page,
          "Business DNA — confirm or reject inferred facts before the profile sticks",
          true,
        );
        await sleep(1600);
        await page.evaluate(() => window.scrollBy(0, 280));
        await sleep(1000);
        const confirmFact = page.getByRole("button", { name: /^Confirm$/i });
        const n = Math.min(await confirmFact.count(), 3);
        for (let i = 0; i < n; i++) {
          await confirmFact.nth(i).click();
          await sleep(500);
        }
        await sleep(1000);
      }

      const confirmProfile = page.getByRole("button", {
        name: /Confirm company operating profile/i,
      });
      if (await confirmProfile.isVisible().catch(() => false)) {
        await caption(page, "Confirming operating profile…", true);
        await confirmProfile.click();
        await sleep(2200);
      }
    }

    if (
      await page
        .getByText(/Suggested companies for your profile/i)
        .isVisible()
        .catch(() => false)
    ) {
      await caption(
        page,
        "Explainable company matches ranked from the confirmed DNA profile",
        true,
      );
      await sleep(2200);
      await page.evaluate(() => window.scrollBy(0, 420));
      await sleep(1600);
    }

    // Stay as buyer for the rest — mid-demo Clerk role flips caused blank
    // "This page couldn't load" screens in the previous recording.

    // --- Graph matching ---
    await safeGoto(page, "/v12/matching", {
      expectText: /Explainable Matching Engine/i,
    });
    await caption(
      page,
      "Wave 2 — Explainable matching with taxonomy graph proximity",
    );
    await sleep(1600);
    const label = page.locator("#label");
    if (await label.isVisible().catch(() => false)) {
      await label.fill("rotary filler packaging food");
    }
    const category = page.locator("#category");
    if (await category.isVisible().catch(() => false)) {
      await category.fill("food_beverage");
    }
    const region = page.locator("#region");
    if (await region.isVisible().catch(() => false)) {
      await region.fill("Australia");
    }
    await page
      .locator('form button[type="submit"]')
      .first()
      .click({ timeout: 10_000 });
    await sleep(2200);
    if (await isBrokenPage(page)) {
      throw new Error("Matching page broke after submit");
    }
    await caption(page, "Shortlist with reason codes — not a black box", true);
    await sleep(2200);

    // --- Opportunity builder ---
    await safeGoto(page, "/v12/opportunity-builder", {
      expectText: /Opportunity Builder/i,
    });
    await caption(
      page,
      "Wave 2 — Opportunity Builder attaches capability & taxonomy keys",
    );
    await sleep(1600);
    const companyName = page.locator("#companyName");
    if (await companyName.isVisible().catch(() => false)) {
      await companyName.fill("NordicFill Systems");
    }
    await page
      .getByRole("button", { name: /Publish opportunity profile/i })
      .click();
    await sleep(2000);
    if (await isBrokenPage(page)) {
      throw new Error("Opportunity builder page broke after publish");
    }
    await caption(
      page,
      "Published — capability and taxonomy counts feed explainable matching",
      true,
    );
    await sleep(2000);

    // --- Contractor builder ---
    await safeGoto(page, "/v12/contractor-builder", {
      expectText: /Contractor Builder/i,
    });
    await caption(
      page,
      "Wave 2 — Contractor Builder: trades, licences, coverage, capability keys",
    );
    await sleep(1600);
    await page
      .getByRole("button", { name: /Publish contractor profile/i })
      .click();
    await sleep(2000);
    if (await isBrokenPage(page)) {
      throw new Error("Contractor builder page broke after publish");
    }
    await caption(page, "Contractor profile published for service matching", true);
    await sleep(1800);

    // --- Catalogue factory ---
    await safeGoto(page, "/v12/catalogue-factory", {
      expectText: /Turn my catalogue into product drafts/i,
    });
    await caption(
      page,
      "Wave 3 — Catalogue factory: paste brochure → credit preview → drafts",
    );
    await sleep(1800);

    await page.locator("#title").fill("V13 Demo Packaging Catalogue");
    await page.locator("#body").fill(
      "Automatic Packaging Systems — Product Catalogue\n\nModel: AutoBag-1200 bagging machine\nCapacity: 20-60 bags/min\n\nModel: SealGuard-V vertical sealer\nCapacity: up to 40 packs/min\n\nModel: InspectEye vision inspection system\nChecks: foil presence, seal integrity",
    );
    await page.locator('input[name="rights"]').check();
    await sleep(800);
    await caption(page, "Credit estimate runs only after rights attestation");
    await sleep(1200);

    await page
      .getByRole("button", { name: /Estimate cost.*create drafts/i })
      .click();
    await sleep(4000);
    if (await isBrokenPage(page)) {
      throw new Error("Catalogue factory broke after create drafts");
    }

    // If the server action bounced auth, recover onto a healthy catalogue UI
    // instead of waiting forever for drafts that never rendered.
    let onCatalogue = await page
      .getByRole("heading", { name: /Turn my catalogue into product drafts/i })
      .isVisible()
      .catch(() => false);
    if (!onCatalogue) {
      console.warn("Catalogue UI lost after submit — recovering");
      await safeGoto(page, "/v12/catalogue-factory", {
        expectText: /Turn my catalogue into product drafts/i,
      });
      onCatalogue = true;
    }

    await page.evaluate(() => window.scrollBy(0, 360));
    await sleep(1000);

    const acceptDraft = page.getByRole("button", { name: /^Accept$/i });
    if (await acceptDraft.first().isVisible().catch(() => false)) {
      await caption(
        page,
        "Human accept/reject on drafts — AI suggestions never auto-publish",
        true,
      );
      await acceptDraft.first().click();
      await sleep(1600);
      await caption(
        page,
        "Publish stays blocked until accepted drafts are confirmed",
        true,
      );
      await sleep(1800);
    } else {
      const msg = page.locator("p.text-sm.text-emerald-700");
      if (await msg.first().isVisible().catch(() => false)) {
        await caption(
          page,
          "Drafts created with credit estimate — publish requires human confirm",
          true,
        );
      } else {
        await caption(
          page,
          "Catalogue factory — rights, credit estimate, human draft review before publish",
          true,
        );
      }
      await sleep(2200);
    }

    if (await isBrokenPage(page)) {
      throw new Error("Broken page still visible before closing segment");
    }

    // --- Close ---
    await safeGoto(page, "/v13", {
      expectText: /Enterprise archive integration/i,
    });
    await caption(
      page,
      "V13 overlays are additive — Phase 2 MVP auth, RFQ, reviews & billing stay intact",
      true,
    );
    await sleep(2800);
    await caption(
      page,
      "Thank you — RateQuip V13 Enterprise Overlay demo complete",
      true,
    );
    await sleep(2200);
  } finally {
    await context.close();
    await browser.close();
  }

  const webms = fs
    .readdirSync(RAW)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({ f, size: fs.statSync(path.join(RAW, f)).size }))
    .sort((a, b) => b.size - a.size);
  if (!webms.length) throw new Error("No video recorded");
  const webm = webms[0].f;
  console.log(
    `Using ${webm} (${(webms[0].size / (1024 * 1024)).toFixed(1)} MB)`,
  );
  const src = path.join(RAW, webm);
  const destWebm = path.join(OUT, `${NAME}.webm`);
  const destMp4 = path.join(OUT, `${NAME}.mp4`);
  fs.copyFileSync(src, destWebm);

  const ffmpeg = spawnSync(
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
  if (ffmpeg.status !== 0) {
    console.error(ffmpeg.stderr);
    throw new Error("ffmpeg failed");
  }

  const sizeMb = (fs.statSync(destMp4).size / (1024 * 1024)).toFixed(1);
  console.log(`\nWrote ${destMp4} (${sizeMb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
