# XML Schemas

## Updating the portfoliomanager-schema folder

The schema stored here is for reference and should track the production upstream portfolio manager schema. As new releases are made upstream we should [Download all the schemas](https://portfoliomanager.energystar.gov/webservices/home/api), delete our portfoliomanager-schema folder, and extract the new schema into that location. Then we can generated a unified diff to summary the changes as `{prev version}-{current version}.diff`
Note that we should strip out the version lines so that the diff only has significant changes to simplify quick review.

## Implemeneting Schema Types

The types from the schemas are manually created in [/src/types/xml](/src/types/xml). I haven't found a good nodejs xml library for converting these into any sort of usable typed interface. I've tried a few, but have consistently ran into issues dealing with imports and type references. XML support in the Node.JS community is not mature and isn't a priority for the wider community. JSON is the serialization of choixe in the NodeJS community.
