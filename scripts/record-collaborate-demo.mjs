/**
 * Collaborate feature walkthrough on the LIVE site.
 *
 *   EVIDENCE_BASE_URL=https://ratequip-web.vercel.app node scripts/record-collaborate-demo.mjs
 *
 * Output: docs/evidence-videos/collaborate-demo.{webm,mp4}
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
const RAW = path.resolve("scripts/evidence-recordings/collaborate-demo");
const NAME = "collaborate-demo";
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
      el.style.cssText = `position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;background:${ok ? "#065F46" : "#0F172A"};color:#fff;padding:12px 16px;border-radius:8px;font:600 15px/1.4 system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25)`;
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
  await setUserRole("buyer");
  const token = await createSignInToken();
  await page.goto(
    `${BASE}/sign-in?__clerk_ticket=${encodeURIComponent(token.token)}`,
    { waitUntil: "domcontentloaded", timeout: 60000 },
  );
  await sleep(2500);

  for (let i = 0; i < 20; i++) {
    const url = page.url();
    if (
      url.includes("ratequip-web.vercel.app") &&
      !url.includes("__clerk_ticket")
    ) {
      break;
    }
    await sleep(500);
  }

  await page.context().addCookies([
    {
      name: "rq_role",
      value: "buyer",
      domain: new URL(BASE).hostname,
      path: "/",
    },
    {
      name: "rq_onboarded",
      value: "1",
      domain: new URL(BASE).hostname,
      path: "/",
    },
  ]);
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
  for (let i = 0; i < 48; i++) {
    const res = await fetch(`${BASE}/collaborate`, {
      redirect: "manual",
    }).catch(() => null);
    const status = res?.status ?? 0;
    const location = res?.headers.get("location") ?? "";
    const api = await fetch(`${BASE}/api/v1/collaborate?action=snapshot`)
      .then((r) => r.json())
      .catch(() => null);
    const apiOk = !!api?.ok;
    console.log(
      `  probe ${i + 1}: status=${status} loc=${location.slice(0, 40)} api=${apiOk}`,
    );
    // Protected route redirects to sign-in when live; API snapshot proves module is deployed
    if (apiOk && (status === 200 || status === 307 || status === 302)) {
      if (
        status === 200 ||
        location.includes("collaborate") ||
        location.includes("sign-in")
      ) {
        return;
      }
    }
    await sleep(5000);
  }
  throw new Error("Timed out waiting for /collaborate on live site");
}

async function fillIf(page, selector, value) {
  const el = page.locator(selector);
  if (await el.count()) {
    await el.fill(value);
  }
}

async function clickAdvance(page, state) {
  const btn = page.getByRole("button", {
    name: new RegExp(`→\\s*${state}`, "i"),
  });
  if (await btn.count()) {
    await caption(page, `Advance → ${state}`);
    await sleep(1200);
    await btn.first().click();
    await sleep(2000);
    return true;
  }
  return false;
}

async function main() {
  console.log(`Waiting for Collaborate on ${BASE}…`);
  await waitUntilLive();
  console.log(`Recording Collaborate demo against ${BASE}`);

  const browser = await chromium.launch({ headless: true });

  const authContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const authPage = await authContext.newPage();
  await signInLive(authPage);
  await authPage.goto(`${BASE}/collaborate`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
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
    // 1) Hub
    await page.goto(`${BASE}/collaborate`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await dismissTour(page);
    await sleep(1200);
    await caption(
      page,
      "RateQuip Collaborate — assemble people, companies and resources around an outcome",
    );
    await sleep(3200);
    await page.evaluate(() => window.scrollBy(0, 280));
    await sleep(1600);
    await caption(
      page,
      "One Engagement model · four modes: Sessions, Jobs, Pods, Ventures",
    );
    await sleep(3000);

    // 2) Publish expert offering
    await caption(page, "Phase 1 launch: Remote Expert Support");
    await sleep(2000);
    await page
      .getByRole("link", { name: /Publish an offering/i })
      .first()
      .click();
    await page.waitForURL(/\/collaborate\/experts/, { timeout: 30000 });
    await sleep(1200);
    await caption(page, "Expert publishes a priced SessionOffering");
    await sleep(2200);

    await fillIf(page, "#legalName", "Sam Controls");
    await fillIf(page, "#email", "sam.controls@example.com");
    await fillIf(page, "#title", "Siemens S7 remote diagnostic");
    await page.locator("#type").selectOption("LIVE_TROUBLESHOOT").catch(() => {});
    await fillIf(
      page,
      "#description",
      "Live remote support for Siemens S7 / TIA Portal faults on packaging lines.",
    );
    await fillIf(page, "#price", "280");
    await fillIf(page, "#brands", "Siemens, TIA Portal");
    await sleep(1000);
    await caption(page, "Price, duration, brands — written deliverable is mandatory");
    await sleep(2400);
    await page.getByRole("button", { name: /Publish offering/i }).click();
    await page.waitForURL(/\/collaborate\/sessions/, { timeout: 45000 });
    await sleep(1500);

    // 3) Browse + book
    await caption(page, "Buyers browse offerings and book instantly");
    await sleep(2600);
    await page.evaluate(() => window.scrollBy(0, 120));
    await sleep(800);

    const bookBtn = page.getByRole("button", { name: /Book session/i });
    await bookBtn.first().waitFor({ state: "visible", timeout: 20000 });
    await caption(
      page,
      "Fee disclosed before booking — funds held by the licensed PSP",
    );
    await sleep(2600);
    await bookBtn.first().click();
    await page.waitForURL(/\/collaborate\/engagements\//, { timeout: 45000 });
    await sleep(1800);

    // 4) Engagement detail
    await caption(
      page,
      "Engagement workspace: fee disclosure, milestones, event chain",
    );
    await sleep(3000);
    await page.evaluate(() => window.scrollBy(0, 200));
    await sleep(1500);

    await clickAdvance(page, "AUTHORISED");
    await clickAdvance(page, "IN_SESSION");

    if (await page.locator("#findings").count()) {
      await caption(
        page,
        "Every session must produce a written deliverable — not a voice-only call",
      );
      await sleep(2200);
      await fillIf(
        page,
        "#findings",
        "Intermittent encoder fault on axis 3; shield grounding incomplete.",
      );
      await fillIf(
        page,
        "#recommendations",
        "Replace encoder cable; verify PE bond at cabinet entry.",
      );
      await fillIf(
        page,
        "#nextSteps",
        "Order spare encoder; schedule 30-min follow-up after install.",
      );
      await page.getByRole("button", { name: /Submit deliverable/i }).click();
      await sleep(2500);
    }

    if (await clickAdvance(page, "ACCEPTED")) {
      await caption(
        page,
        "Buyer accepts → capture hold → payout + reputation event",
      );
      await sleep(2400);
    }

    await page.evaluate(() => window.scrollBy(0, 420));
    await sleep(1200);
    await caption(
      page,
      "Immutable domain event chain — reconstructable for disputes",
    );
    await sleep(3000);

    // 5) Jobs path
    await page.goto(`${BASE}/collaborate/jobs/new`, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await sleep(1200);
    await caption(
      page,
      "Paid Jobs: one buyer, one contributor, milestone funding",
    );
    await sleep(2600);
    await fillIf(
      page,
      "#title",
      "Sauce filling line — Siemens S7 program extension",
    );
    await fillIf(
      page,
      "#summary",
      "Extend existing S7-1500 program for new filler head; FAT support on site.",
    );
    await fillIf(page, "#amount", "8500");
    await sleep(1000);
    await page.getByRole("button", { name: /Create job/i }).click();
    await page.waitForURL(/\/collaborate\/engagements\//, { timeout: 45000 });
    await sleep(1600);

    await caption(
      page,
      "State machine: publish → award → contract → fund → deliver → accept → pay",
    );
    await sleep(2800);

    for (const step of [
      "PUBLISHED",
      "QUOTING",
      "AWARDED",
      "CONTRACTED",
      "FUNDED",
      "IN_PROGRESS",
    ]) {
      await clickAdvance(page, step);
    }

    const evidenceBtn = page.getByRole("button", {
      name: /Submit evidence artefact/i,
    });
    if (await evidenceBtn.count()) {
      await caption(page, "Evidence artefacts attach to acceptance criteria");
      await sleep(2000);
      await evidenceBtn.first().click();
      await sleep(1800);
    }

    await clickAdvance(page, "SUBMITTED");
    if (await clickAdvance(page, "ACCEPTED")) {
      await caption(
        page,
        "Accept releases the funded milestone — reputation only from paid delivery",
      );
      await sleep(2400);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(800);
    await caption(
      page,
      "Collaborate is live — Sessions now, Jobs next, Pods & Ventures on the same foundation",
      true,
    );
    await sleep(3600);

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

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
