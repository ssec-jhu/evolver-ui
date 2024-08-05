import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";

export const worker = setupWorker(...handlers);
