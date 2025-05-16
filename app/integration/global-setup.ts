/**
 * This file can be used for global setup before running integration tests.
 * It would need to be referenced in the playwright.config.ts file.
 * 
 * Example usage in playwright.config.ts:
 * ```
 * globalSetup: './app/integration/global-setup.ts',
 * ```
 */

import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
  console.log('Running global setup for integration tests...');
  
  // Example: Use a test-specific database file for integration tests
  // If you wanted to implement this approach, you would:
  // 1. Check if a test database exists and delete it if it does
  // 2. Create a new empty database file or copy a template
  // 3. Set process.env.DATABASE_URL to point to the test database
  
  // Example implementation (commented out as it's not currently used):
  /*
  const testDbPath = path.join(process.cwd(), 'prisma/test.db');
  
  // Remove existing test database if it exists
  if (fs.existsSync(testDbPath)) {
    console.log('Removing existing test database...');
    fs.unlinkSync(testDbPath);
  }
  
  // Create or copy template database
  console.log('Creating fresh test database...');
  // fs.copyFileSync(path.join(process.cwd(), 'prisma/template.db'), testDbPath);
  
  // Set environment variable to use the test database
  process.env.DATABASE_URL = `file:${testDbPath}`;
  */
  
  // Bootstrap test data using browser automation
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Example: Add a test device through the UI
  // This is an alternative to the setup.test.ts approach
  /*
  await page.goto('http://localhost:50123/devices');
  
  // Check if test device already exists
  const deviceExists = await page
    .locator('table a[href*="127.0.0.1:8080"]')
    .count()
    .then(count => count > 0);
  
  if (!deviceExists) {
    console.log('Adding test device during setup...');
    await page.getByPlaceholder('url address').fill('http://127.0.0.1:8080');
    await page.getByRole('button', { name: 'Add' }).click();
    await page.waitForURL(/\/devices\/.*\/.*\/state/);
  }
  */
  
  await browser.close();
  console.log('Global setup complete.');
}

export default globalSetup;