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
  if (page.url().includes("/sign-in")) {
    await signIn(page, role);
  }
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
    await page.goto(`${BASE}/v13`, { waitUntil: "networkidle" });
    await sleep(1200);
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
    await page.goto(`${BASE}/v12/activation`, {
      waitUntil: "domcontentloaded",
      timeout: 60_000,
    });
    await sleep(1500);
    await ensureSignedIn(page, "buyer");
    if (!page.url().includes("/v12/activation")) {
      await page.goto(`${BASE}/v12/activation`, { waitUntil: "networkidle" });
      await sleep(1200);
    }

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

    // --- Graph matching ---
    await page.goto(`${BASE}/v12/matching`, { waitUntil: "networkidle" });
    await sleep(1200);
    await ensureSignedIn(page, "buyer");
    if (!page.url().includes("/v12/matching")) {
      await page.goto(`${BASE}/v12/matching`, { waitUntil: "networkidle" });
      await sleep(1000);
    }
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
    await page.getByRole("button", { name: /Run match|Match|Find/i }).first().click().catch(async () => {
      await page.locator('form button[type="submit"]').first().click();
    });
    await sleep(2200);
    await caption(page, "Shortlist with reason codes — not a black box", true);
    await sleep(2200);

    // --- Opportunity builder ---
    await page.goto(`${BASE}/v12/opportunity-builder`, {
      waitUntil: "networkidle",
    });
    await sleep(1200);
    await ensureSignedIn(page, "supplier");
    await page.goto(`${BASE}/v12/opportunity-builder`, {
      waitUntil: "networkidle",
    });
    await sleep(1000);
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
    await caption(
      page,
      "Published — capability and taxonomy counts feed explainable matching",
      true,
    );
    await sleep(2000);

    // --- Contractor builder ---
    await page.goto(`${BASE}/v12/contractor-builder`, {
      waitUntil: "networkidle",
    });
    await sleep(1200);
    await ensureSignedIn(page, "contractor");
    await page.goto(`${BASE}/v12/contractor-builder`, {
      waitUntil: "networkidle",
    });
    await sleep(1000);
    await caption(
      page,
      "Wave 2 — Contractor Builder: trades, licences, coverage, capability keys",
    );
    await sleep(1600);
    await page
      .getByRole("button", { name: /Publish contractor profile/i })
      .click();
    await sleep(2000);
    await caption(page, "Contractor profile published for service matching", true);
    await sleep(1800);

    // --- Catalogue factory ---
    await signIn(page, "supplier");
    await page.goto(`${BASE}/v12/catalogue-factory`, {
      waitUntil: "networkidle",
    });
    await sleep(1400);
    await caption(
      page,
      "Wave 3 — Catalogue factory: paste brochure → credit preview → drafts",
    );
    await sleep(1800);

    const title = page.locator("#title, input[name='title']").first();
    if (await title.isVisible().catch(() => false)) {
      await title.fill("V13 Demo Packaging Catalogue");
    }
    const sampleBtn = page.getByRole("button", {
      name: /Use sample|Load sample|Sample/i,
    });
    if (await sampleBtn.isVisible().catch(() => false)) {
      await sampleBtn.click();
      await sleep(800);
    } else {
      const body = page.locator("textarea").first();
      if (await body.isVisible().catch(() => false)) {
        await body.fill(
          "Automatic Packaging Systems — Product Catalogue\n\nModel: AutoBag-1200 bagging machine\nCapacity: 20-60 bags/min\n\nModel: SealGuard-V vertical sealer\nCapacity: up to 40 packs/min",
        );
      }
    }

    const rights = page.locator('input[type="checkbox"]').first();
    if (await rights.isVisible().catch(() => false)) {
      await rights.check().catch(() => {});
    }

    const createBtn = page.getByRole("button", {
      name: /Create import|Start import|Estimate|Upload|Create/i,
    });
    if (await createBtn.first().isVisible().catch(() => false)) {
      await createBtn.first().click();
      await sleep(2000);
    }

    const previewBtn = page.getByRole("button", {
      name: /Preview|credit|Confirm usage|Approve cost/i,
    });
    if (await previewBtn.first().isVisible().catch(() => false)) {
      await caption(page, "Credit estimate shown before processing — no silent charges");
      await sleep(1600);
      await previewBtn.first().click();
      await sleep(1600);
    }

    const confirmUsage = page.getByRole("button", {
      name: /Confirm.*usage|Confirm.*credit|Process|Continue/i,
    });
    if (await confirmUsage.first().isVisible().catch(() => false)) {
      await confirmUsage.first().click();
      await sleep(2200);
    }

    const acceptDraft = page.getByRole("button", { name: /^Accept$/i });
    if (await acceptDraft.first().isVisible().catch(() => false)) {
      await caption(
        page,
        "Human accept/reject on drafts — AI suggestions never auto-publish",
        true,
      );
      await acceptDraft.first().click();
      await sleep(1500);
    } else {
      await caption(
        page,
        "Catalogue path ready — publish blocked until drafts are confirmed",
        true,
      );
      await sleep(1800);
    }

    // --- Close ---
    await page.goto(`${BASE}/v13`, { waitUntil: "networkidle" });
    await sleep(1200);
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
