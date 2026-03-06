# Contributing

Thanks for contributing to `portfolio-manager`.

## Prerequisites

- Node.js `>=20`
- npm (uses lockfile; prefer `npm ci`)
- Portfolio Manager credentials for integration tests

Environment variables used by tests:

- `PM_USERNAME` (required)
- `PM_PASSWORD` (required)

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

## CI Source Of Truth

CircleCI is the authoritative pipeline.

Expected order:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. `node ./dist/index.js --help`
5. `npm test`

## Release Process

Releases are automated with `semantic-release`.

Configured release branches (see `package.json`):

- `main`
- `next` (prerelease channel)
- maintenance branch patterns (for example `1.x`)

When CircleCI `release` job runs on an eligible branch and all checks pass, it executes:

```bash
npx semantic-release
```

## Release Checklist (Maintainer)

1. Confirm branch is eligible for release (`main`, `next`, or maintenance pattern).
2. Confirm CI is green, including CLI startup check (`node ./dist/index.js --help`).
3. Confirm dependency lockfile changes are intentional.
4. Merge through normal review flow; do not manually publish from local machine.
5. Verify release artifacts/changelog in npm/Git provider after CI release job completes.
