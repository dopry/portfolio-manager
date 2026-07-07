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

## Implemeneting Schema Types

The types from the schemas are manually created in [/src/types/xml](/src/types/xml). I haven't found a good nodejs xml library for converting these into any sort of usable typed interface. I've tried a few, but have consistently ran into issues dealing with imports and type references. XML support in the Node.JS community is not mature and isn't a priority for the wider community. JSON is the serialization of choixe in the NodeJS community.
