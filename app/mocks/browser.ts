import { setupWorker } from "msw/browser";
import { handlers } from "./evolver";

// see app/entry.client.ts for the worker.start() call
export const worker = setupWorker(...handlers);
