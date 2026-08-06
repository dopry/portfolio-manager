# Migrating from 1.x to 2.0

Version 2 establishes the stable package boundary and semantic-versioning
contract for `portfolio-manager`. Review the changes below before upgrading.

## Runtime requirements

- Upgrade Node.js to `20.19.0` or newer.
- The package is ESM-only. Use `import` rather than `require()`.
- The SDK uses Node's native `fetch`, `Headers`, and `RequestInit` APIs.

```bash
npm install portfolio-manager@2
```

To test an upcoming 2.x release from the `next` prerelease channel, install:

```bash
npm install portfolio-manager@next
```

## Package entry points

The package now exposes two supported JavaScript entry points:

- `portfolio-manager` for the SDK and public data types
- `portfolio-manager/cli` for embeddable Commander command classes

CLI classes are no longer exported from the package root:

```typescript
// 1.x
import { PortfolioManager, PortfolioManagerCommand } from "portfolio-manager";

// 2.x
import { PortfolioManager } from "portfolio-manager";
import { PortfolioManagerCommand } from "portfolio-manager/cli";
```

The `shouldRunMain(importMetaUrl, argv1)` helper was removed. It only existed
to distinguish the old combined SDK/CLI entry point. Run the installed
`portfolio-manager` binary or instantiate `PortfolioManagerCommand` from the
CLI entry point instead.

The installed CLI command is unchanged, but its internal file moved to
`dist/cli.js`. Imports or scripts that reference files below `dist/` are not
part of the supported API and must switch to one of the package entry points.
The new exports map intentionally blocks undeclared deep imports.

## API configuration and errors

`PortfolioManagerApi` can retry replayable requests that receive an HTTP 429:

```typescript
const api = new PortfolioManagerApi(endpoint, username, password, {
  maxRetries: 3,
  retryBaseDelayMs: 1_000,
});
```

HTTP failures and XML parse failures now surface as
`PortfolioManagerApiError`. Use `isPortfolioManagerApiError()` when handling
errors that need status, response body, or URL details.

Facade fan-out operations are bounded to avoid overwhelming the ENERGY STAR
API. Configure the limit or inject an error logger when constructing the
facade:

```typescript
const pm = new PortfolioManager(api, {
  concurrency: 5,
  logger: console,
});
```

## Type and schema updates

The XML types now reflect the vendored ENERGY STAR Portfolio Manager 26.0 and
27.0 schemas, and repeatable XML elements are parsed consistently as arrays.
Some previously permissive or inaccurate field types were corrected. Run your
TypeScript build after upgrading and update code that depended on the old
hand-maintained shapes.

The package exports only its declared root and CLI entry points. Public types
remain available from `portfolio-manager`; generated schema internals are not
separate supported import paths.

## New 2.0 capabilities

Version 2 adds high-level and endpoint-level support for:

- account discovery and customer creation
- customer connection acceptance, rejection, listing, and disconnection
- property and meter share acceptance, rejection, listing, and removal
- notifications and connected-customer listing
- property, property-use, and meter What's Changed feeds
- property and meter deletion
- bounded facade concurrency and automatic rate-limit retries

See the README and the package's TypeScript declarations for the current API.

## Release channels

The `next` branch publishes prereleases such as `2.0.0-next.2`. Stable releases
are published from `main`. The placeholder version in the repository's
`package.json` is managed by semantic-release and should not be edited by hand.
