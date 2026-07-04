import { defineConfig } from "vitest/config";

// End-to-end connection/sharing suite. Kept out of the default `vitest run`
// because it drives the ESPM test web UI with Playwright and mutates shared,
// stateful test accounts — see plans/connection-sharing-e2e-tests.md.
export default defineConfig({
  test: {
    globals: true,
    include: ["test/e2e/**/*.e2e.spec.ts"],
    testTimeout: 300000,
    hookTimeout: 300000,
    fileParallelism: false,
    // Lifecycle steps share state (connect -> share -> accept -> teardown),
    // so a failed step must fail the rest instead of running against a
    // half-torn-down environment.
    sequence: { concurrent: false },
  },
});
