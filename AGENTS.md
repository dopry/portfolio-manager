# AGENTS.md

`MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` are normative.

## Work

- MUST work in a dedicated Git worktree, separate from the primary checkout.
- MUST NOT write in the primary checkout. MAY inspect it read-only.
- MUST fetch and rebase feature branches onto latest `origin/next` before opening or updating a PR and before merge.
- MUST understand the affected flow before changing it.
- MUST skip unneeded work. MUST reuse existing code, standard library, platform features, and installed dependencies before adding code.
- MUST implement only the minimum correct change. MUST NOT add speculative abstractions, dependencies, options, or features.
- MUST NOT cut correctness, validation, security, data safety, accessibility, or test quality.

## Communication

- MUST treat context, input tokens, and output tokens as costs.
- MUST preserve technical substance while removing filler, ceremony, hedging, repetition, and routine play-by-play.
- SHOULD use short, exact sentences or fragments. MUST preserve commands, paths, identifiers, errors, and API details exactly.
- MAY expand when safety, ambiguity, or complex reasoning requires clarity.

## API

This is a client for ENERGY STAR Portfolio Manager web services.

- MUST use https://portfoliomanager.energystar.gov/webservices/home as the primary API reference, not infallible truth.
- MUST investigate disagreements among docs, observed upstream behavior, code, tests, and generated types.
- MUST reproduce surprising or contradictory behavior with focused real upstream calls when safe.
- MUST document confirmed upstream discrepancies in tests, sanitized fixtures, or code comments.
- MUST NOT encode unverified guesses or inferences as API behavior.

## Tests

Goal: green PR means safe stable release.

- SHOULD strongly favor real upstream integration tests over mocks.
- MUST validate every behavior-affecting change with relevant tests.
- MUST test material assumptions with the cheapest reliable evidence before implementation.
- MUST cover new or changed upstream interactions with a real call or a sanitized fixture captured from a real call.
- MUST test real auth, serialization, transport, parsing, validation, pagination, errors, and resource lifecycles when upstream permits.
- SHOULD test against `https://portfoliomanager.energystar.gov/wstest/` with test credentials.
- MAY use `https://portfoliomanager.energystar.gov/ws/` with live credentials only for behavior unavailable in `wstest`; currently, What's Changed requires live testing.
- MUST mutate or delete only resources created and managed by this project's CI/CD test flows.
- MUST NOT alter pre-existing, manually created, or externally managed account data.
- MUST create every test property with `constructionStatus: Test`.
- MUST isolate test data. MUST scope cleanup to automation-owned resource IDs, including after failure.
- MUST handle upstream latency and eventual consistency without weakening assertions.
- MAY mock unsafe, unreliable, or unreachable edge cases needed for 100% coverage.
- MUST prefer captured upstream responses. MUST preserve relevant status, headers, and body. MUST sanitize secrets and personal data. SHOULD record operation and scenario.
- MUST NOT invent mocks to avoid integration testing.

## Done

- MUST use Conventional Commits: `<type>[optional scope][!]: <description>`. Semantic Release derives versions and changelogs from commits.
- MUST address review comments and feedback with new commits. MUST NOT amend or squash them until explicitly asked to squash.
- MUST run relevant typecheck, build, and integration tests per `CONTRIBUTING.md` and `README.md`.
- MUST report blocked tests. MUST NOT replace them with invented mocks.
