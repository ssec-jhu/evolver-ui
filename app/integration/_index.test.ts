import { test, expect } from "@playwright/test";

test("redirects to devices list", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  // Wait for the redirect to complete
  await page.waitForURL("**/devices/list", { timeout: 5000 });

  expect(page.url()).toBe(`http://localhost:50123/devices/list`);
});
