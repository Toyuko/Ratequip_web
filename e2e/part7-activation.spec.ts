import { test, expect } from "playwright/test";

/**
 * V12 UI is gated off for product users (see `V12_UI_ENABLED`).
 * Visitors to any `/v12/*` route should land on a role dashboard.
 */
test.describe("V12 overlay gate", () => {
  test("legacy activation interview redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/v12/activation");
    await expect(page).toHaveURL(/\/dashboard(\/|$)/, { timeout: 30000 });
  });

  test("v12 hub redirects to dashboard", async ({ page }) => {
    await page.goto("/v12");
    await expect(page).toHaveURL(/\/dashboard(\/|$)/, { timeout: 30000 });
  });

  test("v13 enterprise index is reachable", async ({ page }) => {
    await page.goto("/v13");
    await expect(
      page.getByRole("heading", { name: /enterprise archive integration/i }),
    ).toBeVisible({ timeout: 30000 });
  });
});
