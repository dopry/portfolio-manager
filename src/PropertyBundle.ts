import {
  PROPERTY_BUNDLE_FORMAT,
  PROPERTY_BUNDLE_SCHEMA,
  PROPERTY_BUNDLE_VERSION,
  type IPropertyBundleV1,
  type PortableProperty,
} from "./types/index.js";
import type { IClientProperty } from "./types/client/IClientProperty.js";
import { isRecord } from "./types/xml/response/IResponse.js";

const BUNDLE_KEYS = new Set([
  "$schema",
  "format",
  "formatVersion",
  "capabilities",
  "properties",
]);
const ENTRY_KEYS = new Set(["ref", "property"]);
const CONSTRUCTION_STATUSES = new Set(["Existing", "Project", "Test"]);
const FLOOR_AREA_KEYS = new Set([
  "@_units",
  "@_temporary",
  "currentAsOf",
  "value",
]);
const FLOOR_AREA_UNITS = new Set(["Square Feet", "Square Meters"]);
const IRRIGATED_AREA_KEYS = new Set(["default", "units", "value"]);
const IRRIGATED_AREA_UNITS = new Set([
  "Square Feet",
  "Square Meters",
  "Acres",
  "",
]);
const AGENCY_KEYS = new Set(["id", "code", "name", "country"]);
const ADDRESS_KEYS = new Set([
  "@_address1",
  "@_address2",
  "@_city",
  "@_county",
  "@_postalCode",
  "@_state",
  "@_otherState",
  "@_country",
]);
const REQUIRED_ADDRESS_KEYS = [
  "@_address1",
  "@_city",
  "@_postalCode",
  "@_country",
] as const;
const PROPERTY_KEYS = new Set([
  "name",
  "constructionStatus",
  "primaryFunction",
  "grossFloorArea",
  "irrigatedArea",
  "yearBuilt",
  "address",
  "numberOfBuildings",
  "isFederalProperty",
  "federalOwner",
  "agency",
  "agencyDepartmentRegion",
  "federalCampus",
  "occupancyPercentage",
  "notes",
  "isInstitutionalProperty",
]);
const REQUIRED_PROPERTY_KEYS = [
  "name",
  "constructionStatus",
  "primaryFunction",
  "grossFloorArea",
  "yearBuilt",
  "address",
  "isFederalProperty",
  "occupancyPercentage",
] as const;

function assertKnownKeys(
  value: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  path: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new TypeError(`${path} has unknown field(s): ${unknown.join(", ")}`);
  }
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    );
  }
  return value;
}

function normalizeBoolean(value: unknown): unknown {
  if (typeof value !== "string") return value;
  switch (value.toLowerCase()) {
    case "true":
    case "yes":
      return true;
    case "false":
    case "no":
      return false;
    default:
      return value;
  }
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function assertPortableProperty(
  property: unknown,
): asserts property is PortableProperty {
  validatePropertyBundle({
    $schema: PROPERTY_BUNDLE_SCHEMA,
    format: PROPERTY_BUNDLE_FORMAT,
    formatVersion: PROPERTY_BUNDLE_VERSION,
    capabilities: ["property"],
    properties: [{ ref: "property:1", property }],
  });
}

export function sanitizePropertyForBundle(
  property: IClientProperty,
): PortableProperty {
  const grossFloorArea = isRecord(property.grossFloorArea)
    ? {
        "@_units": property.grossFloorArea["@_units"],
        "@_temporary": normalizeBoolean(property.grossFloorArea["@_temporary"]),
        currentAsOf: property.grossFloorArea.currentAsOf,
        value: property.grossFloorArea.value,
      }
    : property.grossFloorArea;
  const irrigatedArea = isRecord(property.irrigatedArea)
    ? {
        default: normalizeBoolean(property.irrigatedArea.default),
        units: property.irrigatedArea.units,
        value: property.irrigatedArea.value,
      }
    : property.irrigatedArea;
  const address = isRecord(property.address)
    ? {
        "@_address1": property.address["@_address1"],
        "@_address2": property.address["@_address2"],
        "@_city": property.address["@_city"],
        "@_county": property.address["@_county"],
        "@_postalCode": property.address["@_postalCode"],
        "@_state": property.address["@_state"],
        "@_otherState": property.address["@_otherState"],
        "@_country": property.address["@_country"],
      }
    : property.address;
  const agency = isRecord(property.agency)
    ? {
        id: property.agency.id,
        code: property.agency.code,
        name: property.agency.name,
        country: property.agency.country,
      }
    : property.agency;

  const portable = canonicalize({
    name: property.name,
    constructionStatus: property.constructionStatus,
    primaryFunction: property.primaryFunction,
    grossFloorArea,
    ...(irrigatedArea === undefined ? {} : { irrigatedArea }),
    yearBuilt: property.yearBuilt,
    address,
    numberOfBuildings: property.numberOfBuildings,
    isFederalProperty: property.isFederalProperty,
    federalOwner: property.federalOwner,
    agency,
    agencyDepartmentRegion: property.agencyDepartmentRegion,
    federalCampus: property.federalCampus,
    occupancyPercentage: property.occupancyPercentage,
    notes: property.notes,
    isInstitutionalProperty: property.isInstitutionalProperty,
  });
  assertPortableProperty(portable);
  return portable;
}

export function validatePropertyBundle(
  value: unknown,
): asserts value is IPropertyBundleV1 {
  if (!isRecord(value)) {
    throw new TypeError("Property bundle must be an object");
  }
  assertKnownKeys(value, BUNDLE_KEYS, "Property bundle");
  if (value.$schema !== PROPERTY_BUNDLE_SCHEMA) {
    throw new TypeError(`Unsupported property bundle schema: ${value.$schema}`);
  }
  if (value.format !== PROPERTY_BUNDLE_FORMAT) {
    throw new TypeError(`Unsupported property bundle format: ${value.format}`);
  }
  if (value.formatVersion !== PROPERTY_BUNDLE_VERSION) {
    throw new TypeError(
      `Unsupported property bundle version: ${value.formatVersion}`,
    );
  }
  if (
    !Array.isArray(value.capabilities) ||
    value.capabilities.length !== 1 ||
    value.capabilities[0] !== "property"
  ) {
    throw new TypeError(
      'Property bundle capabilities must currently be exactly ["property"]',
    );
  }
  if (!Array.isArray(value.properties) || value.properties.length === 0) {
    throw new TypeError("Property bundle must contain at least one property");
  }

  const refs = new Set<string>();
  value.properties.forEach((entry, index) => {
    const entryPath = `properties[${index}]`;
    if (!isRecord(entry)) {
      throw new TypeError(`${entryPath} must be an object`);
    }
    assertKnownKeys(entry, ENTRY_KEYS, entryPath);
    if (
      typeof entry.ref !== "string" ||
      !/^property:[1-9]\d*$/.test(entry.ref)
    ) {
      throw new TypeError(`${entryPath}.ref must match property:<positive-id>`);
    }
    if (refs.has(entry.ref)) {
      throw new TypeError(`Duplicate property ref: ${entry.ref}`);
    }
    refs.add(entry.ref);

    if (!isRecord(entry.property)) {
      throw new TypeError(`${entryPath}.property must be an object`);
    }
    assertKnownKeys(entry.property, PROPERTY_KEYS, `${entryPath}.property`);
    for (const key of REQUIRED_PROPERTY_KEYS) {
      if (entry.property[key] === undefined) {
        throw new TypeError(`${entryPath}.property.${key} is required`);
      }
    }
    if (
      typeof entry.property.name !== "string" ||
      entry.property.name.length === 0 ||
      entry.property.name.length > 80
    ) {
      throw new TypeError(
        `${entryPath}.property.name must contain 1-80 characters`,
      );
    }
    if (
      typeof entry.property.constructionStatus !== "string" ||
      !CONSTRUCTION_STATUSES.has(entry.property.constructionStatus)
    ) {
      throw new TypeError(
        `${entryPath}.property.constructionStatus must be Existing, Project, or Test`,
      );
    }
    if (
      typeof entry.property.primaryFunction !== "string" ||
      entry.property.primaryFunction.length === 0
    ) {
      throw new TypeError(
        `${entryPath}.property.primaryFunction must be a non-empty string`,
      );
    }
    if (
      typeof entry.property.yearBuilt !== "number" ||
      !Number.isInteger(entry.property.yearBuilt)
    ) {
      throw new TypeError(`${entryPath}.property.yearBuilt must be an integer`);
    }
    if (typeof entry.property.isFederalProperty !== "boolean") {
      throw new TypeError(
        `${entryPath}.property.isFederalProperty must be a boolean`,
      );
    }
    if (
      typeof entry.property.occupancyPercentage !== "number" ||
      !Number.isFinite(entry.property.occupancyPercentage) ||
      entry.property.occupancyPercentage < 0 ||
      entry.property.occupancyPercentage > 100 ||
      entry.property.occupancyPercentage % 5 !== 0
    ) {
      throw new TypeError(
        `${entryPath}.property.occupancyPercentage must be a multiple of 5 from 0 through 100`,
      );
    }
    if (!isRecord(entry.property.grossFloorArea)) {
      throw new TypeError(
        `${entryPath}.property.grossFloorArea must be an object`,
      );
    }
    if (!isRecord(entry.property.address)) {
      throw new TypeError(`${entryPath}.property.address must be an object`);
    }
    assertKnownKeys(
      entry.property.grossFloorArea,
      FLOOR_AREA_KEYS,
      `${entryPath}.property.grossFloorArea`,
    );
    assertKnownKeys(
      entry.property.address,
      ADDRESS_KEYS,
      `${entryPath}.property.address`,
    );
    for (const key of REQUIRED_ADDRESS_KEYS) {
      if (typeof entry.property.address[key] !== "string") {
        throw new TypeError(
          `${entryPath}.property.address.${key} must be a string`,
        );
      }
    }
    for (const key of ADDRESS_KEYS) {
      const addressPart = entry.property.address[key];
      if (addressPart !== undefined && typeof addressPart !== "string") {
        throw new TypeError(
          `${entryPath}.property.address.${key} must be a string`,
        );
      }
    }
    if (
      typeof entry.property.grossFloorArea["@_units"] !== "string" ||
      !FLOOR_AREA_UNITS.has(entry.property.grossFloorArea["@_units"])
    ) {
      throw new TypeError(
        `${entryPath}.property.grossFloorArea.@_units must be Square Feet or Square Meters`,
      );
    }
    if (
      entry.property.grossFloorArea["@_temporary"] !== undefined &&
      typeof entry.property.grossFloorArea["@_temporary"] !== "boolean"
    ) {
      throw new TypeError(
        `${entryPath}.property.grossFloorArea.@_temporary must be a boolean`,
      );
    }
    if (
      entry.property.grossFloorArea.currentAsOf !== undefined &&
      (typeof entry.property.grossFloorArea.currentAsOf !== "string" ||
        !isIsoDate(entry.property.grossFloorArea.currentAsOf))
    ) {
      throw new TypeError(
        `${entryPath}.property.grossFloorArea.currentAsOf must be a valid YYYY-MM-DD date`,
      );
    }
    if (entry.property.irrigatedArea !== undefined) {
      if (!isRecord(entry.property.irrigatedArea)) {
        throw new TypeError(
          `${entryPath}.property.irrigatedArea must be an object`,
        );
      }
      assertKnownKeys(
        entry.property.irrigatedArea,
        IRRIGATED_AREA_KEYS,
        `${entryPath}.property.irrigatedArea`,
      );
      if (
        typeof entry.property.irrigatedArea.units !== "string" ||
        !IRRIGATED_AREA_UNITS.has(entry.property.irrigatedArea.units)
      ) {
        throw new TypeError(
          `${entryPath}.property.irrigatedArea.units must be Square Feet, Square Meters, Acres, or an empty string`,
        );
      }
      if (!(
        (typeof entry.property.irrigatedArea.value === "number" &&
          Number.isFinite(entry.property.irrigatedArea.value)) ||
        entry.property.irrigatedArea.value === ""
      )) {
        throw new TypeError(
          `${entryPath}.property.irrigatedArea.value must be a finite number or an empty string`,
        );
      }
      if (
        entry.property.irrigatedArea.default !== undefined &&
        typeof entry.property.irrigatedArea.default !== "boolean"
      ) {
        throw new TypeError(
          `${entryPath}.property.irrigatedArea.default must be a boolean`,
        );
      }
    }
    if (
      typeof entry.property.grossFloorArea.value !== "number" ||
      !Number.isFinite(entry.property.grossFloorArea.value)
    ) {
      throw new TypeError(
        `${entryPath}.property.grossFloorArea.value must be a finite number`,
      );
    }
    if (
      entry.property.numberOfBuildings !== undefined &&
      (typeof entry.property.numberOfBuildings !== "number" ||
        !Number.isFinite(entry.property.numberOfBuildings))
    ) {
      throw new TypeError(
        `${entryPath}.property.numberOfBuildings must be a finite number`,
      );
    }
    if (
      entry.property.federalOwner !== undefined &&
      typeof entry.property.federalOwner !== "string"
    ) {
      throw new TypeError(
        `${entryPath}.property.federalOwner must be a string`,
      );
    }
    if (entry.property.agency !== undefined) {
      if (!isRecord(entry.property.agency)) {
        throw new TypeError(`${entryPath}.property.agency must be an object`);
      }
      assertKnownKeys(
        entry.property.agency,
        AGENCY_KEYS,
        `${entryPath}.property.agency`,
      );
      if (
        typeof entry.property.agency.id !== "number" ||
        !Number.isInteger(entry.property.agency.id)
      ) {
        throw new TypeError(
          `${entryPath}.property.agency.id must be an integer`,
        );
      }
      if (typeof entry.property.agency.country !== "string") {
        throw new TypeError(
          `${entryPath}.property.agency.country must be a string`,
        );
      }
      for (const key of ["code", "name"] as const) {
        const agencyPart = entry.property.agency[key];
        if (agencyPart !== undefined && typeof agencyPart !== "string") {
          throw new TypeError(
            `${entryPath}.property.agency.${key} must be a string`,
          );
        }
      }
    }
    for (const key of [
      "agencyDepartmentRegion",
      "federalCampus",
      "notes",
    ] as const) {
      const propertyPart = entry.property[key];
      if (propertyPart !== undefined && typeof propertyPart !== "string") {
        throw new TypeError(`${entryPath}.property.${key} must be a string`);
      }
    }
    if (
      entry.property.isInstitutionalProperty !== undefined &&
      typeof entry.property.isInstitutionalProperty !== "boolean"
    ) {
      throw new TypeError(
        `${entryPath}.property.isInstitutionalProperty must be a boolean`,
      );
    }
  });
}

export function serializePropertyBundle(
  bundle: IPropertyBundleV1,
  indent = 2,
): string {
  validatePropertyBundle(bundle);
  return JSON.stringify(canonicalize(bundle), null, indent);
}
