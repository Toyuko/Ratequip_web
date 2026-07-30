#!/usr/bin/env node
/**
 * Demo video: AI onboarding questionnaire + company/contractor referrals.
 *
 *   EVIDENCE_BASE_URL=https://ratequip-web.vercel.app node scripts/record-onboarding-referrals-demo.mjs
 *   EVIDENCE_BASE_URL=http://localhost:3000 node scripts/record-onboarding-referrals-demo.mjs
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
const RAW = path.resolve("scripts/evidence-recordings/onboarding-referrals-demo");
const NAME = "41-onboarding-ai-referrals-demo";
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
    if (!url.includes("__clerk_ticket") && !url.includes("accounts.dev")) {
      break;
    }
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
    if (!value) await input.fill("Demo plant — Bangkok");
  }

  const textareas = page.locator("textarea");
  const taCount = await textareas.count();
  for (let i = 0; i < taCount; i++) {
    const ta = textareas.nth(i);
    if (!(await ta.isVisible().catch(() => false))) continue;
    const value = await ta.inputValue().catch(() => "");
    if (!value) {
      await ta.fill(
        "Extrusion and packaging lines for pet food; need trusted OEMs and installers.",
      );
    }
  }
}

async function runInterview(page) {
  // Cap sections so the demo stays watchable.
  for (let step = 0; step < 8; step++) {
    const interviewHeading = page.getByText(/AI assistant · section/i);
    const reviewHeading = page.getByText(/Review AI suggestions/i);
    const doneHeading = page.getByText(/is ready/i);

    if (await reviewHeading.isVisible().catch(() => false)) break;
    if (await doneHeading.isVisible().catch(() => false)) break;
    if (!(await interviewHeading.isVisible().catch(() => false))) break;

    const label = await interviewHeading.textContent().catch(() => `section ${step + 1}`);
    await caption(page, `AI questionnaire — ${label?.trim() || "answering"}`);
    await fillVisibleAnswers(page);
    await sleep(900);

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

    await signIn(page, "buyer");
    await sleep(800);
    await caption(page, "Signed in — starting onboarding + referrals demo", true);
    await sleep(1000);

    // --- Step 1: Onboarding ---
    await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
    await sleep(1000);
    await caption(
      page,
      "Step 1 — Onboarding: choose role & organisation, then AI questionnaire",
    );
    await sleep(1800);

    await page.getByRole("button", { name: /Buyer/i }).first().click();
    await page.locator("#org").fill("Robin Demo Packaging Co");
    await page.locator("#contact-name").fill("Robin Lionstone");
    await page.locator("#email").fill("robin.demo@ratequip.test");
    await page.locator("#phone").fill("+66 2 555 0100");
    await page.locator("#address").fill("99 Industrial Estate, Bangkok");
    await sleep(1000);
    await caption(page, "Continuing to AI company questionnaire…", true);
    await page
      .getByRole("button", { name: /Continue to AI company questionnaire/i })
      .click();
    await page.waitForURL(/\/v12\/activation/, { timeout: 30_000 }).catch(() => {});
    await sleep(2500);

    // --- Step 2: AI activation ---
    await caption(
      page,
      "Step 2 — AI assistant builds operating profile + relevance suggestions",
    );
    await sleep(1600);

    // If auto-start didn't fire (existing session or pack wait), start manually.
    const startBtn = page.getByRole("button", { name: /Start AI interview/i });
    if (await startBtn.isVisible().catch(() => false)) {
      const company = page.locator("#company");
      if (await company.isVisible().catch(() => false)) {
        const val = await company.inputValue();
        if (!val) await company.fill("Robin Demo Packaging Co");
      }
      await startBtn.click();
      await sleep(1800);
    }

    await runInterview(page);

    // Review suggestions
    if (await page.getByText(/Review AI suggestions/i).isVisible().catch(() => false)) {
      await caption(page, "Review AI profile suggestions — accept or reject", true);
      await sleep(1200);
      const acceptButtons = page.getByRole("button", { name: /^Accept$/i });
      const acceptCount = Math.min(await acceptButtons.count(), 3);
      for (let i = 0; i < acceptCount; i++) {
        await acceptButtons.nth(i).click();
        await sleep(500);
      }
      await sleep(800);
      const confirm = page.getByRole("button", {
        name: /Confirm company operating profile/i,
      });
      if (await confirm.isVisible().catch(() => false)) {
        await confirm.click();
        await sleep(2200);
      }
    }

    if (await page.getByText(/Suggested companies for your profile/i).isVisible().catch(() => false)) {
      await caption(
        page,
        "Relevance ranking — trusted / strong fit / relevant companies",
        true,
      );
      await sleep(2500);
      await page.evaluate(() => window.scrollBy(0, 420));
      await sleep(1500);
    }

    // --- Step 3: Referrals hub ---
    await page.goto(`${BASE}/referrals`, { waitUntil: "networkidle" });
    await sleep(1200);
    await caption(
      page,
      "Referrals — invite companies & contractors via email / LinkedIn / socials",
    );
    await sleep(1800);

    await page.getByRole("button", { name: /Refer a company/i }).click();
    await sleep(1000);
    await page.locator("#ref-email").fill("partner@example.com");
    await page.locator("#ref-name").fill("Partner Contact");
    await page.locator("#ref-company").fill("Harbor Heavy Freight");
    await page
      .locator("#ref-note")
      .fill("Please claim your RateQuip profile so we can collaborate on RFQs.");
    await sleep(1000);
    await caption(page, "Sending email invite…");
    await page.getByRole("button", { name: /Send email invite/i }).click();
    await page
      .getByText(/Invite sent to/i)
      .waitFor({ timeout: 20_000 })
      .catch(() => {});
    await sleep(1200);
    await caption(page, "Email invite queued (Resend or demo-email)", true);
    await sleep(1200);

    // Capture the signed join URL from this invite BEFORE switching kinds.
    const joinUrlEl = page.locator("p.break-all").first();
    await joinUrlEl.waitFor({ state: "visible", timeout: 15_000 });
    let joinUrl = (await joinUrlEl.textContent())?.trim() || "";
    if (!joinUrl.includes("/join/")) {
      throw new Error(`Expected join URL after email invite, got: ${joinUrl}`);
    }

    await caption(page, "Share to join — LinkedIn, WhatsApp, X, Facebook, copy link");
    await sleep(1000);
    await page.getByRole("button", { name: /Copy link/i }).click();
    await sleep(900);
    // Highlight social share buttons without opening an external popup (keeps one video track).
    await page.getByRole("button", { name: /^LinkedIn$/i }).hover();
    await sleep(600);
    await page.getByRole("button", { name: /WhatsApp/i }).hover();
    await sleep(600);
    await page.getByRole("button", { name: /X \/ Twitter/i }).hover();
    await sleep(600);
    await page.getByRole("button", { name: /^Facebook$/i }).hover();
    await sleep(900);

    await caption(page, "Opening the recipient join landing from the invite link…");
    await page.goto(joinUrl, { waitUntil: "networkidle", timeout: 60_000 });
    await sleep(1500);

    const notFound = page.getByRole("heading", { name: /Invite not found/i });
    if (await notFound.isVisible().catch(() => false)) {
      throw new Error(`Join landing still shows Invite not found for ${joinUrl}`);
    }

    await page
      .getByRole("heading", { name: /Claim Harbor Heavy Freight|Join me on RateQuip|Add your company/i })
      .first()
      .waitFor({ timeout: 15_000 });
    await caption(
      page,
      "Join landing — valid invite; recipient can claim / sign up",
      true,
    );
    await sleep(2800);

    // Also show contractor referral type briefly on the hub.
    await page.goto(`${BASE}/referrals`, { waitUntil: "networkidle" });
    await sleep(900);
    await page.getByRole("button", { name: /Refer a contractor/i }).click();
    await sleep(1200);
    await caption(page, "Contractor referral type also available", true);
    await sleep(1600);

    // Dashboard entry points
    await page.goto(`${BASE}/dashboard/buyer`, { waitUntil: "networkidle" });
    await sleep(1200);
    await caption(
      page,
      "Dashboard quick actions — AI questionnaire + Refer & invite",
      true,
    );
    await sleep(2500);
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
    `Using ${webm} (${(webms[0].size / (1024 * 1024)).toFixed(1)} MB)` +
      (webms.length > 1 ? ` among ${webms.length} tracks` : ""),
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
