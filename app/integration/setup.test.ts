import { test, expect } from "@playwright/test";
import { db } from "../mocks/db-data";
import { TEST_DEVICE_NAME } from "~/mocks/evolver";

/**
 * This test verifies that our mock database and MSW setup is working correctly.
 * It ensures our test device is available in the devices list.
 */
test("verify: mock database is working", async ({ page }, testInfo) => {
  // Set this test to run first by giving it top priority
  test.slow();

  // Navigate to the devices route
  await page.goto("/devices/list", { waitUntil: "load" });

  // Verify that we can see our mocked device name
  await expect(page.getByText(TEST_DEVICE_NAME)).toBeVisible();
});

/**
 * Note about database persistence:
 *
 * We're now using @mswjs/data to create an in-memory mock database.
 * This means:
 * 1. The database is reset for each test run
 * 2. We're not touching the actual SQLite database file
 * 3. Tests are completely isolated and won't affect each other or development data
 * 4. The mock database is pre-seeded with test data in app/mocks/db-data.ts
 */
