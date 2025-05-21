import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton.server";
import { mockPrismaClient } from "../mocks/prisma-mock";
import { initMockDB, mockDB } from "../mocks/db-data";

// Hard-code a unique key, in this case "prisma", so we can look up the client when this module gets re-imported, by the dev server in this case.
// Singleton basically stores the db module as a singleton in the global scope (i.e. that scope which persists between app-bundle re-imports (dev server restarts))

// Use the mock database in test mode, real database otherwise
export const db = singleton("prisma", () => {
  // Check if we're in test mode
  if (process.env.NODE_ENV === "test") {
    // init the mock database - note that this closure is a singleton
    // ensuring we only init (and therefore drop db and seed the mock db) once, regardless of how many times the db module is imported
    const mockedDatabase = initMockDB(mockDB);
    return mockPrismaClient(mockedDatabase);
  }

  // Use real Prisma client for non-test environments
  return new PrismaClient();
});
