import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";
import { seedDatabase } from "./db-data";

// Initialize the test database with seed data
if (process.env.NODE_ENV === "test") {
  seedDatabase();
}

export const worker = setupWorker(...handlers);
