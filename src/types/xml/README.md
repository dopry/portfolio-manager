# XML Schema Types

These types are derived directly from the XML Schema as the types are interpreted by fast-xml-parser. Attributes
should be prefixed with "@\_".

Where types can have significantly different forms based on context we should implement a type hierarchy and type-guards to make working with them easier for consumers. See [IResponse](/src/types/xml/response/IResponse.ts) and [IMeterData](/src/types/xml/meter/IMeterData.ts) for examples.
