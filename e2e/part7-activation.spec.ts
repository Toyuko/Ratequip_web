import { test, expect } from "playwright/test";

/**
 * Part 7 UI smoke — does not replace Phase 2 acceptance.
 * The legacy `/v12/activation` AI interview is disabled; visitors are redirected
 * to a role dashboard. V13 index remains the enterprise overlay entry point.
 */
test.describe("Part 7 activation overlay", () => {
  test("legacy activation interview redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/v12/activation");
    await expect(page).toHaveURL(/\/dashboard(\/|$)/, { timeout: 30000 });
  });

  test("v13 enterprise index is reachable", async ({ page }) => {
    await page.goto("/v13");
    await expect(
      page.getByRole("heading", { name: /enterprise archive integration/i }),
    ).toBeVisible({ timeout: 30000 });
  });
});
