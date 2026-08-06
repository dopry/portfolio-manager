# Unofficial Energy Star Portfolio Manager SDK and CLI Tool

See the [migration guide](MIGRATION.md).

Portfolio Manager is an important benchmarking tool for measurement and verification of energy efficiency projects. It supports federal incentive programs, federal decision making, and Energy Star building certifications. It is primarily used by [large companies](https://www.energystar.gov/buildings/facility-owners-and-managers/existing-buildings/save-energy/expert-help/find-spp/most_active#).

A core aim of this project is to make Portfolio Manager more accessible to smaller consultants, engineering firms, property managers, utilities like rural coops, and building owners.

The CLI enables automation of data flows using shell scripts for IT teams and systems administrators.

The Node.js SDK makes the platform more accessible to JavaScript developers.

## Runtime and Packaging

- Node.js: `>=20.19.0`
- Package format: ESM-only (`"type": "module"`)
- CLI bin entry: `dist/cli.js`

If you are consuming the SDK in your own code, use ESM imports.
SDK classes and types are exported from `portfolio-manager`. CLI command
classes for embedding are exported separately from `portfolio-manager/cli`.

## CLI Quickstart

```bash
npm install portfolio-manager

# Required credentials (recommended via environment variables)
export PM_USERNAME="UserName"
export PM_PASSWORD="Password"

# Optional endpoint override
# export PM_ENDPOINT="https://portfoliomanager.energystar.gov/wstest/"

npx portfolio-manager --help
```

Security note: prefer environment variables to avoid exposing credentials in shell history and process listings.

To get the ID and identifying details for the currently authenticated account:

```bash
npx portfolio-manager account get --indent 2
```

To list connected customers and find the `customerId` required by the What's
Changed commands:

```bash
npx portfolio-manager connection list --indent 2
```

To inspect all three What's Changed feeds for a connected customer:

```bash
npx portfolio-manager what-changed all \
  --customerId 100 \
  --date 2026-08-01 \
  --indent 2
```

Use `property`, `property-use`, or `meter` instead of `all` to query one
What's Changed endpoint. Each command prints its corresponding ID list as JSON.
The `customerId` is the account ID used in Portfolio Manager's What's Changed
route. Use a connected customer's account ID for provider-to-customer feeds.
The production API can also return changes owned by the authenticated account
when its own account ID is supplied; the test environment may behave
differently.

Connection and sharing workflows are also available from the CLI:

```bash
npx portfolio-manager connection list-pending --indent 2
npx portfolio-manager connection accept --accountId 100
npx portfolio-manager share list-pending --indent 2
npx portfolio-manager notifications list --no-clear --indent 2
```

Run `npx portfolio-manager <command> --help` for the complete options for a
command.

### Portable property bundles (core preview)

Export one or more properties to deterministic, versioned JSON:

```bash
npx portfolio-manager property export --output property.json 123
npx portfolio-manager property export --all --output portfolio.json
```

Existing files are not overwritten unless `--force` is supplied. Use stdout
instead of a file by omitting `--output`.

Validate a bundle without creating anything, then import it into the
authenticated account or a connected customer account:

```bash
npx portfolio-manager property import property.json --dry-run
npx portfolio-manager property import property.json --account-id 456
```

This first bundle capability carries core property fields only. It deliberately
omits Portfolio Manager IDs, audit/access fields, property uses, meters,
consumption, associations, and sharing. Those child-resource capabilities will
be added without changing the v1 core-property shape.

Bundles identify the v1 schema with the stable
`urn:portfolio-manager:property-bundle:v1` URN. The schema ships with the
package as `PROPERTY_BUNDLE_SCHEMA_DOCUMENT` and through the
`portfolio-manager/schemas/property-bundle-v1.schema.json` export, so validation
does not depend on a moving GitHub branch.

Property bundles can contain sensitive names, addresses, identifiers, notes,
costs, and consumption as capabilities are added. Store production exports as
securely as the source account data.

## Local Development Workflow

```bash
npm ci
npm run typecheck
npm run build
npm test
```

`npm test` runs the integration-oriented suite. You should expect external API dependencies and credentials.

## Test Environment

Integration tests rely on Portfolio Manager credentials and run against the test endpoint (`wstest`) only:

- `PM_USERNAME`
- `PM_PASSWORD`

Test endpoint used by the integration suite:

- `https://portfoliomanager.energystar.gov/wstest/`

Some tests are intentionally marked pending when setup or upstream capabilities are unavailable.

To wipe all properties in the test environment account:

```bash
npm run wipe:test-environment -- --yes
```

Safety checks in the script:

- requires `--yes`
- refuses non-`/wstest/` endpoints unless `--allow-non-test-endpoint` is set

### Live-Environment What's Changed Test

The live-environment integration test maintains a property, property use, and
meter owned by the authenticated test account. It verifies that the property has a
construction status of `Test`, checks that all three fixture IDs appear in the
corresponding account-level What's Changed feeds, and updates every fixture
entity for the next run. Because same-run feed visibility is not guaranteed,
the test verifies the prior run's mutations before refreshing the fixtures. The
eight-day lookback allows one day of scheduling tolerance beyond the weekly
cadence. A missing entity is skipped only when it was newly seeded or its last
persisted mutation predates the lookback; a fresh missing change fails the test.

It is excluded from the default local test suite because it writes to the live
ESPM environment. The dedicated workflow runs for pull requests, weekly, and
on demand using the `LIVE_PM_USERNAME` and `LIVE_PM_PASSWORD` repository
secrets. All runs share one concurrency group so the persistent fixture is
never mutated by overlapping jobs. The same workflow gates releases from
`main` and `next`.

Live-environment credentials are unavailable to fork pull requests. Those changes
must be tested from a trusted branch in this repository before merging.

```bash
export PM_USERNAME="LiveEnvironmentUserName"
export PM_PASSWORD="LiveEnvironmentPassword"
npm run typecheck:live-env
npm run test:live-env
```

The live-environment endpoint is fixed to
`https://portfoliomanager.energystar.gov/ws/` so `PM_ENDPOINT` cannot redirect
this suite to another environment.

## CI and Release

GitHub Actions (`.github/workflows/ci.yml`) is the source of truth for the pipeline:

1. `npm ci`
2. `npm run typecheck`
3. `npm run build`
4. `node ./dist/cli.js --help`
5. `npm test`

The release job runs `npx semantic-release` from configured release branches,
publishing to npm via trusted publishing (OIDC). `next` publishes prereleases;
stable releases publish from `main`. See `CONTRIBUTING.md` for the release
checklist. No npm token is stored in CI.

## SDK

The package includes TypeScript declarations for the complete public API. The
examples below cover the main entry points; the generated declarations and
exported source types are the source of truth for individual method signatures.

### Quickstart

```typescript
import { PortfolioManager, PortfolioManagerApi } from "portfolio-manager";

const endpoint = "https://portfoliomanager.energystar.gov/wstest/";
const username = "<UserName>";
const password = "<Password>";

async function main() {
  const api = new PortfolioManagerApi(endpoint, username, password);
  const pm = new PortfolioManager(api);
  const properties = await pm.getProperties();
  console.log(properties);
}

await main();
```

`PortfolioManagerApi` accepts optional `maxRetries` and `retryBaseDelayMs`
settings for rate-limit handling. `PortfolioManager` accepts optional
`concurrency` and `logger` settings for facade fan-out operations and error
reporting.

### What's Changed

The typed API gateway supports ENERGY STAR's property, property-use, and meter
What's Changed calls. Dates use the `YYYY-MM-DD` format, and the optional page
keys are the opaque cursor values returned by Portfolio Manager.

```typescript
const properties = await api.propertyGetWhatChangedGet(100, "2024-01-01");
const propertyUses = await api.propertyUseGetWhatChangedGet(100, "2024-01-01", {
  nextPageKey: "3000",
});
const meters = await api.meterGetWhatChangedGet(100, "2024-01-01");
```

The `PortfolioManager` facade maps all paginated links to IDs. What's Changed
requires the account ID whose feed is being queried. This is normally a
connected customer's ID for provider workflows, but production also supports
the authenticated account's own ID for its owned resources.

```typescript
const customerId = 100;
const propertyIds = await pm.getChangedPropertyIds("2024-01-01", customerId);
const propertyUseIds = await pm.getChangedPropertyUseIds(
  "2024-01-01",
  customerId,
);
const meterIds = await pm.getChangedMeterIds("2024-01-01", customerId);
```

### Public API

Use `PortfolioManager` for developer-friendly operations such as accounts,
properties, meters, metrics, What's Changed feeds, connections, shares, and
notifications. Representative methods include:

- `getAccount()`, `getProperties()`, `createProperty()`, and `deleteProperty()`
- `getMeters()`, `createMeter()`, `deleteMeter()`, and `getMeterConsumption()`
- `getPropertyMetrics()` and `getPropertyMonthlyMetrics()`
- `getPendingConnections()`, `acceptConnection()`, and `disconnect()`
- `getPendingPropertyShares()`, `acceptMeterShare()`, and `unshareProperty()`
- `getNotifications()` and `getCustomerList()`

Use `PortfolioManagerApi` when you need response wrappers that closely match
the ENERGY STAR web-service endpoints. Its endpoint-oriented methods include
`accountAccountGet()`, `propertyPropertyGet()`, `meterMeterGet()`,
`connectAccountPendingListGet()`, and `notificationListGet()`.

Failed HTTP and XML responses throw `PortfolioManagerApiError`, which exposes
the response status, status text, body, and URL when available. Using the `api`
instance from the quickstart:

```typescript
import { isPortfolioManagerApiError } from "portfolio-manager";

try {
  await api.accountAccountGet();
} catch (error) {
  if (isPortfolioManagerApiError(error)) {
    console.error(error.status, error.responseText);
  }
  throw error;
}
```

CLI command classes are intentionally separate from the SDK root:

```typescript
import {
  PortfolioManagerCommand,
  PortfolioManagerConnectionAcceptCommand,
} from "portfolio-manager/cli";
```

## Contributing

Contributions and sponsorship are welcome. The goal is open-source tooling that supports organizations working in energy efficiency.

See `CONTRIBUTING.md` for local workflow, CI expectations, and release process details.

## Energy Star Portfolio Manager Upstream API Documentation

- [Getting Started](https://portfoliomanager.energystar.gov/webservices/home)
- [API Documentation](https://portfoliomanager.energystar.gov/webservices/home/api)
- [Error Codes](https://portfoliomanager.energystar.gov/webservices/home/errors)

## Sponsors

[![Ross Energy Consulting](http://www.rossenergyllc.com/blog/wp-content/uploads/2015/05/Ross-Energy-Logo-web.png)](https://www.rossenergyllc.com/)

Ross Energy Consulting initially sponsored this project to support their [Strategic Energy Management](https://www.rossenergyllc.com/services/sem/) service.

> Ross Energy is dedicated to helping clients achieve energy security for their buildings and communities. The team has experience across more than fifty million square feet of buildings, including clients such as the United States Environmental Protection Agency (EPA), Department of Defense (DoD), the Guggenheim Museum, and more than 50 real estate developers and property management firms.
