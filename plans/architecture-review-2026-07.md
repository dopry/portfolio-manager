# Architecture Review — July 2026

Scope: the whole repository as of `bab9f4a` (post connection-sharing e2e merge).
Audience: maintainers deciding what to stabilize before 1.x settles.

## 1. Current architecture (as-is)

The codebase is a small, well-layered SDK + CLI (~11k lines of TypeScript,
ESM-only, Node >= 20):

| Layer | Location | Role |
| --- | --- | --- |
| Gateway | `src/PortfolioManagerApi.ts` | One typed method per ESPM endpoint; XML parse/build; auth; 429 retry |
| Facade | `src/PortfolioManager.ts` | Developer-friendly operations: pagination, link → entity resolution, flattening, error translation |
| CLI | `src/cli/*` (~30 files) | Commander subclass per command; JSON output with `--fields` selection |
| Types | `src/types/{xml,api,client}` | Hand-written types mirroring the XSDs (`xml`), response envelopes (`api`), simplified client shapes (`client`) |
| Tests | `src/**/*.spec.ts`, `test/e2e/` | Live-API integration suite (default), Playwright-driven e2e for connection/sharing |
| CI/Release | `.github/workflows/` | Matrix test on push, semantic-release with npm trusted publishing (OIDC) |

### Strengths worth preserving

- The Gateway/Facade split is clean and consistently applied; responsibilities
  are documented in class docblocks and actually match the code.
- 429 retry with Retry-After support, replayable-body guard, and socket
  draining in `PortfolioManagerApi.fetch()` shows real production hardening.
- 100% per-file coverage threshold enforced at release time.
- Release engineering is modern: semantic-release, OIDC trusted publishing (no
  npm token), concurrency groups tuned around the shared ESPM test account.
- The e2e suite's design (single `EspmWebUi.ts` locator module, probe tool,
  trace-after-login) is unusually thoughtful for a project this size.
- The live-API-first test policy is a deliberate, documented trade-off
  (early detection of upstream API drift) — the recommendations below work
  within it rather than against it.

## 2. Recommended modernizations

Ordered by category; a prioritized roadmap is at the end.

### A. Packaging & module hygiene

1. **Add an `exports` map (and explicit `types`) to `package.json`.**
   Today only `main: dist/index.js` is declared. Node resolves it, and TS
   finds `dist/index.d.ts` by convention, but there is no encapsulation
   (consumers can deep-import `portfolio-manager/dist/anything.js`) and no
   room to add entry points later without breaking someone. Before 1.x
   stabilizes is exactly the time to lock this down:

   ```json
   "exports": {
     ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
   },
   "types": "./dist/index.d.ts",
   "sideEffects": false
   ```

2. **Split the SDK entry from the CLI entry.** `src/index.ts` is both the
   `bin` and the library root, and it re-exports `./cli/index.js`, so every
   SDK consumer loads Commander and all 30 command classes at import time.
   The `shouldRunMain()` guard exists only to make this dual role safe.
   Recommended shape:
   - `src/index.ts` — library exports only (facade, gateway, types).
   - `src/cli.ts` — shebang + `program.parseAsync()`; becomes the `bin`.
   - Optionally expose the command classes at `"./cli"` in the exports map
     for embedders.
   This also lets `commander` stop being a hard dependency of pure SDK usage
   (bundlers can tree-shake it away with `sideEffects: false`).

3. **Use `parseAsync` in the CLI entry.** Command actions are `async`
   (`PortfolioManagerBaseCommand._action`), but `src/index.ts` calls
   `cli.parse(process.argv)`. Commander does not await async handlers under
   `.parse()`, so a rejected action becomes an unhandled rejection instead of
   a clean non-zero exit with a message. `await cli.parseAsync(...)` wrapped
   in a `try/catch` that sets `process.exitCode` fixes exit-code correctness
   for shell-scripting users — a core audience per the README.

### B. TypeScript configuration

`tsconfig.json` predates the ESM migration and undersells the runtime floor:

- `"target": "ES2015"` — the engine floor is Node 20; compile to `ES2022`
  (or `ES2023`). Today every `async/await`, class field, and spread is
  down-leveled to 2015-era output for no supported runtime.
- `"module": "ES2020"` + `"moduleResolution": "node"` — `node` is the legacy
  CJS ("node10") algorithm; it happens to work because imports already carry
  `.js` extensions, but it does not validate ESM resolution the way Node
  actually behaves. Switch to `"module": "nodenext"` +
  `"moduleResolution": "nodenext"` (and set `"lib": ["ES2023"]` rather than
  the moving target `esnext`).
- Add the newer strictness flags that strict mode does not imply:
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (this one will
  surface real modeling questions in the XML types — adopt deliberately),
  `verbatimModuleSyntax`.
- Resolve the `baseUrl: "src"` TODO by deleting it — nothing needs it once
  imports are all relative, and it confuses editors about absolute imports.

### C. Dependencies

The runtime dependency list can shrink from 5 to ~1–2:

| Dependency | Recommendation |
| --- | --- |
| `node-fetch` | **Drop.** Node >= 20 ships stable, spec-compliant `fetch` (undici). This removes the package plus its type friction (`RequestInit`, `BodyInit`, `Response` imports in `PortfolioManagerApi.ts` become lib.dom/undici types). |
| `deepmerge-ts` | **Drop.** It is used once, to merge `{method, headers}` defaults with per-call options in `fetch()`. A two-line spread (`{...defaults, ...options, headers: {...defaults.headers, ...options.headers}}`) is clearer and removes a transitive dependency. |
| `type-guards` | **Drop.** Used once for `isString`/`isNumber` in the XML builder; `typeof` checks suffice. The package is also long-unmaintained (0.15.x). |
| `src/functions/btoa.ts` | **Drop.** `btoa` is a Node 16+ global; or keep the one-liner `Buffer` call inline where the Basic auth header is built. |
| `commander` | Keep — current (v14) and the right tool. Moves to CLI-only cost after A.2. |
| `fast-xml-parser` | Keep — current (v5) and central to the design. |

Add a `.github/dependabot.yml` (or Renovate) so the currently-fresh
dependency set stays fresh without manual sweeps.

### D. Transport layer (`PortfolioManagerApi`)

1. **Build URLs with `URL`/`URLSearchParams` instead of string
   concatenation.** Paths are inconsistently written with and without leading
   slashes (`"account"` vs `"/meter/..."`), which only works because the
   server tolerates `wstest//meter`. Query strings are hand-joined and
   unencoded (`metrics.join(",")` in a header is fine, but
   `startDate=${startDate}` etc. is unencoded). A small private
   `buildUrl(path, params?)` normalizes all of this and makes endpoint
   overrides (`PM_ENDPOINT` with/without trailing slash) robust.

2. **Support timeouts and cancellation.** No request can currently be timed
   out or aborted. Accept an optional `AbortSignal` per call and add a
   default timeout via `AbortSignal.timeout(ms)` (configurable in
   `PortfolioManagerApiOptions`). For a CLI used in shell pipelines and cron
   jobs, hung sockets are the failure mode users actually hit.

3. **Make the transport injectable.** `fetch` is imported at module scope, so
   the gateway cannot be exercised without the network (or module-level
   mocking). Accept `fetchImpl?: typeof fetch` in the options object,
   defaulting to the global. This is a five-line change that unlocks the
   offline test tier in section G without violating the live-first policy.

4. **Introduce optional response validation at the envelope level.** Every
   response is `parser.parse(xml) as RESP` — a blind cast. Full-schema
   runtime validation is a big lift (see F), but validating just the shared
   envelope (`response`/`@_status`/`errors`) before casting would convert
   "undefined is not a function three frames later" into a
   `PortfolioManagerApiError` with the actual ESPM error payload. The ESPM
   error format (errorNumber/description) is documented and currently ignored
   rather than surfaced.

5. **Centralize the `isArray` jpath list.** The hardcoded list in
   `xmlParserOptions` is the single most drift-prone spot in the codebase —
   every new list-shaped endpoint needs a matching entry, and a miss produces
   a type lie (object where the types say array). At minimum, generate this
   list from the XSDs in `xml-schemas/` with a script; the schemas are
   already vendored and diffed across versions (18→26), so the data source
   exists.

### E. Facade layer (`PortfolioManager`)

1. **Fix the duplicate first-page fetch in `getMeterConsumption()`.** The
   method calls `meterConsumptionDataGet()` once to check that
   `response.meterData` exists, then enters the `do` loop which immediately
   re-issues the identical request (`nextPage` starts `undefined`). Page 1 is
   fetched twice on every call — a real cost against a rate-limited API.
   Restructure so the probe response is consumed as the first page. The `NaN`
   sentinel for "no next page" should also become `undefined`/`null` with a
   `while (nextPage !== null)` — the current `do/while (!isNaN(...))` is
   correct but hostile to readers.

2. **Extract a shared pagination helper.** `getPendingConnections()`,
   `getPendingPropertyShares()`, and `getPendingMeterShares()` are the same
   loop three times (fetch page → map → find `next page` link → increment),
   and `getMeterConsumption()` is a fourth variant. An async generator
   (`paginate<T>(fetchPage): AsyncGenerator<T>`) collapses them and gives SDK
   consumers streaming access as a bonus.

3. **Bound fan-out concurrency.** `getProperties()` and `getMeters()` fire an
   unbounded `Promise.all` — one request per link, simultaneously. Against an
   API that rate-limits hard enough that CI serializes its Node matrix, this
   is self-defeating: a 200-property account will trip 429s and burn the
   gateway's retry budget. Add a small concurrency limiter (hand-rolled ~15
   lines or `p-limit`) with a configurable ceiling (default ~4–6). This is
   likely the single highest-impact runtime change for real users.

4. **Stop writing to `console` from library code.** `getMeterConsumption()`
   and `getMetersPropertiesAssociation()` call `console.error` on partial
   failures, and the latter silently drops failed properties from its result.
   A library should either throw, return a result object
   (`{ok, failed}`), or emit through an injectable logger
   (`options.logger?: {warn, error}` defaulting to no-op). Silent
   drop-with-console is the worst of both for programmatic consumers.

5. **Settle the metrics API surface before 1.x.** `getPropertyMonthlyMetrics`,
   `getPropertyMonthlyMetrics2`, and `getPropertyMetrics` overlap, and the
   `2` suffix is a placeholder name that will be frozen by semver the moment
   1.0 ships. Pick the keyed-by-name shape (the `2` variant) or the flat
   shape, name it properly, and deprecate the others now. (A note from
   verifying this section: the `series.monthlyMetric?.` optional chains in
   both monthly methods are dead code — `isIPropertyMonthlyMetric` already
   guarantees `monthlyMetric` is defined — and can be simplified away.)

6. **Reconsider `getAccount()`'s cache as the only cache.** The
   promise-memoization with rollback-on-failure is correct and a good
   pattern; either extend it into a small documented caching story (per-getter
   TTL or a `cached` flag convention) or document that only the account is
   cached. Right now the class docblock advertises "Caching" as a
   responsibility, which oversells it.

### F. Type system & XML mapping

1. **Generate the XSD-mirror types instead of hand-writing them.**
   `src/types/xml/**` is large, hand-maintained, and the vendored schemas in
   `xml-schemas/` (with cross-version diffs) prove upstream churn is expected.
   A codegen script (XSD → TS interfaces with the `@_` attribute convention,
   plus the `isArray` jpath list from D.5) turns every ESPM schema bump from
   an error-prone manual diff into a regenerate-and-review. It does not need
   to be a published tool — a `scripts/generate-types.ts` run by maintainers
   is enough.

2. **Keep the fast-xml-parser convention out of the public surface.** The
   `@_id`-style keys leak all the way to CLI users (`--fields @_id @_hint`)
   and into `IClient*` consumers. The `types/client` layer was clearly
   started for this purpose — finish the job: facade methods should return
   only clean `IClient*` shapes, and the raw `@_` types should be an
   implementation detail (still exported for gateway users, but not the
   default vocabulary). This is a breaking change, which is precisely why it
   belongs in the pre-1.x window.

3. **Eliminate the remaining `any`.** `getCustomerList()` maps links as
   `(link: any)` despite `ILink` existing. Enable
   `@typescript-eslint/no-explicit-any` (see H) to keep the count at zero.

### G. Testing strategy

The live-API-first policy is documented and reasonable — the gap is that
there is no fast tier *underneath* it, and the policy's costs are climbing
(CI serializes 4 Node versions against the shared account; contributors
without EPA test credentials cannot run `npm test` at all; `src/*.spec.ts`
throws at import time when `PM_USERNAME` is unset).

1. **Add an offline unit tier that replays recorded XML.** With D.3
   (injectable fetch), capture real `wstest` responses once as fixture files
   and unit-test the parsing, pagination, flattening, and error paths against
   them — no mocking policy violation, since the fixtures *are* live API
   output. Suggested layout: `npm test` → offline tier (runs anywhere,
   fork PRs, all matrix Node versions in parallel);
   `npm run test:integration` → the current live suite.
2. **Rebalance CI around the tiers.** Matrix (20/22/lts/latest) runs the
   offline tier in parallel; the live integration suite runs once per push
   (lts only, keeping `max-parallel: 1` irrelevant) and on the nightly
   schedule alongside e2e — which still satisfies "early detection of
   upstream drift" while cutting push-to-green time by roughly the length of
   three serialized live runs.
3. **Fail gracefully without credentials.** Gate the live suite with
   `describe.skipIf(!process.env.PM_USERNAME)` (or a config-level check with
   a clear message) instead of a module-scope `throw`, so `npm test` on a
   fresh clone reports "integration skipped: no credentials" rather than
   crashing.

### H. Tooling & developer experience

- **No linter or formatter is configured** — the only style enforcement today
  is `tsc`. Adopt either Biome (single tool, fast, covers both) or ESLint
  flat-config + Prettier, add `npm run lint`, and wire it into CI before the
  typecheck step. The codebase is clean enough that initial adoption will be
  cheap; it gets more expensive every month.
- **Embed the version at build time.** `PortfolioManagerCommand` reads
  `../../package.json` at runtime (already marked TODO). A tiny prebuild step
  emitting `src/version.ts` (or tsup's `define`) removes the runtime file
  read and the silent `0.0.0` fallback.
- **API docs.** The README says "source code is the most complete reference."
  The JSDoc coverage on the facade is already good — TypeDoc would turn it
  into a browsable reference for near-zero effort (`typedoc src/index.ts`,
  publish via GitHub Pages from CI).
- **Add `.editorconfig`** so indentation/EOL conventions survive across
  editors (current files mix formatting in places the linter will also catch).

### I. Prioritized roadmap

**Quick wins (small PRs, no behavior change):**
1. Native `fetch`; drop `node-fetch`, `deepmerge-ts`, `type-guards`, `btoa` shim (C).
2. tsconfig: `target ES2022`, `module/moduleResolution nodenext`, drop `baseUrl` (B).
3. `exports` map + `types` + `sideEffects` in package.json (A.1).
4. `parseAsync` + exit-code handling in the CLI entry (A.3).
5. Fix double first-page fetch in `getMeterConsumption` (E.1).
6. Linter + formatter + CI step + dependabot (H).

**Medium (shapes the 1.x API, do before stabilizing):**
7. Split SDK/CLI entry points (A.2).
8. URL building, timeouts/AbortSignal, injectable fetch (D.1–D.3).
9. Concurrency limiter for fan-out getters (E.3).
10. Pagination helper (E.2); logger injection, kill `console.error` (E.4).
11. Metrics API consolidation — retire the `2` suffix (E.5).
12. Client-type cleanup so `@_` stops leaking (F.2).

**Larger (invest as the project grows):**
13. Offline fixture-replay test tier + CI rebalance (G).
14. XSD-driven codegen for types and the `isArray` list (F.1, D.5).
15. Envelope-level runtime validation with surfaced ESPM error payloads (D.4).
16. TypeDoc site (H).
