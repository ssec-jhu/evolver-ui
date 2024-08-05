/// <reference types="vite/client" />
/// <reference types="vitest" />

import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    reporters: ["default", "json"],
    outputFile: {
      json: "./vitest-report/vitest-report-output.json",
    },
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setupViteTests.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: [...configDefaults.exclude, "**/integration/**"],
    coverage: {
      reportsDirectory: "./vitest-report/coverage",
      reporter: ["html"],
      include: ["app/**/*.{ts,tsx}"],
      exclude: [
        "app/entry.server.tsx",
        "app/entry.client.tsx",
        "**/__tests__/**",
        "**/mocks/**",
      ],
      all: true,
    },
  },
});
