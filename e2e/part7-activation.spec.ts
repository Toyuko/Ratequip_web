import { test, expect } from "playwright/test";

/**
 * Part 7 UI smoke — does not replace Phase 2 acceptance.
 * Runs against whatever BASE_URL Playwright is configured for.
 * When ENTERPRISE_PART7_ENABLED is off, the DNA panel is simply absent.
 */
test.describe("Part 7 activation overlay", () => {
  test("activation page renders company setup shell", async ({ page }) => {
    await page.goto("/v12/activation");
    await expect(
      page.getByRole("heading", { name: /set up your company with ai/i }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.getByText(/guided set of questions/i)).toBeVisible();
  });

  test("v13 enterprise index is reachable", async ({ page }) => {
    await page.goto("/v13");
    await expect(
      page.getByRole("heading", { name: /enterprise archive integration/i }),
    ).toBeVisible({ timeout: 30000 });
  });
});
