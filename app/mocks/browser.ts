import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";
import { db as mockDb } from "../utils/db.server";

// The mockPrismaClient is automatically used in test mode
// No need to explicitly seed the database here as it will be
// handled by the mockPrismaClient

// see app/entry.client.ts for the worker.start() call
export const worker = setupWorker(...handlers);
