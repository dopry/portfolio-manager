import { defineConfig } from "vitest/config";

// Explicit opt-in suite for the live ESPM environment. This is deliberately
// separate from the default npm test suite and credential-free CI matrix
// because it writes a constructionStatus=Test fixture to the authenticated
// account in the live environment.
export default defineConfig({
  test: {
    globals: true,
    include: ["test/live-env/**/*.live-env.spec.ts"],
    testTimeout: 120000,
    hookTimeout: 120000,
    fileParallelism: false,
  },
});
