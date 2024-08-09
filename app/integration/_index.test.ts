import { test, expect } from "@playwright/test";

test("redirects to devices list", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  expect(page.url()).toBe(`http://localhost:50123/devices/list`);
});
