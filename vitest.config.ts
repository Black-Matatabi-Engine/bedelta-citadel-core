import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/services/risk-control.ts"],
      exclude: ["**/*.d.ts"],
      reporter: ["text", "json-summary"],
      thresholds: {
        lines: 90,
        functions: 100,
        branches: 70,
        statements: 90,
      },
    },
  },
});
