import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 120_000,
    silent: "passed-only",
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    exclude: [
      "build",
      "node_modules",
    ]
  },
});
