import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";
import { seedDatabase } from "./db-data";

// Initialize the test database with seed data
// Since the DB mock is a singleton, we can just call this once
if (process.env.NODE_ENV === "test") {
  seedDatabase();
}

// see app/entry.client.ts for the worker.start() call
export const worker = setupWorker(...handlers);
