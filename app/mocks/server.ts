import { setupServer } from "msw/node";
import { handlers } from "./evolver";

// Note: not included here because it's not a HTTP mock - but to be aware of:
// the DB is mocked using the prisma mock, see app/utils/db.server.ts
export const server = setupServer(...handlers);
