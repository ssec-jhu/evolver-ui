import { factory, primaryKey, drop } from "@mswjs/data";

// Create a factory for our mock database
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

// Seed the database with initial data
export function seedDatabase() {
  // Clear any existing data
  drop(db);

  // Add our test device
  db.device.create({
    id: "test-id",
    url: "http://127.0.0.1:8080",
    device_id: "test-device-id",
    name: "Test Evolver Device",
  });

  console.log("Mock database seeded with test device");
}

// Initialize the database
seedDatabase();
