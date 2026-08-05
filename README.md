# Unofficial Energy Star Portfolio Manager SDK and CLI Tool

**1.x is still evolving and may include breaking changes while the architecture stabilizes.**

Portfolio Manager is an important benchmarking tool for measurement and verification of energy efficiency projects. It supports federal incentive programs, federal decision making, and Energy Star building certifications. It is primarily used by [large companies](https://www.energystar.gov/buildings/facility-owners-and-managers/existing-buildings/save-energy/expert-help/find-spp/most_active#).

A core aim of this project is to make Portfolio Manager more accessible to smaller consultants, engineering firms, property managers, utilities like rural coops, and building owners.

The CLI enables automation of data flows using shell scripts for IT teams and systems administrators.

The Node.js SDK makes the platform more accessible to JavaScript developers.

## Runtime and Packaging

- Node.js: `>=20`
- Package format: ESM-only (`"type": "module"`)
- CLI bin entry: `dist/cli.js`

If you are consuming the SDK in your own code, use ESM imports.

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
The customer ID is required because Portfolio Manager exposes What's Changed
as a provider-to-connected-customer feed, not as an audit feed for the
authenticated provider's own account.

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

The release job runs `npx semantic-release` from configured release branches (`main`, `next`, and maintenance branch patterns in `package.json`), publishing to npm via trusted publishing (OIDC) — no npm token is stored in CI.

## SDK

There is not yet a full docs framework; source code is the most complete reference.

### Quickstart

```typescript
const endpoint = "https://portfoliomanager.energystar.gov/wstest/";
const username = "<UserName>";
const password = "<Password>";

async function main() {
  const api = new PortfolioManagerApi(endpoint, username, password);
  const pm = new PortfolioManager(api);
  const properties = await pm.getProperties();
  console.log(properties);
}

main();
```

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
is a provider-to-customer feed, so each call requires the connected customer's
account ID; querying the provider's own account returns no customer changes.

```typescript
const customerId = 100;
const propertyIds = await pm.getChangedPropertyIds("2024-01-01", customerId);
const propertyUseIds = await pm.getChangedPropertyUseIds(
  "2024-01-01",
  customerId,
);
const meterIds = await pm.getChangedMeterIds("2024-01-01", customerId);
```

### Interfaces

```typescript
class PortfolioManager {
  // Developer-friendly facade to the Portfolio Manager API
  constructor(api: PortfolioManagerApi) {}

  async getAccount(): Promise<IAccount>;
  async getAccountId(): Promise<number>;
  async getMeter(meterId: number): Promise<IMeter>;
  async getMeterConsumption(
    meterId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<(IMeterDelivery | IMeterConsumption)[]>;
  async getMeterLinks(
    propertyId: number,
    myAccessOnly?: boolean,
  ): Promise<ILink[]>;
  async getMeters(propertyId: number): Promise<IMeter[]>;
  async getAssociatedMeters(
    propertyId: number,
  ): Promise<IMeterPropertyAssociationList>;
  async getProperty(propertyId: number): Promise<IClientProperty>;
  async getPropertyLinks(accountId?: number): Promise<ILink[]>;
  async getProperties(accountId?: number): Promise<IClientProperty[]>;
  async getChangedPropertyIds(
    date: string,
    customerId: number,
  ): Promise<number[]>;
  async getChangedPropertyUseIds(
    date: string,
    customerId: number,
  ): Promise<number[]>;
  async getChangedMeterIds(date: string, customerId: number): Promise<number[]>;
}

class PortfolioManagerApi {
  // Typed gateway to the Portfolio Manager API
  constructor(endpoint: string, username: string, password: string);

  async getAccount(): Promise<IGetAccountResponse>;
  async getMeter(meterId: number): Promise<IGetMeterResponse>;
  async getProperty(propertyId: number): Promise<IGetPropertyResponse>;
  async postProperty(
    property: IProperty,
    accountId: number,
  ): Promise<IPostPropertyResponse>;
  async getPropertyList(accountId: number): Promise<IGetPropertyListResponse>;
  async postPropertyMeter(
    propertyId: number,
    meter: IMeter,
  ): Promise<IPostPropertyMeterResponse>;
  async getPropertyMeterAssociationList(
    propertyId: number,
  ): Promise<IGetPropertyMeterAssociationListResponse>;
  async getPropertyMeterList(
    propertyId: number,
    myAccessOnly = false,
  ): Promise<IGetPropertyMeterListResponse>;
  async getMeterConsumptionData(
    meterId: number,
    page?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<IGetMeterConsumptionResponse>;
}
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
