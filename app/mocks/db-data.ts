import { factory, primaryKey, drop } from "@mswjs/data";
import { TEST_DEVICE_NAME } from "./evolver";

export const mockDB = factory({
  // Define the Device model based on our Prisma schema
  device: {
    id: primaryKey(String),
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
    url: String,
    device_id: String,
    name: String,
  },
});

export type TMockDB = typeof mockDB;

// Returns a distinct mock database instance, ensure it's only called once (see the singleton helper)
// otherwise tests could use different mocked database.
export function initMockDB(mockDB: TMockDB): TMockDB {
  // Clear any existing data
  drop(mockDB);

  // Seed the test device
  mockDB.device.create({
    id: "test-id",
    url: "http://127.0.0.1:8080",
    device_id: "test-device-id",
    name: TEST_DEVICE_NAME,
  });
  return mockDB;
}
