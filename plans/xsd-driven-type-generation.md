# XSD-Driven Generation for XML Types and Parser Configuration

Implements review items F.1 and D.5 from `plans/architecture-review-2026-07.md`.
Phase 1 is built; later phases are design intent.

## Why this is tractable (findings from the vendored schemas)

- The ESPM schemas declare **no target namespaces**: all 120 files reference
  each other only via `xs:include`, so every named type, group, and element
  lives in one flat symbol table per schema version. Namespace/import
  resolution — where generic XSD-to-TS tools failed us (see
  `xml-schemas/README.md`) — simply does not exist here.
- Feature usage is narrow: `sequence`/`all`/`choice` compositors, named and
  inline complex types, inline enumeration restrictions, `xs:element ref=`
  (heavy in propertyUse), three `xs:group` refs, one abstract base with
  `xs:extension`, six `xs:union`s. No substitution groups, no `xs:any`.
- The XSDs are plain XML, so the generator parses them with
  **fast-xml-parser** — the same library the runtime uses; no new
  dependencies.

## Side-by-side schema versions

EPA stages each web-services release through the test environment before
production: the upcoming version's docs and schemas are published under
[/webservices/home/test/api](https://portfoliomanager.energystar.gov/webservices/home/test/api)
(serving `wstest`) while the live version remains under
[/webservices/home/api](https://portfoliomanager.energystar.gov/webservices/home/api)
(serving `ws`). During that window the library must support both versions
at once — as of July 2026 this is live reality: production runs 26.0 while
test runs 27.0 (beta released 2026-06-28, production cutover scheduled
2026-08-30, and EPA shipped it with no announcement email or webinar, which
makes generator-driven diffs the practical way to see what changed). The
layout supports this directly:

- Vendor each live version as `xml-schemas/portfoliomanager-schemas-<ver>/`
  (`-26.0` for production and `-27.0` while it is in test — both are
  vendored as of this writing). Remove a directory when EPA retires that
  version from production.
- `npm run generate:xml` processes **every** vendored version and emits
  per-version sets plus the union.
- The runtime consumes the **union** of array jpaths. Union semantics are
  safe across a rollout: a path marked repeatable in either version parses
  as an array-of-one under the other, so consumer-visible shapes stay
  stable while both versions are live.
- Phase 2 types will be emitted per version
  (`src/types/xml/generated/v<ver>/`), with the package's default exports
  aliased to the production version so test-environment consumers can opt
  into the newer tree explicitly.

## Phase 1 — generated isArray jpath list (built)

`scripts/generateXmlTypes.ts` walks every document root of every vendored
schema version and records the jpath of each element with `maxOccurs > 1`,
including elements made repeatable by a repeating enclosing compositor or
group reference.

- Output: `src/types/xml/generated/isArrayJPaths.ts` (committed) — per
  version sets and the union.
- `src/types/xml/arrayJPaths.ts` (hand-maintained, small) applies documented
  exclusions to the union: schema-true paths whose facade consumers still
  model single values. Currently one entry
  (`propertyMetrics.metric.monthlyMetric.value`, deferred to the metrics
  API consolidation, review item E.5).
- `PortfolioManagerApi` consumes `ARRAY_JPATHS`, replacing the hand-written
  14-entry callback. The generated union has 369 entries; drift found on
  day one included `propertyMetrics.metric.monthlyMetric` (single-month
  metric responses previously parsed as objects and crashed the reducers)
  and the `customFieldList.customField` family.
- `src/types/xml/arrayJPaths.spec.ts` pins the legacy 14 as a regression
  floor and asserts the known drift fixes and exclusions.

## Phase 2 — generated interfaces, no consumer changes (built)

The generator emits TypeScript mirrors per schema version into
`src/types/xml/generated/v<ver>.ts` (one file per version):

- named simple types as aliases (enumeration restrictions become
  string-literal unions, `xs:union`s become TS unions), named complex types
  as interfaces (`xs:extension` maps to `extends`), and document roots with
  inline types as `<Name>Element` interfaces.
- attributes as `"@_name"`-prefixed **string** props (the runtime parser
  keeps attribute values unparsed), element values as `number`/`boolean`/
  `string` per the runtime's tag-value parsing, optionality from
  `minOccurs`/`choice`, `T[]` for `maxOccurs > 1`, and `xs:documentation`
  as JSDoc.
- `src/types/xml/generated/typeDrift.ts` (types only, no runtime code)
  asserts hand-written types stay assignable to their generated mirrors.
  Day-one catch: `IAudit` account ids were mistyped as required strings —
  the schema says optional `xs:long`, which parses to `number` at runtime.
  Hand types remain the public exports until phase 3.

## Phase 3 — migrate consumers domain by domain (planned)

Swap facade/CLI/type exports from hand-written to generated types one domain
at a time (meter, property, account, ...), deleting hand files as coverage
takes over. The ~90 propertyUse building-type schemas — never hand-mapped —
become available for free.

## Phase 4 — endpoint catalog to gateway methods (idea)

The API documentation pages enumerate every endpoint per category (HTTP
method, REST URI, description) for both environments:
[live](https://portfoliomanager.energystar.gov/webservices/home/api) and
[test](https://portfoliomanager.energystar.gov/webservices/home/test/api).
Those catalogs could drive generation of the `PortfolioManagerApi` endpoint
method surface (names, paths, verbs, doc comments) the same way the XSDs
drive types. Note the site's WAF blocks non-browser fetches, so the
catalog pages would be vendored as saved HTML/extracted JSON rather than
scraped in CI.

## Schema update procedure (supersedes the manual diff-only flow)

1. Download the new schema set per `xml-schemas/README.md` and vendor it as
   `portfoliomanager-schemas-<ver>/` alongside the version still in
   production.
2. `npm run generate:xml`; review the generated diff (it is the behavioral
   change surface).
3. Run the suite; drop the retired version's directory once EPA promotes
   the new one to production, and regenerate.
