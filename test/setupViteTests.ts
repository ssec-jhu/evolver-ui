import "dotenv/config";
import "~/utils/env.server";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "~/mocks/server";

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: "bypass" });
});

afterEach(() => {
  vi.resetAllMocks();
  server.resetHandlers();
  cleanup();
});

afterAll(() => {
  server.close();
});

// Mock modules for server components
vi.mock("~/utils/evolverClient.server", () => {
  return {
    getEvolverClientForDevice: vi.fn().mockImplementation(async (deviceId) => {
      if (deviceId === "test-device-id") {
        return {
          evolverClient: {
            health: {
              getHealthz: async () => ({ status: 200 }),
            },
            // Add other API endpoints as needed
          },
          url: "http://127.0.0.1:8080",
        };
      }
      throw new Error("Device not found");
    }),
  };
});

// Mock the database
vi.mock("~/utils/db.server", () => {
  const mockDevice = {
    device_id: "test-device-id",
    name: "Test Device",
    url: "http://127.0.0.1:8080",
    created_at: new Date(),
    updated_at: new Date(),
  };

  return {
    db: {
      device: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.device_id === "test-device-id") {
            return Promise.resolve(mockDevice);
          }
          return Promise.resolve(null);
        }),
        findMany: vi.fn().mockResolvedValue([mockDevice]),
        // Add other methods as needed
      },
      // Add other models as needed
    },
  };
});