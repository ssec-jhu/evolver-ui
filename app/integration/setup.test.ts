import { test, expect } from "@playwright/test";
import { TEST_DEVICE_NAME } from "~/mocks/evolver";

/**
 * This test verifies that our mock database and MSW setup is working correctly.
 * It ensures our test device is available in the devices list.
 */
test("verify: mock database is working", async ({ page }) => {
  // Set this test to run first by giving it top priority
  test.slow();

  // Navigate to the devices route
  await page.goto("/devices/list", { waitUntil: "load" });

  // Verify our test device is in the table
  const deviceLink = await page.locator("table td a", {
    hasText: TEST_DEVICE_NAME,
  });
  await expect(deviceLink).toBeVisible();
});
