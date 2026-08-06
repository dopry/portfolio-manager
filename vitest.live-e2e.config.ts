import { defineConfig } from "vitest/config";

// End-to-end suite contained within the live ESPM environment. This is
// deliberately separate from the default npm test suite and credential-free
// CI matrix because it mutates persistent fixtures in an authenticated account.
export default defineConfig({
  test: {
    globals: true,
    include: ["test/live-e2e/**/*.live-e2e.spec.ts"],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false,
  },
});
