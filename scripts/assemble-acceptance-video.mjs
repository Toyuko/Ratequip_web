#!/usr/bin/env node
/**
 * Assemble narrated Phase 2 acceptance video without ffmpeg drawtext.
 * Title cards via Playwright PNG → ffmpeg stills; narration via macOS say.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execSync, spawnSync } from "node:child_process";

const ROOT = process.cwd();
const VID = path.join(ROOT, "docs/acceptance-phase2/videos");
const WORK = path.join(ROOT, "docs/acceptance-phase2/raw/video-build");
const COMMIT = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
const FULL_COMMIT = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const RELEASE = `phase2-mvp-m1-${new Date().toISOString().slice(0, 10)}`;
const DEPLOY = "https://ratequip-web.vercel.app";

function sh(cmd, opts = {}) {
  console.log(">", cmd);
  return execSync(cmd, { stdio: "inherit", ...opts });
}

function shOut(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function ensure(p) {
  fs.mkdirSync(p, { recursive: true });
}

function dur(wav) {
  return parseFloat(
    shOut(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wav}"`,
    ),
  );
}

function pickVoice() {
  const listed = spawnSync("say", ["-v", "?"], { encoding: "utf8" }).stdout || "";
  // Prefer newer neural-style US voices, then Samantha (enhanced), then Karen.
  const preferred = [
    "Shelley (English (US))",
    "Sandy (English (US))",
    "Reed (English (US))",
    "Flo (English (US))",
    "Samantha",
    "Karen",
    "Moira",
  ];
  for (const v of preferred) {
    if (listed.includes(v)) return v;
  }
  return "Samantha";
}

function sayClip(id, text) {
  const aiff = path.join(WORK, "audio", `${id}.aiff`);
  const wav = path.join(WORK, "audio", `${id}.wav`);
  const voice = pickVoice();
  console.log(`voice=${voice} clip=${id}`);
  // Slightly slower rate reads more naturally than default robotic pacing.
  spawnSync("say", ["-v", voice, "-r", "165", "-o", aiff, text], {
    stdio: "inherit",
  });
  sh(`afconvert -f WAVE -d LEI16 "${aiff}" "${wav}"`);
  return wav;
}

async function makeCardPng(id, title, subtitle) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0">
  <div style="width:1920px;height:1080px;background:linear-gradient(145deg,#0f3d2e 0%,#163a2c 50%,#0a241c 100%);
    display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Georgia,serif;color:#fff;">
    <div style="font-size:22px;letter-spacing:.18em;text-transform:uppercase;color:#9fc7b5;margin-bottom:28px;">RateQuip Phase 2 Acceptance</div>
    <div style="font-size:56px;font-weight:700;text-align:center;max-width:1600px;line-height:1.15;">${title}</div>
    <div style="font-size:28px;color:#d4e8df;margin-top:28px;text-align:center;max-width:1400px;">${subtitle}</div>
    <div style="position:absolute;bottom:48px;font-size:16px;color:#7aa892;font-family:ui-monospace,monospace;">${COMMIT} · ${DEPLOY}</div>
  </div></body></html>`);
  const out = path.join(WORK, "cards", `${id}.png`);
  await page.screenshot({ path: out, type: "png" });
  await browser.close();
  return out;
}

function cardToVideo(id, seconds) {
  const png = path.join(WORK, "cards", `${id}.png`);
  const mp4 = path.join(WORK, "cards", `${id}.mp4`);
  sh(
    `ffmpeg -y -loop 1 -i "${png}" -t ${seconds} -r 60 -c:v libx264 -pix_fmt yuv420p -vf "scale=1920:1080" "${mp4}"`,
  );
  return mp4;
}

function mux(id, audioId) {
  const mp4 = path.join(WORK, "cards", `${id}.mp4`);
  const wav = path.join(WORK, "audio", `${audioId}.wav`);
  const out = path.join(WORK, "segments", `${id}.mp4`);
  sh(
    `ffmpeg -y -i "${mp4}" -i "${wav}" -c:v copy -c:a aac -shortest "${out}"`,
  );
  return out;
}

function scaleClip(src, dest, maxdur = 0) {
  const t = maxdur > 0 ? `-t ${maxdur}` : "";
  sh(
    `ffmpeg -y -i "${src}" ${t} -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=60,setsar=1" -c:v libx264 -pix_fmt yuv420p -an "${dest}"`,
  );
}

async function main() {
  ensure(path.join(WORK, "audio"));
  ensure(path.join(WORK, "cards"));
  ensure(path.join(WORK, "segments"));

  const narrations = [
    [
      "intro",
      "00_intro",
      "READY FOR CLIENT UAT",
      "Phase 2 MVP Core · Milestone 1",
      "Hi Robin. This is the RateQuip Phase 2 MVP Core acceptance walkthrough. We'll cover what was fixed, show live proof on the production site, and point you to the evidence pack. Please treat this as a guide — final acceptance should rest on your own review.",
    ],
    [
      "repo",
      "01_repo",
      "Repository · Commit · Release",
      `${COMMIT} · ${RELEASE}`,
      `We're on the RateQuip web repository, commit ${COMMIT}, release ${RELEASE}. The live site is ratequip-web.vercel.app. Production health reports demo mode off, with the database connected.`,
    ],
    [
      "auth",
      "02_auth",
      "Authentication",
      "Clerk · Roles · Session gating",
      "Sign-up and sign-in are hosted by Clerk, including email verification, password reset, and multi-factor authentication. RateQuip still enforces its own session checks so private routes and mutations stay protected.",
    ],
    [
      "db",
      "03_db",
      "Database Evidence",
      "Migrate · Seed · Rollback",
      "On the database side, Neon Postgres shows forty-two applied migrations, a populated schema, and seed data. We also demonstrated a safe temporary change and rollback. A full point-in-time restore drill was not repeated in this package.",
    ],
    [
      "company",
      "04_co",
      "Company Management",
      "Create · Claim · Recover",
      "Company create now recovers drafts after a store miss, which closes the old submission-not-found failure. Claim, admin approval, continue, back, and resume are working in the live flow.",
    ],
    [
      "reviews",
      "05_rev",
      "Reviews Lifecycle",
      "Evidence · Moderate · Appeal",
      "Reviews cover evidence upload, admin approve or reject, supplier response, and appeal. The automated review checks all passed.",
    ],
    [
      "rfq",
      "06_rfq",
      "RFQ Marketplace",
      "Validate · Quote · Award",
      "In the RFQ marketplace, bad titles and budgets are rejected. Buyers can create, list, revise, compare quotes, then award or close with an audit trail. Signed-out visitors no longer see owner controls.",
    ],
    [
      "billing",
      "07_bill",
      "Billing & Credits",
      "Checkout · Webhook · Ledger",
      "Billing uses Stripe test mode for checkout and webhooks, including credit grants, a twenty-five credit RFQ debit, refunds, and ledger checks. One note: the long-lived demo wallet still shows a small pre-existing drift, but this smoke run's session net was correct.",
    ],
    [
      "security",
      "08_sec",
      "Security · RBAC · Isolation",
      "Negative tests verified",
      "On security and access control, guest users are blocked from protected dashboards. Unauthenticated refund, procurement, and AI assist calls are rejected, and demo role headers cannot elevate to admin in production.",
    ],
    [
      "tests",
      "09_qa",
      "Automated Tests",
      "Playwright · Lighthouse · Counter",
      "Automated evidence is green: nineteen of nineteen acceptance checks, and thirty-one of thirty-one Playwright tests. Lighthouse reports are included for homepage, dashboard, RFQ, company, profile, and pricing.",
    ],
    [
      "outro",
      "10_end",
      "Final Acceptance Summary",
      "Independent verification requested",
      "Status: ready for client UAT. The original priority blockers are closed on evidence. Please verify independently before written acceptance. Thank you.",
    ],
  ];

  console.log("Narration + title cards...");
  for (const [audioId, cardId, title, subtitle, text] of narrations) {
    const wav = sayClip(audioId, text);
    const seconds = Math.max(6, Math.ceil(dur(wav) + 1));
    await makeCardPng(cardId, title, subtitle);
    cardToVideo(cardId, seconds);
    mux(cardId, audioId);
  }

  console.log("Scaling evidence clips...");
  const clips = [
    ["uat-full-walkthrough.mp4", "uat_main.mp4", 0],
    ["01-signed-out-rfq-controls.mp4", "clip01.mp4", 25],
    ["02-add-company-contacts.mp4", "clip02.mp4", 40],
    ["05-billing-reconciliation.mp4", "clip05.mp4", 35],
    ["07-create-valid-rfq.mp4", "clip07.mp4", 40],
    ["09-submit-review-with-evidence.mp4", "clip09.mp4", 30],
    ["10-admin-moderation-queue.mp4", "clip10.mp4", 30],
    ["12-supplier-quote-builder.mp4", "clip12.mp4", 30],
    ["13-compare-quotes.mp4", "clip13.mp4", 25],
    ["14-pricing-and-checkout.mp4", "clip14.mp4", 25],
    ["19-award-or-close-rfq.mp4", "clip19.mp4", 40],
    ["20-onboarding-roles.mp4", "clip20.mp4", 25],
  ];
  for (const [src, dest, max] of clips) {
    scaleClip(path.join(VID, src), path.join(WORK, "segments", dest), max);
  }

  const order = [
    "00_intro.mp4",
    "01_repo.mp4",
    "02_auth.mp4",
    "clip20.mp4",
    "03_db.mp4",
    "04_co.mp4",
    "clip02.mp4",
    "05_rev.mp4",
    "clip09.mp4",
    "clip10.mp4",
    "06_rfq.mp4",
    "clip07.mp4",
    "clip12.mp4",
    "clip13.mp4",
    "clip19.mp4",
    "clip01.mp4",
    "07_bill.mp4",
    "clip14.mp4",
    "clip05.mp4",
    "08_sec.mp4",
    "09_qa.mp4",
    "uat_main.mp4",
    "10_end.mp4",
  ];

  const listPath = path.join(WORK, "concat.txt");
  fs.writeFileSync(
    listPath,
    order
      .map((f) => `file '${path.join(WORK, "segments", f)}'`)
      .join("\n") + "\n",
  );

  const out = path.join(VID, "phase2-acceptance-narrated.mp4");
  console.log("Concatenating...");
  sh(
    `ffmpeg -y -f concat -safe 0 -i "${listPath}" -c:v libx264 -r 60 -pix_fmt yuv420p -c:a aac -movflags +faststart "${out}"`,
  );
  sh(
    `ffprobe -v error -show_entries format=duration,size -show_streams -select_streams v:0 -of default=noprint_wrappers=1 "${out}"`,
  );
  console.log("DONE", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
