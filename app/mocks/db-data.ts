import { factory, primaryKey, drop } from "@mswjs/data";
import { TEST_DEVICE_NAME } from "./evolver";

/**
 * Create a mock database using mswjs/data
 * This is wrapped by the mock prisma client.
 */
export const db = factory({
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

// Initialize the database with seed data when this module is imported
// This ensures the database is ready for the mockPrismaClient

// Clear any existing data
drop(db);

// Add our test device
db.device.create({
  id: "test-id",
  url: "http://127.0.0.1:8080",
  device_id: "test-device-id",
  name: TEST_DEVICE_NAME,
});
