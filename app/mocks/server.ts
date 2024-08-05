import { setupServer } from "msw/node";
import { handlers } from "./evolver.js";

export const server = setupServer(...handlers);
