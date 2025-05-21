import { test, expect } from "@playwright/test";
import { TEST_DEVICE_NAME } from "~/mocks/evolver";

test("devices route renders the device list page", async ({ page }) => {
  // Navigate to the devices route
  await page.goto("/devices/list", { waitUntil: "load" });

  // Verify URL is correct
  expect(page.url()).toBe("http://localhost:50123/devices/list");

  // Check if the breadcrumb is present
  const breadcrumb = await page.getByRole("link", { name: "devices" });
  await expect(breadcrumb).toBeVisible();

  // Verify the breadcrumb links back to /devices/list
  const breadcrumbHref = await breadcrumb.getAttribute("href");
  expect(breadcrumbHref).toBe("/devices/list");

  // Check for the "Add" button
  const addButton = await page.getByRole("button", { name: "Add" });
  await expect(addButton).toBeVisible();

  // Check for the URL input field
  const urlInput = await page.getByPlaceholder("url address");
  await expect(urlInput).toBeVisible();

  // Check for the table with our mock device
  const table = await page.locator("table");
  await expect(table).toBeVisible();

  // Verify our test device is in the table
  const deviceLink = await page.getByRole("link", { name: TEST_DEVICE_NAME });
  await expect(deviceLink).toBeVisible();
  // Verify the device status is online
  const statusBadge = await page.getByText("online", { exact: true });
  await expect(statusBadge).toBeVisible();
});

test("adding a new device works correctly", async ({ page }) => {
  const NEW_DEVICE_URL = "http://www.testurl.com:8080";
  // Navigate to the devices route
  await page.goto("/devices/list", { waitUntil: "load" });

  // Add a new device with a different URL
  // Prisma Mock Client will handle this (MSW data api under the hood)
  await page.getByPlaceholder("url address").fill(NEW_DEVICE_URL);
  await page.getByRole("button", { name: "Add" }).click();

  // Wait for navigation to complete
  await page.waitForURL(/\/devices\/.*\/.*\/state/);

  // Verify we're on the device detail page
  expect(page.url()).toMatch(/\/devices\/.*\/.*\/state/);

  // Navigate back to devices list
  await page.getByRole("link", { name: "devices" }).click();

  // Verify our test device is in the table
  const newDeviceUrl = await page.getByRole("link", { name: NEW_DEVICE_URL });
  await expect(newDeviceUrl).toBeVisible();
});

test("device detail page and tab navigation", async ({ page }) => {
  // First navigate to devices page
  await page.goto("/devices/list", { waitUntil: "load" });

  // Click on our pre-seeded mock device
  await page.getByRole("link", { name: TEST_DEVICE_NAME }).click();

  // Wait for navigation to complete - should be redirected to the state tab
  await page.waitForURL(/\/devices\/.*\/.*\/state/);

  // Check if we're on a device detail page
  expect(page.url()).toMatch(/\/devices\/.*\/.*\/state/);

  // Verify device name is displayed in the breadcrumb
  const breadcrumbDeviceName = await page.getByRole("link", { name: TEST_DEVICE_NAME });
  await expect(breadcrumbDeviceName).toBeVisible();

  // Check for API and network links
  const apiLink = await page.getByRole("link", { name: "api" });
  const networkLink = await page.getByRole("link", { name: "network" });
  await expect(apiLink).toBeVisible();
  await expect(networkLink).toBeVisible();

  // Check for status badge
  const onlineBadge = await page.getByText("online", { exact: true });
  await expect(onlineBadge).toBeVisible();

  // Check for navigation tabs
  const stateTabs = page.getByRole("tablist");
  await expect(stateTabs).toBeVisible();

  // Verify all tabs are present
  const stateTab = await page.getByRole("tab", { name: "state" });
  const configTab = await page.getByRole("tab", { name: "configuration" });
  const hardwareTab = await page.getByRole("tab", { name: "hardware" });
  const experimentsTab = await page.getByRole("tab", { name: "experiments" });

  await expect(stateTab).toBeVisible();
  await expect(configTab).toBeVisible();
  await expect(hardwareTab).toBeVisible();
  await expect(experimentsTab).toBeVisible();

  // Verify state tab is active by default
  await expect(stateTab).toHaveClass(/tab-active/);

  // Click config tab and verify URL and active state changes
  await configTab.click();
  await page.waitForURL(/\/devices\/.*\/.*\/config/);
  await expect(configTab).toHaveClass(/tab-active/);
  await expect(stateTab).not.toHaveClass(/tab-active/);

  // Click hardware tab and verify URL and active state changes
  await hardwareTab.click();
  await page.waitForURL(/\/devices\/.*\/.*\/hardware/);
  await expect(hardwareTab).toHaveClass(/tab-active/);
  await expect(configTab).not.toHaveClass(/tab-active/);

  // Click experiments tab and verify URL and active state changes
  await experimentsTab.click();
  await page.waitForURL(/\/devices\/.*\/.*\/experiments/);
  await expect(experimentsTab).toHaveClass(/tab-active/);
  await expect(hardwareTab).not.toHaveClass(/tab-active/);

  // Navigate back to state tab
  await stateTab.click();
  await page.waitForURL(/\/devices\/.*\/.*\/state/);
  await expect(stateTab).toHaveClass(/tab-active/);
  await expect(experimentsTab).not.toHaveClass(/tab-active/);
});
