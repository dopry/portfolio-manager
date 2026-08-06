import { defineConfig } from "vitest/config";

// End-to-end connection/sharing suite contained within wstest/pmtest. Kept out
// of the default `vitest run` because it drives the ESPM test web UI with
// Playwright and mutates shared, stateful test accounts.
export default defineConfig({
  test: {
    globals: true,
    include: ["test/wstest-e2e/**/*.wstest-e2e.spec.ts"],
    testTimeout: 300000,
    hookTimeout: 300000,
    fileParallelism: false,
    // Lifecycle steps share state (connect -> share -> accept -> teardown):
    // run them serially and stop at the first failure so later steps don't
    // execute (and fail noisily) against a half-torn-down environment.
    sequence: { concurrent: false },
    bail: 1,
  },
});
