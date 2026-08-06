import type { IProperty } from "../xml/index.js";
import propertyBundleV1Schema from "../../schemas/property-bundle-v1.schema.json" with { type: "json" };

export const PROPERTY_BUNDLE_FORMAT = "portfolio-manager/property-bundle";
export const PROPERTY_BUNDLE_VERSION = 1;
export const PROPERTY_BUNDLE_SCHEMA =
  "urn:portfolio-manager:property-bundle:v1";
export const PROPERTY_BUNDLE_SCHEMA_DOCUMENT = Object.freeze(
  propertyBundleV1Schema,
);

export type PropertyBundleCapability = "property";

export interface PortableGrossFloorArea {
  "@_units": "Square Feet" | "Square Meters";
  "@_temporary"?: boolean;
  currentAsOf?: string;
  value: number;
}

export interface PortableIrrigatedArea {
  default?: boolean;
  units: "Square Feet" | "Square Meters" | "Acres" | "";
  value: number | "";
}

export interface PortableProperty {
  name: IProperty["name"];
  constructionStatus: IProperty["constructionStatus"];
  primaryFunction: IProperty["primaryFunction"];
  grossFloorArea: PortableGrossFloorArea;
  irrigatedArea?: PortableIrrigatedArea;
  yearBuilt: IProperty["yearBuilt"];
  address: IProperty["address"];
  numberOfBuildings?: IProperty["numberOfBuildings"];
  isFederalProperty: IProperty["isFederalProperty"];
  federalOwner?: IProperty["federalOwner"];
  agency?: IProperty["agency"];
  agencyDepartmentRegion?: IProperty["agencyDepartmentRegion"];
  federalCampus?: IProperty["federalCampus"];
  occupancyPercentage: IProperty["occupancyPercentage"];
  notes?: IProperty["notes"];
  isInstitutionalProperty?: IProperty["isInstitutionalProperty"];
}

export interface IPropertyBundleEntryV1 {
  ref: string;
  property: PortableProperty;
}

export interface IPropertyBundleV1 {
  $schema: typeof PROPERTY_BUNDLE_SCHEMA;
  format: typeof PROPERTY_BUNDLE_FORMAT;
  formatVersion: typeof PROPERTY_BUNDLE_VERSION;
  capabilities: ["property"];
  properties: IPropertyBundleEntryV1[];
}

export type IPropertyBundle = IPropertyBundleV1;

export interface IPropertyBundleProgress {
  operation: "export" | "import" | "cleanup";
  propertyRef: string;
  completed: number;
  total: number;
}

export interface IExportPropertiesOptions {
  onProgress?: (event: IPropertyBundleProgress) => void;
}

export interface IImportPropertiesOptions {
  accountId?: number;
  dryRun?: boolean;
  keepPartial?: boolean;
  namePrefix?: string;
  nameSuffix?: string;
  onProgress?: (event: IPropertyBundleProgress) => void;
}

export type ImportPropertyStatus =
  "planned" | "created" | "failed" | "rolled-back" | "cleanup-failed";

export interface IImportPropertyResult {
  ref: string;
  status: ImportPropertyStatus;
  id?: number;
  error?: string;
}

export interface IImportPropertiesResult {
  status: "dry-run" | "complete" | "failed";
  properties: IImportPropertyResult[];
  error?: string;
}
