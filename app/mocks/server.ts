import { setupServer } from "msw/node";
import { handlers } from "./evolver";

export const server = setupServer(...handlers);
