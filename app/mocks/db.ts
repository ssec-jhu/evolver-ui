import { vi } from "vitest";

// Mock device database with a default device
const mockDevices = [
  {
    device_id: "test-device-id",
    name: "Test Device",
    url: "http://127.0.0.1:8080",
    created_at: new Date(),
    updated_at: new Date(),
  }
];

// Create mock DB client
export const mockDb = {
  device: {
    findUnique: vi.fn().mockImplementation(({ where }) => {
      const device = mockDevices.find(d => d.device_id === where.device_id);
      return Promise.resolve(device || null);
    }),
    findMany: vi.fn().mockResolvedValue(mockDevices),
    create: vi.fn().mockImplementation(({ data }) => {
      const newDevice = { ...data, created_at: new Date(), updated_at: new Date() };
      mockDevices.push(newDevice);
      return Promise.resolve(newDevice);
    }),
    // Add other methods as needed
  },
  // Add other models as needed
};

// Helper to reset the mock database to default state
export function resetMockDb() {
  mockDevices.length = 0;
  mockDevices.push({
    device_id: "test-device-id",
    name: "Test Device",
    url: "http://127.0.0.1:8080",
    created_at: new Date(),
    updated_at: new Date(),
  });
}