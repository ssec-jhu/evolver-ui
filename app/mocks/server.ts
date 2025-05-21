import { setupServer } from "msw/node";
import { handlers } from "./evolver";

import { seedDatabase } from "./db-data";

// Initialize the test database with seed data
// Since the DB mock is a singleton, we can just call this once
if (process.env.NODE_ENV === "test") {
  seedDatabase();
}
// Note: not included here because it's not a HTTP mock - but to be aware of:
// the DB is mocked using the prisma mock, see app/utils/db.server.ts
export const server = setupServer(...handlers);
