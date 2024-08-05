import { test, expect } from "@playwright/test";

test("redirects to local device ", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  expect(page.url()).toBe(`http://localhost:50123/device/127.0.0.1`);
});
