# Contributing

Thanks for contributing to `portfolio-manager`.

## Prerequisites

- Node.js `>=20.19.0`
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

## wstest-e2e Tests

ESPM's web services API cannot initiate connection or share requests — a
standard user must do that through the web UI. The `wstest-e2e` suite
(`test/wstest-e2e/`) drives the **peer account** (`PM_USERNAME2`/`PM_PASSWORD2`)
through the test web UI (`https://portfoliomanager.energystar.gov/pmtest`)
with Playwright to seed those requests, then exercises the SDK as the
**provider account** (`PM_USERNAME`/`PM_PASSWORD`) against `wstest` to
accept, verify, and clean up. Design and rationale live in
`plans/connection-sharing-e2e-tests.md`.

```bash
npx playwright install chromium   # one-time browser download
npm run typecheck:wstest-e2e
npm run test:wstest-e2e
```

Notes:

- The suite is excluded from `npm test`; the `CI / wstest-e2e` job runs it for
  trusted pull requests and pushes to `main` or `next`. A dedicated
  `.github/workflows/wstest-e2e.yml` workflow also runs nightly and on demand.
  All runs serialize on the shared test accounts.
- The peer account is a persistent, standard (non-provider) account in the
  test environment. If EPA refreshes the test environment, recreate it via
  the `pmtest` UI and update the `PM_USERNAME2`/`PM_PASSWORD2` secrets.
- The **provider** account must be searchable or the peer's contact search
  finds nothing (Account Settings → Your Preferences → "Do you want your
  username to be searchable..." → Yes). Already enabled; after an EPA test
  environment refresh, re-apply with
  `npx tsx test/wstest-e2e/probe.ts provider-settings --make-searchable`.
- `test/wstest-e2e/probe.ts` is a selector-maintenance tool: it logs in and dumps
  page structure (links, controls, dialogs) for each step of the flows, e.g.
  `npx tsx test/wstest-e2e/probe.ts contacts|add|connect|sharing|wsshare`. Use it
  to revalidate locators when the ESPM UI changes.
- Set `E2E_HEADLESS=false` to watch the browser locally; failed runs write
  Playwright traces to `test-results/wstest-e2e/` (override with `E2E_TRACE_DIR`;
  inspect with `npx playwright show-trace <file>.zip`).
- Endpoints are overridable for alternate environments: `PM_WEB_ENDPOINT`
  (web UI, default `https://portfoliomanager.energystar.gov/pmtest`) and
  `PM_ENDPOINT` (web services API, default
  `https://portfoliomanager.energystar.gov/wstest/`).
- UI locators live only in `test/wstest-e2e/EspmWebUi.ts`; when the ESPM UI changes,
  that file is the single place to fix.

## Running E2E Tests From a Fork

GitHub intentionally withholds repository secrets from upstream workflows for
fork pull requests and Dependabot. Their upstream `CI / wstest-e2e` and
`CI / live-e2e` jobs are reported as skipped rather than receiving credentials.

To validate a branch in your own fork:

1. Enable GitHub Actions for the fork.
2. Under **Settings → Secrets and variables → Actions**, add your own test
   account credentials:
   - `TEST_PM_USERNAME` and `TEST_PM_PASSWORD`
   - `TEST_PM_USERNAME2` and `TEST_PM_PASSWORD2`
   - `LIVE_PM_USERNAME` and `LIVE_PM_PASSWORD` if running Live E2E
3. Open the fork's **Actions** tab, select `wstest-e2e` or `live-e2e`, choose
   **Run workflow**, and select the pull-request branch.

Never add credentials to workflow files, commits, pull-request descriptions,
logs, or uploaded artifacts. Fork credentials remain isolated to the fork;
they are not made available to the upstream pull-request workflow.

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

- `main` (stable releases)
- `next` (prereleases such as `2.0.0-next.2`)
- maintenance branch patterns (for example `1.x`)

When the GitHub Actions `release` job runs on an eligible branch and all matrix test jobs pass, it runs the coverage gate (`npm run test:coverage`) and then executes:

```bash
npx semantic-release
```

Publishing uses npm trusted publishing via OIDC — no npm token is stored in CI. The trusted publisher is configured on npmjs.com for this repository and the `ci.yml` workflow.

The repository keeps `0.0.0-semantic-release` as its package version.
The semantic-release tool calculates and writes the published version; do not
update the placeholder manually. Promoting a prerelease to a stable release
requires merging `next` to `main` and allowing the `main` workflow to
publish it.

## Release Checklist (Maintainer)

1. Update the README and migration guide for user-visible or breaking changes.
2. Run `npm install` after dependency or package metadata changes and commit the updated lockfile.
3. Run the normal lint, typecheck, build, and test checks.
4. Confirm CI is green, including the CLI startup check.
5. For a prerelease, merge to `next`; for a stable release, merge `next` to `main`.
6. Do not publish manually or edit the semantic-release version placeholder.
7. Verify the npm package, stable or prerelease dist-tag, Git tag, and GitHub release notes after the workflow completes.
