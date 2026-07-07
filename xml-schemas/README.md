# XML Schemas

## Updating the portfoliomanager-schemas folders

The schemas stored here track the upstream Portfolio Manager schemas, one
`portfoliomanager-schemas-<version>/` directory per version that is live in
either environment. EPA stages releases through the test environment before
production, so during a rollout two directories are vendored side by side:

- Production (`ws`) schemas: [Download all the schemas](https://portfoliomanager.energystar.gov/webservices/home/api)
- Test (`wstest`) schemas: [Download all the schemas (test)](https://portfoliomanager.energystar.gov/webservices/home/test/api)

When a new version appears in test, vendor it as a new
`portfoliomanager-schemas-<version>/` directory alongside the production
one and run `npm run generate:xml` (the generator processes every vendored
version and the runtime consumes the union). When EPA promotes the version
to production, delete the retired directory and regenerate. A unified diff
summarizing the changes is kept as `{prev version}-{current version}.diff`;
strip the version lines so the diff only shows significant changes.

## Implementing Schema Types

The types from the schemas are manually created in [/src/types/xml](/src/types/xml). Generic XSD-to-TypeScript converters consistently ran into issues dealing with imports and type references, so the repo now generates parser configuration from the schemas itself with a purpose-built script (`npm run generate:xml`; see [plans/xsd-driven-type-generation.md](/plans/xsd-driven-type-generation.md)) — the ESPM schemas declare no namespaces, which is what made the generic tools stumble and a purpose-built walker straightforward. Hand-written types remain in place until the generated-types phases land.
