import "dotenv/config";
import "~/utils/env.server";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

beforeAll(() => {});
afterEach(() => {});
afterEach(() => cleanup());
afterAll(() => {});
