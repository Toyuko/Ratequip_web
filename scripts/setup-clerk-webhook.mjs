#!/usr/bin/env node
/**
 * Ensure a Clerk→Svix webhook endpoint exists for production and print the signing secret.
 * Requires CLERK_SECRET_KEY and Playwright (chromium).
 *
 * Usage: node --env-file=.env.local scripts/setup-clerk-webhook.mjs
 */
import { chromium } from "playwright";
import fs from "node:fs";

const ENDPOINT_URL =
  process.env.CLERK_WEBHOOK_URL ??
  "https://ratequip-web.vercel.app/api/webhooks/clerk";

async function clerkJson(path, method = "GET", body) {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) throw new Error("CLERK_SECRET_KEY is required");
  const res = await fetch(`https://api.clerk.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : method === "POST" ? "{}" : undefined,
  });
  const text = await res.text();
  if (!res.ok && !(res.status === 400 && text.includes("svix_app_exists"))) {
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : {};
}

async function portalUrl() {
  try {
    await clerkJson("/webhooks/svix", "POST", {});
  } catch {
    /* exists */
  }
  const { svix_url } = await clerkJson("/webhooks/svix_url", "POST", {});
  return svix_url;
}

async function main() {
  const svixUrl = await portalUrl();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(45_000);
  await page.goto(svixUrl, { waitUntil: "domcontentloaded", timeout: 90_000 });
  await page.waitForSelector("text=Endpoints", { timeout: 30_000 });
  await page.waitForTimeout(1500);

  const existing = page.getByText(ENDPOINT_URL).first();
  if (await existing.isVisible().catch(() => false)) {
    await existing.click();
  } else {
    await page
      .locator("a, button")
      .filter({ hasText: /add endpoint/i })
      .first()
      .click();
    await page.waitForURL(/\/endpoints\/new/);
    await page.locator('input[name="url"]').fill(ENDPOINT_URL);
    for (const id of ["filterTypes-user.created", "filterTypes-user.updated"]) {
      await page.locator(`#${id}`).check({ force: true }).catch(() => {});
    }
    await page.getByRole("button", { name: /^create$/i }).click();
    await page.waitForURL(/\/endpoints\/ep_/, { timeout: 30_000 });
  }

  await page.waitForTimeout(1500);
  const reveal = page.getByText(/signing secret/i).locator("xpath=ancestor::div[1]//button").first();
  if (await reveal.count()) await reveal.click().catch(() => {});
  await page.waitForTimeout(400);

  const html = await page.content();
  const match = html.match(/whsec_[A-Za-z0-9+/=_-]+/);
  if (!match) {
    const body = await page.locator("body").innerText();
    throw new Error(`Signing secret not found.\n${body.slice(0, 1500)}`);
  }

  const secret = match[0];
  console.log("CLERK_WEBHOOK_SECRET=" + secret);
  console.log("CLERK_WEBHOOK_SIGNING_SECRET=" + secret);
  fs.writeFileSync("/tmp/clerk-webhook-secret.txt", secret);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
