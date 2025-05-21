import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton.server";
import { mockPrismaClient } from "../mocks/prisma";
import { initMockDB, mockDB } from "../mocks/db";

// Hard-code a unique key, in this case "prisma", so we can look up the client when this module gets re-imported, by the dev server in this case.
// Singleton basically stores the db module as a singleton in the global scope (i.e. that scope which persists between app-bundle re-imports (dev server restarts))

// Use the mock database in test mode, real database otherwise
export const db = singleton("prisma", () => {
  if (process.env.NODE_ENV === "test") {
    // Init the mock database - note that this closure is a singleton
    const mockedDatabase = initMockDB(mockDB);
    return mockPrismaClient(mockedDatabase);
  }

  // Use real Prisma client for non-test environments
  return new PrismaClient();
});
