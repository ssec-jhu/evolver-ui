import { singleton } from "./singleton.server";
import { mockPrismaClient } from "../mocks/prisma-mock";

/**
 * This module provides a test version of the database client
 * It's used in test mode to provide a consistent, isolated test environment
 */
export const db = singleton("prisma-test", () => mockPrismaClient);