# Contributing

Thanks for contributing to `portfolio-manager`.

## Prerequisites

- Node.js `>=20`
- npm (uses lockfile; prefer `npm ci`)
- Portfolio Manager credentials for integration tests

Environment variables used by tests:

- `PM_USERNAME` (required) — web services provider test account (the account under test)
- `PM_PASSWORD` (required)
- `PM_USERNAME2` (e2e only) — persistent peer test account that initiates connections/shares
- `PM_PASSWORD2` (e2e only)

## Local Workflow

```bash
npm ci
npm run typecheck
npm run build
npm test
```

Notes:

- Tests run via `vitest` from source specs in `src/**/*.spec.ts`.
- Some integration tests are intentionally pending depending on upstream API/data behavior.

## Testing Methodology

We optimize for early detection of upstream Portfolio Manager API changes.

- Default strategy: live API-first integration tests.
- Lifecycle focus: test real create/update/fetch/delete flows for entities.
- Mocking policy: keep mocking minimal and only for branches that are not reliably reproducible with live API calls (for example malformed transport payloads or synthetic timeout branches).

### Test Data Isolation

- Use deterministic, per-run unique names for created entities to avoid collisions between concurrent test runs.
- Avoid relying on pre-existing shared test entities where possible.

### Cleanup Expectations

- Tests that create entities must clean them up in teardown paths.
- Cleanup should still run when assertions fail to avoid orphaned resources in shared test accounts.

### Runtime Expectations

- Live tests can be slower; use explicit timeouts where needed.
- `npm test` is expected to run live API tests by default.
- Test endpoint is fixed to `https://portfoliomanager.energystar.gov/wstest/`.
- Required environment variables: `PM_USERNAME` and `PM_PASSWORD`.

## End-to-End Connection & Sharing Tests

ESPM's web services API cannot initiate connection or share requests — a
standard user must do that through the web UI. The e2e suite
(`test/e2e/`) drives the **peer account** (`PM_USERNAME2`/`PM_PASSWORD2`)
through the test web UI (`https://portfoliomanager.energystar.gov/pmtest`)
with Playwright to seed those requests, then exercises the SDK as the
**provider account** (`PM_USERNAME`/`PM_PASSWORD`) against `wstest` to
accept, verify, and clean up. Design and rationale live in
`plans/connection-sharing-e2e-tests.md`.

```bash
npx playwright install chromium   # one-time browser download
npm run typecheck:e2e
npm run test:e2e
```

Notes:

- The suite is excluded from `npm test`; it runs nightly in CI
  (`.github/workflows/e2e.yml`) and serializes on the shared test accounts.
- The peer account is a persistent, standard (non-provider) account in the
  test environment. If EPA refreshes the test environment, recreate it via
  the `pmtest` UI and update the `PM_USERNAME2`/`PM_PASSWORD2` secrets.
- The **provider** account must be searchable or the peer's contact search
  finds nothing (Account Settings → Your Preferences → "Do you want your
  username to be searchable..." → Yes). Already enabled; after an EPA test
  environment refresh, re-apply with
  `npx tsx test/e2e/probe.ts provider-settings --make-searchable`.
- `test/e2e/probe.ts` is a selector-maintenance tool: it logs in and dumps
  page structure (links, controls, dialogs) for each step of the flows, e.g.
  `npx tsx test/e2e/probe.ts contacts|add|connect|sharing|wsshare`. Use it
  to revalidate locators when the ESPM UI changes.
- Set `E2E_HEADLESS=false` to watch the browser locally; failed runs write
  Playwright traces to `test-results/e2e/` (override with `E2E_TRACE_DIR`;
  inspect with `npx playwright show-trace <file>.zip`).
- Endpoints are overridable for alternate environments: `PM_WEB_ENDPOINT`
  (web UI, default `https://portfoliomanager.energystar.gov/pmtest`) and
  `PM_ENDPOINT` (web services API, default
  `https://portfoliomanager.energystar.gov/wstest/`).
- UI locators live only in `test/e2e/EspmWebUi.ts`; when the ESPM UI changes,
  that file is the single place to fix.

## CI Source Of Truth

GitHub Actions is the authoritative pipeline (`.github/workflows/ci.yml`).

The `test` job runs on every push across a Node version matrix (20, 22, `lts/*`, `latest`), in this order:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. `node ./dist/cli.js --help`
5. `npm test`

## Release Process

Releases are automated with `semantic-release`.

Configured release branches (see `package.json`):

- `main`
- `next` (prerelease channel)
- maintenance branch patterns (for example `1.x`)

When the GitHub Actions `release` job runs on an eligible branch and all matrix test jobs pass, it runs the coverage gate (`npm run test:coverage`) and then executes:

```bash
npx semantic-release
```

Publishing uses npm trusted publishing via OIDC — no npm token is stored in CI. The trusted publisher is configured on npmjs.com for this repository and the `ci.yml` workflow.

## Release Checklist (Maintainer)

1. Confirm branch is eligible for release (`main`, `next`, or maintenance pattern).
2. Confirm CI is green, including CLI startup check (`node ./dist/cli.js --help`).
3. Confirm dependency lockfile changes are intentional.
4. Merge through normal review flow; do not manually publish from local machine.
5. Verify release artifacts/changelog in npm/Git provider after CI release job completes.
