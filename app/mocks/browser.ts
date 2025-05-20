import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";
import { seedDatabase } from "./db-data";

// Initialize the test database with seed data
if (process.env.NODE_ENV === "test") {
  seedDatabase();
  
  // Enable browser console logging for MSW in test mode
  if (typeof window !== 'undefined') {
    // @ts-ignore - Add to window for debugging purposes
    window.msw = { handlers };
    console.log('MSW debug mode enabled');
  }
}

export const worker = setupWorker(...handlers);
