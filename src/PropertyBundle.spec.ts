import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";
import { mockIProperty } from "./Mocks.js";
import {
  sanitizePropertyForBundle,
  serializePropertyBundle,
  validatePropertyBundle,
} from "./PropertyBundle.js";
import {
  PROPERTY_BUNDLE_FORMAT,
  PROPERTY_BUNDLE_SCHEMA,
  PROPERTY_BUNDLE_SCHEMA_DOCUMENT,
  PROPERTY_BUNDLE_VERSION,
  type IPropertyBundleV1,
} from "./types/index.js";

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateAgainstSchema = ajv.compile(PROPERTY_BUNDLE_SCHEMA_DOCUMENT);

function bundle(): IPropertyBundleV1 {
  return {
    $schema: PROPERTY_BUNDLE_SCHEMA,
    format: PROPERTY_BUNDLE_FORMAT,
    formatVersion: PROPERTY_BUNDLE_VERSION,
    capabilities: ["property"],
    properties: [{ ref: "property:1", property: mockIProperty() }],
  };
}

describe("property bundles", () => {
  it("projects properties and nested values onto the portable allowlist", () => {
    const property = {
      ...mockIProperty(),
      id: 123,
      accessLevel: "Full",
      audit: { createdBy: "user" },
      grossFloorArea: {
        value: 8000,
        "@_units": "Square Feet",
        "@_temporary": "false",
        id: 456,
        "@_default": "No",
        audit: { createdBy: "user" },
        currentAsOf: new Date("2026-08-05T12:34:56Z"),
      },
      irrigatedArea: {
        value: 25,
        units: "Square Feet",
        default: "No",
        id: 789,
        audit: { createdBy: "user" },
      },
      address: { ...mockIProperty().address, responseOnly: true },
      agency: {
        id: 1,
        code: "GSA",
        name: "General Services Administration",
        country: "US",
        responseOnly: true,
      },
      responseOnly: true,
    } as never;

    expect(sanitizePropertyForBundle(property)).toEqual({
      ...mockIProperty(),
      grossFloorArea: {
        ...mockIProperty().grossFloorArea,
        "@_temporary": false,
        currentAsOf: "2026-08-05",
      },
      irrigatedArea: {
        value: 25,
        units: "Square Feet",
        default: false,
      },
      agency: {
        id: 1,
        code: "GSA",
        name: "General Services Administration",
        country: "US",
      },
    });
  });

  it("rejects malformed nested source values after projecting the allowlist", () => {
    const property = {
      ...mockIProperty(),
      grossFloorArea: 8000,
      irrigatedArea: 25,
      address: "123 Main St",
      agency: "GSA",
      notes: undefined,
      responseOnly: true,
    } as never;

    expect(() => sanitizePropertyForBundle(property)).toThrow(
      "properties[0].property.grossFloorArea must be an object",
    );
  });

  it("normalizes API string booleans and rejects unknown values", () => {
    const truthy = sanitizePropertyForBundle({
      ...mockIProperty(),
      grossFloorArea: {
        ...mockIProperty().grossFloorArea,
        "@_temporary": "true",
      },
      irrigatedArea: { default: "Yes", units: "Acres", value: 25 },
    } as never);
    expect(truthy.grossFloorArea["@_temporary"]).toBe(true);
    expect(truthy.irrigatedArea?.default).toBe(true);

    const boolean = sanitizePropertyForBundle({
      ...mockIProperty(),
      grossFloorArea: {
        ...mockIProperty().grossFloorArea,
        "@_temporary": false,
      },
      irrigatedArea: { default: true, units: "Acres", value: 25 },
    });
    expect(boolean.grossFloorArea["@_temporary"]).toBe(false);
    expect(boolean.irrigatedArea?.default).toBe(true);

    expect(() =>
      sanitizePropertyForBundle({
        ...mockIProperty(),
        grossFloorArea: {
          ...mockIProperty().grossFloorArea,
          "@_temporary": "sometimes",
        },
      } as never),
    ).toThrow("grossFloorArea.@_temporary must be a boolean");
  });

  it("serializes fields canonically", () => {
    const value = bundle();
    const serialized = serializePropertyBundle(value, 0);

    expect(serialized).toBe(
      JSON.stringify({
        $schema: PROPERTY_BUNDLE_SCHEMA,
        capabilities: ["property"],
        format: PROPERTY_BUNDLE_FORMAT,
        formatVersion: PROPERTY_BUNDLE_VERSION,
        properties: [
          {
            property: {
              address: {
                "@_address1": "123 Main St",
                "@_city": "Test",
                "@_country": "US",
                "@_postalCode": "1234567",
                "@_state": "NY",
              },
              constructionStatus: "Test",
              grossFloorArea: {
                "@_units": "Square Feet",
                value: 8000,
              },
              isFederalProperty: false,
              name: "Test Property",
              occupancyPercentage: 80,
              primaryFunction: "Data Center",
              yearBuilt: 2022,
            },
            ref: "property:1",
          },
        ],
      }),
    );
    expect(serializePropertyBundle(value)).toContain('\n  "$schema"');
  });

  it("rejects unsupported versions, duplicate refs, and response fields", () => {
    expect(() =>
      validatePropertyBundle({ ...bundle(), formatVersion: 2 }),
    ).toThrow("Unsupported property bundle version: 2");
    expect(() =>
      validatePropertyBundle({
        ...bundle(),
        properties: [bundle().properties[0], bundle().properties[0]],
      }),
    ).toThrow("Duplicate property ref: property:1");
    expect(() =>
      validatePropertyBundle({
        ...bundle(),
        properties: [
          {
            ref: "property:1",
            property: { ...mockIProperty(), id: 123 },
          },
        ],
      }),
    ).toThrow("has unknown field(s): id");
    expect(() =>
      validatePropertyBundle({
        ...bundle(),
        properties: [
          {
            ref: "property:1",
            property: {
              ...mockIProperty(),
              grossFloorArea: {
                ...mockIProperty().grossFloorArea,
                audit: {},
              },
            },
          },
        ],
      }),
    ).toThrow("grossFloorArea has unknown field(s): audit");
  });

  it("rejects malformed bundle structure", () => {
    const valid = bundle();
    const cases: Array<[unknown, string]> = [
      [null, "Property bundle must be an object"],
      [
        { ...valid, extra: true },
        "Property bundle has unknown field(s): extra",
      ],
      [{ ...valid, $schema: "other" }, "Unsupported property bundle schema"],
      [{ ...valid, format: "other" }, "Unsupported property bundle format"],
      [{ ...valid, capabilities: "property" }, "capabilities"],
      [{ ...valid, capabilities: [] }, "capabilities"],
      [{ ...valid, capabilities: ["meter"] }, "capabilities"],
      [{ ...valid, properties: "property" }, "at least one property"],
      [{ ...valid, properties: [] }, "at least one property"],
      [{ ...valid, properties: [null] }, "properties[0] must be an object"],
      [
        { ...valid, properties: [{ ...valid.properties[0], extra: true }] },
        "properties[0] has unknown field(s): extra",
      ],
      [
        { ...valid, properties: [{ ref: 1, property: mockIProperty() }] },
        "ref must match",
      ],
      [
        {
          ...valid,
          properties: [{ ref: "property:0", property: mockIProperty() }],
        },
        "ref must match",
      ],
      [
        { ...valid, properties: [{ ref: "property:1", property: null }] },
        "property must be an object",
      ],
      [
        {
          ...valid,
          properties: [
            {
              ref: "property:1",
              property: { ...mockIProperty(), name: undefined },
            },
          ],
        },
        "property.name is required",
      ],
    ];

    for (const [value, message] of cases) {
      expect(() => validatePropertyBundle(value)).toThrow(message);
    }
  });

  it("rejects invalid property field types", () => {
    const valid = bundle();
    const withProperty = (property: unknown) => ({
      ...valid,
      properties: [{ ref: "property:1", property }],
    });
    const base = mockIProperty();
    const cases: Array<[unknown, string]> = [
      [{ ...base, name: 1 }, "name must contain"],
      [{ ...base, name: "" }, "name must contain"],
      [{ ...base, name: "x".repeat(81) }, "name must contain"],
      [
        { ...base, constructionStatus: 1 },
        "constructionStatus must be Existing, Project, or Test",
      ],
      [
        { ...base, constructionStatus: "Other" },
        "constructionStatus must be Existing, Project, or Test",
      ],
      [
        { ...base, primaryFunction: 1 },
        "primaryFunction must be a non-empty string",
      ],
      [
        { ...base, primaryFunction: "" },
        "primaryFunction must be a non-empty string",
      ],
      [{ ...base, yearBuilt: "2022" }, "yearBuilt must be an integer"],
      [{ ...base, yearBuilt: 2022.5 }, "yearBuilt must be an integer"],
      [
        { ...base, isFederalProperty: "false" },
        "isFederalProperty must be a boolean",
      ],
      [
        { ...base, occupancyPercentage: "80" },
        "occupancyPercentage must be a multiple of 5",
      ],
      [
        { ...base, occupancyPercentage: Number.POSITIVE_INFINITY },
        "occupancyPercentage must be a multiple of 5",
      ],
      [
        { ...base, occupancyPercentage: -5 },
        "occupancyPercentage must be a multiple of 5",
      ],
      [
        { ...base, occupancyPercentage: 105 },
        "occupancyPercentage must be a multiple of 5",
      ],
      [
        { ...base, occupancyPercentage: 82 },
        "occupancyPercentage must be a multiple of 5",
      ],
      [{ ...base, grossFloorArea: 8000 }, "grossFloorArea must be an object"],
      [{ ...base, address: "123 Main St" }, "address must be an object"],
      [
        { ...base, address: { ...base.address, extra: true } },
        "address has unknown field(s): extra",
      ],
      [
        { ...base, address: { ...base.address, "@_county": 1 } },
        "address.@_county must be a string",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, "@_units": undefined },
        },
        "grossFloorArea.@_units must be Square Feet or Square Meters",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, "@_units": "Acres" },
        },
        "grossFloorArea.@_units must be Square Feet or Square Meters",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, "@_temporary": "false" },
        },
        "grossFloorArea.@_temporary must be a boolean",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, currentAsOf: 20260805 },
        },
        "grossFloorArea.currentAsOf must be a valid YYYY-MM-DD date",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, currentAsOf: "August 5" },
        },
        "grossFloorArea.currentAsOf must be a valid YYYY-MM-DD date",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, currentAsOf: "2026-02-30" },
        },
        "grossFloorArea.currentAsOf must be a valid YYYY-MM-DD date",
      ],
      [{ ...base, irrigatedArea: 25 }, "irrigatedArea must be an object"],
      [
        { ...base, irrigatedArea: { value: 25, extra: true } },
        "irrigatedArea has unknown field(s): extra",
      ],
      [
        { ...base, irrigatedArea: { value: 25 } },
        "irrigatedArea.units must be Square Feet",
      ],
      [
        { ...base, irrigatedArea: { units: "Yards", value: 25 } },
        "irrigatedArea.units must be Square Feet",
      ],
      [
        { ...base, irrigatedArea: { units: "Acres", value: "25" } },
        "irrigatedArea.value must be a finite number or an empty string",
      ],
      [
        { ...base, irrigatedArea: { units: "Acres", value: Number.NaN } },
        "irrigatedArea.value must be a finite number or an empty string",
      ],
      [
        {
          ...base,
          irrigatedArea: { default: "No", units: "Acres", value: 25 },
        },
        "irrigatedArea.default must be a boolean",
      ],
      [
        { ...base, grossFloorArea: { ...base.grossFloorArea, value: "8000" } },
        "grossFloorArea.value must be a finite number",
      ],
      [
        {
          ...base,
          grossFloorArea: { ...base.grossFloorArea, value: Number.NaN },
        },
        "grossFloorArea.value must be a finite number",
      ],
      [
        { ...base, address: { ...base.address, "@_country": 1 } },
        "address.@_country must be a string",
      ],
      [
        { ...base, numberOfBuildings: "2" },
        "numberOfBuildings must be a finite number",
      ],
      [
        { ...base, numberOfBuildings: Number.POSITIVE_INFINITY },
        "numberOfBuildings must be a finite number",
      ],
      [{ ...base, federalOwner: 1 }, "federalOwner must be a string"],
      [{ ...base, agency: "GSA" }, "agency must be an object"],
      [
        { ...base, agency: { id: 1, country: "US", extra: true } },
        "agency has unknown field(s): extra",
      ],
      [
        { ...base, agency: { id: "1", country: "US" } },
        "agency.id must be an integer",
      ],
      [
        { ...base, agency: { id: 1.5, country: "US" } },
        "agency.id must be an integer",
      ],
      [
        { ...base, agency: { id: 1, country: 1 } },
        "agency.country must be a string",
      ],
      [
        { ...base, agency: { id: 1, country: "US", code: 1 } },
        "agency.code must be a string",
      ],
      [
        { ...base, agencyDepartmentRegion: 1 },
        "agencyDepartmentRegion must be a string",
      ],
      [
        { ...base, isInstitutionalProperty: "false" },
        "isInstitutionalProperty must be a boolean",
      ],
    ];

    for (const [property, message] of cases) {
      expect(() => validatePropertyBundle(withProperty(property))).toThrow(
        message,
      );
    }

    expect(() =>
      validatePropertyBundle(
        withProperty({
          ...base,
          grossFloorArea: {
            ...base.grossFloorArea,
            "@_temporary": false,
            currentAsOf: "2026-08-05",
          },
          irrigatedArea: { default: false, units: "Acres", value: "" },
          address: {
            ...base.address,
            "@_address2": "Suite 100",
            "@_county": "Test County",
            "@_otherState": "Other",
          },
          numberOfBuildings: 2,
          federalOwner: "US",
          agency: {
            id: 1,
            code: "GSA",
            name: "General Services Administration",
            country: "US",
          },
          agencyDepartmentRegion: "Region 1",
          federalCampus: "Test Campus",
          notes: "Portable fixture",
          isInstitutionalProperty: false,
        }),
      ),
    ).not.toThrow();
  });

  it("keeps the runtime validator in parity with the embedded schema", () => {
    const valid = bundle();
    const withProperty = (property: unknown) => ({
      ...valid,
      properties: [{ ref: "property:1", property }],
    });
    const base = mockIProperty();
    const fixtures: Array<[string, unknown, boolean]> = [
      ["minimal", valid, true],
      [
        "all portable fields",
        withProperty({
          ...base,
          grossFloorArea: {
            ...base.grossFloorArea,
            "@_temporary": false,
            currentAsOf: "2026-08-05",
          },
          irrigatedArea: { default: false, units: "Acres", value: "" },
          numberOfBuildings: 2,
          federalOwner: "US",
          agency: { id: 1, code: "GSA", name: "GSA", country: "US" },
          agencyDepartmentRegion: "Region 1",
          federalCampus: "Test Campus",
          notes: "Fixture",
          isInstitutionalProperty: false,
        }),
        true,
      ],
      [
        "construction status",
        withProperty({ ...base, constructionStatus: "Other" }),
        false,
      ],
      [
        "agency required fields",
        withProperty({ ...base, agency: { id: 1 } }),
        false,
      ],
      [
        "irrigated area value",
        withProperty({
          ...base,
          irrigatedArea: { units: "Acres", value: "25" },
        }),
        false,
      ],
      [
        "floor area date",
        withProperty({
          ...base,
          grossFloorArea: {
            ...base.grossFloorArea,
            currentAsOf: "2026-02-30",
          },
        }),
        false,
      ],
    ];

    expect(PROPERTY_BUNDLE_SCHEMA_DOCUMENT.$id).toBe(PROPERTY_BUNDLE_SCHEMA);
    expect(PROPERTY_BUNDLE_SCHEMA_DOCUMENT.properties.$schema.const).toBe(
      PROPERTY_BUNDLE_SCHEMA,
    );
    for (const [name, value, expected] of fixtures) {
      const schemaResult = validateAgainstSchema(value);
      expect(
        schemaResult,
        `${name}: ${ajv.errorsText(validateAgainstSchema.errors)}`,
      ).toBe(expected);
      if (expected) {
        expect(() => validatePropertyBundle(value), name).not.toThrow();
      } else {
        expect(() => validatePropertyBundle(value), name).toThrow();
      }
    }
  });
});
