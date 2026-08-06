# Plan: End-to-End Connection & Sharing Tests (Playwright-seeded)

Status: Draft
Date: 2026-07-04
Owner: Darrel O'Pry

## Problem

The connection and sharing client methods added in
`feature/espm-account-connection-support` (`getPendingConnections`,
`acceptConnection`, `rejectConnection`, `disconnect`,
`getPendingPropertyShares`, `getPendingMeterShares`, accept/reject share,
`unshareProperty`, `unshareMeter`) are currently only covered by mocked unit
tests. They cannot be exercised against the live `wstest` environment because
**ESPM's web services API is receive-only for connections and shares**: a
provider can list pending requests and accept/reject them, but there is no API
to _initiate_ a connection request or a share. Initiation is done exclusively
by a standard Portfolio Manager user through the web UI
(`src/PortfolioManagerApi.ts` notes this: "Pending response wrappers depend on
externally seeded requests in TEST").

Per EPA's provider guidance ([Connection and Sharing for Data
Exchange](https://portfoliomanager.energystar.gov/pdf/reference/Connection_and_Sharing_for_Data_Exchange_en_US.pdf),
[How to Share Properties](https://www.energystar.gov/sites/default/files/2025-01/How%20to%20Share%20Properties%20with%20Other%20Portfolio%20Manager%20Users_December%202024.pdf)),
the flow is:

1. **User → UI**: adds the provider as a contact and sends a connection
   request (Contacts → Add New Contacts/Connections → search by username →
   Connect → accept Terms of Use → Send Connection Request).
2. **Provider → API**: `GET /connect/account/pending/list`, then
   `POST /connect/account/{accountId}` to accept/reject.
3. **User → UI**: Sharing tab → **Share (or Edit Access to) a Property** → select
   properties and provider → **Personalized Sharing & Exchange Data** →
   configure Exchange Data permissions for each property → **Share
   Property(ies)**.
4. **Provider → API**: `GET /share/property/pending/list`,
   `POST /share/property/{propertyId}`; same for meters via
   `GET /share/meter/pending/list`, `POST /share/meter/{meterId}`.

## Approach

Use **Playwright to automate the "standard user" side** in the ESPM **test web
UI** (`https://portfoliomanager.energystar.gov/pmtest`), seeding connection
and share requests aimed at our web-services test account. The existing
vitest integration suite then exercises the SDK (provider side) against
`https://portfoliomanager.energystar.gov/wstest/` to accept/reject/verify, and
cleans up.

Both environments back onto the same test accounts/data, so a request created
in `pmtest` shows up in `wstest` pending lists.

### Two test accounts

| Role           | Account                            | Credentials (env)               | Purpose                                                                                                                            |
| -------------- | ---------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Provider (SUT) | existing web-services test account | `PM_USERNAME` / `PM_PASSWORD`   | The account our SDK acts as; accepts/rejects via API. Must be searchable (Account Settings → Your Preferences → searchable = Yes). |
| Peer (seeder)  | persistent peer test account       | `PM_USERNAME2` / `PM_PASSWORD2` | Long-lived peer account, driven by Playwright in `pmtest`; owns fixture property + meters; initiates connections and shares.       |

### Runner choice: Playwright as a library inside vitest (recommended)

Use the `playwright` npm package (library, not `@playwright/test`) from within
a vitest integration spec. Rationale:

- Keeps a single test runner, config, and env-var gating convention
  (`PM_USERNAME` checks already gate the live suite).
- The lifecycle is inherently interleaved (UI seed → API accept → UI share →
  API accept → API verify → API cleanup); one runner makes ordering explicit
  in a single spec instead of coordinating two runners with global-setup
  hand-offs.
- We don't need `@playwright/test` fixtures/parallelism; tracing can be
  enabled manually (`context.tracing.start()/stop()`) and saved on failure.

Alternative considered: a separate `@playwright/test` project that imports the
SDK for the API steps. Rejected for now — second runner/config/report for no
added value at this scale. Revisit if the UI-automation surface grows.

## Work breakdown

### 0. Spike / validate assumptions — DONE (validated live 2026-07-04)

- [x] Peer account (`PM_USERNAME2`) exists and logs in to `pmtest`.
- [x] Peer account can call the `wstest` API with basic auth — fixtures are
      created via the SDK (`ensureStandardProperties`/`ensureStandardMeterFixture`).
- [x] Connect + share flows walked with `test/wstest-e2e/probe.ts`; selectors
      captured in `test/wstest-e2e/EspmWebUi.ts`. Notable findings: pages hang on
      the `load` event (wait for `domcontentloaded`), page content renders
      via JS after load, contacts live at `/contact/list` (not `/contacts`),
      and the share flow is an Angular app (`wsBulkSharing`,
      `#modalDialogSelectProperties`).
- [x] No CAPTCHA, MFA, or WAF blockers for headless Chromium login.
- [x] Provider account had no Terms of Use / custom fields (no agreement
      checkbox rendered). **Gotcha found:** the provider account was not
      _searchable_, so the peer's contact search returned zero results.
      Fixed via `npx tsx test/wstest-e2e/probe.ts provider-settings --make-searchable`
      — a persistent account setting, re-apply after an EPA test-environment
      refresh.

### 1. Dependencies & scaffolding

- Add `playwright` to `devDependencies`; add `npx playwright install chromium`
  to CI and CONTRIBUTING setup notes.
- New directory `test/wstest-e2e/` (as built):
  - `test/wstest-e2e/EspmWebUi.ts` — page-object style helper around a Playwright
    `Page`: `login()`, `sendConnectionRequest(providerUsername)`,
    `setupDataExchangeShare({ propertyNames, accessLevel })`, `close()`.
  - `test/wstest-e2e/support.ts` — env config plus orchestration helpers combining
    SDK + UI: `ensureCleanProviderState()`, `disconnectIfConnected()`,
    `ensurePeerFixtures()`, `waitFor()`.
  - `test/wstest-e2e/probe.ts` / `test/wstest-e2e/state.ts` — selector-maintenance and
    pending-state debug utilities.
- Env vars: `PM_USERNAME2`, `PM_PASSWORD2` (persistent peer account), optional
  `PM_WEB_ENDPOINT` (default `https://portfoliomanager.energystar.gov/pmtest`),
  `E2E_HEADLESS` (default true), `E2E_TRACE_DIR` (trace output directory,
  default `test-results/wstest-e2e`; traces are written on failure).

### 2. Fixture & state management

- Fixture setup (SDK, peer creds against `wstest`): one property with one
  electric meter, fixed names (`E2E Share Fixture Property` /
  `E2E Share Fixture Meter`) reused idempotently across runs via the
  `ensure*` helpers; correlation happens through timestamped notes on
  accept/reject calls.
- Clean state before each run, from the provider side (API only):
  `ensureCleanProviderState()` rejects pending connections/shares from the
  peer, and `disconnectIfConnected()` drops an established connection with
  `keepShares: false`.
- Extend `scripts/wipeTestEnvironment.ts` to also reject all pending
  connections/property/meter shares and disconnect all connected accounts, so
  `wipe:test-environment` returns the provider account to baseline.

### 3. Integration spec

`test/wstest-e2e/connectionSharing.wstest-e2e.spec.ts` (run only via
`npm run test:wstest-e2e`;
fails fast with a clear error unless provider + peer creds are set, matching
the repo's live-test convention), sequential lifecycle:

1. **Connection**: seed connection request via UI →
   `getPendingConnections()` contains the peer account →
   `acceptConnection(accountId, note)` → pending list is empty.
2. **Bulk recovery probe**: exercise **Set Up Web Services/Data Exchange** →
   bulk Full Access. Permit only WSTest's known `authorizeExchange.json` HTTP
   500 with `{}`; fail for any other error, and intentionally fail when the
   endpoint starts succeeding so the quarantine is removed.
3. **Property share (accept)**: seed a personalized Exchange Data share of the
   fixture property (Full Access) → `getPendingPropertyShares()` →
   `acceptPropertyShare()` → verify real access: `getProperty(propertyId)` /
   property metrics succeed from the provider account.
4. **Meter share**: `getPendingMeterShares()` → accept → verify
   `getMeter`/consumption access. Cover the documented coupling: accepting a
   meter share auto-accepts the pending property share, while accepting a
   property share does **not** auto-accept meter shares.
5. **Reject path**: seed a second share → `rejectPropertyShare()` → pending
   list empty, no access granted.
6. **Unshare / disconnect**: `unshareProperty()` removes access;
   `disconnect({ keepShares: false })` → connection gone; re-verify provider
   has no residual access.
7. Cleanup in `afterAll` (best-effort, mirrors `ensureCleanState`).

Out of scope for v1 (note as future scenarios): share-forward/middleman
(PDA vs `notificationCreatedByAccountId`), transfer of ownership, custom
fields on connect/share, pending-list pagination (>1 page requires seeding
many requests), `SHAREUPDATE` notifications on permission edits.

### 4. npm scripts & CI

- `"test:wstest-e2e": "vitest run --config vitest.wstest-e2e.config.ts"`;
  exclude `*.wstest-e2e.spec.ts` from the default
  `vitest run` so the default suite does not install or drive a browser.
- GitHub Actions: `wstest-e2e` job/workflow.
  - Secrets: `PM_USERNAME`, `PM_PASSWORD`, `PM_USERNAME2`, `PM_PASSWORD2`.
  - Run in `CI / wstest-e2e` for trusted pull requests and `main`/`next`
    pushes, nightly, and by manual dispatch. Fork contributors run it in their
    fork with their own credentials.
  - `concurrency: { group: espm-wstest-e2e, cancel-in-progress: false }` —
    the test accounts are a shared singleton; runs must serialize.
  - Upload Playwright traces/screenshots as artifacts on failure.

## Risks & mitigations

- **UI drift**: ESPM ships releases ~2×/year and the UI may change without
  notice. Isolate all selectors in `EspmWebUi.ts`; prefer role/label-based
  locators over CSS; nightly runs surface drift quickly.
- **EPA test-environment refreshes**: EPA periodically refreshes/wipes test
  data. Seeding is idempotent and recreates fixtures from scratch; document
  account re-creation in CONTRIBUTING.
- **Anti-automation on login** (CAPTCHA/WAF): spike item 0. If blocking,
  fall back to a documented manual seeding runbook + `wstest`-only assertions.
- **Rate limits** on `wstest`: keep the suite small and serialized; back off
  on 429s in the SDK test helpers.
- **Shared-state flakiness**: timestamped fixture names + notes let us
  correlate and clean stale artifacts from crashed runs; `ensureCleanState()`
  makes reruns safe.
- **Terms of use / propriety**: we are automating our _own_ test accounts in
  the environment EPA provides specifically for provider testing; keep
  request volume minimal and off production.

## Open questions

1. Can the peer test account call the `wstest` API for fixture
   creation, or must fixtures be created through the UI? (spike)
2. Does `pmtest` login present CAPTCHA/MFA for scripted browsers? (spike)
3. Are Terms of Use / custom fields configured on the provider test account,
   and do we want them configured to exercise that dialog path? (spike)
4. Do we eventually want the seeder exposed as a CLI command
   (`portfolio-manager test seed-shares`) for contributors without CI access?

## References

- EPA, _How to Use Web Services: Connection and Sharing Guidance for
  Providers_ — https://portfoliomanager.energystar.gov/pdf/reference/Connection_and_Sharing_for_Data_Exchange_en_US.pdf
- EPA, _How to Share Properties with Other Portfolio Manager Users_ (Dec 2024)
  — https://www.energystar.gov/sites/default/files/2025-01/How%20to%20Share%20Properties%20with%20Other%20Portfolio%20Manager%20Users_December%202024.pdf
- EPA, _Testing Web Services_ —
  https://portfoliomanager.energystar.gov/pdf/reference/Testing_Web_Services_en_US.pdf
  (test UI: `…/pmtest`, test API: `…/wstest`)
- Provider-side API surface: `src/PortfolioManagerApi.ts:506-604`,
  client methods: `src/PortfolioManager.ts:694-860`.
