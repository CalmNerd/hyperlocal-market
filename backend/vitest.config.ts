import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Sequential so tests sharing one DB don't race each other.
    fileParallelism: false,
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 30000,
  },
});
