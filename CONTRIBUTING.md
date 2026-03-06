# Contributing

Thanks for contributing to `portfolio-manager`.

## Prerequisites

- Node.js `>=20`
- npm (uses lockfile; prefer `npm ci`)
- Portfolio Manager credentials for integration tests

Environment variables used by CLI/tests:

- `PM_USERNAME` (required)
- `PM_PASSWORD` (required)
- `PM_ENDPOINT` (optional; defaults to production endpoint)

## Local Workflow

```bash
npm ci
npm run typecheck
npm run build
npm test
```

Notes:

- Tests run from compiled output via `.mocharc.cjs`.
- Some integration tests are intentionally pending depending on upstream API/data behavior.

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
