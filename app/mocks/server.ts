import { setupServer } from "msw/node";
import { handlers } from "./evolver";

// Note: not included here because it's not a HTTP mock - but to be aware of:
// the DB is mocked using the prisma mock, see mocks/app/utils/db.server.ts
// that in-memory mocked database is wrapped in the singleton util there to ensure the same db client is used across the tests
export const server = setupServer(...handlers);
