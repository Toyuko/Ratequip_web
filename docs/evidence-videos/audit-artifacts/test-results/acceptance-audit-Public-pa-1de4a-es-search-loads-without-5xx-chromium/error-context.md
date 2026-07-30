# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: acceptance-audit.spec.ts >> Public pages smoke >> companies-search loads without 5xx
- Location: e2e/acceptance-audit.spec.ts:59:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_CLOSED at https://ratequip-web.vercel.app/companies/search
Call log:
  - navigating to "https://ratequip-web.vercel.app/companies/search", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | /**
  2   |  * Acceptance audit Playwright suite — generated for Phase 6 QA audit.
  3   |  * Targets production by default; override with EVIDENCE_BASE_URL.
  4   |  */
  5   | import { test, expect, type Page } from "playwright/test";
  6   | import fs from "node:fs";
  7   | import path from "node:path";
  8   | 
  9   | const BASE =
  10  |   process.env.EVIDENCE_BASE_URL ?? "https://ratequip-web.vercel.app";
  11  | 
  12  | const ARTIFACTS = path.join(
  13  |   process.cwd(),
  14  |   "docs/evidence-videos/audit-artifacts",
  15  | );
  16  | 
  17  | function ensureArtifactsDir() {
  18  |   fs.mkdirSync(ARTIFACTS, { recursive: true });
  19  | }
  20  | 
  21  | async function capture(page: Page, name: string) {
  22  |   ensureArtifactsDir();
  23  |   await page.screenshot({
  24  |     path: path.join(ARTIFACTS, `${name}.png`),
  25  |     fullPage: true,
  26  |   });
  27  | }
  28  | 
  29  | const PUBLIC_PAGES = [
  30  |   { path: "/", name: "home" },
  31  |   { path: "/pricing", name: "pricing" },
  32  |   { path: "/suppliers", name: "suppliers" },
  33  |   { path: "/categories", name: "categories" },
  34  |   { path: "/search", name: "search" },
  35  |   { path: "/requests", name: "requests" },
  36  |   { path: "/about", name: "about" },
  37  |   { path: "/contact", name: "contact" },
  38  |   { path: "/companies/search", name: "companies-search" },
  39  |   { path: "/v12", name: "v12" },
  40  |   { path: "/sign-in", name: "sign-in" },
  41  |   { path: "/sign-up", name: "sign-up" },
  42  | ];
  43  | 
  44  | const PROTECTED_PAGES = [
  45  |   { path: "/dashboard/buyer", name: "dashboard-buyer" },
  46  |   { path: "/dashboard/supplier", name: "dashboard-supplier" },
  47  |   { path: "/dashboard/admin", name: "dashboard-admin" },
  48  |   { path: "/requests/new", name: "requests-new" },
  49  |   { path: "/reviews/new", name: "reviews-new" },
  50  |   { path: "/onboarding", name: "onboarding" },
  51  |   { path: "/companies/claim", name: "companies-claim" },
  52  |   { path: "/companies/add/details", name: "companies-add" },
  53  |   { path: "/quotes/compare", name: "quotes-compare" },
  54  |   { path: "/v12/procurement", name: "v12-procurement" },
  55  | ];
  56  | 
  57  | test.describe("Public pages smoke", () => {
  58  |   for (const pageDef of PUBLIC_PAGES) {
  59  |     test(`${pageDef.name} loads without 5xx`, async ({ page }) => {
  60  |       const consoleErrors: string[] = [];
  61  |       page.on("console", (msg) => {
  62  |         if (msg.type() === "error") consoleErrors.push(msg.text());
  63  |       });
  64  |       const failed: string[] = [];
  65  |       page.on("response", (res) => {
  66  |         if (res.status() >= 500) failed.push(`${res.status()} ${res.url()}`);
  67  |       });
  68  | 
> 69  |       const response = await page.goto(`${BASE}${pageDef.path}`, {
      |                                   ^ Error: page.goto: net::ERR_CONNECTION_CLOSED at https://ratequip-web.vercel.app/companies/search
  70  |         waitUntil: "domcontentloaded",
  71  |         timeout: 60_000,
  72  |       });
  73  |       expect(response, `no response for ${pageDef.path}`).toBeTruthy();
  74  |       expect(response!.status(), `${pageDef.path} status`).toBeLessThan(500);
  75  |       await capture(page, `public-${pageDef.name}`);
  76  |       expect(failed, `5xx on ${pageDef.path}: ${failed.join(", ")}`).toEqual(
  77  |         [],
  78  |       );
  79  |       // Soft: log console errors into artifact rather than hard-fail marketing pages
  80  |       fs.writeFileSync(
  81  |         path.join(ARTIFACTS, `console-${pageDef.name}.json`),
  82  |         JSON.stringify({ path: pageDef.path, consoleErrors }, null, 2),
  83  |       );
  84  |     });
  85  |   }
  86  | });
  87  | 
  88  | test.describe("Protected routes deny guests", () => {
  89  |   for (const pageDef of PROTECTED_PAGES) {
  90  |     test(`${pageDef.name} blocks unauthenticated access`, async ({ page }) => {
  91  |       const response = await page.goto(`${BASE}${pageDef.path}`, {
  92  |         waitUntil: "domcontentloaded",
  93  |         timeout: 60_000,
  94  |       });
  95  |       expect(response).toBeTruthy();
  96  |       const status = response!.status();
  97  |       const url = page.url();
  98  |       await capture(page, `protected-${pageDef.name}`);
  99  |       const blocked =
  100 |         status === 404 ||
  101 |         status === 401 ||
  102 |         status === 302 ||
  103 |         status === 303 ||
  104 |         status === 307 ||
  105 |         url.includes("sign-in") ||
  106 |         url.includes("clerk") ||
  107 |         // Local demo without Clerk secret: proxy is a no-op; treat as soft skip
  108 |         // when health reports demoMode and page still loads (covered by API probes).
  109 |         false;
  110 |       // Soften: if page loaded 200 and is not sign-in, still pass when BASE is local demo
  111 |       // by requiring either block OR (local and API gates cover auth).
  112 |       const health = await page.request.get(`${BASE}/api/v1/health`);
  113 |       const healthBody = await health.json();
  114 |       const localDemo = Boolean(healthBody?.data?.demoMode);
  115 |       expect(
  116 |         blocked || localDemo,
  117 |         `Expected guest block for ${pageDef.path}, got ${status} @ ${url}`,
  118 |       ).toBeTruthy();
  119 |     });
  120 |   }
  121 | });
  122 | 
  123 | test.describe("API security probes", () => {
  124 |   test("health reports demoMode status", async ({ request }) => {
  125 |     const res = await request.get(`${BASE}/api/v1/health`);
  126 |     expect(res.status()).toBe(200);
  127 |     const body = await res.json();
  128 |     expect(body.data.status).toBe("ok");
  129 |     expect(typeof body.data.demoMode).toBe("boolean");
  130 |     expect(typeof body.data.database).toBe("boolean");
  131 |   });
  132 | 
  133 |   test("X-Demo-Role cannot elevate to admin without allowlist path", async ({
  134 |     request,
  135 |   }) => {
  136 |     const me = await request.get(`${BASE}/api/v1/me`, {
  137 |       headers: { "X-Demo-Role": "admin" },
  138 |     });
  139 |     expect(me.status()).toBe(200);
  140 |     const meBody = await me.json();
  141 |     // In production (demoMode=false): unauthenticated.
  142 |     // In demo: header cannot grant admin (product role only) — expect buyer or null.
  143 |     if (meBody.data?.authenticated && meBody.data?.user) {
  144 |       expect(meBody.data.user.role).not.toBe("admin");
  145 |     }
  146 |   });
  147 | 
  148 |   test("unauthenticated refund is rejected", async ({ request }) => {
  149 |     const res = await request.post(`${BASE}/api/v1/billing/refund`, {
  150 |       data: { amount: 1, reason: "audit probe" },
  151 |     });
  152 |     // Anonymous (no demo session header/cookies) must not mint credits.
  153 |     expect([401, 403]).toContain(res.status());
  154 |   });
  155 | 
  156 |   test("V12 procurement requires authentication", async ({ request }) => {
  157 |     const res = await request.get(`${BASE}/api/v1/v12/procurement`);
  158 |     expect([401, 403]).toContain(res.status());
  159 |   });
  160 | 
  161 |   test("V12 procurement rejects unauthenticated create", async ({
  162 |     request,
  163 |   }) => {
  164 |     const res = await request.post(`${BASE}/api/v1/v12/procurement`, {
  165 |       data: {
  166 |         action: "create",
  167 |         title: "Playwright audit requisition",
  168 |         description: "Created by acceptance audit — unauthorized write probe",
  169 |       },
```