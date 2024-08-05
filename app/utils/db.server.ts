import { PrismaClient } from "@prisma/client";
import { singleton } from "./singleton.server";

// Hard-code a unique key, in this case "prisma", so we can look up the client when this module gets re-imported, by the dev server in this case.
// Singleton basically stores the db module as a singleton in the global scope (i.e. that scope which persists between app-bundle re-imports (dev server restarts))
export const db = singleton("prisma", () => new PrismaClient());
