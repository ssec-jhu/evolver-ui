import { vi } from "vitest";

// Create a mock client with health check and any other methods you need
const mockEvolverClient = {
  health: {
    getHealthz: vi.fn().mockResolvedValue({
      status: 200,
    }),
  },
  // Add other API methods as needed
};

// Mock for the getEvolverClientForDevice function
export const mockGetEvolverClientForDevice = vi.fn().mockResolvedValue({
  evolverClient: mockEvolverClient,
  url: "http://127.0.0.1:8080",
});

// Export the mocked client for direct usage in tests if needed
export { mockEvolverClient };
